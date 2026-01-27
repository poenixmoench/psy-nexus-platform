import { Router, Request, Response } from 'express';
import * as publishedItemsQueries from '../db/queries/publishedItems';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, code, language, description, author, tags, preview } = req.body;
    if (!title || !code || !language) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const itemId = await publishedItemsQueries.publishCode({
      title, code, language,
      description: description || '',
      author: author || 'Anonymous',
      tags: tags || [],
      preview: preview || code.substring(0, 200),
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0
    });
    res.status(201).json({ success: true, id: itemId });
  } catch (error) {
    console.error('[PUBLISH] Error:', error);
    res.status(500).json({ error: 'Failed to publish' });
  }
});

router.get('/api/gallery', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = parseInt(req.query.skip as string) || 0;
    const items = await publishedItemsQueries.getPublishedItems(limit, skip);
    res.json({ success: true, items, count: items.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

router.get('/api/gallery/:id', async (req: Request, res: Response) => {
  try {
    const item = await publishedItemsQueries.getPublishedItemById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

router.get('/api/gallery/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query || query.length < 2) return res.status(400).json({ error: 'Query too short' });
    const items = await publishedItemsQueries.searchPublishedItems(query);
    res.json({ success: true, items, count: items.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to search' });
  }
});

export default router;
