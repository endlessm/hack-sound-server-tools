project('playerwindow', version: '2.0.0', meson_version: '>= 0.40.0')

app_id_base = 'com.endlessm.HackSoundServer.PlayerWindow'
app_id_sufix = get_option('app-id-sufix')
app_id = '@0@.@1@'.format(app_id_base, app_id_sufix)

gnome = import('gnome')
gjs = find_program('gjs', 'gjs-console')
pkgdatadir = join_paths(get_option('datadir'), app_id)

cdata = configuration_data()
cdata.set('APP_ID', app_id)
cdata.set('APP_ID_SUFIX', app_id_sufix)
cdata.set('GJS', gjs.path())
cdata.set('PACKAGE_VERSION', meson.project_version())
cdata.set('prefix', get_option('prefix'))
cdata.set('libdir', get_option('libdir'))
cdata.set('pkgdatadir', pkgdatadir)

subdir('src')


configure_file(input: join_paths('data', 'app.desktop.in'),
               output: '@0@.desktop'.format(app_id),
               install_dir: join_paths('share', 'applications'),
               configuration: cdata)

configure_file(input: join_paths('bin', 'bin.js.in'),
               output: app_id,
               configuration: cdata,
               install_dir: get_option('bindir'))
