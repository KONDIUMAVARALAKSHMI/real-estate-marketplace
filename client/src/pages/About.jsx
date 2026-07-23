function About() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F7F3EF' }}>
      {/* Hero Section */}
      <div className="relative py-24 px-4 sm:px-6 lg:px-8 text-center" style={{ backgroundColor: '#2C1B14', overflow: 'hidden' }}>
        <div className="absolute inset-0 z-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80" alt="Mansion Background" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-6xl text-white mb-6" style={{ fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic', fontWeight: 700 }}>
            Redefining Luxury Real Estate
          </h1>
          <p className="text-lg sm:text-xl text-white/80 font-medium leading-relaxed">
            EstateHub is the premier marketplace for extraordinary properties. We connect discerning buyers with exceptional homes around the globe.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-12">
          
          <div className="bg-white rounded-3xl p-10 sm:p-14 shadow-sm border" style={{ borderColor: '#E8DDD4' }}>
            <h2 className="text-3xl mb-6" style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#3D1F12' }}>Our Vision</h2>
            <p className="text-lg leading-loose" style={{ color: '#6B4E3D' }}>
              We believe that finding a home should be an inspiring and seamless experience. At EstateHub, our vision is to curate a collection of the world’s most remarkable real estate, presenting them through an intuitive, beautifully designed platform that prioritizes visual elegance and essential details.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-10 shadow-sm border" style={{ borderColor: '#E8DDD4' }}>
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#2C1B14' }}>Uncompromising Quality</h3>
              <p className="text-base leading-relaxed" style={{ color: '#7d5e45' }}>
                Every property on our platform is carefully presented. We strip away the clutter, allowing the stunning photography and architectural brilliance of each home to speak for itself.
              </p>
            </div>
            
            <div className="bg-white rounded-3xl p-10 shadow-sm border" style={{ borderColor: '#E8DDD4' }}>
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#2C1B14' }}>Global Reach</h3>
              <p className="text-base leading-relaxed" style={{ color: '#7d5e45' }}>
                With a built-in currency conversion engine and localized data, EstateHub provides a frictionless browsing experience whether you're looking for a penthouse in New York, a villa in Italy, or a condo in Tokyo.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-10 sm:p-14 shadow-sm border text-center mt-12" style={{ borderColor: '#E8DDD4', backgroundColor: '#FCFAF8' }}>
            <h2 className="text-3xl mb-6" style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#3D1F12' }}>Join the Collection</h2>
            <p className="text-lg leading-loose max-w-2xl mx-auto mb-8" style={{ color: '#6B4E3D' }}>
              Whether you are an agent representing a portfolio of premium estates, or an owner looking to list your extraordinary property, EstateHub is your destination.
            </p>
            <a
              href="/create-listing"
              className="inline-block rounded-full px-8 py-4 text-sm font-bold text-white transition hover:-translate-y-1 shadow-lg"
              style={{ backgroundColor: '#3D1F12' }}
            >
              List Your Property
            </a>
          </div>

        </div>
      </div>
    </main>
  );
}

export default About;