// ═══════════════════════════════════════════════════════════════════════
// ARGUS-X — Bypass History Panel
// Shows the last 10 auto-patched bypasses — proof of self-healing.
// Fetches from /api/v1/redteam/bypass-history on mount + periodic refresh.
// ═══════════════════════════════════════════════════════════════════════

import { useState, useEffect, memo } from 'react';
import { THREAT_COLORS } from '../constants';
import { API_URL } from '../utils/config';

interface BypassEntry {
  before_hash: string;
  before_preview: string;
  type: string;
  tier: number;
  score: number;
  cycle: number;
  after: string;
  ts: string;
}

export const BypassHistory = memo(function BypassHistory() {
  const [entries, setEntries] = useState<BypassEntry[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const BASE_INTERVAL = 60000;
    const MAX_INTERVAL = 300000;
    let currentInterval = BASE_INTERVAL;

    async function poll() {
      try {
        const res = await fetch(`${API_URL}/api/v1/redteam/bypass-history`, {
          signal: controller.signal,
        });
        if (!res.ok || !active) return;
        const data = await res.json();
        if (data.bypasses && active) {
          setEntries(data.bypasses);
        }
        currentInterval = BASE_INTERVAL;
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        currentInterval = Math.min(currentInterval * 1.5, MAX_INTERVAL);
      }

      if (active) {
        setTimeout(poll, currentInterval);
      }
    }

    poll();
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  return (
    <div className="bg-argus-panel border border-argus-border rounded-[10px] px-4 py-3.5 max-h-[220px] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pb-1 border-b border-argus-input">
        <div className="font-mono text-[11px] text-argus-secondary tracking-[0.12em] font-medium flex-1 flex items-center">
            <span className="inline-block w-[3px] h-[14px] bg-argus-green mr-2"></span>
          SELF-HEALING HISTORY
        </div>
        <div className="font-mono text-[10px] font-bold px-2 py-0.5 bg-[#F0FDF4] border border-[#86EFAC] text-[#16A34A] rounded-full">
          {entries.length} PATCHES
        </div>
      </div>

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="font-mono text-[11px] text-argus-dim text-center py-4">
          No bypasses patched yet — system is learning…
        </div>
      )}

      {/* Entries */}
      <div className="flex flex-col gap-1.5">
        {entries.map((entry, i) => {
          const isExpanded = expanded === i;
          const color = THREAT_COLORS[entry.type] || '#3A5A78';
          const tsDisplay = entry.ts
            ? new Date(entry.ts).toLocaleTimeString('en-US', { hour12: false })
            : '—';

          return (
            <div
              key={`${entry.ts}-${i}`}
              onClick={() => setExpanded(isExpanded ? null : i)}
              className={`cursor-pointer pb-1.5 rounded transition-colors ${isExpanded ? 'bg-argus-bg p-2' : ''}`}
              style={{
                borderBottom: i < entries.length - 1 && !isExpanded ? '1px solid #EBF0F6' : 'none'
              }}
              role="button"
              tabIndex={0}
              aria-expanded={isExpanded}
              onKeyDown={(e) => e.key === 'Enter' && setExpanded(isExpanded ? null : i)}
            >
              {/* Summary row */}
              <div className="flex items-center gap-2">
                <div className="w-[6px] h-[6px] rounded-full shrink-0" style={{ background: color }} />
                <div className="font-mono text-[11px] text-argus-text font-medium flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  {entry.type.replace(/_/g, ' ')}
                </div>
                <div className="font-mono text-[10px] text-argus-muted shrink-0 bg-white border border-argus-border px-1 rounded">T{entry.tier}</div>
                <div className="font-mono text-[10px] text-argus-green shrink-0 font-bold">PATCHED</div>
                <div className="font-mono text-[10px] text-argus-dim shrink-0 tabular-nums">{tsDisplay}</div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="mt-2 grid grid-cols-2 gap-2 animate-slide-up bg-white p-2 border border-argus-border rounded">
                  <div>
                    <div className="font-display text-[11px] font-bold text-argus-red tracking-wide mb-1">
                      ✕ BYPASS
                    </div>
                    <div className="font-mono text-[10px] text-argus-secondary bg-[#FEF2F2] border border-[#FECACA] rounded p-1.5 break-all max-h-16 overflow-hidden leading-relaxed">
                      {entry.before_preview}
                    </div>
                  </div>
                  <div>
                    <div className="font-display text-[11px] font-bold text-argus-green tracking-wide mb-1">
                      ✓ PATCH
                    </div>
                    <div className="font-mono text-[10px] text-argus-secondary bg-[#F0FDF4] border border-[#86EFAC] rounded p-1.5 break-all max-h-16 overflow-hidden leading-relaxed">
                      {entry.after}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
