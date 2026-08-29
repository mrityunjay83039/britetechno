'use client';

import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { RefreshCw, ShieldCheck, ShieldAlert } from 'lucide-react';

export interface CaptchaHandle {
  validate: () => boolean;
  refresh: () => void;
  getAnswer: () => string;
  getUserInput: () => string;
}

interface CaptchaChallengeProps {
  onVerifyStatusChange?: (isValid: boolean) => void;
  className?: string;
}

const CaptchaChallenge = forwardRef<CaptchaHandle, CaptchaChallengeProps>(
  ({ onVerifyStatusChange, className = '' }, ref) => {
    const [num1, setNum1] = useState(0);
    const [num2, setNum2] = useState(0);
    const [operator, setOperator] = useState<'+' | 'x'>('+');
    const [userInput, setUserInput] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const generateChallenge = useCallback(() => {
      const isMultiplication = Math.random() > 0.5;
      if (isMultiplication) {
        const n1 = Math.floor(Math.random() * 9) + 2; // 2 to 10
        const n2 = Math.floor(Math.random() * 8) + 2; // 2 to 9
        setNum1(n1);
        setNum2(n2);
        setOperator('x');
      } else {
        const n1 = Math.floor(Math.random() * 40) + 10; // 10 to 49
        const n2 = Math.floor(Math.random() * 40) + 5;  // 5 to 44
        setNum1(n1);
        setNum2(n2);
        setOperator('+');
      }
      setUserInput('');
      setStatus('idle');
      if (onVerifyStatusChange) onVerifyStatusChange(false);
    }, [onVerifyStatusChange]);

    useEffect(() => {
      generateChallenge();
    }, [generateChallenge]);

    const getExpectedResult = useCallback(() => {
      return operator === '+' ? num1 + num2 : num1 * num2;
    }, [num1, num2, operator]);

    const handleInputChange = (val: string) => {
      setUserInput(val);
      const expected = getExpectedResult();
      if (parseInt(val.trim(), 10) === expected) {
        setStatus('success');
        if (onVerifyStatusChange) onVerifyStatusChange(true);
      } else {
        setStatus(val.trim() === '' ? 'idle' : 'error');
        if (onVerifyStatusChange) onVerifyStatusChange(false);
      }
    };

    useImperativeHandle(ref, () => ({
      validate: () => {
        const expected = getExpectedResult();
        const isValid = parseInt(userInput.trim(), 10) === expected;
        setStatus(isValid ? 'success' : 'error');
        return isValid;
      },
      refresh: generateChallenge,
      getAnswer: () => getExpectedResult().toString(),
      getUserInput: () => userInput.trim(),
    }));

    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between">
          <label className="font-sans text-xs font-bold text-[#0066B4] uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0066B4]" />
            Security Captcha <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={generateChallenge}
            className="inline-flex items-center gap-1 text-[11px] font-sans text-slate-500 hover:text-[#0066B4] transition-colors cursor-pointer font-medium"
            title="Refresh CAPTCHA"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Captcha Visual Challenge Display */}
          <div className="relative flex items-center justify-center bg-slate-900 text-[#0066B4] font-sans text-lg font-bold tracking-widest px-4 py-2 rounded-lg border border-[#0066B4]/40 select-none shadow-inner min-w-[130px] h-10 overflow-hidden">
            {/* Visual background noise lines */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#0066B4_1px,transparent_1px)] [background-size:8px_8px]" />
            <span className="relative z-10 font-mono tracking-wider text-base text-[#0066B4]">
              {num1} {operator} {num2} = ?
            </span>
          </div>

          {/* Input Field */}
          <div className="relative flex-1">
            <input
              type="number"
              required
              value={userInput}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Answer"
              className={`w-full px-3 py-2 bg-white border text-sm font-sans font-bold text-[#0F172A] outline-none rounded-lg transition-all placeholder-slate-400 ${
                status === 'success'
                  ? 'border-emerald-500 ring-1 ring-emerald-500 text-emerald-950 bg-emerald-50/50'
                  : status === 'error'
                  ? 'border-red-400 ring-1 ring-red-400 text-red-950 bg-red-50/50'
                  : 'border-slate-300 focus:border-[#0066B4] focus:ring-1 focus:ring-[#0066B4]'
              }`}
            />
          </div>
        </div>

        {status === 'error' && (
          <p className="font-sans text-[11px] text-red-600 flex items-center gap-1 mt-1 font-medium">
            <ShieldAlert className="w-3 h-3" />
            Incorrect answer. Please solve the math captcha to proceed.
          </p>
        )}
      </div>
    );
  }
);

CaptchaChallenge.displayName = 'CaptchaChallenge';

export default CaptchaChallenge;
