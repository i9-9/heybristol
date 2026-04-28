import { getAllHeroVideos, getRandomAudioTrack } from '@/lib/contentful';
import ConstructionClient from './ConstructionClient';

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
