import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface RouterContextType {
  path: string;
  navigate: (to: string) => void;
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

  const navigate = (to: string) => {
    if (typeof window !== 'undefined') {
      const [pathname, search] = to.split('?');
      window.history.pushState({}, '', to);
      setPath(pathname || '/');
      setSearchParams(new URLSearchParams(search || ''));
      window.scrollTo(0, 0);
    }
  };

  // Helper to extract route parameters
  const getParams = (): Record<string, string> => {
    // Check patterns
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

export function Link({
  to,
  children,
  className = '',
  title,
  ariaLabel,
  onClick,
}: {
  to: string;
  children: ReactNode;
  className?: string;
  title?: string;
  ariaLabel?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const { navigate } = useRouter();

  return (
    <a
      href={to}
      title={title}
      aria-label={ariaLabel}
      className={className}
      onClick={e => {
        e.preventDefault();
        if (onClick) onClick(e);
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}
