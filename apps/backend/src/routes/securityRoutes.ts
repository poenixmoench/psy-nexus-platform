import express, { Router } from 'express';
import logger from '../services/logger';

const router = Router();

router.post('/csp-report', (req, res) => {
  const violation = req.body['csp-report'];

  if (!violation) {
    return res.status(400).json({ error: 'Invalid CSP report' });
  }

  const violationLog = {
    timestamp: new Date().toISOString(),
    blockedUri: violation['blocked-uri'],
    documentUri: violation['document-uri'],
    violatedDirective: violation['violated-directive'],
    ip: req.ip
  };

  logger.warn('🚨 [CSP VIOLATION]', violationLog);

  const criticalPatterns = ['eval', 'Function(', '__proto__', 'constructor'];
  if (criticalPatterns.some(pattern => violation['blocked-uri']?.includes(pattern))) {
    logger.error('🚨🚨🚨 [CRITICAL CSP VIOLATION]', violationLog);
  }

  res.status(204).send();
});

router.get('/metrics', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Security metrics'
  });
});

export default router;
