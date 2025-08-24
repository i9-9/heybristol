import { useState, useRef } from "react";
import Image from "next/image";
import LogoB from "@/components/LogoB";
import DirectorModal from "@/components/DirectorModal";

const years = ["2025", "2024", "2023", "2022", "2021", "2020"];

const directors = [
  "Lemon",
  "Luciano Urbani",
  "Iván Jurado",
  "Paloma Rincón",
  "Tigre Escobar",
  "China Pequenino",
];

export default function Directors() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedDirector, setSelectedDirector] = useState(directors[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDirector, setModalDirector] = useState("");
  const canScroll = useRef(true);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (!canScroll.current) return;

    if (e.deltaY > 0) {
      // scroll hacia abajo
      setSelectedIndex((prev) => Math.min(prev + 1, years.length - 1));
    } else if (e.deltaY < 0) {
      // scroll hacia arriba
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    }

    canScroll.current = false;
    setTimeout(() => {
      canScroll.current = true;
    }, 500); // 500ms cooldown
  };

  const handleDirectorClick = (director: string) => {
    setModalDirector(director);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <section className="relative bg-[#e2e2e2] w-full h-screen pt-12">
      <div className="mx-app flex-col flex md:flex-row md:justify-between items-center md:items-start border-b-2 border-[#f31014] ">
        <div className="w-10 md:w-24 h-auto text-[#f31014] self-start">
          <LogoB />
        </div>
        <div onWheel={handleWheel} className="h-48 md:h-60 overflow-y-auto select-none">
          <ul className="flex flex-col gap-y-1.5 md:gap-y-3 font-medium font-ordinary list-none select-none">
            {years.map((year, index) => (
              <li
                key={year}
                onClick={() => setSelectedIndex(index)}
                className="cursor-pointer transition-colors duration-400 ease-in-out flex items-center"
              >
                <span className="text-[#f31014]">—</span>
                <span
                  className={`ml-4 ${
                    index === selectedIndex ? "text-[#f31014]" : "text-black/10"
                  }`}
                >
                  {year}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-[#f31014] font-tusker text-[clamp(1.5rem,33vw,14rem)] md:text-[clamp(2rem,22vw,14rem)] leading-none tracking-tight">
            DIRECTORS
          </h2>
        </div>
      </div>
      <div className="mx-app py-6 grid grid-cols-12 gap-4 md:gap-6 items-start">
        {/* Lista de directores (izquierda) */}
        <ul className="col-span-12 md:col-span-4 text-[#f31014] text-md md:text-2xl font-hagrid-text flex flex-col font-normal uppercase md:gap-y-1 transition-all duration-300 ease-in-out">
          {directors.map((director, index) => (
            <li
              className={`${director === selectedDirector ? "font-bold" : "font-normal cursor-pointer"} hover:opacity-80 transition-opacity`}
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
        <div className="col-span-12 md:col-span-8">
          {/* Mobile: layout similar a desktop */}
          <div className="md:hidden relative h-[300px]">
            {/* Ojo: debajo de la lista de directores, pegado al margen izquierdo */}
            <div className="absolute top-0 left-0 w-[35%] h-[18%] overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.15)]">
              <Image src="/images/ojos.jpg" alt="Detalle ojos" fill sizes="100vw" className="object-cover" />
            </div>

            {/* Jugador: más arriba y sin recortar */}
            <div className="absolute -top-38 right-0 w-[22%] h-[50%] overflow-visible shadow-[0_4px_15px_rgba(0,0,0,0.15)]">
              <Image src="/images/alta.jpg" alt="Retrato jugador" fill sizes="100vw" className="object-cover" />
            </div>

            {/* Perro: centrado, más pequeño y más arriba */}
            <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[18%] h-[25%] overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.15)]">
              <Image src="/images/perro.jpg" alt="Perro" fill sizes="100vw" className="object-cover" />
            </div>
          </div>

          {/* Desktop: composición absoluta */}
          <div className="hidden md:block relative h-[520px] lg:h-[600px]">
            {/* Ojo: centrado arriba */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[50%] lg:w-[42%] h-[20%]  overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.15)]">
              <Image src="/images/ojos.jpg" alt="Detalle ojos" fill sizes="(min-width: 1024px) 58vw, 62vw" className="object-cover" />
            </div>

            {/* Jugador: alto a la derecha */}
            <div className="absolute top-0 right-0 w-[28%] lg:w-[28%] h-[78%] overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.15)]">
              <Image src="/images/alta.jpg" alt="Retrato jugador" fill sizes="(min-width: 1024px) 36vw, 34vw" className="object-cover" />
            </div>

            {/* Perro: abajo izquierda (elevado) */}
            <div className="absolute bottom-32 left-2 w-[27%] lg:w-[26%] h-[38%]  overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.15)]">
              <Image src="/images/perro.jpg" alt="Perro" fill sizes="(min-width: 1024px) 32vw, 34vw" className="object-cover" />
            </div>
          </div>
        </div>
      </div>

      {/* Lema (abajo izquierda) */}
      <div className="absolute bottom-4 left-4 md:bottom-6 md:left-8 z-10 pointer-events-none">
        <p className="font-ordinary text-[#f31014] text-sm md:text-xl leading-5 text-left">
          LATIN
          <br />
          CREATIVE
          <br />
          PRODUCTION
        </p>
      </div>

      <div className="absolute bottom-4 right-4 md:bottom-6 md:right-8 z-10 pointer-events-none">
        <p className="font-ordinary text-[#f31014] text-sm md:text-xl leading-5 text-left">
          BRISTOL
        </p>
      </div>

      {/* Director Modal */}
      <DirectorModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        directorName={modalDirector}
      />
    </section>
  );
}
