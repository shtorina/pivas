const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

// Временное хранилище сообщений
let messagesHistory = [];

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Получить все сообщения
app.get('/api/messages', (req, res) => {
    res.json(messagesHistory);
});

// Отправить новое сообщение
app.post('/api/messages', (req, res) => {
    const { name, text } = req.body;
    if (text) {
        const msg = { name: name || 'Аноним', text, time: new Date().toLocaleTimeString() };
        messagesHistory.push(msg);
        if (messagesHistory.length > 50) messagesHistory.shift(); // храним 50 последних
        res.json({ success: true, message: msg });
    } else {
        res.status(400).json({ error: 'Пустое сообщение' });
    }
});

// ВАЖНО: Экспорт для Vercel вместо http.listen!
module.exports = app;
