import type { Metadata } from "next";
import ConvexClerkProvider from "@/components/ConvexClerkProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "SWIS — Student Workload Intelligence System",
  description: "Track assignments, log study sessions, and get insights into your academic workload.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <ConvexClerkProvider>
          {children}
        </ConvexClerkProvider>
      </body>
    </html>
  );
}

