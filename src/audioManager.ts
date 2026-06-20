// Web Audio API Sound Manager — No external files needed!
class AudioManager {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicInterval: number | null = null;
  private musicVolume = 0.3;
  private sfxVolume = 0.8;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicVolume;
      this.musicGain.connect(this.ctx.destination);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  setMusicVolume(vol: number) {
    this.musicVolume = vol;
    if (this.musicGain) this.musicGain.gain.value = vol;
  }

  setSfxVolume(vol: number) {
    this.sfxVolume = vol;
    if (this.sfxGain) this.sfxGain.gain.value = vol;
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', vol = 0.5, startDelay = 0) {
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ctx.currentTime + startDelay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startDelay + duration);
      osc.start(ctx.currentTime + startDelay);
      osc.stop(ctx.currentTime + startDelay + duration);
    } catch (e) { /* silently fail */ }
  }

  // 💎 Treasure collected: magical chime
  collectTreasure() {
    [523, 659, 784, 1047].forEach((f, i) => this.playTone(f, 0.2, 'sine', 0.4, i * 0.08));
  }

  // 👻 Enemy nearby: spooky laugh (komedi)
  enemyAlert() {
    [220, 196, 220, 246, 220].forEach((f, i) => this.playTone(f, 0.15, 'sawtooth', 0.3, i * 0.12));
  }

  // 💥 Player teleported by enemy
  playerHit() {
    [300, 200, 150, 100].forEach((f, i) => this.playTone(f, 0.2, 'square', 0.4, i * 0.06));
  }

  // 🌀 Portal warp / time tunnel effect
  portalWarp() {
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 1.8);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.0);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 2.0);
    } catch(e) {}
  }

  // ✅ Level complete: triumphant fanfare
  levelComplete() {
    const notes = [523, 659, 784, 659, 784, 1047];
    notes.forEach((f, i) => this.playTone(f, 0.3, 'triangle', 0.5, i * 0.12));
  }

  // 💀 Player dies: somber tones
  playerDeath() {
    [440, 392, 349, 294, 247].forEach((f, i) => this.playTone(f, 0.6, 'sine', 0.4, i * 0.18));
  }

  // 🏆 Crystal Palace victory: epic chord
  grandVictory() {
    [[523, 659, 784], [659, 784, 1047], [784, 1047, 1319]].forEach((chord, ci) => {
      chord.forEach(f => this.playTone(f, 1.5, 'sine', 0.3, ci * 0.4));
    });
  }

  // 🎵 Background ambient music (mystical drone)
  startAmbientMusic() {
    if (this.musicInterval) return;
    const ctx = this.getCtx();
    const playChord = () => {
      const base = 110;
      [1, 1.5, 2, 2.5].forEach(ratio => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(this.musicGain!);
        osc.type = 'sine';
        osc.frequency.value = base * ratio;
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 3);
      });
    };
    playChord();
    this.musicInterval = window.setInterval(playChord, 3500);
  }

  stopAmbientMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  // 🚪 Menu button click
  buttonClick() {
    this.playTone(800, 0.08, 'sine', 0.3);
  }
}

export const audio = new AudioManager();
