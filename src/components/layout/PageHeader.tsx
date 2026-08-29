import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  badge?: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  breadcrumbs,
  title,
  badge,
  description,
  actions
}) => {
  const { navigate } = useNavigation();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-[var(--border-hairline)]">
      <div>
        {/* Dynamic Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-1">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3 h-3 text-[var(--text-tertiary)] shrink-0" />}
                {crumb.path && !isLast ? (
                  <button
                    onClick={() => navigate(crumb.path!)}
                    className="hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className={isLast ? 'text-[var(--text-primary)] font-medium' : ''}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Title & Badge */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            {title}
          </h1>
          {badge}
        </div>

        {/* Subtitle / Description */}
        {description && (
          <p className="text-xs text-[var(--text-muted)] mt-0.5 max-w-3xl">
            {description}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
};
