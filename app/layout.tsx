import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { PermissionInitializer } from "@/components/PermissionInitializer";
import { AuthLayout } from "@/components/AuthLayout";
import { AuthRestore } from "@/components/AuthRestore";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MR English Admin Panel",
  description: "Admin panel for MR English application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AuthRestore />
          <PermissionInitializer />
          <AuthLayout>{children}</AuthLayout>
        </Providers>
      </body>
    </html>
  );
}

