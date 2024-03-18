import { Schema, type } from "@colyseus/schema";
import { Client, Delayed, Room, ServerError } from "colyseus";
import { IncomingMessage } from "http";
import Player from "./player";
import { CellContent } from "./cell_content";
import { AvailablePlayerColors, ClientMessagesTypes, GameDifficulties, GameSteps, LOBBY_ID_CHARS, ServerErrorTypes, ServerMessagesTypes } from "./values";
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
    LOBBY_CHANNEL = "$LOBBYCHANNEL";
    public delayedInterval!: Delayed;
    rows: number;
    cols: number;
    difficulty: string = GameDifficulties.BEGINNER;
    matrix: Array<Array<Boolean>> = [];
    watchOut: boolean = false;
    takenColors: Array<number> = [];
    // When room is initialized
    async onCreate (options: GameOptions) {
        this.autoDispose = true;
        this.roomId = await this.generateRoomId();
        this.maxClients = 4;
        this.rows = options.rows? options.rows : 5;
        this.cols = options.cols? options.cols : 5;
        this.difficulty =  options.difficulty? options.difficulty : GameDifficulties.BEGINNER;
        this.watchOut = options.watchOut;
        this.setState(new GameRoomState(options.rows, options.cols));
        this.state.step = GameSteps.PLAYING;
        this.onMessage(ClientMessagesTypes.CHOOSE_CELL, (client, message) => {
            if(message.col >= this.cols || message.col < 0 || message.row >= this.rows || message.row < 0){
                return;
            }
            if(this.matrix.length == 0){
                this.revealStartingBlock(message.col, message.row);
            }
            else{
                this.revealCell(message.col, message.row, this.state.players.get(client.sessionId)!);
            }
        });
        this.onMessage(ClientMessagesTypes.CURSOR_POSITION, (client, message) => {
            this.state.players.get(client.sessionId)!.posX = message.posX;
            this.state.players.get(client.sessionId)!.posY = message.posY;
        });
        this.onMessage(ClientMessagesTypes.NEXT_GAME, (client, message) => {
            if(this.state.step != GameSteps.ENDED || this.state.nextRoomId.length != 0){
                return;
            }
            this.state.nextRoomId = message.roomId
        });
        this.onMessage(ClientMessagesTypes.ADD_FLAG_TO_CELL, (client, message) => {
            if(this.state.step != GameSteps.ENDED){
                return;
            }
            let row = message.row;
            let col = message.col;
        });
        this.onMessage(ClientMessagesTypes.REMOVE_FLAG_TO_CELL, (client, message) => {
            if(this.state.step != GameSteps.ENDED){
                return;
            }
            this.state.nextRoomId = message.roomId
        });
        this.delayedInterval = this.clock.setInterval(() => {
            if(this.state.step == GameSteps.PLAYING) this.state.count++;
        }, 1000);
    }

    // Authorize client based on provided options before WebSocket handshake is complete
    onAuth (client: Client, options: ClientOptions, request: IncomingMessage) {
        if(this.state.players.size == GameplayConfig.MAX_PLAYERS){
            throw new ServerError(400, ServerErrorTypes.FULL_ROOM);
        }
        return {
            authId: client.sessionId,
            color: (!options.color)? (()=>{
                for(let i=0; i<AvailablePlayerColors.length; i++){
                    if(!this.takenColors.includes(i)){
                        this.takenColors.push(i);
                        return AvailablePlayerColors[i];
                    }
                }
            })() : options.color,
            name: (!options.name)? `Player ${this.state.players.size + 1}` : options.name
        };
    }

    // When client successfully join the room
    onJoin (client: Client, options: any, auth: any) {console.log("JOIN WiTH: ", options, auth)
        if(![...this.state.players.keys()].includes(client.sessionId)){
            this.state.players.set(client.sessionId, new Player(auth.name, auth.color, client.sessionId));
        }
        else{
            this.state.players.get(client.sessionId)!.isActive = true;
        }
    }

    // When a client leaves the room
    async onLeave (client: Client, consented: boolean) {
        this.state.players.get(client.sessionId)!.isActive = false;
        try {
            if(consented){
                throw new Error("Client left the game");
            }
            await this.allowReconnection(client, "manual");
            this.state.players.get(client.sessionId)!.isActive = true;

        } catch (e) {
            this.state.players.delete(client.sessionId);
        }
    }

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    async onDispose () {
        this.presence.srem(this.LOBBY_CHANNEL, this.roomId);
    }

    revealStartingBlock(col: number, row: number){
        this.matrix = generateGameMatrix(this.cols, this.rows, this.difficulty, col, row);
        this.revealCell(col, row, null);
    }

    revealCell(col: number, row: number, player: Player | null){
        if(this.state.revealedContents.get(`${row}:${col}`) != undefined){
            return;
        }
        let revealedCell = this.matrix[row][col];
        console.log("REVEALED CELL: ", revealedCell)
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
        if(neighbourBombs == 0){
            neighbours.forEach(cell => {
                this.revealCell(cell.col, cell.row, player);
            });
        }
    }

    generateRoomIdSingle(): string {
        let result = '';
        for (var i = 0; i < 6; i++) {
            result += LOBBY_ID_CHARS.charAt(Math.floor(Math.random() * LOBBY_ID_CHARS.length));
        }
        return result;
    }
    async generateRoomId(): Promise<string> {
        const currentIds = await this.presence.smembers(this.LOBBY_CHANNEL);
        let id;
        do {
            id = this.generateRoomIdSingle();
        } while (currentIds.includes(id));

        await this.presence.sadd(this.LOBBY_CHANNEL, id);
        return id;
    }
    // addFlag(playerId: string, row: number, col: number){
    //     if(this.state.flags.get(`${row}:${col}`)!.find()){
    //         return;
    //     }
    //     this.flags.push(playerId);
    // }
    // removeFlag(playerId: string, row: number, col: number){
    //     this.flags = this.flags.filter(value => (value != playerId));
    // }


}

export class GameRoomState extends Schema {
    @type({
        map: Player
    }) players: Map<string, Player> = new Map<string, Player>();
    @type({map: CellContent}) revealedContents = new Map<string, CellContent>();
    @type({map: CellContent}) flags = new Map<string, Array<string>>();
    @type("string") step: string = GameSteps.WAITING;
    @type("int8") cols: number;
    @type("int8") rows: number;
    @type("int32") count: number = 0;
    @type("string") nextRoomId: string = "";
    constructor(rows: number, cols: number){
        super();
        this.rows = rows;
        this.cols = cols;
    }
}