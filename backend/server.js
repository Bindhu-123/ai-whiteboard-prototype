// server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', socket => {
  console.log('socket connected', socket.id);

  socket.on('join-room', ({ roomId, user }) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', { id: socket.id, user });
  });

  socket.on('draw', data => {
    socket.to(data.roomId).emit('draw', data.stroke);
  });

  socket.on('clear', ({ roomId }) => {
    socket.to(roomId).emit('clear');
  });

  socket.on('disconnect', () => {
    console.log('disconnect', socket.id);
  });
});

// ---- AI endpoints ----
const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) console.warn('OpenAI key not set. Check backend/.env');

app.post('/api/summarize', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text missing' });

  try {
    const prompt = `Summarize the following text into 4 concise bullet points:\n\n${text}`;
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 250,
        temperature: 0.2
      })
    });
    const j = await resp.json();
    const summary = j.choices?.[0]?.message?.content || 'No summary';
    res.json({ summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI error' });
  }
});

app.post('/api/translate', async (req, res) => {
  const { text, to = 'English' } = req.body;
  if (!text) return res.status(400).json({ error: 'text missing' });

  try {
    const prompt = `Translate the following text to ${to} preserving meaning and tone:\n\n${text}`;
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 250,
        temperature: 0.1
      })
    });
    const j = await resp.json();
    const translation = j.choices?.[0]?.message?.content || 'No translation';
    res.json({ translation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI error' });
  }
});

app.post('/api/idea-to-flow', async (req, res) => {
  const { ideaText } = req.body;
  if (!ideaText) return res.status(400).json({ error: 'ideaText missing' });

  try {
    const prompt = `Convert this short list or arrow-separated idea into a mermaid flowchart diagram code.\n\nIdea:\n${ideaText}\n\nReturn only the mermaid code block.`;
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.2
      })
    });
    const j = await resp.json();
    const code = j.choices?.[0]?.message?.content || '';
    res.json({ mermaid: code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI error' });
  }
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
