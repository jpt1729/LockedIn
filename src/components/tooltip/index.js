"use client";
import { useState, useRef } from "react";
import { useId } from "react"; // For generating unique IDs
export default function ToolTip({
  children,
  tooltip,
  delay,
  disabled = false,
  ...props
}) {
  const [mouseOver, setMouseOver] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const tooltipId = useId(); // Unique ID for aria-describedby
  const timeoutRef = useRef(null);
  
  const handleMouseMove = (e) => {
    if (disabled) return;
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const showTooltip = () => {
    if (disabled) return;
    console.log('showing tool tip soon')
    timeoutRef.current = setTimeout(() => {
      setMouseOver(true);
    }, delay || 0);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setMouseOver(false);
  };

  return (
    <div
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onMouseMove={handleMouseMove}
      onFocus={showTooltip} // For keyboard users
      onBlur={hideTooltip} // For keyboard users
      className={`relative ${props.className && props.className}`}
      aria-describedby={!disabled ? tooltipId : undefined} // Describes the tooltip content for screen readers
      {...props}
    >
      {children}
      {!disabled && mouseOver && (
        <span
          id={tooltipId} // Links the tooltip with the element using aria-describedby
          role="tooltip" // Identifies the element as a tooltip
          style={{
            top: mousePosition.y + 10,
            left: mousePosition.x + 10,
          }}
          className="z-50 fixed pointer-events-none bg-off-black px-2 py-1 text-off-white bg-black/70 rounded"
          aria-live="polite" // Ensures the tooltip is announced by screen readers when it appears
        >
          {tooltip}
        </span>
      )}
    </div>
  );
}
