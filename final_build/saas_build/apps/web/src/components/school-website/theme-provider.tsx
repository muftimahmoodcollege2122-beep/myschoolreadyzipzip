'use client';
import React from 'react';
import type { SchoolTheme } from '@/types/theme';

const radiusMap = { none: '0px', small: '6px', medium: '12px', large: '20px' };
const shadowMap = {
  none:   'none',
  soft:   '0 2px 12px rgba(0,0,0,0.06)',
  medium: '0 4px 24px rgba(0,0,0,0.10)',
  strong: '0 8px 40px rgba(0,0,0,0.18)',
};

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `${r} ${g} ${b}`;
}

export function ThemeProvider({ theme, children }: { theme: SchoolTheme; children: React.ReactNode }) {
  const gfUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(theme.fontHeading)}:wght@400;600;700;800&family=${encodeURIComponent(theme.fontBody)}:wght@300;400;500&display=swap`;

  const css = `
    :root {
      --primary:     ${theme.primaryColor};
      --primary-rgb: ${hexToRgb(theme.primaryColor)};
      --secondary:   ${theme.secondaryColor};
      --accent:      ${theme.accentColor};
      --text:        ${theme.textColor};
      --bg:          ${theme.bgColor};
      --radius:      ${radiusMap[theme.borderRadius]};
      --shadow:      ${shadowMap[theme.shadowStyle]};
      --font-heading: '${theme.fontHeading}', sans-serif;
      --font-body:    '${theme.fontBody}', sans-serif;
    }
    body { background: var(--bg); color: var(--text); font-family: var(--font-body); margin: 0; }
    h1,h2,h3,h4,h5,h6 { font-family: var(--font-heading); }
    .btn-primary {
      background: var(--primary); color: #fff;
      border-radius: ${theme.buttonStyle === 'pill' ? '100px' : theme.buttonStyle === 'sharp' ? '0' : 'var(--radius)'};
      border: 2px solid ${theme.buttonStyle === 'outline' ? 'var(--primary)' : 'transparent'};
      ${theme.buttonStyle === 'outline' ? 'background: transparent; color: var(--primary);' : ''}
      padding: 12px 28px; font-weight: 700; cursor: pointer; transition: all 0.2s;
      font-family: var(--font-heading);
    }
    .btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: var(--shadow); }
    .btn-secondary {
      background: transparent; color: var(--primary);
      border: 2px solid var(--primary);
      border-radius: ${theme.buttonStyle === 'pill' ? '100px' : theme.buttonStyle === 'sharp' ? '0' : 'var(--radius)'};
      padding: 12px 28px; font-weight: 700; cursor: pointer; transition: all 0.2s;
    }
    .card { background: #fff; border-radius: var(--radius); box-shadow: var(--shadow); }
    .section-padding { padding: 80px 0; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    * { box-sizing: border-box; }
  `;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href={gfUrl} rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {children}
    </>
  );
}
