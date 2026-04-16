import { memo, useMemo } from 'react';
import { THREAT_COLORS } from '../constants';
import { SophMeter } from './SophMeter';
import type { AttackEvent } from '../types';

interface XAICardProps {
  attack: AttackEvent;
}

function XAICardInner({ attack }: XAICardProps) {
  const color = THREAT_COLORS[attack.type] || '#DC2626';

  const layerScores = useMemo(() => {
    const s = attack.score;
    const isRegex = attack.layer === 'INPUT_FIREWALL' || attack.layer === 'INPUT' || attack.layer === 'REGEX_ENGINE';
    const isML = attack.layer === 'ONNX_DEBERTA_V3';
    const isAudit = attack.layer === 'OUTPUT' || attack.layer === 'OUTPUT_AUDITOR';

    return [
      { name: 'Regex Engine', v: isRegex ? Math.min(s, 1) : attack.blocked ? s * 0.3 : 0 },
      { name: 'ML Classifier', v: isML ? Math.min(s, 1) : attack.blocked ? Math.min(attack.soph / 10, 1) : 0 },
      { name: 'Output Auditor', v: isAudit ? Math.min(s, 1) : 0 },
    ];
  }, [attack.id, attack.score, attack.layer, attack.blocked, attack.soph]);

  return (
    <div
      className="bg-argus-panel rounded-[6px] py-[12px] px-[14px] animate-slide-up shrink-0 border border-argus-border shadow-[0_1px_3px_rgba(15,28,46,0.08)]"
      style={{
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 mr-3">
          <div className="font-mono text-[11px] text-argus-muted mb-1 font-medium">
            {attack.type.replace(/_/g, ' ')} · T{attack.tier} · {attack.latency}ms
          </div>
          <div className="font-display text-[12px] text-argus-secondary leading-relaxed">
            {attack.text.slice(0, 70)}
            {attack.text.length > 70 ? '…' : ''}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div
            className="font-mono text-[10px] font-bold py-1 px-2 rounded-[4px] inline-block mb-2"
            style={{
              color: attack.blocked ? '#0D9B8A' : '#D97706',
              background: attack.blocked ? 'rgba(13, 155, 138, 0.12)' : 'rgba(217, 119, 6, 0.12)',
              border: `1px solid ${attack.blocked ? '#0D9B8A' : '#D97706'}`,
            }}
          >
            {attack.blocked ? '⛔ BLOCKED' : '⚠ PARTIAL'}
          </div>
          <div className="w-[80px] ml-auto">
            <SophMeter score={attack.soph} />
          </div>
        </div>
      </div>

      {/* Layer breakdown */}
      <div className="flex flex-col gap-1.5 mb-3">
        {layerScores.map((l, i) => {
          const lColor = l.v > 0.75 ? '#DC2626' : l.v > 0.5 ? '#D97706' : '#16A34A';
          return (
            <div key={i} className="flex items-center gap-3">
              <div className="font-mono text-[10px] text-argus-muted w-[95px] shrink-0">
                {l.name}
              </div>
              <div className="flex-1 h-[4px] bg-argus-input rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.round(l.v * 100)}%`,
                    background: lColor,
                  }}
                />
              </div>
              <div className="font-mono text-[10px] w-[35px] text-right text-argus-dim">
                {Math.round(l.v * 100)}%
              </div>
            </div>
          );
        })}
      </div>

      {/* XAI Reasoning */}
      <div className="bg-[#F8FAFC] border border-argus-border rounded-[6px] py-2 px-3 font-mono text-[11px] text-argus-secondary leading-relaxed">
        <span className="opacity-70 mr-1">🧠</span> {attack.reason}
      </div>

      {attack.muts > 0 && (
        <div className="mt-2 font-mono text-[10px] text-argus-purple font-medium flex items-center">
          <span className="opacity-70 mr-1">⌬</span> {attack.muts} semantic variants auto-pre-blocked
        </div>
      )}
    </div>
  );
}

export const XAICard = memo(XAICardInner);
