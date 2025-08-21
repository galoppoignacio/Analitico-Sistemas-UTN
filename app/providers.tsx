"use client";
import { ReactNode } from "react";
import { ZustandProvider } from "./zustandProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return <ZustandProvider>{children}</ZustandProvider>;
}
