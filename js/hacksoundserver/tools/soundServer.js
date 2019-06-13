/* exported getDefault */

const {Gio, GLib, GObject, HackSound} = imports.gi;


const PlayerIface = `
<node>
  <interface name='com.endlessm.HackSoundServer2.Player'>
    <property name="AppId" type="s" access="read"/>
    <property name="Options" type="a{sv}" access="read"/>
    <method name='Play'>
      <arg type='s' name='sound_event' direction='in'/>
      <arg type='o' name='path' direction='out'/>
    </method>
    <method name='PlayFull'>
      <arg type='s' name='sound_event' direction='in'/>
      <arg type='a{sv}' name='options' direction='in'/>
      <arg type='o' name='path' direction='out'/>
    </method>
  </interface>
</node>
`;

const SoundIface = `
<node>
  <interface name='com.endlessm.HackSoundServer2.Sound'>
    <method name='UpdateProperties'>
      <arg type='u' name='transition_time_ms' direction='in'/>
      <arg type='a{sv}' name='options' direction='in'/>
    </method>
    <method name='Stop'/>
    <method name='Terminate'/>
  </interface>
</node>
`;

const SoundServerIface = `
<node>
  <interface name='com.endlessm.HackSoundServer2'>
    <property name="Metadata" type="a{sv}" access="read"/>
    <method name='GetPlayer'>
      <arg type='s' name='app' direction='in'/>
      <arg type='a{sv}' name='options' direction='in'/>
      <arg type='o' name='path' direction='out'/>
    </method>
  </interface>
</node>
`;

var SoundServerProxy = Gio.DBusProxy.makeProxyWrapper(SoundServerIface);
var PlayerProxy = Gio.DBusProxy.makeProxyWrapper(PlayerIface);
var SoundProxy = Gio.DBusProxy.makeProxyWrapper(SoundIface);


var Sound = GObject.registerClass({
}, class Sound extends GObject.Object {
    _init(soundPath) {
        super._init();
        this._proxy = new SoundProxy(Gio.DBus.session,
                                     'com.endlessm.HackSoundServer2',
                                     soundPath);
    }

    get objectPath() {
        return this._proxy.g_object_path;
    }

    async stop() {
        return new Promise((resolve, reject) => {
            this._proxy.StopRemote((out, err) => {
                print('call stop inside promise');
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
});

var Player = GObject.registerClass({
    Signals: {
        'sound-added': { param_types: [GObject.TYPE_OBJECT] },
        'sound-removed': { param_types: [GObject.TYPE_OBJECT] },
    }
}, class Player extends GObject.Object {
    _init(playerPath) {
        super._init();
        this._sounds = {};
        this._proxy = new PlayerProxy(Gio.DBus.session,
                                      'com.endlessm.HackSoundServer2',
                                      playerPath);

        this._soundManager = Gio.DBusObjectManagerClient.new_for_bus_sync(
            Gio.BusType.SESSION,
            Gio.DBusObjectManagerClientFlags.NONE,
            "com.endlessm.HackSoundServer2",
            `${this.objectPath}/sounds`,
            null, null);
        this._addCurrentSounds();

        print(`${this.objectPath}/sounds`);
        this._soundManager.connect('object-removed',
                                    this._soundManagerObjectRemovedCb.bind(this));
    }

    get objectPath() {
        return this._proxy.g_object_path;
    }

    get appId() {
        return this._proxy.AppId;
    }

    get options() {
        return this._proxy.Options;
    }

    get sounds() {
        return Object.values(this._sounds);
    }

    async play(soundEventId) {
        const soundPath = await this._callPlay(soundEventId);

        if (!(soundPath in this._sounds)) {
            this._sounds[soundPath] = new Sound(soundPath);
            this.emit('sound-added', this._sounds[soundPath]);
        }
        return this._sounds[soundPath];
    }

    async _callPlay(soundEventId) {
        return new Promise((resolve, reject) => {
            this._proxy.PlayRemote(soundEventId, (out, err) => {
                if (err) {
                    reject(err);
                    return;
                }
                const [path] = out;
                resolve(path);
            });
        });
    }

    _addCurrentSounds() {
        const objects = this._soundManager.get_objects();

        for (let object of objects) {
            const soundPath = object.get_object_path();
            if (soundPath in this._sounds)
                continue;
            this._sounds[soundPath] = new Sound(soundPath);
        }
    }

    _soundManagerObjectRemovedCb(manager, object) {
        const soundPath = object.get_object_path();
        const sound = this._sounds[soundPath];
        delete this._sounds[soundPath];
        this.emit('sound-removed', sound);
    }

});



var SoundServer = GObject.registerClass({
    Signals: {
        'player-added': { param_types: [GObject.TYPE_OBJECT] },
        'player-removed': { param_types: [GObject.TYPE_OBJECT] },
    }
}, class PlayerBox extends GObject.Object {
    _init() {
        super._init();
        this._players = {};
        this._proxy = new SoundServerProxy(Gio.DBus.session,
                                           'com.endlessm.HackSoundServer2',
                                           '/com/endlessm/HackSoundServer2');
        this._playerManager = Gio.DBusObjectManagerClient.new_for_bus_sync(
            Gio.BusType.SESSION,
            Gio.DBusObjectManagerClientFlags.NONE,
            "com.endlessm.HackSoundServer2",
            "/com/endlessm/HackSoundServer2/players",
            null, null);
        this._addCurrentPlayers();

        this._playerManager.connect('object-removed',
                                    this._playerManagerObjectRemovedCb.bind(this));
    }

    get metadata() {
        return this._proxy.Metadata;
    }

    get players() {
        return Object.values(this._players);
    }

    async getPlayer(appId, options) {
        const playerPath = await this._callGetPlayer(appId, options);

        if (!(playerPath in this._players)) {
            this._players[playerPath] = new Player(playerPath);
            this.emit('player-added', this._players[playerPath]);
        }
        return this._players[playerPath];
    }


    async _callGetPlayer(appId, options) {
        return new Promise((resolve, reject) => {
            this._proxy.GetPlayerRemote(appId, options, (out, err) => {
                if (err) {
                    reject(err);
                    return;
                }
                const [path] = out;
                resolve(path);
            });
        });
    }

    _playerManagerObjectRemovedCb(manager, object) {
        const playerPath = object.get_object_path();
        const player = this._players[playerPath];

        delete this._players[playerPath];
        this.emit('player-removed', player);
    }

    _addCurrentPlayers() {
        const objects = this._playerManager.get_objects();

        for (let object of objects) {
            const playerPath = object.get_object_path();
            if (playerPath in this._players)
                continue;
            this._players[playerPath] = new Player(playerPath);
        }
    }
});

var getDefault = (function() {
    let defaultSoundServer;
    return function() {
        if (!defaultSoundServer)
            defaultSoundServer = new SoundServer();
        return defaultSoundServer;
    };
}());
