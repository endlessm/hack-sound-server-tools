/* global pkg */
/* exported main */
// src/main.js
//
// Copyright (c) 2018 Endless Mobile Inc.
//
pkg.initGettext();
pkg.initFormat();
pkg.require({
    Gtk: '3.0',
    Gio: '2.0',
    GLib: '2.0',
    GObject: '2.0'
});

const {GLib} = imports.gi;
const {PlayerWindowApplication} = imports.app;

function main(argv) {
    const app = new PlayerWindowApplication();
    return app.run(argv);
}
