/**
 * 文件系统操作组合式函数
 * 封装服务器模式和本地模式两种文件读取方式
 */

import { ref, computed } from 'vue';
import axios from 'axios';

// 全局状态
const mode = ref('server'); // 'server' 或 'local'
const serverRootDir = ref('');
const localDirectoryHandle = ref(null);
const localRootName = ref('');

/**
 * 检查浏览器是否支持 File System Access API
 */
const isLocalModeSupported = () => {
  return 'showDirectoryPicker' in window;
};

/**
 * 获取当前模式
 */
const currentMode = computed(() => mode.value);

/**
 * 获取当前根目录名称
 */
const rootDirName = computed(() => {
  if (mode.value === 'server') {
    return serverRootDir. value || '服务器目录';
  }
  return localRootName. value || '本地目录';
});

/**
 * 切换到服务器模式并设置根目录
 */
const setServerRoot = async (rootDir) => {
  try {
    const response = await axios.post('/api/config/root', { rootDir });
    if (response.data.success) {
      mode.value = 'server';
      serverRootDir.value = response.data.rootDir;
      localDirectoryHandle.value = null;
      return { success: true, rootDir: response.data.rootDir };
    }
    return { success: false, message: response.data.message };
  } catch (err) {
    return { 
      success: false, 
      message: err.response?.data?.message || '设置根目录失败' 
    };
  }
};

/**
 * 获取当前服务器根目录
 */
const getServerRoot = async () => {
  try {
    const response = await axios.get('/api/config/root');
    if (response.data.success) {
      serverRootDir.value = response.data.rootDir;
      return response.data.rootDir;
    }
    return null;
  } catch (err) {
    console.error('获取服务器根目录失败:', err);
    return null;
  }
};

/**
 * 选择本地文件夹
 */
const selectLocalDirectory = async () => {
  if (!isLocalModeSupported()) {
    return { success: false, message: '您的浏览器不支持本地文件夹访问' };
  }
  
  try {
    const handle = await window.showDirectoryPicker({
      mode: 'read'
    });
    
    mode.value = 'local';
    localDirectoryHandle.value = handle;
    localRootName.value = handle.name;
    
    return { success: true, name: handle.name };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { success: false, message: '用户取消了选择' };
    }
    return { success: false, message: '选择文件夹失败:  ' + err.message };
  }
};

/**
 * 切换回服务器模式
 */
const switchToServerMode = () => {
  mode.value = 'server';
  localDirectoryHandle.value = null;
  localRootName.value = '';
};

/**
 * 获取目录句柄（根据路径）
 */
const getDirectoryHandle = async (relativePath) => {
  if (!localDirectoryHandle.value) return null;
  
  if (! relativePath) {
    return localDirectoryHandle.value;
  }
  
  const parts = relativePath.split('/').filter(Boolean);
  let currentHandle = localDirectoryHandle.value;
  
  for (const part of parts) {
    try {
      currentHandle = await currentHandle.getDirectoryHandle(part);
    } catch (err) {
      console.error(`无法访问目录:  ${part}`, err);
      return null;
    }
  }
  
  return currentHandle;
};

/**
 * 获取文件列表（本地模式）
 */
const getLocalFileList = async (relativePath = '') => {
  const dirHandle = await getDirectoryHandle(relativePath);
  if (!dirHandle) {
    return { success: false, message: '无法访问目录' };
  }
  
  const files = [];
  
  try {
    for await (const entry of dirHandle.values()) {
      const isDirectory = entry.kind === 'directory';
      let size = null;
      let modifiedTime = new Date();
      let mimeType = null;
      
      if (! isDirectory) {
        try {
          const file = await entry.getFile();
          size = file.size;
          modifiedTime = new Date(file.lastModified);
          mimeType = file. type || getMimeType(entry.name);
        } catch (err) {
          console.error(`无法读取文件信息: ${entry.name}`, err);
        }
      }
      
      files.push({
        name: entry.name,
        isDirectory,
        size,
        modifiedTime,
        mimeType
      });
    }
    
    // 排序：文件夹在前，然后按名称排序
    files.sort((a, b) => {
      if (a.isDirectory && ! b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a. name.localeCompare(b.name);
    });
    
    return { success: true, data: files };
  } catch (err) {
    return { success: false, message: '读取目录失败: ' + err. message };
  }
};

/**
 * 获取文件内容（本地模式）
 */
const getLocalFileContent = async (relativePath) => {
  if (!localDirectoryHandle.value || !relativePath) {
    return { success: false, message: '无效的文件路径' };
  }
  
  const parts = relativePath.split('/').filter(Boolean);
  const fileName = parts. pop();
  const dirPath = parts.join('/');
  
  try {
    const dirHandle = await getDirectoryHandle(dirPath);
    if (!dirHandle) {
      return { success: false, message: '无法访问目录' };
    }
    
    const fileHandle = await dirHandle.getFileHandle(fileName);
    const file = await fileHandle.getFile();
    const mimeType = file.type || getMimeType(fileName);
    
    // 根据文件类型处理
    if (mimeType. startsWith('text/') || 
        mimeType === 'application/json' ||
        fileName.endsWith('.jsonl')) {
      const content = await file.text();
      return { success: true, type: 'text', mimeType, content };
    }
    
    if (mimeType.startsWith('image/')) {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);
      return { 
        success: true, 
        type: 'image', 
        mimeType, 
        content: `data:${mimeType};base64,${base64}` 
      };
    }
    
    if (mimeType === 'application/pdf') {
      const blob = new Blob([await file.arrayBuffer()], { type: mimeType });
      const url = URL.createObjectURL(blob);
      return { success:  true, type: 'pdf', mimeType, url, isBlob: true };
    }
    
    if (mimeType. startsWith('video/')) {
      const blob = new Blob([await file. arrayBuffer()], { type: mimeType });
      const url = URL.createObjectURL(blob);
      return { success: true, type: 'video', mimeType, url, isBlob:  true };
    }
    
    if (mimeType.startsWith('audio/')) {
      const blob = new Blob([await file. arrayBuffer()], { type: mimeType });
      const url = URL.createObjectURL(blob);
      return { success: true, type: 'audio', mimeType, url, isBlob:  true };
    }
    
    // 其他类型提供下载
    const blob = new Blob([await file. arrayBuffer()], { type: mimeType });
    const url = URL.createObjectURL(blob);
    return { 
      success: true, 
      type: 'binary', 
      mimeType, 
      url, 
      isBlob: true,
      message: '此文件类型不支持预览，请下载查看' 
    };
    
  } catch (err) {
    return { success: false, message:  '读取文件失败:  ' + err.message };
  }
};

/**
 * 根据文件名获取 MIME 类型
 */
const getMimeType = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase();
  const mimeTypes = {
    // 文本
    'txt': 'text/plain',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'text/javascript',
    'json':  'application/json',
    'jsonl': 'application/x-ndjson',
    'md': 'text/markdown',
    'xml': 'text/xml',
    'csv': 'text/csv',
    // 图片
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'webp': 'image/webp',
    'ico': 'image/x-icon',
    // 视频
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'ogg':  'video/ogg',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'mkv': 'video/x-matroska',
    // 音频
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'flac': 'audio/flac',
    'm4a': 'audio/mp4',
    // 文档
    'pdf': 'application/pdf',
    'doc':  'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // 压缩
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    'tar': 'application/x-tar',
    'gz':  'application/gzip'
  };
  return mimeTypes[ext] || 'application/octet-stream';
};

/**
 * ArrayBuffer 转 Base64
 */
const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/**
 * 统一的获取文件列表方法
 */
const getFileList = async (relativePath = '') => {
  if (mode.value === 'local') {
    return await getLocalFileList(relativePath);
  }
  
  // 服务器模式
  try {
    const response = await axios.get('/api/files/list', {
      params: { path: relativePath }
    });
    return response.data;
  } catch (err) {
    return { 
      success: false, 
      message: err.response?.data?.message || '获取文件列表失败' 
    };
  }
};

/**
 * 统一的获取文件内容方法
 */
const getFileContent = async (relativePath) => {
  if (mode. value === 'local') {
    return await getLocalFileContent(relativePath);
  }
  
  // 服务器模式
  try {
    const response = await axios.get('/api/files/content', {
      params: { path: relativePath }
    });
    return response. data;
  } catch (err) {
    return { 
      success: false, 
      message: err.response?.data?. message || '获取文件内容失败' 
    };
  }
};

export function useFileSystem() {
  return {
    // 状态
    mode,
    currentMode,
    rootDirName,
    localDirectoryHandle,
    
    // 方法
    isLocalModeSupported,
    setServerRoot,
    getServerRoot,
    selectLocalDirectory,
    switchToServerMode,
    getFileList,
    getFileContent
  };
}