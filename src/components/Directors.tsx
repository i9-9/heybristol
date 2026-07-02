"use client";

import Image from "next/image";
import Link from "next/link";
import HomeLogoButton from "@/components/HomeLogoButton";
import EditorialVideoComponent from "@/components/EditorialVideo";
import { useIsMobile } from "@/hooks/useIsMobile";
import type { EditorialVideo } from "@/lib/contentful";

export interface DirectorListItem {
  name: string;
  slug: string;
}

interface DirectorsProps {
  directors: DirectorListItem[];
  editorialVideos: EditorialVideo[];
}

const directorLinkClassName =
  "block font-normal hover:font-bold focus-visible:font-bold transition-all duration-500";

function DirectorList({
  directors,
  className,
  itemClassName,
}: {
  directors: DirectorListItem[];
  className: string;
  itemClassName?: string;
}) {
  return (
    <ul className={className}>
      {directors.map((director) => (
        <li key={director.slug} className={itemClassName}>
          <Link
            href={`/directors/${director.slug}/`}
            className={directorLinkClassName}
          >
            {director.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Directors({ directors, editorialVideos }: DirectorsProps) {
  const isMobile = useIsMobile();

  return (
    <section
      id="directors"
      className="relative bg-bristol-gray w-full min-h-dvh pt-8 md:pt-12 z-10"
    >
      <div className="mx-app flex-col flex md:flex-row md:justify-between items-center md:items-start border-b-2 border-bristol-red">
        <HomeLogoButton
          className="md:ml-2 w-10 md:w-24 h-auto text-bristol-red self-start mb-8 md:mb-24 cursor-pointer"
          logoClassName="w-full h-auto"
        />
        <div className="mb-8 md:mb-0 w-full md:w-auto">
          <h2 className="text-bristol-red font-tusker text-[clamp(2rem,36vw,14rem)] md:text-[clamp(2rem,22vw,14rem)] leading-none tracking-[-0.04em] md:tracking-tight w-full md:w-auto">
            DIRECTORS
          </h2>
        </div>
      </div>

      <div className="mx-app py-4 md:py-6">
        <div className="md:hidden">
          <div className="flex gap-3">
            <div className="w-1/2">
              <DirectorList
                directors={directors}
                className="text-bristol-red text-xs font-hagrid-text flex flex-col font-normal uppercase gap-y-1"
              />
            </div>

            <div className="w-1/2 grid grid-cols-1 gap-1">
              {editorialVideos[0] ? (
                <EditorialVideoComponent
                  video={editorialVideos[0]}
                  className="aspect-[16/9] w-full"
                  isMobile={isMobile}
                />
              ) : (
                <div className="relative aspect-[16/9] w-full bg-black overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
                  <Image
                    src="/images/alta.jpg"
                    alt="Retrato jugador"
                    fill
                    sizes="(max-width: 768px) 50vw"
                    className="object-cover"
                  />
                </div>
              )}

              {editorialVideos[1] ? (
                <EditorialVideoComponent
                  video={editorialVideos[1]}
                  className="aspect-[16/9] w-full"
                  isMobile={isMobile}
                />
              ) : (
                <div className="relative aspect-[16/9] w-full bg-black overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
                  <Image
                    src="/images/ojos.jpg"
                    alt="Retrato jugador placeholder"
                    fill
                    sizes="(max-width: 768px) 50vw"
                    className="object-cover"
                  />
                </div>
              )}

              {editorialVideos[2] ? (
                <EditorialVideoComponent
                  video={editorialVideos[2]}
                  className="aspect-[16/9] w-full"
                  isMobile={isMobile}
                />
              ) : (
                <div className="relative aspect-[16/9] w-full bg-black overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
                  <Image
                    src="/images/perro.jpg"
                    alt="Retrato jugador placeholder"
                    fill
                    sizes="(max-width: 768px) 50vw"
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hidden md:grid md:grid-cols-12 md:gap-4 md:items-start">
          <DirectorList
            directors={directors}
            className="col-span-4 text-bristol-red text-xs font-hagrid-text flex flex-col font-normal uppercase gap-y-1"
          />

          <div className="col-span-8">
            <div className="hidden md:block relative h-[520px] lg:h-[600px]">
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

      <div className="absolute bottom-4 right-4 md:bottom-6 md:right-8 z-10 pointer-events-none" />
    </section>
  );
}
