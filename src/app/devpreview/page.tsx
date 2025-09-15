import Hero from '@/components/Hero';
import Directors from '@/components/Directors';
import Contact from '@/components/Contact';
import { getAllHeroVideos, getRandomAudioTrack } from '@/lib/contentful';

export const revalidate = 300; // 5 minutos

async function getStaticData() {
  try {
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

export default async function DevPreview() {
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
