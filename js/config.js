/* =========================================================
   MEDIEVAL MAYHEM - Configuration Constants
   ========================================================= */

const CONFIG = {
    SAVE_KEY: 'medieval_mayhem_v1',

    ZONES: {
        VILLAGE: { name: 'Village of Thornwick', x: 0, z: 0, radius: 55 },
        CASTLE:  { name: 'Castle Ironhold',      x: 0, z: -120, radius: 65 },
        FOREST:  { name: 'Whispering Woods',     x: -90, z: 75, radius: 70 },
    },

    SKIN_COLORS: {
        light:  0xFFD5B0,
        pale:   0xFFE8D6,
        medium: 0xD4956A,
        tan:    0xC49A6C,
        dark:   0x8B5E3C,
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

    // Player
    PLAYER_SPEED:     8,
    PLAYER_RUN_SPEED: 14,
    CAMERA_DISTANCE:  10,
    CAMERA_HEIGHT:    5,
    CAMERA_MIN_Y:     2,
    INTERACT_RANGE:   4.5,

    // Combat
    GOBLIN_DETECT_RANGE: 16,
    GOBLIN_ATTACK_RANGE: 1.8,
    PLAYER_ATTACK_RANGE: 2.5,
    ATTACK_COOLDOWN:     0.8,

    // RPG
    MAX_LEVEL:     30,
    BASE_XP:       100,
    XP_GROWTH:     1.75,

    // Gravity
    GRAVITY: -20,
};
