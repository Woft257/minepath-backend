import { Router, Request, Response } from 'express';
import { pool } from '../config/database';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    // Test database connection
    const result = await pool.query(
      'SELECT current_database(), current_user, inet_server_addr() as host, version()'
    );

    const row = result.rows[0];

    res.json({
      status: 'connected',
      database: row.current_database,
      user: row.current_user,
      host: row.host || 'localhost',
      version: row.version,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database health check failed:', error);

    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;

