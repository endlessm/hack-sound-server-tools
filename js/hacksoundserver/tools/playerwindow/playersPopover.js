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

var PlayersPopoverRow = GObject.registerClass({
    GTypeName: 'PlayersPopoverRow'
}, class PlayersPopoverRow extends Gtk.ListBoxRow {
    _init(player) {
        super._init();

        this.player = player;

        const container = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL});
        const titleBox = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL});
        const titleLabel = new Gtk.Label({label: player.appId});
        const descriptionLabel = new Gtk.Label();
        descriptionLabel.set_markup(`path: ${player.objectPath}`);

        // Pack widgets.
        titleBox.pack_start(titleLabel, true, true, 0);
        titleBox.pack_start(descriptionLabel, true, true, 0)
        container.pack_start(titleBox, true, true, 0)

        // Add container desing.
        container.margin_left = Misc.PADDING * 2;
        container.margin_right = Misc.PADDING * 2;
        container.margin_top = Misc.PADDING;
        container.margin_bottom = Misc.PADDING;

        // TItle and subtitule design.
        titleLabel.xalign = 0;
        descriptionLabel.xalign = 0;
        descriptionLabel.get_style_context().add_class("dim-label");

        this.add(container);
    }
});

var PlayersPopover = GObject.registerClass({
    GTypeName: 'PlayersPopover',
    Children: ['listBox'],
    InternalChildren: [
        'searchEntry',
        'stack',
        'playersPage',
        'newPlayerEntry',
        'newPlayerPage',
        'newPlayerButton'
    ],
    Properties: {
        'current-player-info': GObject.ParamSpec.string('current-player-info',
                                                        '', '',
                                                        GObject.ParamFlags.READWRITE |
                                                        GObject.ParamFlags.CONSTRUCT,
                                                        null)
    },
    Template: 'resource:///com/endlessm/hacksoundserver/tools/data/playerwindow/players-popover.ui'
}, class PlayersPopover extends Gtk.Popover {
    _init() {
        super._init();
        this._current_player_info = null;

        this._populateListBox();


        const soundServer = SoundServer.getDefault();
        soundServer.connect('player-added', this.onPlayerAdded.bind(this));
        soundServer.connect('player-removed', this.onPlayerRemoved.bind(this));
        this._searchEntry.connect('search-changed', this.onSearchChanged.bind(this));

        this.listBox.connect('row-selected', this.onRowSelected.bind(this));
        this._stack.connect('notify::visible-child', this.onStackPageChanged.bind(this));
        this.connect('notify::current-player-info',
                     this.onCurrentPlayerInfoChanged.bind(this));
    }

    get current_player_info() {
        return this._current_player_info;
    }

    set current_player_info(value) {
        if (!value || !value.appId || !Gio.dbus_is_name(value.appId))  // TODO: Validate options.
            return;
        this._current_player_info = value;
        this.notify('current-player-info');
    }

    onCurrentPlayerInfoChanged(popover, _arg) {
        this._newPlayerEntry.text = this.current_player_info.appId;
    }

    onNewPlayerButtonClicked(_button, unused_arg) {
        const appId = this._newPlayerEntry.text;
        const options = {};  // TODO: Get options from the settings button.
        this.current_player_info = new PlayerInfo(appId, options);
    }

    onRowSelected(listbox, row) {
        this.selectedPlayer = row.player;
        this.current_player_info = new PlayerInfo(appId, options);
    }

    onNewPlayerEntryInsertText(entry, unused_arg) {
        // Validate new player entry.
        this._newPlayerButton.sensitive = Gio.dbus_is_name(entry.text);
    }

    onStackPageChanged(_stack, unused_arg) {
        const child = this._stack.visible_child;
    }

    onPlayerAdded(_soundServer, player) {
        const row = new PlayersPopoverRow(player);
        this.listBox.prepend(row);
    }

    onPlayerRemoved(_soundServer, player) {
        const row = this.listBox.get_children().find(row => row.player == player);
        if (row)
            this.listBox.remove(row);
    }

    onSearchChanged(searchEntry) {
        this.listBox.set_filter_func(this._filterFunc.bind(this));
    }

    _filterFunc(row) {
        const searchText = this._searchEntry.text;
        if (searchText === '')
            return true;

        const playerPath = row.player.objectPath;
        const appId = row.player.appId;
        return appId.includes(searchText) || playerPath.includes(searchText);
    }

    _populateListBox() {
        const soundServer = SoundServer.getDefault();

        for (const player in soundServer.players) {
            const soundEvent = metadata.getSoundEvent(soundEventId);
            const row = new PlayersPopoverRow(player);
            this.listBox.add(row);
        }
    }
});
