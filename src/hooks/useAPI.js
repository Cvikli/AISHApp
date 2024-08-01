import { useState, useCallback } from 'react';
import * as API from '../API';

export const useAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const initializeAIState = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await API.initializeAIState();
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startNewConversation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await API.startNewConversation();
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectConversation = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await API.selectConversation(id);
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setPath = useCallback(async (path) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await API.setPath(path);
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshProject = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await API.refreshProject();
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSystemPrompt = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await API.updateSystemPrompt();
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    initializeAIState,
    startNewConversation,
    selectConversation,
    setPath,
    refreshProject,
    updateSystemPrompt,
  };
};
