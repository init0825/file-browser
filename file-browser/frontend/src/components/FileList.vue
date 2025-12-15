<template>
  <div class="file-list">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <span>加载中...</span>
    </div>
    
    <!-- 错误提示 -->
    <div v-else-if="error" class="error">
      <span>❌ {{ error }}</span>
    </div>
    
    <!-- 空目录提示 -->
    <div v-else-if="displayFiles.length === 0" class="empty">
      <span>📭 {{ emptyMessage }}</span>
    </div>
    
    <!-- 文件列表 -->
    <ul v-else class="list">
      <li 
        v-for="file in displayFiles" 
        : key="file.name"
        class="list-item"
        : class="{ 'is-directory': file.isDirectory }"
        @click="handleItemClick(file)"
      >
        <span class="item-icon">{{ getFileIcon(file) }}</span>
        <span class="item-name">{{ file. name }}</span>
        <span v-if="! file.isDirectory && ! showOnlyFolders" class="item-size">
          {{ formatFileSize(file.size) }}
        </span>
        <span class="item-time">{{ formatTime(file.modifiedTime) }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useFileSystem } from '../composables/useFileSystem. js';

const { getFileList } = useFileSystem();

const props = defineProps({
  currentPath: {
    type:  String,
    default: ''
  },
  previewMode:  {
    type: String,
    default: 'single'
  },
  showOnlyFolders: {
    type:  Boolean,
    default: false
  },
  refreshKey: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['select-folder', 'select-file']);

const files = ref([]);
const loading = ref(false);
const error = ref('');

const displayFiles = computed(() => {
  if (props.showOnlyFolders) {
    return files.value. filter(file => file.isDirectory);
  }
  return files.value;
});

const emptyMessage = computed(() => {
  if (props.showOnlyFolders) {
    return '该目录下没有子文件夹';
  }
  return '该目录为空';
});

const fetchFiles = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const result = await getFileList(props. currentPath);
    
    if (result.success) {
      files.value = result.data;
    } else {
      error.value = result.message || '获取文件列表失败';
    }
  } catch (err) {
    error.value = '获取文件列表失败';
    console.error('获取文件列表失败:', err);
  } finally {
    loading.value = false;
  }
};

const handleItemClick = (file) => {
  if (file.isDirectory) {
    emit('select-folder', file.name);
  } else {
    if (! props.showOnlyFolders) {
      emit('select-file', file);
    }
  }
};

const getFileIcon = (file) => {
  if (file.isDirectory) return '📁';
  const mimeType = file.mimeType || '';
  if (mimeType. startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎬';
  if (mimeType. startsWith('audio/')) return '🎵';
  if (mimeType.includes('json')) return '📋';
  if (mimeType.startsWith('text/')) return '📄';
  if (mimeType.includes('pdf')) return '📕';
  return '📄';
};

const formatFileSize = (bytes) => {
  if (! bytes || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math. log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + units[i];
};

const formatTime = (timeStr) => {
  if (!timeStr) return '-';
  const date = new Date(timeStr);
  return date.toLocaleDateString('zh-CN');
};

watch(() => props.currentPath, () => {
  fetchFiles();
});

watch(() => props.refreshKey, () => {
  fetchFiles();
});

onMounted(() => {
  fetchFiles();
});
</script>

<style scoped>
.file-list {
  flex: 1;
  overflow-y: auto;
}

.loading, .error, .empty {
  padding: 40px;
  text-align:  center;
  color: #666;
}

.error {
  color: #e74c3c;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition:  background-color 0.2s;
}

.list-item:hover {
  background-color: #f8f9fa;
}

.list-item.is-directory:hover {
  background-color:  #e8f4ff;
}

.item-icon {
  font-size: 20px;
  margin-right: 12px;
  width: 24px;
  text-align: center;
}

.item-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-size {
  color: #999;
  font-size: 12px;
  margin-left: 15px;
  min-width: 60px;
  text-align: right;
}

.item-time {
  color: #999;
  font-size: 12px;
  margin-left: 15px;
  min-width: 80px;
  text-align:  right;
}
</style>