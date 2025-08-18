import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <form className="space-y-4">
          <div>
            <label className="block mb-1 font-medium" htmlFor="email">
              Username
            </label>
            <Input id="username" type="text" placeholder="Username" />
          </div>

          <div>
            <label className="block mb-1 font-medium" htmlFor="password">
              Password
            </label>
            <Input id="password" type="password" placeholder="Enter your password" />
          </div>

          <Button type="submit" className="w-full mt-4">
            Login
          </Button>
        </form>

        {/* Optional Sign Up Link */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account? <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" className="text-blue-500 hover:underline" target="_blank">Too Bad</a>
        </p>
      </div>
    </div>
  );
}
