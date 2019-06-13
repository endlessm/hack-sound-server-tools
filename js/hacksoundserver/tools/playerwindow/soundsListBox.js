const System = imports.system;
imports.gi.versions.Gtk = '3.0';

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Pango = imports.gi.Pango;


const {PlayerInfo} = imports.hacksoundserver.tools.playerwindow.playerinfo;
const Misc = imports.hacksoundserver.tools.playerwindow.misc;
const SoundServer = imports.hacksoundserver.tools.soundServer;

var SoundsListBoxRow = GObject.registerClass({
    GTypeName: 'SoundsListBoxRow'
}, class SoundsListBoxRow extends Gtk.ListBoxRow {
    _init(sound) {
        super._init();

        this.sound = sound;

        const container = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL});
        const titleBox = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL});
        const titleLabel = new Gtk.Label({label: sound.objectPath});
        const stopImage = new Gtk.Image({icon_name: 'media-playback-stop-symbolic'});
        const stopButton = new Gtk.Button({image: stopImage});
        const descriptionLabel = new Gtk.Label();
        descriptionLabel.set_markup(`sound event id: nothing`);

        // Pack widgets.
        titleBox.pack_start(titleLabel, true, true, 0);
        titleBox.pack_start(descriptionLabel, true, true, 0);
        container.pack_start(titleBox, true, true, 0);
        container.pack_end(stopButton, false, false, 0)

        // Add container desing.
        container.margin_left = Misc.PADDING * 2;
        container.margin_right = Misc.PADDING * 2;
        container.margin_top = Misc.PADDING;
        container.margin_bottom = Misc.PADDING;

        // TItle and subtitule design.
        titleLabel.xalign = 0;
        descriptionLabel.xalign = 0;
        descriptionLabel.get_style_context().add_class("dim-label");
        stopButton.margin_left = Misc.PADDING;

        stopButton.connect('clicked', this.onStopButtonClicked.bind(this));

        this.add(container);
    }

    onStopButtonClicked(_button) {
        this.sound.stop();
    }
});

var SoundsListBox = GObject.registerClass({
    GTypeName: 'SoundsListBox',
    Children: ['listBox'],
    InternalChildren: [
        'searchEntry',
    ],
    Properties: {
        'current-player': GObject.ParamSpec.object('current-player', '', '',
                                                   GObject.ParamFlags.READWRITE,
                                                   GObject.Object)
    },
    Template: 'resource:///com/endlessm/hacksoundserver/tools/data/playerwindow/sounds-list-box.ui'
}, class SoundsListBox extends Gtk.Box {
    _init() {
        super._init();
        this._current_player = null;

        // Callback ids.
        this._onSoundAddedId = null;
        this._onSoundRemovedId = null;

        this._populateListBox();

        SoundServer.getDefault().connect('player-removed',
                                         this.onRemovedPlayer.bind(this));
        this.connect('notify::current-player',
                     this.onCurrentPlayerChanged.bind(this));
        this._searchEntry.connect('search-changed', this.onSearchChanged.bind(this));

        this.show_all();
    }

    get current_player() {
        return this._current_player;
    }

    set current_player(value) {
        if (this._current_player === value) {
            return;
        }

        if (this._onSoundAddedId) {
            this._current_player.disconnect(this._onSoundAddedId);
            this._onSoundAddedId = null;
        }
        if (this._onSoundRemovedId) {
            this._current_player.disconnect(this._onSoundRemovedId);
            this._onSoundRemovedId = null;
        }

        this._current_player = value;
        this.notify('current-player');
    }

    onCurrentPlayerChanged(_popover, _arg) {
        for (let row of this.listBox.get_children()) {
            this.listBox.remove(row);
        }
        if (!this.current_player)
            return;

        this._populateListBox();
        this._onSoundAddedId = this.current_player.connect('sound-added',
                                                           this.onSoundAdded.bind(this));
        this._onSoundRemovedId = this.current_player.connect('sound-removed',
                                                             this.onSoundRemoved.bind(this));
    }

    onSoundAdded(_player, sound) {
        const row = new SoundsListBoxRow(sound);
        this.listBox.add(row);
        this.show_all();
    }

    onSoundRemoved(_player, sound) {
        const row = this.listBox.get_children().filter(row => row.sound === sound);
        if (!row)
            return;

        this.listBox.remove(row[0]);
        this.show_all();
    }

    onRemovedPlayer(_soundServer, player) {
        if (player === this.current_player)
            this.current_player = null;
    }

    onSearchChanged(searchEntry) {
        this.listBox.set_filter_func(this._filterFunc.bind(this));
    }

    _filterFunc(row) {
        const searchText = this._searchEntry.text;
        if (searchText === '')
            return true;
        return row.sound.objectPath.includes(searchText);
    }

    _populateListBox() {
        if (!this.current_player)
            return;

        for (let sound of this.current_player.sounds) {
            const row = new SoundsListBoxRow(sound);
            this.listBox.add(row);
        }
    }
});
