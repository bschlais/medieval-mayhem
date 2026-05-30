/* =========================================================
   MEDIEVAL MAYHEM - 3D World Builder v3
   - Expanded terrain (1400x1400), multiple biomes
   - Eastford (second village), Snow/Desert/Swamp biomes
   - Ancient Ruins, improved Castle keep, 280+ forest trees
   - 2 goblin camps, stonework lines on castle walls
   ========================================================= */

class WorldBuilder {
    constructor(scene) {
        this.scene     = scene;
        this.colliders = [];  // { min:{x,z}, max:{x,z} }
        this.pickups   = [];
        this.sheep     = [];
    }

    build() {
        this._buildTerrain();
        this._buildRoads();
        this._buildLandmarks();
        this._buildVillage();
        this._buildCastle();
        this._buildForest();
        this._buildEastford();
        this._buildSnowBiome();
        this._buildDesertBiome();
        this._buildSwampBiome();
        this._buildRuins();
        this._buildQuestItems();
        this._buildAmbience();
    }

    /* ================================================================
       TERRAIN
       ================================================================ */
    _buildTerrain() {
        const geo = new THREE.PlaneGeometry(1400, 1400, 80, 80);
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i), z = pos.getZ(i);
            const d = Math.sqrt(x * x + z * z);
            if (d > 70) {
                pos.setY(i, (Math.sin(x * 0.045) * Math.cos(z * 0.045)) * 2.5);
            }
        }
        geo.computeVertexNormals();
        const ground = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: 0x4A7C3F }));
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        this._plane(0x8B9D6A, 34, 34,   0,  0.01,    0);        // village square
        this._plane(0x9E9E8A, 64, 70,   0,  0.01, -120);        // castle courtyard
        this._plane(0x4488BB, 20, 130, 112, -0.3,   10, 0.82);  // river (east)
    }

    /* ---- Plane helper ---- */
    _plane(color, w, d, x, y, z, opacity = 1) {
        const m = new THREE.Mesh(
            new THREE.PlaneGeometry(w, d),
            new THREE.MeshLambertMaterial({ color, transparent: opacity < 1, opacity })
        );
        m.rotation.x = -Math.PI / 2;
        m.position.set(x, y, z);
        m.receiveShadow = true;
        this.scene.add(m);
        return m;
    }

    /* ================================================================
       ROADS
       ================================================================ */
    _buildRoads() {
        // North road to castle
        this._plane(0xA89070, 9, 120,  0,  0.02, -62);

        // West road (diagonal) to forest
        const r2 = new THREE.Mesh(
            new THREE.PlaneGeometry(7, 110),
            new THREE.MeshLambertMaterial({ color: 0xA89070 })
        );
        r2.rotation.x = -Math.PI / 2;
        r2.rotation.z = 0.68;
        r2.position.set(-44, 0.02, 38);
        this.scene.add(r2);

        // East road to fields
        this._plane(0xA89070, 9, 100, 90, 0.02, 5);

        // East road to Eastford
        this._plane(0xA89070, 9, 95,  97, 0.02, 22);

        // South road to ruins
        this._plane(0xA89070, 9, 105, 27, 0.02, 102);
    }

    /* ================================================================
       ENVIRONMENTAL LANDMARKS
       ================================================================ */
    _buildLandmarks() {
        this._buildMountains();
        this._buildOcean();
        this._buildFields();
        this._buildWesternForestEdge();
    }

    _buildMountains() {
        const rockMat = new THREE.MeshLambertMaterial({ color: 0x5A5A6A });
        const snowMat = new THREE.MeshLambertMaterial({ color: 0xF0F0F5 });
        const peaks = [
            [-70, -215, 55, 75], [-35, -240, 48, 85], [0, -230, 52, 90],
            [35, -248, 44, 80],  [70, -220, 50, 72],  [-100, -235, 40, 60],
            [100, -228, 42, 65], [0, -270, 36, 65],   [-50, -268, 30, 55],
            [50, -265, 32, 58]
        ];
        peaks.forEach(([x, z, r, h]) => {
            const cone = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), rockMat);
            cone.position.set(x, h / 2, z);
            this.scene.add(cone);
            const sh = h * 0.28, sr = r * 0.35;
            const snow = new THREE.Mesh(new THREE.ConeGeometry(sr, sh, 7), snowMat);
            snow.position.set(x, h * 0.86, z);
            this.scene.add(snow);
        });
        const hillMat = new THREE.MeshLambertMaterial({ color: 0x4A6A3A });
        for (let i = 0; i < 8; i++) {
            const hx = -120 + i * 35, hz = -185;
            const hill = new THREE.Mesh(new THREE.SphereGeometry(18 + Math.random() * 10, 8, 6), hillMat);
            hill.position.set(hx, 8, hz);
            hill.scale.y = 0.4;
            this.scene.add(hill);
        }
    }

    _buildOcean() {
        const oceanMat = new THREE.MeshLambertMaterial({ color: 0x1A72A8, transparent: true, opacity: 0.88 });
        const ocean = new THREE.Mesh(new THREE.PlaneGeometry(700, 160), oceanMat);
        ocean.rotation.x = -Math.PI / 2;
        ocean.position.set(0, -0.5, 310);
        this.scene.add(ocean);

        const beachMat = new THREE.MeshLambertMaterial({ color: 0xF0DDA0 });
        const beach = new THREE.Mesh(new THREE.PlaneGeometry(700, 40), beachMat);
        beach.rotation.x = -Math.PI / 2;
        beach.position.set(0, 0.08, 232);
        this.scene.add(beach);

        const shimmer = new THREE.Mesh(new THREE.PlaneGeometry(700, 20),
            new THREE.MeshLambertMaterial({ color: 0x6BB8E8, transparent: true, opacity: 0.5 }));
        shimmer.rotation.x = -Math.PI / 2;
        shimmer.position.set(0, -0.1, 390);
        this.scene.add(shimmer);

        const cliffMat = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
        [-250, 250].forEach(cx => {
            const cliff = new THREE.Mesh(new THREE.BoxGeometry(30, 18, 50), cliffMat);
            cliff.position.set(cx, 9, 230);
            this.scene.add(cliff);
        });
    }

    _buildFields() {
        this._plane(0xC8A428, 90, 140, 195, 0.03,  10);
        this._plane(0x7DAA44, 60,  90, 215, 0.04, -40);
        this._plane(0xBBA020, 50,  60, 220, 0.05,  60);

        for (let i = 0; i < 10; i++) {
            const strip = new THREE.Mesh(
                new THREE.PlaneGeometry(0.5, 130),
                new THREE.MeshLambertMaterial({ color: 0x6B5530 })
            );
            strip.rotation.x = -Math.PI / 2;
            strip.position.set(155 + i * 8, 0.04, 10);
            this.scene.add(strip);
        }

        const hayMat = new THREE.MeshLambertMaterial({ color: 0xD4A017 });
        [[175, -20], [190, 35], [210, -5], [225, 55], [170, 70]].forEach(([hx, hz]) => {
            const hay = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.5, 3, 8), hayMat);
            hay.position.set(hx, 1.5, hz);
            this.scene.add(hay);
            const top = new THREE.Mesh(new THREE.ConeGeometry(2.2, 1.5, 8), hayMat);
            top.position.set(hx, 3.75, hz);
            this.scene.add(top);
        });

        const sc_x = 180, sc_z = 20;
        const scBody = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.4, 0.5), new THREE.MeshLambertMaterial({ color: 0x8B4513 }));
        scBody.position.set(sc_x, 1.4, sc_z);
        this.scene.add(scBody);
        const scHead = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), new THREE.MeshLambertMaterial({ color: 0xDEB887 }));
        scHead.position.set(sc_x, 2.5, sc_z);
        this.scene.add(scHead);
        const scArm = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.2, 0.2), new THREE.MeshLambertMaterial({ color: 0x8B4513 }));
        scArm.position.set(sc_x, 1.8, sc_z);
        this.scene.add(scArm);
        const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.6, 8), new THREE.MeshLambertMaterial({ color: 0x2C2C2C }));
        hat.position.set(sc_x, 3.0, sc_z);
        this.scene.add(hat);

        const fenceMat = new THREE.MeshLambertMaterial({ color: 0x8B6914 });
        for (let i = 0; i < 14; i++) {
            const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.5, 0.18), fenceMat);
            post.position.set(148, 0.75, -60 + i * 14);
            this.scene.add(post);
            if (i < 13) {
                const rail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 14), fenceMat);
                rail.position.set(148, 0.9, -53 + i * 14);
                this.scene.add(rail);
            }
        }
    }

    _buildWesternForestEdge() {
        const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5C3A1A });
        const treeMat  = new THREE.MeshLambertMaterial({ color: 0x1A4A10 });
        const positions = [
            [-130, 40], [-138, -5], [-135, 65], [-145, 20], [-140, -30],
            [-125, -50], [-150, 80], [-155, 0], [-148, 50], [-135, 100],
        ];
        positions.forEach(([x, z]) => {
            const sc = 0.9 + Math.random() * 0.5;
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4 * sc, 0.5 * sc, 3.5 * sc, 7), trunkMat);
            trunk.position.set(x, 1.75 * sc, z);
            this.scene.add(trunk);
            const foliage = new THREE.Mesh(new THREE.SphereGeometry(2.5 * sc, 7, 6), treeMat);
            foliage.position.set(x, 5 * sc, z);
            foliage.castShadow = true;
            this.scene.add(foliage);
        });
    }

    /* ================================================================
       VILLAGE (Thornwick)
       ================================================================ */
    _buildVillage() {
        // Well (center landmark)
        this._cylinder(0.45, 0.45, 1.1, 0x6B6B6B, 0, 0.55, 0, 10);
        this._cylinder(0.50, 0.50, 0.18, 0x5C4A32, 0, 1.18, 0, 10);
        const wb = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.15, 0.15), new THREE.MeshLambertMaterial({ color: 0x5C4A32 }));
        wb.position.set(0, 1.6, 0);
        this.scene.add(wb);

        // Buildings
        this._house( 13, 0,  -9, 10, 5.5,  8, 0xD4956A, 0x8B4513, 'Inn',     0);
        this._house(-15, 0,  -9,  9, 5.0,  7, 0x8B7355, 0x5C3A1A, 'Forge',   1);
        this._house(  9, 0,  13,  8, 4.8,  7, 0xDEB887, 0x7B3910, 'Bakery',  2);
        this._house(-11, 0, -21, 10, 6.0,  9, 0xB8860B, 0x6B4C11, 'Mayor',   0);
        this._house( 18, 0,  15,  8, 4.8,  7, 0xC4A882, 0x8B4513, null,      1);
        this._house(-18, 0,  15,  8, 4.8,  7, 0xD2B48C, 0x6B3A10, null,      2);
        this._house(  0, 0, -23,  8, 4.8,  7, 0xBDB76B, 0x8B4513, null,      0);
        this._house( -5, 0, -33,  8, 6.0,  8, 0xE8D5B7, 0x8B6914, 'Mill',    1);
        this._house( 24, 0,  -6,  8, 4.8,  7, 0xCC5555, 0x8B2222, 'Butcher', 2);
        this._windmill(-5, 7.5, -33);

        // Market stalls
        this._stall( 2, 0, 19);
        this._stall(-5, 0, 21);
        this._stall( 9, 0, 21);

        this._fence();

        // Lamp posts
        [[6, 0], [-6, 0], [0, 6], [0, -6]].forEach(([lx, lz]) => {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.10, 3, 6),
                new THREE.MeshLambertMaterial({ color: 0x333333 }));
            post.position.set(lx, 1.5, lz);
            this.scene.add(post);
            const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 6),
                new THREE.MeshLambertMaterial({ color: 0xFFEE88, emissive: 0xFFCC00, emissiveIntensity: 0.8 }));
            lamp.position.set(lx, 3.2, lz);
            this.scene.add(lamp);
            const pl = new THREE.PointLight(0xFFDD88, 0.8, 10);
            pl.position.set(lx, 3.2, lz);
            this.scene.add(pl);
        });
    }

    /* ----------------------------------------------------------------
       DETAILED HOUSE – enterable through front doorway
       5 wall colliders: south-left, south-right, north, east, west.
       ---------------------------------------------------------------- */
    _house(cx, y, cz, w, h, d, wallColor, roofColor, sign, variant) {
        const wallMat     = new THREE.MeshLambertMaterial({ color: wallColor });
        const roofMat     = new THREE.MeshLambertMaterial({ color: roofColor });
        const doorMat     = new THREE.MeshLambertMaterial({ color: 0x2C1000 });
        const frameMat    = new THREE.MeshLambertMaterial({ color: 0x6B3A1A });
        const winMat      = new THREE.MeshLambertMaterial({ color: 0xAADDFF, emissive: 0x223344, emissiveIntensity: 0.35 });
        const winFrameMat = new THREE.MeshLambertMaterial({ color: 0x5C3A1A });
        const beamMat     = new THREE.MeshLambertMaterial({ color: 0x6B4520 });
        const wt   = 0.38;
        const doorW = 1.5, doorH = 2.4;

        /* ---- South wall (front) – split around door ---- */
        const leftW = (w - doorW) / 2;
        this._box(cx - doorW / 2 - leftW / 2, y + h / 2,               cz + d / 2, leftW, h, wt, wallMat);
        this._box(cx + doorW / 2 + leftW / 2, y + h / 2,               cz + d / 2, leftW, h, wt, wallMat);
        this._box(cx,                          y + doorH + (h - doorH) / 2, cz + d / 2, doorW, h - doorH, wt, wallMat);

        /* ---- Doorway frame ---- */
        this._box(cx - doorW / 2 - 0.08, y + doorH / 2,  cz + d / 2 + 0.01, 0.14, doorH, wt * 0.5, frameMat);
        this._box(cx + doorW / 2 + 0.08, y + doorH / 2,  cz + d / 2 + 0.01, 0.14, doorH, wt * 0.5, frameMat);
        this._box(cx,                     y + doorH + 0.1, cz + d / 2 + 0.01, doorW + 0.3, 0.2, wt * 0.4, frameMat);

        /* ---- Door panel (ajar) ---- */
        {
            const dg = new THREE.Mesh(new THREE.BoxGeometry(doorW * 0.95, doorH * 0.95, 0.08), doorMat);
            dg.position.set(cx - doorW / 2 - 0.1, y + doorH / 2, cz + d / 2 + 0.7);
            dg.rotation.y = -Math.PI * 0.35;
            this.scene.add(dg);
        }

        /* ---- North wall (back) ---- */
        this._box(cx, y + h / 2, cz - d / 2, w, h, wt, wallMat);

        /* ---- East & West walls ---- */
        this._box(cx + w / 2, y + h / 2, cz, wt, h, d, wallMat);
        this._box(cx - w / 2, y + h / 2, cz, wt, h, d, wallMat);

        /* ---- Windows with frames ---- */
        const mkWin = (wx, wy, wz, rotY = 0) => {
            const bg = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 0.06), winMat);
            bg.position.set(wx, wy, wz);
            bg.rotation.y = rotY;
            this.scene.add(bg);
            [[0, 0.55, 0, 1.4, 0.12, 0.08], [0, -0.55, 0, 1.4, 0.12, 0.08],
             [0.65, 0, 0, 0.12, 1.2, 0.08], [-0.65, 0, 0, 0.12, 1.2, 0.08]].forEach(([fx, fy, fz, fw, fh, fd]) => {
                const f = new THREE.Mesh(new THREE.BoxGeometry(fw, fh, fd), winFrameMat);
                f.position.set(wx + fx, wy + fy, wz + fz);
                f.rotation.y = rotY;
                this.scene.add(f);
            });
        };
        mkWin(cx - doorW / 2 - leftW / 2, y + h * 0.56, cz + d / 2 + 0.04);
        mkWin(cx + doorW / 2 + leftW / 2, y + h * 0.56, cz + d / 2 + 0.04);
        mkWin(cx + w / 2 + 0.04,          y + h * 0.55, cz, 0);
        mkWin(cx - w / 2 - 0.04,          y + h * 0.55, cz, 0);

        /* ---- Roof ---- */
        const roofH = h * 0.65;
        const ridgeLen = d * 0.92;
        const roofCone = new THREE.Mesh(
            new THREE.ConeGeometry(Math.max(w, d) * 0.78, roofH, 4),
            roofMat
        );
        roofCone.position.set(cx, y + h + roofH * 0.42, cz);
        roofCone.rotation.y = Math.PI / 4;
        roofCone.castShadow = true;
        this.scene.add(roofCone);
        const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, ridgeLen), beamMat);
        ridge.position.set(cx, y + h + roofH * 0.78, cz);
        this.scene.add(ridge);

        /* ---- Eaves ---- */
        [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([sx]) => {
            const eave = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, d + 0.6), beamMat);
            eave.position.set(cx + sx * (w / 2 + 0.15), y + h + 0.15, cz);
            this.scene.add(eave);
        });

        /* ---- Chimney ---- */
        {
            const chCx = (variant === 1) ? cx - w / 4 : cx + w / 4;
            const chCz = cz - d / 4;
            const chH  = roofH * 0.65;
            this._cylinder(0.35, 0.38, chH, 0x6B6B6B, chCx, y + h + chH / 2, chCz, 8);
            this._cylinder(0.48, 0.48, 0.12, 0x444444, chCx, y + h + chH + 0.06, chCz, 8);
            const smokeMat = new THREE.MeshLambertMaterial({ color: 0x999999, transparent: true, opacity: 0.45 });
            [0, 1].forEach(i => {
                const sm = new THREE.Mesh(new THREE.SphereGeometry(0.3 + i * 0.15, 6, 5), smokeMat);
                sm.position.set(chCx, y + h + chH + 0.6 + i * 0.6, chCz);
                this.scene.add(sm);
            });
        }

        /* ---- Sign ---- */
        if (sign) {
            const sg = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.55, 0.10), frameMat);
            sg.position.set(cx, y + h * 0.78, cz + d / 2 + 0.25);
            this.scene.add(sg);
        }

        /* ---- Half-timbered wall beams ---- */
        if (variant === 0 || variant === 2) {
            const darkBeam = new THREE.MeshLambertMaterial({ color: 0x3C2010 });
            [[-w / 2 + 0.05, cz - d / 2 + 0.05], [w / 2 - 0.05, cz - d / 2 + 0.05]].forEach(([bx, bz]) => {
                const vb = new THREE.Mesh(new THREE.BoxGeometry(0.14, h + 0.1, 0.10), darkBeam);
                vb.position.set(bx, y + h / 2, bz);
                this.scene.add(vb);
            });
            const hb = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.14, 0.10), darkBeam);
            hb.position.set(cx, y + h * 0.52, cz - d / 2 + 0.08);
            this.scene.add(hb);
        }

        /* ---- Interior furniture ---- */
        this._houseInterior(cx, y, cz, w, d, variant);

        /* ---- 5 wall colliders (door gap in south wall) ---- */
        this.colliders.push({ min: { x: cx - w / 2,      z: cz + d / 2 - wt }, max: { x: cx - doorW / 2, z: cz + d / 2 + wt } }); // South-left
        this.colliders.push({ min: { x: cx + doorW / 2,  z: cz + d / 2 - wt }, max: { x: cx + w / 2,     z: cz + d / 2 + wt } }); // South-right
        this.colliders.push({ min: { x: cx - w / 2,      z: cz - d / 2 - wt }, max: { x: cx + w / 2,     z: cz - d / 2 + wt } }); // North
        this.colliders.push({ min: { x: cx - w / 2 - wt, z: cz - d / 2      }, max: { x: cx - w / 2 + wt, z: cz + d / 2     } }); // West
        this.colliders.push({ min: { x: cx + w / 2 - wt, z: cz - d / 2      }, max: { x: cx + w / 2 + wt, z: cz + d / 2     } }); // East
    }

    _houseInterior(cx, y, cz, w, d, variant) {
        const tblMat   = new THREE.MeshLambertMaterial({ color: 0x8B5E2A });
        const chairMat = new THREE.MeshLambertMaterial({ color: 0x6B4015 });
        const bedMat   = new THREE.MeshLambertMaterial({ color: 0xCC4444 });

        this._plane(0x7A5C28, w - 0.8, d - 0.8, cx, y + 0.03, cz);

        const ix = cx, iz = cz - d / 4;

        if (variant === 0) {
            this._box(ix, y + 0.85, iz, 1.6, 0.12, 0.90, tblMat);
            this._box(ix, y + 0.42, iz, 0.10, 0.84, 0.10, tblMat);
            [-0.7, 0.7].forEach(ox => {
                this._box(ix + ox, y + 0.55, iz + 0.6, 0.45, 0.10, 0.45, chairMat);
                this._box(ix + ox, y + 1.0,  iz + 0.84, 0.45, 0.90, 0.08, chairMat);
            });
            this._box(ix + w / 2 - 0.5, y + 0.8, iz - 0.2, 0.80, 1.5, 0.35, new THREE.MeshLambertMaterial({ color: 0x555555 }));
        } else if (variant === 1) {
            this._box(ix - w / 4, y + 0.45, iz, 1.4, 0.45, 2.0, tblMat);
            this._box(ix - w / 4, y + 0.68, iz, 1.3, 0.22, 1.8, bedMat);
            this._box(ix + w / 4, y + 0.40, iz + 0.5, 1.0, 0.80, 0.70, new THREE.MeshLambertMaterial({ color: 0x5C3A1A }));
        } else {
            this._box(ix + w / 4, y + 1.2, iz - d / 4, 0.25, 2.0, d * 0.6, new THREE.MeshLambertMaterial({ color: 0x6B4520 }));
            [-0.5, 0, 0.5].forEach(oz => {
                this._cylinder(0.25, 0.28, 0.60, 0x6B3A1A, ix - w / 4, y + 0.3, iz + oz, 8);
            });
        }
    }

    /* ---- Box helper ---- */
    _box(x, y, z, w, h, d, mat) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        m.position.set(x, y, z);
        m.castShadow = m.receiveShadow = true;
        this.scene.add(m);
        return m;
    }

    _stall(x, y, z) {
        const roof = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.16, 3.5),
            new THREE.MeshLambertMaterial({ color: 0xCC4444 }));
        roof.position.set(x, y + 2.6, z);
        this.scene.add(roof);
        [[x - 1.8, z - 1.3], [x + 1.8, z - 1.3], [x - 1.8, z + 1.3], [x + 1.8, z + 1.3]].forEach(([px, pz]) => {
            const p = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 2.6, 6),
                new THREE.MeshLambertMaterial({ color: 0x6B3A1A }));
            p.position.set(px, y + 1.3, pz);
            this.scene.add(p);
        });
        const tbl = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.12, 1.8),
            new THREE.MeshLambertMaterial({ color: 0x8B6914 }));
        tbl.position.set(x, y + 1.1, z);
        this.scene.add(tbl);
    }

    _windmill(x, y, z) {
        const mat = new THREE.MeshLambertMaterial({ color: 0x8B6914 });
        for (let i = 0; i < 4; i++) {
            const arm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 5, 0.18), mat);
            arm.position.set(x, y, z - 3.1);
            arm.rotation.z = i * Math.PI / 2;
            this.scene.add(arm);
            const sail = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 0.06),
                new THREE.MeshLambertMaterial({ color: 0xF5F0D0, transparent: true, opacity: 0.85 }));
            const sa = i * Math.PI / 2;
            sail.position.set(x + Math.sin(sa) * 2.2, y + Math.cos(sa) * 2.2, z - 3.1);
            this.scene.add(sail);
        }
    }

    /* ---- Cylinder helper ---- */
    _cylinder(rt, rb, h, color, x, y, z, segs = 12) {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segs),
            new THREE.MeshLambertMaterial({ color }));
        m.position.set(x, y, z);
        m.castShadow = m.receiveShadow = true;
        this.scene.add(m);
        return m;
    }

    _fence() {
        const posts = [
            [28, 8], [28, -8], [28, -28], [28, 28],
            [-28, 8], [-28, -8], [-28, -28], [-28, 28],
            [8, -28], [-8, -28], [18, -28], [-18, -28],
            [8, 28], [-8, 28], [18, 28], [-18, 28]
        ];
        const mat = new THREE.MeshLambertMaterial({ color: 0x8B6914 });
        posts.forEach(([px, pz]) => {
            const p = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.6, 0.22), mat);
            p.position.set(px, 0.8, pz);
            this.scene.add(p);
        });
    }

    /* ================================================================
       EASTFORD (second village)
       ================================================================ */
    _buildEastford() {
        const ox = 195, oz = 45;

        // Village ground
        this._plane(0x9B9070, 40, 40, ox, 0.01, oz);

        // 6 houses
        this._house(ox - 12, 0, oz - 8,  9, 5.0, 7, 0xC8A87A, 0x7B4A20, 'Tavern',    0);
        this._house(ox + 10, 0, oz - 8,  8, 4.8, 7, 0xBDA882, 0x6B3A10, 'Trader',    1);
        this._house(ox - 10, 0, oz + 9,  8, 4.8, 7, 0xD8C09A, 0x8B5520, null,        2);
        this._house(ox + 12, 0, oz + 9,  9, 5.2, 8, 0xC09A6A, 0x7A3A10, 'Smithy',    0);
        this._house(ox,      0, oz - 14, 8, 4.8, 7, 0xDDB070, 0x8B4A18, null,        1);
        this._house(ox,      0, oz + 18, 8, 5.0, 7, 0xE0C090, 0x905520, null,        2);

        // Central well
        this._cylinder(0.45, 0.45, 1.1, 0x6B6B6B, ox, 0.55, oz, 10);
        this._cylinder(0.50, 0.50, 0.18, 0x5C4A32, ox, 1.18, oz, 10);
        const wb = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.15, 0.15), new THREE.MeshLambertMaterial({ color: 0x5C4A32 }));
        wb.position.set(ox, 1.6, oz);
        this.scene.add(wb);

        // Village fence perimeter
        const fMat = new THREE.MeshLambertMaterial({ color: 0x8B6914 });
        const fenceOffsets = [
            [ox - 22, oz],  [ox + 22, oz],
            [ox, oz - 22],  [ox, oz + 22],
            [ox - 22, oz - 11], [ox + 22, oz - 11],
            [ox - 22, oz + 11], [ox + 22, oz + 11],
            [ox - 11, oz - 22], [ox + 11, oz - 22],
            [ox - 11, oz + 22], [ox + 11, oz + 22],
        ];
        fenceOffsets.forEach(([px, pz]) => {
            const p = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.6, 0.22), fMat);
            p.position.set(px, 0.8, pz);
            this.scene.add(p);
        });

        // Lamp posts
        [[ox + 5, oz + 5], [ox - 5, oz + 5], [ox + 5, oz - 5], [ox - 5, oz - 5]].forEach(([lx, lz]) => {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.10, 3, 6),
                new THREE.MeshLambertMaterial({ color: 0x333333 }));
            post.position.set(lx, 1.5, lz);
            this.scene.add(post);
            const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 6),
                new THREE.MeshLambertMaterial({ color: 0xFFEE88, emissive: 0xFFCC00, emissiveIntensity: 0.8 }));
            lamp.position.set(lx, 3.2, lz);
            this.scene.add(lamp);
            const pl = new THREE.PointLight(0xFFDD88, 0.8, 10);
            pl.position.set(lx, 3.2, lz);
            this.scene.add(pl);
        });

        // Market stall
        this._stall(ox, 0, oz + 2);
    }

    /* ================================================================
       CASTLE (Ironhold)
       ================================================================ */
    _buildCastle() {
        const cx = 0, cz = -120;
        const wallMat  = new THREE.MeshLambertMaterial({ color: 0x7A7A7A });
        const darkMat  = new THREE.MeshLambertMaterial({ color: 0x606060 });
        const roofMat  = new THREE.MeshLambertMaterial({ color: 0x3E3E55 });
        const stoneLine = new THREE.MeshLambertMaterial({ color: 0x585850 }); // brick course lines

        const wall = (x, y, z, w, h, d, addCollider = true) => {
            const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
            m.position.set(x, y + h / 2, z);
            m.castShadow = m.receiveShadow = true;
            this.scene.add(m);
            if (addCollider && (w > 2 || d > 2)) {
                this.colliders.push({ min: { x: x - w / 2, z: z - d / 2 }, max: { x: x + w / 2, z: z + d / 2 } });
            }
            // Stonework brick course lines on tall walls
            if (h >= 10) {
                const courses = Math.floor(h / 2.5);
                for (let ci = 1; ci < courses; ci++) {
                    const sy = ci * 2.5;
                    const sl = new THREE.Mesh(new THREE.BoxGeometry(w + 0.05, 0.25, d + 0.05), stoneLine);
                    sl.position.set(x, y + sy, z);
                    this.scene.add(sl);
                }
            }
            return m;
        };

        // Outer walls
        wall(cx,      0, cz - 34, 64, 14, 3);         // North
        wall(cx - 32, 0, cz,      3,  14, 68);         // West
        wall(cx + 32, 0, cz,      3,  14, 68);         // East
        wall(cx - 16, 0, cz + 34, 28, 14, 3);          // South-left
        wall(cx + 16, 0, cz + 34, 28, 14, 3);          // South-right

        // Wall battlements (top crenellations)
        for (let j = -3; j <= 3; j++) {
            const b = new THREE.Mesh(new THREE.BoxGeometry(3, 2.5, 3.5), darkMat);
            b.position.set(cx + j * 9, 15.25, cz - 34);
            this.scene.add(b);
        }
        for (let j = -3; j <= 3; j++) {
            [-1, 1].forEach(s => {
                const b = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.5, 3), darkMat);
                b.position.set(cx + s * 32, 15.25, cz + j * 9);
                this.scene.add(b);
            });
        }

        /* ---- Gate Arch ---- */
        const archMat   = new THREE.MeshLambertMaterial({ color: 0x606060 });
        const arch      = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 3.5), archMat);
        arch.position.set(cx, 11.5, cz + 34);
        this.scene.add(arch);

        const archInner = new THREE.Mesh(new THREE.BoxGeometry(7, 4, 2),
            new THREE.MeshLambertMaterial({ color: 0x1A1A1A }));
        archInner.position.set(cx, 11, cz + 34);
        this.scene.add(archInner);

        // Portcullis (raised)
        const portMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
        for (let i = -2; i <= 2; i++) {
            const bar = new THREE.Mesh(new THREE.BoxGeometry(0.25, 6, 0.25), portMat);
            bar.position.set(cx + i * 1.6, 13.5, cz + 34);
            this.scene.add(bar);
        }
        for (let j = 0; j < 3; j++) {
            const hbar = new THREE.Mesh(new THREE.BoxGeometry(8, 0.22, 0.25), portMat);
            hbar.position.set(cx, 11.8 + j * 1.2, cz + 34);
            this.scene.add(hbar);
        }

        // Open wooden doors
        const doorMat = new THREE.MeshLambertMaterial({ color: 0x5C3010 });
        [-1, 1].forEach(s => {
            const gd = new THREE.Mesh(new THREE.BoxGeometry(3.8, 9.5, 0.35), doorMat);
            gd.position.set(cx + s * 3.5, 4.75, cz + 34 - 1.0);
            gd.rotation.y = s * Math.PI * 0.38;
            this.scene.add(gd);
            for (let p = 0; p < 5; p++) {
                const plank = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.1, 0.38),
                    new THREE.MeshLambertMaterial({ color: 0x3E1F00 }));
                plank.position.set(cx + s * 3.5, 1.0 + p * 1.8, cz + 34 - 1.0);
                plank.rotation.y = s * Math.PI * 0.38;
                this.scene.add(plank);
            }
        });

        // Gate towers
        [-1, 1].forEach(s => {
            const gt = new THREE.Mesh(new THREE.BoxGeometry(6, 18, 6), wallMat);
            gt.position.set(cx + s * 5, 9, cz + 34 + 0.5);
            gt.castShadow = gt.receiveShadow = true;
            this.scene.add(gt);
            // Stonework on gate tower
            for (let ci = 1; ci <= 6; ci++) {
                const sl = new THREE.Mesh(new THREE.BoxGeometry(6.05, 0.25, 6.05), stoneLine);
                sl.position.set(cx + s * 5, ci * 2.5, cz + 34 + 0.5);
                this.scene.add(sl);
            }
            const gtRoof = new THREE.Mesh(new THREE.ConeGeometry(4, 5, 4), roofMat);
            gtRoof.position.set(cx + s * 5, 20.5, cz + 34 + 0.5);
            gtRoof.rotation.y = Math.PI / 4;
            this.scene.add(gtRoof);
        });

        // Drawbridge
        const drawbridge = new THREE.Mesh(new THREE.BoxGeometry(9, 0.4, 10), doorMat);
        drawbridge.position.set(cx, 0.2, cz + 40);
        this.scene.add(drawbridge);
        [-1, 1].forEach(s => {
            const chain = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 10),
                new THREE.MeshLambertMaterial({ color: 0x444444 }));
            chain.position.set(cx + s * 3.5, 1, cz + 40);
            chain.rotation.x = -0.2;
            this.scene.add(chain);
        });

        // Corner towers
        [[-32, -34], [32, -34], [-32, 34], [32, 34]].forEach(([ox, oz]) => {
            wall(cx + ox, 0, cz + oz, 8, 22, 8);
            for (let j = -1; j <= 1; j++) {
                const b = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.2, 1.6), darkMat);
                b.position.set(cx + ox + j * 2.5, 23, cz + oz);
                this.scene.add(b);
                const b2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.2, 1.6), darkMat);
                b2.position.set(cx + ox, 23, cz + oz + j * 2.5);
                this.scene.add(b2);
            }
            const cone = new THREE.Mesh(new THREE.ConeGeometry(5, 7, 4), roofMat);
            cone.position.set(cx + ox, 27, cz + oz);
            cone.rotation.y = Math.PI / 4;
            this.scene.add(cone);
        });

        /* ---- Keep (central tower) — 4 wall colliders with 3.5-unit doorway gap in south face ---- */
        const kx = cx, kz = cz - 10;
        const kw = 20, kh = 30, kd = 20;
        const kDoorW = 3.5;

        // Keep walls (visual solid box, colliders split)
        const keepMesh = new THREE.Mesh(new THREE.BoxGeometry(kw, kh, kd), wallMat);
        keepMesh.position.set(kx, kh / 2, kz);
        keepMesh.castShadow = keepMesh.receiveShadow = true;
        this.scene.add(keepMesh);

        // Stonework brick courses on keep
        for (let ci = 1; ci <= Math.floor(kh / 2.5) - 1; ci++) {
            const sl = new THREE.Mesh(new THREE.BoxGeometry(kw + 0.05, 0.25, kd + 0.05), stoneLine);
            sl.position.set(kx, ci * 2.5, kz);
            this.scene.add(sl);
        }

        // 4 keep wall colliders with south gap for doorway
        const kWt = 1.5; // effective collider half-thickness
        // North keep wall
        this.colliders.push({ min: { x: kx - kw / 2, z: kz - kd / 2 - kWt }, max: { x: kx + kw / 2, z: kz - kd / 2 + kWt } });
        // East keep wall
        this.colliders.push({ min: { x: kx + kw / 2 - kWt, z: kz - kd / 2 }, max: { x: kx + kw / 2 + kWt, z: kz + kd / 2 } });
        // West keep wall
        this.colliders.push({ min: { x: kx - kw / 2 - kWt, z: kz - kd / 2 }, max: { x: kx - kw / 2 + kWt, z: kz + kd / 2 } });
        // South keep wall: left of door
        this.colliders.push({ min: { x: kx - kw / 2, z: kz + kd / 2 - kWt }, max: { x: kx - kDoorW / 2, z: kz + kd / 2 + kWt } });
        // South keep wall: right of door
        this.colliders.push({ min: { x: kx + kDoorW / 2, z: kz + kd / 2 - kWt }, max: { x: kx + kw / 2, z: kz + kd / 2 + kWt } });

        // Keep roof
        const keepRoof = new THREE.Mesh(new THREE.ConeGeometry(13, 12, 4), roofMat);
        keepRoof.position.set(kx, kh + 6, kz);
        keepRoof.rotation.y = Math.PI / 4;
        this.scene.add(keepRoof);

        // Flag
        const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 6, 6),
            new THREE.MeshLambertMaterial({ color: 0x555555 }));
        flagPole.position.set(kx, kh + 12, kz);
        this.scene.add(flagPole);
        const flag = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 0.1),
            new THREE.MeshLambertMaterial({ color: 0xCC2222 }));
        flag.position.set(kx + 1.6, kh + 15, kz);
        this.scene.add(flag);

        // Keep door
        const kd2 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 4.2, 0.12), doorMat);
        kd2.position.set(kx, 2.1, kz + kd / 2 + 0.07);
        this.scene.add(kd2);

        // Keep windows
        [[0, 10, -kd / 2], [0, 18, -kd / 2], [0, 10, kd / 2], [0, 18, kd / 2],
         [-kw / 2, 14, 0], [kw / 2, 14, 0]].forEach(([dx, dy, dz]) => {
            const wm = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.8, 0.16),
                new THREE.MeshLambertMaterial({ color: 0xAADDFF, emissive: 0x334466, emissiveIntensity: 0.5 }));
            wm.position.set(kx + dx, dy, kz + dz);
            this.scene.add(wm);
        });

        // Throne room
        this._plane(0x8B7355, 18, 18, kx, 0.05, kz);
        this._plane(0xAA2222, 3.5, 16, kx, 0.06, kz + 4);

        // Throne
        this._box(kx, 0.3, kz - kd / 2 + 2, 3.2, 0.5, 2.2, new THREE.MeshLambertMaterial({ color: 0xB8860B }));
        this._box(kx, 2.8, kz - kd / 2 + 1, 2.8, 4.5, 0.45, new THREE.MeshLambertMaterial({ color: 0xB8860B }));
        [-1, 1].forEach(s => {
            this._box(kx + s * 1.4, 1.2, kz - kd / 2 + 2, 0.35, 1.8, 2.0, new THREE.MeshLambertMaterial({ color: 0x966200 }));
        });

        // Candles
        [-4, 4].forEach(s => {
            this._cylinder(0.12, 0.12, 1.5, 0xF5F0D0, kx + s, 0.75, kz + 4, 8);
            const fl = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 6),
                new THREE.MeshLambertMaterial({ color: 0xFF9900, emissive: 0xFF6600, emissiveIntensity: 1 }));
            fl.position.set(kx + s, 1.65, kz + 4);
            this.scene.add(fl);
            const pt = new THREE.PointLight(0xFFAA00, 1, 10);
            pt.position.set(kx + s, 1.8, kz + 4);
            this.scene.add(pt);
        });

        // Gate torch light
        const torchPos = new THREE.PointLight(0xFF8800, 1.5, 15);
        torchPos.position.set(cx, 4, cz + 33);
        this.scene.add(torchPos);

        // Moat
        this._plane(0x2E5020, 80, 6, cx, -0.4, cz + 37);
    }

    /* ================================================================
       FOREST (Whispering Woods) — 280+ trees, 2 goblin camps
       ================================================================ */
    _buildForest() {
        const fx = -100, fz = 80;
        const treeMat  = new THREE.MeshLambertMaterial({ color: 0x2D5A1B });
        const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5C3A1A });
        const darkMat  = new THREE.MeshLambertMaterial({ color: 0x1A3A0E });
        const deepMat  = new THREE.MeshLambertMaterial({ color: 0x152E0A });

        const tree = (x, z, sc = 1.2) => {
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35 * sc, 0.45 * sc, 3.2 * sc, 7), trunkMat);
            trunk.position.set(x, 1.6 * sc, z);
            trunk.castShadow = true;
            this.scene.add(trunk);
            const foliageMat = sc > 1.6 ? deepMat : sc > 1.3 ? darkMat : treeMat;
            const f1 = new THREE.Mesh(new THREE.SphereGeometry(2.2 * sc, 7, 6), foliageMat);
            f1.position.set(x, 4.6 * sc, z);
            f1.castShadow = f1.receiveShadow = true;
            this.scene.add(f1);
            const f2 = new THREE.Mesh(new THREE.SphereGeometry(1.5 * sc, 6, 5), treeMat);
            f2.position.set(x, 6.2 * sc, z);
            this.scene.add(f2);
            const f3 = new THREE.Mesh(new THREE.SphereGeometry(0.9 * sc, 5, 4), darkMat);
            f3.position.set(x, 7.6 * sc, z);
            this.scene.add(f3);
            this.colliders.push({ min: { x: x - 1.2 * sc, z: z - 1.2 * sc }, max: { x: x + 1.2 * sc, z: z + 1.2 * sc } });
        };

        const rng = (a, b) => a + Math.random() * (b - a);
        const positions = [];

        // Dense core ring
        for (let i = 0; i < 120; i++) {
            const a = rng(0, Math.PI * 2), r = rng(10, 70);
            positions.push([fx + Math.cos(a) * r, fz + Math.sin(a) * r]);
        }
        // Outer ring
        for (let i = 0; i < 80; i++) {
            const a = rng(0, Math.PI * 2), r = rng(65, 110);
            positions.push([fx + Math.cos(a) * r, fz + Math.sin(a) * r]);
        }
        // NW corridor
        for (let i = 0; i < 20; i++) {
            positions.push([-20 - i * 6, 10 + i * 4]);
            positions.push([-22 - i * 5, 18 + i * 4]);
        }
        // Deep forest extension
        for (let i = 0; i < 40; i++) {
            const a = rng(0, Math.PI * 2), r = rng(90, 140);
            positions.push([fx + Math.cos(a) * r, fz + Math.sin(a) * r]);
        }
        // Extra scatter
        for (let i = 0; i < 20; i++) {
            positions.push([rng(-170, -50), rng(20, 130)]);
        }

        positions.forEach(([x, z]) => tree(x, z, 1.2 + Math.random() * 0.8));

        // Forest floor patches
        for (let i = 0; i < 30; i++) {
            const px = fx + rng(-80, 80), pz = fz + rng(-80, 80);
            this._plane(0x2A4A1A, rng(2, 8), rng(2, 8), px, 0.02, pz);
        }

        // Mushrooms
        const mushMat = new THREE.MeshLambertMaterial({ color: 0xCC3322 });
        const mushStemMat = new THREE.MeshLambertMaterial({ color: 0xEEDDBB });
        for (let i = 0; i < 15; i++) {
            const mx = fx + rng(-55, 55), mz = fz + rng(-55, 55);
            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 0.5, 6), mushStemMat);
            stem.position.set(mx, 0.25, mz);
            this.scene.add(stem);
            const cap = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.4, 8), mushMat);
            cap.position.set(mx, 0.65, mz);
            this.scene.add(cap);
        }

        /* ---- Goblin Camp 1 ---- */
        const gc1x = -95, gc1z = 80;
        this._buildGoblinCamp(gc1x, gc1z);

        /* ---- Goblin Camp 2 (deeper forest) ---- */
        const gc2x = -140, gc2z = 105;
        this._buildGoblinCamp(gc2x, gc2z);
    }

    _buildGoblinCamp(gcx, gcz) {
        // Fire pit
        this._cylinder(0.35, 0.35, 0.12, 0x333333, gcx, 0.06, gcz, 8);
        const fire = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.55, 6),
            new THREE.MeshLambertMaterial({ color: 0xFF6600, emissive: 0xFF3300, emissiveIntensity: 1 }));
        fire.position.set(gcx, 0.38, gcz);
        this.scene.add(fire);
        const fl = new THREE.PointLight(0xFF6600, 2.5, 16);
        fl.position.set(gcx, 1, gcz);
        this.scene.add(fl);

        // Campfire logs
        [-1, 1].forEach(s => {
            const log = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 1.0, 6),
                new THREE.MeshLambertMaterial({ color: 0x5C3A1A }));
            log.position.set(gcx + s * 0.3, 0.12, gcz);
            log.rotation.z = Math.PI / 2;
            this.scene.add(log);
        });

        // Huts around camp
        for (let i = 0; i < 4; i++) {
            const sh = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.8, 2.2),
                new THREE.MeshLambertMaterial({ color: 0x5C3A1A }));
            sh.position.set(gcx + Math.cos(i * 1.57) * 5, 0.9, gcz + Math.sin(i * 1.57) * 5);
            this.scene.add(sh);
            const sr = new THREE.Mesh(new THREE.ConeGeometry(1.8, 1.2, 4),
                new THREE.MeshLambertMaterial({ color: 0x3C2010 }));
            sr.position.set(gcx + Math.cos(i * 1.57) * 5, 2.4, gcz + Math.sin(i * 1.57) * 5);
            this.scene.add(sr);
        }

        // Skull on a stake (decoration)
        const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.8, 6),
            new THREE.MeshLambertMaterial({ color: 0x5C3A1A }));
        stake.position.set(gcx + 4, 0.9, gcz - 3);
        this.scene.add(stake);
        const skull = new THREE.Mesh(new THREE.SphereGeometry(0.25, 6, 5),
            new THREE.MeshLambertMaterial({ color: 0xEEE8CC }));
        skull.position.set(gcx + 4, 2.05, gcz - 3);
        this.scene.add(skull);
    }

    /* ================================================================
       SNOW BIOME (Frostpeak Highlands) — z ~ -265
       ================================================================ */
    _buildSnowBiome() {
        const bx = 0, bz = -265;

        // Snow terrain base
        this._plane(0xEEF0F5, 180, 180, bx, 0.05, bz);

        // Frozen lake
        this._plane(0xAADDEE, 55, 40, bx + 10, 0.06, bz + 20, 0.85);
        // Ice cracks (dark lines)
        for (let i = 0; i < 5; i++) {
            this._plane(0x88BBCC, 0.3, 30, bx + i * 5 - 10, 0.07, bz + 20, 0.9);
        }

        // 50 pine trees (cone + trunk)
        const pineMat  = new THREE.MeshLambertMaterial({ color: 0x1A4A20 });
        const snowMat2 = new THREE.MeshLambertMaterial({ color: 0xEEF0F5 });
        const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5C3A1A });
        const rng = (a, b) => a + Math.random() * (b - a);

        for (let i = 0; i < 50; i++) {
            const tx = bx + rng(-80, 80), tz = bz + rng(-80, 80);
            // Avoid frozen lake
            if (Math.abs(tx - bx - 10) < 30 && Math.abs(tz - bz - 20) < 22) continue;
            const sc = 0.9 + Math.random() * 0.7;

            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * sc, 0.3 * sc, 2.5 * sc, 6), trunkMat);
            trunk.position.set(tx, 1.25 * sc, tz);
            this.scene.add(trunk);

            // Layered cone pine shape
            [0, 1, 2].forEach(layer => {
                const layerR = (2.0 - layer * 0.45) * sc;
                const layerH = (2.5 - layer * 0.3) * sc;
                const cone = new THREE.Mesh(new THREE.ConeGeometry(layerR, layerH, 7), pineMat);
                cone.position.set(tx, (2.0 + layer * 1.5) * sc, tz);
                cone.castShadow = true;
                this.scene.add(cone);
                // Snow on branches
                const snowCap = new THREE.Mesh(new THREE.ConeGeometry(layerR * 0.8, layerH * 0.25, 7), snowMat2);
                snowCap.position.set(tx, (2.2 + layer * 1.5) * sc, tz);
                this.scene.add(snowCap);
            });

            this.colliders.push({ min: { x: tx - 1.0 * sc, z: tz - 1.0 * sc }, max: { x: tx + 1.0 * sc, z: tz + 1.0 * sc } });
        }

        // Yurt (round dwelling)
        const yurtX = bx - 35, yurtZ = bz - 20;
        const yurtMat = new THREE.MeshLambertMaterial({ color: 0xDDCCBB });
        const yurtBody = new THREE.Mesh(new THREE.CylinderGeometry(5, 5.5, 4, 12), yurtMat);
        yurtBody.position.set(yurtX, 2, yurtZ);
        this.scene.add(yurtBody);
        const yurtRoof = new THREE.Mesh(new THREE.ConeGeometry(6, 3, 12),
            new THREE.MeshLambertMaterial({ color: 0xBBAA99 }));
        yurtRoof.position.set(yurtX, 5.5, yurtZ);
        this.scene.add(yurtRoof);
        // Snow on yurt
        const yurtSnow = new THREE.Mesh(new THREE.ConeGeometry(6.2, 1.0, 12), snowMat2);
        yurtSnow.position.set(yurtX, 4.4, yurtZ);
        this.scene.add(yurtSnow);
        // Yurt door
        const yurtDoor = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.0, 0.1),
            new THREE.MeshLambertMaterial({ color: 0x5C3A1A }));
        yurtDoor.position.set(yurtX, 1.0, yurtZ + 5.5);
        this.scene.add(yurtDoor);
        this.colliders.push({ min: { x: yurtX - 6, z: yurtZ - 6 }, max: { x: yurtX + 6, z: yurtZ + 6 } });

        // Snow rocks
        const snowRockMat = new THREE.MeshLambertMaterial({ color: 0xCCCFD8 });
        for (let i = 0; i < 12; i++) {
            const rx = bx + rng(-70, 70), rz = bz + rng(-70, 70);
            const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rng(0.8, 2.2)), snowRockMat);
            rock.position.set(rx, 0.5, rz);
            rock.rotation.y = Math.random() * Math.PI;
            this.scene.add(rock);
        }

        // Icicles on some rocks (thin cylinder spikes)
        const icicleMat = new THREE.MeshLambertMaterial({ color: 0xCCEEFF, transparent: true, opacity: 0.75 });
        for (let i = 0; i < 8; i++) {
            const ix2 = bx + rng(-60, 60), iz = bz + rng(-60, 60);
            const icicle = new THREE.Mesh(new THREE.ConeGeometry(0.08, rng(0.5, 1.5), 5), icicleMat);
            icicle.position.set(ix2, rng(0.5, 2.0), iz);
            icicle.rotation.z = Math.PI; // point down
            this.scene.add(icicle);
        }
    }

    /* ================================================================
       DESERT BIOME (Sunscorch Desert) — x ~ +265
       ================================================================ */
    _buildDesertBiome() {
        const bx = 265, bz = 110;

        // Sandy terrain
        this._plane(0xD4A84B, 180, 180, bx, 0.05, bz);

        // Sand dunes (low elongated spheres)
        const duneMat = new THREE.MeshLambertMaterial({ color: 0xC8963A });
        const dunes = [
            [bx - 30, bz - 25, 22, 8, 0.3],
            [bx + 25, bz - 20, 18, 7, 0.28],
            [bx - 10, bz + 35, 24, 9, 0.32],
            [bx + 40, bz + 15, 16, 6, 0.25],
            [bx - 45, bz + 10, 20, 7, 0.3],
        ];
        dunes.forEach(([dx, dz, dr, dh, sy]) => {
            const dune = new THREE.Mesh(new THREE.SphereGeometry(dr, 10, 7), duneMat);
            dune.position.set(dx, dh * sy, dz);
            dune.scale.y = sy;
            this.scene.add(dune);
        });

        // Oasis
        const oasisX = bx - 20, oasisZ = bz + 10;
        this._plane(0x2A8855, 18, 18, oasisX, 0.08, oasisZ);
        this._plane(0x1A72A8, 10, 10, oasisX, 0.1, oasisZ, 0.88);

        // Palm trees around oasis
        const palmTrunkMat = new THREE.MeshLambertMaterial({ color: 0x8B6914 });
        const palmLeafMat  = new THREE.MeshLambertMaterial({ color: 0x2E7B40 });
        [[oasisX - 5, oasisZ - 5], [oasisX + 5, oasisZ - 5],
         [oasisX - 5, oasisZ + 5], [oasisX + 5, oasisZ + 5],
         [oasisX, oasisZ - 7],     [oasisX, oasisZ + 7]].forEach(([px, pz]) => {
            const sc = 0.85 + Math.random() * 0.35;
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22 * sc, 0.35 * sc, 6 * sc, 7), palmTrunkMat);
            trunk.position.set(px, 3 * sc, pz);
            trunk.rotation.z = (Math.random() - 0.5) * 0.3;
            this.scene.add(trunk);
            // Palm fronds (flat boxes radiating outward)
            for (let f = 0; f < 6; f++) {
                const fa = f * Math.PI / 3;
                const frond = new THREE.Mesh(new THREE.BoxGeometry(3.5 * sc, 0.1, 0.6 * sc), palmLeafMat);
                frond.position.set(px + Math.cos(fa) * 1.5 * sc, 6.2 * sc, pz + Math.sin(fa) * 1.5 * sc);
                frond.rotation.y = fa;
                frond.rotation.z = -0.3;
                this.scene.add(frond);
            }
            this.colliders.push({ min: { x: px - 0.5, z: pz - 0.5 }, max: { x: px + 0.5, z: pz + 0.5 } });
        });

        // 20 cacti
        const cactusMat = new THREE.MeshLambertMaterial({ color: 0x4A8A3A });
        const cactusArmMat = new THREE.MeshLambertMaterial({ color: 0x3A7A2A });
        const rng = (a, b) => a + Math.random() * (b - a);

        let cactusCount = 0;
        for (let i = 0; i < 60 && cactusCount < 20; i++) {
            const cx2 = bx + rng(-80, 80), cz2 = bz + rng(-80, 80);
            // Skip oasis area
            if (Math.abs(cx2 - oasisX) < 12 && Math.abs(cz2 - oasisZ) < 12) continue;
            cactusCount++;

            const sc = 0.8 + Math.random() * 0.5;
            const cBody = new THREE.Mesh(new THREE.CylinderGeometry(0.4 * sc, 0.5 * sc, 3.5 * sc, 7), cactusMat);
            cBody.position.set(cx2, 1.75 * sc, cz2);
            this.scene.add(cBody);
            // Arms
            [-1, 1].forEach(s => {
                const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.25 * sc, 0.3 * sc, 1.8 * sc, 6), cactusArmMat);
                arm.position.set(cx2 + s * 0.7 * sc, 2.5 * sc, cz2);
                arm.rotation.z = s * Math.PI / 3;
                this.scene.add(arm);
                const armTop = new THREE.Mesh(new THREE.CylinderGeometry(0.25 * sc, 0.25 * sc, 1.0 * sc, 6), cactusArmMat);
                armTop.position.set(cx2 + s * 1.3 * sc, 3.3 * sc, cz2);
                this.scene.add(armTop);
            });
            // Top
            const cTop = new THREE.Mesh(new THREE.CylinderGeometry(0.25 * sc, 0.4 * sc, 0.8 * sc, 7), cactusMat);
            cTop.position.set(cx2, 3.9 * sc, cz2);
            this.scene.add(cTop);

            this.colliders.push({ min: { x: cx2 - 0.7, z: cz2 - 0.7 }, max: { x: cx2 + 0.7, z: cz2 + 0.7 } });
        }

        // Desert ruins / sandstone blocks
        const sandMat = new THREE.MeshLambertMaterial({ color: 0xD4A060 });
        [[bx + 50, bz - 40], [bx + 55, bz - 35], [bx + 48, bz - 30]].forEach(([rx, rz]) => {
            const b = new THREE.Mesh(new THREE.BoxGeometry(rng(2, 5), rng(1, 3), rng(2, 4)), sandMat);
            b.position.set(rx, 0.8, rz);
            this.scene.add(b);
        });

        // Skull in sand
        const skullMat = new THREE.MeshLambertMaterial({ color: 0xF5EED0 });
        const skull = new THREE.Mesh(new THREE.SphereGeometry(0.4, 6, 5), skullMat);
        skull.position.set(bx + 20, 0.2, bz - 15);
        this.scene.add(skull);
    }

    /* ================================================================
       SWAMP BIOME (Darkwater Swamp) — x ~ -190
       ================================================================ */
    _buildSwampBiome() {
        const bx = -190, bz = 135;

        // Dark swamp terrain
        this._plane(0x2A3A1A, 200, 200, bx, 0.05, bz);

        // Swamp water pools (murky dark green)
        const swampMat = new THREE.MeshLambertMaterial({ color: 0x1A4A2A, transparent: true, opacity: 0.80 });
        const pools = [
            [bx - 20, bz - 10, 35, 25],
            [bx + 15, bz + 20, 28, 22],
            [bx - 30, bz + 30, 20, 18],
            [bx + 35, bz - 25, 25, 18],
            [bx, bz, 22, 18],
        ];
        pools.forEach(([px, pz, pw, pd]) => {
            const pool = new THREE.Mesh(new THREE.PlaneGeometry(pw, pd), swampMat);
            pool.rotation.x = -Math.PI / 2;
            pool.position.set(px, -0.1, pz);
            this.scene.add(pool);
        });

        // 70 twisted trees (dark spheres on dark trunks)
        const swampTrunkMat   = new THREE.MeshLambertMaterial({ color: 0x2A1A0A });
        const swampFoliageMat = new THREE.MeshLambertMaterial({ color: 0x1A2A0A });
        const deadMat         = new THREE.MeshLambertMaterial({ color: 0x3A3020 });
        const rng = (a, b) => a + Math.random() * (b - a);

        for (let i = 0; i < 70; i++) {
            const tx = bx + rng(-85, 85), tz = bz + rng(-85, 85);
            const sc = 0.8 + Math.random() * 0.7;
            const lean = (Math.random() - 0.5) * 0.3;

            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22 * sc, 0.35 * sc, 4.0 * sc, 6), swampTrunkMat);
            trunk.position.set(tx, 2.0 * sc, tz);
            trunk.rotation.z = lean;
            trunk.castShadow = true;
            this.scene.add(trunk);

            // Dark spherical foliage (irregular)
            const fMat = Math.random() > 0.3 ? swampFoliageMat : deadMat;
            const f1 = new THREE.Mesh(new THREE.SphereGeometry(1.8 * sc, 6, 5), fMat);
            f1.position.set(tx + lean * 2, 5.2 * sc, tz);
            f1.scale.set(1.2, 0.8, 1.0);
            this.scene.add(f1);

            if (Math.random() > 0.4) {
                const f2 = new THREE.Mesh(new THREE.SphereGeometry(1.2 * sc, 5, 4), swampFoliageMat);
                f2.position.set(tx + lean + rng(-0.8, 0.8), 6.8 * sc, tz + rng(-0.5, 0.5));
                this.scene.add(f2);
            }

            this.colliders.push({ min: { x: tx - 0.6 * sc, z: tz - 0.6 * sc }, max: { x: tx + 0.6 * sc, z: tz + 0.6 * sc } });
        }

        // Mossy rocks
        const mossMat = new THREE.MeshLambertMaterial({ color: 0x2A4A1A });
        for (let i = 0; i < 18; i++) {
            const rx = bx + rng(-75, 75), rz = bz + rng(-75, 75);
            const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rng(0.6, 2.0)), mossMat);
            rock.position.set(rx, 0.4, rz);
            rock.rotation.y = Math.random() * Math.PI;
            this.scene.add(rock);
        }

        // Will-o-wisps (glowing spheres floating)
        const wispColors = [0x44FFAA, 0x88FFCC, 0x22EE88, 0xAAFFDD];
        for (let i = 0; i < 12; i++) {
            const wx = bx + rng(-70, 70), wz = bz + rng(-70, 70);
            const wispMat = new THREE.MeshLambertMaterial({
                color: wispColors[i % 4],
                emissive: wispColors[i % 4],
                emissiveIntensity: 1.2,
                transparent: true,
                opacity: 0.7
            });
            const wisp = new THREE.Mesh(new THREE.SphereGeometry(0.22, 7, 6), wispMat);
            wisp.position.set(wx, rng(1.0, 3.5), wz);
            this.scene.add(wisp);
            const wLight = new THREE.PointLight(wispColors[i % 4], 1.2, 8);
            wLight.position.set(wx, rng(1.0, 3.5), wz);
            this.scene.add(wLight);
        }

        // Rotting wooden planks (walkway)
        const plankMat = new THREE.MeshLambertMaterial({ color: 0x3A2A10 });
        for (let i = 0; i < 10; i++) {
            const plank = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.1, 2.5), plankMat);
            plank.position.set(bx + 5 + i * 1.5, 0.05, bz - 15);
            plank.rotation.y = (Math.random() - 0.5) * 0.2;
            this.scene.add(plank);
        }

        // Dead tree stumps
        const stumpMat = new THREE.MeshLambertMaterial({ color: 0x2A1A08 });
        for (let i = 0; i < 8; i++) {
            const sx = bx + rng(-60, 60), sz = bz + rng(-60, 60);
            const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.65, 0.8, 7), stumpMat);
            stump.position.set(sx, 0.4, sz);
            this.scene.add(stump);
        }
    }

    /* ================================================================
       RUINS (Ancient Ruins) — (55, 0, 210)
       ================================================================ */
    _buildRuins() {
        const rx = 55, rz = 210;

        // Stone floor tiles
        const floorMat = new THREE.MeshLambertMaterial({ color: 0x888878 });
        this._plane(0x7A7A6A, 50, 50, rx, 0.04, rz);

        // Cracked floor tiles (pattern)
        for (let i = -2; i <= 2; i++) {
            for (let j = -2; j <= 2; j++) {
                if (Math.random() > 0.5) {
                    const tile = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.15, 8.5), floorMat);
                    tile.position.set(rx + i * 9, 0.02, rz + j * 9);
                    tile.receiveShadow = true;
                    this.scene.add(tile);
                }
            }
        }

        // 4 broken cylinder towers (at corners)
        const towerMat = new THREE.MeshLambertMaterial({ color: 0x6A6A58 });
        const darkTowerMat = new THREE.MeshLambertMaterial({ color: 0x4A4A3A });
        const towerPositions = [
            [rx - 20, rz - 20, 8],
            [rx + 20, rz - 20, 12],
            [rx - 20, rz + 20, 6],
            [rx + 20, rz + 20, 10],
        ];
        towerPositions.forEach(([tx, tz, th]) => {
            // Main cylinder
            const tower = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 4.0, th, 10), towerMat);
            tower.position.set(tx, th / 2, tz);
            tower.castShadow = true;
            this.scene.add(tower);
            // Broken top edge (irregular chunks)
            for (let c = 0; c < 3; c++) {
                const ca = c * 2.0 + Math.random();
                const chunk = new THREE.Mesh(new THREE.BoxGeometry(2.5, rng(0.8, 2.5), 2.5), darkTowerMat);
                chunk.position.set(tx + Math.cos(ca) * 2.5, th + 0.8, tz + Math.sin(ca) * 2.5);
                chunk.rotation.y = ca;
                this.scene.add(chunk);
            }
            // Rubble at base
            for (let r2 = 0; r2 < 5; r2++) {
                const rubble = new THREE.Mesh(new THREE.BoxGeometry(rng(0.5, 1.5), rng(0.3, 0.8), rng(0.5, 1.5)), towerMat);
                rubble.position.set(tx + rng(-4, 4), 0.3, tz + rng(-4, 4));
                rubble.rotation.y = Math.random() * Math.PI;
                this.scene.add(rubble);
            }
            this.colliders.push({ min: { x: tx - 4.2, z: tz - 4.2 }, max: { x: tx + 4.2, z: tz + 4.2 } });
        });

        // Scattered wall segments
        const wallMat = new THREE.MeshLambertMaterial({ color: 0x7A7A68 });
        const wallSegments = [
            [rx - 10, rz - 22, 18, 5, 2],
            [rx + 10, rz + 22, 16, 4, 2],
            [rx - 22, rz + 5,  2,  6, 12],
            [rx + 22, rz - 8,  2,  5, 10],
            [rx - 5,  rz - 20, 8,  3, 2],
            [rx + 8,  rz + 18, 10, 4, 2],
        ];
        wallSegments.forEach(([wx, wz, ww, wh, wd]) => {
            const seg = new THREE.Mesh(new THREE.BoxGeometry(ww, wh, wd), wallMat);
            seg.position.set(wx, wh / 2, wz);
            seg.rotation.y = (Math.random() - 0.5) * 0.4;
            seg.castShadow = true;
            this.scene.add(seg);
            // Brick course lines on wall segments
            const stoneLineMat = new THREE.MeshLambertMaterial({ color: 0x555548 });
            for (let ci = 1; ci < Math.floor(wh / 1.2); ci++) {
                const sl = new THREE.Mesh(new THREE.BoxGeometry(ww + 0.02, 0.2, wd + 0.02), stoneLineMat);
                sl.position.set(wx, ci * 1.2, wz);
                this.scene.add(sl);
            }
            this.colliders.push({ min: { x: wx - ww / 2, z: wz - wd / 2 }, max: { x: wx + ww / 2, z: wz + wd / 2 } });
        });

        // Central altar
        const altarMat = new THREE.MeshLambertMaterial({ color: 0x5A5A4A });
        const altarBase = new THREE.Mesh(new THREE.BoxGeometry(6, 0.6, 4), altarMat);
        altarBase.position.set(rx, 0.3, rz);
        altarBase.castShadow = true;
        this.scene.add(altarBase);
        const altarTop = new THREE.Mesh(new THREE.BoxGeometry(5, 0.4, 3), new THREE.MeshLambertMaterial({ color: 0x6A6A5A }));
        altarTop.position.set(rx, 0.8, rz);
        this.scene.add(altarTop);
        // Altar runes (small glowing inlays)
        const runeMat = new THREE.MeshLambertMaterial({ color: 0x8844FF, emissive: 0x6633CC, emissiveIntensity: 0.8 });
        for (let i = 0; i < 4; i++) {
            const rune = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.4), runeMat);
            rune.position.set(rx + (i - 1.5) * 1.2, 1.05, rz);
            this.scene.add(rune);
        }
        // Altar light
        const altarLight = new THREE.PointLight(0x8844FF, 1.5, 20);
        altarLight.position.set(rx, 3, rz);
        this.scene.add(altarLight);

        // Ancient pillars
        const pillarMat = new THREE.MeshLambertMaterial({ color: 0x7A7A68 });
        [[-12, -5], [12, -5], [-12, 5], [12, 5]].forEach(([px, pz]) => {
            const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 8, 8), pillarMat);
            pillar.position.set(rx + px, 4, rz + pz);
            pillar.castShadow = true;
            this.scene.add(pillar);
            // Capital
            const cap = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.5, 2.0), pillarMat);
            cap.position.set(rx + px, 8.25, rz + pz);
            this.scene.add(cap);
            this.colliders.push({ min: { x: rx + px - 1, z: rz + pz - 1 }, max: { x: rx + px + 1, z: rz + pz + 1 } });
        });

        // Broken statue
        const statueMat = new THREE.MeshLambertMaterial({ color: 0x8A8A78 });
        const statBase = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.8, 1.5), statueMat);
        statBase.position.set(rx + 8, 0.4, rz - 8);
        this.scene.add(statBase);
        const statBody = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.5, 0.7), statueMat);
        statBody.position.set(rx + 8, 2.05, rz - 8);
        statBody.rotation.z = 0.25; // toppled
        this.scene.add(statBody);

        // Overgrowth (vines on ground)
        const vineMat = new THREE.MeshLambertMaterial({ color: 0x2A5A18 });
        for (let i = 0; i < 10; i++) {
            const vine = new THREE.Mesh(new THREE.PlaneGeometry(rng(2, 6), rng(1, 3)), vineMat);
            vine.rotation.x = -Math.PI / 2;
            vine.rotation.z = Math.random() * Math.PI;
            vine.position.set(rx + rng(-20, 20), 0.06, rz + rng(-20, 20));
            this.scene.add(vine);
        }

        function rng(a, b) { return a + Math.random() * (b - a); }
    }

    /* ================================================================
       QUEST PICKUPS
       ================================================================ */
    _buildQuestItems() {
        const addPickup = (x, z, type, color, label) => {
            let mesh;
            if (type === 'sheep') {
                mesh = window.charBuilder.buildSheep();
                mesh.position.set(x, 0, z);
                mesh.scale.setScalar(0.7);
            } else {
                mesh = new THREE.Mesh(
                    new THREE.BoxGeometry(0.55, 0.55, 0.55),
                    new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: 0.25 })
                );
                mesh.position.set(x, 0.65, z);
            }
            mesh.castShadow = true;
            this.scene.add(mesh);
            const obj = { mesh, type, id: label, used: false };
            this.pickups.push(obj);
            if (type === 'sheep') this.sheep.push(obj);
            return obj;
        };

        addPickup( 25,  15, 'sheep',         0xF0F0F0, 'sheep1');
        addPickup(-22,  20, 'sheep',         0xF0F0F0, 'sheep2');
        addPickup( 30,  -5, 'sheep',         0xF0F0F0, 'sheep3');
        addPickup(-30,  25, 'sheep',         0xF0F0F0, 'sheep4');
        addPickup(  5,  32, 'sheep',         0xF0F0F0, 'sheep5');
        addPickup(-78,  72, 'item_hot_sauce',  0xFF4400, 'Hot Sauce Plant');
        addPickup(  8, -106,'item_royal_socks',0x44AA44, 'Royal Socks');
        addPickup(-100, 88, 'item_moonbloom', 0xCC88FF, 'Moonbloom1');
        addPickup(-108, 78, 'item_moonbloom', 0xCC88FF, 'Moonbloom2');
        addPickup( -95, 95, 'item_moonbloom', 0xCC88FF, 'Moonbloom3');

        // New biome pickups
        addPickup(  0, -265, 'item_frostcrystal', 0xAAEEFF, 'Frost Crystal');
        addPickup(265,  110, 'item_desert_rose',  0xFFAA44, 'Desert Rose');
        addPickup(-190,  135, 'item_swamp_herb',  0x44AA44, 'Swamp Herb');
        addPickup( 55,  210, 'item_rune_shard',  0x8844FF, 'Rune Shard');
    }

    /* ================================================================
       AMBIENCE (rocks, flowers, details)
       ================================================================ */
    _buildAmbience() {
        const rockMat = new THREE.MeshLambertMaterial({ color: 0x888880 });
        [[18, -12], [-15, 22], [35, 8], [-35, -15], [60, 30], [-55, 45], [40, -60], [-40, 50]].forEach(([x, z]) => {
            const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.7), rockMat);
            r.position.set(x, 0.22, z);
            r.rotation.y = Math.random() * Math.PI;
            r.castShadow = true;
            this.scene.add(r);
        });

        const flowerColors = [0xFF69B4, 0xFFFF00, 0xFF6347, 0xDA70D6, 0xFF4500];
        for (let i = 0; i < 55; i++) {
            const fc = new THREE.Mesh(
                new THREE.SphereGeometry(0.16, 5, 4),
                new THREE.MeshLambertMaterial({ color: flowerColors[i % 5], emissive: flowerColors[i % 5], emissiveIntensity: 0.18 })
            );
            const a = Math.random() * Math.PI * 2, r = 8 + Math.random() * 40;
            fc.position.set(Math.cos(a) * r, 0.19, Math.sin(a) * r);
            this.scene.add(fc);
        }

        // Log piles near forge
        const logMat = new THREE.MeshLambertMaterial({ color: 0x6B3A1A });
        for (let i = 0; i < 4; i++) {
            const log = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.28, 1.5, 7), logMat);
            log.position.set(-18 + i * 0.3, 0.25, -4 + i * 0.3);
            log.rotation.z = Math.PI / 2;
            this.scene.add(log);
        }

        // Bush clusters
        const bushMat = new THREE.MeshLambertMaterial({ color: 0x2A5A18 });
        [[22, 25], [-22, -18], [12, -30], [-12, 30]].forEach(([bx, bz]) => {
            const bush = new THREE.Mesh(new THREE.SphereGeometry(1.2, 7, 5), bushMat);
            bush.position.set(bx, 0.8, bz);
            bush.scale.set(1, 0.65, 1);
            this.scene.add(bush);
        });

        // Additional mid-world rocks and details
        const rng = (a, b) => a + Math.random() * (b - a);
        for (let i = 0; i < 25; i++) {
            const rx = rng(-200, 200), rz = rng(-200, 200);
            if (Math.abs(rx) < 35 && Math.abs(rz) < 35) continue; // skip village center
            const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rng(0.4, 1.2)), rockMat);
            rock.position.set(rx, 0.3, rz);
            rock.rotation.y = Math.random() * Math.PI;
            rock.castShadow = true;
            this.scene.add(rock);
        }
    }

    /* ================================================================
       COLLISION + INTERACTION
       ================================================================ */
    checkCollision(x, z, radius = 0.65) {
        for (const box of this.colliders) {
            if (x + radius > box.min.x && x - radius < box.max.x &&
                z + radius > box.min.z && z - radius < box.max.z) return true;
        }
        return false;
    }

    getNearbyPickup(x, z, range = 3.2) {
        for (const p of this.pickups) {
            if (p.used) continue;
            const px = p.mesh.position.x, pz = p.mesh.position.z;
            if (Math.abs(px - x) < range && Math.abs(pz - z) < range) return p;
        }
        return null;
    }

    updateSheep(dt) {
        this.sheep.forEach(s => {
            if (s.used) return;
            s._t = (s._t || 0) + dt * 0.45;
            s.mesh.position.x += Math.sin(s._t + s.mesh.id * 1.3) * 0.008;
            s.mesh.position.z += Math.cos(s._t * 0.7 + s.mesh.id)  * 0.008;
        });
    }
}
