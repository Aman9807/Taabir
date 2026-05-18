"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { db } from "../../../lib/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

export default function CreateInvitationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    brideName: "",
    brideParentsName: "",
    groomName: "",
    groomParentsName: "",
    coupleEmail: "", // Contact email shown on the invitation card
    headerArabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", // Customizable Arabic text (default Bismillah)
    headerGrace: "Under the Grace of Almighty Allah",    // Customizable Grace subtext
    weddingDate: "", // Main function date (for countdown)
    venueName: "",
    venueAddress: "",
    venueMapUrl: "", // Direct Google Maps link (optional)
    slug: "",
    photoUrl: "", // Couple Photo URL
    musicUrl: "", // Background audio MP3 URL
    templateId: "emerald-noir", // Selected Template
  });

  // Dynamic Timeline State
  const [schedule, setSchedule] = useState([
    { name: "Mehndi", time: "", venue: "Orchard Grand Ballroom", description: "Ceremony & dinner is served." },
    { name: "Baraat / Vows", time: "", venue: "Royal Palms Gardens", description: "Exchange of rings & wedding feast." }
  ]);

  // Action states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploadedBase64, setUploadedBase64] = useState(""); // base64 representation of uploaded image
  const [photoMode, setPhotoMode] = useState("upload");     // "upload" or "url"

  // Redirect protection
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Handle standard input updates
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Convert and compress uploaded image directly to Base64 JPEG client-side
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create an off-screen Canvas
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        // Calculate compressed dimensions, maintaining aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas image to highly optimized Base64 JPEG at 0.75 quality
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75);
        setUploadedBase64(compressedBase64);
        setFormData((prev) => ({ ...prev, photoUrl: "" })); // Clear the pasted link to avoid conflicts
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Helper: Live-sanitizes slug inputs
  const handleSlugChange = (e) => {
    const value = e.target.value;
    const sanitizedSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "") // Remove everything except a-z, 0-9, and -
      .replace(/-+/g, "-");       // Collapse double hyphens
    
    setFormData((prev) => ({
      ...prev,
      slug: sanitizedSlug,
    }));
  };

  // Handle dynamic schedule timeline updates
  const handleEventChange = (index, e) => {
    const { name, value } = e.target;
    setSchedule((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [name]: value };
      return updated;
    });
  };

  const addEvent = () => {
    setSchedule((prev) => [...prev, { name: "", time: "", venue: "", description: "" }]);
  };

  const removeEvent = (index) => {
    if (schedule.length > 1) {
      setSchedule((prev) => prev.filter((_, i) => i !== index));
    } else {
      setError("Please include at least one event in the timeline.");
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const { 
      brideName, 
      brideParentsName, 
      groomName, 
      groomParentsName, 
      weddingDate, 
      venueName, 
      venueAddress, 
      slug, 
      photoUrl, 
      musicUrl,
      templateId 
    } = formData;

    // Client-side validations
    if (!brideName || !groomName || !weddingDate || !venueName || !venueAddress || !slug) {
      setError("Please fill out all mandatory core fields.");
      setIsSubmitting(false);
      return;
    }

    if (slug.length < 3) {
      setError("The URL slug must be at least 3 characters long.");
      setIsSubmitting(false);
      return;
    }

    // Schedule validation
    const hasEmptyEvent = schedule.some(event => !event.name || !event.time);
    if (hasEmptyEvent) {
      setError("Please provide a name and time/date for all timeline sub-events.");
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Perform Global Slug Uniqueness Query in Firestore
      const invitationsRef = collection(db, "invitations");
      const slugQuery = query(invitationsRef, where("slug", "==", slug.trim()));
      const querySnapshot = await getDocs(slugQuery);

      if (!querySnapshot.empty) {
        setError("This custom URL slug is already taken. Please try another one.");
        setIsSubmitting(false);
        return;
      }

      // Use the host's direct Maps link if provided, else auto-generate a search URL
      const mapSearchQuery = `${venueName.trim()} ${venueAddress.trim()}`;
      const autoMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapSearchQuery)}`;
      const googleMapsUrl = formData.venueMapUrl.trim() || autoMapsUrl;

      // Default couple photo if none specified
      const fallbackPhoto = "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000";

      // 2. Prepare payload
      const invitationPayload = {
        userId: user.uid,
        slug: slug.trim(),
        brideName: brideName.trim(),
        brideParentsName: brideParentsName.trim(),
        groomName: groomName.trim(),
        groomParentsName: groomParentsName.trim(),
        weddingDate: new Date(weddingDate).toISOString(),
        venue: {
          name: venueName.trim(),
          address: venueAddress.trim(),
          googleMapsUrl,
        },
        photoUrl: uploadedBase64 || photoUrl.trim() || fallbackPhoto,
        musicUrl: musicUrl.trim() || "",
        coupleEmail: formData.coupleEmail.trim() || "",
        headerArabic: formData.headerArabic.trim() || "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        headerGrace: formData.headerGrace.trim() || "Under the Grace of Almighty Allah",
        theme: {
          templateId: templateId || "emerald-noir",
          primaryColor: templateId === "emerald-noir" ? "#C5A880" : "#A78BFA", 
          secondaryColor: templateId === "emerald-noir" ? "#022E1F" : "#FAF9F5", 
          fontFamily: "Playfair Display",
        },
        details: {
          story: "",
          schedule: schedule
            .map((ev) => ({
              name: ev.name.trim(),
              time: new Date(ev.time).toISOString(),
              venue: ev.venue ? ev.venue.trim() : "",
              description: ev.description.trim(),
            }))
            .sort((a, b) => new Date(a.time) - new Date(b.time)),
        },
        rsvpCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 3. Save invitation to collection
      await addDoc(invitationsRef, invitationPayload);

      setSuccess(true);
      
      // Redirect back to dashboard panel after success
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);

    } catch (err) {
      console.error("Firestore database write error:", err);
      setError(`Failed to create invitation: ${err.message || "Please check your internet connection."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
          <p className="text-slate-500 font-medium">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-slate-100 to-amber-50/20 py-12 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-3xl mx-auto">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Create New Invitation
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Set up your wedding details below to generate an interactive, responsive digital invitation page.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white shadow-xl rounded-2xl border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
          {/* Decorative luxury gold top border */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200"></div>

          {/* Success Notification Alert */}
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 animate-pulse font-sans">
              <svg className="h-5 w-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <strong className="font-semibold">Creation Successful!</strong> Generating invitation web links and templates... Redirecting now.
              </div>
            </div>
          )}

          {/* Error Notification Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3 font-sans">
              <svg className="h-5 w-5 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Core Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 font-sans">
                1. Core Wedding Details
              </h3>
              
              {/* Couple names & Parent names group */}
              <div className="space-y-6">
                {/* Bride Info */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <label htmlFor="brideName" className="block text-sm font-semibold text-slate-700">
                      Bride&apos;s First Name *
                    </label>
                    <input
                      type="text"
                      name="brideName"
                      id="brideName"
                      required
                      placeholder="e.g. Sarah"
                      value={formData.brideName}
                      onChange={handleChange}
                      className="mt-1 block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-sans"
                    />
                  </div>

                  <div>
                    <label htmlFor="brideParentsName" className="block text-sm font-semibold text-slate-700">
                      Bride&apos;s Parents/Guardians Name
                    </label>
                    <input
                      type="text"
                      name="brideParentsName"
                      id="brideParentsName"
                      placeholder="e.g. Mr. & Mrs. Shakeel Ahmed"
                      value={formData.brideParentsName}
                      onChange={handleChange}
                      className="mt-1 block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-sans"
                    />
                  </div>
                </div>

                {/* Groom Info */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <label htmlFor="groomName" className="block text-sm font-semibold text-slate-700">
                      Groom&apos;s First Name *
                    </label>
                    <input
                      type="text"
                      name="groomName"
                      id="groomName"
                      required
                      placeholder="e.g. Michael"
                      value={formData.groomName}
                      onChange={handleChange}
                      className="mt-1 block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-sans"
                    />
                  </div>

                  <div>
                    <label htmlFor="groomParentsName" className="block text-sm font-semibold text-slate-700">
                      Groom&apos;s Parents/Guardians Name
                    </label>
                    <input
                      type="text"
                      name="groomParentsName"
                      id="groomParentsName"
                      placeholder="e.g. Mr. & Mrs. Imtiaz Khan"
                      value={formData.groomParentsName}
                      onChange={handleChange}
                      className="mt-1 block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* Main Wedding Date */}
              <div>
                <label htmlFor="weddingDate" className="block text-sm font-semibold text-slate-700">
                  Main Wedding Date & Time * (For Live Countdown)
                </label>
                <input
                  type="datetime-local"
                  name="weddingDate"
                  id="weddingDate"
                  required
                  value={formData.weddingDate}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-sans"
                />
              </div>

              {/* Assets link */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Couple Photo Selector Tab Controller */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Couple&apos;s Feature Photo
                  </label>
                  
                  {/* Luxury tab selectors */}
                  <div className="flex gap-2 p-1 bg-slate-100/80 rounded-xl max-w-xs mb-3">
                    <button
                      type="button"
                      onClick={() => setPhotoMode("upload")}
                      className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all ${
                        photoMode === "upload"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      📁 Upload Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoMode("url")}
                      className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all ${
                        photoMode === "url"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      🔗 Paste Link
                    </button>
                  </div>

                  {photoMode === "upload" ? (
                    <div className="space-y-3">
                      {/* Drag & Drop Visual Box */}
                      <div className="border-2 border-dashed border-slate-200 hover:border-amber-400/60 rounded-xl p-4 bg-slate-50 text-center transition-all relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <span className="text-xl block mb-1">📸</span>
                        <span className="block text-xs font-bold text-slate-700">
                          {uploadedBase64 ? "Change Chosen Photo" : "Choose Wedding Image"}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          Drag and drop or tap to browse (max 2MB)
                        </span>
                      </div>
                      
                      {/* Image uploader circular preview block */}
                      {uploadedBase64 && (
                        <div className="flex items-center gap-3 bg-amber-50/20 border border-amber-500/10 rounded-xl p-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={uploadedBase64}
                            alt="Selected preview"
                            className="h-12 w-16 object-cover rounded-lg border border-slate-200"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="block text-[11px] font-bold text-slate-800 truncate">Image Loaded Successfully</span>
                            <span className="block text-[9px] text-slate-400">Converted completely inline for Firestore</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setUploadedBase64("")}
                            className="text-xs font-bold text-rose-500 hover:text-rose-600 px-2 py-1 bg-white hover:bg-rose-50 rounded-lg border border-slate-100 transition-all"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      type="url"
                      name="photoUrl"
                      id="photoUrl"
                      placeholder="e.g. https://images.unsplash.com/..."
                      value={formData.photoUrl}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-sans"
                    />
                  )}
                </div>

                <div>
                  <label htmlFor="musicUrl" className="block text-sm font-semibold text-slate-700">
                    Background Audio MP3 Link / URL
                  </label>
                  <input
                    type="url"
                    name="musicUrl"
                    id="musicUrl"
                    placeholder="https://www.soundhelix.com/..."
                    value={formData.musicUrl}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-sans"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="coupleEmail" className="block text-sm font-semibold text-slate-700">
                    Couple&apos;s Contact Email
                  </label>
                  <input
                    type="email"
                    name="coupleEmail"
                    id="coupleEmail"
                    placeholder="e.g. couple@example.com"
                    value={formData.coupleEmail}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-sans"
                  />
                  <p className="mt-1 text-xs text-slate-400 font-sans">
                    Display an email address on the invitation so guests can contact you.
                  </p>
                </div>

                {/* Customizable Top Headers (Bismillah / Blessing Lines) */}
                <div>
                  <label htmlFor="headerArabic" className="block text-sm font-semibold text-slate-700">
                    Arabic Header Text (Customizable)
                  </label>
                  <input
                    type="text"
                    name="headerArabic"
                    id="headerArabic"
                    placeholder="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
                    value={formData.headerArabic}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-sans text-right"
                    dir="rtl"
                  />
                  <p className="mt-1 text-[10px] text-slate-400 font-sans">
                    Displays at the very top of your card. Keep blank to use default Bismillah.
                  </p>
                </div>

                <div>
                  <label htmlFor="headerGrace" className="block text-sm font-semibold text-slate-700">
                    Sub-Header Blessing Text (Customizable)
                  </label>
                  <input
                    type="text"
                    name="headerGrace"
                    id="headerGrace"
                    placeholder="Under the Grace of Almighty Allah"
                    value={formData.headerGrace}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-sans"
                  />
                  <p className="mt-1 text-[10px] text-slate-400 font-sans">
                    Displays directly under the top Arabic header text.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Main Venue Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 font-sans">
                2. Main Reception / Venue
              </h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="venueName" className="block text-sm font-semibold text-slate-700">
                    Main Venue Name *
                  </label>
                  <input
                    type="text"
                    name="venueName"
                    id="venueName"
                    required
                    placeholder="e.g. The Emerald Gardens"
                    value={formData.venueName}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-sans"
                  />
                </div>

                <div>
                  <label htmlFor="venueAddress" className="block text-sm font-semibold text-slate-700">
                    Main Venue Address *
                  </label>
                  <input
                    type="text"
                    name="venueAddress"
                    id="venueAddress"
                    required
                    placeholder="e.g. 786 Gold Boulevard, Houston, TX"
                    value={formData.venueAddress}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-sans"
                  />
                </div>
              </div>

              {/* Direct Google Maps Link (optional, overrides auto-generated search URL) */}
              <div>
                <label htmlFor="venueMapUrl" className="block text-sm font-semibold text-slate-700">
                  Google Maps Direct Link{" "}
                  <span className="text-slate-400 font-normal">(Optional — paste your exact pin link)</span>
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-lg">📍</span>
                  <input
                    type="url"
                    name="venueMapUrl"
                    id="venueMapUrl"
                    placeholder="https://maps.app.goo.gl/... or https://www.google.com/maps/place/..."
                    value={formData.venueMapUrl}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-sans"
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-400 font-sans">
                  If left empty, a Maps search link will be auto-generated from the venue name &amp; address above.
                </p>
              </div>
            </div>

            {/* Section 3: Dynamic Schedule Timeline */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-lg font-bold text-slate-800 font-sans">
                  3. Wedding Timeline (Functions & Schedules)
                </h3>
                <button
                  type="button"
                  onClick={addEvent}
                  className="px-3 py-1.5 border border-amber-500/40 text-amber-600 rounded-lg text-xs font-bold hover:bg-amber-50 transition-colors uppercase font-sans"
                >
                  ➕ Add Function
                </button>
              </div>

              <div className="space-y-4">
                {schedule.map((event, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-50/60 border border-slate-200 relative grid grid-cols-1 sm:grid-cols-4 gap-4 items-end"
                  >
                    {/* Remove event button */}
                    {schedule.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEvent(idx)}
                        className="absolute top-2 right-2 h-6 w-6 text-rose-500 hover:bg-rose-50 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                        title="Remove Function"
                      >
                        ✕
                      </button>
                    )}

                    {/* Function Name */}
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-semibold text-slate-600 mb-1 font-sans">
                        Function Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="e.g. Mehndi, Nikkah, Walima"
                        value={event.name}
                        onChange={(e) => handleEventChange(idx, e)}
                        className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-amber-500 transition-all font-sans"
                      />
                    </div>

                    {/* Function Date/Time */}
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-semibold text-slate-600 mb-1 font-sans">
                        Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        name="time"
                        required
                        value={event.time}
                        onChange={(e) => handleEventChange(idx, e)}
                        className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-amber-500 transition-all font-sans"
                      />
                    </div>

                    {/* Function Specific Venue */}
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-semibold text-slate-600 mb-1 font-sans">
                        Ceremony Venue *
                      </label>
                      <input
                        type="text"
                        name="venue"
                        required
                        placeholder="e.g. Orchard Ballroom"
                        value={event.venue || ""}
                        onChange={(e) => handleEventChange(idx, e)}
                        className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-amber-500 transition-all font-sans"
                      />
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-semibold text-slate-600 mb-1 font-sans">
                        Description / Note
                      </label>
                      <input
                        type="text"
                        name="description"
                        placeholder="e.g. dinner starts at 7:30"
                        value={event.description}
                        onChange={(e) => handleEventChange(idx, e)}
                        className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-amber-500 transition-all font-sans"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Design Template & Slug URL */}
            <div className="space-y-6 pt-4 border-t border-slate-100">
              
              {/* Template Selection Panel */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 font-sans">
                  4. Choose Visual Template
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Option 1: Emerald Noir */}
                  <div className={`border-2 rounded-xl overflow-hidden transition-all ${
                    formData.templateId === "emerald-noir"
                      ? "border-amber-500"
                      : "border-slate-200 hover:border-slate-300"
                  }`}>
                    {/* Template preview thumbnail */}
                    <div className="h-28 bg-[#001C12] flex flex-col items-center justify-center gap-1.5 relative">
                      <div className="absolute inset-2 border border-[#C5A880]/20 rounded-lg pointer-events-none"></div>
                      <span className="text-[#C5A880] font-serif text-lg">A &amp; B</span>
                      <span className="text-[#C5A880]/60 text-[8px] uppercase tracking-widest font-sans">Emerald Noir</span>
                      <a
                        href="/templates/preview/emerald-noir"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="mt-1 px-3 py-1 border border-[#C5A880]/40 text-[#C5A880] text-[9px] uppercase tracking-widest rounded-full hover:bg-[#C5A880]/10 transition-all font-sans"
                      >
                        Open Demo ↗
                      </a>
                    </div>
                    {/* Selection row */}
                    <label className="flex items-center justify-between px-4 py-3 cursor-pointer bg-white">
                      <div>
                        <span className="block text-sm font-bold text-slate-800">Emerald Noir</span>
                        <span className="block text-xs text-slate-500">Luxury gold &amp; deep green</span>
                      </div>
                      <input
                        type="radio"
                        name="templateId"
                        value="emerald-noir"
                        checked={formData.templateId === "emerald-noir"}
                        onChange={handleChange}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer"
                      />
                    </label>
                  </div>

                  {/* Option 2: Ivory Classic */}
                  <div className={`border-2 rounded-xl overflow-hidden transition-all ${
                    formData.templateId === "ivory-classic"
                      ? "border-amber-500"
                      : "border-slate-200 hover:border-slate-300"
                  }`}>
                    {/* Template preview thumbnail */}
                    <div className="h-28 bg-[#F5F3EB] flex flex-col items-center justify-center gap-1.5 relative border-b border-slate-100">
                      <div className="absolute inset-2 border border-[#C5A880]/25 rounded-lg pointer-events-none"></div>
                      <span className="text-slate-700 font-serif text-lg">A &amp; B</span>
                      <span className="text-[#C5A880] text-[8px] uppercase tracking-widest font-sans">Ivory Classic</span>
                      <a
                        href="/templates/preview/ivory-classic"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="mt-1 px-3 py-1 border border-[#C5A880]/50 text-amber-700 text-[9px] uppercase tracking-widest rounded-full hover:bg-amber-50 transition-all font-sans"
                      >
                        Open Demo ↗
                      </a>
                    </div>
                    {/* Selection row */}
                    <label className="flex items-center justify-between px-4 py-3 cursor-pointer bg-white">
                      <div>
                        <span className="block text-sm font-bold text-slate-800">Ivory Classic</span>
                        <span className="block text-xs text-slate-500">Luxury cream &amp; rose gold</span>
                      </div>
                      <input
                        type="radio"
                        name="templateId"
                        value="ivory-classic"
                        checked={formData.templateId === "ivory-classic"}
                        onChange={handleChange}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer"
                      />
                    </label>
                  </div>

                </div>
              </div>

              {/* URL custom slug */}
              <div>
                <label htmlFor="slug" className="block text-sm font-semibold text-slate-700">
                  Custom Invitation Link (Slug) *
                </label>
                <div className="mt-1 flex rounded-xl shadow-sm">
                  <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-sm select-none font-mono">
                    taabir.com/invite/
                  </span>
                  <input
                    type="text"
                    name="slug"
                    id="slug"
                    required
                    placeholder="sarah-and-michael"
                    value={formData.slug}
                    onChange={handleSlugChange}
                    className="block w-full min-w-0 flex-1 px-4 py-3 border border-slate-200 rounded-r-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-sans"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Only lowercase letters, numbers, and single hyphens are allowed. Space will be cleared.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || success}
                className="w-full flex items-center justify-center px-6 py-3.5 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 uppercase tracking-widest font-sans"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Validating and Saving...
                  </>
                ) : success ? (
                  "Saved Successfully!"
                ) : (
                  "Generate Digital Invitation"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Flynx branding in footer */}
        <div className="mt-12 text-center text-[10px] text-slate-400 uppercase tracking-[0.25em] font-sans">
          Powered by Flynx
        </div>
      </div>
    </div>
  );
}
