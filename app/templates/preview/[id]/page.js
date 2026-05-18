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
  "minimalist-romance": {
    id: "__demo_minimalist_romance__",
    brideName: "Olivia",
    brideParentsName: "Mr. & Mrs. William Bennett",
    groomName: "Ethan",
    groomParentsName: "Mr. & Mrs. Thomas Hayes",
    weddingDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
    venue: {
      name: "The Glass Greenhouse Sanctuary",
      address: "450 Champagne Ridge Road, Napa Valley, California",
      googleMapsUrl: "https://www.google.com/maps",
    },
    photoUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200",
    photos: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200"
    ],
    musicUrl: "",
    coupleEmail: "olivia.ethan.wedding@gmail.com",
    theme: { templateId: "minimalist-romance" },
    details: {
      schedule: [
        {
          name: "Welcome Cocktails & Canapés",
          time: new Date(Date.now() + 59 * 24 * 60 * 60 * 1000).toISOString(),
          description: "An intimate sundowner to kickstart our celebration weekend.",
          venue: "The Oak Pavilion Grounds"
        },
        {
          name: "Vow Exchange & Ceremony",
          time: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Join us as we exchange vows under the twilight sky.",
          venue: "The Glass Sanctuary"
        },
        {
          name: "Gala Dinner & Reception",
          time: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
          description: "An evening of laughter, dancing, and fine wine.",
          venue: "The Orchard Ballroom"
        },
      ],
    },
    styling: {
      enableScratchCard: true,
      enableLanguageSwitcher: true,
      doorAnimation: "fade-zoom",
      btnBgColor: "#F7E7CE",
      btnTextColor: "#333333"
    }
  },
  "dark-moody-elegant": {
    id: "__demo_dark_moody_elegant__",
    brideName: "Victoria",
    brideParentsName: "Lord & Lady Sterling",
    groomName: "Andrew",
    groomParentsName: "Mr. & Mrs. Reginald Montgomery",
    weddingDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(), // 75 days from now
    venue: {
      name: "The Royal Palace Chateau",
      address: "100 Golden Gates Avenue, Versailles, France",
      googleMapsUrl: "https://www.google.com/maps",
    },
    photoUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200",
    photos: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200",
      "https://images.unsplash.com/photo-1519225495810-7517c5a6538a?q=80&w=1200",
      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?q=80&w=1200"
    ],
    musicUrl: "",
    coupleEmail: "victoria.andrew.wedding@chateau.fr",
    theme: { templateId: "dark-moody-elegant" },
    details: {
      schedule: [
        {
          name: "Welcome Candlelight Soirée",
          time: new Date(Date.now() + 74 * 24 * 60 * 60 * 1000).toISOString(),
          description: "An evening of vintage wines, harp music, and warm greetings.",
          venue: "The Chateau Orangery Pavilion"
        },
        {
          name: "Holy Vows Exchange & Nikkah",
          time: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Witness our forever binding vows under the golden cathedral dome.",
          venue: "The Royal Sanctuary Cathedral"
        },
        {
          name: "Grand Royal Banquet & Reception",
          time: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
          description: "A theatrical multi-course royal feast, champagne bar, and waltz.",
          venue: "The Hall of Golden Mirrors"
        },
      ],
    },
    styling: {
      enableScratchCard: true,
      enableLanguageSwitcher: true,
      doorAnimation: "sliding-doors",
      btnBgColor: "#D4AF37",
      btnTextColor: "#0F0F0F"
    }
  },
  "bohemian-terracotta": {
    id: "__demo_bohemian_terracotta__",
    brideName: "Clara",
    brideParentsName: "Dr. & Mrs. Edward Jenkins",
    groomName: "Julian",
    groomParentsName: "Mr. & Mrs. Thomas Alvarez",
    weddingDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    venue: {
      name: "The Whisper Pines Meadow",
      address: "450 Organic Valley Road, Sedona, Arizona",
      googleMapsUrl: "https://www.google.com/maps",
    },
    photoUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200",
    photos: [
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200",
      "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200",
      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?q=80&w=1200"
    ],
    musicUrl: "",
    coupleEmail: "clara.julian.wedding@sedonameadows.com",
    theme: { templateId: "bohemian-terracotta" },
    details: {
      schedule: [
        {
          name: "Welcome Sunset Meadow Cocktail",
          time: new Date(Date.now() + 59 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Organic cider, acoustic folk tunes, and warm welcome circles under the red cliffs.",
          venue: "The Meadow Firepit"
        },
        {
          name: "Rustic Exchange of Vows",
          time: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Our exchange of forever promises amidst wild lavender and sage bushes.",
          venue: "The Oak Tree Sanctuary"
        },
        {
          name: "Outdoor Boho Feast & Celebration",
          time: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
          description: "Long wooden banquets, organic sourdough feasts, stargazing, and acoustic dancing.",
          venue: "The Sedona Glamp Pavilion"
        },
      ],
    },
    styling: {
      enableScratchCard: true,
      enableLanguageSwitcher: true,
      doorAnimation: "fade-zoom",
      btnBgColor: "#E2725B",
      btnTextColor: "#FFFDD0"
    }
  },
  "royal-glamour": {
    id: "__demo_royal_glamour__",
    brideName: "Isabella",
    brideParentsName: "Mr. & Mrs. Arthur Sterling",
    groomName: "Maximilian",
    groomParentsName: "Mr. & Mrs. Charles Bennett",
    weddingDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    venue: {
      name: "The Sterling Glasshouse",
      address: "100 Grand Boulevard, Beverly Hills, California",
      googleMapsUrl: "https://www.google.com/maps",
    },
    photoUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200",
    photos: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200",
      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?q=80&w=1200",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200"
    ],
    musicUrl: "",
    coupleEmail: "isabella.max.wedding@sterlingglass.com",
    theme: { templateId: "royal-glamour" },
    details: {
      schedule: [
        {
          name: "Vows & Ring Exchange",
          time: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          description: "A private ceremony at our grand garden chapel.",
          venue: "Chapel of Stars"
        },
        {
          name: "Glamour Cocktail & Glass Reception",
          time: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
          description: "Champagne towers, premium live band, and high-end banquet feast.",
          venue: "Sterling Glasshouse Grand Pavilion"
        }
      ],
    },
    styling: {
      enableScratchCard: true,
      enableLanguageSwitcher: true,
      doorAnimation: "fade-zoom",
      btnBgColor: "#B76E79",
      btnTextColor: "#FFFFFF"
    }
  },
  "neon-nightclub": {
    id: "__demo_neon_nightclub__",
    brideName: "Tyler",
    brideParentsName: "The Milestone Party VIP Committee",
    groomName: "VIP Guest",
    weddingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    venue: {
      name: "The Neon Underground Club & Lounge",
      address: "21st Avenue, Manhattan, New York",
      googleMapsUrl: "https://www.google.com/maps",
    },
    photoUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200",
    photos: [
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200"
    ],
    musicUrl: "",
    coupleEmail: "tyler.21st.vip@neonunderground.com",
    theme: { templateId: "neon-nightclub" },
    details: {
      schedule: [
        {
          name: "VIP Early Access & Glow bar opens",
          time: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Signature neon cocktails, glow paints, and electric lounge pre-beats.",
          venue: "The Siren Lounge Bar"
        },
        {
          name: "The Main Set & Neon Flicker Show",
          time: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          description: "Milestone champagne shower, high-contrast EDM set, and laser light reveal.",
          venue: "Neon Main Stage Floor"
        }
      ],
    },
    styling: {
      enableScratchCard: true,
      enableLanguageSwitcher: true,
      doorAnimation: "fade-zoom",
      btnBgColor: "#FF10F0",
      btnTextColor: "#000000"
    }
  }
};

export async function generateMetadata({ params }) {
  const id = params.id;
  const labels = { 
    "emerald-noir": "Emerald Noir", 
    "ivory-classic": "Ivory Classic", 
    "minimalist-romance": "Minimalist Romance",
    "dark-moody-elegant": "Dark Moody & Elegant",
    "bohemian-terracotta": "Bohemian Terracotta",
    "royal-glamour": "Royal Glamour & Glassmorphism",
    "neon-nightclub": "Neon Nightclub"
  };
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
