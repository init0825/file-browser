<template>
  <div class="app-container">
    <header class="app-header">
      <h1>📁 文件浏览器</h1>
      
      <!-- 中间：目录信息和切换按钮 -->
      <div class="directory-controls">
        <span class="current-dir">
          📂 {{ rootDirName }}
          <span class="mode-badge">{{ currentMode === 'server' ? '服务器' : '本地' }}</span>
        </span>
        <button class="dir-btn" @click="showDirectoryModal = true">
          🔄 更换目录
        </button>
      </div>
      
      <!-- 右侧：预览模式切换 -->
      <div class="preview-mode-toggle">
        <span class="mode-label">预览模式：</span>
        <button 
          class="mode-btn"
          :class="{ active:  previewMode === 'single' }"
          @click="previewMode = 'single'"
        >
          📄 单文件预览
        </button>
        <button 
          class="mode-btn"
          :class="{ active:  previewMode === 'global' }"
          @click="previewMode = 'global'"
        >
          📑 全局预览
        </button>
      </div>
    </header>
    
    <main class="app-main">
      <FileBrowser 
        :preview-mode="previewMode" 
        :refresh-key="refreshKey"
      />
    </main>
    
    <!-- 目录选择弹窗 -->
    <div v-if="showDirectoryModal" class="modal-overlay" @click. self="showDirectoryModal = false">
      <div class="modal-content">
        <h2>选择文件目录</h2>
        
        <!-- 服务器目录 -->
        <div class="modal-section">
          <h3>📡 服务器目录</h3>
          <p class="section-desc">输入服务器上的文件夹路径</p>
          <div class="input-group">
            <input 
              v-model="serverDirInput" 
              type="text" 
              placeholder="例如:  /home/user/documents"
              @keyup.enter="handleSetServerDir"
            />
            <button @click="handleSetServerDir" : disabled="!serverDirInput">
              确定
            </button>
          </div>
          <p v-if="serverError" class="error-msg">{{ serverError }}</p>
        </div>
        
        <!-- 本地目录 -->
        <div class="modal-section">
          <h3>💻 本地文件夹</h3>
          <p class="section-desc">
            选择本地计算机上的文件夹
            <span v-if="! isLocalSupported" class="not-supported">（您的浏览器不支持）</span>
          </p>
          <button 
            class="local-btn"
            @click="handleSelectLocalDir"
            :disabled="!isLocalSupported"
          >
            📂 选择本地文件夹
          </button>
          <p v-if="localError" class="error-msg">{{ localError }}</p>
        </div>
        
        <!-- 当前状态 -->
        <div class="modal-section current-status">
          <h3>当前状态</h3>
          <p>
            <strong>模式：</strong>{{ currentMode === 'server' ?  '服务器模式' : '本地模式' }}
          </p>
          <p>
            <strong>目录：</strong>{{ rootDirName }}
          </p>
        </div>
        
        <button class="close-btn" @click="showDirectoryModal = false">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import FileBrowser from './components/FileBrowser.vue';
import { useFileSystem } from './composables/useFileSystem. js';

const { 
  currentMode, 
  rootDirName, 
  isLocalModeSupported, 
  setServerRoot, 
  getServerRoot,
  selectLocalDirectory 
} = useFileSystem();

const previewMode = ref('single');
const showDirectoryModal = ref(false);
const serverDirInput = ref('');
const serverError = ref('');
const localError = ref('');
const refreshKey = ref(0);

const isLocalSupported = isLocalModeSupported();

// 设置服务器目录
const handleSetServerDir = async () => {
  if (!serverDirInput.value) return;
  
  serverError.value = '';
  const result = await setServerRoot(serverDirInput. value);
  
  if (result.success) {
    showDirectoryModal.value = false;
    serverDirInput.value = '';
    refreshKey.value++; // 触发刷新
  } else {
    serverError.value = result.message;
  }
};

// 选择本地文件夹
const handleSelectLocalDir = async () => {
  localError.value = '';
  const result = await selectLocalDirectory();
  
  if (result.success) {
    showDirectoryModal.value = false;
    refreshKey.value++; // 触发刷新
  } else if (result.message !== '用户取消了选择') {
    localError.value = result.message;
  }
};

// 初始化时获取服务器根目录
onMounted(async () => {
  await getServerRoot();
});
</script>

<style scoped>
. app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

. app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
  gap: 15px;
}

.app-header h1 {
  margin: 0;
  font-size: 24px;
}

/* 目录控制区 */
.directory-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.current-dir {
  font-size: 14px;
  background: rgba(255, 255, 255, 0.15);
  padding: 8px 15px;
  border-radius:  6px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.mode-badge {
  font-size: 11px;
  background: rgba(255, 255, 255, 0.3);
  padding: 2px 8px;
  border-radius:  10px;
}

.dir-btn {
  padding: 8px 16px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s ease;
}

.dir-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: white;
}

/* 预览模式切换 */
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
  border-radius:  6px;
  cursor:  pointer;
  font-size:  13px;
  transition:  all 0.3s ease;
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

. app-main {
  flex: 1;
  padding: 20px;
  background-color: #f5f5f5;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom:  0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y:  auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-content h2 {
  margin:  0 0 25px 0;
  color: #333;
  font-size: 22px;
  text-align: center;
}

.modal-section {
  margin-bottom: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.modal-section h3 {
  margin:  0 0 10px 0;
  color: #333;
  font-size: 16px;
}

.section-desc {
  margin: 0 0 15px 0;
  color: #666;
  font-size: 13px;
}

.not-supported {
  color: #e74c3c;
  font-weight: 500;
}

.input-group {
  display: flex;
  gap: 10px;
}

.input-group input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.input-group input:focus {
  outline: none;
  border-color: #667eea;
}

. input-group button {
  padding:  10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.input-group button:hover: not(:disabled) {
  background: #5a6fd6;
}

.input-group button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.local-btn {
  width: 100%;
  padding:  15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.local-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.local-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-msg {
  color: #e74c3c;
  font-size: 13px;
  margin:  10px 0 0 0;
}

. current-status {
  background: #e8f4ff;
}

.current-status p {
  margin: 8px 0;
  font-size: 14px;
  color: #333;
}

.close-btn {
  width: 100%;
  padding: 12px;
  background: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  transition: background 0.3s;
}

.close-btn:hover {
  background: #e0e0e0;
}
</style>