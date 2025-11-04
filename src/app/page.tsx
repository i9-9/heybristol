import dynamicImport from 'next/dynamic';
import { getAllHeroVideos, getRandomAudioTrack } from '@/lib/contentful';

// Dynamic imports for better code splitting (no loading screens)
const Hero = dynamicImport(() => import('@/components/Hero'), {
  ssr: true
});

const Directors = dynamicImport(() => import('@/components/Directors'), {
  ssr: true
});

const Contact = dynamicImport(() => import('@/components/Contact'), {
  ssr: true
});

// ISR - Incremental Static Regeneration
// Pages are statically generated but can be regenerated on-demand via webhooks
// or automatically after 1 hour if stale
export const revalidate = 3600; // 1 hour

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