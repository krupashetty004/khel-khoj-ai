"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

type TaskResponse = {
  task_id: string;
  state: string;
  info?: unknown;
  result?: unknown;
  error?: string;
};

export default function AnalyzePage() {
  const [videoId, setVideoId] = useState("demo-video-001");
  const [taskId, setTaskId] = useState("");
  const [taskState, setTaskState] = useState("idle");
  const [taskPayload, setTaskPayload] = useState<unknown>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canPoll = useMemo(() => Boolean(taskId && !loading), [taskId, loading]);

  async function submitAnalyze(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${FASTAPI_URL}/analyze-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_id: videoId }),
      });

      if (!response.ok) {
        throw new Error(`FastAPI returned ${response.status}`);
      }

      const data = await response.json();
      setTaskId(data.task_id);
      setTaskState(data.status || "queued");
      setTaskPayload(data);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function pollTask() {
    if (!taskId) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${FASTAPI_URL}/task/${taskId}`);
      if (!response.ok) {
        throw new Error(`Task polling failed (${response.status})`);
      }

      const data: TaskResponse = await response.json();
      setTaskState(data.state);
      setTaskPayload(data.result || data.info || data);
      if (data.error) setError(data.error);
    } catch (pollError) {
      setError(pollError instanceof Error ? pollError.message : "Unknown polling error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">AI Video Analysis</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Trigger FastAPI + Celery analysis and inspect task progress.
        </p>
      </header>

      <section className="rounded-xl border p-6 shadow-sm">
        <form onSubmit={submitAnalyze} className="space-y-4">
          <label className="block text-sm font-medium" htmlFor="video-id">
            Video ID
          </label>
          <input
            id="video-id"
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={videoId}
            onChange={(e) => setVideoId(e.target.value)}
            placeholder="e.g. kabaddi-raider-clip-01"
            required
          />

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Start Analysis"}
            </button>

            <button
              type="button"
              onClick={pollTask}
              disabled={!canPoll}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
            >
              Poll Task Status
            </button>

            <Link
              href="/athletes"
              className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Back to Athletes
            </Link>
          </div>
        </form>
      </section>

      <section className="mt-6 rounded-xl border p-6">
        <h2 className="text-lg font-semibold">Task Output</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Current State: {taskState}</p>
        {taskId && <p className="mt-1 text-xs text-gray-500">Task ID: {taskId}</p>}
        {error && <p className="mt-3 text-sm text-red-600">Error: {error}</p>}

        <pre className="mt-4 overflow-auto rounded-lg bg-gray-950 p-4 text-xs text-emerald-300">
          {JSON.stringify(taskPayload, null, 2)}
        </pre>
      </section>
    </main>
  );
}
