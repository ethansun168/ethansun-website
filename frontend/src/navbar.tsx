import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 w-full bg-white border-b z-50 shadow-sm">
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

                <Link to="/login">
                    <Button variant="default">Login</Button>
                </Link>
            </div>
        </nav>
    );
}
