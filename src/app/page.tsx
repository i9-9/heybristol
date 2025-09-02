import Hero from '@/components/Hero';
import Directors from '@/components/Directors';
import Contact from '@/components/Contact';
import { getRandomHeroVideo, getRandomAudioTrack } from '@/lib/contentful';

// Configurar ISR - se regenera cada 5 minutos para que cambie más frecuentemente
export const revalidate = 300; // 5 minutos

// Función para generar datos estáticos
async function getStaticData() {
  try {
    // Obtener video hero y audio track aleatorios en build time
    const [heroVideo, audioTrack] = await Promise.all([
      getRandomHeroVideo(),
      getRandomAudioTrack()
    ]);
    
    return {
      heroVideo,
      audioTrack,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting static data:', error);
    return {
      heroVideo: null,
      audioTrack: null,
      timestamp: new Date().toISOString()
    };
  }
}

export default async function Home() {
  const staticData = await getStaticData();

  return (
    <>
      <Hero 
        initialHeroVideo={staticData.heroVideo} 
        initialAudioTrack={staticData.audioTrack} 
      />
      <Directors />
      <Contact />
    </>
  );
}