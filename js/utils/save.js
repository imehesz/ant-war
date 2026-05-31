// js/utils/save.js
// LocalStorage persistence via a single JSON key: "AntGameConfig"

const SAVE_KEY = 'AntGameConfig';

const GameSave = {
    _data: null,

    _load() {
        if (this._data) return this._data;
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            this._data = raw ? JSON.parse(raw) : {};
        } catch (e) {
            console.warn('GameSave: failed to parse localStorage, resetting.', e);
            this._data = {};
        }
        return this._data;
    },

    _flush() {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(this._data));
        } catch (e) {
            console.error('GameSave: failed to write localStorage', e);
        }
    },

    get(key, defaultValue) {
        const data = this._load();
        return data[key] !== undefined ? data[key] : defaultValue;
    },

    set(key, value) {
        const data = this._load();
        data[key] = value;
        this._flush();
    }
};
