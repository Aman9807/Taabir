"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "../../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

/* ─────────────────────────────────────────────────────────────────────────────
   PREMIUM INTERACTIVE INVITATION VIEWER (Antigravity Upgraded)
   - 4 Dynamic Transition Openings (Velvet Curtains, Starry Split Doors, 3D Book Flip, Fade Zoom)
   - Customized premium theme-colored Wax Seals & Tap buttons
   - HTML5 Canvas Golden Date Scratcher card with cascading DOM confetti burst
   - Dynamic English/Urdu translation deck using authentic Nastaliq Urdu typographies
   ───────────────────────────────────────────────────────────────────────────── */

export default function InviteViewer({ invitation }) {
  const [phase, setPhase] = useState("closed"); // closed → opening → open
  const [lang, setLang] = useState("en"); // en, ur, or hi
  const [scratchRevealed, setScratchRevealed] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [confettiFlakes, setConfettiFlakes] = useState([]);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const tplId = invitation.theme?.templateId || "emerald-noir";
  const eventType = invitation.eventType || "wedding";

  // Countdown State
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // RSVP Form State
  const [rsvp, setRsvp] = useState({ name: "", attending: "yes", blessing: "" });
  const [rsvpDone, setRsvpDone] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  const targetDate = new Date(invitation.weddingDate);

  // Read styling preferences
  const customStyle = invitation.styling || {};
  const btnBg = customStyle.btnBgColor || (tplId === "ivory-elegance" ? "#800020" : "#D4AF37");
  const btnText = customStyle.btnTextColor || "#FFFFFF";
  const animStyle = customStyle.doorAnimation || (tplId === "ivory-elegance" ? "velvet-curtains" : "sliding-doors");
  const hasScratch = !!customStyle.enableScratchCard;
  const hasLang = !!customStyle.enableLanguageSwitcher;

  // Multilingual translation dictionary
  const dict = {
    en: {
      wedding: "The Wedding of",
      birthday: "Celebrating the Birthday of",
      anniversary: "Celebrating the Anniversary of",
      family_function: "Welcome to the Family Gathering of",
      general: "Welcome to the Celebration of",
      daughterOf: "Daughter of",
      sonOf: "Son of",
      countdown: "Countdown to the Celebration",
      days: "Days",
      hours: "Hours",
      mins: "Mins",
      secs: "Secs",
      dateVenue: "Date & Venue",
      openMaps: "📍 Open in Maps",
      timelineTitle: "Celebrations Schedule",
      rsvpTitle: "Kindly RSVP",
      rsvpDesc: "Let us know you are coming",
      fullName: "Your Full Name",
      blessing: "Wishes & Blessings",
      sending: "Sending...",
      sendRsvp: "Send RSVP & Blessings",
      successTitle: "Blessings Received!",
      successDesc: "Thank you — we look forward to celebrating with you.",
      contactHosts: "Contact the Hosts",
      contactCouple: "Contact the Couple",
      scratchText: "Scratch here to reveal the date!"
    },
    ur: {
      wedding: "کی شادی خانہ آبادی",
      birthday: "کی سالگرہ کی تقریب",
      anniversary: "کی سالگرہ کی تقریب",
      family_function: "کا خاندانی اجتماع",
      general: "کی پروقار تقریب",
      daughterOf: "دختر",
      sonOf: "فرزند",
      countdown: "تقریب کا کاؤنٹ ڈاؤن",
      days: "دن",
      hours: "گھنٹے",
      mins: "منٹ",
      secs: "سیکنڈ",
      dateVenue: "تاریخ اور مقام",
      openMaps: "📍 گوگل میپس پر دیکھیں",
      timelineTitle: "تقریبات کا شیڈول",
      rsvpTitle: "شرکت کی اطلاع",
      rsvpDesc: "ہمیں اپنی شرکت سے آگاہ کریں",
      fullName: "آپ کا پورا نام",
      blessing: "نیک تمنائیں اور دعائیں",
      sending: "بھیجا جا رہا ہے...",
      sendRsvp: "دعائیں اور جواب بھیجیں",
      successTitle: "نیک دعائیں موصول ہو گئیں!",
      successDesc: "آپ کی محبت اور شرکت کا شکریہ — ہم آپ کا انتظار کریں گے۔",
      contactHosts: "میزبانوں سے رابطہ کریں",
      contactCouple: "جوڑے سے رابطہ کریں",
      scratchText: "تاریخ دیکھنے کے لیے یہاں سکریچ کریں!"
    },
    hi: {
      wedding: "की शुभ विवाह",
      birthday: "के जन्मदिन का उत्सव",
      anniversary: "की वर्षगांठ का उत्सव",
      family_function: "का पारिवारिक समारोह",
      general: "का शुभ उत्सव",
      daughterOf: "सुपुत्री",
      sonOf: "सुपुत्र",
      countdown: "समारोह की उल्टी गिनती",
      days: "दिन",
      hours: "घंटे",
      mins: "मिनट",
      secs: "सेकंड",
      dateVenue: "तिथि एवं स्थान",
      openMaps: "📍 मैप्स पर देखें",
      timelineTitle: "कार्यक्रम की समय-सारणी",
      rsvpTitle: "आरएसवीपी (उत्तर दें)",
      rsvpDesc: "कृपया हमें अपनी उपस्थिति बताएं",
      fullName: "आपका पूरा नाम",
      blessing: "शुभकामनाएं एवं आशीर्वाद",
      sending: "भेजा जा रहा है...",
      sendRsvp: "आरएसवीपी और शुभकामनाएं भेजें",
      successTitle: "शुभकामनाएं प्राप्त हुईं!",
      successDesc: "आपकी शुभकामनाओं और उपस्थिति की सूचना के लिए धन्यवाद - हम आपके स्वागत की प्रतीक्षा कर रहे हैं।",
      contactHosts: "मेजबानों से संपर्क करें",
      contactCouple: "वर-वधू से संपर्क करें",
      scratchText: "तारीख देखने के लिए यहां स्क्रैच करें!"
    }
  };

  const text = dict[lang] || dict.en;

  // Music Player setup
  useEffect(() => {
    if (invitation.musicUrl) {
      audioRef.current = new Audio(invitation.musicUrl);
      audioRef.current.loop = true;
    }
    return () => { audioRef.current?.pause(); };
  }, [invitation.musicUrl]);

  // Live Countdown tick
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

  // Gallery slideshow Ken Burns
  useEffect(() => {
    const galleryPhotos = invitation.photos || (invitation.photoUrl ? [invitation.photoUrl] : []);
    if (galleryPhotos.length <= 1 || phase !== "open") return;

    const timer = setInterval(() => {
      setActivePhotoIdx((prev) => (prev === galleryPhotos.length - 1 ? 0 : prev + 1));
    }, 4500);

    return () => clearInterval(timer);
  }, [invitation.photos, invitation.photoUrl, phase]);

  const handleOpen = () => {
    setPhase("opening");
    setTimeout(() => setPhase("open"), 1800);
    if (audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {}); }
  };

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
    } catch (err) { console.error(err); }
    finally { setRsvpLoading(false); }
  };

  // Triggers DOM-based custom premium Confetti particle shower
  const triggerConfettiShower = () => {
    if (confettiActive) return;
    setConfettiActive(true);
    const colors = ["#FFD700", "#FF4500", "#FF1493", "#00BFFF", "#32CD32", "#FF8C00", "#C5A880"];
    const flakes = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2,
      duration: Math.random() * 2.5 + 2,
      spin: Math.random() * 360,
    }));
    setConfettiFlakes(flakes);
    setTimeout(() => {
      setConfettiActive(false);
      setConfettiFlakes([]);
    }, 5000);
  };

  const fmt = targetDate.toLocaleDateString(
    lang === "ur" ? "ur-PK" : lang === "hi" ? "hi-IN" : "en-US",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  );
  const fmtTime = targetDate.toLocaleTimeString(
    lang === "ur" ? "ur-PK" : lang === "hi" ? "hi-IN" : "en-US",
    { hour: "2-digit", minute: "2-digit" }
  );

  /* ──────────────── THEME TOKENS ──────────────── */
  const isIvory = tplId === "ivory-classic" || tplId === "ivory-elegance";
  const T = isIvory
    ? { 
        bg: "#FAF9F5", 
        door: "#FAF9F5", 
        seam: "#800020", 
        card: "#FFFFFF", 
        text: "#2c2317", 
        sub: "#6b5e4c", 
        gold: "#800020", 
        border: "rgba(128,0,32,0.15)" 
      }
    : { 
        bg: "#040B16", 
        door: "#06101E", 
        seam: "#D4AF37", 
        card: "#0A192F", 
        text: "#E2E8F0", 
        sub: "#8892B0", 
        gold: "#D4AF37", 
        border: "rgba(212,175,55,0.18)" 
      };

  return (
    <div style={{ 
      background: T.bg, 
      minHeight: "100vh", 
      fontFamily: lang === "ur" 
        ? "'Noto Nastaliq Urdu', serif" 
        : lang === "hi"
        ? "'Outfit', 'Playfair Display', sans-serif"
        : "'Playfair Display', serif", 
      position: "relative", 
      overflowX: "hidden",
      direction: lang === "ur" ? "rtl" : "ltr"
    }}>

      {/* FLOAT TRANSLATION TOGGLE BUTTON */}
      {hasLang && (
        <button
          onClick={() => setLang(l => l === "en" ? "ur" : l === "ur" ? "hi" : "en")}
          className="fixed top-4 right-4 z-[999] px-4 py-2 rounded-full text-xs font-bold shadow-lg transition-transform hover:scale-105 select-none font-sans"
          style={{
            backgroundColor: btnBg,
            color: btnText,
            border: `1px solid ${T.border}`,
          }}
        >
          {lang === "en" ? "اردو / हिंदी" : lang === "ur" ? "हिंदी / English" : "English / اردو"}
        </button>
      )}

      {/* DYNAMIC OPENING GATEWAYS */}
      {phase !== "open" && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, pointerEvents: phase === "opening" ? "none" : "auto", overflow: "hidden" }}>
          
          {/* CURTAIN PARTS ANIMATION */}
          {animStyle === "velvet-curtains" && (
            <>
              {/* Left Crimson Drape */}
              <div 
                className="curtain-panel"
                style={{
                  position: "absolute", top: 0, left: 0, width: "50%", height: "100%",
                  background: `linear-gradient(to right, #600010 0%, #a00020 60%, #40000a 100%)`,
                  boxShadow: "inset -15px 0 30px rgba(0,0,0,0.6)",
                  transform: phase === "opening" ? "translateX(-100%) scaleX(0.9) skewY(4deg)" : "translateX(0)",
                  transition: "transform 1.35s cubic-bezier(0.77, 0, 0.175, 1)",
                  transformOrigin: "left center"
                }}
              >
                {/* Velvet fabric gold details & cords */}
                <div style={{ position: "absolute", top: 0, bottom: 0, right: 10, width: 4, background: `linear-gradient(to bottom, #d4af37, #856404, #d4af37)`, opacity: 0.7 }} />
              </div>

              {/* Right Crimson Drape */}
              <div 
                className="curtain-panel"
                style={{
                  position: "absolute", top: 0, right: 0, width: "50%", height: "100%",
                  background: `linear-gradient(to left, #600010 0%, #a00020 60%, #40000a 100%)`,
                  boxShadow: "inset 15px 0 30px rgba(0,0,0,0.6)",
                  transform: phase === "opening" ? "translateX(100%) scaleX(0.9) skewY(-4deg)" : "translateX(0)",
                  transition: "transform 1.35s cubic-bezier(0.77, 0, 0.175, 1)",
                  transformOrigin: "right center"
                }}
              >
                <div style={{ position: "absolute", top: 0, bottom: 0, left: 10, width: 4, background: `linear-gradient(to bottom, #d4af37, #856404, #d4af37)`, opacity: 0.7 }} />
              </div>
            </>
          )}

          {/* SLIDING METALLIC DOUBLE DOORS */}
          {animStyle === "sliding-doors" && (
            <>
              {/* Left Starry Panel */}
              <div style={{
                position: "absolute", top: 0, left: 0, width: "50%", height: "100%", background: T.door,
                transform: phase === "opening" ? "translateX(-100%)" : "translateX(0)",
                transition: "transform 1.1s cubic-bezier(0.76, 0, 0.24, 1)",
                borderRight: `1px solid ${T.seam}`,
                backgroundImage: `linear-gradient(to right, transparent 99%, ${T.seam}15 100%), radial-gradient(ellipse at 30% 50%, ${T.seam}10 0%, transparent 60%)`
              }}>
                <div className="absolute top-8 right-8 text-amber-500/10 pointer-events-none text-7xl font-serif">✨</div>
              </div>

              {/* Right Starry Panel */}
              <div style={{
                position: "absolute", top: 0, right: 0, width: "50%", height: "100%", background: T.door,
                transform: phase === "opening" ? "translateX(100%)" : "translateX(0)",
                transition: "transform 1.1s cubic-bezier(0.76, 0, 0.24, 1)",
                borderLeft: `1px solid ${T.seam}`,
                backgroundImage: `linear-gradient(to left, transparent 99%, ${T.seam}15 100%), radial-gradient(ellipse at 70% 50%, ${T.seam}10 0%, transparent 60%)`
              }} />
            </>
          )}

          {/* 3D BOOK PAGE FLIP */}
          {animStyle === "book-flip" && (
            <div style={{
              position: "absolute", inset: 0, background: T.bg,
              perspective: 1200, zIndex: 110,
              transform: phase === "opening" ? "scale(1)" : "none",
              transition: "transform 1.2s",
            }}>
              <div style={{
                position: "absolute", inset: 0, background: T.door,
                transformOrigin: "left center",
                transform: phase === "opening" ? "rotateY(-130deg)" : "rotateY(0deg)",
                transition: "transform 1.35s cubic-bezier(0.645, 0.045, 0.355, 1)",
                boxShadow: "0 0 40px rgba(0,0,0,0.5)",
                backgroundImage: `radial-gradient(ellipse at center, ${T.seam}08 0%, transparent 80%)`,
                backfaceVisibility: "hidden"
              }} />
            </div>
          )}

          {/* LUMINOUS FADE ZOOM */}
          {animStyle === "fade-zoom" && (
            <div style={{
              position: "absolute", inset: 0, background: T.door,
              opacity: phase === "opening" ? 0 : 1,
              transform: phase === "opening" ? "scale(1.15)" : "scale(1)",
              transition: "opacity 1.1s ease-in-out, transform 1.1s ease-in-out",
            }} />
          )}

          {/* Central Seam line for doors */}
          {animStyle === "sliding-doors" && (
            <div style={{
              position: "absolute", top: 0, left: "50%", width: 1.5, height: "100%",
              background: `linear-gradient(to bottom, transparent, ${T.seam}, transparent)`,
              transform: "translateX(-50%)", opacity: 0.5,
            }} />
          )}

          {/* INTERACTIVE TAP BUTTON (Wax Seal shape) */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: phase === "opening" ? "translate(-50%, -50%) scale(0) rotate(90deg)" : "translate(-50%, -50%) scale(1) rotate(0deg)",
            transition: "transform 0.6s cubic-bezier(0.76, 0, 0.24, 1)", zIndex: 120, cursor: "pointer",
          }}
            onClick={handleOpen}
          >
            <div style={{ 
              position: "absolute", inset: -14, borderRadius: "50%", 
              border: `1px dashed ${T.seam}`, opacity: 0.4, 
              animation: "pulse 2.2s ease-in-out infinite" 
            }} />
            
            <div 
              style={{
                width: 104, height: 104, borderRadius: "50%",
                backgroundColor: btnBg,
                color: btnText,
                border: `3px double ${T.seam}`, 
                boxShadow: `0 0 35px rgba(0,0,0,0.5), inset 0 0 10px rgba(0,0,0,0.3)`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1.5,
              }}
            >
              <span className="font-serif text-lg font-bold tracking-widest leading-none">
                {invitation.groomName ? (
                  `${invitation.brideName[0]}&${invitation.groomName[0]}`
                ) : (
                  invitation.brideName[0]
                )}
              </span>
              <span className="text-[7.5px] uppercase font-sans tracking-[0.22em] font-extrabold opacity-95">
                {lang === "ur" ? "کھولیں" : "Tap Open"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING DOM CONFETTI FLAKES */}
      {confettiActive && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, overflow: "hidden" }}>
          {confettiFlakes.map((flake) => (
            <div
              key={flake.id}
              style={{
                position: "absolute",
                top: "-20px",
                left: `${flake.left}%`,
                width: flake.size,
                height: flake.size * 0.9,
                backgroundColor: flake.color,
                borderRadius: Math.random() > 0.5 ? "50%" : "3px",
                opacity: 0.9,
                transform: `rotate(${flake.spin}deg)`,
                animation: `fall ${flake.duration}s linear ${flake.delay}s infinite`
              }}
            />
          ))}
        </div>
      )}

      {/* INNER VIEWPORT INVITATION CARD */}
      <div 
        style={{
          opacity: phase !== "closed" ? 1 : 0,
          transform: phase !== "closed" ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 1.5s cubic-bezier(0.16, 1, 0.3, 1), transform 1.5s cubic-bezier(0.16, 1, 0.3, 1)",
          maxWidth: 660, margin: "0 auto", padding: "48px 24px 96px",
        }}
      >
        {/* Arabic Monogram Header */}
        <ScrollReveal>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <p style={{ color: T.gold, fontSize: 26, fontFamily: "'Noto Naskh Arabic', serif", marginBottom: 8, lineHeight: 1.6 }}>
              {invitation.headerArabic || "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"}
            </p>
            <p style={{ color: T.sub, fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              {invitation.headerGrace || "Under the Grace of Almighty Allah"}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <GoldDivider color={T.gold} />
        </ScrollReveal>

        {/* Dynamic Celebrations Header and Core Names */}
        <ScrollReveal>
          <div style={{ textAlign: "center", padding: "36px 0" }}>
            <p style={{ color: T.sub, fontFamily: "sans-serif", fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 16 }}>
              {eventType === "wedding" ? text.wedding : 
               eventType === "birthday" ? text.birthday : 
               eventType === "anniversary" ? text.anniversary : 
               eventType === "family_function" ? text.family_function : text.general}
            </p>
            
            <h1 style={{ color: T.text, fontSize: 48, fontWeight: 400, lineHeight: 1.15, margin: 0 }}>
              {invitation.brideName}
            </h1>
            {invitation.brideParentsName && (
              <p style={{ color: T.sub, fontSize: 12.5, marginTop: 6, fontStyle: "italic" }}>
                {eventType === "wedding" ? `${text.daughterOf} ${invitation.brideParentsName}` : invitation.brideParentsName}
              </p>
            )}

            {invitation.groomName && (
              <>
                <p style={{ color: T.gold, fontSize: 24, margin: "14px 0", fontStyle: "italic" }}>&amp;</p>
                <h1 style={{ color: T.text, fontSize: 48, fontWeight: 400, lineHeight: 1.15, margin: 0 }}>
                  {invitation.groomName}
                </h1>
                {invitation.groomParentsName && (
                  <p style={{ color: T.sub, fontSize: 12.5, marginTop: 6, fontStyle: "italic" }}>
                    {eventType === "wedding" ? `${text.sonOf} ${invitation.groomParentsName}` : invitation.groomParentsName}
                  </p>
                )}
              </>
            )}
          </div>
        </ScrollReveal>

        {/* Celebrations Quran Quote Verse */}
        <ScrollReveal>
          <div style={{ textAlign: "center", padding: "20px 32px", margin: "0 auto 40px", maxWidth: 440, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
            {eventType === "wedding" ? (
              <>
                <p style={{ color: T.gold, fontSize: 14.5, fontStyle: "italic", margin: 0, letterSpacing: "0.02em" }}>
                  &ldquo;And We created you in pairs&rdquo;
                </p>
                <p style={{ color: T.sub, fontFamily: "sans-serif", fontSize: 9.5, marginTop: 6, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                  — Quran 78:8
                </p>
              </>
            ) : eventType === "birthday" ? (
              <>
                <p style={{ color: T.gold, fontSize: 13.5, fontStyle: "italic", margin: 0 }}>
                  &ldquo;Wishing you a year filled with sweet moments, grand milestones, and beautiful memories!&rdquo;
                </p>
                <p style={{ color: T.sub, fontFamily: "sans-serif", fontSize: 9.5, marginTop: 6, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                  — Happy Birthday
                </p>
              </>
            ) : eventType === "anniversary" ? (
              <>
                <p style={{ color: T.gold, fontSize: 13.5, fontStyle: "italic", margin: 0 }}>
                  &ldquo;Real love stories never have endings. Wishing you another chapter of happiness together!&rdquo;
                </p>
                <p style={{ color: T.sub, fontFamily: "sans-serif", fontSize: 9.5, marginTop: 6, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                  — Happy Anniversary
                </p>
              </>
            ) : (
              <>
                <p style={{ color: T.gold, fontSize: 13.5, fontStyle: "italic", margin: 0 }}>
                  &ldquo;The love of a family is life&apos;s greatest blessing. Join us as we share in this beautiful moment together!&rdquo;
                </p>
                <p style={{ color: T.sub, fontFamily: "sans-serif", fontSize: 9.5, marginTop: 6, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                  — Welcome Guests
                </p>
              </>
            )}
          </div>
        </ScrollReveal>

        {/* PREMIUM CUSTOM ANNOUNCEMENT NOTE (MIDDLE POSITION) */}
        {customStyle.customNote && (!customStyle.notePosition || customStyle.notePosition === "middle") && (
          <ScrollReveal>
            <div style={{
              margin: "0 auto 40px",
              maxWidth: 440,
              padding: "24px",
              background: T.card,
              borderRadius: 16,
              border: `1px solid ${T.border}`,
              borderLeft: `4px solid ${T.gold}`,
              textAlign: "center",
              boxShadow: "0 10px 30px -15px rgba(0,0,0,0.15)",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{ position: "absolute", top: 8, left: 12, color: T.gold, opacity: 0.15, fontSize: 32, fontFamily: "serif", lineHeight: 1 }}>“</div>
              <p style={{
                margin: 0,
                fontSize: 14,
                color: T.text,
                fontStyle: "italic",
                lineHeight: 1.6,
                whiteSpace: "pre-line",
                fontFamily: lang === "ur" ? "'Noto Nastaliq Urdu', serif" : lang === "hi" ? "'Outfit', sans-serif" : "sans-serif"
              }}>
                {customStyle.customNote}
              </p>
              <div style={{ position: "absolute", bottom: 0, right: 12, color: T.gold, opacity: 0.15, fontSize: 32, fontFamily: "serif", lineHeight: 1 }}>”</div>
            </div>
          </ScrollReveal>
        )}

        {/* Dynamic Gallery Carousel */}
        {(() => {
          const galleryPhotos = invitation.photos || (invitation.photoUrl ? [invitation.photoUrl] : []);
          if (galleryPhotos.length === 0) return null;
          return (
            <ScrollReveal>
              <div style={{ margin: "0 auto 40px", maxWidth: 440 }}>
                <div style={{ border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden", background: T.card, padding: 6, position: "relative" }}>
                  <div style={{ borderRadius: 12, overflow: "hidden", aspectRatio: "4/3", position: "relative" }}>
                    {galleryPhotos.map((pic, index) => (
                      <img
                        key={index}
                        src={pic}
                        alt="Event Gallery"
                        style={{
                          position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block",
                          opacity: index === activePhotoIdx ? 1 : 0,
                          transform: index === activePhotoIdx ? "scale(1)" : "scale(1.08)",
                          transition: "opacity 1.6s cubic-bezier(0.25, 1, 0.5, 1), transform 1.6s cubic-bezier(0.25, 1, 0.5, 1)",
                          zIndex: index === activePhotoIdx ? 2 : 1,
                          pointerEvents: index === activePhotoIdx ? "auto" : "none",
                        }}
                      />
                    ))}
                    
                    {galleryPhotos.length > 1 && (
                      <>
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

                        <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, zIndex: 10 }}>
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

        {/* Live Countdown Clock */}
        <ScrollReveal>
          <div style={{ margin: "0 auto 40px", maxWidth: 440 }}>
            <p style={{ textAlign: "center", color: T.sub, fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>
              {text.countdown}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }} dir="ltr">
              {[["days", timeLeft.days, text.days], ["hours", timeLeft.hours, text.hours], ["mins", timeLeft.minutes, text.mins], ["secs", timeLeft.seconds, text.secs]].map(([label, val, transName]) => (
                <div key={label} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px 8px", textAlign: "center" }}>
                  <span style={{ color: T.text, fontSize: 28, fontWeight: 500, display: "block", lineHeight: 1, fontFamily: "sans-serif" }}>
                    {String(val).padStart(2, "0")}
                  </span>
                  <span style={{ color: T.gold, fontFamily: lang === "ur" ? "'Noto Nastaliq Urdu', serif" : "sans-serif", fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 5, display: "block" }}>
                    {transName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Date & Venue Box with HTML5 Canvas Scratch-off reveal overlay */}
        <ScrollReveal>
          <div style={{ position: "relative", margin: "0 auto 40px", maxWidth: 440 }}>
            
            {/* Core Card Info Block underneath */}
            <div style={{ 
              border: `1px solid ${T.border}`, borderRadius: 16, padding: "28px 32px", 
              background: T.card, textAlign: "center" 
            }}>
              <p style={{ color: T.gold, fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>
                {text.dateVenue}
              </p>
              <p style={{ color: T.text, fontSize: 17, fontWeight: 500, marginBottom: 4 }}>{fmt}</p>
              <p style={{ color: T.sub, fontSize: 13, marginBottom: 16 }}>at {fmtTime}</p>
              
              <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
                <p style={{ color: T.text, fontSize: 15, fontWeight: 500, marginBottom: 4 }}>{invitation.venue.name}</p>
                <p style={{ color: T.sub, fontSize: 12.5 }}>{invitation.venue.address}</p>
              </div>

              {invitation.venue.googleMapsUrl && (
                <a href={invitation.venue.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-block", marginTop: 16, color: T.gold, fontFamily: "sans-serif", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none", borderBottom: `1px solid ${T.gold}40`, paddingBottom: 2 }}>
                  {text.openMaps}
                </a>
              )}
            </div>

            {/* GOLD CANVAS SCRATCH LAYER OVERLAY */}
            {hasScratch && !scratchRevealed && (
              <ScratchCardCanvas 
                textColor={T.text}
                goldColor={btnBg}
                onRevealed={() => {
                  setScratchRevealed(true);
                  triggerConfettiShower();
                }}
                instructionsText={text.scratchText}
              />
            )}
          </div>
        </ScrollReveal>

        {/* Celebrations Event Timeline */}
        {invitation.details?.schedule?.length > 0 && (
          <div style={{ margin: "0 auto 40px", maxWidth: 440 }}>
            <ScrollReveal>
              <p style={{ textAlign: "center", color: T.sub, fontFamily: "sans-serif", fontSize: 10.5, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20 }}>
                {text.timelineTitle}
              </p>
            </ScrollReveal>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {invitation.details.schedule.map((ev, i) => {
                const d = new Date(ev.time);
                return (
                  <ScrollReveal key={i}>
                    <div style={{ border: `1px solid ${T.border}`, borderRadius: 14, padding: "18px 22px", background: T.card, display: "flex", alignItems: "flex-start", gap: 14 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.gold, marginTop: 7, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ color: T.text, fontSize: 15.5, fontWeight: 500, margin: "0 0 4px" }}>{ev.name}</p>
                        <p style={{ color: T.gold, fontFamily: "sans-serif", fontSize: 11.5, margin: "0 0 5px" }}>
                          {d.toLocaleDateString(lang === "ur" ? "ur-PK" : "en-US", { weekday: "short", month: "long", day: "numeric" })} · {d.toLocaleTimeString(lang === "ur" ? "ur-PK" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {ev.venue && (
                          <p style={{ color: T.text, fontSize: 12.5, fontWeight: 500, margin: "0 0 4px", opacity: 0.9 }}>
                            📍 Venue: {ev.venue}
                          </p>
                        )}
                        {ev.description && <p style={{ color: T.sub, fontSize: 12.5, margin: 0, fontStyle: "italic" }}>{ev.description}</p>}
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        )}

        {/* PREMIUM CUSTOM ANNOUNCEMENT NOTE (BOTTOM POSITION) */}
        {customStyle.customNote && customStyle.notePosition === "bottom" && (
          <ScrollReveal>
            <div style={{
              margin: "0 auto 40px",
              maxWidth: 440,
              padding: "24px",
              background: T.card,
              borderRadius: 16,
              border: `1px solid ${T.border}`,
              borderLeft: `4px solid ${T.gold}`,
              textAlign: "center",
              boxShadow: "0 10px 30px -15px rgba(0,0,0,0.15)",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{ position: "absolute", top: 8, left: 12, color: T.gold, opacity: 0.15, fontSize: 32, fontFamily: "serif", lineHeight: 1 }}>“</div>
              <p style={{
                margin: 0,
                fontSize: 14,
                color: T.text,
                fontStyle: "italic",
                lineHeight: 1.6,
                whiteSpace: "pre-line",
                fontFamily: lang === "ur" ? "'Noto Nastaliq Urdu', serif" : lang === "hi" ? "'Outfit', sans-serif" : "sans-serif"
              }}>
                {customStyle.customNote}
              </p>
              <div style={{ position: "absolute", bottom: 0, right: 12, color: T.gold, opacity: 0.15, fontSize: 32, fontFamily: "serif", lineHeight: 1 }}>”</div>
            </div>
          </ScrollReveal>
        )}

        {/* RSVP Confirmation Panel */}
        <div style={{ margin: "0 auto 40px", maxWidth: 440 }}>
          <ScrollReveal>
            <GoldDivider color={T.gold} />
            <p style={{ textAlign: "center", color: T.text, fontSize: 23, fontWeight: 400, margin: "28px 0 6px" }}>
              {text.rsvpTitle}
            </p>
            <p style={{ textAlign: "center", color: T.sub, fontFamily: "sans-serif", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 24 }}>
              {text.rsvpDesc}
            </p>
          </ScrollReveal>

          {rsvpDone ? (
            <ScrollReveal>
              <div style={{ textAlign: "center", padding: "32px 24px", border: `1px solid ${T.border}`, borderRadius: 16, background: T.card }}>
                <p style={{ fontSize: 32, marginBottom: 12 }}>✨</p>
                <p style={{ color: T.text, fontSize: 16.5, fontWeight: 600 }}>{text.successTitle}</p>
                <p style={{ color: T.sub, fontSize: 12.5, marginTop: 6 }}>{text.successDesc}</p>
              </div>
            </ScrollReveal>
          ) : (
            <ScrollReveal>
              <form onSubmit={submitRsvp} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                <div>
                  <label style={labelStyle(T)}>{text.fullName}</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Faisal Khan" 
                    value={rsvp.name} 
                    onChange={e => setRsvp(r => ({ ...r, name: e.target.value }))} 
                    style={inputStyle(T)} 
                  />
                </div>
                <div>
                  <label style={labelStyle(T)}>{text.blessing}</label>
                  <textarea 
                    rows={3} 
                    placeholder="Write a warm blessing..." 
                    value={rsvp.blessing} 
                    onChange={e => setRsvp(r => ({ ...r, blessing: e.target.value }))} 
                    style={{ ...inputStyle(T), resize: "none" }} 
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={rsvpLoading} 
                  style={{
                    padding: "14px", borderRadius: 12, border: "none", cursor: "pointer",
                    backgroundColor: btnBg,
                    color: btnText,
                    fontFamily: "sans-serif", fontSize: 11.5, fontWeight: 700,
                    letterSpacing: "0.2em", textTransform: "uppercase", transition: "opacity 0.2s, transform 0.15s",
                    opacity: rsvpLoading ? 0.6 : 1,
                    boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "none"}
                >
                  {rsvpLoading ? text.sending : text.sendRsvp}
                </button>
              </form>
            </ScrollReveal>
          )}
        </div>

        {/* Contact Hosts / Footer */}
        {invitation.coupleEmail && (
          <ScrollReveal>
            <div style={{ textAlign: "center", margin: "0 auto 40px", maxWidth: 440, borderTop: `1px solid ${T.border}`, paddingTop: 24 }}>
              <p style={{ color: T.gold, fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>
                {eventType === "wedding" ? text.contactCouple : text.contactHosts}
              </p>
              <a href={`mailto:${invitation.coupleEmail}`} style={{ color: T.text, fontSize: 14, textDecoration: "none", borderBottom: `1px solid ${T.gold}50`, paddingBottom: 2, fontFamily: "sans-serif" }}>
                {invitation.coupleEmail}
              </a>
            </div>
          </ScrollReveal>
        )}

        <div style={{ textAlign: "center", paddingTop: 24, borderTop: `1px solid ${T.border}` }}>
          <p style={{ color: `${T.sub}75`, fontFamily: "sans-serif", fontSize: 9.5, letterSpacing: "0.25em", textTransform: "uppercase" }}>
            Taabir Digital Invitations · Powered by Flynx
          </p>
        </div>
      </div>

      {/* Floating dynamic audio play button */}
      {invitation.musicUrl && phase === "open" && (
        <button onClick={toggleMusic} style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 50,
          width: 48, height: 48, borderRadius: "50%", border: `1px solid ${T.border}`,
          backgroundColor: btnBg,
          color: btnText,
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center",
          fontSize: 19, transition: "transform 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
          onMouseLeave={e => e.currentTarget.style.transform = "none"}
        >
          {isPlaying ? "♪" : "♩"}
        </button>
      )}

      {/* Hardware-accelerated CSS effects */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.16); opacity: 0.75; }
        }
        @keyframes fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   HTML5 CANVAS GOLDEN DATE SCRATCHER COMPONENT
   ───────────────────────────────────────────────────────────────────────────── */
function ScratchCardCanvas({ goldColor, textColor, onRevealed, instructionsText }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    // Scale canvas to match actual bounding box size
    const resizeCanvas = () => {
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Draw metallic card gradient overlay
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, goldColor);
      gradient.addColorStop(0.3, "#E8C86B");
      gradient.addColorStop(0.5, "#FFF2B2");
      gradient.addColorStop(0.7, "#D4AF37");
      gradient.addColorStop(1, "#996515");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add elegant borders inside the scratch space
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 2;
      ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

      // Draw text instructions
      ctx.fillStyle = "#3a2503";
      ctx.font = "bold 13px 'Playfair Display', serif, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(instructionsText, canvas.width / 2, canvas.height / 2);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [goldColor, instructionsText]);

  // Scratch action drawing
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleStart = (e) => {
    setIsDrawing(true);
    const coords = getCoordinates(e);
    scratch(coords.x, coords.y);
  };

  const handleMove = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    scratch(coords.x, coords.y);
  };

  const handleEnd = () => {
    setIsDrawing(false);
    checkScratchPercentage();
  };

  const scratch = (x, y) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
  };

  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;
    let cleared = 0;
    
    // Check every 4th byte (alpha channel)
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) cleared++;
    }

    const percentage = cleared / (pixels.length / 4);
    if (percentage > 0.6) {
      // Fade out canvas automatically
      canvas.style.transition = "opacity 0.6s ease";
      canvas.style.opacity = 0;
      setTimeout(onRevealed, 600);
    }
  };

  return (
    <div 
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 16,
        overflow: "hidden",
        zIndex: 20,
        touchAction: "none",
        cursor: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" style=\"fill:black\"><circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"gold\" stroke=\"black\" stroke-width=\"2\"/></svg>') 12 12, auto"
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SCROLL REVEAL UTILITY COMPONENT
   ───────────────────────────────────────────────────────────────────────────── */
function ScrollReveal({ children }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
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

/* ─────────────────────────────────────────────────────────────────────────────
   SHARED DIVIDER & LAYOUT DECORATORS
   ───────────────────────────────────────────────────────────────────────────── */
function GoldDivider({ color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0" }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${color}45)` }} />
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, opacity: 0.65 }} />
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${color}45)` }} />
    </div>
  );
}

function labelStyle(T) {
  return { 
    display: "block", 
    color: T.gold, 
    fontFamily: "sans-serif", 
    fontSize: 9.5, 
    letterSpacing: "0.2em", 
    textTransform: "uppercase", 
    marginBottom: 6, 
    fontWeight: 700 
  };
}

function inputStyle(T) {
  return {
    display: "block", width: "100%", padding: "12px 16px", borderRadius: 10,
    border: `1px solid ${T.border}`, background: T.card, color: T.text,
    fontFamily: "sans-serif", fontSize: 13, outline: "none", boxSizing: "border-box",
  };
}
