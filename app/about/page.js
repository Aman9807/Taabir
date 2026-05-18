"use client";

import Link from "next/link";

export default function AboutPage() {
  const features = [
    {
      icon: "🚪",
      title: "Split-Door Wax Seal Envelope",
      desc: "An ultra-premium guest entrance experience. The invitation loads as two closed, high-textured card panels locked by a central gold seam. Tapping the glowing, pulsed wax seal monogram executes a luxurious smooth web transition that slides the doors left and right to reveal the main card."
    },
    {
      icon: "✍️",
      title: "Interactive Live RSVPs",
      desc: "Ditch print-based stationery or static PDFs. Guests can instantly specify their attendance ('Joyfully Attending' or 'Declining with Regrets'), specify the number of guests in their party, and write custom blessings or wishes that synchronize in real time."
    },
    {
      icon: "📊",
      title: "Real-Time Host Dashboard",
      desc: "Track and organize your guests effortlessly. The unified host panel provides live counters of attending vs declined guests, exact seat headcounts, and a clean, searchable spreadsheet containing all RSVP wishes and arrival schedules."
    },
    {
      icon: "📅",
      title: "Multi-Event Chronological Timeline",
      desc: "Organize and display multiple functions (Mehndi, Barat, Nikkah, Walima) seamlessly. Every event features its own date, time, venue, and descriptions, beautifully rendered with chronological timeline nodes and gold border highlights."
    },
    {
      icon: "🎵",
      title: "Ambient Background Audio",
      desc: "Set the mood for your wedding card. Paste your custom MP3 instrumental or vocal music link, which will loop automatically the moment a guest opens the envelope wax seal, complete with a clean floating playback control button."
    },
    {
      icon: "🖼️",
      title: "Client-Side Photo Compression",
      desc: "Upload large couple portraits without worrying about performance or database limits. Taabir uses an off-screen HTML5 Canvas system to compress high-res images down to highly-optimized Base64 JPEGs entirely client-side, speeding up load times."
    },
    {
      icon: "📍",
      title: "Google Maps Coordinates",
      desc: "Never let a guest get lost. Add your custom venue pin location. If left empty, Taabir's compiler automatically generates a direct search link based on your venue's name and address, keeping directions seamless."
    },
    {
      icon: "⏳",
      title: "Live Countdown Timers",
      desc: "Build anticipation leading up to your ceremony. The invitation automatically calculates the exact days, hours, minutes, and seconds remaining until your wedding vows and displays a live, ticking gold countdown block."
    },
    {
      icon: "⚜️",
      title: "Calligraphy Header Customization",
      desc: "Fully customize the spiritual headers of your wedding card. Modify the top Arabic script (defaults to standard Bismillah) and the secondary English grace subtext to align with your personal or traditional beliefs."
    },
    {
      icon: "♻️",
      title: "Auto Deletion Garbage Collector",
      desc: "To optimize Firestore database storage and resources, Taabir features a built-in clean-up mechanism. When hosts log in, it securely purges outdated records (older than 3 days past the wedding date) while preserving guest sheets."
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-800 selection:bg-amber-100 font-sans relative overflow-hidden select-none">
      
      {/* Decorative luxury lattice background grids */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#C5A880_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

      {/* Top Elegant Header */}
      <header className="border-b border-slate-100 bg-white/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-full border border-amber-500 flex items-center justify-center text-slate-800 font-serif text-xl font-bold bg-amber-50 shadow-sm">
                T
              </span>
              <span className="font-serif text-xl font-bold text-slate-900 tracking-wide">TAABIR</span>
            </Link>
          </div>

          <nav className="flex items-center gap-6">
            <Link href="/" className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-widest">
              Home
            </Link>
            <Link href="/login" className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-widest">
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md"
            >
              Create Free Card
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center z-10">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-50 text-amber-800 text-[10px] font-bold uppercase tracking-widest font-mono mb-4">
          👑 Discover Taabir Premium Features
        </span>
        <h1 className="text-4xl sm:text-6xl font-serif font-light text-slate-900 tracking-wide mb-6">
          Sophisticated Features, <br />
          <span className="text-amber-600 italic font-normal">Completely Free</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-sans max-w-2xl mx-auto">
          Taabir combines the high-end physical visual polish of modern letterpress stationeries with highly optimized, responsive serverless web engine architectures.
        </p>
      </section>

      {/* Grid of Features */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, idx) => (
            <div 
              key={idx} 
              className="p-8 rounded-2xl border border-slate-100 bg-white hover:shadow-xl transition-all group duration-300 relative overflow-hidden"
            >
              {/* Luxury Top gold light hover line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-200 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <span className="text-4xl block mb-6">{f.icon}</span>
              <h3 className="text-lg font-serif font-bold text-slate-900 mb-3">{f.title}</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-sans">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Templates Spotlight Section */}
        <div className="mt-20 p-10 sm:p-12 rounded-3xl border border-amber-100 bg-[#FAF9F5]/80 relative overflow-hidden flex flex-col lg:flex-row gap-12 items-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex-1 space-y-6">
            <span className="text-amber-600 uppercase tracking-widest text-[10px] font-bold">Stationery Design Themes</span>
            <h2 className="text-3xl font-serif text-slate-900">Bespoke Foil-Embossed Templates</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Every digital invitation compiles using layouts tailored by visual graphic designers. Choose from premium options:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-white border border-slate-100">
                <span className="font-serif font-bold text-slate-800 text-sm">🟢 Emerald Noir</span>
                <span className="block text-xs text-slate-400 mt-1">Deep royal forest greens combined with elegant gold foil borders and classic serif lettering. Perfect for grand evening venues.</span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-100">
                <span className="font-serif font-bold text-slate-800 text-sm">🟡 Ivory Classic</span>
                <span className="block text-xs text-slate-400 mt-1">Soft cream and clean parchment backgrounds overlaid with dark slate text layouts. Ideal for elegant daylight events.</span>
              </div>
            </div>
          </div>
          
          <div className="w-full lg:w-80 shrink-0 text-center space-y-4">
            <div className="p-6 bg-white rounded-2xl shadow-md border border-slate-100 space-y-4">
              <span className="text-3xl">✨</span>
              <p className="font-serif text-base text-slate-800">Ready to start designing your card?</p>
              <p className="text-xs text-slate-400">Join thousands of wedding hosts and build gorgeous, responsive stationery details for free.</p>
              <Link 
                href="/register" 
                className="block w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-sm"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Footer */}
      <footer className="border-t border-slate-100 bg-slate-50/50 py-12 relative z-10 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="h-6 w-6 rounded-full border border-amber-500 flex items-center justify-center text-slate-800 font-serif text-[10px] font-bold bg-amber-50 shadow-sm">
              T
            </span>
            <span className="font-serif text-sm font-bold text-slate-900 tracking-wider">TAABIR</span>
          </div>

          <p className="text-xs text-slate-400 font-sans">
            &copy; {new Date().getFullYear()} Taabir Digital Wedding Stationery. All rights reserved.
          </p>

          <div className="pt-4 border-t border-slate-200/50 max-w-xs mx-auto text-[11px] text-slate-400 font-bold uppercase tracking-[0.3em] font-sans">
            Powered by Flynx
          </div>
        </div>
      </footer>

    </div>
  );
}
