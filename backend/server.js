require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const { initCloudinary } = require('./src/config/cloudinary');
const seedAdmin = require('./src/services/seedAdmin');
const authRoutes = require('./src/routes/authRoutes');
const postRoutes = require('./src/routes/postRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const userRoutes = require('./src/routes/userRoutes');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'jansetu-api'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.originalUrl}`
  });
});

app.use(errorHandler);

const start = async () => {
  try {
    initCloudinary();
    await connectDB();
    await seedAdmin();

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`JanSetu API running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

start();
