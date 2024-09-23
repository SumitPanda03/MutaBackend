const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');
const { rateLimitMiddleware } = require('./middleware/rateLimiter');
const trackApiUsage = require('./middleware/apiUsage');
trackApiUsage

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);
app.use(rateLimitMiddleware);
app.use(trackApiUsage)

// Routes
app.use('/api/auth', rateLimitMiddleware, authRoutes);
app.use('/api/users', rateLimitMiddleware, userRoutes);
app.use('/api/orders', rateLimitMiddleware, orderRoutes);

app.get('/',(req,res) => {
    res.json('Main Page');
})

app.use(errorHandler);

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));