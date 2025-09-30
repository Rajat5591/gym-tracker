// Advanced Exercise Analysis with High Accuracy Algorithms
export class ExerciseAnalyzer {
  
    // Utility function to calculate angle between three points
    static calculateAngle(pointA, pointB, pointC) {
      const radians = Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x) - 
                     Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);
      let angle = Math.abs(radians * 180.0 / Math.PI);
      if (angle > 180.0) {
        angle = 360 - angle;
      }
      return angle;
    }
  
    // Calculate distance between two points
    static calculateDistance(pointA, pointB) {
      return Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2));
    }
  
    // Check if pose landmarks are reliable
    static validatePoseQuality(keypoints) {
      const criticalPoints = [5, 6, 11, 12, 13, 14, 15, 16]; // shoulders, elbows, wrists, hips
      const confidenceThreshold = 0.5;
      
      let validPoints = 0;
      criticalPoints.forEach(index => {
        if (keypoints[index] && keypoints[index].score > confidenceThreshold) {
          validPoints++;
        }
      });
      
      return validPoints / criticalPoints.length;
    }
  
    // PUSH-UP ANALYSIS - Ultra High Accuracy
    static analyzePushUp(keypoints, previousState = null) {
      const quality = this.validatePoseQuality(keypoints);
      if (quality < 0.7) {
        return {
          status: 'error',
          message: 'Please position yourself clearly in the camera',
          details: 'Ensure good lighting and full body visibility',
          score: 0,
          mistakes: ['Poor pose detection'],
          confidence: quality
        };
      }
  
      // Extract key body points
      const nose = keypoints[0];
      const leftShoulder = keypoints[5];
      const rightShoulder = keypoints[6];
      const leftElbow = keypoints[7];
      const rightElbow = keypoints[8];
      const leftWrist = keypoints[9];
      const rightWrist = keypoints[10];
      const leftHip = keypoints[11];
      const rightHip = keypoints[12];
      const leftKnee = keypoints[13];
      const rightKnee = keypoints[14];
      const leftAnkle = keypoints[15];
      const rightAnkle = keypoints[16];
  
      let mistakes = [];
      let score = 100;
      let status = 'perfect';
  
      // 1. BODY ALIGNMENT CHECK (30 points)
      const shoulderMid = {
        x: (leftShoulder.x + rightShoulder.x) / 2,
        y: (leftShoulder.y + rightShoulder.y) / 2
      };
      const hipMid = {
        x: (leftHip.x + rightHip.x) / 2,
        y: (leftHip.y + rightHip.y) / 2
      };
      const ankleMid = {
        x: (leftAnkle.x + rightAnkle.x) / 2,
        y: (leftAnkle.y + rightAnkle.y) / 2
      };
  
      // Check body line straightness
      const bodyLineDeviation = Math.abs(
        (shoulderMid.y - ankleMid.y) - (hipMid.y - ankleMid.y)
      );
      
      if (bodyLineDeviation > 0.08) {
        mistakes.push('Keep your body in a straight line');
        score -= 25;
      }
  
      // Check for hip sagging
      const expectedHipY = shoulderMid.y + (ankleMid.y - shoulderMid.y) * 0.6;
      if (hipMid.y > expectedHipY + 0.05) {
        mistakes.push('Don\'t let your hips sag down');
        score -= 20;
      }
  
      // Check for pike position (hips too high)
      if (hipMid.y < expectedHipY - 0.05) {
        mistakes.push('Lower your hips - don\'t pike up');
        score -= 20;
      }
  
      // 2. ARM POSITION ANALYSIS (25 points)
      const handWidth = this.calculateDistance(leftWrist, rightWrist);
      const shoulderWidth = this.calculateDistance(leftShoulder, rightShoulder);
      
      if (handWidth < shoulderWidth * 0.8) {
        mistakes.push('Hands too close - widen your grip');
        score -= 15;
      } else if (handWidth > shoulderWidth * 1.6) {
        mistakes.push('Hands too wide - bring them closer');
        score -= 15;
      }
  
      // 3. ELBOW ANALYSIS (25 points)
      const leftElbowAngle = this.calculateAngle(leftShoulder, leftElbow, leftWrist);
      const rightElbowAngle = this.calculateAngle(rightShoulder, rightElbow, rightWrist);
      const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;
  
      // Determine push-up phase
      let phase = 'unknown';
      let depthScore = 100;
      
      if (avgElbowAngle > 150) {
        phase = 'up';
      } else if (avgElbowAngle < 90) {
        phase = 'down';
        // Check if going low enough (chest should be close to ground)
        const chestHeight = shoulderMid.y;
        const handHeight = (leftWrist.y + rightWrist.y) / 2;
        
        if (chestHeight - handHeight < 0.05) {
          depthScore = 100;
        } else {
          mistakes.push('Go lower - chest should nearly touch the ground');
          score -= 20;
          depthScore = 60;
        }
      } else {
        phase = 'transition';
      }
  
      // Check elbow flare (elbows should stay close to body)
      const leftElbowFlare = Math.abs(leftElbow.x - leftShoulder.x);
      const rightElbowFlare = Math.abs(rightElbow.x - rightShoulder.x);
      const avgElbowFlare = (leftElbowFlare + rightElbowFlare) / 2;
      
      if (avgElbowFlare > shoulderWidth * 0.4) {
        mistakes.push('Keep elbows closer to your body');
        score -= 15;
      }
  
      // 4. HEAD POSITION (10 points)
      const neckAlignment = Math.abs(nose.y - shoulderMid.y);
      if (neckAlignment > 0.08) {
        mistakes.push('Keep your head in neutral position');
        score -= 10;
      }
  
      // 5. STABILITY CHECK (10 points)
      if (previousState) {
        const stabilityThreshold = 0.03;
        const shoulderMovement = this.calculateDistance(shoulderMid, previousState.shoulderMid || shoulderMid);
        
        if (shoulderMovement > stabilityThreshold && phase !== 'transition') {
          mistakes.push('Maintain stability - reduce swaying');
          score -= 10;
        }
      }
  
      // Determine final status
      if (score >= 95) status = 'perfect';
      else if (score >= 85) status = 'excellent';
      else if (score >= 75) status = 'good';
      else if (score >= 60) status = 'warning';
      else status = 'error';
  
      let message;
      switch (status) {
        case 'perfect':
          message = '🎯 Perfect Push-up Form!';
          break;
        case 'excellent':
          message = '💪 Excellent Push-up!';
          break;
        case 'good':
          message = '👍 Good Form - Minor adjustments';
          break;
        case 'warning':
          message = '⚠️ Form needs improvement';
          break;
        default:
          message = '❌ Poor form - focus on basics';
      }
  
      return {
        status,
        message,
        details: mistakes.length > 0 ? mistakes.join(', ') : 'Perfect technique!',
        score: Math.max(0, Math.round(score)),
        mistakes,
        phase,
        confidence: quality,
        metrics: {
          bodyAlignment: 100 - (bodyLineDeviation * 500),
          armPosition: handWidth / shoulderWidth,
          elbowAngle: avgElbowAngle,
          depth: depthScore
        },
        state: { shoulderMid, hipMid, ankleMid }
      };
    }
  
    // SQUAT ANALYSIS - Ultra High Accuracy
    static analyzeSquat(keypoints, previousState = null) {
      const quality = this.validatePoseQuality(keypoints);
      if (quality < 0.7) {
        return {
          status: 'error',
          message: 'Please position yourself clearly in the camera',
          details: 'Step back and ensure full body is visible',
          score: 0,
          mistakes: ['Poor pose detection'],
          confidence: quality
        };
      }
  
      // Extract key points
      const nose = keypoints[0];
      const leftShoulder = keypoints[5];
      const rightShoulder = keypoints[6];
      const leftHip = keypoints[11];
      const rightHip = keypoints[12];
      const leftKnee = keypoints[13];
      const rightKnee = keypoints[14];
      const leftAnkle = keypoints[15];
      const rightAnkle = keypoints[16];
  
      let mistakes = [];
      let score = 100;
      let status = 'perfect';
  
      // Calculate midpoints
      const hipMid = {
        x: (leftHip.x + rightHip.x) / 2,
        y: (leftHip.y + rightHip.y) / 2
      };
      const kneeMid = {
        x: (leftKnee.x + rightKnee.x) / 2,
        y: (leftKnee.y + rightKnee.y) / 2
      };
      const shoulderMid = {
        x: (leftShoulder.x + rightShoulder.x) / 2,
        y: (leftShoulder.y + rightShoulder.y) / 2
      };
  
      // 1. SQUAT DEPTH ANALYSIS (35 points)
      const leftKneeAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle);
      const rightKneeAngle = this.calculateAngle(rightHip, rightKnee, rightAnkle);
      const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;
  
      let phase = 'standing';
      let depthScore = 100;
  
      if (avgKneeAngle < 110) {
        phase = 'squatting';
        
        // Check proper depth (hips below knees)
        if (hipMid.y <= kneeMid.y) {
          depthScore = 100;
        } else if (hipMid.y <= kneeMid.y + 0.03) {
          depthScore = 85;
          mistakes.push('Go slightly deeper for full range');
          score -= 10;
        } else {
          depthScore = 60;
          mistakes.push('Go deeper - hips should go below knees');
          score -= 25;
        }
      }
  
      // 2. KNEE ALIGNMENT (25 points)
      // Knees should track over toes, not cave inward
      const leftKneeAlignment = Math.abs(leftKnee.x - leftAnkle.x);
      const rightKneeAlignment = Math.abs(rightKnee.x - rightAnkle.x);
      
      if (leftKneeAlignment > 0.08 || rightKneeAlignment > 0.08) {
        mistakes.push('Keep knees aligned over your toes');
        score -= 20;
      }
  
      // Check for knee valgus (knees caving in)
      const kneeWidth = this.calculateDistance(leftKnee, rightKnee);
      const ankleWidth = this.calculateDistance(leftAnkle, rightAnkle);
      
      if (kneeWidth < ankleWidth * 0.8) {
        mistakes.push('Don\'t let your knees cave inward');
        score -= 15;
      }
  
      // 3. BACK POSTURE (25 points)
      // Check for excessive forward lean
      const torsoLean = Math.abs(shoulderMid.x - hipMid.x);
      if (torsoLean > 0.1) {
        mistakes.push('Keep your chest up - don\'t lean forward too much');
        score -= 20;
      }
  
      // Check spine alignment
      const spineAngle = this.calculateAngle(
        { x: shoulderMid.x, y: shoulderMid.y - 0.1 },
        shoulderMid,
        hipMid
      );
      
      if (spineAngle < 160 || spineAngle > 200) {
        mistakes.push('Maintain neutral spine position');
        score -= 15;
      }
  
      // 4. FOOT POSITION (15 points)
      const stanceWidth = this.calculateDistance(leftAnkle, rightAnkle);
      const shoulderWidth = this.calculateDistance(leftShoulder, rightShoulder);
      
      if (stanceWidth < shoulderWidth * 0.8) {
        mistakes.push('Widen your stance to shoulder-width');
        score -= 12;
      } else if (stanceWidth > shoulderWidth * 1.8) {
        mistakes.push('Narrow your stance slightly');
        score -= 8;
      }
  
      // Determine final status
      if (score >= 95) status = 'perfect';
      else if (score >= 85) status = 'excellent';
      else if (score >= 75) status = 'good';
      else if (score >= 60) status = 'warning';
      else status = 'error';
  
      let message;
      switch (status) {
        case 'perfect':
          message = '🎯 Perfect Squat Form!';
          break;
        case 'excellent':
          message = '💪 Excellent Squat!';
          break;
        case 'good':
          message = '👍 Good squat - minor tweaks needed';
          break;
        case 'warning':
          message = '⚠️ Form needs work';
          break;
        default:
          message = '❌ Poor squat form';
      }
  
      return {
        status,
        message,
        details: mistakes.length > 0 ? mistakes.join(', ') : 'Perfect squat technique!',
        score: Math.max(0, Math.round(score)),
        mistakes,
        phase,
        confidence: quality,
        metrics: {
          depth: depthScore,
          kneeAlignment: Math.max(0, 100 - (leftKneeAlignment + rightKneeAlignment) * 500),
          backPosture: Math.max(0, 100 - torsoLean * 200),
          stanceWidth: stanceWidth / shoulderWidth
        },
        state: { hipMid, kneeMid, shoulderMid }
      };
    }
  
    // DUMBBELL PRESS ANALYSIS - Ultra High Accuracy
    static analyzeDumbbellPress(keypoints, previousState = null) {
      const quality = this.validatePoseQuality(keypoints);
      if (quality < 0.7) {
        return {
          status: 'error',
          message: 'Please position yourself clearly in the camera',
          details: 'Ensure good lighting and clear pose detection',
          score: 0,
          mistakes: ['Poor pose detection'],
          confidence: quality
        };
      }
  
      // Extract key points
      const leftShoulder = keypoints[5];
      const rightShoulder = keypoints[6];
      const leftElbow = keypoints[7];
      const rightElbow = keypoints[8];
      const leftWrist = keypoints[9];
      const rightWrist = keypoints[10];
      const leftHip = keypoints[11];
      const rightHip = keypoints[12];
  
      let mistakes = [];
      let score = 100;
      let status = 'perfect';
  
      // 1. ARM ALIGNMENT AND SYMMETRY (30 points)
      const leftElbowAngle = this.calculateAngle(leftShoulder, leftElbow, leftWrist);
      const rightElbowAngle = this.calculateAngle(rightShoulder, rightElbow, rightWrist);
      const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;
      
      // Check symmetry between arms
      const angleDifference = Math.abs(leftElbowAngle - rightElbowAngle);
      if (angleDifference > 15) {
        mistakes.push('Keep both arms moving symmetrically');
        score -= 15;
      }
  
      // Determine press phase
      let phase = 'unknown';
      if (avgElbowAngle > 150) {
        phase = 'extended';
      } else if (avgElbowAngle < 90) {
        phase = 'lowered';
      } else {
        phase = 'transition';
      }
  
      // 2. SHOULDER STABILITY (25 points)
      const shoulderMid = {
        x: (leftShoulder.x + rightShoulder.x) / 2,
        y: (leftShoulder.y + rightShoulder.y) / 2
      };
  
      // Check if shoulders are stable and level
      const shoulderLevelDiff = Math.abs(leftShoulder.y - rightShoulder.y);
      if (shoulderLevelDiff > 0.05) {
        mistakes.push('Keep shoulders level and stable');
        score -= 20;
      }
  
      // 3. ELBOW POSITION (25 points)
      // Elbows should be under wrists at bottom position
      if (phase === 'lowered') {
        const leftElbowWristAlignment = Math.abs(leftElbow.x - leftWrist.x);
        const rightElbowWristAlignment = Math.abs(rightElbow.x - rightWrist.x);
        
        if (leftElbowWristAlignment > 0.06 || rightElbowWristAlignment > 0.06) {
          mistakes.push('Keep elbows directly under wrists');
          score -= 20;
        }
      }
  
      // Check elbow flare (should be about 45 degrees)
      const leftElbowFlare = Math.abs(leftElbow.x - leftShoulder.x);
      const rightElbowFlare = Math.abs(rightElbow.x - rightShoulder.x);
      const shoulderWidth = this.calculateDistance(leftShoulder, rightShoulder);
      
      const optimalFlare = shoulderWidth * 0.3;
      if (leftElbowFlare > optimalFlare * 1.5 || rightElbowFlare > optimalFlare * 1.5) {
        mistakes.push('Don\'t flare elbows too wide');
        score -= 15;
      }
  
      // 4. CORE STABILITY (20 points)
      const hipMid = {
        x: (leftHip.x + rightHip.x) / 2,
        y: (leftHip.y + rightHip.y) / 2
      };
  
      // Check for excessive back arch or lean
      const coreLean = Math.abs(shoulderMid.x - hipMid.x);
      if (coreLean > 0.08) {
        mistakes.push('Maintain neutral spine - avoid excessive lean');
        score -= 15;
      }
  
      // Determine final status
      if (score >= 95) status = 'perfect';
      else if (score >= 85) status = 'excellent';
      else if (score >= 75) status = 'good';
      else if (score >= 60) status = 'warning';
      else status = 'error';
  
      let message;
      switch (status) {
        case 'perfect':
          message = '🎯 Perfect Press Form!';
          break;
        case 'excellent':
          message = '💪 Excellent Press!';
          break;
        case 'good':
          message = '👍 Good press - minor adjustments';
          break;
        case 'warning':
          message = '⚠️ Form needs improvement';
          break;
        default:
          message = '❌ Poor press form';
      }
  
      return {
        status,
        message,
        details: mistakes.length > 0 ? mistakes.join(', ') : 'Perfect press technique!',
        score: Math.max(0, Math.round(score)),
        mistakes,
        phase,
        confidence: quality,
        metrics: {
          symmetry: Math.max(0, 100 - angleDifference * 4),
          shoulderStability: Math.max(0, 100 - shoulderLevelDiff * 400),
          elbowPosition: avgElbowAngle,
          coreStability: Math.max(0, 100 - coreLean * 300)
        },
        state: { shoulderMid, hipMid, avgElbowAngle }
      };
    }
  
    // DEADLIFT ANALYSIS - Ultra High Accuracy
    static analyzeDeadlift(keypoints, previousState = null) {
      const quality = this.validatePoseQuality(keypoints);
      if (quality < 0.7) {
        return {
          status: 'error',
          message: 'Please position yourself clearly in the camera',
          details: 'Step back for better full body visibility',
          score: 0,
          mistakes: ['Poor pose detection'],
          confidence: quality
        };
      }
  
      // Extract key points
      const nose = keypoints[0];
      const leftShoulder = keypoints[5];
      const rightShoulder = keypoints[6];
      const leftHip = keypoints[11];
      const rightHip = keypoints[12];
      const leftKnee = keypoints[13];
      const rightKnee = keypoints[14];
      const leftAnkle = keypoints[15];
      const rightAnkle = keypoints[16];
  
      let mistakes = [];
      let score = 100;
      let status = 'perfect';
  
      // Calculate midpoints
      const shoulderMid = {
        x: (leftShoulder.x + rightShoulder.x) / 2,
        y: (leftShoulder.y + rightShoulder.y) / 2
      };
      const hipMid = {
        x: (leftHip.x + rightHip.x) / 2,
        y: (leftHip.y + rightHip.y) / 2
      };
  
      // 1. BACK NEUTRALITY (40 points) - Most critical
      const spineAngle = this.calculateAngle(
        { x: nose.x, y: nose.y },
        shoulderMid,
        hipMid
      );
  
      // Check for rounded back (most dangerous mistake)
      if (spineAngle < 160) {
        mistakes.push('CRITICAL: Keep your back straight - avoid rounding');
        score -= 35;
        status = 'error';
      } else if (spineAngle < 170) {
        mistakes.push('Maintain neutral spine - slight rounding detected');
        score -= 20;
      }
  
      // 2. HIP HINGE MOVEMENT (30 points)
      const hipShoulderDistance = this.calculateDistance(hipMid, shoulderMid);
      const expectedDistance = 0.3; // Typical torso length ratio
      
      if (hipShoulderDistance < expectedDistance * 0.8) {
        mistakes.push('Push your hips back more - emphasize hip hinge');
        score -= 25;
      }
  
      // Check hip position relative to feet
      const ankleMid = {
        x: (leftAnkle.x + rightAnkle.x) / 2,
        y: (leftAnkle.y + rightAnkle.y) / 2
      };
  
      if (Math.abs(hipMid.x - ankleMid.x) < 0.05) {
        mistakes.push('Hips should move back, not straight down');
        score -= 20;
      }
  
      // 3. KNEE POSITION (20 points)
      const kneeMid = {
        x: (leftKnee.x + rightKnee.x) / 2,
        y: (leftKnee.y + rightKnee.y) / 2
      };
  
      // Knees shouldn't drift too far forward
      if (kneeMid.x > ankleMid.x + 0.1) {
        mistakes.push('Don\'t let knees drift forward - sit back more');
        score -= 15;
      }
  
      // 4. BAR PATH (10 points)
      // In a real deadlift, bar should stay close to body
      // We simulate this by checking shoulder position over feet
      if (Math.abs(shoulderMid.x - ankleMid.x) > 0.15) {
        mistakes.push('Keep the weight close to your body');
        score -= 10;
      }
  
      // Determine final status
      if (score >= 95) status = 'perfect';
      else if (score >= 85) status = 'excellent';
      else if (score >= 75) status = 'good';
      else if (score >= 60) status = 'warning';
      else status = 'error';
  
      let message;
      switch (status) {
        case 'perfect':
          message = '🎯 Perfect Deadlift Form!';
          break;
        case 'excellent':
          message = '💪 Excellent Deadlift!';
          break;
        case 'good':
          message = '👍 Good deadlift technique';
          break;
        case 'warning':
          message = '⚠️ Check your form';
          break;
        default:
          message = '❌ STOP - Poor deadlift form';
      }
  
      return {
        status,
        message,
        details: mistakes.length > 0 ? mistakes.join(', ') : 'Perfect deadlift technique!',
        score: Math.max(0, Math.round(score)),
        mistakes,
        phase: 'lifting',
        confidence: quality,
        metrics: {
          backNeutrality: Math.max(0, 100 - (180 - spineAngle) * 5),
          hipHinge: hipShoulderDistance / expectedDistance * 100,
          kneePosition: Math.max(0, 100 - Math.abs(kneeMid.x - ankleMid.x) * 500)
        },
        state: { shoulderMid, hipMid, ankleMid }
      };
    }
  }
  