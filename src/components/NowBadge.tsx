"use client";

import { Clock } from "lucide-react";

function mins(h: number, m: number) {
  return h * 60 + m;
}

export default function NowBadge() {
  const now = new Date();
  const dow = now.getDay();
  const t = now.getHours() * 60 + now.getMinutes();

  const weekday = dow >= 1 && dow <= 5;
  const open = weekday && t >= mins(7, 30) && t <= mins(18, 0);

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium",
        open
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-gray-100 text-gray-700 ring-1 ring-gray-200",
      ].join(" ")}
      aria-live="polite"
    >
      <Clock className="h-4 w-4" />
      {open ? "Aberto agora" : "Fechado no momento"}
    </span>
  );
}
