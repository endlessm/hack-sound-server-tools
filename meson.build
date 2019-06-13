project('hack-sound-server-tools', version: '2.0.0', meson_version: '>= 0.40.0')

gnome = import('gnome')
pkgdatadir = join_paths(get_option('datadir'), meson.project_name())

gnome.compile_resources(meson.project_name(),
                        '@0@.gresource.xml'.format(meson.project_name()),
                        gresource_bundle: true,
                        install: true,
                        install_dir: pkgdatadir)
