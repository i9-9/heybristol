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

// SSG - Static Site Generation
export const dynamic = 'force-static';
export const revalidate = false;

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