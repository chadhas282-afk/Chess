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
          const nr = pos.row + dr * i, nc = pos.col + dc * i;
          if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) break;
          const target = currentBoard[nr][nc];
          if (!target) { moves.push({ row: nr, col: nc }); }
          else {
            if (target.color !== piece.color) moves.push({ row: nr, col: nc });
            break;
          }
        }
      }
    };

    switch (piece.type) {
      case 'pawn':
        const dir = piece.color === 'white' ? -1 : 1;
        if (pos.row + dir >= 0 && pos.row + dir < 8 && !currentBoard[pos.row + dir][pos.col]) {
          moves.push({ row: pos.row + dir, col: pos.col });
          const startRow = piece.color === 'white' ? 6 : 1;
          if (pos.row === startRow && !currentBoard[pos.row + 2 * dir][pos.col])
            moves.push({ row: pos.row + 2 * dir, col: pos.col });
        }
        [-1, 1].forEach(dc => {
          const nr = pos.row + dir, nc = pos.col + dc;
          if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && currentBoard[nr][nc]?.color && currentBoard[nr][nc]?.color !== piece.color)
            moves.push({ row: nr, col: nc });
        });
        break;
      case 'rook': addSlidingMoves([[0, 1], [0, -1], [1, 0], [-1, 0]]); break;
      case 'bishop': addSlidingMoves([[1, 1], [1, -1], [-1, 1], [-1, -1]]); break;
      case 'queen': addSlidingMoves([[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]); break;
      case 'knight': [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]].forEach(([dr, dc]) => addMoveIfValid(pos.row + dr, pos.col + dc)); break;
      case 'king':
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++)
            if (dr !== 0 || dc !== 0) addMoveIfValid(pos.row + dr, pos.col + dc);
        break;
    }
    return moves;
  }

  function findKing(color: Color, currentBoard: (Piece | null)[][]): Position {
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (currentBoard[r][c]?.type === 'king' && currentBoard[r][c]?.color === color)
          return { row: r, col: c };
    return { row: -1, col: -1 };
  }

  function isCheck(color: Color, currentBoard: (Piece | null)[][]): boolean {
    const kingPos = findKing(color, currentBoard);
    const opponentColor = color === 'white' ? 'black' : 'white';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (currentBoard[r][c]?.color === opponentColor) {
          const moves = getRawMoves({ row: r, col: c }, currentBoard);
          if (moves.some(m => m.row === kingPos.row && m.col === kingPos.col)) return true;
        }
      }
    }
    return false;
  }

  function getLegalMoves(pos: Position): Position[] {
    const piece = board[pos.row][pos.col];
    if (!piece) return [];
    const rawMoves = getRawMoves(pos, board);

    return rawMoves.filter(move => {
      const tempBoard = board.map(row => [...row]);
      tempBoard[move.row][move.col] = piece;
      tempBoard[pos.row][pos.col] = null;
      return !isCheck(piece.color, tempBoard);
    });
  }

  useEffect(() => {
    const turnColor = isWhiteTurn ? 'white' : 'black';
    const inCheck = isCheck(turnColor, board);

    let hasMoves = false;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c]?.color === turnColor && getLegalMoves({ row: r, col: c }).length > 0) {
          hasMoves = true; break;
        }
      }
      if (hasMoves) break;
    }

    if (!hasMoves) {
      setGameStatus(inCheck ? `CHECKMATE! ${isWhiteTurn ? 'Black' : 'White'} Wins!` : "STALEMATE!");
    } else {
      setGameStatus(`${isWhiteTurn ? "White's" : "Black's"} Turn ${inCheck ? "(CHECK)" : ""}`);
    }
  }, [isWhiteTurn, board]);

  function handleSquareClick(row: number, col: number) {
    if (gameStatus.includes("Win") || gameStatus.includes("STALEMATE")) return;

    if (selectedSquare && validMoves.some(m => m.row === row && m.col === col)) {
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = board[selectedSquare.row][selectedSquare.col];
      newBoard[selectedSquare.row][selectedSquare.col] = null;
      setBoard(newBoard);
      setSelectedSquare(null);
      setValidMoves([]);
      setIsWhiteTurn(!isWhiteTurn);
      return;
    }

    const piece = board[row][col];
    if (piece && piece.color === (isWhiteTurn ? 'white' : 'black')) {
      setSelectedSquare({ row, col });
      setValidMoves(getLegalMoves({ row, col }));
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  }

  const getPieceSymbol = (piece: Piece | null) => {
    if (!piece) return '';
    const symbols: Record<PieceType, string> = {
      pawn: piece.color === 'white' ? '♙' : '♟',
      rook: piece.color === 'white' ? '♖' : '♜',
      knight: piece.color === 'white' ? '♘' : '♞',
      bishop: piece.color === 'white' ? '♗' : '♝',
      queen: piece.color === 'white' ? '♕' : '♛',
      king: piece.color === 'white' ? '♔' : '♚',
    };
    return symbols[piece.type];
  };

  return (
    <div className="chess-game">
       <h2>{gameStatus}</h2>
       <div className="chess-board">
        
       </div>
    </div>