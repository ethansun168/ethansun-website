import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { client, ROLE_CONFIG } from "@/constants";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { NotFound } from "./not-found";

export function Profile() {
  const { username } = useParams<{ username: string }>()
  if (!username) throw new Error("Username not provided")

  const [notFound, setNotFound] = useState(false)

  const { data: user, isLoading } = useQuery({
    queryKey: [username],
    queryFn: async () => {
      const response = await client.api.v1.users[":username"].$get({
        param: {
          username
        }
      })
      if (response.status == 404) {
        setNotFound(true);
        throw new Error("Not found")
      }
      if (!response.ok) {
        throw new Error("An error occurred");
      }
      return await response.json();
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 24 * 60 * 60
  })

  if (isLoading) return "Loading user..."

  if (!user || notFound) {
    return <NotFound />
  }

  const FIELD_TRANSFORMS: Partial<Record<keyof typeof user, (value: string) => React.ReactNode>> = {
    role: (value) => (
      <Badge variant="outline" className={`text-xs font-medium ${ROLE_CONFIG[value as keyof typeof ROLE_CONFIG].className}`}>
        {ROLE_CONFIG[value as keyof typeof ROLE_CONFIG].label}
      </Badge>
    ),
    createdAt: (value) => new Date(value).toLocaleString([], {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    }),
  };

  const formatLabel = (key: string) =>
    key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());

  const fields = Object.entries(user)
    .map(([key, value]) => ({
      label: formatLabel(key),
      value: FIELD_TRANSFORMS[key as keyof typeof user]?.(value) ?? value,
    }));

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center gap-2 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">{username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-base">{username}</p>
            </div>
          </div>

          <Separator className="mb-4" />

          <div className="space-y-2.5">
            {fields.map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
