// ═══════════════════════════════════════════════════════════════════════
// ARGUS-X — Design Tokens
// Centralized theme: colors, fonts, spacing, shadows
// ═══════════════════════════════════════════════════════════════════════

export const colors = {
  bg: {
    primary: '#F0F4F8',
    panel: '#FFFFFF',
    inset: '#EBF0F6',
    border: '#D1DCE8',
    glass: 'rgba(255, 255, 255, 0.98)',
    overlay: 'rgba(255, 255, 255, 0.92)',
  },
  accent: {
    blue: '#1A73E8',
    teal: '#0D9B8A',
    amber: '#D97706',
    red: '#DC2626',
    purple: '#7C3AED',
    indigo: '#4338CA',
    green: '#16A34A',
    orange: '#EA580C',
  },
  text: {
    primary: '#0F1C2E',
    secondary: '#3A5A78',
    muted: '#6B8BA4',
    dim: '#9DB4C8',
  },
  threat: {
    INSTRUCTION_OVERRIDE: '#DC2626',
    ROLE_OVERRIDE: '#D97706',
    DATA_EXFIL: '#D97706',
    INDIRECT_INJECTION: '#7C3AED',
    OBFUSCATED: '#1A73E8',
    CONTEXT_OVERFLOW: '#0D9B8A',
    MULTI_TURN: '#7C3AED',
    SOCIAL_ENG: '#1A73E8',
  } as Record<string, string>,
} as const;

export const fonts = {
  mono: "'JetBrains Mono', monospace",
  display: "'Inter', sans-serif",
  body: "'Inter', sans-serif",
} as const;

export const spacing = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
} as const;
