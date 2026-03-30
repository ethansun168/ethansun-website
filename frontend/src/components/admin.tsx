import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { client } from "@/constants";
import { useRequireAuth } from "@/hooks/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ROLES } from "ethansun-website-backend/dist/db/schema";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  Filter,
  MoreHorizontal,
  Plus,
  Search
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Forbidden } from "./forbidden";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function Admin() {
  const { user, isLoading } = useRequireAuth();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [modalOpen, setModalOpen] = useState(false)
  const queryClient = useQueryClient();

  const queryKey = 'users'
  const { data: users } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      try {
        const response = await client.api.v1.users.$get();
        return await response.json()
      }
      catch {
        throw new Error("Cannot connect to server")
      }
    },
    enabled: user?.role === 'admin'
  })

  type Role = typeof ROLES[number]
  type SortField = keyof NonNullable<NonNullable<typeof users>[number]>
  type SortDir = "asc" | "desc";

  const ROLE_CONFIG: Record<Role, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
    admin: {
      label: "Admin",
      variant: "default",
      className: "bg-rose-500/15 text-rose-600 border-rose-200 hover:bg-rose-500/20 dark:text-rose-400 dark:border-rose-800",
    },
    user: {
      label: "User",
      variant: "outline",
      className: "bg-sky-500/15 text-sky-600 border-sky-200 hover:bg-sky-500/20 dark:text-sky-400 dark:border-sky-800",
    },
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const { mutateAsync: handleRoleChange } = useMutation({
    mutationFn: async ({ username, role }: { username: string, role: Role }) => {
      try {
        await client.api.v1.users[":username"].$patch({
          json: { role },
          param: { username }
        })
      }
      catch {
        throw new Error("Cannot connect to server")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKey]
      });
    },
    onError: () => {
      // TODO: error
    }
  })

  const { mutateAsync: handleDelete } = useMutation({
    mutationFn: async ({ username }: { username: string }) => {
      try {
        await client.api.v1.users[":username"].$delete({
          param: { username }
        })
      }
      catch {
        throw new Error("Cannot connect to server")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKey]
      });
    },
    onError: () => {
      // TODO: error
    }
  })

  const { mutateAsync: createUser } = useMutation({
    mutationFn: async ({ username, password }: { username: string, password: string }) => {
      let response;
      try {
        response = await client.api.v1.users.$post({
          json: {
            username,
            password
          }
        })
      }
      catch {
        throw new Error("Cannot connect to server")
      }
      if (!response.ok) {
        const body = await response.json()
        throw new Error(body.message)
      }
    },
    onSuccess: () => {
      setModalOpen(false)
      setUsername("")
      setPassword("")
      queryClient.invalidateQueries({
        queryKey: [queryKey]
      });
    },
    onError: (error) => {
      // TODO: error
      console.log(error)
    }
  })

  const filtered = !users ? [] : users
    .filter((u) => {
      const matchSearch = u.username.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      return matchSearch && matchRole;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === "username") cmp = a.username.localeCompare(b.username);
      else if (sortField === "createdAt") cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else if (sortField === "role") cmp = a.role.localeCompare(b.role);
      return sortDir === "asc" ? cmp : -cmp;
    });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-40" />;
    return sortDir === "asc"
      ? <ArrowUp className="ml-1 h-3.5 w-3.5 text-primary" />
      : <ArrowDown className="ml-1 h-3.5 w-3.5 text-primary" />;
  };

  if (!user || isLoading) return "Logging in...";

  if (user.role !== "admin") {
    return <Forbidden />
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              User Management
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage accounts, roles, and permissions
            </p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* Table Card */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search users"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                <Select
                  value={roleFilter}
                  onValueChange={(v) => setRoleFilter(v as Role | "all")}
                >
                  <SelectTrigger className="w-36 h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Filter role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {
                      ROLES.map((role) => (
                        <SelectItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="w-12 pl-6" />
                  <TableHead>
                    <button
                      onClick={() => handleSort("username")}
                      className="flex items-center text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                    >
                      Username <SortIcon field="username" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort("role")}
                      className="flex items-center text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                    >
                      Role <SortIcon field="role" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort("createdAt")}
                      className="flex items-center text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                    >
                      Created <SortIcon field="createdAt" />
                    </button>
                  </TableHead>
                  <TableHead className="w-12 pr-4" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-16 text-slate-400 text-sm">
                      No users match your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((u) => {
                    const roleConf = ROLE_CONFIG[u.role];
                    return (
                      <TableRow
                        key={u.username}
                        className="border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                      >
                        <TableCell className="pl-6 pr-0">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {u.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium text-slate-800 dark:text-slate-100">
                          {u.username}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs font-medium ${roleConf.className}`}
                          >
                            {roleConf.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {formatDate(new Date(u.createdAt))}
                        </TableCell>
                        <TableCell className="pr-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              {
                                u.username !== user.username ? (
                                  <>
                                    <DropdownMenuLabel className="text-xs text-slate-500">Change Role</DropdownMenuLabel>
                                    {ROLES.map((r) => (
                                      <DropdownMenuItem
                                        key={r}
                                        onClick={() => handleRoleChange({ username: u.username, role: r })}
                                        className={u.role === r ? "font-semibold" : ""}
                                      >
                                        {ROLE_CONFIG[r].label}
                                        {u.role === r && <span className="ml-auto text-primary"><Check /></span>}
                                      </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuSeparator /></>
                                ) : null
                              }

                              <DropdownMenuItem>View Profile</DropdownMenuItem>

                              {
                                u.username !== user.username ? (
                                  <DropdownMenuItem
                                    className="text-rose-500 focus:text-rose-500"
                                    disabled={u.username === user.username}
                                    onClick={() => handleDelete({ username: u.username })}
                                  >
                                    Delete User
                                  </DropdownMenuItem>
                                ) : null
                              }
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-400">
                Showing <span className="font-medium text-slate-600 dark:text-slate-300">{filtered.length}</span> of{" "}
                <span className="font-medium text-slate-600 dark:text-slate-300">{!users ? 0 : users.length}</span> users
              </p>
            </div>
          </CardContent>
        </Card>

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create User</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
              />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => createUser({ username, password })}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
