"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const http_1 = require("http");
const utils_1 = require("./utils");
const rooms = {};
// active user check
(0, utils_1.player_active_check)(rooms);
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
            let { room_id, client_id } = (0, utils_1.room_handler)(data.header.name, rooms, wss);
            if (client_id == 0) {
                wss.send(JSON.stringify({
                    type: "wait",
                    roomdesc: {
                        roomid: room_id,
                        clientid: client_id,
                    },
                    header: {
                        name: data.header.name,
                    }
                }));
            }
            else {
                rooms[room_id].forEach(el => {
                    el.wss.send(JSON.stringify({
                        type: "newjoin",
                        roomdesc: {
                            roomid: room_id,
                            clientid: client_id,
                        },
                        header: {
                            name: data.header.name,
                            others: rooms[room_id]
                        }
                    }));
                });
            }
        }
        // heart beating condition
        if (data.type == 'heartbeat') {
            const roomid = data.roomdesc.roomid;
            const clientid = parseInt(data.roomdesc.clientid);
            console.log("rooid, clientid => ", roomid, clientid);
            rooms[roomid][clientid].isActive = true;
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
//   type: wait | newjoin | join(backend) | heartbeat(backend)
//   roomdesc:{
//            roomid:
//            clientid:
//            }
//   header:{
//             name:
//             others:[]
//          }
// }
// player leave problem
// solutions
// 1. heartbeating - via promises(break large array in chunks and do the async iteration) on backend
