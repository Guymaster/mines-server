// Colyseus + Express
import { Server } from "colyseus";
import { createServer } from "http";
import express from "express";
import GameRoom from "./game_room";
import { ServerConfig } from "./configs";
import { playground } from "@colyseus/playground";

const port = ServerConfig.PORT;

const app = express();
app.use(express.json());

app.use("/playground", playground);

const gameServer = new Server({
  server: createServer(app)
});

gameServer.define("CLASSIC", GameRoom);

gameServer.listen(port);