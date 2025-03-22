import WebSocket from "ws"

const room_limit = 8
let prev_room_number = 1;

type Player = {name:string,wss:WebSocket, isActive:boolean}
type RoomType = Record<string,Array<Player>>;

export const room_handler = (name:string,rooms:RoomType,wss:WebSocket):{room_id:string, client_id:number} => {
    let room_numbers = Object.keys(rooms)
    let last_room_index = room_numbers.length - 1
    if(room_numbers.length && rooms[room_numbers[last_room_index]].length < room_limit){
        rooms[room_numbers[last_room_index]].push({name:name, wss:wss, isActive:true})
        return {room_id:room_numbers[last_room_index], client_id:rooms[room_numbers[last_room_index]].length-1}
    }
    let new_room_number = JSON.stringify(get_room_number())
    rooms[new_room_number] = [{name:name, wss:wss, isActive:true}]
    return {room_id:new_room_number, client_id:0}
}   

const get_room_number = ():number => {
    console.log("Room number: ", prev_room_number)
    return prev_room_number++;
}

export const player_active_check  = (rooms:RoomType) => {
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

const remove_player = (rooms:RoomType, key:string, index:number) => {
    rooms[key].splice(index, 1)
}