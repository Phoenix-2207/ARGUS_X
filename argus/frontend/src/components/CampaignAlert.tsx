import { memo } from 'react';
import type { AlertEntry } from '../types';

interface CampaignAlertProps {
  showAlert: boolean;
  alertMsg: string;
  alertHistory: AlertEntry[];
  showAlertHistory: boolean;
  onToggleHistory: () => void;
}

function CampaignAlertInner({
  showAlert,
  alertMsg,
  alertHistory,
  showAlertHistory,
  onToggleHistory,
}: CampaignAlertProps) {
  if (showAlert) {
    const isCritical = alertMsg.includes('CAMPAIGN DETECTED');
    return (
      <div
        className={`absolute top-[72px] right-4 z-[100] border rounded-[8px] px-[16px] py-[14px] max-w-[380px] animate-slide-alert shadow-[0_4px_12px_rgba(15,28,46,0.08)]`}
        style={{ 
          background: isCritical ? '#FEF2F2' : '#FFFBEB',
          borderColor: isCritical ? '#FECACA' : '#FDE68A',
          borderLeft: `4px solid ${isCritical ? '#DC2626' : '#D97706'}` 
        }}
        role="alert"
      >
        <div className="font-display text-[13px] font-bold tracking-tight mb-1" style={{ color: isCritical ? '#DC2626' : '#D97706'}}>
          ⚠ Campaign Detected
        </div>
        <div className="font-display text-[12px] text-argus-secondary leading-relaxed">
          {alertMsg}
        </div>
        <div className="mt-2 font-mono text-[10px] text-argus-muted">
          Correlator flagged · Auto-escalated
        </div>
      </div>
    );
  }

  if (alertHistory.length === 0) return null;

  return (
    <div className="absolute top-[72px] right-4 z-[90]">
      <button
        onClick={onToggleHistory}
        className="font-mono text-[10px] text-argus-orange cursor-pointer tracking-wider py-1.5 px-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-[6px] hover:bg-[#FEF2F2] hover:border-[#FECACA] hover:text-argus-red transition-colors shadow-[0_2px_4px_rgba(217,119,6,0.1)]"
        aria-expanded={showAlertHistory}
        aria-label={`${alertHistory.length} campaign alerts`}
      >
        ⚠ {alertHistory.length} CAMPAIGN{alertHistory.length > 1 ? 'S' : ''} ·{' '}
        {showAlertHistory ? 'HIDE' : 'SHOW'}
      </button>
      {showAlertHistory && (
        <div className="mt-2 bg-argus-panel border border-argus-border rounded-[8px] px-3 py-2.5 max-w-[380px] max-h-[200px] overflow-y-auto shadow-[0_4px_12px_rgba(15,28,46,0.06)]">
          {alertHistory.map((a, i) => (
            <div
              key={i}
              className="font-mono text-[11px] text-argus-secondary leading-[1.6] py-1"
              style={{
                borderBottom: i < alertHistory.length - 1 ? '1px solid #EBF0F6' : 'none',
              }}
            >
              <span className="text-argus-muted mr-1">[{a.ts}]</span> {a.msg}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const CampaignAlert = memo(CampaignAlertInner);
