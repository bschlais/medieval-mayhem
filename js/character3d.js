/* =========================================================
   MEDIEVAL MAYHEM - 3D Character Builder
   ========================================================= */

class CharacterBuilder {
    /**
     * Builds a Three.js Group representing a character.
     * data = { gender, body, skin, hair, hairColor, eyeColor, facialHair, armor, shoes }
     */
    build(data, scale = 1) {
        const root = new THREE.Group();

        const skinColor  = CONFIG.SKIN_COLORS[data.skin]    || CONFIG.SKIN_COLORS.light;
        const hairColor  = CONFIG.HAIR_COLORS[data.hairColor] || CONFIG.HAIR_COLORS.brown;
        const eyeColor   = CONFIG.EYE_COLORS[data.eyeColor]  || CONFIG.EYE_COLORS.brown;
        const armorClr   = CONFIG.ARMOR_COLORS[data.armor]   || CONFIG.ARMOR_COLORS.leather;
        const shoeColor  = CONFIG.SHOE_COLORS[data.shoes]    || CONFIG.SHOE_COLORS.boots;

        // Body proportions
        const bw = data.body === 'stocky' ? 1.1 : data.body === 'slim' ? 0.75 : 0.9; // width
        const skinMat  = this._mat(skinColor);
        const armorMat = this._mat(armorClr.main);
        const trimMat  = this._mat(armorClr.trim);
        const hairMat  = this._mat(hairColor);
        const eyeMat   = this._mat(eyeColor);
        const pantsColor = data.armor === 'robe' ? armorClr.main : 0x2C3E50;
        const pantsMat = this._mat(pantsColor);
        const shoeMat  = this._mat(shoeColor);
        const mouthMat = this._mat(0x8B2500);

        // === SHOES / FEET ===
        [-1,1].forEach(s => {
            const shoe = this._mesh(new THREE.BoxGeometry(0.38*bw, 0.22, 0.45), shoeMat);
            shoe.position.set(s * 0.22 * bw, 0.11, 0.05);
            root.add(shoe);
        });

        // === LEGS ===
        [-1,1].forEach(s => {
            const leg = this._mesh(new THREE.BoxGeometry(0.3*bw, 0.9, 0.3*bw), pantsMat);
            leg.position.set(s * 0.22 * bw, 0.78, 0);
            root.add(leg);
        });

        // === TORSO ===
        const torso = this._mesh(new THREE.BoxGeometry(bw, 1.1, 0.5), armorMat);
        torso.position.y = 1.55;
        root.add(torso);

        // Armor trim stripe
        const trim = this._mesh(new THREE.BoxGeometry(bw * 0.9, 0.1, 0.52), trimMat);
        trim.position.set(0, 1.8, 0);
        root.add(trim);

        // === ARMS ===
        [-1,1].forEach(s => {
            const arm = this._mesh(new THREE.BoxGeometry(0.28*bw, 0.85, 0.28*bw), armorMat);
            arm.position.set(s * (bw/2 + 0.14*bw), 1.53, 0);
            root.add(arm);
            // Hands
            const hand = this._mesh(new THREE.BoxGeometry(0.28*bw, 0.28, 0.28*bw), skinMat);
            hand.position.set(s * (bw/2 + 0.14*bw), 1.05, 0);
            root.add(hand);
        });

        // Robe skirt overlay
        if (data.armor === 'robe') {
            const skirt = this._mesh(new THREE.BoxGeometry(bw * 1.1, 0.7, 0.55), armorMat);
            skirt.position.set(0, 1.15, 0);
            root.add(skirt);
        }

        // === NECK ===
        const neck = this._mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.28, 8), skinMat);
        neck.position.y = 2.14;
        root.add(neck);

        // === HEAD ===
        const head = this._mesh(new THREE.BoxGeometry(0.88, 0.9, 0.88), skinMat);
        head.position.y = 2.73;
        root.add(head);

        // Eyes
        [-1,1].forEach(s => {
            const eye = this._mesh(new THREE.BoxGeometry(0.16, 0.12, 0.08), eyeMat);
            eye.position.set(s * 0.2, 2.78, 0.44);
            root.add(eye);
            // Eyewhite
            const white = this._mesh(new THREE.BoxGeometry(0.22, 0.18, 0.06), this._mat(0xFFFFFF));
            white.position.set(s * 0.2, 2.78, 0.42);
            root.add(white);
            eye.position.z = 0.46;
        });

        // Mouth
        const mouth = this._mesh(new THREE.BoxGeometry(0.25, 0.07, 0.06), mouthMat);
        mouth.position.set(0, 2.58, 0.45);
        root.add(mouth);

        // Nose
        const nose = this._mesh(new THREE.BoxGeometry(0.12, 0.1, 0.12), skinMat);
        nose.position.set(0, 2.68, 0.47);
        root.add(nose);

        // === HAIR ===
        this._addHair(root, data.hair, hairMat, data.gender);

        // === FACIAL HAIR ===
        if (data.gender === 'boy' && data.facialHair && data.facialHair !== 'none') {
            this._addFacialHair(root, data.facialHair, hairMat);
        }

        // === GIRL-SPECIFIC: eyelashes ===
        if (data.gender === 'girl') {
            [-1,1].forEach(s => {
                const lash = this._mesh(new THREE.BoxGeometry(0.24, 0.04, 0.04), this._mat(hairColor));
                lash.position.set(s * 0.2, 2.86, 0.46);
                root.add(lash);
            });
        }

        root.scale.setScalar(scale);
        return root;
    }

    _addHair(root, style, mat, gender) {
        const hx = 0.88, hz = 0.88;
        switch (style) {
            case 'short': {
                const top = this._mesh(new THREE.BoxGeometry(hx, 0.25, hz), mat);
                top.position.set(0, 3.2, 0);
                root.add(top);
                const back = this._mesh(new THREE.BoxGeometry(hx, 0.45, 0.15), mat);
                back.position.set(0, 2.95, -0.47);
                root.add(back);
                break;
            }
            case 'long': {
                const top = this._mesh(new THREE.BoxGeometry(hx, 0.25, hz), mat);
                top.position.set(0, 3.2, 0);
                root.add(top);
                const flow = this._mesh(new THREE.BoxGeometry(hx, 1.1, 0.2), mat);
                flow.position.set(0, 2.55, -0.49);
                root.add(flow);
                // Side curtains
                [-1,1].forEach(s => {
                    const side = this._mesh(new THREE.BoxGeometry(0.18, 0.8, 0.35), mat);
                    side.position.set(s * 0.47, 2.6, 0);
                    root.add(side);
                });
                break;
            }
            case 'braid': {
                const top = this._mesh(new THREE.BoxGeometry(hx, 0.25, hz), mat);
                top.position.set(0, 3.2, 0);
                root.add(top);
                const braid = this._mesh(new THREE.BoxGeometry(0.2, 1.4, 0.2), mat);
                braid.position.set(0, 2.15, -0.49);
                root.add(braid);
                break;
            }
            case 'mohawk': {
                for (let i = 0; i < 5; i++) {
                    const spike = this._mesh(new THREE.BoxGeometry(0.14, 0.3 + i * 0.06, 0.14), mat);
                    spike.position.set(0, 3.15 + i * 0.05, -0.3 + i * 0.14);
                    root.add(spike);
                }
                break;
            }
            case 'bald':
            default:
                // No hair
                break;
        }
    }

    _addFacialHair(root, style, mat) {
        switch (style) {
            case 'stubble': {
                const stub = this._mesh(new THREE.BoxGeometry(0.6, 0.12, 0.07), mat);
                stub.position.set(0, 2.56, 0.46);
                root.add(stub);
                break;
            }
            case 'mustache': {
                const mus = this._mesh(new THREE.BoxGeometry(0.38, 0.1, 0.08), mat);
                mus.position.set(0, 2.64, 0.46);
                root.add(mus);
                break;
            }
            case 'beard': {
                const b = this._mesh(new THREE.BoxGeometry(0.55, 0.35, 0.1), mat);
                b.position.set(0, 2.48, 0.45);
                root.add(b);
                break;
            }
            case 'fullbeard': {
                const fb = this._mesh(new THREE.BoxGeometry(0.65, 0.55, 0.12), mat);
                fb.position.set(0, 2.44, 0.44);
                root.add(fb);
                const mus = this._mesh(new THREE.BoxGeometry(0.42, 0.1, 0.08), mat);
                mus.position.set(0, 2.64, 0.46);
                root.add(mus);
                break;
            }
        }
    }

    _mat(color) { return new THREE.MeshLambertMaterial({ color }); }
    _mesh(geo, mat) {
        const m = new THREE.Mesh(geo, mat);
        m.castShadow = m.receiveShadow = true;
        return m;
    }

    /** Build a simplified NPC character */
    buildNPC(skinHex, clothHex, hairHex, hairStyle = 'short') {
        return this.build({
            gender: 'boy', body: 'average',
            skin: Object.keys(CONFIG.SKIN_COLORS).find(k => CONFIG.SKIN_COLORS[k] === skinHex) || 'medium',
            hair: hairStyle, hairColor: 'brown',
            eyeColor: 'brown', facialHair: 'none',
            armor: 'leather', shoes: 'boots',
        });
    }

    /** Build a goblin: small, green, scary-ish */
    buildGoblin() {
        const root = new THREE.Group();
        const g    = this._mat(0x4A7C3F);
        const dg   = this._mat(0x2E5A29);
        const ye   = this._mat(0xFFCC00);
        const br   = this._mat(0x6B3A2A);

        // Feet
        [-1,1].forEach(s => {
            const f = this._mesh(new THREE.BoxGeometry(0.35, 0.18, 0.4), dg);
            f.position.set(s * 0.2, 0.09, 0.05);
            root.add(f);
        });
        // Legs
        [-1,1].forEach(s => {
            const l = this._mesh(new THREE.BoxGeometry(0.28, 0.65, 0.28), dg);
            l.position.set(s * 0.2, 0.57, 0);
            root.add(l);
        });
        // Torso (loincloth / vest)
        const t = this._mesh(new THREE.BoxGeometry(0.8, 0.85, 0.42), br);
        t.position.y = 1.22;
        root.add(t);
        // Arms
        [-1,1].forEach(s => {
            const a = this._mesh(new THREE.BoxGeometry(0.25, 0.7, 0.25), g);
            a.position.set(s * 0.52, 1.2, 0);
            root.add(a);
        });
        // Head (bigger, rounder)
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
            const ey = this._mesh(new THREE.BoxGeometry(0.15, 0.12, 0.07), ye);
            ey.position.set(s * 0.17, 1.97, 0.39);
            root.add(ey);
        });
        // Teeth
        const teeth = this._mesh(new THREE.BoxGeometry(0.22, 0.1, 0.06), this._mat(0xFFFFEE));
        teeth.position.set(0, 1.82, 0.38);
        root.add(teeth);
        // Club
        const club = this._mesh(new THREE.BoxGeometry(0.18, 0.9, 0.18), br);
        club.position.set(0.65, 1.15, 0);
        club.rotation.z = 0.3;
        root.add(club);
        const head2 = this._mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), dg);
        head2.position.set(0.78, 1.55, 0);
        root.add(head2);

        return root;
    }

    /** Build a simple sheep */
    buildSheep() {
        const root  = new THREE.Group();
        const white = this._mat(0xF0F0F0);
        const dark  = this._mat(0x333333);
        const pink  = this._mat(0xFFB6C1);

        // Body (fluffy)
        const body = this._mesh(new THREE.BoxGeometry(0.9, 0.65, 0.55), white);
        body.position.y = 0.55;
        root.add(body);
        // Legs
        [[-.28,-.2],[.28,-.2],[-.28,.2],[.28,.2]].forEach(([x,z]) => {
            const l = this._mesh(new THREE.BoxGeometry(0.18, 0.38, 0.18), dark);
            l.position.set(x, 0.19, z);
            root.add(l);
        });
        // Head
        const hd = this._mesh(new THREE.BoxGeometry(0.45, 0.42, 0.42), white);
        hd.position.set(0.55, 0.7, 0);
        root.add(hd);
        // Face
        const nose = this._mesh(new THREE.BoxGeometry(0.18, 0.12, 0.08), pink);
        nose.position.set(0.8, 0.65, 0);
        root.add(nose);

        return root;
    }
}

/* Singleton */
window.charBuilder = new CharacterBuilder();
