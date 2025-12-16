<template>
  <div class="app-container">
    <header class="app-header">
      <h1>📁 文件浏览器</h1>
      <div class="preview-mode-toggle">
        <span class="mode-label">预览模式：</span>
        <button 
          class="mode-btn"
          :class="{ active: previewMode === 'single' }"
          @click="previewMode = 'single'"
        >
          📄 单文件预览
        </button>
        <button 
          class="mode-btn"
          :class="{ active: previewMode === 'global' }"
          @click="previewMode = 'global'"
        >
          📑 全局预览
        </button>
      </div>
    </header>
    
    <main class="app-main">
      <FileBrowser :preview-mode="previewMode" />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import FileBrowser from './components/FileBrowser.vue';

const previewMode = ref('single');
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  margin: 0;
  font-size: 24px;
}

.preview-mode-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mode-label {
  font-size: 14px;
  opacity: 0.9;
}

.mode-btn {
  padding: 8px 16px;
  border:  2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s ease;
}

.mode-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.mode-btn.active {
  background: rgba(255, 255, 255, 0.95);
  color: #667eea;
  border-color: white;
  font-weight: 600;
}

.app-main {
  flex: 1;
  padding: 20px;
  background-color: #f5f5f5;
}
</style>