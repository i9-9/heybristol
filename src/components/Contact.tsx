import LogoB from "@/components/LogoB";
import Image from "next/image";

export default function Contact() {
  return (
    <section id="contact" className="relative bg-[#fa1016] w-full py-32 min-h-[100vh] md:py-[600px] pb-48 md:pb-64">
      {/* Logo B de Bristol arriba a la izquierda */}
      <div className="absolute top-6 left-6 md:top-8 md:left-8 z-30">
        <div className="w-10 md:w-24 h-auto text-[#e2e2e2]">
          <LogoB />
        </div>
      </div>
      
      {/* Título CONTACT */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -translate-y-[4rem] md:translate-y-[2rem] z-10">
        <div className="text-center">
          <h2 className="text-[clamp(3rem,12vw,6rem)] md:text-[6rem] font-tusker font-bold text-white leading-none tracking-tight transition-all duration-500 ease-in-out">
            CONTACT
          </h2>
        </div>
      </div>

      {/* Contact Information - Grid 2x2 */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 translate-y-[4rem] md:translate-y-[8rem] z-10">
        <div className="text-center">
          <div className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 md:gap-x-16 md:gap-y-4 text-black">
            <div>
              <a href="mailto:martin@heybristol.com" className="font-extrabold text-[10px] md:text-xs lg:text-sm mb-1 md:mb-2 font-hagrid hover:opacity-80 transition-opacity block">MARTÍN GIUDICESSI</a>
            </div>
            <div>
              <a href="mailto:blue@heybristol.com" className="font-extrabold text-[10px] md:text-xs lg:text-sm mb-1 md:mb-2 font-hagrid hover:opacity-80 transition-opacity block">AZUL CRESPO</a>
            </div>
            <div>
              <a href="mailto:jorge@heybristol.com" className="font-extrabold text-[10px] md:text-xs lg:text-sm mb-1 md:mb-2 font-hagrid hover:opacity-80 transition-opacity block">JORGE LARRAIN</a>
            </div>
            <div>
              <a href="mailto:direccion@heybristol.com" className="font-extrabold text-[10px] md:text-xs lg:text-sm mb-1 md:mb-2 font-hagrid hover:opacity-80 transition-opacity block">ENRIQUE NAVA</a>
            </div>
          </div>
        </div>
      </div>

      {/* Imagen del caballo después (capa superior) */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-[44%] -translate-y-1/2 -translate-y-[17rem] md:-translate-y-[21rem] z-20">
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

      {/* Lema (a la mitad izquierda) */}
{/*       <div className="absolute bottom-4 left-4 md:top-1/2 md:bottom-auto md:left-8 z-10 pointer-events-none transform -translate-y-1/2 md:transform-none md:translate-y-0">
        <p className="font-ordinary text-white text-sm md:text-xl leading-3 md:leading-4 text-left">
          LATIN
          <br />
          CREATIVE
          <br />
          PRODUCTION
        </p>
      </div> */}

      {/* BRISTOL alineado al baseline de PRODUCTION */}
{/*       <div className="absolute bottom-4 right-4 md:top-1/2 md:bottom-auto md:right-8 z-10 pointer-events-none transform -translate-y-1/2 md:transform-none md:translate-y-0">
        <p className="text-white font-ordinary text-sm md:text-xl leading-3 md:leading-4 text-left">
          BRISTOL
        </p>
      </div> */}

      {/* Footer - Bottom Left (BRISTOL Logo) */}
      <div className="absolute bottom-8 left-4 md:bottom-12 md:left-8 z-30">
        <Image 
          src="/logo/bristol_2.png" 
          alt="Bristol Logo" 
          width={120} 
          height={40} 
          className="h-6 md:h-10 w-auto"
        />
      </div>

      {/* Footer - Bottom Right */}
      <div className="absolute bottom-8 right-4 md:bottom-12 md:right-8 z-30">
        <div className="flex items-center space-x-2 text-black font-raleway">
          <a href="https://www.instagram.com/bristol________/" className="hover:opacity-80 transition-opacity text-[10px] md:text-sm">INSTAGRAM</a>
          <span className="text-black text-[8px] md:text-[10px]">|</span>
          <span className="font-light text-[8px] md:text-[10px]">PRIVACY POLICY</span>
          <span className="font-light text-[8px] md:text-[10px]">© 2025 BRISTOL</span>
        </div>
      </div>
    </section>
  );
}
