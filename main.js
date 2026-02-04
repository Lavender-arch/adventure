
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 450,
    height: 850,
    title: "八姐的午后大冒险",
    icon: path.join(__dirname, 'icon.ico'), // 如果有图标文件
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    resizable: true
  });

  // 隐藏菜单栏
  win.setMenuBarVisibility(false);

  // 加载项目主页面
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
