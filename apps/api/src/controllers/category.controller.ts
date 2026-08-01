import { Request, Response, NextFunction } from 'express';
import { Category } from '../models/Category';
import { NotFoundError } from '../utils/errors';

export class CategoryController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await Category.find({ active: true }).sort({ order: 1 });
      res.json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) throw new NotFoundError('Category not found');
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await Category.create(req.body);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!category) throw new NotFoundError('Category not found');
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await Category.deleteOne({ _id: req.params.id });
      res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
