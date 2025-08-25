import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { useRequireAuth } from '@/hooks/auth';
import { MinecraftConsole } from "./minecraft-console";
import { MinecraftFiles } from './minecraft-files';
import { MinecraftSettings } from "./minecraft-settings";

export function Minecraft() {
  const {username, isLoading} = useRequireAuth();
  if (!username || isLoading) return null;
  
  return (
    <div className="w-full max-w-7xl mt-8 px-4 mx-auto">
    {/* <div className="w-full h-screen mt-8 px-4 mx-auto"> */}
    {/* <div className="w-full max-w-screen-2xl mt-8 px-4 mx-auto "> */}
      <Tabs defaultValue="console">
        <TabsList>
          <TabsTrigger value="console">Console</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>
        <TabsContent value="console">
          <MinecraftConsole />
        </TabsContent>
          <TabsContent value="settings">
            <MinecraftSettings />
          </TabsContent>
          <TabsContent value="files">
            <MinecraftFiles />
          </TabsContent>
      </Tabs>
    </div>

  )
}
