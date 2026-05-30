/* =========================================================
   MEDIEVAL MAYHEM - 3D World Builder v2
   - Larger, detailed houses with enterable doorways
   - Improved castle entrance
   - Environmental landmarks: mountains (N), ocean (S), fields (E)
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
        this._buildQuestItems();
        this._buildAmbience();
    }

    /* ================================================================
       TERRAIN
       ================================================================ */
    _buildTerrain() {
        const geo = new THREE.PlaneGeometry(700, 700, 50, 50);
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i), z = pos.getZ(i);
            const d = Math.sqrt(x*x + z*z);
            if (d > 70) pos.setY(i, (Math.sin(x*0.045) * Math.cos(z*0.045)) * 2.5);
        }
        geo.computeVertexNormals();
        const ground = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: 0x4A7C3F }));
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        this._plane(0x8B9D6A, 34, 34, 0,   0.01, 0);       // village square
        this._plane(0x9E9E8A, 64, 70, 0,   0.01, -120);    // castle courtyard
        this._plane(0x4488BB, 20, 130, 112, -0.3, 10, 0.82); // river (east)
    }

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
        this._plane(0xA89070, 9, 120, 0, 0.02, -62);   // north to castle
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
        // North (negative Z) – visible from village and castle
        const rockMat = new THREE.MeshLambertMaterial({ color: 0x5A5A6A });
        const snowMat = new THREE.MeshLambertMaterial({ color: 0xF0F0F5 });
        const peaks = [
            [-70,-215,55,75],[-35,-240,48,85],[0,-230,52,90],[35,-248,44,80],
            [70,-220,50,72],[-100,-235,40,60],[100,-228,42,65],[0,-270,36,65],
            [-50,-268,30,55],[50,-265,32,58]
        ];
        peaks.forEach(([x,z,r,h]) => {
            const cone = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), rockMat);
            cone.position.set(x, h/2, z);
            this.scene.add(cone);
            // Snow cap (top 28% of mountain)
            const sh = h * 0.28, sr = r * 0.35;
            const snow = new THREE.Mesh(new THREE.ConeGeometry(sr, sh, 7), snowMat);
            snow.position.set(x, h * 0.86, z);
            this.scene.add(snow);
        });
        // Mountain foothills
        const hillMat = new THREE.MeshLambertMaterial({ color: 0x4A6A3A });
        for (let i = 0; i < 8; i++) {
            const hx = -120 + i * 35, hz = -185;
            const hill = new THREE.Mesh(new THREE.SphereGeometry(18 + Math.random()*10, 8, 6), hillMat);
            hill.position.set(hx, 8, hz);
            hill.scale.y = 0.4;
            this.scene.add(hill);
        }
    }

    _buildOcean() {
        // South (positive Z)
        const oceanMat = new THREE.MeshLambertMaterial({ color: 0x1A72A8, transparent: true, opacity: 0.88 });
        const ocean = new THREE.Mesh(new THREE.PlaneGeometry(600, 160), oceanMat);
        ocean.rotation.x = -Math.PI / 2;
        ocean.position.set(0, -0.5, 310);
        this.scene.add(ocean);

        // Beach / shoreline
        const beachMat = new THREE.MeshLambertMaterial({ color: 0xF0DDA0 });
        const beach = new THREE.Mesh(new THREE.PlaneGeometry(600, 40), beachMat);
        beach.rotation.x = -Math.PI / 2;
        beach.position.set(0, 0.08, 232);
        this.scene.add(beach);

        // Distant water shimmer (lighter strip)
        const shimmer = new THREE.Mesh(new THREE.PlaneGeometry(600, 20),
            new THREE.MeshLambertMaterial({ color: 0x6BB8E8, transparent: true, opacity: 0.5 }));
        shimmer.rotation.x = -Math.PI / 2;
        shimmer.position.set(0, -0.1, 370);
        this.scene.add(shimmer);

        // Cliffs on beach edges
        const cliffMat = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
        [-200, 200].forEach(cx => {
            const cliff = new THREE.Mesh(new THREE.BoxGeometry(30, 18, 50), cliffMat);
            cliff.position.set(cx, 9, 230);
            this.scene.add(cliff);
        });
    }

    _buildFields() {
        // East (positive X) – farm fields
        this._plane(0xC8A428, 90, 140, 195, 0.03, 10);   // wheat
        this._plane(0x7DAA44, 60,  90, 215, 0.04, -40);  // vegetable field
        this._plane(0xBBA020, 50,  60, 220, 0.05, 60);   // barley

        // Farmland rows (dark stripes)
        for (let i = 0; i < 10; i++) {
            const strip = new THREE.Mesh(
                new THREE.PlaneGeometry(0.5, 130),
                new THREE.MeshLambertMaterial({ color: 0x6B5530 })
            );
            strip.rotation.x = -Math.PI / 2;
            strip.position.set(155 + i * 8, 0.04, 10);
            this.scene.add(strip);
        }

        // Haystacks
        const hayMat = new THREE.MeshLambertMaterial({ color: 0xD4A017 });
        [[175,-20],[190,35],[210,-5],[225,55],[170,70]].forEach(([hx,hz]) => {
            const hay = new THREE.Mesh(new THREE.CylinderGeometry(2,2.5,3,8), hayMat);
            hay.position.set(hx, 1.5, hz);
            this.scene.add(hay);
            // Cone top
            const top = new THREE.Mesh(new THREE.ConeGeometry(2.2,1.5,8), hayMat);
            top.position.set(hx, 3.75, hz);
            this.scene.add(top);
        });

        // Scarecrow
        const sc_x = 180, sc_z = 20;
        const scBody = new THREE.Mesh(new THREE.BoxGeometry(0.5,1.4,0.5), new THREE.MeshLambertMaterial({color:0x8B4513}));
        scBody.position.set(sc_x, 1.4, sc_z);
        this.scene.add(scBody);
        const scHead = new THREE.Mesh(new THREE.BoxGeometry(0.7,0.7,0.7), new THREE.MeshLambertMaterial({color:0xDEB887}));
        scHead.position.set(sc_x, 2.5, sc_z);
        this.scene.add(scHead);
        const scArm = new THREE.Mesh(new THREE.BoxGeometry(2.5,0.2,0.2), new THREE.MeshLambertMaterial({color:0x8B4513}));
        scArm.position.set(sc_x, 1.8, sc_z);
        this.scene.add(scArm);
        // Hat
        const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.5,0.6,8), new THREE.MeshLambertMaterial({color:0x2C2C2C}));
        hat.position.set(sc_x, 3.0, sc_z);
        this.scene.add(hat);

        // Field fence line
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
        // Extra trees along west border to reinforce "forest is west"
        const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5C3A1A });
        const treeMat  = new THREE.MeshLambertMaterial({ color: 0x1A4A10 });
        const positions = [
            [-130,40],[-138,-5],[-135,65],[-145,20],[-140,-30],
            [-125,-50],[-150,80],[-155,0],[-148,50],[-135,100],
        ];
        positions.forEach(([x,z]) => {
            const sc = 0.9 + Math.random()*0.5;
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4*sc,0.5*sc,3.5*sc,7), trunkMat);
            trunk.position.set(x, 1.75*sc, z);
            this.scene.add(trunk);
            const foliage = new THREE.Mesh(new THREE.SphereGeometry(2.5*sc,7,6), treeMat);
            foliage.position.set(x, 5*sc, z);
            foliage.castShadow = true;
            this.scene.add(foliage);
        });
    }

    /* ================================================================
       VILLAGE
       ================================================================ */
    _buildVillage() {
        // Well (center landmark)
        this._cylinder(0.45, 0.45, 1.1, 0x6B6B6B, 0, 0.55, 0, 10);
        this._cylinder(0.50, 0.50, 0.18, 0x5C4A32, 0, 1.18, 0, 10);
        // Well cross-beam
        const wb = new THREE.Mesh(new THREE.BoxGeometry(1.4,0.15,0.15), new THREE.MeshLambertMaterial({color:0x5C4A32}));
        wb.position.set(0, 1.6, 0);
        this.scene.add(wb);

        // Buildings (larger than v1)
        this._house( 13, 0, -9,  10, 5.5,  8, 0xD4956A, 0x8B4513, 'Inn',     0);
        this._house(-15, 0, -9,   9, 5.0,  7, 0x8B7355, 0x5C3A1A, 'Forge',   1);
        this._house(  9, 0, 13,   8, 4.8,  7, 0xDEB887, 0x7B3910, 'Bakery',  2);
        this._house(-11, 0,-21,  10, 6.0,  9, 0xB8860B, 0x6B4C11, 'Mayor',   0);
        this._house( 18, 0, 15,   8, 4.8,  7, 0xC4A882, 0x8B4513, null,      1);
        this._house(-18, 0, 15,   8, 4.8,  7, 0xD2B48C, 0x6B3A10, null,      2);
        this._house(  0, 0,-23,   8, 4.8,  7, 0xBDB76B, 0x8B4513, null,      0);
        this._house( -5, 0,-33,   8, 6.0,  8, 0xE8D5B7, 0x8B6914, 'Mill',    1);
        this._house( 24, 0, -6,   8, 4.8,  7, 0xCC5555, 0x8B2222, 'Butcher', 2);
        this._windmill(-5, 7.5, -33);

        // Market stalls
        this._stall( 2, 0, 19);
        this._stall(-5, 0, 21);
        this._stall( 9, 0, 21);

        // Village fence
        this._fence();

        // Lamp posts
        [[6,0],[-6,0],[0,6],[0,-6]].forEach(([lx,lz]) => {
            if (isNaN(lx)) return;
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.10,3,6),
                new THREE.MeshLambertMaterial({color:0x333333}));
            post.position.set(lx, 1.5, lz);
            this.scene.add(post);
            const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.25,8,6),
                new THREE.MeshLambertMaterial({color:0xFFEE88, emissive:0xFFCC00, emissiveIntensity:0.8}));
            lamp.position.set(lx, 3.2, lz);
            this.scene.add(lamp);
            const pl = new THREE.PointLight(0xFFDD88, 0.8, 10);
            pl.position.set(lx, 3.2, lz);
            this.scene.add(pl);
        });
    }

    /* ----------------------------------------------------------------
       DETAILED HOUSE – enterable through front doorway
       Door gap in south (front) wall; wall colliders leave gap open.
       ---------------------------------------------------------------- */
    _house(cx, y, cz, w, h, d, wallColor, roofColor, sign, variant) {
        const wallMat  = new THREE.MeshLambertMaterial({ color: wallColor });
        const roofMat  = new THREE.MeshLambertMaterial({ color: roofColor });
        const doorMat  = new THREE.MeshLambertMaterial({ color: 0x2C1000 });
        const frameMat = new THREE.MeshLambertMaterial({ color: 0x6B3A1A });
        const winMat   = new THREE.MeshLambertMaterial({ color: 0xAADDFF, emissive:0x223344, emissiveIntensity:0.35 });
        const winFrameMat = new THREE.MeshLambertMaterial({ color: 0x5C3A1A });
        const beamMat  = new THREE.MeshLambertMaterial({ color: 0x6B4520 });
        const wt = 0.38;            // wall thickness
        const doorW = 1.5, doorH = 2.4;

        /* ---- South wall (front) – split around door ---- */
        // Left section
        const leftW = (w - doorW) / 2;
        this._box(cx - doorW/2 - leftW/2, y + h/2, cz + d/2,  leftW, h, wt, wallMat);
        // Right section
        this._box(cx + doorW/2 + leftW/2, y + h/2, cz + d/2,  leftW, h, wt, wallMat);
        // Above door
        this._box(cx, y + doorH + (h-doorH)/2, cz + d/2, doorW, h - doorH, wt, wallMat);

        /* ---- Doorway frame ---- */
        // Left post
        this._box(cx - doorW/2 - 0.08, y + doorH/2, cz + d/2 + 0.01, 0.14, doorH, wt*0.5, frameMat);
        // Right post
        this._box(cx + doorW/2 + 0.08, y + doorH/2, cz + d/2 + 0.01, 0.14, doorH, wt*0.5, frameMat);
        // Lintel
        this._box(cx, y + doorH + 0.1, cz + d/2 + 0.01, doorW + 0.3, 0.2, wt*0.4, frameMat);

        /* ---- Door (open/ajar look) ---- */
        // Actual door panel – positioned open (rotated to side slightly)
        {
            const dg = new THREE.Mesh(new THREE.BoxGeometry(doorW*0.95, doorH*0.95, 0.08), doorMat);
            dg.position.set(cx - doorW/2 - 0.1, y + doorH/2, cz + d/2 + 0.7);
            dg.rotation.y = -Math.PI * 0.35; // ajar
            this.scene.add(dg);
        }

        /* ---- North wall (back) ---- */
        this._box(cx, y + h/2, cz - d/2, w, h, wt, wallMat);

        /* ---- East & West walls ---- */
        this._box(cx + w/2, y + h/2, cz, wt, h, d, wallMat);
        this._box(cx - w/2, y + h/2, cz, wt, h, d, wallMat);

        /* ---- Windows with frames (sides + back) ---- */
        const mkWin = (wx, wy, wz, rotY = 0) => {
            const bg = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 0.06), winMat);
            bg.position.set(wx, wy, wz);
            bg.rotation.y = rotY;
            this.scene.add(bg);
            // Frame
            [[0,0.55,0,1.4,0.12,0.08],[0,-0.55,0,1.4,0.12,0.08],
             [0.65,0,0,0.12,1.2,0.08],[-0.65,0,0,0.12,1.2,0.08]].forEach(([fx,fy,fz,fw,fh,fd]) => {
                const f = new THREE.Mesh(new THREE.BoxGeometry(fw,fh,fd), winFrameMat);
                f.position.set(wx+fx, wy+fy, wz+fz);
                f.rotation.y = rotY;
                this.scene.add(f);
            });
        };
        // Front windows (each side of door)
        mkWin(cx - doorW/2 - leftW/2, y + h*0.56, cz + d/2 + 0.04);
        mkWin(cx + doorW/2 + leftW/2, y + h*0.56, cz + d/2 + 0.04);
        // Side windows
        mkWin(cx + w/2 + 0.04, y + h*0.55, cz, 0);  // use rotation
        mkWin(cx - w/2 - 0.04, y + h*0.55, cz, 0);

        /* ---- Roof with ridge ---- */
        const roofH = h * 0.65;
        const ridgeLen = d * 0.92;
        // Main cone/hip roof (ConeGeometry with 4 sides = pyramid)
        const roofCone = new THREE.Mesh(
            new THREE.ConeGeometry(Math.max(w, d) * 0.78, roofH, 4),
            roofMat
        );
        roofCone.position.set(cx, y + h + roofH * 0.42, cz);
        roofCone.rotation.y = Math.PI / 4;
        roofCone.castShadow = true;
        this.scene.add(roofCone);
        // Ridge beam
        const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, ridgeLen), beamMat);
        ridge.position.set(cx, y + h + roofH * 0.78, cz);
        ridge.castShadow = true;
        this.scene.add(ridge);

        /* ---- Eaves (overhanging beams) ---- */
        const eaveMat = beamMat;
        [[-1,1],[1,1],[-1,-1],[1,-1]].forEach(([sx,sz]) => {
            const eave = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, d + 0.6), eaveMat);
            eave.position.set(cx + sx*(w/2+0.15), y+h+0.15, cz);
            eave.castShadow = true;
            this.scene.add(eave);
        });

        /* ---- Chimney (right side, variant-based position) ---- */
        {
            const chCx = (variant === 1) ? cx - w/4 : cx + w/4;
            const chCz = cz - d/4;
            const chH  = roofH * 0.65;
            this._cylinder(0.35, 0.38, chH, 0x6B6B6B, chCx, y + h + chH/2, chCz, 8);
            // Chimney cap
            this._cylinder(0.48, 0.48, 0.12, 0x444444, chCx, y + h + chH + 0.06, chCz, 8);
            // Smoke (decorative spheres)
            const smokeMat = new THREE.MeshLambertMaterial({ color:0x999999, transparent:true, opacity:0.45 });
            [0,1].forEach(i => {
                const sm = new THREE.Mesh(new THREE.SphereGeometry(0.3+i*0.15, 6, 5), smokeMat);
                sm.position.set(chCx, y + h + chH + 0.6 + i*0.6, chCz);
                this.scene.add(sm);
            });
        }

        /* ---- Sign ---- */
        if (sign) {
            const sg = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.55, 0.10), frameMat);
            sg.position.set(cx, y + h * 0.78, cz + d/2 + 0.25);
            this.scene.add(sg);
        }

        /* ---- Decorative wall beams (half-timbered) ---- */
        if (variant === 0 || variant === 2) {
            const darkBeam = new THREE.MeshLambertMaterial({ color: 0x3C2010 });
            // Vertical corner beams
            [[-w/2+0.05, cz-d/2+0.05],[w/2-0.05, cz-d/2+0.05]].forEach(([bx,bz]) => {
                const vb = new THREE.Mesh(new THREE.BoxGeometry(0.14, h+0.1, 0.10), darkBeam);
                vb.position.set(bx, y+h/2, bz);
                this.scene.add(vb);
            });
            // Horizontal mid beam
            const hb = new THREE.Mesh(new THREE.BoxGeometry(w+0.1, 0.14, 0.10), darkBeam);
            hb.position.set(cx, y + h*0.52, cz - d/2 + 0.08);
            this.scene.add(hb);
        }

        /* ---- Interior furniture (visible through door) ---- */
        this._houseInterior(cx, y, cz, w, d, variant);

        /* ---- Collision: 5 wall segments (door gap in south wall) ---- */
        // South-left
        this.colliders.push({ min:{x: cx-w/2, z: cz+d/2-wt}, max:{x: cx-doorW/2, z: cz+d/2+wt} });
        // South-right
        this.colliders.push({ min:{x: cx+doorW/2, z: cz+d/2-wt}, max:{x: cx+w/2, z: cz+d/2+wt} });
        // North
        this.colliders.push({ min:{x: cx-w/2, z: cz-d/2-wt}, max:{x: cx+w/2, z: cz-d/2+wt} });
        // West
        this.colliders.push({ min:{x: cx-w/2-wt, z: cz-d/2}, max:{x: cx-w/2+wt, z: cz+d/2} });
        // East
        this.colliders.push({ min:{x: cx+w/2-wt, z: cz-d/2}, max:{x: cx+w/2+wt, z: cz+d/2} });
    }

    _houseInterior(cx, y, cz, w, d, variant) {
        const tblMat  = new THREE.MeshLambertMaterial({ color: 0x8B5E2A });
        const chairMat = new THREE.MeshLambertMaterial({ color: 0x6B4015 });
        const bedMat  = new THREE.MeshLambertMaterial({ color: 0xCC4444 });
        const floorMat = new THREE.MeshLambertMaterial({ color: 0x8B6914 });

        // Interior floor
        this._plane(0x7A5C28, w - 0.8, d - 0.8, cx, y + 0.03, cz);

        const ix = cx, iz = cz - d/4;  // inside, toward back

        if (variant === 0) {
            // Table
            this._box(ix, y + 0.85, iz, 1.6, 0.12, 0.90, tblMat);
            this._box(ix, y + 0.42, iz, 0.10, 0.84, 0.10, tblMat);  // leg
            // Chairs
            [-0.7,0.7].forEach(ox => {
                this._box(ix+ox, y+0.55, iz+0.6, 0.45, 0.10, 0.45, chairMat);
                this._box(ix+ox, y+1.0,  iz+0.84, 0.45, 0.90, 0.08, chairMat);
            });
            // Fireplace
            this._box(ix+w/2-0.5, y+0.8, iz-0.2, 0.80, 1.5, 0.35, new THREE.MeshLambertMaterial({color:0x555555}));
        } else if (variant === 1) {
            // Bed
            this._box(ix - w/4, y + 0.45, iz, 1.4, 0.45, 2.0, tblMat);
            this._box(ix - w/4, y + 0.68, iz, 1.3, 0.22, 1.8, bedMat);
            // Chest
            this._box(ix + w/4, y + 0.40, iz + 0.5, 1.0, 0.80, 0.70, new THREE.MeshLambertMaterial({color:0x5C3A1A}));
        } else {
            // Shelves + barrels (shop variant)
            this._box(ix + w/4, y + 1.2, iz - d/4, 0.25, 2.0, d*0.6, new THREE.MeshLambertMaterial({color:0x6B4520}));
            [-0.5,0,0.5].forEach(oz => {
                this._cylinder(0.25,0.28,0.60,0x6B3A1A, ix-w/4, y+0.3, iz+oz, 8);
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
        const roof = new THREE.Mesh(new THREE.BoxGeometry(4.5,0.16,3.5),
            new THREE.MeshLambertMaterial({color:0xCC4444}));
        roof.position.set(x, y+2.6, z);
        this.scene.add(roof);
        [[x-1.8,z-1.3],[x+1.8,z-1.3],[x-1.8,z+1.3],[x+1.8,z+1.3]].forEach(([px,pz]) => {
            const p = new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,2.6,6),
                new THREE.MeshLambertMaterial({color:0x6B3A1A}));
            p.position.set(px, y+1.3, pz);
            this.scene.add(p);
        });
        const tbl = new THREE.Mesh(new THREE.BoxGeometry(3.5,0.12,1.8),
            new THREE.MeshLambertMaterial({color:0x8B6914}));
        tbl.position.set(x, y+1.1, z);
        this.scene.add(tbl);
    }

    _windmill(x, y, z) {
        const mat = new THREE.MeshLambertMaterial({ color: 0x8B6914 });
        for (let i = 0; i < 4; i++) {
            const arm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 5, 0.18), mat);
            arm.position.set(x, y, z - 3.1);
            arm.rotation.z = i * Math.PI / 2;
            this.scene.add(arm);
            // Sail
            const sail = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 0.06),
                new THREE.MeshLambertMaterial({color:0xF5F0D0, transparent:true, opacity:0.85}));
            sail.position.set(x, y + (i < 2 ? (i===0?2.2:-2.2) : 0), z - 3.1 + (i < 2 ? 0 : (i===2?2.2:-2.2)));
            this.scene.add(sail);
        }
    }

    _cylinder(rt, rb, h, color, x, y, z, segs=12) {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segs),
            new THREE.MeshLambertMaterial({ color }));
        m.position.set(x, y, z);
        m.castShadow = m.receiveShadow = true;
        this.scene.add(m);
        return m;
    }

    _fence() {
        const posts = [
            [28,8],[28,-8],[28,-28],[28,28],
            [-28,8],[-28,-8],[-28,-28],[-28,28],
            [8,-28],[-8,-28],[18,-28],[-18,-28],
            [8,28],[-8,28],[18,28],[-18,28]
        ];
        const mat = new THREE.MeshLambertMaterial({ color: 0x8B6914 });
        posts.forEach(([px,pz]) => {
            const p = new THREE.Mesh(new THREE.BoxGeometry(0.22,1.6,0.22), mat);
            p.position.set(px, 0.8, pz);
            this.scene.add(p);
        });
    }

    /* ================================================================
       CASTLE
       ================================================================ */
    _buildCastle() {
        const cx = 0, cz = -120;
        const wallMat = new THREE.MeshLambertMaterial({ color: 0x7A7A7A });
        const darkMat = new THREE.MeshLambertMaterial({ color: 0x606060 });
        const roofMat = new THREE.MeshLambertMaterial({ color: 0x3E3E55 });
        const stoneMat = new THREE.MeshLambertMaterial({ color: 0x888880 });

        const wall = (x, y, z, w, h, d, addCollider = true) => {
            const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), wallMat);
            m.position.set(x, y+h/2, z);
            m.castShadow = m.receiveShadow = true;
            this.scene.add(m);
            if (addCollider && (w>2||d>2)) {
                this.colliders.push({ min:{x:x-w/2,z:z-d/2}, max:{x:x+w/2,z:z+d/2} });
            }
            return m;
        };

        // Outer walls (with gap for gate in south wall)
        wall(cx,       0, cz-34,  64, 14, 3);            // N
        wall(cx-32,    0, cz,     3,  14, 68);            // W
        wall(cx+32,    0, cz,     3,  14, 68);            // E
        // South wall – left half
        wall(cx-16, 0, cz+34, 28, 14, 3);
        // South wall – right half
        wall(cx+16, 0, cz+34, 28, 14, 3);

        /* ---- Castle Gate / Entrance ---- */
        // Gate arch (over entrance)
        const archMat = new THREE.MeshLambertMaterial({ color: 0x606060 });
        const arch = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 3.5), archMat);
        arch.position.set(cx, 11.5, cz+34);
        this.scene.add(arch);

        // Arch inner (darker, recessed)
        const archInner = new THREE.Mesh(new THREE.BoxGeometry(7, 4, 2),
            new THREE.MeshLambertMaterial({color:0x1A1A1A}));
        archInner.position.set(cx, 11, cz+34);
        this.scene.add(archInner);

        // Visible raised portcullis (chains visible, gate UP)
        const portMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
        for (let i = -2; i <= 2; i++) {
            // Horizontal bars (portcullis pattern, raised to top)
            const bar = new THREE.Mesh(new THREE.BoxGeometry(0.25, 6, 0.25), portMat);
            bar.position.set(cx + i*1.6, 13.5, cz+34);  // raised above arch
            this.scene.add(bar);
        }
        for (let j = 0; j < 3; j++) {
            const hbar = new THREE.Mesh(new THREE.BoxGeometry(8, 0.22, 0.25), portMat);
            hbar.position.set(cx, 11.8 + j*1.2, cz+34);
            this.scene.add(hbar);
        }

        // Open wooden doors (one each side, pushed open)
        const doorMat = new THREE.MeshLambertMaterial({ color: 0x5C3010 });
        [-1, 1].forEach(s => {
            const gd = new THREE.Mesh(new THREE.BoxGeometry(3.8, 9.5, 0.35), doorMat);
            gd.position.set(cx + s*3.5, 4.75, cz+34 - 1.0);
            gd.rotation.y = s * Math.PI * 0.38;  // doors pushed open outward
            this.scene.add(gd);
            // Door planks
            for (let p = 0; p < 5; p++) {
                const plank = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.1, 0.38),
                    new THREE.MeshLambertMaterial({color:0x3E1F00}));
                plank.position.set(cx+s*3.5, 1.0+p*1.8, cz+34-1.0);
                plank.rotation.y = s * Math.PI * 0.38;
                this.scene.add(plank);
            }
        });

        // Gate towers (flanking gate)
        [-1,1].forEach(s => {
            const gt = new THREE.Mesh(new THREE.BoxGeometry(6,18,6), wallMat);
            gt.position.set(cx + s*5, 9, cz+34+0.5);
            gt.castShadow = gt.receiveShadow = true;
            this.scene.add(gt);
            const gtRoof = new THREE.Mesh(new THREE.ConeGeometry(4,5,4), roofMat);
            gtRoof.position.set(cx+s*5, 20.5, cz+34+0.5);
            gtRoof.rotation.y = Math.PI/4;
            this.scene.add(gtRoof);
        });

        // Drawbridge (flat wooden platform over moat impression)
        const drawbridge = new THREE.Mesh(new THREE.BoxGeometry(9,0.4,10), doorMat);
        drawbridge.position.set(cx, 0.2, cz+40);
        drawbridge.castShadow = true;
        this.scene.add(drawbridge);
        // Chains
        [-1,1].forEach(s => {
            const chain = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 10),
                new THREE.MeshLambertMaterial({color:0x444444}));
            chain.position.set(cx+s*3.5, 1, cz+40);
            chain.rotation.x = -0.2;
            this.scene.add(chain);
        });

        // Corner towers
        [[-32,-34],[32,-34],[-32,34],[32,34]].forEach(([ox,oz]) => {
            wall(cx+ox, 0, cz+oz, 8, 22, 8);
            // Battlements
            for (let j=-1;j<=1;j++) {
                const b = new THREE.Mesh(new THREE.BoxGeometry(1.6,2.2,1.6), darkMat);
                b.position.set(cx+ox+j*2.5, 23, cz+oz);
                this.scene.add(b);
                const b2 = new THREE.Mesh(new THREE.BoxGeometry(1.6,2.2,1.6), darkMat);
                b2.position.set(cx+ox, 23, cz+oz+j*2.5);
                this.scene.add(b2);
            }
            const cone = new THREE.Mesh(new THREE.ConeGeometry(5,7,4), roofMat);
            cone.position.set(cx+ox, 27, cz+oz);
            cone.rotation.y = Math.PI/4;
            this.scene.add(cone);
        });

        // Keep (central tower) + wall battlements
        wall(cx, 0, cz-10, 20, 30, 20);
        const keepRoof = new THREE.Mesh(new THREE.ConeGeometry(13,12,4), roofMat);
        keepRoof.position.set(cx, 36, cz-10);
        keepRoof.rotation.y = Math.PI/4;
        this.scene.add(keepRoof);
        // Flag on keep
        const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,6,6),
            new THREE.MeshLambertMaterial({color:0x555555}));
        flagPole.position.set(cx, 45, cz-10);
        this.scene.add(flagPole);
        const flag = new THREE.Mesh(new THREE.BoxGeometry(3,2,0.1),
            new THREE.MeshLambertMaterial({color:0xCC2222}));
        flag.position.set(cx+1.6, 47, cz-10);
        this.scene.add(flag);

        // Keep door
        const kd = new THREE.Mesh(new THREE.BoxGeometry(2.6,4.2,0.12), doorMat);
        kd.position.set(cx, 2.1, cz - 0.07);
        this.scene.add(kd);

        // Keep windows
        [[0,10,-20],[0,18,-20],[0,10,0],[0,18,0],[-10,14,-10],[10,14,-10]].forEach(([dx,dy,dz]) => {
            const wm = new THREE.Mesh(new THREE.BoxGeometry(2.2,2.8,0.16),
                new THREE.MeshLambertMaterial({color:0xAADDFF,emissive:0x334466,emissiveIntensity:0.5}));
            wm.position.set(cx+dx, dy, cz+dz-10);
            this.scene.add(wm);
        });

        // Throne room floor + furnishings
        this._plane(0x8B7355, 18, 18, cx, 0.05, cz-10);
        this._plane(0xAA2222, 3.5, 16, cx, 0.06, cz-4);  // carpet
        // Throne
        this._box(cx, 0.3, cz-17.5, 3.2, 0.5, 2.2, new THREE.MeshLambertMaterial({color:0xB8860B}));
        this._box(cx, 2.8, cz-18.5, 2.8, 4.5, 0.45, new THREE.MeshLambertMaterial({color:0xB8860B}));
        // Armrests
        [-1,1].forEach(s => {
            this._box(cx+s*1.4, 1.2, cz-17.5, 0.35, 1.8, 2.0, new THREE.MeshLambertMaterial({color:0x966200}));
        });
        // Candles
        [-4,4].forEach(s => {
            this._cylinder(0.12,0.12,1.5,0xF5F0D0, cx+s, 0.75, cz-4, 8);
            const fl = new THREE.Mesh(new THREE.ConeGeometry(0.12,0.25,6),
                new THREE.MeshLambertMaterial({color:0xFF9900,emissive:0xFF6600,emissiveIntensity:1}));
            fl.position.set(cx+s, 1.65, cz-4);
            this.scene.add(fl);
            const pt = new THREE.PointLight(0xFFAA00, 1, 10);
            pt.position.set(cx+s, 1.8, cz-4);
            this.scene.add(pt);
        });

        // Wall torch in gate passage
        {
            const torchPos = new THREE.PointLight(0xFF8800, 1.5, 15);
            torchPos.position.set(cx, 4, cz+33);
            this.scene.add(torchPos);
        }

        // Moat/ditch impression
        this._plane(0x2E5020, 80, 6, cx, -0.4, cz+37); // dry moat edge
    }

    /* ================================================================
       FOREST
       ================================================================ */
    _buildForest() {
        const fx = -90, fz = 75;
        const treeMat  = new THREE.MeshLambertMaterial({ color: 0x2D5A1B });
        const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5C3A1A });
        const darkMat  = new THREE.MeshLambertMaterial({ color: 0x1A3A0E });

        const tree = (x, z, sc = 1) => {
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35*sc,0.45*sc,3.2*sc,7), trunkMat);
            trunk.position.set(x, 1.6*sc, z);
            trunk.castShadow = true;
            this.scene.add(trunk);
            const f1 = new THREE.Mesh(new THREE.SphereGeometry(2.2*sc,7,6), sc > 1.1 ? darkMat : treeMat);
            f1.position.set(x, 4.6*sc, z);
            f1.castShadow = f1.receiveShadow = true;
            this.scene.add(f1);
            const f2 = new THREE.Mesh(new THREE.SphereGeometry(1.5*sc,6,5), treeMat);
            f2.position.set(x, 6.1*sc, z);
            this.scene.add(f2);
            this.colliders.push({ min:{x:x-1.2*sc,z:z-1.2*sc}, max:{x:x+1.2*sc,z:z+1.2*sc} });
        };

        const rng = (a, b) => a + Math.random() * (b - a);
        const positions = [];
        for (let i = 0; i < 90; i++) {
            const a = rng(0, Math.PI*2), r = rng(12, 65);
            positions.push([fx+Math.cos(a)*r, fz+Math.sin(a)*r]);
        }
        for (let i = 0; i < 12; i++) {
            positions.push([-20-i*6, 10+i*4]);
            positions.push([-22-i*6, 18+i*4]);
        }
        positions.forEach(([x,z]) => tree(x, z, 0.8 + Math.random()*0.6));

        // Goblin camp
        const gcx = -95, gcz = 80;
        this._cylinder(0.35, 0.35, 0.12, 0x333333, gcx, 0.06, gcz, 8);
        const fire = new THREE.Mesh(new THREE.ConeGeometry(0.28,0.55,6),
            new THREE.MeshLambertMaterial({color:0xFF6600,emissive:0xFF3300,emissiveIntensity:1}));
        fire.position.set(gcx, 0.38, gcz);
        this.scene.add(fire);
        const fl = new THREE.PointLight(0xFF6600, 2.5, 14);
        fl.position.set(gcx, 1, gcz);
        this.scene.add(fl);
        for (let i = 0; i < 4; i++) {
            const sh = new THREE.Mesh(new THREE.BoxGeometry(2.2,1.8,2.2),
                new THREE.MeshLambertMaterial({color:0x5C3A1A}));
            sh.position.set(gcx + Math.cos(i*1.57)*5, 0.9, gcz + Math.sin(i*1.57)*5);
            this.scene.add(sh);
        }

        // Forest floor patches
        for (let i = 0; i < 18; i++) {
            const px = fx + rng(-50,50), pz = fz + rng(-50,50);
            this._plane(0x2A4A1A, rng(2,7), rng(2,7), px, 0.02, pz);
        }
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
                    new THREE.MeshLambertMaterial({ color, emissive:color, emissiveIntensity:0.25 })
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

        addPickup(25,  15, 'sheep', 0xF0F0F0, 'sheep1');
        addPickup(-22, 20, 'sheep', 0xF0F0F0, 'sheep2');
        addPickup(30,  -5, 'sheep', 0xF0F0F0, 'sheep3');
        addPickup(-30, 25, 'sheep', 0xF0F0F0, 'sheep4');
        addPickup(5,   32, 'sheep', 0xF0F0F0, 'sheep5');

        addPickup(-78, 72, 'item_hot_sauce',  0xFF4400, 'Hot Sauce Plant');
        addPickup(8, -106, 'item_royal_socks', 0x44AA44, 'Royal Socks');
        addPickup(-100, 88, 'item_moonbloom', 0xCC88FF, 'Moonbloom1');
        addPickup(-108, 78, 'item_moonbloom', 0xCC88FF, 'Moonbloom2');
        addPickup(-95,  95, 'item_moonbloom', 0xCC88FF, 'Moonbloom3');
    }

    /* ================================================================
       AMBIENCE (rocks, flowers, details)
       ================================================================ */
    _buildAmbience() {
        const rockMat = new THREE.MeshLambertMaterial({ color: 0x888880 });
        [[18,-12],[-15,22],[35,8],[-35,-15],[60,30],[-55,45],[40,-60],[-40,50]].forEach(([x,z]) => {
            const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5+Math.random()*0.7), rockMat);
            r.position.set(x, 0.22, z);
            r.rotation.y = Math.random()*Math.PI;
            r.castShadow = true;
            this.scene.add(r);
        });

        const flowerColors = [0xFF69B4,0xFFFF00,0xFF6347,0xDA70D6,0xFF4500];
        for (let i = 0; i < 55; i++) {
            const fc = new THREE.Mesh(
                new THREE.SphereGeometry(0.16,5,4),
                new THREE.MeshLambertMaterial({ color:flowerColors[i%5], emissive:flowerColors[i%5], emissiveIntensity:0.18 })
            );
            const a = Math.random()*Math.PI*2, r = 8 + Math.random()*40;
            fc.position.set(Math.cos(a)*r, 0.19, Math.sin(a)*r);
            this.scene.add(fc);
        }

        // Log piles near forge
        const logMat = new THREE.MeshLambertMaterial({ color: 0x6B3A1A });
        for (let i = 0; i < 4; i++) {
            const log = new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.28,1.5,7), logMat);
            log.position.set(-18 + i*0.3, 0.25, -4 + i*0.3);
            log.rotation.z = Math.PI/2;
            this.scene.add(log);
        }

        // Bush clusters
        const bushMat = new THREE.MeshLambertMaterial({ color: 0x2A5A18 });
        [[22,25],[-22,-18],[12,-30],[-12,30]].forEach(([bx,bz]) => {
            if (isNaN(bx)) return;
            const bush = new THREE.Mesh(new THREE.SphereGeometry(1.2,7,5), bushMat);
            bush.position.set(bx, 0.8, bz);
            bush.scale.set(1,0.65,1);
            this.scene.add(bush);
        });
    }

    /* ================================================================
       COLLISION + INTERACTION
       ================================================================ */
    checkCollision(x, z, radius = 0.65) {
        for (const box of this.colliders) {
            if (x+radius > box.min.x && x-radius < box.max.x &&
                z+radius > box.min.z && z-radius < box.max.z) return true;
        }
        return false;
    }

    getNearbyPickup(x, z, range = 3.2) {
        for (const p of this.pickups) {
            if (p.used) continue;
            const px = p.mesh.position.x, pz = p.mesh.position.z;
            if (Math.abs(px-x) < range && Math.abs(pz-z) < range) return p;
        }
        return null;
    }

    updateSheep(dt) {
        this.sheep.forEach(s => {
            if (s.used) return;
            s._t = (s._t||0) + dt * 0.45;
            s.mesh.position.x += Math.sin(s._t + s.mesh.id*1.3) * 0.008;
            s.mesh.position.z += Math.cos(s._t*0.7 + s.mesh.id)  * 0.008;
        });
    }
}
