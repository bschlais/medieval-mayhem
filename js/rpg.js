/* =========================================================
   MEDIEVAL MAYHEM - RPG System (XP, Levels, Stats, Titles)
   ========================================================= */

const TITLE_DATA = {
    'Novice Knight':       { desc: 'Every legend starts somewhere.' },
    'Monster Slayer':      { desc: 'Defeated your first monster.' },
    'Goblin Slayer':       { desc: 'Defeated 5 goblins.' },
    'Bane of Goblins':     { desc: 'Defeated 20 goblins.' },
    'Royal Taco Supplier': { desc: 'Saved the kingdom with tacos.' },
    'Shepherd\'s Friend':  { desc: 'Returned the missing sheep.' },
    'Good Samaritan':      { desc: 'Helped a traveler in need.' },
    'Lucky Foot':          { desc: 'Found the Royal Lucky Socks.' },
    'Herb Whisperer':      { desc: 'Helped a dragon\'s dandruff crisis.' },
    'Seasoned Adventurer': { desc: 'Reached Level 5.' },
    'Veteran Knight':      { desc: 'Reached Level 10.' },
    'Hero of the Kingdom': { desc: 'Completed all main quests.' },
};

class RPGSystem {
    constructor() {
        this.level   = 1;
        this.xp      = 0;
        this.titles  = ['Novice Knight'];
        this.activeTitle = 'Novice Knight';
        this.achievements = {};
        this.kills   = {};
        this.exploredZones = [];

        this.stats = {
            maxHp:      100,
            hp:         100,
            strength:   10,
            defense:    5,
            maxStamina: 100,
            stamina:    100,
            charisma:   5,
        };

        // Callbacks (set by Game)
        this.onLevelUp    = null;
        this.onTitleUnlock = null;
    }

    getXPRequired(level) {
        if (level <= 1) return 0;
        return Math.floor(CONFIG.BASE_XP * Math.pow(CONFIG.XP_GROWTH, level - 2));
    }

    getXPForNext() {
        return this.getXPRequired(this.level + 1);
    }

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
        this.stats.maxHp      += 15;
        this.stats.hp          = this.stats.maxHp;
        this.stats.maxStamina += 10;
        this.stats.stamina     = this.stats.maxStamina;
        if (this.level % 2 === 0) this.stats.strength += 2;
        if (this.level % 3 === 0) this.stats.defense  += 1;
        this.stats.charisma += 1;

        const lvlTitles = { 5: 'Seasoned Adventurer', 10: 'Veteran Knight', 20: 'Hero of the Kingdom' };
        if (lvlTitles[this.level]) this.unlockTitle(lvlTitles[this.level]);

        if (this.onLevelUp) this.onLevelUp(this.level, this.stats);
    }

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

    recordKill(type) {
        this.kills[type] = (this.kills[type] || 0) + 1;
        if (type === 'goblin') {
            if (this.kills.goblin >= 1)  this.unlockAchievement('first_kill',    'Monster Slayer');
            if (this.kills.goblin >= 5)  this.unlockAchievement('goblin_slayer', 'Goblin Slayer');
            if (this.kills.goblin >= 20) this.unlockAchievement('goblin_bane',   'Bane of Goblins');
        }
    }

    discoverZone(zoneName) {
        if (!this.exploredZones.includes(zoneName)) {
            this.exploredZones.push(zoneName);
            this.addXP(25);
            return true;
        }
        return false;
    }

    takeDamage(raw) {
        const reduced = Math.max(1, raw - Math.floor(this.stats.defense / 4));
        this.stats.hp = Math.max(0, this.stats.hp - reduced);
        return reduced;
    }

    heal(amount) {
        this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + amount);
    }

    isDead() { return this.stats.hp <= 0; }

    useStamina(amount) {
        if (this.stats.stamina < amount) return false;
        this.stats.stamina = Math.max(0, this.stats.stamina - amount);
        return true;
    }

    regenStamina(dt) {
        this.stats.stamina = Math.min(this.stats.maxStamina, this.stats.stamina + 18 * dt);
    }

    getAttackDamage() {
        return Math.floor(this.stats.strength * 1.2 + Math.random() * 4 + 1);
    }

    toSaveData() {
        return {
            level: this.level, xp: this.xp,
            titles: this.titles, activeTitle: this.activeTitle,
            achievements: this.achievements, kills: this.kills,
            exploredZones: this.exploredZones,
            stats: { ...this.stats },
        };
    }

    fromSaveData(d) {
        this.level  = d.level;  this.xp   = d.xp;
        this.titles = d.titles; this.activeTitle = d.activeTitle;
        this.achievements  = d.achievements || {};
        this.kills         = d.kills || {};
        this.exploredZones = d.exploredZones || [];
        this.stats         = { ...d.stats };
    }
}
