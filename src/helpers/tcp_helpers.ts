import net from 'net';
import {
    TCP_CLOSED,
    TCP_ERROR,
    TCP_RECEIVE
} from "../helpers/ipc/tcp/tcp-channels";

let client: any = null;

export async function connectTcp(ip: any, port: any, event: any) {
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
            client.destroy();
            reject('Connection timeout');
        }, 10000);

        client.connect(port, ip, () => {
            clearTimeout(connectionTimeout);
            resolve('Connected successfully');
            client.on('data', (data: any) => {
                try {
                    const dataString = data.toString().trim();
                    event.sender.send(TCP_RECEIVE, dataString);
                } catch (parseError: any) {
                    event.sender.send(TCP_ERROR, parseError.message);
                }
            });

            client.on('close', () => {
                console.log('Connection closed');
                event.sender.send(TCP_CLOSED);
            });
        });

        client.on('error', (err: any) => {
            clearTimeout(connectionTimeout);
            reject(`Connection error: ${err.message}`);
        });
    });
}

export function closeTcpConnection() {
    return new Promise((resolve, reject) => {
        if (client && !client.destroyed) {
            client.end(() => {
                resolve('Connection closed successfully');
            });
        } else {
            reject('No active connection to close');
        }
    });
}
