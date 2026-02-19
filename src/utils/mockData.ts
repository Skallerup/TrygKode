import { Contact, ScamTip } from '../store/useAppStore';

export const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Mor (Karen)',
    phone: '+45 23 45 67 89',
    codeWord: 'jordbær-pandekage',
    codeType: 'static',
    createdAt: '2026-02-01T10:00:00Z',
    lastCheckIn: '2026-02-15T14:30:00Z',
  },
  {
    id: '2',
    name: 'Far (Henrik)',
    phone: '+45 34 56 78 90',
    codeWord: 'vikinge-rugbrød',
    codeType: 'static',
    createdAt: '2026-02-01T10:05:00Z',
    lastCheckIn: '2026-02-10T09:00:00Z',
  },
  {
    id: '3',
    name: 'Søster (Maria)',
    phone: '+45 45 67 89 01',
    codeWord: 'HK7N3P',
    codeType: 'rotating',
    createdAt: '2026-02-05T12:00:00Z',
    expiresAt: '2026-03-07T12:00:00Z',
  },
  {
    id: '4',
    name: 'Bedstefor (Ole)',
    phone: '+45 56 78 90 12',
    codeWord: 'koldskål-fyrtårn',
    codeType: 'static',
    createdAt: '2026-02-08T16:00:00Z',
    isAdmin: false,
  },
];

export const mockScamTips: ScamTip[] = [
  {
    id: '1',
    title: 'AI kan nu kopiere din stemme på 3 sekunder',
    summary: 'Ny teknologi gør det muligt at klone stemmer med minimal lydoptagelse. Vær ekstra opmærksom på opkald fra "familie".',
    content: 'AI-teknologi som ElevenLabs kan nu genskabe en persons stemme med blot 3 sekunders lydoptagelse. Det betyder, at svindlere kan bruge korte klip fra sociale medier til at udgive sig for dine nærmeste. Brug altid dit kodeord til at verificere opkald, der beder om penge eller personlige oplysninger.',
    date: '2026-02-18',
    category: 'warning',
  },
  {
    id: '2',
    title: 'Sådan genkender du svindel-opkald',
    summary: 'De 5 vigtigste tegn på at et opkald er svindel — og hvad du skal gøre.',
    content: '1. Opkaldet er uventet og presserende\n2. Der bedes om penge eller bankoplysninger\n3. Personen vil ikke give dit kodeord\n4. Telefonnummeret ser mærkeligt ud\n5. Du føler dig presset til at handle nu\n\nHvis du oplever disse tegn: Læg på, og ring selv til personen på deres rigtige nummer.',
    date: '2026-02-15',
    category: 'tip',
  },
  {
    id: '3',
    title: 'Politi advarer: Stigning i AI-svindel i Danmark',
    summary: 'Dansk politi har registreret en markant stigning i svindelforsøg med AI-genererede stemmer.',
    content: 'Rigspolitiet melder om en stigning på 40% i anmeldelser relateret til stemme-svindel i 2025. Særligt ældre borgere er udsatte. Politiet anbefaler at etablere kodeord med familie og venner som den mest effektive beskyttelse.',
    date: '2026-02-12',
    category: 'news',
  },
  {
    id: '4',
    title: 'Tip: Del aldrig dit kodeord digitalt',
    summary: 'Dit kodeord er kun sikkert, hvis det deles ansigt til ansigt.',
    content: 'Det vigtigste princip for dit kodeord: Del det KUN ansigt til ansigt med dine kontakter. Send det aldrig via SMS, e-mail eller beskeder. Hvis en svindler får adgang til din telefon, kan de se dine beskeder — men de kan ikke vide, hvad du har sagt til din familie i privat samtale.',
    date: '2026-02-10',
    category: 'tip',
  },
];
