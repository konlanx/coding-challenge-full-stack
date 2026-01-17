import { prisma } from '../prisma';
import { Request, Response } from 'express';
import { CreateDealSchema, UpdateDealSchema, DealIdParamSchema } from '../schemas/deal.schema';
import { z } from 'zod';

export const getDeals = async (req: Request, res: Response) => {
  const { ownerId } = req.params;
  const deals = await prisma.deal.findMany({
    where: { owners: { some: { employeeId: ownerId } } },
    include: { owners: true }
  });
  res.json(deals);
};

export const createDeal = async (req: Request, res: Response) => {
  const result = CreateDealSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ errors: z.treeifyError(result.error) });
    return;
  }

  const { name, value, owners } = result.data;

  const deal = await prisma.deal.create({
    data: {
      name,
      value,
      owners: {
        create: owners.map((owner) => ({
          employeeId: owner.employeeId,
          percentage: owner.percentage,
        })),
      },
    },
    include: { owners: true },
  });

  res.status(201).json(deal);
};

export const updateDeal = async (req: Request, res: Response) => {
  const paramsResult = DealIdParamSchema.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ errors: z.treeifyError(paramsResult.error) });
    return;
  }

  const bodyResult = UpdateDealSchema.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ errors: z.treeifyError(bodyResult.error) });
    return;
  }

  const { id } = paramsResult.data;
  const { name, value, owners } = bodyResult.data;

  const existingDeal = await prisma.deal.findUnique({ where: { id } });
  if (!existingDeal) {
    res.status(404).json({ error: 'Deal not found' });
    return;
  }

  const deal = await prisma.$transaction(async (transaction) => {
    await transaction.dealOwner.deleteMany({ where: { dealId: id } });

    return transaction.deal.update({
      where: { id },
      data: {
        name,
        value,
        owners: {
          create: owners.map((owner) => ({
            employeeId: owner.employeeId,
            percentage: owner.percentage,
          })),
        },
      },
      include: { owners: true },
    });
  });

  res.json(deal);
};
