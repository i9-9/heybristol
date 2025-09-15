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
  const videoRef = useRef<HTMLVideoElement>(null);

  const getBestVideoSource = (editorialVideo: EditorialVideo, isMobile: boolean = false) => {
    
    if (isMobile && editorialVideo.mobileVideo) {
      return {
        src: `https:${editorialVideo.mobileVideo.fields.file.url}`,
        type: editorialVideo.mobileVideo.fields.file.contentType.includes('webm') ? 'webm' : 'mp4'
      };
    }
    
    const video = document.createElement('video');
    const supportsWebM = video.canPlayType('video/webm; codecs="vp9"').replace(/no/, '') !== '';
    
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
    if (videoRef.current && videoSource) {
      const videoElement = videoRef.current;
      
      const handleLoadedData = () => {
        setIsLoaded(true);
        setHasError(false);
      };
      
      const handleError = () => {
        setHasError(true);
        setIsLoaded(false);
      };
      
      videoElement.addEventListener('loadeddata', handleLoadedData);
      videoElement.addEventListener('error', handleError);
      
      return () => {
        videoElement.removeEventListener('loadeddata', handleLoadedData);
        videoElement.removeEventListener('error', handleError);
      };
    }
  }, [videoSource]);

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
        preload="metadata"
      >
        <source src={videoSource.src} type={`video/${videoSource.type}`} />
        Tu navegador no soporta el elemento de video.
      </video>
      
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <div className="text-sm opacity-75">Loading...</div>
          </div>
        </div>
      )}
    </div>
  );
}
