import { memo } from 'react';
import { Sparkline } from './Sparkline';

interface StatCardProps {
  label: string;
  value: string | number;
  color: string;
  sub?: string;
  sparkData?: number[];
}

function StatCardInner({ label, value, color, sub, sparkData }: StatCardProps) {
  return (
    <div
      className="bg-argus-panel border border-argus-border rounded-[10px] px-[16px] py-[14px] flex flex-col gap-1 shadow-[0_1px_3px_rgba(15,28,46,0.08),0_4px_12px_rgba(15,28,46,0.04)]"
    >
      <div className="font-mono text-[11px] tracking-[0.12em] text-argus-secondary font-medium uppercase border-b border-argus-input pb-1 mb-1">
        <span className="inline-block w-[3px] h-[14px] mr-2 align-text-bottom" style={{ background: color }}></span>
        {label}
      </div>
      <div className="font-display text-[28px] font-bold leading-none mt-1" style={{ color }}>
        {value}
      </div>
      {sub && (
        <div className="font-mono text-[11px] text-argus-muted mt-1">{sub}</div>
      )}
      {sparkData && (
        <div className="mt-2">
          <Sparkline data={sparkData} color={color} />
        </div>
      )}
    </div>
  );
}

export const StatCard = memo(StatCardInner);
