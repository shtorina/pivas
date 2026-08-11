const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    // По умолчанию сажаем пользователя в комнату "general"
    socket.join('general');

    // Переключение между комнатами
    socket.on('join room', (room) => {
        // Выходим из всех предыдущих комнат, кроме личного ID
        for (const r of socket.rooms) {
            if (r !== socket.id) socket.leave(r);
        }
        socket.join(room);
    });

    // Получение и рассылка сообщения конкретной комнате
    socket.on('chat message', (msg) => {
        // Отправляем только людям в той же комнате
        io.to(msg.room).emit('chat message', msg);
    });
});

const PORT = 3000;
http.listen(PORT, () => {
    console.log('=================================');
    console.log('>>> Pivas Server Online [Port 3000] <<<');
    console.log('=================================');
});