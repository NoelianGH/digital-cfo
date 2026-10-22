// src/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Import routes
const healthRoutes = require('./routes/healthscore.routes');
const transactionRoutes = require('./routes/transaction.routes');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const salesRoutes = require('./routes/sales.routes');
const profileRoutes = require('./routes/profile.routes');
const extractRoutes = require('./routes/extract.routes');
const promoRoutes = require('./routes/promo.routes');
const adminRoutes = require('./routes/admin.routes');
const userStoreRoutes = require('./routes/userStore.routes');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Dokumentasi Swagger dipasang di endpoint /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Daftarkan route
app.use('/api', healthRoutes);
app.use('/api', transactionRoutes);
app.use('/api', authRoutes);
app.use('/api', productRoutes);
app.use('/api', salesRoutes);
app.use('/api', profileRoutes);
app.use('/api', extractRoutes);
app.use('/api', promoRoutes);
app.use('/api', adminRoutes);
app.use('/api', userStoreRoutes);


app.listen(PORT, () => {
  console.log(`🚀 Server Digital CFO berjalan di: http://localhost:${PORT}`);
  console.log(`📖 Dokumentasi Swagger tersedia di: http://localhost:${PORT}/api-docs`);
});

