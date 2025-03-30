"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wordChoose = exports.chatRoom = exports.boardData = exports.chooseword = exports.getwords = exports.remove_player = exports.player_active_check = exports.heartBeat = exports.room_handler = void 0;
const roomupdate_1 = require("./roomupdate");
const room_limit = 8;
let prev_room_number = 1;
let words = [];
const room_handler = (name, rooms, wss) => {
    let room_numbers = Object.keys(rooms);
    let last_room_index = room_numbers.length - 1;
    const new_client_id = get_client_id(name);
    if (room_numbers.length && rooms[room_numbers[last_room_index]].length < room_limit) {
        rooms[room_numbers[last_room_index]].push({ name: name, clientId: new_client_id, wss: wss, isActive: true });
        return { room_id: room_numbers[last_room_index], client_id: new_client_id };
    }
    const new_room_number = JSON.stringify(get_room_number());
    rooms[new_room_number] = [{ name: name, clientId: new_client_id, wss: wss, isActive: true }];
    return { room_id: new_room_number, client_id: new_client_id };
};
exports.room_handler = room_handler;
const get_room_number = () => {
    return prev_room_number++;
};
const get_client_id = (name) => {
    const num = Math.floor(Math.random() * 10000000);
    const clientId = name + JSON.stringify(num);
    return clientId;
};
const heartBeat = (data, rooms) => {
    const roomid = data.roomdesc.roomid;
    const clientid = data.roomdesc.clientid;
    console.log("room id: ", roomid, "client id: ", clientid);
    for (let i = 0; i < rooms[roomid].length; i++) {
        if (rooms[roomid][i].clientId == clientid) {
            rooms[roomid][i].isActive = true;
            break;
        }
    }
};
exports.heartBeat = heartBeat;
const player_active_check = (rooms) => {
    console.log("player check 2s start!");
    setInterval(() => {
        Object.keys(rooms).forEach((key) => {
            new Promise((res, rej) => {
                rooms[key].forEach((player, index) => {
                    if (player.isActive)
                        player.isActive = false;
                    else
                        (0, exports.remove_player)(rooms, key, index);
                });
                res("");
            });
        });
    }, 2000);
};
exports.player_active_check = player_active_check;
const remove_player = (rooms, key, index) => {
    rooms[key].splice(index, 1);
    (0, roomupdate_1.updateroom)(rooms, key);
};
exports.remove_player = remove_player;
const SendToOther = (rooms, room_id, data, all, client_id = "") => {
    rooms[room_id].forEach(player => {
        if (player.clientId != client_id || all) {
            player.wss.send(JSON.stringify(data));
        }
    });
};
const SendSecureData = (rooms, client_id, room_id, dataforall, dataforone) => {
    rooms[room_id].forEach(player => {
        if (player.clientId != client_id) {
            player.wss.send(JSON.stringify(dataforall));
        }
        else {
            player.wss.send(JSON.stringify(dataforone));
        }
    });
};
const getwords = () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield fetch('https://random-word-api.herokuapp.com/word?number=5');
    const data = yield response.json();
    words = data;
});
exports.getwords = getwords;
const chooseword = (rooms, data) => {
    const room_id = data.header.room_id;
    const totalPlayers = rooms[room_id].length - 0.1;
    const randomPlayer = Math.floor(Math.random() * totalPlayers);
    const client_id = rooms[room_id][randomPlayer].clientId;
    const name = rooms[room_id][randomPlayer].name;
    SendSecureData(rooms, client_id, room_id, {
        type: 'chooseword',
        header: {
            client_id,
            name
        }
    }, {
        type: 'chooseword',
        header: {
            words,
            client_id,
            name
        }
    });
    (0, exports.getwords)();
};
exports.chooseword = chooseword;
const boardData = (rooms, data) => {
    const room_id = data.header.room_id;
    const client_id = data.header.client_id;
    const lines = data.header.lines;
    SendToOther(rooms, room_id, {
        type: "boarddata",
        header: {
            lines: lines
        }
    }, false, client_id);
};
exports.boardData = boardData;
const chatRoom = (rooms, data) => {
    const room_id = data.header.room_id;
    const client_id = data.header.client_id;
    const message = data.header.message;
    SendToOther(rooms, room_id, {
        type: "chat",
        header: {
            message: message
        }
    }, false, client_id);
};
exports.chatRoom = chatRoom;
const wordChoose = (rooms, data) => {
    const room_id = data.header.room_id;
    SendToOther(rooms, room_id, {
        type: "wordchoosen"
    }, true);
};
exports.wordChoose = wordChoose;
