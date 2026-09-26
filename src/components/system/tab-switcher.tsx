import type { Dispatch, SetStateAction } from 'react';
import {
  ActivityIcon,
  ClockIcon,
  ListTodoIcon,
  ShieldCheckIcon,
  ScrollTextIcon,
  FileTextIcon,
  StarIcon,
} from '@/components/icons';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { SystemTab } from '../../hooks/use-system-core';
import type { PendingApproval, ScheduledJob, AsyncTask, AuditLogItem } from '../../api';

interface SystemTabSwitcherProps {
  activeTab: SystemTab;
  setActiveTab: Dispatch<SetStateAction<SystemTab>>;
  approvals: PendingApproval[];
  jobs: ScheduledJob[];
  tasks: AsyncTask[];
  auditLogs: AuditLogItem[];
}

export function SystemTabSwitcher({
  activeTab,
  setActiveTab,
  approvals,
  jobs,
  tasks,
  auditLogs,
}: SystemTabSwitcherProps) {
  return (
    /* Tab Switcher */
    <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-3">
      <Button
        variant={activeTab === 'overview' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setActiveTab('overview')}
        className="gap-1.5"
      >
        <ActivityIcon className="size-4" />
        <span>Ringkasan & Health</span>
        {approvals.length > 0 && (
          <Badge
            variant="destructive"
            className="ml-1 size-5 rounded-full p-0 flex items-center justify-center text-[10px]"
          >
            {approvals.length}
          </Badge>
        )}
      </Button>
      <Button
        variant={activeTab === 'jobs' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setActiveTab('jobs')}
        className="gap-1.5"
      >
        <ClockIcon className="size-4" />
        <span>Tugas Terjadwal ({jobs.length})</span>
      </Button>
      <Button
        variant={activeTab === 'tasks' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setActiveTab('tasks')}
        className="gap-1.5"
      >
        <ListTodoIcon className="size-4" />
        <span>Antrean Tugas ({tasks.length})</span>
      </Button>
      <Button
        variant={activeTab === 'audit' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setActiveTab('audit')}
        className="gap-1.5"
      >
        <ShieldCheckIcon className="size-4" />
        <span>Audit Trail ({auditLogs.length})</span>
      </Button>
      <Button
        variant={activeTab === 'logs' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setActiveTab('logs')}
        className="gap-1.5"
      >
        <ScrollTextIcon className="size-4" />
        <span>Log & Metrik</span>
      </Button>
      <Button
        variant={activeTab === 'prompts' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setActiveTab('prompts')}
        className="gap-1.5"
      >
        <FileTextIcon className="size-4" />
        <span>Prompt & Routing</span>
      </Button>
      <Button
        variant={activeTab === 'feedback' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setActiveTab('feedback')}
        className="gap-1.5"
      >
        <StarIcon className="size-4" />
        <span>Umpan Balik</span>
      </Button>
    </div>
  );
}
