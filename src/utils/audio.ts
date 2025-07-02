export interface AudioChime {
  play: () => void;
}

export const createAudioChimes = () => {
  const createChime = (frequencies: number[], duration: number = 0.3): (() => void) => {
    return () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const gainNode = audioContext.createGain();
        gainNode.connect(audioContext.destination);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        frequencies.forEach((freq, index) => {
          const oscillator = audioContext.createOscillator();
          oscillator.connect(gainNode);
          oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.1);
          oscillator.start(audioContext.currentTime + index * 0.1);
          oscillator.stop(audioContext.currentTime + duration + index * 0.1);
        });
      } catch (error) {
        console.warn('Audio not supported or failed to play:', error);
      }
    };
  };

  return {
    playWordChime: createChime([523, 659, 784]), // C5, E5, G5
    playPuzzleChime: createChime([523, 659, 784, 1047], 0.6), // C5, E5, G5, C6
  };
}; 