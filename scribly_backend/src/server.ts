import express from "express";
import WebSocket, {WebSocketServer} from 'ws'
import {createServer} from 'http'
import { player_active_check } from "./utils";
import { joinroom } from "./roomjoin";
import { heartBeat, boardData, chatRoom, getwords, chooseword, wordChoose } from "./utils";

const rooms:Record<string,Array<{name:string,clientId:string,wss:WebSocket, isActive:boolean}>> = {}

// active user check
player_active_check(rooms)
getwords()
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
        joinroom(data, rooms, wss)
      } 
      
      // heart beating condition
      else if(data.type == 'heartbeat'){
        heartBeat(data, rooms)
      }

      else if(data.type == "boarddata"){
        boardData(rooms, data)
      }

      else if(data.type == "chat"){
        chatRoom(rooms, data)
      }

      else if(data.type == 'chooseword'){
        console.log("word choose event")
        chooseword(rooms, data)
      }

      else if(data.type == 'wordchoosen'){
        console.log("word choosed event")
        wordChoose(rooms, data)
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