"use client";

import Image from "next/image";
import LogoB from "@/components/LogoB";
import Link from "next/link";
import { getDirectorNames, getDirectorSlugs } from "@/data/directors";

export default function DirectorsPage() {
  const directors = getDirectorNames();
  const directorSlugs = getDirectorSlugs();

  return (
    <section id="directors" className="relative bg-[#e2e2e2] w-full h-screen pt-12">
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

      {/* Lista de directores */}
      <div className="mx-app mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {directors.map((director, index) => (
            <Link
              key={director}
              href={`/directors/${directorSlugs[index]}`}
              className="group block p-6 bg-white/10 hover:bg-white/20 transition-all duration-300 rounded-lg border border-white/20 hover:border-white/40"
            >
              <h3 className="text-2xl md:text-3xl font-tusker font-bold text-[#f31014] mb-4 group-hover:scale-105 transition-transform duration-300">
                {director}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-black/60 font-raleway text-sm">Ver videos</span>
                <div className="w-6 h-6 border-2 border-[#f31014] border-t-transparent rounded-full group-hover:animate-spin transition-all duration-300"></div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Botón de regreso */}
      <div className="absolute bottom-6 left-6">
        <Link href="/" className="flex flex-col items-start space-y-2 text-[#f31014] hover:opacity-80 cursor-pointer">
          <Image src="/images/icons/arrow.png" alt="Arrow Up" width={32} height={32} className="w-8 h-8 rotate-180" />
          <span className="font-ordinary text-sm md:text-xl">BRISTOL</span>
        </Link>
      </div>
    </section>
  );
}
