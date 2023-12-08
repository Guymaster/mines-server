import { Schema, type } from "@colyseus/schema";

export default class Player extends Schema {
    @type("number") name: string;
    @type("number") score: number;
    @type("number") color: string;
    @type("number") posX: number;
    @type("number") posY: number;

    constructor(name: string, score: number, color: string){
        super();
        this.name = name;
        this.score = score;
        this.color = color;
    }
}