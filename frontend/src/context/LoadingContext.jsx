/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { setAxiosLoadingListeners } from '../lib/api';

const LOADER_SHOW_DELAY = 140;
const LOADER_MIN_VISIBLE = 360;

const LoadingContext = createContext(null);

export const LoadingProvider = ({ children }) => {
  const [activeRequests, setActiveRequests] = useState(0);
  const [activeRouteTransitions, setActiveRouteTransitions] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const visibleAtRef = useRef(0);

  const beginRequest = useCallback(() => {
    setActiveRequests((count) => count + 1);
  }, []);

  const endRequest = useCallback(() => {
    setActiveRequests((count) => Math.max(0, count - 1));
  }, []);

  const beginRouteTransition = useCallback((duration = 480) => {
    let finished = false;

    setActiveRouteTransitions((count) => count + 1);

    const complete = () => {
      if (finished) return;
      finished = true;
      setActiveRouteTransitions((count) => Math.max(0, count - 1));
    };

    const timer = window.setTimeout(complete, duration);

    return () => {
      window.clearTimeout(timer);
      complete();
    };
  }, []);

  useEffect(() => {
    setAxiosLoadingListeners({
      start: beginRequest,
      end: endRequest,
    });

    return () => {
      setAxiosLoadingListeners({});
    };
  }, [beginRequest, endRequest]);

  const isPending = activeRequests > 0 || activeRouteTransitions > 0;

  useEffect(() => {
    let timer;

    if (isPending) {
      if (!isVisible) {
        timer = window.setTimeout(() => {
          visibleAtRef.current = Date.now();
          setIsVisible(true);
        }, LOADER_SHOW_DELAY);
      }
      return () => window.clearTimeout(timer);
    }

    if (!isVisible) return undefined;

    const elapsed = Date.now() - visibleAtRef.current;
    const remaining = Math.max(0, LOADER_MIN_VISIBLE - elapsed);

    timer = window.setTimeout(() => {
      setIsVisible(false);
    }, remaining);

    return () => window.clearTimeout(timer);
  }, [isPending, isVisible]);

  const value = useMemo(() => ({
    isLoading: isVisible,
    isPending,
    beginRouteTransition,
  }), [beginRouteTransition, isPending, isVisible]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);

  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }

  return context;
};

export default LoadingContext;
