import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AuthStatus } from "@/components/auth/auth-status";
import { SiteFooter } from "@/components/site-footer";
import { getAuthContext } from "@/lib/auth";

export const metadata: Metadata = {
  title: "CortexRate",
  description: "Community ratings for Neural DSP Cortex Cloud captures and presets."
};

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const authContext = await getAuthContext();

  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <AuthStatus isAuthenticated={Boolean(authContext)} />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
