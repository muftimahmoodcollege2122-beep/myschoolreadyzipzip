'use client';
import React from 'react';
import type { SchoolTheme } from '../../types/theme';
import { ClassicTemplate }       from './templates/classic';
import { ModernTemplate }        from './templates/modern';
import { BoldTemplate }          from './templates/bold';
import { ElegantTemplate }       from './templates/elegant';
import { VibrantTemplate }       from './templates/vibrant';
import { GlassmorphismTemplate } from './templates/glassmorphism';
import { DarkTemplate }          from './templates/dark';
import { MinimalTemplate }       from './templates/minimal';
import { RoyalTemplate }         from './templates/royal';
import { MagazineTemplate }      from './templates/magazine';
import { ThemeProvider }         from './theme-provider';

interface Props { theme: SchoolTheme; slug: string; }

export function SchoolWebsite({ theme, slug }: Props) {
  const t = theme.template;
  return (
    <ThemeProvider theme={theme}>
      {t === 'classic'       && <ClassicTemplate       theme={theme} slug={slug} />}
      {t === 'modern'        && <ModernTemplate        theme={theme} slug={slug} />}
      {t === 'bold'          && <BoldTemplate          theme={theme} slug={slug} />}
      {t === 'elegant'       && <ElegantTemplate       theme={theme} slug={slug} />}
      {t === 'vibrant'       && <VibrantTemplate       theme={theme} slug={slug} />}
      {t === 'glassmorphism' && <GlassmorphismTemplate theme={theme} slug={slug} />}
      {t === 'dark'          && <DarkTemplate          theme={theme} slug={slug} />}
      {t === 'minimal'       && <MinimalTemplate       theme={theme} slug={slug} />}
      {t === 'royal'         && <RoyalTemplate         theme={theme} slug={slug} />}
      {t === 'magazine'      && <MagazineTemplate      theme={theme} slug={slug} />}
      {/* Fallback for any unrecognised template */}
      {!['classic','modern','bold','elegant','vibrant','glassmorphism','dark','minimal','royal','magazine'].includes(t) && (
        <ModernTemplate theme={theme} slug={slug} />
      )}
    </ThemeProvider>
  );
}
