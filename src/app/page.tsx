import Hero from '@/components/Hero';
import Directors from '@/components/Directors';
import Contact from '@/components/Contact';
import { getRandomHeroVideo } from '@/lib/contentful';

// Configurar ISR - se regenera cada hora o cuando hay cambios
export const revalidate = 3600; // 1 hora

// Función para generar datos estáticos
async function getStaticData() {
  try {
    // Obtener video hero aleatorio en build time
    const heroVideo = await getRandomHeroVideo();
    
    return {
      heroVideo,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting static data:', error);
    return {
      heroVideo: null,
      timestamp: new Date().toISOString()
    };
  }
}

export default async function Home() {
  const staticData = await getStaticData();

  return (
    <>
      <Hero initialHeroVideo={staticData.heroVideo} />
      <Directors />
      <Contact />
    </>
  );
}