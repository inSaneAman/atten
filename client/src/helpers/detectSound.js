const detectSound = async (setStatus, targetFrequencies) => {
  if (!window.isSecureContext) {
    setStatus("ERROR: App must be run over HTTPS or localhost.");
    return false;
  }

  // Cleanup previous audio context if it exists
  if (window.currentAudioContext) {
    window.currentAudioContext.close();
  }

  try {
    // Request microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    setStatus("Permissions granted! Starting audio analysis...");

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    window.currentAudioContext = audioContext; // Store for cleanup
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 32768;
    analyser.smoothingTimeConstant = 0.85;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);

    const sampleRate = audioContext.sampleRate;
    const binSize = sampleRate / analyser.fftSize;

    // Calculate target frequency bins with tolerance
    const frequencyTolerance = 10; // Hz tolerance for detection
    const targetBins = targetFrequencies.map(freq => ({
      bin: Math.round(freq / binSize),
      minBin: Math.round((freq - frequencyTolerance) / binSize),
      maxBin: Math.round((freq + frequencyTolerance) / binSize),
      freq
    }));
    
    const detectionThreshold = 90;
    let consecutiveDetections = 0;
    const requiredConsecutiveDetections = 3;

    setStatus("Listening for signals...");

    // Get Canvas for Visualization
    const canvas = document.getElementById("frequencyData");
    const ctx = canvas.getContext("2d");
    canvas.width = bufferLength / 4;
    canvas.height = 200;

    const findPeakInRange = (data, minBin, maxBin) => {
      let peakValue = 0;
      let peakBin = -1;
      
      for (let i = minBin; i <= maxBin; i++) {
        if (data[i] > peakValue) {
          peakValue = data[i];
          peakBin = i;
        }
      }
      
      return { peakValue, peakBin };
    };

    const detectTone = () => {
      analyser.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.fillStyle = 'rgb(20, 20, 20)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw frequency data
      for (let i = 0; i < canvas.width; i++) {
        const value = dataArray[i];
        const percent = value / 256;
        const height = canvas.height * percent;
        const offset = canvas.height - height;

        // Check if this frequency is within any target frequency range
        const isTargetFreq = targetBins.some(({minBin, maxBin}) => 
          i >= minBin && i <= maxBin
        );

        // Draw frequency bars
        if (isTargetFreq) {
          ctx.fillStyle = `rgba(255, 50, 50, 0.8)`;
        } else {
          ctx.fillStyle = `rgba(50, 50, 255, 0.3)`;
        }
        
        ctx.fillRect(i, offset, 1, height);
      }

      // Draw target frequency markers
      targetBins.forEach(({bin, freq}) => {
        if (bin < canvas.width) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
          ctx.lineWidth = 2;
          ctx.moveTo(bin, 0);
          ctx.lineTo(bin, canvas.height);
          ctx.stroke();

          ctx.fillStyle = 'white';
          ctx.font = '12px Arial';
          ctx.fillText(`${freq}Hz`, bin + 5, 20);
        }
      });

      // Check for detected frequencies
      let allFrequenciesDetected = true;
      
      for (const {minBin, maxBin} of targetBins) {
        const {peakValue, peakBin} = findPeakInRange(dataArray, minBin, maxBin);
        
        // Check if peak is strong enough and is a local maximum
        if (peakValue < detectionThreshold || 
            (peakBin > 0 && dataArray[peakBin - 1] >= peakValue) ||
            (peakBin < bufferLength - 1 && dataArray[peakBin + 1] >= peakValue)) {
          allFrequenciesDetected = false;
          break;
        }
      }

      if (allFrequenciesDetected) {
        consecutiveDetections++;
        if (consecutiveDetections >= requiredConsecutiveDetections) {
          setStatus("✅ Attendance Marked!");
          // Reset counter after successful detection
          consecutiveDetections = 0;
          setTimeout(() => setStatus("Listening for signals..."), 5000);
        }
      } else {
        consecutiveDetections = 0;
      }

      requestAnimationFrame(detectTone);
    };

    detectTone();
    return true;
  } catch (error) {
    console.error("Error accessing microphone:", error);
    setStatus("Error: " + error.message);
    return false;
  }
};

export default detectSound;
