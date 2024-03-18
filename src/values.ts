export const GameSteps = {
    WAITING: "WAITING",
    PLAYING: "PLAYING",
    ENDED: "ENDED"
};

export const GameDifficulties = {
    BEGINNER: "BEGINNER",
    INTERMEDIARY: "INTERMEDIARY",
    ADVANCED: "ADVANCED"
};

export const ClientMessagesTypes = {
    CHOOSE_CELL: "CHOOSE_CELL",
    CURSOR_POSITION: "CURSOR_POSITION",
    NEXT_GAME: "NEXT_GAME",
    ADD_FLAG_TO_CELL: "ADD_FLAG_TO_CELL",
    REMOVE_FLAG_TO_CELL: "REMOVE_FLAG_TO_CELL"
};

export const ServerMessagesTypes = {
    GAME_ENDED: "GAME_ENDED",
    BOMB_REVEALED: "BOMB_REVEALED",
    NUMBER_REVEALED: "NUMBER_REVEALED"
};

export const ServerErrorTypes = {
    INVALID_DATA: "INVALID_DATA",
    FULL_ROOM: "FULL_ROOM"
};

export const AvailablePlayerColors = [
    "BLUE",
    "RED",
    "GREEN",
    "YELLOW",
];

export const LOBBY_ID_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";