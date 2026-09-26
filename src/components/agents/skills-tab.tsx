import type { SkillInfo } from '../../api';
import { LayersIcon, CheckCircle2Icon } from '@/components/icons';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Spinner } from '../ui/spinner';

interface SkillsTabProps {
  skills: string[];
  selectedSkill: SkillInfo | null;
  loadingDetail: boolean;
  onSelect: (name: string) => void;
}

export function SkillsTab({ skills, selectedSkill, loadingDetail, onSelect }: SkillsTabProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="space-y-2 lg:col-span-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Daftar Skill MCP
        </h2>
        {skills.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Belum ada skill yang terpasang.
          </p>
        ) : (
          <div className="space-y-1.5">
            {skills.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSelect(s)}
                className={`flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm transition-colors ${
                  selectedSkill?.name === s
                    ? 'border-primary bg-primary/10 text-foreground font-medium'
                    : 'border-border bg-card hover:bg-muted/50 text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <LayersIcon className="size-4 text-muted-foreground" />
                  <span>{s}</span>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  Detail
                </Badge>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="lg:col-span-7">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Detail Skill
        </h2>
        {!selectedSkill ? (
          <div className="flex min-h-[250px] items-center justify-center rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Pilih salah satu skill di sebelah kiri untuk melihat instruksi dan konfigurasi.
          </div>
        ) : loadingDetail ? (
          <div className="flex min-h-[250px] items-center justify-center rounded-xl border border-border p-6">
            <Spinner className="size-6 text-muted-foreground" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{selectedSkill.name}</CardTitle>
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2Icon className="size-3 text-emerald-500" />
                  Aktif
                </Badge>
              </div>
              <CardDescription>
                {selectedSkill.description || 'Tidak ada deskripsi ringkas.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedSkill.instructions && (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Instruksi Sistem (System Prompt Injection):
                  </span>
                  <pre className="mt-1.5 max-h-[300px] overflow-auto rounded-lg bg-muted/60 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                    {selectedSkill.instructions}
                  </pre>
                </div>
              )}

              {selectedSkill.allowed_roles && (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Peran yang Diizinkan:
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedSkill.allowed_roles.map((role) => (
                      <Badge key={role} variant="secondary" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
