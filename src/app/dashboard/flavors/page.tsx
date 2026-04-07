import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function FlavorsPage() {
  const supabase = await createClient();
  const { data: flavors, error } = await supabase
    .from("humor_flavors")
    .select("*, humor_flavor_steps(id)")
    .order("id");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Humor Flavors</h1>
        <Link
          href="/dashboard/flavors/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Flavor
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-500/20 border border-red-400 rounded-lg text-red-700 dark:text-red-300">
          Error: {error.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flavors?.map((flavor) => (
          <Link
            key={flavor.id}
            href={`/dashboard/flavors/${flavor.id}`}
            className="block p-5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg">{flavor.slug || `Flavor #${flavor.id}`}</h3>
              <span className="text-xs bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                {flavor.humor_flavor_steps?.length ?? 0} steps
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-2">
              {flavor.description || "No description"}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-3">
              ID: {flavor.id}
            </p>
          </Link>
        ))}
      </div>

      {(!flavors || flavors.length === 0) && (
        <div className="text-center py-12 text-gray-400 dark:text-slate-500">
          No humor flavors yet. Create your first one!
        </div>
      )}
    </div>
  );
}
