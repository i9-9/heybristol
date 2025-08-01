"use client";

import { useState, useRef } from "react";
import { Volume2, VolumeX, Mail, Check } from "lucide-react";

export default function Home() {
  const [isMuted, setIsMuted] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const toggleAudio = () => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const player = iframe.contentWindow;
      
      if (isMuted) {
        // Unmute the video
        player?.postMessage('{"method":"setVolume","value":1}', '*');
        setIsMuted(false);
      } else {
        // Mute the video
        player?.postMessage('{"method":"setVolume","value":0}', '*');
        setIsMuted(true);
      }
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText('hey@heybristol.com');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (err) {
      console.error('Error al copiar email:', err);
    }
  };

  return (
    <>
      {/* Video en pantalla completa absoluta */}
      <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black">
        <iframe
          ref={iframeRef}
          title="vimeo-player"
          src="https://player.vimeo.com/video/1106255498?h=d393413076&autoplay=1&muted=1&loop=1&background=1&controls=0&quality=auto&speed=1&preload=metadata&dnt=1"
          className="absolute top-0 left-1/2"
          loading="eager"
          style={{
            height: '100vh', // SIEMPRE todo el alto
            width: '177.78vh', // Ancho calculado para 16:9 aspect ratio (100vh * 16/9)
            minHeight: '100vh',
            border: 'none',
            margin: 0,
            padding: 0,
            transform: 'translateX(-50%)', // Centrar horizontalmente
          }}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
          allowFullScreen
        />
      </div>
      
      {/* Logo y botón de email en el centro de la pantalla */}
      <div className="fixed inset-0 flex flex-col items-center justify-center z-40 pointer-events-none gap-8">
        <div className="w-[60vw] max-w-[500px] min-w-[300px] h-auto mb-8">
          <svg 
            id="Layer_2" 
            data-name="Layer 2" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 740 311.67"
            className="w-full h-auto"
          >
            <defs>
              <style>
                {`.cls-1 {
                  fill: #fff;
                }`}
              </style>
            </defs>
            <g id="Layer_1-2" data-name="Layer 1">
              <g>
                <g>
                  <g>
                    <path className="cls-1" d="M213.3,92c0-6.2.2-13.7.4-22.6.2-8.8.2-16.3.2-22.6s0-9.4-.1-14.7c0-5.3-.2-10.7-.2-16.1,0-2.7-.1-5.2-.2-7.6V1.8h46.3c9.3,0,16.7.5,22.3,1.5s10,3,13.2,6.1,4.8,7.7,4.8,13.8-.9,8.5-2.8,11.5c-1.9,2.9-5.3,5.2-10.4,6.8-5.1,1.6-12.6,2.6-22.3,3v1.9c10.1.4,17.8,1.3,23.2,2.8s9.2,3.6,11.3,6.4,3.2,6.6,3.2,11.5-1.4,11.6-4.3,15.2c-2.9,3.6-7.2,6.1-13,7.6s-13.4,2.2-23,2.2h-48.4l-.2-.1ZM255.7,38.1c2.2,0,4-.6,5.4-1.7s2.1-3,2.1-5.6-.7-4.3-2.2-5.3-3.4-1.5-5.8-1.5h-7.1v14.2h7.6v-.1ZM255.9,67.5c2.1,0,3.9-.2,5.4-.6s2.7-1.2,3.5-2.2c.8-1.1,1.2-2.5,1.2-4.4s-.9-4.3-2.7-5.3c-1.8-1-4.4-1.5-7.8-1.5h-7.4v14.2h7.8v-.2Z"/>
                    <path className="cls-1" d="M305.4,92c0-3.3.2-8.2.4-14.6,0-5,.1-10.1.2-15.2v-15.2c0-5.1,0-15.3-.2-27.4,0-3-.1-6-.2-8.9,0-3,0-5.9-.2-8.8h48.3c9.2,0,16.7.7,22.4,2s10.2,3.8,13.2,7.3c3.1,3.5,4.6,8.5,4.6,14.9s-1.1,11.4-3.2,14.9c-2.2,3.6-5.5,6.1-10.1,7.6s-10.7,2.2-18.3,2.2v2.1c11.5,0,19.6,1.4,24.4,4.3,4.8,2.8,7.2,7.3,7.2,13.3s.4,5.9,1.2,10.8,1.6,8.4,2.4,10.6h-38.4c-.2-2-.5-4.8-.8-8.4-.3-3.2-.5-7.3-.5-12.2s-.2-4.1-.5-5.3c-.3-1.2-1-2-2-2.6s-2.7-.8-5.1-.8h-9.3c0,1.6-.1,5.3-.1,11.2s0,11,.1,15.3v2.8h-35.5v.1ZM347.7,43.4c2.9,0,5.2-.7,7-2.1,1.7-1.4,2.6-3.7,2.6-7s-.4-3.9-1.2-5.2c-.8-1.3-2-2.1-3.4-2.7-1.5-.5-3.2-.8-5.4-.8h-6.7v17.7h7.2l-.1.1Z"/>
                    <path className="cls-1" d="M400.5,92c.4-10,.6-25,.6-45.1s-.2-35-.6-45h35.4c-.4,10-.6,25-.6,44.9s.2,35.1.6,45.2h-35.4Z"/>
                    <path className="cls-1" d="M486.9,93.4c-10,0-18.2-.9-24.7-2.7-6.5-1.8-11.7-4.9-15.5-9.4s-6.1-10.7-6.9-18.8l38.7-3.1c0,2.8.6,5.2,1.8,7.3,1.2,2.1,3.6,3.1,7,3.1h5.5v-7.1c0-2-.2-3.5-.6-4.5-.4-1-1.2-1.8-2.4-2.3s-3.1-.8-5.7-.8c-11.3,0-20-1.1-26.3-3.2-6.3-2.2-10.6-5.1-12.9-8.8-2.4-3.7-3.5-8.3-3.5-13.7,0-9.6,3.9-16.9,11.7-21.9s18.1-7.5,30.8-7.5,25.5,3,32.8,8.9,11.3,15.3,12.1,27.9l-35.7,2.2v-1.8c0-3.2-.3-5.6-.6-7.3-.4-1.6-1.3-2.9-2.7-3.8-1.5-.9-3.8-1.4-7-1.4h-5.7c0,1.9,0,3.3.1,4.2v4.4c0,2,.2,3.7.6,4.9.4,1.2,1.3,2.2,2.5,2.9,1.2.7,3,1.1,5.4,1.1,11.9,0,20.9.8,27,2.4s10.2,3.9,12.3,7,3.2,7.4,3.2,12.8-1.8,11.3-5.4,15.6c-3.6,4.3-8.6,7.6-14.8,9.9-6.3,2.2-13.3,3.4-21.1,3.4v.1Z"/>
                  </g>
                  <g>
                    <path className="cls-1" d="M235.7,189.4c.5-19.4.7-33.8.7-43.5s0-14.8-.2-20.2c-6.1,0-16.5.2-24,.5v-26.9h87.2v26.9c-6.5-.3-20.6-.5-28-.5v7.1c0,3.3,0,6.7-.1,10.3v5.9c0,13.6.1,27,.4,40.3h-35.9l-.1.1Z"/>
                    <path className="cls-1" d="M320,186.3c-6.4-3.1-11-8.1-13.8-14.9s-4.3-15.9-4.3-27.2,1.5-20.2,4.4-26.9c2.9-6.8,7.2-12.3,13.7-14.9,7.6-3.1,24.6-4.7,47.8-4.7s38.9.9,47.2,4.8c6.5,3.1,11.2,8.2,14.2,15.1s4.5,16,4.5,27.3-1.5,19.9-4.5,26.6-7.7,11.7-14.1,14.8c-3.9,1.9-23,4.7-43.2,4.7s-45.5-1.6-51.8-4.7h-.1ZM370.7,166.3h6.4v-20.5c0-4.1-.3-7.8-.8-11.2-.6-3.4-1.5-6.2-2.9-8.3-1.4-2.2-3.3-3.2-5.7-3.2h-13.7v20.1c0,4.1.3,7.9.9,11.3.6,3.5,1.6,6.3,3.1,8.6,1.5,2.2,10.3,3.4,12.8,3.4l-.1-.2Z"/>
                    <path className="cls-1" d="M437.8,189.4c.4-16.8.6-31.8.6-45s-.2-28.3-.6-45.1h36.1c-.3,13.3-.5,26.8-.5,40.6s0,16,.2,22.3c9.1,0,38.3,0,42.8-.1h9.9l-2.6,27.4h-86l.1-.1Z"/>
                  </g>
                  <rect className="cls-1" x="212.1" y="197.8" width="280.5" height="21.4"/>
                  <path className="cls-1" d="M512.7,224.4c-3.8,0-6.8-.5-9-1.5s-3.8-2.6-4.7-4.7c-1-2.2-1.5-5.2-1.5-9s.5-6.8,1.5-9,2.6-3.7,4.7-4.7c2.2-1,5.2-1.4,9-1.4s6.8.5,9,1.4c2.2,1,3.8,2.5,4.7,4.7,1,2.2,1.5,5.2,1.5,9s-.5,6.8-1.5,9-2.6,3.8-4.7,4.7c-2.2,1-5.2,1.5-9,1.5ZM512.7,222.1c3.2,0,5.8-.4,7.7-1.2,1.9-.8,3.2-2.2,4-4,.8-1.9,1.2-4.4,1.2-7.7s-.4-5.8-1.2-7.7c-.8-1.9-2.2-3.2-4-4-1.9-.8-4.4-1.2-7.7-1.2s-5.8.4-7.7,1.2c-1.9.8-3.2,2.2-4,4-.8,1.9-1.2,4.4-1.2,7.7s.4,5.8,1.2,7.7c.8,1.9,2.2,3.2,4,4,1.9.8,4.4,1.2,7.7,1.2ZM503.5,219.1v-19.6h10.5c2,0,3.6.1,4.9.4,1.3.3,2.2.8,2.9,1.6.7.8,1,1.9,1,3.3s-.2,2.5-.7,3.2c-.5.8-1.2,1.3-2.2,1.7-1,.3-2.3.5-4,.5v.5c2.5,0,4.3.3,5.3.9,1.1.6,1.6,1.6,1.6,2.9s0,.5,0,.9c0,.3.1.7.2,1.2.4,2.2.7,3.6.9,4.2l-7.6,2.7c-.6-1.4-1-2.8-1.2-4.2-.2-1.5-.2-2.9-.2-4.4s0-.9,0-1.2-.2-.4-.4-.6c-.2-.1-.6-.2-1.1-.2h-2.1v6.4h-7.8v-.2ZM512.2,208.5c.6,0,1.1-.2,1.5-.5s.6-.8.6-1.5,0-.9-.3-1.1c-.2-.3-.4-.5-.8-.6-.3-.1-.7-.2-1.2-.2h-1.5v3.9h1.7Z"/>
                </g>
                <g>
                  <path className="cls-1" d="M0,275.4h8.8l4,21.7,1.1,8.8h.2l1.2-8.8,4-21.8h9.1l4,21.8,1.2,8.8h.2l1.1-8.8,4-21.7h8.8l-8.2,35.5h-10.2l-5.3-30.5h-.1l-5.3,30.5h-10.2L.2,275.4h-.2Z"/>
                  <path className="cls-1" d="M49,275.4h25.5v6.6h-17.3v7.7h16.2v6.5h-16.2v8.1h17.9v6.6h-26v-35.5h-.1Z"/>
                  <path className="cls-1" d="M98.9,275.4h11.2l11.9,35.5h-8.6l-2.4-8.4h-13l-2.4,8.4h-8.6l11.9-35.5ZM109.2,296l-4.6-16.3h-.1l-4.6,16.3h9.3Z"/>
                  <path className="cls-1" d="M135.1,274.9c10.3,0,15.3,3.3,15.3,10.6s-3.4,8.7-8.6,10.3l10.5,15.1h-9l-10.9-16.3c6.6-.8,9.8-3.2,9.8-7.8s-2.3-5.8-6.9-5.8-2.8,0-4.1.2v29.7h-8v-35.5c1.8-.1,6.4-.4,11.8-.4l.1-.1Z"/>
                  <path className="cls-1" d="M153.7,275.4h25.5v6.6h-17.3v7.7h16.2v6.5h-16.2v8.1h17.9v6.6h-26v-35.5h-.1Z"/>
                  <path className="cls-1" d="M192.7,298v-22.6h8v22.1c0,4.9,2.3,7.4,7.2,7.4s7.2-2.5,7.2-7.4v-22.1h8.1v22.6c0,8.6-4.9,13.4-15.3,13.4s-15.2-4.8-15.2-13.4h0Z"/>
                  <path className="cls-1" d="M226.8,275.4h9.5l13.8,24.7h.1l-.2-6.7v-18h7.6v35.5h-9.5l-13.8-24.7h0v6.7c.1,0,.1,18,.1,18h-7.5v-35.5h-.1Z"/>
                  <path className="cls-1" d="M272.8,275c13,0,19,5.7,19,17.3s-7.3,18.5-19.4,18.5h-11.2v-35.5c3.9-.2,7.8-.4,11.6-.4v.1ZM272.5,304.3c6.7,0,11.2-3.5,11.2-12s-4-10.8-10.3-10.8-3.2,0-4.1.1v22.7h3.2,0Z"/>
                  <path className="cls-1" d="M294.2,275.4h25.5v6.6h-17.3v7.7h16.2v6.5h-16.2v8.1h17.9v6.6h-26v-35.5h-.1Z"/>
                  <path className="cls-1" d="M334.8,274.9c10.3,0,15.3,3.3,15.3,10.6s-3.4,8.7-8.6,10.3l10.5,15.1h-9l-10.9-16.3c6.6-.8,9.8-3.2,9.8-7.8s-2.3-5.8-6.9-5.8-2.8,0-4.1.2v29.7h-8v-35.5c1.8-.1,6.4-.4,11.8-.4l.1-.1Z"/>
                  <path className="cls-1" d="M364.1,293.1c0-10.3,5.4-18.3,17.6-18.3s14.9,3.3,16.6,12.8l-7.6,1.9c-.9-5.5-4.8-8-8.8-8-6.2,0-9.6,4.7-9.6,11.7s3.4,11.7,9.6,11.7,7.9-1.7,8.9-7.7l7.5,1.5c-1.6,9.4-8.4,12.8-16.6,12.8-12.2,0-17.6-8-17.6-18.3v-.1Z"/>
                  <path className="cls-1" d="M399,293.1c0-10.3,5.8-18.3,17.9-18.3s17.9,8,17.9,18.3-5.8,18.3-17.9,18.3-17.9-8-17.9-18.3ZM416.9,304.8c6.3,0,9.7-4.7,9.7-11.7s-3.4-11.7-9.7-11.7-9.7,4.7-9.7,11.7,3.5,11.7,9.7,11.7Z"/>
                  <path className="cls-1" d="M437.1,275.4h9.5l13.8,24.7h.1l-.2-6.7v-18h7.6v35.5h-9.5l-13.8-24.7h0v6.7c.1,0,.1,18,.1,18h-7.5v-35.5h-.1Z"/>
                  <path className="cls-1" d="M469.7,305.2l4.2-6.8c3,4.7,7.6,6.4,11.8,6.4s6.9-1.3,6.9-3.9c0-6.6-21.2-2.9-21.2-15.6s5.7-10.3,14.3-10.3,11.2,2,15.1,6.1l-5.3,5.4c-2.5-3.1-6-5-9.7-5s-5.7,1.6-5.7,3.6c0,6,21.2,2.9,21.2,15.5s-5.6,11-15.6,11-11.8-1.4-16.1-6.3l.1-.1Z"/>
                  <path className="cls-1" d="M512.7,282.2h-10.7v-6.8h29.4v6.8h-10.7v28.7h-8.1v-28.7h.1Z"/>
                  <path className="cls-1" d="M544.7,274.9c10.3,0,15.3,3.3,15.3,10.6s-3.4,8.7-8.6,10.3l10.5,15.1h-9l-10.9-16.3c6.6-.8,9.8-3.2,9.8-7.8s-2.3-5.8-6.9-5.8-2.8,0-4.1.2v29.7h-8v-35.5c1.8-.1,6.4-.4,11.8-.4l.1-.1Z"/>
                  <path className="cls-1" d="M562.9,298v-22.6h8v22.1c0,4.9,2.3,7.4,7.2,7.4s7.2-2.5,7.2-7.4v-22.1h8.1v22.6c0,8.6-4.9,13.4-15.3,13.4s-15.2-4.8-15.2-13.4Z"/>
                  <path className="cls-1" d="M595.6,293.1c0-10.3,5.4-18.3,17.6-18.3s14.9,3.3,16.6,12.8l-7.6,1.9c-.9-5.5-4.8-8-8.8-8-6.2,0-9.6,4.7-9.6,11.7s3.4,11.7,9.6,11.7,7.9-1.7,8.9-7.7l7.5,1.5c-1.6,9.4-8.4,12.8-16.6,12.8-12.2,0-17.6-8-17.6-18.3v-.1Z"/>
                  <path className="cls-1" d="M640.6,282.2h-10.7v-6.8h29.4v6.8h-10.7v28.7h-8.1v-28.7h.1Z"/>
                  <path className="cls-1" d="M660.7,310.9v-35.5h8.1v35.5h-8.1Z"/>
                  <path className="cls-1" d="M671.2,293.1c0-10.3,5.8-18.3,17.9-18.3s17.9,8,17.9,18.3-5.8,18.3-17.9,18.3-17.9-8-17.9-18.3ZM689,304.8c6.3,0,9.7-4.7,9.7-11.7s-3.4-11.7-9.7-11.7-9.7,4.7-9.7,11.7,3.5,11.7,9.7,11.7Z"/>
                  <path className="cls-1" d="M709.2,275.4h9.5l13.8,24.7h.1l-.2-6.7v-18h7.6v35.5h-9.5l-13.8-24.7h0v6.7c.1,0,.1,18,.1,18h-7.5v-35.5h-.1Z"/>
                </g>
              </g>
            </g>
          </svg>
        </div>
        
        {/* Botón del email */}
        <button
          onClick={copyEmail}
          className="bg-white/10 backdrop-blur-md hover:bg-white/20 px-6 py-3 rounded-lg transition-all duration-300 shadow-lg flex items-center gap-3 pointer-events-auto"
        >
          <Mail className="w-5 h-5 text-white" />
          <span className="text-white font-medium text-sm md:text-base">hey@heybristol.com</span>
        </button>
      </div>
      
      {/* Notificación de email copiado */}
      {showNotification && (
        <div className="fixed top-4 right-4 md:top-6 md:right-6 bg-green-500/90 backdrop-blur-md text-white px-8 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-top-2 duration-300">
          <Check className="w-5 h-5" />
          <span className="font-medium">E-mail copiado al portapapeles</span>
        </div>
      )}
      
      {/* Botón de audio en la esquina inferior derecha - Versión Minimal */}
      <button
        onClick={toggleAudio}
        className="fixed bottom-4 right-8 md:bottom-6 md:right-8 w-16 h-16 rounded-lg transition-all duration-200 bg-white/10 backdrop-blur-md hover:bg-white/20 shadow-lg flex items-center justify-center z-50 touch-manipulation"
        style={{ zIndex: 9999 }}
        aria-label={isMuted ? "Activar audio" : "Silenciar audio"}
      >
        {isMuted ? (
          <VolumeX className="w-7 h-7 text-white" />
        ) : (
          <Volume2 className="w-7 h-7 text-white" />
        )}
      </button>
    </>
  );
}