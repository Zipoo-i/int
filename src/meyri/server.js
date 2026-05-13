const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const db = new Database('restaurant.db');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'meyri_secret_key_2025',
    resave: false,
    saveUninitialized: false
}));

db.prepare(`
    CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tableNumber INTEGER UNIQUE,
        name TEXT,
        date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

db.prepare(`
    CREATE TABLE IF NOT EXISTS staff (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        login TEXT UNIQUE,
        password TEXT
    )
`).run();

const adminExists = db.prepare('SELECT * FROM staff WHERE login = ?').get('admin');
if (!adminExists) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO staff (login, password) VALUES (?, ?)').run('admin', hash);
    console.log('✅ Админ создан: login: admin | password: admin123');
}

io.on('connection', (socket) => {
    console.log('Клиент подключился');

    const busyTables = db.prepare('SELECT tableNumber FROM bookings').all().map(row => row.tableNumber);
    socket.emit('updateBusy', busyTables);
});

app.get('/api/tables', (req, res) => {
    const bookings = db.prepare('SELECT tableNumber FROM bookings').all();
    res.json(bookings);
});

app.post('/api/book', (req, res) => {
    const { tableNumber, name, date } = req.body;

    if (!tableNumber || !name || !date) {
        return res.json({ success: false, message: 'Заполните все поля' });
    }

    try {
        const exists = db.prepare('SELECT * FROM bookings WHERE tableNumber = ?').get(tableNumber);

        if (exists) {
            return res.json({ success: false, message: 'Этот столик уже занят' });
        }

        db.prepare(`
            INSERT INTO bookings (tableNumber, name, date) 
            VALUES (?, ?, ?)
        `).run(tableNumber, name, date);

        const busyTables = db.prepare('SELECT tableNumber FROM bookings').all().map(row => row.tableNumber);
        io.emit('updateBusy', busyTables);
        io.emit('tableBooked', { tableNumber });

        res.json({ success: true, message: 'Столик успешно забронирован!' });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: 'Ошибка при бронировании' });
    }
});

app.post('/api/login', (req, res) => {
    const { login, password } = req.body;
    const user = db.prepare('SELECT * FROM staff WHERE login = ?').get(login);

    if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = user.id;
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Неверный логин или пароль' });
    }
});

app.get('/api/admin/bookings', (req, res) => {
    if (!req.session.user) {
        return res.status(403).json({ error: 'Нет доступа' });
    }
    const bookings = db.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all();
    res.json(bookings);
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
});