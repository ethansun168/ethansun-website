import type { UserItem } from "@/app";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle
} from "@/components/ui/sheet";
import { Settings } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../ui/input";

interface GameProps {
  points: number;
  setPoints: React.Dispatch<React.SetStateAction<number>>;
  items: UserItem[]
  setItems: React.Dispatch<React.SetStateAction<UserItem[]>>;
}

export function Game({ points, setPoints, setItems, items }: GameProps) {
  const navigate = useNavigate();
  const [gambleInput, setGambleInput] = useState("");
  const [gambleOutput, setGambleOutput] = useState("");
  const [gambleError, setGambleError] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const cursorAmount = items.find((item) => item.id === 1)?.count ?? 0;

  function validateInput(input: string) {
    const n = Number(input);
    if (!Number.isInteger(n) || n <= 0) {
      throw new Error("Enter a positive number");
    }
    if (points < n) {
      // reject
      throw new Error("Not enough points");
    }
    return n;
  }

  function gambleN(amount: number) {
    if (Math.random() > 0.5) {
      // win
      setPoints(prev => prev + amount);
      setGambleOutput("You won!");
    }
    else {
      // lose
      setPoints(prev => prev - amount);
      setGambleOutput("You lost!");
    }
  }

  function gamble() {
    setGambleInput("");
    if (gambleInput === "admin") {
      setIsAdmin(true);
      setGambleError(false);
      return;
    }
    try {
      const n = validateInput(gambleInput);
      gambleN(n);
      setGambleError(false);
    }
    catch (error) {
      setGambleOutput(String(error));
      setGambleError(true);
      return;
    }
  }

  const [sheetOpen, setSheetOpen] = useState(false);
  const [adminPoints, setAdminPoints] = useState<number>(0);
  return (
    <div
      className="
      flex min-h-[calc(100vh-4rem)] flex-col items-center
      bg-gradient-to-br 
      from-yellow-100 via-pink-100 to-purple-200 
      dark:from-indigo-900 dark:via-purple-900 dark:to-black 
      p-4 transition-colors duration-300
      "
    >
      <div className="self-end cursor-pointer">
        {
          isAdmin ? <Settings onClick={() => setSheetOpen(true)} /> : null
        }
      </div>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle> Admin Panel </SheetTitle>
          </SheetHeader>

          <div className="p-4">
            Modify Points
            <Input
              type="number"
              placeholder="Enter new points value"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={adminPoints}
              onChange={(e) => setAdminPoints(Number(e.target.value))}
            />
            <Button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 mt-2"
              onClick={() => setPoints(adminPoints)}
            >
              Update Points
            </Button>
          </div>

          <div className="p-4">
            Reset Stats
            <div>
              <Button
                className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-500"
                onClick={() => {
                  setPoints(0);
                  setItems([]);
                }}
              >
                Reset Stats
              </Button>
            </div>
          </div>

        </SheetContent>
      </Sheet>

      <div className="flex flex-col gap-4 w-1xl justify-center items-center flex-1">
        <Card className="w-full bg-white dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-none shadow-lg dark:shadow-xl rounded-2xl transition-colors duration-300">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-800 dark:text-white tracking-wide">
              points
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col items-center gap-6">
            <div className="text-5xl font-extrabold text-yellow-500 drop-shadow-sm dark:text-yellow-400">
              {points}
            </div>

            <Button
              onClick={() => setPoints((prev) => prev + cursorAmount + 1)}
              className="px-6 py-3 text-lg rounded-full bg-yellow-400 text-black font-bold shadow-md hover:bg-yellow-300 dark:shadow-lg dark:hover:bg-yellow-300 hover:scale-105 transition-transform duration-200"
            >
              Click Me
            </Button>
            <Button
              onClick={() => navigate("/shop")}
              className="bg-blue-600 text-white hover:bg-blue-500"
            >
              🛒 Go to Shop
            </Button>
          </CardContent>
        </Card>

        <div className="flex w-full">
          <form className="flex w-full" onSubmit={(e) => {
            e.preventDefault();
            gamble();
          }}>
            <Input
              placeholder="Enter an amount"
              value={gambleInput}
              onChange={(e) => setGambleInput(e.target.value)}
              className={`rounded-l-lg flex-1 mr-4 ${gambleError ? "border-red-600" : ""}`}
            />
            <Button className="rounded-r-lg bg-green-600 text-white hover:bg-green-500" type="submit">
              Gamble
            </Button>
          </form>
        </div>

        <div className="flex w-full gap-2">
          <Button className="flex-1 rounded-r-lg bg-amber-500 text-white hover:bg-amber-400" onClick={() => {
            setGambleInput("");
            if (points === 1) {
              setGambleOutput("Not enough points!");
              return;
            }
            setGambleError(false);
            gambleN(Math.floor(points / 2));
          }}>
            Gamble Half
          </Button>
          <Button className="flex-1 rounded-r-lg bg-red-600 text-white hover:bg-red-500" onClick={() => {
            setGambleInput("");
            if (points === 0) {
              setGambleOutput("Not enough points!");
              return;
            }
            setGambleError(false);
            gambleN(points);
          }}>
            Gamble All
          </Button>
        </div>

        <div className="flex justify-center">
          {gambleOutput}
        </div>
      </div>
    </div>
  );
}

