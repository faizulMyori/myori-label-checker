import net from 'net';
import {
    TCP_CLOSED,
    TCP_ERROR,
    TCP_RECEIVE
} from "../helpers/ipc/tcp/tcp-channels";

let client: any = null;

export async function connectTcp(ip: any, port: any, event: any) {
    console.log(ip)
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

export function sendData(cmd: string) {
    //0 = RESET
    //1 = DO0
    //2 = DO1
    //3 = DO0 & DO1
    //4 = DO2
    //5 = DO0 & DO2
    //6 = DO1 & DO2
    //7 = DO0 & DO1 & DO2
    //8 = DO3
    //9 = DO0 & DO3
    //10 = DO4
    console.log(cmd)
    sendDconCommand(cmd)
        .then((response) => {
            // if (cmd !== '@0100\r') sendData('@0100\r')
            console.log('Response:', response);
        })
        .catch((err) => {
            console.error('Error:', err);
        });
}

function sendDconCommand(command:string) {
    return new Promise((resolve, reject) => {
        // write to dcon rs485
        
        client.write(command, 'ascii', (err:any) => {
            if (err) {
                return reject(err);
            }
            client.on('data', (data:any) => {
                resolve(data.toString('ascii')); // Convert response buffer to ASCII string
            });
        });
    });
}