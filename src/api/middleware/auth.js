export const authDevMiddleware = (req, res, next) => {
    const devKey = req.headers['x-dev-key'];
    const validKey = process.env.DEV_API_KEY || 'dev-key-default';
    if (!devKey || devKey !== validKey) {
        return res.status(403).json({ error: 'Unauthorized: Invalid or missing dev key', message: 'This endpoint is for development use only.' });
    }
    req.devKey = devKey;
    next();
};
//# sourceMappingURL=auth.js.map