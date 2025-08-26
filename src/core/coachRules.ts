import { PoseResult } from './poseCoach';

export interface CoachHint {
  code: 'RAISE_GUARD' | 'LOWER_CHIN' | 'MOVE_LEFT' | 'MOVE_RIGHT' | 'GOOD_STANCE' | 'BLOCK_HIGH' | 'BLOCK_LOW';
  severity: 'info' | 'warn';
}

export class CoachRules {
  evaluate(pose: PoseResult): CoachHint[] {
    const hints: CoachHint[] = [];
    const keypoints = pose.keypoints;
    
    // MediaPipe pose landmarks indices
    const POSE_LANDMARKS = {
      NOSE: 0,
      LEFT_SHOULDER: 11,
      RIGHT_SHOULDER: 12,
      LEFT_ELBOW: 13,
      RIGHT_ELBOW: 14,
      LEFT_WRIST: 15,
      RIGHT_WRIST: 16,
      LEFT_HIP: 23,
      RIGHT_HIP: 24
    };
    
    try {
      // Check guard position
      const leftWrist = keypoints[POSE_LANDMARKS.LEFT_WRIST];
      const rightWrist = keypoints[POSE_LANDMARKS.RIGHT_WRIST];
      const leftShoulder = keypoints[POSE_LANDMARKS.LEFT_SHOULDER];
      const rightShoulder = keypoints[POSE_LANDMARKS.RIGHT_SHOULDER];
      const nose = keypoints[POSE_LANDMARKS.NOSE];
      
      // Guard position check
      if (leftWrist && rightWrist && leftShoulder && rightShoulder) {
        const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
        const avgWristY = (leftWrist.y + rightWrist.y) / 2;
        
        if (avgWristY > avgShoulderY) {
          hints.push({ code: 'RAISE_GUARD', severity: 'warn' });
        }
      }
      
      // Chin position check
      if (nose && leftShoulder && rightShoulder) {
        const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
        
        if (nose.y < avgShoulderY - 0.1) {
          hints.push({ code: 'LOWER_CHIN', severity: 'warn' });
        }
      }
      
      // Stance balance check
      const leftHip = keypoints[POSE_LANDMARKS.LEFT_HIP];
      const rightHip = keypoints[POSE_LANDMARKS.RIGHT_HIP];
      
      if (leftHip && rightHip && leftShoulder && rightShoulder) {
        const hipCenter = (leftHip.x + rightHip.x) / 2;
        const shoulderCenter = (leftShoulder.x + rightShoulder.x) / 2;
        const offset = Math.abs(hipCenter - shoulderCenter);
        
        if (offset > 0.1) {
          if (hipCenter < shoulderCenter) {
            hints.push({ code: 'MOVE_RIGHT', severity: 'info' });
          } else {
            hints.push({ code: 'MOVE_LEFT', severity: 'info' });
          }
        } else if (hints.length === 0) {
          hints.push({ code: 'GOOD_STANCE', severity: 'info' });
        }
      }
      
      // Block detection (simplified)
      if (leftWrist && rightWrist && nose) {
        const leftArmUp = leftWrist.y < nose.y;
        const rightArmUp = rightWrist.y < nose.y;
        
        if (leftArmUp || rightArmUp) {
          hints.push({ code: 'BLOCK_HIGH', severity: 'info' });
        }
      }
      
    } catch (error) {
      console.error('Error evaluating pose:', error);
    }
    
    return hints;
  }
}
