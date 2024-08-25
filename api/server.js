const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Check if the connection works
db.connect(err => {
    if (err) {
        console.error("Error connecting to MySQL:", err.message);
        return;
    }

    console.log("Connected to MySQL as ID:", db.threadId);

    // Create database if not exists
    db.query(`CREATE DATABASE IF NOT EXISTS expense_tracker`, (err, result) => {
        if (err) {
            console.error("Error creating database:", err.message);
            return;
        }

        console.log("Database 'expense_tracker' created/checked.");

        // Switch to the database
        db.changeUser({ database: 'expense_tracker' }, err => {
            if (err) {
                console.error("Error changing to 'expense_tracker' database:", err.message);
                return;
            }

            console.log("'expense_tracker' database is now in use.");

            // Create users table if not exists
            const usersTable = `
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(100) NOT NULL UNIQUE,
                    username VARCHAR(50) NOT NULL,
                    password VARCHAR(255) NOT NULL
                )
            `;

            db.query(usersTable, (err, result) => {
                if (err) {
                    console.error("Error creating 'users' table:", err.message);
                    return;
                }

                console.log("'users' table created/checked.");
            });
        });
    });
});

// User registration route
app.post('/api/register', (req, res) => {
    const { email, username, password } = req.body;

    // Check if the user already exists
    const checkUserQuery = `SELECT * FROM users WHERE email = ?`;
    db.query(checkUserQuery, [email], (err, data) => {
        if (err) {
            console.error("Error checking user existence:", err.message);
            return res.status(500).json({ error: 'Database error' });
        }

        if (data.length > 0) {
            return res.status(409).json({ error: 'User already exists' });
        }

        // Hash the password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        // Insert the new user into the database
        const insertUserQuery = `INSERT INTO users (email, username, password) VALUES (?, ?, ?)`;
        db.query(insertUserQuery, [email, username, hashedPassword], (err, result) => {
            if (err) {
                console.error("Error inserting user into database:", err.message);
                return res.status(500).json({ error: 'Failed to register user' });
            }

            res.status(201).json({ message: 'User registered successfully' });
        });
    });
});

// User login route
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Check if the user exists
    const checkUserQuery = `SELECT * FROM users WHERE email = ?`;
    db.query(checkUserQuery, [email], (err, data) => {
        if (err) {
            console.error("Error fetching user from database:", err.message);
            return res.status(500).json({ error: 'Database error' });
        }

        if (data.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Validate the password
        const isPasswordValid = bcrypt.compareSync(password, data[0].password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        res.status(200).json({ message: 'Login successful' });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}...`);
});
