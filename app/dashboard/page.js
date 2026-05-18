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
            // Auto-delete expired invitation in the background to keep Firestore storage clean
            try {
              await deleteDoc(d.ref);
              console.log(`[Auto-Deleted Expired Dashboard] id: ${d.id}`);
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
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-slate-100 to-amber-50/20 py-8 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Navbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white border border-slate-100 shadow-sm rounded-2xl p-6 mb-8 gap-4">
          <div className="flex items-center gap-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="h-10 w-10 shrink-0 shadow-md rounded-xl">
              <defs>
                <linearGradient id="yellow-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF3C4" />
                  <stop offset="35%" stopColor="#FCD34D" />
                  <stop offset="70%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="#78350F" />
                </linearGradient>
                <linearGradient id="charcoal-bg" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1E202B" />
                  <stop offset="100%" stopColor="#0F1016" />
                </linearGradient>
                <radialGradient id="gold-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#FCD34D" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="200" height="200" rx="44" fill="url(#charcoal-bg)" />
              <circle cx="100" cy="100" r="90" fill="url(#gold-glow)" />
              <rect x="12" y="12" width="176" height="176" rx="32" fill="none" stroke="url(#yellow-gold-grad)" strokeWidth="2.5" />
              <rect x="18" y="18" width="164" height="164" rx="26" fill="none" stroke="url(#yellow-gold-grad)" strokeWidth="0.75" opacity="0.5" />
              <path d="M 32,32 L 48,32 A 16,16 0 0,0 32,48 Z" fill="url(#yellow-gold-grad)" opacity="0.8" />
              <path d="M 168,32 L 152,32 A 16,16 0 0,1 168,48 Z" fill="url(#yellow-gold-grad)" opacity="0.8" />
              <path d="M 32,168 L 48,168 A 16,16 0 0,1 32,152 Z" fill="url(#yellow-gold-grad)" opacity="0.8" />
              <path d="M 168,168 L 152,168 A 16,16 0 0,0 168,152 Z" fill="url(#yellow-gold-grad)" opacity="0.8" />
              <text x="100" y="118" fontFamily="'Playfair Display', 'Didot', 'Georgia', serif" fontSize="76" fontWeight="bold" fill="url(#yellow-gold-grad)" textAnchor="middle" filter="drop-shadow(0px 2px 8px rgba(217, 119, 6, 0.45))">T</text>
              <text x="100" y="152" fontFamily="'Inter', 'Montserrat', 'sans-serif'" fontSize="10.5" fontWeight="800" fill="url(#yellow-gold-grad)" textAnchor="middle" letter-spacing="4.5" opacity="0.95">TAABIR</text>
            </svg>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Taabir Dashboard</h1>
              <p className="text-xs text-slate-400 font-mono">Logged in as {user.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/create"
              className="px-4 py-2 border border-transparent rounded-xl shadow-md text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all uppercase tracking-widest"
            >
              ➕ Create Invitation
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest"
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

        {/* Main section */}
        {fetching ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-600"></div>
            <p className="text-slate-400 text-xs font-medium">Fetching invitation databases...</p>
          </div>
        ) : invitations.length === 0 ? (
          /* Empty state */
          <div className="bg-white border border-slate-100 shadow-lg rounded-2xl p-12 text-center max-w-md mx-auto my-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
            <span className="text-5xl">✉️</span>
            <h3 className="mt-6 text-lg font-serif font-bold text-slate-800">No Digital Invitations Yet</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed px-4">
              Get started by creating your first highly customizable, fully responsive, interactive digital invitation card.
            </p>
            <Link
              href="/dashboard/create"
              className="mt-6 inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-md text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transition-all uppercase tracking-widest font-mono"
            >
              Create Invitation Card
            </Link>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invitations.map((invite) => (
              <div
                key={invite.id}
                className="bg-white border border-slate-100 shadow-md rounded-2xl p-6 relative flex flex-col justify-between overflow-hidden transition-all hover:shadow-lg"
              >
                {/* Visual template ribbon identifier */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-[#022E1F]`}></div>

                <div>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-mono">
                      {invite.theme?.templateId === "emerald-noir" ? "Emerald Noir" : "Ivory Classic"}
                    </span>
                    <span className="text-[9px] uppercase font-bold tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded font-mono">
                      {invite.eventType === "wedding"
                        ? "✉️ Wedding"
                        : invite.eventType === "birthday"
                        ? "🎂 Birthday"
                        : invite.eventType === "anniversary"
                        ? "💑 Anniversary"
                        : invite.eventType === "family_function"
                        ? "🏡 Family"
                        : "✨ Party"}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-serif font-bold text-slate-900 mt-3 truncate">
                    {invite.groomName ? `${invite.brideName} & ${invite.groomName}` : invite.brideName}
                  </h3>
                  
                  <div className="text-xs text-slate-400 space-y-1 mt-2 font-mono">
                    <p>🗓️ Date: {new Date(invite.weddingDate).toLocaleDateString("en-US", { dateStyle: "long" })}</p>
                    <p>📍 Venue: {invite.venue?.name}</p>
                    <p className="text-amber-700 font-semibold select-all truncate mt-1">
                      🔗 URL: {host}/invite/{invite.slug}
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => handleViewRsvps(invite)}
                      className="flex-1 text-center py-2 px-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-[11px] font-semibold hover:bg-amber-100 transition-all uppercase tracking-wider"
                    >
                      💬 Messages
                    </button>
                    
                    <a
                      href={`/invite/${invite.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center py-2 px-2.5 border border-slate-200 text-slate-700 rounded-xl text-[11px] font-semibold hover:bg-slate-50 transition-all uppercase tracking-wider"
                    >
                      👁️ Open Link
                    </a>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <Link
                      href={`/dashboard/edit/${invite.id}`}
                      className="flex-1 text-center py-2 px-2.5 border border-slate-200 text-slate-700 rounded-xl text-[11px] font-semibold hover:bg-slate-50 transition-all uppercase tracking-wider"
                    >
                      ✏️ Edit Card
                    </Link>
                    
                    <button
                      onClick={() => handleDeleteInvitation(invite.id)}
                      className="flex-1 text-center py-2 px-2.5 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 rounded-xl text-[11px] font-semibold transition-all uppercase tracking-wider"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ======================================================== */}
        {/* 📋 GUEST RSVPS DETAILED SHEET (Drawer Modal)             */}
        {/* ======================================================== */}
        {selectedInvite && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden relative">
              
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Wishes &amp; Messages: {selectedInvite.groomName ? `${selectedInvite.brideName} & ${selectedInvite.groomName}` : selectedInvite.brideName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    All guest blessings and greetings listed below
                  </p>
                </div>
                <button
                  onClick={() => setSelectedInvite(null)}
                  className="h-8 w-8 text-slate-500 hover:bg-slate-100 rounded-full flex items-center justify-center text-lg font-bold transition-all"
                >
                  ✕
                </button>
              </div>

              {/* RSVPs Table / Content */}
              <div className="p-6 flex-1 overflow-y-auto">
                {fetchingRsvps ? (
                  <div className="flex flex-col items-center py-10 gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-amber-600"></div>
                    <p className="text-slate-400 text-xs font-mono">Loading Messages from cloud...</p>
                  </div>
                ) : rsvps.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-4xl">💬</span>
                    <h4 className="text-sm font-semibold text-slate-700 mt-4">No Messages Yet</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                      Wishes and blessings will automatically populate here as guests submit their messages.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    
                    {/* Guest list mapping */}
                    <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-600 tracking-wider border-b border-slate-100 font-sans">
                            <th className="py-3 px-6 w-1/3">Guest Name</th>
                            <th className="py-3 px-6">Wishes &amp; Blessings</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-sans">
                          {rsvps.map((rsvp) => (
                            <tr key={rsvp.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-4 px-6 font-semibold text-slate-900 align-top">{rsvp.name}</td>
                              <td className="py-4 px-6 text-slate-600 italic whitespace-pre-wrap leading-relaxed align-top">
                                {rsvp.blessing || <span className="text-slate-300">No message left</span>}
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
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl uppercase tracking-widest font-mono"
                >
                  Close Drawer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Flynx branding in footer */}
        <div className="mt-16 text-center text-[10px] text-slate-400 uppercase tracking-[0.25em] font-sans">
          Powered by Flynx
        </div>
      </div>
    </div>
  );
}
