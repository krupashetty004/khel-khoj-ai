"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState, useCallback, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams, useRouter } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

type Job = {
  _id?: string;
  id?: string;
  videoId: string;
  status: string;
  taskId?: string;
  uploadedBy?: string;
  uploaderType?: string;
  metrics?: { avg_speed_m_s?: number; agility_score?: number; consistency_score?: number; speed_mps?: number; stamina_score?: number };
  exercise_metrics?: { name: string; value: number | string; unit?: string | null; description?: string }[];
  exercise_metadata?: Record<string, number | string>;
  report?: {
    narrative?: string;
    action_label?: string;
    recommendations?: string[];
    metrics?: { name: string; value: number | string; unit?: string | null; description?: string }[];
  } | string;
  artifacts?: { summary_txt?: string; metrics_json?: string } | string[];
  action?: string;
  classifier_action?: string;
  similar_athletes?: { athlete_id?: string; score?: number }[];
  error?: string;
};

type JobResponse = { success: boolean; data?: Job; error?: unknown };

const statusCopy: Record<string, string> = {
  queued: "Queued",
  processing: "Processing frames & pose",
  started: "Started",
  success: "Completed",
  completed: "Completed",
  failure: "Failed",
  failed: "Failed",
};

export default function AnalyzePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><p className="text-slate-400">Loading...</p></div>}>
      <AnalyzePageContent />
    </Suspense>
  );
}

function AnalyzePageContent() {
  const [athleteId, setAthleteId] = useState("");
  const [exerciseType, setExerciseType] = useState("auto");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const jobId = job?._id || job?.id || job?.videoId || "";
  
  const { user, getIdToken, logout, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const canPoll = useMemo(() => Boolean(jobId && !loading), [jobId, loading]);

  // Load job from URL on mount
  useEffect(() => {
    const urlJobId = searchParams.get("job");
    if (urlJobId && !job) {
      loadJobFromId(urlJobId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Update URL when job changes
  useEffect(() => {
    if (job?.videoId) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("job", job.videoId);
      router.replace(`/analyze?${params.toString()}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.videoId]);

  const loadJobFromId = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/jobs/${id}`, { cache: "no-store" });
      if (response.ok) {
        const data: JobResponse = await response.json();
        if (data.data) setJob(data.data);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user && user.token) {
      fetchMyJobs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  async function fetchMyJobs() {
    if (!user || !user.token) return;
    
    try {
      const token = await getIdToken();
      if (!token) return;
      
      const response = await fetch(`${BACKEND_URL}/api/users/me/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setMyJobs(data.data?.jobs || []);
      }
    } catch {
      // Silently fail - user may not be authenticated
    }
  }

  async function submitAnalyze(event: FormEvent) {
    event.preventDefault();
    if (!videoFile) {
      setError("Please attach a video file.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("video", videoFile);
      if (athleteId) formData.append("athleteId", athleteId);
      if (exerciseType && exerciseType !== "auto") formData.append("exerciseType", exerciseType);

      const headers: Record<string, string> = {};
      const token = await getIdToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${BACKEND_URL}/api/jobs`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }

      const data: JobResponse = await response.json();
      setJob(data.data ?? null);
      
      if (user) {
        fetchMyJobs();
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function pollJob() {
    if (!jobId) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${BACKEND_URL}/api/jobs/${jobId}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Polling failed (${response.status})`);
      const data: JobResponse = await response.json();
      setJob(data.data ?? null);
    } catch (pollError) {
      setError(pollError instanceof Error ? pollError.message : "Unknown polling error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!jobId) return;
    const id = setInterval(() => pollJob(), 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Link
                href="/"
                className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-emerald-400"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </Link>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                 Khel-Khoj-
                </span>{""}
                AI
              </h1>
              <p className="mt-3 max-w-2xl text-lg text-slate-400">
                {user 
                  ? `Welcome, ${user.displayName || user.email}! Upload your sports video for AI analysis.`
                  : "Upload your sports video to get AI-powered biomechanics analysis and scouting reports."
                }
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {user ? (
                <button
                  onClick={logout}
                  className="rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition-all hover:border-slate-600 hover:bg-slate-800/50"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/login"
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40"
                >
                  Sign In
                </Link>
              )}
              <Link
                href="/athletes"
                className="rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition-all hover:border-slate-600 hover:bg-slate-800/50"
              >
                View Athletes
              </Link>
            </div>
          </div>
        </header>

      {user && myJobs.length > 0 && (
        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
          <h2 className="text-lg font-semibold text-white mb-4">Your Previous Analyses</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {myJobs.slice(0, 6).map((j) => (
              <button
                key={j._id || j.id}
                onClick={() => setJob(j)}
                className={`text-left rounded-xl p-4 border transition-all ${
                  (j._id || j.id) === jobId
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-slate-700 hover:border-slate-600 bg-slate-800/30"
                }`}
              >
                <p className="font-medium text-sm text-white truncate">{j.videoId}</p>
                <p className="text-xs text-slate-400 mt-1">{statusCopy[j.status] || j.status}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Upload Form */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">Upload Video</h2>
          <p className="mt-1 text-sm text-slate-400">Select a sports video for AI analysis</p>
        </div>
        <form onSubmit={submitAnalyze} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-300" htmlFor="athlete-id">
                Athlete ID (optional)
              </label>
              <input
                id="athlete-id"
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                value={athleteId}
                onChange={(e) => setAthleteId(e.target.value)}
                placeholder="e.g., ath-123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300" htmlFor="exercise-type">
                Exercise Type
              </label>
              <select
                id="exercise-type"
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                value={exerciseType}
                onChange={(e) => setExerciseType(e.target.value)}
              >
                <option value="auto">Auto Detect</option>
                <option value="running">Running</option>
                <option value="jumping">Jumping / Skipping</option>
                <option value="pushup">Pushup</option>
                <option value="squat">Squat</option>
                <option value="lunge">Lunge</option>
                <option value="plank">Plank</option>
                <option value="situp">Sit-up / Crunch</option>
                <option value="burpee">Burpee</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300" htmlFor="video">
                Video File
              </label>
              <input
                id="video"
                type="file"
                accept="video/*"
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950 hover:file:bg-emerald-400"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  Start Analysis
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={pollJob}
              disabled={!canPoll}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-6 py-3 text-sm font-semibold text-white transition-all hover:border-slate-600 hover:bg-slate-700/50 disabled:opacity-40"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Status
            </button>
          </div>
        </form>
        
        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
        
        {job && (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <div className="flex items-center gap-3">
              <span className={`h-3 w-3 rounded-full ${
                job.status === 'completed' ? 'bg-emerald-400' :
                job.status === 'failed' ? 'bg-red-400' :
                job.status === 'processing' ? 'bg-yellow-400 animate-pulse' :
                'bg-slate-400'
              }`} />
              <div>
                <p className="font-medium text-white">
                  {job.videoId} • {statusCopy[job.status] || job.status}
                </p>
                {job.taskId && <p className="text-xs text-slate-400">Task: {job.taskId}</p>}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Scouting Report */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white">Scouting Report</h2>
          </div>
          {!job && <p className="text-sm text-slate-400">No job yet — upload a video to start.</p>}
          {job?.report ? (
            <>
              <p className="whitespace-pre-line text-sm text-slate-300 leading-relaxed">
                {typeof job.report === 'string' ? job.report : (job.report.narrative || JSON.stringify(job.report))}
              </p>
              {typeof job.report !== 'string' && job.report.recommendations && (
                <div className="mt-4 space-y-2 text-sm">
                  {job.report.recommendations.map((rec) => (
                    <div key={rec} className="flex items-start gap-2 text-emerald-400">
                      <svg className="h-4 w-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {rec}
                    </div>
                  ))}
                </div>
              )}
              {(job.action || (typeof job.report !== 'string' && job.report?.action_label) || job.classifier_action) && (
                <p className="mt-4 text-xs text-slate-400">
                  Action detected: <span className="font-semibold text-cyan-400">{(typeof job.report !== 'string' && job.report?.action_label) || job.action || job.classifier_action}</span>
                </p>
              )}
            </>
          ) : (
            job && <p className="text-sm text-slate-400">Waiting for pipeline output…</p>
          )}
        </div>

        {/* Key Metrics */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-cyan-500/10 p-2">
              <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white">Key Metrics</h2>
          </div>
          {(!job?.metrics && !(typeof job?.report !== "string" && job?.report?.metrics?.length) && !(job?.exercise_metrics?.length)) && (
            <p className="text-sm text-slate-400">Metrics will appear after pose pass.</p>
          )}
          {(() => {
            const reportMetrics = typeof job?.report !== "string" ? (job?.report?.metrics || []) : [];
            if (reportMetrics.length > 0) {
              return (
                <dl className="grid grid-cols-2 gap-3">
                  {reportMetrics.slice(0, 4).map((metric) => (
                    <Metric
                      key={metric.name}
                      label={metric.name.replace(/_/g, " ")}
                      value={`${metric.value}${metric.unit ? ` ${metric.unit}` : ""}`}
                    />
                  ))}
                </dl>
              );
            }
            if ((job?.exercise_metrics || []).length > 0) {
              return (
                <dl className="grid grid-cols-2 gap-3">
                  {(job?.exercise_metrics || []).slice(0, 4).map((metric) => (
                    <Metric
                      key={metric.name}
                      label={metric.name.replace(/_/g, " ")}
                      value={`${metric.value}${metric.unit ? ` ${metric.unit}` : ""}`}
                    />
                  ))}
                </dl>
              );
            }
            if (job?.metrics) {
              return (
                <dl className="grid grid-cols-2 gap-3">
                  <Metric label="Avg Speed" value={`${job.metrics.avg_speed_m_s ?? job.metrics.speed_mps ?? 0} m/s`} />
                  <Metric label="Agility" value={job.metrics.agility_score?.toFixed?.(2) ?? "—"} />
                  <Metric label="Consistency" value={job.metrics.consistency_score?.toFixed?.(2) ?? job.metrics.stamina_score?.toFixed?.(2) ?? "—"} />
                </dl>
              );
            }
            return null;
          })()}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Progress */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
          <h3 className="text-sm font-semibold text-white">Progress</h3>
          <p className="mt-1 text-xs text-slate-400">Live status from FastAPI task polling.</p>
          <div className="mt-4 space-y-2 text-sm">
            <StatusPill active={job?.status === "queued"} label="Queued" />
            <StatusPill active={job?.status === "processing"} label="Processing" />
            <StatusPill active={job?.status === "completed"} label="Report Ready" />
            <StatusPill active={job?.status === "failed"} label="Failed" />
          </div>
        </div>
        
        {/* Map Placeholder */}
        <div className="rounded-2xl border border-dashed border-slate-700 bg-gradient-to-br from-emerald-950/30 to-cyan-950/30 p-6 backdrop-blur">
          <p className="text-sm font-semibold text-white">Map (OSM placeholder)</p>
          <p className="mt-2 text-xs text-slate-400">
            Plug in OpenStreetMap/Leaflet later to plot athlete origin & session venue.
          </p>
          <div className="mt-3 h-28 rounded-xl bg-gradient-to-r from-emerald-600/40 via-cyan-500/30 to-purple-600/40 border border-slate-700/50"></div>
        </div>
        
        {/* Artifacts */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
          <h3 className="text-sm font-semibold text-white">Artifacts</h3>
          {job?.artifacts ? (
            <ul className="mt-3 space-y-2 text-xs">
              <li className="flex items-center gap-2 text-slate-300">
                <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {job.artifacts.summary_txt || "summary.txt"}
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                {job.artifacts.metrics_json || "metrics.json"}
              </li>
            </ul>
          ) : (
            <p className="mt-3 text-xs text-slate-400">Artifacts will list once ready.</p>
          )}
        </div>
      </section>
      </div>
    </main>
  );
}

function StatusPill({ active, label }: { active?: boolean; label: string }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-full px-3 py-1.5 border ${
        active 
          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" 
          : "border-slate-700 bg-slate-800/30 text-slate-400"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${active ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
      <span className="text-sm">{label}</span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
