import { useUsername } from "@/hooks/query";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function Dashboard() {
  const navigate = useNavigate();
  const {data: username} = useUsername();
  useEffect(() => {
    if (!username) {
      navigate('/login');
    }
  }, [username, navigate])
  if (!username) return null;
  return (
    <>
      Welcome {username}!
    </>
  )
}
