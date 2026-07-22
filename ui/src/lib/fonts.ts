/**
 * Part F: Next.js Google Font Build Fix
 * Authentication Recovery Sprint Part 3
 * 
 * Centralized font configuration to prevent build issues
 * and optimize font loading
 */

import { Geist, Geist_Mono } from 'next/font/google';

/**
 * Geist Sans Font Configuration
 * 
 * Optimizations:
 * - Preload for better performance
 * - Display swap to prevent FOIT (Flash of Invisible Text)
 * - Latin subset only (reduces bundle size)
 * - CSS variable for easy theming
 */
export const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ],
  adjustFontFallback: true,
});

/**
 * Geist Mono Font Configuration
 * 
 * Optimizations:
 * - Preload for better performance  
 * - Display swap to prevent FOIT
 * - Latin subset only
 * - CSS variable for code blocks
 */
export const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: [
    'ui-monospace',
    'SFMono-Regular',
    'Menlo',
    'Monaco',
    'Consolas',
    'Liberation Mono',
    'Courier New',
    'monospace',
  ],
  adjustFontFallback: true,
});

/**
 * Font class names for use in components
 * 
 * Usage:
 * ```tsx
 * import { fontClassNames } from '@/lib/fonts';
 * 
 * <html className={fontClassNames}>
 * ```
 */
export const fontClassNames = `${geistSans.variable} ${geistMono.variable}`;

/**
 * Font variables for use in CSS
 * 
 * Usage in CSS:
 * ```css
 * .my-element {
 *   font-family: var(--font-geist-sans);
 * }
 * ```
 */
export const fontVariables = {
  sans: 'var(--font-geist-sans)',
  mono: 'var(--font-geist-mono)',
} as const;

/**
 * Export individual fonts for specific use cases
 */
export { geistSans as sans, geistMono as mono };
