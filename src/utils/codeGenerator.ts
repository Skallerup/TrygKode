const DANISH_WORDS = [
  'jordbær', 'solskin', 'sommerfugl', 'regnbue', 'havfrue',
  'vikinge', 'pandekage', 'kanelsnegl', 'fyrtårn', 'cykelsmed',
  'skovtur', 'klaphat', 'rugbrød', 'strandsand', 'blåbær',
  'vindmølle', 'smørblomst', 'danskvand', 'hyggebukser', 'koldskål',
  'wienerbrød', 'flødebolle', 'kagemand', 'legehus', 'fiskesø',
  'sølvmåge', 'bøgeskov', 'mælkebøtte', 'hindbær', 'strandvejr',
  'morgenmad', 'flagstang', 'grøntsag', 'havregris', 'æblekage',
  'kartoffel', 'ringridning', 'pølsevogn', 'loppemarked', 'fællessang',
];

export function generateCodeWord(): string {
  const word1 = DANISH_WORDS[Math.floor(Math.random() * DANISH_WORDS.length)];
  const word2 = DANISH_WORDS[Math.floor(Math.random() * DANISH_WORDS.length)];
  return `${word1}-${word2}`;
}

export function generateRotatingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function getExpiryDate(days: number = 30): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('da-DK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function isExpired(isoString: string): boolean {
  return new Date(isoString) < new Date();
}

export function daysUntilExpiry(isoString: string): number {
  const diff = new Date(isoString).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
