const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { rateLimitMiddleware } = require('./middleware/rateLimiter');
const trackApiUsage = require('./middleware/apiUsage');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);
app.use(rateLimitMiddleware);
app.use(trackApiUsage)

//swagger config
const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Your API Documentation',
        version: '1.0.0',
        description: 'Documentation for API Endpoints',
      },
      servers: [
        {
        //   url: 'http://localhost:5000',
          url: 'productmuta-ewbdh9hmdrfqcuep.eastasia-01.azurewebsites.net', 
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{
        bearerAuth: [],
      }],
    },
    apis: ['./routes/*.js', './swagger/auth.routes.js', './swagger/user.routes.js', './swagger/order.routes.js'], 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/auth', rateLimitMiddleware, authRoutes);
app.use('/api/users', rateLimitMiddleware, userRoutes);
app.use('/api/orders', rateLimitMiddleware, orderRoutes);

app.get('/',(req,res) => {
    res.json('Main Page Backend');
})

app.use(errorHandler);


  
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));