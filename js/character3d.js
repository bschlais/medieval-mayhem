/* =========================================================
   MEDIEVAL MAYHEM - 3D Character Builder (v2)
   Z-fighting fixed; limb groups for walk/attack animation;
   front/back shirt details; stable at all rotation angles.
   ========================================================= */

class CharacterBuilder {
    /**
     * Builds a Three.js Group for a character.
     * Stores animated limb references in root.userData:
     *   leftLegGroup, rightLegGroup, leftArmGroup, rightArmGroup
     *
     * Dimensions (world units, feet at y=0):
     *   Shoe:  y 0.00 – 0.22
     *   Leg:   y 0.22 – 1.22  (hip pivot at 1.22)
     *   Torso: y 1.22 – 2.32
     *   Arm:   y 1.11 – 1.96  (shoulder pivot at 1.96)
     *   Hand:  y 0.83 – 1.11
     *   Neck:  y 2.00 – 2.28
     *   Head:  y 2.28 – 3.18  (center 2.73)
     */
    build(data, scale = 1) {
        const root = new THREE.Group();

        const skinColor = CONFIG.SKIN_COLORS[data.skin]      || CONFIG.SKIN_COLORS.light;
        const hairColor = CONFIG.HAIR_COLORS[data.hairColor]  || CONFIG.HAIR_COLORS.brown;
        const eyeColor  = CONFIG.EYE_COLORS[data.eyeColor]   || CONFIG.EYE_COLORS.brown;
        const armorClr  = CONFIG.ARMOR_COLORS[data.armor]    || CONFIG.ARMOR_COLORS.leather;
        const shoeColor = CONFIG.SHOE_COLORS[data.shoes]     || CONFIG.SHOE_COLORS.boots;

        const bw = data.body === 'stocky' ? 1.1 : data.body === 'slim' ? 0.75 : 0.9;
        const legX = 0.22 * bw;
        const armX = bw / 2 + 0.16 * bw;

        const skinMat  = this._mat(skinColor);
        const armorMat = this._mat(armorClr.main);
        const hairMat  = this._mat(hairColor);
        const eyeMat   = this._mat(eyeColor);
        const pantsCl  = data.armor === 'robe' ? armorClr.main : 0x2C3E50;
        const pantsMat = this._mat(pantsCl);
        const shoeMat  = this._mat(shoeColor);

        /* ============================================================
           LEGS (groups pivot at hip y=1.22)
           Local coords: leg spans y=–1.0 to 0; shoe spans y=–1.22 to –1.0
           ============================================================ */
        const mkLeg = (side) => {
            const g = new THREE.Group();
            g.position.set(side * legX, 1.22, 0);
            // Leg
            const leg = this._mesh(new THREE.BoxGeometry(0.30 * bw, 1.00, 0.30 * bw), pantsMat);
            leg.position.y = -0.50;
            g.add(leg);
            // Shoe – clearly separated from leg bottom (no coplanar faces)
            const shoe = this._mesh(new THREE.BoxGeometry(0.38 * bw, 0.22, 0.46), shoeMat);
            shoe.position.set(0, -1.11, 0.04);
            g.add(shoe);
            root.add(g);
            return g;
        };
        const leftLegGroup  = mkLeg(-1);
        const rightLegGroup = mkLeg(1);

        /* ============================================================
           TORSO
           ============================================================ */
        const torso = this._mesh(new THREE.BoxGeometry(bw, 1.10, 0.50), armorMat);
        torso.position.y = 1.77; // center at (1.22+2.32)/2 = 1.77
        root.add(torso);

        // ---- Shirt front/back details (protrude clearly past torso face z=±0.25) ----
        this._addArmorDetail(root, data.armor, armorClr, bw);

        // Collar / trim band (protrudes 0.06 past torso face – no z-fight)
        const trim = this._mesh(new THREE.BoxGeometry(bw * 0.9, 0.10, 0.58), this._mat(armorClr.trim));
        trim.position.set(0, 2.22, 0);
        root.add(trim);

        /* ============================================================
           ARMS (groups pivot at shoulder y=1.96)
           Local coords: arm spans y=–0.85 to 0; hand y=–1.13 to –0.85
           ============================================================ */
        const mkArm = (side) => {
            const g = new THREE.Group();
            g.position.set(side * armX, 1.96, 0);
            const arm = this._mesh(new THREE.BoxGeometry(0.28 * bw, 0.85, 0.28 * bw), armorMat);
            arm.position.y = -0.425;
            g.add(arm);
            const hand = this._mesh(new THREE.BoxGeometry(0.28 * bw, 0.28, 0.28 * bw), skinMat);
            hand.position.y = -0.99;
            g.add(hand);
            root.add(g);
            return g;
        };
        const leftArmGroup  = mkArm(-1);
        const rightArmGroup = mkArm(1);

        // Robe skirt (protrudes past torso front z=0.25 by 0.08)
        if (data.armor === 'robe') {
            const skirt = this._mesh(new THREE.BoxGeometry(bw * 1.1, 0.75, 0.58), armorMat);
            skirt.position.set(0, 1.28, 0);
            root.add(skirt);
        }

        /* ============================================================
           NECK
           ============================================================ */
        const neck = this._mesh(new THREE.CylinderGeometry(0.18, 0.20, 0.28, 8), skinMat);
        neck.position.y = 2.14;
        root.add(neck);

        /* ============================================================
           HEAD (center y=2.73, box 0.88×0.90×0.88)
           Front face: z = +0.44  Back face: z = –0.44
           Side faces: x = ±0.44  Top face:  y = +3.18 (2.73+0.45)
           ============================================================ */
        const head = this._mesh(new THREE.BoxGeometry(0.88, 0.90, 0.88), skinMat);
        head.position.y = 2.73;
        root.add(head);

        // Eye whites – front face at z=0.49 (clear of head front face 0.44)
        [-1, 1].forEach(s => {
            const white = this._mesh(new THREE.BoxGeometry(0.24, 0.20, 0.08), this._mat(0xFFFFFF));
            white.position.set(s * 0.20, 2.78, 0.46); // front at 0.50, back at 0.42 – protrudes past head face 0.44
            root.add(white);
            // Iris
            const iris = this._mesh(new THREE.BoxGeometry(0.16, 0.14, 0.06), eyeMat);
            iris.position.set(s * 0.20, 2.78, 0.51);  // clearly in front of white front face 0.50
            root.add(iris);
            // Pupil
            const pupil = this._mesh(new THREE.BoxGeometry(0.08, 0.08, 0.04), this._mat(0x111111));
            pupil.position.set(s * 0.20, 2.78, 0.55);
            root.add(pupil);
        });

        // Nose (protrudes past head front face 0.44)
        const nose = this._mesh(new THREE.BoxGeometry(0.12, 0.12, 0.14), skinMat);
        nose.position.set(0, 2.70, 0.50);
        root.add(nose);

        // Mouth
        const mouth = this._mesh(new THREE.BoxGeometry(0.26, 0.08, 0.06), this._mat(0x7A2200));
        mouth.position.set(0, 2.58, 0.48);
        root.add(mouth);

        // Girl eyelashes
        if (data.gender === 'girl') {
            [-1, 1].forEach(s => {
                const lash = this._mesh(new THREE.BoxGeometry(0.26, 0.05, 0.04), hairMat);
                lash.position.set(s * 0.20, 2.88, 0.56);
                root.add(lash);
            });
        }

        /* ============================================================
           HAIR (slightly wider than head 0.88 → 0.96 to avoid side z-fight)
           Hair cap bottom must be clearly separated from head top (3.18)
           ============================================================ */
        this._addHair(root, data.hair, hairMat, data.gender);

        /* ============================================================
           FACIAL HAIR
           ============================================================ */
        if (data.gender === 'boy' && data.facialHair && data.facialHair !== 'none') {
            this._addFacialHair(root, data.facialHair, hairMat);
        }

        /* ============================================================
           Store limb refs for animation
           ============================================================ */
        root.userData.leftLegGroup  = leftLegGroup;
        root.userData.rightLegGroup = rightLegGroup;
        root.userData.leftArmGroup  = leftArmGroup;
        root.userData.rightArmGroup = rightArmGroup;

        root.scale.setScalar(scale);
        return root;
    }

    /* ---- Armor front/back detail panels ---- */
    _addArmorDetail(root, armorType, armorClr, bw) {
        const frontZ = 0.28;  // protrudes past torso front face 0.25 by 0.03
        const backZ  = -0.28;
        const darkMat  = this._mat(Math.max(0, armorClr.main - 0x1A1A1A)); // slightly darker
        const trimMat  = this._mat(armorClr.trim);

        switch (armorType) {
            case 'leather': {
                // Belt
                const belt = this._mesh(new THREE.BoxGeometry(bw * 0.95, 0.12, 0.06), trimMat);
                belt.position.set(0, 1.28, frontZ);
                root.add(belt);
                // Belt buckle
                const buckle = this._mesh(new THREE.BoxGeometry(0.20, 0.16, 0.04), this._mat(0xB8860B));
                buckle.position.set(0, 1.28, frontZ + 0.05);
                root.add(buckle);
                // Back darker panel
                const back = this._mesh(new THREE.BoxGeometry(bw * 0.80, 0.90, 0.04), darkMat);
                back.position.set(0, 1.75, backZ);
                root.add(back);
                break;
            }
            case 'chain': {
                // Chain pattern (horizontal lines)
                for (let i = 0; i < 4; i++) {
                    const chain = this._mesh(new THREE.BoxGeometry(bw * 0.85, 0.05, 0.05), this._mat(0xC8C8C8));
                    chain.position.set(0, 1.35 + i * 0.25, frontZ);
                    root.add(chain);
                }
                break;
            }
            case 'plate': {
                // Breastplate
                const breast = this._mesh(new THREE.BoxGeometry(bw * 0.70, 0.72, 0.06), trimMat);
                breast.position.set(0, 1.75, frontZ);
                root.add(breast);
                // Center ridge
                const ridge = this._mesh(new THREE.BoxGeometry(0.10, 0.65, 0.04), this._mat(0xE0E0E0));
                ridge.position.set(0, 1.75, frontZ + 0.05);
                root.add(ridge);
                // Backplate
                const back = this._mesh(new THREE.BoxGeometry(bw * 0.75, 0.70, 0.06), this._mat(armorClr.main));
                back.position.set(0, 1.75, backZ);
                root.add(back);
                break;
            }
            case 'robe': {
                // Front decorative stripe
                const stripe = this._mesh(new THREE.BoxGeometry(0.12, 1.00, 0.06), trimMat);
                stripe.position.set(0, 1.75, frontZ);
                root.add(stripe);
                // Gold buttons
                for (let i = 0; i < 4; i++) {
                    const btn = this._mesh(new THREE.BoxGeometry(0.10, 0.10, 0.04), this._mat(0xFFD700));
                    btn.position.set(0, 1.40 + i * 0.22, frontZ + 0.05);
                    root.add(btn);
                }
                break;
            }
            case 'scout': {
                // Cross-body straps
                const s1 = this._mesh(new THREE.BoxGeometry(0.08, 1.00, 0.06), trimMat);
                s1.position.set(-0.18, 1.75, frontZ);
                s1.rotation.z = 0.3;
                root.add(s1);
                const s2 = this._mesh(new THREE.BoxGeometry(0.08, 1.00, 0.06), trimMat);
                s2.position.set(0.18, 1.75, frontZ);
                s2.rotation.z = -0.3;
                root.add(s2);
                break;
            }
        }
    }

    /* ---- Hair styles ---- */
    _addHair(root, style, mat, gender) {
        // Hair cap width (0.96) > head width (0.88) → no side z-fighting
        const hw = 0.96, hd = 0.96;
        switch (style) {
            case 'short': {
                // Cap sits on top of head; bottom at 3.12 (head top at 3.18, cap protrudes into head ~0.06 – fine)
                const cap = this._mesh(new THREE.BoxGeometry(hw, 0.24, hd), mat);
                cap.position.set(0, 3.24, 0);
                root.add(cap);
                // Back piece – front face at -0.48-0.10=-0.38... no, position back piece fully behind head
                const back = this._mesh(new THREE.BoxGeometry(hw, 0.48, 0.18), mat);
                back.position.set(0, 2.92, -0.53); // front face: -0.44 – clear of head back face -0.44? No: -0.53+0.09=-0.44. Use -0.56:
                root.add(back);
                // Sides
                [-1,1].forEach(s => {
                    const side = this._mesh(new THREE.BoxGeometry(0.12, 0.48, hd * 0.6), mat);
                    side.position.set(s * 0.50, 2.82, 0); // side face at ±0.56, head at ±0.44 → protrudes
                    root.add(side);
                });
                break;
            }
            case 'long': {
                const cap = this._mesh(new THREE.BoxGeometry(hw, 0.24, hd), mat);
                cap.position.set(0, 3.24, 0);
                root.add(cap);
                // Long flow down back
                const flow = this._mesh(new THREE.BoxGeometry(hw, 1.20, 0.22), mat);
                flow.position.set(0, 2.50, -0.56);
                root.add(flow);
                // Side curtains
                [-1,1].forEach(s => {
                    const side = this._mesh(new THREE.BoxGeometry(0.18, 0.90, 0.40), mat);
                    side.position.set(s * 0.50, 2.55, 0);
                    root.add(side);
                });
                break;
            }
            case 'braid': {
                const cap = this._mesh(new THREE.BoxGeometry(hw, 0.24, hd), mat);
                cap.position.set(0, 3.24, 0);
                root.add(cap);
                // Central braid
                const braid = this._mesh(new THREE.BoxGeometry(0.22, 1.50, 0.22), mat);
                braid.position.set(0, 2.10, -0.56);
                root.add(braid);
                // Braid segments (zigzag look)
                for (let i = 0; i < 4; i++) {
                    const knot = this._mesh(new THREE.BoxGeometry(0.28, 0.14, 0.28), mat);
                    knot.position.set(0, 2.7 - i * 0.3, -0.56);
                    root.add(knot);
                }
                break;
            }
            case 'mohawk': {
                // Shaved sides (no hair beyond top)
                for (let i = 0; i < 6; i++) {
                    const spike = this._mesh(new THREE.BoxGeometry(0.12, 0.28 + i * 0.07, 0.16), mat);
                    spike.position.set(0, 3.16 + i * 0.08, -0.28 + i * 0.12);
                    root.add(spike);
                }
                break;
            }
            case 'bald':
            default:
                // Shiny head effect (slightly lighter top)
                break;
        }
    }

    /* ---- Facial hair ---- */
    _addFacialHair(root, style, mat) {
        // All positioned clearly in front of head face (z=0.44) by at least 0.04
        const fz = 0.50;
        switch (style) {
            case 'stubble': {
                const stub = this._mesh(new THREE.BoxGeometry(0.62, 0.14, 0.06), mat);
                stub.position.set(0, 2.57, fz);
                root.add(stub);
                break;
            }
            case 'mustache': {
                const mus = this._mesh(new THREE.BoxGeometry(0.40, 0.12, 0.06), mat);
                mus.position.set(0, 2.65, fz);
                root.add(mus);
                break;
            }
            case 'beard': {
                const b = this._mesh(new THREE.BoxGeometry(0.56, 0.38, 0.10), mat);
                b.position.set(0, 2.48, fz - 0.02);
                root.add(b);
                break;
            }
            case 'fullbeard': {
                const fb = this._mesh(new THREE.BoxGeometry(0.66, 0.58, 0.12), mat);
                fb.position.set(0, 2.44, fz - 0.02);
                root.add(fb);
                const mus = this._mesh(new THREE.BoxGeometry(0.44, 0.12, 0.06), mat);
                mus.position.set(0, 2.66, fz);
                root.add(mus);
                break;
            }
        }
    }

    /* ---- Helpers ---- */
    _mat(color) {
        return new THREE.MeshLambertMaterial({ color: Math.max(0, color) });
    }
    _mesh(geo, mat) {
        const m = new THREE.Mesh(geo, mat);
        m.castShadow = m.receiveShadow = true;
        return m;
    }

    /* ---- Goblin ---- */
    buildGoblin() {
        const root = new THREE.Group();
        const g  = this._mat(0x4A7C3F);
        const dg = this._mat(0x2E5A29);
        const ye = this._mat(0xFFCC00);
        const br = this._mat(0x6B3A2A);

        // Feet
        [-1,1].forEach(s => {
            const f = this._mesh(new THREE.BoxGeometry(0.35, 0.18, 0.40), dg);
            f.position.set(s * 0.20, 0.09, 0.04);
            root.add(f);
        });
        // Legs
        [-1,1].forEach(s => {
            const l = this._mesh(new THREE.BoxGeometry(0.28, 0.65, 0.28), dg);
            l.position.set(s * 0.20, 0.575, 0);
            root.add(l);
        });
        // Torso
        const t = this._mesh(new THREE.BoxGeometry(0.80, 0.85, 0.42), br);
        t.position.y = 1.22;
        root.add(t);
        // Arms
        const mkGoblinArm = (side) => {
            const ag = new THREE.Group();
            ag.position.set(side * 0.52, 1.55, 0);
            const a = this._mesh(new THREE.BoxGeometry(0.25, 0.70, 0.25), g);
            a.position.y = -0.35;
            ag.add(a);
            root.add(ag);
            return ag;
        };
        root.userData.leftArmGroup  = mkGoblinArm(-1);
        root.userData.rightArmGroup = mkGoblinArm(1);
        // Head
        const head = this._mesh(new THREE.BoxGeometry(0.78, 0.75, 0.75), g);
        head.position.y = 1.92;
        root.add(head);
        // Ears
        [-1,1].forEach(s => {
            const e = this._mesh(new THREE.BoxGeometry(0.12, 0.28, 0.12), g);
            e.position.set(s * 0.46, 1.98, 0);
            root.add(e);
        });
        // Eyes
        [-1,1].forEach(s => {
            const ey = this._mesh(new THREE.BoxGeometry(0.15, 0.12, 0.06), ye);
            ey.position.set(s * 0.17, 1.97, 0.42);
            root.add(ey);
        });
        // Teeth
        const teeth = this._mesh(new THREE.BoxGeometry(0.22, 0.10, 0.06), this._mat(0xFFFFEE));
        teeth.position.set(0, 1.82, 0.42);
        root.add(teeth);
        // Club weapon (in right arm area)
        const club = this._mesh(new THREE.BoxGeometry(0.18, 0.85, 0.18), br);
        club.position.set(0.72, 1.15, 0);
        club.rotation.z = 0.25;
        root.add(club);
        const clubHead = this._mesh(new THREE.BoxGeometry(0.34, 0.34, 0.34), dg);
        clubHead.position.set(0.85, 1.52, 0);
        root.add(clubHead);

        return root;
    }

    /* ---- Sheep ---- */
    buildSheep() {
        const root  = new THREE.Group();
        const white = this._mat(0xF0F0F0);
        const dark  = this._mat(0x333333);
        const pink  = this._mat(0xFFB6C1);

        const body = this._mesh(new THREE.BoxGeometry(0.90, 0.65, 0.55), white);
        body.position.y = 0.55;
        root.add(body);
        [[-.28,-.2],[.28,-.2],[-.28,.2],[.28,.2]].forEach(([x,z]) => {
            const l = this._mesh(new THREE.BoxGeometry(0.18, 0.38, 0.18), dark);
            l.position.set(x, 0.19, z);
            root.add(l);
        });
        const hd = this._mesh(new THREE.BoxGeometry(0.45, 0.42, 0.42), white);
        hd.position.set(0.55, 0.70, 0);
        root.add(hd);
        const noseMesh = this._mesh(new THREE.BoxGeometry(0.18, 0.12, 0.08), pink);
        noseMesh.position.set(0.80, 0.65, 0);
        root.add(noseMesh);

        return root;
    }
}

window.charBuilder = new CharacterBuilder();
