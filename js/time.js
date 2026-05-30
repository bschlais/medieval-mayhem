/* =========================================================
   MEDIEVAL MAYHEM - Day / Night Cycle System
   timeOfDay: 0=midnight, 0.25=6AM sunrise, 0.5=noon, 0.75=6PM, 1=midnight
   Full cycle = 480 real seconds (8 min) = 24 in-game hours
   ========================================================= */

class TimeSystem {
    constructor(scene, sunLight, ambientLight) {
        this.scene       = scene;
        this.sun         = sunLight;
        this.ambient     = ambientLight;
        this.timeOfDay   = 0.30;    // Start ~7:12 AM
        this.dayLength   = 480;     // 8 real minutes per day
        this.inGameHour  = 7;

        /* Sky palette */
        this._skies = {
            night:    new THREE.Color(0x0A1525),
            predawn:  new THREE.Color(0x1A0A2E),
            dawn:     new THREE.Color(0xFF6B2A),
            morning:  new THREE.Color(0x87CEEB),
            noon:     new THREE.Color(0x4AAAF0),
            dusk:     new THREE.Color(0xFF4F1A),
            evening:  new THREE.Color(0x16213E),
        };

        /* Moon glow (subtle blue night light) */
        this.moonLight = new THREE.DirectionalLight(0x5566AA, 0);
        this.moonLight.position.set(-60, 80, 40);
        scene.add(this.moonLight);

        /* Stars (visible at night only — toggled via opacity) */
        this._buildStars();

        this._update(0); // initialise lighting immediately
    }

    _buildStars() {
        const geo = new THREE.BufferGeometry();
        const verts = [];
        for (let i = 0; i < 800; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi   = Math.acos(2 * Math.random() - 1);
            const r     = 280;
            verts.push(
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.abs(Math.cos(phi)) + 20,
                r * Math.sin(phi) * Math.sin(theta)
            );
        }
        geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
        this.starMat = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.6, transparent: true, opacity: 0 });
        this.stars   = new THREE.Points(geo, this.starMat);
        this.scene.add(this.stars);
    }

    update(dt) {
        this.timeOfDay = (this.timeOfDay + dt / this.dayLength) % 1;
        this.inGameHour = Math.floor(this.timeOfDay * 24);
        this._update(dt);
    }

    _update() {
        const t = this.timeOfDay;

        /* --- Sun arc ---
           At t=0.25 (6AM): rises in east → angle = 0
           At t=0.50 (noon): overhead → angle = π/2
           At t=0.75 (6PM): sets in west → angle = π
        */
        const sunAngle  = (t - 0.25) * Math.PI * 2;
        const sunHeight = Math.sin(sunAngle);          // –1 (midnight) → +1 (noon)
        const dayFactor = Math.max(0, sunHeight);       // 0 at night, 1 at noon

        /* Sun world position */
        this.sun.position.set(
            -Math.cos(sunAngle) * 130,
            Math.max(-30, sunHeight * 140),
            50
        );

        /* Twilight factor (peak at horizon) */
        const twilight = Math.max(0, 0.25 - Math.abs(sunHeight)) * 4;

        /* --- Sky colour --- */
        let sky;
        const lerp = (a, b, t) => a.clone().lerp(b, Math.max(0, Math.min(1, t)));

        if (sunHeight < -0.3) {
            sky = this._skies.night.clone();
        } else if (sunHeight < -0.05 && sunAngle < 0) {   // pre-dawn
            sky = lerp(this._skies.night, this._skies.predawn, (sunHeight + 0.3) / 0.25);
        } else if (sunHeight < 0.25 && sunAngle < 0) {    // dawn
            sky = lerp(this._skies.predawn, this._skies.dawn, (sunHeight + 0.05) / 0.3);
        } else if (sunHeight < 0.5 && sunAngle < 0) {     // morning
            sky = lerp(this._skies.dawn, this._skies.morning, (sunHeight - 0.25) / 0.25);
        } else if (sunHeight >= 0.5) {                     // noon
            sky = lerp(this._skies.morning, this._skies.noon, (sunHeight - 0.5) / 0.5);
        } else if (sunHeight >= 0.25 && sunAngle >= 0) {  // afternoon
            sky = lerp(this._skies.noon, this._skies.dusk, (0.5 - sunHeight) / 0.25);
        } else if (sunHeight >= -0.05 && sunAngle >= 0) { // dusk
            sky = lerp(this._skies.dusk, this._skies.evening, (0.25 - sunHeight) / 0.3);
        } else {
            sky = lerp(this._skies.evening, this._skies.night, (-sunHeight - 0.05) / 0.25);
        }

        this.scene.background = sky;
        if (this.scene.fog) this.scene.fog.color.copy(sky);

        /* --- Sun light --- */
        if (sunHeight > 0) {
            this.sun.intensity = 0.2 + dayFactor * 1.15;
            this.sun.color.setHex(twilight > 0.4 ? 0xFF8833 : 0xFFFAE0);
            this.moonLight.intensity = 0;
        } else {
            this.sun.intensity    = 0;
            this.moonLight.intensity = 0.10 + Math.abs(sunHeight) * 0.08;
        }

        /* --- Ambient --- */
        this.ambient.intensity = 0.08 + dayFactor * 0.48;

        /* --- Stars --- */
        this.starMat.opacity = Math.max(0, -sunHeight * 1.5 + (sunHeight < -0.1 ? 0.9 : 0));
    }

    /* ---- Public helpers ---- */
    getTimeString() {
        const h    = this.inGameHour;
        const frac = this.timeOfDay * 24 - h;
        const m    = Math.floor(frac * 60);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12  = h % 12 || 12;
        return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
    }

    getIcon() {
        const h = this.inGameHour;
        if (h >= 6  && h < 9)  return '🌅';
        if (h >= 9  && h < 18) return '☀️';
        if (h >= 18 && h < 21) return '🌇';
        return '🌙';
    }

    isNight()  { return this.inGameHour <  6 || this.inGameHour >= 21; }
    isDay()    { return this.inGameHour >= 9 && this.inGameHour < 18; }

    toSaveData()     { return { timeOfDay: this.timeOfDay }; }
    fromSaveData(d)  { if (d && d.timeOfDay !== undefined) this.timeOfDay = d.timeOfDay; }
}
