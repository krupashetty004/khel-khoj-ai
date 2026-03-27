import Link from "next/link";

const features = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    title: "Khel-Khoj-AI",
    description: "Upload sports videos and get real-time biomechanics analysis powered by advanced AI.",
    href: "/analyze",
    cta: "Analyze Video",
    gradient: "from-emerald-500 to-cyan-500",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: "Athletes Directory",
    description: "Browse profiles of talented athletes from across India with detailed stats and performance data.",
    href: "/athletes",
    cta: "View Athletes",
    gradient: "from-purple-500 to-pink-500",
  },
];

const stats = [
  { label: "Athletes Analyzed", value: "10K+" },
  { label: "Videos Processed", value: "50K+" },
  { label: "Sports Covered", value: "15+" },
  { label: "Accuracy Rate", value: "95%" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Animated background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950" />
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute -bottom-40 right-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative">
        {/* Navigation */}
        <nav className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500">
                <span className="text-lg font-bold text-slate-950">K</span>
              </div>
              <span className="text-xl font-bold tracking-tight">Khel-Khoj</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/athletes" className="hidden text-sm text-slate-400 transition-colors hover:text-white sm:block">
                Athletes
              </Link>
              <Link href="/analyze" className="hidden text-sm text-slate-400 transition-colors hover:text-white sm:block">
                Analyze
              </Link>
              <Link
                href="/login"
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40"
              >
                Sign In
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 pt-16 pb-24 sm:px-6 lg:px-8 lg:pt-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              AI-Powered Sports Analytics
            </div>

            <h1 className="mt-8 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              <span className="block">Discover Talent with</span>
              <span className="mt-2 block bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                AI Analysis
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 sm:text-xl">
              Empowering athletes and coaches with cutting-edge Khel-Khoj-AI. 
              Get detailed biomechanics reports, speed metrics, and personalized training recommendations.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/analyze"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/40"
              >
                Start Analysis
                <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/athletes"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/50 px-8 py-4 text-base font-semibold text-white backdrop-blur transition-all hover:border-slate-600 hover:bg-slate-800/50"
              >
                Browse Athletes
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-slate-800/50 bg-slate-900/30 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-white sm:text-4xl">{stat.value}</div>
                  <div className="mt-1 text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything you need
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Powerful tools for athletes, coaches, and scouts
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/50 p-8 transition-all duration-300 hover:border-slate-700 hover:shadow-2xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`} />
                
                <div className={`inline-flex rounded-xl bg-gradient-to-br ${feature.gradient} p-3 text-white`}>
                  {feature.icon}
                </div>
                
                <h3 className="mt-6 text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-slate-400">{feature.description}</p>
                
                <Link
                  href={feature.href}
                  className={`mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r ${feature.gradient} px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl`}
                >
                  {feature.cta}
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-900 p-12 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
            
            <div className="relative">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Ready to discover your potential?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
                Join thousands of athletes using AI to improve their performance
              </p>
              
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/40"
                >
                  Get Started for Free
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Free video uploads
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  AI-powered insights
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  No credit card required
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800/50 bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500">
                  <span className="text-sm font-bold text-slate-950">K</span>
                </div>
                <span className="text-sm text-slate-400">© 2026 Khel-Khoj AI. All rights reserved.</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-400">
                <Link href="/athletes" className="transition-colors hover:text-white">Athletes</Link>
                <Link href="/analyze" className="transition-colors hover:text-white">Analyze</Link>
                <Link href="/login" className="transition-colors hover:text-white">Sign In</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
