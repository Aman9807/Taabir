import InviteViewer from "../../../invite/[slug]/InviteViewer";

// Static sample data for each template demo
const DEMO_DATA = {
  "emerald-noir": {
    id: "__demo_emerald_noir__",
    brideName: "Aisha",
    brideParentsName: "Mr. & Mrs. Shakeel Ahmed",
    groomName: "Zaid",
    groomParentsName: "Mr. & Mrs. Imtiaz Khan",
    weddingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    venue: {
      name: "The Royal Palms Gardens",
      address: "786 Emerald Boulevard, Lahore, Pakistan",
      googleMapsUrl: "https://www.google.com/maps",
    },
    photoUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800",
    musicUrl: "",
    coupleEmail: "aisha.zaid.wedding@gmail.com",
    theme: { templateId: "emerald-noir" },
    details: {
      schedule: [
        {
          name: "Mehndi Ceremony",
          time: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Ladies gathering, henna & dinner at family home.",
        },
        {
          name: "Nikkah & Barat",
          time: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Main ceremony at Royal Palms Hall A — 6:00 PM onwards.",
        },
        {
          name: "Walima Reception",
          time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Grand dinner reception for all guests.",
        },
      ],
    },
  },
  "ivory-classic": {
    id: "__demo_ivory_classic__",
    brideName: "Sophia",
    brideParentsName: "Mr. & Mrs. James Carter",
    groomName: "Daniel",
    groomParentsName: "Mr. & Mrs. Robert Mills",
    weddingDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days from now
    venue: {
      name: "The Ivory Manor Estate",
      address: "12 Rose Garden Lane, London, UK",
      googleMapsUrl: "https://www.google.com/maps",
    },
    photoUrl: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?q=80&w=800",
    musicUrl: "",
    coupleEmail: "sophia.daniel.wedding@gmail.com",
    theme: { templateId: "ivory-classic" },
    details: {
      schedule: [
        {
          name: "Wedding Rehearsal Dinner",
          time: new Date(Date.now() + 44 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Intimate dinner for immediate family & wedding party.",
        },
        {
          name: "Wedding Ceremony",
          time: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Ceremony at The Ivory Manor Chapel — 3:00 PM.",
        },
        {
          name: "Evening Reception",
          time: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
          description: "Dinner, dancing & celebrations in the Grand Ballroom.",
        },
      ],
    },
  },
};

export async function generateMetadata({ params }) {
  const id = params.id;
  const labels = { "emerald-noir": "Emerald Noir", "ivory-classic": "Ivory Classic" };
  return {
    title: `${labels[id] || "Template"} Preview | Taabir`,
    description: "Live preview of this Taabir digital wedding invitation template.",
  };
}

export default function TemplatePreviewPage({ params }) {
  const { id } = params;
  const demo = DEMO_DATA[id];

  if (!demo) {
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

  return <InviteViewer invitation={demo} />;
}
