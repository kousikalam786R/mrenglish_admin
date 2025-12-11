import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - MR English Admin",
  description: "Admin login page",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

