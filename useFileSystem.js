import { ref, computed } from 'vue';
import axios from 'axios';

const mode = ref('server');
const tosPath = ref('');
const currentMode = computed(() => mode.value);
const selectedTosPath = ref('');

async function fetchTosList(path) {
  try {
    const response = await axios.get('/api/tos/list', {
      params: { path }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch TOS list:', error);
    throw error;
  }
}

async function fetchTosContent(path) {
  try {
    const response = await axios.get('/api/tos/content', {
      params: { path }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch TOS content:', error);
    throw error;
  }
}

function setTosMode(path) {
  mode.value = 'tos';
  tosPath.value = path;
}

export function useFileSystem() {
  return {
    currentMode,
    fetchTosList,
    fetchTosContent,
    setTosMode
  };
}