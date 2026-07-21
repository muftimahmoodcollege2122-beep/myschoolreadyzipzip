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
  const template = theme?.template || 'classic';
  return (
    <ThemeProvider theme={theme}>
      {template === 'classic'  && <ClassicTemplate  theme={theme} slug={slug} />}
      {template === 'modern'   && <ModernTemplate   theme={theme} slug={slug} />}
      {template === 'bold'     && <BoldTemplate     theme={theme} slug={slug} />}
      {template === 'elegant'  && <ElegantTemplate  theme={theme} slug={slug} />}
      {template === 'vibrant'  && <VibrantTemplate  theme={theme} slug={slug} />}
      {!['classic','modern','bold','elegant','vibrant'].includes(template) && <ClassicTemplate theme={theme} slug={slug} />}
    </ThemeProvider>
  );
}
