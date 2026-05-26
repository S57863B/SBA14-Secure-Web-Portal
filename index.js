require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');
const passport = require('./config/passport');

connectDB();

const app = express();

app.use(express.json());
app.use(passport.initialize());

const userRoutes = require('./routes/users');
const bookmarkRoutes = require('./routes/bookmarks');

app.use('/api/users', userRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ message: 'An unexpected server error occurred.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});