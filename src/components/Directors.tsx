import { useState, useRef } from "react";
import LogoB from "@/components/LogoB";

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

  return (
    <section className="relative bg-[#e2e2e2] w-full h-screen pt-12">
      <div className="mx-app flex-col flex md:flex-row md:justify-between items-center md:items-start border-b-3 border-[#f31014] ">
        <div className="w-24 h-auto text-[#f31014] self-start">
          <LogoB />
        </div>
        <div onWheel={handleWheel} className="h-60 overflow-y-auto select-none">
          <ul className="flex flex-col gap-y-3 font-medium font-ordinary list-none select-none">
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
          <h2 className="text-[#f31014] font-tusker text-[clamp(1.5rem,30vw,14rem)] md:text-[clamp(1.5rem,130vw,14rem)] leading-none">
            DIRECTORS
          </h2>
        </div>
      </div>
      <div className="mx-app py-4">
        <ul className="text-[#f31014] text-md md:text-3xl font-hagrid-text flex flex-col font-normal uppercase gap-y-1 transition-all duration-300 ease-in-out">
          {directors.map((director, index) => (
            <li 
                className={director === selectedDirector ? "font-bold" : "font-normal cursor-pointer"}
                onClick={() => setSelectedDirector(director)}
                key={index}>{director}
            </li>
          ))}
        </ul>
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
    </section>
  );
}
