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
}