"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { PageTransition } from "@/components/ui/page-transition";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  // We'll manage the sidebar collapse state here and pass it via context if needed,
  // but since we extracted Sidebar, it's actually better if Sidebar has the state 
  // and we just use CSS or a store. For simplicity and robustness, we can manage 
  // it here and pass it down as props, OR we can let Sidebar manage it and use 
  // a fixed sidebar layout with CSS margin `ml-[72px] md:ml-[260px]`.
  
  // Let's use CSS to handle responsiveness so we don't have to prop-drill heavily.
  // We'll add a 'sidebar-expanded' or 'sidebar-collapsed' class to the body/wrapper.
  
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main
        className="flex-1 transition-all duration-300 flex flex-col"
        style={{ marginLeft: collapsed ? 72 : 260 }}
      >
        <TopBar />
        <div className="flex-1">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>
    </div>
  );
}
