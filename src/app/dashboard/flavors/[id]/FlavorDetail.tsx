"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import StepList from "./StepList";
import StepForm from "./StepForm";
import TestFlavorButton from "./TestFlavorButton";

interface FlavorDetailProps {
  flavor: Record<string, unknown>;
  steps: Record<string, unknown>[];
  models: Record<string, unknown>[];
  captions: Record<string, unknown>[];
}

export default function FlavorDetail({ flavor, steps, models, captions }: FlavorDetailProps) {
  const [editing, setEditing] = useState(false);
  const [slug, setSlug] = useState((flavor.slug as string) || "");
  const [description, setDescription] = useState((flavor.description as string) || "");
  const [showAddStep, setShowAddStep] = useState(false);
  const [activeTab, setActiveTab] = useState<"steps" | "captions">("steps");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDuplicate = async () => {
    const baseSlug = ((flavor.slug as string) || `flavor-${flavor.id}`).trim();
    const requestedSlug = prompt("New unique flavor name", `${baseSlug}-copy`);

    if (requestedSlug === null) return;

    const newSlug = requestedSlug.trim();
    if (!newSlug) {
      alert("Please enter a name for the duplicated flavor.");
      return;
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      alert("Please sign in before duplicating a flavor.");
      return;
    }

    const { data: existingFlavor, error: existingError } = await supabase
      .from("humor_flavors")
      .select("id")
      .eq("slug", newSlug)
      .maybeSingle();

    if (existingError) {
      setLoading(false);
      alert(`Could not check the flavor name: ${existingError.message}`);
      return;
    }

    if (existingFlavor) {
      setLoading(false);
      alert("That flavor name already exists. Choose a unique name for the duplicate.");
      return;
    }

    const { data: newFlavor, error: flavorError } = await supabase
      .from("humor_flavors")
      .insert({
        slug: newSlug,
        description: (flavor.description as string | null) || null,
        is_pinned: false,
        created_by_user_id: user.id,
        modified_by_user_id: user.id,
      })
      .select("id")
      .single();

    if (flavorError || !newFlavor) {
      setLoading(false);
      alert(`Could not duplicate the flavor: ${flavorError?.message || "No flavor was created."}`);
      return;
    }

    if (steps.length > 0) {
      const copiedSteps = steps.map((step) => ({
        humor_flavor_id: newFlavor.id,
        llm_temperature: step.llm_temperature ?? null,
        order_by: step.order_by ?? null,
        llm_input_type_id: step.llm_input_type_id ?? null,
        llm_output_type_id: step.llm_output_type_id ?? null,
        llm_model_id: step.llm_model_id ?? null,
        humor_flavor_step_type_id: step.humor_flavor_step_type_id ?? null,
        llm_system_prompt: step.llm_system_prompt ?? null,
        llm_user_prompt: step.llm_user_prompt ?? null,
        description: step.description ?? null,
        created_by_user_id: user.id,
        modified_by_user_id: user.id,
      }));

      const { error: stepsError } = await supabase.from("humor_flavor_steps").insert(copiedSteps);

      if (stepsError) {
        setLoading(false);
        alert(`The flavor was created, but its steps were not copied: ${stepsError.message}`);
        router.push(`/dashboard/flavors/${newFlavor.id}`);
        router.refresh();
        return;
      }
    }

    setLoading(false);
    router.push(`/dashboard/flavors/${newFlavor.id}`);
    router.refresh();
  };

  const handleUpdate = async () => {
    setLoading(true);
    await supabase.from("humor_flavors").update({
      slug: slug.trim(),
      description: description.trim() || null,
    }).eq("id", flavor.id);
    setEditing(false);
    setLoading(false);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm("Delete this humor flavor? This will also delete all its steps.")) return;
    setLoading(true);
    await supabase.from("humor_flavor_steps").delete().eq("humor_flavor_id", flavor.id);
    await supabase.from("humor_flavors").delete().eq("id", flavor.id);
    router.push("/dashboard/flavors");
    router.refresh();
  };

  return (
    <div className="space-y-8">
      {/* Flavor Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {editing ? (
            <div className="space-y-3 max-w-lg">
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:border-blue-500 text-lg font-semibold"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:border-blue-500 text-sm"
              />
              <div className="flex gap-2">
                <button onClick={handleUpdate} disabled={loading} className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer">Save</button>
                <button onClick={() => setEditing(false)} className="px-3 py-1 border border-gray-300 dark:border-slate-600 text-sm rounded-lg cursor-pointer">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold">{(flavor.slug as string) || `Flavor #${flavor.id}`}</h1>
              <p className="text-gray-500 dark:text-slate-400 mt-1">{(flavor.description as string) || "No description"}</p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">ID: {flavor.id as number}</p>
            </>
          )}
        </div>
        <div className="flex gap-2 ml-4">
          <TestFlavorButton flavorId={flavor.id as number} />
          {!editing && (
            <button onClick={() => setEditing(true)} className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
              Edit
            </button>
          )}
          <button onClick={handleDuplicate} disabled={loading} className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50">
            Duplicate
          </button>
          <button onClick={handleDelete} disabled={loading} className="px-3 py-2 text-sm text-red-600 dark:text-red-400 border border-red-300 dark:border-red-500/30 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50">
            Delete
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab("steps")}
          className={`pb-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${activeTab === "steps" ? "border-blue-600 text-blue-600" : "border-transparent hover:text-blue-600"}`}
        >
          Steps ({steps.length})
        </button>
        <button
          onClick={() => setActiveTab("captions")}
          className={`pb-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${activeTab === "captions" ? "border-blue-600 text-blue-600" : "border-transparent hover:text-blue-600"}`}
        >
          Captions ({captions.length})
        </button>
      </div>

      {/* Steps Tab */}
      {activeTab === "steps" && (
        <div className="space-y-4">
          <StepList steps={steps} models={models} flavorId={flavor.id as number} />
          {showAddStep ? (
            <StepForm
              mode="create"
              flavorId={flavor.id as number}
              models={models}
              nextOrder={(steps.length > 0 ? Math.max(...steps.map((s) => (s.order_by as number) || 0)) + 1 : 1)}
              onClose={() => setShowAddStep(false)}
            />
          ) : (
            <button
              onClick={() => setShowAddStep(true)}
              className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl text-gray-400 dark:text-slate-500 hover:border-blue-400 hover:text-blue-500 transition-colors cursor-pointer text-sm"
            >
              + Add Step
            </button>
          )}
        </div>
      )}

      {/* Captions Tab */}
      {activeTab === "captions" && (
        <div className="space-y-2">
          {captions.length === 0 ? (
            <p className="text-center py-8 text-gray-400 dark:text-slate-500">No captions generated with this flavor yet.</p>
          ) : (
            <div className="rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Caption</th>
                    <th className="px-4 py-3">Likes</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {captions.map((c) => (
                    <tr key={c.id as string} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                      <td className="px-4 py-3 max-w-md">{(c.content as string) || "N/A"}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{c.like_count as number}</td>
                      <td className="px-4 py-3 text-gray-400 dark:text-slate-500 text-xs">
                        {c.created_datetime_utc ? new Date(c.created_datetime_utc as string).toLocaleString() : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
