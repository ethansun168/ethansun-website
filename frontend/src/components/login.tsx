import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { client } from "../constants";
import { useUsername } from "@/hooks/query";

interface LoginProps {
  setUsername: React.Dispatch<React.SetStateAction<string>>
};

export function Login(props: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState(""); 
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const {data, isLoading} = useUsername();

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUsername("");
    setPassword("");
    const response = await client.api.v1.login.$post({
      json: {
        username: username,
        password: password,
      },
    })

    if (!response.ok) {
      const body = await response.json();
      if ('message' in body) {
        setError(body.message);
      }
    }
    else {
      setError("");
      const body = await response.json();
      props.setUsername(body.username);
      // Redirect to dashboard
      navigate('/dashboard', {replace: true});
    } 
  };

  useEffect(() => {
    if (data) {
      props.setUsername(data);
      navigate('/dashboard', {replace: true});
    }
  }, [navigate, data, props])

  if (isLoading || data) {
    return null;
  }

  return (
    <div className="w-full  bg-gray-50 shadow-md rounded-lg mx-auto flex flex-col 
      min-h-[calc(100vh-5rem)] flex-col justify-center">

      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md p-6 bg-white shadow-md rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

          <form onSubmit={login} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium" htmlFor="email">
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Username"
                value={username}
                required
                onChange={(e) => setUsername(e.target.value)}
                className={`border p-2 rounded w-full ${error ? 'border-red-600' : 'border-gray-300'}`}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                required onChange={(e) => setPassword(e.target.value)}
                className={`border p-2 rounded w-full ${error ? 'border-red-600' : 'border-gray-300'}`}
              />
            </div>
            {
              error ? (
                <p className="mt-1 text-sm text-red-600">
                  Error: {error}
                </p>
              ) : null
            }
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
    </div>
  );
}
