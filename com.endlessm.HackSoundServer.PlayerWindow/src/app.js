const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;

const {PlayerBox} = imports.hacksoundserver.tools.playerwindow.box;
const {APP_ID} = imports.configure;

print(APP_ID);


var PlayerWindowApplicationWindow = GObject.registerClass({
}, class PlayerWindowApplicationWindow extends Gtk.ApplicationWindow {
    _init(props) {
        super._init(props);

        this.playerbox = new PlayerBox(props.application.application_id);
        this.add(this.playerbox);
    }
});


var PlayerWindowApplication = GObject.registerClass({
}, class PlayerWindowApplication extends Gtk.Application {
    _init(props) {
        super._init({
            application_id: APP_ID,
            flags: Gio.ApplicationFlags.FLAGS_NONE
        });
    }
    
    vfunc_activate() {
        super.vfunc_activate();

        let window = new PlayerWindowApplicationWindow({application: this});
        window.present();
    }
});
