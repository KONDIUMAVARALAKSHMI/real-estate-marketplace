import { useState } from 'react';

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-slate-900">Contact Us</h1>
      <p className="mt-3 text-sm text-slate-500">
        Have a question about a listing or your account? Send us a message.
      </p>

      {submitted ? (
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-sm font-semibold text-emerald-700">
          Thanks for reaching out! Our team will get back to you soon.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-slate-700">Name</label>
            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-slate-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-slate-500"
            />
          </div>
          <div>
            <label htmlFor="message" className="mb-1.5 block text-sm font-semibold text-slate-700">Message</label>
            <textarea
              id="message"
              rows="5"
              required
              value={form.message}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-slate-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Send Message
          </button>
        </form>
      )}
    </main>
  );
}

export default Contact;
