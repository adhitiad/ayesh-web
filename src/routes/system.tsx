import { createFileRoute } from '@tanstack/react-router';
import { RefreshCwIcon, AlertCircleIcon } from '@/components/icons';
import { useSystemCore } from '../hooks/use-system-core';
import { useSystemPanels } from '../hooks/use-system-panels';
import { Button } from '../components/ui/button';
import { Spinner } from '../components/ui/spinner';
import { SystemTabSwitcher } from '../components/system/tab-switcher';
import { OverviewTab } from '../components/system/overview-tab';
import { JobsTab } from '../components/system/jobs-tab';
import { TasksTab } from '../components/system/tasks-tab';
import { LogsTab } from '../components/system/logs-tab';
import { PromptsTab } from '../components/system/prompts-tab';
import { FeedbackTab } from '../components/system/feedback-tab';
import { AuditTab } from '../components/system/audit-tab';

export const Route = createFileRoute('/system')({
  component: SystemPage,
});

function SystemPage() {
  const {
    activeTab,
    setActiveTab,
    health,
    usage,
    approvals,
    jobs,
    tasks,
    auditLogs,
    loading,
    busyAction,
    error,
    loadData,
    showJobForm,
    setShowJobForm,
    newJobName,
    setNewJobName,
    newJobPrompt,
    setNewJobPrompt,
    newJobInterval,
    setNewJobInterval,
    newJobDailyAt,
    setNewJobDailyAt,
    scheduleType,
    setScheduleType,
    creatingJob,
    newTaskMessage,
    setNewTaskMessage,
    submittingTask,
    verifyingAudit,
    auditResult,
    handleApprove,
    handleDeny,
    handleToggleJob,
    handleRunJob,
    handleDeleteJob,
    handleCreateJob,
    handleSubmitTask,
    handleVerifyAudit,
  } = useSystemCore();
  const {
    analytics,
    metrics,
    recentUsage,
    usageUsers,
    usageUid,
    setUsageUid,
    userUsage,
    logs,
    logLevel,
    setLogLevel,
    busyLogs,
    loadLogs,
    handleClearLogs,
    templates,
    keywords,
    promptLoaded,
    newTplName,
    setNewTplName,
    newTplText,
    setNewTplText,
    newKwAgent,
    setNewKwAgent,
    newKwWord,
    setNewKwWord,
    busyPrompt,
    handleCreateTemplate,
    handleDeleteTemplate,
    handleAddKeyword,
    handleDeleteKeyword,
    feedbackStats,
    recentFeedback,
    feedbackLoaded,
  } = useSystemPanels(activeTab);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Sistem & Pemantauan</h1>
          <p className="text-sm text-muted-foreground">
            Status infrastruktur server, metrik penggunaan token LLM, dan persetujuan aksi kritis.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void loadData()}
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
          <span>Error memuat data sistem: {error}</span>
        </div>
      )}

      <SystemTabSwitcher
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        approvals={approvals}
        jobs={jobs}
        tasks={tasks}
        auditLogs={auditLogs}
      />

      {loading ? (
        <div className="flex flex-1 items-center justify-center p-12">
          <Spinner className="size-8 text-muted-foreground" />
        </div>
      ) : activeTab === 'overview' ? (
        <OverviewTab
          health={health}
          usage={usage}
          approvals={approvals}
          busyAction={busyAction}
          handleApprove={handleApprove}
          handleDeny={handleDeny}
        />
      ) : activeTab === 'jobs' ? (
        <JobsTab
          showJobForm={showJobForm}
          setShowJobForm={setShowJobForm}
          newJobName={newJobName}
          setNewJobName={setNewJobName}
          newJobPrompt={newJobPrompt}
          setNewJobPrompt={setNewJobPrompt}
          scheduleType={scheduleType}
          setScheduleType={setScheduleType}
          newJobInterval={newJobInterval}
          setNewJobInterval={setNewJobInterval}
          newJobDailyAt={newJobDailyAt}
          setNewJobDailyAt={setNewJobDailyAt}
          handleCreateJob={handleCreateJob}
          creatingJob={creatingJob}
          jobs={jobs}
          busyAction={busyAction}
          handleToggleJob={handleToggleJob}
          handleRunJob={handleRunJob}
          handleDeleteJob={handleDeleteJob}
        />
      ) : activeTab === 'tasks' ? (
        <TasksTab
          newTaskMessage={newTaskMessage}
          setNewTaskMessage={setNewTaskMessage}
          handleSubmitTask={handleSubmitTask}
          submittingTask={submittingTask}
          tasks={tasks}
        />
      ) : activeTab === 'logs' ? (
        <LogsTab
          loadLogs={loadLogs}
          logLevel={logLevel}
          setLogLevel={setLogLevel}
          busyLogs={busyLogs}
          handleClearLogs={handleClearLogs}
          analytics={analytics}
          metrics={metrics}
          usageUsers={usageUsers}
          usageUid={usageUid}
          setUsageUid={setUsageUid}
          userUsage={userUsage}
          recentUsage={recentUsage}
          logs={logs}
        />
      ) : activeTab === 'prompts' ? (
        <PromptsTab
          handleCreateTemplate={handleCreateTemplate}
          newTplName={newTplName}
          setNewTplName={setNewTplName}
          newTplText={newTplText}
          setNewTplText={setNewTplText}
          busyPrompt={busyPrompt}
          promptLoaded={promptLoaded}
          templates={templates}
          handleDeleteTemplate={handleDeleteTemplate}
          keywords={keywords}
          handleAddKeyword={handleAddKeyword}
          newKwAgent={newKwAgent}
          setNewKwAgent={setNewKwAgent}
          newKwWord={newKwWord}
          setNewKwWord={setNewKwWord}
          handleDeleteKeyword={handleDeleteKeyword}
        />
      ) : activeTab === 'feedback' ? (
        <FeedbackTab
          feedbackLoaded={feedbackLoaded}
          feedbackStats={feedbackStats}
          recentFeedback={recentFeedback}
        />
      ) : (
        <AuditTab
          handleVerifyAudit={handleVerifyAudit}
          verifyingAudit={verifyingAudit}
          auditResult={auditResult}
          auditLogs={auditLogs}
        />
      )}
    </div>
  );
}
