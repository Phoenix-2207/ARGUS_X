import { memo, useMemo } from 'react';
import { THREAT_COLORS } from '../constants';
import type { AttackEvent } from '../types';

const SIGNAL_NAMES = [
  'naive_keyword', 'roleplay_frame', 'hypothetical',
  'metaphor_wrap', 'multi_step_setup', 'l33t_obfuscation',
  'unicode_tricks', 'encoding_hints', 'context_overflow',
  'nested_injection', 'multi_turn_setup',
];

interface FingerprintCardProps {
  attack: AttackEvent;
}

function FingerprintCardInner({ attack }: FingerprintCardProps) {
  const color = THREAT_COLORS[attack.type] || '#DC2626';

  const fingerprintId = useMemo(() => {
    const taxonomy: Record<string, string> = {
      INSTRUCTION_OVERRIDE: 'A1',
      ROLE_OVERRIDE: 'A2',
      DATA_EXFIL: 'A3',
      INDIRECT_INJECTION: 'A5',
      OBFUSCATED: 'A6',
      CONTEXT_OVERFLOW: 'A7',
      SOCIAL_ENG: 'A8',
      MULTI_TURN: 'A9',
    };
    const prefix = taxonomy[attack.type] || 'AX';
    const hash = (attack.id * 2654435761 >>> 0).toString(16).toUpperCase().padStart(4, '0');
    return `${prefix}-${hash}`;
  }, [attack.id, attack.type]);

  const triggeredSignals = useMemo(() => {
    const active = new Set<number>();
    const soph = attack.soph;
    for (let i = 0; i < SIGNAL_NAMES.length; i++) {
      const threshold = Math.ceil((i + 1) / 2);
      const seed = ((attack.id * 2654435761 + i * 340573) >>> 0) % 100;
      if (soph >= threshold && seed > 30) {
        active.add(i);
      }
    }
    if (attack.blocked && active.size === 0) active.add(0);
    return active;
  }, [attack.id, attack.soph, attack.blocked]);

  return (
    <div
      className="bg-argus-panel border border-argus-border rounded-[6px] p-3 animate-slide-up"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="font-mono text-[10px] font-bold tracking-[0.05em]" style={{ color }}>
          <span className="opacity-70 mr-1">🔬</span> {fingerprintId}
        </div>
        <div className="font-mono text-[10px] text-argus-muted ml-auto font-medium">
          SOPH {attack.soph}/10
        </div>
      </div>

      <div className="grid grid-cols-11 gap-1 mb-2">
        {SIGNAL_NAMES.map((name, i) => {
          const active = triggeredSignals.has(i);
          const intensity = active ? Math.min(0.2 + (attack.soph / 10) * 0.8, 1) : 0;
          return (
            <div
              key={name}
              title={name.replace(/_/g, ' ')}
              className="w-full pt-[100%] rounded-[2px] transition-colors duration-300"
              style={{
                background: active
                  ? `rgba(${attack.soph > 7 ? '220,38,38' : attack.soph > 4 ? '217,119,6' : '13,155,138'},${intensity})`
                  : '#EBF0F6',
                border: active ? `1px solid rgba(${attack.soph > 7 ? '220,38,38' : attack.soph > 4 ? '217,119,6' : '13,155,138'}, 0.4)` : '1px solid transparent',
              }}
            />
          );
        })}
      </div>

      <div className="font-mono text-[10px] text-argus-dim leading-snug">
        {Array.from(triggeredSignals)
          .slice(0, 3)
          .map((i) => SIGNAL_NAMES[i]?.replace(/_/g, ' '))
          .join(' · ')}
        {triggeredSignals.size > 3 && ` +${triggeredSignals.size - 3} more`}
      </div>
    </div>
  );
}

export const FingerprintCard = memo(FingerprintCardInner);
