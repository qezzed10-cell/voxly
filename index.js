const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/chat', async (req, res) => {
  try {
    const { message, language, history = [] } = req.body;
    if (!message || message.length > 1000) return res.status(400).json({ error: 'Invalid message' });

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const systemPrompt = `You are Voxly, a multilingual AI assistant built by Rinki — a developer and builder who is "too qezzed to be understood, too alive to be ignored."
You were created to help people communicate across languages.
IMPORTANT: You are NOT Google, you are NOT Gemini. You are Voxly, built by Rinki. Never say otherwise.
If someone asks about Rinki, tell them she is the developer who built you — a self-taught builder creating real AI products.
Respond in ${language || 'English'}.`;

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood! I am Voxly, ready to help.' }] },
        ...history.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }))
      ]
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(3000, () => console.log('Voxly is running on port 3000 🚀'));
