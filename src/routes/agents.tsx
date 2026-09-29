import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BotIcon,
  SparklesIcon,
  RefreshCwIcon,
  AlertCircleIcon,
  StoreIcon,
  MapIcon,
} from '@/components/icons';
import {
  getAgents,
  getSkills,
  getSkillDetail,
  getMarketplace,
  installMarketplaceTool,
  uninstallMarketplaceTool,
  getPlans,
  getPlan,
  updatePlanStatus,
  type SkillInfo,
  type MarketplaceTool,
  type PlanDetail,
  type PlanListItem,
} from '../api';
import { logger } from '../libs/logger';
import { AuthGuard } from '../components/auth/auth-guard';
import { Button } from '../components/ui/button';
import { Spinner } from '../components/ui/spinner';
import { AgentsTab } from '../components/agents/agents-tab';
import { SkillsTab } from '../components/agents/skills-tab';
import { MarketplaceTab } from '../components/agents/marketplace-tab';
import { PlansTab } from '../components/agents/plans-tab';

export const Route = createFileRoute('/agents')({
  component: () => (
    <AuthGuard>
      <AgentsPage />
    </AuthGuard>
  ),
});

function AgentsPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'agents' | 'skills' | 'marketplace' | 'plans'>(
    'agents',
  );
  const [selectedPlan, setSelectedPlan] = useState<PlanDetail | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillInfo | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [busyTool, setBusyTool] = useState<string | null>(null);
  const [busyPlanStatus, setBusyPlanStatus] = useState<'' | 'aktif' | 'selesai' | 'batal'>('');
  const [planNotice, setPlanNotice] = useState('');

  const agentsQ = useQuery({
    queryKey: ['agents', 'list'],
    queryFn: () => getAgents().catch(() => []),
    staleTime: Infinity,
  });
  const skillsQ = useQuery({
    queryKey: ['agents', 'skills'],
    queryFn: () => getSkills().catch(() => [] as string[]),
    staleTime: Infinity,
  });
  const toolsQ = useQuery({
    queryKey: ['agents', 'marketplace'],
    queryFn: () => getMarketplace().catch(() => []),
    staleTime: Infinity,
  });
  const plansQ = useQuery({
    queryKey: ['agents', 'plans'],
    queryFn: () =>
      getPlans().then(
        (d) => d.plans ?? [],
        () => [] as PlanListItem[],
      ),
    staleTime: Infinity,
  });

  const agents = agentsQ.data ?? [];
  const skills = skillsQ.data ?? [];
  const tools = toolsQ.data ?? [];
  const plans = plansQ.data ?? [];
  const loading =
    agentsQ.isPending ||
    agentsQ.isFetching ||
    skillsQ.isPending ||
    skillsQ.isFetching ||
    toolsQ.isPending ||
    toolsQ.isFetching ||
    plansQ.isPending ||
    plansQ.isFetching;
  const error = '';

  const fetchData = () => qc.invalidateQueries({ queryKey: ['agents'] });

  const handleSelectSkill = async (name: string) => {
    setLoadingDetail(true);
    try {
      const detail = await getSkillDetail(name);
      setSelectedSkill(detail);
    } catch (err) {
      logger.error({ err }, 'gagal memuat detail skill');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSelectPlan = async (id: string) => {
    setLoadingDetail(true);
    try {
      const detail = await getPlan(id);
      setSelectedPlan(detail);
    } catch (err) {
      logger.error({ err }, 'gagal memuat detail rencana');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handlePlanStatus = async (status: 'aktif' | 'selesai' | 'batal') => {
    if (!selectedPlan) return;
    const action =
      status === 'aktif'
        ? 'aktifkan kembali'
        : status === 'selesai'
          ? 'tandai selesai'
          : 'batalkan';
    const label = selectedPlan.judul || `Rencana #${selectedPlan.id.slice(0, 8)}`;
    if (!window.confirm(`Konfirmasi untuk ${action} "${label}"?`)) return;
    setBusyPlanStatus(status);
    setPlanNotice('');
    try {
      await updatePlanStatus(selectedPlan.id, status);
      const notice =
        status === 'batal'
          ? 'Rencana dibatalkan.'
          : status === 'selesai'
            ? 'Rencana ditandai selesai.'
            : 'Rencana diaktifkan kembali.';
      setPlanNotice(notice);
      qc.setQueryData<PlanListItem[]>(['agents', 'plans'], (prev) =>
        (prev ?? []).map((p) => (p.id === selectedPlan.id ? { ...p, status } : p)),
      );
      setSelectedPlan((prev) => (prev ? { ...prev, status } : prev));
    } catch (err) {
      setPlanNotice(`Gagal mengubah status: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusyPlanStatus('');
    }
  };

  const handleInstallTool = async (name: string) => {
    setBusyTool(name);
    try {
      await installMarketplaceTool(name);
      qc.setQueryData<MarketplaceTool[]>(['agents', 'marketplace'], (prev) =>
        (prev ?? []).map((t) => (t.name === name ? { ...t, installed: true } : t)),
      );
    } catch (err) {
      alert(`Gagal menginstal alat: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusyTool(null);
    }
  };

  const handleUninstallTool = async (name: string) => {
    if (!confirm(`Hapus alat "${name}" dari sistem?`)) return;
    setBusyTool(name);
    try {
      await uninstallMarketplaceTool(name);
      qc.setQueryData<MarketplaceTool[]>(['agents', 'marketplace'], (prev) =>
        (prev ?? []).map((t) => (t.name === name ? { ...t, installed: false } : t)),
      );
    } catch (err) {
      alert(`Gagal menghapus alat: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusyTool(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Katalog Agen, Skill & Ekstensi
          </h1>
          <p className="text-sm text-muted-foreground">
            Sub-agen AI spesialis, skill MCP, marketplace alat, dan rencana aksi multi-tahap.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void fetchData()}
          disabled={loading}
          className="gap-2 self-start sm:self-auto"
        >
          <RefreshCwIcon className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          Segarkan
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircleIcon className="size-4 shrink-0" />
          <span>Error memuat data: {error}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-3">
        <Button
          variant={activeTab === 'agents' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('agents')}
          className="gap-1.5"
        >
          <BotIcon className="size-4" />
          <span>Sub-Agen ({agents.length})</span>
        </Button>
        <Button
          variant={activeTab === 'skills' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('skills')}
          className="gap-1.5"
        >
          <SparklesIcon className="size-4" />
          <span>Skills MCP ({skills.length})</span>
        </Button>
        <Button
          variant={activeTab === 'marketplace' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('marketplace')}
          className="gap-1.5"
        >
          <StoreIcon className="size-4" />
          <span>Marketplace Alat ({tools.length})</span>
        </Button>
        <Button
          variant={activeTab === 'plans' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('plans')}
          className="gap-1.5"
        >
          <MapIcon className="size-4" />
          <span>Rencana Aksi ({plans.length})</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center p-12">
          <Spinner className="size-8 text-muted-foreground" />
        </div>
      ) : activeTab === 'agents' ? (
        <AgentsTab agents={agents} />
      ) : activeTab === 'skills' ? (
        <SkillsTab
          skills={skills}
          selectedSkill={selectedSkill}
          loadingDetail={loadingDetail}
          onSelect={(name) => void handleSelectSkill(name)}
        />
      ) : activeTab === 'marketplace' ? (
        <MarketplaceTab
          tools={tools}
          busyTool={busyTool}
          onInstall={(name) => void handleInstallTool(name)}
          onUninstall={(name) => void handleUninstallTool(name)}
        />
      ) : (
        <PlansTab
          plans={plans}
          selectedPlan={selectedPlan}
          loadingDetail={loadingDetail}
          busyPlanStatus={busyPlanStatus}
          planNotice={planNotice}
          onSelect={(id) => void handleSelectPlan(id)}
          onPlanStatus={(status) => void handlePlanStatus(status)}
        />
      )}
    </div>
  );
}
