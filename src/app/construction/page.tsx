import { getAllHeroVideos, getRandomAudioTrack } from '@/lib/contentful';
import { buildPageMetadata } from '@/lib/seo';
import ConstructionClient from './ConstructionClient';

export const metadata = {
  ...buildPageMetadata({
    title: 'Bristol — Production Company',
    path: '/construction/',
  }),
  title: { absolute: 'Bristol — Production Company' },
};

export const revalidate = 3600;

async function getStaticData() {
  try {
    const [allHeroVideos, fixedAudioTrack] = await Promise.all([
      getAllHeroVideos(),
      getRandomAudioTrack()
    ]);
    return { allHeroVideos, fixedAudioTrack };
  } catch (error) {
    console.error('Error getting construction data:', error);
    return { allHeroVideos: [], fixedAudioTrack: null };
  }
}

export default async function Construction() {
  const { allHeroVideos, fixedAudioTrack } = await getStaticData();

  return (
    <ConstructionClient
      allHeroVideos={allHeroVideos}
      fixedAudioTrack={fixedAudioTrack}
    />
  );
}
