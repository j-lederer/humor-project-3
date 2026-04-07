"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ThemeToggle from "./components/ThemeToggle";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/flavors", label: "Humor Flavors" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-gray-50 dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 p-4 flex flex-col">
        <h2 className="text-lg font-bold mb-6 px-2">Prompt Chain Tool</h2>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-lg transition-colors text-sm ${
                pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-slate-700">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm text-left hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
