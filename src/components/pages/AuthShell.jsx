export default function AuthShell({
  title,
  children,
  formSide = "left",
  accent = "from-blue-600 to-purple-600",
}) {
  const isLeft = formSide === "left";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
      {/* Static gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-purple-100/20"></div>

      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
        <div className="absolute bottom-1/4 -right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[80vh]">
          {/* FORM PANEL */}
          <div className={isLeft ? "order-1" : "order-2"}>
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 p-8 lg:p-10">
              <div className="max-w-md mx-auto">
                <div className="mb-8 text-center">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    {title}
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Secure access to digital land registry
                  </p>
                </div>
                {children}
              </div>
            </div>
          </div>

          {/* FEATURE PANEL */}
          <div className={isLeft ? "order-2" : "order-1"}>
            <div
              className={`rounded-2xl p-8 lg:p-10 bg-gradient-to-br ${accent} text-white shadow-lg relative overflow-hidden`}
            >
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold">e-Land Registry</h2>
                    <p className="text-white/80 text-sm">
                      Bangladesh • Blockchain Powered
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/15 backdrop-blur rounded-xl p-4 border border-white/20">
                    <div className="text-2xl mb-2">🔒</div>
                    <div className="font-semibold text-sm">Secure</div>
                  </div>
                  <div className="bg-white/15 backdrop-blur rounded-xl p-4 border border-white/20">
                    <div className="text-2xl mb-2">⚡</div>
                    <div className="font-semibold text-sm">Fast</div>
                  </div>
                  <div className="bg-white/15 backdrop-blur rounded-xl p-4 border border-white/20">
                    <div className="text-2xl mb-2">✓</div>
                    <div className="font-semibold text-sm">Verified</div>
                  </div>
                  <div className="bg-white/15 backdrop-blur rounded-xl p-4 border border-white/20">
                    <div className="text-2xl mb-2">🌐</div>
                    <div className="font-semibold text-sm">Digital</div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex justify-around mb-8 py-4 bg-white/10 rounded-xl backdrop-blur">
                  <div className="text-center">
                    <div className="text-xl font-bold">10K+</div>
                    <div className="text-xs text-white/70">Records</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">500+</div>
                    <div className="text-xs text-white/70">Mouzas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">64</div>
                    <div className="text-xs text-white/70">Districts</div>
                  </div>
                </div>

                {/* Survey Types */}
                <div className="mb-6">
                  <div className="text-sm font-semibold mb-3 text-white/90">
                    Survey Types
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["CS", "SA", "RS", "BS", "BRS", "TS"].map((survey) => (
                      <span
                        key={survey}
                        className="px-3 py-1 bg-white/20 backdrop-blur rounded-lg text-sm font-medium border border-white/30"
                      >
                        {survey}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="text-center pt-4 border-t border-white/20">
                  <span className="text-sm text-white/80">New user? </span>
                  <a href="/register" className="font-semibold text-white">
                    Sign up →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
