'use client';

import { Printer } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

interface PrintButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

export default function PrintButton({
  className = "",
  label = "Imprimir",
  onClick,
  ...props
}: PrintButtonProps) {
  return (
    <button
      type="button"
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          window.print();
        }
      }}
      className={`hidden sm:inline-flex btn btn-primary print:hidden ${className}`.trim()}
    >
      <Printer className="mr-2 h-4 w-4" />
      {label}
    </button>
  );
}
