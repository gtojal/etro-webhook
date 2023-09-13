const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');

const app = express();

const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server })

app.use(bodyParser.json());

wss.on('connection', (ws) => {
    console.log('Client connected.');

    // Handle messages from clients
    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
        // Broadcast the message to all connected clients
        wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
        });
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected.');
    });
});

app.post('/webhook', (req, res) => {
    console.log('Received Webhook:', req.body);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(req.body));
        }
    });
    return res.status(200).end();
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Webhook receiver listening on port ${PORT}`);
});