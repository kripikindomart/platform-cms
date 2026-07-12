'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export interface OTPTemplateProps {
  onSubmit?: (otp: string) => void;
  onResend?: () => void;
  isLoading?: boolean;
  phoneNumber?: string;
}

export function OTPTemplate({ onSubmit, onResend, isLoading = false, phoneNumber = '+62 812-3456-7890' }: OTPTemplateProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== '') && newOtp.join('').length === 6) {
      onSubmit?.(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(newOtp);
    if (pastedData.length === 6) {
      onSubmit?.(pastedData);
    }
  };

  const handleResend = () => {
    setCountdown(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    onResend?.();
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="p-8 bg-white rounded-2xl border border-neutral-200 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6">
            <Shield className="w-7 h-7 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Enter verification code</h2>
          <p className="text-neutral-600 mb-8">
            We've sent a 6-digit code to <span className="font-semibold text-neutral-900">{phoneNumber}</span>
          </p>

          {/* OTP Input */}
          <div className="flex gap-3 mb-6" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading}
                className="w-full h-14 text-center text-2xl font-bold rounded-xl border-2 border-neutral-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            ))}
          </div>

          {/* Resend */}
          <div className="text-center mb-6">
            {canResend ? (
              <button onClick={handleResend} className="text-sm text-violet-600 hover:text-violet-700 font-semibold">
                Resend code
              </button>
            ) : (
              <p className="text-sm text-neutral-500">
                Resend code in <span className="font-semibold text-neutral-700">{countdown}s</span>
              </p>
            )}
          </div>

          {/* Submit */}
          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-sm text-neutral-600 mb-4">
              <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
              <span>Verifying...</span>
            </div>
          )}

          {/* Back */}
          <Link href="/dashboard/auth/login" className="flex items-center justify-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to login</span>
          </Link>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-500">
            Didn't receive the code? <a href="#" className="text-violet-600 hover:text-violet-700 font-semibold">Contact support</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
