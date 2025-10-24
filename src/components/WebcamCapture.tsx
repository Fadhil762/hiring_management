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
  const [fingerCount, setFingerCount] = useState<number>(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const gestureTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fingerSequenceRef = useRef<number[]>([]);

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

  // Gesture detection using finger counting
  const detectGesture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc || capturing) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new window.Image();
    
    img.onload = () => {
      canvas.width = 320;
      canvas.height = 240;
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
      if (!imageData) return;

      // Analyze upper portion for hand detection
      const upperHalfEnd = Math.floor(canvas.height * 0.7);
      
      // Detect skin-colored regions (fingers)
      const skinRegions: Array<{x: number, y: number}> = [];
      
      for (let y = 0; y < upperHalfEnd; y += 4) { // Skip pixels for speed
        for (let x = 0; x < canvas.width; x += 4) {
          const i = (y * canvas.width + x) * 4;
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];
          
          // Skin tone detection
          const isSkinTone = r > 95 && g > 40 && b > 20 && 
                            r > g && r > b && 
                            Math.abs(r - g) > 15;
          
          if (isSkinTone) {
            skinRegions.push({x, y});
          }
        }
      }
      
      if (skinRegions.length === 0) {
        setFingerCount(0);
        setDetectedGesture('');
        return;
      }

      // Analyze vertical columns to count finger-like peaks
      const columnWidth = 10;
      const columns: number[] = [];
      
      for (let x = 0; x < canvas.width; x += columnWidth) {
        let columnCount = 0;
        for (const region of skinRegions) {
          if (region.x >= x && region.x < x + columnWidth && region.y < upperHalfEnd / 2) {
            columnCount++;
          }
        }
        columns.push(columnCount);
      }
      
      // Count peaks (fingers)
      let peakCount = 0;
      const threshold = 5;
      let inPeak = false;
      
      for (let i = 1; i < columns.length - 1; i++) {
        if (columns[i] > threshold) {
          if (!inPeak && columns[i] > columns[i-1]) {
            peakCount++;
            inPeak = true;
          }
        } else {
          inPeak = false;
        }
      }
      
      // Limit to reasonable finger count
      const detectedFingers = Math.min(peakCount, 5);
      setFingerCount(detectedFingers);
      
      // Track sequence: 1, 2, 3
      if (detectedFingers > 0 && detectedFingers <= 3) {
        const sequence = fingerSequenceRef.current;
        
        // Add to sequence if it's a new count
        if (sequence.length === 0 || sequence[sequence.length - 1] !== detectedFingers) {
          sequence.push(detectedFingers);
          
          // Keep only last 5 detections
          if (sequence.length > 5) {
            sequence.shift();
          }
        }
        
        // Check for 1-2-3 sequence
        if (sequence.length >= 3) {
          const last3 = sequence.slice(-3);
          if (last3[0] === 1 && last3[1] === 2 && last3[2] === 3) {
            setDetectedGesture('🎯 1-2-3 Detected!');
            fingerSequenceRef.current = [];
            
            // Clear interval
            if (gestureTimeoutRef.current) {
              clearInterval(gestureTimeoutRef.current);
              gestureTimeoutRef.current = null;
            }
            
            startCountdown();
            return;
          }
        }
        
        // Update gesture message
        setDetectedGesture(`${detectedFingers} finger${detectedFingers > 1 ? 's' : ''} 🤚`);
      } else if (detectedFingers > 3) {
        setDetectedGesture('');
        fingerSequenceRef.current = [];
      }
    };
    
    img.src = imageSrc;
  }, [startCountdown, capturing]);

  // Manual capture
  const handleManualCapture = () => {
    startCountdown();
  };

  // Gesture detection interval - check more frequently
  useEffect(() => {
    if (!capturing && !countdown) {
      // Check every 500ms for more responsive detection
      gestureTimeoutRef.current = setInterval(detectGesture, 500);
    }
    
    return () => {
      if (gestureTimeoutRef.current) {
        clearInterval(gestureTimeoutRef.current);
      }
    };
  }, [capturing, countdown, detectGesture]);

  // Clear gesture message after a short time if countdown doesn't start
  useEffect(() => {
    if (detectedGesture && !countdown && !capturing) {
      const timeout = setTimeout(() => {
        setDetectedGesture('');
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [detectedGesture, countdown, capturing]);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Take Your Photo</h2>
            <p className="text-teal-50 text-sm mt-1">
              {showInstructions ? 'Show 1, 2, 3 fingers to start countdown' : 'Smile! 😊'}
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
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-8 py-4 rounded-full font-bold text-xl shadow-2xl animate-bounce">
                  {detectedGesture}
                </div>
              )}
              
              {/* Finger Count Progress */}
              {fingerCount > 0 && fingerCount <= 3 && !countdown && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-teal-600/90 text-white px-6 py-3 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${fingerCount >= 1 ? 'bg-green-400 text-white' : 'bg-gray-300 text-gray-600'}`}>
                      1
                    </div>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${fingerCount >= 2 ? 'bg-green-400 text-white' : 'bg-gray-300 text-gray-600'}`}>
                      2
                    </div>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${fingerCount >= 3 ? 'bg-green-400 text-white' : 'bg-gray-300 text-gray-600'}`}>
                      3
                    </div>
                  </div>
                </div>
              )}
              
              {/* Active Detection Indicator */}
              {!capturing && !countdown && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-teal-500/80 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Detecting...</span>
                </div>
              )}
              
              {/* Instructions */}
              {showInstructions && !capturing && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-6 py-4 rounded-xl max-w-lg text-center backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p className="font-bold text-lg">📸 Finger Counting Mode</p>
                  </div>
                  <div className="text-sm space-y-2">
                    <p className="text-yellow-100">
                      <strong>1.</strong> Position your face in the circle
                    </p>
                    <p className="text-yellow-100">
                      <strong>2.</strong> Raise your hand and count: 1️⃣ → 2️⃣ → 3️⃣
                    </p>
                    <p className="text-yellow-100">
                      <strong>3.</strong> Show each number clearly for 1 second
                    </p>
                    <p className="text-teal-200 text-xs mt-2 italic">
                      Or click &ldquo;Capture Now&rdquo; button below for manual capture
                    </p>
                  </div>
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
