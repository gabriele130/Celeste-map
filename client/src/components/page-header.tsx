import { ChevronRight } from "lucide-react";
import { Link } from "wouter";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 space-y-2">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-sm text-muted-foreground" data-testid="breadcrumb-nav">
          {breadcrumbs.map((item, index) => (
            <span key={index} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="w-4 h-4" />}
              {item.href ? (
                <Link 
                  href={item.href} 
                  className="hover:text-foreground transition-colors"
                  data-testid={`link-breadcrumb-${index}`}
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground" data-testid={`text-breadcrumb-${index}`}>{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-page-title">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1" data-testid="text-page-description">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 flex-wrap" data-testid="page-actions">{actions}</div>}
      </div>
    </div>
  );
}
