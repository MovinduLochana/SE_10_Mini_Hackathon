import { Sidebar } from "@/components/app-shell/sidebar";
import { TopBar } from "@/components/app-shell/top-bar";
import { getShopInfo } from "@/lib/mock-data";

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const shop = getShopInfo();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar shop={shop} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar shop={shop} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
