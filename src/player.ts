import { Schema, type } from "@colyseus/schema";

export default class Player extends Schema {
    @type("string") name: string;
    @type("number") score: number;
    @type("string") color: string;
    @type("number") posX: number;
    @type("number") posY: number;
    @type("boolean") isActive: boolean = true;

    constructor(name: string, color: string){
        super();
        this.name = name;
        this.color = color;
    }
}