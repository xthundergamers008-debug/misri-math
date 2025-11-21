import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, CheckCircle } from 'lucide-react';

interface CameraInputProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

const CameraInput: React.FC<CameraInputProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
      }
    }
  };

  const confirmPhoto = () => {
    if (capturedImage) {
        // Stop stream before proceeding
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        onCapture(capturedImage);
    }
  };

  const retake = () => {
    setCapturedImage(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {!capturedImage ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        ) : (
          <img 
            src={capturedImage} 
            alt="Captured" 
            className="w-full h-full object-contain"
          />
        )}
        
        {/* Overlay for scanning guide */}
        {!capturedImage && (
           <div className="absolute inset-0 border-[30px] border-black/50 pointer-events-none flex items-center justify-center">
              <div className="w-full h-0.5 bg-red-500 opacity-50"></div>
           </div>
        )}
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/40 rounded-full text-white"
        >
          <X size={24} />
        </button>
      </div>

      <div className="h-32 bg-black flex items-center justify-around px-8">
        <canvas ref={canvasRef} className="hidden" />
        
        {!capturedImage ? (
          <button 
            onClick={takePhoto}
            className="w-16 h-16 rounded-full border-4 border-white bg-transparent flex items-center justify-center hover:bg-white/20 transition"
          >
            <div className="w-12 h-12 bg-white rounded-full"></div>
          </button>
        ) : (
          <>
             <button 
               onClick={retake}
               className="px-6 py-2 text-white font-medium hover:bg-white/10 rounded-full"
             >
               Retake
             </button>
             <button 
               onClick={confirmPhoto}
               className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primaryHover transition"
             >
               <CheckCircle size={32} />
             </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CameraInput;
