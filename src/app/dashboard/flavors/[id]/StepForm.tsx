"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface StepFormProps {
  mode: "create" | "edit";
  step?: Record<string, unknown>;
  flavorId: number;
  models: Record<string, unknown>[];
  nextOrder: number;
  onClose: () => void;
}

export default function StepForm({ mode, step, flavorId, models, nextOrder, onClose }: StepFormProps) {
  const [form, setForm] = useState({
    description: (step?.description as string) || "",
    llm_model_id: (step?.llm_model_id as number) || "",
    llm_temperature: (step?.llm_temperature as number) ?? 0.7,
    llm_system_prompt: (step?.llm_system_prompt as string) || "",
    llm_user_prompt: (step?.llm_user_prompt as string) || "",
    order_by: (step?.order_by as number) ?? nextOrder,
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      description: form.description || null,
      llm_model_id: form.llm_model_id ? Number(form.llm_model_id) : null,
      llm_temperature: Number(form.llm_temperature),
      llm_system_prompt: form.llm_system_prompt || null,
      llm_user_prompt: form.llm_user_prompt || null,
      order_by: Number(form.order_by),
      humor_flavor_id: flavorId,
      humor_flavor_step_type_id: 1,
      llm_input_type_id: 1,
      llm_output_type_id: 1,
    };

    if (mode === "create") {
      await supabase.from("humor_flavor_steps").insert(payload);
    } else {
      await supabase.from("humor_flavor_steps").update(payload).eq("id", step!.id);
    }

    setLoading(false);
    onClose();
    router.refresh();
  };

  const set = (field: string, value: string | number) => setForm({ ...form, [field]: value });

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-xl border-2 border-blue-400 dark:border-blue-500 bg-blue-50/50 dark:bg-slate-800 space-y-3">
      <h3 className="font-semibold text-sm">{mode === "create" ? "New Step" : "Edit Step"}</h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">Description</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="What does this step do?"
            className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">Model</label>
            <select
              value={form.llm_model_id}
              onChange={(e) => set("llm_model_id", e.target.value)}
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="">Select model</option>
              {models.map((m) => (
                <option key={m.id as number} value={m.id as number}>
                  {m.name as string}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Temperature</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="2"
              value={form.llm_temperature}
              onChange={(e) => set("llm_temperature", e.target.value)}
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1">System Prompt</label>
        <textarea
          value={form.llm_system_prompt}
          onChange={(e) => set("llm_system_prompt", e.target.value)}
          rows={3}
          placeholder="System prompt for this step..."
          className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:border-blue-500 font-mono"
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1">User Prompt</label>
        <textarea
          value={form.llm_user_prompt}
          onChange={(e) => set("llm_user_prompt", e.target.value)}
          rows={3}
          placeholder="User prompt for this step..."
          className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:border-blue-500 font-mono"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Saving..." : mode === "create" ? "Add Step" : "Save"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
