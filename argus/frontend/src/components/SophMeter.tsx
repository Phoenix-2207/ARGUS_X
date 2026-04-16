import { memo } from 'react';

interface SophMeterProps {
  score: number;
}

function SophMeterInner({ score }: SophMeterProps) {
  const color = score <= 3 ? '#0D9B8A' : score <= 6 ? '#D97706' : '#DC2626';
  const pct = Math.min((score / 10) * 100, 100);

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-[3px] bg-argus-input rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="font-mono text-[10px] shrink-0" style={{ color }}>
        {score}/10
      </span>
    </div>
  );
}

export const SophMeter = memo(SophMeterInner);
