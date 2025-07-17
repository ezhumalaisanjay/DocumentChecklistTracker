import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export function useUrlParams() {
  const [location] = useLocation();
  const [params, setParams] = useState<URLSearchParams>(new URLSearchParams());

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setParams(searchParams);
  }, [location]);

  const getParam = (key: string): string | null => {
    return params.get(key);
  };

  const getBooleanParam = (key: string, defaultValue: boolean = false): boolean => {
    const value = params.get(key);
    if (value === null) return defaultValue;
    return value.toLowerCase() === 'yes' || value.toLowerCase() === 'true';
  };

  const getStringParam = (key: string, defaultValue: string = ''): string => {
    return params.get(key) || defaultValue;
  };

  return {
    params,
    getParam,
    getBooleanParam,
    getStringParam,
  };
}