/* =========================================================
   MEDIEVAL MAYHEM - Item Data & Inventory System
   ========================================================= */

const ITEM_DATA = {
    // Starting gear
    wooden_sword:     { id: 'wooden_sword',     name: 'Wooden Sword',            type: 'weapon', slot: 'weapon', icon: '🗡️',  power: 5,  desc: 'Better than your fists. Barely.' },
    leather_armor:    { id: 'leather_armor',     name: 'Leather Armor',           type: 'armor',  slot: 'armor',  icon: '🧥',  power: 3,  desc: 'Smells like adventure. Or cows.' },
    leather_boots:    { id: 'leather_boots',     name: 'Leather Boots',           type: 'shoes',  slot: 'shoes',  icon: '👢',  power: 1,  desc: 'Comfortable and only slightly muddy.' },

    // Weapons
    iron_sword:       { id: 'iron_sword',        name: 'Iron Sword',              type: 'weapon', slot: 'weapon', icon: '⚔️',  power: 12, desc: 'Sharp enough to impress goblins.' },
    royal_chain_mail: { id: 'royal_chain_mail',  name: 'Royal Chain Mail',        type: 'armor',  slot: 'armor',  icon: '🛡️',  power: 10, desc: 'Enchanted by the royal tailor. Smells faintly of tacos.' },
    boots_of_fortune: { id: 'boots_of_fortune',  name: 'Boots of Fortune',        type: 'shoes',  slot: 'shoes',  icon: '👢',  power: 5,  desc: 'The King\'s lucky socks woven inside. Slightly smelly. Very lucky.' },
    dragon_scale_charm: { id: 'dragon_scale_charm', name: 'Dragon Scale Charm',   type: 'accessory', slot: null,   icon: '🐉',  power: 8,  desc: 'From a grateful (anonymous) dragon. Reduces fire damage.' },

    // Consumables
    health_potion:    { id: 'health_potion',     name: 'Health Potion',           type: 'consumable', icon: '🧪', heal: 50,    desc: 'Restores 50 HP. Tastes like berries and regret.' },
    stamina_potion:   { id: 'stamina_potion',    name: 'Stamina Potion',          type: 'consumable', icon: '⚗️', stamina: 50, desc: 'Restores 50 Stamina. Side effects: mild heroism.' },
    mega_health_potion: { id: 'mega_health_potion', name: 'Mega Health Potion',   type: 'consumable', icon: '🍶', heal: 150,   desc: 'Restores 150 HP. Actually tastes good.' },

    // Quest items
    item_tortilla:    { id: 'item_tortilla',     name: 'Royal Flour Tortilla',    type: 'quest', icon: '🫓', desc: 'Freshly pressed. Still warm. The King will be pleased.' },
    item_beef:        { id: 'item_beef',         name: 'Royal Seasoned Beef',     type: 'quest', icon: '🥩', desc: 'Perfectly seasoned. Bernard refused to reveal his secret.' },
    item_cheese:      { id: 'item_cheese',       name: 'Glowing Magical Cheese',  type: 'quest', icon: '🧀', desc: 'Glows faintly blue. Daisy says that\'s "just the flavor."' },
    item_hot_sauce:   { id: 'item_hot_sauce',    name: 'Forest Fire Hot Sauce',   type: 'quest', icon: '🌶️', desc: 'Found growing wild in the forest. Intensely spicy.' },
    item_royal_socks: { id: 'item_royal_socks',  name: 'Royal Lucky Socks',       type: 'quest', icon: '🧦', desc: 'Green. Slightly smelly. Historically significant.' },
    item_moonbloom:   { id: 'item_moonbloom',    name: 'Moonbloom Herb',          type: 'quest', icon: '🌸', desc: 'Glows softly at night. Perfect for dragon shampoo.' },
    wool_bundle:      { id: 'wool_bundle',        name: 'Bundle of Wool',          type: 'quest', icon: '🐑', desc: 'Soft wool. Dave bit you when you took it.' },
    travelers_pack:   { id: 'travelers_pack',    name: 'Traveler\'s Pack',        type: 'misc',  icon: '🎒', desc: 'Harold\'s pack. Contains a diary about trees and regrets.' },
    ancient_taco:     { id: 'ancient_taco',      name: 'Ancient Taco of Kings',   type: 'consumable', icon: '🌮', heal: 200, desc: 'The legendary Royal Crisis Taco of 1423. Full heal.' },

    // Drops / misc
    goblin_ear:       { id: 'goblin_ear',        name: 'Goblin Ear',              type: 'misc',  icon: '👂', desc: 'Proof of victory. Do NOT put near your own ear.' },
    gold_coin:        { id: 'gold_coin',         name: 'Gold Coin',               type: 'currency', icon: '🪙', desc: 'Shiny!' },

    // Food (restore hunger + some HP)
    bread:            { id: 'bread',            name: 'Bread Loaf',         type: 'consumable', icon: '🍞', heal: 10, food: 35, desc: 'Freshly baked. Still warm.' },
    cooked_meat:      { id: 'cooked_meat',      name: 'Cooked Meat',        type: 'consumable', icon: '🍖', heal: 20, food: 55, desc: 'Hearty and filling.' },
    apple:            { id: 'apple',            name: 'Apple',              type: 'consumable', icon: '🍎', heal: 5,  food: 18, desc: 'An apple a day...' },
    cheese_wedge:     { id: 'cheese_wedge',     name: 'Cheese Wedge',       type: 'consumable', icon: '🧀', heal: 8,  food: 22, desc: 'Suspiciously yellow.' },
    roasted_chicken:  { id: 'roasted_chicken',  name: 'Roasted Chicken',    type: 'consumable', icon: '🍗', heal: 30, food: 65, desc: 'Wait. Is this...? No. No it isn\'t.' },

    // Loot weapons
    rusty_dagger:     { id: 'rusty_dagger',     name: 'Rusty Dagger',       type: 'weapon', slot: 'weapon', icon: '🗡️',  power: 7,  desc: 'Questionable rust, high character.' },
    steel_sword:      { id: 'steel_sword',      name: 'Steel Sword',        type: 'weapon', slot: 'weapon', icon: '⚔️',  power: 18, desc: 'A proper blade.' },
    war_axe:          { id: 'war_axe',          name: 'War Axe',            type: 'weapon', slot: 'weapon', icon: '🪓',  power: 22, desc: 'Heavy. Dangerous. Beautiful.' },

    // Loot armor/shoes
    chainmail_coif:   { id: 'chainmail_coif',   name: 'Chainmail Coif',     type: 'armor', slot: 'armor', icon: '🛡️', power: 6,  desc: 'Head and neck protection.' },
    iron_boots:       { id: 'iron_boots',       name: 'Iron Boots',         type: 'shoes', slot: 'shoes', icon: '👢', power: 3,  desc: 'Heavy but protective.' },
    fur_cloak:        { id: 'fur_cloak',        name: 'Fur Cloak',          type: 'armor', slot: 'armor', icon: '🧥', power: 4,  desc: 'Warm and surprisingly stylish.' },

    // Supplies
    rope:             { id: 'rope',             name: 'Rope',               type: 'misc', icon: '🪢', desc: 'Always useful.' },
    torch:            { id: 'torch',            name: 'Torch',              type: 'misc', icon: '🔦', desc: 'Lights the darkness.' },
    lockpick:         { id: 'lockpick',         name: 'Lockpick',           type: 'misc', icon: '🔑', desc: 'Opens things. Quietly.' },

    // Throwing rocks
    throwing_rock:    { id: 'throwing_rock',    name: 'Throwing Rock',      type: 'misc', icon: '🪨', desc: 'A good rock. Solid. Reliable.' },

    // Silly wearables (hat slot)
    sheep_hat:        { id: 'sheep_hat',        name: 'Sheep Hat',          type: 'hat',  slot: 'hat', icon: '🐑', power: 0, desc: 'Baaaa-rilliant fashion choice. A sheep. On your head.' },
    bucket_helm:      { id: 'bucket_helm',      name: 'Bucket Helm',        type: 'hat',  slot: 'hat', icon: '🪣', power: 1, desc: 'A bucket. On your head. Unexpectedly effective.' },
    flower_crown:     { id: 'flower_crown',     name: 'Flower Crown',       type: 'hat',  slot: 'hat', icon: '🌸', power: 0, desc: 'You look fabulous, darling.' },
    pot_helm:         { id: 'pot_helm',         name: 'Cooking Pot Helm',   type: 'hat',  slot: 'hat', icon: '🫕', power: 3, desc: 'Smells of stew. Surprisingly effective defense.' },
    antler_hat:       { id: 'antler_hat',       name: 'Antler Hat',         type: 'hat',  slot: 'hat', icon: '🦌', power: 0, desc: 'You look like a festive woodland spirit.' },
};

const SLOTS = ['weapon', 'armor', 'shoes', 'hat'];
const INV_SIZE = 24;

class InventorySystem {
    constructor() {
        this.slots    = new Array(INV_SIZE).fill(null);
        this.equipped = { weapon: null, armor: null, shoes: null };
        this.gold     = 0;
        this.onUpdate = null;
    }

    addItem(itemId, qty = 1) {
        const item = ITEM_DATA[itemId];
        if (!item) return false;

        // Stack consumables / quest / misc in existing slot
        if (['consumable', 'quest', 'misc', 'currency'].includes(item.type)) {
            for (let i = 0; i < this.slots.length; i++) {
                if (this.slots[i]?.id === itemId) {
                    this.slots[i].qty += qty;
                    if (this.onUpdate) this.onUpdate();
                    return true;
                }
            }
        }

        // Find empty slot
        const empty = this.slots.indexOf(null);
        if (empty === -1) return false;
        this.slots[empty] = { id: itemId, qty };
        if (this.onUpdate) this.onUpdate();
        return true;
    }

    removeItem(itemId, qty = 1) {
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i]?.id === itemId) {
                this.slots[i].qty -= qty;
                if (this.slots[i].qty <= 0) this.slots[i] = null;
                if (this.onUpdate) this.onUpdate();
                return true;
            }
        }
        return false;
    }

    hasItem(itemId) {
        return this.slots.some(s => s?.id === itemId) ||
               Object.values(this.equipped).some(s => s?.id === itemId);
    }

    getItemCount(itemId) {
        let count = 0;
        for (const s of this.slots) if (s?.id === itemId) count += s.qty;
        return count;
    }

    equip(slotIndex) {
        const entry = this.slots[slotIndex];
        if (!entry) return false;
        const item = ITEM_DATA[entry.id];
        if (!item || !item.slot) return false;

        // Unequip current
        if (this.equipped[item.slot]) {
            this.addItem(this.equipped[item.slot].id, this.equipped[item.slot].qty);
        }
        this.equipped[item.slot] = { ...entry };
        this.slots[slotIndex] = null;
        if (this.onUpdate) this.onUpdate();
        return true;
    }

    unequip(slotName) {
        if (!this.equipped[slotName]) return false;
        this.addItem(this.equipped[slotName].id, this.equipped[slotName].qty);
        this.equipped[slotName] = null;
        if (this.onUpdate) this.onUpdate();
        return true;
    }

    useConsumable(slotIndex, rpg) {
        const entry = this.slots[slotIndex];
        if (!entry) return false;
        const item = ITEM_DATA[entry.id];
        if (!item || item.type !== 'consumable') return false;
        if (item.heal)    rpg.heal(item.heal);
        if (item.stamina) rpg.stats.stamina = Math.min(rpg.stats.maxStamina, rpg.stats.stamina + item.stamina);
        if (item.food && rpg.stats.hunger !== undefined) {
            rpg.stats.hunger = Math.min(rpg.stats.maxHunger, rpg.stats.hunger + item.food);
        }
        this.removeItem(entry.id, 1);
        return item;
    }

    getEquippedHat() { return this.equipped.hat ? ITEM_DATA[this.equipped.hat.id] : null; }

    getBonusStrength() {
        const w = this.equipped.weapon ? (ITEM_DATA[this.equipped.weapon.id]?.power || 0) : 0;
        return w;
    }

    getBonusDefense() {
        const a = this.equipped.armor ? (ITEM_DATA[this.equipped.armor.id]?.power || 0) : 0;
        const s = this.equipped.shoes ? (ITEM_DATA[this.equipped.shoes.id]?.power || 0) : 0;
        return a + s;
    }

    addGold(amount) { this.gold += amount; if (this.onUpdate) this.onUpdate(); }

    toSaveData() { return { slots: this.slots, equipped: this.equipped, gold: this.gold }; }
    fromSaveData(d) {
        this.slots    = d.slots    || new Array(INV_SIZE).fill(null);
        this.equipped = d.equipped || { weapon: null, armor: null, shoes: null, hat: null };
        if (!this.equipped.hat) this.equipped.hat = null;
        this.gold     = d.gold     || 0;
    }
}
