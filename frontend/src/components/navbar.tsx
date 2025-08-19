import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { client } from "@/constants";
import { useUsername } from "@/hooks/query";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { ModeToggle } from "./mode-toggle";

export default function Navbar() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const {data: username, isLoading} = useUsername();
  async function logout() {
    try {
      await client.api.v1.logout.$get();
      queryClient.setQueryData(['user'], null);
    }
    catch {
      console.log("Logout failed");
    }
  }

  return (
    <nav className="sticky top-0 left-0 w-full border-b z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
        <div className="flex items-center space-x-4">
          <span className="font-bold text-lg">mirt smegle b</span>
          <Link to="/" className="px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
            Home
          </Link>
          <Link to="/about" className="px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
            About
          </Link>
          <Link to="/contact" className="px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
            Contact
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <ModeToggle />
          {isLoading ? (
            <Spinner />
          ) : username ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="cursor-pointer">
                  <Avatar>
                    <AvatarImage src="/avatar.png" alt="User Avatar" />
                    <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => navigate('/dashboard')}
                  >
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={logout}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
                <Link to="/login">
                  <Button className="cursor-pointer" variant="default">
                    Login
                  </Button>
                </Link>
              )}
        </div>
      </div>
    </nav>
  );
}
