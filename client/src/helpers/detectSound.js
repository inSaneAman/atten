const detectSound = async (setStatus) => {
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
    const targetFrequencies = [4200, 5250, 6300]; // Frequencies from teacher

    // Find closest frequency bins
    const targetBins = targetFrequencies.map((f) => Math.round(f / binSize));
    const detectionThreshold = 90; // Adjusted for better sensitivity

    setStatus("Listening for signals...");

    // Get Canvas for Visualization
    const canvas = document.getElementById("frequencyData");
    const ctx = canvas.getContext("2d");
    canvas.width = bufferLength / 4;
    canvas.height = 100;

    const detectTone = () => {
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let detectedCount = 0;
      for (let i = 0; i < targetBins.length; i++) {
        if (dataArray[targetBins[i]] > detectionThreshold) {
          detectedCount++;
        }
      }

      if (detectedCount === targetBins.length) {
        setStatus("✅ Attendance Marked!");
        setTimeout(() => setStatus("Listening for signals..."), 5000);
      }

      // Draw full-spectrum frequency graph
      for (let i = 0; i < bufferLength / 4; i++) {
        const barHeight = dataArray[i] / 2;
        ctx.fillStyle = targetBins.includes(i)
          ? "rgb(255, 50, 50)"
          : "rgb(50, 50, 255)";
        ctx.fillRect(i, canvas.height - barHeight, 1, barHeight);
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
