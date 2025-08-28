import LogoB from "@/components/LogoB";
import Image from "next/image";

export default function Contact() {
  return (
    <section id="contact" className="relative bg-[#fa1016] w-full min-h-[150vh] pt-12">
      {/* Logo B de Bristol arriba a la izquierda */}
      <div className="mx-app">
        <div className="w-10 md:w-24 h-auto text-[#e2e2e2] self-start">
          <LogoB />
        </div>
      </div>
      
      {/* Texto CONTACT primero (capa inferior) */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -translate-y-[8rem] md:-translate-y-[4rem] z-10">
        <div className="text-center">
          <h2 className="text-[clamp(4rem,15vw,8.75rem)] md:text-[8.75rem] font-tusker font-bold text-white leading-none tracking-tight transition-all duration-500 ease-in-out">
            CONTACT
          </h2>
          
          {/* Contact Information */}
          <div className="mt-8 md:mt-16 space-y-4 md:space-y-8 text-black">
            <div>
              <p className="font-extrabold text-lg md:text-2xl lg:text-3xl mb-1 md:mb-2 font-hagrid">MARTÍN GIUDICESSI</p>
              <a href="mailto:MARTIN@HEYBRISTOL.COM" className="text-sm md:text-lg lg:text-xl hover:opacity-80 transition-opacity">MARTIN@HEYBRISTOL.COM</a>
            </div>
            <div>
              <p className="font-extrabold text-lg md:text-2xl lg:text-3xl mb-1 md:mb-2 font-hagrid">AZUL CRESPO</p>
              <a href="mailto:AZUL@HEYBRISTOL.COM" className="text-sm md:text-lg lg:text-xl hover:opacity-80 transition-opacity">AZUL@HEYBRISTOL.COM</a>
            </div>
            <div>
              <p className="font-extrabold text-lg md:text-2xl lg:text-3xl mb-1 md:mb-2 font-hagrid">JORGE LARRAIN</p>
              <a href="mailto:JORGE@HEYBRISTOL.COM" className="text-sm md:text-lg lg:text-xl hover:opacity-80 transition-opacity">JORGE@HEYBRISTOL.COM</a>
            </div>
          </div>
        </div>
      </div>

      {/* Imagen del caballo después (capa superior) */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -translate-y-[23rem] md:-translate-y-[32rem] z-20">
        <div className="text-center">
          <div className="relative w-[18rem] h-[18rem] md:w-[36rem] md:h-[36rem] mb-0 mx-auto transition-all duration-500 ease-in-out">
            <Image 
              src="/images/caballo.png" 
              alt="Caballo" 
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

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <div className="bg-transparent py-40 md:py-14 px-4 md:px-8">
          {/* Mobile: Links y Privacy Policy arriba */}
          <div className="md:hidden flex flex-wrap justify-center space-x-2 text-black font-raleway text-[10px] mb-6">
            <a href="https://www.instagram.com/bristol________/" className="hover:opacity-80 transition-opacity">INSTAGRAM</a>
            <span className="mx-1">•</span>
            <span className="font-light">PRIVACY POLICY</span>
            <span className="mx-1">•</span>
            <span className="font-light">© 2025 BRISTOL</span>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 relative">
            {/* Left - Bristol Logo (hidden on mobile) */}
            <div className="hidden md:flex flex-shrink-0 absolute left-0">
              <Image 
                src="/logo/bristol_2.png" 
                alt="Bristol Logo" 
                width={180} 
                height={60} 
                className="h-16 w-auto"
              />
            </div>
            
            {/* Desktop: Center social media */}
            <div className="hidden md:flex justify-center text-black font-raleway text-base">
              <a href="https://www.instagram.com/bristol________/" className="hover:opacity-80 transition-opacity">INSTAGRAM</a>
            </div>
            
            {/* Desktop: Privacy Policy & Copyright */}
            <div className="hidden md:block text-black text-[9px] font-raleway absolute right-0">
              <span className="mr-2 font-light">PRIVACY POLICY</span>
              <span className="font-light">© 2025 BRISTOL</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
