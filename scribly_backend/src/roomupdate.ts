import { RoomType } from "./utils"

export const updateroom = (rooms:RoomType,room_id:string) => {
    console.log("Updating room!!!!")
    rooms[room_id].forEach(player=>{
        player.wss.send(JSON.stringify({
            type:"updateclients",
            header:{
              others:rooms[room_id],
            }
          }))    
    })
}

