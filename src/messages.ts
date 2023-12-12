import GameRoom from "./game_room";
import { ServerMessagesTypes } from "./values";

export abstract class Broadcaster {
    bombRevealed(room: GameRoom, row: number, col: number, playerId: string){
        room.broadcast(ServerMessagesTypes.BOMB_REVEALED, {
            playerId: playerId,
            row,
            col
        });
    }
    numberRevealed(room: GameRoom, row: number, col: number, number: number, playerId: string){
        room.broadcast(ServerMessagesTypes.NUMBER_REVEALED, {
            playerId: playerId,
            row,
            col
        });
    }
    gameEnded(room: GameRoom, row: number, col: number){
        room.broadcast(ServerMessagesTypes.NUMBER_REVEALED, {
            
        });
    }
};