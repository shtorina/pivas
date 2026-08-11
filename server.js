const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Массив для хранения истории сообщений в памяти
const messagesHistory = [];

io.on('connection', (socket) => {
    // Подключаем к комнате по умолчанию
    socket.join('general');

    // Сразу отправляем всю сохраненную историю новому пользователю
    socket.emit('chat history', messagesHistory);

    // Переключение комнат
    socket.on('join room', (room) => {
        for (const r of socket.rooms) {
            if (r !== socket.id) socket.leave(r);
        }
        socket.join(room);
    });

    // Прием и рассылка сообщений
    socket.on('chat message', (msg) => {
        // Гарантируем, что комната указана
        const room = msg.room || 'general';
        const messageData = { ...msg, room };

        // Сохраняем в историю (максимум 100 последних сообщений)
        messagesHistory.push(messageData);
        if (messagesHistory.length > 100) {
            messagesHistory.shift();
        }

        // Отправляем всем в этой комнате
        io.to(room).emit('chat message', messageData);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log('====================================');
    console.log(>>> Pivas Server Online [Port ${PORT}] <<<);
    console.log('====================================');
});
