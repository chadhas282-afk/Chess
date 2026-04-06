import React, { useState, useEffect } from 'react';
import './ChessGame.css';

interface Position {
  row: number;
  col: number;
}

interface Move {
  from: Position;
  to: Position;
}

type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
type Color = 'white' | 'black';

interface Piece {
  type: PieceType;
  color: Color;
}

const ChessGame: React.FC = () => {
  const [board, setBoard] = useState<(Piece | null)[][]>(initializeBoard());
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [isWhiteTurn, setIsWhiteTurn] = useState(true);
  const [gameStatus, setGameStatus] = useState<string>('White to move');

  function initializeBoard(): (Piece | null)[][] {
    const newBoard: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
    for (let i = 0; i < 8; i++) {
      newBoard[1][i] = { type: 'pawn', color: 'black' };
      newBoard[6][i] = { type: 'pawn', color: 'white' };
    }
    const layout: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    layout.forEach((type, i) => {
      newBoard[0][i] = { type, color: 'black' };
      newBoard[7][i] = { type, color: 'white' };
    });
    return newBoard;
  }

  // --- CORE LOGIC: RAW MOVEMENT ---
  function getRawMoves(pos: Position, currentBoard: (Piece | null)[][]): Position[] {
    const piece = currentBoard[pos.row][pos.col];
    if (!piece) return [];
    const moves: Position[] = [];

    const addMoveIfValid = (r: number, c: number) => {
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        if (!currentBoard[r][c] || currentBoard[r][c]?.color !== piece.color) {
          moves.push({ row: r, col: c });
        }
      }
    };
     const addSlidingMoves = (dirs: number[][]) => {
         for (const [dr, dc] of dirs) {
           for (let i = 1; i < 8; i++) {
            if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) break;
            const target = currentBoard[nr][nc];
            if (!target) { moves.push({ row: nr, col: nc }); }
             else {
            if (target.color !== piece.color) moves.push({ row: nr, col: nc });
            break;
          }
           }
     }
  }
