const {Gio, GLib, HackSound} = imports.gi;
var SoundServer = imports.hacksoundserver.tools.soundServer;

var SoundEvent = class {
    constructor(soundEventId, soundEntry) {
        this._soundEventId = soundEventId;
        this._soundEntry = soundEntry.deep_unpack();
    }

    get soundEventId() {
        return this._soundEventId;
    }

    get soundFile() {
        const prop = 'sound-file';
        return prop in this._soundEntry ?
            this._soundEntry[prop].deep_unpack() : null;
    }

    get soundFiles() {
        const prop = 'sound-files';
        if (!(prop in this._soundEntry))
            return null;
        return this._soundEntry[prop].deep_unpack().map(x => x.deep_unpack());
    }

    get delay() {
        const prop = 'delay';
        return prop in this._soundEntry ?
            this._soundEntry[prop].deep_unpack() : 0;
    }

    get fadeIn() {
        const prop = 'fade-in';
        return prop in this._soundEntry ?
            this._soundEntry[prop].deep_unpack() : 0;
    }

    get fadeOut() {
        const prop = 'fade-out';
        return prop in this._soundEntry ?
            this._soundEntry[prop].deep_unpack() : 0;
    }

    get loop() {
        const prop = 'fade-loop';
        return prop in this._soundEntry ?
            this._soundEntry[prop].deep_unpack() : false;
    }

    get overlapBehavior() {
        const prop = 'overlap-behavior';
        return prop in this._soundEntry ?
            this._soundEntry[prop].deep_unpack() : 'overlap';
    }

    get volume() {
        const prop = 'volume';
        return prop in this._soundEntry ?
            this._soundEntry[prop].deep_unpack() : 0;
    }

    getValueByProp(prop) {
        switch (prop) {
            case 'sound-file':
                return this.soundFile;
            case 'sound-files':
                return this.soundFiles;
            case 'delay':
                return this.delay;
            case 'fade-in':
                return this.fadeIn;
            case 'fade-out':
                return this.fadeOut;
            case 'loop':
                return this.loop;
            case 'overlap-behavior':
                return this.overlapBehavior;
            case 'volume':
                return this.volume;
        }
    }
}

var Metadata = class {
    constructor() {
        const soundServer = SoundServer.getDefault();
        this._soundEvents = this.createSoundEvents(soundServer.metadata);
    }

    get properties() {
        return ['sound-file', 'sound-files', 'delay', 'fade-in', 'fade-out',
                'loop', 'overlap-behavior', 'type', 'volume'];
    }

    get soundEventIds() {
        return Object.keys(this._soundEvents);
    }

    get soundEvents() {
        return this._soundEvents;
    }

    getSoundEvent(soundEventId) {
        if (!(soundEventId in this._soundEvents))
            return null;
        return this._soundEvents[soundEventId]
    }

    createSoundEvents(metadata) {
        const soundEvents = {};
        for (const soundEventId in metadata)
            soundEvents[soundEventId] = new SoundEvent(soundEventId,
                                                       metadata[soundEventId]);
        return soundEvents;
    }
}
