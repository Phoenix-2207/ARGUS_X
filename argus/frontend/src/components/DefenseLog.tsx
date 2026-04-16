import { memo } from 'react';
import type { LogEntry } from '../types';

interface DefenseLogProps {
  entries: LogEntry[];
}

function DefenseLogInner({ entries }: DefenseLogProps) {
  return (
    <div className="bg-argus-panel border-t border-argus-border flex flex-col overflow-hidden col-start-2 col-end-3">
      <div className="px-4 py-3 border-b border-argus-input shrink-0 flex items-center">
        <span className="inline-block w-[3px] h-[14px] bg-argus-green mr-2"></span>
        <div className="font-mono text-[11px] font-medium tracking-[0.12em] text-argus-secondary uppercase">
          DEFENSE LOG · REAL-TIME
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {entries.map((l, i) => {
          
          let badgeColor = '#0F1C2E';
          let badgeBgColor = '#EBF0F6';
          let borderColor = '#D1DCE8';
          if (l.type === 'BLOCK') {
            badgeColor = '#0D9B8A';
            badgeBgColor = 'rgba(13, 155, 138, 0.1)';
            borderColor = 'rgba(13, 155, 138, 0.2)';
          } else if (l.type === 'SANITIZE') {
            badgeColor = '#1A73E8';
            badgeBgColor = 'rgba(26, 115, 232, 0.1)';
            borderColor = 'rgba(26, 115, 232, 0.2)';
          } else if (l.type === 'CLEAN') {
            badgeColor = '#16A34A';
            badgeBgColor = 'rgba(22, 163, 74, 0.1)';
            borderColor = 'rgba(22, 163, 74, 0.2)';
          } else if (l.type === 'MUTATE') {
            badgeColor = '#7C3AED';
            badgeBgColor = 'rgba(124, 58, 237, 0.1)';
            borderColor = 'rgba(124, 58, 237, 0.2)';
          }
          
          return (
            <div
              key={l.id}
              className={`text-[11px] leading-7 flex items-center gap-3 animate-slide-up rounded px-2 transition-colors duration-150 ${i % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'}`}
            >
              <div className="font-mono text-[10px] text-argus-dim shrink-0 w-[60px]">{l.ts}</div>
              <div 
                className="font-mono text-[10px] font-bold px-1.5 rounded-[4px] shrink-0 w-[65px] text-center border"
                style={{ color: badgeColor, background: badgeBgColor, borderColor }}
              >
                {l.type}
              </div>
              <div className="font-display text-[11px] text-argus-secondary truncate flex-1">{l.msg}</div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

export const DefenseLog = memo(DefenseLogInner);
