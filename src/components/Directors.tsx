"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import LogoB from "@/components/LogoB";
import { useRouter } from "next/navigation";
import { getDirectorNames, getDirectorSlugs } from "@/lib/directors-api";

export default function Directors() {
  const [selectedDirector, setSelectedDirector] = useState<string | undefined>();
  const [directors, setDirectors] = useState<string[]>([]);
  const [directorSlugs, setDirectorSlugs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDirectors = async () => {
      try {
        const [names, slugs] = await Promise.all([
          getDirectorNames(),
          getDirectorSlugs()
        ]);
        setDirectors(names);
        setDirectorSlugs(slugs);
      } catch (error) {
        console.error('Error fetching directors:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDirectors();
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
      className="relative bg-[#e2e2e2] w-full h-screen pt-12"
    >
      <div className="mx-app flex-col flex md:flex-row md:justify-between items-center md:items-start border-b-2 border-[#f31014] ">
        <div className="ml-2 w-10 md:w-24 h-auto text-[#f31014] self-start mb-24">
          <LogoB />
        </div>
        <div>
          <h2 className="text-[#f31014] font-tusker text-[clamp(1.5rem,33vw,14rem)] md:text-[clamp(2rem,22vw,14rem)] leading-none tracking-tight">
            DIRECTORS
          </h2>
        </div>
      </div>
      
      <div className="mx-app py-6">
        {/* Mobile: Layout de dos columnas */}
        <div className="md:hidden flex gap-6 items-start">
          {/* Lista de directores (izquierda) */}
          <div className="flex-1">
            <ul className="text-[#f31014] text-lg font-hagrid-text flex flex-col font-normal uppercase gap-y-2 transition-all duration-1000 ease-in-out">
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

          {/* Grilla de imágenes (derecha) */}
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-2">
              {/* Jugador 1 */}
              <div className="relative aspect-[9/16] bg-black overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.15)]">
                <Image
                  src="/images/alta.jpg"
                  alt="Retrato jugador"
                  fill
                  sizes="(max-width: 768px) 33vw"
                  className="object-cover"
                />
              </div>
              
              {/* Jugador 2 */}
              <div className="relative aspect-[9/16] bg-black overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.15)]">
                <Image
                  src="/images/alta.jpg"
                  alt="Retrato jugador placeholder"
                  fill
                  sizes="(max-width: 768px) 33vw"
                  className="object-cover"
                />
              </div>
              
              {/* Jugador 3 */}
              <div className="relative aspect-[9/16] bg-black overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.15)]">
                <Image
                  src="/images/alta.jpg"
                  alt="Retrato jugador placeholder"
                  fill
                  sizes="(max-width: 768px) 33vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop: Layout original */}
        <div className="hidden md:grid md:grid-cols-12 md:gap-6 md:items-start">
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
              {/* Jugador 1: alto a la derecha */}
              <div className="absolute top-0 right-0 w-[28%] lg:w-[28%] h-[78%] overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.15)]">
                <Image
                  src="/images/alta.jpg"
                  alt="Retrato jugador"
                  fill
                  sizes="(min-width: 1024px) 36vw, 34vw"
                  className="object-cover"
                />
              </div>
              
              {/* Jugador 2: centro-derecha */}
              <div className="absolute top-0 right-[32%] w-[28%] lg:w-[28%] h-[78%] overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.15)]">
                <Image
                  src="/images/alta.jpg"
                  alt="Retrato jugador placeholder"
                  fill
                  sizes="(min-width: 1024px) 36vw, 34vw"
                  className="object-cover"
                />
              </div>
              
              {/* Jugador 3: centro-izquierda */}
              <div className="absolute top-0 right-[64%] w-[28%] lg:w-[28%] h-[78%] overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.15)]">
                <Image
                  src="/images/alta.jpg"
                  alt="Retrato jugador placeholder"
                  fill
                  sizes="(min-width: 1024px) 36vw, 34vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 md:bottom-6 md:right-8 z-10 pointer-events-none">
        <p className="font-ordinary text-[#f31014] text-sm md:text-xl leading-5 text-left">
          BRISTOL
        </p>
      </div>
    </section>
  );
}