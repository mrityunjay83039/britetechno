'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateMaintenanceMode } from '@/app/actions/admin';
import { ShieldAlert, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface MaintenanceToggleProps {
  initialEnabled: boolean;
}

export default function MaintenanceToggle({ initialEnabled }: MaintenanceToggleProps) {
  const router = useRouter();
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleToggle = (checked: boolean) => {
    // Optimistic update
    setIsEnabled(checked);
    setStatusMessage(null);

    startTransition(async () => {
      try {
        const response = await updateMaintenanceMode(checked);
        if (response.success) {
          setStatusMessage({
            type: 'success',
            text: checked
              ? 'Maintenance Mode is now active. Standard visitors will be blocked.'
              : 'Maintenance Mode has been deactivated. The storefront is live!',
          });
          router.refresh();
        } else {
          setIsEnabled(!checked); // revert
          setStatusMessage({
            type: 'error',
            text: response.error || 'Failed to update maintenance settings.',
          });
        }
      } catch {
        setIsEnabled(!checked); // revert
        setStatusMessage({
          type: 'error',
          text: 'An unexpected error occurred while saving.',
        });
      }
    });
  };

  return (
    <div className="bg-white p-6 rounded-sm border border-[#1E3A8A]/15 shadow-xs max-w-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-sans text-lg font-bold text-[#1E3A8A]">
              Global Maintenance Mode
            </h3>
            {isPending && (
              <RefreshCw className="w-4 h-4 text-[#1E3A8A] animate-spin" />
            )}
          </div>
          <p className="font-sans text-xs text-[#64748B] leading-relaxed">
            Activating maintenance mode will immediately block access to the public storefront, displaying a branded landing page to visitors. Logged-in administrators will bypass this restriction to continue browsing and testing.
          </p>
        </div>

        {/* Custom Premium Toggle Switch */}
        <div className="flex items-center shrink-0">
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isEnabled}
              disabled={isPending}
              onChange={(e) => handleToggle(e.target.checked)}
            />
            <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1E3A8A] disabled:opacity-50"></div>
          </label>
        </div>
      </div>

      {/* Dynamic Status / Alerts */}
      <div className="mt-5 space-y-3">
        {/* Current status indicator banner */}
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-sm border text-xs font-sans font-medium transition-colors duration-300 ${
            isEnabled
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-green-50 border-green-200 text-green-800'
          }`}
        >
          {isEnabled ? (
            <>
              <ShieldAlert className="w-4.5 h-4.5 shrink-0 text-amber-600" />
              <div>
                <p className="font-bold">Storefront is in MAINTENANCE Mode</p>
                <p className="text-[10px] text-amber-700/80 font-normal mt-0.5">
                  Only Admins can bypass and view the storefront. Public visitors see the maintenance page.
                </p>
              </div>
            </>
          ) : (
            <>
              <CheckCircle className="w-4.5 h-4.5 shrink-0 text-green-600" />
              <div>
                <p className="font-bold">Storefront is LIVE</p>
                <p className="text-[10px] text-green-700/80 font-normal mt-0.5">
                  The website is fully accessible to the general public.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Temporary Notification Alert */}
        {statusMessage && (
          <div
            className={`flex items-start gap-2 px-4 py-2.5 rounded-sm text-[11px] font-sans font-medium ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                : 'bg-rose-50 text-rose-800 border border-rose-100'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}
