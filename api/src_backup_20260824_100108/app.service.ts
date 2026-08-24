import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      message: 'Welcome to Meat Lovers Restaurant Management API',
      version: '1.0.0',
      status: 'operational',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/health',
        documentation: {
          authentication: '/auth',
          products: '/products',
          orders: '/orders',
          kitchen: '/kitchen',
          pos: '/pos',
          stock: '/stock',
          suppliers: '/suppliers',
          website: '/website',
          monitoring: '/monitoring',
          dashboard: '/admin/dashboard',
        },
      },
      publicEndpoints: [
        'GET /health - API health check',
        'POST /auth/login - User authentication',
        'POST /auth/register - User registration',
        'GET /website/menu - Public menu',
        'GET /recipes - Recipe list',
      ],
      deployment: 'Vercel Serverless',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
