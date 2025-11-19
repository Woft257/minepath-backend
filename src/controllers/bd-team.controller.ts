import { Request, Response } from 'express';
import { BDTeamService } from '../services/bd-team.service';

const bdTeamService = new BDTeamService();

export class BDTeamController {
  async getAllBDMembers(req: Request, res: Response) {
    try {
      const members = await bdTeamService.getAllBDMembers();
      res.json(members);
    } catch (error) {
      console.error('Error getting BD members:', error);
      res.status(500).json({ 
        error: 'Failed to fetch BD team members',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getBDMemberById(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const member = await bdTeamService.getBDMemberById(uuid);
      
      if (!member) {
        return res.status(404).json({ error: 'BD member not found' });
      }
      
      res.json(member);
    } catch (error) {
      console.error('Error getting BD member:', error);
      res.status(500).json({ 
        error: 'Failed to fetch BD member',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getManagedKOLs(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const kols = await bdTeamService.getManagedKOLs(uuid);
      res.json(kols);
    } catch (error) {
      console.error('Error getting managed KOLs:', error);
      res.status(500).json({ 
        error: 'Failed to fetch managed KOLs',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getBDPerformance(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const { startDate, endDate } = req.query;
      
      const performance = await bdTeamService.getBDPerformance(
        uuid,
        startDate as string,
        endDate as string
      );
      res.json(performance);
    } catch (error) {
      console.error('Error getting BD performance:', error);
      res.status(500).json({ 
        error: 'Failed to fetch BD performance',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

