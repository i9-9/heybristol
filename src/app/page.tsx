import dynamicImport from 'next/dynamic';
import { getAllHeroVideos, getRandomAudioTrack } from '@/lib/contentful';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = {
  ...buildPageMetadata({
    title: 'Bristol — Production Company',
    path: '/',
  }),
  title: { absolute: 'Bristol — Production Company' },
};

const Hero = dynamicImport(() => import('@/components/Hero'), {
  ssr: true,
});

const Directors = dynamicImport(() => import('@/components/Directors'), {
  ssr: true,
});

const Contact = dynamicImport(() => import('@/components/Contact'), {
  ssr: true,
});

export const revalidate = 3600;

async function getStaticData() {
  try {
    const [allHeroVideos, fixedAudioTrack] = await Promise.all([
      getAllHeroVideos(),
      getRandomAudioTrack(),
    ]);

    return {
      allHeroVideos,
      fixedAudioTrack,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error getting static data:', error);
    return {
      allHeroVideos: [],
      fixedAudioTrack: null,
      timestamp: new Date().toISOString(),
    };
  }
}

export default async function HomePage() {
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
