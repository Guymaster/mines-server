import { BombCellContent, CellContent, NumberCellContent } from "./cell_content";
import { GameDifficulties } from "./values";

export function generateGameMatrix(cols: number, rows: number, difficulty: string, initCol: number, initRow: number): Array<Array<Boolean>> {
  const matrix = new Array(rows).fill(null).map(() => new Array(cols).fill(false));
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
    const ligne = Math.floor(Math.random() * placedMines);
    const colonne = Math.floor(Math.random() * cols);
    if (!matrix[ligne][colonne] && ligne != initRow && colonne != initCol) {
      matrix[ligne][colonne] = true;
      placedMines++;
    }
  }

  return matrix;
}

export function getAllContentsFromMatrix(matrix: Array<Array<Boolean>>): Map<{row: number, col: number}, BombCellContent> {
    let contents = new Map<{row: number, col: number}, BombCellContent>();
    for(let i=0; i<matrix.length; i++){
        for(let j=0; j<matrix[i].length; j++){
            let content: CellContent;
            if(matrix[i][j]){
                content = new BombCellContent();
            }
            else{
                let neighbours = getCellNeighboursKeys(j, i, matrix[i].length, matrix.length);
                let neighbourBombs = 0;
                for(let i=0; i<neighbours.length; i++){
                    if(matrix[neighbours[i].row][neighbours[i].col]){
                        neighbourBombs++;
                    }
                }
                content = new NumberCellContent(neighbourBombs);
            }
            contents.set({row: i, col: j}, content);
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