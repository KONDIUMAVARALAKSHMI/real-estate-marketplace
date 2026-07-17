function About() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl space-y-10">
        <div className="rounded-3xl bg-white p-10 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">About EstateHub</p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-900">A modern marketplace for home buyers and sellers.</h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            EstateHub was designed to simplify real estate discovery with beautiful listings, fast search, and a clean account experience. Our goal is to help users find the right home without the clutter.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">What we offer</h2>
            <ul className="mt-6 space-y-4 text-slate-600">
              <li className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Curated listings</p>
                <p className="mt-2 text-sm">Only the best homes are shown, with clear details and pricing.</p>
              </li>
              <li className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Secure accounts</p>
                <p className="mt-2 text-sm">Signup and signin with confidence, then save and manage your favorites.</p>
              </li>
              <li className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Fast browsing</p>
                <p className="mt-2 text-sm">Responsive performance across desktop and mobile devices.</p>
              </li>
            </ul>
          </div>

          <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-sm">
            <h2 className="text-2xl font-semibold">Our values</h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-slate-200">
              <p>We believe in clarity first. Every listing, button, and page is designed to make decisions easier.</p>
              <p>We believe in trust. User accounts and saved favorites are handled with privacy and reliability.</p>
              <p>We believe in speed. From search to signup, EstateHub moves quickly so you spend less time waiting.</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">How it works</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">1. Browse</p>
              <p className="mt-3 text-slate-600">Explore curated homes with clear details and pricing.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">2. Save</p>
              <p className="mt-3 text-slate-600">Save favorites to your account for quick access later.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">3. Connect</p>
              <p className="mt-3 text-slate-600">Reach out to the seller or agent for the next step.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
export default About;