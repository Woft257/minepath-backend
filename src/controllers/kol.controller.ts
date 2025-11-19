import { Request, Response } from 'express';
import { KOLService } from '../services/kol.service';

const kolService = new KOLService();

export class KOLController {
  async getAllKOLs(req: Request, res: Response) {
    try {
      const kols = await kolService.getAllKOLs();
      res.json(kols);
    } catch (error) {
      console.error('Error getting KOLs:', error);
      res.status(500).json({ 
        error: 'Failed to fetch KOLs',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getKOLById(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const kol = await kolService.getKOLById(uuid);
      
      if (!kol) {
        return res.status(404).json({ error: 'KOL not found' });
      }
      
      res.json(kol);
    } catch (error) {
      console.error('Error getting KOL:', error);
      res.status(500).json({ 
        error: 'Failed to fetch KOL',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getKOLReferrals(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const referrals = await kolService.getKOLReferrals(uuid);
      res.json(referrals);
    } catch (error) {
      console.error('Error getting KOL referrals:', error);
      res.status(500).json({ 
        error: 'Failed to fetch KOL referrals',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getKOLEarnings(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const { startDate, endDate } = req.query;
      
      const earnings = await kolService.getKOLEarnings(
        uuid,
        startDate as string,
        endDate as string
      );
      res.json(earnings);
    } catch (error) {
      console.error('Error getting KOL earnings:', error);
      res.status(500).json({ 
        error: 'Failed to fetch KOL earnings',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getKOLOverview(req: Request, res: Response) {
    try {
      const overview = await kolService.getKOLOverview();
      res.json(overview);
    } catch (error) {
      console.error('Error getting KOL overview:', error);
      res.status(500).json({ 
        error: 'Failed to fetch KOL overview',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getTopKOLs(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const topKOLs = await kolService.getTopKOLs(limit);
      res.json(topKOLs);
    } catch (error) {
      console.error('Error getting top KOLs:', error);
      res.status(500).json({ 
        error: 'Failed to fetch top KOLs',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

