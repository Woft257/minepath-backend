import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';

const dashboardService = new DashboardService();

export class DashboardController {
  async getStats(req: Request, res: Response) {
    try {
      const stats = await dashboardService.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      res.status(500).json({ 
        error: 'Failed to fetch dashboard statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getRecentTransactions(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const transactions = await dashboardService.getRecentTransactions(limit);
      res.json(transactions);
    } catch (error) {
      console.error('Error getting recent transactions:', error);
      res.status(500).json({ 
        error: 'Failed to fetch recent transactions',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getTransactionsByDateRange(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate and endDate are required' });
      }

      const transactions = await dashboardService.getTransactionsByDateRange(
        startDate as string,
        endDate as string
      );
      res.json(transactions);
    } catch (error) {
      console.error('Error getting transactions by date range:', error);
      res.status(500).json({ 
        error: 'Failed to fetch transactions',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getUserGrowth(req: Request, res: Response) {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const growth = await dashboardService.getUserGrowth(days);
      res.json(growth);
    } catch (error) {
      console.error('Error getting user growth:', error);
      res.status(500).json({ 
        error: 'Failed to fetch user growth data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

