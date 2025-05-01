import { SerialPort } from "serialport";

let serial: any = null;

export async function openSerialPort(port: string): Promise<string> {
    return new Promise((resolve, reject) => {
        serial = new SerialPort({ path: port, baudRate: 9600 }, (err: any) => {
            if (err) {
                console.log(err)
                reject(`Connection error: ${err.message}`);
                return;
            }
            console.log("Connected to serial port");
            resolve('Connected successfully');
        });

        serial.on("error", (error: any) => {
            reject(`Connection error: ${error.message}`);
        });
    });
}

export async function closeSerialPort() {
    return new Promise((resolve, reject) => {
        if (serial) {
            serial.close((err: any) => {
                if (err) {
                    reject(`Error closing serial port: ${err.message}`);
                } else {
                    console.log("Serial port closed");
                    resolve('Disconnected successfully');
                }
            });
        } else {
            reject("No active serial port to close");
        }
    });
}

export async function listSerialPorts() {
    return new Promise((resolve, reject) => {
        SerialPort.list().then(
            (ports: any[]) => resolve(ports),
            (err: any) => reject(err)
        );
    });
}

export function sendSerialData(cmd: string) {
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
            if (cmd !== '@0100\r') {
                setTimeout(() => {
                    sendSerialData('@0100\r')
                }, 1500)
            }
            console.log('Response:', response);
        })
        .catch((err) => {
            console.error('Error:', err);
        });
}

function sendDconCommand(command: string) {
    return new Promise((resolve, reject) => {
        // write to dcon rs485

        serial?.write(command, 'ascii', (err: any) => {
            if (err) {
                return reject(err);
            }
            serial?.on('data', (data: any) => {
                resolve(data.toString('ascii')); // Convert response buffer to ASCII string
            });
        });
    });
}