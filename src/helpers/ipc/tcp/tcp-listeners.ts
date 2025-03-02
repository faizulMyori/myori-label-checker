import { BrowserWindow, ipcMain } from "electron";
import {
  TCP_CLOSED,
  TCP_CONNECT,
  TCP_DISCONNECT,
  TCP_ERROR,
  TCP_RECEIVE
} from "./tcp-channels";
import { connectTcp, closeTcpConnection } from "../../tcp_helpers";

export function addTCPEventListeners() {
  ipcMain.handle(TCP_CONNECT, async (event, { ip, port }) => connectTcp(ip, port, event));
  ipcMain.handle(TCP_DISCONNECT, async () => closeTcpConnection());
  // ipcMain.on(TCP_RECEIVE, (event, data) => event.sender.send(TCP_RECEIVE, data));
}


