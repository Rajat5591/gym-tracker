import * as tf from '@tensorflow/tfjs';
import * as posenet from '@tensorflow-models/posenet';

export class PoseDetector {
  constructor() {
    this.net = null;
    this.isLoaded = false;
  }

  async loadModel() {
    if (this.isLoaded) return;

    try {
      // Load with high accuracy configuration
      this.net = await posenet.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        inputResolution: { width: 640, height: 480 },
        multiplier: 0.75,
        quantBytes: 2
      });
      
      this.isLoaded = true;
      console.log('✅ PoseNet model loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load PoseNet model:', error);
      throw error;
    }
  }

  async detectPose(videoElement) {
    if (!this.isLoaded || !this.net) {
      throw new Error('Model not loaded');
    }

    try {
      const pose = await this.net.estimateSinglePose(videoElement, {
        flipHorizontal: true,
        decodingMethod: 'single-person'
      });

      // Filter out low-confidence keypoints
      const filteredKeypoints = pose.keypoints.map(keypoint => ({
        ...keypoint,
        position: {
          x: keypoint.position.x / videoElement.videoWidth,
          y: keypoint.position.y / videoElement.videoHeight
        },
        x: keypoint.position.x / videoElement.videoWidth,
        y: keypoint.position.y / videoElement.videoHeight
      }));

      return {
        keypoints: filteredKeypoints,
        score: pose.score
      };
    } catch (error) {
      console.error('Pose detection error:', error);
      return null;
    }
  }

  drawKeypoints(ctx, keypoints, minConfidence = 0.5) {
    keypoints.forEach(keypoint => {
      if (keypoint.score >= minConfidence) {
        const { x, y } = keypoint.position;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#ff0000';
        ctx.fill();
      }
    });
  }

  drawSkeleton(ctx, keypoints, minConfidence = 0.5) {
    const adjacentKeyPoints = posenet.getAdjacentKeyPoints(keypoints, minConfidence);
    
    adjacentKeyPoints.forEach(keypoints => {
      ctx.beginPath();
      ctx.moveTo(keypoints[0].position.x, keypoints[0].position.y);
      ctx.lineTo(keypoints[1].position.x, keypoints[1].position.y);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#00ff00';
      ctx.stroke();
    });
  }
}
