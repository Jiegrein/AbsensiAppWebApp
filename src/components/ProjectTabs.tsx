import { ProjectSummary } from '../services/DashboardService';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface ProjectTabsProps {
  projects: ProjectSummary[];
  activeId: string | null;
  page: number;
  hasPrev: boolean;
  hasMore: boolean;
  loading: boolean;
  onSelect: (projectId: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

/** Browser-style tab strip: one page of projects, arrows load the previous or next page. */
export const ProjectTabs = ({ projects, activeId, page, hasPrev, hasMore, loading, onSelect, onPrev, onNext }: ProjectTabsProps) => (
  <nav className="tabs" aria-label="Proyek">
    <button type="button" className="tabs__arrow" aria-label="Proyek sebelumnya" disabled={!hasPrev || loading} onClick={onPrev}>
      <ChevronLeftIcon />
    </button>

    <div className="tabs__list" role="tablist" aria-busy={loading}>
      {projects.map((project) => {
        const selected = project.projectId === activeId;
        return (
          <button
            key={project.projectId}
            type="button"
            role="tab"
            className="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            title={project.projectName}
            onClick={() => onSelect(project.projectId)}
          >
            <span className="tab__label">{project.projectName}</span>
            <span className="tab__zone">GMT+{project.hourOffsetGmt}</span>
          </button>
        );
      })}
      {!loading && projects.length === 0 && <span className="tabs__empty">Belum ada proyek.</span>}
    </div>

    <span className="tabs__page" aria-label={`Halaman ${page}`}>{page}</span>
    <button type="button" className="tabs__arrow" aria-label="Proyek berikutnya" disabled={!hasMore || loading} onClick={onNext}>
      <ChevronRightIcon />
    </button>
  </nav>
);
