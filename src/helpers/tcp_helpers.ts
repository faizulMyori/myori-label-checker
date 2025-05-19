import net from 'net';
import {
    TCP_CLOSED,
    TCP_CONNECTED,
    TCP_ERROR,
    TCP_RECEIVE
} from "../helpers/ipc/tcp/tcp-channels";
import { ipcMain } from 'electron';
import { WIN_TOAST } from './ipc/window/window-channels';
import logger from '../utils/logger';
import { sendSerialData } from './serial_helpers';

let client: net.Socket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 5000; // 5 seconds
let autoReconnectEnabled = true;

export function setAutoReconnect(enabled: boolean) {
    autoReconnectEnabled = enabled;
}

export async function connectTcp(ip: string, port: number, event: any) {
    console.log(`Attempting to connect to ${ip}:${port}`);

    return new Promise((resolve, reject) => {
        if (!ip || !port) {
            reject('Invalid IP or Port');
            return;
        }

        if (client && !client.destroyed) {
            resolve('Connection already exists');
            return;
        }

        client = new net.Socket();

        const connectionTimeout = setTimeout(() => {
            if (client) client.destroy();
            reject('Connection timeout');
        }, 10000);

        client.connect(port, ip, () => {
            clearTimeout(connectionTimeout);
            console.log('Connected successfully');
            resolve('Connected successfully');
            reconnectAttempts = 0; // Reset reconnect attempts on success
            event.sender.send(TCP_CONNECTED);
            client?.removeAllListeners(); // Remove all previous listeners
            setInterval(keepAlive, 10000); // Send keep-alive packets every 30 seconds
            sendSerialData('@0100\r')

            // Listen for incoming data
            client?.on('data', (data: Buffer) => {
                try {
                    const dataString = data.toString().trim();
                    if (dataString.startsWith('ER,') || dataString.startsWith('PING')) return;
                    console.log(`Received: ${dataString}`);
                    logger.info(`Received: ${dataString}`);
                    event.sender.send(TCP_RECEIVE, dataString);
                } catch (parseError: any) {
                    event.sender.send(TCP_ERROR, parseError.message);
                }
            });

            // Handle connection close (Trigger reconnection)
            client?.on('close', () => {
                console.log('TCP connection closed');
                event.sender.send(TCP_CLOSED);
                client = null; // Reset client for reconnection
                if (autoReconnectEnabled) {
                    attemptReconnect(ip, port, event);
                }
                console.log('Emitting toast notification:', {
                    title: "Connection Closed",
                    description: autoReconnectEnabled ? 'Reconnecting...' : 'Connection closed',
                    type: 'error'
                });
                event.sender.send('win-toast', {
                    title: "Connection Closed",
                    description: autoReconnectEnabled ? 'Reconnecting...' : 'Connection closed',
                    type: 'error'
                });
            });

            // Handle errors (Trigger reconnection)
            client?.on('error', (err: Error) => {
                console.error(`TCP Connection Error: ${err.message}`);
                event.sender.send(TCP_ERROR, err.message);
                client = null; // Reset client for reconnection
                if (autoReconnectEnabled) {
                    attemptReconnect(ip, port, event);
                }
            });
        });

        client.on('error', (err: Error) => {
            clearTimeout(connectionTimeout);
            console.error(`TCP Connection Error: ${err.message}`);
            event.sender.send(TCP_ERROR, err.message);
            client = null; // Reset client for reconnection
            if (autoReconnectEnabled) {
                attemptReconnect(ip, port, event);
            }
        });
    });
}

function keepAlive() {
    if (client && !client.destroyed) {
        client.write('PING\r\n');
    }
}

// Attempt to reconnect with a delay
function attemptReconnect(ip: string, port: number, event: any) {
    // if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    //     console.error("Max reconnect attempts reached. Stopping reconnect attempts.");
    //     return;
    // }

    // reconnectAttempts++;
    console.log(`Reconnecting in ${RECONNECT_DELAY / 1000} seconds...`);
    sendSerialData('@0102\r')

    setTimeout(() => {
        connectTcp(ip, port, event)
            .then(() => console.log('Reconnected successfully'))
            .catch((err) => console.error(`Reconnect failed: ${err}`));
    }, RECONNECT_DELAY);
}

export function closeTcpConnection() {
    return new Promise((resolve, reject) => {
        if (client && !client.destroyed) {
            client.end(() => {
                client?.destroy();
                client = null;
                resolve('Connection closed successfully');
            });
        } else {
            reject('No active connection to close');
        }
    });
}

// export function sendData(cmd: string) {
//     //0 = RESET
//     //1 = DO0
//     //2 = DO1
//     //3 = DO0 & DO1
//     //4 = DO2
//     //5 = DO0 & DO2
//     //6 = DO1 & DO2
//     //7 = DO0 & DO1 & DO2
//     //8 = DO3
//     //9 = DO0 & DO3
//     //10 = DO4
//     console.log(cmd)
//     sendDconCommand(cmd)
//         .then((response) => {
//             // if (cmd !== '@0100\r') sendData('@0100\r')
//             console.log('Response:', response);
//         })
//         .catch((err) => {
//             console.error('Error:', err);
//         });
// }

// function sendDconCommand(command: string) {
//     return new Promise((resolve, reject) => {
//         // write to dcon rs485

//         client?.write(command, 'ascii', (err: any) => {
//             if (err) {
//                 return reject(err);
//             }
//             client?.on('data', (data: any) => {
//                 resolve(data.toString('ascii')); // Convert response buffer to ASCII string
//             });
//         });
//     });
// }