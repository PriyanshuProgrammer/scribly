"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const http_1 = require("http");
const utils_1 = require("./utils");
const roomjoin_1 = require("./roomjoin");
const utils_2 = require("./utils");
const rooms = {};
// active user check
(0, utils_1.player_active_check)(rooms);
(0, utils_2.getwords)();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
app.use(express_1.default.json());
const wss = new ws_1.WebSocketServer({ server });
wss.on("connection", (wss) => {
    console.log("rooms: ", rooms);
    wss.on('message', (message) => {
        let data = JSON.parse(message.toString());
        // join room condition
        if (data.type == 'join') {
            (0, roomjoin_1.joinroom)(data, rooms, wss);
        }
        // heart beating condition
        else if (data.type == 'heartbeat') {
            (0, utils_2.heartBeat)(data, rooms);
        }
        else if (data.type == "boarddata") {
            (0, utils_2.boardData)(rooms, data);
        }
        else if (data.type == "chat") {
            (0, utils_2.chatRoom)(rooms, data);
        }
        else if (data.type == 'chooseword') {
            console.log("word choose event");
            (0, utils_2.chooseword)(rooms, data);
        }
        else if (data.type == 'wordchoosen') {
            console.log("word choosed event");
            (0, utils_2.wordChoose)(rooms, data);
        }
    });
    wss.on('close', () => {
        console.log("player leaved");
    });
});
app.get("/", (req, res) => {
    res.send("Hello World!");
});
server.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
// {
//   type: wait | newjoin | join(backend) | heartbeat(backend) | updateclients } chooseword
//   header:{
//             name:
//             room_id: 
//             client_id : 
//             others:[]
//          }
// }
// player leave problem
// solutions
// 1. heartbeating - via promises(break large array in chunks and do the async iteration) on backend
