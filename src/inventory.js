// Global inventory state shared across all scenes
export const inventory = {
  money: 0,
  hasLighter: false,
  hasPapers: false,
  hasDoobie: false,
  health: 6, // Hearts (2 HP per heart = 12 total HP)
  maxHealth: 6,
  lives: 3,
  maxLives: 3,

  reset() {
    this.money = 0;
    this.hasLighter = false;
    this.hasPapers = false;
    this.hasDoobie = false;
    this.health = 6;
    this.lives = 3;
  },

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0 && this.lives > 0) {
      this.lives--;
      if (this.lives > 0) {
        this.health = this.maxHealth;
      }
    }
    return this.health;
  },

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  },

  addMoney(amount) {
    this.money += amount;
  },

  spendMoney(amount) {
    if (this.money >= amount) {
      this.money -= amount;
      return true;
    }
    return false;
  },
};
