import { useMemo } from 'react';
import { THREAT_COLORS } from '../constants';
import { useRealtimeFeed } from '../hooks/useRealtimeFeed';
import { useStatsPoller } from '../hooks/useStats';
import { useArgusStore } from '../store/useArgusStore';
import { NeuralCanvas } from './NeuralCanvas';
import { XAICard } from './XAICard';
import { FeedItem } from './FeedItem';
import { Sparkline } from './Sparkline';
import { ThreatLevelBar } from './ThreatLevelBar';
import { BattleStatus } from './BattleStatus';
import { MiniClusterMap } from './MiniClusterMap';
import { CampaignAlert } from './CampaignAlert';
import { DefenseLog } from './DefenseLog';
import { ErrorBoundary } from './ErrorBoundary';
import { AttackTimeline } from './AttackTimeline';
import { PatchBanner } from './PatchBanner';
import { BypassHistory } from './BypassHistory';
import { FingerprintCard } from './FingerprintCard';
import { ComplianceExport } from './ComplianceExport';

export default function CommandCenter() {
  useRealtimeFeed();
  useStatsPoller();

  const attacks = useArgusStore((s) => s.attacks);
  const defenseLog = useArgusStore((s) => s.defenseLog);
  const lastUpdated = useArgusStore((s) => s.lastUpdated);
  const sophHistory = useArgusStore((s) => s.sophHistory);
  const latHistory = useArgusStore((s) => s.latHistory);
  const connected = useArgusStore((s) => s.connected);

  const total = useArgusStore((s) => s.total);
  const blocked = useArgusStore((s) => s.blocked);
  const muts = useArgusStore((s) => s.muts);
  const bypasses = useArgusStore((s) => s.bypasses);
  const tier = useArgusStore((s) => s.tier);
  const threatLevel = useArgusStore((s) => s.threatLevel);
  const campaignCount = useArgusStore((s) => s.campaignCount);
  const threatVelocity = useArgusStore((s) => s.threatVelocity);
  const redAgentRunning = useArgusStore((s) => s.redAgentRunning);
  const loading = useArgusStore((s) => s.loading);

  const campaignWsAlert = useArgusStore((s) => s.campaignWsAlert);
  const showAlert = useArgusStore((s) => s.showAlert);
  const alertMsg = useArgusStore((s) => s.alertMsg);
  const alertHistory = useArgusStore((s) => s.alertHistory);
  const showAlertHistory = useArgusStore((s) => s.showAlertHistory);
  const lastPatch = useArgusStore((s) => s.lastPatch);
  const showPatch = useArgusStore((s) => s.showPatch);
  const toggleAlertHistory = useArgusStore((s) => s.toggleAlertHistory);

  const blockRate = total > 0 ? Math.round((blocked / total) * 100) : 100;
  const sophAvg = sophHistory.length
    ? +(sophHistory.reduce((a, b) => a + b, 0) / sophHistory.length).toFixed(1)
    : 0;
  const sophTrend = sophHistory.length >= 6
    ? +(
        sophHistory.slice(-3).reduce((a, b) => a + b, 0) / 3 -
        sophHistory.slice(-6, -3).reduce((a, b) => a + b, 0) / 3
      ).toFixed(1)
    : 0;

  const canvasAttacks = useMemo(
    () => attacks.slice(0, 30),
    [attacks.length],
  );

  const effectiveShowAlert = campaignWsAlert ? true : showAlert;
  const effectiveAlertMsg = campaignWsAlert
    ? `CAMPAIGN DETECTED: ${campaignWsAlert.pattern} · ${campaignWsAlert.eventCount} events from ${campaignWsAlert.sourceCount} unique sources`
    : alertMsg;

  return (
    <div
      className="bg-argus-bg text-argus-text font-body h-full flex flex-col overflow-hidden relative"
      role="application"
      aria-label="ARGUS-X Defense Command Center"
    >
      <CampaignAlert
        showAlert={effectiveShowAlert}
        alertMsg={effectiveAlertMsg}
        alertHistory={alertHistory}
        showAlertHistory={showAlertHistory}
        onToggleHistory={toggleAlertHistory}
      />

      <PatchBanner patch={lastPatch} visible={showPatch} />

      {/* ── HEADER ── */}
      <div className="h-[56px] shrink-0 bg-argus-panel border-b border-argus-border flex items-center justify-between px-6 gap-4 flex-wrap z-10 shadow-[0_1px_3px_rgba(15,28,46,0.03)]">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22S4 17.5 4 11V5l8-3 8 3v6c0 6.5-8 11-8 11z" stroke="#1A73E8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 8v4l3 2" stroke="#1A73E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div>
            <div className="font-display text-[16px] font-black text-argus-text tracking-tight flex items-baseline">
              ARGUS<span className="text-argus-blue">-X</span>
            </div>
            <div className="font-mono text-[9px] text-argus-muted tracking-widest leading-none mt-[2px]">
              DEFENSE COMMAND CENTER
            </div>
          </div>
        </div>

        {/* Center stats */}
        <div className="flex gap-2 flex-wrap flex-1 justify-center">
          {[
            { label: 'BLOCKED', val: blocked, color: '#0D9B8A' },
            { label: 'PRE-BLOCKED', val: muts, color: '#7C3AED' },
            { label: 'BYPASSES', val: bypasses, color: '#DC2626' },
            { label: 'DEFENSE RATE', val: `${blockRate}%`, color: '#16A34A' },
            { label: 'AVG SOPH', val: `${sophAvg}/10`, color: sophAvg > 6 ? '#DC2626' : sophAvg > 4 ? '#D97706' : '#16A34A' },
            { label: 'CAMPAIGNS', val: campaignCount, color: '#D97706' },
          ].map((s) => (
            <div key={s.label} className="bg-argus-bg border border-argus-border rounded-[20px] px-3 py-1 flex justify-between items-center gap-3">
              <span className="font-display text-[22px] font-bold leading-none translate-y-[1px]" style={{ color: s.color }}>{s.val}</span>
              <span className="font-mono text-[9px] text-argus-muted uppercase tracking-wider leading-none mt-[2px]">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Status pills */}
        <div className="flex gap-3" role="status" aria-live="polite">
          {[
            connected
              ? { color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC', label: 'ARGUS ONLINE', fast: false }
              : { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', label: 'RECONNECTING…', fast: true },
            redAgentRunning
              ? { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', label: 'RED AGENT LIVE', fast: true }
              : { color: '#6B8BA4', bg: '#F0F4F8', border: '#D1DCE8', label: 'RED AGENT IDLE', fast: false },
          ].map((p) => (
            <div
              key={p.label}
              aria-label={p.label}
              className="flex items-center gap-2 py-1 px-3 rounded-[20px] font-mono text-[10px] font-medium transition-colors duration-300"
              style={{
                background: p.bg,
                border: `1px solid ${p.border}`,
                color: p.color,
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: p.color,
                  animation: p.fast ? 'pulse 0.9s ease-in-out infinite' : 'pulse 1.8s ease-in-out infinite',
                }}
              />
              <span className="translate-y-[1px]">{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="argus-grid grid gap-3 p-3 flex-1 overflow-hidden min-h-0 bg-argus-bg">
        {/* ── LEFT: Live Feed ── */}
        <div className="bg-argus-panel flex flex-col overflow-hidden row-span-2 rounded-[10px] shadow-[0_1px_3px_rgba(15,28,46,0.08),0_4px_12px_rgba(15,28,46,0.04)]">
          <div className="px-4 py-3 border-b border-argus-input shrink-0 flex items-center">
            <span className="inline-block w-[3px] h-[14px] bg-argus-teal mr-2"></span>
            <div className="font-mono text-[11px] font-medium tracking-[0.12em] text-argus-secondary uppercase flex flex-1 justify-between items-center">
              LIVE THREAT FEED
              {lastUpdated && (
                <span className="text-[10px] text-argus-dim tracking-normal lowercase">
                  last: {lastUpdated.toLocaleTimeString('en-US', { hour12: false })}
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {attacks.length === 0 ? (
              <div className="font-mono text-[11px] text-argus-dim text-center py-6">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-argus-border border-t-argus-blue rounded-full animate-spin mx-auto mb-3" />
                    Connecting to live feed…
                  </>
                ) : (
                  'Waiting for events…'
                )}
              </div>
            ) : (
              attacks.slice(0, 25).map((a) => <FeedItem key={a.id} attack={a} />)
            )}
          </div>
        </div>

        {/* ── CENTER TOP: Neural Map + XAI ── */}
        <div className="grid grid-cols-2 gap-3 overflow-hidden">
          {/* Neural Threat Map */}
          <div className="bg-argus-panel flex flex-col overflow-hidden rounded-[10px] shadow-[0_1px_3px_rgba(15,28,46,0.08),0_4px_12px_rgba(15,28,46,0.04)]">
            <div className="px-4 py-3 border-b border-argus-input shrink-0 flex items-center">
              <span className="inline-block w-[3px] h-[14px] bg-argus-purple mr-2"></span>
              <div className="font-mono text-[11px] font-medium tracking-[0.12em] text-argus-secondary uppercase">
                NEURAL THREAT MAP · LIVE
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center p-3 overflow-hidden bg-argus-bg m-3 mb-4 rounded-[8px] border border-argus-input">
              <ErrorBoundary label="NEURAL THREAT MAP">
                <NeuralCanvas attacks={canvasAttacks} />
              </ErrorBoundary>
            </div>
          </div>

          {/* XAI Decision Stream */}
          <div className="bg-argus-panel flex flex-col overflow-hidden rounded-[10px] shadow-[0_1px_3px_rgba(15,28,46,0.08),0_4px_12px_rgba(15,28,46,0.04)]">
            <div className="px-4 py-3 border-b border-argus-input shrink-0 flex items-center">
              <span className="inline-block w-[3px] h-[14px] bg-argus-purple mr-2"></span>
              <div className="font-mono text-[11px] font-medium tracking-[0.12em] text-argus-secondary uppercase">
                EXPLAINABLE AI · DECISION STREAM
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {attacks.slice(0, 8).filter((a) => a.blocked).map((a) => (
                <div key={a.id} className="flex flex-col gap-2">
                  <XAICard attack={a} />
                  <FingerprintCard attack={a} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Analytics ── */}
        <div className="bg-argus-panel flex flex-col overflow-hidden row-span-2 rounded-[10px] shadow-[0_1px_3px_rgba(15,28,46,0.08),0_4px_12px_rgba(15,28,46,0.04)]">
          <div className="px-4 py-3 border-b border-argus-input shrink-0 flex items-center">
            <span className="inline-block w-[3px] h-[14px] bg-argus-blue mr-2"></span>
            <div className="font-mono text-[11px] font-medium tracking-[0.12em] text-argus-secondary uppercase">
              ANALYTICS & REPORTS
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {/* Threat level */}
            <div className="bg-argus-panel border border-argus-border rounded-[10px] px-4 py-3">
              <ThreatLevelBar level={Math.round(threatLevel)} />
            </div>

            {/* Soph trend */}
            <div className="bg-argus-panel border border-argus-border rounded-[10px] px-4 py-3">
              <div className="font-mono text-[11px] text-argus-secondary font-medium tracking-[0.12em] mb-2 flex items-center border-b border-argus-input pb-1">
                <span className="inline-block w-[3px] h-[14px] bg-argus-blue mr-2"></span>SOPHISTICATION TREND
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-display text-[28px] font-bold" style={{ color: sophAvg > 6 ? '#DC2626' : sophAvg > 4 ? '#D97706' : '#16A34A' }}>{sophAvg}</span>
                <span className="font-mono text-[11px] font-medium" style={{ color: sophTrend > 0 ? '#DC2626' : '#16A34A' }}>
                  {sophTrend > 0 ? `↑ +${sophTrend}` : `↓ ${sophTrend}`}
                </span>
              </div>
              <Sparkline data={sophHistory} color={sophAvg > 6 ? '#DC2626' : sophAvg > 4 ? '#D97706' : '#16A34A'} height={44} />
              <div className="font-mono text-[10px] text-argus-muted mt-2 font-medium">
                {sophTrend > 0.5 ? '⚠ ESCALATING — tighten thresholds' : sophTrend < -0.5 ? '✓ DECLINING — defense working' : '— STABLE'}
              </div>
            </div>

            {/* Latency */}
            <div className="bg-argus-panel border border-argus-border rounded-[10px] px-4 py-3">
              <div className="font-mono text-[11px] text-argus-secondary font-medium tracking-[0.12em] mb-3 flex items-center border-b border-argus-input pb-1">
                <span className="inline-block w-[3px] h-[14px] bg-argus-blue mr-2"></span>RESPONSE LATENCY (MS)
              </div>
              <Sparkline data={latHistory} color="#1A73E8" height={44} />
              <div className="font-mono text-[10px] text-argus-muted mt-2 font-medium flex justify-between">
                <span>avg {latHistory.length ? Math.round(latHistory.reduce((a, b) => a + b, 0) / latHistory.length) : 0}ms</span>
                <span>p99 {latHistory.length ? Math.round(Math.max(...latHistory)) : 0}ms</span>
              </div>
            </div>

            {/* AI Battle */}
            <div className="bg-argus-panel border border-argus-border rounded-[10px] px-4 py-3">
              <ErrorBoundary label="AI BATTLE">
                <BattleStatus redAtks={total} blueBlocks={blocked} redBypasses={bypasses} tier={tier} />
              </ErrorBoundary>
            </div>

            {/* Cluster map */}
            <div className="bg-argus-panel border border-argus-border rounded-[10px] px-4 py-3">
              <div className="font-mono text-[11px] text-argus-secondary font-medium tracking-[0.12em] mb-2 flex items-center border-b border-argus-input pb-1">
                <span className="inline-block w-[3px] h-[14px] bg-argus-blue mr-2"></span>THREAT CLUSTERS
              </div>
              <ErrorBoundary label="THREAT CLUSTERS">
                <div className="border border-argus-input rounded-[8px] overflow-hidden mt-2 mb-2 p-1 relative">
                  <MiniClusterMap attacks={canvasAttacks} />
                </div>
              </ErrorBoundary>
              <div className="font-mono text-[10px] text-argus-muted mt-1 font-medium">
                {Object.keys(THREAT_COLORS).length} cluster families active
              </div>
            </div>

            {/* Mutation counter */}
            <div className="bg-argus-panel border border-argus-border rounded-[10px] px-4 py-3">
              <div className="font-mono text-[11px] text-argus-secondary font-medium tracking-[0.12em] mb-1 flex items-center border-b border-argus-input pb-1">
                <span className="inline-block w-[3px] h-[14px] bg-argus-purple mr-2"></span>MUTATION ENGINE
              </div>
              <div className="font-display text-[28px] font-bold text-argus-purple leading-none mt-2">{muts}</div>
              <div className="font-mono text-[10px] text-argus-muted mt-2 font-medium">variants pre-blocked · zero human input</div>
            </div>

            {/* Self-healing history */}
            <ErrorBoundary label="BYPASS HISTORY">
              <BypassHistory />
            </ErrorBoundary>

            {/* Compliance export */}
            <ErrorBoundary label="COMPLIANCE EXPORT">
              <ComplianceExport />
            </ErrorBoundary>
          </div>
        </div>

        {/* ── BOTTOM: Attack Velocity Timeline + Defense Log ── */}
        <div className="grid grid-cols-2 gap-3 overflow-hidden">
          {/* Attack Velocity Timeline */}
          <div className="bg-argus-panel flex flex-col overflow-hidden rounded-[10px] shadow-[0_1px_3px_rgba(15,28,46,0.08),0_4px_12px_rgba(15,28,46,0.04)]">
            <div className="px-4 py-3 border-b border-argus-input shrink-0 flex items-center">
              <span className="inline-block w-[3px] h-[14px] bg-argus-red mr-2"></span>
              <div className="font-mono text-[11px] font-medium tracking-[0.12em] text-argus-secondary uppercase">
                ATTACK VELOCITY · 5MIN
              </div>
            </div>
            <div className="flex-1 p-4 overflow-hidden flex items-center pb-8 pt-6">
              <ErrorBoundary label="ATTACK TIMELINE">
                <AttackTimeline velocity={threatVelocity} />
              </ErrorBoundary>
            </div>
          </div>
          {/* Defense Log */}
          <div className="bg-argus-panel rounded-[10px] shadow-[0_1px_3px_rgba(15,28,46,0.08),0_4px_12px_rgba(15,28,46,0.04)] overflow-hidden">
            <DefenseLog entries={defenseLog} />
          </div>
        </div>
      </div>
    </div>
  );
}
