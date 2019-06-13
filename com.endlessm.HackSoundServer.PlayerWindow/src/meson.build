configure_file(input: join_paths('configure.js.in'),
               output: 'configure.js',
               configuration: cdata)

configure_file(input: '@0@.src.gresource.xml.in'.format(app_id_base),
               output: '@0@.src.gresource.xml'.format(app_id),
               configuration: cdata)
gnome.compile_resources('@0@.src'.format(app_id),
                        join_paths(meson.build_root(), 'src', '@0@.src.gresource.xml'.format(app_id)),
                        gresource_bundle: true,
                        install: true,
                        install_dir: pkgdatadir,
                        source_dir: ['src', join_paths(meson.build_root(), 'src')])
