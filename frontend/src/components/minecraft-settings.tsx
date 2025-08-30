import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { minecraftClient } from "@/constants";
import { createMinecraftFilesOptions, createMinecraftStatusOptions } from "@/hooks/minecraft";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircleIcon, Save, Server } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertTitle } from "./ui/alert";

export function MinecraftSettings() {
  const queryClient = useQueryClient();
  const [selectedVersion, setSelectedVersion] = useState("");
  const {data: status, isLoading: statusLoading } = useQuery(createMinecraftStatusOptions());
  const settingsDisabled = statusLoading || status === 'online';
  const {data: version, isLoading: versionLoading} = useQuery({
    queryKey: ['version'],
    queryFn: async () => {
      const resp = await minecraftClient.api.v1.minecraft.version.$get();
      const body = await resp.json();
      return body.version;
    }
  })

  useEffect(() => {
    if (version) setSelectedVersion(version);
  }, [version]);

  const {data: versions, isLoading: versionsLoading} = useQuery({
    queryKey: ['versions'],
    queryFn: async () => {
      const resp = await minecraftClient.api.v1.minecraft.versions.$get();
      const body = await resp.json();
      return body.versions;
    }
  })

  const [saveSettingsState, setSaveSettingsState] = useState<null | "success" | "error">(null);
  const {mutateAsync: saveSettings} = useMutation({
    mutationFn: async ({version}: {version: string}) => {
      await minecraftClient.api.v1.minecraft.version.$post({
        json: {
          version: version
        }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: createMinecraftFilesOptions().queryKey
      });
      setSaveSettingsState("success");
    },
    onError: () => {
      setSaveSettingsState("error");
    }
  })

  return (
    <Card className="flex flex-col h-[calc(100vh-200px)] w-full mx-auto shadow-lg border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl font-mono flex items-center">
          <Server/>
          <span className="inline-block ml-2">
            Minecraft Server Settings
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {
          settingsDisabled ? 
            <Alert variant="destructive" className="inline-flex w-auto mb-6">
              <AlertCircleIcon />
              <AlertTitle>Settings disabled because server is online.</AlertTitle>
            </Alert> : null
        }
        { //TODO: finish this
          saveSettingsState === "success" ?
            <Alert>
            </Alert> :
            saveSettingsState === "error" ?
              <Alert>
              </Alert> : null
        }
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg bg-secondary">
            <CardHeader className="rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Server Version
              </CardTitle>
            </CardHeader>
            <CardContent>
              {
                versionLoading || versionsLoading ? <Spinner /> : 
                  <Select value={selectedVersion} onValueChange={setSelectedVersion} disabled={settingsDisabled}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {
                        versions.map((v: string) => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
              }
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                hi
              </CardTitle>
            </CardHeader>
          </Card>

        </div>
        <div className="flex justify-center pt-6">
          <Button disabled={settingsDisabled} size="lg" className=" bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg" onClick={() => {
            saveSettings({ version: selectedVersion });
          }}>
            <Save className="h-5 w-5 mr-2" />
            Save All Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
