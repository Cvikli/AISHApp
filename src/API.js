import axios from 'axios';

const BASE_URL = 'http://localhost:8001/api';

const handleApiError = (error, message) => {
  console.error(message, error);
  throw error;
};

export const initializeAIState = async () => {
  console.log('initializeAIState called');
  try {
    const response = await axios.get(`${BASE_URL}/initialize`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error initializing AI state:');
  }
};

export const startNewConversation = async () => {
  try {
    const response = await axios.post(`${BASE_URL}/new_conversation`);
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Failed to start new conversation');
    }
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error starting new conversation:');
  }
};

export const selectConversation = async (id) => {
  try {
    const response = await axios.post(`${BASE_URL}/select_conversation`, { conversation_id: id });
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Failed to select conversation');
    }
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error selecting conversation:');
  }
};

export const setPath = async (path) => {
  try {
    const response = await axios.post(`${BASE_URL}/set_path`, { path: path });
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Failed to set project path');
    }
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error setting project path:');
  }
};

export const refreshProject = async () => {
  try {
    const response = await axios.post(`${BASE_URL}/refresh_project`);
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Failed to refresh project');
    }
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error refreshing project:');
  }
};

export const updateSystemPrompt = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/update_system_prompt`);
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Failed to update system prompt');
    }
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error updating system prompt:');
  }
};

export const processMessage = async (message, conversationId) => {
  try {
    const response = await axios.post(`${BASE_URL}/process_message`, 
      { message, conversation_id: conversationId },
      { headers: { 'Content-Type': 'application/json' } }
    );
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Failed to process message');
    }
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error processing message:');
  }
};
