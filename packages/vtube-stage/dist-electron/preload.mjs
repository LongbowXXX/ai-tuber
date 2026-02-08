"use strict";
const electron = require("electron");
console.log("[Preload] Script execution started");
electron.contextBridge.exposeInMainWorld("electron", {
  socket: {
    connect: () => electron.ipcRenderer.send("socket-connect"),
    disconnect: () => electron.ipcRenderer.send("socket-disconnect"),
    send: (message) => electron.ipcRenderer.send("socket-send", message),
    onOpen: (callback) => electron.ipcRenderer.on("socket-on-open", () => callback()),
    onClose: (callback) => electron.ipcRenderer.on("socket-on-close", () => callback()),
    onError: (callback) => electron.ipcRenderer.on("socket-on-error", (_event, error) => callback(error)),
    onMessage: (callback) => electron.ipcRenderer.on("socket-on-message", (_event, message) => callback(message))
  }
});
