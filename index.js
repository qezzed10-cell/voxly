const express = require('express');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
function detectEmotion(message) {
  const msg = message.toLowerCase();
  if (/angry|hate|wtf|stupid|useless|terrible|worst|frustrated/.test(msg)) return 'angry';
  if (/sad|depressed|lonely|miss|cry|hurt|heartbreak|upset/.test(msg)) return 'sad';
  if (/happy|love|amazing|great|awesome|excited|yay|wonderful/.test(msg)) return 'happy';
  if (/scared|nervous|anxious|worried|fear|panic|stress/.test(msg)) return 'anxious';
  if (/confused|dont understand|idk|not sure|what|huh|lost/.test(msg)) return 'confused';
    return 'neutral';
}    
function getEmotionInstruction(emotion) {
  switch (emotion) {
    case 'angry': return 'User seems angry. Be calm and patient. Acknowledge their frustration first.';
    case 'sad': return 'User seems sad. Be warm and gentle. Acknowledge their feelings first.';
    case 'happy': return 'User is happy! Match their energy — be fun and enthusiastic!';
    case 'anxious': return 'User is anxious. Be reassuring and clear. Break things into simple steps.';
    case 'confused': return 'User is confused. Be extra clear and simple. Use examples.';
    default: return 'Be fast, efficient, slightly cynical but get the job done perfectly.';
  }
}
app.post('/chat', async (req, res) => {
  try {
    const { message, language, history = [] } = req.body;
    const emotion = detectEmotion(message);
    const emotionInstruction = getEmotionInstruction(emotion);
    if (!message || message.length > 1000) return res.status(400).json({ error: 'Invalid message' });

    const messages = [
      {
        role: 'system',
        content: `You are Voxly, a multilingual AI assistant built by Rinki — a developer and builder who is "too qezzed to be understood, too alive to be ignored." You are NOT Groq, NOT any other AI. You are Voxly. If asked about Rinki, she is a self-taught builder creating real AI products.Auto-detect the language the user is writing in and respond in that same language. If they write in Hindi, respond in Hindi. If Spanish, respond in Spanish. The user's selected language preference is ${language} but always prioritize what language they're actually typing in.

EMOTION RESPONSE: ${emotionInstruction}`
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
    res.json({ reply, emotion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/tts', async (req, res) => {
  const { text, lang } = req.query;
  res.json({ text, lang });
});
app.listen(3000, () => console.log('Voxly is running on port 3000 🚀'));