"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinroom = void 0;
const utils_1 = require("./utils");
const joinroom = (data, rooms, wss) => {
    let { room_id, client_id } = (0, utils_1.room_handler)(data.header.name, rooms, wss);
    if (rooms[room_id].length === 1) {
        wss.send(JSON.stringify({
            type: "wait",
            header: {
                name: data.header.name,
                others: rooms[room_id],
                room_id: room_id,
                client_id: client_id
            }
        }));
    }
    else {
        rooms[room_id].forEach(el => {
            el.wss.send(JSON.stringify({
                type: "newjoin",
                header: {
                    name: data.header.name,
                    others: rooms[room_id],
                    room_id: room_id,
                    client_id: client_id
                }
            }));
        });
    }
};
exports.joinroom = joinroom;
