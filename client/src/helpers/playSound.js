export const playSound = (frequency) => {
  if (!frequency || frequency.length === 0) {
    console.error("❌ No frequency provided!");
    return;
  }

  // Create or resume the AudioContext
  let audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  let currentTime = audioContext.currentTime;
  const gainNode = audioContext.createGain();
  gainNode.connect(audioContext.destination);
  gainNode.gain.setValueAtTime(0, currentTime); // Start silent

  // Envelope parameters
  const attack = 0.05;
  const decay = 0.1;
  const sustainLevel = 0.9;
  const release = 0.1;
  const noteDuration = 0.6; // Each note duration (in seconds)
  const pauseDuration = 0.05; // Silence between notes
  const numRepeats = 2; // Number of times the melody repeats

  for (let repeat = 0; repeat < numRepeats; repeat++) {
    frequency.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = freq;

      // Connect oscillator to gain node
      oscillator.connect(gainNode);
      oscillator.start(currentTime);

      // Volume Envelope
      gainNode.gain.linearRampToValueAtTime(1, currentTime + attack);
      gainNode.gain.linearRampToValueAtTime(
        sustainLevel,
        currentTime + attack + decay
      );
      gainNode.gain.setValueAtTime(
        sustainLevel,
        currentTime + noteDuration - release
      );
      gainNode.gain.linearRampToValueAtTime(0, currentTime + noteDuration);

      oscillator.stop(currentTime + noteDuration);
      currentTime += noteDuration + pauseDuration;
    });
  }

  console.log("📢 Playing Attendance Signal:", frequency.join(", "));
};
