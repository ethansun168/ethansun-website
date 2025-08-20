import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useUsername } from "@/hooks/query"

export function useRequireAuth() {
  const navigate = useNavigate()
  const { data: username, isLoading } = useUsername()

  useEffect(() => {
    if (!username && !isLoading) {
      navigate("/login")
    }
  }, [username, isLoading, navigate])

  return { username, isLoading }
}
