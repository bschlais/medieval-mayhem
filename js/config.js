/* =========================================================
   MEDIEVAL MAYHEM - Configuration Constants v3
   ========================================================= */

const RACE_DATA = {
    human_knight: {
        name: 'Human Knight', icon: '⚔️',
        desc: 'Balanced and resilient. +STR +DEF',
        statBonus: { strength: 2, defense: 2, maxHp: 20 },
        skinDefault: 'light', scaleX: 1, scaleY: 1, scaleZ: 1,
    },
    goblin: {
        name: 'Goblin', icon: '👺',
        desc: 'Small and cunning. +STR +STA, –CHA',
        statBonus: { strength: 3, maxStamina: 30, charisma: -2 },
        skinDefault: 'goblin_green', scaleX: 1.0, scaleY: 0.82, scaleZ: 1.0,
    },
    elf: {
        name: 'Elf', icon: '🏹',
        desc: 'Graceful and charming. +CHA +STA, –STR',
        statBonus: { charisma: 4, maxStamina: 20, strength: -1 },
        skinDefault: 'pale', scaleX: 0.90, scaleY: 1.12, scaleZ: 0.90,
    },
    dwarf: {
        name: 'Dwarf', icon: '⛏️',
        desc: 'Tough as mountain stone. +STR +DEF +HP, –CHA',
        statBonus: { strength: 4, defense: 3, maxHp: 30, charisma: -2 },
        skinDefault: 'medium', scaleX: 1.18, scaleY: 0.82, scaleZ: 1.18,
    },
    wizard: {
        name: 'Wizard', icon: '🧙',
        desc: 'Magically gifted. +CHA, –STR –DEF',
        statBonus: { charisma: 6, strength: -2, defense: -2 },
        skinDefault: 'pale', scaleX: 0.90, scaleY: 1.10, scaleZ: 0.90,
    },
    rogue: {
        name: 'Rogue', icon: '🗡️',
        desc: 'Elusive and quick. +STA +STR, –DEF',
        statBonus: { maxStamina: 40, strength: 2, defense: -1 },
        skinDefault: 'tan', scaleX: 0.92, scaleY: 1.02, scaleZ: 0.92,
    },
};

const CONFIG = {
    SAVE_KEY: 'medieval_mayhem_v2',    // bumped version; old saves ignored

    ZONES: {
        VILLAGE:  { name: 'Village of Thornwick',   x: 0,    z: 0,    radius: 60 },
        CASTLE:   { name: 'Castle Ironhold',         x: 0,    z: -120, radius: 70 },
        FOREST:   { name: 'Whispering Woods',        x: -100, z: 80,   radius: 120 },
        EASTFORD: { name: 'Town of Eastford',        x: 195,  z: 45,   radius: 65 },
        SWAMP:    { name: 'Darkwater Swamp',         x: -195, z: 135,  radius: 80 },
        DESERT:   { name: 'Sunscorch Desert',        x: 265,  z: 110,  radius: 85 },
        RUINS:    { name: 'Ancient Ruins',           x: 55,   z: 205,  radius: 55 },
        SNOWLANDS:{ name: 'Frostpeak Highlands',     x: 0,    z: -265, radius: 75 },
    },

    SKIN_COLORS: {
        light:       0xFFD5B0,
        pale:        0xFFE8D6,
        medium:      0xD4956A,
        tan:         0xC49A6C,
        dark:        0x8B5E3C,
        goblin_green:0x4A7C3F,
    },

    HAIR_COLORS: {
        brown:  0x5D3A1A,
        black:  0x1A1A1A,
        blonde: 0xF5D03A,
        red:    0xC0392B,
        gray:   0x9E9E9E,
        white:  0xF5F5F5,
    },

    EYE_COLORS: {
        brown:  0x5D3A1A,
        blue:   0x1E90FF,
        green:  0x2E8B57,
        gray:   0x808080,
        purple: 0x8B00FF,
        amber:  0xFF8C00,
    },

    ARMOR_COLORS: {
        leather: { main: 0x8B4513, trim: 0xA0522D },
        chain:   { main: 0xB8B8B8, trim: 0xD3D3D3 },
        plate:   { main: 0xC0C8D4, trim: 0xFFD700 },
        robe:    { main: 0x4B0082, trim: 0xFFD700 },
        scout:   { main: 0x355E3B, trim: 0x8B6914 },
    },

    SHOE_COLORS: {
        boots:   0x5C3A1A,
        sandals: 0xD2691E,
        armored: 0x708090,
    },

    // Player movement
    PLAYER_SPEED:     8,
    PLAYER_RUN_SPEED: 15,
    CAMERA_DISTANCE:  10,
    CAMERA_MIN_Y:     2,
    INTERACT_RANGE:   4.5,

    // Combat
    GOBLIN_DETECT_RANGE: 18,
    GOBLIN_ATTACK_RANGE: 1.9,
    PLAYER_ATTACK_RANGE: 2.6,
    ATTACK_COOLDOWN:     0.75,
    UNARMED_MAX_DAMAGE:  8,

    // Enemy tiers (by distance from origin)
    ENEMY_TIERS: [
        { maxDist: 100,  hp: 50,  dmg: 10, speed: 4.5, xp: 30,  gold: [4,8] },
        { maxDist: 200,  hp: 85,  dmg: 16, speed: 5.5, xp: 55,  gold: [7,15] },
        { maxDist: 9999, hp: 130, dmg: 26, speed: 6.5, xp: 90,  gold: [12,25] },
    ],

    // RPG
    MAX_LEVEL:        30,
    BASE_XP:          120,
    XP_GROWTH:        1.80,
    STAT_POINTS_PER_LEVEL: 4,

    // Reputation tiers
    REP_TIERS: [
        { min: 85, label: 'Beloved Hero',      color: '#FFD700' },
        { min: 65, label: 'Good Standing',     color: '#44AA44' },
        { min: 40, label: 'Neutral',           color: '#AAAAAA' },
        { min: 20, label: 'Disliked',          color: '#FF8800' },
        { min: 0,  label: 'Outlaw',            color: '#FF2222' },
    ],
};
