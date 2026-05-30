/* =========================================================
   MEDIEVAL MAYHEM - Quest Data & System
   ========================================================= */

const QUEST_DATA = {
    missing_sheep: {
        id: 'missing_sheep',
        title: '🐑 Missing Sheep',
        giver: 'mayor_thomas',
        unlockLevel: 1,
        description: 'The Mayor\'s prize sheep have wandered off. Find all 5 sheep and send them home.',
        humor: 'They are named Sir Fluffington, Countess Woolsworth, Baron Baaaah, Lady Lambchop, and Dave.',
        objectives: [
            { id: 'find_sheep', type: 'collect', desc: 'Find the 5 missing sheep (0/5)', target: 'sheep', required: 5 },
        ],
        rewards: { xp: 60, gold: 25, items: ['health_potion'], title: "Shepherd's Friend" },
        completeText: 'You found them all! Even Dave, who was somehow upside-down in a tree. Thank you!',
    },
    goblin_trouble: {
        id: 'goblin_trouble',
        title: '⚔️ Goblin Trouble',
        giver: 'hunter_gerald',
        unlockLevel: 1,
        description: 'Goblins have formed a gang in the Whispering Woods and are terrorizing travelers. Deal with them.',
        humor: 'The goblins have formed a union called "The Grumpy Green Guild." They demand shorter pillaging hours.',
        objectives: [
            { id: 'kill_goblins',  type: 'kill', desc: 'Defeat 5 goblins (0/5)', target: 'goblin', required: 5 },
            { id: 'report_gerald', type: 'talk', desc: 'Report back to Hunter Gerald',  target: 'hunter_gerald', required: 1 },
        ],
        rewards: { xp: 110, gold: 35, items: ['iron_sword'] },
        completeText: 'Incredible! Five goblins defeated! I\'d have done it myself but... my knee. You understand.',
    },
    lost_traveler: {
        id: 'lost_traveler',
        title: '🗺️ Lost Traveler',
        giver: 'harold_traveler',
        unlockLevel: 1,
        description: 'Merchant Harold has been lost in the Whispering Woods for three days. Help him reach the village.',
        humor: 'Harold ate his map on day 2. He says it tasted "papery but informative."',
        objectives: [
            { id: 'find_harold',   type: 'talk', desc: 'Find Harold in the forest',     target: 'harold_traveler', required: 1 },
            { id: 'escort_harold', type: 'talk', desc: 'Bring Harold to the village',   target: 'innkeeper_molly', required: 1 },
        ],
        rewards: { xp: 80, gold: 30, items: ['stamina_potion', 'health_potion'], title: 'Good Samaritan' },
        completeText: 'CIVILIZATION! I will never use shortcuts again. I mean it this time.',
    },
    kings_taco_emergency: {
        id: 'kings_taco_emergency',
        title: '🌮 The King\'s Taco Emergency',
        giver: 'king_edmund',
        unlockLevel: 2,
        description: 'CRISIS LEVEL: MAXIMUM! King Edmund hasn\'t had tacos in 3 days and the kingdom is crumbling. Gather authentic ingredients for the Royal Taco.',
        humor: 'The royal taco vendor was eaten by a "very small dragon." The dragon was reportedly embarrassed about it.',
        objectives: [
            { id: 'get_tortilla',  type: 'collect', desc: 'Get a tortilla from Miller Owen',       target: 'item_tortilla',  required: 1 },
            { id: 'get_beef',      type: 'collect', desc: 'Get royal beef from Butcher Bernard',    target: 'item_beef',      required: 1 },
            { id: 'get_cheese',    type: 'collect', desc: 'Get magical cheese from Dairy Maid Daisy', target: 'item_cheese', required: 1 },
            { id: 'get_hot_sauce', type: 'collect', desc: 'Find Forest Fire Hot Sauce in the woods', target: 'item_hot_sauce', required: 1 },
            { id: 'return_king',   type: 'talk',    desc: 'Deliver the ingredients to King Edmund', target: 'king_edmund',    required: 1 },
        ],
        rewards: { xp: 220, gold: 60, items: ['royal_chain_mail'], title: 'Royal Taco Supplier' },
        completeText: '*weeping tears of joy* THE TACO. It\'s perfect. I\'m naming it "The Royal Crisis Taco of 1423." You\'re a hero.',
    },
    royal_sock_search: {
        id: 'royal_sock_search',
        title: '🧦 The Royal Sock Mystery',
        giver: 'king_edmund',
        unlockLevel: 3,
        description: 'The King\'s enchanted lucky socks have gone missing. Without them he\'s had nothing but bad luck. Find them.',
        humor: 'The socks were last seen "somewhere near the kitchen." They smell like victory and old cheese.',
        objectives: [
            { id: 'find_socks',   type: 'collect', desc: 'Find the Royal Lucky Socks (check near the kitchen)', target: 'item_royal_socks', required: 1 },
            { id: 'return_socks', type: 'talk',    desc: 'Return socks to King Edmund',                          target: 'king_edmund',      required: 1 },
        ],
        rewards: { xp: 90, gold: 40, items: ['boots_of_fortune'] },
        completeText: 'MY SOCKS! Oh... they were in the kitchen the whole time. We do not speak of this.',
    },
    dragons_dandruff: {
        id: 'dragons_dandruff',
        title: '🐉 The Dragon\'s Embarrassing Problem',
        giver: 'hermit_wizard',
        unlockLevel: 5,
        description: 'A small dragon named Flamewhistle has a terrible dandruff problem and is very self-conscious. Collect rare Moonbloom Herbs to make a remedy.',
        humor: 'Flamewhistle asked to remain anonymous. He is the third-largest source of enchanted dandruff in the kingdom.',
        objectives: [
            { id: 'collect_herbs', type: 'collect', desc: 'Collect 3 Moonbloom Herbs from the deep forest (0/3)', target: 'item_moonbloom', required: 3 },
            { id: 'return_herbs',  type: 'talk',    desc: 'Bring the herbs to the Hermit Wizard',                  target: 'hermit_wizard',  required: 1 },
        ],
        rewards: { xp: 160, gold: 45, items: ['dragon_scale_charm'], title: 'Herb Whisperer' },
        completeText: 'Excellent! Flamewhistle will be so relieved. The dandruff was getting into my soup, my books, my dreams...',
    },
};

/* ---- Quest System ---- */
class QuestSystem {
    constructor(rpg) {
        this.rpg = rpg;
        this.state = {};   // id -> { status, objectives: {objId: current} }
        this.onUpdate   = null;
        this.onComplete = null;
        this.haroldEscorted = false;

        for (const id in QUEST_DATA) {
            this.state[id] = { status: 'not_started', objectives: {} };
            for (const obj of QUEST_DATA[id].objectives) {
                this.state[id].objectives[obj.id] = 0;
            }
        }
    }

    canStart(id) {
        const q = QUEST_DATA[id];
        return q && this.state[id].status === 'not_started' && this.rpg.level >= q.unlockLevel;
    }

    start(id) {
        if (!this.canStart(id)) return false;
        this.state[id].status = 'active';
        if (this.onUpdate) this.onUpdate(id, 'started');
        return true;
    }

    progress(questId, objId, amount = 1) {
        const st = this.state[questId];
        if (!st || st.status !== 'active') return false;
        const q = QUEST_DATA[questId];
        const obj = q.objectives.find(o => o.id === objId);
        if (!obj) return false;
        st.objectives[objId] = Math.min(obj.required, (st.objectives[objId] || 0) + amount);
        if (this.onUpdate) this.onUpdate(questId, 'progress');
        this._checkComplete(questId);
        return true;
    }

    _checkComplete(id) {
        const st  = this.state[id];
        const q   = QUEST_DATA[id];
        if (st.status !== 'active') return;
        for (const obj of q.objectives) {
            if ((st.objectives[obj.id] || 0) < obj.required) return;
        }
        st.status = 'completed';
        this.rpg.addXP(q.rewards.xp);
        if (q.rewards.title) this.rpg.unlockTitle(q.rewards.title);
        if (this.onComplete) this.onComplete(id, q);
    }

    isObjDone(qid, oid) {
        const st = this.state[qid]; const q = QUEST_DATA[qid];
        if (!st || !q) return false;
        const obj = q.objectives.find(o => o.id === oid);
        return obj && (st.objectives[oid] || 0) >= obj.required;
    }

    status(id) { return this.state[id]?.status || 'not_started'; }

    onKill(type) {
        for (const id in this.state) {
            if (this.state[id].status !== 'active') continue;
            for (const obj of QUEST_DATA[id].objectives) {
                if (obj.type === 'kill' && obj.target === type) this.progress(id, obj.id);
            }
        }
    }

    onCollect(target) {
        for (const id in this.state) {
            if (this.state[id].status !== 'active') continue;
            for (const obj of QUEST_DATA[id].objectives) {
                if (obj.type === 'collect' && obj.target === target) this.progress(id, obj.id);
            }
        }
    }

    onTalk(npcId) {
        for (const id in this.state) {
            if (this.state[id].status !== 'active') continue;
            for (const obj of QUEST_DATA[id].objectives) {
                if (obj.type === 'talk' && obj.target === npcId) this.progress(id, obj.id);
            }
        }
    }

    getActive()    { return Object.keys(this.state).filter(id => this.state[id].status === 'active').map(id => ({ ...QUEST_DATA[id], state: this.state[id] })); }
    getCompleted() { return Object.keys(this.state).filter(id => this.state[id].status === 'completed').map(id => ({ ...QUEST_DATA[id], state: this.state[id] })); }

    getFirstActiveObjective(id) {
        const q = QUEST_DATA[id]; const st = this.state[id];
        if (!q || !st || st.status !== 'active') return null;
        for (const obj of q.objectives) {
            if ((st.objectives[obj.id] || 0) < obj.required) return obj;
        }
        return null;
    }

    toSaveData()     { return { state: this.state, haroldEscorted: this.haroldEscorted }; }
    fromSaveData(d)  { if (d.state) this.state = d.state; this.haroldEscorted = d.haroldEscorted || false; }
}
