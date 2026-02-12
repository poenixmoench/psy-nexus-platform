"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const publishedItemsQueries = __importStar(require("../db/queries/publishedItems"));
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
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
    }
    catch (error) {
        console.error('[PUBLISH] Error:', error);
        res.status(500).json({ error: 'Failed to publish' });
    }
});
router.get('/api/gallery', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const skip = parseInt(req.query.skip) || 0;
        const items = await publishedItemsQueries.getPublishedItems(limit, skip);
        res.json({ success: true, items, count: items.length });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch' });
    }
});
router.get('/api/gallery/:id', async (req, res) => {
    try {
        const item = await publishedItemsQueries.getPublishedItemById(req.params.id);
        if (!item)
            return res.status(404).json({ error: 'Not found' });
        res.json({ success: true, item });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch' });
    }
});
router.get('/api/gallery/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query || query.length < 2)
            return res.status(400).json({ error: 'Query too short' });
        const items = await publishedItemsQueries.searchPublishedItems(query);
        res.json({ success: true, items, count: items.length });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to search' });
    }
});
exports.default = router;
