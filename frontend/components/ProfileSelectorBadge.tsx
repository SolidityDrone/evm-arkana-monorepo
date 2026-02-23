'use client';

/**
 * ProfileSelectorBadge — compact indicator of the active profile for use on pages.
 * Shows current profile name and allows switching. Used in deposit/withdraw/send/rituals pages.
 */
import * as React from 'react';
import { ChevronDown, Key, Shield, Users } from 'lucide-react';
import { useActiveProfile } from '@/context/ActiveProfileProvider';
import { useZkAddress } from '@/context/AccountProvider';

interface Props {
  /** Extra className for the container */
  className?: string;
}

export function ProfileSelectorBadge({ className = '' }: Props) {
  const {
    activeProfileId,
    activeMultisigProfile,
    availableMultisigs,
    switchProfile,
  } = useActiveProfile();
  const zkAddress = useZkAddress();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isMain = activeProfileId === 'main';
  const label = isMain
    ? 'Main Account'
    : (activeMultisigProfile?.name ?? 'Multisig');
  const hasMultisigs = availableMultisigs.length > 0;

  if (!zkAddress) return null;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(v => !v)}
        className="
          inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
          border border-white/[0.08] bg-white/[0.04]
          text-xs text-white/60 hover:text-white/90
          hover:bg-white/[0.07] hover:border-white/[0.15]
          transition-all duration-150 group
        "
      >
        {isMain ? (
          activeMultisigProfile === null && <Key className="w-3 h-3 text-violet-400/60" />
        ) : (
          <Users className="w-3 h-3 text-sky-400/60" />
        )}
        <span className="font-mono">{label}</span>
        {isMain && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300/70 font-medium border border-violet-500/20">
            Main
          </span>
        )}
        {!isMain && activeMultisigProfile && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sky-500/15 text-sky-300/70 font-medium border border-sky-500/20">
            {activeMultisigProfile.threshold}-of-{activeMultisigProfile.maxSigners}
          </span>
        )}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="
          absolute left-0 top-full mt-1 z-50
          min-w-[200px] rounded-xl border border-white/[0.08] bg-background/95
          backdrop-blur-md shadow-xl overflow-hidden
        ">
          {/* Main account option */}
          <button
            onClick={() => { switchProfile('main'); setOpen(false); }}
            className={`
              w-full flex items-center gap-2 px-3 py-2.5 text-left text-xs transition-colors
              hover:bg-white/[0.06]
              ${isMain ? 'bg-violet-500/10 text-white/90' : 'text-white/60'}
            `}
          >
            <Key className="w-3 h-3 text-violet-400/60 shrink-0" />
            <span className="flex-1">Main Account</span>
            {isMain && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300/70">active</span>
            )}
          </button>

          {availableMultisigs.length > 0 && (
            <div className="border-t border-white/[0.06]">
              <p className="px-3 py-1.5 text-[9px] uppercase tracking-widest text-white/25 font-semibold">
                Multisig
              </p>
              {availableMultisigs.map(ms => {
                const isActive = activeProfileId === ms.profileId;
                return (
                  <button
                    key={ms.profileId}
                    onClick={() => { switchProfile(ms.profileId); setOpen(false); }}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2.5 text-left text-xs transition-colors
                      hover:bg-white/[0.06]
                      ${isActive ? 'bg-sky-500/10 text-white/90' : 'text-white/60'}
                    `}
                  >
                    <Users className="w-3 h-3 text-sky-400/60 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{ms.name}</p>
                      <p className="text-[9px] text-white/30">{ms.threshold}-of-{ms.maxSigners} · {ms.role}</p>
                    </div>
                    {isActive && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300/70">active</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {!hasMultisigs && (
            <div className="border-t border-white/[0.06] px-3 py-2.5">
              <p className="text-[10px] text-white/30 italic">
                No multisig profiles yet. Add one via Account.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
