const System = imports.system;
imports.gi.versions.Gtk = '3.0';

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Pango = imports.gi.Pango;

const {SoundServer} = imports.hacksoundserver.tools.soundServer;
const Misc = imports.hacksoundserver.tools.playerwindow.misc;

var MetadataPopoverRow = GObject.registerClass({
    GTypeName: 'MetadataPopoverRow'
}, class MetadataPopoverRow extends Gtk.ListBoxRow {
    _init(metadata, soundEvent) {
        super._init();
        this.soundEvent = soundEvent;

        const container =
            new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL});
        const tooltipText = `<b>${this.soundEvent.soundEventId}</b>\n\n` +
            Misc.soundEventToTooltipText(metadata, soundEvent);
        const label = new Gtk.Label({label: soundEvent.soundEventId});

        label.max_width_char = 250;
        label.ellipsize = Pango.EllipsizeMode.END;
        label.set_tooltip_markup(tooltipText);

        // Add container desing.
        container.margin_left = Misc.PADDING * 2
        container.margin_right = Misc.PADDING * 2
        container.margin_top = Misc.PADDING
        container.margin_bottom = Misc.PADDING

        // Add contianer to row.
        container.add(label);
        this.add(container);
    }
});

var MetadataPopover = GObject.registerClass({
    GTypeName: 'MetadataPopover',
    Children: ['listBox'],
    InternalChildren: ['searchEntry'],
    Properties: {},
    Template: 'resource:///com/endlessm/hacksoundserver/tools/data/playerwindow/metadata-popover.ui'
}, class MetadataPopover extends Gtk.Popover {
    _init(metadata) {
        super._init();
        this._metadata = metadata;

        this._searchEntry.connect('search-changed', this.onSearchChanged.bind(this));
        this._populateListBox();
    }

    onSearchChanged(searchEntry) {
        this.listBox.set_filter_func(this._filterFunc.bind(this));
    }

    _filterFunc(row) {
        const searchText = this._searchEntry.text;
        if (searchText === '')
            return true;
        return row.soundEvent.soundEventId.includes(searchText);
    }

    _populateListBox() {
        const metadata = this._metadata;
        for (let soundEventId in metadata.soundEvents) {
            const soundEvent = metadata.getSoundEvent(soundEventId);

            const row = new MetadataPopoverRow(metadata, soundEvent);
            this.listBox.add(row);
        }
    }
});
