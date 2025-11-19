import { Request, Response } from 'express';
import { TransactionService } from '../services/transaction.service';

const transactionService = new TransactionService();

export class TransactionController {
  async getAllTransactions(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const transactions = await transactionService.getAllTransactions(limit, offset);
      res.json(transactions);
    } catch (error) {
      console.error('Error getting transactions:', error);
      res.status(500).json({ 
        error: 'Failed to fetch transactions',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getTransactionById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const transaction = await transactionService.getTransactionById(id);
      
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      
      res.json(transaction);
    } catch (error) {
      console.error('Error getting transaction:', error);
      res.status(500).json({ 
        error: 'Failed to fetch transaction',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getTransactionsByMethod(req: Request, res: Response) {
    try {
      const { method } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;
      
      const transactions = await transactionService.getTransactionsByMethod(method, limit);
      res.json(transactions);
    } catch (error) {
      console.error('Error getting transactions by method:', error);
      res.status(500).json({ 
        error: 'Failed to fetch transactions',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getTransactionStats(req: Request, res: Response) {
    try {
      const stats = await transactionService.getTransactionStats();
      res.json(stats);
    } catch (error) {
      console.error('Error getting transaction stats:', error);
      res.status(500).json({ 
        error: 'Failed to fetch transaction statistics',
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
      
      const transactions = await transactionService.getTransactionsByDateRange(
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

  async getRecentClaims(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const claims = await transactionService.getRecentClaims(limit);
      res.json(claims);
    } catch (error) {
      console.error('Error getting recent claims:', error);
      res.status(500).json({ 
        error: 'Failed to fetch recent claims',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

