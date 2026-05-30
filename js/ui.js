/* =========================================================
   MEDIEVAL MAYHEM - UI Manager
   ========================================================= */

class UIManager {
    constructor(game) {
        this.game = game;

        // Dialogue state
        this.dialogueLines  = [];
        this.dialogueLine   = 0;
        this.dialogueAction = null;
        this.dialogueNPC    = null;
        this.pendingQuestId = null;

        // Quest journal tab
        this.journalTab = 'active';

        // Notif queue
        this.notifQueue = [];
        this.notifShowing = false;

        this._bind();
    }

    _bind() {
        // Close buttons
        $('#close-inv').addEventListener('click', () => this.game.setState('PLAYING'));
        $('#close-qj').addEventListener('click',  () => this.game.setState('PLAYING'));
        $('#lu-continue').addEventListener('click', () => this.game.setState('PLAYING'));
        $('#btn-resume-game').addEventListener('click', () => this.game.setState('PLAYING'));
        $('#btn-save').addEventListener('click', () => { this.game.saveGame(); this.showNotif('Game Saved!', '💾'); });
        $('#btn-main-menu-from-pause').addEventListener('click', () => { this.game.saveGame(); location.reload(); });

        // Quest journal tabs
        document.querySelectorAll('.qj-tab').forEach(t => {
            t.addEventListener('click', () => {
                document.querySelectorAll('.qj-tab').forEach(x => x.classList.remove('active'));
                t.classList.add('active');
                this.journalTab = t.dataset.tab;
                this.renderQuestJournal();
            });
        });

        // Dialogue next
        $('#dialogue-advance').addEventListener('click', () => this._advanceDialogue());
        document.addEventListener('keydown', e => {
            if (e.code === 'Enter' || e.code === 'Space') {
                if (this.game.state === 'DIALOGUE') { e.preventDefault(); this._advanceDialogue(); }
            }
        });
    }

    /* ===== HUD ===== */

    updateHUD(rpg, inventory, quests, timeSystem) {
        const s = rpg.stats;
        const hpPct  = s.hp / s.maxHp;
        const spPct  = s.stamina / s.maxStamina;
        const xpPct  = rpg.xp / Math.max(1, rpg.getXPForNext());

        $('#hp-fill').style.width  = (hpPct * 100) + '%';
        $('#sp-fill').style.width  = (spPct * 100) + '%';
        $('#xp-fill').style.width  = (xpPct * 100) + '%';
        $('#hp-text').textContent  = `${Math.ceil(s.hp)}/${s.maxHp}`;
        $('#xp-text').textContent  = `${rpg.xp}/${rpg.getXPForNext()} XP`;
        $('#level-text').textContent = `Lv.${rpg.level}`;

        // Hunger bar
        const hungerFill = $('#hunger-fill');
        if (hungerFill && s.hunger !== undefined) {
            const hpct = s.hunger / s.maxHunger;
            hungerFill.style.width = (hpct * 100) + '%';
            hungerFill.style.background = hpct < 0.2 ? '#FF4422' : hpct < 0.5 ? '#FF8800' : '#CC8844';
        }
        $('#player-title').textContent = rpg.activeTitle;
        $('#player-name-hud').textContent = this.game.characterData.name;
        $('#inv-gold-amount').textContent = inventory.gold;
        $('#hud-gold').textContent = `🪙 ${inventory.gold}`;

        // Reputation
        const repTier = rpg.getReputationTier();
        const repEl = $('#hud-rep');
        if (repEl) {
            repEl.textContent = repTier.label;
            repEl.style.color = repTier.color;
        }

        // Pending stat points badge
        const ptsBadge = $('#hud-stat-pts');
        if (ptsBadge) {
            ptsBadge.style.display = rpg.pendingStatPoints > 0 ? 'block' : 'none';
            ptsBadge.textContent   = `${rpg.pendingStatPoints} stat pts! (Press P)`;
        }

        // Time clock
        if (timeSystem) {
            const timeEl = $('#hud-time-text');
            const iconEl = $('#hud-time-icon');
            if (timeEl) timeEl.textContent = timeSystem.getTimeString();
            if (iconEl) iconEl.textContent = timeSystem.getIcon();
        }

        // Active quest objective
        const active = quests.getActive();
        if (active.length > 0) {
            const q = active[0];
            const obj = quests.getFirstActiveObjective(q.id);
            if (obj) {
                const cur = q.state.objectives[obj.id] || 0;
                const txt = obj.desc.replace(/\(0\/\d+\)/g, `(${cur}/${obj.required})`).replace(/\(\d+\/\d+\)/g, `(${cur}/${obj.required})`);
                $('#quest-objective').textContent = `📜 ${q.title}: ${txt}`;
            }
        } else {
            $('#quest-objective').textContent = 'No active quest';
        }
    }

    showZoneName(name) {
        const el = $('#zone-name');
        el.textContent = name;
        el.style.opacity = '1';
        clearTimeout(this._zoneTimer);
        this._zoneTimer = setTimeout(() => { el.style.opacity = '0'; }, 3000);
    }

    showInteractPrompt(visible, text = 'Press E to talk') {
        const el = $('#interact-prompt');
        el.style.display = visible ? 'block' : 'none';
        if (visible) el.textContent = text;
    }

    /* ===== DAMAGE NUMBERS ===== */

    showDamageNumber(amount, x, z, color = '#FF4444') {
        const el  = document.createElement('div');
        el.className = 'damage-num';
        el.textContent = `-${amount}`;
        el.style.color = color;
        el.style.left  = '50%';
        el.style.top   = '40%';
        $('#damage-numbers').appendChild(el);
        setTimeout(() => el.remove(), 900);
    }

    showHealNumber(amount) {
        this.showDamageNumber(amount, 0, 0, '#44FF88');
    }

    showXPNumber(amount) {
        const el = document.createElement('div');
        el.className  = 'damage-num xp-num';
        el.textContent = `+${amount} XP`;
        el.style.color = '#FFD700';
        el.style.left  = '52%';
        el.style.top   = '38%';
        $('#damage-numbers').appendChild(el);
        setTimeout(() => el.remove(), 1200);
    }

    /* ===== DIALOGUE ===== */

    openDialogue(npc, lines, action, questId) {
        this.dialogueLines  = lines;
        this.dialogueLine   = 0;
        this.dialogueAction = action;
        this.dialogueNPC    = npc;
        this.pendingQuestId = questId;

        $('#dialogue-npc-name').textContent = npc.name;
        this._showDialogueLine();
        $('#dialogue').style.display = 'flex';
    }

    _showDialogueLine() {
        if (this.dialogueLine < this.dialogueLines.length) {
            $('#dialogue-text').textContent = this.dialogueLines[this.dialogueLine];
            this._renderChoices();
        }
    }

    _renderChoices() {
        const ch = $('#dialogue-choices');
        ch.innerHTML = '';
        const isLast = this.dialogueLine >= this.dialogueLines.length - 1;

        if (!isLast) {
            const btn = document.createElement('button');
            btn.textContent = 'Next →'; btn.className = 'dlg-btn';
            btn.addEventListener('click', () => this._advanceDialogue());
            ch.appendChild(btn);
        } else {
            // Last line: show action buttons
            if (this.dialogueAction === 'offer_quest' && this.pendingQuestId) {
                const acceptBtn = document.createElement('button');
                acceptBtn.textContent = '✅ Accept Quest'; acceptBtn.className = 'dlg-btn primary';
                acceptBtn.addEventListener('click', () => {
                    this.game.quests.start(this.pendingQuestId);
                    this.showNotif(`Quest Started: ${QUEST_DATA[this.pendingQuestId].title}`, '📜');
                    this.closeDialogue();
                });
                ch.appendChild(acceptBtn);
            }

            if (this.dialogueAction === 'give_item' && this.dialogueNPC.itemGive) {
                const takeBtn = document.createElement('button');
                takeBtn.textContent = '✅ Take Item'; takeBtn.className = 'dlg-btn primary';
                takeBtn.addEventListener('click', () => {
                    this.game.inventory.addItem(this.dialogueNPC.itemGive);
                    this.game.quests.onCollect(this.dialogueNPC.itemGive);
                    this.showNotif(`Received: ${ITEM_DATA[this.dialogueNPC.itemGive]?.name || this.dialogueNPC.itemGive}`, '📦');
                    this.closeDialogue();
                });
                ch.appendChild(takeBtn);
            }

            const closeBtn = document.createElement('button');
            closeBtn.textContent = 'Goodbye'; closeBtn.className = 'dlg-btn';
            closeBtn.addEventListener('click', () => this.closeDialogue());
            ch.appendChild(closeBtn);
        }
    }

    _advanceDialogue() {
        this.dialogueLine++;
        if (this.dialogueLine >= this.dialogueLines.length) {
            this._renderChoices();
        } else {
            this._showDialogueLine();
        }
    }

    closeDialogue() {
        $('#dialogue').style.display = 'none';
        this.game.setState('PLAYING');
    }

    /* ===== INVENTORY ===== */

    renderInventory(inventory, rpg) {
        const grid = $('#inv-grid');
        grid.innerHTML = '';

        for (let i = 0; i < INV_SIZE; i++) {
            const cell = document.createElement('div');
            cell.className = 'inv-cell';
            const entry = inventory.slots[i];
            if (entry) {
                const item = ITEM_DATA[entry.id];
                cell.innerHTML = `<span class="item-icon">${item?.icon || '?'}</span>${entry.qty > 1 ? `<span class="item-qty">${entry.qty}</span>` : ''}`;
                cell.title     = item ? `${item.name}\n${item.desc}` : entry.id;
                cell.addEventListener('click', () => {
                    if (item?.type === 'consumable') {
                        const used = inventory.useConsumable(i, rpg);
                        if (used) {
                            this.showNotif(`Used ${used.name}`, used.icon || '🧪');
                            this.renderInventory(inventory, rpg);
                        }
                    } else if (item?.slot) {
                        inventory.equip(i);
                        this.renderInventory(inventory, rpg);
                    }
                });
            }
            grid.appendChild(cell);
        }

        // Equipment slots
        SLOTS.forEach(slot => {
            const eq = inventory.equipped[slot];
            const el = $(`#slot-${slot}`);
            if (el) {
                if (eq) {
                    const item = ITEM_DATA[eq.id];
                    el.innerHTML = `<span class="item-icon">${item?.icon || '?'}</span>`;
                    el.title     = item?.name || eq.id;
                    el.onclick   = () => { inventory.unequip(slot); this.renderInventory(inventory, rpg); };
                } else {
                    el.innerHTML = `<span class="slot-empty">${slot}</span>`;
                    el.onclick   = null;
                }
            }
        });

        // Stats display
        const bonStr = inventory.getBonusStrength();
        const bonDef = inventory.getBonusDefense();
        $('#stats-display').innerHTML = `
            <div class="stat-row">❤️ HP: ${rpg.stats.maxHp}</div>
            <div class="stat-row">⚔️ STR: ${rpg.stats.strength} (+${bonStr})</div>
            <div class="stat-row">🛡️ DEF: ${rpg.stats.defense} (+${bonDef})</div>
            <div class="stat-row">💨 STA: ${rpg.stats.maxStamina}</div>
            <div class="stat-row">🗣️ CHA: ${rpg.stats.charisma}</div>
        `;
    }

    /* ===== QUEST JOURNAL ===== */

    renderQuestJournal() {
        const list = $('#qj-list');
        list.innerHTML = '';
        const quests = this.journalTab === 'active'
            ? this.game.quests.getActive()
            : this.game.quests.getCompleted();

        if (quests.length === 0) {
            list.innerHTML = `<p class="qj-empty">${this.journalTab === 'active' ? 'No active quests. Talk to villagers to find them!' : 'No completed quests yet. Keep adventuring!'}</p>`;
            return;
        }

        quests.forEach(q => {
            const el = document.createElement('div');
            el.className = 'qj-entry';
            const done = q.state.status === 'completed';
            el.innerHTML = `
                <h3 class="qj-title ${done ? 'done' : ''}">${q.title} ${done ? '✅' : ''}</h3>
                <p class="qj-desc">${q.description}</p>
                <p class="qj-humor"><em>${q.humor}</em></p>
                <div class="qj-objectives">
                    ${q.objectives.map(obj => {
                        const cur = q.state.objectives[obj.id] || 0;
                        const complete = cur >= obj.required;
                        const text = obj.desc.replace(/\(0\/\d+\)/g, `(${cur}/${obj.required})`).replace(/\(\d+\/\d+\)/g, `(${cur}/${obj.required})`);
                        return `<div class="qj-obj ${complete?'done':''}">• ${text} ${complete ? '✅' : ''}</div>`;
                    }).join('')}
                </div>
                <div class="qj-rewards">Rewards: ${q.rewards.xp} XP, ${q.rewards.gold} Gold${q.rewards.title ? `, "${q.rewards.title}" title` : ''}</div>
            `;
            list.appendChild(el);
        });
    }

    /* ===== LEVEL UP ===== */

    showLevelUp(level, stats, pendingPoints, newTitle) {
        $('#lu-level-num').textContent = `Level ${level}`;

        // Build interactive stat allocation grid
        const container = $('#lu-stats');
        container.innerHTML = '';

        const pts = pendingPoints ?? this.game.rpg.pendingStatPoints;

        const ptsLine = document.createElement('p');
        ptsLine.className = 'lu-pts-line';
        ptsLine.id = 'lu-pts-remaining-line';
        ptsLine.innerHTML = pts > 0
            ? `Allocate <span id="lu-pts-count" style="color:var(--gold);font-weight:bold">${pts}</span> stat point${pts !== 1 ? 's' : ''}:`
            : '<span style="color:#888">No pending stat points</span>';
        container.appendChild(ptsLine);

        const STAT_DEFS = [
            { key: 'hp',       label: '❤️ HP',       val: stats.maxHp,      gain: '+15 HP'  },
            { key: 'strength', label: '⚔️ Strength',  val: stats.strength,   gain: '+2 STR'  },
            { key: 'defense',  label: '🛡️ Defense',   val: stats.defense,    gain: '+1 DEF'  },
            { key: 'stamina',  label: '💨 Stamina',   val: stats.maxStamina, gain: '+15 STA' },
            { key: 'charisma', label: '🗣️ Charisma',  val: stats.charisma,   gain: '+2 CHA'  },
        ];

        const rebuild = () => this.showLevelUp(level, this.game.rpg.stats, this.game.rpg.pendingStatPoints, newTitle);

        STAT_DEFS.forEach(sd => {
            const row = document.createElement('div');
            row.className = 'lu-alloc-row';
            const curPts = this.game.rpg.pendingStatPoints;
            row.innerHTML = `
                <span class="la-stat-label">${sd.label}</span>
                <span class="la-stat-val">${sd.val}</span>
                <span class="la-stat-gain">${sd.gain}</span>
                <button class="la-btn" data-stat="${sd.key}" ${curPts <= 0 ? 'disabled' : ''}>+</button>
            `;
            row.querySelector('.la-btn').addEventListener('click', () => {
                if (this.game.rpg.spendStatPoint(sd.key)) rebuild();
            });
            container.appendChild(row);
        });

        // Title unlock
        const titleEl = $('#lu-title-unlock');
        if (newTitle) {
            titleEl.style.display = 'block';
            $('#lu-title-name').textContent = `"${newTitle}"`;
        } else {
            titleEl.style.display = 'none';
        }

        $('#level-up').style.display = 'flex';
        this._levelUpParticles();
    }

    _levelUpParticles() {
        const container = $('#lu-particles');
        if (!container) return;
        container.innerHTML = '';
        for (let i = 0; i < 20; i++) {
            const p = document.createElement('div');
            p.className = 'lu-particle';
            p.style.cssText = `
                left: ${Math.random() * 100}%;
                top:  ${Math.random() * 100}%;
                background: hsl(${Math.random()*60+40},100%,60%);
                animation-delay: ${Math.random() * 0.5}s;
            `;
            container.appendChild(p);
        }
    }

    /* ===== NOTIFICATIONS ===== */

    showNotif(text, icon = '📢') {
        this.notifQueue.push({ text, icon });
        if (!this.notifShowing) this._showNextNotif();
    }

    _showNextNotif() {
        if (!this.notifQueue.length) { this.notifShowing = false; return; }
        this.notifShowing = true;
        const { text, icon } = this.notifQueue.shift();
        const el = $('#notification');
        el.innerHTML = `${icon} ${text}`;
        el.style.display = 'block';
        el.style.opacity = '1';
        clearTimeout(this._notifTimer);
        this._notifTimer = setTimeout(() => {
            el.style.opacity = '0';
            setTimeout(() => {
                el.style.display = 'none';
                this._showNextNotif();
            }, 400);
        }, 2800);
    }

    /* ===== CHARACTER CREATOR ===== */

    initCharacterCreator(characterData) {
        // Race selector
        document.querySelectorAll('[data-group="race"]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-group="race"]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                characterData.race = btn.dataset.val;
                const rd = RACE_DATA[characterData.race];
                const desc = $('#race-bonus-text');
                if (desc && rd) desc.textContent = rd.desc;
                this.game.updatePreviewCharacter();
            });
        });

        // Gender toggle
        document.querySelectorAll('[data-group="gender"]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-group="gender"]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                characterData.gender = btn.dataset.val;
                const fh = $('#cc-facialhair');
                if (fh) fh.style.display = characterData.gender === 'boy' ? 'block' : 'none';
                this.game.updatePreviewCharacter();
            });
        });

        // All other option groups
        ['body','skin','hair','hairColor','eyeColor','facialHair','armor','shoes'].forEach(group => {
            document.querySelectorAll(`[data-group="${group}"]`).forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll(`[data-group="${group}"]`).forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    characterData[group] = btn.dataset.val;
                    this.game.updatePreviewCharacter();
                });
            });
        });

        // Name input
        $('#char-name').addEventListener('input', e => {
            characterData.name = e.target.value.trim() || 'Hero';
        });

        // Start button
        $('#btn-start').addEventListener('click', () => {
            characterData.name = $('#char-name').value.trim() || 'Hero';
            this.game.startGame();
        });
    }
}

/* Tiny querySelector shorthand */
function $(selector) { return document.querySelector(selector); }
