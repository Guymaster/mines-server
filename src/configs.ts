import { config } from "dotenv";

config();

export const ServerConfig: {
    PORT: number
} = {
    PORT: Number(process.env.SERVER_PORT) | 4000
};

export const GameplayConfig: {
    MAX_PLAYERS: number
} = {
    MAX_PLAYERS: Number(process.env.GAMEPLAY_MAX_PLAYERS) | 4
};