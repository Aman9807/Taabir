import { db } from "../../../lib/firebase";
import { collection, query, where, getDocs, limit, doc, deleteDoc } from "firebase/firestore";
import InviteViewer from "./InviteViewer";

// Fetch invitation from Firestore server-side
async function getInvitation(slug) {
  if (!slug) return null;
  
  try {
    const invitationsRef = collection(db, "invitations");
    // Highly optimized query using limit(1) to avoid redundant reads
    const q = query(invitationsRef, where("slug", "==", slug.trim().toLowerCase()), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const d = querySnapshot.docs[0];
    const data = d.data();

    // Auto-delete logic: check if the event weddingDate is older than 3 days
    if (data.weddingDate) {
      const weddingDate = new Date(data.weddingDate);
      const currentDate = new Date();
      const threeDaysAfterEvent = new Date(weddingDate.getTime() + 3 * 24 * 60 * 60 * 1000);

      if (currentDate > threeDaysAfterEvent) {
        try {
          await deleteDoc(d.ref);
          console.log(`[Auto-Deleted] Expired invitation slug "${slug}" (event was on ${weddingDate.toLocaleDateString()})`);
        } catch (delError) {
          console.error("Failed to auto-delete expired invitation:", delError);
        }
        return null;
      }
    }

    return {
      id: d.id,
      ...data,
    };
  } catch (error) {
    console.error("Error fetching invitation on server-side:", error);
    return null;
  }
}

// 1. Dynamic SEO Metadata Generation for Link Previews (WhatsApp, iMessage, Facebook)
export async function generateMetadata({ params }) {
  const { slug } = params;
  const invitation = await getInvitation(slug);

  if (!invitation) {
    return {
      title: "Invitation Not Found | Taabir",
      description: "This digital invitation link is invalid or has expired.",
    };
  }

  const coupleNames = `${invitation.brideName} & ${invitation.groomName}`;
  return {
    title: `Wedding Invitation: ${coupleNames}`,
    description: `You are cordially invited to celebrate the union of ${invitation.brideName} and ${invitation.groomName}. Get details on the venue, date, and schedule.`,
    openGraph: {
      title: `Wedding Invitation: ${coupleNames}`,
      description: `Join us in celebrating our special day on ${new Date(invitation.weddingDate).toLocaleDateString("en-US", { dateStyle: "long" })}.`,
      type: "website",
    },
  };
}

// 2. Main Public Page Entry (Server-Side)
export default async function InvitePage({ params }) {
  const { slug } = params;
  const invitation = await getInvitation(slug);

  // 3. Fallback: Beautiful Stationery 404 page
  if (!invitation) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex flex-col justify-center items-center px-6 text-center select-none">
        <div className="max-w-md bg-white p-10 rounded-2xl shadow-xl border border-slate-100 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
          <span className="text-5xl">✉️</span>
          <h1 className="mt-6 text-2xl font-serif font-semibold text-slate-800">
            Invitation Not Found
          </h1>
          <p className="mt-3 text-sm text-slate-500 leading-relaxed">
            We couldn&apos;t locate a wedding invitation under the link <span className="font-mono text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-semibold">{slug}</span>. Please verify the URL or contact the hosts.
          </p>
          <a
            href="/"
            className="mt-8 inline-flex items-center justify-center px-6 py-2.5 bg-slate-900 text-white font-semibold text-xs uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-colors"
          >
            Go to Taabir
          </a>
        </div>
      </div>
    );
  }

  // 4. Pass fetched server data to the dynamic Client-side Template Viewer
  return <InviteViewer invitation={invitation} slug={slug} />;
}
