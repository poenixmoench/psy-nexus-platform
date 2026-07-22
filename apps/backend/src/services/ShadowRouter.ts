import { AGENT_TOKENS } from '../constants/AGENT_TOKENS';

const SEO_REGEX = /\b(seo|suchmaschinenoptimierung|meta title|meta description|schema\.org|json-ld|strukturierte daten|rich snippet|og:|open graph)\b/i;
const GEO_REGEX = /\b(geo|geodaten|standort|location|latitude|longitude|breitengrad|längengrad|plz|postleitzahl|region|city|stadt|landkreis)\b/i;

export function logShadowRouting(input: string, targetAgent: string) {
  if (!input || input.trim().length === 0) return;

  const isSeoLike = SEO_REGEX.test(input);
  const isGeoLike = GEO_REGEX.test(input);

  if (!isSeoLike && !isGeoLike) return;

  const expectedAgent = AGENT_TOKENS.DOCS;

  if (targetAgent !== expectedAgent) {
    setImmediate(() => {
      const cleanInput = input.replace(/\n|\r/g, ' ').substring(0, 150);
      console.warn('🕵️‍♂️ [SHADOW-ROUTER] Possible SEO/GEO mismatch:', {
        inputPreview: cleanInput + '...',
        targetAgent,
        expectedAgent,
        hints: { seo: isSeoLike, geo: isGeoLike },
      });
    });
  }
}
