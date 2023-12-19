import { Schema, type } from "@colyseus/schema";

export class CellContent extends Schema{
    @type("boolean") isBomb: boolean = false;
    @type("int8") number: number;
    constructor(isBomb: boolean, number: number){
        super();
        this.number = number;
        this.isBomb = isBomb;
    }
    static bomb(){
        return new CellContent(true, 0);
    }
    static number(number: number){
        return new CellContent(false, number);
    }
}