export const useSanitizeSVG = () => {
  const sanitizeSVG = (input: string): string => {
    if (!input) return '';
    return input
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  };
  return { sanitizeSVG };
};
