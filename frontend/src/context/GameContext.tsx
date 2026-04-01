import { createContext, useContext, useEffect, useState } from "react"

export type UserItem = {
  id: number,
  count: number
};

type GameContext = {
  points: number
  setPoints: React.Dispatch<React.SetStateAction<number>>
  items: UserItem[]
  setItems: React.Dispatch<React.SetStateAction<UserItem[]>>
}

const GameContext = createContext<GameContext | null>(null)

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [points, setPoints] = useState(() => {
    const saved = localStorage.getItem("points");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [items, setItems] = useState<UserItem[]>(() => {
    const saved = localStorage.getItem("items");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("items", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("points", points.toString());
  }, [points]);

  return (
    <GameContext.Provider value={{ points, setPoints, items, setItems }}>
      {children}
    </GameContext.Provider>
  )
}

export const useGame = () => {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error("useGame must be used within GameProvider")
  return ctx
}
