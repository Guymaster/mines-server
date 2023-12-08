import { Schema, type } from "@colyseus/schema";

abstract class CellContent extends Schema{
    @type("boolean") isBomb: Boolean = false;
}

export class BombCellContent extends CellContent {
    @type("boolean") override isBomb: Boolean = true;
    constructor(isBomb: boolean){
        super();
        this.isBomb = isBomb;
    }
}

export class NumberCellContent extends CellContent {
    @type("boolean") number: number;
    constructor(number: number){
        super();
        this.number = number;
    }
}