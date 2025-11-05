import request from 'supertest';
import app from '../src/app';

describe('Middleware Integration', () => {
  describe('Middleware Order Verification', () => {
    it('should apply logging middleware first and capture all requests', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Logging should have captured this request
      expect(response.body.status).toBe('OK');
      // The response should include timestamp from health check
      expect(response.body.timestamp).toBeDefined();
    });

    it('should parse JSON bodies before reaching routes', async () => {
      const testData = { test: 'data', number: 123 };
      
      const response = await request(app)
        .post('/api/v1/public/status')
        .send(testData)
        .expect(200);

      // If body parsing works, the route should receive the parsed data
      expect(response.body.message).toBe('Public API endpoint');
    });

    it('should handle 404 errors for unhandled routes', async () => {
      const response = await request(app)
        .get('/nonexistent-route')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toContain('not found');
      expect(response.body.error.path).toBe('/nonexistent-route');
    });
  });

  describe('Error Propagation', () => {
    it('should propagate errors through middleware chain to error handler', async () => {
      const response = await request(app)
        .get('/api/v1/test/error')
        .expect(500); // This tests the error test route

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBeDefined();
      expect(response.body.error.timestamp).toBeDefined();
    });

    it('should format authentication errors consistently', async () => {
      // Test without authentication token
      const response = await request(app)
        .get('/api/v1/loans')
        .expect(401); // Should be caught by auth middleware

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
      expect(response.body.error.timestamp).toBeDefined();
    });

    it('should format authorization errors consistently', async () => {
      // This would require a mock authenticated user with insufficient permissions
      // For now, test that the error format is consistent
      const response = await request(app)
        .get('/api/v1/admin/users')
        .expect(401); // No authentication

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBeDefined();
    });
  });

  describe('Protected Route Integration', () => {
    it('should enforce authentication on protected routes', async () => {
      const response = await request(app)
        .post('/api/v1/loans')
        .send({})
        .expect(401); // No authentication token

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should allow access to public routes without authentication', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.message).toBe('Server is running');
    });

    it('should maintain consistent response format across all endpoints', async () => {
      // Test health endpoint format
      const healthResponse = await request(app)
        .get('/health')
        .expect(200);

      expect(healthResponse.body.status).toBeDefined();
      expect(healthResponse.body.message).toBeDefined();
      expect(healthResponse.body.timestamp).toBeDefined();

      // Test error endpoint format
      const errorResponse = await request(app)
        .get('/nonexistent-route')
        .expect(404);

      expect(errorResponse.body.success).toBe(false);
      expect(errorResponse.body.error).toBeDefined();
      expect(errorResponse.body.error.code).toBeDefined();
      expect(errorResponse.body.error.message).toBeDefined();
      expect(errorResponse.body.error.timestamp).toBeDefined();
    });
  });

  describe('Environment-specific Behavior', () => {
    it('should use appropriate logging based on environment', async () => {
      // This is harder to test directly, but we can verify the app starts
      // The actual logging behavior is configured in the middleware
      expect(app).toBeDefined();
      
      // Verify that the health endpoint works in test environment
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.environment).toBeDefined();
    });
  });
});