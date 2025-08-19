import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUsername } from "@/hooks/query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { client } from "../constants";

export function Login() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState(""); 
  const [error, setError] = useState("");
  const {data, isLoading} = useUsername();

  const {mutateAsync: loginRequest} = useMutation({
    mutationFn: async ({username, password}: {username: string, password: string}) => {
      try {
        const response = await client.api.v1.login.$post({
          json: {
            username: username,
            password: password,
          },
        })
        if (!response.ok) {
          const body = await response.json();
          if ('message' in body) {
            throw new Error(body.message);
          }
          throw new Error("Unknown error");
        }
        return await response.json();
      }
      catch {
        throw new Error("Unable to connect to server");
      }
    },
    onSuccess: (data) => {
      setError('');
      queryClient.setQueryData(['user'], data.username);
      navigate('/dashboard', {replace: true});
    },
    onError: (error) => {
      setError(String(error));
    }
  })

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUsername("");
    setPassword("");
    await loginRequest({ username, password });
  };

  useEffect(() => {
    if (data) {
      navigate('/dashboard', {replace: true});
    }
  }, [data, navigate])

  if (isLoading || data) {
    return null;
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
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
              Login
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
