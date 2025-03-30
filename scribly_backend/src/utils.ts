import WebSocket from "ws"
import { updateroom } from "./roomupdate";

const room_limit = 8
let prev_room_number = 1;
let words:Array<string> = []

type Player ={name:string,clientId:string,wss:WebSocket, isActive:boolean}
export type RoomType = Record<string,Array<Player>>;

export const room_handler = (name:string,rooms:RoomType,wss:WebSocket):{room_id:string, client_id:string} => {
    let room_numbers = Object.keys(rooms)
    let last_room_index = room_numbers.length - 1
    const new_client_id = get_client_id(name)
    if(room_numbers.length && rooms[room_numbers[last_room_index]].length < room_limit){
        rooms[room_numbers[last_room_index]].push({name:name, clientId:new_client_id, wss:wss, isActive:true})
        return {room_id:room_numbers[last_room_index], client_id:new_client_id}
    }
    const new_room_number = JSON.stringify(get_room_number())
    rooms[new_room_number] = [{name:name, clientId: new_client_id, wss:wss, isActive:true}]
    return {room_id:new_room_number, client_id:new_client_id}
}   

const get_room_number = ():number => {
    return prev_room_number++;
}

const get_client_id = (name:string) => { 
    const num = Math.floor(Math.random() * 10000000)
    const clientId = name + JSON.stringify(num)
    return clientId;
}

export const heartBeat = (data:any, rooms:RoomType) => {
    const roomid = data.roomdesc.roomid
    const clientid =data.roomdesc.clientid
    console.log("room id: ", roomid, "client id: ", clientid) 
    for(let i = 0; i < rooms[roomid].length; i++){
        if(rooms[roomid][i].clientId == clientid){
            rooms[roomid][i].isActive = true;
            break;
        }
    }
}

export const player_active_check  = (rooms:RoomType) => {
    console.log("player check 2s start!")
    setInterval(() => {
        Object.keys(rooms).forEach((key)=>{
            new Promise((res,rej)=>{
                rooms[key].forEach((player, index)=>{
                    if(player.isActive)
                        player.isActive = false;
                    else 
                        remove_player(rooms, key, index)
                })
                res("")
            })
        })
    }, 2000);
}

export const remove_player = (rooms:RoomType, key:string, index:number) => {
    rooms[key].splice(index, 1)
    updateroom(rooms, key)
}

const SendToOther = (rooms:RoomType, room_id:string, data:{}, all:boolean, client_id:string = "") => {
    rooms[room_id].forEach(player => {
        if(player.clientId != client_id || all){
            player.wss.send(JSON.stringify(data))
        }
    }); 
}

const SendSecureData = (rooms:RoomType, client_id:string, room_id:string, dataforall:{}, dataforone:{}) => {
    rooms[room_id].forEach(player => {
        if(player.clientId != client_id){
            player.wss.send(JSON.stringify(dataforall))
        }else{
            player.wss.send(JSON.stringify(dataforone))
        }
    }); 
}

export const getwords = async () => {
    const response = await fetch('https://random-word-api.herokuapp.com/word?number=5')
    const data = await response.json() 
    words = data;
}

export const chooseword = (rooms:RoomType, data:any) => {
    const room_id = data.header.room_id;
    const totalPlayers = rooms[room_id].length - 0.1
    const randomPlayer = Math.floor(Math.random()*totalPlayers)
    const client_id = rooms[room_id][randomPlayer].clientId;
    const name = rooms[room_id][randomPlayer].name
    SendSecureData(rooms, client_id, room_id,{
        type:'chooseword', 
        header:{
            client_id, 
            name
        }
    }, {
        type:'chooseword', 
        header:{
            words,
            client_id, 
            name
        }
    })
    getwords();
}

export const boardData = (rooms:RoomType, data:any) => {
    const room_id = data.header.room_id;
    const client_id = data.header.client_id;
    const lines = data.header.lines;
    SendToOther(rooms, room_id, {
        type:"boarddata", 
        header:{
            lines:lines
        }
    },false, client_id)
}

export const chatRoom = (rooms:RoomType, data:any) => {
    const room_id = data.header.room_id;
    const client_id = data.header.client_id;
    const message = data.header.message;
    SendToOther(rooms,room_id, {
        type:"chat", 
        header:{
            message:message
        }
    }, false, client_id)
}

export const wordChoose = (rooms:RoomType, data:any) => {
    const room_id = data.header.room_id;
    SendToOther(rooms,room_id,{
        type:"wordchoosen"
    }, true)
}