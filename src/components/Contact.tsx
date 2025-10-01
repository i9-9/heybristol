"use client";

import LogoB from "@/components/LogoB";
import Image from "next/image";

export default function Contact() {
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

  return (
    <section id="contact" className="relative bg-[#fa1016] w-full py-32 min-h-[100vh] md:py-[600px] pb-48 md:pb-64">
        <div className="absolute top-6 left-6 md:top-8 md:left-8 z-30">
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            scrollToTop();
          }}
          className="cursor-pointer p-2 rounded z-50 relative"
          style={{ zIndex: 9999 }}
        >
          <div className="w-10 md:w-24 h-auto text-[#e2e2e2]">
            <LogoB />
          </div>
        </button>
        </div>
      
      {/* Título CONTACT */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -translate-y-[4rem] md:translate-y-[2rem] z-100">
        <div className="text-center">
          <h2 className="text-[clamp(3rem,12vw,6rem)] md:text-[6rem] font-tusker font-bold text-white leading-none tracking-tight transition-all duration-500 ease-in-out">
            CONTACT
          </h2>
        </div>
      </div>

      {/* Contact Information - Grid 2x2 */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 translate-y-[1rem] md:translate-y-[8rem] z-10">
        <div className="text-center">
          <div className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 md:gap-x-16 md:gap-y-4 text-black">
            <div>
              <a href="mailto:jorge@heybristol.com" className="font-extrabold text-[10px] md:text-xs lg:text-sm mb-1 md:mb-2 font-hagrid hover:opacity-80 transition-opacity inline-block relative group">JORGE LARRAIN
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-500 ease-out group-hover:w-full"></span>
              </a>
            </div>
            <div>
              <a href="mailto:blue@heybristol.com" className="font-extrabold text-[10px] md:text-xs lg:text-sm mb-1 md:mb-2 font-hagrid hover:opacity-80 transition-opacity inline-block relative group">AZUL CRESPO
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-500 ease-out group-hover:w-full"></span>
              </a>
            </div>
            <div>
              <a href="mailto:martin@heybristol.com" className="font-extrabold text-[10px] md:text-xs lg:text-sm mb-1 md:mb-2 font-hagrid hover:opacity-80 transition-opacity inline-block relative group">MARTÍN GIUDICESSI
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-500 ease-out group-hover:w-full"></span>
              </a>
            </div>
            <div>
              <a href="mailto:direccion@heybristol.com" className="font-extrabold text-[10px] md:text-xs lg:text-sm mb-1 md:mb-2 font-hagrid hover:opacity-80 transition-opacity inline-block relative group">ENRIQUE NAVA
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-500 ease-out group-hover:w-full"></span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Imagen del perro después */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-[44%] -translate-y-1/2 -translate-y-[18rem] md:-translate-y-[22.5rem] z-20">
        <div className="text-center">
          <div className="relative w-[16rem] h-[16rem] md:w-[28rem] md:h-[28rem] mb-0 mx-auto transition-all duration-500 ease-in-out">
            <Image 
              src="/images/galgoweb.png" 
              alt="Galgo" 
              fill 
              sizes="(max-width: 768px) 288px, 576px" 
              className="object-contain"
            />
          </div>
        </div>
      </div>


      {/* Footer Container */}
      <div className="absolute bottom-8 left-4 right-4 md:bottom-12 md:left-8 md:right-8 z-30">
        {/* Mobile: Logo and Privacy Policy in a row with baseline alignment */}
        <div className="flex flex-row items-baseline justify-between mb-4 md:hidden">
          {/* Footer - Bottom Left (BRISTOL Logo) */}
          <div className="flex items-baseline">
            <Image 
              src="/logo/bristol_2.png" 
              alt="Bristol Logo" 
              width={120} 
              height={40} 
              className="h-6 w-auto"
            />
          </div>

          {/* Footer - Bottom Right */}
          <div className="flex items-baseline">
            <div className="flex items-baseline space-x-2 text-black font-raleway">
              <a href="https://www.instagram.com/bristol________/" className="hover:opacity-80 transition-opacity text-[10px]">INSTAGRAM</a>
              <span className="text-black text-[8px]">|</span>
              <span className="font-light text-[8px]">PRIVACY POLICY</span>
              <span className="font-light text-[8px]">© 2025 BRISTOL</span>
            </div>
          </div>
        </div>

        {/* Mobile: Center Text below */}
        <div className="md:hidden">
          <div className="text-center text-black font-raleway">
            <p className="text-[7px] font-regular uppercase">Prado Sur 265, Lomas - Virreyes, Lomas de Chapultepec, Miguel Hidalgo, 11000 Ciudad de México, CDMX, México.</p>
          </div>
        </div>

        {/* Desktop: All elements in a row with baseline alignment */}
        <div className="hidden md:flex md:flex-row md:items-baseline md:justify-between">
          {/* Footer - Bottom Left (BRISTOL Logo) */}
          <div className="flex items-baseline">
            <Image 
              src="/logo/bristol_2.png" 
              alt="Bristol Logo" 
              width={120} 
              height={40} 
              className="h-10 w-auto"
            />
          </div>

          {/* Footer - Center Text */}
          <div className="flex-1 text-center">
            <div className="text-black font-raleway">
              <p className="text-[10px] font-medium uppercase">Prado Sur 265, Lomas - Virreyes, Lomas de Chapultepec, Miguel Hidalgo, 11000 Ciudad de México, CDMX, México.</p>
            </div>
          </div>

          {/* Footer - Bottom Right */}
          <div className="ml-auto flex items-baseline">
            <div className="flex items-baseline space-x-2 text-black font-raleway">
              <a href="https://www.instagram.com/bristol________/" className="hover:opacity-80 transition-opacity text-[12px]">INSTAGRAM</a>
              <span className="text-black text-[10px]">|</span>
              <span className="font-light text-[10px]">PRIVACY POLICY</span>
              <span className="font-light text-[10px]">© 2025 BRISTOL</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
