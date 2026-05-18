"use client";

import { useState } from "react";
import Link from "next/link";

export default function LandingPage() {

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-800 selection:bg-amber-100 font-sans relative overflow-hidden select-none">
      
      {/* Decorative luxury lattice background grids */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#C5A880_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

      {/* Top Elegant Header */}
      <header className="border-b border-slate-100 bg-white/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="Taabir Logo" className="h-10 w-10 drop-shadow-md" />
            <span className="font-serif text-xl font-bold text-slate-900 tracking-wide">TAABIR</span>
          </div>

          <nav className="flex items-center gap-6">
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

      {/* ======================================================== */}
      {/* 🚀 HERO SECTION (Featuring Interactive Real Demo Mockup) */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Copy */}
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-50 text-amber-800 text-[10px] font-bold uppercase tracking-widest font-mono">
            ✨ 100% Free Invitation Service
          </span>
          
          <h1 className="text-4xl sm:text-6xl font-serif font-light text-slate-900 tracking-wide leading-tight">
            Elegantly Crafting Your <span className="text-amber-600 italic font-normal">Forever</span> Story
          </h1>
          
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-sans max-w-lg">
            Create gorgeous, interactive mobile-responsive digital wedding invitation cards in minutes. Share timelines, location maps, couple photos, background music, and collect RSVPs—completely free.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all text-center"
            >
              Design Your Card Now
            </Link>
            <Link
              href="/templates"
              className="w-full sm:w-auto px-8 py-4 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-xl transition-all text-center"
            >
              View Demo Templates
            </Link>
          </div>
        </div>

        {/* Right side: Luxurious Multi-Template Preview Showcase */}
        <div className="flex justify-center lg:justify-end relative w-full h-[520px] max-w-[450px] mx-auto lg:mx-0 group select-none">
          
          {/* A. Ivory Classic Preview Background Card */}
          <div className="absolute top-12 right-2 w-[240px] aspect-[9/16] bg-[#FAF9F6] border-2 border-[#D4AF37]/35 rounded-[28px] shadow-lg rotate-[8deg] transition-all duration-700 group-hover:rotate-[14deg] group-hover:translate-x-6 overflow-hidden pointer-events-none">
            {/* Subtle elegant design inner elements */}
            <div className="absolute inset-2.5 border border-[#D4AF37]/15 rounded-[20px] z-10 flex flex-col justify-between p-4 text-center text-slate-800">
              <span className="block text-[6px] tracking-[0.25em] text-[#D4AF37] font-bold uppercase mt-2">Wedding Celebration</span>
              <div className="my-2 font-serif text-[10px]">
                <h4 className="font-semibold text-slate-900">Sophia Carter</h4>
                <span className="block text-[7px] text-[#D4AF37] italic my-0.5">and</span>
                <h4 className="font-semibold text-slate-900">Daniel Mills</h4>
              </div>
              <div className="rounded-lg overflow-hidden aspect-[4/3] max-w-[120px] mx-auto my-1 border border-[#D4AF37]/20 p-0.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1606216794074-735e91aa2c92?q=80&w=300"
                  alt="Couple Mockup"
                  className="object-cover w-full h-full rounded"
                />
              </div>
              <div className="border-t border-[#D4AF37]/20 pt-2 text-[7px] text-slate-500">
                <p className="font-bold text-[#D4AF37] text-[6px] tracking-widest font-sans uppercase">Ivory Classic Theme</p>
                <p className="font-serif italic">chapel ceremony &amp; banquet</p>
              </div>
            </div>
          </div>

          {/* B. Emerald Noir Preview Main Card */}
          <div className="absolute top-4 left-2 w-[240px] aspect-[9/16] bg-[#001c12] border-2 border-[#C5A880]/35 rounded-[28px] shadow-2xl -rotate-[6deg] transition-all duration-700 group-hover:-rotate-[12deg] group-hover:-translate-x-6 overflow-hidden pointer-events-none z-10">
            {/* Double interior gold foil borders */}
            <div className="absolute inset-2 border border-[#C5A880]/15 rounded-[22px]"></div>
            <div className="absolute inset-3 border border-[#C5A880]/30 rounded-[20px] flex flex-col justify-between p-4 text-center text-[#FAF9F5]">
              <span className="block text-[#C5A880]/80 text-[6px] uppercase tracking-widest mt-2 font-mono">Wedding Invitation</span>
              <div className="my-2 font-serif text-[10px]">
                <h4 className="font-light text-white">Sarah Ahmed</h4>
                <p className="text-[7px] text-[#C5A880] italic">and</p>
                <h4 className="font-light text-white">Michael Khan</h4>
              </div>
              <div className="rounded-lg overflow-hidden aspect-[4/3] max-w-[120px] mx-auto my-1 border border-[#C5A880]/20 p-0.5 bg-[#00120B]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=300"
                  alt="Couple Mockup"
                  className="object-cover w-full h-full rounded"
                />
              </div>
              <div className="border-t border-[#C5A880]/20 pt-2 text-[7px] text-slate-400">
                <p className="font-bold text-[#C5A880] text-[6px] tracking-widest uppercase">Emerald Noir Theme</p>
                <p className="font-serif italic">nikkah, barat &amp; walima</p>
              </div>
            </div>
          </div>

          {/* C. Glowing Interactive Call-To-Action Overlay */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <Link
              href="/templates"
              className="px-6 py-4 bg-slate-950/90 hover:bg-amber-500 hover:text-slate-950 text-amber-400 font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 shadow-2xl border border-amber-500/40 hover:border-amber-600 hover:scale-105 flex items-center gap-2 group/btn animate-pulse hover:animate-none"
            >
              <span>🎨</span>
              <span>Explore Live Templates</span>
              <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

        </div>

      </section>

      {/* ======================================================== */}
      {/* 🛠️ FEATURES GRID SECTION                                 */}
      {/* ======================================================== */}
      <section id="features" className="bg-white border-t border-slate-100 py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 font-light tracking-wide">
              Complete Interactivity for the Perfect Card
            </h2>
            <p className="text-sm text-slate-500 font-sans leading-relaxed">
              Why settle for a static, print-styled PDF when you can invite family and friends with a living web portal?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-slate-100 bg-[#FAF9F5]/40 hover:shadow-md transition-all">
              <span className="text-3xl">🛡️</span>
              <h3 className="text-base font-serif font-bold text-slate-800 mt-4">100% Free Service</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                No paywalls, subscription tiers, or credit card entries. Build and generate invites completely free.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-slate-100 bg-[#FAF9F5]/40 hover:shadow-md transition-all">
              <span className="text-3xl">🗓️</span>
              <h3 className="text-base font-serif font-bold text-slate-800 mt-4">Multi-Event Scheduler</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Organize sub-schedules (Mehndi, Barat, Reception) with dynamic chronological timeline rendering.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-slate-100 bg-[#FAF9F5]/40 hover:shadow-md transition-all">
              <span className="text-3xl">✍️</span>
              <h3 className="text-base font-serif font-bold text-slate-800 mt-4">Interactive RSVPs</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Guests enter attendance, guest counts, and personal blessings, synchronizing straight to your dashboard.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border border-slate-100 bg-[#FAF9F5]/40 hover:shadow-md transition-all">
              <span className="text-3xl">🎵</span>
              <h3 className="text-base font-serif font-bold text-slate-800 mt-4">Ambient Background Audio</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Provide custom direct MP3 music URLs, playing instrumentals elegantly when envelope lids pop open.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 👣 BRAND FOOTER WITH FLYNX SIGNATURE                    */}
      {/* ======================================================== */}
      <footer className="border-t border-slate-100 bg-slate-50/50 py-12 relative z-10 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="Taabir Logo" className="h-6 w-6 drop-shadow-sm" />
            <span className="font-serif text-sm font-bold text-slate-900 tracking-wider">TAABIR</span>
          </div>

          <p className="text-xs text-slate-400 font-sans">
            &copy; {new Date().getFullYear()} Taabir Digital Wedding Stationery. All rights reserved.
          </p>

          {/* Core branding tag */}
          <div className="pt-4 border-t border-slate-200/50 max-w-xs mx-auto text-[11px] text-slate-400 font-bold uppercase tracking-[0.3em] font-sans">
            Powered by Flynx
          </div>
        </div>
      </footer>

    </div>
  );
}
