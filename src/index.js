const { app, BrowserWindow, session, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

// let popup;
let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// const createPopUp = () => {
//   popup = new BrowserWindow({
//     height: 200,
//     width: 250,
//     frame: false,
//     webPreferences: {
//       preload: path.join(app.getAppPath(), "src", "popup.js"),
//     },
//   });

//   popup.loadFile(path.join(__dirname, "popup.html"));
// };

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createWindow();
  // createPopUp();

  mainWindow.webContents.on("did-create-window", (brWindow) => {
    const frame = brWindow.webContents.mainFrame;
    frame.on("dom-ready", () => {
      fs.readFile(
        path.join(app.getAppPath(), "src", "popup.js"),
        "utf-8",
        (error, data) => {
          if (!error) {
            frame.executeJavaScript(data);
          } else {
            console.log(error);
          }
        }
      );
    });
  });

  ipcMain.on("download-started", (portEvent) => {
    session.defaultSession.on(
      "will-download",
      (event, downloadItem, webContent) => {
        const port2 = portEvent.ports[0];

        downloadItem.setSavePath(
          app.getPath("desktop") + "/" + downloadItem.getFilename()
        );

        downloadItem.on("updated", (e, state) => {
          const receivedData = Number(
            downloadItem.getReceivedBytes() * (1 / 10 ** 6)
          ).toFixed(2);
          console.log(receivedData);

          const progress = Math.round(
            (downloadItem.getReceivedBytes() / downloadItem.getTotalBytes()) *
              100
          );

          webContent.executeJavaScript(
            `document.querySelector("progress").value=${progress}`
          );
        });

        port2.on("message", (actionEvent) => {
          switch (actionEvent.data) {
            case "pause":
              downloadItem.pause();
              break;
            case "resume":
              downloadItem.resume();
              break;
          }
        });

        port2.start();
      }
    );
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
