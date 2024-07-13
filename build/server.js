"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ws_1 = require("ws");
var PORT = parseInt(process.env.PORT || '3000', 10);
var wss = new ws_1.WebSocketServer({ port: PORT });
var clients = new Map(); // Maps WebSocket to a set of subscribed room IDs
wss.on('connection', function (ws) {
    var subscriptions = new Set();
    clients.set(ws, subscriptions);
    ws.on('message', function (data) {
        var msg = JSON.parse(data.toString());
        switch (msg.type) {
            case 'join':
                subscriptions.add(msg.roomId);
                console.log("Client joined room ".concat(msg.roomId));
                break;
            case 'message':
                // Send message to all clients subscribed to this room
                clients.forEach(function (rooms, client) {
                    if (rooms.has(msg.roomId) && client !== ws && client.readyState === ws_1.WebSocket.OPEN) {
                        client.send(JSON.stringify(msg));
                    }
                });
                break;
        }
    });
    ws.on('close', function () {
        clients.delete(ws);
        subscriptions.forEach(function (roomId) {
            console.log("Client removed from room ".concat(roomId));
        });
    });
});
console.log('WebSocket server started on ws://localhost:3001');
