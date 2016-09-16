const menubar = require('menubar')
const ipc = require('electron').ipcMain
const globalShortcut = require('global-shortcut')
const Menu = require('electron').Menu

const mb = menubar({ dir: __dirname + '/app', width: 440, height: 230, icon: __dirname + '/app/Icon-Template.png', preloadWindow: true, 'window-position': 'topRight' })

mb.on('show', () => {
    mb.window.webContents.send('show');
})

mb.app.on('will-quit', () => {
    globalShortcut.unregisterAll();
})

mb.app.on('active', () => {
    mb.showWindow();
})

// when receive the abort message, close the app
ipc.on('abort', () => {
    mb.hideWindow();
})


// when receive the abort message, close the app
ipc.on('update-preference', (evt, pref, initialization) => {
    registerShortcut(pref['open-window-shortcut'], initialization)
});

let template = [
    {
        label: 'dobar',
        submenu: [
            {
                label: 'Undo',
                accelerator: 'Command+Z',
                selector: 'undo:'
            },
            {
                label: 'Redo',
                accelerator: 'Shift+Command+Z',
                selector: 'redo:'
            },
            {
                label: 'Cut',
                accelerator: 'Command+X',
                selector: 'cut:'
            },
            {
                label: 'Copy',
                accelerator: 'Command+C',
                selector: 'copy:',
            },
            {
                label: 'Paste',
                accelerator: 'Command+V',
                selector: 'paste:'
            },
            {
                label: 'Reload',
                accelerator: "CmdOrCtrl+R",
                click: function (item, focusedWindow) {
                    if (focusedWindow) focusedWindow.reload()
                }
            },
            {
                label: 'Preference',
                accelerator: "Command+",
                click: function () {
                    mb.window.webContents.send('open-preference')
                }
            },
            {
                label: 'Quit App',
                accelerator: 'Command+Q',
                selector: 'terminate:'
            },
            {
                label: 'Toggle DevTools',
                accelerator: 'Alt+Command+I',
                click: function () {
                    mb.window.toggleDevTools()
                }
            }
        ]
    }
]

mb.on('ready', function ready () {
    // Build default menu for text editing and devtools. (gone since electron 0.25.2)
    let menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu)
});

// Register a shortcut listener.
let registerShortcut = (keybinding, initialization) => {
    globalShortcut.unregisterAll();

    try {
        let ret = globalShortcut.register(keybinding, () => {
            mb.window.isVisible() ? mb.hideWindow() : mb.showWindow();
        })
    } catch (err) {
        mb.window.webContents.send('preference-updated', true, initialization)
    }

    if (ret) {
        mb.window.webContents.send('preference-updated', true, initialization)
    }
}
