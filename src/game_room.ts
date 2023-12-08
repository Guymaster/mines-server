import { Schema, type } from "@colyseus/schema";
import { Client, Room } from "colyseus";
import { IncomingMessage } from "http";
import Player from "./player";
import { BombCellContent } from "./cell_content";
import { GameSteps } from "./values";
import { generateGameMatrix } from "./matrix";

type GameOptions = {
    rows: number,
    cols: number,
    difficulty: string
};

type ClientOptions = {
    color: string,
    name: string,
};

export default class GameRoom extends Room<GameRoomState> {
    matrix: Array<Array<BombCellContent>> = [];
    // When room is initialized
    onCreate (options: GameOptions) {
        this.setState(new GameRoomState());
        this.matrix = generateGameMatrix(options.cols, options.rows, options.difficulty);
        this.state.step = GameSteps.PLAYING;
    }

    // Authorize client based on provided options before WebSocket handshake is complete
    onAuth (client: Client, options: any, request: IncomingMessage) { }

    // When client successfully join the room
    onJoin (client: Client, options: any, auth: any) { }

    // When a client leaves the room
    onLeave (client: Client, consented: boolean) { }

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose () { }

    revealCell(col: number, row: number, player: Player | null){
        let revealedCell = this.matrix[row][col];
        if(revealedCell.isBomb){
            this.state.step = GameSteps.ENDED;
            return;
        }
    }
}

export class GameRoomState extends Schema {
    @type({
        map: Player
    }) players: Map<string, Player>;
    @type({map: BombCellContent}) revealedContents = new Map<string, BombCellContent>();
    @type("string") step: string = GameSteps.WAITING;
}