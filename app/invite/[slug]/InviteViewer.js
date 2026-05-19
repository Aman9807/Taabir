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
  const [activeLayoutId, setActiveLayoutId] = useState(tplId);
  const [activePaletteId, setActivePaletteId] = useState(tplId);
  const [showPaletteMenu, setShowPaletteMenu] = useState(false);
  const [customizerTab, setCustomizerTab] = useState("layouts"); // layouts or colors
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
  let btnBg = customStyle.btnBgColor || (tplId === "ivory-elegance" ? "#800020" : "#D4AF37");
  let btnText = customStyle.btnTextColor || "#FFFFFF";
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
  const isIvory = activePaletteId === "ivory-classic" || activePaletteId === "ivory-elegance";
  const T = activePaletteId === "minimalist-romance"
    ? {
        bg: "#FFFFF0",
        door: "#FFFFF0",
        seam: "#F7E7CE",
        card: "#FFFFFF",
        text: "#333333",
        sub: "#555555",
        gold: "#F7E7CE",
        border: "rgba(247,231,206,0.3)"
      }
    : activePaletteId === "royal-glamour"
    ? {
        bg: "#0A1128", 
        door: "#050B1A", 
        seam: "#B76E79", 
        card: "rgba(255, 255, 255, 0.08)", 
        text: "#FFFFFF", 
        sub: "#E2C4C9", 
        gold: "#B76E79", 
        border: "rgba(183, 110, 121, 0.2)"
      }
    : activePaletteId === "emerald-noir"
    ? {
        bg: "#001C12", 
        door: "#012B1B", 
        seam: "#C5A880", 
        card: "#022E1F", 
        text: "#FAF9F5", 
        sub: "#C5A880", 
        gold: "#C5A880", 
        border: "rgba(197,168,128,0.2)"
      }
    : activePaletteId === "dark-moody-elegant"
    ? {
        bg: "#0F0F0F", 
        door: "#043927", 
        seam: "#D4AF37", 
        card: "#043927", 
        text: "#FFFFFF", 
        sub: "#D4AF37", 
        gold: "#D4AF37", 
        border: "rgba(212,175,55,0.25)"
      }
    : activePaletteId === "bohemian-terracotta"
    ? {
        bg: "#FFFDD0", 
        door: "#E2725B", 
        seam: "#9DC183", 
        card: "#FFFDD0", 
        text: "#333333", 
        sub: "#E2725B", 
        gold: "#E2725B", 
        border: "rgba(226,114,91,0.25)"
      }
    : activePaletteId === "neon-nightclub"
    ? {
        bg: "#000000", 
        door: "#000000", 
        seam: "#00FF66", 
        card: "rgba(255,255,255,0.04)", 
        text: "#FFFFFF", 
        sub: "#00FFFF", 
        gold: "#00FF66", 
        border: "rgba(0,255,255,0.25)"
      }
    : activePaletteId === "elegant-milestone"
    ? {
        bg: "#800020", 
        door: "#4A0012", 
        seam: "#C0C0C0", 
        card: "rgba(255, 255, 255, 0.05)", 
        text: "#FFFFFF", 
        sub: "#C0C0C0", 
        gold: "#C0C0C0", 
        border: "rgba(192, 192, 192, 0.25)"
      }
    : activePaletteId === "playful-kidsparty"
    ? {
        bg: "#87CEEB", // Sky Blue
        door: "#87CEEB", // Sky Blue
        seam: "#FF7F50", // Coral
        card: "#FFFFFF",
        text: "#333333",
        sub: "#FF7F50",
        gold: "#FFD700",
        border: "rgba(255,127,80,0.35)"
      }
    : activePaletteId === "summer-poolparty"
    ? {
        bg: "#7FFFD4", 
        door: "#FFDAB9", 
        seam: "#C2B280", 
        card: "#FFFFFF",
        text: "#2E4F4F",
        sub: "#C2B280",
        gold: "#FFDAB9",
        border: "rgba(127,255,212,0.35)"
      }
    : isIvory
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

  const isPaletteDefault = activePaletteId === tplId;
  btnBg = isPaletteDefault && customStyle.btnBgColor ? customStyle.btnBgColor : T.gold;
  btnText = isPaletteDefault && customStyle.btnTextColor ? customStyle.btnTextColor : (activePaletteId === "minimalist-romance" || activePaletteId === "bohemian-terracotta" ? "#333333" : "#FFFFFF");

  const renderMinimalistRomance = () => {
    const galleryPhotos = invitation.photos || (invitation.photoUrl ? [invitation.photoUrl] : []);
    const hasPhotos = galleryPhotos.length > 0;
    const customBg = invitation.backgroundImage || galleryPhotos[0] || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200";

    return (
      <div 
        style={{
          opacity: phase !== "closed" ? 1 : 0,
          transform: phase !== "closed" ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 1.5s ease-out, transform 1.5s ease-out",
          width: "100%",
          margin: "0 auto",
          backgroundColor: T.bg,
          color: T.text,
          fontFamily: lang === "ur" ? "'Noto Nastaliq Urdu', serif" : lang === "hi" ? "'Outfit', sans-serif" : "'Lora', serif",
        }}
      >
        {/* Dynamic Font Import inside style tag to be self-contained */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
          
          @keyframes rsvpPulse {
            0% {
              transform: scale(1);
              box-shadow: 0 4px 15px ${T.gold}60;
            }
            50% {
              transform: scale(1.04);
              box-shadow: 0 4px 25px ${T.gold}, 0 0 0 8px ${T.gold}30;
            }
            100% {
              transform: scale(1);
              box-shadow: 0 4px 15px ${T.gold}60;
            }
          }
          .animate-pulse-rsvp {
            animation: rsvpPulse 2s ease-in-out infinite;
          }
          .parallax-bg {
            background-attachment: fixed;
            background-position: center;
            background-size: cover;
            background-repeat: no-repeat;
            position: relative;
            width: 100%;
          }
          /* Custom overrides for form inputs inside active theme */
          .ivory-input {
            width: 100%;
            padding: 12px 16px;
            background-color: ${T.card};
            border: 1px solid ${T.border};
            border-radius: 8px;
            color: ${T.text};
            font-family: inherit;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
          }
          .ivory-input:focus {
            border-color: ${T.gold};
          }
          .timeline-node {
            position: relative;
            padding-left: 28px;
            border-left: 1px solid ${T.gold}50;
            padding-bottom: 24px;
          }
          .timeline-node:last-child {
            padding-bottom: 0;
            border-left: none;
          }
          .timeline-bullet {
            position: absolute;
            left: -5.5px;
            top: 4px;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color: ${T.gold};
            border: 2px solid ${T.bg};
          }
        `}</style>

        {/* SECTION 1: HERO PARALLAX VIEWPORT */}
        <div 
          className="parallax-bg"
          style={{
            backgroundImage: `url(${customBg})`,
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Ivory Translucent Legibility Gradient Overlay */}
          <div 
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(to bottom, ${T.bg}33 0%, ${T.bg}d8 75%, ${T.bg} 100%)`,
              zIndex: 1,
            }}
          />

          {/* Hero Content */}
          <div 
            style={{
              position: "relative",
              zIndex: 2,
              textAlign: "center",
              padding: "40px 24px",
              maxWidth: 800,
              margin: "0 auto",
            }}
          >
            {/* Arabic Monogram */}
            <ScrollReveal duration="1.5s" ease="ease-out" distance="30px">
              <p style={{ color: T.text, fontSize: 28, fontFamily: "'Noto Naskh Arabic', serif", marginBottom: 12, lineHeight: 1.6, opacity: 0.95 }}>
                {invitation.headerArabic || "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"}
              </p>
            </ScrollReveal>

            {/* Blessing Sub-Header */}
            <ScrollReveal duration="1.5s" ease="ease-out" distance="30px">
              <p style={{ color: T.text, fontFamily: "'Playfair Display', serif", fontSize: 13, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 40, opacity: 0.7 }}>
                {invitation.headerGrace || "Under the Grace of Almighty Allah"}
              </p>
            </ScrollReveal>

            {/* Event Name Title */}
            <ScrollReveal duration="1.5s" ease="ease-out" distance="30px">
              <p style={{ color: T.text, fontFamily: "'Playfair Display', serif", fontSize: 12, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 24, fontWeight: 500 }}>
                {eventType === "wedding" ? text.wedding : 
                 eventType === "birthday" ? text.birthday : 
                 eventType === "anniversary" ? text.anniversary : 
                 eventType === "family_function" ? text.family_function : text.general}
              </p>
            </ScrollReveal>

            {/* Primary Couple Names (Playfair Display, Charcoal, Spacious) */}
            <ScrollReveal duration="1.5s" ease="ease-out" distance="30px">
              <div style={{ margin: "24px 0" }}>
                <h1 style={{ color: T.text, fontSize: 62, fontFamily: "'Playfair Display', serif", fontWeight: 300, lineHeight: 1.1, margin: 0 }}>
                  {invitation.brideName}
                </h1>
                {invitation.brideParentsName && (
                  <p style={{ color: T.text, fontSize: 13, fontStyle: "italic", marginTop: 8, opacity: 0.8, fontFamily: "'Lora', serif" }}>
                    {eventType === "wedding" ? `${text.daughterOf} ${invitation.brideParentsName}` : invitation.brideParentsName}
                  </p>
                )}

                {invitation.groomName && (
                  <>
                    <p style={{ color: T.text, fontSize: 32, fontStyle: "italic", margin: "16px 0", opacity: 0.7, fontFamily: "'Playfair Display', serif" }}>&amp;</p>
                    <h1 style={{ color: T.text, fontSize: 62, fontFamily: "'Playfair Display', serif", fontWeight: 300, lineHeight: 1.1, margin: 0 }}>
                      {invitation.groomName}
                    </h1>
                    {invitation.groomParentsName && (
                      <p style={{ color: T.text, fontSize: 13, fontStyle: "italic", marginTop: 8, opacity: 0.8, fontFamily: "'Lora', serif" }}>
                        {eventType === "wedding" ? `${text.sonOf} ${invitation.groomParentsName}` : invitation.groomParentsName}
                      </p>
                    )}
                  </>
                )}
              </div>
            </ScrollReveal>

            {/* Scroll Indicator */}
            <div style={{ marginTop: 60, animation: "bounce 2s infinite" }}>
              <span style={{ fontSize: 18, color: T.text, opacity: 0.4 }}>↓</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: THE QUOTE / INTRO (Clean Spacious Ivory block) */}
        <div style={{ backgroundColor: T.bg, padding: "100px 24px", textAlign: "center" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <ScrollReveal duration="1.5s" ease="ease-out" distance="30px">
              <div style={{ padding: "40px 0", borderTop: "1px solid " + T.border, borderBottom: "1px solid " + T.border }}>
                {eventType === "wedding" ? (
                  <>
                    <p style={{ color: "#333333", fontSize: 18, fontStyle: "italic", lineHeight: 1.8, margin: 0, fontFamily: "'Lora', serif" }}>
                      &ldquo;And We created you in pairs&rdquo;
                    </p>
                    <p style={{ color: "#333333", fontFamily: "'Playfair Display', serif", fontSize: 11, marginTop: 12, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.6 }}>
                      — Quran 78:8
                    </p>
                  </>
                ) : eventType === "birthday" ? (
                  <>
                    <p style={{ color: "#333333", fontSize: 17, fontStyle: "italic", lineHeight: 1.8, margin: 0, fontFamily: "'Lora', serif" }}>
                      &ldquo;Wishing you a year filled with sweet moments, grand milestones, and beautiful memories!&rdquo;
                    </p>
                    <p style={{ color: "#333333", fontFamily: "'Playfair Display', serif", fontSize: 11, marginTop: 12, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.6 }}>
                      — Happy Birthday
                    </p>
                  </>
                ) : eventType === "anniversary" ? (
                  <>
                    <p style={{ color: "#333333", fontSize: 17, fontStyle: "italic", lineHeight: 1.8, margin: 0, fontFamily: "'Lora', serif" }}>
                      &ldquo;Real love stories never have endings. Wishing you another chapter of happiness together!&rdquo;
                    </p>
                    <p style={{ color: "#333333", fontFamily: "'Playfair Display', serif", fontSize: 11, marginTop: 12, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.6 }}>
                      — Happy Anniversary
                    </p>
                  </>
                ) : (
                  <>
                    <p style={{ color: "#333333", fontSize: 17, fontStyle: "italic", lineHeight: 1.8, margin: 0, fontFamily: "'Lora', serif" }}>
                      &ldquo;The love of a family is life&apos;s greatest blessing. Join us as we share in this beautiful moment together!&rdquo;
                    </p>
                    <p style={{ color: "#333333", fontFamily: "'Playfair Display', serif", fontSize: 11, marginTop: 12, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.6 }}>
                      — Welcome Guests
                    </p>
                  </>
                )}
              </div>
            </ScrollReveal>

            {/* DYNAMIC ANNOUNCEMENT NOTE (MIDDLE POSITION) */}
            {customStyle.customNote && (!customStyle.notePosition || customStyle.notePosition === "middle") && (
              <div style={{ marginTop: 60 }}>
                <ScrollReveal duration="1.5s" ease="ease-out" distance="30px">
                  <div style={{
                    padding: "32px",
                    background: "#FFFFFF",
                    borderRadius: 4,
                    border: "1px solid rgba(247, 231, 206, 0.4)",
                    borderLeft: "4px solid #F7E7CE",
                    position: "relative"
                  }}>
                    <div style={{ position: "absolute", top: 8, left: 16, color: "#F7E7CE", opacity: 0.6, fontSize: 36, fontFamily: "serif", lineHeight: 1 }}>“</div>
                    <p style={{
                      margin: 0,
                      fontSize: 15,
                      color: "#333333",
                      fontStyle: "italic",
                      lineHeight: 1.7,
                      whiteSpace: "pre-line",
                      fontFamily: lang === "ur" ? "'Noto Nastaliq Urdu', serif" : lang === "hi" ? "'Outfit', sans-serif" : "'Lora', serif"
                    }}>
                      {customStyle.customNote}
                    </p>
                    <div style={{ position: "absolute", bottom: -8, right: 16, color: "#F7E7CE", opacity: 0.6, fontSize: 36, fontFamily: "serif", lineHeight: 1 }}>”</div>
                  </div>
                </ScrollReveal>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: PARALLAX GALLERY VIEWPORT */}
        {hasPhotos && (
          <div 
            className="parallax-bg"
            style={{
              backgroundImage: `url(${invitation.backgroundImage || galleryPhotos[1] || galleryPhotos[0] || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200"})`,
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 24px",
            }}
          >
            <div 
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(255, 255, 240, 0.75)",
                zIndex: 1,
              }}
            />

            <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 520, margin: "0 auto" }}>
              <ScrollReveal duration="1.5s" ease="ease-out" distance="30px">
                <div style={{ border: "1px solid rgba(247, 231, 206, 0.5)", borderRadius: 8, overflow: "hidden", background: "#FFFFFF", padding: 8, boxShadow: "0 20px 40px rgba(0,0,0,0.06)" }}>
                  <div style={{ borderRadius: 4, overflow: "hidden", aspectRatio: "4/3", position: "relative" }}>
                    {galleryPhotos.map((pic, index) => (
                      <img
                        key={index}
                        src={pic}
                        alt="Gallery Slideshow"
                        style={{
                          position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block",
                          opacity: index === activePhotoIdx ? 1 : 0,
                          transform: index === activePhotoIdx ? "scale(1)" : "scale(1.05)",
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
                            background: "rgba(255,255,255,0.85)", color: "#333333", border: "none", borderRadius: "50%",
                            width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", fontSize: 18, transition: "background 0.2s", zIndex: 10, outline: "none",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                          }}
                        >
                          ‹
                        </button>

                        <button
                          type="button"
                          onClick={() => setActivePhotoIdx((prev) => (prev === galleryPhotos.length - 1 ? 0 : prev + 1))}
                          style={{
                            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                            background: "rgba(255,255,255,0.85)", color: "#333333", border: "none", borderRadius: "50%",
                            width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", fontSize: 18, transition: "background 0.2s", zIndex: 10, outline: "none",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
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
                                width: 7, height: 7, borderRadius: "50%",
                                backgroundColor: i === activePhotoIdx ? "#333333" : "rgba(255,255,255,0.6)",
                                cursor: "pointer", transition: "background 0.2s"
                              }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        )}

        {/* SECTION 4: DATE, TIME & SCRATCH CARD (Ivory scrolling block) */}
        <div style={{ backgroundColor: T.bg, padding: "100px 24px", textAlign: "center" }}>
          <div style={{ maxWidth: 520, margin: "0 auto" }}>
            <ScrollReveal duration="1.5s" ease="ease-out" distance="30px">
              <p style={{ color: T.text, fontFamily: "'Playfair Display', serif", fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 24, fontWeight: 500, opacity: 0.8 }}>
                {text.dateVenue}
              </p>
            </ScrollReveal>

            <ScrollReveal duration="1.5s" ease="ease-out" distance="30px">
              <div style={{ position: "relative", width: "100%" }}>
                
                {/* Core Date & Venue Info */}
                <div style={{ 
                  border: "1px solid " + T.border, borderRadius: 8, padding: "40px 32px", 
                  background: T.card, textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.02)" 
                }}>
                  <p style={{ color: T.text, fontSize: 22, fontFamily: "'Playfair Display', serif", fontWeight: 400, marginBottom: 8 }}>{fmt}</p>
                  <p style={{ color: T.text, fontSize: 15, fontFamily: "'Lora', serif", fontStyle: "italic", marginBottom: 28, opacity: 0.7 }}>at {fmtTime}</p>
                  
                  <div style={{ borderTop: "1px solid " + T.border, paddingTop: 24 }}>
                    <p style={{ color: T.text, fontSize: 17, fontFamily: "'Playfair Display', serif", fontWeight: 500, marginBottom: 6 }}>{invitation.venue?.name}</p>
                    <p style={{ color: T.text, fontSize: 14, fontFamily: "'Lora', serif", opacity: 0.8 }}>{invitation.venue?.address}</p>
                  </div>

                  {invitation.venue?.googleMapsUrl && (
                    <a href={invitation.venue.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                      style={{ display: "inline-block", marginTop: 24, color: T.text, fontFamily: "'Playfair Display', serif", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none", borderBottom: "1px solid " + T.text, paddingBottom: 2, fontWeight: 600 }}>
                      {text.openMaps}
                    </a>
                  )}
                </div>

                {/* Golden Scratcher Overlay card */}
                {hasScratch && !scratchRevealed && (
                  <ScratchCardCanvas 
                    textColor="#333333"
                    goldColor="#F7E7CE"
                    onRevealed={() => {
                      setScratchRevealed(true);
                      triggerConfettiShower();
                    }}
                    instructionsText={text.scratchText}
                  />
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* SECTION 5: CELEBRATION SCHEDULE TIMELINE (IvoryScrolling block) */}
        {invitation.details?.schedule && invitation.details.schedule.length > 0 && (
          <div style={{ backgroundColor: T.bg, padding: "100px 24px", textAlign: "center" }}>
            <div style={{ maxWidth: 520, margin: "0 auto" }}>
              <ScrollReveal duration="1.5s" ease="ease-out" distance="30px">
                <p style={{ textAlign: "center", color: T.text, fontFamily: "'Playfair Display', serif", fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 40, fontWeight: 500, opacity: 0.8 }}>
                  {text.timelineTitle}
                </p>
              </ScrollReveal>

              <ScrollReveal duration="1.5s" ease="ease-out" distance="30px">
                <div style={{ textAlign: "left" }}>
                  {invitation.details.schedule.map((item, idx) => {
                    const sDate = new Date(item.time);
                    const sFmtTime = sDate.toLocaleTimeString(
                      lang === "ur" ? "ur-PK" : lang === "hi" ? "hi-IN" : "en-US",
                      { hour: "2-digit", minute: "2-digit" }
                    );
                    return (
                      <div key={idx} className="timeline-node">
                        <span className="timeline-bullet" />
                        <span style={{ color: T.text, opacity: 0.5, fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", fontFamily: "'Playfair Display', serif" }}>
                          {sFmtTime}
                        </span>
                        <h4 style={{ color: T.text, fontSize: 17, fontFamily: "'Playfair Display', serif", fontWeight: 500, margin: "4px 0" }}>
                          {item.name}
                        </h4>
                        {item.venue && (
                          <p style={{ color: T.text, fontSize: 12.5, fontWeight: 600, margin: "2px 0 6px", opacity: 0.7, fontFamily: "'Lora', serif" }}>
                            📍 {item.venue}
                          </p>
                        )}
                        {item.description && (
                          <p style={{ color: T.text, fontSize: 13, fontFamily: "'Lora', serif", opacity: 0.7, margin: 0, fontStyle: "italic", lineHeight: 1.5 }}>
                            {item.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollReveal>
            </div>
          </div>
        )}

        {/* SECTION 6: LIVE COUNTDOWN TIMER (Spacious Ivory block) */}
        <div style={{ backgroundColor: T.bg, padding: "100px 24px", textAlign: "center" }}>
          <div style={{ maxWidth: 520, margin: "0 auto" }}>
            <ScrollReveal duration="1.5s" ease="ease-out" distance="30px">
              <p style={{ color: T.text, fontFamily: "'Playfair Display', serif", fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 32, fontWeight: 500, opacity: 0.8 }}>
                {text.countdown}
              </p>
            </ScrollReveal>

            <ScrollReveal duration="1.5s" ease="ease-out" distance="30px">
              <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
                {[
                  { val: timeLeft.days, label: text.days },
                  { val: timeLeft.hours, label: text.hours },
                  { val: timeLeft.minutes, label: text.mins },
                  { val: timeLeft.seconds, label: text.secs }
                ].map((item, idx) => (
                  <div key={idx} style={{ 
                    width: 90, padding: "20px 0", background: T.card, 
                    border: "1px solid " + T.border, borderRadius: 6,
                    boxShadow: "0 6px 15px rgba(0,0,0,0.01)" 
                  }}>
                    <span style={{ display: "block", fontSize: 32, fontWeight: 300, color: T.text, fontFamily: "'Playfair Display', serif" }}>
                      {String(item.val).padStart(2, "0")}
                    </span>
                    <span style={{ display: "block", fontSize: 9.5, textTransform: "uppercase", color: T.text, opacity: 0.5, letterSpacing: "0.15em", marginTop: 4, fontFamily: "'Lora', serif" }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* SECTION 7: INTERACTIVE RSVP REGISTRY (Parallax section) */}
        <div 
          className="parallax-bg"
          style={{
            backgroundImage: `url(${customBg})`,
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "100px 24px",
          }}
        >
          <div 
            style={{
              position: "absolute",
              inset: 0,
              background: T.bg + "d5",
              zIndex: 1,
            }}
          />

          <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 480, margin: "0 auto" }}>
            <ScrollReveal duration="1.5s" ease="ease-out" distance="30px">
              <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 8, padding: "44px 36px", boxShadow: "0 15px 35px rgba(0,0,0,0.03)" }}>
                {rsvpDone ? (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <div style={{ fontSize: 44, marginBottom: 16 }}>✨</div>
                    <h3 style={{ color: T.text, fontSize: 24, fontFamily: "'Playfair Display', serif", fontWeight: 400, marginBottom: 12 }}>
                      {text.successTitle}
                    </h3>
                    <p style={{ color: T.text, fontSize: 14, fontFamily: "'Lora', serif", opacity: 0.8, lineHeight: 1.6, margin: 0 }}>
                      {text.successDesc}
                    </p>
                  </div>
                ) : (
                  <>
                    <h3 style={{ textAlign: "center", color: T.text, fontSize: 24, fontFamily: "'Playfair Display', serif", fontWeight: 400, margin: "0 0 8px" }}>
                      {text.rsvpTitle}
                    </h3>
                    <p style={{ textAlign: "center", color: T.text, fontSize: 13.5, fontFamily: "'Lora', serif", opacity: 0.7, margin: "0 0 28px" }}>
                      {text.rsvpDesc}
                    </p>

                    <form onSubmit={submitRsvp} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: T.text, marginBottom: 6, opacity: 0.7, fontFamily: "'Playfair Display', serif" }}>
                          {text.fullName}
                        </label>
                        <input
                          type="text"
                          required
                          value={rsvp.name}
                          onChange={e => setRsvp(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g. Faisal Khan"
                          className="ivory-input"
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: T.text, marginBottom: 6, opacity: 0.7, fontFamily: "'Playfair Display', serif" }}>
                          {text.blessing}
                        </label>
                        <textarea
                          rows={3}
                          value={rsvp.blessing}
                          onChange={e => setRsvp(prev => ({ ...prev, blessing: e.target.value }))}
                          placeholder="Send your warm wishes to the couple..."
                          className="ivory-input"
                          style={{ resize: "none" }}
                        />
                      </div>

                      {/* GENTLE RSVP BUTTON PULSE ANIMATION */}
                      <button
                        type="submit"
                        disabled={rsvpLoading}
                        className="animate-pulse-rsvp"
                        style={{
                          width: "100%",
                          padding: "14px",
                          backgroundColor: T.gold,
                          color: activePaletteId === "dark-moody-elegant" || activePaletteId === "emerald-noir" || activePaletteId === "midnight-gold" ? "#0F0F0F" : T.text,
                          border: "none",
                          borderRadius: 8,
                          fontSize: 12.5,
                          fontWeight: 700,
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          cursor: "pointer",
                          transition: "background 0.2s, transform 0.2s",
                          fontFamily: "'Playfair Display', serif",
                          marginTop: 8,
                          outline: "none"
                        }}
                      >
                        {rsvpLoading ? text.sending : text.sendRsvp}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* SECTION 8: BOTTOM ANNOUNCEMENT & CONTACT FOOTER (Ivory block) */}
        <div style={{ backgroundColor: T.bg, padding: "80px 24px", textAlign: "center", borderTop: "1px solid " + T.border }}>
          <div style={{ maxWidth: 520, margin: "0 auto" }}>
            
            {/* Bottom Announcement Note if Bottom position chosen */}
            {customStyle.customNote && customStyle.notePosition === "bottom" && (
              <ScrollReveal duration="1.5s" ease="ease-out" distance="30px">
                <div style={{
                  padding: "32px",
                  background: T.card,
                  borderRadius: 4,
                  border: "1px solid " + T.border,
                  borderLeft: "4px solid " + T.gold,
                  textAlign: "center",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.01)",
                  marginBottom: 60,
                  position: "relative"
                }}>
                  <div style={{ position: "absolute", top: 8, left: 16, color: T.gold, opacity: 0.6, fontSize: 36, fontFamily: "serif", lineHeight: 1 }}>“</div>
                  <p style={{
                    margin: 0,
                    fontSize: 15,
                    color: T.text,
                    fontStyle: "italic",
                    lineHeight: 1.7,
                    whiteSpace: "pre-line",
                    fontFamily: lang === "ur" ? "'Noto Nastaliq Urdu', serif" : lang === "hi" ? "'Outfit', sans-serif" : "'Lora', serif"
                  }}>
                    {customStyle.customNote}
                  </p>
                  <div style={{ position: "absolute", bottom: -8, right: 16, color: T.gold, opacity: 0.6, fontSize: 36, fontFamily: "serif", lineHeight: 1 }}>”</div>
                </div>
              </ScrollReveal>
            )}

            {/* Couple Email contact block */}
            {invitation.coupleEmail && (
              <ScrollReveal duration="1.5s" ease="ease-out" distance="30px">
                <div style={{ marginBottom: 60 }}>
                  <p style={{ color: T.text, opacity: 0.5, fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10, fontFamily: "'Playfair Display', serif" }}>
                    {eventType === "wedding" ? text.contactCouple : text.contactHosts}
                  </p>
                  <a href={`mailto:${invitation.coupleEmail}`} style={{ color: T.text, fontSize: 15.5, textDecoration: "none", borderBottom: "1px solid " + T.text, paddingBottom: 2, fontWeight: 500, fontFamily: "'Lora', serif" }}>
                    {invitation.coupleEmail}
                  </a>
                </div>
              </ScrollReveal>
            )}

            <div style={{ paddingTop: 24, borderTop: "1px solid " + T.border }}>
              <p style={{ color: T.text, opacity: 0.4, fontFamily: "'Playfair Display', serif", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase" }}>
                Taabir Digital Invitations · Powered by Flynx
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDarkMoody = () => {
    const galleryPhotos = invitation.photos || (invitation.photoUrl ? [invitation.photoUrl] : []);
    const hasPhotos = galleryPhotos.length > 0;
    const customBg = invitation.backgroundImage || galleryPhotos[0] || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200";

    return (
      <div 
        style={{
          opacity: phase !== "closed" ? 1 : 0,
          transform: phase !== "closed" ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 1.5s ease-out, transform 1.5s ease-out",
          width: "100%",
          margin: "0 auto",
          backgroundColor: "#0F0F0F",
          color: "#FFFFFF",
          fontFamily: lang === "ur" ? "'Noto Nastaliq Urdu', serif" : lang === "hi" ? "'Outfit', sans-serif" : "'Montserrat', sans-serif",
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=Montserrat:wght@200;300;400;500;600;700&display=swap');
          
          @keyframes revealLeft {
            from { clip-path: inset(0 100% 0 0); transform: translateX(-20px); }
            to { clip-path: inset(0 0 0 0); transform: translateX(0); }
          }
          .reveal-from-left {
            animation: revealLeft 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }

          @keyframes kenBurnsZoom {
            0% { transform: scale(1); }
            50% { transform: scale(1.08); }
            100% { transform: scale(1); }
          }
          .ken-burns-container {
            position: absolute;
            inset: 0;
            overflow: hidden;
            z-index: 0;
          }
          .ken-burns-bg {
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center;
            animation: kenBurnsZoom 8s ease-in-out infinite;
          }

          @keyframes slideInRight {
            from { transform: translateX(50px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .timeline-card-staggered {
            opacity: 0;
            animation: slideInRight 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }

          .dark-moody-input {
            width: 100%;
            padding: 12px 16px;
            background-color: rgba(4, 57, 39, 0.15);
            border: 1px solid rgba(212, 175, 55, 0.25);
            border-radius: 8px;
            color: #FFFFFF;
            font-size: 13.5px;
            font-family: 'Montserrat', sans-serif;
            transition: all 0.3s;
            outline: none;
          }
          .dark-moody-input:focus {
            border-color: #D4AF37;
            background-color: rgba(4, 57, 39, 0.3);
            box-shadow: 0 0 10px rgba(212, 175, 55, 0.2);
          }
          .dark-moody-input::placeholder {
            color: rgba(255, 255, 255, 0.35);
          }

          .parallax-dark-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(to bottom, rgba(15,15,15,0.3) 0%, rgba(15,15,15,0.85) 75%, rgba(15,15,15,1) 100%);
            z-index: 1;
          }
        `}</style>

        {/* SECTION 1: HERO VIEWPORT */}
        <div 
          style={{
            position: "relative",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden"
          }}
        >
          <div className="ken-burns-container">
            <div className="ken-burns-bg" style={{ backgroundImage: `url(${customBg})` }} />
          </div>
          <div className="parallax-dark-overlay" />

          {/* Hero Content */}
          <div 
            style={{
              position: "relative",
              zIndex: 2,
              textAlign: "center",
              padding: "0 24px",
              maxWidth: 600,
              margin: "0 auto"
            }}
          >
            <ScrollReveal duration="1.2s" ease="ease-out" distance="20px">
              <p style={{ color: "#D4AF37", fontSize: 24, fontFamily: "'Noto Naskh Arabic', serif", marginBottom: 12, lineHeight: 1.6 }}>
                {invitation.headerArabic || "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"}
              </p>
              <p style={{ color: "#D4AF37", fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 36 }}>
                {invitation.headerGrace || "Under the Grace of Almighty Allah"}
              </p>
            </ScrollReveal>

            {/* Names Masked Reveal */}
            <div className="reveal-from-left" style={{ margin: "24px 0" }}>
              <h1 style={{ color: "#D4AF37", fontFamily: "'Cinzel', serif", fontSize: lang === "ur" ? 44 : 38, fontWeight: 700, letterSpacing: "0.05em", margin: 0, textTransform: "uppercase", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                {invitation.brideName}
              </h1>
              {invitation.groomName && (
                <>
                  <p style={{ color: "#FFFFFF", fontFamily: "'Cinzel', serif", fontSize: 18, margin: "8px 0", fontStyle: "italic", opacity: 0.95 }}>
                    and
                  </p>
                  <h1 style={{ color: "#D4AF37", fontFamily: "'Cinzel', serif", fontSize: lang === "ur" ? 44 : 38, fontWeight: 700, letterSpacing: "0.05em", margin: 0, textTransform: "uppercase", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                    {invitation.groomName}
                  </h1>
                </>
              )}
            </div>

            <ScrollReveal duration="1.4s" ease="ease-out" distance="20px">
              <p style={{ color: "#FFFFFF", fontFamily: "'Montserrat', sans-serif", fontSize: 13, fontWeight: 300, letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 28, opacity: 0.9 }}>
                {text.cordiallyInvite}
              </p>
              <div style={{ width: 40, height: 1, backgroundColor: "#D4AF37", margin: "24px auto" }} />
              <p style={{ color: "#D4AF37", fontFamily: "'Cinzel', serif", fontSize: 16, letterSpacing: "0.15em", margin: 0 }}>
                {fmt}
              </p>
              <p style={{ color: "#FFFFFF", fontFamily: "'Montserrat', sans-serif", fontSize: 13, fontWeight: 400, marginTop: 8, opacity: 0.85 }}>
                {fmtTime}
              </p>
            </ScrollReveal>
          </div>
        </div>

        {/* SECTION 2: DATE COUNTDOWN AND BRIDAL NOTE */}
        <div style={{ backgroundColor: "#0F0F0F", padding: "100px 24px", borderTop: "1px solid rgba(212, 175, 55, 0.15)" }}>
          <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
            
            {/* Language switcher */}
            {customStyle.enableLanguageSwitcher && (
              <ScrollReveal>
                <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 40 }}>
                  {["en", "ur", "hi"].map((l) => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      style={{
                        padding: "6px 14px",
                        background: lang === l ? "#D4AF37" : "transparent",
                        color: lang === l ? "#0F0F0F" : "#FFFFFF",
                        border: "1px solid rgba(212,175,55,0.4)",
                        borderRadius: 20,
                        fontSize: 10.5,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        cursor: "pointer",
                        transition: "all 0.3s"
                      }}
                    >
                      {l === "en" ? "EN" : l === "ur" ? "اردو" : "HI"}
                    </button>
                  ))}
                </div>
              </ScrollReveal>
            )}

            {/* Countdown widget */}
            <ScrollReveal>
              <h2 style={{ color: "#D4AF37", fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 32 }}>
                {text.countdownTitle}
              </h2>
              <div style={{ display: "flex", justifyContent: "center", gap: 14, marginBottom: 54 }}>
                {[
                  { val: timeLeft.days, label: text.days },
                  { val: timeLeft.hours, label: text.hours },
                  { val: timeLeft.minutes, label: text.minutes },
                  { val: timeLeft.seconds, label: text.seconds }
                ].map((item, idx) => (
                  <div key={idx} style={{ minWidth: 68, padding: "14px 8px", background: "rgba(4, 57, 39, 0.2)", border: "1px solid rgba(212, 175, 55, 0.15)", borderRadius: 10 }}>
                    <p style={{ color: "#D4AF37", fontSize: 24, fontFamily: "'Cinzel', serif", fontWeight: 700, margin: 0 }}>
                      {item.val}
                    </p>
                    <p style={{ color: "#FFFFFF", fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.6, margin: "4px 0 0" }}>
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            {/* Parents / Sub-titles */}
            <ScrollReveal>
              <div style={{ display: "flex", flexDirection: "column", gap: 32, padding: "40px 24px", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 16, background: "rgba(4, 57, 39, 0.1)" }}>
                <div>
                  <h4 style={{ color: "#D4AF37", fontFamily: "'Cinzel', serif", fontSize: 13, letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 4px" }}>
                    {invitation.brideName}
                  </h4>
                  {invitation.brideParentsName && (
                    <p style={{ color: "#FFFFFF", fontSize: 12.5, opacity: 0.75, margin: 0, fontStyle: "italic" }}>
                      Daughter of {invitation.brideParentsName}
                    </p>
                  )}
                </div>
                {invitation.groomName && (
                  <div>
                    <h4 style={{ color: "#D4AF37", fontFamily: "'Cinzel', serif", fontSize: 13, letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 4px" }}>
                      {invitation.groomName}
                    </h4>
                    {invitation.groomParentsName && (
                      <p style={{ color: "#FFFFFF", fontSize: 12.5, opacity: 0.75, margin: 0, fontStyle: "italic" }}>
                        Son of {invitation.groomParentsName}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* SECTION 3: PARALLAX GALLERY VIEWPORT */}
        {hasPhotos && (
          <div 
            style={{
              position: "relative",
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden"
            }}
          >
            <div className="ken-burns-container">
              <div className="ken-burns-bg" style={{ backgroundImage: `url(${invitation.backgroundImage || galleryPhotos[1] || galleryPhotos[0] || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200"})` }} />
            </div>
            <div className="parallax-dark-overlay" />

            <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 520, margin: "0 auto", padding: "0 24px" }}>
              <ScrollReveal duration="1.5s" ease="ease-out" distance="30px">
                <div style={{ border: "1px solid rgba(212, 175, 55, 0.35)", borderRadius: 12, overflow: "hidden", background: "#0F0F0F", padding: 12, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
                  <div style={{ borderRadius: 6, overflow: "hidden", aspectRatio: "4/3", position: "relative" }}>
                    <img 
                      src={galleryPhotos[activePhotoIdx]} 
                      alt="Gallery Celebration" 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    />
                    
                    {galleryPhotos.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setActivePhotoIdx(prev => (prev === 0 ? galleryPhotos.length - 1 : prev - 1))}
                          style={{
                            position: "absolute", top: "50%", left: 16, transform: "translateY(-50%)",
                            width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(212,175,55,0.4)",
                            background: "rgba(15,15,15,0.75)", color: "#D4AF37", fontSize: 16, fontWeight: 700,
                            cursor: "pointer", transition: "all 0.2s", zIndex: 10
                          }}
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={() => setActivePhotoIdx(prev => (prev === galleryPhotos.length - 1 ? 0 : prev + 1))}
                          style={{
                            position: "absolute", top: "50%", right: 16, transform: "translateY(-50%)",
                            width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(212,175,55,0.4)",
                            background: "rgba(15,15,15,0.75)", color: "#D4AF37", fontSize: 16, fontWeight: 700,
                            cursor: "pointer", transition: "all 0.2s", zIndex: 10
                          }}
                        >
                          ›
                        </button>
                        
                        <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, zIndex: 10 }}>
                          {galleryPhotos.map((_, i) => (
                            <span 
                              key={i} 
                              style={{
                                width: 6, height: 6, borderRadius: "50%",
                                background: activePhotoIdx === i ? "#D4AF37" : "rgba(255,255,255,0.4)",
                                transition: "all 0.2s"
                              }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        )}

        {/* SECTION 4: DATE, TIME & SCRATCH CARD */}
        <div style={{ backgroundColor: "#0F0F0F", padding: "100px 24px", borderTop: "1px solid rgba(212, 175, 55, 0.15)" }}>
          <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
            
            {customStyle.customNote && customStyle.notePosition === "middle" && (
              <ScrollReveal>
                <div style={{
                  padding: "32px",
                  background: "rgba(4, 57, 39, 0.15)",
                  borderRadius: 16,
                  border: "1px solid rgba(212, 175, 55, 0.2)",
                  borderLeft: "4px solid #D4AF37",
                  textAlign: "center",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                  marginBottom: 64,
                  position: "relative"
                }}>
                  <div style={{ position: "absolute", top: 8, left: 16, color: "#D4AF37", opacity: 0.3, fontSize: 36, fontFamily: "serif", lineHeight: 1 }}>“</div>
                  <p style={{
                    margin: 0,
                    fontSize: 14.5,
                    color: "#FFFFFF",
                    fontStyle: "italic",
                    lineHeight: 1.7,
                    whiteSpace: "pre-line",
                    fontFamily: lang === "ur" ? "'Noto Nastaliq Urdu', serif" : lang === "hi" ? "'Outfit', sans-serif" : "'Montserrat', sans-serif"
                  }}>
                    {customStyle.customNote}
                  </p>
                  <div style={{ position: "absolute", bottom: -8, right: 16, color: "#D4AF37", opacity: 0.3, fontSize: 36, fontFamily: "serif", lineHeight: 1 }}>”</div>
                </div>
              </ScrollReveal>
            )}

            <ScrollReveal>
              <h2 style={{ color: "#D4AF37", fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>
                {text.venueTitle}
              </h2>
              <p style={{ color: "#FFFFFF", fontFamily: "'Montserrat', sans-serif", fontSize: 13, opacity: 0.6, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 36 }}>
                Celebrate with us
              </p>
            </ScrollReveal>

            {/* Date Details Box */}
            <ScrollReveal duration="1.5s" ease="ease-out" distance="30px">
              <div style={{
                position: "relative",
                background: "rgba(4, 57, 39, 0.15)",
                border: "1px solid rgba(212, 175, 55, 0.2)",
                borderRadius: 16,
                padding: "48px 24px",
                overflow: "hidden",
                minHeight: 280,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 15px 35px rgba(0,0,0,0.2)"
              }}>
                {/* Main revealed contents */}
                <div style={{ zIndex: 1, position: "relative" }}>
                  <span style={{ fontSize: 32, display: "block", marginBottom: 16 }}>🏛️</span>
                  <h3 style={{ color: "#D4AF37", fontFamily: "'Cinzel', serif", fontSize: 18, letterSpacing: "0.08em", fontWeight: 600, margin: "0 0 12px" }}>
                    {invitation.venue?.name}
                  </h3>
                  <p style={{ color: "#FFFFFF", fontSize: 14.5, lineHeight: 1.6, opacity: 0.85, margin: "0 0 28px", maxWidth: 360, fontFamily: "'Montserrat', sans-serif" }}>
                    {invitation.venue?.address}
                  </p>
                  
                  {invitation.venue?.googleMapsUrl && (
                    <a
                      href={invitation.venue.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "10px 24px",
                        backgroundColor: "#D4AF37",
                        color: "#0F0F0F",
                        textDecoration: "none",
                        borderRadius: 30,
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        boxShadow: "0 4px 15px rgba(212, 175, 55, 0.2)",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "none"}
                    >
                      📍 {text.viewMap}
                    </a>
                  )}
                </div>

                {/* Golden Scratcher Overlay card */}
                {hasScratch && !scratchRevealed && (
                  <ScratchCardCanvas 
                    textColor="#3a2503"
                    goldColor="#D4AF37"
                    onRevealed={() => {
                      setScratchRevealed(true);
                      triggerConfettiShower();
                    }}
                    instructionsText={text.scratchText}
                  />
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* SECTION 5: TIMELINE SCHEDULE (Cinematic Staggered Slide-In-Right) */}
        {invitation.details?.schedule?.length > 0 && (
          <div 
            style={{
              position: "relative",
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden"
            }}
          >
            <div className="ken-burns-container">
              <div className="ken-burns-bg" style={{ backgroundImage: `url(${invitation.backgroundImage || galleryPhotos[2] || galleryPhotos[0] || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200"})` }} />
            </div>
            <div className="parallax-dark-overlay" />

            <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 520, margin: "0 auto", padding: "0 24px" }}>
              <ScrollReveal>
                <h2 style={{ textAlign: "center", color: "#D4AF37", fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 44 }}>
                  {text.timelineTitle}
                </h2>
              </ScrollReveal>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {invitation.details.schedule.map((ev, i) => {
                  const d = new Date(ev.time);
                  return (
                    <div 
                      key={i} 
                      className="timeline-card-staggered"
                      style={{ 
                        animationDelay: `${i * 0.3}s`,
                        border: "1px solid rgba(212, 175, 55, 0.2)", 
                        borderRadius: 12, 
                        padding: "24px 28px", 
                        background: "rgba(15, 15, 15, 0.92)", 
                        display: "flex", 
                        alignItems: "flex-start", 
                        gap: 16,
                        boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
                      }}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#D4AF37", marginTop: 7, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ color: "#D4AF37", fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: 600, margin: "0 0 6px", letterSpacing: "0.05em" }}>
                          {ev.name}
                        </p>
                        <p style={{ color: "#FFFFFF", fontFamily: "'Montserrat', sans-serif", fontSize: 12, fontWeight: 300, opacity: 0.6, margin: "0 0 10px" }}>
                          {d.toLocaleDateString(lang === "ur" ? "ur-PK" : "en-US", { weekday: "short", month: "long", day: "numeric" })} · {d.toLocaleTimeString(lang === "ur" ? "ur-PK" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {ev.venue && (
                          <p style={{ color: "#FFFFFF", fontSize: 13, fontWeight: 400, margin: "0 0 6px", opacity: 0.85, fontFamily: "'Montserrat', sans-serif" }}>
                            📍 Venue: {ev.venue}
                          </p>
                        )}
                        {ev.description && (
                          <p style={{ color: "#FFFFFF", fontSize: 13, margin: 0, fontStyle: "italic", opacity: 0.7, fontFamily: "'Montserrat', sans-serif" }}>
                            {ev.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6: INTERACTIVE RSVP REGISTRY */}
        <div style={{ backgroundColor: "#0F0F0F", padding: "100px 24px", borderTop: "1px solid rgba(212, 175, 55, 0.15)" }}>
          <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <ScrollReveal duration="1.5s" ease="ease-out" distance="30px">
              <div style={{ background: "rgba(4, 57, 39, 0.1)", border: "1px solid rgba(212, 175, 55, 0.2)", borderRadius: 16, padding: "44px 36px", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
                {rsvpDone ? (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <div style={{ fontSize: 44, marginBottom: 16 }}>✨</div>
                    <h3 style={{ color: "#D4AF37", fontSize: 24, fontFamily: "'Cinzel', serif", fontWeight: 500, marginBottom: 12, letterSpacing: "0.08em" }}>
                      {text.successTitle}
                    </h3>
                    <p style={{ color: "#FFFFFF", fontSize: 14, fontFamily: "'Montserrat', sans-serif", opacity: 0.8, lineHeight: 1.6, margin: 0 }}>
                      {text.successDesc}
                    </p>
                  </div>
                ) : (
                  <>
                    <h3 style={{ textAlign: "center", color: "#D4AF37", fontSize: 24, fontFamily: "'Cinzel', serif", fontWeight: 500, margin: "0 0 8px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      {text.rsvpTitle}
                    </h3>
                    <p style={{ textAlign: "center", color: "#FFFFFF", fontSize: 13, fontFamily: "'Montserrat', sans-serif", opacity: 0.6, margin: "0 0 28px" }}>
                      {text.rsvpDesc}
                    </p>

                    <form onSubmit={submitRsvp} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.15em", color: "#D4AF37", marginBottom: 6, fontFamily: "'Cinzel', serif" }}>
                          {text.fullName}
                        </label>
                        <input
                          type="text"
                          required
                          value={rsvp.name}
                          onChange={e => setRsvp(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g. Faisal Khan"
                          className="dark-moody-input"
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.15em", color: "#D4AF37", marginBottom: 6, fontFamily: "'Cinzel', serif" }}>
                          {text.blessing}
                        </label>
                        <textarea
                          rows={3}
                          value={rsvp.blessing}
                          onChange={e => setRsvp(prev => ({ ...prev, blessing: e.target.value }))}
                          placeholder="Send your warm wishes to the couple..."
                          className="dark-moody-input"
                          style={{ resize: "none" }}
                        />
                      </div>

                      {/* GOLD RSVP BUTTON */}
                      <button
                        type="submit"
                        disabled={rsvpLoading}
                        style={{
                          width: "100%",
                          padding: "14px",
                          backgroundColor: "#D4AF37", 
                          color: "#0F0F0F", 
                          border: "none",
                          borderRadius: 8,
                          fontSize: 12.5,
                          fontWeight: 700,
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          fontFamily: "'Cinzel', serif",
                          marginTop: 8,
                          outline: "none",
                          boxShadow: "0 4px 15px rgba(212, 175, 55, 0.25)"
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = "#FFF2B2";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = "#D4AF37";
                          e.currentTarget.style.transform = "none";
                        }}
                      >
                        {rsvpLoading ? text.sending : text.sendRsvp}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* SECTION 7: BOTTOM ANNOUNCEMENT & CONTACT FOOTER */}
        <div style={{ backgroundColor: "#0F0F0F", padding: "80px 24px", textAlign: "center", borderTop: "1px solid rgba(212, 175, 55, 0.15)" }}>
          <div style={{ maxWidth: 520, margin: "0 auto" }}>
            
            {customStyle.customNote && customStyle.notePosition === "bottom" && (
              <ScrollReveal duration="1.5s" ease="ease-out" distance="30px">
                <div style={{
                  padding: "32px",
                  background: "rgba(4, 57, 39, 0.15)",
                  borderRadius: 16,
                  border: "1px solid rgba(212, 175, 55, 0.2)",
                  borderLeft: "4px solid #D4AF37",
                  textAlign: "center",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                  marginBottom: 60,
                  position: "relative"
                }}>
                  <div style={{ position: "absolute", top: 8, left: 16, color: "#D4AF37", opacity: 0.3, fontSize: 36, fontFamily: "serif", lineHeight: 1 }}>“</div>
                  <p style={{
                    margin: 0,
                    fontSize: 14.5,
                    color: "#FFFFFF",
                    fontStyle: "italic",
                    lineHeight: 1.7,
                    whiteSpace: "pre-line",
                    fontFamily: lang === "ur" ? "'Noto Nastaliq Urdu', serif" : lang === "hi" ? "'Outfit', sans-serif" : "'Montserrat', sans-serif"
                  }}>
                    {customStyle.customNote}
                  </p>
                  <div style={{ position: "absolute", bottom: -8, right: 16, color: "#D4AF37", opacity: 0.3, fontSize: 36, fontFamily: "serif", lineHeight: 1 }}>”</div>
                </div>
              </ScrollReveal>
            )}

            {/* Couple Email contact block */}
            {invitation.coupleEmail && (
              <ScrollReveal duration="1.5s" ease="ease-out" distance="30px">
                <div style={{ marginBottom: 60 }}>
                  <p style={{ color: "#D4AF37", fontSize: 11, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10, fontFamily: "'Cinzel', serif" }}>
                    {eventType === "wedding" ? text.contactCouple : text.contactHosts}
                  </p>
                  <a href={`mailto:${invitation.coupleEmail}`} style={{ color: "#FFFFFF", fontSize: 15, textDecoration: "none", borderBottom: "1px solid #D4AF37", paddingBottom: 2, fontWeight: 400, fontFamily: "'Montserrat', sans-serif" }}>
                    {invitation.coupleEmail}
                  </a>
                </div>
              </ScrollReveal>
            )}

            <div style={{ paddingTop: 24, borderTop: "1px solid rgba(212, 175, 55, 0.1)" }}>
              <p style={{ color: "#FFFFFF", opacity: 0.4, fontFamily: "'Montserrat', sans-serif", fontSize: 9.5, letterSpacing: "0.25em", textTransform: "uppercase" }}>
                Taabir Digital Invitations · Powered by Flynx
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBohemianTerracotta = () => {
    const galleryPhotos = invitation.photos || (invitation.photoUrl ? [invitation.photoUrl] : []);
    const hasPhotos = galleryPhotos.length > 0;
    const customBg = invitation.backgroundImage || galleryPhotos[0] || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200";

    return (
      <div 
        style={{
          opacity: phase !== "closed" ? 1 : 0,
          transform: phase !== "closed" ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 1.5s ease-out, transform 1.5s ease-out",
          width: "100%",
          margin: "0 auto",
          backgroundColor: "#FFFDD0",
          color: "#333333",
          fontFamily: lang === "ur" ? "'Noto Nastaliq Urdu', serif" : lang === "hi" ? "'Outfit', sans-serif" : "'Roboto', sans-serif",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Pacifico&family=Roboto:wght@300;400;500;700&display=swap');
          
          @keyframes zoomInFade {
            from { transform: scale(0.92); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .zoom-in-fade-el {
            opacity: 0;
            animation: zoomInFade 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }

          @keyframes levitateAnim {
            0% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0); }
          }
          .levitate-botanical {
            animation: levitateAnim 4s ease-in-out infinite;
          }

          .boho-card {
            background-color: rgba(255, 253, 208, 0.6);
            backdrop-filter: blur(10px);
            border: 2px solid rgba(157, 193, 131, 0.3);
            border-radius: 60% 40% 60% 40% / 40% 60% 40% 60%;
            padding: 40px;
            box-shadow: 0 15px 35px -15px rgba(226, 114, 91, 0.15);
            transition: all 0.5s ease;
          }
          .boho-card:hover {
            border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%;
            border-color: rgba(226, 114, 91, 0.5);
          }

          .boho-image-mask {
            border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
            overflow: hidden;
            border: 3px solid #E2725B;
            transition: all 0.8s ease-in-out;
          }
          .boho-image-mask:hover {
            border-radius: 50%;
          }

          .boho-input {
            width: 100%;
            padding: 12px 16px;
            background-color: rgba(255, 255, 255, 0.9);
            border: 1px solid rgba(226, 114, 91, 0.3);
            border-radius: 20px;
            color: #333333;
            font-size: 13.5px;
            font-family: 'Roboto', sans-serif;
            transition: all 0.3s;
            outline: none;
          }
          .boho-input:focus {
            border-color: #E2725B;
            box-shadow: 0 0 0 3px rgba(226, 114, 91, 0.1);
            background-color: #FFFFFF;
          }

          .boho-btn-pulse {
            background: linear-gradient(135deg, #E2725B 0%, #d65c43 100%);
            color: #FFFDD0;
            font-weight: 700;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            border: none;
            border-radius: 25px;
            box-shadow: 0 10px 20px rgba(226, 114, 91, 0.2);
            transition: all 0.3s;
            cursor: pointer;
          }
          .boho-btn-pulse:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 25px rgba(226, 114, 91, 0.3);
          }
        `}</style>

        {/* FLOATING BOTANICAL DECORATIVE VECTORS */}
        <div className="levitate-botanical" style={{ position: "absolute", top: "10%", left: "5%", width: 120, height: 120, opacity: 0.2, pointerEvents: "none", zIndex: 1 }}>
          <svg viewBox="0 0 100 100" fill="none" stroke="#9DC183" strokeWidth="2" strokeLinecap="round">
            <path d="M50,90 C50,90 20,60 20,40 C20,20 35,10 50,30 C65,10 80,20 80,40 C80,60 50,90 50,90 Z" />
            <path d="M50,30 L50,90" />
            <path d="M50,45 C40,40 30,45 30,45" />
            <path d="M50,60 C60,55 70,60 70,60" />
            <path d="M50,75 C40,70 30,75 30,75" />
          </svg>
        </div>
        <div className="levitate-botanical" style={{ position: "absolute", top: "25%", right: "3%", width: 140, height: 140, opacity: 0.25, pointerEvents: "none", zIndex: 1, animationDelay: "1s" }}>
          <svg viewBox="0 0 100 100" fill="none" stroke="#9DC183" strokeWidth="1.5">
            <path d="M10,90 Q40,70 50,10 Q60,70 90,90" />
            <circle cx="50" cy="10" r="4" fill="#E2725B" />
            <circle cx="25" cy="50" r="3" fill="#E2725B" />
            <circle cx="75" cy="50" r="3" fill="#E2725B" />
          </svg>
        </div>
        <div className="levitate-botanical" style={{ position: "absolute", bottom: "15%", left: "4%", width: 130, height: 130, opacity: 0.22, pointerEvents: "none", zIndex: 1, animationDelay: "2s" }}>
          <svg viewBox="0 0 100 100" fill="none" stroke="#9DC183" strokeWidth="2">
            <path d="M10,50 Q50,90 90,50" />
            <path d="M50,10 L50,90" />
          </svg>
        </div>

        {/* HERO HEADER SECTION WITH FULL SCREEN IMAGE & FLUID OVERLAYS */}
        <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", zIndex: 2 }}>
          {/* Cover image styled as an organic fluid mask */}
          <div className="zoom-in-fade-el" style={{ width: "100%", maxWidth: 500, aspectRatio: "1/1", position: "relative", marginBottom: 32 }}>
            <div className="boho-image-mask" style={{ width: "100%", height: "100%" }}>
              <img src={customBg} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            {/* Absolute organic frame border */}
            <div style={{
              position: "absolute", inset: -10, border: "2px dashed #9DC183",
              borderRadius: "40% 60% 50% 50% / 50% 50% 60% 40%", pointerEvents: "none", opacity: 0.5
            }} />
          </div>

          <div className="zoom-in-fade-el" style={{ textAlign: "center", maxWidth: 600, animationDelay: "0.4s" }}>
            <span style={{ fontFamily: "'Pacifico', cursive", fontSize: 24, color: "#E2725B", display: "block", marginBottom: 8 }}>
              {eventType === "wedding" ? text.wedding : 
               eventType === "birthday" ? text.birthday : 
               eventType === "anniversary" ? text.anniversary : 
               eventType === "family_function" ? text.family_function : text.general}
            </span>
            <h1 style={{ fontFamily: "'Pacifico', cursive", fontSize: 52, color: "#E2725B", margin: "12px 0 0", lineHeight: 1.2 }}>
              {invitation.brideName}
            </h1>
            {invitation.brideParentsName && (
              <p style={{ color: "#9DC183", fontSize: 13, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", marginTop: 4 }}>
                {eventType === "wedding" ? `${text.daughterOf} ${invitation.brideParentsName}` : invitation.brideParentsName}
              </p>
            )}

            {invitation.groomName && (
              <>
                <span style={{ fontFamily: "'Pacifico', cursive", fontSize: 28, color: "#9DC183", display: "block", margin: "12px 0" }}>&amp;</span>
                <h1 style={{ fontFamily: "'Pacifico', cursive", fontSize: 52, color: "#E2725B", margin: 0, lineHeight: 1.2 }}>
                  {invitation.groomName}
                </h1>
                {invitation.groomParentsName && (
                  <p style={{ color: "#9DC183", fontSize: 13, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", marginTop: 4 }}>
                    {eventType === "wedding" ? `${text.sonOf} ${invitation.groomParentsName}` : invitation.groomParentsName}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* QURANIC VERSE / BLESSED QUOTE */}
        <div style={{ padding: "80px 24px", maxWidth: 600, margin: "0 auto", textAlign: "center", zIndex: 2 }}>
          <ScrollReveal>
            <div className="boho-card" style={{ padding: "40px 30px" }}>
              <span style={{ fontSize: 28, color: "#9DC183", display: "block", marginBottom: 12 }}>🌿</span>
              {eventType === "wedding" ? (
                <>
                  <p style={{ fontFamily: "'Pacifico', cursive", fontSize: 18, color: "#E2725B", margin: 0, lineHeight: 1.6 }}>
                    &ldquo;And We created you in pairs&rdquo;
                  </p>
                  <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 10.5, color: "#9DC183", textTransform: "uppercase", letterSpacing: "0.15em", marginTop: 8, fontWeight: 700 }}>
                    — Quran 78:8
                  </p>
                </>
              ) : (
                <>
                  <p style={{ fontFamily: "'Pacifico', cursive", fontSize: 16, color: "#E2725B", margin: 0, lineHeight: 1.6 }}>
                    &ldquo;Love, laughter, and beautiful memories in a warm meadow celebration.&rdquo;
                  </p>
                  <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: 10.5, color: "#9DC183", textTransform: "uppercase", letterSpacing: "0.15em", marginTop: 8, fontWeight: 700 }}>
                    — Welcome blessings
                  </p>
                </>
              )}
            </div>
          </ScrollReveal>
        </div>

        {/* TIME COUNTDOWN */}
        <div style={{ padding: "40px 24px", maxWidth: 500, margin: "0 auto", zIndex: 2 }}>
          <ScrollReveal>
            <p style={{ textAlign: "center", color: "#9DC183", fontFamily: "'Roboto', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 24 }}>
              {text.countdown}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }} dir="ltr">
              {[["days", timeLeft.days, text.days], ["hours", timeLeft.hours, text.hours], ["mins", timeLeft.minutes, text.mins], ["secs", timeLeft.seconds, text.secs]].map(([label, val, transName]) => (
                <div key={label} style={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)", border: "1px dashed rgba(226, 114, 91, 0.4)",
                  borderRadius: "50% 50% 60% 40% / 40% 60% 40% 60%", padding: "20px 8px", textAlign: "center",
                  boxShadow: "0 8px 20px rgba(226,114,91,0.05)"
                }}>
                  <span style={{ color: "#E2725B", fontSize: 32, fontWeight: 700, display: "block", lineHeight: 1, fontFamily: "'Roboto', sans-serif" }}>
                    {String(val).padStart(2, "0")}
                  </span>
                  <span style={{ color: "#9DC183", fontFamily: "'Roboto', sans-serif", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 6, display: "block", fontWeight: 700 }}>
                    {transName}
                  </span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>

        {/* CUSTOM ANNOUNCEMENT NOTE */}
        {customStyle.customNote && (
          <div style={{ padding: "40px 24px", maxWidth: 600, margin: "0 auto", zIndex: 2 }}>
            <ScrollReveal>
              <div className="boho-card" style={{ borderRadius: "30% 70% 40% 60% / 50% 40% 60% 50%" }}>
                <p style={{
                  margin: 0,
                  fontSize: 15,
                  color: "#333333",
                  fontStyle: "italic",
                  lineHeight: 1.7,
                  whiteSpace: "pre-line",
                  fontFamily: lang === "ur" ? "'Noto Nastaliq Urdu', serif" : "'Roboto', sans-serif"
                }}>
                  {customStyle.customNote}
                </p>
              </div>
            </ScrollReveal>
          </div>
        )}

        {/* DATE, TIME & MAPS VENUE LOCATION */}
        <div style={{ padding: "60px 24px", maxWidth: 600, margin: "0 auto", zIndex: 2 }}>
          <ScrollReveal>
            <div className="boho-card" style={{ textAlign: "center" }}>
              <span style={{ fontSize: 24, display: "block", marginBottom: 12 }}>📅</span>
              <p style={{ color: "#9DC183", fontFamily: "'Roboto', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
                {text.dateVenue}
              </p>
              <p style={{ color: "#E2725B", fontSize: 22, fontWeight: 700, marginBottom: 4, fontFamily: "'Roboto', sans-serif" }}>{fmt}</p>
              <p style={{ color: "#9DC183", fontSize: 15, fontWeight: 500, marginBottom: 20 }}>at {fmtTime}</p>
              
              <div style={{ borderTop: "1px dashed rgba(157, 193, 131, 0.4)", paddingTop: 20 }}>
                <p style={{ color: "#E2725B", fontSize: 18, fontWeight: 700, marginBottom: 6, fontFamily: "'Roboto', sans-serif" }}>{invitation.venue?.name}</p>
                <p style={{ color: "#555555", fontSize: 14, lineHeight: 1.6 }}>{invitation.venue?.address}</p>
              </div>

              {invitation.venue?.googleMapsUrl && (
                <a href={invitation.venue.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                  className="boho-btn-pulse"
                  style={{ display: "inline-block", marginTop: 24, padding: "10px 24px", fontSize: 11, textDecoration: "none" }}>
                  📍 {text.openMaps}
                </a>
              )}
            </div>
          </ScrollReveal>
        </div>

        {/* SCHEDULE TIMELINE */}
        {invitation.details?.schedule?.length > 0 && (
          <div style={{ padding: "60px 24px", maxWidth: 500, margin: "0 auto", zIndex: 2 }}>
            <ScrollReveal>
              <p style={{ textAlign: "center", color: "#9DC183", fontFamily: "'Roboto', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 28 }}>
                {text.timelineTitle}
              </p>
            </ScrollReveal>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {invitation.details.schedule.map((ev, i) => {
                const d = new Date(ev.time);
                return (
                  <ScrollReveal key={i}>
                    <div className="boho-card" style={{
                      padding: "24px 30px", display: "flex", alignItems: "center", gap: 20,
                      borderRadius: i % 2 === 0 ? "40% 60% 50% 50% / 50% 50% 60% 40%" : "60% 40% 60% 40% / 40% 60% 40% 60%"
                    }}>
                      <div style={{ fontSize: 24, flexShrink: 0 }}>🌸</div>
                      <div>
                        <p style={{ color: "#E2725B", fontSize: 18, fontWeight: 700, margin: "0 0 4px", fontFamily: "'Roboto', sans-serif" }}>{ev.name}</p>
                        <p style={{ color: "#9DC183", fontFamily: "'Roboto', sans-serif", fontSize: 12, fontWeight: 700, margin: "0 0 6px" }}>
                          {d.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" })} · {d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {ev.description && (
                          <p style={{ color: "#555555", fontSize: 12.5, margin: 0, lineHeight: 1.5 }}>{ev.description}</p>
                        )}
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        )}

        {/* PHOTO GALLERY CAROUSEL */}
        {hasPhotos && galleryPhotos.length > 1 && (
          <div style={{ padding: "60px 24px", maxWidth: 600, margin: "0 auto", zIndex: 2 }}>
            <ScrollReveal>
              <p style={{ textAlign: "center", color: "#9DC183", fontFamily: "'Roboto', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 28 }}>
                Meadow Memories
              </p>
              <div style={{ border: "2px solid rgba(157, 193, 131, 0.3)", borderRadius: "40% 60% 50% 50% / 50% 50% 60% 40%", overflow: "hidden", background: "#FFFDD0", padding: 8, position: "relative" }}>
                <div style={{ borderRadius: "35% 55% 45% 45% / 45% 45% 55% 35%", overflow: "hidden", aspectRatio: "4/3", position: "relative" }}>
                  {galleryPhotos.map((pic, index) => (
                    <img
                      key={index}
                      src={pic}
                      alt="Boho Gallery"
                      style={{
                        position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block",
                        opacity: index === activePhotoIdx ? 1 : 0,
                        transform: index === activePhotoIdx ? "scale(1)" : "scale(1.08)",
                        transition: "opacity 1.5s ease-out, transform 1.5s ease-out",
                        zIndex: index === activePhotoIdx ? 2 : 1,
                        pointerEvents: index === activePhotoIdx ? "auto" : "none",
                      }}
                    />
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => setActivePhotoIdx((prev) => (prev === 0 ? galleryPhotos.length - 1 : prev - 1))}
                    style={{
                      position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                      background: "rgba(226, 114, 91, 0.8)", color: "#FFFDD0", border: "none", borderRadius: "50%",
                      width: 36, height: 36, display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center",
                      cursor: "pointer", fontSize: 20, zIndex: 10, outline: "none", fontWeight: "bold"
                    }}
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePhotoIdx((prev) => (prev === galleryPhotos.length - 1 ? 0 : prev + 1))}
                    style={{
                      position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                      background: "rgba(226, 114, 91, 0.8)", color: "#FFFDD0", border: "none", borderRadius: "50%",
                      width: 36, height: 36, display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center",
                      cursor: "pointer", fontSize: 20, zIndex: 10, outline: "none", fontWeight: "bold"
                    }}
                  >
                    ›
                  </button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        )}

        {/* RSVP FORM REGISTRY */}
        <div style={{ padding: "80px 24px 100px", maxWidth: 550, margin: "0 auto", zIndex: 2 }}>
          <ScrollReveal>
            <div className="boho-card" style={{ padding: "44px 36px" }}>
              <span style={{ fontSize: 24, display: "block", marginBottom: 12, textAlign: "center" }}>💌</span>
              <h2 style={{ textAlign: "center", fontFamily: "'Pacifico', cursive", fontSize: 28, color: "#E2725B", margin: "0 0 10px" }}>
                {text.rsvpTitle}
              </h2>
              <p style={{ textAlign: "center", color: "#9DC183", fontSize: 13, marginBottom: 28, fontWeight: 500 }}>
                {text.rsvpSub}
              </p>

              {rsvpDone ? (
                <div style={{
                  padding: "24px", background: "rgba(157, 193, 131, 0.15)", border: "1px dashed #9DC183",
                  borderRadius: 16, textAlign: "center"
                }}>
                  <p style={{ color: "#E2725B", fontSize: 18, fontWeight: 700, margin: "0 0 6px", fontFamily: "'Roboto', sans-serif" }}>✨ Thank you!</p>
                  <p style={{ color: "#333333", fontSize: 13, margin: 0 }}>Your wishes and blessings have been successfully registered.</p>
                </div>
              ) : (
                <form onSubmit={submitRsvp} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <label style={{ display: "block", color: "#E2725B", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your lovely name..."
                      value={rsvp.name}
                      onChange={(e) => setRsvp(p => ({ ...p, name: e.target.value }))}
                      className="boho-input"
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", color: "#E2725B", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                      Will you attend?
                    </label>
                    <select
                      value={rsvp.attending}
                      onChange={(e) => setRsvp(p => ({ ...p, attending: e.target.value }))}
                      className="boho-input"
                      style={{ cursor: "pointer" }}
                    >
                      <option value="yes">Yes, with pleasure!</option>
                      <option value="no">Regretfully, no</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", color: "#E2725B", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                      Warm Wishes &amp; Blessings
                    </label>
                    <textarea
                      placeholder="Write your beautiful blessings..."
                      rows={4}
                      value={rsvp.blessing}
                      onChange={(e) => setRsvp(p => ({ ...p, blessing: e.target.value }))}
                      className="boho-input"
                      style={{ resize: "none" }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={rsvpLoading}
                    className="boho-btn-pulse"
                    style={{ padding: "14px 20px", marginTop: 8 }}
                  >
                    {rsvpLoading ? "Sending..." : "Submit Wishes & Blessings"}
                  </button>
                </form>
              )}
            </div>
          </ScrollReveal>
        </div>

        {/* BOTTOM REGISTRY CARD AND CONTACT INFO */}
        <div style={{ padding: "60px 24px 80px", textAlign: "center", background: "rgba(157, 193, 131, 0.1)", zIndex: 2 }}>
          <ScrollReveal>
            <p style={{ fontFamily: "'Pacifico', cursive", fontSize: 20, color: "#E2725B", marginBottom: 12 }}>
              With Love,
            </p>
            <p style={{ color: "#9DC183", fontSize: 15, fontWeight: 700, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {invitation.brideName} {invitation.groomName ? `& ${invitation.groomName}` : ""}
            </p>

            {invitation.coupleEmail && (
              <p style={{ marginTop: 12, fontSize: 14 }}>
                For any details, reach out to us at:{" "}
                <a href={`mailto:${invitation.coupleEmail}`} style={{ color: "#E2725B", textDecoration: "none", fontWeight: 700, borderBottom: "1px solid #E2725B" }}>
                  {invitation.coupleEmail}
                </a>
              </p>
            )}

            <div style={{ paddingTop: 36, marginTop: 48, borderTop: "1px dashed rgba(157, 193, 131, 0.3)" }}>
              <p style={{ color: "#9DC183", fontFamily: "'Roboto', sans-serif", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700 }}>
                Taabir Digital Invitations · Powered by Flynx
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    );
  };

  const renderRoyalGlamour = () => {
    const galleryPhotos = invitation.photos || (invitation.photoUrl ? [invitation.photoUrl] : []);
    const hasPhotos = galleryPhotos.length > 0;
    const customBg = invitation.backgroundImage || galleryPhotos[0] || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200";

    return (
      <div 
        style={{
          opacity: phase !== "closed" ? 1 : 0,
          transform: phase !== "closed" ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 1.5s ease-out, transform 1.5s ease-out",
          width: "100%",
          margin: "0 auto",
          backgroundColor: "#0A1128", // Deep Royal Navy Blue
          color: "#FFFFFF",
          fontFamily: lang === "ur" ? "'Noto Nastaliq Urdu', serif" : lang === "hi" ? "'Outfit', sans-serif" : "'Lato', sans-serif",
        }}
      >
        {/* Dynamic Google Fonts injection self-contained */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Lato:ital,wght@0,300;0,400;0,700;1,400&display=swap');
          
          @keyframes starPulse {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 0.9; transform: scale(1.1); }
          }
          .glass-overlay-card {
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            border: 1px solid rgba(255, 255, 255, 0.12);
            box-shadow: 0 12px 36px 0 rgba(0, 0, 0, 0.4);
            border-radius: 20px;
            padding: 36px 28px;
            margin-bottom: 24px;
            transition: transform 0.3s ease;
          }
          .glass-overlay-card:hover {
            transform: translateY(-2px);
          }
          .glamour-input {
            width: 100%;
            padding: 14px 18px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 12px;
            color: #FFFFFF;
            font-family: inherit;
            font-size: 14px;
            outline: none;
            transition: all 0.3s;
          }
          .glamour-input:focus {
            border-color: #B76E79;
            background: rgba(255, 255, 255, 0.1);
            box-shadow: 0 0 10px rgba(183, 110, 121, 0.3);
          }
          .glamour-star {
            animation: starPulse 4s ease-in-out infinite;
          }
          .bullet-circle {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #B76E79;
            border: 2px solid #0A1128;
            box-shadow: 0 0 8px #B76E79;
            position: absolute;
            left: -6.5px;
            top: 5px;
          }
        `}</style>

        {/* SECTION 1: SOPHISTICATED GLASS HERO */}
        <div 
          style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            backgroundImage: `radial-gradient(circle at center, #0F1D4A 0%, #060B1E 100%)`
          }}
        >
          {/* Parallax Starry particles */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 bg-white glamour-star" style={{ animationDelay: "0.5s" }} />
            <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white glamour-star" style={{ animationDelay: "1.2s" }} />
            <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-pink-100 glamour-star" style={{ animationDelay: "2s" }} />
            <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-white glamour-star" style={{ animationDelay: "0.2s" }} />
          </div>

          <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 540, padding: "0 24px" }}>
            <GlassScrollReveal>
              <div 
                className="glass-overlay-card"
                style={{ 
                  textAlign: "center", 
                  padding: "54px 36px", 
                  border: "2px solid rgba(183, 110, 121, 0.25)" 
                }}
              >
                <p style={{ color: "#B76E79", fontSize: 26, fontFamily: "'Noto Naskh Arabic', serif", marginBottom: 12, lineHeight: 1.6 }}>
                  {invitation.headerArabic || "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"}
                </p>
                <p style={{ color: "#FFFFFF", fontFamily: "'Lato', sans-serif", fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.7, marginBottom: 32 }}>
                  {invitation.headerGrace || "Under the Grace of Almighty Allah"}
                </p>
                
                <p style={{ color: "#B76E79", fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontStyle: "italic", letterSpacing: "0.08em", margin: "0 0 16px" }}>
                  {eventType === "wedding" ? text.wedding : 
                   eventType === "birthday" ? text.birthday : 
                   eventType === "anniversary" ? text.anniversary : 
                   text.general}
                </p>

                <h1 style={{ color: "#FFFFFF", fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 300, lineHeight: 1.2, margin: "0 0 24px", letterSpacing: "0.08em" }}>
                  {invitation.brideName}
                  {invitation.groomName && (
                    <>
                      <span style={{ display: "block", fontSize: 22, color: "#B76E79", margin: "10px 0" }}>&amp;</span>
                      {invitation.groomName}
                    </>
                  )}
                </h1>

                <div style={{ width: 60, height: 1, background: "linear-gradient(to right, transparent, #B76E79, transparent)", margin: "0 auto 28px" }} />

                <p style={{ color: "#FFFFFF", fontFamily: "'Lato', sans-serif", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.9 }}>
                  {fmt}
                </p>
              </div>
            </GlassScrollReveal>
          </div>
        </div>

        {/* SECTION 2: INTRO CARD */}
        <div style={{ padding: "80px 24px 40px", maxWidth: 540, margin: "0 auto" }}>
          <GlassScrollReveal>
            <div className="glass-overlay-card" style={{ textAlign: "center" }}>
              <span className="text-2xl block mb-4">🥂</span>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "#B76E79", fontWeight: 400, marginBottom: 18, letterSpacing: "0.05em" }}>
                {lang === "ur" ? "تقریب میں خوش آمدید" : "A Royal Celebration"}
              </h2>
              
              <p style={{ fontSize: 15, lineHeight: 1.7, opacity: 0.8, fontWeight: 300, margin: "0 auto 28px", maxWidth: 440 }}>
                {lang === "ur" ? (
                  `ہم انتہائی خلوص اور محبت کے ساتھ آپ کو اس حسین و پروقار تقریب میں شرکت کی دعوت دیتے ہیں۔ آپ کی آمد ہماری خوشیوں کو دوبالا کرے گی۔`
                ) : (
                  `We cordially invite you to witness and celebrate the union of love, grace, and new beginnings. Please grace our celebrations with your prayers and presence.`
                )}
              </p>

              {/* Parents Section */}
              <div style={{ borderTop: "1px dashed rgba(255,255,255,0.15)", paddingTop: 28 }}>
                <p style={{ color: "#B76E79", fontFamily: "'Cormorant Garamond', serif", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>
                  Invited By the Proud Parents
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
                  {invitation.brideParentsName && (
                    <p style={{ margin: 0, opacity: 0.95 }}>
                      <span style={{ opacity: 0.65 }}>Parents of Bride:</span> {invitation.brideParentsName}
                    </p>
                  )}
                  {invitation.groomParentsName && (
                    <p style={{ margin: 0, opacity: 0.95 }}>
                      <span style={{ opacity: 0.65 }}>Parents of Groom:</span> {invitation.groomParentsName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </GlassScrollReveal>
        </div>

        {/* SECTION 3: DATE & TIMER CARD */}
        <div style={{ padding: "20px 24px 40px", maxWidth: 540, margin: "0 auto" }}>
          <GlassScrollReveal>
            <div className="glass-overlay-card" style={{ textAlign: "center" }}>
              <span className="text-2xl block mb-4">📅</span>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: "#B76E79", fontWeight: 400, marginBottom: 16, letterSpacing: "0.05em" }}>
                {text.dateVenue}
              </h2>
              
              <p style={{ fontSize: 18, fontWeight: 300, margin: "0 0 6px", letterSpacing: "0.05em" }}>
                {fmt}
              </p>
              <p style={{ fontSize: 14, opacity: 0.7, margin: "0 0 24px" }}>
                {fmtTime}
              </p>

              {/* Venue details */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: 20, marginBottom: 28 }}>
                <p style={{ fontSize: 11, color: "#B76E79", letterSpacing: "0.2em", margin: "0 0 8px" }}>
                  📍 THE VENUE
                </p>
                <p style={{ fontSize: 16, fontWeight: 600, margin: "0 0 6px" }}>
                  {invitation.venue?.name}
                </p>
                <p style={{ fontSize: 13, opacity: 0.75, margin: "0 0 16px", lineHeight: 1.5 }}>
                  {invitation.venue?.address}
                </p>

                {invitation.venue?.googleMapsUrl && (
                  <a 
                    href={invitation.venue.googleMapsUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs font-bold transition-all"
                    style={{ 
                      backgroundColor: "#B76E79", 
                      color: "#FFFFFF",
                      boxShadow: "0 4px 15px rgba(183,110,121,0.3)",
                      textDecoration: "none"
                    }}
                  >
                    {text.openMaps}
                  </a>
                )}
              </div>

              {/* Countdown Ticker */}
              <div>
                <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#B76E79", marginBottom: 14 }}>
                  {text.countdown}
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
                  {[
                    { val: timeLeft.days, label: text.days },
                    { val: timeLeft.hours, label: text.hours },
                    { val: timeLeft.minutes, label: text.mins },
                    { val: timeLeft.seconds, label: text.secs }
                  ].map((unit, i) => (
                    <div 
                      key={i} 
                      style={{ 
                        width: 68, 
                        padding: "10px 0", 
                        background: "rgba(255,255,255,0.05)", 
                        border: "1px solid rgba(255,255,255,0.08)", 
                        borderRadius: 10 
                      }}
                    >
                      <span className="block text-xl font-bold leading-none" style={{ color: "#FFFFFF" }}>{unit.val}</span>
                      <span className="block text-[8.5px] uppercase tracking-wider mt-1.5 opacity-60">{unit.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassScrollReveal>
        </div>

        {/* SECTION 4: SCRATCH CARD (IF ENABLED) */}
        {hasScratch && (
          <div style={{ padding: "20px 24px 40px", maxWidth: 540, margin: "0 auto" }}>
            <GlassScrollReveal>
              <div className="glass-overlay-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                <span className="text-2xl block mb-3">✨</span>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: "#B76E79", fontWeight: 400, marginBottom: 10, letterSpacing: "0.05em" }}>
                  Scratch To Reveal Date
                </h2>
                <p style={{ fontSize: 12, opacity: 0.6, marginBottom: 20, textAlign: "center" }}>
                  Wipe or rub the metallic layer below to reveal the exclusive date!
                </p>

                <div style={{ width: 280, height: 180, position: "relative", overflow: "hidden", borderRadius: 16 }}>
                  {/* Revealed Date behind */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "rgba(255,255,255,0.03)",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    border: "1px solid rgba(255,255,255,0.08)"
                  }}>
                    <span style={{ fontSize: 11, letterSpacing: "0.2em", color: "#B76E79", textTransform: "uppercase" }}>SAVE THE DATE</span>
                    <span style={{ fontSize: 20, fontWeight: 700, margin: "6px 0", color: "#FFFFFF" }}>{fmt}</span>
                    <span style={{ fontSize: 12, opacity: 0.7 }}>We can't wait to see you!</span>
                  </div>

                  {/* Canvas Cover */}
                  <canvas 
                    id="scratchCanvas"
                    style={{ position: "absolute", inset: 0, cursor: "grab", zIndex: 1 }}
                  />
                </div>
              </div>
            </GlassScrollReveal>
          </div>
        )}

        {/* SECTION 5: SCHEDULE TIMELINE SCHEDULE */}
        <div style={{ padding: "20px 24px 40px", maxWidth: 540, margin: "0 auto" }}>
          <GlassScrollReveal>
            <div className="glass-overlay-card">
              <h2 style={{ textAlign: "center", fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "#B76E79", fontWeight: 400, marginBottom: 32, letterSpacing: "0.05em" }}>
                {text.timelineTitle}
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {invitation.details.schedule.map((ev, i) => {
                  const d = new Date(ev.time);
                  return (
                    <div key={i} className="timeline-node">
                      <div className="bullet-circle" />
                      <div style={{ marginLeft: 12 }}>
                        <p style={{ color: "#FFFFFF", fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 500, margin: "0 0 4px" }}>
                          {ev.name}
                        </p>
                        <p style={{ color: "#B76E79", fontSize: 12, fontWeight: 400, margin: "0 0 8px", opacity: 0.9 }}>
                          {d.toLocaleDateString(lang === "ur" ? "ur-PK" : "en-US", { weekday: "long", month: "long", day: "numeric" })} · {d.toLocaleTimeString(lang === "ur" ? "ur-PK" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {ev.venue && (
                          <p style={{ fontSize: 13, opacity: 0.8, margin: "0 0 4px" }}>
                            📍 {ev.venue}
                          </p>
                        )}
                        {ev.description && (
                          <p style={{ fontSize: 13, opacity: 0.6, margin: 0, fontStyle: "italic" }}>
                            {ev.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </GlassScrollReveal>
        </div>

        {/* SECTION 6: PHOTO GALLERY SLIDESHOW */}
        {hasPhotos && (
          <div style={{ padding: "20px 24px 40px", maxWidth: 540, margin: "0 auto" }}>
            <GlassScrollReveal>
              <div className="glass-overlay-card" style={{ paddingBottom: 24 }}>
                <h2 style={{ textAlign: "center", fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "#B76E79", fontWeight: 400, marginBottom: 28, letterSpacing: "0.05em" }}>
                  Invitation Gallery
                </h2>

                <div style={{ position: "relative", width: "100%", height: 320, borderRadius: 16, overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.4)" }}>
                  {galleryPhotos.map((url, index) => {
                    const isActive = index === activePhotoIdx;
                    return (
                      <div
                        key={index}
                        style={{
                          position: "absolute", inset: 0,
                          backgroundImage: `url(${url})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          opacity: isActive ? 1 : 0,
                          transform: isActive ? "scale(1)" : "scale(1.08)",
                          transition: "opacity 1.2s ease-in-out, transform 1.2s ease-in-out",
                        }}
                      />
                    );
                  })}
                </div>

                {/* Slideshow Bullets */}
                {galleryPhotos.length > 1 && (
                  <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
                    {galleryPhotos.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActivePhotoIdx(index)}
                        style={{
                          width: 8, height: 8, borderRadius: "50%",
                          backgroundColor: index === activePhotoIdx ? "#B76E79" : "rgba(255,255,255,0.25)",
                          border: "none", cursor: "pointer", transition: "all 0.2s"
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </GlassScrollReveal>
          </div>
        )}

        {/* SECTION 7: INTERACTIVE RSVP WIDGET */}
        <div style={{ padding: "20px 24px 60px", maxWidth: 540, margin: "0 auto" }}>
          <GlassScrollReveal>
            <div className="glass-overlay-card">
              {rsvpDone ? (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <span className="text-3xl block mb-3">💖</span>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: "#B76E79", fontWeight: 400, marginBottom: 10 }}>
                    {text.successTitle}
                  </h3>
                  <p style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.6 }}>
                    {text.successDesc}
                  </p>
                </div>
              ) : (
                <form onSubmit={submitRsvp}>
                  <h3 style={{ textAlign: "center", fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: "#B76E79", fontWeight: 400, margin: "0 0 6px" }}>
                    {text.rsvpTitle}
                  </h3>
                  <p style={{ textAlign: "center", fontSize: 13, opacity: 0.6, margin: "0 0 28px" }}>
                    {text.rsvpDesc}
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label style={labelStyle(T)}>{text.fullName}</label>
                      <input 
                        type="text" 
                        required
                        value={rsvp.name}
                        onChange={(e) => setRsvp(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your full name"
                        className="glamour-input"
                      />
                    </div>

                    <div>
                      <label style={labelStyle(T)}>{text.blessing}</label>
                      <textarea
                        rows={3}
                        value={rsvp.blessing}
                        onChange={(e) => setRsvp(prev => ({ ...prev, blessing: e.target.value }))}
                        placeholder="Add your warm wishes & blessings..."
                        className="glamour-input"
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={rsvpLoading}
                      style={{
                        width: "100%", padding: "14px 0", borderRadius: 12,
                        backgroundColor: "#B76E79", color: "#FFFFFF",
                        fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
                        border: "none", cursor: "pointer", transition: "all 0.3s",
                        boxShadow: "0 4px 15px rgba(183,110,121,0.3)"
                      }}
                      className="hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {rsvpLoading ? text.sending : text.sendRsvp}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </GlassScrollReveal>
        </div>

        {/* SECTION 8: ROYAL FOOTER */}
        <div style={{ padding: "60px 24px 80px", textAlign: "center", borderTop: "1px dashed rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.15)" }}>
          <GlassScrollReveal>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontStyle: "italic", color: "#B76E79", marginBottom: 12 }}>
              With Love & Blessings,
            </p>
            <p style={{ fontSize: 16, fontWeight: 600, margin: "0 0 24px", letterSpacing: "0.05em" }}>
              {invitation.brideName} {invitation.groomName ? `& ${invitation.groomName}` : ""}
            </p>

            {invitation.coupleEmail && (
              <p style={{ fontSize: 13, opacity: 0.7, margin: 0 }}>
                Need assistance? Email us at:{" "}
                <a href={`mailto:${invitation.coupleEmail}`} style={{ color: "#B76E79", textDecoration: "none", fontWeight: 700 }}>
                  {invitation.coupleEmail}
                </a>
              </p>
            )}

            <div style={{ paddingTop: 36, marginTop: 44, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.4 }}>
                Taabir Premium Invitations · Powered by Flynx
              </p>
            </div>
          </GlassScrollReveal>
        </div>
      </div>
    );
  };

  const renderPlayfulKidsParty = () => {
    const defaultCover = "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=800";
    const coverPhoto = invitation.photoUrl || defaultCover;

    return (
      <div 
        style={{
          opacity: phase !== "closed" ? 1 : 0,
          transform: phase !== "closed" ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 1.5s cubic-bezier(0.34, 1.56, 0.64, 1), transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          width: "100vw",
          maxWidth: "100%",
          margin: "0 auto",
          fontFamily: "'Quicksand', sans-serif",
          color: "#333333",
          position: "relative",
          zIndex: 10,
          overflow: "hidden",
        }}
      >
        {/* Playful & Interactive Kids Custom CSS Styles */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Quicksand:wght@400;600;700&display=swap');
          
          .kids-header {
            font-family: 'Fredoka One', cursive;
            color: #FF7F50; /* Coral */
            text-shadow: 3px 3px 0px #FFD700; /* Yellow shadow */
            letter-spacing: 0.02em;
          }
          
          .kids-subheader {
            font-family: 'Fredoka One', cursive;
            color: #87CEEB; /* Sky Blue */
            text-shadow: 2px 2px 0px rgba(0,0,0,0.05);
          }

          .kids-text {
            font-family: 'Quicksand', sans-serif;
            font-weight: 600;
          }

          .kids-popin {
            animation: popInBounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }

          .kids-wiggle {
            animation: wiggleAnim 2s ease-in-out infinite alternate;
          }

          .kids-snap-container {
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scrollbar-width: none; /* Hide scrollbars */
            -ms-overflow-style: none;
            -webkit-overflow-scrolling: touch;
            width: 100%;
            height: calc(100vh - 120px);
            min-height: 580px;
          }
          .kids-snap-container::-webkit-scrollbar {
            display: none;
          }

          .kids-snap-slide {
            flex: 0 0 100%;
            width: 100%;
            height: 100%;
            scroll-snap-align: start;
            box-sizing: border-box;
            padding: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          }

          .kids-card {
            background: #FFFFFF;
            border: 8px solid #FFD700;
            border-radius: 36px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1), inset 0 -10px 0 rgba(0,0,0,0.05);
            padding: 32px 24px;
            width: 100%;
            max-width: 480px;
            max-height: 96%;
            overflow-y: auto;
            position: relative;
            scrollbar-width: none;
            transform: scale(0.98);
            transition: all 0.3s;
          }
          .kids-card::-webkit-scrollbar {
            display: none;
          }

          .kids-card:hover {
            transform: scale(1);
          }

          @keyframes floatBalloon {
            0% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-50vh) rotate(15deg); }
            100% { transform: translateY(-120vh) rotate(-15deg); }
          }
          @keyframes wiggleAnim {
            0% { transform: rotate(-6deg) translateY(-2px); }
            100% { transform: rotate(6deg) translateY(2px); }
          }
          @keyframes balloonExplode {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.6); opacity: 0.8; }
            100% { transform: scale(0); opacity: 0; }
          }
          @keyframes popInBounce {
            0% { transform: scale(0); opacity: 0; }
            70% { transform: scale(1.1); }
            90% { transform: scale(0.96); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes swipeBounce {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(6px); }
          }
          
          .kids-swipe-hint {
            animation: swipeBounce 1.2s ease-in-out infinite;
          }

          @keyframes driftCloudLeft {
            0% { transform: translateX(-200px); }
            100% { transform: translateX(100vw); }
          }
          @keyframes driftCloudRight {
            0% { transform: translateX(100vw); }
            100% { transform: translateX(-200px); }
          }
          
          .kids-drift-left-1 {
            animation: driftCloudLeft 45s linear infinite;
          }
          .kids-drift-left-2 {
            animation: driftCloudLeft 60s linear infinite;
          }
          .kids-drift-right-1 {
            animation: driftCloudRight 50s linear infinite;
          }
          .kids-drift-right-2 {
            animation: driftCloudRight 70s linear infinite;
          }
        `}</style>

        {/* Continuous Drifting Clouds Background */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "100%", zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
          {/* Cloud 1 */}
          <div className="kids-drift-left-1" style={{ position: "absolute", top: "5%", width: 140 }}>
            <svg viewBox="0 0 170 130" fill="rgba(255,255,255,0.85)">
              <path d="M40,100 Q10,100 10,70 Q10,40 40,40 Q50,20 80,20 Q110,20 120,40 Q150,40 160,70 Q160,100 130,100 Q110,112 85,100 Q60,112 40,100 Z" />
            </svg>
          </div>
          {/* Cloud 2 */}
          <div className="kids-drift-right-1" style={{ position: "absolute", top: "18%", width: 100, animationDelay: "-15s" }}>
            <svg viewBox="0 0 170 130" fill="rgba(255,255,255,0.7)">
              <path d="M40,100 Q10,100 10,70 Q10,40 40,40 Q50,20 80,20 Q110,20 120,40 Q150,40 160,70 Q160,100 130,100 Q110,112 85,100 Q60,112 40,100 Z" />
            </svg>
          </div>
          {/* Cloud 3 */}
          <div className="kids-drift-left-2" style={{ position: "absolute", top: "45%", width: 120, animationDelay: "-30s" }}>
            <svg viewBox="0 0 170 130" fill="rgba(255,255,255,0.75)">
              <path d="M40,100 Q10,100 10,70 Q10,40 40,40 Q50,20 80,20 Q110,20 120,40 Q150,40 160,70 Q160,100 130,100 Q110,112 85,100 Q60,112 40,100 Z" />
            </svg>
          </div>
          {/* Cloud 4 */}
          <div className="kids-drift-right-2" style={{ position: "absolute", top: "65%", width: 160, animationDelay: "-10s" }}>
            <svg viewBox="0 0 170 130" fill="rgba(255,255,255,0.65)">
              <path d="M40,100 Q10,100 10,70 Q10,40 40,40 Q50,20 80,20 Q110,20 120,40 Q150,40 160,70 Q160,100 130,100 Q110,112 85,100 Q60,112 40,100 Z" />
            </svg>
          </div>
        </div>

        {/* Dynamic Clickable Floating Balloons */}
        <BalloonFloater color="#FF7F50" left={15} delay={0} size={50} />
        <BalloonFloater color="#FFD700" left={45} delay={3} size={55} />
        <BalloonFloater color="#90EE90" left={75} delay={1} size={48} />
        <BalloonFloater color="#FF69B4" left={30} delay={6} size={52} />
        <BalloonFloater color="#20B2AA" left={60} delay={8} size={50} />
        <BalloonFloater color="#FFA500" left={85} delay={4} size={56} />

        {/* Horizontal Snap Scroll Container */}
        <div className="kids-snap-container">
          
          {/* SLIDE 1: Welcome Cover Card */}
          <div className="kids-snap-slide">
            <div className="kids-card kids-popin">
              <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", border: "5px solid #87CEEB", marginBottom: 20 }}>
                <img src={coverPhoto} alt="Celebration Cover" style={{ width: "100%", height: 200, objectFit: "cover" }} />
                <div style={{ position: "absolute", top: 12, left: 12, backgroundColor: "#FF7F50", color: "#FFFFFF", padding: "4px 12px", borderRadius: 12, fontFamily: "'Fredoka One', cursive", fontSize: 12 }}>
                  🎈 YOU'RE INVITED!
                </div>
              </div>
              <h1 className="kids-header" style={{ fontSize: 32, textAlign: "center", marginBottom: 12, lineHeight: 1.1 }}>
                {invitation.brideName}'s Birthday Party!
              </h1>
              <p style={{ fontSize: 16, textAlign: "center", fontWeight: 700, color: "#FF7F50", fontFamily: "'Fredoka One', cursive", marginBottom: 8 }}>
                🎉 LET'S CELEBRATE! 🎉
              </p>
              <div style={{ background: "#FAF9F5", padding: 16, borderRadius: 20, border: "3px dashed #87CEEB", textAlign: "center", marginTop: 12 }}>
                <span className="kids-header" style={{ display: "block", fontSize: 18, color: "#87CEEB", textShadow: "none" }}>
                  {fmt}
                </span>
                <span className="kids-text" style={{ fontSize: 14, color: "#555555" }}>
                  Starting at {fmtTime}
                </span>
              </div>
              
              {/* Animated Swipe Indicator */}
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 24, opacity: 0.7 }}>
                <span className="kids-text" style={{ fontSize: 12, fontWeight: 700, color: "#777777" }}>Swipe to explore</span>
                <span className="kids-swipe-hint" style={{ fontSize: 14, color: "#FF7F50", fontWeight: "bold" }}>➔</span>
              </div>
            </div>
          </div>

          {/* SLIDE 2: Birthday Star Profile / Story */}
          <div className="kids-snap-slide">
            <div className="kids-card">
              <h2 className="kids-header" style={{ fontSize: 28, textAlign: "center", marginBottom: 16 }}>
                👑 The Birthday Star!
              </h2>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }} className="kids-wiggle">
                <div style={{ fontSize: 72 }}>🎂</div>
              </div>
              <p className="kids-text" style={{ fontSize: 15, lineHeight: 1.6, textAlign: "center", color: "#555555", marginBottom: 20 }}>
                {invitation.welcomeMessage || "I'm having a super fun birthday party filled with games, cakes, and awesome friends! I'd love for you to join me on my special day!"}
              </p>
              <div style={{ borderTop: "4px dashed #FFD700", paddingTop: 16, textAlign: "center" }}>
                <span className="kids-header" style={{ fontSize: 14, color: "#FF7F50", textShadow: "none", textTransform: "uppercase" }}>
                  Parents / Hosts
                </span>
                <p className="kids-text" style={{ fontSize: 15, fontWeight: 700, margin: "4px 0 0", color: "#333333" }}>
                  {invitation.brideParentsName || "Family & Friends"}
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 24 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FFD700" }}></span>
                <span style={{ width: 16, height: 8, borderRadius: 4, background: "#FF7F50" }}></span>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FFD700" }}></span>
              </div>
            </div>
          </div>

          {/* SLIDE 3: Schedule & Timeline */}
          <div className="kids-snap-slide">
            <div className="kids-card">
              <h2 className="kids-header" style={{ fontSize: 28, textAlign: "center", marginBottom: 20 }}>
                🎪 Fun Agenda!
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {invitation.details?.schedule?.map((item, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      background: idx % 2 === 0 ? "rgba(135,206,235,0.15)" : "rgba(255,127,80,0.12)", 
                      padding: 16, 
                      borderRadius: 20, 
                      border: idx % 2 === 0 ? "3px solid #87CEEB" : "3px solid #FF7F50",
                      position: "relative",
                      overflow: "hidden"
                    }}
                  >
                    <span className="kids-header" style={{ display: "block", fontSize: 16, color: idx % 2 === 0 ? "#87CEEB" : "#FF7F50", textShadow: "none", marginBottom: 4 }}>
                      🎈 {item.name}
                    </span>
                    <span className="kids-text" style={{ fontSize: 12, display: "block", color: "#777777", marginBottom: 6 }}>
                      🕒 {new Date(item.time).toLocaleTimeString(lang === "ur" ? "ur" : lang === "hi" ? "hi" : "en", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <p className="kids-text" style={{ fontSize: 13, margin: 0, color: "#555555" }}>
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SLIDE 4: Venue & Maps */}
          <div className="kids-snap-slide">
            <div className="kids-card">
              <h2 className="kids-header" style={{ fontSize: 28, textAlign: "center", marginBottom: 16 }}>
                📍 Party Castle!
              </h2>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }} className="kids-wiggle">
                <span style={{ fontSize: 64 }}>🏰</span>
              </div>
              <h3 className="kids-header" style={{ fontSize: 18, textAlign: "center", color: "#87CEEB", textShadow: "none", marginBottom: 8 }}>
                {invitation.venue?.name || "The Fun Castle Plaza"}
              </h3>
              <p className="kids-text" style={{ fontSize: 14, textAlign: "center", color: "#666666", lineHeight: 1.5, marginBottom: 20 }}>
                {invitation.venue?.address || "123 Party Castle Lane, Magic Town"}
              </p>
              
              {invitation.venue?.googleMapsUrl && (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <a 
                    href={invitation.venue.googleMapsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="kids-text"
                    style={{
                      display: "inline-block",
                      backgroundColor: "#FF7F50",
                      color: "#FFFFFF",
                      padding: "12px 24px",
                      borderRadius: 20,
                      fontWeight: "bold",
                      fontSize: 14,
                      textDecoration: "none",
                      boxShadow: "0 6px 0 #d45f34, 0 10px 20px rgba(0,0,0,0.15)",
                      transition: "transform 0.1s",
                      transform: "translateY(0)"
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = "translateY(4px)"}
                    onMouseUp={(e) => e.currentTarget.style.transform = "translateY(0)"}
                  >
                    🏰 GET DIRECTIONS ➔
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* SLIDE 5: Kids Interactive RSVP */}
          <div className="kids-snap-slide">
            <div className="kids-card">
              <h2 className="kids-header" style={{ fontSize: 28, textAlign: "center", marginBottom: 12 }}>
                💌 RSVP Time!
              </h2>
              <p className="kids-text" style={{ fontSize: 13, textAlign: "center", color: "#666666", marginBottom: 20 }}>
                Let us know if you can join the magical celebration!
              </p>

              {rsvpDone ? (
                <div style={{ textAlign: "center", padding: "20px 0" }} className="kids-popin">
                  <div style={{ fontSize: 64, marginBottom: 12 }} className="kids-wiggle">🎉</div>
                  <h3 className="kids-header" style={{ fontSize: 22, color: "#87CEEB", textShadow: "none", marginBottom: 8 }}>
                    {text.successTitle}
                  </h3>
                  <p className="kids-text" style={{ fontSize: 14, color: "#555555" }}>
                    {text.successDesc}
                  </p>
                </div>
              ) : (
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!rsvp.name.trim()) return;
                    setRsvpLoading(true);
                    try {
                      const rsvpsRef = collection(db, "invitations", invitation.id, "rsvps");
                      await addDoc(rsvpsRef, {
                        ...rsvp,
                        submittedAt: new Date().toISOString()
                      });
                      setRsvpDone(true);
                    } catch (err) {
                      console.error("RSVP Failure:", err);
                    } finally {
                      setRsvpLoading(false);
                    }
                  }}
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <div>
                    <label className="kids-text" style={{ fontSize: 11, fontWeight: 700, color: "#FF7F50", display: "block", marginBottom: 6 }}>
                      {text.fullName.toUpperCase()} *
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Your chunky name!"
                      style={{
                        width: "100%", padding: "12px 16px", borderRadius: 16,
                        border: "3px solid #87CEEB", outline: "none", fontSize: 13,
                        fontFamily: "'Quicksand', sans-serif", fontWeight: 600, boxSizing: "border-box"
                      }}
                      value={rsvp.name}
                      onChange={(e) => setRsvp(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 10, margin: "6px 0" }}>
                    <button 
                      type="button"
                      onClick={() => setRsvp(prev => ({ ...prev, attending: "yes" }))}
                      className="kids-text"
                      style={{
                        flex: 1,
                        padding: 12,
                        borderRadius: 16,
                        background: rsvp.attending === "yes" ? "#FFD700" : "#FAF9F5",
                        color: rsvp.attending === "yes" ? "#333333" : "#777777",
                        border: "3px solid #FFD700",
                        fontWeight: "bold",
                        fontSize: 13,
                        cursor: "pointer",
                        boxShadow: rsvp.attending === "yes" ? "0 4px 0 #c2a300" : "none"
                      }}
                    >
                      🎈 COUNT ME IN
                    </button>
                    <button 
                      type="button"
                      onClick={() => setRsvp(prev => ({ ...prev, attending: "no" }))}
                      className="kids-text"
                      style={{
                        flex: 1,
                        padding: 12,
                        borderRadius: 16,
                        background: rsvp.attending === "no" ? "#FF7F50" : "#FAF9F5",
                        color: rsvp.attending === "no" ? "#FFFFFF" : "#777777",
                        border: "3px solid #FF7F50",
                        fontWeight: "bold",
                        fontSize: 13,
                        cursor: "pointer",
                        boxShadow: rsvp.attending === "no" ? "0 4px 0 #cc5b31" : "none"
                      }}
                    >
                      😭 CAN'T MAKE IT
                    </button>
                  </div>

                  <div>
                    <label className="kids-text" style={{ fontSize: 11, fontWeight: 700, color: "#FF7F50", display: "block", marginBottom: 6 }}>
                      {text.blessing.toUpperCase()}
                    </label>
                    <textarea 
                      placeholder="Leave a sweet blessing / note!"
                      rows={3}
                      style={{
                        width: "100%", padding: "12px 16px", borderRadius: 16,
                        border: "3px solid #87CEEB", outline: "none", fontSize: 13,
                        fontFamily: "'Quicksand', sans-serif", fontWeight: 600, resize: "none", boxSizing: "border-box"
                      }}
                      value={rsvp.blessing}
                      onChange={(e) => setRsvp(prev => ({ ...prev, blessing: e.target.value }))}
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={rsvpLoading}
                    className="kids-header"
                    style={{
                      padding: 16,
                      borderRadius: 18,
                      fontSize: 14,
                      cursor: "pointer",
                      marginTop: 8,
                      border: "none",
                      backgroundColor: "#FF7F50",
                      color: "#FFFFFF",
                      boxShadow: "0 6px 0 #d45f34, 0 10px 15px rgba(0,0,0,0.1)",
                      textShadow: "none"
                    }}
                  >
                    {rsvpLoading ? text.sending : "REGISTER NOW ➔"}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* Interactive progress pagination indicators */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, padding: "16px 0 32px" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#FFFFFF", background: "#FF7F50", padding: "4px 12px", borderRadius: 12 }}>
            💡 Swipe left or right! 💡
          </span>
        </div>

        {/* Playful Kids Footer */}
        <div style={{ padding: "40px 24px 60px", textAlign: "center", borderTop: "4px dashed #FFD700", background: "rgba(255,255,255,0.85)", position: "relative", zIndex: 10 }}>
          <p className="kids-header" style={{ fontSize: 20, color: "#FF7F50", margin: "0 0 12px", textShadow: "2px 2px 0 #FFD700" }}>
            SEE YOU THERE!
          </p>
          <p className="kids-text" style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px", color: "#333333" }}>
            {invitation.brideName} {invitation.groomName ? `& ${invitation.groomName}` : ""}
          </p>
          {invitation.coupleEmail && (
            <p className="kids-text" style={{ fontSize: 12, color: "#666666", margin: 0 }}>
              Questions? Drop a line:{" "}
              <a href={`mailto:${invitation.coupleEmail}`} style={{ color: "#FF7F50", textDecoration: "none", fontWeight: 700 }}>
                {invitation.coupleEmail}
              </a>
            </p>
          )}
          <div style={{ marginTop: 24, borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 16 }}>
            <p className="kids-text" style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.5 }}>
              Taabir Playful Kids Theme · Powered by Flynx
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderSummerPoolparty = () => {
    const defaultCover = "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=800";
    const coverPhoto = invitation.photoUrl || defaultCover;

    const day = targetDate.getDate();
    const month = targetDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
    const year = targetDate.getFullYear();

    const CoconutTreeSVG = ({ className, style }) => (
      <div className={className} style={{ pointerEvents: "none", zIndex: 3, ...style }}>
        <svg viewBox="0 0 100 140" style={{ width: "100%", height: "100%", overflow: "visible" }} className="coconut-tree">
          {/* Trunk segments */}
          <path d="M 50,135 Q 40,90 50,35" fill="none" stroke="#8B5A2B" strokeWidth="8" strokeLinecap="round" />
          {/* Bark ring patterns */}
          <path d="M 50,135 Q 40,90 50,35" fill="none" stroke="#C2B280" strokeWidth="6" strokeLinecap="round" strokeDasharray="3 6" />

          {/* Hanging Coconuts */}
          <circle cx="44" cy="36" r="6.5" fill="#5C3D2E" stroke="#4A3B32" strokeWidth="1" />
          <circle cx="56" cy="37" r="7" fill="#6F4E37" stroke="#4A3B32" strokeWidth="1" />
          <circle cx="50" cy="43" r="6" fill="#4E3629" stroke="#4A3B32" strokeWidth="1" />

          {/* Swaying Green Fronds */}
          <path d="M 50,35 Q 25,10 5,22 Q 25,28 50,35" fill="#2E7D32" />
          <path d="M 50,35 Q 20,38 2,52 Q 22,48 50,35" fill="#1B5E20" />
          <path d="M 50,35 Q 75,10 95,22 Q 75,28 50,35" fill="#2E7D32" />
          <path d="M 50,35 Q 80,38 98,52 Q 78,48 50,35" fill="#1B5E20" />
          <path d="M 50,35 Q 50,2 45,-8 Q 55,2 50,35" fill="#4CAF50" />
        </svg>
      </div>
    );

    return (
      <div 
        style={{
          opacity: phase !== "closed" ? 1 : 0,
          transform: phase !== "closed" ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 1.5s cubic-bezier(0.34, 1.56, 0.64, 1), transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          width: "100vw",
          maxWidth: "100%",
          margin: "0 auto",
          fontFamily: "'Nunito', sans-serif",
          color: "#2E4F4F",
          position: "relative",
          zIndex: 10,
          background: "linear-gradient(180deg, #7FFFD4 0%, #FAF9F5 50%, #FFDAB9 100%)",
          minHeight: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Summer Pool/Beach Party Styles */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Anton&family=Nunito:wght@400;600;700;800;900&display=swap');
          
          .summer-header {
            font-family: 'Anton', sans-serif;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: #2E4F4F;
            text-shadow: 2px 2px 0px #FFDAB9, 4px 4px 0px rgba(194, 178, 128, 0.4);
          }

          .summer-accent-text {
            color: #FF7F50;
            font-family: 'Anton', sans-serif;
            letter-spacing: 0.05em;
          }

          .summer-text-body {
            font-family: 'Nunito', sans-serif;
            font-weight: 600;
          }

          .summer-card {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(20px);
            border: 6px solid #FFDAB9;
            border-radius: 40px;
            box-shadow: 0 25px 50px rgba(46,79,79,0.12), inset 0 -8px 0 rgba(194,178,128,0.2);
            padding: 36px 28px;
            width: 100%;
            max-width: 520px;
            margin: 40px auto;
            position: relative;
            z-index: 5;
            transition: all 0.3s;
          }

          .summer-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 30px 60px rgba(46,79,79,0.18), inset 0 -8px 0 rgba(194,178,128,0.2);
          }

          .summer-slide-up-reveal {
            opacity: 0;
            transform: translateY(60px);
            animation: summerSlideUp 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          }

          @keyframes summerSlideUp {
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes waveRipple {
            0% { transform: translateX(0) scaleY(1); }
            50% { transform: translateX(-20%) scaleY(1.08); }
            100% { transform: translateX(0) scaleY(1); }
          }

          .summer-wave-1 {
            animation: waveRipple 6s ease-in-out infinite;
          }

          .summer-wave-2 {
            animation: waveRipple 4s ease-in-out infinite alternate;
          }

          @keyframes windBreeze {
            0% { transform: rotate(0deg); }
            50% { transform: rotate(4deg) skewX(1deg); }
            100% { transform: rotate(0deg); }
          }
          
          .coconut-tree {
            animation: windBreeze 5s ease-in-out infinite;
            transform-origin: bottom center;
            will-change: transform;
          }

          @media (max-width: 768px) {
            .coconut-tree-left {
              left: -15px !important;
              bottom: 4% !important;
              width: 80px !important;
              height: 120px !important;
              opacity: 0.35 !important;
            }
            .coconut-tree-right {
              right: -15px !important;
              top: 15% !important;
              width: 80px !important;
              height: 120px !important;
              opacity: 0.35 !important;
            }
            .summer-date-badge {
              right: 8px !important;
              top: 100px !important;
              transform: scale(0.7) rotate(12deg) !important;
            }
          }
        `}</style>

        {/* SVG Wave Divider Top */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 180, overflow: "hidden", zIndex: 1, pointerEvents: "none" }}>
          <svg 
            viewBox="0 0 1440 200" 
            preserveAspectRatio="none"
            style={{ position: "absolute", top: 0, left: 0, width: "200%", height: "100%", fill: "#7FFFD4", opacity: 0.5 }} 
            className="summer-wave-1"
          >
            <path d="M0,96L120,112C240,128,480,160,720,160C960,160,1200,128,1320,112L1440,96L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z" />
          </svg>
          <svg 
            viewBox="0 0 1440 200" 
            preserveAspectRatio="none"
            style={{ position: "absolute", top: 10, left: -50, width: "200%", height: "100%", fill: "#FFDAB9", opacity: 0.4 }} 
            className="summer-wave-2"
          >
            <path d="M0,64L120,80C240,96,480,128,720,128C960,128,1200,96,1320,80L1440,64L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z" />
          </svg>
        </div>

        {/* Swaying Coconut Trees */}
        <CoconutTreeSVG 
          className="coconut-tree-left"
          style={{ position: "absolute", left: "2%", bottom: "8%", width: 180, height: 250 }} 
        />
        <CoconutTreeSVG 
          className="coconut-tree-right"
          style={{ position: "absolute", right: "2%", top: "18%", width: 180, height: 250 }} 
        />

        {/* Floating Premium Date Sticker */}
        <div 
          className="summer-date-badge"
          style={{
            position: "absolute",
            right: "5%",
            top: "140px",
            zIndex: 15,
            width: 105,
            height: 105,
            background: "linear-gradient(135deg, #FF7F50 0%, #FFDAB9 100%)",
            borderRadius: "32px",
            boxShadow: "0 15px 35px rgba(255,127,80,0.3)",
            border: "5px solid #FFFFFF",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Anton', sans-serif",
            color: "#2E4F4F",
            transform: "rotate(8deg)",
            transition: "all 0.3s"
          }}
        >
          <span style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em", color: "#FFFFFF", textShadow: "1px 1px 0px rgba(0,0,0,0.15)" }}>
            {month}
          </span>
          <span style={{ fontSize: 32, display: "block", color: "#FFFFFF", textShadow: "2px 2px 0px rgba(46,79,79,0.3)", lineHeight: 0.9, margin: "2px 0" }}>
            {day}
          </span>
          <span style={{ fontSize: 11, color: "#2E4F4F", fontWeight: 800, opacity: 0.9 }}>
            {year}
          </span>
        </div>

        {/* Main Scrolling Content */}
        <div style={{ position: "relative", zIndex: 10, padding: "120px 24px 80px", maxWidth: 600, margin: "0 auto" }}>
          
          {/* SECTION 1: Cover Header */}
          <div className="summer-card summer-slide-up-reveal" style={{ animationDelay: "0.1s" }}>
            <div style={{ position: "relative", borderRadius: 28, overflow: "hidden", border: "6px solid #7FFFD4", marginBottom: 28 }}>
              <img src={coverPhoto} alt="Summer Pool Cover" style={{ width: "100%", height: 250, objectFit: "cover" }} />
              <div style={{ position: "absolute", top: 16, left: 16, backgroundColor: "#FF7F50", color: "#FFFFFF", padding: "6px 16px", borderRadius: 16, fontFamily: "'Anton', sans-serif", fontSize: 13, letterSpacing: "0.05em" }}>
                🌊 SUMMER PARTY VIBES
              </div>
            </div>

            <h1 className="summer-header" style={{ fontSize: 44, textAlign: "center", marginBottom: 12, lineHeight: 1.05 }}>
              {invitation.brideName}'s Pool Party!
            </h1>
            <p style={{ fontSize: 20, textAlign: "center", fontWeight: 800, color: "#FF7F50", fontFamily: "'Anton', sans-serif", letterSpacing: "0.08em", marginBottom: 24 }}>
              💥 SPLASH & CHILL 💥
            </p>

            <div style={{ background: "#FAF9F5", padding: 20, borderRadius: 24, border: "4px dashed #C2B280", textAlign: "center" }}>
              <span className="summer-header" style={{ display: "block", fontSize: 20, color: "#7FFFD4", textShadow: "1px 1px 0px #2E4F4F" }}>
                {fmt}
              </span>
              <span className="summer-text-body" style={{ fontSize: 15, color: "#2E4F4F", opacity: 0.8, display: "block", marginTop: 4 }}>
                Starting at {fmtTime}
              </span>
            </div>
          </div>

          {/* SECTION 2: Countdown Timer */}
          <div className="summer-card summer-slide-up-reveal" style={{ animationDelay: "0.2s" }}>
            <h2 className="summer-header" style={{ fontSize: 28, textAlign: "center", marginBottom: 20 }}>
              ⏱️ Dive In In...
            </h2>
            <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
              {[
                { val: timeLeft.days || 0, label: "Days" },
                { val: timeLeft.hours || 0, label: "Hours" },
                { val: timeLeft.minutes || 0, label: "Mins" },
                { val: timeLeft.seconds || 0, label: "Secs" }
              ].map((unit, idx) => (
                <div key={idx} style={{ 
                  flex: 1, 
                  background: "linear-gradient(135deg, #7FFFD4 0%, #FFFFFF 100%)", 
                  border: "3px solid #FFDAB9", 
                  borderRadius: 20, 
                  padding: "14px 8px", 
                  textAlign: "center",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.04)"
                }}>
                  <span style={{ fontSize: 26, fontFamily: "'Anton', sans-serif", display: "block", color: "#2E4F4F" }}>
                    {unit.val}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "#C2B280", letterSpacing: "0.05em" }}>
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: Venue Details */}
          <div className="summer-card summer-slide-up-reveal" style={{ animationDelay: "0.3s" }}>
            <h2 className="summer-header" style={{ fontSize: 28, textAlign: "center", marginBottom: 20 }}>
              🌴 The Oasis
            </h2>
            <div style={{ textAlign: "center", spaceY: 16 }}>
              <div style={{ fontSize: 60, marginBottom: 12 }}>🏖️</div>
              <h3 className="summer-text-body" style={{ fontSize: 18, fontWeight: 800, color: "#2E4F4F", marginBottom: 6 }}>
                {invitation.venue.name}
              </h3>
              <p className="summer-text-body" style={{ fontSize: 14, color: "#555555", leading: 1.5, marginBottom: 20 }}>
                {invitation.venue.address}
              </p>
              {invitation.venue.googleMapsUrl && (
                <a 
                  href={invitation.venue.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    padding: "14px 32px",
                    background: "linear-gradient(135deg, #FF7F50 0%, #FFDAB9 100%)",
                    color: "#FFFFFF",
                    fontFamily: "'Anton', sans-serif",
                    fontSize: 14,
                    letterSpacing: "0.05em",
                    borderRadius: 20,
                    textDecoration: "none",
                    boxShadow: "0 8px 25px rgba(255,127,80,0.3)",
                    transition: "transform 0.2s"
                  }}
                  className="hover:scale-105 active:scale-95"
                >
                  📍 OPEN IN MAPS
                </a>
              )}
            </div>
          </div>

          {/* SECTION 4: Schedule */}
          {invitation.details && invitation.details.schedule && invitation.details.schedule.length > 0 && (
            <div className="summer-card summer-slide-up-reveal" style={{ animationDelay: "0.4s" }}>
              <h2 className="summer-header" style={{ fontSize: 28, textAlign: "center", marginBottom: 28 }}>
                🍹 Party Agenda
              </h2>
              <div style={{ position: "relative", paddingLeft: 16 }}>
                {invitation.details.schedule.map((event, idx) => {
                  const eventDate = new Date(event.time);
                  const eventFmtTime = eventDate.toLocaleTimeString(lang === "ur" ? "ur-PK" : "en-US", { hour: "2-digit", minute: "2-digit" });
                  return (
                    <div key={idx} style={{ 
                      position: "relative",
                      paddingLeft: 24,
                      borderLeft: "4px solid #7FFFD4",
                      paddingBottom: 28
                    }}>
                      <div style={{
                        position: "absolute", left: -10, top: 4,
                        width: 16, height: 16, borderRadius: "50%",
                        backgroundColor: "#FF7F50", border: "3px solid #FFFFFF"
                      }} />
                      <span className="summer-accent-text" style={{ fontSize: 13, display: "block" }}>
                        {eventFmtTime}
                      </span>
                      <h4 className="summer-text-body" style={{ fontSize: 17, fontWeight: 800, color: "#2E4F4F", margin: "2px 0" }}>
                        {event.name}
                      </h4>
                      {event.venue && (
                        <p style={{ fontSize: 12, color: "#C2B280", fontWeight: 700, margin: "2px 0" }}>
                          📍 {event.venue}
                        </p>
                      )}
                      {event.description && (
                        <p style={{ fontSize: 13, color: "#666666", margin: "4px 0 0", lineHeight: 1.5 }}>
                          {event.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 5: RSVP Form */}
          <div className="summer-card summer-slide-up-reveal" style={{ animationDelay: "0.5s" }}>
            <h2 className="summer-header" style={{ fontSize: 28, textAlign: "center", marginBottom: 8 }}>
              📬 Reserve a Lounge Card
            </h2>
            <p className="summer-text-body" style={{ fontSize: 13, color: "#666666", textAlign: "center", marginBottom: 32 }}>
              Grab your shades and RSVP below
            </p>

            {rsvpDone ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <span style={{ fontSize: "3.5rem", display: "block", marginBottom: 12 }}>🍹</span>
                <h4 className="summer-header" style={{ fontSize: 20, color: "#FF7F50", marginBottom: 8 }}>Reservations Logged!</h4>
                <p className="summer-text-body" style={{ fontSize: 14, color: "#555555" }}>Thank you! See you at the poolside.</p>
              </div>
            ) : (
              <form onSubmit={submitRsvp} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="summer-text-body" style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: "#C2B280", display: "block", marginBottom: 6 }}>
                    Your Name
                  </label>
                  <input 
                    type="text"
                    required
                    style={{
                      width: "100%", padding: "14px 20px", borderRadius: 16,
                      border: "3px solid #7FFFD4", backgroundColor: "#FFFFFF",
                      color: "#2E4F4F", fontFamily: "'Nunito', sans-serif", fontWeight: 700,
                      outline: "none"
                    }}
                    value={rsvp.name}
                    onChange={(e) => setRsvp(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Captain Minhaj Khan"
                  />
                </div>

                <div>
                  <label className="summer-text-body" style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: "#C2B280", display: "block", marginBottom: 6 }}>
                    Wishes / Secret Cocktails
                  </label>
                  <textarea 
                    style={{
                      width: "100%", height: 100, padding: "14px 20px", borderRadius: 16,
                      border: "3px solid #7FFFD4", backgroundColor: "#FFFFFF",
                      color: "#2E4F4F", fontFamily: "'Nunito', sans-serif", fontWeight: 700,
                      resize: "none", outline: "none"
                    }}
                    value={rsvp.blessing}
                    onChange={(e) => setRsvp(prev => ({ ...prev, blessing: e.target.value }))}
                    placeholder="Write secret pool cocktail recipes or blessing wishes..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={rsvpLoading}
                  style={{
                    width: "100%", padding: "16px",
                    background: "linear-gradient(135deg, #7FFFD4 0%, #FFDAB9 100%)",
                    color: "#2E4F4F", fontFamily: "'Anton', sans-serif", fontSize: 15,
                    letterSpacing: "0.06em", border: "none", borderRadius: 20,
                    cursor: "pointer", boxShadow: "0 8px 25px rgba(127,255,212,0.3)",
                    transition: "transform 0.2s"
                  }}
                  className="hover:scale-[1.02] active:scale-95"
                >
                  {rsvpLoading ? "Sending..." : "JOIN THE SHINDIG! 🌊"}
                </button>
              </form>
            )}
          </div>

          {/* SECTION 6: Footer */}
          {invitation.coupleEmail && (
            <p className="summer-text-body" style={{ textAlign: "center", fontSize: 13, color: "#2E4F4F", opacity: 0.6 }}>
              Questions? Drop a line:{" "}
              <a 
                href={`mailto:${invitation.coupleEmail}`}
                style={{ color: "#FF7F50", textDecoration: "none", fontWeight: 800 }}
              >
                {invitation.coupleEmail}
              </a>
            </p>
          )}

          <div style={{ marginTop: 40, borderTop: "2px solid rgba(194,178,128,0.2)", paddingTop: 20, textAlign: "center" }}>
            <p className="summer-text-body" style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#C2B280" }}>
              Taabir Summer Oasis Theme · Powered by Flynx
            </p>
          </div>

        </div>

        {/* SVG Wave Divider Bottom */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 180, overflow: "hidden", zIndex: 1, pointerEvents: "none" }}>
          <svg viewBox="0 0 1440 200" style={{ width: "200%", height: "100%", fill: "#FFDAB9", opacity: 0.5, transform: "rotate(180deg)" }} className="summer-wave-1">
            <path d="M0,96L120,112C240,128,480,160,720,160C960,160,1200,128,1320,112L1440,96L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z" />
          </svg>
        </div>

      </div>
    );
  };

  const renderElegantMilestone = () => {
    const galleryPhotos = invitation.photos || (invitation.photoUrl ? [invitation.photoUrl] : []);
    const hasPhotos = galleryPhotos.length > 0;

    return (
      <div 
        style={{
          opacity: phase !== "closed" ? 1 : 0,
          transform: phase !== "closed" ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 1.5s ease-out, transform 1.5s ease-out",
          width: "100%",
          margin: "0 auto",
          backgroundColor: "#0F0F0F", 
          color: "#FFFFFF",
          fontFamily: lang === "ur" ? "'Noto Nastaliq Urdu', serif" : lang === "hi" ? "'Outfit', sans-serif" : "'Merriweather', serif",
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&display=swap');
          
          .magazine-card {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(192, 192, 192, 0.15);
            padding: 48px 36px;
            margin-bottom: 32px;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
            position: relative;
          }
          .magazine-input {
            width: 100%;
            padding: 14px 16px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(192, 192, 192, 0.2);
            color: #FFFFFF;
            font-family: inherit;
            font-size: 14px;
            outline: none;
            transition: all 0.3s;
          }
          .magazine-input:focus {
            border-color: #C0C0C0;
            background: rgba(255, 255, 255, 0.05);
            box-shadow: 0 0 12px rgba(192, 192, 192, 0.15);
          }
          .silver-bullet {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #C0C0C0;
            border: 2px solid #0F0F0F;
            position: absolute;
            left: -5.5px;
            top: 6px;
          }
          .magazine-btn {
            background-color: #800020;
            color: #FFFFFF;
            font-family: 'Merriweather', serif;
            font-weight: 700;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            padding: 16px 32px;
            border: 1px solid rgba(192, 192, 192, 0.3);
            transition: all 0.3s ease;
            cursor: pointer;
          }
          .magazine-btn:hover {
            background-color: #A01030;
            box-shadow: 0 0 15px rgba(128, 0, 32, 0.4);
            border-color: #C0C0C0;
          }
          .magazine-label {
            display: block;
            color: #708090;
            font-family: 'Merriweather', serif;
            font-size: 11px;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            margin-bottom: 8px;
            font-weight: 700;
          }
        `}</style>

        {/* SECTION 1: SLOW 3S BACKGROUND CROSS-FADE HERO */}
        <div 
          style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            backgroundColor: "#0F0F0F"
          }}
        >
          {/* Slow Cross-Fading Images */}
          {hasPhotos && galleryPhotos.map((photo, idx) => (
            <div
              key={idx}
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${photo})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: activePhotoIdx === idx ? 1 : 0,
                transition: "opacity 3.0s ease-in-out",
                zIndex: 0
              }}
            />
          ))}

          {/* Translucent Legibility Gradient Overlay */}
          <div 
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(to bottom, rgba(128, 0, 32, 0.5) 0%, rgba(15, 15, 15, 0.85) 75%, #0F0F0F 100%)`,
              zIndex: 1,
            }}
          />

          {/* Editorial Card Hero Overlay */}
          <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 580, padding: "0 24px" }}>
            <ElegantFadeInScrollReveal>
              <div 
                className="magazine-card"
                style={{ 
                  textAlign: "center", 
                  padding: "64px 40px", 
                  border: "1px solid rgba(192, 192, 192, 0.25)" 
                }}
              >
                {/* Monogram */}
                <p style={{ color: "#C0C0C0", fontSize: 24, fontFamily: "'Noto Naskh Arabic', serif", marginBottom: 12, lineHeight: 1.6 }}>
                  {invitation.headerArabic || "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"}
                </p>
                <p style={{ color: "#708090", fontFamily: "'Merriweather', serif", fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 36 }}>
                  {invitation.headerGrace || "Under the Grace of Almighty Allah"}
                </p>
                
                {/* Event Type Header */}
                <p style={{ color: "#C0C0C0", fontFamily: "'Merriweather', serif", fontSize: 15, fontStyle: "italic", letterSpacing: "0.05em", marginBottom: 16 }}>
                  {eventType === "wedding" ? text.wedding : 
                   eventType === "birthday" ? text.birthday : 
                   eventType === "anniversary" ? text.anniversary : 
                   text.general}
                </p>

                {/* Main Heading Names in Great Vibes */}
                <h1 style={{ color: "#FFFFFF", fontFamily: "'Great Vibes', cursive", fontSize: "4.8rem", fontWeight: 400, lineHeight: 1.1, margin: "0 0 24px" }}>
                  {invitation.brideName}
                  {invitation.groomName && (
                    <>
                      <span style={{ display: "block", fontSize: 20, color: "#C0C0C0", fontFamily: "'Merriweather', serif", margin: "14px 0" }}>&amp;</span>
                      {invitation.groomName}
                    </>
                  )}
                </h1>

                <div style={{ width: 80, height: 1, background: "linear-gradient(to right, transparent, rgba(192, 192, 192, 0.5), transparent)", margin: "0 auto 28px" }} />

                {/* Event date */}
                <p style={{ color: "#C0C0C0", fontFamily: "'Merriweather', serif", fontSize: 13, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                  {fmt}
                </p>
              </div>
            </ElegantFadeInScrollReveal>
          </div>
        </div>

        {/* SECTION 2: INTRO CARD */}
        <div style={{ padding: "80px 24px 40px", maxWidth: 580, margin: "0 auto" }}>
          <ElegantFadeInScrollReveal>
            <div className="magazine-card" style={{ textAlign: "center" }}>
              <span className="text-xl block mb-4">✨</span>
              <h2 style={{ fontFamily: "'Merriweather', serif", fontSize: 26, color: "#C0C0C0", fontWeight: 300, marginBottom: 24, letterSpacing: "0.05em" }}>
                {lang === "ur" ? "تقریب میں خوش آمدید" : "The Honor of Your Presence"}
              </h2>
              
              <p style={{ fontSize: 14, lineHeight: 1.8, opacity: 0.85, marginBottom: 20 }}>
                {eventType === "birthday" ? (
                  lang === "ur" ? (
                    `ہم آپ کو زندگی کے اس شاندار سنگ میل کی خوشی منانے کے لیے مدعو کرتے ہیں۔ ہمارے پیارے ${invitation.brideName} اپنی زندگی کے خوبصورت ${invitation.brideParentsName || "50 ویں"} سال مکمل کر رہے ہیں۔ اس یادگار شام کو مزید شاندار بنانے کے لیے آپ کی شرکت ہمارے لیے باعثِ مسرت ہوگی۔`
                  ) : (
                    `We gather to toast a life beautifully lived, rich in memories, achievements, and enduring friendships. Please join us for a sophisticated evening celebrating the milestone ${invitation.brideParentsName || "50th"} birthday of our beloved ${invitation.brideName}.`
                  )
                ) : (
                  lang === "ur" ? (
                    "خالق کائنات کے شکر گزار ہیں جس نے محبت اور وفا کی اس خوبصورت تقریب کو سجانے کا موقع دیا۔ ہم اپنے خاندان اور قریبی احباب کی موجودگی میں اس بابرکت سفر کا آغاز کرنا چاہتے ہیں۔"
                  ) : (
                    "As we celebrate the milestones of life, we invite you to stand beside us in love, unity, and blessing. Your friendship and affection have shaped our journey, and your presence is our greatest gift."
                  )
                )}
              </p>

              {/* Parents Names / Lineage */}
              {(invitation.brideParentsName || invitation.groomParentsName) && (
                <div style={{ marginTop: 32, borderTop: "1px solid rgba(192, 192, 192, 0.15)", paddingTop: 24 }}>
                  {invitation.brideParentsName && (
                    <p style={{ fontSize: 13, color: "#708090", fontStyle: "italic", marginBottom: 6 }}>
                      {eventType === "wedding" ? `${text.daughterOf} ${invitation.brideParentsName}` : invitation.brideParentsName}
                    </p>
                  )}
                  {invitation.groomParentsName && (
                    <p style={{ fontSize: 13, color: "#708090", fontStyle: "italic" }}>
                      {eventType === "wedding" ? `${text.sonOf} ${invitation.groomParentsName}` : invitation.groomParentsName}
                    </p>
                  )}
                </div>
              )}
            </div>
          </ElegantFadeInScrollReveal>
        </div>

        {/* SECTION 3: DATE & TIME COUNTDOWN PANEL */}
        <div style={{ padding: "40px 24px", maxWidth: 580, margin: "0 auto" }}>
          <ElegantFadeInScrollReveal>
            <div className="magazine-card" style={{ textAlign: "center" }}>
              <h3 style={{ fontFamily: "'Merriweather', serif", fontSize: 18, color: "#C0C0C0", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 32 }}>
                {text.countdown}
              </h3>

              {/* Sophisticated Silver-Bordered Grid Countdown */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, margin: "0 auto 36px" }}>
                {[
                  { val: timeLeft.days, lbl: text.days },
                  { val: timeLeft.hours, lbl: text.hours },
                  { val: timeLeft.minutes, lbl: text.mins },
                  { val: timeLeft.seconds, lbl: text.secs }
                ].map((item, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      padding: "16px 8px", 
                      border: "1px solid rgba(192, 192, 192, 0.2)",
                      background: "rgba(255,255,255,0.01)"
                    }}
                  >
                    <span style={{ display: "block", fontSize: 28, fontWeight: 300, color: "#FFFFFF", fontFamily: "'Merriweather', serif" }}>
                      {String(item.val).padStart(2, "0")}
                    </span>
                    <span style={{ display: "block", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "#708090", marginTop: 4 }}>
                      {item.lbl}
                    </span>
                  </div>
                ))}
              </div>

              {/* Venue details */}
              <div style={{ borderTop: "1px solid rgba(192, 192, 192, 0.15)", paddingTop: 28 }}>
                <p style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#708090", marginBottom: 6 }}>
                  {text.dateVenue}
                </p>
                <p style={{ fontSize: 18, fontWeight: 300, color: "#FFFFFF", marginBottom: 4 }}>
                  {invitation.venue?.name}
                </p>
                <p style={{ fontSize: 13, opacity: 0.7, fontStyle: "italic", marginBottom: 20 }}>
                  {invitation.venue?.address}
                </p>
                <p style={{ fontSize: 13, color: "#C0C0C0" }}>
                  ⏰ {fmtTime}
                </p>

                {invitation.venue?.googleMapsUrl && (
                  <a 
                    href={invitation.venue.googleMapsUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="magazine-btn"
                    style={{ display: "inline-block", marginTop: 24, fontSize: 11, textDecoration: "none" }}
                  >
                    {text.openMaps}
                  </a>
                )}
              </div>
            </div>
          </ElegantFadeInScrollReveal>
        </div>

        {/* SECTION 4: TIMELINE SCHEDULE */}
        {invitation.details?.schedule && invitation.details.schedule.length > 0 && (
          <div style={{ padding: "40px 24px", maxWidth: 580, margin: "0 auto" }}>
            <ElegantFadeInScrollReveal>
              <div className="magazine-card">
                <h3 style={{ fontFamily: "'Merriweather', serif", fontSize: 22, color: "#C0C0C0", textAlign: "center", marginBottom: 40, letterSpacing: "0.05em" }}>
                  {text.timelineTitle}
                </h3>

                <div style={{ maxWidth: 440, margin: "0 auto", paddingLeft: 12 }}>
                  {invitation.details.schedule.map((event, idx) => {
                    const eventDate = new Date(event.time);
                    const eventFmtTime = eventDate.toLocaleTimeString(lang === "ur" ? "ur-PK" : "en-US", { hour: "2-digit", minute: "2-digit" });
                    return (
                      <div key={idx} className="timeline-node" style={{ paddingLeft: 24, borderLeft: "1px solid rgba(192, 192, 192, 0.25)", paddingBottom: 32 }}>
                        <span className="silver-bullet" style={{ background: "#C0C0C0", width: 8, height: 8, left: -4.5 }} />
                        <span style={{ fontSize: 11, color: "#708090", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>
                          {eventFmtTime}
                        </span>
                        <h4 style={{ fontSize: 16, color: "#FFFFFF", margin: "4px 0", fontWeight: 400 }}>
                          {event.name}
                        </h4>
                        {event.venue && (
                          <p style={{ fontSize: 12, color: "#C0C0C0", opacity: 0.8, fontStyle: "italic", margin: "2px 0 6px" }}>
                            📍 {event.venue}
                          </p>
                        )}
                        {event.description && (
                          <p style={{ fontSize: 13, opacity: 0.7, margin: 0, lineHeight: 1.6 }}>
                            {event.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </ElegantFadeInScrollReveal>
          </div>
        )}

        {/* SECTION 5: KINDLY RSVP & BLESSING DECK */}
        <div style={{ padding: "40px 24px 80px", maxWidth: 580, margin: "0 auto" }}>
          <ElegantFadeInScrollReveal>
            <div className="magazine-card">
              <h3 style={{ fontFamily: "'Merriweather', serif", fontSize: 22, color: "#C0C0C0", textAlign: "center", marginBottom: 12, letterSpacing: "0.05em" }}>
                {text.rsvpTitle}
              </h3>
              <p style={{ fontSize: 13, opacity: 0.7, textAlign: "center", marginBottom: 36 }}>
                {text.rsvpDesc}
              </p>

              {rsvpDone ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <span style={{ fontSize: "3rem", display: "block", marginBottom: 12 }}>💌</span>
                  <h4 style={{ fontSize: 18, color: "#C0C0C0", marginBottom: 8 }}>{text.successTitle}</h4>
                  <p style={{ fontSize: 14, opacity: 0.8 }}>{text.successDesc}</p>
                </div>
              ) : (
                <form onSubmit={submitRsvp}>
                  <div style={{ marginBottom: 20 }}>
                    <label className="magazine-label">{text.fullName}</label>
                    <input 
                      type="text" 
                      className="magazine-input"
                      value={rsvp.name}
                      onChange={(e) => setRsvp(prev => ({ ...prev, name: e.target.value }))}
                      required
                      placeholder="e.g. Al-haaj Minhaj Khan"
                    />
                  </div>

                  <div style={{ marginBottom: 28 }}>
                    <label className="magazine-label">{text.blessing}</label>
                    <textarea 
                      className="magazine-input"
                      style={{ height: 100, resize: "none" }}
                      value={rsvp.blessing}
                      onChange={(e) => setRsvp(prev => ({ ...prev, blessing: e.target.value }))}
                      placeholder={lang === "ur" ? "نیک خواہشات اور دعائیں یہاں لکھیں..." : "Write your premium wishes & prayers..."}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="magazine-btn"
                    style={{ width: "100%" }}
                    disabled={rsvpLoading}
                  >
                    {rsvpLoading ? text.sending : text.sendRsvp}
                  </button>
                </form>
              )}
            </div>

            {/* CONTACT INFO / EMAIL HOSTS */}
            {invitation.coupleEmail && (
              <p style={{ textAlign: "center", fontSize: 13, color: "#708090" }}>
                {eventType === "wedding" ? text.contactCouple : text.contactHosts}:{" "}
                <a 
                  href={`mailto:${invitation.coupleEmail}`} 
                  style={{ color: "#C0C0C0", textDecoration: "none", borderBottom: "1px solid rgba(192, 192, 192, 0.4)", paddingBottom: 2 }}
                >
                  {invitation.coupleEmail}
                </a>
              </p>
            )}

            <div style={{ paddingTop: 36, marginTop: 44, borderTop: "1px solid rgba(192,192,192,0.12)", textAlign: "center" }}>
              <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.4 }}>
                Taabir Premium Invitations · Powered by Flynx
              </p>
            </div>
          </ElegantFadeInScrollReveal>
        </div>
      </div>
    );
  };

  const renderNeonNightclub = () => {
    const galleryPhotos = invitation.photos || (invitation.photoUrl ? [invitation.photoUrl] : []);
    const hasPhotos = galleryPhotos.length > 0;
    const isBirthday = eventType === "birthday";

    return (
      <div 
        style={{
          opacity: phase !== "closed" ? 1 : 0,
          transform: phase !== "closed" ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 1.5s ease-out, transform 1.5s ease-out",
          width: "100%",
          margin: "0 auto",
          backgroundColor: "#000000", // Pitch Black
          color: "#FFFFFF",
          fontFamily: "'Open Sans', sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Dynamic Google Fonts and Styles injection */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap');
          
          @keyframes neonPulse {
            0%, 100% {
              box-shadow: 0 0 10px #00FF66, 0 0 20px rgba(0,255,102,0.4), inset 0 0 8px rgba(0,255,102,0.3);
              border-color: #00FF66;
            }
            50% {
              box-shadow: 0 0 18px #00FFFF, 0 0 35px rgba(0,255,255,0.5), inset 0 0 15px rgba(0,255,255,0.4);
              border-color: #00FFFF;
            }
          }
          @keyframes quickFlicker {
            0%, 18%, 22%, 25%, 53%, 57%, 100% {
              text-shadow: 
                0 0 4px #fff,
                0 0 12px #00FF66,
                0 0 25px #00FF66,
                0 0 60px #00FF66;
              color: #fff;
              opacity: 1;
            }
            20%, 24%, 55% {
              text-shadow: none;
              color: #1a1a1a;
              opacity: 0.25;
            }
          }
          @keyframes neonStarPulse {
            0%, 100% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.15); opacity: 1; text-shadow: 0 0 15px #00FFFF; }
          }
          @keyframes borderRotate {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes gridMove {
            0% { transform: translateY(0); }
            100% { transform: translateY(40px); }
          }
          
          .neon-title {
            font-family: 'Permanent Marker', cursive;
            animation: quickFlicker 1.8s ease-in-out infinite alternate;
          }
          .neon-glow-card {
            border: 2px solid #00FFFF;
            box-shadow: 0 0 12px rgba(0,255,255,0.3), inset 0 0 8px rgba(0,255,255,0.1);
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(12px);
            transition: all 0.3s ease;
          }
          .neon-glow-card:hover {
            border-color: #00FF66;
            box-shadow: 0 0 20px rgba(0,255,102,0.5), inset 0 0 12px rgba(0,255,102,0.2);
            transform: translateY(-5px);
          }
          .neon-btn {
            font-family: 'Permanent Marker', cursive;
            background: transparent;
            color: #FFFFFF;
            border: 2px solid #00FF66;
            text-shadow: 0 0 6px #00FF66;
            box-shadow: 0 0 8px rgba(0,255,102,0.4);
            transition: all 0.2s ease-in-out;
          }
          .neon-btn:hover {
            background: #00FF66;
            color: #000000;
            box-shadow: 0 0 20px #00FF66, 0 0 40px #00FF66;
            text-shadow: none;
          }
          .cyber-input {
            background: rgba(0, 0, 0, 0.7);
            border: 1px solid rgba(0,255,255,0.4);
            color: #FFFFFF;
            font-family: 'Open Sans', sans-serif;
            transition: all 0.3s ease;
          }
          .cyber-input:focus {
            border-color: #00FF66;
            box-shadow: 0 0 10px rgba(0,255,102,0.5);
            outline: none;
          }
          
          /* Neon bounce animations */
          @keyframes neonBounceIn {
            0% { opacity: 0; transform: translateY(-100px); }
            60% { opacity: 1; transform: translateY(15px); }
            80% { transform: translateY(-8px); }
            100% { transform: translateY(0); }
          }
          .neon-bounce-active {
            animation: neonBounceIn 1.2s cubic-bezier(0.23, 1, 0.32, 1) forwards;
          }
          .neon-bounce-idle {
            opacity: 0;
            transform: translateY(-100px);
          }
        `}</style>

        {/* Dynamic Cyber Grid Background Overlay */}
        <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
          
          {/* Cybernetic grid perspective mesh */}
          <div 
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.12,
              backgroundImage: "linear-gradient(rgba(0, 255, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.2) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              pointerEvents: "none",
              zIndex: 1,
              animation: "gridMove 8s linear infinite"
            }}
          />

          {/* Electric Neon Glowing Top Accent */}
          <div 
            style={{
              height: 4,
              background: "linear-gradient(90deg, #00FF66, #00FFFF, #00FF66)",
              backgroundSize: "200% 200%",
              animation: "borderRotate 6s ease infinite",
              boxShadow: "0 0 20px #00FFFF, 0 0 40px #00FF66"
            }}
          />

          {/* ======================================================== */}
          {/* ⚡ HERO HEADLINER BLOCK (Permanent Marker Callout)       */}
          {/* ======================================================== */}
          <div style={{ padding: "80px 24px 60px", textAlign: "center", position: "relative", zIndex: 10 }}>
            <div 
              style={{
                display: "inline-block",
                padding: "4px 16px",
                borderRadius: 20,
                border: "1px solid #00FFFF",
                color: "#00FFFF",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                marginBottom: 28,
                backgroundColor: "rgba(0,0,0,0.8)",
                boxShadow: "0 0 10px rgba(0,255,255,0.4)"
              }}
            >
              ⚡ EXCLUSIVE VIP ACCESS ⚡
            </div>

            <h1 
              className="neon-title"
              style={{
                fontSize: "4.5rem",
                margin: "0 0 16px",
                lineHeight: 1.05,
                color: "#FFFFFF",
                letterSpacing: "-0.02em"
              }}
            >
              {lang === "ur" ? "سالگرہ دھماکہ" : isBirthday ? "BIRTHDAY BASH" : "THE PARTY"}
            </h1>

            <p 
              style={{
                fontFamily: "'Permanent Marker', cursive",
                fontSize: 24,
                color: "#00FFFF",
                textShadow: "0 0 8px #00FFFF",
                margin: "0 0 32px",
                letterSpacing: "0.05em",
                textTransform: "uppercase"
              }}
            >
              {isBirthday ? `${invitation.brideName}'s ${invitation.groomName || "Milestone"} Bash` : `${invitation.brideName} & ${invitation.groomName}`}
            </p>

            {/* Glowing Neon Divider line */}
            <div 
              style={{
                width: 140,
                height: 3,
                backgroundColor: "#00FF66",
                margin: "0 auto 36px",
                boxShadow: "0 0 10px #00FF66, 0 0 20px #00FF66",
                borderRadius: 2
              }}
            />

            <p style={{ maxWidth: 480, margin: "0 auto 40px", fontSize: 15, opacity: 0.85, lineHeight: 1.6 }}>
              {invitation.invitationNote || "Brace yourselves for the ultimate energetic nightclub party. High contrast beats, glowing cocktails, and endless vibes await."}
            </p>
          </div>

          {/* ======================================================== */}
          {/* 📅 EVENT METADATA DETAILS CARDS (Bounce-In-Down)         */}
          {/* ======================================================== */}
          <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 10 }}>
            
            <BounceInDownScrollReveal>
              <div 
                className="neon-glow-card" 
                style={{
                  width: "100%",
                  borderRadius: 24,
                  padding: 32,
                  marginBottom: 32,
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 12, animation: "neonStarPulse 3s infinite" }}>📅</div>
                <h3 
                  style={{
                    fontFamily: "'Permanent Marker', cursive",
                    fontSize: 26,
                    color: "#00FF66",
                    textShadow: "0 0 6px #00FF66",
                    margin: "0 0 16px",
                    letterSpacing: "0.05em"
                  }}
                >
                  {text.dateVenue}
                </h3>
                <p style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px", color: "#FFFFFF" }}>{fmt}</p>
                <p style={{ fontSize: 15, color: "#00FFFF", fontWeight: 600, margin: "0 0 16px" }}>🕒 {fmtTime}</p>
                
                <div 
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    background: "rgba(0,0,0,0.5)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    marginBottom: 20
                  }}
                >
                  <p style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "#FFFFFF" }}>📍 {invitation.venueName}</p>
                  {invitation.venueAddress && (
                    <p style={{ fontSize: 13, opacity: 0.7, margin: 0 }}>{invitation.venueAddress}</p>
                  )}
                </div>

                {invitation.mapsUrl && (
                  <a 
                    href={invitation.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="neon-btn"
                    style={{
                      display: "inline-block",
                      padding: "12px 28px",
                      borderRadius: 14,
                      fontSize: 12,
                      fontWeight: 800,
                      letterSpacing: "0.15em",
                      textDecoration: "none",
                      textTransform: "uppercase"
                    }}
                  >
                    🚀 MAP NAVIGATION
                  </a>
                )}
              </div>
            </BounceInDownScrollReveal>

            {/* ======================================================== */}
            {/* 🕒 CYBERNETIC COUNTDOWN WIDGET                           */}
            {/* ======================================================== */}
            <BounceInDownScrollReveal>
              <div 
                className="neon-glow-card" 
                style={{
                  width: "100%",
                  borderRadius: 24,
                  padding: 32,
                  marginBottom: 32,
                  textAlign: "center"
                }}
              >
                <h3 
                  style={{
                    fontFamily: "'Permanent Marker', cursive",
                    fontSize: 22,
                    color: "#00FFFF",
                    textShadow: "0 0 6px #00FFFF",
                    margin: "0 0 24px",
                    letterSpacing: "0.05em"
                  }}
                >
                  ⏰ TIME RUNNING OUT
                </h3>

                <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
                  {[
                    { val: timeLeft.days, lbl: text.days, color: "#00FF66" },
                    { val: timeLeft.hours, lbl: text.hours, color: "#00FFFF" },
                    { val: timeLeft.minutes, lbl: text.mins, color: "#00FF66" },
                    { val: timeLeft.seconds, lbl: text.secs, color: "#00FFFF" }
                  ].map((unit, i) => (
                    <div 
                      key={i} 
                      style={{
                        flex: "1 1 0px",
                        padding: 12,
                        borderRadius: 16,
                        background: "rgba(0,0,0,0.6)",
                        border: `1px solid ${unit.color}`
                      }}
                    >
                      <span 
                        style={{
                          fontSize: 26,
                          fontWeight: 800,
                          color: "#FFFFFF",
                          display: "block",
                          fontFamily: "monospace"
                        }}
                      >
                        {String(unit.val).padStart(2, "0")}
                      </span>
                      <span style={{ fontSize: 10, letterSpacing: "0.05em", color: unit.color, textTransform: "uppercase", fontWeight: 700 }}>
                        {unit.lbl}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </BounceInDownScrollReveal>

            {/* ======================================================== */}
            {/* 📋 PARTY SCHEDULE TIMELINE                              */}
            {/* ======================================================== */}
            {invitation.timeline && invitation.timeline.length > 0 && (
              <BounceInDownScrollReveal>
                <div 
                  className="neon-glow-card" 
                  style={{
                    width: "100%",
                    borderRadius: 24,
                    padding: 32,
                    marginBottom: 32
                  }}
                >
                  <h3 
                    style={{
                      fontFamily: "'Permanent Marker', cursive",
                      fontSize: 26,
                      color: "#00FF66",
                      textShadow: "0 0 6px #00FF66",
                      margin: "0 0 28px",
                      textAlign: "center",
                      letterSpacing: "0.05em"
                    }}
                  >
                    🎉 PARTY SCHEDULE
                  </h3>

                  <div style={{ position: "relative", paddingLeft: 24, borderLeft: "2px solid #00FFFF" }}>
                    {invitation.timeline.map((event, idx) => (
                      <div key={idx} style={{ marginBottom: 24, position: "relative" }}>
                        <div 
                          style={{
                            position: "absolute",
                            left: -33,
                            top: 4,
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            backgroundColor: "#00FF66",
                            boxShadow: "0 0 8px #00FF66",
                            border: "3px solid #000000"
                          }}
                        />
                        <span style={{ fontSize: 12, fontWeight: 800, color: "#00FFFF", fontFamily: "monospace", display: "block" }}>
                          ⚡ {event.time}
                        </span>
                        <h4 style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", margin: "4px 0" }}>
                          {event.title}
                        </h4>
                        {event.description && (
                          <p style={{ fontSize: 13, opacity: 0.7, margin: 0 }}>{event.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </BounceInDownScrollReveal>
            )}

            {/* ======================================================== */}
            {/* 📸 VIP GALLERY SHOWCASE                                  */}
            {/* ======================================================== */}
            {hasPhotos && (
              <BounceInDownScrollReveal>
                <div 
                  className="neon-glow-card" 
                  style={{
                    width: "100%",
                    borderRadius: 24,
                    padding: 32,
                    marginBottom: 32,
                    textAlign: "center"
                  }}
                >
                  <h3 
                    style={{
                      fontFamily: "'Permanent Marker', cursive",
                      fontSize: 26,
                      color: "#00FFFF",
                      textShadow: "0 0 6px #00FFFF",
                      margin: "0 0 24px",
                      letterSpacing: "0.05em"
                    }}
                  >
                    📸 VIP SNEAK PEEK
                  </h3>

                  <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", aspectRatio: "4/3", border: "2px solid #00FF66", boxShadow: "0 0 15px rgba(0,255,102,0.3)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={galleryPhotos[activePhotoIdx]} 
                      alt="Gallery Mockup"
                      style={{ width: "100%", height: "100%", objectCover: "cover" }}
                    />
                    
                    {galleryPhotos.length > 1 && (
                      <>
                        <button 
                          onClick={() => setActivePhotoIdx(prev => (prev === 0 ? galleryPhotos.length - 1 : prev - 1))}
                          style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.8)", border: "1px solid #00FF66", color: "#00FF66", cursor: "pointer", fontWeight: "bold" }}
                        >
                          ‹
                        </button>
                        <button 
                          onClick={() => setActivePhotoIdx(prev => (prev === galleryPhotos.length - 1 ? 0 : prev + 1))}
                          style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.8)", border: "1px solid #00FF66", color: "#00FF66", cursor: "pointer", fontWeight: "bold" }}
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </BounceInDownScrollReveal>
            )}

            {/* ======================================================== */}
            {/* ✍️ RSVP SUBMISSION FORM                                  */}
            {/* ======================================================== */}
            <BounceInDownScrollReveal>
              <div 
                className="neon-glow-card" 
                style={{
                  width: "100%",
                  borderRadius: 24,
                  padding: 32,
                  marginBottom: 32
                }}
              >
                <h3 
                  style={{
                    fontFamily: "'Permanent Marker', cursive",
                    fontSize: 26,
                    color: "#00FF66",
                    textShadow: "0 0 6px #00FF66",
                    margin: "0 0 12px",
                    textAlign: "center",
                    letterSpacing: "0.05em"
                  }}
                >
                  ⚡ VIP REGISTRATION
                </h3>
                <p style={{ fontSize: 13, opacity: 0.8, textAlign: "center", marginBottom: 28 }}>
                  Register below to secure your exclusive VIP nightclub pass.
                </p>

                {rsvpDone ? (
                  <div style={{ textAlign: "center", padding: "16px 0" }}>
                    <div style={{ fontSize: 44, marginBottom: 12 }}>⚡</div>
                    <h4 style={{ fontSize: 20, fontWeight: 700, color: "#00FFFF", margin: "0 0 8px" }}>
                      {text.successTitle}
                    </h4>
                    <p style={{ fontSize: 14, opacity: 0.8, margin: 0 }}>
                      {text.successDesc}
                    </p>
                  </div>
                ) : (
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!rsvp.name.trim()) return;
                      setRsvpLoading(true);
                      try {
                        const rsvpsRef = collection(db, "invitations", invitation.id, "rsvps");
                        await addDoc(rsvpsRef, {
                          ...rsvp,
                          submittedAt: new Date().toISOString()
                        });
                        setRsvpDone(true);
                      } catch (err) {
                        console.error("RSVP Failure:", err);
                      } finally {
                        setRsvpLoading(false);
                      }
                    }}
                    style={{ display: "flex", flexDirection: "column", gap: 16 }}
                  >
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: "#00FFFF", display: "block", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                        {text.fullName}
                      </label>
                      <input 
                        type="text" 
                        required
                        className="cyber-input"
                        placeholder="Type name here..."
                        style={{ width: "100%", padding: 12, borderRadius: 12, fontSize: 14 }}
                        value={rsvp.name}
                        onChange={(e) => setRsvp(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: "#00FF66", display: "block", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                        VIP PASS CONFIRMATION
                      </label>
                      <div style={{ display: "flex", gap: 12 }}>
                        <button 
                          type="button"
                          onClick={() => setRsvp(prev => ({ ...prev, attending: "yes" }))}
                          style={{
                            flex: 1,
                            padding: 12,
                            borderRadius: 12,
                            background: rsvp.attending === "yes" ? "#00FF66" : "rgba(0,0,0,0.5)",
                            color: rsvp.attending === "yes" ? "#000000" : "#FFFFFF",
                            border: "1px solid #00FF66",
                            fontWeight: "bold",
                            fontSize: 13,
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                        >
                          🔥 COUNT ME IN
                        </button>
                        <button 
                          type="button"
                          onClick={() => setRsvp(prev => ({ ...prev, attending: "no" }))}
                          style={{
                            flex: 1,
                            padding: 12,
                            borderRadius: 12,
                            background: rsvp.attending === "no" ? "#00FFFF" : "rgba(0,0,0,0.5)",
                            color: rsvp.attending === "no" ? "#000000" : "#FFFFFF",
                            border: "1px solid #00FFFF",
                            fontWeight: "bold",
                            fontSize: 13,
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                        >
                          ❌ CAN'T MAKE IT
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: "#00FFFF", display: "block", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                        {text.blessing}
                      </label>
                      <textarea 
                        className="cyber-input"
                        placeholder="Leave a glowing comment..."
                        rows={3}
                        style={{ width: "100%", padding: 12, borderRadius: 12, fontSize: 14, resize: "none" }}
                        value={rsvp.blessing}
                        onChange={(e) => setRsvp(prev => ({ ...prev, blessing: e.target.value }))}
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={rsvpLoading}
                      className="neon-btn"
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        fontSize: 14,
                        fontWeight: "bold",
                        cursor: "pointer",
                        marginTop: 8
                      }}
                    >
                      {rsvpLoading ? text.sending : "REGISTER NOW"}
                    </button>
                  </form>
                )}
              </div>
            </BounceInDownScrollReveal>

          </div>

          {/* ======================================================== */}
          {/* 👥 HOST CONTACT / FOOTER SIGNATURE                       */}
          {/* ======================================================== */}
          <div style={{ padding: "60px 24px 80px", textAlign: "center", borderTop: "1px dashed rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.3)", position: "relative", zIndex: 10 }}>
            <BounceInDownScrollReveal>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                <p style={{ fontFamily: "'Permanent Marker', cursive", fontSize: 24, color: "#00FF66", textShadow: "0 0 6px #00FF66", marginBottom: 12 }}>
                  BE THERE OR BE SQUARE!
                </p>
                <p style={{ fontSize: 16, fontWeight: 600, margin: "0 0 24px", color: "#FFFFFF" }}>
                  {invitation.brideName} {invitation.groomName ? `& ${invitation.groomName}` : ""}
                </p>

                {invitation.coupleEmail && (
                  <p style={{ fontSize: 13, opacity: 0.7, margin: 0 }}>
                    Questions? Drop a line:{" "}
                    <a href={`mailto:${invitation.coupleEmail}`} style={{ color: "#00FFFF", textDecoration: "none", fontWeight: 700 }}>
                      {invitation.coupleEmail}
                    </a>
                  </p>
                )}

                <div style={{ paddingTop: 36, marginTop: 44, borderTop: "1px solid rgba(255,255,255,0.06)", width: "100%" }}>
                  <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.4 }}>
                    Taabir Premium Invitations · Powered by Flynx
                  </p>
                </div>
              </div>
            </BounceInDownScrollReveal>
          </div>

        </div>
      </div>
    );
  };

  const layouts = [
    { id: "emerald-noir", name: "Classic Premium", icon: "✨" },
    { id: "minimalist-romance", name: "Minimalist Romance", icon: "🤍" },
    { id: "dark-moody-elegant", name: "Dark Moody & Elegant", icon: "🖤" },
    { id: "bohemian-terracotta", name: "Bohemian Terracotta", icon: "🌿" },
    { id: "royal-glamour", name: "Royal Glamour & Glassmorphism", icon: "💎" },
    { id: "neon-nightclub", name: "Neon Nightclub", icon: "⚡" },
    { id: "elegant-milestone", name: "Elegant Milestone (50th/60th)", icon: "🍷" },
  ];

  const palettes = [
    { id: "minimalist-romance", name: "Minimalist Romance", preview: ["#FFFFF0", "#F7E7CE", "#333333"] },
    { id: "emerald-noir", name: "Emerald Noir", preview: ["#001C12", "#C5A880", "#FAF9F5"] },
    { id: "dark-moody-elegant", name: "Dark Moody & Elegant", preview: ["#0F0F0F", "#043927", "#D4AF37"] },
    { id: "bohemian-terracotta", name: "Bohemian Terracotta", preview: ["#FFFDD0", "#E2725B", "#9DC183"] },
    { id: "ivory-classic", name: "Ivory Classic", preview: ["#FAF9F5", "#800020", "#2c2317"] },
    { id: "midnight-gold", name: "Midnight Gold", preview: ["#040B16", "#D4AF37", "#E2E8F0"] },
    { id: "royal-glamour", name: "Royal Glamour", preview: ["#0A1128", "#B76E79", "#FFFFFF"] },
    { id: "neon-nightclub", name: "Neon Nightclub", preview: ["#000000", "#00FF66", "#00FFFF"] },
    { id: "elegant-milestone", name: "Elegant Milestone", preview: ["#800020", "#C0C0C0", "#708090"] },
  ];

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

      {/* FLOATING DESIGN CUSTOMIZER WIDGET */}
      {showPaletteMenu !== undefined && (
        <div className="fixed bottom-4 left-4 z-[999] font-sans">
          {showPaletteMenu ? (
            <div 
              style={{
                background: "rgba(255, 255, 255, 0.96)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(0, 0, 0, 0.1)",
                borderRadius: 18,
                padding: "18px 20px",
                boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                width: 275,
                maxHeight: "70vh",
                overflowY: "auto",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,0.06)", paddingBottom: 8 }}>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: "#1f2937", letterSpacing: "0.08em", textTransform: "uppercase" }}>Design Customizer</span>
                <button 
                  onClick={() => setShowPaletteMenu(false)}
                  style={{
                    border: "none",
                    background: "none",
                    fontSize: 22,
                    cursor: "pointer",
                    color: "#9ca3af",
                    padding: 0,
                    lineHeight: 0.5,
                    outline: "none"
                  }}
                >
                  &times;
                </button>
              </div>

              {/* Tab Selector Bar */}
              <div style={{ display: "flex", background: "rgba(0,0,0,0.05)", borderRadius: 10, padding: 3 }}>
                <button 
                  onClick={() => setCustomizerTab("layouts")}
                  style={{
                    flex: 1,
                    border: "none",
                    background: customizerTab === "layouts" ? "#FFFFFF" : "transparent",
                    boxShadow: customizerTab === "layouts" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                    borderRadius: 8,
                    padding: "6px 0",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    color: customizerTab === "layouts" ? "#1f2937" : "#6b7280",
                    transition: "all 0.2s",
                    outline: "none"
                  }}
                >
                  🏛️ Structure
                </button>
                <button 
                  onClick={() => setCustomizerTab("colors")}
                  style={{
                    flex: 1,
                    border: "none",
                    background: customizerTab === "colors" ? "#FFFFFF" : "transparent",
                    boxShadow: customizerTab === "colors" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                    borderRadius: 8,
                    padding: "6px 0",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    color: customizerTab === "colors" ? "#1f2937" : "#6b7280",
                    transition: "all 0.2s",
                    outline: "none"
                  }}
                >
                  🎨 Colors
                </button>
              </div>

              {/* Tab 1 Content: Layout & Animations */}
              {customizerTab === "layouts" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", letterSpacing: "0.05em", textTransform: "uppercase" }}>🏛️ Choose Body Structure</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {layouts.map((lay) => {
                      const isLayActive = activeLayoutId === lay.id;
                      return (
                        <button
                          key={lay.id}
                          onClick={() => setActiveLayoutId(lay.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "8px 10px",
                            borderRadius: 8,
                            border: isLayActive ? "2px solid #D4AF37" : "1px solid rgba(0,0,0,0.05)",
                            backgroundColor: isLayActive ? "rgba(212, 175, 55, 0.05)" : "transparent",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            textAlign: "left",
                            width: "100%",
                            outline: "none"
                          }}
                        >
                          <span style={{ fontSize: 14 }}>{lay.icon}</span>
                          <span style={{ fontSize: 11.5, fontWeight: isLayActive ? 700 : 500, color: isLayActive ? "#856404" : "#4b5563" }}>
                            {lay.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 2 Content: Colors */}
              {customizerTab === "colors" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", letterSpacing: "0.05em", textTransform: "uppercase" }}>🎨 Choose Theme Palette</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {palettes.map((pal) => {
                      const isPalActive = activePaletteId === pal.id;
                      return (
                        <button
                          key={pal.id}
                          onClick={() => setActivePaletteId(pal.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 10px",
                            borderRadius: 8,
                            border: isPalActive ? "2px solid #D4AF37" : "1px solid rgba(0,0,0,0.05)",
                            backgroundColor: isPalActive ? "rgba(212, 175, 55, 0.05)" : "transparent",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            textAlign: "left",
                            width: "100%",
                            outline: "none"
                          }}
                        >
                          <span style={{ fontSize: 11.5, fontWeight: isPalActive ? 700 : 500, color: isPalActive ? "#856404" : "#4b5563" }}>
                            {pal.name}
                          </span>
                          <div style={{ display: "flex", gap: 3 }}>
                            {pal.preview.map((c, i) => (
                              <span 
                                key={i} 
                                style={{ 
                                  width: 10, 
                                  height: 10, 
                                  borderRadius: "50%", 
                                  backgroundColor: c, 
                                  border: "1px solid rgba(0,0,0,0.1)" 
                                }} 
                              />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <button
              onClick={() => setShowPaletteMenu(true)}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: "50%",
                width: 46,
                height: 46,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 18px rgba(0,0,0,0.15)",
                cursor: "pointer",
                transition: "all 0.2s",
                fontSize: 22,
                outline: "none"
              }}
              title="Design Customizer"
              className="hover:scale-105 active:scale-95"
            >
              🎨
            </button>
          )}
        </div>
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

          {/* LUMINOUS FADE ZOOM / CLOUD BURST */}
          {animStyle === "fade-zoom" && (
            <div style={{
              position: "absolute", inset: 0, 
              background: T.door, 
              opacity: phase === "opening" ? 0 : 1,
              transition: "opacity 1.2s ease-in-out",
              overflow: "hidden"
            }}>
              {activePaletteId === "playful-kidsparty" && (
                <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
                  {/* Top Left Cloud */}
                  <svg 
                    viewBox="0 0 170 130" 
                    style={{
                      position: "absolute", top: "50%", left: "50%",
                      width: 320, height: 200, fill: "#FFFFFF", opacity: 0.95,
                      transform: phase === "opening" 
                        ? "translate(-120vw, -120vh) scale(4)" 
                        : "translate(-180px, -180px) scale(1)",
                      transition: "transform 1.3s cubic-bezier(0.25, 1, 0.5, 1)"
                    }}
                  >
                    <path d="M40,100 Q10,100 10,70 Q10,40 40,40 Q50,20 80,20 Q110,20 120,40 Q150,40 160,70 Q160,100 130,100 Q110,112 85,100 Q60,112 40,100 Z" />
                  </svg>

                  {/* Top Right Cloud */}
                  <svg 
                    viewBox="0 0 170 130" 
                    style={{
                      position: "absolute", top: "50%", left: "50%",
                      width: 320, height: 200, fill: "#FFFFFF", opacity: 0.95,
                      transform: phase === "opening" 
                        ? "translate(120vw, -120vh) scale(4)" 
                        : "translate(-20px, -180px) scale(1)",
                      transition: "transform 1.3s cubic-bezier(0.25, 1, 0.5, 1)"
                    }}
                  >
                    <path d="M40,100 Q10,100 10,70 Q10,40 40,40 Q50,20 80,20 Q110,20 120,40 Q150,40 160,70 Q160,100 130,100 Q110,112 85,100 Q60,112 40,100 Z" />
                  </svg>

                  {/* Bottom Left Cloud */}
                  <svg 
                    viewBox="0 0 170 130" 
                    style={{
                      position: "absolute", top: "50%", left: "50%",
                      width: 320, height: 200, fill: "#FFFFFF", opacity: 0.95,
                      transform: phase === "opening" 
                        ? "translate(-120vw, 120vh) scale(4)" 
                        : "translate(-180px, -20px) scale(1)",
                      transition: "transform 1.3s cubic-bezier(0.25, 1, 0.5, 1)"
                    }}
                  >
                    <path d="M40,100 Q10,100 10,70 Q10,40 40,40 Q50,20 80,20 Q110,20 120,40 Q150,40 160,70 Q160,100 130,100 Q110,112 85,100 Q60,112 40,100 Z" />
                  </svg>

                  {/* Bottom Right Cloud */}
                  <svg 
                    viewBox="0 0 170 130" 
                    style={{
                      position: "absolute", top: "50%", left: "50%",
                      width: 320, height: 200, fill: "#FFFFFF", opacity: 0.95,
                      transform: phase === "opening" 
                        ? "translate(120vw, 120vh) scale(4)" 
                        : "translate(-20px, -20px) scale(1)",
                      transition: "transform 1.3s cubic-bezier(0.25, 1, 0.5, 1)"
                    }}
                  >
                    <path d="M40,100 Q10,100 10,70 Q10,40 40,40 Q50,20 80,20 Q110,20 120,40 Q150,40 160,70 Q160,100 130,100 Q110,112 85,100 Q60,112 40,100 Z" />
                  </svg>
                </div>
              )}
            </div>
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
      {activeLayoutId === "minimalist-romance" ? (
        renderMinimalistRomance()
      ) : activeLayoutId === "dark-moody-elegant" ? (
        renderDarkMoody()
      ) : activeLayoutId === "bohemian-terracotta" ? (
        renderBohemianTerracotta()
      ) : activeLayoutId === "royal-glamour" ? (
        renderRoyalGlamour()
      ) : activeLayoutId === "neon-nightclub" ? (
        renderNeonNightclub()
      ) : activeLayoutId === "elegant-milestone" ? (
        renderElegantMilestone()
      ) : activeLayoutId === "playful-kidsparty" ? (
        renderPlayfulKidsParty()
      ) : activeLayoutId === "summer-poolparty" ? (
        renderSummerPoolparty()
      ) : (
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
                <p style={{ color: T.text, fontSize: 15, fontWeight: 500, marginBottom: 4 }}>{invitation.venue?.name}</p>
                <p style={{ color: T.sub, fontSize: 12.5 }}>{invitation.venue?.address}</p>
              </div>

              {invitation.venue?.googleMapsUrl && (
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
      )}

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
    if (percentage > 0.35) {
      // Fade out canvas automatically when 35%-40% is cleared
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
function ScrollReveal({ children, duration = "1.2s", ease = "cubic-bezier(0.16, 1, 0.3, 1)", distance = "24px" }) {
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

function GlassScrollReveal({ children }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -50px 0px" }
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
        filter: isVisible ? "blur(0px)" : "blur(12px)",
        transform: isVisible ? "translateY(0)" : "translateY(40px)",
        transition: "opacity 1s cubic-bezier(0.16, 1, 0.3, 1), filter 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div
        style={{
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.8s ease-in-out",
          transitionDelay: "0.5s",
        }}
      >
        {children}
      </div>
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

function BounceInDownScrollReveal({ children }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -50px 0px" }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={isVisible ? "neon-bounce-active" : "neon-bounce-idle"}
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  );
}

function ElegantFadeInScrollReveal({ children }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -50px 0px" }
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
        transition: "opacity 2s ease-in-out",
        width: "100%"
      }}
    >
      {children}
    </div>
  );
}

function BalloonFloater({ color, left, delay, size }) {
  const [popped, setPopped] = useState(false);
  const [exploding, setExploding] = useState(false);

  const handlePop = () => {
    if (popped || exploding) return;
    setExploding(true);
    setTimeout(() => {
      setPopped(true);
    }, 300); // match explosion animation
  };

  if (popped) return null;

  return (
    <div
      onClick={handlePop}
      style={{
        position: "absolute",
        left: `${left}%`,
        bottom: "-100px",
        width: size,
        height: size * 1.2,
        backgroundColor: color,
        borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        boxShadow: "inset -8px -8px 0 rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.15)",
        animation: exploding 
          ? "balloonExplode 0.3s forwards cubic-bezier(0.1, 0.8, 0.3, 1)" 
          : `floatBalloon 12s linear ${delay}s infinite, wiggleAnim 2s ease-in-out infinite alternate`,
        transformOrigin: "bottom center",
        userSelect: "none",
      }}
    >
      {/* Balloon reflection specular spot */}
      <div style={{ position: "absolute", top: "15%", left: "20%", width: size * 0.25, height: size * 0.15, background: "rgba(255,255,255,0.6)", borderRadius: "50%", transform: "rotate(-30deg)" }} />
      {/* Balloon string knot */}
      <div style={{ position: "absolute", bottom: "-6px", width: 8, height: 6, backgroundColor: color, clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)" }} />
      {/* Balloon string */}
      <div style={{ position: "absolute", bottom: "-46px", width: 2, height: 40, borderLeft: "1px dashed rgba(255,255,255,0.5)" }} />
      {/* Tiny text invite overlay */}
      <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 9, color: "white", textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>POP!</span>
    </div>
  );
}


