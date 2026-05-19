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
    <div className="min-h-screen bg-[#FAF9F5] text-slate-800 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none font-sans">
      
      {/* Decorative luxury lattice background grids */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#C5A880_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none z-0"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Top Navbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white/80 border border-slate-100 backdrop-blur-md shadow-sm rounded-2xl p-5 mb-8 gap-4">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-all group shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="Taabir Logo" className="h-9 w-9 shrink-0 shadow-sm rounded-lg group-hover:scale-105 transition-transform duration-300" />
            <div>
              <h1 className="text-lg font-serif font-bold text-slate-900 tracking-wide">TAABIR</h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider">Dashboard • {user.email}</p>
            </div>
          </Link>
          
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all uppercase tracking-wider font-sans"
            >
              🏠 Home
            </Link>
            <Link
              href="/templates"
              className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all uppercase tracking-wider font-sans"
            >
              🎨 Templates
            </Link>
            <Link
              href="/dashboard/create"
              className="px-3.5 py-2 border border-transparent rounded-xl shadow-sm text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-550 hover:to-amber-600 transition-all uppercase tracking-wider font-sans"
            >
              ➕ Create Card
            </Link>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all uppercase tracking-wider font-sans"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Dashboard Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
            <svg className="h-4 w-4 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm flex items-center gap-4">
            <div className="h-9 w-9 bg-amber-50 rounded-lg flex items-center justify-center text-sm text-amber-700">✉️</div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Digital Cards</p>
              <h4 className="text-sm font-bold text-slate-800 mt-0.5">{invitations.length} Active</h4>
            </div>
          </div>
          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm flex items-center gap-4">
            <div className="h-9 w-9 bg-teal-50 rounded-lg flex items-center justify-center text-sm text-teal-700">💬</div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">RSVP Messages</p>
              <h4 className="text-sm font-bold text-slate-800 mt-0.5">Live Feed</h4>
            </div>
          </div>
          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm flex items-center gap-4">
            <div className="h-9 w-9 bg-emerald-50 rounded-lg flex items-center justify-center text-sm text-emerald-700">✨</div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Server Status</p>
              <h4 className="text-sm font-bold text-emerald-700 mt-0.5">Online</h4>
            </div>
          </div>
        </div>

        {/* Main section */}
        {fetching ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-600"></div>
            <p className="text-slate-400 text-xs font-medium font-mono">Loading active cards...</p>
          </div>
        ) : invitations.length === 0 ? (
          /* Empty state */
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-12 text-center max-w-md mx-auto my-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-500"></div>
            <span className="text-4xl block mb-2">✉️</span>
            <h3 className="mt-4 text-base font-serif font-bold text-slate-800">No Digital Invitations Yet</h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed px-4 font-sans">
              Create highly responsive, customizable, and interactive invitation links to send directly to your guests.
            </p>
            <Link
              href="/dashboard/create"
              className="mt-6 inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-md text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 transition-all uppercase tracking-wider font-mono"
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
                  className="bg-white border border-slate-200/60 hover:border-amber-500/30 shadow-sm hover:shadow-md rounded-2xl p-5 relative flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-0.5 group"
                >
                  {/* Decorative Left Border Strip */}
                  <div className={`absolute top-0 bottom-0 left-0 w-1 ${
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

                  <div className="pl-2">
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="text-[8px] uppercase font-bold tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-mono">
                        {themeName}
                      </span>
                      <span className="text-[8px] uppercase font-bold tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded font-mono">
                        {invite.eventType === "wedding" ? "Wedding" :
                         invite.eventType === "birthday" ? "Birthday" :
                         invite.eventType === "anniversary" ? "Anniversary" :
                         invite.eventType === "family_function" ? "Family" : "Party"}
                      </span>
                    </div>
                    
                    <h3 className="text-base font-serif font-bold text-slate-800 mt-2 truncate group-hover:text-amber-700 transition-colors">
                      {invite.groomName ? `${invite.brideName} & ${invite.groomName}` : invite.brideName}
                    </h3>
                    
                    <div className="text-xs text-slate-500 space-y-1 mt-2.5 font-sans">
                      <p className="flex items-center gap-1.5">
                        <span>🗓️</span>
                        <span>{new Date(invite.weddingDate).toLocaleDateString("en-US", { dateStyle: "medium" })}</span>
                      </p>
                      <p className="flex items-center gap-1.5 truncate">
                        <span>📍</span>
                        <span className="truncate">{invite.venue?.name}</span>
                      </p>
                      
                      {/* URL Copy box */}
                      <div className="mt-3 flex items-center bg-slate-50 border border-slate-100 rounded-xl overflow-hidden p-1.5 gap-1.5">
                        <span className="text-[10px] text-slate-500 font-mono select-all truncate pl-1 flex-1">
                          {invite.slug}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(cardLink, invite.slug)}
                          className={`px-2.5 py-1 text-[9px] font-bold rounded-lg transition-all uppercase tracking-wider shrink-0 ${
                            isCopied ? "bg-emerald-600 text-white" : "bg-white hover:bg-slate-50 text-amber-700 border border-slate-200"
                          }`}
                        >
                          {isCopied ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-3.5 flex flex-col gap-2 pl-2">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleViewRsvps(invite)}
                        className="flex-1 text-center py-2 px-2 bg-amber-50 hover:bg-[#FAF6EC] border border-amber-200/50 text-amber-800 rounded-xl text-[10px] font-bold transition-all uppercase tracking-wider font-sans"
                      >
                        💬 Messages
                      </button>
                      
                      <a
                        href={`/invite/${invite.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center py-2 px-2 border border-slate-200 hover:bg-slate-55 text-slate-600 rounded-xl text-[10px] font-bold transition-all uppercase tracking-wider font-sans"
                      >
                        👁️ View Link
                      </a>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <Link
                        href={`/dashboard/edit/${invite.id}`}
                        className="flex-1 text-center py-2 px-2 border border-slate-200 hover:bg-slate-55 text-slate-600 rounded-xl text-[10px] font-bold transition-all uppercase tracking-wider font-sans"
                      >
                        ✏️ Edit Card
                      </Link>
                      
                      <button
                        onClick={() => handleDeleteInvitation(invite.id)}
                        className="flex-1 text-center py-2 px-2 bg-rose-50 hover:bg-rose-100/50 border border-rose-100 text-rose-700 rounded-xl text-[10px] font-bold transition-all uppercase tracking-wider font-sans"
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
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden relative">
              
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-base font-serif font-bold text-slate-800">
                    Wishes: {selectedInvite.groomName ? `${selectedInvite.brideName} & ${selectedInvite.groomName}` : selectedInvite.brideName}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono tracking-wider">
                    Guestbook messages feed
                  </p>
                </div>
                <button
                  onClick={() => setSelectedInvite(null)}
                  className="h-8 w-8 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                >
                  ✕
                </button>
              </div>

              {/* RSVPs Table / Content */}
              <div className="p-5 flex-1 overflow-y-auto">
                {fetchingRsvps ? (
                  <div className="flex flex-col items-center py-10 gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-amber-500"></div>
                    <p className="text-slate-400 text-xs font-mono">Accessing guestbook...</p>
                  </div>
                ) : rsvps.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-3xl block mb-2">💬</span>
                    <h4 className="text-xs font-bold text-slate-600">No Messages Yet</h4>
                    <p className="text-[10px] text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                      Blessings will automatically appear here as guests submit wishes.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-[9px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100 font-mono">
                            <th className="py-2.5 px-5 w-1/3">Guest Name</th>
                            <th className="py-2.5 px-5">Wishes &amp; Blessings</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-sans">
                          {rsvps.map((rsvp) => (
                            <tr key={rsvp.id} className="hover:bg-slate-50/40 transition-colors">
                              <td className="py-3 px-5 font-bold text-slate-800 align-top">{rsvp.name}</td>
                              <td className="py-3 px-5 text-slate-600 italic whitespace-pre-wrap leading-relaxed align-top">
                                {rsvp.blessing || <span className="text-slate-300 font-normal font-sans">No message left</span>}
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
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
                <button
                  onClick={() => setSelectedInvite(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl uppercase tracking-wider font-mono transition-all"
                >
                  Close Guestbook
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Flynx branding in footer */}
        <div className="mt-16 text-center text-[9px] text-slate-400 uppercase tracking-[0.3em] font-mono">
          Powered by Flynx
        </div>
      </div>
    </div>
  );
}
