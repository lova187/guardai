export interface PoseResult {
  keypoints: Array<{x: number, y: number, score: number}>;
  timestamp: number;
}

export class PoseCoach {
  private poseDetector: any;
  private isInitialized: boolean = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load MediaPipe Tasks Vision
      const vision = await this.loadMediaPipe();
      
      // Create pose landmarker
      this.poseDetector = await vision.PoseLandmarker.createFromOptions({
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
        outputSegmentationMasks: false
      });
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize MediaPipe:', error);
      throw new Error('Failed to initialize pose detection');
    }
  }

  private async loadMediaPipe(): Promise<any> {
    // Try to load from CDN first
    try {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/vision_bundle.js';
      
      return new Promise((resolve, reject) => {
        script.onload = () => {
          resolve((window as any).MediaPipeTasksVision);
        };
        script.onerror = () => {
          // Try local fallback
          this.loadLocalFallback().then(resolve).catch(reject);
        };
        document.head.appendChild(script);
      });
    } catch (error) {
      return this.loadLocalFallback();
    }
  }

  private async loadLocalFallback(): Promise<any> {
    const script = document.createElement('script');
    script.src = './vendor/vision_bundle.js';
    
    return new Promise((resolve, reject) => {
      script.onload = () => {
        resolve((window as any).MediaPipeTasksVision);
      };
      script.onerror = () => {
        reject(new Error('Failed to load MediaPipe from both CDN and local fallback'));
      };
      document.head.appendChild(script);
    });
  }

  async detect(videoElement: HTMLVideoElement): Promise<PoseResult | null> {
    if (!this.isInitialized || !this.poseDetector) {
      throw new Error('PoseCoach not initialized');
    }

    try {
      const timestamp = performance.now();
      const results = this.poseDetector.detectForVideo(videoElement, timestamp);
      
      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];
        
        return {
          keypoints: landmarks.map((landmark: any) => ({
            x: landmark.x,
            y: landmark.y,
            score: landmark.visibility || 0.5
          })),
          timestamp
        };
      }
      
      return null;
    } catch (error) {
      console.error('Pose detection error:', error);
      return null;
    }
  }
}
