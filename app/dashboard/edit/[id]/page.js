"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { db } from "../../../../lib/firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function EditInvitationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  // Form State
  const [formData, setFormData] = useState({
    eventType: "wedding", // Loaded from document
    brideName: "",
    brideParentsName: "",
    groomName: "",
    groomParentsName: "",
    coupleEmail: "",
    headerArabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    headerGrace: "Under the Grace of Almighty Allah",
    weddingDate: "",
    venueName: "",
    venueAddress: "",
    venueMapUrl: "",
    slug: "",
    musicUrl: "",
    templateId: "emerald-noir",
    btnBgColor: "#D4AF37", // Default gold
    btnTextColor: "#FFFFFF",
    doorAnimation: "sliding-doors",
    enableScratchCard: false,
    enableLanguageSwitcher: false,
    customNote: "",
    notePosition: "bottom",
  });

  // Dynamic Timeline State
  const [schedule, setSchedule] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [previewingAnim, setPreviewingAnim] = useState(false);

  // Action states
  const [fetchingData, setFetchingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [originalSlug, setOriginalSlug] = useState("");

  // Redirect protection
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Fetch existing invitation details
  useEffect(() => {
    const loadInvitation = async () => {
      if (!user || !id) return;
      try {
        const docRef = doc(db, "invitations", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError("Invitation not found. It may have been deleted.");
          setFetchingData(false);
          return;
        }

        const data = docSnap.data();

        if (data.userId !== user.uid) {
          setError("You do not have permission to edit this invitation.");
          setFetchingData(false);
          return;
        }

        // Convert ISO weddingDate to local datetime-local format YYYY-MM-DDThh:mm
        let localDate = "";
        if (data.weddingDate) {
          const dateObj = new Date(data.weddingDate);
          const tzOffset = dateObj.getTimezoneOffset() * 60000;
          localDate = new Date(dateObj.getTime() - tzOffset).toISOString().slice(0, 16);
        }

        setFormData({
          eventType: data.eventType || "wedding",
          brideName: data.brideName || "",
          brideParentsName: data.brideParentsName || "",
          groomName: data.groomName || "",
          groomParentsName: data.groomParentsName || "",
          coupleEmail: data.coupleEmail || "",
          headerArabic: data.headerArabic || "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
          headerGrace: data.headerGrace || "Under the Grace of Almighty Allah",
          weddingDate: localDate,
          venueName: data.venue?.name || "",
          venueAddress: data.venue?.address || "",
          venueMapUrl: data.venue?.googleMapsUrl || "",
          slug: data.slug || "",
          musicUrl: data.musicUrl || "",
          templateId: data.theme?.templateId || "emerald-noir",
          btnBgColor: data.styling?.btnBgColor || "#D4AF37",
          btnTextColor: data.styling?.btnTextColor || "#FFFFFF",
          doorAnimation: data.styling?.doorAnimation || "sliding-doors",
          enableScratchCard: !!data.styling?.enableScratchCard,
          enableLanguageSwitcher: !!data.styling?.enableLanguageSwitcher,
          customNote: data.styling?.customNote || "",
          notePosition: data.styling?.notePosition || "bottom",
        });

        setOriginalSlug(data.slug || "");
        setPhotos(data.photos || (data.photoUrl ? [data.photoUrl] : []));

        if (data.details?.schedule) {
          const formattedSchedule = data.details.schedule.map((ev) => {
            let eventLocalDate = "";
            if (ev.time) {
              const eventDateObj = new Date(ev.time);
              const eventTzOffset = eventDateObj.getTimezoneOffset() * 60000;
              eventLocalDate = new Date(eventDateObj.getTime() - eventTzOffset).toISOString().slice(0, 16);
            }
            return {
              name: ev.name || "",
              time: eventLocalDate,
              venue: ev.venue || "",
              description: ev.description || "",
            };
          });
          setSchedule(formattedSchedule);
        } else {
          setSchedule([]);
        }

      } catch (err) {
        console.error("Error fetching invitation details:", err);
        setError("Failed to load invitation data. Please check your connection.");
      } finally {
        setFetchingData(false);
      }
    };

    if (user && id) {
      loadInvitation();
    }
  }, [user, id]);

  // Handle standard input updates
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Auto trigger animation preview if user changes the door transition
    if (name === "doorAnimation") {
      setPreviewingAnim(true);
      setTimeout(() => setPreviewingAnim(false), 2200);
    }
  };

  // Seeding default timelines and texts on type change in Edit
  const handleEventTypeChange = (newType) => {
    setFormData((prev) => ({
      ...prev,
      eventType: newType,
      headerArabic: newType === "wedding" ? "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" : "✨ A Special Celebration ✨",
      headerGrace: newType === "wedding" 
        ? "Under the Grace of Almighty Allah" 
        : newType === "birthday"
        ? "You are cordially invited to celebrate with us!"
        : newType === "anniversary"
        ? "Celebrating years of love, dedication, and memories"
        : "Join us for a wonderful gathering of family and friends",
    }));

    if (newType === "wedding") {
      setSchedule([
        { name: "Mehndi / Henna", time: "", venue: "Orchard Grand Ballroom", description: "Ceremony & dinner is served." },
        { name: "Baraat / Vows", time: "", venue: "Royal Palms Gardens", description: "Exchange of rings & wedding feast." }
      ]);
    } else if (newType === "birthday") {
      setSchedule([
        { name: "Guest Arrival", time: "", venue: "Celebration Suite", description: "Welcome drinks & greetings." },
        { name: "Cake Cutting", time: "", venue: "Celebration Suite", description: "Cake cutting & birthday song." },
        { name: "Dinner Banquet", time: "", venue: "Dining Area", description: "Delicious dinner served." }
      ]);
    } else if (newType === "anniversary") {
      setSchedule([
        { name: "Welcome Reception", time: "", venue: "Royal Banquet Hall", description: "Cocktails & appetizers." },
        { name: "Toast & Memories", time: "", venue: "Royal Banquet Hall", description: "Sharing milestones & speeches." },
        { name: "Gala Dinner", time: "", venue: "Dining Area", description: "Exquisite culinary feast served." }
      ]);
    } else {
      setSchedule([
        { name: "Welcome Assembly", time: "", venue: "Main Ballroom", description: "Greetings & socializing." },
        { name: "Dinner & Celebration", time: "", venue: "Main Ballroom", description: "Dinner feast served." }
      ]);
    }
  };

  // Compress uploaded images
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

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

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75);
        setPhotos((prev) => [...prev, compressedBase64]);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = ""; 
  };

  const addPhotoUrl = (url) => {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      setError("Please enter a valid URL starting with http:// or https://");
      return;
    }
    setPhotos((prev) => [...prev, url]);
    setError("");
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSlugChange = (e) => {
    const value = e.target.value;
    const sanitizedSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-");
    
    setFormData((prev) => ({
      ...prev,
      slug: sanitizedSlug,
    }));
  };

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
      eventType,
      brideName, 
      brideParentsName, 
      groomName, 
      groomParentsName, 
      weddingDate, 
      venueName, 
      venueAddress, 
      slug, 
      musicUrl,
      templateId 
    } = formData;

    const isCoupleEvent = eventType === "wedding" || eventType === "anniversary";

    if (!brideName || (isCoupleEvent && !groomName) || !weddingDate || !venueName || !venueAddress || !slug) {
      setError(
        isCoupleEvent 
          ? "Please fill out all mandatory core fields (both couple names are required)." 
          : "Please fill out all mandatory core fields (Name, Date, Venue Name, Address and Link Slug are required)."
      );
      setIsSubmitting(false);
      return;
    }

    if (slug.length < 3) {
      setError("The URL slug must be at least 3 characters long.");
      setIsSubmitting(false);
      return;
    }

    const hasEmptyEvent = schedule.some(event => !event.name || !event.time);
    if (hasEmptyEvent) {
      setError("Please provide a name and time/date for all timeline sub-events.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (slug.trim() !== originalSlug) {
        const invitationsRef = collection(db, "invitations");
        const slugQuery = query(invitationsRef, where("slug", "==", slug.trim()));
        const querySnapshot = await getDocs(slugQuery);

        if (!querySnapshot.empty) {
          setError("This custom URL slug is already taken. Please try another one.");
          setIsSubmitting(false);
          return;
        }
      }

      const mapSearchQuery = `${venueName.trim()} ${venueAddress.trim()}`;
      const autoMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapSearchQuery)}`;
      const googleMapsUrl = formData.venueMapUrl.trim() || autoMapsUrl;

      const fallbackPhoto = "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000";

      // 2. Prepare payload
      const invitationPayload = {
        eventType: eventType || "wedding",
        slug: slug.trim(),
        brideName: brideName.trim(),
        brideParentsName: brideParentsName.trim(),
        groomName: groomName ? groomName.trim() : "",
        groomParentsName: groomParentsName ? groomParentsName.trim() : "",
        weddingDate: new Date(weddingDate).toISOString(),
        venue: {
          name: venueName.trim(),
          address: venueAddress.trim(),
          googleMapsUrl,
        },
        photoUrl: photos[0] || fallbackPhoto,
        photos: photos.length > 0 ? photos : [fallbackPhoto],
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
        styling: {
          btnBgColor: formData.btnBgColor || "#D4AF37",
          btnTextColor: formData.btnTextColor || "#FFFFFF",
          doorAnimation: formData.doorAnimation || "sliding-doors",
          enableScratchCard: !!formData.enableScratchCard,
          enableLanguageSwitcher: !!formData.enableLanguageSwitcher,
          customNote: formData.customNote.trim(),
          notePosition: formData.notePosition || "bottom",
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
        updatedAt: new Date().toISOString(),
      };

      // 3. Update Firestore Document
      await updateDoc(doc(db, "invitations", id), invitationPayload);

      setSuccess(true);
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);

    } catch (err) {
      console.error("Firestore database update error:", err);
      setError(`Failed to update invitation: ${err.message || "Please check your network."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || fetchingData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
          <p className="text-slate-500 font-medium">Loading invitation details...</p>
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
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
              Edit Invitation Details
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Modify your event parameters below. All adjustments apply to your web links instantly.
            </p>
          </div>
          <Link 
            href="/dashboard" 
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
          >
            ← Back to Panel
          </Link>
        </div>

        {/* Form Card */}
        <div className="bg-white shadow-xl rounded-2xl border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200"></div>

          {/* Success Notification Alert */}
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 animate-pulse font-sans">
              <svg className="h-5 w-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <strong className="font-semibold">Update Successful!</strong> Applying database commits... Redirecting to panel.
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
            
            {/* Section 0: Select Invitation Type */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 font-sans">
                Change Invitation Category
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { id: "wedding", label: "✉️ Wedding", desc: "Nikah/Vows" },
                  { id: "birthday", label: "🎂 Birthday", desc: "Party/Blowout" },
                  { id: "anniversary", label: "💑 Anniversary", desc: "Love Milestone" },
                  { id: "family_function", label: "🏡 Family", desc: "Dinner/Assembly" },
                  { id: "general_party", label: "✨ General Party", desc: "Celebrations" }
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleEventTypeChange(type.id)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      (formData.eventType || "wedding") === type.id
                        ? "border-amber-500 bg-amber-50/20 text-slate-900"
                        : "border-slate-100 hover:border-slate-200 text-slate-500 bg-slate-50/20"
                    }`}
                  >
                    <span className="block text-2xl mb-1">{type.label.split(" ")[0]}</span>
                    <span className="block text-xs font-bold whitespace-nowrap">{type.label.split(" ").slice(1).join(" ")}</span>
                    <span className="block text-[9px] text-slate-400 font-medium mt-0.5">{type.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section 1: Core Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 font-sans">
                1. Core Celebration Coordinates
              </h3>
              
              <div className="space-y-6">
                
                {/* Primary Person / Host 1 */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <label htmlFor="brideName" className="block text-sm font-semibold text-slate-700">
                      {formData.eventType === "wedding"
                        ? "Bride's First Name *"
                        : formData.eventType === "birthday"
                        ? "Birthday Person's Name *"
                        : formData.eventType === "anniversary"
                        ? "Wife's First Name *"
                        : formData.eventType === "family_function"
                        ? "Main Host / Family Name *"
                        : "Host Name *"}
                    </label>
                    <input
                      type="text"
                      name="brideName"
                      id="brideName"
                      required
                      placeholder="e.g. Faisal"
                      value={formData.brideName}
                      onChange={handleChange}
                      className="mt-1 block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-sans"
                    />
                  </div>

                  <div>
                    <label htmlFor="brideParentsName" className="block text-sm font-semibold text-slate-700">
                      {formData.eventType === "wedding"
                        ? "Bride's Parents/Guardians Name"
                        : formData.eventType === "birthday"
                        ? "Age / Turning (e.g. Turning 5, Turning 25) (Optional)"
                        : formData.eventType === "anniversary"
                        ? "Wife's Parents (Optional)"
                        : "Special Note / Lineage (Optional)"}
                    </label>
                    <input
                      type="text"
                      name="brideParentsName"
                      id="brideParentsName"
                      placeholder={formData.eventType === "birthday" ? "e.g. Turning 25" : "e.g. Mr. & Mrs. Ahmed"}
                      value={formData.brideParentsName}
                      onChange={handleChange}
                      className="mt-1 block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-sans"
                    />
                  </div>
                </div>

                {/* Secondary Person / Partner / Host 2 (Optional for non-couples) */}
                {((formData.eventType || "wedding") === "wedding" ||
                  (formData.eventType || "wedding") === "anniversary" ||
                  (formData.eventType || "wedding") === "family_function" ||
                  (formData.eventType || "wedding") === "general_party") && (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <div>
                      <label htmlFor="groomName" className="block text-sm font-semibold text-slate-700">
                        {formData.eventType === "wedding"
                          ? "Groom's First Name *"
                          : formData.eventType === "anniversary"
                          ? "Husband's First Name *"
                          : "Co-Host Name (Optional)"}
                      </label>
                      <input
                        type="text"
                        name="groomName"
                        id="groomName"
                        required={formData.eventType === "wedding" || formData.eventType === "anniversary"}
                        placeholder="e.g. Michael"
                        value={formData.groomName}
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-sans"
                      />
                    </div>

                    <div>
                      <label htmlFor="groomParentsName" className="block text-sm font-semibold text-slate-700">
                        {formData.eventType === "wedding"
                          ? "Groom's Parents/Guardians Name"
                          : formData.eventType === "anniversary"
                          ? "Husband's Parents (Optional)"
                          : "Co-Host Subtitle / Note (Optional)"}
                      </label>
                      <input
                        type="text"
                        name="groomParentsName"
                        id="groomParentsName"
                        placeholder="e.g. Mr. & Mrs. Imtiaz Khan"
                        value={formData.groomParentsName}
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-sans"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Event Target Countdown Date */}
              <div>
                <label htmlFor="weddingDate" className="block text-sm font-semibold text-slate-700">
                  {formData.eventType === "wedding"
                    ? "Wedding Date & Time * (For Live Countdown)"
                    : "Event Date & Time * (For Live Countdown)"}
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

              {/* Photos & Music */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-3 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                  <label className="block text-sm font-bold text-slate-800 font-sans">
                    Celebration Gallery Photos (Add 2 or more pictures) *
                  </label>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
                    {photos.map((pic, index) => (
                      <div key={index} className="relative group aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={pic} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-1.5 right-1.5 h-6 w-6 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-all z-20"
                        >
                          ✕
                        </button>
                        <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold text-white bg-slate-900/60 px-1.5 py-0.5 rounded font-mono z-20">
                          #{index + 1} {index === 0 ? "(Main Cover)" : ""}
                        </span>
                      </div>
                    ))}
                    
                    <div className="border-2 border-dashed border-slate-200 hover:border-amber-400/60 rounded-xl p-4 bg-white flex flex-col items-center justify-center min-h-[120px] relative text-center transition-all">
                      <span className="text-xl block mb-1">📸</span>
                      <span className="block text-xs font-bold text-slate-700">Add Picture</span>
                      
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="absolute inset-x-0 top-0 bottom-12 w-full opacity-0 cursor-pointer z-10"
                        title="Upload a photo"
                      />
                      <span className="block text-[10px] text-slate-400 mt-0.5 hover:text-slate-600 font-medium cursor-pointer">
                        📁 Choose File
                      </span>
                      
                      <div className="mt-2 w-full px-1 z-20 flex gap-1">
                        <input
                          type="url"
                          id="manualPhotoUrl"
                          placeholder="Or paste URL..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (e.target.value.trim()) {
                                addPhotoUrl(e.target.value.trim());
                                e.target.value = "";
                              }
                            }
                          }}
                          className="flex-1 min-w-0 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 font-sans"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById("manualPhotoUrl");
                            if (input && input.value.trim()) {
                              addPhotoUrl(input.value.trim());
                              input.value = "";
                            }
                          }}
                          className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold transition-all shrink-0"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="musicUrl" className="block text-sm font-semibold text-slate-700">
                    Ambient Background Music Track Link (MP3 URL)
                  </label>
                  <input
                    type="url"
                    name="musicUrl"
                    id="musicUrl"
                    placeholder="https://www.soundhelix.com/..."
                    value={formData.musicUrl}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-sans"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="coupleEmail" className="block text-sm font-semibold text-slate-700">
                    Host Contact Email
                  </label>
                  <input
                    type="email"
                    name="coupleEmail"
                    id="coupleEmail"
                    placeholder="e.g. host@example.com"
                    value={formData.coupleEmail}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-sans"
                  />
                </div>

                {/* Customizable Arabic Calligraphy / Grace Blessing Subtext */}
                <div>
                  <label htmlFor="headerArabic" className="block text-sm font-semibold text-slate-700">
                    Calligraphy Header Text (Customizable)
                  </label>
                  <input
                    type="text"
                    name="headerArabic"
                    id="headerArabic"
                    value={formData.headerArabic}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-sans text-right"
                    dir="rtl"
                  />
                </div>

                <div>
                  <label htmlFor="headerGrace" className="block text-sm font-semibold text-slate-700">
                    Blessing Sub-Header Text (Customizable)
                  </label>
                  <input
                    type="text"
                    name="headerGrace"
                    id="headerGrace"
                    value={formData.headerGrace}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Reception Venue */}
            <div className="space-y-4 border-t border-slate-100 pt-6">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 font-sans">
                2. Celebration Venue Details
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
                    value={formData.venueName}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-sans"
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
                    value={formData.venueAddress}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-sans"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="venueMapUrl" className="block text-sm font-semibold text-slate-700">
                  Google Maps Pin Link (Optional)
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-lg">📍</span>
                  <input
                    type="url"
                    name="venueMapUrl"
                    id="venueMapUrl"
                    value={formData.venueMapUrl}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Dynamic Schedule Timeline */}
            <div className="space-y-4 border-t border-slate-100 pt-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-lg font-bold text-slate-800 font-sans">
                  3. Celebration Schedule Timeline
                </h3>
                <button
                  type="button"
                  onClick={addEvent}
                  className="px-3 py-1.5 border border-amber-500/40 text-amber-600 rounded-lg text-xs font-bold hover:bg-amber-50 transition-colors uppercase font-sans"
                >
                  ➕ Add Event
                </button>
              </div>

              <div className="space-y-4">
                {schedule.map((event, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-50/60 border border-slate-200 relative grid grid-cols-1 sm:grid-cols-4 gap-4 items-end"
                  >
                    {schedule.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEvent(idx)}
                        className="absolute top-2 right-2 h-6 w-6 text-rose-500 hover:bg-rose-50 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                      >
                        ✕
                      </button>
                    )}

                    <div className="sm:col-span-1">
                      <label className="block text-xs font-semibold text-slate-600 mb-1 font-sans">
                        Event Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={event.name}
                        onChange={(e) => handleEventChange(idx, e)}
                        className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-amber-500 transition-all font-sans"
                      />
                    </div>

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

                    <div className="sm:col-span-1">
                      <label className="block text-xs font-semibold text-slate-600 mb-1 font-sans">
                        Ceremony Venue *
                      </label>
                      <input
                        type="text"
                        name="venue"
                        required
                        value={event.venue || ""}
                        onChange={(e) => handleEventChange(idx, e)}
                        className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-amber-500 transition-all font-sans"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-xs font-semibold text-slate-600 mb-1 font-sans">
                        Description / Note
                      </label>
                      <input
                        type="text"
                        name="description"
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
            <div className="space-y-6 pt-6 border-t border-slate-100">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3 font-sans">
                  4. Choose Card Design Theme *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: "emerald-noir", label: "Emerald Noir", desc: "Luxury gold & deep green", color: "#001C12", textColor: "#C5A880", tag: "Classic" },
                    { id: "ivory-classic", label: "Ivory Classic", desc: "Elegant cream & royal gold", color: "#F5F3EB", textColor: "#705832", tag: "Classic" },
                    { id: "midnight-royal", label: "Midnight Royal", desc: "Luxury starry navy with double-door parting", color: "#0A192F", textColor: "#D4AF37", tag: "Premium Interactive" },
                    { id: "ivory-elegance", label: "Ivory Elegance", desc: "Warm white card with parting velvet curtains", color: "#FAF9F5", textColor: "#800020", tag: "Premium Interactive" }
                  ].map((tpl) => (
                    <div key={tpl.id} className={`border-2 rounded-2xl overflow-hidden transition-all relative ${
                      formData.templateId === tpl.id ? "border-amber-500 shadow-md" : "border-slate-200 hover:border-slate-300"
                    }`}>
                      <div style={{ background: tpl.color }} className="h-24 flex flex-col items-center justify-center gap-1 relative overflow-hidden">
                        <div className="absolute top-2 right-2 text-[8px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">
                          {tpl.tag}
                        </div>
                        <span style={{ color: tpl.textColor }} className="font-serif text-base font-bold">
                          {formData.brideName ? formData.brideName[0] : "T"}
                          {formData.groomName ? ` & ${formData.groomName[0]}` : ""}
                        </span>
                        <span style={{ color: `${tpl.textColor}cc` }} className="text-[8px] uppercase tracking-widest font-sans font-semibold">
                          {tpl.label}
                        </span>
                      </div>
                      <label className="flex items-center justify-between px-3 py-2.5 cursor-pointer bg-white">
                        <div className="min-w-0 pr-2">
                          <span className="block text-xs font-bold text-slate-800 truncate">{tpl.label}</span>
                          <span className="block text-[10px] text-slate-500 truncate">{tpl.desc}</span>
                        </div>
                        <input
                          type="radio"
                          name="templateId"
                          value={tpl.id}
                          checked={formData.templateId === tpl.id}
                          onChange={(e) => {
                            handleChange(e);
                            // Auto align default animations to matching templates
                            if (tpl.id === "midnight-royal") {
                              setFormData(prev => ({ ...prev, doorAnimation: "sliding-doors", btnBgColor: "#D4AF37", btnTextColor: "#FFFFFF" }));
                            } else if (tpl.id === "ivory-elegance") {
                              setFormData(prev => ({ ...prev, doorAnimation: "velvet-curtains", btnBgColor: "#800020", btnTextColor: "#FFFFFF" }));
                            }
                            // Auto trigger animation preview
                            setPreviewingAnim(true);
                            setTimeout(() => setPreviewingAnim(false), 2200);
                          }}
                          className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer shrink-0"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slug URL */}
              <div>
                <label htmlFor="slug" className="block text-sm font-semibold text-slate-700 font-sans">
                  Custom Card Web URL Slug *
                </label>
                <div className="mt-1 flex rounded-xl shadow-sm border border-slate-200 overflow-hidden bg-slate-50/50">
                  <span className="inline-flex items-center px-4 bg-slate-100 border-r border-slate-200 text-slate-500 text-xs font-mono">
                    invite/
                  </span>
                  <input
                    type="text"
                    name="slug"
                    id="slug"
                    required
                    value={formData.slug}
                    onChange={handleSlugChange}
                    className="flex-1 block w-full px-4 py-3 bg-white text-slate-900 focus:outline-none text-sm font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Premium Custom Styling & Effects */}
            <div className="space-y-6 pt-6 border-t border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-800 font-sans flex items-center gap-2">
                  <span>✨</span> 5. Premium Interactive Styling & Effects
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Fine-tune interactive page-opening animations, button colors, and guest experience tools.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Customizer fields */}
                <div className="space-y-5">
                  {/* Button Background Color */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Opening Button Theme Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        name="btnBgColor"
                        value={formData.btnBgColor}
                        onChange={handleChange}
                        className="h-9 w-9 border border-slate-200 rounded-lg cursor-pointer bg-white"
                      />
                      <div className="flex gap-1.5">
                        {[
                          { name: "Gold", hex: "#D4AF37" },
                          { name: "Maroon", hex: "#800020" },
                          { name: "Navy", hex: "#0A192F" },
                          { name: "Emerald", hex: "#022E1F" },
                          { name: "Charcoal", hex: "#111111" }
                        ].map((swatch) => (
                          <button
                            key={swatch.hex}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, btnBgColor: swatch.hex }))}
                            className="h-6 px-2 text-[9px] font-bold rounded border border-slate-200 hover:border-slate-400 transition-colors uppercase"
                            style={{ backgroundColor: swatch.hex, color: swatch.hex === "#FAF9F5" ? "#000" : "#fff" }}
                            title={swatch.name}
                          >
                            {swatch.name[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Button Text Color */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Opening Button Text Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        name="btnTextColor"
                        value={formData.btnTextColor}
                        onChange={handleChange}
                        className="h-9 w-9 border border-slate-200 rounded-lg cursor-pointer bg-white"
                      />
                      <div className="flex gap-1.5">
                        {[
                          { name: "White", hex: "#FFFFFF" },
                          { name: "Gold", hex: "#D4AF37" },
                          { name: "Charcoal", hex: "#1E293B" }
                        ].map((swatch) => (
                          <button
                            key={swatch.hex}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, btnTextColor: swatch.hex }))}
                            className="h-6 px-2 text-[9px] font-bold rounded border border-slate-200 hover:border-slate-400 bg-slate-50 text-slate-800 transition-colors uppercase"
                          >
                            {swatch.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Door Animation Choice */}
                  <div>
                    <label htmlFor="doorAnimation" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Opening Card Transition Style
                    </label>
                    <select
                      name="doorAnimation"
                      id="doorAnimation"
                      value={formData.doorAnimation}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-sans"
                    >
                      <option value="sliding-doors">🌌 Starry sliding doors parting</option>
                      <option value="velvet-curtains">🎭 Theatrical velvet curtains parting</option>
                      <option value="book-flip">📖 Premium 3D page flip / Book open</option>
                      <option value="fade-zoom">✨ Clean scale-up & fade transition</option>
                    </select>
                  </div>

                  {/* Interactivity features */}
                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="enableScratchCard"
                        checked={formData.enableScratchCard}
                        onChange={(e) => setFormData(prev => ({ ...prev, enableScratchCard: e.target.checked }))}
                        className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 mt-0.5"
                      />
                      <div>
                        <span className="block text-xs font-bold text-slate-800">
                          🎫 Enable Scratch-to-Reveal Date Card
                        </span>
                        <span className="block text-[10px] text-slate-500">
                          Guests drag or wipe on a golden canvas layer to reveal event dates! Triggers instant colorful confetti.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="enableLanguageSwitcher"
                        checked={formData.enableLanguageSwitcher}
                        onChange={(e) => setFormData(prev => ({ ...prev, enableLanguageSwitcher: e.target.checked }))}
                        className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 mt-0.5"
                      />
                      <div>
                        <span className="block text-xs font-bold text-slate-800">
                          🗣️ Enable Multilingual Switcher (English / Urdu / Hindi)
                        </span>
                        <span className="block text-[10px] text-slate-500">
                          Adds a gorgeous floating translation toggle to switch the invitation completely between English, Urdu Nastaliq, and Hindi Devanagari scripts dynamically.
                        </span>
                      </div>
                    </label>

                    {/* Custom note form controls */}
                    <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
                      <div>
                        <label htmlFor="customNote" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Custom Invitation Note / Announcement
                        </label>
                        <span className="block text-[10px] text-slate-400 mb-2">
                          Add a custom announcement, e.g. "Note: No boxed gifts please" or RSVP note.
                        </span>
                        <textarea
                          id="customNote"
                          name="customNote"
                          value={formData.customNote}
                          onChange={handleChange}
                          placeholder="e.g. Please join us for dinner after the ceremony. No boxed gifts please!"
                          rows={2}
                          className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Note Box Position
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-sans">
                            <input
                              type="radio"
                              name="notePosition"
                              value="middle"
                              checked={formData.notePosition === "middle"}
                              onChange={handleChange}
                              className="text-amber-600 focus:ring-amber-500"
                            />
                            <span>Middle (Under Quotes)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-sans">
                            <input
                              type="radio"
                              name="notePosition"
                              value="bottom"
                              checked={formData.notePosition === "bottom"}
                              onChange={handleChange}
                              className="text-amber-600 focus:ring-amber-500"
                            />
                            <span>Bottom (Above Footer)</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated Phone Mockup Live Preview */}
                <div className="flex flex-col items-center bg-slate-50 border border-slate-200 rounded-2xl p-4 relative">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
                    📱 Live Animation preview
                  </span>

                  <div className="w-56 h-80 rounded-2xl border-4 border-slate-800 bg-white relative overflow-hidden shadow-inner flex flex-col justify-center items-center">
                    {/* Simulated Background corresponding to Template */}
                    <div 
                      className={`absolute inset-0 transition-colors duration-300 flex flex-col items-center justify-center p-3 text-center`}
                      style={{ 
                        background: formData.templateId === "emerald-noir" ? "#001C12" :
                                    formData.templateId === "ivory-classic" ? "#F5F3EB" :
                                    formData.templateId === "midnight-royal" ? "#0A192F" : "#FAF9F5"
                      }}
                    >
                      <span 
                        className="font-serif text-[10px] font-bold block tracking-wider uppercase mb-1"
                        style={{ 
                          color: formData.templateId === "emerald-noir" ? "#C5A880" :
                                 formData.templateId === "ivory-classic" ? "#705832" :
                                 formData.templateId === "midnight-royal" ? "#D4AF37" : "#800020"
                        }}
                      >
                        {formData.brideName ? formData.brideName[0] : "T"}{formData.groomName ? ` & ${formData.groomName[0]}` : ""}
                      </span>
                      <span className="text-[8px] text-slate-500 block">Invitation Card revealed!</span>
                    </div>

                    {/* Animated Cover overlay */}
                    <div 
                      className={`absolute inset-0 bg-slate-900 transition-all duration-700 ease-in-out flex items-center justify-center z-10`}
                      style={{
                        background: formData.templateId === "emerald-noir" ? "#012B1B" :
                                    formData.templateId === "ivory-classic" ? "#EAE6D9" :
                                    formData.templateId === "midnight-royal" ? "#071224" : "#FAF9F5",
                        opacity: previewingAnim && formData.doorAnimation === "fade-zoom" ? 0 : 1,
                        transform: !previewingAnim ? "none" : 
                                   formData.doorAnimation === "sliding-doors" ? "scaleX(0)" :
                                   formData.doorAnimation === "velvet-curtains" ? "translateY(-100%)" : 
                                   formData.doorAnimation === "book-flip" ? "perspective(600px) rotateY(-120deg)" : "scale(1.2)",
                        transformOrigin: formData.doorAnimation === "book-flip" ? "left center" : "center",
                        pointerEvents: previewingAnim ? "none" : "auto",
                      }}
                    >
                      {/* Star patterns for midnight-royal / ivory-elegance simulated curtains */}
                      {formData.templateId === "midnight-royal" && (
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-100/5 via-slate-900/40 to-slate-950/90 pointer-events-none"></div>
                      )}
                      {formData.doorAnimation === "velvet-curtains" && (
                        <div className="absolute inset-x-0 top-0 bottom-0 bg-red-950/20 border-r border-l border-red-900/40 pointer-events-none"></div>
                      )}

                      {/* Main button preview */}
                      <button
                        type="button"
                        style={{
                          backgroundColor: formData.btnBgColor,
                          color: formData.btnTextColor,
                        }}
                        className="px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-md transform hover:scale-105 transition-all animate-bounce"
                      >
                        Tap to Open
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPreviewingAnim(true);
                      setTimeout(() => setPreviewingAnim(false), 2500);
                    }}
                    disabled={previewingAnim}
                    className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold font-mono transition-colors tracking-wide disabled:opacity-50"
                  >
                    {previewingAnim ? "⚡ Open Playing..." : "⚡ Test Animation"}
                  </button>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-4">
              <Link
                href="/dashboard"
                className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all font-mono"
              >
                Cancel Changes
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-amber-400 disabled:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2 font-mono"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-950 border-t-transparent"></div>
                    Updating Card...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
