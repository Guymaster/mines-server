import { Schema, type } from "@colyseus/schema";
import { Client, Room, ServerError } from "colyseus";
import { IncomingMessage } from "http";
import Player from "./player";
import { CellContent } from "./cell_content";
import { AvailablePlayerColors, ClientMessagesTypes, GameDifficulties, GameSteps, ServerErrorTypes, ServerMessagesTypes } from "./values";
import { generateGameMatrix, getAllContentsFromMatrix, getCellNeighboursKeys } from "./matrix";
import { GameplayConfig } from "./configs";
import { Broadcaster } from "./messages";

type GameOptions = {
    rows: number,
    cols: number,
    difficulty: string,
    watchOut: boolean
};

type ClientOptions = {
    color: number,
    name: string,
};

export default class GameRoom extends Room<GameRoomState> {
    rows: number;
    cols: number;
    difficulty: string = GameDifficulties.BEGINNER;
    matrix: Array<Array<Boolean>> = [];
    watchOut: boolean = false;
    takenColors: Array<number> = [];
    // When room is initialized
    onCreate (options: GameOptions) {
        this.rows = options.rows? options.rows : 5;
        this.cols = options.cols? options.cols : 5;
        this.difficulty =  options.difficulty? options.difficulty : GameDifficulties.BEGINNER;
        this.watchOut = options.watchOut;
        this.setState(new GameRoomState());
        this.state.step = GameSteps.PLAYING;
        this.onMessage(ClientMessagesTypes.CHOOSE_CELL, (client, message) => {
            if(message.col >= this.cols || message.col < 0 || message.col >= this.rows || message.row >= this.rows){
                return;
            }
            if(this.matrix.length == 0){
                this.revealStartingBlock(message.col, message.row);
            }
            else{
                this.revealCell(message.col, message.row, this.state.players.get(client.sessionId)!);
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
            this.state.players.set(client.sessionId, new Player(auth.name, AvailablePlayerColors[auth.color], client.sessionId));
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
        if(this.state.revealedContents.get(`${row}:${col}`) != undefined){
            return;
        }
        let revealedCell = this.matrix[row][col];
        if(revealedCell){
            this.state.revealedContents = getAllContentsFromMatrix(this.matrix);
            Broadcaster.bombRevealed(this, row, col, player!.id);
            this.state.step = GameSteps.ENDED;
            Broadcaster.gameEnded(this);
            return;
        }
        let neighbours = getCellNeighboursKeys(col, row, this.cols - 1, this.rows - 1);
        let neighbourBombs = 0;
        for(let i=0; i<neighbours.length; i++){
            if(this.matrix[neighbours[i].row][neighbours[i].col]){
                neighbourBombs++;
            }
        }
        this.state.revealedContents.set(`${row}:${col}`, CellContent.number(neighbourBombs));
        if(player){
            this.state.players.get(player.id)!.score = this.state.players.get(player.id)!.score + neighbourBombs;
        }
        Broadcaster.numberRevealed(this, row, col, neighbourBombs, player? player.id : null);
    }
}

export class GameRoomState extends Schema {
    @type({
        map: Player
    }) players: Map<string, Player> = new Map<string, Player>();
    @type({map: CellContent}) revealedContents = new Map<string, CellContent>();
    @type("string") step: string = GameSteps.WAITING;
}