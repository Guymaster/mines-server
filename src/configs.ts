import { config } from "dotenv";

config();

export const ServerConfig = {
    PORT: Number(process.env.PORT) | 4000,
    NODE_ENV: process.env.NODE_ENV
};

export const GameplayConfig = {
    MAX_PLAYERS: Number(process.env.GAMEPLAY_MAX_PLAYERS) | 4
};