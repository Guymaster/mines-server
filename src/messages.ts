import GameRoom from "./game_room";
import Player from "./player";
import { ServerMessagesTypes } from "./values";

export abstract class Broadcaster {
    static bombRevealed(room: GameRoom, row: number, col: number, playerId: string){
        room.broadcast(ServerMessagesTypes.BOMB_REVEALED, {
            playerId: playerId,
            row,
            col
        });
    }
    static numberRevealed(room: GameRoom, row: number, col: number, number: number, playerId: string | null){
        room.broadcast(ServerMessagesTypes.NUMBER_REVEALED, {
            playerId: playerId,
            row,
            col,
            number: number
        });
    }
    static gameEnded(room: GameRoom){
        let ranking: Array<Player> = [...room.state.players.values()].sort((p1, p2) => {
            if(p1.score < p2.score){
                return -1;
            }
            if(p1.score > p2.score){
                return 1;
            }
            return 0;
        });
        room.broadcast(ServerMessagesTypes.NUMBER_REVEALED, {
            ranking
        });
    }
};