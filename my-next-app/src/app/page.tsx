import Link from "next/link";

const cards = [
  {
    title: "Athletes Directory",
    description:
      "Browse athlete profiles from API (MongoDB if connected, fallback demo data otherwise).",
    href: "/athletes",
    cta: "Open Athletes",
  },
  {
    title: "AI Video Analysis",
    description:
      "Trigger FastAPI + Celery video analysis and track task status in real time.",
    href: "/analyze",
    cta: "Analyze Video",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="inline-flex rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
          Project Khel-Khoj
        </p>

        <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
          AI Sports Analytics Engineer Dashboard
        </h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          This MVP links frontend, Node backend, and Python AI services so coaches can
          manage athletes and run video-analysis workflows.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {cards.map((card) => (
            <section
              key={card.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg"
            >
              <h2 className="text-xl font-semibold text-white">{card.title}</h2>
              <p className="mt-2 text-sm text-slate-300">{card.description}</p>
              <Link
                href={card.href}
                className="mt-5 inline-block rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                {card.cta}
              </Link>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
