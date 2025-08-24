import LogoB from "@/components/LogoB";
import Image from "next/image";

export default function Contact() {
  return (
    <section className="relative bg-[#fa1016] w-full min-h-[200vh] pt-12">
      {/* Logo B de Bristol arriba a la izquierda */}
      <div className="mx-app">
        <div className="w-10 md:w-24 h-auto text-[#e2e2e2] self-start">
          <LogoB />
        </div>
      </div>
      
      {/* Texto CONTACT primero (capa inferior) */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -translate-y-[8rem] z-10">
        <div className="text-center">
          <h2 className="text-[8.75rem] font-tusker font-bold text-white leading-none tracking-tight">
            CONTACT
          </h2>
          
          {/* Contact Information */}
          <div className="mt-16 space-y-8 text-black">
            <div>
              <p className="font-extrabold text-2xl md:text-3xl mb-2 font-hagrid">MARTÍN GIUDICESSI</p>
              <p className="text-lg md:text-xl">MARTIN@HEYBRISTOL.COM</p>
            </div>
            <div>
              <p className="font-extrabold text-2xl md:text-3xl mb-2 font-hagrid">AZUL CRESPO</p>
              <p className="text-lg md:text-xl">AZUL@HEYBRISTOL.COM</p>
            </div>
            <div>
              <p className="font-extrabold text-2xl md:text-3xl mb-2 font-hagrid">JORGE LARRAIN</p>
              <p className="text-lg md:text-xl">JORGE@HEYBRISTOL.COM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Imagen del caballo después (capa superior) */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -translate-y-[36rem] z-20">
        <div className="text-center">
          <div className="relative w-[36rem] h-[36rem] mb-0 mx-auto">
            <Image 
              src="/images/caballo.png" 
              alt="Caballo" 
              fill 
              sizes="576px" 
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Lema (a la mitad izquierda) */}
      <div className="absolute top-1/2 left-4 md:left-8 z-10 pointer-events-none transform -translate-y-1/2">
        <p className="font-ordinary text-white text-sm md:text-xl leading-5 text-left">
          LATIN
          <br />
          CREATIVE
          <br />
          PRODUCTION
        </p>
      </div>

      {/* BRISTOL alineado al baseline de PRODUCTION */}
      <div className="absolute top-1/2 right-4 md:right-8 z-10 pointer-events-none transform -translate-y-1/2 translate-y-[1.25rem]">
        <p className="text-white font-ordinary text-sm md:text-xl leading-5 text-left">
          BRISTOL
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <div className="bg-transparent py-6 px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Left - Bristol Logo */}
            <div className="flex-shrink-0">
              <Image 
                src="/logo/bristol_2.png" 
                alt="Bristol Logo" 
                width={120} 
                height={40} 
                className="h-10 w-auto"
              />
            </div>
            
            {/* Center - Social Media Links */}
            <div className="flex space-x-8 text-black font-raleway">
              <a href="#" className="hover:opacity-80 transition-opacity">VIMEO</a>
              <a href="#" className="hover:opacity-80 transition-opacity">INSTAGRAM</a>
              <a href="#" className="hover:opacity-80 transition-opacity">LINKEDIN</a>
            </div>
            
            {/* Right - Privacy Policy & Copyright */}
            <div className="text-black text-sm md:text-base font-raleway">
              <span className="mr-4">PRIVACY POLICY</span>
              <span>© 2025 BRISTOL</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
