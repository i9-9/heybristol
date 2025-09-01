export interface DirectorVideo {
  id: string;
  order: number;
  title: string;
  client: string;
  vimeoId: string;
  thumbnailId?: string; // ID del video loop/thumbnail
}

export interface Director {
  name: string;
  slug: string;
  videos: DirectorVideo[];
}

// Helper functions para construir URLs
export function getVimeoUrl(vimeoId: string): string {
  return `https://vimeo.com/${vimeoId}`;
}

export function getThumbnailUrl(thumbnailId: string): string {
  return `https://vimeo.com/${thumbnailId}`;
}

export function getEmbedUrl(vimeoId: string): string {
  return `https://player.vimeo.com/video/${vimeoId}?h=hash&title=0&byline=0&portrait=0`;
}

export const directors: Director[] = [
  {
    name: "Lemon",
    slug: "lemon",
    videos: [
      {
        id: "lemon-rexona-1",
        order: 1,
        title: "Purpose",
        client: "Rexona",
        vimeoId: "1107773548",
        thumbnailId: "1111389219"
      },
      {
        id: "lemon-pepsodent-2",
        order: 2,
        title: "100 years",
        client: "Pepsodent",
        vimeoId: "1107776159",
        thumbnailId: "1111389173",

      },
      {
        id: "lemon-pepsi-3",
        order: 3,
        title: "Si a todo",
        client: "Pepsi",
        vimeoId: "1107772381",
        thumbnailId: "1111389121",

      },
      {
        id: "lemon-lavirginia-4",
        order: 4,
        title: "Borderline",
        client: "La Virginia",
        vimeoId: "1107821981",
        thumbnailId: "1111389005",

      },
      {
        id: "lemon-uber-5",
        order: 5,
        title: "Become Independent",
        client: "Uber",
        vimeoId: "1107774921",
        thumbnailId: "1111389319",

      },
      {
        id: "lemon-sadia-6",
        order: 6,
        title: "Aces",
        client: "Sadia",
        vimeoId: "1107804840",
        thumbnailId: "1111389249",

      },
      {
        id: "lemon-movistar-7",
        order: 7,
        title: "Amor ciego",
        client: "Movistar",
        vimeoId: "1107827209",
        thumbnailId: "1111389038",

      },
      {
        id: "lemon-sprite-8",
        order: 8,
        title: "Facing the hater",
        client: "Sprite",
        vimeoId: "1107794150",
        thumbnailId: "1111389296",

      },
      {
        id: "lemon-h2o-9",
        order: 9,
        title: "Bomba",
        client: "H2O",
        vimeoId: "1107796368",
        thumbnailId: "1111388971",

      },
      {
        id: "lemon-signal-10",
        order: 10,
        title: "Tatoo",
        client: "Signal",
        vimeoId: "1113296421",
        thumbnailId: "1113558740",

      },
      {
        id: "lemon-panamericanos-11",
        order: 11,
        title: "Santiago",
        client: "Panamericanos",
        vimeoId: "1107777162",
        thumbnailId: "1111389092",

      },
      {
        id: "lemon-oldspice-12",
        order: 12,
        title: "Terry",
        client: "Old Spice",
        vimeoId: "1107805748",
        thumbnailId: "1111389063",

      },
      {
        id: "lemon-zonajobs-13",
        order: 13,
        title: "Cuervos",
        client: "Zona Jobs",
        vimeoId: "1107798538",
        thumbnailId: "1111388895",

      },
      {
        id: "lemon-axe-14",
        order: 14,
        title: "Wasabi",
        client: "Axe",
        vimeoId: "1107797972",
        thumbnailId: "1111388867",

      }
    ]
  },
  {
    name: "Iván Jurado",
    slug: "ivan-jurado",
    videos: [
      {
        id: "ivan-jurado-ag1-1",
        order: 1,
        title: "Athletic Greens (DC)",
        client: "Ag1",
        vimeoId: "1107757619",
        thumbnailId: "1111388191",

      },
      {
        id: "ivan-jurado-valneva-2",
        order: 2,
        title: "Ixchiq (DC)",
        client: "Valneva",
        vimeoId: "1107759493",
        thumbnailId: "1111388300",

      },
      {
        id: "ivan-jurado-decathlon-3",
        order: 3,
        title: "Sport is back",
        client: "Decathlon",
        vimeoId: "1107758028",
        thumbnailId: "1111388227",

      },
      {
        id: "ivan-jurado-wayfair-4",
        order: 4,
        title: "Living with Wayfair",
        client: "Wayfair",
        vimeoId: "1107760003",
        thumbnailId: "1111388324",

      },
      {
        id: "ivan-jurado-weightwatchers-5",
        order: 5,
        title: "Wellbeing",
        client: "Weight Watchers",
        vimeoId: "1107760354",
        thumbnailId: "1111388364",

      },
      {
        id: "ivan-jurado-phillips-6",
        order: 6,
        title: "Hue Secure",
        client: "Phillips",
        vimeoId: "1107759126",
        thumbnailId: "1111388266",

      }
    ]
  },
  {
    name: "Paloma Rincón",
    slug: "paloma-rincon",
    videos: [
      {
        id: "paloma-rincon-ntt-1",
        order: 1,
        title: "Diamonds",
        client: "NTT",
        vimeoId: "1107751189",
        thumbnailId: "1111390506",

      },
      {
        id: "paloma-rincon-heinekensilver-2",
        order: 2,
        title: "Textil",
        client: "Heineken Silver",
        vimeoId: "1107749399",
        thumbnailId: "1113560033",

      },
      {
        id: "paloma-rincon-fn-3",
        order: 3,
        title: "Summer Baking",
        client: "FN",
        vimeoId: "1107745371",
        thumbnailId: "1113559984",

      },
      {
        id: "paloma-rincon-michelobultra-4",
        order: 4,
        title: "Mix",
        client: "Michelob Ultra Seltzer",
        vimeoId: "1112927162",
        thumbnailId: "1113561175",

      },
      {
        id: "paloma-rincon-earthsown-5",
        order: 5,
        title: "Oat",
        client: "Earth's Own",
        vimeoId: "1107751794",
        thumbnailId: "1113559863",

      },
      {
        id: "paloma-rincon-papajohns-6",
        order: 6,
        title: "Big",
        client: "Papa John's",
        vimeoId: "1107749963",
        thumbnailId: "1111390531",

      }
    ]
  },
  {
    name: "Luciano Urbani",
    slug: "luciano-urbani",
    videos: [
      {
        id: "luciano-urbani-dubai-1",
        order: 1,
        title: "Nakheel",
        client: "Dubai",
        vimeoId: "1107778294",
        thumbnailId: "1113559248",

      },
      {
        id: "luciano-urbani-toyota-2",
        order: 2,
        title: "Race in Monaco",
        client: "Toyota",
        vimeoId: "1107777537",
        thumbnailId: "1111389879",

      },
      {
        id: "luciano-urbani-sprite-3",
        order: 3,
        title: "Evolución",
        client: "Sprite",
        vimeoId: "1107776881",
        thumbnailId: "1111390080",

      },
      {
        id: "luciano-urbani-kfc-4",
        order: 4,
        title: "Mother",
        client: "KFC",
        vimeoId: "1112933584",
        thumbnailId: "1111389988",

      },
      {
        id: "luciano-urbani-millerlite-5",
        order: 5,
        title: "Bell",
        client: "Miller Lite",
        vimeoId: "1107774267",
        thumbnailId: "1111390024",

      },
      {
        id: "luciano-urbani-ford-6",
        order: 6,
        title: "New Ranger",
        client: "Ford",
        vimeoId: "1107771138",
        thumbnailId: "1111389917",

      }
    ]
  },
  {
    name: "China Pequenino",
    slug: "china-pequenino",
    videos: [
      {
        id: "china-pequenino-reebok-1",
        order: 1,
        title: "ft Maria Becerra",
        client: "Reebok",
        vimeoId: "1107753409",
        thumbnailId: "1111387659",

      },
      {
        id: "china-pequenino-movistar-2",
        order: 2,
        title: "Ivom",
        client: "Movistar",
        vimeoId: "1107755107",
        thumbnailId: "1111387585",

      },
      {
        id: "china-pequenino-ciudadela-3",
        order: 3,
        title: "75 años",
        client: "Ciudadela",
        vimeoId: "1113289841",
        thumbnailId: "1113571389",

      },
      {
        id: "china-pequenino-nym-4",
        order: 4,
        title: "New Year Party",
        client: "NYM",
        vimeoId: "1107755680",
        thumbnailId: "1111387628",

      },
      {
        id: "china-pequenino-bees-5",
        order: 5,
        title: "Desafio",
        client: "Bees",
        vimeoId: "1107753947",
        thumbnailId: "1111387526",

      },
      {
        id: "china-pequenino-oldi-6",
        order: 6,
        title: "Wondrous Time",
        client: "Oldi",
        vimeoId: "1113394660",

      }
    ]
  },
  {
    name: "Tigre Escobar",
    slug: "tigre-escobar",
    videos: [

      {
        id: "tigre-escobar-lafayette-1",
        order: 1,
        title: "Las Américas",
        client: "Lafayette",
        vimeoId: "1107801604",
        thumbnailId: "1111390727",

      },
      {
        id: "tigre-escobar-paulamendoza-2",
        order: 2,
        title: "Eyewear Paris",
        client: "Paula Mendoza",
        vimeoId: "1107803062",
        thumbnailId: "1113560358",

      },
      {
        id: "tigre-escobar-lafayette-3",
        order: 3,
        title: "Our Mutual Friend",
        client: "Lafayette",
        vimeoId: "1107802342",
        thumbnailId: "1113560243",

      },
      {
        id: "tigre-escobar-sandraweil-4",
        order: 4,
        title: "Kintsugi",
        client: "Sandra Weil",
        vimeoId: "1107803512",
        thumbnailId: "1113560532",

      }
    ]
  }
];

// Funciones helper actualizadas

export function getVideosByDirector(directorName: string): DirectorVideo[] {
  const director = directors.find(d => d.name === directorName);
  return director ? director.videos : [];
}

export function getVideosByDirectorSlug(directorSlug: string): DirectorVideo[] {
  const director = directors.find(d => d.slug === directorSlug);
  return director ? director.videos : [];
}

export function getDirectorBySlug(directorSlug: string): Director | null {
  return directors.find(d => d.slug === directorSlug) || null;
}

export function getDirectorNames(): string[] {
  return directors.map(d => d.name);
}

export function getDirectorSlugs(): string[] {
  return directors.map(d => d.slug);
}

export function getPublishedVideosByDirector(directorName: string): DirectorVideo[] {
  const director = directors.find(d => d.name === directorName);
  return director ? director.videos.filter(v => v.vimeoId) : [];
}

export function getPublishedVideosByDirectorSlug(directorSlug: string): DirectorVideo[] {
  const director = directors.find(d => d.slug === directorSlug);
  return director ? director.videos.filter(v => v.vimeoId) : [];
}

// Función simplificada que solo usa thumbnailId
export async function convertToVideoItem(directorVideo: DirectorVideo) {
  return {
    id: directorVideo.vimeoId || directorVideo.id,
    title: directorVideo.title,
    description: `${directorVideo.client} - ${directorVideo.title}`,
    pageUrl: getVimeoUrl(directorVideo.vimeoId),
    embedUrl: directorVideo.vimeoId ? getEmbedUrl(directorVideo.vimeoId) : '',
    // Usar thumbnailId para el grid
    thumbnailId: directorVideo.thumbnailId,
    thumb: null, // Ya no necesitamos thumbnails de la API
    width: 1920,
    height: 1080,
    duration: 0,
    tags: [directorVideo.client, directorVideo.title]
  };
}

// Función optimizada que NO usa la API de Vimeo (ya que tenemos thumbnailId para todos)
export async function getVideosAsVideoItems(directorName: string) {
  const director = directors.find(d => d.name === directorName);
  if (!director) return [];
  
  const publishedVideos = director.videos.filter(v => v.vimeoId);
  
  // Ya no necesitamos llamar a la API de Vimeo porque tenemos thumbnailId para todos
  const videoItems = await Promise.all(
    publishedVideos.map(video => convertToVideoItem(video))
  );
  
  return videoItems;
}