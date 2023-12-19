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
    CURSOR_POSITION: "CURSOR_POSITION"
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
    "C0",
    "C1",
    "C2",
    "C3",
];