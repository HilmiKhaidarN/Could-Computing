import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'aegisops-backend',
    };
  }

  @Get()
  getRoot() {
    return {
      message: 'AegisOps Backend API',
      version: '1.0.0',
      docs: '/api/docs',
    };
  }
}
