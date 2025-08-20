import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { client } from '@/constants';
import { useRequireAuth } from '@/hooks/auth';
import { useQuery } from '@tanstack/react-query';
import { Progress } from "./ui/progress";

export function Dashboard() {
  const {username, isLoading} = useRequireAuth();
  const {data: systemData} = useQuery({
    queryKey: ['system-status'],
    queryFn: async () => {
      const resp = await client.api.v1.dashboard.$get();
      if (!resp.ok) throw new Error("Error occurred");
      return await resp.json();   
    },
    refetchInterval: 1000
  })
  if (!username || !systemData || isLoading) return null;

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-center my-6">Server Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle>System Uptime</CardTitle>
          </CardHeader>
          <CardContent className="text-xl md:text-2xl font-semibold">{systemData.uptime}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CPU</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Usage: <Badge>{systemData.cpuUsage}</Badge></p>
            <p>Frequency: {systemData.cpuFrequency}</p>
            <p>Logical Cores: {systemData.cpuCoresLogical}</p>
            <p>Physical Cores: {systemData.cpuCoresPhysical}</p>
            <p>Temperature: {systemData.cpuTemperature}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Memory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <span>Memory Usage</span>
              <span>{systemData.memoryUsage}</span>
            </div>
            <Progress
              value={parseInt(systemData.memoryUsage.split('(')[1])}
              className="bg-green-100 dark:bg-green-900 [&>div]:bg-green-600 dark:[&>div]:bg-green-400"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <span>Disk Usage</span>
              <span>{systemData.diskUsage}</span>
            </div>
            <Progress
              value={parseInt(systemData.diskUsage.split('(')[1])}
              className="bg-green-100 dark:bg-green-900 [&>div]:bg-green-600 dark:[&>div]:bg-green-400"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>OS & Processor</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{systemData.os} - {systemData.osName}</p>
            <p>{systemData.processor}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SSH Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={systemData.ssh === 'Online' ? 'success' : 'destructive'}>
              {systemData.ssh}
            </Badge>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
