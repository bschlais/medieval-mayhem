/* =========================================================
   MEDIEVAL MAYHEM - Player Controller v2
   W = away from camera (standard), S = toward camera.
   Left-click drag rotates camera.
   Leg/arm walking animation; forward punch attack animation.
   ========================================================= */

class PlayerController {
    constructor(scene, camera, characterData) {
        this.scene    = scene;
        this.camera   = camera;
        this.data     = characterData;

        this.position = new THREE.Vector3(0, 0, 8);
        this.rotation = 0;  // player facing direction (world Y radians)

        // Camera orbit
        this.camYaw   = 0;
        this.camPitch = 0.38;
        this.camDist  = CONFIG.CAMERA_DISTANCE;

        // Animation state
        this.walkT     = 0;
        this.isMoving  = false;
        this.isRunning = false;
        this.attacking = false;
        this.attackT   = 0;

        // Input
        this.keys      = {};
        this.mouseLeft = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        // Build mesh
        this.mesh = window.charBuilder.build(characterData);
        this.mesh.position.copy(this.position);
        this.mesh.castShadow = true;
        this.scene.add(this.mesh);

        this._bindInput();
    }

    _bindInput() {
        document.addEventListener('keydown', e => { this.keys[e.code] = true; });
        document.addEventListener('keyup',   e => { this.keys[e.code] = false; });

        const canvas = document.getElementById('gc');

        // Left-click drag → orbit camera
        canvas.addEventListener('mousedown', e => {
            if (e.button === 0) {
                this.mouseLeft  = true;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                e.preventDefault();
            }
        });
        canvas.addEventListener('mouseup',  e => { if (e.button === 0) this.mouseLeft = false; });
        canvas.addEventListener('mousemove', e => {
            if (!this.mouseLeft) return;
            const dx = e.clientX - this.lastMouseX;
            const dy = e.clientY - this.lastMouseY;
            this.camYaw   -= dx * 0.006;
            this.camPitch  = Math.max(0.08, Math.min(1.15, this.camPitch + dy * 0.005));
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });
        canvas.addEventListener('wheel', e => {
            this.camDist = Math.max(3, Math.min(25, this.camDist + e.deltaY * 0.02));
        }, { passive: true });
        canvas.addEventListener('contextmenu', e => e.preventDefault());
    }

    update(dt, world, combat, rpg) {
        if (!this._active) return;

        const run   = this.keys['ShiftLeft'] || this.keys['ShiftRight'];
        const speed = run ? CONFIG.PLAYER_RUN_SPEED : CONFIG.PLAYER_SPEED;
        this.isRunning = run;

        /* ---- Movement: W = forward (AWAY from camera), S = backward ---- */
        // fwd points FROM player TOWARD camera (same direction as camYaw)
        // We NEGATE it for W so player moves away from camera.
        const fwd = new THREE.Vector3(Math.sin(this.camYaw), 0,  Math.cos(this.camYaw));
        const rgt = new THREE.Vector3(Math.cos(this.camYaw), 0, -Math.sin(this.camYaw));

        const moveDir = new THREE.Vector3();
        if (this.keys['KeyW'] || this.keys['ArrowUp'])    moveDir.sub(fwd); // away from camera = forward
        if (this.keys['KeyS'] || this.keys['ArrowDown'])  moveDir.add(fwd); // toward camera = backward
        if (this.keys['KeyA'] || this.keys['ArrowLeft'])  moveDir.sub(rgt);
        if (this.keys['KeyD'] || this.keys['ArrowRight']) moveDir.add(rgt);

        this.isMoving = moveDir.lengthSq() > 0.001;

        if (this.isMoving) {
            moveDir.normalize();
            // Smooth rotation toward movement direction
            const targetRot = Math.atan2(moveDir.x, moveDir.z);
            const diff = this._angleDiff(targetRot, this.rotation);
            this.rotation += diff * Math.min(1, 12 * dt);

            const nx = this.position.x + moveDir.x * speed * dt;
            const nz = this.position.z + moveDir.z * speed * dt;
            if (!world.checkCollision(nx, this.position.z)) this.position.x = nx;
            if (!world.checkCollision(this.position.x, nz)) this.position.z = nz;

            rpg.useStamina(run ? 8 * dt : 0);
        }

        rpg.regenStamina(dt);

        // Clamp
        this.position.x = Math.max(-290, Math.min(290, this.position.x));
        this.position.z = Math.max(-210, Math.min(290, this.position.z));

        this.mesh.position.copy(this.position);
        this.mesh.rotation.y = this.rotation;

        // Animations
        this._animate(dt);
        this._updateCamera();
    }

    _animate(dt) {
        const ud = this.mesh.userData;
        const ll = ud.leftLegGroup;
        const rl = ud.rightLegGroup;
        const la = ud.leftArmGroup;
        const ra = ud.rightArmGroup;

        if (this.attacking) {
            /* ---- ATTACK ANIMATION ---- */
            this.attackT += dt * 5;  // ~0.2s total
            if (this.attackT >= 1) {
                this.attacking = false;
                this.attackT   = 0;
                if (ra) { ra.rotation.x = 0; ra.rotation.z = 0; }
                if (la) { la.rotation.x = 0; }
            } else {
                const t = Math.sin(this.attackT * Math.PI); // 0→1→0
                if (ra) {
                    ra.rotation.x = -t * 1.35;  // forward punch
                    ra.rotation.z =  t * 0.20;  // slight outward
                }
                if (la) la.rotation.x = t * 0.40; // counterbalance
            }
            // During attack: damp walk pose
            if (ll) ll.rotation.x *= 0.85;
            if (rl) rl.rotation.x *= 0.85;
            this.mesh.position.y = 0;
            return;
        }

        if (this.isMoving) {
            /* ---- WALK ANIMATION ---- */
            const spd = this.isRunning ? 9 : 6;
            this.walkT += dt * spd;
            const swing = Math.sin(this.walkT) * (this.isRunning ? 0.6 : 0.45);

            if (ll) ll.rotation.x =  swing;
            if (rl) rl.rotation.x = -swing;
            if (la) la.rotation.x = -swing * 0.45;
            if (ra) ra.rotation.x =  swing * 0.45;

            // Subtle body bob
            this.mesh.position.y = Math.abs(Math.sin(this.walkT * 2)) * 0.04;
        } else {
            /* ---- IDLE: return limbs to rest ---- */
            this.walkT = 0;
            const damp = 1 - Math.min(1, 10 * 0.016);
            if (ll) ll.rotation.x *= 0.75;
            if (rl) rl.rotation.x *= 0.75;
            if (la) la.rotation.x *= 0.75;
            if (ra) ra.rotation.x *= 0.75;
            this.mesh.position.y *= 0.8;
        }
    }

    _updateCamera() {
        const target = new THREE.Vector3(this.position.x, this.position.y + 1.6, this.position.z);
        const cx = target.x + Math.sin(this.camYaw)   * Math.cos(this.camPitch) * this.camDist;
        const cy = target.y + Math.sin(this.camPitch)  * this.camDist;
        const cz = target.z + Math.cos(this.camYaw)   * Math.cos(this.camPitch) * this.camDist;

        this.camera.position.lerp(
            new THREE.Vector3(cx, Math.max(CONFIG.CAMERA_MIN_Y, cy), cz),
            0.10
        );
        this.camera.lookAt(target);
    }

    triggerAttack() {
        if (this.attacking) return;
        this.attacking = true;
        this.attackT   = 0;
    }

    _angleDiff(a, b) {
        let d = a - b;
        while (d >  Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        return d;
    }

    getPosition()  { return { x: this.position.x, z: this.position.z }; }
    getRotation()  { return this.rotation; }
    setPosition(x, z) { this.position.set(x, 0, z); }
    setActive(v)   { this._active = v; }

    updateCharacterMesh(characterData) {
        this.scene.remove(this.mesh);
        this.mesh = window.charBuilder.build(characterData);
        this.mesh.position.copy(this.position);
        this.mesh.rotation.y = this.rotation;
        this.mesh.castShadow  = true;
        this.scene.add(this.mesh);
    }
}
