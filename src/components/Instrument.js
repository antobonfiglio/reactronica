import React, { useEffect, useRef, useContext } from 'react';
import PropTypes from 'prop-types';

// import { SongContext } from './Song';
import { TrackContext } from './Track';
import { NoteType, InstrumentTypes } from '../types/propTypes';
// import { instruments } from '../constants';
import Tone from '../lib/tone';
import { usePrevious } from '../lib/hooks';

const InstrumentConsumer = ({
  // <Instrument /> Props
  type = 'synth',
  options,
  // options = {
  //   oscillator: {
  //     type: 'triangle',
  //   },
  //   // release,
  //   // curve,
  // },
  polyphony = 4,
  oscillator,
  notes = [],
  samples,
  // <Track /> Props
  volume,
  pan,
  effectsChain,
  onInstrumentsUpdate,
}) => {
  const instrumentRef = useRef();
  const trackChannelBase = useRef(new Tone.PanVol(pan, volume));
  const prevNotes = usePrevious(notes);

  // -------------------------------------------------------------------------
  // INSTRUMENT TYPE
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (type === 'sampler') {
      instrumentRef.current = new Tone.Sampler(samples);

      if (options && options.curve) {
        instrumentRef.current.curve = options.curve;
      }

      if (options && options.release) {
        instrumentRef.current.release = options.release;
      }
    } else {
      let synth;

      if (type === 'AMSynth') {
        synth = Tone.AMSynth;
      } else if (type === 'duoSynth') {
        synth = Tone.DuoSynth;
      } else if (type === 'FMSynth') {
        synth = Tone.FMSynth;
      } else if (type === 'membraneSynth') {
        synth = Tone.MembraneSynth;
      } else if (type === 'monoSynth') {
        synth = Tone.MonoSynth;
      } else if (type === 'synth') {
        synth = Tone.Synth;
      } else {
        synth = Tone.Synth;
      }

      instrumentRef.current = new Tone.PolySynth(
        polyphony,
        synth,
        oscillator && {
          oscillator,
        },
      );
    }

    instrumentRef.current.chain(
      ...effectsChain,
      trackChannelBase.current,
      Tone.Master,
    );

    // Add this Instrument to Track Context
    onInstrumentsUpdate([instrumentRef.current]);

    return function cleanup() {
      if (instrumentRef.current) {
        instrumentRef.current.dispose();
      }
    };
  }, [type, polyphony, JSON.stringify(oscillator)]);

  // -------------------------------------------------------------------------
  // VOLUME / PAN
  // -------------------------------------------------------------------------

  useEffect(() => {
    trackChannelBase.current.volume.value = volume;
  }, [volume]);

  useEffect(() => {
    trackChannelBase.current.pan.value = pan;
  }, [pan]);

  // -------------------------------------------------------------------------
  // NOTES
  // -------------------------------------------------------------------------

  useEffect(() => {
    // Loop through all current notes
    notes &&
      notes.forEach((note) => {
        // Check if note is playing
        const isPlaying =
          prevNotes && prevNotes.filter((n) => n.name === note.name).length > 0;

        // Only play note is it isn't already playing
        if (!isPlaying) {
          instrumentRef.current.triggerAttack(note.name);
        }
      });

    // Loop through all previous notes
    prevNotes &&
      prevNotes.forEach((note) => {
        // Check if note is still playing
        const isPlaying =
          notes && notes.filter((n) => n.name === note.name).length > 0;

        if (!isPlaying) {
          instrumentRef.current.triggerRelease(note.name);
        }
      });
  }, [notes]);

  // -------------------------------------------------------------------------
  // EFFECTS CHAIN
  // -------------------------------------------------------------------------

  useEffect(() => {
    // console.log('<Instrument />', 'updateEffectsChain', effectsChain);

    // NOTE: Using trackChannelBase causes effects to not turn off
    instrumentRef.current.disconnect();
    instrumentRef.current.chain(
      ...effectsChain,
      trackChannelBase.current,
      Tone.Master,
    );
  }, [effectsChain]);

  return null;
};

InstrumentConsumer.propTypes = {
  // <Instrument /> Props
  type: InstrumentTypes.isRequired,
  options: PropTypes.object,
  notes: PropTypes.arrayOf(NoteType), // Currently played notes.
  samples: PropTypes.object,
  trackChannel: PropTypes.object, // An instance of new this.Tone.PanVol()
  // polyphony: PropTypes.number,
  // <Track /> Props
  volume: PropTypes.number,
  pan: PropTypes.number,
  polyphony: PropTypes.number,
  effectsChain: PropTypes.array,
  onInstrumentsUpdate: PropTypes.func,
};

const Instrument = (props) => {
  const value = useContext(TrackContext);
  // const { Tone } = useContext(SongContext);

  if (typeof window === 'undefined') {
    return null;
  }

  return <InstrumentConsumer {...value} {...props} />;
};

export default Instrument;
