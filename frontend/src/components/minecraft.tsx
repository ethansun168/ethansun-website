import { useRequireAuth } from '@/hooks/auth';
import { MinecraftConsole } from "./minecraft-console";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { MinecraftFiles } from './minecraft-files';

export function Minecraft() {
  const {username, isLoading} = useRequireAuth();
  if (!username || isLoading) return null;
  
  return (
    <div className="w-full max-w-7xl mt-8 px-4 mx-auto ">
      <Tabs defaultValue="console">
        <TabsList>
          <TabsTrigger value="console">Console</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>
        <TabsContent value="console">
          <MinecraftConsole />
        </TabsContent>
        <TabsContent value="files">
          <MinecraftFiles />
        </TabsContent>
      </Tabs>
    </div>
  )
}
