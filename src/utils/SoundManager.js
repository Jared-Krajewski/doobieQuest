/**
 * SoundManager
 * 
 * Centralized audio management system for the game.
 * Handles background music, sound effects, volume control, and audio state.
 */
export class SoundManager {
  constructor(scene) {
    this.scene = scene;
    this.music = null;
    this.soundEnabled = true;
    this.musicEnabled = true;
    this.soundVolume = 0.7;
    this.musicVolume = 0.5;
  }

  /**
   * Play background music for a level (loops automatically)
   */
  playMusic(key, volume = null) {
    // Stop current music if playing
    this.stopMusic();

    if (!this.musicEnabled) return;

    const vol = volume !== null ? volume : this.musicVolume;
    
    this.music = this.scene.sound.add(key, {
      loop: true,
      volume: vol
    });
    
    this.music.play();
  }

  /**
   * Stop background music
   */
  stopMusic() {
    if (this.music) {
      this.music.stop();
      this.music = null;
    }
  }

  /**
   * Pause/resume background music
   */
  pauseMusic() {
    if (this.music && this.music.isPlaying) {
      this.music.pause();
    }
  }

  resumeMusic() {
    if (this.music && this.music.isPaused) {
      this.music.resume();
    }
  }

  /**
   * Play a sound effect
   */
  playSound(key, config = {}) {
    if (!this.soundEnabled) return;

    const volume = config.volume !== undefined ? config.volume : this.soundVolume;
    
    this.scene.sound.play(key, {
      volume: volume,
      rate: config.rate || 1.0,
      detune: config.detune || 0,
      seek: config.seek || 0,
      loop: config.loop || false,
      delay: config.delay || 0
    });
  }

  /**
   * Common game sound effects
   */
  playAttack() {
    this.playSound('attack', { volume: 0.6 });
  }

  playBoomerang() {
    this.playSound('boomerang', { volume: 0.5, loop: false });
  }

  playPickup() {
    this.playSound('pickup', { volume: 0.5 });
  }

  playDamage() {
    this.playSound('damage', { volume: 0.7 });
  }

  playDeath() {
    this.playSound('death', { volume: 0.8 });
  }

  playDoorOpen() {
    this.playSound('door', { volume: 0.6 });
  }

  playCollectMoney() {
    this.playSound('money', { volume: 0.5, rate: 1.2 });
  }

  playCollectHeart() {
    this.playSound('heart', { volume: 0.6 });
  }

  playEnemyHit() {
    this.playSound('enemy_hit', { volume: 0.5 });
  }

  playEnemyDeath() {
    this.playSound('enemy_death', { volume: 0.6 });
  }

  playVictory() {
    this.playSound('victory', { volume: 0.8 });
  }

  playGameOver() {
    this.playSound('gameover', { volume: 0.7 });
  }

  /**
   * Volume controls
   */
  setSoundVolume(volume) {
    this.soundVolume = Phaser.Math.Clamp(volume, 0, 1);
  }

  setMusicVolume(volume) {
    this.musicVolume = Phaser.Math.Clamp(volume, 0, 1);
    if (this.music) {
      this.music.setVolume(this.musicVolume);
    }
  }

  /**
   * Toggle audio on/off
   */
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    
    if (!this.musicEnabled && this.music) {
      this.stopMusic();
    }
    
    return this.musicEnabled;
  }

  /**
   * Cleanup
   */
  destroy() {
    this.stopMusic();
  }
}
