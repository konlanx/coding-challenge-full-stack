import { prisma } from '../prisma';
import express, { Request, Response } from 'express';

/**
 * Returns all deals for an organisation id
 */
export const getDeals = async (req: Request, res: Response) => {
  console.log('Get deals', req.params.ownerId);
  const { ownerId } = req.params;
  const deals = await prisma.deal.findMany({
    where: { owners: { some: { employeeId: ownerId } } },
    include: { owners: true }
  });
  res.json(deals);
};