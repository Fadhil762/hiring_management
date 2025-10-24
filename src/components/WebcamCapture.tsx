'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';

interface WebcamCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

export default function WebcamCapture({ onCapture, onClose }: WebcamCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [capturing, setCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [detectedGesture, setDetectedGesture] = useState<string>('');
  const [showInstructions, setShowInstructions] = useState(true);
  const gestureTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Capture photo
  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
      onClose();
    }
  }, [onCapture, onClose]);

  // Start countdown when gesture detected
  const startCountdown = useCallback(() => {
    if (capturing) return;
    
    setCapturing(true);
    setShowInstructions(false);
    let count = 3;
    setCountdown(count);
    
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        setCountdown(null);
        clearInterval(interval);
        capturePhoto();
      }
    }, 1000);
  }, [capturing, capturePhoto]);

  // Gesture detection using basic hand tracking
  const detectGesture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    // Simple gesture detection: look for hand-like shapes in the image
    // In a real app, you'd use TensorFlow.js or MediaPipe for proper hand tracking
    // For now, we'll trigger on any sudden movement or use a timer
    
    // Simulate gesture detection (in production, use proper ML model)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new window.Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      // Simple motion detection by analyzing image brightness changes
      // This is a placeholder - in production use proper gesture recognition
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
      if (imageData) {
        let brightPixels = 0;
        for (let i = 0; i < imageData.data.length; i += 4) {
          const brightness = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
          if (brightness > 200) brightPixels++;
        }
        
        // If significant bright area detected (like a hand), trigger capture
        const brightRatio = brightPixels / (canvas.width * canvas.height);
        if (brightRatio > 0.15 && brightRatio < 0.4) {
          setDetectedGesture('✋ Hand detected!');
          startCountdown();
        }
      }
    };
    
    img.src = imageSrc;
  }, [startCountdown]);

  // Manual capture
  const handleManualCapture = () => {
    startCountdown();
  };

  // Gesture detection interval
  useEffect(() => {
    if (!capturing && !countdown) {
      gestureTimeoutRef.current = setInterval(detectGesture, 1000);
    }
    
    return () => {
      if (gestureTimeoutRef.current) {
        clearInterval(gestureTimeoutRef.current);
      }
    };
  }, [capturing, countdown, detectGesture]);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Take Your Photo</h2>
            <p className="text-teal-50 text-sm mt-1">
              {showInstructions ? 'Show your hand to start countdown' : 'Smile! 😊'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Webcam View */}
        <div className="relative bg-black">
          <div className="aspect-video relative overflow-hidden">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                width: 1280,
                height: 720,
                facingMode: 'user'
              }}
              className="w-full h-full object-cover"
              mirrored={true}
            />
            
            {/* Overlay Guide */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Face Guide Circle */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-64 h-64 rounded-full border-4 border-white/30 border-dashed"></div>
              </div>
              
              {/* Countdown */}
              {countdown && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-9xl font-bold text-white drop-shadow-2xl animate-pulse">
                    {countdown}
                  </div>
                </div>
              )}
              
              {/* Gesture Status */}
              {detectedGesture && !countdown && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full font-semibold text-lg shadow-lg animate-bounce">
                  {detectedGesture}
                </div>
              )}
              
              {/* Instructions */}
              {showInstructions && !capturing && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-6 py-3 rounded-xl max-w-md text-center">
                  <p className="font-semibold mb-2">📸 Auto-Capture Instructions:</p>
                  <p className="text-sm">
                    Position your face in the circle and raise your hand ✋ to trigger countdown.
                    The photo will be taken automatically after 3 seconds.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="text-sm text-gray-600 text-center sm:text-left">
            <p className="font-semibold">Tips for best results:</p>
            <p className="text-xs mt-1">• Good lighting • Face the camera • Neutral background</p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleManualCapture}
              disabled={capturing}
              className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg font-semibold hover:from-teal-700 hover:to-teal-800 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Capture Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
