import Image from "next/image";
import LogoB from "@/components/LogoB";
import { useEffect, useState, useRef } from "react";

interface DirectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  directorName: string;
}

export default function DirectorModal({ isOpen, onClose, directorName }: DirectorModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setIsAnimating(true);
      // Start content animation after background animation
      setTimeout(() => setShowContent(true), 200);
    } else {
      setIsClosing(true);
      setShowContent(false);
      // Wait for closing animation to complete before hiding modal
      setTimeout(() => {
        setIsAnimating(false);
        setIsClosing(false);
      }, 500);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setShowContent(false);
    // Wait for content fade to complete, then slide modal out
    setTimeout(() => {
      // Start slide-out animation
      if (modalRef.current) {
        modalRef.current.style.transform = 'translate(-100%, -100%)';
        modalRef.current.style.opacity = '0';
      }
      // Wait for slide-out to complete before calling onClose
      setTimeout(() => {
        onClose();
      }, 500);
    }, 300);
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <div 
      ref={modalRef}
      className={`fixed inset-0 z-50 bg-black transition-all duration-500 ease-in-out ${
        isAnimating && !isClosing
          ? 'translate-x-0 translate-y-0 opacity-100' 
          : 'translate-x-0 translate-y-0 opacity-100'
      }`}
      style={{
        transform: isClosing ? 'translate(-100%, -100%)' : 'translate(0, 0)',
        opacity: isClosing ? 0 : 1
      }}
    >
      {/* Header with B Logo */}
      <div className={`absolute top-0 left-0 p-6 z-10 transition-all duration-300 ease-in-out ${
        isClosing ? 'delay-0' : 'delay-300'
      } ${
        showContent && !isClosing
          ? 'translate-x-0 translate-y-0 opacity-100' 
          : 'translate-x-8 translate-y-8 opacity-0'
      }`}>
        <div className="w-10 md:w-24 h-auto text-white">
          <LogoB />
        </div>
      </div>

      {/* Back to Directors Button */}
      <div className={`absolute top-6 right-6 z-10 transition-all duration-500 ease-in-out ${
        isClosing ? 'delay-0' : 'delay-300'
      } ${
        showContent && !isClosing
          ? 'translate-x-0 translate-y-0 opacity-100' 
          : 'translate-x-8 translate-y-8 opacity-0'
      }`}>
        <button 
          onClick={handleClose}
          className="flex items-center space-x-2 text-white hover:opacity-80 transition-opacity"
        >
          <span className="font-raleway text-sm md:text-base">DIRECTORS</span>
          <Image 
            src="/images/icons/arrow.png" 
            alt="Arrow Down" 
            width={16} 
            height={16} 
            className="w-4 h-4 transform rotate-180"
          />
        </button>
      </div>

      {/* Main Content Area */}
      <div className={`flex flex-col items-start justify-center h-full px-6 transition-all duration-500 ease-in-out ${
        isClosing ? 'delay-100' : 'delay-400'
      } ${
        showContent && !isClosing
          ? 'translate-x-0 translate-y-0 opacity-100' 
          : 'translate-x-12 translate-y-12 opacity-0'
      }`}>
        <h1 className="text-6xl md:text-8xl font-tusker font-bold text-white text-center mb-12">
          {directorName}
        </h1>
        
        {/* Placeholder for director content */}
        <div className="text-white text-center max-w-2xl">
          <p className="text-lg md:text-xl mb-6">
            Director content will go here...
          </p>
        </div>
      </div>

      {/* Footer - Latin Creative Production */}
      <div className={`absolute bottom-6 left-6 z-10 transition-all duration-500 ease-in-out ${
        isClosing ? 'delay-200' : 'delay-500'
      } ${
        showContent && !isClosing
          ? 'translate-x-0 translate-y-0 opacity-100' 
          : 'translate-x-8 translate-y-8 opacity-0'
      }`}>
        <p className="font-ordinary text-white text-sm md:text-xl leading-5">
          LATIN
          <br />
          CREATIVE
          <br />
          PRODUCTION
        </p>
      </div>

      {/* Footer - Bristol with Arrow */}
      <div className={`absolute bottom-6 right-6 z-10 transition-all duration-500 ease-in-out ${
        isClosing ? 'delay-200' : 'delay-500'
      } ${
        showContent && !isClosing
          ? 'translate-x-0 translate-y-0 opacity-100' 
          : 'translate-x-8 translate-y-8 opacity-0'
      }`}>
        <button 
          onClick={handleClose}
          className="flex flex-col items-end space-y-2 text-white hover:opacity-80 transition-opacity"
        >
          <Image 
            src="/images/icons/arrow.png" 
            alt="Arrow Up" 
            width={32} 
            height={32} 
            className="w-8 h-8"
          />
          <span className="font-ordinary text-sm md:text-xl">BRISTOL</span>
        </button>
      </div>
    </div>
  );
}
