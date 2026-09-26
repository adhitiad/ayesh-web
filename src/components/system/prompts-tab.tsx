import type { Dispatch, SetStateAction } from 'react';
import type { PromptTemplate, KeywordList } from '../../api';
import { PlusIcon, Trash2Icon, XIcon } from '@/components/icons';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Spinner } from '../ui/spinner';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Field, FieldLabel } from '../ui/field';
import { Separator } from '../ui/separator';

interface PromptsTabProps {
  handleCreateTemplate: (e: React.FormEvent) => void;
  newTplName: string;
  setNewTplName: Dispatch<SetStateAction<string>>;
  newTplText: string;
  setNewTplText: Dispatch<SetStateAction<string>>;
  busyPrompt: boolean;
  promptLoaded: boolean;
  templates: PromptTemplate[];
  handleDeleteTemplate: (name: string) => void;
  keywords: KeywordList | null;
  handleAddKeyword: (e: React.FormEvent) => void;
  newKwAgent: string;
  setNewKwAgent: Dispatch<SetStateAction<string>>;
  newKwWord: string;
  setNewKwWord: Dispatch<SetStateAction<string>>;
  handleDeleteKeyword: (agent: string, word: string) => void;
}

export function PromptsTab({
  handleCreateTemplate,
  newTplName,
  setNewTplName,
  newTplText,
  setNewTplText,
  busyPrompt,
  promptLoaded,
  templates,
  handleDeleteTemplate,
  keywords,
  handleAddKeyword,
  newKwAgent,
  setNewKwAgent,
  newKwWord,
  setNewKwWord,
  handleDeleteKeyword,
}: PromptsTabProps) {
  return (
    /* Tab Prompt & Routing */
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Template Prompt</h2>
        <p className="text-xs text-muted-foreground">
          Simpan potongan prompt berulang di backend, lalu pakai kembali di percakapan.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Template Baru</CardTitle>
        </CardHeader>
        <form onSubmit={handleCreateTemplate}>
          <CardContent className="space-y-3">
            <Field>
              <FieldLabel htmlFor="tpl-name">Nama template</FieldLabel>
              <Input
                id="tpl-name"
                value={newTplName}
                onChange={(e) => setNewTplName(e.target.value)}
                placeholder="mis. ringkas-artikel"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="tpl-text">Isi prompt</FieldLabel>
              <Textarea
                id="tpl-text"
                value={newTplText}
                onChange={(e) => setNewTplText(e.target.value)}
                placeholder="Tulis isi prompt lengkap…"
                className="min-h-20"
                required
              />
            </Field>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-3">
            <Button
              type="submit"
              disabled={busyPrompt || !newTplName.trim() || !newTplText.trim()}
              className="gap-1.5"
            >
              {busyPrompt ? <Spinner className="size-4" /> : <PlusIcon className="size-4" />}
              Simpan Template
            </Button>
          </CardFooter>
        </form>
      </Card>

      {!promptLoaded ? (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
          <Spinner className="size-4" />
          Memuat template & keyword…
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {templates.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Belum ada template tersimpan.
              </p>
            ) : (
              templates.map((t) => (
                <div
                  key={t.name}
                  className="flex flex-col gap-2 rounded-lg border bg-background p-3 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{t.preview}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => void handleDeleteTemplate(t.name)}
                    disabled={busyPrompt}
                    className="gap-1.5 self-start text-destructive hover:text-destructive sm:self-auto"
                  >
                    <Trash2Icon className="size-3.5" />
                    Hapus
                  </Button>
                </div>
              ))
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold">Keyword Routing</h2>
                <p className="text-xs text-muted-foreground">
                  Kata kunci per agent untuk rute chat otomatis
                  {keywords ? ` · default: ${keywords.default_agent}` : ''}.
                </p>
              </div>
            </div>

            <Card>
              <form onSubmit={handleAddKeyword}>
                <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-end">
                  <Field className="flex-1">
                    <FieldLabel htmlFor="kw-agent">Agent</FieldLabel>
                    <Input
                      id="kw-agent"
                      value={newKwAgent}
                      onChange={(e) => setNewKwAgent(e.target.value)}
                      placeholder={keywords?.default_agent || 'mis. researcher'}
                      required
                    />
                  </Field>
                  <Field className="flex-1">
                    <FieldLabel htmlFor="kw-word">Keyword</FieldLabel>
                    <Input
                      id="kw-word"
                      value={newKwWord}
                      onChange={(e) => setNewKwWord(e.target.value)}
                      placeholder="mis. riset"
                      required
                    />
                  </Field>
                  <Button
                    type="submit"
                    disabled={busyPrompt || !newKwAgent.trim() || !newKwWord.trim()}
                  >
                    {busyPrompt ? <Spinner className="size-4" /> : 'Tambah Keyword'}
                  </Button>
                </CardContent>
              </form>
            </Card>

            {!keywords || Object.keys(keywords.keywords).length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Belum ada keyword routing.
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(keywords.keywords).map(([agent, words]) => (
                  <div key={agent} className="rounded-lg border bg-background p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{agent}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {words.length} keyword
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {words.map((w) => (
                        <span
                          key={w}
                          className="inline-flex items-center gap-1 rounded-md border bg-muted/40 px-2 py-1 text-xs"
                        >
                          {w}
                          <button
                            type="button"
                            aria-label={`Hapus keyword ${w}`}
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => void handleDeleteKeyword(agent, w)}
                          >
                            <XIcon className="size-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
