import { useCallback, useEffect, useState } from 'react';
import DashboardService, { ProjectPage, ProjectSummary } from '../services/DashboardService';
import { describeRequestError } from '../services/requestError';

/**
 * One page of project tabs at a time, newest project first. Paging to a new page selects its first
 * project, so the active tab is always one of the visible ones.
 */
export const useProjectTabs = () => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ProjectPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    DashboardService.getProjects(page)
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setActiveId((current) =>
          current && result.items.some((item) => item.projectId === current) ? current : result.items[0]?.projectId ?? null
        );
      })
      .catch((caught) => {
        if (!cancelled) setError(describeRequestError(caught, 'Gagal memuat daftar proyek.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, attempt]);

  const projects: ProjectSummary[] = data?.items ?? [];
  const hasMore = data?.hasMore ?? false;

  const next = useCallback(() => setPage((current) => current + 1), []);
  const prev = useCallback(() => setPage((current) => Math.max(1, current - 1)), []);
  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  return {
    page,
    projects,
    total: data?.total ?? 0,
    hasMore,
    hasPrev: page > 1,
    loading,
    error,
    activeId,
    activeProject: projects.find((project) => project.projectId === activeId) ?? null,
    select: setActiveId,
    next,
    prev,
    retry,
  };
};
