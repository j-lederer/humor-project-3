"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

interface TestFlavorButtonProps {
  flavorId: number;
}

export default function TestFlavorButton({ flavorId }: TestFlavorButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [images, setImages] = useState<Record<string, unknown>[]>([]);
  const [selectedImageId, setSelectedImageId] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState("");
  const supabase = createClient();

  useEffect(() => {
    if (showModal && images.length === 0) {
      supabase
        .from("images")
        .select("id, url, image_description")
        .order("created_datetime_utc", { ascending: false })
        .limit(50)
        .then(({ data }) => {
          if (data) setImages(data);
        });
    }
  }, [showModal, images.length, supabase]);

  const handleTest = async () => {
    if (!selectedImageId) return;
    setLoading(true);
    setError("");
    setResults([]);

    try {
      const res = await fetch("/api/test-flavor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ humor_flavor_id: flavorId, image_id: selectedImageId }),
      });

      const text = await res.text();

      if (!res.ok) {
        setError(`Error ${res.status}: ${text.slice(0, 500) || "No response body"}`);
        setLoading(false);
        return;
      }

      const data = JSON.parse(text);
      const caps = data.captions || [];
      const extracted = caps.map((c: Record<string, unknown>) =>
        typeof c === "string" ? c : (c.content as string) || JSON.stringify(c)
      );
      setResults(extracted.length > 0 ? extracted : ["No captions returned"]);
    } catch (err) {
      setError(`Request failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
      >
        Test Flavor
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-lg border border-gray-200 dark:border-slate-700 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Test Humor Flavor</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Select an Image</label>
              <select
                value={selectedImageId}
                onChange={(e) => setSelectedImageId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="">Choose an image...</option>
                {images.map((img) => (
                  <option key={img.id as string} value={img.id as string}>
                    {String(img.image_description || "") || String(img.url || "").slice(0, 60) || String(img.id)}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-500/20 border border-red-400 rounded-lg text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            {results.length > 0 && (
              <div className="mb-4 space-y-2">
                <h4 className="text-sm font-medium">Generated Captions:</h4>
                {results.map((caption, i) => (
                  <div key={i} className="p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg text-sm">
                    {caption}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  setResults([]);
                  setError("");
                }}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleTest}
                disabled={loading || !selectedImageId}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Generating..." : "Generate Captions"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
