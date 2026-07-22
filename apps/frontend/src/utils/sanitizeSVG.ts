export function sanitizeSVG(input: string): string {
  if (!input) return '';
  
  // Remove potentially dangerous patterns
  let sanitized = input
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
  
  return sanitized;
}
