import type { Metadata } from "next";
import "../globals.css";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Lexend } from "next/font/google"

const lexend = Lexend({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Grammar UP",
  description: "Your personal English grammar tutor",
};

export default function WithSidebarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${lexend.className} antialiased`}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="min-h-dvh flex flex-col min-w-0">
            <div className="md:hidden p-2">
              <SidebarTrigger />
            </div>
            <main className="flex-1 min-w-0">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}