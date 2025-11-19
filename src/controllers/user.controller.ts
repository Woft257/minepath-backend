import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

const userService = new UserService();

export class UserController {
  async getAllUsers(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const users = await userService.getAllUsers(limit, offset);
      res.json(users);
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({ 
        error: 'Failed to fetch users',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const user = await userService.getUserById(uuid);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ 
        error: 'Failed to fetch user',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getUserTransactions(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const transactions = await userService.getUserTransactions(uuid, limit);
      res.json(transactions);
    } catch (error) {
      console.error('Error getting user transactions:', error);
      res.status(500).json({ 
        error: 'Failed to fetch user transactions',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getUserReferrals(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const referrals = await userService.getUserReferrals(uuid);
      res.json(referrals);
    } catch (error) {
      console.error('Error getting user referrals:', error);
      res.status(500).json({ 
        error: 'Failed to fetch user referrals',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async searchUsers(req: Request, res: Response) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      
      const limit = parseInt(req.query.limit as string) || 20;
      const users = await userService.searchUsers(q as string, limit);
      res.json(users);
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({ 
        error: 'Failed to search users',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getUserStats(req: Request, res: Response) {
    try {
      const stats = await userService.getUserStats();
      res.json(stats);
    } catch (error) {
      console.error('Error getting user stats:', error);
      res.status(500).json({ 
        error: 'Failed to fetch user statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getActiveUsers(req: Request, res: Response) {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const users = await userService.getActiveUsers(days);
      res.json(users);
    } catch (error) {
      console.error('Error getting active users:', error);
      res.status(500).json({ 
        error: 'Failed to fetch active users',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

