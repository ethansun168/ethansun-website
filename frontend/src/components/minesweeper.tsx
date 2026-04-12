import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Bomb, Flag } from "lucide-react";

type Difficulty = "easy" | "medium" | "hard";

const DIFFS: Record<Difficulty, { rows: number; cols: number; mines: number; label: string }> = {
  easy: { rows: 9, cols: 9, mines: 10, label: "Easy" },
  medium: { rows: 16, cols: 16, mines: 40, label: "Medium" },
  hard: { rows: 16, cols: 30, mines: 99, label: "Hard" },
};

type CellState = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
};

type GameStatus = "idle" | "playing" | "won" | "lost";

function createBoard(rows: number, cols: number): CellState[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      adjacentMines: 0,
    }))
  );
}

function placeMines(
  board: CellState[][],
  rows: number,
  cols: number,
  mines: number,
  safeR: number,
  safeC: number
): CellState[][] {
  const next = board.map(row => row.map(cell => ({ ...cell })));
  const safe = new Set<number>();
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      const nr = safeR + dr, nc = safeC + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols)
        safe.add(nr * cols + nc);
    }

  const placed = new Set<number>();
  while (placed.size < mines) {
    const idx = Math.floor(Math.random() * rows * cols);
    if (!safe.has(idx)) placed.add(idx);
  }

  placed.forEach(idx => {
    next[Math.floor(idx / cols)][idx % cols].isMine = true;
  });

  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (next[r][c].isMine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && next[nr][nc].isMine)
            count++;
        }
      next[r][c].adjacentMines = count;
    }

  return next;
}

function floodReveal(board: CellState[][], rows: number, cols: number, r: number, c: number): CellState[][] {
  const next = board.map(row => row.map(cell => ({ ...cell })));
  const stack = [[r, c]];
  while (stack.length) {
    const [cr, cc] = stack.pop()!;
    if (cr < 0 || cr >= rows || cc < 0 || cc >= cols) continue;
    if (next[cr][cc].isRevealed || next[cr][cc].isFlagged) continue;
    next[cr][cc].isRevealed = true;
    if (next[cr][cc].adjacentMines === 0 && !next[cr][cc].isMine) {
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++)
          stack.push([cr + dr, cc + dc]);
    }
  }
  return next;
}

const NUMBER_COLORS: Record<number, string> = {
  1: "text-blue-600 dark:text-blue-400",
  2: "text-green-600 dark:text-green-400",
  3: "text-red-500 dark:text-red-400",
  4: "text-indigo-700 dark:text-indigo-400",
  5: "text-red-800 dark:text-red-300",
  6: "text-teal-600 dark:text-teal-400",
  7: "text-purple-700 dark:text-purple-400",
  8: "text-gray-500 dark:text-gray-400",
};

function Cell({
  cell,
  isHit,
  gameOver,
  onReveal,
  onFlag,
  onChord,
}: {
  cell: CellState;
  isHit: boolean;
  gameOver: boolean;
  onReveal: () => void;
  onFlag: (e: React.MouseEvent) => void;
  onChord: () => void;
}) {
  const handleClick = () => {
    if (cell.isRevealed) onChord();
    else onReveal();
  };

  return (
    <button
      className={cn(
        "w-8 h-8 flex items-center justify-center text-xs font-bold select-none transition-colors border-r border-b border-border/40 last:border-r-0",
        !cell.isRevealed && !cell.isFlagged && "bg-muted hover:bg-muted/60 active:bg-background cursor-pointer",
        !cell.isRevealed && cell.isFlagged && "bg-muted cursor-pointer",
        cell.isRevealed && !cell.isMine && "bg-background cursor-default",
        cell.isRevealed && cell.isMine && !isHit && "bg-background",
        isHit && "bg-red-100 dark:bg-red-950",
        gameOver && !cell.isRevealed && !cell.isFlagged && "cursor-default",
      )}
      onClick={handleClick}
      onContextMenu={onFlag}
      disabled={gameOver && !cell.isRevealed}
    >
      {!cell.isRevealed && cell.isFlagged && <Flag className="w-3 h-3 text-red-500 fill-red-500" />}
      {cell.isRevealed && cell.isMine && (isHit ? <Bomb className="w-3 h-3 text-red-500 fill-red-500" /> : <Bomb className="w-3 h-3 text-foreground" />)}
      {cell.isRevealed && !cell.isMine && cell.adjacentMines > 0 && (
        <span className={NUMBER_COLORS[cell.adjacentMines]}>{cell.adjacentMines}</span>
      )}
    </button>
  );
}

export default function Minesweeper() {
  const [diff, setDiff] = useState<Difficulty>("easy");
  const [board, setBoard] = useState<CellState[][]>(() => createBoard(9, 9));
  const [status, setStatus] = useState<GameStatus>("idle");
  const [hitCell, setHitCell] = useState<[number, number] | null>(null);
  const [flagCount, setFlagCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const firstClick = useRef(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cfg = DIFFS[diff];

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => setElapsed(e => Math.min(e + 1, 999)), 1000);
  }, [stopTimer]);

  const newGame = useCallback((d: Difficulty = diff) => {
    stopTimer();
    setDiff(d);
    setBoard(createBoard(DIFFS[d].rows, DIFFS[d].cols));
    setStatus("idle");
    setHitCell(null);
    setFlagCount(0);
    setElapsed(0);
    firstClick.current = true;
  }, [diff, stopTimer]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  const checkWin = useCallback((b: CellState[][], mines: number) => {
    let unrevealed = 0;
    for (const row of b) for (const cell of row) if (!cell.isRevealed) unrevealed++;
    return unrevealed === mines;
  }, []);

  const handleReveal = useCallback((r: number, c: number) => {
    if (status === "lost" || status === "won") return;
    let b = board;
    if (firstClick.current) {
      firstClick.current = false;
      b = placeMines(board, cfg.rows, cfg.cols, cfg.mines, r, c);
      startTimer();
      setStatus("playing");
    }
    if (b[r][c].isMine) {
      const revealed = b.map((row) =>
        row.map((cell) => ({
          ...cell,
          isRevealed: cell.isMine ? true : cell.isRevealed,
        }))
      );
      setBoard(revealed);
      setHitCell([r, c]);
      setStatus("lost");
      stopTimer();
      return;
    }
    const next = floodReveal(b, cfg.rows, cfg.cols, r, c);
    setBoard(next);
    if (checkWin(next, cfg.mines)) {
      setStatus("won");
      stopTimer();
    }
  }, [board, cfg, status, startTimer, stopTimer, checkWin]);

  const handleFlag = useCallback((e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (status === "lost" || status === "won" || board[r][c].isRevealed) return;
    const cell = board[r][c];
    if (!cell.isFlagged && flagCount >= cfg.mines) return;
    const next = board.map(row => row.map(c => ({ ...c })));
    next[r][c].isFlagged = !next[r][c].isFlagged;
    setFlagCount(f => f + (next[r][c].isFlagged ? 1 : -1));
    setBoard(next);
  }, [board, cfg.mines, flagCount, status]);

  const handleChord = useCallback((r: number, c: number) => {
    if (!board[r][c].isRevealed || board[r][c].adjacentMines === 0) return;
    let adjFlags = 0;
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < cfg.rows && nc >= 0 && nc < cfg.cols && board[nr][nc].isFlagged)
          adjFlags++;
      }
    if (adjFlags !== board[r][c].adjacentMines) return;
    let b = board;
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= cfg.rows || nc < 0 || nc >= cfg.cols) continue;
        if (b[nr][nc].isFlagged || b[nr][nc].isRevealed) continue;
        if (b[nr][nc].isMine) {
          const revealed = b.map(row => row.map(cell => ({ ...cell, isRevealed: cell.isMine ? true : cell.isRevealed })));
          setBoard(revealed);
          setHitCell([nr, nc]);
          setStatus("lost");
          stopTimer();
          return;
        }
        b = floodReveal(b, cfg.rows, cfg.cols, nr, nc);
      }
    setBoard(b);
    if (checkWin(b, cfg.mines)) { setStatus("won"); stopTimer(); }
  }, [board, cfg, stopTimer, checkWin]);

  return (
    <div className="flex flex-col items-center gap-4 py-8 select-none">
      <div className="flex gap-2">
        {(["easy", "medium", "hard"] as Difficulty[]).map(d => (
          <Button
            key={d}
            variant={diff === d ? "default" : "outline"}
            size="sm"
            onClick={() => newGame(d)}
          >
            {DIFFS[d].label}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-6 bg-card border rounded-xl px-6 py-3">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Mines</span>
          <span className="text-2xl font-medium tabular-nums w-10 text-center">{cfg.mines - flagCount}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Time</span>
          <span className="text-2xl font-medium tabular-nums w-10 text-center">{elapsed}</span>
        </div>
      </div>

      {status === "won" && (
        <Badge variant="default" className="bg-green-600 text-white">You won!</Badge>
      )}
      {status === "lost" && (
        <Badge variant="destructive">Game over!</Badge>
      )}

      <div
        className="border rounded-xl overflow-hidden"
        style={{ display: "grid", gridTemplateColumns: `repeat(${cfg.cols}, 2rem)` }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => (
            <Cell
              key={`${r}-${c}`}
              cell={cell}
              isHit={hitCell?.[0] === r && hitCell?.[1] === c}
              gameOver={status === "lost" || status === "won"}
              onReveal={() => handleReveal(r, c)}
              onFlag={(e) => handleFlag(e, r, c)}
              onChord={() => handleChord(r, c)}
            />
          ))
        )}
      </div>
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        Right-click to flag <Flag className="w-3 h-3 text-red-500 fill-red-500" /> Click a number to chord
      </p>
    </div>
  );
}
