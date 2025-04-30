import { SerialPort } from "serialport";

let serial: SerialPort | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;
let currentPortPath: string | null = null;

export async function openSerialPort(port: string): Promise<string> {
    return new Promise((resolve, reject) => {
        currentPortPath = port;

        serial = new SerialPort({ path: port, baudRate: 9600 }, (err: any) => {
            if (err) {
                console.log(err);
                reject(`Connection error: ${err.message}`);
                return;
            }

            console.log("Connected to serial port");
            attachSerialListeners();
            startHeartbeat();
            resolve('Connected successfully');
        });
    });
}

export async function closeSerialPort(): Promise<string> {
    return new Promise((resolve, reject) => {
        if (serial) {
            stopHeartbeat();
            serial.close((err: any) => {
                if (err) {
                    reject(`Error closing serial port: ${err.message}`);
                } else {
                    console.log("Serial port closed");
                    serial = null;
                    resolve('Disconnected successfully');
                }
            });
        } else {
            reject("No active serial port to close");
        }
    });
}

export async function listSerialPorts(): Promise<any[]> {
    return SerialPort.list();
}

export function sendSerialData(cmd: string) {
    if (!serial || !serial.isOpen) {
        console.error("Serial port is not open.");
        return;
    }

    console.log("Sending:", cmd);

    sendDconCommand(cmd)
        .then((response) => {
            if (cmd !== '@0100\r') {
                setTimeout(() => {
                    sendSerialData('@0100\r');
                }, 1500);
            }
            console.log('Response:', response);
        })
        .catch((err) => {
            console.error('Error sending command:', err);
        });
}

function sendDconCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!serial || !serial.isOpen) {
            return reject(new Error("Serial port is not open."));
        }

        serial.write(command, 'ascii', (err: any) => {
            if (err) return reject(err);

            serial.once('data', (data: Buffer) => {
                resolve(data.toString('ascii'));
            });
        });
    });
}

function startHeartbeat() {
    if (heartbeatInterval) return;

    heartbeatInterval = setInterval(() => {
        if (serial && serial.isOpen) {
            sendDconCommand('@0100\r')
                .then(response => {
                    console.log('Heartbeat:', response.trim());
                })
                .catch(err => {
                    console.error('Heartbeat error:', err.message);
                    attemptReconnect();
                });
        }
    }, 5000); // 5 seconds
}

function stopHeartbeat() {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }
}

function attachSerialListeners() {
    if (!serial) return;

    serial.on('close', () => {
        console.warn('Serial port closed unexpectedly.');
        stopHeartbeat();
        attemptReconnect();
    });

    serial.on('error', (err: any) => {
        console.error('Serial port error:', err.message);
        stopHeartbeat();
        attemptReconnect();
    });
}

function attemptReconnect() {
    if (!currentPortPath) {
        console.warn("No port path saved; cannot reconnect.");
        return;
    }

    console.log('Reconnecting in 5 seconds...');
    setTimeout(async () => {
        try {
            await openSerialPort(currentPortPath);
            console.log('Reconnected to serial port.');
        } catch (err) {
            console.error('Reconnect failed:', err);
            attemptReconnect(); // Keep retrying
        }
    }, 5000);
}
