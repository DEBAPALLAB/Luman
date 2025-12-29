"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { validate as uuidValidate } from "uuid";

export default function NewNotePage() {
  const router = useRouter();
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = params.workspaceId;

  const [loading, setLoading] = useState(false);

  async function createNote(templateType: string) {
    // ✅ Validate FIRST
    if (!workspaceId || !uuidValidate(workspaceId)) {
      alert("Invalid workspace ID");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          title: templateType,
          templateType,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("CREATE NOTE FAILED:", text);
        alert("Failed to create note");
        return;
      }

      // ✅ SAFE JSON PARSE (NO CRASH)
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!data?.id) {
        console.error("CREATE NOTE: Missing ID", data);
        alert("Failed to create note");
        return;
      }

      router.push(`/workspace/${workspaceId}/note/${data.id}`);
    } catch (err) {
      console.error("createNote crashed:", err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-xl">
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-muted-foreground hover:text-foreground transition"
        >
          ← Back
        </button>
        <h1 className="text-lg font-semibold">New Note</h1>
      </div>

      <div className="space-y-2">
        {["Daily Update", "Task Breakdown", "Brainstorm"].map((type) => (
          <button
            key={type}
            onClick={() => createNote(type)}
            disabled={loading}
            className="block w-full text-left rounded-lg border p-4 hover:bg-muted disabled:opacity-50"
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}
