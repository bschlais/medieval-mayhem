/* =========================================================
   MEDIEVAL MAYHEM - 3D World Builder
   ========================================================= */

class WorldBuilder {
    constructor(scene) {
        this.scene      = scene;
        this.colliders  = [];   // { min, max } AABB boxes (x/z only)
        this.pickups    = [];   // interactable world objects { mesh, type, id, used }
        this.sheep      = [];   // sheep objects
    }

    build() {
        this._buildTerrain();
        this._buildRoads();
        this._buildVillage();
        this._buildCastle();
        this._buildForest();
        this._buildQuestItems();
        this._buildAmbience();
    }

    /* ---- Terrain ---- */
    _buildTerrain() {
        // Main ground
        const geo = new THREE.PlaneGeometry(600, 600, 40, 40);
        // Slightly vary vertex heights for gentle hills
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i), z = pos.getZ(i);
            const dist = Math.sqrt(x*x + z*z);
            if (dist > 80) {
                pos.setY(i, (Math.sin(x * 0.05) * Math.cos(z * 0.05)) * 2);
            }
        }
        geo.computeVertexNormals();
        const mat = new THREE.MeshLambertMaterial({ color: 0x4A7C3F });
        const ground = new THREE.Mesh(geo, mat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Village square (lighter stone)
        this._plane(0x8B9D6A, 30, 30, 0, 0.01, 0);
        // Castle courtyard
        this._plane(0x9E9E8A, 62, 68, 0, 0.01, -120);
        // Water (river to east)
        this._plane(0x4488BB, 18, 120, 110, -0.2, 10, 0.3);
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

    /* ---- Roads ---- */
    _buildRoads() {
        // North road (village to castle)
        this._plane(0xA89070, 8, 115, 0, 0.02, -60);
        // West-SW road (village to forest)
        const road2 = new THREE.Mesh(
            new THREE.PlaneGeometry(7, 100),
            new THREE.MeshLambertMaterial({ color: 0xA89070 })
        );
        road2.rotation.x = -Math.PI / 2;
        road2.rotation.z = 0.7;
        road2.position.set(-44, 0.02, 38);
        this.scene.add(road2);
    }

    /* ---- Village ---- */
    _buildVillage() {
        // Well (center)
        this._cylinder(0.4, 0.4, 1.0, 0x6B6B6B, 0, 0.5, 0, 8);
        this._cylinder(0.45, 0.45, 0.15, 0x5C4A32, 0, 1.1, 0, 8);

        // === Buildings ===
        // Inn (east)
        this._house(12, 0, -8, 8, 5, 6, 0xD4956A, 0xA0522D, 'Inn');
        // Blacksmith (west)
        this._house(-14, 0, -8, 7, 4.5, 5.5, 0x8B7355, 0x5C3A1A, 'Forge');
        // Bakery (SE)
        this._house(8, 0, 12, 6, 4, 5, 0xDEB887, 0x8B4513, 'Bakery');
        // Mayor's house (NW)
        this._house(-10, 0, -20, 8, 5.5, 7, 0xB8860B, 0x6B4C11, 'Mayor');
        // House 1
        this._house(16, 0, 14, 5.5, 4, 5, 0xC4A882, 0x8B4513);
        // House 2
        this._house(-16, 0, 14, 5.5, 4, 5, 0xD2B48C, 0x6B3A10);
        // House 3
        this._house(0, 0, -22, 6, 4, 5, 0xBDB76B, 0x8B4513);
        // Miller's mill (north of village)
        this._house(-5, 0, -32, 6, 6, 6, 0xE8D5B7, 0x8B6914, 'Mill');
        // Windmill arms
        this._windmill(-5, 7, -32);
        // Butcher shop
        this._house(22, 0, -5, 6, 4, 5, 0xCC5555, 0x8B2222, 'Butcher');
        // Market stalls
        this._stall(2, 0, 18);
        this._stall(-4, 0, 20);
        this._stall(8, 0, 20);

        // Fence around village pasture
        this._fence();
    }

    _house(x, y, z, w, h, d, wallColor, roofColor, sign) {
        // Walls
        const walls = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, d),
            new THREE.MeshLambertMaterial({ color: wallColor })
        );
        walls.position.set(x, y + h/2, z);
        walls.castShadow = walls.receiveShadow = true;
        this.scene.add(walls);

        // Roof (pyramid-ish via scaled box)
        const roof = new THREE.Mesh(
            new THREE.ConeGeometry(Math.max(w,d) * 0.8, h * 0.6, 4),
            new THREE.MeshLambertMaterial({ color: roofColor })
        );
        roof.position.set(x, y + h + h * 0.25, z);
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        this.scene.add(roof);

        // Door
        const door = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 1.6, 0.1),
            new THREE.MeshLambertMaterial({ color: 0x3E1F00 })
        );
        door.position.set(x, y + 0.8, z + d/2 + 0.06);
        this.scene.add(door);

        // Windows
        [-1,1].forEach(s => {
            const win = new THREE.Mesh(
                new THREE.BoxGeometry(0.7, 0.7, 0.1),
                new THREE.MeshLambertMaterial({ color: 0xAADDFF, emissive: 0x223344, emissiveIntensity: 0.3 })
            );
            win.position.set(x + s * (w/3), y + h * 0.55, z + d/2 + 0.06);
            this.scene.add(win);
        });

        // Sign
        if (sign) {
            const sg = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 0.5, 0.08),
                new THREE.MeshLambertMaterial({ color: 0x6B3A1A })
            );
            sg.position.set(x, y + h * 0.75, z + d/2 + 0.2);
            this.scene.add(sg);
        }

        // Add collider
        this.colliders.push({
            min: { x: x - w/2, z: z - d/2 },
            max: { x: x + w/2, z: z + d/2 }
        });
    }

    _stall(x, y, z) {
        // Canopy
        const roof = new THREE.Mesh(
            new THREE.BoxGeometry(4, 0.15, 3),
            new THREE.MeshLambertMaterial({ color: 0xCC4444 })
        );
        roof.position.set(x, y + 2.5, z);
        this.scene.add(roof);
        // Posts
        [[x-1.5,z-1],[x+1.5,z-1],[x-1.5,z+1],[x+1.5,z+1]].forEach(([px,pz]) => {
            const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,2.5,6), new THREE.MeshLambertMaterial({color:0x6B3A1A}));
            p.position.set(px, y+1.25, pz);
            this.scene.add(p);
        });
        // Table
        const tbl = new THREE.Mesh(new THREE.BoxGeometry(3, 0.1, 1.5), new THREE.MeshLambertMaterial({color:0x8B6914}));
        tbl.position.set(x, y+1, z);
        this.scene.add(tbl);
    }

    _windmill(x, y, z) {
        // Tower already drawn as 'mill' house; add arms
        for (let i = 0; i < 4; i++) {
            const arm = new THREE.Mesh(new THREE.BoxGeometry(0.15, 4, 0.15), new THREE.MeshLambertMaterial({color:0x8B6914}));
            arm.position.set(x + 0.2, y, z - 3.05);
            arm.rotation.z = i * Math.PI / 2;
            this.scene.add(arm);
        }
    }

    _cylinder(rt, rb, h, color, x, y, z, segs=12) {
        const m = new THREE.Mesh(
            new THREE.CylinderGeometry(rt, rb, h, segs),
            new THREE.MeshLambertMaterial({ color })
        );
        m.position.set(x, y, z);
        m.castShadow = m.receiveShadow = true;
        this.scene.add(m);
        return m;
    }

    _fence() {
        const posts = [
            [28,8],[28,-8],[28,-28],
            [-28,8],[-28,-8],[-28,-28],
            [8,-28],[-8,-28],[18,-28],[-18,-28]
        ];
        const mat = new THREE.MeshLambertMaterial({ color: 0x8B6914 });
        posts.forEach(([x,z]) => {
            const p = new THREE.Mesh(new THREE.BoxGeometry(0.2,1.5,0.2), mat);
            p.position.set(x, 0.75, z);
            this.scene.add(p);
        });
    }

    /* ---- Castle ---- */
    _buildCastle() {
        const cx = 0, cz = -120;
        const wallMat  = new THREE.MeshLambertMaterial({ color: 0x808080 });
        const stoneMat = new THREE.MeshLambertMaterial({ color: 0x696969 });
        const roofMat  = new THREE.MeshLambertMaterial({ color: 0x4A4A60 });

        const wall = (x, y, z, w, h, d) => {
            const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), wallMat);
            m.position.set(x,y+h/2,z);
            m.castShadow = m.receiveShadow = true;
            this.scene.add(m);
            if (w > 2 || d > 2) this.colliders.push({ min:{x:x-w/2,z:z-d/2}, max:{x:x+w/2,z:z+d/2} });
        };

        // Outer walls
        wall(cx, 0, cz-34, 64, 14, 3);   // N
        wall(cx, 0, cz+34, 64, 14, 3);   // S (with gate gap)
        wall(cx-32, 0, cz, 3, 14, 68);   // W
        wall(cx+32, 0, cz, 3, 14, 68);   // E

        // Gate (south wall gap + portcullis frame)
        wall(cx-16, 0, cz+34, 28, 14, 3);  // S-left
        wall(cx+16, 0, cz+34, 28, 14, 3);  // S-right
        // Gate arch top
        const arch = new THREE.Mesh(new THREE.BoxGeometry(8,4,3), wallMat);
        arch.position.set(cx, 12, cz+34);
        this.scene.add(arch);
        // Portcullis bars
        for (let i=-2;i<=2;i++) {
            const bar = new THREE.Mesh(new THREE.BoxGeometry(0.3,8,0.3), new THREE.MeshLambertMaterial({color:0x333333}));
            bar.position.set(cx + i*1.5, 4, cz+34);
            this.scene.add(bar);
        }

        // Corner towers
        [[-32,-34],[32,-34],[-32,34],[32,34]].forEach(([ox,oz]) => {
            wall(cx+ox, 0, cz+oz, 8, 22, 8);
            // Battlements
            for (let j=-1;j<=1;j++) {
                const b = new THREE.Mesh(new THREE.BoxGeometry(1.5,2,1.5), wallMat);
                b.position.set(cx+ox+j*2.5, 23, cz+oz);
                this.scene.add(b);
                const b2 = new THREE.Mesh(new THREE.BoxGeometry(1.5,2,1.5), wallMat);
                b2.position.set(cx+ox, 23, cz+oz+j*2.5);
                this.scene.add(b2);
            }
            // Tower roof
            const cone = new THREE.Mesh(new THREE.ConeGeometry(5,6,4), roofMat);
            cone.position.set(cx+ox, 26, cz+oz);
            cone.rotation.y = Math.PI/4;
            this.scene.add(cone);
        });

        // Keep (central tower)
        wall(cx, 0, cz-10, 20, 30, 20);
        const keepRoof = new THREE.Mesh(new THREE.ConeGeometry(13,10,4), roofMat);
        keepRoof.position.set(cx, 35, cz-10);
        keepRoof.rotation.y = Math.PI/4;
        this.scene.add(keepRoof);
        // Keep door
        const kd = new THREE.Mesh(new THREE.BoxGeometry(2.5,4,0.1), new THREE.MeshLambertMaterial({color:0x2C1A00}));
        kd.position.set(cx, 2, cz);
        this.scene.add(kd);
        // Keep windows
        [[0,10,-20],[0,18,-20],[0,10,0],[0,18,0]].forEach(([dx,dy,dz]) => {
            const w = new THREE.Mesh(new THREE.BoxGeometry(2,2.5,0.15), new THREE.MeshLambertMaterial({color:0xAADDFF,emissive:0x334455,emissiveIntensity:0.5}));
            w.position.set(cx+dx, dy, cz+dz-10-0.1);
            this.scene.add(w);
        });
        // Throne room inside (decorative floor)
        this._plane(0x8B7355, 16, 16, cx, 0.05, cz-10);
        // Throne
        const throneBase = new THREE.Mesh(new THREE.BoxGeometry(3, 0.5, 2), new THREE.MeshLambertMaterial({color:0xB8860B}));
        throneBase.position.set(cx, 0.25, cz-17);
        this.scene.add(throneBase);
        const throneBack = new THREE.Mesh(new THREE.BoxGeometry(2.5, 4, 0.4), new THREE.MeshLambertMaterial({color:0xB8860B}));
        throneBack.position.set(cx, 2.5, cz-18);
        this.scene.add(throneBack);
        // Red carpet
        this._plane(0xAA2222, 3, 14, cx, 0.06, cz-4);
    }

    /* ---- Forest ---- */
    _buildForest() {
        const fx = -90, fz = 75;
        const treeMat   = new THREE.MeshLambertMaterial({ color: 0x2D5A1B });
        const trunkMat  = new THREE.MeshLambertMaterial({ color: 0x5C3A1A });
        const darkMat   = new THREE.MeshLambertMaterial({ color: 0x1A3A0E });

        const tree = (x, z, scale = 1) => {
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35*scale,0.45*scale,3*scale,7), trunkMat);
            trunk.position.set(x, 1.5*scale, z);
            trunk.castShadow = true;
            this.scene.add(trunk);
            const foliage = new THREE.Mesh(new THREE.SphereGeometry(2.2*scale,7,6), scale > 1.1 ? darkMat : treeMat);
            foliage.position.set(x, 4.5*scale, z);
            foliage.castShadow = foliage.receiveShadow = true;
            this.scene.add(foliage);
            // Second layer
            const f2 = new THREE.Mesh(new THREE.SphereGeometry(1.5*scale,6,5), treeMat);
            f2.position.set(x, 6*scale, z);
            this.scene.add(f2);
            // Collider
            this.colliders.push({ min:{x:x-1.2*scale,z:z-1.2*scale}, max:{x:x+1.2*scale,z:z+1.2*scale} });
        };

        // Dense forest ring
        const rng = (a,b) => a + Math.random()*(b-a);
        const positions = [];
        for (let i=0;i<90;i++) {
            const angle = rng(0, Math.PI*2);
            const r     = rng(12, 65);
            positions.push([fx + Math.cos(angle)*r, fz + Math.sin(angle)*r]);
        }
        // Add some individual trees along the road
        for (let i=0;i<12;i++) {
            positions.push([-20-i*6, 10+i*4]);
            positions.push([-22-i*6, 18+i*4]);
        }

        positions.forEach(([x,z]) => {
            const sc = 0.8 + Math.random()*0.6;
            tree(x, z, sc);
        });

        // Goblin camp (open area in forest)
        const gcx = -95, gcz = 80;
        // Campfire
        this._cylinder(0.3,0.3,0.1,0x333333, gcx, 0.05, gcz, 8);
        const fire = new THREE.Mesh(new THREE.ConeGeometry(0.25,0.5,6), new THREE.MeshLambertMaterial({color:0xFF6600,emissive:0xFF3300,emissiveIntensity:1}));
        fire.position.set(gcx, 0.35, gcz);
        this.scene.add(fire);
        // Point light for campfire
        const fl = new THREE.PointLight(0xFF6600, 2, 12);
        fl.position.set(gcx, 1, gcz);
        this.scene.add(fl);
        // Crude structures
        for (let i=0;i<3;i++) {
            const sh = new THREE.Mesh(new THREE.BoxGeometry(2,1.5,2), new THREE.MeshLambertMaterial({color:0x5C3A1A}));
            sh.position.set(gcx + Math.cos(i*2.1)*4, 0.75, gcz + Math.sin(i*2.1)*4);
            this.scene.add(sh);
        }

        // Forest floor detail (darker patches)
        for (let i=0;i<15;i++) {
            const px = fx + rng(-50,50), pz = fz + rng(-50,50);
            this._plane(0x2A4A1A, rng(2,6), rng(2,6), px, 0.02, pz);
        }
    }

    /* ---- Quest Pickups ---- */
    _buildQuestItems() {
        const addPickup = (x,z,type,color,label) => {
            const geo  = type === 'sheep' ? null : new THREE.BoxGeometry(0.5,0.5,0.5);
            let mesh;
            if (type === 'sheep') {
                mesh = window.charBuilder.buildSheep();
                mesh.position.set(x, 0, z);
                mesh.scale.setScalar(0.7);
            } else {
                mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({color, emissive:color, emissiveIntensity:0.2}));
                mesh.position.set(x, 0.6, z);
            }
            mesh.castShadow = true;
            this.scene.add(mesh);
            const obj = { mesh, type, id: label, used: false };
            this.pickups.push(obj);
            if (type === 'sheep') this.sheep.push(obj);
            return obj;
        };

        // 5 sheep scattered
        addPickup(25,  15, 'sheep', 0xF0F0F0, 'sheep1');
        addPickup(-22, 20, 'sheep', 0xF0F0F0, 'sheep2');
        addPickup(30, -5, 'sheep', 0xF0F0F0, 'sheep3');
        addPickup(-30, 25, 'sheep', 0xF0F0F0, 'sheep4');
        addPickup(5,  32, 'sheep', 0xF0F0F0, 'sheep5');

        // Hot sauce plant (forest)
        addPickup(-78, 72, 'item_hot_sauce', 0xFF4400, 'Hot Sauce Plant');
        // Royal socks (castle kitchen area)
        addPickup(8, -106, 'item_royal_socks', 0x44AA44, 'Royal Socks');
        // Moonbloom herbs (deep forest)
        addPickup(-100, 88, 'item_moonbloom', 0xCC88FF, 'Moonbloom1');
        addPickup(-108, 78, 'item_moonbloom', 0xCC88FF, 'Moonbloom2');
        addPickup(-95,  95, 'item_moonbloom', 0xCC88FF, 'Moonbloom3');
    }

    /* ---- Ambient details ---- */
    _buildAmbience() {
        // Rocks
        const rockMat = new THREE.MeshLambertMaterial({color:0x888880});
        [[18,-12],[-15,22],[35,8],[-35,-15],[60,30],[-55,45]].forEach(([x,z]) => {
            const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5+Math.random()*0.7), rockMat);
            r.position.set(x, 0.2, z);
            r.rotation.y = Math.random()*Math.PI;
            r.castShadow = true;
            this.scene.add(r);
        });
        // Flowers
        const flowerColors = [0xFF69B4,0xFFFF00,0xFF6347,0xDA70D6];
        for (let i=0;i<40;i++) {
            const fc = new THREE.Mesh(
                new THREE.SphereGeometry(0.15,5,4),
                new THREE.MeshLambertMaterial({color:flowerColors[i%4],emissive:flowerColors[i%4],emissiveIntensity:0.2})
            );
            const angle = Math.random()*Math.PI*2;
            const r = 8 + Math.random()*35;
            fc.position.set(Math.cos(angle)*r, 0.18, Math.sin(angle)*r);
            this.scene.add(fc);
        }
    }

    /* ---- Collision check ---- */
    checkCollision(x, z, radius = 0.6) {
        for (const box of this.colliders) {
            if (x + radius > box.min.x && x - radius < box.max.x &&
                z + radius > box.min.z && z - radius < box.max.z) {
                return true;
            }
        }
        return false;
    }

    /* ---- Pickup interaction ---- */
    getNearbyPickup(x, z, range = 3) {
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
            s._t = (s._t || 0) + dt * 0.5;
            s.mesh.position.x += Math.sin(s._t + s.mesh.id * 1.3) * 0.01;
            s.mesh.position.z += Math.cos(s._t * 0.7 + s.mesh.id) * 0.01;
        });
    }
}
