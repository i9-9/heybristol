import Hero from '@/components/Hero';
import Directors from '@/components/Directors';
import Contact from '@/components/Contact';
import { getAllHeroVideos, getRandomAudioTrack } from '@/lib/contentful';

// Configurar ISR - se regenera cada 5 minutos para que cambie más frecuentemente
export const revalidate = 300; // 5 minutos

// Función para generar datos estáticos
async function getStaticData() {
  try {
    // Obtener TODOS los videos hero (para randomización en cliente)
    // y UN audio track fijo (se puede cambiar desde Contentful)
    const [allHeroVideos, fixedAudioTrack] = await Promise.all([
      getAllHeroVideos(),
      getRandomAudioTrack()
    ]);
    
    return {
      allHeroVideos,
      fixedAudioTrack,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting static data:', error);
    return {
      allHeroVideos: [],
      fixedAudioTrack: null,
      timestamp: new Date().toISOString()
    };
  }
}

export default async function Home() {
  const staticData = await getStaticData();

  return (
    <>
      <Hero 
        allHeroVideos={staticData.allHeroVideos} 
        fixedAudioTrack={staticData.fixedAudioTrack} 
      />
      <Directors />
      <Contact />
    </>
  );
}