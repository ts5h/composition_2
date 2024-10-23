import { useAtom } from "jotai";
import { useCallback } from "react";
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
        if (oscillator.frequency.value < 65) return;

        const offset = 0.05;

        oscillator
          .connect(gain)
          .connect(compressor)
          .connect(audioContext.destination);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration + offset);

        gain.gain.setValueAtTime(0, audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(
          oscillator.frequency.value / 2500,
          audioContext.currentTime + offset,
        );
        gain.gain.exponentialRampToValueAtTime(
          0.00001,
          audioContext.currentTime + duration + offset,
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
