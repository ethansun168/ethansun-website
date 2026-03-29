import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useUser } from "@/hooks/query"

export function useRequireAuth() {
  const navigate = useNavigate()
  const { data: user, isLoading } = useUser()

  useEffect(() => {
    if (!user && !isLoading) {
      navigate("/login")
    }
  }, [user, isLoading, navigate])

  return { user, isLoading }
}
