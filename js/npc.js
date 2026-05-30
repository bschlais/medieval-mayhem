/* =========================================================
   MEDIEVAL MAYHEM - NPC System
   ========================================================= */

const NPC_DEFS = [
    /* Village */
    {
        id: 'mayor_thomas', name: 'Mayor Thomas', x: -10, z: -19, skinHex: 0xFFD5B0,
        clothHex: 0x4B0082, hairHex: 0x9E9E9E, hairStyle: 'short',
        questGive: 'missing_sheep',
        dialogue: {
            default:   ["Oh dear, oh dear! Five of our finest sheep have vanished! Would you be a hero and find them?",
                        "Please! Sir Fluffington alone is worth more than this entire town hall. Don't tell anyone I said that."],
            inProgress:["Any sign of the sheep? Dave in particular has been known to climb things he shouldn't.",
                        "The sheep must be found! The village wool supply is critical!"],
            complete:  ["You found them ALL! Even Dave, who was somehow upside-down in a tree. You are truly a hero of Thornwick!"],
        },
        // Taco quest: also marks quest done with king
        talkCallback: ['lost_traveler:escort_harold', 'kings_taco_emergency:return_king']
    },
    {
        id: 'innkeeper_molly', name: 'Innkeeper Molly', x: 12, z: -8, skinHex: 0xFFD5B0,
        clothHex: 0x8B0000, hairHex: 0xC0392B, hairStyle: 'long',
        questGive: null,
        dialogue: {
            default: ["Welcome to the Rusty Sword Inn! Our rooms are cozy. Our ale is... ale.",
                      "We had a wizard stay here once. He turned my cat into a slightly larger cat. I'm still upset.",
                      "Room for the night? Just 5 gold! Or I'll pretend I didn't see you if it's awkward."],
        },
        talkCallback: ['lost_traveler:escort_harold']
    },
    {
        id: 'blacksmith_hank', name: 'Hank the Blacksmith', x: -14, z: -8, skinHex: 0xD4956A,
        clothHex: 0x333333, hairHex: 0x1A1A1A, hairStyle: 'bald',
        questGive: null,
        dialogue: {
            default: ["*hammers air intensely* Busy! I'm very busy. Don't mind the air-hammering, it's... practice.",
                      "I made the King's crown. He asked for more points. I added 47. He looked ridiculous but was VERY pleased.",
                      "Need a weapon? I'd make you one but I'm in the middle of an existential crisis about metal."],
        },
    },
    {
        id: 'baker_bess', name: 'Baker Bess', x: 8, z: 13, skinHex: 0xFFE8D6,
        clothHex: 0xFFB347, hairHex: 0xF5D03A, hairStyle: 'braid',
        questGive: null,
        dialogue: {
            default: ["Fresh bread! Only slightly on fire today!",
                      "A goblin stole my famous sourdough last week. Honestly? He has good taste. I'm almost proud.",
                      "My bread is so good I've been offered three marriage proposals. All from the same person. Repeatedly."],
        },
    },
    {
        id: 'hunter_gerald', name: 'Hunter Gerald', x: -40, z: 28, skinHex: 0xC49A6C,
        clothHex: 0x355E3B, hairHex: 0x5D3A1A, hairStyle: 'short',
        questGive: 'goblin_trouble',
        dialogue: {
            default: ["Those goblins have formed a UNION. They have DEMANDS. I refuse to negotiate with organized crime!",
                      "Five goblins need to be... gently defeated. Very gently. With a sword."],
            inProgress: ["How's the goblin situation? My knee's acting up so I'm... supervising. Strategically."],
            complete:  ["You did it! Five goblins defeated! The forest is safe again. Until they elect a new union rep."],
        },
        talkCallback: ['goblin_trouble:report_gerald']
    },
    {
        id: 'miller_owen', name: 'Miller Owen', x: -5, z: -32, skinHex: 0xFFE8D6,
        clothHex: 0xF5F5DC, hairHex: 0x9E9E9E, hairStyle: 'short',
        questGive: null,
        itemGive: 'item_tortilla',
        itemGiveQuest: 'kings_taco_emergency',
        dialogue: {
            default: ["I make the finest flour in seven kingdoms! Last week's batch was... an incident. We don't discuss it.",
                      "The King sent word about TACOS? OH! This is the most important order of my career!"],
            afterItem: ["You have the tortilla! Handle it gently. She's a sensitive wrap."],
        },
    },
    {
        id: 'butcher_bernard', name: 'Butcher Bernard', x: 22, z: -5, skinHex: 0xD4956A,
        clothHex: 0xCC5555, hairHex: 0x1A1A1A, hairStyle: 'short',
        questGive: null,
        itemGive: 'item_beef',
        itemGiveQuest: 'kings_taco_emergency',
        dialogue: {
            default: ["Fresh meat! Freshest since last Tuesday! That's... recent enough.",
                      "The King needs beef for TACOS?! I've been waiting my whole life for this moment!"],
            afterItem: ["The royal beef is yours. It's seasoned with my secret herbs. The secret is love. And also a lot of garlic."],
        },
    },
    {
        id: 'dairy_daisy', name: 'Dairy Maid Daisy', x: -28, z: -5, skinHex: 0xFFD5B0,
        clothHex: 0xFFFFFF, hairHex: 0xF5D03A, hairStyle: 'braid',
        questGive: null,
        itemGive: 'item_cheese',
        itemGiveQuest: 'kings_taco_emergency',
        dialogue: {
            default: ["My cows give magical cheese! It glows a little blue sometimes. I'm SURE that's fine.",
                      "For the King's tacos? Say no more! The Royal Cheese is yours!"],
            afterItem: ["The cheese is magical and only slightly radioactive. Enjoy!"],
        },
    },
    {
        id: 'old_man_bert', name: 'Old Man Bert', x: 5, z: 8, skinHex: 0xFFE8D6,
        clothHex: 0x6B6B6B, hairHex: 0xF5F5F5, hairStyle: 'bald',
        questGive: null,
        dialogue: {
            default: ["In MY day we fought goblins with ROCKS! Uphill! Both ways! In the snow! ...It was summer but it felt like snow.",
                      "You look like an adventurer. I was an adventurer once. Then I got a cat and priorities changed.",
                      "I've seen four wars, two wizard duels, and one very dramatic goat. Nothing surprises me anymore."],
        },
    },
    {
        id: 'wandering_merchant', name: 'Merchant Pip', x: -20, z: -35, skinHex: 0xC49A6C,
        clothHex: 0xDAA520, hairHex: 0x5D3A1A, hairStyle: 'short',
        questGive: null,
        dialogue: {
            default: ["Buy something! ...I ran out of stock actually. But the INTENTION is there!",
                      "I used to sell rare artifacts. Then I sold my cart. Then my hat. It's been a rough week.",
                      "Have you seen a merchant named Harold? We were traveling together. He... wandered off."],
        },
    },

    /* Castle */
    {
        id: 'gate_guard_karl', name: 'Guard Karl', x: 0, z: -85, skinHex: 0xFFD5B0,
        clothHex: 0x808080, hairHex: 0x1A1A1A, hairStyle: 'short',
        questGive: null,
        dialogue: {
            default: ["Halt! State your... oh. You seem fine. Carry on then.",
                      "I've been standing here for 8 hours. My feet hurt. The kingdom better appreciate this.",
                      "The King is inside. He's been crying about tacos. It's... it's very intense. Good luck."],
        },
    },
    {
        id: 'king_edmund', name: 'King Edmund', x: 0, z: -137, skinHex: 0xFFE8D6,
        clothHex: 0xB8860B, hairHex: 0x9E9E9E, hairStyle: 'short',
        questGive: 'kings_taco_emergency',
        dialogue: {
            default: ["*sobbing dramatically* THREE DAYS! THREE DAYS WITHOUT TACOS! The kingdom is CRUMBLING!",
                      "My taco vendor was eaten by a small dragon. A SMALL one. That makes it WORSE somehow."],
            hasQuest: ["You'll gather ingredients? Oh bless you! Go forth! Make tacos! SAVE THE KINGDOM!"],
            inProgress: ["Have you got the ingredients yet? I'm running out of royal tears!"],
            complete:  ["THE TACOS. *takes bite* ...I need more. This is who I am now. You are named Royal Taco Supplier. It's official."],
            afterTacos: ["*contentedly munching* Mmm. The kingdom is saved. Thank you, dear taco champion."],
        },
        talkCallback: ['kings_taco_emergency:return_king', 'royal_sock_search:return_socks'],
        questGiveTwo: 'royal_sock_search',
        itemGive: null,
    },
    {
        id: 'royal_advisor', name: 'Advisor Reginald', x: -8, z: -125, skinHex: 0xFFD5B0,
        clothHex: 0x4B0082, hairHex: 0x9E9E9E, hairStyle: 'short',
        questGive: null,
        dialogue: {
            default: ["The King has been in taco withdrawal for three days. Please. I am begging you. Get him tacos.",
                      "I manage the entire kingdom's finances, military, and foreign policy. But I cannot solve the taco crisis. Help.",
                      "Yesterday he put a crown on a potato and called it 'Taco Junior.' We're all very worried."],
        },
    },
    {
        id: 'royal_chef', name: 'Chef Gustave', x: 8, z: -120, skinHex: 0xFFE8D6,
        clothHex: 0xFFFFFF, hairHex: 0xF5D03A, hairStyle: 'short',
        questGive: null,
        dialogue: {
            default: ["I could make the tacos MYSELF but the King insists they be authentically gathered. He is very dramatic.",
                      "The recipe calls for ingredients from across the kingdom. Which is inconvenient but very cinematic.",
                      "When you get the hot sauce — be careful. It's described as 'forest fire.' I take that literally."],
        },
    },

    /* Forest */
    {
        id: 'harold_traveler', name: 'Harold the Lost', x: -72, z: 88, skinHex: 0xD4956A,
        clothHex: 0x8B6914, hairHex: 0x5D3A1A, hairStyle: 'short',
        questGive: 'lost_traveler',
        dialogue: {
            default: ["OH THANK GOODNESS! A person! I've been lost for THREE DAYS! The trees all look the same!",
                      "I ate my map on day two. It tasted papery. And slightly informative. I regret everything.",
                      "Can you... help me get back to the village? I promise I'm normally much more competent."],
            inProgress: ["Please take me back to the village! I don't want to eat another bark sandwich."],
        },
        talkCallback: ['lost_traveler:find_harold']
    },
    {
        id: 'hermit_wizard', name: 'Hermit Aldric', x: -110, z: 95, skinHex: 0xFFE8D6,
        clothHex: 0x1E3A5F, hairHex: 0xF5F5F5, hairStyle: 'long',
        questGive: 'dragons_dandruff',
        dialogue: {
            default: ["I would help you but my magic only works on Tuesdays. I've lost track of the days.",
                      "A dragon named Flamewhistle has a dandruff problem. He won't admit it. But I've seen the evidence.",
                      "Moonbloom Herbs grow deep in the forest. They're blue-ish and glow slightly. Hard to miss."],
            inProgress: ["Have you found the Moonbloom? Flamewhistle is counting on us. Anonymously."],
            complete:  ["Excellent! The remedy is complete. Flamewhistle will be SO relieved. He texted me. Dragons text now."],
        },
        talkCallback: ['dragons_dandruff:return_herbs']
    },
];

/* ---- NPC System ---- */
class NPCSystem {
    constructor(scene, quests, inventory) {
        this.scene     = scene;
        this.quests    = quests;
        this.inventory = inventory;
        this.npcs      = [];
        this._build();
    }

    _build() {
        NPC_DEFS.forEach(def => {
            // Build visual
            const mesh = window.charBuilder.build({
                gender: 'boy', body: 'average',
                skin: this._skinKey(def.skinHex),
                hair: def.hairStyle || 'short',
                hairColor: this._hairKey(def.hairHex),
                eyeColor: 'brown', facialHair: 'none',
                armor: this._clothKey(def.clothHex),
                shoes: 'boots',
            });
            mesh.position.set(def.x, 0, def.z);
            // Random idle facing
            mesh.rotation.y = Math.random() * Math.PI * 2;
            mesh.castShadow  = true;
            this.scene.add(mesh);

            // Name tag (using floating text box as mesh — sprite-like box)
            const tag = this._nameTag(def.name);
            tag.position.set(def.x, 3.8, def.z);
            this.scene.add(tag);

            this.npcs.push({ ...def, mesh, tag, _wobbleT: Math.random() * Math.PI * 2 });
        });
    }

    _nameTag(name) {
        // Simple glowing box as placeholder — real text would require Canvas texture
        const canvas = document.createElement('canvas');
        canvas.width = 256; canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.roundRect ? ctx.roundRect(2,2,252,60,8) : ctx.fillRect(2,2,252,60);
        ctx.fill();
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 24px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name, 128, 32);
        const tex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(3, 0.75, 1);
        return sprite;
    }

    getNearby(px, pz, range = CONFIG.INTERACT_RANGE) {
        let closest = null, closestDist = range;
        for (const npc of this.npcs) {
            const dx = npc.mesh.position.x - px, dz = npc.mesh.position.z - pz;
            const d  = Math.sqrt(dx*dx + dz*dz);
            if (d < closestDist) { closestDist = d; closest = npc; }
        }
        return closest;
    }

    getDialogue(npc) {
        const lines = [];
        const qid   = npc.questGive;

        if (qid) {
            const st = this.quests.status(qid);
            if (st === 'not_started' && this.quests.canStart(qid)) {
                lines.push(...(npc.dialogue.default || []));
                return { lines, action: 'offer_quest', questId: qid };
            } else if (st === 'active') {
                lines.push(...(npc.dialogue.inProgress || npc.dialogue.default || []));
            } else if (st === 'completed') {
                lines.push(...(npc.dialogue.complete || npc.dialogue.default || []));
            } else {
                lines.push(...(npc.dialogue.default || []));
            }
        } else {
            lines.push(...(npc.dialogue.default || []));
        }

        // Item giving
        let itemAction = null;
        if (npc.itemGive) {
            const qst = npc.itemGiveQuest ? this.quests.status(npc.itemGiveQuest) : 'active';
            if (qst === 'active' && !this.inventory.hasItem(npc.itemGive)) {
                itemAction = { type: 'give_item', itemId: npc.itemGive };
                lines.push(...(npc.dialogue.hasItem || [`Take this ${npc.itemGive.replace('item_','')} — the King is counting on you!`]));
            } else if (this.inventory.hasItem(npc.itemGive)) {
                lines.push(...(npc.dialogue.afterItem || ['You already have what you need!']));
            }
        }

        return { lines, action: itemAction ? 'give_item' : null, itemId: npc.itemGive, itemAction };
    }

    update(dt) {
        this.npcs.forEach(npc => {
            npc._wobbleT += dt * 0.8;
            npc.mesh.rotation.y += Math.sin(npc._wobbleT * 0.3) * 0.005;
            // Bob
            npc.mesh.position.y = Math.sin(npc._wobbleT) * 0.04;
        });
    }

    /* Color key helpers */
    _skinKey(hex) {
        return Object.keys(CONFIG.SKIN_COLORS).find(k => CONFIG.SKIN_COLORS[k] === hex) || 'medium';
    }
    _hairKey(hex) {
        return Object.keys(CONFIG.HAIR_COLORS).find(k => CONFIG.HAIR_COLORS[k] === hex) || 'brown';
    }
    _clothKey(hex) {
        // Map cloth color to nearest armor type
        const map = { 0x4B0082:'robe', 0x8B0000:'robe', 0x333333:'leather', 0x355E3B:'scout', 0xB8860B:'plate', 0xDAA520:'plate', 0x808080:'chain', 0x6B6B6B:'leather', 0xCC5555:'leather', 0xFFB347:'leather', 0xFFFFFF:'leather', 0xF5F5DC:'leather', 0x1E3A5F:'robe', 0x8B6914:'leather' };
        return map[hex] || 'leather';
    }
}
