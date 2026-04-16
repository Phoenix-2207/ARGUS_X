import { memo } from 'react';
import { THREAT_COLORS } from '../constants';
import { SophMeter } from './SophMeter';
import type { AttackEvent } from '../types';

interface FeedItemProps {
  attack: AttackEvent;
}

function FeedItemInner({ attack }: FeedItemProps) {
  const color = THREAT_COLORS[attack.type] || '#DC2626';
  const action = attack.blocked ? 'BLOCKED' : 'PARTIAL';
  const actionColor = attack.blocked ? '#0D9B8A' : '#D97706';

  return (
    <div
      className="bg-argus-panel border border-argus-border rounded-[6px] py-[10px] px-[12px] animate-slide-up shrink-0 hover:bg-argus-input transition-colors duration-150"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div
          className="py-px px-1.5 rounded-[4px] font-mono text-[10px] font-medium"
          style={{
            background: `${actionColor}1F`, /* ~12% opacity */
            color: actionColor,
            border: `1px solid ${actionColor}`,
          }}
        >
          {action}
        </div>
        <div className="font-display font-medium text-[11px] text-argus-secondary">
          {attack.type.replace(/_/g, ' ')}
        </div>
        <div className="ml-auto font-mono text-[10px] text-argus-dim">
          {attack.latency}ms
        </div>
      </div>
      <div className="font-mono text-[11px] text-argus-muted whitespace-nowrap overflow-hidden text-ellipsis mb-2">
        {attack.text.slice(0, 58)}
      </div>
      <div className="flex items-center gap-2 mt-1">
        <div className="flex-1">
          <SophMeter score={attack.soph} />
        </div>
        {attack.muts > 0 && (
          <span className="font-mono text-[10px] text-argus-purple shrink-0">
            +{attack.muts} variants
          </span>
        )}
      </div>
    </div>
  );
}

export const FeedItem = memo(FeedItemInner);
