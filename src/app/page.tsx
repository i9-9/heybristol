import dynamicImport from 'next/dynamic';
import { getAllHeroVideos, getRandomAudioTrack, getEditorialVideosFromContentful } from '@/lib/contentful';
import { getDirectors } from '@/lib/directors-api';
import { compareDirectorsBySurname } from '@/lib/director-sort';
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

async function getDirectorsSectionData() {
  try {
    const [directors, editorialVideos] = await Promise.all([
      getDirectors(),
      getEditorialVideosFromContentful(),
    ]);

    const sorted = [...directors].sort(compareDirectorsBySurname);

    return {
      directors: sorted.map((director) => ({
        name: director.name,
        slug: director.slug,
      })),
      editorialVideos,
    };
  } catch (error) {
    console.error('Error fetching directors section data:', error);
    return {
      directors: [],
      editorialVideos: [],
    };
  }
}

async function getStaticData() {
  try {
    const [allHeroVideos, fixedAudioTrack, directorsSection] = await Promise.all([
      getAllHeroVideos(),
      getRandomAudioTrack(),
      getDirectorsSectionData(),
    ]);

    return {
      allHeroVideos,
      fixedAudioTrack,
      directorsSection,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error getting static data:', error);
    return {
      allHeroVideos: [],
      fixedAudioTrack: null,
      directorsSection: { directors: [], editorialVideos: [] },
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
      <Directors
        directors={staticData.directorsSection.directors}
        editorialVideos={staticData.directorsSection.editorialVideos}
      />
      <Contact />
    </>
  );
}
