import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { autoLoginPage } from "@/constants";
import { useLogin, useUser } from "@/hooks/query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { data } = useUser();
  const { mutateAsync: loginRequest, isPending: loginPending } = useLogin(
    () => {
      setError('');
      navigate(autoLoginPage, { replace: true });
    },
    (error) => {
      setError(String(error))
    }
  )

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await loginRequest({ username, password });
  };

  useEffect(() => {
    if (data) {
      navigate(autoLoginPage, { replace: true });
    }
  }, [data, navigate])

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-300">
      <Card className="w-full max-w-md transition-colors duration-300">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={login} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Username"
                value={username}
                required
                onChange={(e) => setUsername(e.target.value)}
                className={error ? "border-red-600" : ""}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                className={error ? "border-red-600" : ""}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <Button type="submit" className="w-full">
              {
                loginPending ? (
                  <div className="h-4 w-4 rounded-full border-2 border-gray-200 dark:border-gray-700 border-t-gray-900 dark:border-t-white animate-spin" />
                ) : <>
                  Login
                </>
              }
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <a
              href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Too Bad
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
};
