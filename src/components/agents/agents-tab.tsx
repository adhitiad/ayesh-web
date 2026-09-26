import type { AgentInfo } from '../../api';
import { BotIcon, WrenchIcon } from '@/components/icons';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

export function AgentsTab({ agents }: { agents: AgentInfo[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {agents.length === 0 ? (
        <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
          Tidak ada data agen yang ditemukan dari backend.
        </div>
      ) : (
        agents.map((agent) => (
          <Card key={agent.name} className="flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <BotIcon className="size-4" />
                  </div>
                  <CardTitle className="capitalize">{agent.name}</CardTitle>
                </div>
                <Badge variant="outline" className="text-xs">
                  {agent.role || 'Agent'}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2 mt-2 text-xs">
                {agent.description || 'Tidak ada deskripsi.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              {agent.when_to_use && (
                <div className="rounded-md bg-muted/50 p-2.5 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Kapan digunakan: </span>
                  {agent.when_to_use}
                </div>
              )}

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Alat / Tools yang Diizinkan:
                </span>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {agent.tools && agent.tools.length > 0 ? (
                    agent.tools.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-secondary-foreground"
                      >
                        <WrenchIcon className="size-2.5" />
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      Tanpa tool eksternal
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
