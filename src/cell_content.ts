import { Schema, type } from "@colyseus/schema";

export abstract class CellContent extends Schema{
    @type("boolean") isBomb: Boolean = false;
}

export class BombCellContent extends CellContent {
    constructor(){
        super();
        this.isBomb = true;
    }
}

export class NumberCellContent extends CellContent {
    @type("boolean") number: number;
    constructor(number: number){
        super();
        this.number = number;
    }
}