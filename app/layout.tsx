import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Pilot Station Time",
  description: "Cloud live-sync roster for pilots",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
