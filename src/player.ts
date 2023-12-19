import { Schema, type } from "@colyseus/schema";

export default class Player extends Schema {
    @type("string") name: string;
    @type("string") id: string;
    @type("number") score: number = 0;
    @type("string") color: string;
    @type("number") posX: number = 0;
    @type("number") posY: number = 0;
    @type("boolean") isActive: boolean = true;

    constructor(name: string, color: string, id: string){
        super();
        this.name = name;
        this.color = color;
        this.id = id;
    }
}