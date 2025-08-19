import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { client } from "@/constants";
import { useUsername } from "@/hooks/query";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ModeToggle } from "./mode-toggle";

const navLinks = [
  { name: 'Home', to: '/' },
  { name: 'About', to: '/about' },
  { name: 'Contact', to: '/contact' },
];

export default function Navbar() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY === 0) {
        setHidden(false);
      } else {
        setHidden(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <nav
      className={`sticky top-0 w-full shadow-md transition-transform duration-300 z-50 border-b
${hidden ? '-translate-y-full' : 'translate-y-0'}`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
        <div className="flex items-center space-x-4 flex-shrink-0">

          <span className="font-bold text-lg">mirt smegle b</span>

          <div className="hidden md:flex items-center space-x-4">
            {
              navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {link.name}
                </Link>
              ))
            }
          </div>
        </div>

        <div className="flex items-center space-x-4 flex-shrink-0 ml-auto">
          <ModeToggle />
          {isLoading ? (
            <Spinner />
          ) : username ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="cursor-pointer">
                  <Avatar>
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

          <Sheet>
            <SheetTrigger className="md:hidden">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </SheetTrigger>

            <SheetContent side="right" className="w-64">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>Navigation links</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col mt-4 space-y-2">

                {
                  navLinks.map(link => (
                    <SheetClose asChild key={link.to}>
                      <Link
                        to={link.to}
                        className="px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        {link.name}
                      </Link>
                    </SheetClose>
                  ))
                }
              </div>
            </SheetContent>
          </Sheet>

        </div>
      </div>
    </nav>
  );
}
