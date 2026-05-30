/* =========================================================
   MEDIEVAL MAYHEM - Main Game Class
   ========================================================= */

class Game {
    constructor() {
        this.state = 'MENU'; // MENU | CHARACTER_CREATE | PLAYING | PAUSED | DIALOGUE | INVENTORY | QUEST_JOURNAL | LEVEL_UP

        // Systems (initialized in init())
        this.save      = new SaveSystem();
        this.rpg       = null;
        this.quests    = null;
        this.inventory = null;
        this.world     = null;
        this.npcSystem = null;
        this.combat    = null;
        this.player    = null;
        this.ui        = null;

        // Three.js
        this.renderer = null;
        this.scene    = null;
        this.camera   = null;
        this.clock    = new THREE.Clock();

        // Preview renderer (character creation)
        this.previewRenderer = null;
        this.previewScene    = null;
        this.previewCamera   = null;
        this.previewChar     = null;
        this.previewRotT     = 0;

        // Character data
        this.characterData = {
            name: 'Hero', race: 'human_knight', gender: 'boy', body: 'average',
            skin: 'light', hair: 'short', hairColor: 'brown',
            eyeColor: 'brown', facialHair: 'none',
            armor: 'leather', shoes: 'boots',
        };

        // Zone tracking
        this.currentZone = null;

        // Level up pending title
        this._pendingTitle = null;
        this._pendingLevelUp = null;
    }

    /* ================================================================
       INITIALIZATION
       ================================================================ */

    init() {
        this._setupRenderer();
        this._setupLighting();
        this._setupMenuBackground();
        this._setupMenuEvents();

        // Check for existing save
        if (this.save.hasSave()) {
            document.getElementById('btn-resume-journey').disabled = false;
        }

        this.animate();
    }

    _setupRenderer() {
        const canvas = document.getElementById('gc');
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.scene  = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1A0A2E);

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 600);
        this.camera.position.set(0, 8, 18);

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            if (this.previewRenderer) {
                const pc = document.getElementById('preview-canvas');
                this.previewRenderer.setSize(pc.clientWidth, pc.clientHeight);
                this.previewCamera.aspect = pc.clientWidth / pc.clientHeight;
                this.previewCamera.updateProjectionMatrix();
            }
        });
    }

    _setupLighting() {
        this._ambLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
        this.scene.add(this._ambLight);

        this._sunLight = new THREE.DirectionalLight(0xFFFAE0, 1.2);
        this._sunLight.position.set(50, 100, 50);
        this._sunLight.castShadow = true;
        this._sunLight.shadow.mapSize.width  = 2048;
        this._sunLight.shadow.mapSize.height = 2048;
        this._sunLight.shadow.camera.near   = 0.5;
        this._sunLight.shadow.camera.far    = 500;
        this._sunLight.shadow.camera.left   = -200;
        this._sunLight.shadow.camera.right  =  200;
        this._sunLight.shadow.camera.top    =  200;
        this._sunLight.shadow.camera.bottom = -200;
        this._sunLight.shadow.bias = -0.001;
        this.scene.add(this._sunLight);

        const fill = new THREE.DirectionalLight(0x8888FF, 0.3);
        fill.position.set(-50, 20, -50);
        this.scene.add(fill);
    }

    _setupMenuBackground() {
        // Animated particles for menu bg
        const partGeo = new THREE.BufferGeometry();
        const verts = [];
        for (let i = 0; i < 300; i++) {
            verts.push((Math.random()-0.5)*60, (Math.random()-0.5)*40, (Math.random()-0.5)*30);
        }
        partGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
        const partMat = new THREE.PointsMaterial({ color: 0xFFD700, size: 0.15, transparent: true, opacity: 0.6 });
        this.menuParticles = new THREE.Points(partGeo, partMat);
        this.scene.add(this.menuParticles);
    }

    /* ================================================================
       MENU EVENTS
       ================================================================ */

    _setupMenuEvents() {
        document.getElementById('btn-new-journey').addEventListener('click', () => {
            this.save.deleteSave();
            this._showScreen('screen-char-create');
            this._initCharacterCreator();
        });

        document.getElementById('btn-resume-journey').addEventListener('click', () => {
            this._loadAndStart();
        });
    }

    /* ================================================================
       CHARACTER CREATOR
       ================================================================ */

    _initCharacterCreator() {
        this.state = 'CHARACTER_CREATE';

        // Setup preview Three.js renderer
        const pc = document.getElementById('preview-canvas');
        const pw  = pc.clientWidth  || pc.offsetWidth  || 360;
        const ph  = pc.clientHeight || pc.offsetHeight || 480;
        this.previewRenderer = new THREE.WebGLRenderer({ canvas: pc, antialias: true, alpha: true });
        this.previewRenderer.setSize(pw, ph);
        this.previewRenderer.setClearColor(0x000000, 0);
        this.previewRenderer.shadowMap.enabled = true;

        this.previewScene  = new THREE.Scene();
        this.previewScene.background = new THREE.Color(0x1A1A2E);
        this.previewScene.add(new THREE.AmbientLight(0xFFFFFF, 0.6));
        const pl = new THREE.DirectionalLight(0xFFFFFF, 1);
        pl.position.set(3, 8, 5);
        this.previewScene.add(pl);
        const pl2 = new THREE.DirectionalLight(0x8888FF, 0.4);
        pl2.position.set(-3, 2, -3);
        this.previewScene.add(pl2);

        // Platform
        const platform = new THREE.Mesh(
            new THREE.CylinderGeometry(2, 2.2, 0.15, 24),
            new THREE.MeshLambertMaterial({ color: 0x8B6914 })
        );
        platform.position.y = -0.08;
        this.previewScene.add(platform);
        // Stars
        const sg = new THREE.BufferGeometry();
        const sv = [];
        for (let i = 0; i < 200; i++) sv.push((Math.random()-0.5)*30, (Math.random()-0.5)*20, (Math.random()-0.5)*20);
        sg.setAttribute('position', new THREE.Float32BufferAttribute(sv, 3));
        this.previewScene.add(new THREE.Points(sg, new THREE.PointsMaterial({color:0xFFFFFF,size:0.08})));

        this.previewCamera = new THREE.PerspectiveCamera(45, pw / ph, 0.1, 100);
        this.previewCamera.position.set(0, 2, 8);
        this.previewCamera.lookAt(0, 1.4, 0);

        // Build initial character
        this._rebuildPreviewChar();

        // UI bindings
        this.ui = new UIManager(this);
        this.ui.initCharacterCreator(this.characterData);

        // Preview drag-to-rotate
        let dragX = 0, dragging = false;
        pc.addEventListener('mousedown', e => { dragging = true; dragX = e.clientX; });
        pc.addEventListener('mousemove', e => {
            if (!dragging) return;
            if (this.previewChar) this.previewChar.rotation.y += (e.clientX - dragX) * 0.01;
            dragX = e.clientX;
        });
        pc.addEventListener('mouseup', () => { dragging = false; });
        pc.addEventListener('touchstart', e => { dragging=true; dragX=e.touches[0].clientX; }, {passive:true});
        pc.addEventListener('touchmove', e => {
            if(!dragging) return;
            if(this.previewChar) this.previewChar.rotation.y += (e.touches[0].clientX - dragX) * 0.01;
            dragX = e.touches[0].clientX;
        }, {passive:true});
        pc.addEventListener('touchend', () => { dragging=false; });
    }

    _rebuildPreviewChar() {
        if (this.previewChar) this.previewScene.remove(this.previewChar);
        this.previewChar = window.charBuilder.build(this.characterData, 1);
        this.previewChar.position.y = 0;
        this.previewScene.add(this.previewChar);
    }

    updatePreviewCharacter() {
        this._rebuildPreviewChar();
    }

    /* ================================================================
       START / LOAD GAME
       ================================================================ */

    startGame() {
        this._initGameSystems(null);
        this._showScreen('screen-hud');
        this._showGameUI(true);
        this.state = 'PLAYING';
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 120, 320);
        this.scene.remove(this.menuParticles);

        // Give starting items
        this.inventory.addItem('wooden_sword');
        this.inventory.addItem('leather_armor');
        this.inventory.addItem('leather_boots');
        this.inventory.addItem('health_potion', 2);
        this.inventory.equip(0);
        this.inventory.equip(1);
        this.inventory.equip(2);

        this.ui.showNotif('Welcome to Thornwick, brave adventurer!', '⚔️');
    }

    _loadAndStart() {
        const data = this.save.load();
        if (!data) { this.startGame(); return; }

        this.characterData = data.character || this.characterData;
        this._initGameSystems(data);
        this._showScreen('screen-hud');
        this._showGameUI(true);
        this.state = 'PLAYING';
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 120, 320);
        this.scene.remove(this.menuParticles);

        if (data.position) this.player.setPosition(data.position.x, data.position.z);
        this.ui.showNotif('Journey Resumed!', '⚔️');
    }

    _initGameSystems(saveData) {
        // Systems
        this.rpg       = new RPGSystem();
        this.quests    = new QuestSystem(this.rpg);
        this.inventory = new InventorySystem();

        if (saveData) {
            if (saveData.rpg)       this.rpg.fromSaveData(saveData.rpg);
            if (saveData.quests)    this.quests.fromSaveData(saveData.quests);
            if (saveData.inventory) this.inventory.fromSaveData(saveData.inventory);
        }

        // RPG callbacks — level-up now includes pendingStatPoints for manual allocation
        this.rpg.onLevelUp = (level, stats, pts) => {
            this._pendingLevelUp = { level, stats, pts };
            this._pendingTitle   = null;
        };
        this.rpg.onTitleUnlock = title => {
            this._pendingTitle = title;
            if (!this._pendingLevelUp) this.ui.showNotif(`New Title: "${title}"`, '🏆');
        };

        // Quest callbacks
        this.quests.onComplete = (id, qdata) => {
            this.ui.showNotif(`Quest Complete: ${qdata.title}!`, '🎉');
            this.inventory.addGold(qdata.rewards.gold || 0);
            (qdata.rewards.items || []).forEach(itemId => this.inventory.addItem(itemId));
            setTimeout(() => this._checkLevelUp(), 200);
        };
        this.quests.onUpdate = (id, type) => {
            if (type === 'progress') this.ui.showNotif('Quest Updated!', '📜');
        };

        // Inventory callback
        this.inventory.onUpdate = () => {
            if (this.state === 'INVENTORY') this.ui.renderInventory(this.inventory, this.rpg);
        };

        // Build world
        this.world = new WorldBuilder(this.scene);
        this.world.build();

        // Build player
        this.player = new PlayerController(this.scene, this.camera, this.characterData);
        this.player.setActive(true);

        // Build NPC system
        this.npcSystem = new NPCSystem(this.scene, this.quests, this.inventory);

        // Build combat system
        this.combat = new CombatSystem(this.scene, this.rpg, this.quests, this.inventory);
        this.combat.onKill   = (xp, gold) => {
            this.ui.showXPNumber(xp);
            const enemyType = this.combat.enemies.filter(e => !e.alive).pop()?.type || 'enemy';
            this.ui.showNotif(`${enemyType === 'orc' ? 'Orc' : 'Goblin'} defeated! +${xp} XP, +${gold} gold`, '⚔️');
        };
        this.combat.onDamage = (dmg, x, z) => {
            this.ui.showDamageNumber(dmg, x, z);
        };
        this.combat.onRepChange = (delta, npcName) => {
            this.ui.showNotif(`You attacked ${npcName}! Reputation: ${delta}`, '😡');
        };

        // TimeSystem — references sun/ambient created in _setupLighting()
        this.timeSystem = new TimeSystem(this.scene, this._sunLight, this._ambLight);
        if (saveData?.time) this.timeSystem.fromSaveData(saveData.time);

        // Apply race bonus once (new game only, not on load)
        if (!saveData && this.characterData.race) {
            this.rpg.applyRaceBonus(this.characterData.race);
        }

        // Setup input for gameplay
        this._setupGameInput();

        // Ensure UIManager exists
        if (!this.ui) this.ui = new UIManager(this);
    }

    _setupGameInput() {
        document.addEventListener('keydown', e => {
            // Prevent Space from scrolling page
            if (e.code === 'Space') e.preventDefault();

            if (this.state === 'PLAYING') {
                // Attack – SPACEBAR; trigger animation, register hit at punch peak (~120ms)
                if (e.code === 'Space') {
                    this.player.triggerAttack();
                    setTimeout(() => {
                        if (this.state !== 'PLAYING') return;
                        const pos = this.player.getPosition();
                        const rot = this.player.getRotation();
                        // Try enemy hit first
                        const hits = this.combat.playerAttack(pos.x, pos.z, rot);
                        if (hits.length > 0) {
                            hits.forEach(h => this.ui.showDamageNumber(h.damage, h.x, h.z));
                            this._checkLevelUp();
                        } else {
                            // Try villager hit (no damage, rep penalty)
                            this.combat.tryAttackVillager(pos.x, pos.z, rot, this.npcSystem);
                        }
                    }, 120);
                }
                if (e.code === 'KeyE')      this._tryInteract();
                if (e.code === 'KeyI')      this.toggleInventory();
                if (e.code === 'KeyJ')      this.toggleQuestJournal();
                if (e.code === 'KeyH')      this._quickHeal();
                if (e.code === 'KeyP')      this._checkLevelUp();  // open stat allocation if points pending
                if (e.code === 'Escape')    this.togglePause();
            } else if (this.state === 'PAUSED') {
                if (e.code === 'Escape') this.setState('PLAYING');
            } else if (this.state === 'INVENTORY' || this.state === 'QUEST_JOURNAL') {
                if (e.code === 'Escape' || e.code === 'KeyI' || e.code === 'KeyJ') this.setState('PLAYING');
            } else if (this.state === 'DIALOGUE') {
                if (e.code === 'Space' || e.code === 'Enter') this.ui._advanceDialogue?.();
            }
        });
    }

    _tryInteract() {
        const pos = this.player.getPosition();

        // Check NPC
        const npc = this.npcSystem.getNearby(pos.x, pos.z);
        if (npc) {
            const { lines, action, itemId, itemAction } = this.npcSystem.getDialogue(npc);
            this.setState('DIALOGUE');
            this.ui.openDialogue(npc, lines, action, npc.questGive);

            // Handle talkCallbacks
            if (npc.talkCallback) {
                npc.talkCallback.forEach(cb => {
                    const [qid, oid] = cb.split(':');
                    this.quests.progress(qid, oid);
                });
            }

            // Give second quest if applicable (e.g., King gives taco quest then socks)
            if (npc.questGiveTwo && this.quests.status(npc.id === 'king_edmund' ? 'kings_taco_emergency' : npc.questGiveTwo) === 'completed') {
                setTimeout(() => this.quests.start(npc.questGiveTwo), 500);
            }
            return;
        }

        // Check pickups
        const pickup = this.world.getNearbyPickup(pos.x, pos.z);
        if (pickup) {
            pickup.used = true;
            pickup.mesh.visible = false;

            if (pickup.type === 'sheep') {
                this.quests.onCollect('sheep');
                this.ui.showNotif('Found a sheep! 🐑', '🐑');
            } else {
                this.inventory.addItem(pickup.type);
                this.quests.onCollect(pickup.type);
                const item = ITEM_DATA[pickup.type];
                this.ui.showNotif(`Found: ${item?.name || pickup.type}!`, item?.icon || '📦');
            }
        }
    }

    _quickHeal() {
        for (let i = 0; i < INV_SIZE; i++) {
            const s = this.inventory.slots[i];
            if (s && ITEM_DATA[s.id]?.type === 'consumable') {
                const used = this.inventory.useConsumable(i, this.rpg);
                if (used) {
                    this.ui.showNotif(`Used ${used.name}`, used.icon || '🧪');
                    this.ui.showHealNumber(used.heal || used.stamina || 0);
                    return;
                }
            }
        }
        this.ui.showNotif('No consumables available!', '❌');
    }

    _checkLevelUp() {
        if (this._pendingLevelUp) {
            const { level, stats, pts } = this._pendingLevelUp;
            this._pendingLevelUp = null;
            this.setState('LEVEL_UP');
            this.ui.showLevelUp(level, stats, pts, this._pendingTitle);
            this._pendingTitle = null;
        } else if (this.rpg && this.rpg.pendingStatPoints > 0 && this.state === 'PLAYING') {
            // Show allocation if there are leftover points
            this.setState('LEVEL_UP');
            this.ui.showLevelUp(this.rpg.level, this.rpg.stats, this.rpg.pendingStatPoints, null);
        }
    }

    /* ================================================================
       STATE MANAGEMENT
       ================================================================ */

    setState(newState) {
        const prev = this.state;
        this.state = newState;

        // Show/hide panels
        document.getElementById('inventory').style.display     = newState === 'INVENTORY'     ? 'flex' : 'none';
        document.getElementById('quest-journal').style.display = newState === 'QUEST_JOURNAL' ? 'flex' : 'none';
        document.getElementById('pause-menu').style.display    = newState === 'PAUSED'        ? 'flex' : 'none';
        document.getElementById('level-up').style.display      = newState === 'LEVEL_UP'      ? 'flex' : 'none';

        if (newState === 'PLAYING') {
            document.getElementById('dialogue').style.display = 'none';
        }
        if (newState === 'INVENTORY') {
            this.ui.renderInventory(this.inventory, this.rpg);
        }
        if (newState === 'QUEST_JOURNAL') {
            this.ui.renderQuestJournal();
        }
        if (this.player) {
            this.player.setActive(newState === 'PLAYING');
        }
    }

    toggleInventory() {
        this.setState(this.state === 'INVENTORY' ? 'PLAYING' : 'INVENTORY');
    }

    toggleQuestJournal() {
        this.setState(this.state === 'QUEST_JOURNAL' ? 'PLAYING' : 'QUEST_JOURNAL');
    }

    togglePause() {
        this.setState(this.state === 'PAUSED' ? 'PLAYING' : 'PAUSED');
    }

    /* ================================================================
       SAVE
       ================================================================ */

    saveGame() {
        if (!this.player) return;
        const pos = this.player.getPosition();
        this.save.save({
            character:  { ...this.characterData },
            position:   { x: pos.x, z: pos.z },
            rpg:        this.rpg.toSaveData(),
            quests:     this.quests.toSaveData(),
            inventory:  this.inventory.toSaveData(),
            time:       this.timeSystem?.toSaveData(),
        });
    }

    /* ================================================================
       GAME LOOP
       ================================================================ */

    animate() {
        requestAnimationFrame(() => this.animate());
        const dt = Math.min(this.clock.getDelta(), 0.05);

        // Menu/preview animations
        if (this.state === 'MENU') {
            if (this.menuParticles) this.menuParticles.rotation.y += dt * 0.05;
            this.renderer.render(this.scene, this.camera);
            return;
        }

        if (this.state === 'CHARACTER_CREATE') {
            if (this.previewChar) this.previewChar.rotation.y += dt * 0.6;
            if (this.previewRenderer && this.previewScene && this.previewCamera) {
                this.previewRenderer.render(this.previewScene, this.previewCamera);
            }
            this.renderer.render(this.scene, this.camera);
            return;
        }

        // === GAMEPLAY ===

        if (this.state === 'PLAYING') {
            const pos = this.player.getPosition();

            // Time system (day/night cycle)
            if (this.timeSystem) {
                this.timeSystem.update(dt);
                // Forest: darker ambient when inside forest zone
                if (this.currentZone === 'FOREST') {
                    this._ambLight.intensity = Math.min(this._ambLight.intensity, 0.18);
                }
            }

            this.player.update(dt, this.world, this.combat, this.rpg);
            this.combat.update(dt, pos.x, pos.z);
            this.npcSystem.update(dt);
            this.world.updateSheep(dt);

            // Zone detection
            this._checkZone(pos.x, pos.z);

            // Nearby NPC prompt
            const nearNPC = this.npcSystem.getNearby(pos.x, pos.z);
            const nearPickup = this.world.getNearbyPickup(pos.x, pos.z);
            if (nearNPC) {
                this.ui.showInteractPrompt(true, `Press E to talk to ${nearNPC.name}`);
            } else if (nearPickup) {
                this.ui.showInteractPrompt(true, 'Press E to collect');
            } else {
                this.ui.showInteractPrompt(false);
            }

            // Death check
            if (this.rpg.isDead()) this._handleDeath();

            // Update HUD (includes time clock and reputation)
            this.ui.updateHUD(this.rpg, this.inventory, this.quests, this.timeSystem);

            // Auto-save every 60s
            this._autoSaveT = (this._autoSaveT || 0) + dt;
            if (this._autoSaveT > 60) { this._autoSaveT = 0; this.saveGame(); }
        }

        this.renderer.render(this.scene, this.camera);
    }

    _checkZone(x, z) {
        for (const [key, zone] of Object.entries(CONFIG.ZONES)) {
            const dx = x - zone.x, dz = z - zone.z;
            if (Math.sqrt(dx*dx + dz*dz) < zone.radius) {
                if (this.currentZone !== key) {
                    this.currentZone = key;
                    this.ui.showZoneName(zone.name);
                    // Track zone for save; NO XP awarded for exploration
                    if (!this.rpg.exploredZones.includes(zone.name)) {
                        this.rpg.exploredZones.push(zone.name);
                        this.ui.showNotif(`Entered: ${zone.name}`, '🗺️');
                    }
                }
                return;
            }
        }
        this.currentZone = null;
    }

    _handleDeath() {
        this.ui.showNotif('You were defeated! Respawning...', '💀');
        this.rpg.stats.hp = Math.floor(this.rpg.stats.maxHp * 0.5);
        this.player.setPosition(0, 8); // back to village
        setTimeout(() => this.ui.showNotif('You wake up in the village. With a headache.', '😅'), 2000);
    }

    /* ================================================================
       SCREEN MANAGEMENT
       ================================================================ */

    _showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const el = document.getElementById(id);
        if (el) el.classList.add('active');
    }

    _showGameUI(visible) {
        document.getElementById('screen-hud').style.display = visible ? 'block' : 'none';
        document.getElementById('screen-menu').classList.remove('active');
        document.getElementById('screen-char-create').classList.remove('active');
    }
}

/* ================================================================
   ENTRY POINT
   ================================================================ */

window.addEventListener('load', () => {
    window.game = new Game();
    window.game.init();
});
