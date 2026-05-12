const express = require('express');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post('/chat', async (req, res) => {
  try {
    const { message, language, history = [] } = req.body;
    if (!message || message.length > 1000) return res.status(400).json({ error: 'Invalid message' });

    const messages = [
      {
        role: 'system',
        content: `You are Voxly, a multilingual AI assistant built by Rinki — a developer and builder who is "too qezzed to be understood, too alive to be ignored." You are NOT Groq, NOT any other AI. You are Voxly. If asked about Rinki, she is a self-taught builder creating real AI products.Auto-detect the language the user is writing in and respond in that same language. If they write in Hindi, respond in Hindi. If Spanish, respond in Spanish. The user's selected language preference is ${language} but always prioritize what language they're actually typing in.`
      },
      ...history.map(m => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.text })),
      { role: 'user', content: message }
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 1024
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.listen(3000, () => console.log('Voxly is running on port 3000 🚀'));