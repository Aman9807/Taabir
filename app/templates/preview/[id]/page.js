import InviteViewer from "../../../invite/[slug]/InviteViewer";

// Dynamic demo data generator to handle all 11 premium templates beautifully
const getDemoData = (id) => {
  const isBday = id.startsWith("birthday");
  const isMinimal = id.startsWith("minimal");
  const isGrand = id.startsWith("grand");
  
  let eventType = "wedding";
  if (isBday) eventType = "birthday";
  else if (isMinimal && id.includes("silk")) eventType = "family_function";
  else if (isGrand) eventType = "anniversary";

  return {
    id: `__demo_${id}__`,
    brideName: isBday ? "Rohan Sharma" : isGrand ? "Elena" : "Sophia",
    brideParentsName: isBday ? "Celebrating 21st Birthday" : isGrand ? "Celebrating 25 Golden Years of Love" : "Mr. & Mrs. James Carter",
    groomName: isBday ? "" : isGrand ? "Victor" : "Daniel",
    groomParentsName: isBday ? "" : isGrand ? "" : "Mr. & Mrs. Robert Mills",
    weddingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    eventType: eventType,
    venue: {
      name: isMinimal 
        ? "The Sandstone Pavilion" 
        : isBday 
        ? "Club Neon Horizon" 
        : "The Emerald Crest Grand Ballroom",
      address: isMinimal 
        ? "88 Desert Sage Lane, Arizona" 
        : isBday 
        ? "402 Skyline Boulevard, Mumbai" 
        : "12 Rose Garden Lane, London, UK",
      googleMapsUrl: "https://www.google.com/maps",
    },
    photoUrl: isBday
      ? "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=800"
      : "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800",
    musicUrl: "",
    coupleEmail: isBday ? "rohan.birthday@gmail.com" : "elena.victor.love@gmail.com",
    theme: { templateId: id },
    details: {
      schedule: isBday ? [
        {
          name: "Guest Arrivals & Cocktails",
          time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Rooftop lounge opening with premium retro tunes.",
        },
        {
          name: "Cake Cutting Ceremony",
          time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          description: "Blessings and birthday celebration toasts.",
        }
      ] : [
        {
          name: "Reception Ceremony",
          time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Main formal ceremony welcoming all respected guests.",
        },
        {
          name: "Dinner & Banquets",
          time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
          description: "Formal dinner seating, live violin, and speeches.",
        }
      ]
    }
  };
};

export async function generateMetadata({ params }) {
  const id = params.id;
  const labels = { 
    "emerald-noir": "Emerald Noir", 
    "ivory-classic": "Ivory Classic",
    "minimal-silk": "Minimal Silk",
    "minimal-charcoal": "Minimal Charcoal",
    "minimal-blush": "Minimal Blush",
    "minimal-indigo": "Minimal Indigo",
    "birthday-retro": "Retro Tangerine",
    "birthday-disco": "Midnight Disco",
    "birthday-glam": "Glitter & Glam",
    "grand-royal": "Grand Royal Blue",
    "grand-sunset": "Terracotta Sunset"
  };
  return {
    title: `${labels[id] || "Template"} Preview | Taabir`,
    description: "Live preview of this premium Taabir digital invitation template.",
  };
}

export default function TemplatePreviewPage({ params }) {
  const { id } = params;
  
  const validIds = [
    "emerald-noir", "ivory-classic", 
    "minimal-silk", "minimal-charcoal", "minimal-blush", "minimal-indigo",
    "birthday-retro", "birthday-disco", "birthday-glam",
    "grand-royal", "grand-sunset"
  ];

  if (!validIds.includes(id)) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center text-center px-6">
        <div>
          <p className="text-4xl mb-4">🎨</p>
          <h1 className="text-xl font-serif text-slate-800 mb-2">Template Not Found</h1>
          <p className="text-sm text-slate-400">This template preview does not exist.</p>
        </div>
      </div>
    );
  }

  const demo = getDemoData(id);
  return <InviteViewer invitation={demo} />;
}
