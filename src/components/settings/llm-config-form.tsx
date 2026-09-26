import type { Dispatch, SetStateAction } from 'react';
import { XIcon, SaveIcon, Loader2Icon } from '@/components/icons';
import { Button } from '../ui/button';
import { Field, FieldGroup, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { SegmentedToggle } from './segmented-toggle';

export interface LlmFormState {
  provider: string;
  model: string;
  temperature: string;
  api_key: string;
  is_default: boolean;
  is_public: boolean;
}

export function emptyLlmForm(): LlmFormState {
  return {
    provider: '',
    model: '',
    temperature: '',
    api_key: '',
    is_default: false,
    is_public: false,
  };
}

interface LlmConfigFormProps {
  editingId: string | null;
  form: LlmFormState;
  setForm: Dispatch<SetStateAction<LlmFormState>>;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function LlmConfigForm({
  editingId,
  form,
  setForm,
  saving,
  onSave,
  onCancel,
}: LlmConfigFormProps) {
  return (
    <div className="space-y-4 rounded-lg border border-primary/30 bg-background p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">
          {editingId ? 'Ubah konfigurasi LLM' : 'Tambah konfigurasi LLM'}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Tutup form"
          onClick={onCancel}
        >
          <XIcon className="size-4" />
        </Button>
      </div>
      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="llm-provider">Provider</FieldLabel>
            <Input
              id="llm-provider"
              value={form.provider}
              onChange={(e) => setForm({ ...form, provider: e.target.value })}
              placeholder="groq"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="llm-model">Model</FieldLabel>
            <Input
              id="llm-model"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              placeholder="llama-3.1-70b-versatile"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="llm-temp">Temperature (0–2)</FieldLabel>
            <Input
              id="llm-temp"
              type="number"
              min={0}
              max={2}
              step={0.1}
              value={form.temperature}
              onChange={(e) => setForm({ ...form, temperature: e.target.value })}
              placeholder="0.7"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="llm-api-key">API Key provider</FieldLabel>
            <Input
              id="llm-api-key"
              type="password"
              autoComplete="new-password"
              value={form.api_key}
              onChange={(e) => setForm({ ...form, api_key: e.target.value })}
              placeholder="Kosongkan bila tidak mengubah"
            />
          </Field>
        </div>
        <SegmentedToggle
          label="Jadikan default"
          value={form.is_default}
          onChange={(v) => setForm({ ...form, is_default: v })}
        />
        <SegmentedToggle
          label="Dapat dipilih publik"
          value={form.is_public}
          onChange={(v) => setForm({ ...form, is_public: v })}
        />
      </FieldGroup>
      <div className="flex items-center gap-2">
        <Button type="button" onClick={onSave} disabled={saving} className="gap-2">
          {saving ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <SaveIcon className="size-4" />
          )}
          {saving ? 'Menyimpan…' : 'Simpan'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Batal
        </Button>
      </div>
    </div>
  );
}
