import express from "express";
import WebSocket, {WebSocketServer} from 'ws'
import {createServer} from 'http'
import { room_handler, player_active_check } from "./utils";

const rooms:Record<string,Array<{name:string,wss:WebSocket, isActive:boolean}>> = {}

// active user check
player_active_check(rooms)

const app = express();
const server = createServer(app)
app.use(express.json())

const wss = new WebSocketServer({server})

wss.on("connection",(wss)=>{
    console.log("rooms: ", rooms)

    wss.on('message', (message) => {
      let data = JSON.parse(message.toString())
      // join room condition
      if(data.type == 'join'){
        let {room_id, client_id}  = room_handler(data.header.name,rooms,wss)
        if(client_id == 0){
          wss.send(JSON.stringify({
            type:"wait",
            roomdesc:{
              roomid:room_id, 
              clientid:client_id,
            },
            header:{
              name:data.header.name,
            }
          }))
        }else{
          rooms[room_id].forEach(el=>{
            el.wss.send(JSON.stringify({
              type:"newjoin",
              roomdesc:{
                roomid:room_id, 
                clientid:client_id,
              },
              header:{
                name:data.header.name,
                others:rooms[room_id]
              }
            }))
          })
        }
      } 
      
      // heart beating condition
      if(data.type == 'heartbeat'){
        const roomid = data.roomdesc.roomid
        const clientid = parseInt(data.roomdesc.clientid)
        console.log("rooid, clientid => ", roomid, clientid) 
        rooms[roomid][clientid].isActive = true;
      }

    }) 

    wss.on('close',()=>{
      console.log("player leaved")
    })

})

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