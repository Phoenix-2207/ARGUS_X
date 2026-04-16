// ═══════════════════════════════════════════════════════════════════════
// ARGUS-X — Patch Banner
// Shows a "VULNERABILITY PATCHED" alert when the system self-heals.
// Displays redacted bypass hash → after (patch applied).
// Auto-dismisses after 8 seconds.
// ═══════════════════════════════════════════════════════════════════════

import { memo } from 'react';
import { THREAT_COLORS } from '../constants';

export interface PatchEvent {
  before_hash: string;
  before_preview: string;
  type: string;
  tier: number;
  after: string;
  ts: string;
}

interface PatchBannerProps {
  patch: PatchEvent | null;
  visible: boolean;
}

export const PatchBanner = memo(function PatchBanner({ patch, visible }: PatchBannerProps) {
  if (!visible || !patch) return null;

  return (
    <div
      className="absolute top-0 left-0 right-0 z-[200] w-full bg-[#EFF6FF] border-b border-[#BFDBFE] animate-[slideDown_0.35s_ease-out] shadow-[0_2px_8px_rgba(26,115,232,0.05)]"
      role="alert"
    >
      <div className="max-w-6xl mx-auto px-4 py-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="font-display text-[11px] font-medium text-argus-blue tracking-wide">
            🛡 Self-healing patch applied
          </div>
          <div className="hidden md:block font-mono text-[10px] text-argus-blue opacity-70">
            · {patch.type.replace(/_/g, ' ')} · TIER {patch.tier}
          </div>
        </div>

        {/* Before / After */}
        <div className="flex flex-1 gap-4 overflow-hidden w-full max-w-[800px]">
          {/* Before */}
          <div className="flex-1 truncate">
            <span className="font-mono text-[9px] text-argus-red tracking-wider mr-2 font-bold">
               ✕ BYPASS
            </span>
            <span className="font-mono text-[10px] text-argus-secondary">
              {patch.before_preview}
            </span>
          </div>

          {/* After */}
          <div className="flex-1 truncate">
            <span className="font-mono text-[9px] text-argus-green tracking-wider mr-2 font-bold">
              ✓ PATCHED
            </span>
            <span className="font-mono text-[10px] text-argus-secondary">
              {patch.after}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
