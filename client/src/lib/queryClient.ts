import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = res.statusText;
    try {
      const json = await res.json();
      errorMessage = json.message || json.error || errorMessage;
    } catch {
      const text = await res.text();
      if (text) errorMessage = text;
    }
    throw new Error(errorMessage);
  }
}

export async function apiRequest<T = unknown>(
  method: string,
  url: string,
  data?: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  return {} as T;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const basePath = queryKey[0] as string;
    const params = queryKey.slice(1);
    
    let url = basePath;
    if (params.length > 0) {
      const hasQueryParams = params.some(p => typeof p === 'object');
      if (hasQueryParams) {
        const queryParams = params.find(p => typeof p === 'object') as Record<string, string> | undefined;
        const pathParams = params.filter(p => typeof p !== 'object' && p !== undefined && p !== null);
        
        if (pathParams.length > 0) {
          url = `${basePath}/${pathParams.join('/')}`;
        }
        
        if (queryParams && Object.keys(queryParams).length > 0) {
          const searchParams = new URLSearchParams(
            Object.entries(queryParams).filter(([_, v]) => v !== undefined && v !== null && v !== '') as [string, string][]
          );
          if (searchParams.toString()) {
            url = `${url}?${searchParams.toString()}`;
          }
        }
      } else {
        const pathParams = params.filter(p => p !== undefined && p !== null);
        if (pathParams.length > 0) {
          url = `${basePath}/${pathParams.join('/')}`;
        }
      }
    }
    
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 60000,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
