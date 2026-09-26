import type { MarketplaceTool } from '../../api';
import { DownloadIcon, Trash2Icon } from '@/components/icons';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface MarketplaceTabProps {
  tools: MarketplaceTool[];
  busyTool: string | null;
  onInstall: (name: string) => void;
  onUninstall: (name: string) => void;
}

export function MarketplaceTab({ tools, busyTool, onInstall, onUninstall }: MarketplaceTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Registry Marketplace Alat Eksternal</h2>
        <p className="text-xs text-muted-foreground">
          Pasang atau copot kapabilitas tool eksternal secara aman dengan verifikasi checksum
          fail-closed.
        </p>
      </div>

      {tools.length === 0 ? (
        <Card className="border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
          Belum ada tool yang terdaftar di registry marketplace.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Card key={tool.name} className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base capitalize">{tool.name}</CardTitle>
                  <Badge variant={tool.installed ? 'default' : 'secondary'} className="text-[10px]">
                    {tool.installed ? 'Terpasang' : 'Tersedia'}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  {tool.description || 'Alat tambahan terverifikasi untuk agen Ayesh.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex justify-end">
                  {tool.installed ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs text-destructive hover:bg-destructive/10"
                      disabled={busyTool === tool.name}
                      onClick={() => onUninstall(tool.name)}
                    >
                      <Trash2Icon className="size-3.5" />
                      {busyTool === tool.name ? 'Memproses...' : 'Copot Alat'}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="gap-1.5 text-xs"
                      disabled={busyTool === tool.name}
                      onClick={() => onInstall(tool.name)}
                    >
                      <DownloadIcon className="size-3.5" />
                      {busyTool === tool.name ? 'Memasang...' : 'Pasang Alat'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
