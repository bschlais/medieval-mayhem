/* =========================================================
   MEDIEVAL MAYHEM - Combat & Enemy System v3
   Tiered enemies by distance; unarmed cap; villager attacks.
   ========================================================= */

class Enemy {
    constructor(scene, x, z, tier = 0) {
        this.scene = scene;
        this.tier  = tier;
        const t    = CONFIG.ENEMY_TIERS[Math.min(tier, CONFIG.ENEMY_TIERS.length - 1)];

        this.type      = tier >= 2 ? 'orc' : 'goblin';
        this.hp        = t.hp  + Math.floor(Math.random() * t.hp * 0.2);
        this.maxHp     = this.hp;
        this.speed     = t.speed;
        this.damage    = t.dmg + Math.floor(Math.random() * 4);
        this.xpDrop    = t.xp;
        this.goldDrop  = t.gold[0] + Math.floor(Math.random() * (t.gold[1] - t.gold[0]));
        this.alive     = true;
        this.state     = 'patrol';
        this.attackCooldown = 0;
        this.patrolCenter   = { x, z };
        this.patrolRadius   = 6 + Math.random() * 6;
        this.patrolT        = Math.random() * Math.PI * 2;
        this.spawnX    = x;
        this.spawnZ    = z;
        this.respawnTimer = 0;
        this._knockbackVel   = { x: 0, z: 0 };
        this._knockbackTimer = 0;

        this.mesh = tier >= 2 ? this._buildOrc() : window.charBuilder.buildGoblin();
        this.mesh.position.set(x, 0, z);
        this.mesh.castShadow = true;
        scene.add(this.mesh);

        // HP bar
        const bg = new THREE.Mesh(
            new THREE.BoxGeometry(1.1, 0.14, 0.05),
            new THREE.MeshBasicMaterial({ color: 0x333333 })
        );
        bg.position.set(0, tier >= 2 ? 4.5 : 3.0, 0);
        bg.renderOrder = 1;
        this.mesh.add(bg);

        this.hpFill = new THREE.Mesh(
            new THREE.BoxGeometry(1.1, 0.12, 0.06),
            new THREE.MeshBasicMaterial({ color: tier >= 2 ? 0xCC2200 : 0xFF2222, depthTest: false })
        );
        this.hpFill.position.set(0, tier >= 2 ? 4.5 : 3.0, 0.01);
        this.mesh.add(this.hpFill);
    }

    _buildOrc() {
        const root = new THREE.Group();
        const g   = this._m(0x4A6A2A); const dg = this._m(0x2A4A1A);
        const brn = this._m(0x7A4520); const dkr = this._m(0x333333);

        // Feet
        [-1,1].forEach(s => {
            const f = new THREE.Mesh(new THREE.BoxGeometry(0.55,0.26,0.62), dg);
            f.position.set(s*0.3,0.13,0.06); root.add(f);
        });
        // Legs
        [-1,1].forEach(s => {
            const l = new THREE.Mesh(new THREE.BoxGeometry(0.42,0.95,0.42), dg);
            l.position.set(s*0.3,0.88,0); root.add(l);
        });
        // Torso
        const t = new THREE.Mesh(new THREE.BoxGeometry(1.4,1.2,0.7), brn);
        t.position.y = 1.9; root.add(t);
        // Pauldrons
        [-1,1].forEach(s => {
            const p = new THREE.Mesh(new THREE.BoxGeometry(0.45,0.35,0.55), dg);
            p.position.set(s*0.92,2.4,0); root.add(p);
        });
        // Arms
        [-1,1].forEach(s => {
            const a = new THREE.Mesh(new THREE.BoxGeometry(0.42,1.0,0.42), g);
            a.position.set(s*0.9,1.8,0); root.add(a);
        });
        // Head
        const head = new THREE.Mesh(new THREE.BoxGeometry(1.1,1.0,1.0), g);
        head.position.y = 3.0; root.add(head);
        // Tusks
        [-1,1].forEach(s => {
            const tusk = new THREE.Mesh(new THREE.BoxGeometry(0.14,0.4,0.12), this._m(0xF0E8C0));
            tusk.position.set(s*0.28, 2.7, 0.5); root.add(tusk);
        });
        // Eyes
        [-1,1].forEach(s => {
            const e = new THREE.Mesh(new THREE.BoxGeometry(0.2,0.16,0.08), this._m(0xFF4400));
            e.position.set(s*0.26,3.1,0.52); root.add(e);
        });
        // Weapon (axe)
        const haft = new THREE.Mesh(new THREE.BoxGeometry(0.16,1.6,0.16), brn);
        haft.position.set(1.2,1.5,0); haft.rotation.z=0.2; root.add(haft);
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.7,0.8,0.12), dkr);
        blade.position.set(1.55,2.2,0); root.add(blade);

        return root;
    }

    _m(c) {
        const mat = new THREE.MeshLambertMaterial({ color: c });
        return mat;
    }

    update(dt, playerX, playerZ) {
        if (!this.alive) return;

        const dx = playerX - this.mesh.position.x;
        const dz = playerZ - this.mesh.position.z;
        const dist = Math.sqrt(dx*dx + dz*dz);

        this.attackCooldown = Math.max(0, this.attackCooldown - dt);
        if (this._knockbackTimer > 0) {
            this._knockbackTimer -= dt;
            this.mesh.position.x += this._knockbackVel.x * dt;
            this.mesh.position.z += this._knockbackVel.z * dt;
            this._knockbackVel.x *= 0.85;
            this._knockbackVel.z *= 0.85;
        }
        this.mesh.position.y = Math.sin(Date.now() * 0.002 + this.patrolT) * 0.06;

        const detectRange = CONFIG.GOBLIN_DETECT_RANGE * (1 + this.tier * 0.15);

        if (dist < detectRange) {
            this.state = dist < CONFIG.GOBLIN_ATTACK_RANGE ? 'attack' : 'chase';
        } else {
            this.state = 'patrol';
        }

        if (this.state === 'patrol') {
            this.patrolT += dt * 0.55;
            const tx = this.patrolCenter.x + Math.cos(this.patrolT) * this.patrolRadius;
            const tz = this.patrolCenter.z + Math.sin(this.patrolT) * this.patrolRadius;
            const pd = Math.sqrt((tx-this.mesh.position.x)**2 + (tz-this.mesh.position.z)**2);
            if (pd > 0.1) {
                this.mesh.position.x += ((tx-this.mesh.position.x)/pd) * this.speed * dt * 0.5;
                this.mesh.position.z += ((tz-this.mesh.position.z)/pd) * this.speed * dt * 0.5;
                this.mesh.rotation.y  = Math.atan2(tx-this.mesh.position.x, tz-this.mesh.position.z);
            }
        } else if (this.state === 'chase') {
            this.mesh.position.x += (dx/dist) * this.speed * dt;
            this.mesh.position.z += (dz/dist) * this.speed * dt;
            this.mesh.rotation.y  = Math.atan2(dx, dz);
        } else {
            this.mesh.rotation.y = Math.atan2(dx, dz);
        }

        const pct = this.hp / this.maxHp;
        this.hpFill.scale.x = Math.max(0.01, pct);
        this.hpFill.position.x = -(1 - pct) * 0.55;
    }

    takeDamage(amount, fromX, fromZ) {
        this.hp -= amount;
        if (this.hp <= 0) { this.hp = 0; this.die(); }
        this._flashRed();
        if (fromX !== undefined) {
            const dx = this.mesh.position.x - fromX;
            const dz = this.mesh.position.z - fromZ;
            const dist = Math.sqrt(dx*dx + dz*dz) || 1;
            this._knockbackVel.x = (dx / dist) * 5.0;
            this._knockbackVel.z = (dz / dist) * 5.0;
            this._knockbackTimer = 0.22;
        }
    }

    _flashRed() {
        this.mesh.traverse(c => {
            if (c.isMesh && c.material && c.material.emissive) {
                c.material.emissive.setHex(0xFF0000);
                c.material.emissiveIntensity = 0.9;
                setTimeout(() => {
                    if (c.material) {
                        c.material.emissive.setHex(0x000000);
                        c.material.emissiveIntensity = 0;
                    }
                }, 150);
            }
        });
    }

    die() {
        this.alive = false;
        this.state = 'dead';
        this.mesh.rotation.x = Math.PI / 2;
        this.mesh.position.y = -0.5;
        this.respawnTimer = CONFIG.GOBLIN_RESPAWN_TIME;
        setTimeout(() => {
            if (this.scene) this.scene.remove(this.mesh);
        }, 2200);
    }

    respawn() {
        this.hp      = this.maxHp;
        this.alive   = true;
        this.state   = 'patrol';
        this.respawnTimer = 0;
        this.mesh    = this.tier >= 2 ? this._buildOrc() : window.charBuilder.buildGoblin();
        this.mesh.position.set(this.spawnX, 0, this.spawnZ);
        this.mesh.castShadow = true;
        this.scene.add(this.mesh);
        // Re-add HP bar
        const bg = new THREE.Mesh(
            new THREE.BoxGeometry(1.1, 0.14, 0.05),
            new THREE.MeshBasicMaterial({ color: 0x333333 })
        );
        bg.position.set(0, this.tier >= 2 ? 4.5 : 3.0, 0);
        bg.renderOrder = 1;
        this.mesh.add(bg);
        this.hpFill = new THREE.Mesh(
            new THREE.BoxGeometry(1.1, 0.12, 0.06),
            new THREE.MeshBasicMaterial({ color: this.tier >= 2 ? 0xCC2200 : 0xFF2222, depthTest: false })
        );
        this.hpFill.position.set(0, this.tier >= 2 ? 4.5 : 3.0, 0.01);
        this.mesh.add(this.hpFill);
    }

    canAttack() { return this.attackCooldown <= 0 && this.state === 'attack'; }
    doAttack()  {
        this.attackCooldown = 2.0 - this.tier * 0.2;
        // Goblin punch animation
        const ra = this.mesh.userData.rightArmGroup;
        if (ra) {
            ra.rotation.x = -1.3;
            setTimeout(() => { if (ra) ra.rotation.x = 0; }, 220);
        }
        return this.damage + Math.floor(Math.random() * 5);
    }
}

/* ================================================================
   Combat System
   ================================================================ */
class CombatSystem {
    constructor(scene, rpg, quests, inventory) {
        this.scene     = scene;
        this.rpg       = rpg;
        this.quests    = quests;
        this.inventory = inventory;
        this.enemies   = [];
        this.chickens  = [];
        this.attackCooldown = 0;

        this.onKill       = null;
        this.onDamage     = null;
        this.onRepChange  = null;

        this._spawnEnemies();
    }

    _spawnEnemies() {
        const spawn = (x, z, tier) => {
            this.enemies.push(new Enemy(this.scene, x, z, tier));
        };

        /* === Forest/Village edge goblins (Tier 0) === */
        const camp1x = -95, camp1z = 80;
        for (let i = 0; i < 8; i++) {
            const a = (i/8)*Math.PI*2;
            spawn(camp1x + Math.cos(a)*9, camp1z + Math.sin(a)*9, 0);
        }
        spawn(-55, 55, 0); spawn(-65, 45, 0); spawn(-40, 42, 0);

        /* === Mid-range Tier 1 goblins (road/swamp edge) === */
        spawn(-120, 95, 1); spawn(-140, 115, 1); spawn(-155, 80, 1);
        spawn(-130, 130, 1);

        /* === Far-range Tier 2 Orcs (desert/ruins/swamp) === */
        spawn(-185, 145, 2); spawn(-210, 125, 2); spawn(60, 195, 2);
        spawn(75, 215, 2); spawn(270, 100, 2); spawn(255, 120, 2);

        /* === Eastford bandit camp (Tier 1) === */
        const campEx = 230, campEz = 70;
        for (let i = 0; i < 5; i++) {
            const a = (i/5)*Math.PI*2;
            spawn(campEx + Math.cos(a)*7, campEz + Math.sin(a)*7, 1);
        }
    }

    update(dt, playerX, playerZ) {
        this.attackCooldown = Math.max(0, this.attackCooldown - dt);

        this.enemies.forEach(e => {
            if (!e.alive) {
                if (e.respawnTimer > 0 && !e._isNightSpawn) {
                    e.respawnTimer -= dt;
                    if (e.respawnTimer <= 0) e.respawn();
                }
                return;
            }
            e.update(dt, playerX, playerZ);
            if (e.canAttack()) {
                const dmg    = e.doAttack();
                const actual = this.rpg.takeDamage(
                    Math.max(1, dmg - Math.floor(this.inventory.getBonusDefense() * 0.5))
                );
                if (this.onDamage) this.onDamage(actual, playerX, playerZ, e.mesh.position.x, e.mesh.position.z);
            }
        });

        // Update chickens
        if (this.chickens) {
            this.chickens.forEach(ch => {
                if (!ch.alive) return;
                if (ch._launched) {
                    ch._vy -= 12 * dt;
                    ch.mesh.position.x += ch._vx * dt;
                    ch.mesh.position.z += ch._vz * dt;
                    ch.mesh.position.y += ch._vy * dt;
                    ch.mesh.rotation.z += 4 * dt;
                    if (ch.mesh.position.y < 0) { ch.mesh.position.y = 0; ch.alive = false; ch.mesh.visible = false; }
                }
            });
        }
    }

    playerAttack(playerX, playerZ, playerRotY) {
        if (this.attackCooldown > 0) return [];
        this.attackCooldown = CONFIG.ATTACK_COOLDOWN;

        const hasWeapon = !!this.inventory.equipped.weapon;
        const atk = this.rpg.getAttackDamage(hasWeapon)
                  + (hasWeapon ? this.inventory.getBonusStrength() : 0);

        const hit = [];
        this.enemies.forEach(e => {
            if (!e.alive) return;
            const dx = e.mesh.position.x - playerX, dz = e.mesh.position.z - playerZ;
            const dist = Math.sqrt(dx*dx + dz*dz);
            if (dist > CONFIG.PLAYER_ATTACK_RANGE) return;

            const angle = Math.atan2(dx, dz);
            if (Math.abs(this._angleDiff(angle, playerRotY)) > Math.PI * 0.65) return;

            e.takeDamage(atk, playerX, playerZ);
            hit.push({ enemy: e, damage: atk, x: e.mesh.position.x, z: e.mesh.position.z });

            if (!e.alive) {
                this.rpg.recordKill(e.type);
                this.rpg.addXP(e.xpDrop);
                this.quests.onKill(e.type);
                this.inventory.addGold(e.goldDrop);
                if (Math.random() < 0.4) this.inventory.addItem('goblin_ear');
                if (Math.random() < 0.12) this.inventory.addItem('health_potion');
                if (this.onKill) this.onKill(e.xpDrop, e.goldDrop);
            }
        });
        return hit;
    }

    /* ---- Villager attack ---- */
    tryAttackVillager(playerX, playerZ, playerRotY, npcSystem) {
        if (this.attackCooldown > 0) return false;

        for (const npc of npcSystem.npcs) {
            const dx = npc.mesh.position.x - playerX, dz = npc.mesh.position.z - playerZ;
            const dist = Math.sqrt(dx*dx + dz*dz);
            if (dist > CONFIG.PLAYER_ATTACK_RANGE) continue;

            const angle = Math.atan2(dx, dz);
            if (Math.abs(this._angleDiff(angle, playerRotY)) > Math.PI * 0.65) continue;

            // NPC flashes red but takes no damage
            npc.mesh.traverse(c => {
                if (c.isMesh && c.material && c.material.emissive) {
                    c.material.emissive.setHex(0xFF4400);
                    c.material.emissiveIntensity = 0.8;
                    setTimeout(() => {
                        if (c.material) { c.material.emissive.setHex(0); c.material.emissiveIntensity = 0; }
                    }, 200);
                }
            });

            // Mark NPC as scared/hostile
            npc._scared = true;

            // Reputation penalty
            this.rpg.changeReputation(-8);
            if (this.onRepChange) this.onRepChange(-8, npc.name);

            this.attackCooldown = CONFIG.ATTACK_COOLDOWN;
            return true;
        }
        return false;
    }

    _angleDiff(a, b) {
        let d = a - b;
        while (d >  Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        return d;
    }

    spawnNightEnemy(x, z) {
        const e = new Enemy(this.scene, x, z, 0);
        e._isNightSpawn = true;
        this.enemies.push(e);
        return e;
    }

    despawnNightEnemies() {
        this.enemies.forEach(e => {
            if (e._isNightSpawn && e.alive) { e.die(); }
        });
        this.enemies = this.enemies.filter(e => !e._isNightSpawn);
    }

    addChicken(chickenEntity) {
        this.chickens.push(chickenEntity);
    }

    tryAttackChicken(playerX, playerZ, playerRotY) {
        if (!this.chickens) return false;
        for (const ch of this.chickens) {
            if (!ch.alive) continue;
            const dx = ch.mesh.position.x - playerX;
            const dz = ch.mesh.position.z - playerZ;
            const dist = Math.sqrt(dx*dx + dz*dz);
            if (dist > CONFIG.KICK_RANGE) continue;
            const angle = Math.atan2(dx, dz);
            let diff = angle - playerRotY;
            while (diff >  Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            if (Math.abs(diff) > Math.PI * 0.7) continue;
            // Launch chicken!
            const launchDir = Math.atan2(dx, dz);
            ch._launched = true;
            ch._vx = Math.sin(launchDir) * 7;
            ch._vz = Math.cos(launchDir) * 7;
            ch._vy = 5;
            return true;
        }
        return false;
    }

    isEnemyNearby(px, pz, range = 10) {
        return this.enemies.some(e => {
            if (!e.alive) return false;
            const dx = e.mesh.position.x - px, dz = e.mesh.position.z - pz;
            return Math.sqrt(dx*dx+dz*dz) < range;
        });
    }

    getAliveCount() { return this.enemies.filter(e => e.alive).length; }
}
