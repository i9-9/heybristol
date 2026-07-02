"use client";

import { useState, useEffect, useRef } from "react";
import { EditorialVideo } from "@/lib/contentful";

interface EditorialVideoProps {
  video: EditorialVideo;
  className?: string;
  isMobile?: boolean;
}

export default function EditorialVideoComponent({ 
  video, 
  className = "", 
  isMobile = false 
}: EditorialVideoProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const getBestVideoSource = (editorialVideo: EditorialVideo, mobile: boolean = false) => {
    if (mobile && editorialVideo.mobileVideo) {
      return {
        src: `https:${editorialVideo.mobileVideo.fields.file.url}`,
        type: editorialVideo.mobileVideo.fields.file.contentType.includes('webm') ? 'webm' : 'mp4'
      };
    }

    const supportsWebM =
      typeof document !== 'undefined'
        ? document.createElement('video').canPlayType('video/webm; codecs="vp9"').replace(/no/, '') !== ''
        : Boolean(editorialVideo.webmVideo);

    if (supportsWebM && editorialVideo.webmVideo) {
      return {
        src: `https:${editorialVideo.webmVideo.fields.file.url}`,
        type: 'webm'
      };
    }

    if (editorialVideo.mp4Video) {
      return {
        src: `https:${editorialVideo.mp4Video.fields.file.url}`,
        type: 'mp4'
      };
    }

    return null;
  };

  const videoSource = getBestVideoSource(video, isMobile);

  useEffect(() => {
    // Detect iOS devices and Safari
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);
  }, []);

  useEffect(() => {
    if (videoRef.current && videoSource) {
      const videoElement = videoRef.current;
      
      const handleLoadedData = () => {
        setIsLoaded(true);
        setHasError(false);
        
        // Force play on Safari/iOS after video loads
        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            // Autoplay was prevented, likely on iOS
            console.log('Autoplay prevented:', error);
          });
        }
      };
      
      const handleError = () => {
        setHasError(true);
        setIsLoaded(false);
      };

      const handleUserInteraction = () => {
        setUserInteracted(true);
        // Try to play the video after user interaction
        if (videoElement.paused) {
          videoElement.play().catch(console.error);
        }
      };
      
      videoElement.addEventListener('loadeddata', handleLoadedData);
      videoElement.addEventListener('error', handleError);
      
      // Add click listener for iOS autoplay
      if (isIOS) {
        videoElement.addEventListener('click', handleUserInteraction);
        videoElement.addEventListener('touchstart', handleUserInteraction);
      }
      
      return () => {
        videoElement.removeEventListener('loadeddata', handleLoadedData);
        videoElement.removeEventListener('error', handleError);
        if (isIOS) {
          videoElement.removeEventListener('click', handleUserInteraction);
          videoElement.removeEventListener('touchstart', handleUserInteraction);
        }
      };
    }
  }, [videoSource, isIOS]);

  if (!videoSource || hasError) {
    return (
      <div className={`relative bg-black overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.15)] ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="text-white text-center">
            <div className="text-4xl mb-2">🎬</div>
            <div className="text-sm opacity-75">{video.title}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-black overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.15)] ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        preload="auto"
        webkit-playsinline="true"
        x5-playsinline="true"
        x5-video-player-type="h5"
        x5-video-player-fullscreen="false"
        style={{ 
          pointerEvents: 'none',
          WebkitMaskImage: '-webkit-radial-gradient(white, black)',
        }}
      >
        <source src={videoSource.src} type={`video/${videoSource.type}`} />
        Tu navegador no soporta el elemento de video.
      </video>
      
      {/* Transparent overlay to block native controls and play button */}
      <div 
        className="absolute inset-0 z-10 bg-transparent"
        style={{ 
          pointerEvents: 'auto',
          touchAction: 'none',
          WebkitTapHighlightColor: 'transparent',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />
      
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <div className="text-sm opacity-75">Loading...</div>
          </div>
        </div>
      )}
    </div>
  );
}
