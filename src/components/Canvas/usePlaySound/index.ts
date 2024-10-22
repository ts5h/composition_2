import { useCallback } from "react";
import { useAtom } from "jotai";
import { audioContextAtom, soundFlagAtom } from "../../../store/Atoms";

export const usePlaySound = () => {
  const [audioContext] = useAtom<AudioContext>(audioContextAtom);
  const [isSound] = useAtom(soundFlagAtom);

  const getFrequency = useCallback((midiNumber: number) => {
    return 2 ** ((midiNumber - 69) / 12) * 440;
  }, []);

  const playSound = useCallback(
    (midiNumber: number, speed: number, isBass: boolean) => {
      if (!isSound) return;

      const chord = isBass
        ? [midiNumber]
        : [midiNumber, midiNumber + 3, midiNumber + 7, midiNumber + 10];
      const duration = isBass ? (10 - speed) * 0.5 : (10 - speed) * 0.25;

      const compressor = audioContext.createDynamicsCompressor();

      chord.forEach((tone) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = getFrequency(tone);
        // NOTE: Cut super bass
        if (oscillator.frequency.value <= 55) return;

        oscillator
          .connect(gain)
          .connect(compressor)
          .connect(audioContext.destination);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);

        gain.gain.setValueAtTime(
          oscillator.frequency.value / 1000,
          audioContext.currentTime,
        );
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          audioContext.currentTime + duration,
        );

        oscillator.onended = () => {
          oscillator.disconnect();
          gain.disconnect();
        };
      });
    },
    [audioContext, getFrequency, isSound],
  );

  return {
    playSound,
  };
};
