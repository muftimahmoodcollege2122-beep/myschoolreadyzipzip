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

function hexToRgb(hex: string | undefined) {
  if (!hex || typeof hex !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(hex)) return '0 0 0';
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `${r} ${g} ${b}`;
}

// SECURITY: this component injects raw CSS via dangerouslySetInnerHTML. The API
// already whitelists these fields on save, but we re-validate here too (defense
// in depth) — a malformed/malicious value must never reach the CSS string below,
// since that would allow breaking out of the <style> tag (stored XSS).
function safeHex(v: string | undefined, fallback: string) {
  return v && /^#[0-9a-fA-F]{6}$/.test(v) ? v : fallback;
}
function safeFont(v: string | undefined, fallback: string) {
  return v && /^[A-Za-z0-9 ]{1,60}$/.test(v.trim()) ? v.trim() : fallback;
}

export function ThemeProvider({ theme, children }: { theme: SchoolTheme; children: React.ReactNode }) {
  const primaryColor   = safeHex(theme?.primaryColor, '#059669');
  const secondaryColor = safeHex(theme?.secondaryColor, '#065F46');
  const accentColor    = safeHex(theme?.accentColor, '#F59E0B');
  const textColor      = safeHex(theme?.textColor, '#1A2B3C');
  const bgColor         = safeHex(theme?.bgColor, '#FFFFFF');
  const fontHeading     = safeFont(theme?.fontHeading, 'Plus Jakarta Sans');
  const fontBody        = safeFont(theme?.fontBody, 'Inter');
  const borderRadiusKey = (theme?.borderRadius && radiusMap[theme.borderRadius]) ? theme.borderRadius : 'medium';
  const shadowStyleKey  = (theme?.shadowStyle  && shadowMap[theme.shadowStyle])  ? theme.shadowStyle  : 'soft';
  const buttonStyle     = theme?.buttonStyle || 'solid';

  const gfUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontHeading)}:wght@400;600;700;800&family=${encodeURIComponent(fontBody)}:wght@300;400;500&display=swap`;

  const css = `
    :root {
      --primary:     ${primaryColor};
      --primary-rgb: ${hexToRgb(primaryColor)};
      --secondary:   ${secondaryColor};
      --accent:      ${accentColor};
      --text:        ${textColor};
      --bg:          ${bgColor};
      --radius:      ${radiusMap[borderRadiusKey]};
      --shadow:      ${shadowMap[shadowStyleKey]};
      --font-heading: '${fontHeading}', sans-serif;
      --font-body:    '${fontBody}', sans-serif;
    }
    body { background: var(--bg); color: var(--text); font-family: var(--font-body); margin: 0; }
    h1,h2,h3,h4,h5,h6 { font-family: var(--font-heading); }
    .btn-primary {
      background: var(--primary); color: #fff;
      border-radius: ${buttonStyle === 'pill' ? '100px' : buttonStyle === 'sharp' ? '0' : 'var(--radius)'};
      border: 2px solid ${buttonStyle === 'outline' ? 'var(--primary)' : 'transparent'};
      ${buttonStyle === 'outline' ? 'background: transparent; color: var(--primary);' : ''}
      padding: 12px 28px; font-weight: 700; cursor: pointer; transition: all 0.2s;
      font-family: var(--font-heading);
    }
    .btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: var(--shadow); }
    .btn-secondary {
      background: transparent; color: var(--primary);
      border: 2px solid var(--primary);
      border-radius: ${buttonStyle === 'pill' ? '100px' : buttonStyle === 'sharp' ? '0' : 'var(--radius)'};
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
