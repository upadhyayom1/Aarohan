import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface NavigateOptions {
  replace?: boolean;
}

interface RouterContextType {
  path: string;
  navigate: (to: string, options?: NavigateOptions) => void;
  params: Record<string, string>;
  searchParams: URLSearchParams;
}

const RouterContext = createContext<RouterContextType>({
  path: '/',
  navigate: () => {},
  params: {},
  searchParams: new URLSearchParams(),
});

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  const [searchParams, setSearchParams] = useState<URLSearchParams>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams();
  });

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname || '/');
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string, options?: NavigateOptions) => {
    if (typeof window !== 'undefined') {
      const [pathname, search] = to.split('?');
      if (options?.replace) {
        window.history.replaceState({}, '', to);
      } else {
        window.history.pushState({}, '', to);
      }
      setPath(pathname || '/');
      setSearchParams(new URLSearchParams(search || ''));
      window.scrollTo(0, 0);
    }
  };

  // Helper to extract route parameters
  const getParams = (): Record<string, string> => {
    const oppMatch = path.match(/^\/opportunities\/([^/]+)$/);
    if (oppMatch) return { jobId: oppMatch[1] };

    const stuAppMatch = path.match(/^\/student\/applications\/([^/]+)$/);
    if (stuAppMatch) return { applicationId: stuAppMatch[1] };

    const recJobAppMatch = path.match(/^\/recruiter\/jobs\/([^/]+)\/applicants$/);
    if (recJobAppMatch) return { jobId: recJobAppMatch[1] };

    const recJobEditMatch = path.match(/^\/recruiter\/jobs\/([^/]+)\/edit$/);
    if (recJobEditMatch) return { jobId: recJobEditMatch[1] };

    const recJobMatch = path.match(/^\/recruiter\/jobs\/([^/]+)$/);
    if (recJobMatch) return { jobId: recJobMatch[1] };

    const recCandidateMatch = path.match(/^\/recruiter\/candidates\/([^/]+)$/);
    if (recCandidateMatch) return { applicationId: recCandidateMatch[1] };

    const adminStudentMatch = path.match(/^\/admin\/students\/([^/]+)$/);
    if (adminStudentMatch) return { studentId: adminStudentMatch[1] };

    return {};
  };

  return (
    <RouterContext.Provider value={{ path, navigate, params: getParams(), searchParams }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  return useContext(RouterContext);
}

export interface LinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  title?: string;
  ariaLabel?: string;
  target?: string;
  rel?: string;
  replace?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function Link({
  to,
  children,
  className = '',
  title,
  ariaLabel,
  target,
  rel,
  replace,
  onClick,
}: LinkProps) {
  const { navigate } = useRouter();

  const isExternal =
    to.startsWith('http://') ||
    to.startsWith('https://') ||
    to.startsWith('mailto:') ||
    to.startsWith('tel:') ||
    target === '_blank';

  return (
    <a
      href={to}
      title={title}
      aria-label={ariaLabel}
      target={target}
      rel={target === '_blank' && !rel ? 'noopener noreferrer' : rel}
      className={className}
      onClick={(e) => {
        if (isExternal) {
          if (onClick) onClick(e);
          return;
        }
        e.preventDefault();
        if (onClick) onClick(e);
        navigate(to, { replace });
      }}
    >
      {children}
    </a>
  );
}
