import { useState } from 'react';
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';

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
    <main className="min-h-screen py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F7F3EF' }}>
      <div className="mx-auto max-w-5xl rounded-3xl border shadow-xl overflow-hidden flex flex-col md:flex-row" style={{ backgroundColor: '#FCFAF8', borderColor: '#E8DDD4' }}>
        
        {/* Contact Info Sidebar */}
        <div className="p-10 md:w-1/3 flex flex-col text-white" style={{ backgroundColor: '#3D1F12' }}>
          <h2 className="text-3xl mb-2" style={{ fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic', fontWeight: 700 }}>
            Get in Touch
          </h2>
          <p className="text-sm mb-10 opacity-80 leading-relaxed">
            Whether you are looking to buy, sell, or simply explore the market, our dedicated team is here to assist you.
          </p>

          <div className="space-y-6 mt-auto">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                <FaMapMarkerAlt />
              </div>
              <span className="text-sm font-medium">100 Luxury Way, Beverly Hills, CA 90210</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                <FaPhoneAlt />
              </div>
              <span className="text-sm font-medium">+1 (800) 555-0199</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                <FaEnvelope />
              </div>
              <span className="text-sm font-medium">concierge@estatehub.com</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="p-10 md:w-2/3">
          <h3 className="text-2xl font-bold mb-6" style={{ color: '#2C1B14', fontFamily: '"Playfair Display", Georgia, serif' }}>
            Send us a message
          </h3>

          {submitted ? (
            <div className="rounded-2xl border p-6 font-semibold flex flex-col items-center justify-center min-h-[300px] text-center" style={{ borderColor: '#E8DDD4', backgroundColor: '#F7F3EF', color: '#4a6643' }}>
              <FaEnvelope className="text-4xl mb-4" style={{ color: '#98755B' }} />
              <p>Thank you for reaching out.</p>
              <p className="text-sm mt-2 font-normal" style={{ color: '#7d5e45' }}>A member of our concierge team will contact you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-semibold uppercase tracking-wider" style={{ color: '#98755B' }}>
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-xl px-4 py-3 outline-none transition text-sm border"
                  style={{ backgroundColor: '#F7F3EF', borderColor: '#E8DDD4', color: '#2C1B14' }}
                  onFocus={(e) => { e.target.style.borderColor = '#98755B'; e.target.style.boxShadow = '0 0 0 3px rgba(152,117,91,0.12)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#E8DDD4'; e.target.style.boxShadow = 'none'; }}
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold uppercase tracking-wider" style={{ color: '#98755B' }}>
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-xl px-4 py-3 outline-none transition text-sm border"
                  style={{ backgroundColor: '#F7F3EF', borderColor: '#E8DDD4', color: '#2C1B14' }}
                  onFocus={(e) => { e.target.style.borderColor = '#98755B'; e.target.style.boxShadow = '0 0 0 3px rgba(152,117,91,0.12)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#E8DDD4'; e.target.style.boxShadow = 'none'; }}
                  placeholder="jane@example.com"
                />
              </div>
              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-semibold uppercase tracking-wider" style={{ color: '#98755B' }}>
                  Your Message
                </label>
                <textarea
                  id="message"
                  rows="5"
                  required
                  value={form.message}
                  onChange={handleChange}
                  className="w-full rounded-xl px-4 py-3 outline-none transition text-sm border"
                  style={{ backgroundColor: '#F7F3EF', borderColor: '#E8DDD4', color: '#2C1B14' }}
                  onFocus={(e) => { e.target.style.borderColor = '#98755B'; e.target.style.boxShadow = '0 0 0 3px rgba(152,117,91,0.12)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#E8DDD4'; e.target.style.boxShadow = 'none'; }}
                  placeholder="How can we assist you?"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl px-6 py-4 text-sm font-bold text-white transition hover:opacity-90 shadow-md"
                style={{ backgroundColor: '#3D1F12' }}
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

export default Contact;
