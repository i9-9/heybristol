import Link from "next/link";
import LogoB from "@/components/LogoB";

export default function NotFound() {
  return (
    <main className="relative min-h-screen w-full bg-black flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute top-6 left-6 md:top-8 md:left-8 z-10">
        <Link href="/" className="block w-10 md:w-24 text-[#f31014]">
          <LogoB color="#f31014" />
        </Link>
      </div>

      <div className="mx-app flex flex-col items-center text-center gap-4 md:gap-6 animate-fadeIn">
        <p className="font-tusker text-[clamp(6rem,28vw,14rem)] leading-none tracking-tight text-[#f31014]">
          404
        </p>

        <div className="w-full max-w-[280px] h-px bg-[#f31014]/40" />

        <h1 className="font-hagrid uppercase text-white text-[clamp(1.25rem,4vw,2rem)] tracking-tight font-bold animate-slideUp">
          Page not found
        </h1>

        <p className="font-hagrid-text text-[#e2e2e2] text-sm md:text-base max-w-md leading-relaxed animate-slideUp">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Link
          href="/"
          className="mt-4 md:mt-6 font-hagrid uppercase text-xs md:text-sm tracking-wide text-[#f31014] border-b-2 border-[#f31014] pb-0.5 hover:text-white hover:border-white transition-colors duration-300 animate-slideUp"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
