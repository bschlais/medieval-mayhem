/* =========================================================
   MEDIEVAL MAYHEM - Combat & Enemy System
   ========================================================= */

class Enemy {
    constructor(scene, x, z, type = 'goblin') {
        this.scene  = scene;
        this.type   = type;
        this.hp     = 30;
        this.maxHp  = 30;
        this.speed  = 4.5;
        this.damage = 8;
        this.xpDrop = 20;
        this.goldDrop = Math.floor(Math.random() * 6) + 3;
        this.alive  = true;
        this.state  = 'patrol'; // patrol | chase | attack | dead
        this.attackCooldown = 0;
        this.patrolAngle = Math.random() * Math.PI * 2;
        this.patrolCenter = { x, z };
        this.patrolRadius = 5 + Math.random() * 5;
        this.patrolT = Math.random() * Math.PI * 2;

        this.mesh = window.charBuilder.buildGoblin();
        this.mesh.position.set(x, 0, z);
        this.mesh.castShadow = true;
        scene.add(this.mesh);

        // HP bar (red box above head)
        const hpBg = new THREE.Mesh(new THREE.BoxGeometry(1,0.12,0.05), new THREE.MeshBasicMaterial({color:0x333333}));
        hpBg.position.set(0, 3.0, 0);
        hpBg.renderOrder = 1;
        this.mesh.add(hpBg);

        this.hpFill = new THREE.Mesh(new THREE.BoxGeometry(1,0.1,0.06), new THREE.MeshBasicMaterial({color:0xFF2222, depthTest:false}));
        this.hpFill.position.set(0, 3.0, 0.01);
        this.mesh.add(this.hpFill);
    }

    update(dt, playerX, playerZ) {
        if (!this.alive) return;

        const dx = playerX - this.mesh.position.x;
        const dz = playerZ - this.mesh.position.z;
        const dist = Math.sqrt(dx*dx + dz*dz);

        this.attackCooldown = Math.max(0, this.attackCooldown - dt);

        // Animate idle bob
        this.mesh.position.y = Math.sin(Date.now() * 0.002 + this.patrolT) * 0.05;

        if (dist < CONFIG.GOBLIN_DETECT_RANGE) {
            this.state = dist < CONFIG.GOBLIN_ATTACK_RANGE ? 'attack' : 'chase';
        } else {
            this.state = 'patrol';
        }

        if (this.state === 'patrol') {
            this.patrolT += dt * 0.6;
            const tx = this.patrolCenter.x + Math.cos(this.patrolT) * this.patrolRadius;
            const tz = this.patrolCenter.z + Math.sin(this.patrolT) * this.patrolRadius;
            const pdx = tx - this.mesh.position.x, pdz = tz - this.mesh.position.z;
            const pd  = Math.sqrt(pdx*pdx+pdz*pdz);
            if (pd > 0.1) {
                this.mesh.position.x += (pdx/pd) * this.speed * dt * 0.5;
                this.mesh.position.z += (pdz/pd) * this.speed * dt * 0.5;
                this.mesh.rotation.y  = Math.atan2(pdx, pdz);
            }
        } else if (this.state === 'chase') {
            this.mesh.position.x += (dx/dist) * this.speed * dt;
            this.mesh.position.z += (dz/dist) * this.speed * dt;
            this.mesh.rotation.y  = Math.atan2(dx, dz);
        } else if (this.state === 'attack') {
            this.mesh.rotation.y = Math.atan2(dx, dz);
        }

        // Update HP bar scale
        const pct = this.hp / this.maxHp;
        this.hpFill.scale.x = Math.max(0.01, pct);
        this.hpFill.position.x = -(1 - pct) * 0.5;
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.hp = 0;
            this.die();
        }
        // Flash red
        this._flashRed();
    }

    _flashRed() {
        this.mesh.traverse(c => {
            if (c.isMesh && c.material) {
                const orig = c.material.color.getHex();
                c.material.emissive = new THREE.Color(0xFF0000);
                c.material.emissiveIntensity = 0.8;
                setTimeout(() => {
                    c.material.emissive.setHex(0x000000);
                    c.material.emissiveIntensity = 0;
                }, 150);
            }
        });
    }

    die() {
        this.alive = false;
        this.state = 'dead';
        // Fall over animation
        this.mesh.rotation.x = Math.PI / 2;
        this.mesh.position.y = -0.5;
        setTimeout(() => this.scene.remove(this.mesh), 2000);
    }

    canAttack() { return this.attackCooldown <= 0 && this.state === 'attack'; }
    doAttack()  { this.attackCooldown = 1.8; return this.damage + Math.floor(Math.random()*4); }
}

/* ---- Combat System ---- */
class CombatSystem {
    constructor(scene, rpg, quests, inventory) {
        this.scene     = scene;
        this.rpg       = rpg;
        this.quests    = quests;
        this.inventory = inventory;
        this.enemies   = [];
        this.attackCooldown = 0;
        this.onKill    = null;  // callback(xp, gold)
        this.onDamage  = null;  // callback(amount, x, z)

        this._spawnGoblins();
    }

    _spawnGoblins() {
        const gcx = -95, gcz = 80;
        // Camp goblins
        for (let i = 0; i < 7; i++) {
            const a = (i / 7) * Math.PI * 2;
            this.enemies.push(new Enemy(
                this.scene,
                gcx + Math.cos(a) * 8,
                gcz + Math.sin(a) * 8,
                'goblin'
            ));
        }
        // Road patrol goblins
        this.enemies.push(new Enemy(this.scene, -55, 55, 'goblin'));
        this.enemies.push(new Enemy(this.scene, -65, 45, 'goblin'));
        this.enemies.push(new Enemy(this.scene, -40, 42, 'goblin'));
    }

    update(dt, playerX, playerZ) {
        this.attackCooldown = Math.max(0, this.attackCooldown - dt);

        this.enemies.forEach(e => {
            if (!e.alive) return;
            e.update(dt, playerX, playerZ);

            // Enemy attacks player
            if (e.canAttack()) {
                const dmg = e.doAttack();
                const actual = this.rpg.takeDamage(dmg + this.inventory.getBonusDefense() * -0.5 | 0);
                if (this.onDamage) this.onDamage(actual, playerX, playerZ);
            }
        });
    }

    playerAttack(playerX, playerZ, playerRotY) {
        if (this.attackCooldown > 0) return [];
        this.attackCooldown = CONFIG.ATTACK_COOLDOWN;

        const hit = [];
        const atk = this.rpg.getAttackDamage() + this.inventory.getBonusStrength();

        this.enemies.forEach(e => {
            if (!e.alive) return;
            const dx = e.mesh.position.x - playerX;
            const dz = e.mesh.position.z - playerZ;
            const dist = Math.sqrt(dx*dx + dz*dz);
            if (dist > CONFIG.PLAYER_ATTACK_RANGE) return;

            // Check arc (in front of player)
            const angleToEnemy  = Math.atan2(dx, dz);
            const angleDiff = Math.abs(this._angleDiff(angleToEnemy, playerRotY));
            if (angleDiff > Math.PI * 0.65) return; // ~120° arc

            e.takeDamage(atk);
            hit.push({ enemy: e, damage: atk, x: e.mesh.position.x, z: e.mesh.position.z });

            if (!e.alive) {
                this.rpg.recordKill(e.type);
                this.rpg.addXP(e.xpDrop);
                this.quests.onKill(e.type);
                this.inventory.addGold(e.goldDrop);
                // Drop goblin ear occasionally
                if (Math.random() < 0.4) this.inventory.addItem('goblin_ear');
                // Drop health potion rarely
                if (Math.random() < 0.15) this.inventory.addItem('health_potion');
                if (this.onKill) this.onKill(e.xpDrop, e.goldDrop);
            }
        });

        return hit;
    }

    _angleDiff(a, b) {
        let d = a - b;
        while (d > Math.PI)  d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        return d;
    }

    isEnemyNearby(px, pz, range = 8) {
        return this.enemies.some(e => {
            if (!e.alive) return false;
            const dx = e.mesh.position.x - px, dz = e.mesh.position.z - pz;
            return Math.sqrt(dx*dx + dz*dz) < range;
        });
    }

    getAliveCount() { return this.enemies.filter(e => e.alive).length; }
}
