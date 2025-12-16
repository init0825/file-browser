<!--
  全局预览组件
-->
<template>
  <div class="global-preview">
    <!-- 未选择文件夹时的提示 -->
    <div v-if="!folderPath" class="no-folder">
      <div class="placeholder">
        <span class="icon">👈</span>
        <p>请从左侧选择一个文件夹进行全局预览</p>
        <p class="hint">点击文件夹后，将在此处展示该文件夹下的所有文件内容</p>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-else-if="loading" class="loading">
      <span>正在加载文件夹内容...</span>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error">
      <span>❌ {{ error }}</span>
    </div>
    
    <!-- 文件夹信息和文件网格 -->
    <div v-else class="preview-container">
      <!-- 文件夹标题栏 -->
      <div class="folder-header">
        <h3>📂 {{ folderPath }}</h3>
        <span class="file-count">共 {{ files. length }} 个文件</span>
      </div>
      
      <!-- 无文件提示 -->
      <div v-if="files.length === 0" class="no-files">
        <span>📭 该文件夹下没有文件（可能只有子文件夹）</span>
      </div>
      
      <!-- 文件网格展示 -->
      <div v-else class="files-grid">
        <div 
          v-for="file in files" 
          :key="file.name"
          class="file-card"
        >
          <!-- 文件标题 -->
          <div class="card-header">
            <span class="file-icon">{{ getFileIcon(file) }}</span>
            <span class="file-name" :title="file.name">{{ file.name }}</span>
          </div>
          
          <!-- 文件内容预览 -->
          <div class="card-content">
            <FileCardContent 
              :file-path="getFilePath(file. name)"
              :file-name="file.name"
              :mime-type="file.mimeType"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import FileCardContent from './FileCardContent.vue';

const props = defineProps({
  folderPath: {
    type: String,
    default: ''
  }
});

const files = ref([]);
const loading = ref(false);
const error = ref('');

const fetchFolderFiles = async () => {
  if (!props.folderPath) {
    files.value = [];
    return;
  }
  
  loading.value = true;
  error.value = '';
  
  try {
    const response = await axios.get('/api/files/list', {
      params: { path: props.folderPath }
    });
    
    if (response.data.success) {
      files.value = response. data.data. filter(item => ! item.isDirectory);
    } else {
      error.value = response.data. message || '获取文件列表失败';
    }
  } catch (err) {
    error.value = err.response?.data?.message || '网络请求失败';
    console. error('获取文件列表失败:', err);
  } finally {
    loading.value = false;
  }
};

const getFilePath = (fileName) => {
  return props.folderPath ?  `${props.folderPath}/${fileName}` : fileName;
};

const getFileIcon = (file) => {
  const mimeType = file.mimeType || '';
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎬';
  if (mimeType. startsWith('audio/')) return '🎵';
  if (mimeType.includes('json')) return '📋';
  if (mimeType.startsWith('text/')) return '📄';
  if (mimeType.includes('pdf')) return '📕';
  return '📄';
};

watch(() => props.folderPath, () => {
  fetchFolderFiles();
}, { immediate: true });
</script>

<style scoped>
.global-preview {
  height: 100%;
  display:  flex;
  flex-direction:  column;
  overflow: hidden;
}

.no-folder {
  flex: 1;
  display:  flex;
  align-items:  center;
  justify-content:  center;
}

.placeholder {
  text-align: center;
  color: #999;
}

.placeholder .icon {
  font-size: 64px;
  display: block;
  margin-bottom: 20px;
}

.placeholder p {
  margin: 10px 0;
  font-size: 16px;
}

.placeholder .hint {
  font-size: 13px;
  color: #bbb;
}

.loading, .error {
  flex: 1;
  display:  flex;
  align-items:  center;
  justify-content:  center;
  color: #666;
  font-size: 16px;
}

.error {
  color: #e74c3c;
}

.preview-container {
  flex:  1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.folder-header {
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  display:  flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.folder-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
  word-break: break-all;
}

.file-count {
  color: #888;
  font-size: 13px;
}

.no-files {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 15px;
}

.files-grid {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  align-content: start;
}

.file-card {
  background: #fff;
  border:  1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 350px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s, transform 0.2s;
}

.file-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  padding: 12px 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.file-icon {
  font-size: 20px;
}

.file-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-content {
  flex: 1;
  overflow: auto;
  background: #fafafa;
}
</style>