imports.gi.versions.Gtk = '3.0';


const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;

const {Metadata} = imports.hacksoundserver.tools.playerwindow.soundEvent;
const {MetadataPopover} = imports.hacksoundserver.tools.playerwindow.metadataPopover;
const {PlayerInfo} = imports.hacksoundserver.tools.playerwindow.playerinfo;
const {PlayersPopover} = imports.hacksoundserver.tools.playerwindow.playersPopover;
const Misc = imports.hacksoundserver.tools.playerwindow.misc;
const SoundServer = imports.hacksoundserver.tools.soundServer;
const {SoundsListBox} = imports.hacksoundserver.tools.playerwindow.soundsListBox;

var PlayerBox = GObject.registerClass({
    GTypeName: 'PlayerBox',
    InternalChildren: [
        'box',
        'metadataButton',
        'metadataButtonLabel',
        'playButton',
        'playerButton'
    ],
    Signals: {},
    Template: 'resource:///com/endlessm/hacksoundserver/tools/data/playerwindow/box.ui'
}, class PlayerBox extends Gtk.Box {
    _init(defaultAppId) {
        super._init();

        this._defaultAppId = defaultAppId;
        this._current_player = null;
        this._current_sound = null;
        this._soundsListBox = new SoundsListBox();

        this.width_request = 600;
        this.height_request = 350;

        this.metadata = new Metadata();
        const defaultSoundEventId = this.metadata.soundEventIds[0];
        const defaultSoundEvent =
            this.metadata.getSoundEvent(defaultSoundEventId);

        this.currentSoundEvent = defaultSoundEvent;
        this.updateMetadataButton();


        this._metadataPopover = new MetadataPopover(this.metadata);
        const defaultPlayerInfo = new PlayerInfo(this._defaultAppId, {});
        this._playersPopover = new PlayersPopover();
        //this._soundsPopover = new SoundsPopover();

        this._metadataButton.connect('clicked',
                                     this.onMetadataButtonClicked.bind(this));
        this._metadataPopover.listBox.connect('row-selected',
                                              this.onMetadataPopoverRowSelected.bind(this));
        this._playersPopover.connect('notify::current-player-info',
                                     this.onCurrentPlayerInfoChanged.bind(this));
        this._playerButton.connect('clicked',
                                   this.onPlayerButtonClicked.bind(this));
        this._playButton.connect('clicked',
                                 this.onPlayButtonClicked.bind(this));
        this._box.pack_end(this._soundsListBox, true, true, 0);

        this._playersPopover.current_player_info = defaultPlayerInfo;
    }
    get currentSelectedSoundEventId() {
        return this.currentSoundEvent.soundEventId;
    }

    get currentSelectedPlayerInfo() {
        return this._playersPopover.current_player_info;
    }

    onCurrentPlayerInfoChanged(popover, _arg) {
        this._playerButton.label =  popover.current_player_info.appId;
    }

    onPlayButtonClicked() {
        const soundServer = SoundServer.getDefault();
        const {appId, options} = this.currentSelectedPlayerInfo;
        soundServer.getPlayer(appId, options).then(player => {
            this._soundsListBox.current_player = player;
            player.play(this.currentSelectedSoundEventId).catch(err => {
                logError(err, `Error playing sound ${this.currentSelectedSoundEventId}`);
            });
        }).catch(err => {
            logError(err, `Error getting player ${appId}`);
        });
    }

    onPlayerButtonClicked(button) {
        this._playersPopover.set_relative_to(button);
        this._playersPopover.show_all();
        this._playersPopover.popup();
    }

    onMetadataButtonClicked(button) {
        this._metadataPopover.set_relative_to(button);
        this._metadataPopover.show_all();
        this._metadataPopover.popup();
    }

    onMetadataPopoverRowSelected(_listbox, row) {
        this.currentSoundEvent = row.soundEvent;
        this.updateMetadataButton();
        this._metadataPopover.popdown();
    }

    updateMetadataButton() {
        this._metadataButtonLabel.set_label(this.currentSoundEvent.soundEventId);
        this.updateMetadataButtonTooltip();
    }

    updateMetadataButtonTooltip() {
        let text = Misc.soundEventToTooltipText(this.metadata,
                                                this.currentSoundEvent);
        this._metadataButton.set_tooltip_markup(text);
    }
});
