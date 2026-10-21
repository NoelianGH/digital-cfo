// src/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Digital CFO API Documentation',
      version: '1.0.0',
      description: 'Dokumentasi REST API Sistem Pendukung Keputusan Digital CFO untuk UMKM',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
      },
    ],
    // ⬇️ TAMBAHKAN BAGIAN INI AGAR ADA TOMBOL GEMBOK / BEARER AUTH DI SWAGGER
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Masukkan JWT Token kamu di sini (tanpa perlu ketik kata Bearer)',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;