/* =========================================================
   MEDIEVAL MAYHEM - Save System
   ========================================================= */

class SaveSystem {
    hasSave() {
        return !!localStorage.getItem(CONFIG.SAVE_KEY);
    }

    save(data) {
        try {
            localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify({ ...data, timestamp: Date.now(), version: 1 }));
            return true;
        } catch (e) {
            console.error('Save failed:', e);
            return false;
        }
    }

    load() {
        try {
            const raw = localStorage.getItem(CONFIG.SAVE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            console.error('Load failed:', e);
            return null;
        }
    }

    deleteSave() {
        localStorage.removeItem(CONFIG.SAVE_KEY);
    }
}
