import { Schema, type } from "@colyseus/schema";
import { Client, Room, ServerError } from "colyseus";
import { IncomingMessage } from "http";
import Player from "./player";
import { BombCellContent, NumberCellContent } from "./cell_content";
import { AvailablePlayerColors, ClientMessagesTypes, GameSteps, ServerErrorTypes, ServerMessagesTypes } from "./values";
import { generateGameMatrix, getCellNeighboursKeys } from "./matrix";
import { GameplayConfig } from "./configs";

type GameOptions = {
    rows: number,
    cols: number,
    difficulty: string
};

type ClientOptions = {
    color: number,
    name: string,
};

export default class GameRoom extends Room<GameRoomState> {
    rows: number;
    cols: number;
    difficulty: string;
    matrix: Array<Array<BombCellContent>> = [];
    takenColors: Array<number> = [];
    // When room is initialized
    onCreate (options: GameOptions) {
        this.rows = options.rows;
        this.cols = options.cols;
        this.difficulty =  options.difficulty;
        this.setState(new GameRoomState());
        this.state.step = GameSteps.PLAYING;
        this.onMessage(ClientMessagesTypes.CHOOSE_CELL, (client, message) => {
            if(message.col >= this.cols || message.col < 0 || message.col >= this.rows || message.row){
                return;
            }
            if(this.matrix.length == 0){
                this.revealStartingBlock(message.col, message.row);
            }
        });
    }

    // Authorize client based on provided options before WebSocket handshake is complete
    onAuth (client: Client, options: ClientOptions, request: IncomingMessage) {
        if(this.state.players.size == GameplayConfig.MAX_PLAYERS){
            throw new ServerError(400, ServerErrorTypes.FULL_ROOM);
        }
        return {
            authId: client.sessionId,
            color: (!options.color || isNaN(options.color) || !Number.isInteger(options.color) || options.color >= AvailablePlayerColors.length)? (()=>{
                for(let i=0; i<AvailablePlayerColors.length; i++){
                    if(!this.takenColors.includes(i)){
                        this.takenColors.push(i);
                        return i;
                    }
                }
            })() : options.color,
            name: (!options.name || this.state.players.size == GameplayConfig.MAX_PLAYERS || options.name.length>20 || ([...this.state.players.keys()].includes(options.name) && this.state.players.get(options.name)?.isActive))? `Player ${this.state.players.size + 1}` : options.name
        };
    }

    // When client successfully join the room
    onJoin (client: Client, options: any, auth: any) {
        if(![...this.state.players.keys()].includes(client.sessionId)){
            this.state.players.set(client.sessionId, new Player(auth.name, AvailablePlayerColors[auth.color]));
        }
        else{
            this.state.players.get(client.sessionId)!.isActive = true;
        }
    }

    // When a client leaves the room
    async onLeave (client: Client, consented: boolean) {
        this.state.players.get(client.sessionId)!.isActive = false;
        try {
            await this.allowReconnection(client, "manual");
            this.state.players.get(client.sessionId)!.isActive = true;

        } catch (e) {
            this.state.players.delete(client.sessionId);
        }
    }

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose () { }

    revealStartingBlock(col: number, row: number){
        this.matrix = generateGameMatrix(this.cols, this.rows, this.difficulty, col, row);
        this.revealCell(col, row, null);
    }

    revealCell(col: number, row: number, player: Player | null){
        let revealedCell = this.matrix[row][col];
        if(revealedCell.isBomb){  
            //TODO Broadcast END
            //TODO Broadcast all contents
            this.state.step = GameSteps.ENDED;
            return;
        }
        let neighbours = getCellNeighboursKeys(col, row, this.cols, this.rows);
        let neighbourBombs = 0;
        for(let i=0; i<neighbours.length; i++){
            if(this.matrix[neighbours[i].row][neighbours[i].col]){
                neighbourBombs++;
            }
        }
        //TODO Broadcast reveal
        this.state.revealedContents.set({row: row, col: col}, new NumberCellContent(neighbourBombs));
    }
}

export class GameRoomState extends Schema {
    @type({
        map: Player
    }) players: Map<string, Player> = new Map<string, Player>();
    @type({map: BombCellContent}) revealedContents = new Map<{row: number, col: number}, BombCellContent>();
    @type("string") step: string = GameSteps.WAITING;
}