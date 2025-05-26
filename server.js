
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/generate', async (req, res) => {
  const { lead, tone, style } = req.body;

  if (!lead || !tone || !style) {
    return res.status(400).json({ error: 'Missing input fields.' });
  }

  let contextInstruction = '';
  switch (style) {
    case 'Initial Email':
      contextInstruction = 'Write a persuasive first email to the lead. Keep it professional and luxury-brand appropriate. Do not include a subject line. Focus on vehicle availability, VIP treatment, and setting the appointment.';
      break;
    case 'Initial Text':
      contextInstruction = 'Write a short, persuasive text message to the lead. Keep it conversational, no fluff, and avoid emojis. Your goal is to secure an appointment without quoting price.';
      break;
    case 'Email Reply':
      contextInstruction = 'Write a professional reply to a customer\'s email. Do not include a subject line. Keep the tone consistent with luxury brand standards and aim to set an appointment.';
      break;
    case 'Text Response':
      contextInstruction = 'Reply with a short text message to the customer, assuming they have replied after your initial contact. Keep it simple, polite, and focused on scheduling the appointment.';
      break;
  }

  const prompt = `Lead info: ${lead}\nTone: ${tone}\n${contextInstruction}`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: [
          { role: 'system', content: 'You are a high-performing Lexus BDC specialist. Respond clearly, directly, and always focus on setting the appointment. Do not quote pricing. Never include subject lines unless instructed.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
