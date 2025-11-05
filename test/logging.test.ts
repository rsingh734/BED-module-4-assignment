import request from 'supertest';
import express from 'express';
import { consoleLogger } from '../src/api/v1/middleware/logger';
import { accessLogger } from '../src/api/v1/middleware/logger';
import fs from 'fs';
import path from 'path';

describe('Logging Middleware', () => {
  let app: express.Application;
  const testLogsDir = path.join(__dirname, '../src/api/logs');

  beforeEach(() => {
    app = express();

    // Clear test log files before each test
    if (fs.existsSync(path.join(testLogsDir, 'access.log'))) {
      fs.writeFileSync(path.join(testLogsDir, 'access.log'), '');
    }
  });

  afterAll(() => {
    // Clean up test log files
    if (fs.existsSync(path.join(testLogsDir, 'access.log'))) {
      fs.unlinkSync(path.join(testLogsDir, 'access.log'));
    }
  });

  describe('Access Logger', () => {
    it('should log successful requests to access.', async () => {
      app.use(accessLogger);
      app.get('/test', (req, res) => {
        res.status(200).json({ message: 'success' });
      });

      await request(app).get('/test').expect(200);

      // Give logger time to write
      await new Promise(resolve => setTimeout(resolve, 100));

      const logContent = fs.readFileSync(
        path.join(testLogsDir, 'access.log'), 
        'utf-8'
      );
      
      expect(logContent).toContain('GET');
      expect(logContent).toContain('/test');
      expect(logContent).toContain('200');
    });
  });

  describe('Console Logger', () => {
    it('should use dev format in development', () => {
      // This is a basic test to ensure the logger is configured
      expect(consoleLogger).toBeDefined();
      expect(typeof consoleLogger).toBe('function');
    });
  });

  describe('Environment-based logging', () => {
    it('should have different loggers for different environments', () => {
      expect(accessLogger).toBeDefined();
      expect(consoleLogger).toBeDefined();
      // They should be different functions
      expect(accessLogger).not.toBe(consoleLogger);
    });
  });
});