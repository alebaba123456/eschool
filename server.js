const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

const bcrypt = require('bcryptjs');

const password = 'ardhi123'; // Password asli
bcrypt.hash(password, 10, (err, hashedPassword) => {
  if (err) throw err;
  console.log('Hashed password:', hashedPassword);
});


// Middleware untuk parse JSON
app.use(bodyParser.json());

// Koneksi ke database MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Ganti dengan user database Anda
  password: '', // Ganti dengan password database Anda
  database: 'eschool' // Nama database
});

// Cek koneksi
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database.');
});

// Route untuk login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Query untuk mencari pengguna berdasarkan username
  const query = 'SELECT * FROM tabel_pengguna WHERE username = ?';
  db.query(query, [username], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Username tidak ditemukan' });
    }

    // Verifikasi password menggunakan bcrypt
    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan dalam verifikasi' });
      }

      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Password salah' });
      }

      // Jika login berhasil, buat JWT token
      const token = jwt.sign({ userId: user.id }, 'secretkey', { expiresIn: '1h' });

      // Kirimkan token ke frontend
      res.json({
        success: true,
        message: 'Login berhasil!',
        token: token
      });
    });
  });
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
