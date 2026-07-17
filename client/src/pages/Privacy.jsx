function Privacy() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
      <p className="mt-4 text-sm text-slate-500">Last updated: 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-7 text-slate-600">
        <p>
          EstateHub respects your privacy. We collect only the information needed to operate
          the marketplace — your account details, listings you create, and preferences such as
          your selected country and currency.
        </p>
        <p>
          We do not sell your personal information to third parties. Data you provide is used
          solely to authenticate your account, display your listings, and improve your experience
          on the platform.
        </p>
        <p>
          Some preferences, such as your saved properties and selected country, are stored locally
          in your browser and are not transmitted to our servers.
        </p>
        <p>
          If you have questions about how your data is handled, please reach out via our{' '}
          <a href="/contact" className="font-semibold text-slate-900 hover:underline">Contact page</a>.
        </p>
      </div>
    </main>
  );
}

export default Privacy;
