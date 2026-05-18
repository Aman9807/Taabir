"use client";

import Link from "next/link";
import { useState } from "react";

const TEMPLATES = [
  {
    id: "emerald-noir",
    name: "Emerald Noir",
    badge: "Most Popular",
    vibe: "Deep luxury, gold foil accents, traditional calligraphy, and a captivating digital wax-seal opening experience.",
    primaryColor: "bg-[#002E1F]",
    textColor: "text-[#C5A880]",
    paletteColors: ["#002E1F", "#012519", "#C5A880", "#FAF9F5"],
    fonts: "Playfair Display, Noto Naskh Arabic",
    features: [
      "Interactive Digital Wax-Seal Envelope",
      "Traditional Arabic Calligraphy Header",
      "Ambient Background Instrumental Music Support",
      "Multi-Event Chronological Timeline",
      "High-Fidelity Couple Photo Cover",
      "Instant Guest RSVP Form & Direct Dashboard Sync"
    ],
    bgClass: "bg-[#001c12] border-[#C5A880]/30",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800",
    cardTheme: "dark",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    titleColor: "text-white group-hover:text-amber-300",
    vibeColor: "text-slate-300",
    featureColor: "text-slate-200",
    btnSecondaryClass: "bg-white/10 hover:bg-white/20 text-[#FAF9F5] border-white/10"
  },
  {
    id: "ivory-classic",
    name: "Ivory Classic",
    badge: "Minimalist Elegance",
    vibe: "Timeless cream tones, sophisticated slate typography, clean layouts, and delicate royal floral themes.",
    primaryColor: "bg-[#FAF9F6]",
    textColor: "text-[#D4AF37]",
    paletteColors: ["#FAF9F6", "#FFFFFF", "#D4AF37", "#1A1A1A"],
    fonts: "Playfair Display, Inter",
    features: [
      "Timeless Off-White Cream & Warm Gold Palette",
      "Sleek & Seamless Single-Page Scrolling",
      "Modern Typography with Romantic Accents",
      "Elegant Couples Memory Card Block",
      "Google Maps Location Integration",
      "Fully Integrated RSVP Form & Guest Counter"
    ],
    bgClass: "bg-[#FDFCF7] border-amber-200/40",
    image: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?q=80&w=800",
    cardTheme: "light",
    badgeClass: "bg-amber-500/10 text-amber-700 border-amber-500/30",
    titleColor: "text-slate-900 group-hover:text-amber-600",
    vibeColor: "text-slate-600",
    featureColor: "text-slate-700",
    btnSecondaryClass: "bg-slate-900/5 hover:bg-slate-900/10 text-slate-800 border-slate-200"
  },
  {
    id: "minimalist-romance",
    name: "Minimalist Romance",
    badge: "Modern & Spacious",
    vibe: "Clean spacious layouts, towering full-viewport parallax hero visuals, deep charcoal serif typography, and warm champagne accents.",
    primaryColor: "bg-[#FFFFF0]",
    textColor: "text-[#333333]",
    paletteColors: ["#FFFFF0", "#F7E7CE", "#333333", "#FFFFFF"],
    fonts: "Playfair Display, Lora",
    features: [
      "Spacious Full-Viewport Hero Page Sections",
      "Continuous Slow Parallax Scrolling Imagery",
      "Sophisticated Playfair Display & Lora Serif Styling",
      "Scroll-Triggered Fade-In-Up Animations (1.5s)",
      "Gentle RSVP Button Pulse Animation Loop",
      "Interactive Date Scratcher & Message Sync"
    ],
    bgClass: "bg-[#FFFFF0] border-amber-200/40",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800",
    cardTheme: "light",
    badgeClass: "bg-yellow-500/10 text-yellow-800 border-yellow-500/30",
    titleColor: "text-slate-900 group-hover:text-yellow-600",
    vibeColor: "text-slate-600",
    featureColor: "text-slate-700",
    btnSecondaryClass: "bg-slate-900/5 hover:bg-slate-900/10 text-slate-800 border-slate-200"
  },
  {
    id: "dark-moody-elegant",
    name: "Dark Moody & Elegant",
    badge: "New Immersive Story",
    vibe: "A luxurious, dark-themed digital invitation. Cinzel cinematic headers, Ken Burns animated hero loops, and staggered event lists.",
    primaryColor: "bg-[#0F0F0F]",
    textColor: "text-[#D4AF37]",
    paletteColors: ["#0F0F0F", "#043927", "#D4AF37", "#FFFFFF"],
    fonts: "Cinzel, Montserrat",
    features: [
      "Luxurious Cinematic Immersive Story Layout",
      "Continuous Ken Burns Photo Zoom Effects",
      "Staggered Event Timeline Cards (0.3s Delay)",
      "Reveal-from-Left Title Letter Masking",
      "Polished Gold & Deep Emerald Accents",
      "Interactive Golden Date Scratcher Canvas"
    ],
    bgClass: "bg-[#0f0f0f] border-amber-500/25",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800",
    cardTheme: "dark",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    titleColor: "text-white group-hover:text-amber-300",
    vibeColor: "text-slate-300",
    featureColor: "text-slate-200",
    btnSecondaryClass: "bg-white/10 hover:bg-white/20 text-[#FAF9F5] border-white/10"
  },
  {
    id: "bohemian-terracotta",
    name: "Bohemian Terracotta Dream",
    badge: "Boho Chic Premium",
    vibe: "Warm boho-chic digital invitation with organic shapes, wave dividers, floating botanical SVGs, Pacifico typography, and Zoom-In-Fade transitions.",
    primaryColor: "bg-[#FFFDD0]",
    textColor: "text-[#E2725B]",
    paletteColors: ["#FFFDD0", "#E2725B", "#9DC183", "#333333"],
    fonts: "Pacifico, Roboto",
    features: [
      "Organic Scrolling Layout (No Rigid Boxes)",
      "Floating & Levitating Botanical SVGs",
      "Dynamic Zoom-In-Fade Content Entrances",
      "Chic Calligraphy & Clean Roboto Body",
      "Warm Terracotta Date Scratcher Canvas",
      "Integrated Soft Terracotta RSVP forms"
    ],
    bgClass: "bg-[#FFFDD0] border-amber-600/20",
    image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=800",
    cardTheme: "light",
    badgeClass: "bg-[#E2725B]/10 text-[#E2725B] border-[#E2725B]/20",
    titleColor: "text-[#E2725B] group-hover:text-[#d65c43]",
    vibeColor: "text-slate-700",
    featureColor: "text-slate-600",
    btnSecondaryClass: "bg-[#E2725B]/15 hover:bg-[#E2725B]/25 text-[#E2725B] border-transparent"
  },
  {
    id: "royal-glamour",
    name: "Royal Glamour & Glassmorphism",
    badge: "Frosted Luxury",
    vibe: "High-end glamorous wedding & birthday layout. Frost glass overlays, deep royal navy canvas, elegant rose gold elements, and scroll blur-reveals.",
    primaryColor: "bg-[#0A1128]",
    textColor: "text-[#FFFFFF]",
    paletteColors: ["#0A1128", "#B76E79", "#FFFFFF", "rgba(255,255,255,0.08)"],
    fonts: "Cormorant Garamond, Lato",
    features: [
      "Vibrant HSL Royal Navy & Rose Gold Accents",
      "Frosted Glassmorphic Overlay Event Cards",
      "Slide-Up-with-Blur-Reveal Scrolling Effect",
      "Sophisticated Cormorant Garamond Titles",
      "Pulsating Golden Stars & Slow Photo Zooms",
      "Integrated Modern RSVP Widget & Countdown"
    ],
    bgClass: "bg-[#0A1128] border-pink-500/20",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800",
    cardTheme: "dark",
    badgeClass: "bg-pink-500/10 text-pink-400 border-pink-500/30",
    titleColor: "text-white group-hover:text-pink-300",
    vibeColor: "text-slate-300",
    featureColor: "text-slate-200",
    btnSecondaryClass: "bg-pink-500/15 hover:bg-pink-500/25 text-[#FFFFFF] border-transparent"
  }
];

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-800 selection:bg-amber-100 font-sans relative overflow-hidden">
      
      {/* Decorative luxury background grids */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#C5A880_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

      {/* Elegant Header */}
      <header className="border-b border-slate-100 bg-white/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="Taabir Logo" className="h-10 w-10 drop-shadow-md group-hover:scale-105 transition-transform" />
            <span className="font-serif text-xl font-bold text-slate-900 tracking-wide">TAABIR</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/" className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-widest">
              Back to Home
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md"
            >
              Get Started Free
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        
        {/* Title and Intro */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-50 text-amber-800 text-[10px] font-bold uppercase tracking-widest font-mono">
            ✨ Exquisite Theme Selection
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-light text-slate-900 tracking-wide leading-tight">
            Choose Your <span className="text-amber-600 italic font-normal">Forever</span> Canvas
          </h1>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-sans max-w-xl mx-auto">
            Browse our carefully curated library of designer digital wedding invitation cards. Click any template to explore a live interactive demo and feel the digital luxury.
          </p>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {TEMPLATES.map((tpl) => (
            <div 
              key={tpl.id}
              className={`rounded-3xl border p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${tpl.bgClass} shadow-md relative group overflow-hidden`}
            >
              {/* Subtle light reflections */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

              <div>
                {/* Visual Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className={`inline-block px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider font-mono mb-2 border ${tpl.badgeClass}`}>
                      {tpl.badge}
                    </span>
                    <h2 className={`text-2xl font-serif font-bold transition-colors ${tpl.titleColor}`}>
                      {tpl.name}
                    </h2>
                  </div>
                  
                  {/* Color Palette Indicators */}
                  <div className="flex items-center gap-1.5 bg-slate-950/40 p-1.5 rounded-lg border border-white/5">
                    {tpl.paletteColors.map((color, index) => (
                      <span 
                        key={index}
                        className="w-4 h-4 rounded-full border border-white/20 block"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Cover Image Preview */}
                <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden border border-white/5 shadow-inner mb-6 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={tpl.image} 
                    alt={`${tpl.name} template layout preview`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <p className="text-[10px] uppercase tracking-widest text-[#FAF9F5]/80 font-mono">
                      Typography: {tpl.fonts}
                    </p>
                  </div>
                </div>

                {/* Vibe / Description */}
                <p className={`text-xs sm:text-sm leading-relaxed mb-6 italic ${tpl.vibeColor}`}>
                  &ldquo;{tpl.vibe}&rdquo;
                </p>

                {/* Feature checklist */}
                <div className="space-y-2 mb-8">
                  <p className={`text-[9px] uppercase tracking-widest font-bold font-mono ${tpl.cardTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Template Features:</p>
                  <ul className={`grid grid-cols-1 sm:grid-cols-2 gap-2 ${tpl.featureColor}`}>
                    {tpl.features.map((feature, index) => (
                      <li key={index} className="text-xs flex items-start gap-2">
                        <span className="text-amber-500 text-sm leading-none">✦</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 mt-auto">
                <Link
                  href={`/templates/preview/${tpl.id}`}
                  className={`py-3.5 border font-bold text-xs uppercase tracking-widest rounded-xl transition-all text-center flex items-center justify-center gap-2 ${tpl.btnSecondaryClass}`}
                >
                  👁️ See Live Demo
                </Link>
                <Link
                  href={`/register?template=${tpl.id}`}
                  className="py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md text-center flex items-center justify-center gap-2"
                >
                  ✨ Customize &amp; Use
                </Link>
              </div>

            </div>
          ))}
        </div>

        {/* Dynamic decorative seal bottom section */}
        <div className="mt-20 border-t border-slate-200/60 pt-16 text-center max-w-xl mx-auto space-y-6">
          <div className="inline-flex h-12 w-12 rounded-full border border-amber-500/30 items-center justify-center text-amber-600 font-serif text-lg bg-amber-50/50 shadow-inner">
            ❦
          </div>
          <h3 className="text-xl font-serif text-slate-900 font-light">Can&apos;t decide between themes?</h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-sans">
            Don&apos;t worry! You can easily switch themes, colors, background music, or custom photo uploads at any time with a single click from your interactive management dashboard.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-block px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all"
            >
              Start Creating Now (100% Free)
            </Link>
          </div>
        </div>

      </main>

      {/* Brand Footer */}
      <footer className="border-t border-slate-100 bg-slate-50/50 py-12 relative z-10 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="Taabir Logo" className="h-6 w-6 drop-shadow-sm" />
            <span className="font-serif text-sm font-bold text-slate-900 tracking-wider">TAABIR</span>
          </div>
          <p className="text-xs text-slate-400 font-sans font-medium">
            &copy; {new Date().getFullYear()} Taabir Digital Wedding Stationery. All rights reserved.
          </p>
          <div className="pt-4 border-t border-slate-200/50 max-w-xs mx-auto text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] font-sans">
            Powered by Flynx
          </div>
        </div>
      </footer>

    </div>
  );
}
