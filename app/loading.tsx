import Image from "next/image"

export default function PublicLoading() {
  return (
    <main
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1e3a2f] px-4"
      role="status"
      aria-label="Loading Kibaha Scouts"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(201,145,10,0.06) 0%, transparent 65%)",
          }}
        />
      </div>

      <section className="relative flex flex-col items-center gap-6 text-center">
        <div className="relative flex items-center justify-center">
          <div
            className="absolute h-24 w-24 rounded-full border border-[#c9910a]/25"
            style={{ animation: "orbital-spin 10s linear infinite" }}
          />
          <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-[#c9910a]/50 shadow-lg">
            <Image
              src="/images/branding/kibaha-scouts-logo.jpg"
              alt="Kibaha Scouts"
              fill
              sizes="64px"
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#c9910a]">
            Kibaha Scouts
          </p>
          <p className="mt-1 text-xs text-white/50">Tanzania Scouts Association</p>
        </div>

        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-[#c9910a]/50"
              style={{ animation: `dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </section>
    </main>
  )
}
