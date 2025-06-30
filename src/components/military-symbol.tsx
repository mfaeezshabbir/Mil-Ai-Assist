import type { SymbolData } from '@/types';

type MilitarySymbolProps = {
  symbol: SymbolData;
};

const ECHELON_MAP: { [key: string]: string } = {
  Team: 'Ø',
  Squad: '●',
  Section: '●●',
  Platoon: '●●●',
  Company: '|',
  Battalion: '||',
  Regiment: '|||',
  Brigade: 'X',
  Division: 'XX',
  Corps: 'XXX',
  Army: 'XXXX',
};

const CATEGORY_ICON_MAP: { [key:string]: React.ReactNode } = {
  'armored': <path d="M 50 40 A 20 15 0 1 0 50 60 A 20 15 0 1 0 50 40 Z" stroke="currentColor" strokeWidth="2.5" fill="none" />,
  'infantry': <><line x1="35" y1="35" x2="65" y2="65" stroke="currentColor" strokeWidth="2.5" /><line x1="65" y1="35" x2="35" y2="65" stroke="currentColor" strokeWidth="2.5" /></>,
};


export function MilitarySymbol({ symbol }: MilitarySymbolProps) {
  const {
    symbolStandardIdentity,
    symbolCategory,
    symbolEchelon,
    symbolDamaged,
    symbolTaskForce,
  } = symbol;

  const frameColor = 'hsl(var(--primary))';
  const frameFillColor = 'hsl(var(--background))';
  const iconColor = 'hsl(var(--primary))';
  
  let frame;
  switch (symbolStandardIdentity) {
    case 'Hostile':
      frame = <path d="M50 5 L95 50 L50 95 L5 50 Z" stroke={frameColor} fill={frameFillColor} strokeWidth="3" />;
      break;
    case 'Friend':
      frame = <rect x="5" y="25" width="90" height="50" stroke={frameColor} fill={frameFillColor} strokeWidth="3" rx="5" />;
      break;
    case 'Neutral':
      frame = <rect x="10" y="10" width="80" height="80" stroke={frameColor} fill={frameFillColor} strokeWidth="3" rx="5" />;
      break;
    case 'Unknown':
      frame = <path d="M50,10 C77.6,10 77.6,40 50,40 C22.4,40 22.4,10 50,10 z M50,90 C22.4,90 22.4,60 50,60 C77.6,60 77.6,90 50,90 z M10,50 C10,22.4 40,22.4 40,50 C40,77.6 10,77.6 10,50 z M90,50 C90,77.6 60,77.6 60,50 C60,22.4 90,22.4 90,50 z" transform="rotate(45 50 50)" stroke={frameColor} fill={frameFillColor} strokeWidth="3"/>;
      break;
    default:
      frame = <rect x="10" y="10" width="80" height="80" stroke={frameColor} fill={frameFillColor} strokeWidth="3" rx="5" />;
  }

  const echelonText = symbolEchelon ? ECHELON_MAP[symbolEchelon] : '';
  const categoryIcon = CATEGORY_ICON_MAP[symbolCategory.toLowerCase()] || null;

  const title = `${symbolStandardIdentity} ${symbolCategory} unit` +
    (symbolEchelon ? ` (${symbolEchelon})` : '') +
    (symbolDamaged ? ', Damaged' : '') +
    (symbolTaskForce ? ', Task Force' : '') +
    ` at ${symbol.latitude.toFixed(4)}, ${symbol.longitude.toFixed(4)}`;

  return (
    <div title={title} aria-label={title}>
      <svg viewBox="0 0 100 120" width="60" height="72" className="drop-shadow-lg">
        <g transform="translate(0, 20)">
          {echelonText && <text x="50" y="-5" textAnchor="middle" fontSize="18" fontWeight="bold" fill={frameColor} className="font-headline">{echelonText}</text>}
          {frame}
          <g stroke={iconColor} fill={iconColor}>
            {categoryIcon}
            {symbolTaskForce && <text x="18" y="55" fontSize="12" fontWeight="bold" fill="currentColor">TF</text>}
          </g>
          {symbolDamaged && <line x1="25" y1="85" x2="75" y2="25" stroke="hsl(var(--destructive))" strokeWidth="4" />}
        </g>
      </svg>
    </div>
  );
}
