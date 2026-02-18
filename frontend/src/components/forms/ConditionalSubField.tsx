'use client';

import { useRef, useEffect, useState } from 'react';

interface ConditionalSubFieldProps {
  /** Which chip value triggers this sub-field (informational, not used for logic) */
  parentChipValue?: string;
  /** Whether the sub-field is visible */
  visible: boolean;
  /** Inner content (chips, input, etc.) */
  children: React.ReactNode;
  /** Optional sub-field label */
  label?: string;
}

export function ConditionalSubField({
  visible,
  children,
  label,
}: ConditionalSubFieldProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [shouldRender, setShouldRender] = useState(visible);

  // Keep content in DOM during exit animation
  useEffect(() => {
    if (visible) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  // Measure content height for animation
  useEffect(() => {
    if (visible && contentRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        if (contentRef.current) {
          setHeight(contentRef.current.scrollHeight);
        }
      });
      resizeObserver.observe(contentRef.current);
      // Initial measurement
      setHeight(contentRef.current.scrollHeight);
      return () => resizeObserver.disconnect();
    }
  }, [visible, shouldRender]);

  if (!shouldRender && !visible) return null;

  return (
    <div
      className="overflow-hidden transition-all duration-200 ease-out"
      style={{
        height: visible ? (height ? `${height}px` : 'auto') : 0,
        opacity: visible ? 1 : 0,
      }}
    >
      <div
        ref={contentRef}
        className="ml-4 pl-4 border-l-2 border-[#1F2937] bg-brand-900/50 rounded-r py-3 pr-3 mt-2"
      >
        {label && (
          <label className="text-[13px] font-medium text-[#94A3B8] mb-2 block">
            {label}
          </label>
        )}
        {children}
      </div>
    </div>
  );
}
