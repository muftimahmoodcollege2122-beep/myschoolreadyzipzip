'use client';
import React from 'react';
import type { SchoolTheme } from '@/types/theme';
import { ClassicTemplate } from './templates/classic';
import { ModernTemplate } from './templates/modern';
import { BoldTemplate } from './templates/bold';
import { ElegantTemplate } from './templates/elegant';
import { VibrantTemplate } from './templates/vibrant';
import { ThemeProvider } from './theme-provider';

interface Props { theme: SchoolTheme; slug: string; }

export function SchoolWebsite({ theme, slug }: Props) {
  return (
    <ThemeProvider theme={theme}>
      {theme.template === 'classic'  && <ClassicTemplate  theme={theme} slug={slug} />}
      {theme.template === 'modern'   && <ModernTemplate   theme={theme} slug={slug} />}
      {theme.template === 'bold'     && <BoldTemplate     theme={theme} slug={slug} />}
      {theme.template === 'elegant'  && <ElegantTemplate  theme={theme} slug={slug} />}
      {theme.template === 'vibrant'  && <VibrantTemplate  theme={theme} slug={slug} />}
    </ThemeProvider>
  );
}
