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