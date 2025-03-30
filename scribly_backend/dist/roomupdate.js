"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateroom = void 0;
const updateroom = (rooms, room_id) => {
    console.log("Updating room!!!!");
    rooms[room_id].forEach(player => {
        player.wss.send(JSON.stringify({
            type: "updateclients",
            header: {
                others: rooms[room_id],
            }
        }));
    });
};
exports.updateroom = updateroom;
