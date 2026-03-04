import Image from "next/image"

export default function AdminLoading() {
  return (
    <main className="notranslate flex min-h-screen items-center justify-center bg-tsa-green-deep px-4 py-12">
      <section className="text-center">
        <div className="relative mx-auto h-20 w-20">
          <span className="absolute inset-0 rounded-full bg-tsa-gold/40 animate-ping" />
          <div className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-tsa-gold/70">
            <Image src="/images/branding/kibaha-scouts-logo.jpg" alt="Kibaha Scouts logo" fill sizes="80px" className="object-cover" priority />
          </div>
        </div>
        <p className="mt-5 text-sm font-semibold tracking-wide text-primary-foreground">Loading admin panel...</p>
      </section>
    </main>
  )
}
