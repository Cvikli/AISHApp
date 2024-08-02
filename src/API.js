import axios from 'axios';

const BASE_URL = 'http://localhost:8001/api';

const handleApiError = (error, message) => {
  console.error(message, error);
  throw error;
};

const apiCall = async (endpoint, method = 'get', data = null) => {
  try {
    const response = await axios[method](`${BASE_URL}/${endpoint}`, data);
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || `Failed to ${endpoint.replace('_', ' ')}`);
    }
    return response.data;
  } catch (error) {
    handleApiError(error, `Error in ${endpoint}:`);
  }
};

export const initializeAIState = () => apiCall('initialize');
export const startNewConversation = () => apiCall('new_conversation', 'post');
export const selectConversation = (id) => apiCall('select_conversation', 'post', { conversation_id: id });
export const setPath = (path) => apiCall('set_path', 'post', { path });
export const refreshProject = () => apiCall('refresh_project', 'post');
export const updateSystemPrompt = () => apiCall('update_system_prompt');
export const processMessage = (message, conversationId) => 
  apiCall('process_message', 'post', { message, conversation_id: conversationId });
