import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import FlavorDetail from "./FlavorDetail";

export default async function FlavorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [flavorRes, stepsRes, modelsRes, captionsRes] = await Promise.all([
    supabase.from("humor_flavors").select("*").eq("id", id).single(),
    supabase.from("humor_flavor_steps").select("*").eq("humor_flavor_id", id).order("order_by"),
    supabase.from("llm_models").select("*, llm_providers(name)").order("id"),
    supabase
      .from("captions")
      .select("id, content, created_datetime_utc, like_count, image_id")
      .eq("humor_flavor_id", id)
      .order("created_datetime_utc", { ascending: false })
      .limit(50),
  ]);

  if (flavorRes.error || !flavorRes.data) {
    notFound();
  }

  return (
    <FlavorDetail
      flavor={flavorRes.data}
      steps={stepsRes.data || []}
      models={modelsRes.data || []}
      captions={captionsRes.data || []}
    />
  );
}
