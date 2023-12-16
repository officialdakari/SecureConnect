const { encrypt, decrypt } = require('./encryption');
const fs = require('fs');
const url = require('url');
const YAML = require('yaml');
const http = require('http');
const https = require('https');
const ws = require('ws');
const net = require('net');
const { packServiceData } = require('./serializer');

const config = YAML.parse(fs.readFileSync('config.yml', 'utf-8'));

globalThis.config = config;

var server;

if (config.key_path && config.cert_path) {
    server = https.createServer({
        key: fs.readFileSync(config.key_path),
        cert: fs.readFileSync(config.cert_path),
        passphrase: config.passphrase
    }, (req, res) => {
        console.log(`${req.method} ${req.url}`);
    });
} else {
    server = http.createServer((req, res) => {
        console.log(`${req.method} ${req.url}`);
    });
}

const wss = new ws.WebSocketServer({
    server,
    path: config.path
});

wss.on('connection', async (client) => {
    var packets = [];
    setInterval(async () => {
        packets = packets.sort((a, b) => a.timestamp - b.timestamp);
        for (const msg of packets) {
            packets.shift();
            try {
                await require(`./handlers/${msg._}`)(msg, client);
            } catch (error) {
                client.send(
                    packServiceData(
                        true,
                        [
                            {
                                handler: 'Root',
                                type: 'Error',
                                message: `Handler error for ${msg._}`
                            }
                        ]
                    )
                );
                console.error(error);
            }
        }
    }, 1);
    client.on('message', async (message, isBinary) => {
        if (!isBinary) {
            const msg = YAML.parse(message.toString('utf-8'));
            packets.push(msg);
        }
    });
});

server.on('request', (req, res) => {
    req.on('end', () => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Hello World');
    });
});

server.listen(config.port);

globalThis.config = config;
globalThis.server = server;
globalThis.wss = wss;
globalThis.YAML = YAML;
globalThis.tunnels = {};