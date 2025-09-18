"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import LogoB from "@/components/LogoB";
import EditorialVideoComponent from "@/components/EditorialVideo";
import { useRouter } from "next/navigation";
import { getDirectorNames, getDirectorSlugs } from "@/lib/directors-api";
import { getEditorialVideosFromContentful, EditorialVideo } from "@/lib/contentful";

export default function Directors() {
  const [selectedDirector, setSelectedDirector] = useState<string | undefined>();
  const [directors, setDirectors] = useState<string[]>([]);
  const [directorSlugs, setDirectorSlugs] = useState<string[]>([]);
  const [editorialVideos, setEditorialVideos] = useState<EditorialVideo[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  const scrollToTop = () => {
    // Usar la misma lógica que funciona en DirectorClient
    const scrollToTop = () => {
      const heroSection = document.querySelector('section');
      if (heroSection) {
        heroSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      } else {
        // Si no encuentra la sección, intentar de nuevo
        setTimeout(scrollToTop, 200);
      }
    };
    scrollToTop();
  };

  useEffect(() => {
    const fetchDirectors = async () => {
      try {
        const [names, slugs, videos] = await Promise.all([
          getDirectorNames(),
          getDirectorSlugs(),
          getEditorialVideosFromContentful()
        ]);
        setDirectors(names);
        setDirectorSlugs(slugs);
        setEditorialVideos(videos);
      } catch (error) {
        console.error('Error fetching directors:', error);
      }
    };

    fetchDirectors();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDirectorClick = (director: string) => {
    const directorIndex = directors.indexOf(director);
    const slug = directorSlugs[directorIndex];
    if (slug) {
      router.push(`/directors/${slug}`);
    }
  };

  return (
    <section
      id="directors"
      className="relative bg-[#e2e2e2] w-full min-h-screen pt-8 md:pt-12 z-10"
    >
      <div className="mx-app flex-col flex md:flex-row md:justify-between items-center md:items-start border-b-2 border-[#f31014] ">
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            scrollToTop();
          }}
          className="ml-2 w-10 md:w-24 h-auto text-[#f31014] self-start mb-8 md:mb-24 cursor-pointer"
        >
          <LogoB />
        </button>
        <div>
          <h2 className="text-[#f31014] font-tusker text-[clamp(1.5rem,33vw,14rem)] md:text-[clamp(2rem,22vw,14rem)] leading-none tracking-tight">
            DIRECTORS
          </h2>
        </div>
      </div>
      
      <div className="mx-app py-4 md:py-6">
        {/* Mobile: Layout optimizado para videos landscape */}
        <div className="md:hidden">
          {/* Lista de directores */}
          <div className="mb-3">
            <ul className="text-[#f31014] text-lg font-hagrid-text flex flex-col font-normal uppercase gap-y-1 transition-all duration-1000 ease-in-out">
              {directors.map((director, index) => (
                <li
                  className={`${
                    director === selectedDirector
                      ? "font-bold"
                      : "font-normal cursor-pointer"
                  } hover:font-bold transition-all duration-1000`}
                  onClick={() => {
                    setSelectedDirector(director);
                    handleDirectorClick(director);
                  }}
                  key={index}
                >
                  {director}
                </li>
              ))}
            </ul>
          </div>

          {/* Videos landscape en grid */}
          <div className="grid grid-cols-1 gap-2">
            {/* Video 1 */}
            {editorialVideos[0] ? (
              <EditorialVideoComponent
                video={editorialVideos[0]}
                className="aspect-[16/9] w-full"
                isMobile={isMobile}
              />
            ) : (
              <div className="relative aspect-[16/9] w-full bg-black overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.15)]">
                <Image
                  src="/images/alta.jpg"
                  alt="Retrato jugador"
                  fill
                  sizes="(max-width: 768px) 100vw"
                  className="object-cover"
                />
              </div>
            )}
            
            {/* Video 2 */}
            {editorialVideos[1] ? (
              <EditorialVideoComponent
                video={editorialVideos[1]}
                className="aspect-[16/9] w-full"
                isMobile={isMobile}
              />
            ) : (
              <div className="relative aspect-[16/9] w-full bg-black overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.15)]">
                <Image
                  src="/images/ojos.jpg"
                  alt="Retrato jugador placeholder"
                  fill
                  sizes="(max-width: 768px) 100vw"
                  className="object-cover"
                />
              </div>
            )}
            
            {/* Video 3 */}
            {editorialVideos[2] ? (
              <EditorialVideoComponent
                video={editorialVideos[2]}
                className="aspect-[16/9] w-full"
                isMobile={isMobile}
              />
            ) : (
              <div className="relative aspect-[16/9] w-full bg-black overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.15)]">
                <Image
                  src="/images/perro.jpg"
                  alt="Retrato jugador placeholder"
                  fill
                  sizes="(max-width: 768px) 100vw"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Desktop: Layout original */}
        <div className="hidden md:grid md:grid-cols-12 md:gap-4 md:items-start">
          {/* Lista de directores (izquierda) */}
          <ul className="col-span-4 text-[#f31014] text-2xl font-hagrid-text flex flex-col font-normal uppercase gap-y-1 transition-all duration-300 ease-in-out">
            {directors.map((director, index) => (
              <li
                className={`${
                  director === selectedDirector
                    ? "font-bold"
                    : "font-normal cursor-pointer"
                } hover:font-bold transition-all duration-500`}
                onClick={() => {
                  setSelectedDirector(director);
                  handleDirectorClick(director);
                }}
                key={index}
              >
                {director}
              </li>
            ))}
          </ul>

          {/* Contenedor de imágenes (derecha) */}
          <div className="col-span-8">
            {/* Desktop: composición absoluta */}
            <div className="hidden md:block relative h-[520px] lg:h-[600px]">
              {/* Video 1: alto a la derecha */}
              <div className="absolute top-0 right-0 w-[28%] lg:w-[28%] h-[78%]">
                {editorialVideos[0] ? (
                  <EditorialVideoComponent
                    video={editorialVideos[0]}
                    className="w-full h-full"
                    isMobile={false}
                  />
                ) : (
                  <div className="w-full h-full overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.15)]">
                    <Image
                      src="/images/alta.jpg"
                      alt="Retrato jugador"
                      fill
                      sizes="(min-width: 1024px) 36vw, 34vw"
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
              
              {/* Video 2: centro-derecha */}
              <div className="absolute top-0 right-[32%] w-[28%] lg:w-[28%] h-[78%]">
                {editorialVideos[1] ? (
                  <EditorialVideoComponent
                    video={editorialVideos[1]}
                    className="w-full h-full"
                    isMobile={false}
                  />
                ) : (
                  <div className="w-full h-full overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.15)]">
                    <Image
                      src="/images/ojos.jpg"
                      alt="Retrato jugador placeholder"
                      fill
                      sizes="(min-width: 1024px) 36vw, 34vw"
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
              
              {/* Video 3: centro-izquierda */}
              <div className="absolute top-0 right-[64%] w-[28%] lg:w-[28%] h-[78%]">
                {editorialVideos[2] ? (
                  <EditorialVideoComponent
                    video={editorialVideos[2]}
                    className="w-full h-full"
                    isMobile={false}
                  />
                ) : (
                  <div className="w-full h-full overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.15)]">
                    <Image
                      src="/images/perro.jpg"
                      alt="Retrato jugador placeholder"
                      fill
                      sizes="(min-width: 1024px) 36vw, 34vw"
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 md:bottom-6 md:right-8 z-10 pointer-events-none">
      </div>
    </section>
  );
}