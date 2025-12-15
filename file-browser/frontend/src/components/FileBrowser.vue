<template>
  <div class="file-browser">
    <!-- 左侧面板：文件列表 -->
    <div class="file-list-panel">
      <!-- 当前路径显示和导航 -->
      <div class="breadcrumb">
        <span 
          class="breadcrumb-item clickable"
          @click="navigateTo('')"
        >
          🏠 根目录
        </span>
        <template v-for="(segment, index) in pathSegments" :key="index">
          <span class="breadcrumb-separator">/</span>
          <span 
            class="breadcrumb-item clickable"
            @click="navigateTo(pathSegments. slice(0, index + 1).join('/'))"
          >
            {{ segment }}
          </span>
        </template>
      </div>
      
      <!-- 文件列表组件 -->
      <FileList 
        :current-path="currentPath"
        :preview-mode="previewMode"
        :  show-only-folders="showOnlyFolders"
        : refresh-key="refreshKey"
        @select-folder="handleSelectFolder"
        @select-file="handleSelectFile"
      />
    </div>
    
    <!-- 右侧面板：预览区 -->
    <div class="preview-panel">
      <!-- 单文件预览模式 -->
      <FilePreview 
        v-if="previewMode === 'single'"
        :file-path="selectedFilePath"
        :file-name="selectedFileName"
      />
      
      <!-- 全局预览模式 -->
      <GlobalPreview 
        v-else
        :folder-path="globalPreviewPath"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import FileList from './FileList.vue';
import FilePreview from './FilePreview.vue';
import GlobalPreview from './GlobalPreview. vue';

const props = defineProps({
  previewMode: {
    type:  String,
    default: 'single'
  },
  refreshKey: {
    type: Number,
    default: 0
  }
});

const currentPath = ref('');
const selectedFilePath = ref('');
const selectedFileName = ref('');
const globalPreviewPath = ref('');

const pathSegments = computed(() => {
  if (! currentPath.value) return [];
  return currentPath.value.split('/').filter(Boolean);
});

const showOnlyFolders = computed(() => {
  return props. previewMode === 'global' && globalPreviewPath.value !== '';
});

const navigateTo = (path) => {
  currentPath.value = path;
  selectedFilePath.value = '';
  selectedFileName.value = '';
  if (props.previewMode === 'global') {
    globalPreviewPath.value = path;
  }
};

const handleSelectFolder = (folderName) => {
  const newPath = currentPath.value 
    ? `${currentPath.value}/${folderName}` 
    : folderName;
  
  if (props.previewMode === 'single') {
    currentPath.value = newPath;
    selectedFilePath.value = '';
    selectedFileName.value = '';
  } else {
    currentPath.value = newPath;
    globalPreviewPath.value = newPath;
  }
};

const handleSelectFile = (file) => {
  if (props.previewMode === 'single') {
    selectedFilePath.value = currentPath.value 
      ? `${currentPath.value}/${file.name}` 
      : file.name;
    selectedFileName.value = file.name;
  }
};

watch(() => props.previewMode, (newMode) => {
  selectedFilePath.value = '';
  selectedFileName.value = '';
  if (newMode === 'global') {
    globalPreviewPath.value = currentPath.value;
  } else {
    globalPreviewPath.value = '';
  }
});

// 监听 refreshKey 变化，重置路径
watch(() => props.refreshKey, () => {
  currentPath.value = '';
  selectedFilePath.value = '';
  selectedFileName.value = '';
  globalPreviewPath.value = '';
});
</script>

<style scoped>
.file-browser {
  display: flex;
  gap: 20px;
  height: calc(100vh - 100px);
}

.file-list-panel {
  width: 350px;
  min-width: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow:   hidden;
}

.breadcrumb {
  padding: 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
}

.breadcrumb-item {
  color: #666;
}

.breadcrumb-item.clickable {
  cursor: pointer;
  color: #667eea;
}

.breadcrumb-item.clickable:hover {
  text-decoration: underline;
}

.breadcrumb-separator {
  color: #ccc;
  margin: 0 5px;
}

.preview-panel {
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
</style>