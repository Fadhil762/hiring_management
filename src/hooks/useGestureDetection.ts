import { useEffect, useRef, useState, useCallback } from 'react';

type GestureCallback = () => void;

// MediaPipe types
interface Landmark {
  x: number;
  y: number;
  z: number;
}

interface HandsResults {
  multiHandLandmarks?: Landmark[][];
}

interface HandsInstance {
  setOptions: (options: {
    maxNumHands: number;
    modelComplexity: 0 | 1;
    minDetectionConfidence: number;
    minTrackingConfidence: number;
  }) => void;
  onResults: (callback: (results: HandsResults) => void) => void;
  send: (options: { image: HTMLVideoElement }) => Promise<void>;
  close: () => void;
}

interface CameraInstance {
  start: () => Promise<void>;
  stop: () => void;
}

export function useGestureDetection(
  videoElement: HTMLVideoElement | null,
  enabled: boolean,
  onGestureDetected: GestureCallback
) {
  const [fingerCount, setFingerCount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const handsRef = useRef<HandsInstance | null>(null);
  const cameraRef = useRef<CameraInstance | null>(null);
  const gestureSequenceRef = useRef<number[]>([]);
  const lastCaptureTimeRef = useRef<number>(0);

  const countFingers = useCallback((landmarks: number[][]) => {
    if (!landmarks || landmarks.length < 21) return 0;

    let count = 0;

    // Thumb: Compare tip (4) with knuckle (2) on x-axis
    if (landmarks[4][0] > landmarks[2][0]) count++;

    // Other fingers: Compare tip with middle joint on y-axis
    const fingerTips = [8, 12, 16, 20];
    const fingerMiddles = [6, 10, 14, 18];

    for (let i = 0; i < fingerTips.length; i++) {
      if (landmarks[fingerTips[i]][1] < landmarks[fingerMiddles[i]][1]) {
        count++;
      }
    }

    return count;
  }, []);

  const onResults = useCallback(
    (results: HandsResults) => {
      if (!enabled || isProcessing) return;

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0].map((lm: Landmark) => [lm.x, lm.y, lm.z]);
        const fingers = countFingers(landmarks);
        setFingerCount(fingers);

        // Track gesture sequence
        if (fingers > 0 && fingers <= 3) {
          const now = Date.now();
          const lastGesture = gestureSequenceRef.current[gestureSequenceRef.current.length - 1];

          // Add to sequence if different from last gesture
          if (fingers !== lastGesture) {
            gestureSequenceRef.current.push(fingers);
            console.log('Gesture sequence:', gestureSequenceRef.current);

            // Keep only last 5 gestures
            if (gestureSequenceRef.current.length > 5) {
              gestureSequenceRef.current.shift();
            }

            // Check for 1-2-3 sequence
            const seq = gestureSequenceRef.current;
            if (seq.length >= 3) {
              const last3 = seq.slice(-3);
              if (
                last3[0] === 1 &&
                last3[1] === 2 &&
                last3[2] === 3 &&
                now - lastCaptureTimeRef.current > 3000
              ) {
                console.log('✅ Gesture sequence detected: 1-2-3! Capturing photo...');
                setIsProcessing(true);
                lastCaptureTimeRef.current = now;
                gestureSequenceRef.current = [];
                
                // Trigger capture after a short delay
                setTimeout(() => {
                  onGestureDetected();
                  setTimeout(() => setIsProcessing(false), 1000);
                }, 500);
              }
            }
          }
        }
      } else {
        setFingerCount(0);
      }
    },
    [enabled, isProcessing, countFingers, onGestureDetected]
  );

  useEffect(() => {
    if (!videoElement || !enabled) {
      console.log('Gesture detection not initialized:', { videoElement: !!videoElement, enabled });
      return;
    }

    console.log('Initializing MediaPipe Hands...');
    let isMounted = true;

    // Dynamically import MediaPipe modules
    const initHands = async () => {
      try {
        console.log('Loading MediaPipe modules...');
        const { Hands } = await import('@mediapipe/hands');
        const { Camera } = await import('@mediapipe/camera_utils');

        if (!isMounted) {
          console.log('Component unmounted, skipping initialization');
          return;
        }

        console.log('Creating Hands instance...');
        const hands = new Hands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        hands.onResults(onResults);
        handsRef.current = hands;

        console.log('Starting camera...');
        const camera = new Camera(videoElement, {
          onFrame: async () => {
            if (handsRef.current) {
              await handsRef.current.send({ image: videoElement });
            }
          },
          width: 640,
          height: 480,
        });

        await camera.start();
        cameraRef.current = camera;
        console.log('✅ Gesture detection initialized successfully!');
      } catch (error) {
        console.error('❌ Failed to initialize MediaPipe:', error);
      }
    };

    initHands();

    return () => {
      console.log('Cleaning up gesture detection...');
      isMounted = false;
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
    };
  }, [videoElement, enabled, onResults]);

  return { fingerCount, isProcessing };
}
