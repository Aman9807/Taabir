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
  },
  "elegant-milestone": {
    id: "__demo_elegant_milestone__",
    brideName: "Shahida Khatoon",
    brideParentsName: "50th Milestone Jubilee",
    weddingDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    venue: {
      name: "The Regency Crystal Ballroom",
      address: "500 Grand Ritz Boulevard, London, UK",
      googleMapsUrl: "https://www.google.com/maps",
    },
    photoUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200",
    photos: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200",
      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?q=80&w=1200"
    ],
    eventType: "birthday",
    musicUrl: "",
    coupleEmail: "khantafazzul740@gmail.com",
    theme: { templateId: "elegant-milestone" },
    details: {
      schedule: [
        {
          name: "Milestone Reception & Red Carpet",
          time: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
          description: "A glamorous champagne reception and waltz orchestra greets your arrival.",
          venue: "The Ritz Crystal Foyer"
        },
        {
          name: "Milestone Jubilee Dinner Feast",
          time: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          description: "An elegant sit-down banquet, premium catering, toast speeches, and waltz.",
          venue: "Regency Grand Ballroom"
        }
      ],
    },
    styling: {
      enableScratchCard: true,
      enableLanguageSwitcher: true,
      doorAnimation: "fade-zoom",
      btnBgColor: "#800020",
      btnTextColor: "#FFFFFF"
    }
  },
  "playful-kidsparty": {
    id: "__demo_playful_kidsparty__",
    brideName: "Teddy's 5th",
    brideParentsName: "Mr. & Mrs. Anderson",
    weddingDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    venue: {
      name: "The Playful Kingdom Castle",
      address: "123 Balloon Valley Avenue, Dreamland",
      googleMapsUrl: "https://www.google.com/maps",
    },
    photoUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=1200",
    photos: [
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=1200",
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200"
    ],
    eventType: "birthday",
    musicUrl: "",
    coupleEmail: "birthday.fun@playfulkingdom.com",
    theme: { templateId: "playful-kidsparty" },
    details: {
      schedule: [
        {
          name: "Bubble Magic Show",
          time: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          description: "A super magic show with giant bubbles, friendly clowns, and face painting!",
          venue: "The Magic Garden Patio"
        },
        {
          name: "Cake Pop & Balloon Explosion",
          time: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          description: "Blowing out candles, yummy cupcake towers, and pop-the-balloon minigames!",
          venue: "Royal Banquet Castle Hall"
        }
      ],
    },
    styling: {
      enableScratchCard: true,
      enableLanguageSwitcher: true,
      doorAnimation: "fade-zoom",
      btnBgColor: "#FF7F50",
      btnTextColor: "#FFFFFF"
    }
  },
  "summer-poolparty": {
    id: "__demo_summer_poolparty__",
    brideName: "Minhaj's Pool",
    brideParentsName: "Mr. & Mrs. Khan",
    weddingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    venue: {
      name: "The Blue Lagoon Villa Resort",
      address: "456 Sand Dune Oasis Beachway, Palms City",
      googleMapsUrl: "https://www.google.com/maps",
    },
    photoUrl: "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1200",
    photos: [
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1200",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200"
    ],
    eventType: "birthday",
    musicUrl: "",
    coupleEmail: "summer.vibes@bluelagoonresort.com",
    theme: { templateId: "summer-poolparty" },
    details: {
      schedule: [
        {
          name: "Welcome Tropical Cocktails",
          time: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Refreshing frozen mocktails, finger bites, and cool beach beats!",
          venue: "Oasis Poolside Deck"
        },
        {
          name: "Splash Pool Volleyball & Water Slide",
          time: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
          description: "Friendly water sports matches, massive slide diving, and water balloon fun!",
          venue: "Oasis Lagoon Deep End"
        }
      ],
    },
    styling: {
      enableScratchCard: true,
      enableLanguageSwitcher: true,
      doorAnimation: "fade-zoom",
      btnBgColor: "#FF7F50",
      btnTextColor: "#FFFFFF"
    }
  },
  "corporate-gala": {
    id: "__demo_corporate_gala__",
    brideName: "FALIX NEXT-GEN GALA LAUNCH",
    brideParentsName: "Falix Technologies Ltd.",
    weddingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    venue: {
      name: "The Platinum Executive Plaza",
      address: "100 Innovation Way, Financial District, NY",
      googleMapsUrl: "https://www.google.com/maps",
    },
    photoUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200",
    photos: [
      "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200",
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200"
    ],
    eventType: "general",
    musicUrl: "",
    coupleEmail: "events@falix.com",
    theme: { templateId: "corporate-gala" },
    details: {
      schedule: [
        {
          name: "Red Carpet Reception & Cocktails",
          time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Exclusive red carpet welcome, media interviews, live jazz, and premium cocktails.",
          venue: "Executive Foyer Hall A"
        },
        {
          name: "Next-Gen Keynote & Live Demo",
          time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          description: "Unveiling the future of sport tech, live platform presentation, and panel Q&A.",
          venue: "Grand Plaza Auditorium"
        }
      ],
    },
    styling: {
      enableScratchCard: true,
      enableLanguageSwitcher: true,
      doorAnimation: "fade-zoom",
      btnBgColor: "#191970",
      btnTextColor: "#FFFFFF"
    }
  },
  "cozy-dinner": {
    id: "__demo_cozy_dinner__",
    brideName: "Intimate Holiday Feast",
    brideParentsName: "The Sterling Estate",
    weddingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    venue: {
      name: "The Hearthstone Lodge",
      address: "404 Pine Forest Road, Aspen, CO",
      googleMapsUrl: "https://www.google.com/maps",
    },
    photoUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1200",
    photos: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1200",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200",
      "https://images.unsplash.com/photo-1575549594211-18c1d50c7760?q=80&w=1200"
    ],
    eventType: "general",
    musicUrl: "",
    coupleEmail: "dinner@sterling.com",
    theme: { templateId: "cozy-dinner" },
    details: {
      schedule: [],
    },
    styling: {
      enableScratchCard: true,
      enableLanguageSwitcher: true,
      doorAnimation: "fade-zoom",
      btnBgColor: "#CFB53B",
      btnTextColor: "#0C1D12"
    }
  },
  "royal-heritage": {
    id: "__demo_royal_heritage__",
    brideName: "Alexander",
    groomName: "Victoria",
    brideParentsName: "The Royal House of Sterling",
    groomParentsName: "The Imperial Family",
    weddingDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    venue: {
      name: "The Imperial Palace Hotel",
      address: "1 Royal Boulevard, King's Landing, NY",
      googleMapsUrl: "https://www.google.com/maps",
    },
    photoUrl: "https://images.unsplash.com/photo-1543886567-27b3e2b9f3aa?q=80&w=1200",
    photos: [
      "https://images.unsplash.com/photo-1543886567-27b3e2b9f3aa?q=80&w=1200",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1200"
    ],
    eventType: "wedding",
    musicUrl: "",
    coupleEmail: "royal@heritage.com",
    theme: { templateId: "royal-heritage" },
    details: {
      schedule: [],
    },
    styling: {
      enableScratchCard: true,
      enableLanguageSwitcher: true,
      doorAnimation: "velvet-curtains",
      btnBgColor: "#D4AF37",
      btnTextColor: "#0C0C0C"
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
    "neon-nightclub": "Neon Nightclub",
    "elegant-milestone": "Elegant Milestone",
    "playful-kidsparty": "Playful & Interactive",
    "summer-poolparty": "Summer Pool Party",
    "corporate-gala": "Sleek Corporate Gala",
    "cozy-dinner": "Cozy Holiday / Dinner Party",
    "royal-heritage": "The Royal Heritage"
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
