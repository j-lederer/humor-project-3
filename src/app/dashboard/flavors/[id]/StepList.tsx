"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import StepForm from "./StepForm";

interface StepListProps {
  steps: Record<string, unknown>[];
  models: Record<string, unknown>[];
  flavorId: number;
}

export default function StepList({ steps, models, flavorId }: StepListProps) {
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const moveStep = async (stepIndex: number, direction: "up" | "down") => {
    const swapIndex = direction === "up" ? stepIndex - 1 : stepIndex + 1;
    if (swapIndex < 0 || swapIndex >= steps.length) return;

    setLoading(true);
    const currentStep = steps[stepIndex];
    const swapStep = steps[swapIndex];

    await Promise.all([
      supabase.from("humor_flavor_steps").update({ order_by: swapStep.order_by }).eq("id", currentStep.id),
      supabase.from("humor_flavor_steps").update({ order_by: currentStep.order_by }).eq("id", swapStep.id),
    ]);

    setLoading(false);
    router.refresh();
  };

  const deleteStep = async (stepId: string) => {
    if (!confirm("Delete this step?")) return;
    setLoading(true);
    await supabase.from("humor_flavor_steps").delete().eq("id", stepId);
    setLoading(false);
    router.refresh();
  };

  if (steps.length === 0) {
    return <p className="text-center py-6 text-gray-400 dark:text-slate-500">No steps yet. Add your first step below.</p>;
  }

  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const model = models.find((m) => m.id === step.llm_model_id);

        if (editingStepId === (step.id as string)) {
          return (
            <StepForm
              key={step.id as string}
              mode="edit"
              step={step}
              flavorId={flavorId}
              models={models}
              nextOrder={step.order_by as number}
              onClose={() => setEditingStepId(null)}
            />
          );
        }

        return (
          <div
            key={step.id as string}
            className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800"
          >
            <div className="flex items-start gap-3">
              {/* Order badge & arrows */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => moveStep(index, "up")}
                  disabled={index === 0 || loading}
                  className="text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-20 cursor-pointer text-xs"
                >
                  ▲
                </button>
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-sm font-bold">
                  {step.order_by as number}
                </span>
                <button
                  onClick={() => moveStep(index, "down")}
                  disabled={index === steps.length - 1 || loading}
                  className="text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-20 cursor-pointer text-xs"
                >
                  ▼
                </button>
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{(step.description as string) || "Untitled Step"}</span>
                  {model && (
                    <span className="text-xs bg-gray-200 dark:bg-slate-600 px-2 py-0.5 rounded-full">
                      {model.name as string}
                    </span>
                  )}
                  {step.llm_temperature != null && (
                    <span className="text-xs text-gray-400 dark:text-slate-500">
                      temp: {step.llm_temperature as number}
                    </span>
                  )}
                </div>
                {typeof step.llm_system_prompt === "string" && step.llm_system_prompt && (
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                    System: {step.llm_system_prompt}
                  </p>
                )}
                {typeof step.llm_user_prompt === "string" && step.llm_user_prompt && (
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                    User: {step.llm_user_prompt}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingStepId(step.id as string)}
                  className="px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteStep(step.id as string)}
                  disabled={loading}
                  className="px-2 py-1 text-xs text-red-600 dark:text-red-400 border border-red-300 dark:border-red-500/30 rounded hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
