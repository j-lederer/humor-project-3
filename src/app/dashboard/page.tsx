import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [flavors, steps, captions] = await Promise.all([
    supabase.from("humor_flavors").select("id", { count: "exact", head: true }),
    supabase.from("humor_flavor_steps").select("id", { count: "exact", head: true }),
    supabase.from("captions").select("id", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Humor Flavors", count: flavors.count ?? 0, color: "blue" },
    { label: "Total Steps", count: steps.count ?? 0, color: "green" },
    { label: "Total Captions", count: captions.count ?? 0, color: "purple" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="p-6 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800"
          >
            <p className="text-sm text-gray-500 dark:text-slate-400">{s.label}</p>
            <p className="text-3xl font-bold mt-1">{s.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
