"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [invitations, setInvitations] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  // RSVP drawer/modal states
  const [selectedInvite, setSelectedInvite] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [fetchingRsvps, setFetchingRsvps] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState("");

  const copyToClipboard = (text, slug) => {
    navigator.clipboard.writeText(text);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(""), 2000);
  };

  // Dynamic domain/host detection
  const [host, setHost] = useState("localhost:3000");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHost(window.location.host);
    }
  }, []);

  // Redirect protection: Route unauthenticated users to Login
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Fetch host's invitations
  const fetchInvitations = async () => {
    if (!user) return;
    setFetching(true);
    try {
      const q = query(collection(db, "invitations"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const list = [];
      const currentDate = new Date();

      for (const d of querySnapshot.docs) {
        const data = d.data();
        if (data.weddingDate) {
          const weddingDate = new Date(data.weddingDate);
          const threeDaysAfterEvent = new Date(weddingDate.getTime() + 3 * 24 * 60 * 60 * 1000);

          if (currentDate > threeDaysAfterEvent) {
            // Auto-delete expired invitation and its guest RSVPs to keep Firestore storage perfectly clean
            try {
              const rsvpsRef = collection(db, "invitations", d.id, "rsvps");
              const rsvpsSnap = await getDocs(rsvpsRef);
              for (const rDoc of rsvpsSnap.docs) {
                await deleteDoc(rDoc.ref);
              }
              await deleteDoc(d.ref);
              console.log(`[Auto-Deleted Expired Dashboard] id: ${d.id} and its RSVPs`);
            } catch (delErr) {
              console.error("Dashboard failed to auto-delete expired invitation:", delErr);
            }
            continue; // Skip adding to the active list
          }
        }
        list.push({ id: d.id, ...data });
      }
      setInvitations(list);
    } catch (err) {
      console.error("Error fetching invitations from Firestore:", err);
      setError("Failed to load invitations. Please check your network.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInvitations();
    }
  }, [user]);

  // Handle Logout action
  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Open RSVP Guest List Drawer
  const handleViewRsvps = async (invite) => {
    setSelectedInvite(invite);
    setFetchingRsvps(true);
    setRsvps([]);
    try {
      // Query RSVPs sub-collection under `/invitations/{id}/rsvps`
      const rsvpsRef = collection(db, "invitations", invite.id, "rsvps");
      const querySnapshot = await getDocs(rsvpsRef);
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      // Sort chronologically (latest first)
      list.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      setRsvps(list);
    } catch (err) {
      console.error("Error fetching guest RSVPs:", err);
    } finally {
      setFetchingRsvps(false);
    }
  };

  // Delete Invitation Handler
  const handleDeleteInvitation = async (id) => {
    if (!window.confirm("Are you absolutely sure you want to delete this digital invitation? This action is permanent and cannot be undone.")) return;
    try {
      // First clean up guest RSVPs inside subcollection to prevent orphan records
      const rsvpsRef = collection(db, "invitations", id, "rsvps");
      const rsvpsSnap = await getDocs(rsvpsRef);
      for (const rDoc of rsvpsSnap.docs) {
        await deleteDoc(rDoc.ref);
      }
      await deleteDoc(doc(db, "invitations", id));
      setInvitations((prev) => prev.filter((item) => item.id !== id));
      if (selectedInvite?.id === id) {
        setSelectedInvite(null);
      }
    } catch (err) {
      console.error("Deletion failed:", err);
      alert("Failed to delete the card. Please try again.");
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
          <p className="text-slate-500 font-medium">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none font-sans">
      
      {/* Decorative background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[45rem] h-[45rem] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none z-0"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Top Navbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between bg-[#0e1626]/80 border border-[#1e293b] backdrop-blur-md shadow-xl rounded-2xl p-6 mb-8 gap-4">
          <Link href="/" className="flex items-center gap-4 hover:opacity-95 transition-all group shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="Taabir Logo" className="h-11 w-11 shrink-0 shadow-lg shadow-amber-500/10 rounded-xl group-hover:scale-105 transition-transform duration-300 border border-[#2e3e56]" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 via-amber-200 to-white bg-clip-text text-transparent tracking-tight">Taabir Panel</h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider mt-0.5">Console • {user.email}</p>
            </div>
          </Link>
          
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/"
              className="px-4 py-2 border border-[#1e2b44] rounded-xl text-xs font-bold text-slate-300 hover:bg-[#1a2336] hover:text-white transition-all uppercase tracking-wider font-sans"
            >
              🏠 Home
            </Link>
            <Link
              href="/templates"
              className="px-4 py-2 border border-[#1e2b44] rounded-xl text-xs font-bold text-slate-300 hover:bg-[#1a2336] hover:text-white transition-all uppercase tracking-wider font-sans"
            >
              🎨 Templates
            </Link>
            <Link
              href="/dashboard/create"
              className="px-4 py-2 border border-transparent rounded-xl shadow-lg text-xs font-bold text-[#070b13] bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all uppercase tracking-wider font-sans shadow-amber-500/10 hover:shadow-amber-500/20"
            >
              ➕ Create Card
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-[#1e2b44] rounded-xl text-xs font-bold text-slate-400 hover:bg-rose-950/20 hover:text-rose-400 hover:border-rose-900/30 transition-all uppercase tracking-wider font-sans"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Dashboard Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/30 border border-rose-900/50 text-rose-200 text-xs flex items-center gap-3">
            <svg className="h-4 w-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#0e1626]/40 border border-[#1e293b]/70 backdrop-blur-md rounded-2xl p-5 shadow-md flex items-center gap-4">
            <div className="h-10 w-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-lg text-amber-400">✉️</div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Digital Cards</p>
              <h4 className="text-xl font-bold font-mono text-white mt-0.5">{invitations.length} Active</h4>
            </div>
          </div>
          <div className="bg-[#0e1626]/40 border border-[#1e293b]/70 backdrop-blur-md rounded-2xl p-5 shadow-md flex items-center gap-4">
            <div className="h-10 w-10 bg-teal-500/10 rounded-xl flex items-center justify-center text-lg text-teal-400">💬</div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">RSVP Status</p>
              <h4 className="text-xl font-bold font-mono text-white mt-0.5">Live Database</h4>
            </div>
          </div>
          <div className="bg-[#0e1626]/40 border border-[#1e293b]/70 backdrop-blur-md rounded-2xl p-5 shadow-md flex items-center gap-4">
            <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-lg text-emerald-400">✨</div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">System Status</p>
              <h4 className="text-xl font-bold font-mono text-emerald-400 mt-0.5">Operational</h4>
            </div>
          </div>
        </div>

        {/* Main section */}
        {fetching ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
            <p className="text-slate-400 text-xs font-medium font-mono">Loading active cards...</p>
          </div>
        ) : invitations.length === 0 ? (
          /* Empty state */
          <div className="bg-[#0e1626]/60 border border-[#1e293b] backdrop-blur-md shadow-2xl rounded-2xl p-12 text-center max-w-md mx-auto my-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-500"></div>
            <span className="text-5xl block mb-2">✉️</span>
            <h3 className="mt-4 text-lg font-serif font-bold text-slate-200">No Digital Invitations</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed px-4 font-sans">
              Create highly responsive, customizable, and interactive invitation links to send directly to your guests.
            </p>
            <Link
              href="/dashboard/create"
              className="mt-6 inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-xs font-bold text-[#070b13] bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all uppercase tracking-wider font-mono shadow-amber-500/10"
            >
              Create Invitation Card
            </Link>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invitations.map((invite) => {
              const themeName = 
                invite.theme?.templateId === "emerald-noir" ? "Emerald Noir" :
                invite.theme?.templateId === "minimalist-romance" ? "Minimalist Romance" :
                invite.theme?.templateId === "dark-moody-elegant" ? "Dark Moody" :
                invite.theme?.templateId === "bohemian-terracotta" ? "Bohemian Terracotta" :
                invite.theme?.templateId === "midnight-royal" ? "Midnight Royal" :
                invite.theme?.templateId === "ivory-elegance" ? "Ivory Elegance" :
                invite.theme?.templateId === "corporate-gala" ? "Corporate Gala" :
                invite.theme?.templateId === "enchanted-wireframe" ? "Enchanted Wireframe" :
                invite.theme?.templateId === "royal-heritage" ? "Royal Heritage" :
                invite.theme?.templateId === "cozy-dinner" ? "Cozy Dinner" :
                invite.theme?.templateId === "modern-urban-skyline" ? "Urban Skyline" :
                invite.theme?.templateId === "ethereal-coastal" ? "Ethereal Coastal" :
                invite.theme?.templateId === "opulent-gala" ? "Opulent Gala" :
                invite.theme?.templateId === "elegant-memory-frame" ? "Memory Gallery" :
                invite.theme?.templateId === "golden-keepsake" ? "Golden Keepsake" :
                invite.theme?.templateId === "minimalist-white-gold" ? "Minimalist White-Gold" :
                invite.theme?.templateId === "dramatic-moody-photo" ? "Dramatic Moody" :
                invite.theme?.templateId === "elegant-silver-platinum" ? "Silver & Platinum" : "Ivory Classic";

              const cardLink = `${window.location.protocol}//${host}/invite/${invite.slug}`;
              const isCopied = copiedSlug === invite.slug;

              return (
                <div
                  key={invite.id}
                  className="bg-[#0e1626]/80 border border-[#1e2b44] hover:border-amber-500/50 shadow-lg rounded-2xl p-6 relative flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-amber-500/5 group"
                >
                  {/* Visual template ribbon identifier */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                    invite.theme?.templateId === "emerald-noir" ? "bg-[#001C12]" :
                    invite.theme?.templateId === "dark-moody-elegant" ? "bg-[#0F0F0F]" :
                    invite.theme?.templateId === "bohemian-terracotta" ? "bg-[#E2725B]" :
                    invite.theme?.templateId === "minimalist-romance" ? "bg-[#F7E7CE]" :
                    invite.theme?.templateId === "midnight-royal" ? "bg-[#0A192F]" :
                    invite.theme?.templateId === "ivory-elegance" ? "bg-[#800020]" :
                    invite.theme?.templateId === "corporate-gala" ? "bg-[#191970]" :
                    invite.theme?.templateId === "enchanted-wireframe" ? "bg-[#CFB53B]" :
                    invite.theme?.templateId === "royal-heritage" ? "bg-[#800000]" :
                    invite.theme?.templateId === "cozy-dinner" ? "bg-[#0C1D12]" :
                    invite.theme?.templateId === "modern-urban-skyline" ? "bg-[#050A1F]" :
                    invite.theme?.templateId === "ethereal-coastal" ? "bg-[#C2B280]" :
                    invite.theme?.templateId === "opulent-gala" ? "bg-[#B5A642]" :
                    invite.theme?.templateId === "elegant-memory-frame" ? "bg-[#D4AF37]" :
                    invite.theme?.templateId === "golden-keepsake" ? "bg-[#242424]" :
                    invite.theme?.templateId === "minimalist-white-gold" ? "bg-[#C5A880]" :
                    invite.theme?.templateId === "dramatic-moody-photo" ? "bg-[#FFB300]" :
                    invite.theme?.templateId === "elegant-silver-platinum" ? "bg-[#C0C0C0]" : "bg-[#705832]"
                  }`}></div>

                  <div>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[9px] uppercase font-extrabold tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                        {themeName}
                      </span>
                      <span className="text-[9px] uppercase font-extrabold tracking-wider text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded font-mono">
                        {invite.eventType === "wedding" ? "✉️ Wedding" :
                         invite.eventType === "birthday" ? "🎂 Birthday" :
                         invite.eventType === "anniversary" ? "💑 Anniversary" :
                         invite.eventType === "family_function" ? "🏡 Family" : "✨ Party"}
                      </span>
                    </div>
                    
                    <h3 className="text-base font-serif font-bold text-slate-100 mt-3 truncate group-hover:text-amber-400 transition-colors">
                      {invite.groomName ? `${invite.brideName} & ${invite.groomName}` : invite.brideName}
                    </h3>
                    
                    <div className="text-xs text-slate-400 space-y-1.5 mt-3 font-sans">
                      <p className="flex items-center gap-1.5">
                        <span className="opacity-70">🗓️</span>
                        <span>{new Date(invite.weddingDate).toLocaleDateString("en-US", { dateStyle: "medium" })}</span>
                      </p>
                      <p className="flex items-center gap-1.5 truncate">
                        <span className="opacity-70">📍</span>
                        <span className="truncate">{invite.venue?.name}</span>
                      </p>
                      
                      {/* URL Slug Copy Box */}
                      <div className="mt-3 flex items-center bg-[#131b2e] border border-[#1e2d45] rounded-xl overflow-hidden p-1.5 gap-2">
                        <span className="text-[10px] text-slate-400 font-mono select-all truncate pl-1 flex-1">
                          {invite.slug}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(cardLink, invite.slug)}
                          className={`px-2.5 py-1 text-[9px] font-bold rounded-lg transition-all uppercase tracking-wider shrink-0 ${
                            isCopied ? "bg-emerald-600 text-white" : "bg-[#1d273a] hover:bg-[#25324a] text-amber-400 border border-amber-500/10"
                          }`}
                        >
                          {isCopied ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-[#1e2b44] pt-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleViewRsvps(invite)}
                        className="flex-1 text-center py-2 px-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/35 text-amber-400 rounded-xl text-[10px] font-bold transition-all uppercase tracking-wider font-mono"
                      >
                        💬 Messages
                      </button>
                      
                      <a
                        href={`/invite/${invite.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center py-2 px-2.5 border border-[#1e2b44] hover:bg-[#1a2336] text-slate-200 rounded-xl text-[10px] font-bold transition-all uppercase tracking-wider font-mono"
                      >
                        👁️ View Link
                      </a>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <Link
                        href={`/dashboard/edit/${invite.id}`}
                        className="flex-1 text-center py-2 px-2.5 border border-[#1e2b44] hover:bg-[#1a2336] text-slate-300 rounded-xl text-[10px] font-bold transition-all uppercase tracking-wider font-mono"
                      >
                        ✏️ Edit Card
                      </Link>
                      
                      <button
                        onClick={() => handleDeleteInvitation(invite.id)}
                        className="flex-1 text-center py-2 px-2.5 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-900/20 hover:border-rose-900/40 text-rose-400 rounded-xl text-[10px] font-bold transition-all uppercase tracking-wider font-mono"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ======================================================== */}
        {/* 📋 GUEST RSVPS DETAILED SHEET (Drawer Modal)             */}
        {/* ======================================================== */}
        {selectedInvite && (
          <div className="fixed inset-0 bg-[#070b13]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-[#0e1626] rounded-2xl border border-[#1e2d45] shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden relative">
              
              {/* Header */}
              <div className="p-6 border-b border-[#1e2d45] flex items-center justify-between bg-[#121c30]">
                <div>
                  <h3 className="text-base font-serif font-bold text-slate-100">
                    Wishes &amp; Messages: {selectedInvite.groomName ? `${selectedInvite.brideName} & ${selectedInvite.groomName}` : selectedInvite.brideName}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono tracking-wider">
                    Cloud Database Guestbook Feed
                  </p>
                </div>
                <button
                  onClick={() => setSelectedInvite(null)}
                  className="h-8 w-8 text-slate-400 hover:text-white hover:bg-[#1a263f] rounded-full flex items-center justify-center text-sm font-bold transition-all"
                >
                  ✕
                </button>
              </div>

              {/* RSVPs Table / Content */}
              <div className="p-6 flex-1 overflow-y-auto">
                {fetchingRsvps ? (
                  <div className="flex flex-col items-center py-10 gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-amber-500"></div>
                    <p className="text-slate-400 text-xs font-mono">Accessing datastore...</p>
                  </div>
                ) : rsvps.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-4xl block mb-2">💬</span>
                    <h4 className="text-xs font-bold text-slate-300">No Messages Yet</h4>
                    <p className="text-[10px] text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                      Blessings will automatically appear here as guests submit their wishes in the invitation rsvp section.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border border-[#1e2d45] rounded-xl overflow-hidden shadow-md">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#121c30] text-[9px] uppercase font-bold text-slate-400 tracking-wider border-b border-[#1e2d45] font-mono">
                            <th className="py-3 px-6 w-1/3">Guest Name</th>
                            <th className="py-3 px-6">Wishes &amp; Blessings</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e2d45] text-xs text-slate-300 font-sans bg-[#0e1626]">
                          {rsvps.map((rsvp) => (
                            <tr key={rsvp.id} className="hover:bg-[#131d32]/30 transition-colors">
                              <td className="py-4 px-6 font-bold text-slate-200 align-top">{rsvp.name}</td>
                              <td className="py-4 px-6 text-slate-300 italic whitespace-pre-wrap leading-relaxed align-top">
                                {rsvp.blessing || <span className="text-slate-500 font-normal font-sans">No message left</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-[#121c30] border-t border-[#1e2d45] text-right">
                <button
                  onClick={() => setSelectedInvite(null)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#070b13] text-xs font-bold rounded-xl uppercase tracking-wider font-mono transition-all"
                >
                  Close Guestbook
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Flynx branding in footer */}
        <div className="mt-16 text-center text-[9px] text-slate-500 uppercase tracking-[0.3em] font-mono">
          Powered by Flynx
        </div>
      </div>
    </div>
  );
}
