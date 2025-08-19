import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { client } from "@/constants";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

interface NavbarProps {
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>
  isLoading: boolean
};

export default function Navbar(props: NavbarProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  async function logout() {
    try {
      await client.api.v1.logout.$get();
      queryClient.invalidateQueries({queryKey: [ 'user' ]});
      props.setUsername("");
    }
    catch {
      console.log("Logout failed");
    }
  }

  return (
    <nav className="sticky top-0 left-0 w-full bg-white border-b z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
        <div className="flex items-center space-x-4">
          <span className="font-bold text-lg">mirt smegle b</span>
          <Link to="/" className="px-3 py-1 rounded hover:bg-gray-100">
            Home
          </Link>
          <Link to="/about" className="px-3 py-1 rounded hover:bg-gray-100">
            About
          </Link>
          <Link to="/contact" className="px-3 py-1 rounded hover:bg-gray-100">
            Contact
          </Link>
        </div>

        {
          props.isLoading ? <Spinner/> :
          props.username ? 
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar>
                  <AvatarImage src="/avatar.png" alt="User Avatar" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>Dashboard</DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> :

            <Link to="/login">
              <Button variant="default">Login</Button>
            </Link>
        }

      </div>
    </nav>
  );
}
