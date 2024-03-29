import { CellContent } from "./cell_content";
import { GameDifficulties } from "./values";

export function generateGameMatrix(cols: number, rows: number, difficulty: string, initCol: number, initRow: number): Array<Array<Boolean>> {
  let matrix = new Array(rows).fill(null).map(() => new Array(cols).fill(false));
  const totalMines = (()=>{
    let totalCells = cols*rows;
    switch(difficulty){
        case GameDifficulties.ADVANCED:
            return Math.round((totalCells*20)/100);
        case GameDifficulties.INTERMEDIARY:
            return Math.round((totalCells*15)/100);
        default:
            return Math.round((totalCells*10)/100);
    }
  })();
  let placedMines = 0;
  while (placedMines < totalMines) {
    const ligne = Math.floor(Math.random() * rows);
    const colonne = Math.floor(Math.random() * cols);
    if (!matrix[ligne][colonne] && ligne != initRow && colonne != initCol) {
      matrix[ligne][colonne] = true;
      placedMines++;
    }
  }
  return matrix;
}

export function getAllContentsFromMatrix(matrix: Array<Array<Boolean>>): Map<string, CellContent> {
    let contents = new Map<string, CellContent>();
    for(let i=0; i<matrix.length; i++){
        for(let j=0; j<matrix[i].length; j++){
            let content: CellContent;
            if(matrix[i][j]){
                content = CellContent.bomb();
            }
            else{
                let neighbours = getCellNeighboursKeys(j, i, matrix[i].length - 1, matrix.length - 1);
                let neighbourBombs = 0;
                for(let k=0; k<neighbours.length; k++){
                    if(matrix[neighbours[k].row][neighbours[k].col]){
                        neighbourBombs++;
                    }
                }
                content = CellContent.number(neighbourBombs);
            }
            contents.set(`${i}:${j}`, content);
        }
    }
    return contents;
}

export function getCellNeighboursKeys(col: number, row: number, maxCols: number, maxRows: number): Array<{col: number, row: number}> {
    let neighbours: Array<{col: number, row: number}> = [];
    //Top
    if(row > 0){
        neighbours.push({col: col, row: row - 1});
    }
    //Bottom
    if(row < maxRows){
        neighbours.push({col: col, row: row + 1});
    }
    //Left
    if(col > 0){
        neighbours.push({col: col - 1, row: row});
    }
    //Right
    if(col < maxCols){
        neighbours.push({col: col + 1, row: row});
    }
    //Top-Right
    if(row > 0 && col < maxCols){
        neighbours.push({col: col + 1, row: row - 1});
    }
    //Top-Left
    if(row > 0 && col > 0){
        neighbours.push({col: col - 1, row: row - 1});
    }
    //Bottom-Right
    if(row < maxRows && col < maxCols){
        neighbours.push({col: col + 1, row: row + 1});
    }
    //Bottom-Left
    if(row < maxRows && col > 0){
        neighbours.push({col: col - 1, row: row + 1});
    }
    return neighbours;
}