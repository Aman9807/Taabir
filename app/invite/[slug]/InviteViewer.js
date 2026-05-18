"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "../../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

/* ─────────────────────────────────────────────
   SPLIT-DOOR OPENING ANIMATION (Zareqia-style)
   Two panels slide LEFT and RIGHT away from a
   central gold seam, revealing the card beneath.
───────────────────────────────────────────── */

export default function InviteViewer({ invitation }) {
  const [phase, setPhase] = useState("closed"); // closed → opening → open
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const isIvory = invitation.theme?.templateId === "ivory-classic";

  // Countdown
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // RSVP
  const [rsvp, setRsvp] = useState({ name: "", attending: "yes", guests: 1, blessing: "" });
  const [rsvpDone, setRsvpDone] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  const targetDate = new Date(invitation.weddingDate);

  /* ── Audio init ── */
  useEffect(() => {
    if (invitation.musicUrl) {
      audioRef.current = new Audio(invitation.musicUrl);
      audioRef.current.loop = true;
    }
    return () => { audioRef.current?.pause(); };
  }, [invitation.musicUrl]);

  /* ── Live countdown ── */
  useEffect(() => {
    const tick = () => {
      const diff = +targetDate - +new Date();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff / 3600000) % 24),
          minutes: Math.floor((diff / 60000) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [invitation.weddingDate]);

  /* ── Open handler ── */
  const handleOpen = () => {
    setPhase("opening");
    // After the doors swing open (800ms), show content
    setTimeout(() => setPhase("open"), 900);
    // Play music on user gesture
    if (audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {}); }
  };

  /* ── RSVP submit ── */
  const submitRsvp = async (e) => {
    e.preventDefault();
    if (!rsvp.name.trim()) return;
    setRsvpLoading(true);
    try {
      await addDoc(collection(db, "invitations", invitation.id, "rsvps"), {
        name: rsvp.name.trim(),
        attending: true,
        guests: 1,
        blessing: rsvp.blessing.trim(),
        submittedAt: new Date().toISOString(),
      });
      setRsvpDone(true);
    } catch (e) { console.error(e); }
    finally { setRsvpLoading(false); }
  };

  const fmt = targetDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const fmtTime = targetDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  /* ──────────────── THEME TOKENS ──────────────── */
  const T = isIvory
    ? { bg: "#FAF9F5", door: "#F0EDE4", seam: "#C5A880", card: "#FFFFFF", text: "#1e293b", sub: "#64748b", gold: "#92703B", border: "rgba(197,168,128,0.25)" }
    : { bg: "#00140D", door: "#001C12", seam: "#C5A880", card: "#001810", text: "#FAF9F5", sub: "#94a3b8", gold: "#C5A880", border: "rgba(197,168,128,0.2)" };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: "'Playfair Display', serif", position: "relative", overflowX: "hidden" }}>

      {/* ══════════════════════════════════════
          SPLIT-DOOR GATEWAY
          Left door slides LEFT, right door slides RIGHT
      ══════════════════════════════════════ */}
      {phase !== "open" && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          pointerEvents: phase === "opening" ? "none" : "auto",
        }}>
          {/* LEFT DOOR */}
          <div style={{
            position: "absolute", top: 0, left: 0,
            width: "50%", height: "100%",
            background: T.door,
            transform: phase === "opening" ? "translateX(-100%)" : "translateX(0)",
            transition: "transform 0.85s cubic-bezier(0.76, 0, 0.24, 1)",
            borderRight: `1px solid ${T.seam}`,
            // Subtle texture lines
            backgroundImage: `
              linear-gradient(to right, transparent 99%, ${T.seam}08 100%),
              radial-gradient(ellipse at 30% 50%, ${T.seam}08 0%, transparent 70%)
            `,
          }}>
            {/* Top decorative flourish */}
            <svg style={{ position: "absolute", top: 20, right: 20, opacity: 0.25 }} width="60" height="80" viewBox="0 0 60 80" fill="none">
              <path d="M30 0 L30 80 M0 40 L60 40 M10 10 L50 70 M50 10 L10 70" stroke={T.seam} strokeWidth="0.5"/>
              <circle cx="30" cy="40" r="15" stroke={T.seam} strokeWidth="0.5"/>
            </svg>
            {/* Bottom decorative flourish */}
            <svg style={{ position: "absolute", bottom: 20, left: 20, opacity: 0.25 }} width="60" height="80" viewBox="0 0 60 80" fill="none">
              <path d="M30 0 L30 80 M0 40 L60 40" stroke={T.seam} strokeWidth="0.5"/>
              <circle cx="30" cy="40" r="10" stroke={T.seam} strokeWidth="0.5"/>
            </svg>
          </div>

          {/* RIGHT DOOR */}
          <div style={{
            position: "absolute", top: 0, right: 0,
            width: "50%", height: "100%",
            background: T.door,
            transform: phase === "opening" ? "translateX(100%)" : "translateX(0)",
            transition: "transform 0.85s cubic-bezier(0.76, 0, 0.24, 1)",
            borderLeft: `1px solid ${T.seam}`,
            backgroundImage: `
              linear-gradient(to left, transparent 99%, ${T.seam}08 100%),
              radial-gradient(ellipse at 70% 50%, ${T.seam}08 0%, transparent 70%)
            `,
          }}>
            <svg style={{ position: "absolute", top: 20, left: 20, opacity: 0.25 }} width="60" height="80" viewBox="0 0 60 80" fill="none">
              <path d="M30 0 L30 80 M0 40 L60 40 M10 10 L50 70 M50 10 L10 70" stroke={T.seam} strokeWidth="0.5"/>
              <circle cx="30" cy="40" r="15" stroke={T.seam} strokeWidth="0.5"/>
            </svg>
            <svg style={{ position: "absolute", bottom: 20, right: 20, opacity: 0.25 }} width="60" height="80" viewBox="0 0 60 80" fill="none">
              <path d="M30 0 L30 80 M0 40 L60 40" stroke={T.seam} strokeWidth="0.5"/>
              <circle cx="30" cy="40" r="10" stroke={T.seam} strokeWidth="0.5"/>
            </svg>
          </div>

          {/* CENTER GOLD SEAM LINE */}
          <div style={{
            position: "absolute", top: 0, left: "50%",
            width: 1, height: "100%",
            background: `linear-gradient(to bottom, transparent, ${T.seam}, transparent)`,
            transform: "translateX(-50%)",
            opacity: 0.6,
          }} />

          {/* WAX SEAL — centered on the seam */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: phase === "opening"
              ? "translate(-50%, -50%) scale(0) rotate(45deg)"
              : "translate(-50%, -50%) scale(1) rotate(0deg)",
            transition: "transform 0.5s cubic-bezier(0.76, 0, 0.24, 1)",
            zIndex: 10,
            cursor: "pointer",
          }}
            onClick={handleOpen}
          >
            {/* Outer glow ring */}
            <div style={{
              position: "absolute", inset: -12,
              borderRadius: "50%",
              border: `1px solid ${T.seam}`,
              opacity: 0.3,
              animation: "pulse 2.5s ease-in-out infinite",
            }} />
            {/* Seal button */}
            <div style={{
              width: 96, height: 96,
              borderRadius: "50%",
              background: `radial-gradient(circle at 35% 35%, ${isIvory ? "#2a1a08" : "#012519"}, ${isIvory ? "#1a0e04" : "#001810"})`,
              border: `2px solid ${T.seam}`,
              boxShadow: `0 0 30px ${T.seam}30, 0 4px 20px rgba(0,0,0,0.4)`,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 2,
            }}>
              {/* Monogram */}
              <span style={{ color: T.gold, fontFamily: "Playfair Display, serif", fontSize: 20, fontWeight: 500, lineHeight: 1 }}>
                {invitation.brideName[0]}&{invitation.groomName[0]}
              </span>
              <span style={{ color: `${T.gold}90`, fontFamily: "sans-serif", fontSize: 7, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                Tap to Open
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          INNER CARD (visible after doors open)
      ══════════════════════════════════════ */}
      <div style={{
        opacity: phase === "open" ? 1 : 0,
        transform: phase === "open" ? "translateY(0)" : "translateY(32px)",
        transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
        maxWidth: 680,
        margin: "0 auto",
        padding: "48px 24px 80px",
      }}>

        {/* ── Bismillah ── */}
        <ScrollReveal>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <p style={{ color: T.gold, fontSize: 26, fontFamily: "Noto Naskh Arabic, serif", marginBottom: 6, lineHeight: 1.6 }}>
              {invitation.headerArabic || "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"}
            </p>
            <p style={{ color: T.sub, fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              {invitation.headerGrace || "Under the Grace of Almighty Allah"}
            </p>
          </div>
        </ScrollReveal>

        {/* ── Gold divider ── */}
        <ScrollReveal>
          <GoldDivider color={T.gold} />
        </ScrollReveal>

        {/* ── Couple Names ── */}
        <ScrollReveal>
          <div style={{ textAlign: "center", padding: "36px 0" }}>
            <p style={{ color: T.sub, fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 12 }}>
              The Wedding of
            </p>
            <h1 style={{ color: T.text, fontSize: 44, fontWeight: 400, lineHeight: 1.15, margin: 0 }}>
              {invitation.brideName}
            </h1>
            {invitation.brideParentsName && (
              <p style={{ color: T.sub, fontSize: 12, marginTop: 4, fontStyle: "italic" }}>
                Daughter of {invitation.brideParentsName}
              </p>
            )}
            <p style={{ color: T.gold, fontSize: 22, margin: "12px 0", fontStyle: "italic" }}>&amp;</p>
            <h1 style={{ color: T.text, fontSize: 44, fontWeight: 400, lineHeight: 1.15, margin: 0 }}>
              {invitation.groomName}
            </h1>
            {invitation.groomParentsName && (
              <p style={{ color: T.sub, fontSize: 12, marginTop: 4, fontStyle: "italic" }}>
                Son of {invitation.groomParentsName}
              </p>
            )}
          </div>
        </ScrollReveal>

        {/* ── Quranic quote ── */}
        <ScrollReveal>
          <div style={{ textAlign: "center", padding: "20px 32px", margin: "0 auto 36px", maxWidth: 420, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
            <p style={{ color: T.gold, fontSize: 13, fontStyle: "italic", margin: 0, letterSpacing: "0.02em" }}>
              &ldquo;And We created you in pairs&rdquo;
            </p>
            <p style={{ color: T.sub, fontFamily: "sans-serif", fontSize: 10, marginTop: 6, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              — Quran 78:8
            </p>
          </div>
        </ScrollReveal>

        {/* ── Couple Photo Gallery ── */}
        {(() => {
          const galleryPhotos = invitation.photos || (invitation.photoUrl ? [invitation.photoUrl] : []);
          if (galleryPhotos.length === 0) return null;
          return (
            <ScrollReveal>
              <div style={{ margin: "0 auto 40px", maxWidth: 440 }}>
                <div style={{ border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden", background: T.card, padding: 6, position: "relative" }}>
                  <div style={{ borderRadius: 12, overflow: "hidden", aspectRatio: "4/3", position: "relative" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={galleryPhotos[activePhotoIdx]} alt="Couple" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "all 0.5s ease-in-out" }} />
                    
                    {galleryPhotos.length > 1 && (
                      <>
                        {/* Left Arrow Button */}
                        <button
                          type="button"
                          onClick={() => setActivePhotoIdx((prev) => (prev === 0 ? galleryPhotos.length - 1 : prev - 1))}
                          style={{
                            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                            background: "rgba(0,0,0,0.65)", color: "#fff", border: "none", borderRadius: "50%",
                            width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", fontSize: 18, transition: "background 0.2s", zIndex: 10, outline: "none"
                          }}
                        >
                          ‹
                        </button>

                        {/* Right Arrow Button */}
                        <button
                          type="button"
                          onClick={() => setActivePhotoIdx((prev) => (prev === galleryPhotos.length - 1 ? 0 : prev + 1))}
                          style={{
                            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                            background: "rgba(0,0,0,0.65)", color: "#fff", border: "none", borderRadius: "50%",
                            width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", fontSize: 18, transition: "background 0.2s", zIndex: 10, outline: "none"
                          }}
                        >
                          ›
                        </button>

                        {/* Dots indicator */}
                        <div style={{
                          position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
                          display: "flex", gap: 6, zIndex: 10
                        }}>
                          {galleryPhotos.map((_, i) => (
                            <div
                              key={i}
                              onClick={() => setActivePhotoIdx(i)}
                              style={{
                                width: 8, height: 8, borderRadius: "50%",
                                background: i === activePhotoIdx ? T.gold : "rgba(255,255,255,0.5)",
                                cursor: "pointer", transition: "background 0.2s"
                              }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          );
        })()}

        {/* ── Countdown ── */}
        <ScrollReveal>
          <div style={{ margin: "0 auto 40px", maxWidth: 440 }}>
            <p style={{ textAlign: "center", color: T.sub, fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>
              Countdown to the Celebration
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {[["days", timeLeft.days], ["hours", timeLeft.hours], ["mins", timeLeft.minutes], ["secs", timeLeft.seconds]].map(([label, val]) => (
                <div key={label} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px 8px", textAlign: "center" }}>
                  <span style={{ color: T.text, fontSize: 28, fontWeight: 500, display: "block", lineHeight: 1 }}>
                    {String(val).padStart(2, "0")}
                  </span>
                  <span style={{ color: T.gold, fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 4, display: "block" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ── Venue & Date ── */}
        <ScrollReveal>
          <div style={{ border: `1px solid ${T.border}`, borderRadius: 16, padding: "28px 32px", margin: "0 auto 40px", maxWidth: 440, background: T.card, textAlign: "center" }}>
            <p style={{ color: T.gold, fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>Date &amp; Venue</p>
            <p style={{ color: T.text, fontSize: 16, fontWeight: 500, marginBottom: 4 }}>{fmt}</p>
            <p style={{ color: T.sub, fontSize: 13, marginBottom: 16 }}>at {fmtTime}</p>
            <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
              <p style={{ color: T.text, fontSize: 15, fontWeight: 500, marginBottom: 4 }}>{invitation.venue.name}</p>
              <p style={{ color: T.sub, fontSize: 12 }}>{invitation.venue.address}</p>
            </div>
            {invitation.venue.googleMapsUrl && (
              <a href={invitation.venue.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-block", marginTop: 16, color: T.gold, fontFamily: "sans-serif", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none", borderBottom: `1px solid ${T.gold}40`, paddingBottom: 2 }}>
                📍 Open in Maps
              </a>
            )}
          </div>
        </ScrollReveal>

        {/* ── Schedule ── */}
        {invitation.details?.schedule?.length > 0 && (
          <div style={{ margin: "0 auto 40px", maxWidth: 440 }}>
            <ScrollReveal>
              <p style={{ textAlign: "center", color: T.sub, fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20 }}>
                Celebrations Schedule
              </p>
            </ScrollReveal>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {invitation.details.schedule.map((ev, i) => {
                const d = new Date(ev.time);
                return (
                  <ScrollReveal key={i}>
                    <div style={{ border: `1px solid ${T.border}`, borderRadius: 14, padding: "18px 22px", background: T.card, display: "flex", alignItems: "flex-start", gap: 14 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.gold, marginTop: 6, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ color: T.text, fontSize: 15, fontWeight: 500, margin: "0 0 4px" }}>{ev.name}</p>
                        <p style={{ color: T.gold, fontFamily: "sans-serif", fontSize: 11, margin: "0 0 4px" }}>
                          {d.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" })} · {d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {ev.venue && (
                          <p style={{ color: T.text, fontSize: 12, fontWeight: 500, margin: "0 0 4px", opacity: 0.9 }}>
                            📍 Venue: {ev.venue}
                          </p>
                        )}
                        {ev.description && <p style={{ color: T.sub, fontSize: 12, margin: 0, fontStyle: "italic" }}>{ev.description}</p>}
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        )}

        {/* ── RSVP ── */}
        <div style={{ margin: "0 auto 40px", maxWidth: 440 }}>
          <ScrollReveal>
            <GoldDivider color={T.gold} />
            <p style={{ textAlign: "center", color: T.text, fontSize: 22, fontWeight: 400, margin: "28px 0 6px" }}>Kindly RSVP</p>
            <p style={{ textAlign: "center", color: T.sub, fontFamily: "sans-serif", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 24 }}>
              Let us know you are coming
            </p>
          </ScrollReveal>

          {rsvpDone ? (
            <ScrollReveal>
              <div style={{ textAlign: "center", padding: "32px 24px", border: `1px solid ${T.border}`, borderRadius: 16, background: T.card }}>
                <p style={{ fontSize: 32, marginBottom: 12 }}>✨</p>
                <p style={{ color: T.text, fontSize: 16 }}>Blessings Received!</p>
                <p style={{ color: T.sub, fontFamily: "sans-serif", fontSize: 12, marginTop: 6 }}>Thank you — we look forward to celebrating with you.</p>
              </div>
            </ScrollReveal>
          ) : (
            <ScrollReveal>
              <form onSubmit={submitRsvp} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Your Full Name", type: "text", val: rsvp.name, set: v => setRsvp(r => ({ ...r, name: v })), ph: "e.g. Faisal Khan" },
                ].map(f => (
                  <div key={f.label}>
                    <label style={labelStyle(T)}>{f.label}</label>
                    <input type={f.type} required placeholder={f.ph} value={f.val} onChange={e => f.set(e.target.value)} style={inputStyle(T)} />
                  </div>
                ))}
                <div>
                  <label style={labelStyle(T)}>Wishes &amp; Blessings</label>
                  <textarea rows={3} placeholder="Write a blessing..." value={rsvp.blessing} onChange={e => setRsvp(r => ({ ...r, blessing: e.target.value }))} style={{ ...inputStyle(T), resize: "none" }} />
                </div>
                <button type="submit" disabled={rsvpLoading} style={{
                  padding: "14px", borderRadius: 12, border: "none", cursor: "pointer",
                  background: isIvory ? "#1e293b" : `linear-gradient(135deg, #C5A880, #A07840)`,
                  color: isIvory ? "#fff" : "#00140D",
                  fontFamily: "sans-serif", fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.2em", textTransform: "uppercase", transition: "opacity 0.2s",
                  opacity: rsvpLoading ? 0.6 : 1,
                }}>
                  {rsvpLoading ? "Sending..." : "Send RSVP & Blessings"}
                </button>
              </form>
            </ScrollReveal>
          )}
        </div>

        {/* ── Contact Email ── */}
        {invitation.coupleEmail && (
          <ScrollReveal>
            <div style={{ textAlign: "center", margin: "0 auto 40px", maxWidth: 440, borderTop: `1px solid ${T.border}`, paddingTop: 24 }}>
              <p style={{ color: T.gold, fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>
                Contact the Couple
              </p>
              <a href={`mailto:${invitation.coupleEmail}`} style={{ color: T.text, fontSize: 14, textDecoration: "none", borderBottom: `1px solid ${T.gold}50`, paddingBottom: 2, fontFamily: "sans-serif" }}>
                {invitation.coupleEmail}
              </a>
            </div>
          </ScrollReveal>
        )}

        {/* ── Footer ── */}
        <div style={{ textAlign: "center", paddingTop: 24, borderTop: `1px solid ${T.border}` }}>
          <p style={{ color: `${T.sub}80`, fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase" }}>
            Taabir Digital Invitations · Powered by Flynx
          </p>
        </div>
      </div>

      {/* ── Floating Music Button ── */}
      {invitation.musicUrl && phase === "open" && (
        <button onClick={toggleMusic} style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 50,
          width: 48, height: 48, borderRadius: "50%", border: `1px solid ${T.border}`,
          background: isIvory ? "#fff" : "#022E1F",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: T.gold, fontSize: 18, transition: "transform 0.15s",
        }}>
          {isPlaying ? "♪" : "♩"}
        </button>
      )}

      {/* ── Keyframe animation for seal pulse ── */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.15); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

/* ── Scroll Reveal Component ── */
function ScrollReveal({ children }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // Trigger only once
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px", // Animates slightly before entering the center of viewport
      }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {children}
    </div>
  );
}

/* ── Shared style helpers ── */
function GoldDivider({ color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0" }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${color}40)` }} />
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, opacity: 0.6 }} />
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${color}40)` }} />
    </div>
  );
}

function labelStyle(T) {
  return { display: "block", color: T.gold, fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6, fontWeight: 700 };
}

function inputStyle(T) {
  return {
    display: "block", width: "100%", padding: "12px 16px", borderRadius: 10,
    border: `1px solid ${T.border}`, background: T.card, color: T.text,
    fontFamily: "sans-serif", fontSize: 13, outline: "none", boxSizing: "border-box",
  };
}
