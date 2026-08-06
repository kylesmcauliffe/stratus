interface OgNode {
  type: string;
  props: {
    children?: OgNode | OgNode[] | string;
    style?: Record<string, string | number>;
    tw?: string;
  };
}

interface OgInput {
  title: string;
  description?: string;
  eyebrow?: string;
  byline?: string;
}

const COLORS = {
  navy: '#0F172A',
  navyMid: '#1E293B',
  blue: '#2b62e7',
  blueLight: '#3B82F6',
  white: '#FFFFFF',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  blueAccent: '#60A5FA',
};

function el(
  type: string,
  style: Record<string, string | number>,
  children: OgNode | OgNode[] | string,
): OgNode {
  return { type, props: { style, children } };
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + '…';
}

export function ogTemplate({ title, description, eyebrow, byline }: OgInput): OgNode {
  const trimmedTitle = truncate(title, 110);
  const trimmedDescription = description ? truncate(description, 180) : undefined;

  const headerRow = el(
    'div',
    {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
    },
    [
      el(
        'div',
        {
          display: 'flex',
          width: '14px',
          height: '40px',
          backgroundColor: COLORS.blue,
          borderRadius: '4px',
        },
        '',
      ),
      el(
        'div',
        {
          display: 'flex',
          fontSize: '28px',
          fontWeight: 700,
          color: COLORS.white,
          letterSpacing: '-0.02em',
        },
        'Rainfall Health',
      ),
    ],
  );

  const eyebrowEl = eyebrow
    ? el(
        'div',
        {
          display: 'flex',
          fontSize: '20px',
          fontWeight: 600,
          color: COLORS.blueAccent,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: '8px',
        },
        eyebrow,
      )
    : null;

  const titleEl = el(
    'div',
    {
      display: 'flex',
      fontSize: '60px',
      fontWeight: 700,
      color: COLORS.white,
      letterSpacing: '-0.025em',
      lineHeight: 1.1,
      marginBottom: '20px',
    },
    trimmedTitle,
  );

  const descEl = trimmedDescription
    ? el(
        'div',
        {
          display: 'flex',
          fontSize: '26px',
          fontWeight: 400,
          color: COLORS.gray300,
          lineHeight: 1.4,
        },
        trimmedDescription,
      )
    : null;

  const bylineEl = byline
    ? el(
        'div',
        {
          display: 'flex',
          fontSize: '22px',
          fontWeight: 500,
          color: COLORS.gray400,
        },
        byline,
      )
    : null;

  const body = el(
    'div',
    {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      justifyContent: 'center',
    },
    [eyebrowEl, titleEl, descEl].filter(Boolean) as OgNode[],
  );

  const footer = el(
    'div',
    {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: '24px',
      borderTop: `2px solid ${COLORS.navyMid}`,
    },
    [
      el(
        'div',
        {
          display: 'flex',
          fontSize: '22px',
          fontWeight: 500,
          color: COLORS.gray400,
        },
        'rainfallhealth.com',
      ),
      bylineEl ?? el('div', { display: 'flex' }, ''),
    ],
  );

  return el(
    'div',
    {
      display: 'flex',
      flexDirection: 'column',
      width: '1200px',
      height: '630px',
      padding: '64px 72px',
      backgroundColor: COLORS.navy,
      backgroundImage: `radial-gradient(circle at 90% 0%, ${COLORS.blue}33, transparent 50%), radial-gradient(circle at 0% 100%, ${COLORS.blueLight}1A, transparent 45%)`,
      fontFamily: 'Inter',
    },
    [headerRow, body, footer],
  );
}
