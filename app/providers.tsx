"use client";
import { ReactNode } from "react";

import { ZustandProvider } from "./zustandProvider";
import { AuthProvider } from "./authContext";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ZustandProvider>{children}</ZustandProvider>
    </AuthProvider>
  );
}
