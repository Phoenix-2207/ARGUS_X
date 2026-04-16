import { memo } from 'react';

interface BattleStatusProps {
  redAtks: number;
  blueBlocks: number;
  redBypasses: number;
  tier: number;
}

const TIERS = ['NAIVE', 'BASIC', 'OBFUSCATED', 'ADVERSARIAL', 'APEX'];

function BattleStatusInner({ redAtks, blueBlocks, redBypasses, tier }: BattleStatusProps) {
  const blockRate = redAtks > 0 ? Math.round((blueBlocks / redAtks) * 100) : 100;
  return (
    <div className="flex flex-col gap-3 pt-1">
      <div className="flex justify-between items-center mb-1 border-b border-argus-input pb-1">
        <div className="font-mono text-[11px] tracking-[0.12em] text-argus-secondary font-medium flex items-center">
            <span className="inline-block w-[3px] h-[14px] mr-2 bg-argus-blue"></span>
            AI BATTLE
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-[6px]">
            <span className="font-mono text-[11px] font-bold text-[#EA580C]">
              AI RED · {TIERS[Math.min(tier - 1, 4)]}
            </span>
          </div>
          <span className="font-mono text-[10px] text-argus-muted">
            {redAtks} attacks
          </span>
        </div>
        <div className="h-[6px] bg-argus-input rounded-full overflow-hidden">
          <div
            className="h-full bg-[#EA580C] rounded-full transition-all duration-500"
            style={{ width: `${Math.min((redBypasses / Math.max(redAtks, 1)) * 100 * 5, 100)}%` }}
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-[6px]">
            <span className="font-mono text-[11px] font-bold text-argus-blue">
              DEFENSE BLUE
            </span>
          </div>
          <span className="font-mono text-[10px] text-argus-green font-medium">
            {blockRate}%
          </span>
        </div>
        <div className="h-[6px] bg-argus-input rounded-full overflow-hidden">
          <div
            className="h-full bg-argus-blue rounded-full transition-all duration-500"
            style={{
              width: `${blockRate}%`
            }}
          />
        </div>
      </div>
      
      <div className="font-mono text-[10px] text-argus-dim mt-1">
        {redBypasses} bypasses found · {redBypasses} auto-patched
      </div>
    </div>
  );
}

export const BattleStatus = memo(BattleStatusInner);
