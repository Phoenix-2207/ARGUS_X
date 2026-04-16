import { memo } from 'react';

interface ThreatLevelBarProps {
  level: number;
}

const LEVELS = ['MINIMAL', 'LOW', 'MODERATE', 'ELEVATED', 'HIGH', 'CRITICAL'];
const LEVEL_COLORS = ['#16A34A', '#16A34A', '#D97706', '#EA580C', '#DC2626', '#DC2626'];

function ThreatLevelBarInner({ level }: ThreatLevelBarProps) {
  const idx = Math.min(level, 5);
  return (
    <div>
      <div className="flex justify-between items-center mb-2 pb-1 border-b border-argus-input">
        <div className="font-mono text-[11px] tracking-[0.12em] text-argus-secondary font-medium flex items-center">
          <span className="inline-block w-[3px] h-[14px] mr-2" style={{ background: LEVEL_COLORS[idx] }}></span>
          THREAT LEVEL
        </div>
        <span className="font-mono text-[11px] font-bold" style={{ color: LEVEL_COLORS[idx] }}>
          {LEVELS[idx]}
        </span>
      </div>
      <div className="flex gap-[2px] h-2 w-full pt-1">
        {Array.from({ length: 10 }, (_, i) => {
          const isFilled = i < level + 1;
          return (
            <div
              key={i}
              className="flex-1 h-full rounded-[1px] transition-colors duration-500"
              style={{
                background: isFilled ? LEVEL_COLORS[idx] : '#EBF0F6',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export const ThreatLevelBar = memo(ThreatLevelBarInner);
