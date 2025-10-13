import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetcher(url: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!res.ok) {
    // Get error details from response
    let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const errorData = await res.json();
      if (errorData.error) {
        errorMessage += ` - ${errorData.error}`;
      } else if (errorData.detail) {
        errorMessage += ` - ${errorData.detail}`;
      } else if (errorData.message) {
        errorMessage += ` - ${errorData.message}`;
      } else {
        errorMessage += ` - ${JSON.stringify(errorData)}`;
      }
    } catch (e) {
      // If we can't parse JSON, just use the status
      errorMessage += ` (failed to parse error response)`;
    }
    throw new Error(errorMessage);
  }
  
  return res.json();
}
