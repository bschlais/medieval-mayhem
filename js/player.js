/* =========================================================
   MEDIEVAL MAYHEM - Player Controller (WASD + 3rd-person camera)
   ========================================================= */

class PlayerController {
    constructor(scene, camera, characterData) {
        this.scene    = scene;
        this.camera   = camera;
        this.data     = characterData;

        // State
        this.position = new THREE.Vector3(0, 0, 8);  // spawn in village
        this.velocity = new THREE.Vector3();
        this.grounded = true;
        this.rotation = 0;   // player Y rotation (radians)

        // Camera orbit
        this.camYaw   = 0;
        this.camPitch = 0.35;
        this.camDist  = CONFIG.CAMERA_DISTANCE;

        // Build mesh
        this.mesh = window.charBuilder.build(characterData);
        this.mesh.position.copy(this.position);
        this.mesh.castShadow = true;
        this.scene.add(this.mesh);

        // Animation state
        this.walkT  = 0;
        this.isMoving = false;
        this.attacking = false;
        this.attackT   = 0;

        // Input
        this.keys = {};
        this.mouseRight = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this._bindInput();
    }

    _bindInput() {
        document.addEventListener('keydown', e => { this.keys[e.code] = true; });
        document.addEventListener('keyup',   e => { this.keys[e.code] = false; });

        const canvas = document.getElementById('gc');
        canvas.addEventListener('mousedown', e => {
            if (e.button === 2) { this.mouseRight = true; this.lastMouseX = e.clientX; this.lastMouseY = e.clientY; }
        });
        canvas.addEventListener('mouseup',   e => { if (e.button === 2) this.mouseRight = false; });
        canvas.addEventListener('mousemove', e => {
            if (this.mouseRight) {
                const dx = e.clientX - this.lastMouseX;
                const dy = e.clientY - this.lastMouseY;
                this.camYaw   -= dx * 0.006;
                this.camPitch  = Math.max(0.1, Math.min(1.1, this.camPitch + dy * 0.005));
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            }
        });
        canvas.addEventListener('wheel', e => {
            this.camDist = Math.max(3, Math.min(25, this.camDist + e.deltaY * 0.02));
        }, { passive: true });
        canvas.addEventListener('contextmenu', e => e.preventDefault());
    }

    update(dt, world, combat, rpg) {
        if (!this._active) return;

        // --- Movement ---
        const run   = this.keys['ShiftLeft'] || this.keys['ShiftRight'];
        const speed = run ? CONFIG.PLAYER_RUN_SPEED : CONFIG.PLAYER_SPEED;

        // Forward direction from camera yaw
        const fwd = new THREE.Vector3(Math.sin(this.camYaw), 0, Math.cos(this.camYaw));
        const rgt = new THREE.Vector3(Math.cos(this.camYaw), 0, -Math.sin(this.camYaw));

        let moveDir = new THREE.Vector3();
        if (this.keys['KeyW'] || this.keys['ArrowUp'])    moveDir.add(fwd);
        if (this.keys['KeyS'] || this.keys['ArrowDown'])  moveDir.sub(fwd);
        if (this.keys['KeyA'] || this.keys['ArrowLeft'])  moveDir.sub(rgt);
        if (this.keys['KeyD'] || this.keys['ArrowRight']) moveDir.add(rgt);

        this.isMoving = moveDir.lengthSq() > 0;

        if (this.isMoving) {
            moveDir.normalize();
            this.rotation = Math.atan2(moveDir.x, moveDir.z);

            const nx = this.position.x + moveDir.x * speed * dt;
            const nz = this.position.z + moveDir.z * speed * dt;

            if (!world.checkCollision(nx, this.position.z)) this.position.x = nx;
            if (!world.checkCollision(this.position.x, nz)) this.position.z = nz;

            rpg.useStamina(run ? 8 * dt : 0);
        }

        rpg.regenStamina(dt);

        // --- Clamp to world ---
        this.position.x = Math.max(-280, Math.min(280, this.position.x));
        this.position.z = Math.max(-200, Math.min(280, this.position.z));

        // Apply position
        this.mesh.position.copy(this.position);
        this.mesh.rotation.y = this.rotation;

        // --- Animation ---
        this._animate(dt);

        // --- Attack animation ---
        if (this.attacking) {
            this.attackT += dt * 8;
            if (this.attackT > 1) { this.attacking = false; this.attackT = 0; }
        }

        // --- Camera ---
        this._updateCamera();
    }

    _animate(dt) {
        if (this.isMoving) {
            this.walkT += dt * 6;
            // Simple walk: bob mesh slightly
            this.mesh.position.y = Math.abs(Math.sin(this.walkT)) * 0.1;
        } else {
            this.walkT  = 0;
            this.mesh.position.y = 0;
        }
    }

    _updateCamera() {
        const target = new THREE.Vector3(this.position.x, this.position.y + 1.5, this.position.z);
        const camX = target.x + Math.sin(this.camYaw) * Math.cos(this.camPitch) * this.camDist;
        const camY = target.y + Math.sin(this.camPitch) * this.camDist;
        const camZ = target.z + Math.cos(this.camYaw) * Math.cos(this.camPitch) * this.camDist;

        this.camera.position.lerp(new THREE.Vector3(camX, Math.max(CONFIG.CAMERA_MIN_Y, camY), camZ), 0.12);
        this.camera.lookAt(target);
    }

    triggerAttack() {
        this.attacking = true;
        this.attackT   = 0;
        // Swing visual: rotate mesh briefly
        this.mesh.rotation.z = 0.3;
        setTimeout(() => { if (this.mesh) this.mesh.rotation.z = 0; }, 200);
    }

    getPosition()  { return { x: this.position.x, z: this.position.z }; }
    getRotation()  { return this.rotation; }
    setPosition(x, z) { this.position.x = x; this.position.z = z; }

    setActive(v) { this._active = v; }

    updateCharacterMesh(characterData) {
        this.scene.remove(this.mesh);
        this.mesh = window.charBuilder.build(characterData);
        this.mesh.position.copy(this.position);
        this.mesh.castShadow = true;
        this.scene.add(this.mesh);
    }
}
