export interface DirectorVideo {
  id: string;
  order: number;
  title: string;
  client: string;
  vimeoId: string;
  thumbnailId?: string; // ID del video loop/thumbnail
  isPlaceholder: boolean;
  status: 'published' | 'pending' | 'draft';
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
        id: "1107773548",
        order: 1,
        title: "Purpose",
        client: "Rexona",
        vimeoId: "1107773548",
        thumbnailId: "1111389219",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1107776159",
        order: 2,
        title: "100 years",
        client: "Pepsodent",
        vimeoId: "1107776159",
        thumbnailId: "1111389173",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1107772381",
        order: 3,
        title: "Si a todo",
        client: "Pepsi",
        vimeoId: "1107772381",
        thumbnailId: "1111389121",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1107821981",
        order: 4,
        title: "Borderline",
        client: "La Virginia",
        vimeoId: "1107821981",
        thumbnailId: "1111389005",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1107774921",
        order: 5,
        title: "Become Independent",
        client: "Uber",
        vimeoId: "1107774921",
        thumbnailId: "1111389319",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1107804840",
        order: 6,
        title: "Aces",
        client: "Sadia",
        vimeoId: "1107804840",
        thumbnailId: "1111389249",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1107827209",
        order: 7,
        title: "Amor ciego",
        client: "Movistar",
        vimeoId: "1107827209",
        thumbnailId: "1111389038",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1107794150",
        order: 8,
        title: "Facing the hater",
        client: "Sprite",
        vimeoId: "1107794150",
        thumbnailId: "1111389296",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1107796368",
        order: 9,
        title: "Bomba",
        client: "H2O",
        vimeoId: "1107796368",
        thumbnailId: "1111388971",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1113296421",
        order: 10,
        title: "Tatoo",
        client: "Signal",
        vimeoId: "1113296421",
        thumbnailId: "1113558740",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1107777162",
        order: 11,
        title: "Santiago",
        client: "Panamericanos",
        vimeoId: "1107777162",
        thumbnailId: "1111389092",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1107805748",
        order: 12,
        title: "Terry",
        client: "Old Spice",
        vimeoId: "1107805748",
        thumbnailId: "1111389063",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1107798538",
        order: 13,
        title: "Cuervos",
        client: "Zona Jobs",
        vimeoId: "1107798538",
        thumbnailId: "1111388895",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1107797972",
        order: 14,
        title: "Wasabi",
        client: "Axe",
        vimeoId: "1107797972",
        thumbnailId: "1111388867",
        isPlaceholder: false,
        status: 'published'
      }
    ]
  },
  {
    name: "Iván Jurado",
    slug: "ivan-jurado",
    videos: [
      {
        id: "1107757619",
        order: 1,
        title: "Athletic Greens (DC)",
        client: "Ag1",
        vimeoId: "1107757619",
        thumbnailId: "1111388191",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1107759493",
        order: 2,
        title: "Ixchiq (DC)",
        client: "Valneva",
        vimeoId: "1107759493",
        thumbnailId: "1111388300",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1107758028",
        order: 3,
        title: "Sport is back",
        client: "Decathlon",
        vimeoId: "1107758028",
        thumbnailId: "1111388227",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1107760003",
        order: 4,
        title: "Living with Wayfair",
        client: "Wayfair",
        vimeoId: "1107760003",
        thumbnailId: "1111388324",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1107760354",
        order: 5,
        title: "Wellbeing",
        client: "Weight Watchers",
        vimeoId: "1107760354",
        thumbnailId: "1111388364",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1107759126",
        order: 6,
        title: "Hue Secure",
        client: "Phillips",
        vimeoId: "1107759126",
        thumbnailId: "1111388266",
        isPlaceholder: false,
        status: 'published'
      }
    ]
  },
  {
    name: "Paloma Rincón",
    slug: "paloma-rincon",
    videos: [
      {
        id: "1107751189",
        order: 1,
        title: "Diamonds",
        client: "NTT",
        vimeoId: "1107751189",
        thumbnailId: "1111390506",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1107749399",
        order: 2,
        title: "Textil",
        client: "Heineken Silver",
        vimeoId: "1107749399",
        thumbnailId: "1113560033",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1107745371",
        order: 3,
        title: "Summer Baking",
        client: "FN",
        vimeoId: "1107745371",
        thumbnailId: "1113559984",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1112927162",
        order: 4,
        title: "Mix",
        client: "Michelob Ultra Seltzer",
        vimeoId: "1112927162",
        thumbnailId: "1113561175",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1107751794",
        order: 5,
        title: "Oat",
        client: "Earth's Own",
        vimeoId: "1107751794",
        thumbnailId: "1113559863",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1107749963",
        order: 6,
        title: "Big",
        client: "Papa John's",
        vimeoId: "1107749963",
        thumbnailId: "1111390531",
        isPlaceholder: false,
        status: 'published'
      }
    ]
  },
  {
    name: "Luciano Urbani",
    slug: "luciano-urbani",
    videos: [
      {
        id: "1107778294",
        order: 1,
        title: "Nakheel",
        client: "Dubai",
        vimeoId: "1107778294",
        thumbnailId: "1113559248",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1107777537",
        order: 2,
        title: "Race in Monaco",
        client: "Toyota",
        vimeoId: "1107777537",
        thumbnailId: "1111389879",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1107776881",
        order: 3,
        title: "Evolución",
        client: "Sprite",
        vimeoId: "1107776881",
        thumbnailId: "1111390080",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1112933584",
        order: 4,
        title: "Mother",
        client: "KFC",
        vimeoId: "1112933584",
        thumbnailId: "1111389988",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1107774267",
        order: 5,
        title: "Bell",
        client: "Miller Lite",
        vimeoId: "1107774267",
        thumbnailId: "1111390024",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1107771138",
        order: 6,
        title: "New Ranger",
        client: "Ford",
        vimeoId: "1107771138",
        thumbnailId: "1111389917",
        isPlaceholder: false,
        status: 'published'
      }
    ]
  },
  {
    name: "China Pequenino",
    slug: "china-pequenino",
    videos: [
      {
        id: "1107753409",
        order: 1,
        title: "ft Maria Becerra",
        client: "Reebok",
        vimeoId: "1107753409",
        thumbnailId: "1111387659",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1107755107",
        order: 2,
        title: "Ivom",
        client: "Movistar",
        vimeoId: "1107755107",
        thumbnailId: "1111387585",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "ciudadela-pending",
        order: 3,
        title: "75 años",
        client: "Ciudadela",
        vimeoId: "",
        thumbnailId: "1113571389",
        isPlaceholder: true,
        status: 'pending'
      },
      {
        id: "1107755680",
        order: 4,
        title: "New Year Party",
        client: "NYM",
        vimeoId: "1107755680",
        thumbnailId: "1111387628",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1107753947",
        order: 5,
        title: "Desafio",
        client: "Bees",
        vimeoId: "1107753947",
        thumbnailId: "1111387526",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1113394660",
        order: 6,
        title: "Wondrous Time",
        client: "Oldi",
        vimeoId: "1113394660",
        isPlaceholder: false,
        status: 'published'
      }
    ]
  },
  {
    name: "Tigre Escobar",
    slug: "tigre-escobar",
    videos: [
      {
        id: "porsche-pending",
        order: 1,
        title: "Próximamente",
        client: "Porsche",
        vimeoId: "",
        isPlaceholder: true,
        status: 'pending'
      },
      {
        id: "1107801604",
        order: 2,
        title: "Las Américas",
        client: "Lafayette",
        vimeoId: "1107801604",
        thumbnailId: "1111390727",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1107803062",
        order: 3,
        title: "Eyewear Paris",
        client: "Paula Mendoza",
        vimeoId: "1107803062",
        thumbnailId: "1113560358",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1107802342",
        order: 4,
        title: "Our Mutual Friend",
        client: "Lafayette",
        vimeoId: "1107802342",
        thumbnailId: "1113560243",
        isPlaceholder: false,
        status: 'published'
      },
      {
        id: "1107803512",
        order: 5,
        title: "Kintsugi",
        client: "Sandra Weil",
        vimeoId: "1107803512",
        thumbnailId: "1113560532",
        isPlaceholder: false,
        status: 'published'
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
  return director ? director.videos.filter(v => !v.isPlaceholder && v.status === 'published') : [];
}

export function getPublishedVideosByDirectorSlug(directorSlug: string): DirectorVideo[] {
  const director = directors.find(d => d.slug === directorSlug);
  return director ? director.videos.filter(v => !v.isPlaceholder && v.status === 'published') : [];
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
  
  const publishedVideos = director.videos.filter(v => !v.isPlaceholder && v.vimeoId);
  
  // Ya no necesitamos llamar a la API de Vimeo porque tenemos thumbnailId para todos
  const videoItems = await Promise.all(
    publishedVideos.map(video => convertToVideoItem(video))
  );
  
  return videoItems;
}