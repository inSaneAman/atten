const detectSound = async (setStatus, targetFrequencies) => {
  if (!window.isSecureContext) {
    setStatus("ERROR: App must be run over HTTPS or localhost.");
    return false;
  }

  try {
    // Request microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    setStatus("Permissions granted! Starting audio analysis...");

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 32768;
    analyser.smoothingTimeConstant = 0.85;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);

    const sampleRate = audioContext.sampleRate;
    const binSize = sampleRate / analyser.fftSize;

    // Calculate target frequency bins
    const targetBins = targetFrequencies.map(freq => Math.round(freq / binSize));
    const detectionThreshold = 90;

    setStatus("Listening for signals...");

    // Get Canvas for Visualization
    const canvas = document.getElementById("frequencyData");
    const ctx = canvas.getContext("2d");
    canvas.width = bufferLength / 4;
    canvas.height = 200;

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

        // Check if this frequency is a target frequency
        const isTargetFreq = targetBins.some(bin => 
          Math.abs(i - bin) < 3 // Wider range for visibility
        );

        // Draw frequency bars
        if (isTargetFreq) {
          // Target frequencies in red with higher opacity
          ctx.fillStyle = `rgba(255, 50, 50, 0.8)`;
        } else {
          // Other frequencies in blue with lower opacity
          ctx.fillStyle = `rgba(50, 50, 255, 0.3)`;
        }
        
        ctx.fillRect(i, offset, 1, height);
      }

      // Draw target frequency markers
      targetBins.forEach(bin => {
        if (bin < canvas.width) {
          // Draw vertical line at target frequency
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
          ctx.lineWidth = 2;
          ctx.moveTo(bin, 0);
          ctx.lineTo(bin, canvas.height);
          ctx.stroke();

          // Draw frequency label
          ctx.fillStyle = 'white';
          ctx.font = '12px Arial';
          ctx.fillText(`${Math.round(bin * binSize)}Hz`, bin + 5, 20);
        }
      });

      // Check for detected frequencies
      let detectedCount = 0;
      targetBins.forEach(bin => {
        if (dataArray[bin] > detectionThreshold) {
          detectedCount++;
        }
      });

      if (detectedCount === targetBins.length) {
        setStatus("✅ Attendance Marked!");
        // Here you could make an API call to mark attendance
        setTimeout(() => setStatus("Listening for signals..."), 5000);
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
