/* =========================================================
   MEDIEVAL MAYHEM - RPG System v3
   Manual stat allocation; reputation; race bonuses applied at start.
   ========================================================= */

const TITLE_DATA = {
    'Novice Knight':       { desc: 'Every legend starts somewhere.' },
    'Monster Slayer':      { desc: 'Defeated your first monster.' },
    'Goblin Slayer':       { desc: 'Defeated 5 goblins.' },
    'Bane of Goblins':     { desc: 'Defeated 20 goblins.' },
    'Royal Taco Supplier': { desc: 'Saved the kingdom with tacos.' },
    "Shepherd's Friend":   { desc: 'Returned the missing sheep.' },
    'Good Samaritan':      { desc: 'Helped a traveler in need.' },
    'Lucky Foot':          { desc: 'Found the Royal Lucky Socks.' },
    'Herb Whisperer':      { desc: "Helped a dragon's dandruff crisis." },
    'Seasoned Adventurer': { desc: 'Reached Level 5.' },
    'Veteran Knight':      { desc: 'Reached Level 10.' },
    'Village Menace':      { desc: 'Made enemies of the villagers.' },
    'Hero of the Kingdom': { desc: 'Completed all main quests.' },
};

class RPGSystem {
    constructor() {
        this.level          = 1;
        this.xp             = 0;
        this.pendingStatPoints = 0;
        this.titles         = ['Novice Knight'];
        this.activeTitle    = 'Novice Knight';
        this.achievements   = {};
        this.kills          = {};
        this.exploredZones  = [];
        this.reputation     = 70;   // 0–100

        this.stats = {
            maxHp:      100,
            hp:         100,
            strength:   10,
            defense:    5,
            maxStamina: 100,
            stamina:    100,
            charisma:   5,
            maxHunger:  100,
            hunger:     100,
        };

        this.onLevelUp     = null;
        this.onTitleUnlock = null;
    }

    /* ---- Race bonus applied once at character creation ---- */
    applyRaceBonus(raceId) {
        const rd = RACE_DATA[raceId];
        if (!rd) return;
        const b = rd.statBonus;
        if (b.maxHp)      { this.stats.maxHp      += b.maxHp;      this.stats.hp      += b.maxHp; }
        if (b.strength)     this.stats.strength    += b.strength;
        if (b.defense)      this.stats.defense     += b.defense;
        if (b.maxStamina)  { this.stats.maxStamina += b.maxStamina; this.stats.stamina += b.maxStamina; }
        if (b.charisma)     this.stats.charisma    += b.charisma;
        // Clamp mins
        this.stats.strength  = Math.max(1, this.stats.strength);
        this.stats.defense   = Math.max(0, this.stats.defense);
        this.stats.charisma  = Math.max(1, this.stats.charisma);
    }

    /* ---- XP & Levelling ---- */
    getXPRequired(level) {
        if (level <= 1) return 0;
        return Math.floor(CONFIG.BASE_XP * Math.pow(CONFIG.XP_GROWTH, level - 2));
    }
    getXPForNext() { return this.getXPRequired(this.level + 1); }

    addXP(amount) {
        if (this.level >= CONFIG.MAX_LEVEL) return false;
        this.xp += amount;
        let leveled = false;
        while (this.xp >= this.getXPForNext() && this.level < CONFIG.MAX_LEVEL) {
            this.xp -= this.getXPForNext();
            this._levelUp();
            leveled = true;
        }
        return leveled;
    }

    _levelUp() {
        this.level++;
        this.pendingStatPoints += CONFIG.STAT_POINTS_PER_LEVEL;
        // Full restore on level-up
        this.stats.hp      = this.stats.maxHp;
        this.stats.stamina = this.stats.maxStamina;

        const lvlTitles = { 5: 'Seasoned Adventurer', 10: 'Veteran Knight' };
        if (lvlTitles[this.level]) this.unlockTitle(lvlTitles[this.level]);

        if (this.onLevelUp) this.onLevelUp(this.level, this.stats, this.pendingStatPoints);
    }

    /* ---- Manual stat allocation ---- */
    spendStatPoint(stat) {
        if (this.pendingStatPoints <= 0) return false;
        switch (stat) {
            case 'hp':       this.stats.maxHp      += 15; this.stats.hp      += 15; break;
            case 'strength': this.stats.strength   += 2; break;
            case 'defense':  this.stats.defense    += 1; break;
            case 'stamina':  this.stats.maxStamina += 15; this.stats.stamina += 15; break;
            case 'charisma': this.stats.charisma   += 2; break;
            default: return false;
        }
        this.pendingStatPoints--;
        return true;
    }

    /* ---- Reputation ---- */
    changeReputation(delta) {
        this.reputation = Math.max(0, Math.min(100, this.reputation + delta));
        if (this.reputation <= 20 && !this.achievements.village_menace) {
            this.unlockAchievement('village_menace', 'Village Menace');
        }
    }

    getReputationTier() {
        for (const tier of CONFIG.REP_TIERS) {
            if (this.reputation >= tier.min) return tier;
        }
        return CONFIG.REP_TIERS[CONFIG.REP_TIERS.length - 1];
    }

    /* ---- Titles & Achievements ---- */
    unlockTitle(title) {
        if (!this.titles.includes(title)) {
            this.titles.push(title);
            if (this.onTitleUnlock) this.onTitleUnlock(title);
            return true;
        }
        return false;
    }

    unlockAchievement(id, title) {
        if (this.achievements[id]) return false;
        this.achievements[id] = { date: Date.now() };
        this.unlockTitle(title);
        return true;
    }

    /* ---- Kill tracking ---- */
    recordKill(type) {
        this.kills[type] = (this.kills[type] || 0) + 1;
        if (type === 'goblin') {
            if (this.kills.goblin >= 1)  this.unlockAchievement('first_kill',    'Monster Slayer');
            if (this.kills.goblin >= 5)  this.unlockAchievement('goblin_slayer', 'Goblin Slayer');
            if (this.kills.goblin >= 20) this.unlockAchievement('goblin_bane',   'Bane of Goblins');
        }
    }

    /* ---- Zone tracking ---- */
    discoverZone(zoneName) {
        if (!this.exploredZones.includes(zoneName)) {
            this.exploredZones.push(zoneName);
            return true;
        }
        return false;
    }

    /* ---- Combat ---- */
    takeDamage(raw) {
        const reduced = Math.max(1, raw - Math.floor(this.stats.defense / 4));
        this.stats.hp = Math.max(0, this.stats.hp - reduced);
        return reduced;
    }
    heal(amount) { this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + amount); }
    isDead()     { return this.stats.hp <= 0; }

    useStamina(amount) {
        if (this.stats.stamina < amount) return false;
        this.stats.stamina = Math.max(0, this.stats.stamina - amount);
        return true;
    }
    regenStamina(dt) {
        this.stats.stamina = Math.min(this.stats.maxStamina, this.stats.stamina + 16 * dt);
    }

    getAttackDamage(hasWeapon = true) {
        const base = Math.floor(this.stats.strength * 1.2 + Math.random() * 4 + 1);
        return hasWeapon ? base : Math.min(CONFIG.UNARMED_MAX_DAMAGE, base);
    }

    /* ---- Persistence ---- */
    toSaveData() {
        return {
            level: this.level, xp: this.xp,
            pendingStatPoints: this.pendingStatPoints,
            titles: this.titles, activeTitle: this.activeTitle,
            achievements: this.achievements, kills: this.kills,
            exploredZones: this.exploredZones,
            reputation: this.reputation,
            stats: { ...this.stats },
        };
    }

    fromSaveData(d) {
        this.level  = d.level  ?? 1;  this.xp   = d.xp ?? 0;
        this.pendingStatPoints = d.pendingStatPoints ?? 0;
        this.titles = d.titles ?? ['Novice Knight'];
        this.activeTitle = d.activeTitle ?? 'Novice Knight';
        this.achievements  = d.achievements  ?? {};
        this.kills         = d.kills         ?? {};
        this.exploredZones = d.exploredZones ?? [];
        this.reputation    = d.reputation    ?? 70;
        this.stats = { ...d.stats };
        if (this.stats.maxHunger === undefined) { this.stats.maxHunger = 100; this.stats.hunger = 100; }
    }
}
