import { WebSocket } from "ws"
import { room_handler, RoomType } from "./utils"

export const joinroom = (data:any,rooms:RoomType, wss:WebSocket ) => {
    let {room_id, client_id}  = room_handler(data.header.name,rooms,wss)
    if(rooms[room_id].length === 1){
      wss.send(JSON.stringify({
        type:"wait",
        header:{
          name:data.header.name,
          others:rooms[room_id],
          room_id: room_id,
          client_id: client_id
        }
      }))
    }else{
      rooms[room_id].forEach(el=>{
        el.wss.send(JSON.stringify({
          type:"newjoin",
          header:{
            name:data.header.name,
            others:rooms[room_id], 
            room_id: room_id,
            client_id: client_id
          }
        }))
      })
    }
}