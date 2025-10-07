"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";

export default function HeaderClient() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <Header />;
}
