"use client";

import React, { useRef, useEffect, useState } from "react";

interface OtpCodeInputProps {
  value: string;
  onChange: (code: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function OtpCodeInput({
  value,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = true,
}: OtpCodeInputProps) {
  const [digits, setDigits] = useState<string[]>(() => {
    const arr = value.split("").slice(0, 6);
    while (arr.length < 6) arr.push("");
    return arr;
  });

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const arr = value.split("").slice(0, 6);
    while (arr.length < 6) arr.push("");
    setDigits(arr);
  }, [value]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus, disabled]);

  const handleChange = (index: number, rawVal: string) => {
    const clean = rawVal.replace(/[^0-9]/g, "");

    // Handle paste of multiple numbers
    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split("");
      const newDigits = [...digits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = chars[i] || "";
      }
      setDigits(newDigits);
      const combined = newDigits.join("");
      onChange(combined);
      if (combined.length === 6 && onComplete) {
        onComplete(combined);
      }
      const targetFocus = Math.min(clean.length, 5);
      inputRefs.current[targetFocus]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = clean;
    setDigits(newDigits);

    const combined = newDigits.join("");
    onChange(combined);

    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (clean && combined.length === 6 && onComplete) {
      onComplete(combined);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (!pasted) return;

    const chars = pasted.split("");
    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = chars[i] || "";
    }
    setDigits(newDigits);
    const combined = newDigits.join("");
    onChange(combined);

    if (combined.length === 6 && onComplete) {
      onComplete(combined);
    }
    const targetFocus = Math.min(pasted.length, 5);
    inputRefs.current[targetFocus]?.focus();
  };

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3 max-w-sm mx-auto">
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputRefs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-extrabold font-mono rounded-xl bg-pitch-card border transition-all outline-none ${
            digit
              ? "border-emerald-500 text-white bg-emerald-950/20 shadow-md shadow-emerald-950/40"
              : "border-pitch-border text-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        />
      ))}
    </div>
  );
}
