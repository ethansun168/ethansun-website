import type { UserItem } from "@/app";
import cursorPlus from "@/assets/cursor-plus.svg";
import cursorPlusDark from "@/assets/cursor-plus-dark.png";
import redPikmin from "@/assets/red-pikmin.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react";

type Product = {
  id: number;
  name: string;
  price: number;
  sellPrice: number;
  image: string;
  darkImage: string;
};

const products: Product[] = [
  { id: 1, name: "Cursor", price: 5, sellPrice: 1, image: cursorPlus, darkImage: cursorPlusDark },
  { id: 2, name: "Red Pikmin", price: 10, sellPrice: 2, image: redPikmin, darkImage: redPikmin },
];

interface ShopProps {
  points: number;
  setPoints: React.Dispatch<React.SetStateAction<number>>;
  items: UserItem[],
  setItems: React.Dispatch<React.SetStateAction<UserItem[]>>;
}

export function Shop({ points, setPoints, items, setItems }: ShopProps) {

  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleBuy = (product: Product) => {
    if (points >= product.price) {
      setPoints((prev) => prev - product.price);
      setItems((prev) => {
        const existingItem = prev.find((item) => item.id === product.id);
        if (existingItem) {
          return prev.map((item) => (
            item.id === product.id ? { ...item, count: item.count + 1 } : item
          ))
        }
        else {
          return [...prev, { id: product.id, count: 1 }]
        }
      })
      setError(null);
    } else {
      setError("Not enough points!");
    }
  };

  const sell = (id: number, amount: number) => {
    const item = items.find((item) => item.id === id)!;
    // Remove entry
    if (item.count - amount === 0) {
      setItems((prev) => prev.filter(item => item.id !== id))
    }
    else {
      setItems((prev) => (
        prev.map((item) => (
          item.id === id ? { ...item, count: item.count - amount } : item
        ))
      ))
    }

    // Add sell price to balance
    const product = products.find((item) => item.id === id)!;
    const sellTotal = product.sellPrice * amount;
    setPoints((prev) => prev + sellTotal);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-950 dark:to-black p-6 transition-colors duration-300">
      <div className="flex justify-between items-center max-w-6xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">🛒 Shop</h1>
        <Button
          onClick={() => navigate("/game")}
          className="bg-blue-600 text-white hover:bg-blue-500"
        >
          Back to Game
        </Button>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          Points: <span className="text-yellow-500 dark:text-yellow-400">{points}</span>
        </p>
      </div>

      {error && (
        <p className="text-red-500 text-center font-medium mb-4">{error}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {products.map((product) => (
          <Card
            key={product.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300"
          >
            <CardHeader className="text-center">
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">
                {product.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <img
                src={product.image}
                alt={product.name}
                className="w-40 h-40 object-cover rounded-lg dark:hidden"
              />
              <img
                src={product.darkImage}
                alt={product.name}
                className="w-40 h-40 object-cover rounded-lg hidden dark:block"
              />
            </CardContent>
            <CardFooter className="flex flex-col items-center gap-2">
              <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
                Buy: {product.price} pts
              </p>
              <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
                Sell: {product.sellPrice} pts
              </p>
              <Button
                onClick={() => handleBuy(product)}
                disabled={points < product.price}
                className={`w-full font-semibold ${points < product.price
                    ? "bg-gray-400 text-gray-800 dark:bg-gray-600 dark:text-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-500 text-white"
                  }`}
              >
                {points < product.price ? "Too Expensive" : "Buy"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-10 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">🛍 Your Items</h2>
        {items.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">You don't own anything yet.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => {
              const product = products.find((p) => p.id === item.id)!;
              return (
                <li
                  key={product.id}
                  className="flex justify-between bg-white dark:bg-gray-800 p-3 rounded-lg shadow items-center"
                >
                  <span className="text-gray-800 dark:text-white">
                    {product.name}
                  </span>

                  <div className="flex items-center gap-2 text-gray-600 font-bold dark:text-gray-300">
                    (x{item.count})
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="destructive" size="icon" className="cursor-pointer">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="cursor-pointer" onClick={() => sell(product.id, 1)}>
                          Sell x1 ({product.sellPrice} pts)
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => sell(product.id, item.count)}>
                          Sell All ({product.sellPrice * item.count} pts)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                  </div>
                </li>

              )
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
