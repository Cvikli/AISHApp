import { useState, useCallback, useMemo } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:8001/api';

const apiCall = async (endpoint, method = 'get', data = null) => {
  console.log(`Making API call to ${endpoint} with method ${method}`);
  console.log('Data being sent:', JSON.stringify(data, null, 2));
  try {
    const response = await axios[method](`${BASE_URL}/${endpoint}`, data);
    console.log(`API response for ${endpoint}:`, response.data);
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || `Failed to ${endpoint.replace('_', ' ')}`);
    }
    return response.data;
  } catch (error) {
    console.error(`Error in ${endpoint}:`, error);
    throw error;
  }
};

export const useAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createApiMethod = useCallback((endpoint, method) => async (data = null) => {
    console.log(`Calling API method: ${endpoint}`);
    console.log('Data being sent:', JSON.stringify(data, null, 2));
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiCall(endpoint, method, data);
      console.log(`API method ${endpoint} result:`, result);
      return result;
    } catch (err) {
      console.error(`Error in API method ${endpoint}:`, err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const api = useMemo(() => ({
    initializeAIState: createApiMethod('initialize', 'get'),
    startNewConversation: createApiMethod('new_conversation', 'post'),
    selectConversation: createApiMethod('select_conversation', 'post'),
    setPath: createApiMethod('set_path', 'post'),
    refreshProject: createApiMethod('refresh_project', 'post'),
    updateSystemPrompt: createApiMethod('update_system_prompt', 'post'),
    processMessage: createApiMethod('process_message', 'post'),
    listItems: createApiMethod('list_items', 'post'),
  }), [createApiMethod]);

  return useMemo(() => ({
    isLoading,
    error,
    ...api,
  }), [isLoading, error, api]);
};
