import { useState, useCallback, useMemo } from 'react';
import * as API from '../API';

export const useAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createApiMethod = useCallback((apiFunc) => async (...args) => {
    setIsLoading(true);
    setError(null);
    try {
      return await apiFunc(...args);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const apiMethods = useMemo(() => ({
    initializeAIState: createApiMethod(API.initializeAIState),
    startNewConversation: createApiMethod(API.startNewConversation),
    selectConversation: createApiMethod(API.selectConversation),
    setPath: createApiMethod(API.setPath),
    refreshProject: createApiMethod(API.refreshProject),
    updateSystemPrompt: createApiMethod(API.updateSystemPrompt),
  }), [createApiMethod]);

  return {
    isLoading,
    error,
    ...apiMethods,
  };
};
