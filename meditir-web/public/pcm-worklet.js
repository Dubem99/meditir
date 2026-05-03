// AudioWorklet processor that captures the microphone input and emits raw
// PCM16 (Int16, mono) to the main thread. The hosting AudioContext is
// constructed at 24 kHz so the browser handles resampling for us — this
// processor only does the float→int conversion.
//
// Posted to main thread: ArrayBuffer of little-endian Int16 samples.

class PCMWorklet extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 2400; // 100ms at 24kHz — small enough to feel real-time
    this.buffer = new Int16Array(this.bufferSize);
    this.bufferPos = 0;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || input.length === 0) return true;

    // Mix down to mono if we ever get stereo, otherwise channel 0.
    const channel = input[0];
    if (!channel) return true;

    for (let i = 0; i < channel.length; i++) {
      // Float32 [-1, 1] → Int16
      let s = channel[i];
      if (s > 1) s = 1;
      else if (s < -1) s = -1;
      this.buffer[this.bufferPos++] = s < 0 ? s * 0x8000 : s * 0x7fff;

      if (this.bufferPos === this.bufferSize) {
        // Post a fresh copy so the buffer can be reused next pass.
        const copy = new Int16Array(this.buffer);
        this.port.postMessage(copy.buffer, [copy.buffer]);
        this.bufferPos = 0;
      }
    }

    return true;
  }
}

registerProcessor('pcm-worklet', PCMWorklet);
