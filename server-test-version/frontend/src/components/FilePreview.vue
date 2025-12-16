<!--
  文件预览组件
  根据不同文件类型显示相应的预览内容
-->
<template>
  <div class="file-preview">
    <!-- 未选择文件时的提示 -->
    <div v-if="!filePath" class="no-file">
      <div class="placeholder">
        <span class="icon">👆</span>
        <p>请从左侧选择一个文件进行预览</p>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-else-if="loading" class="loading">
      <span>正在加载文件内容...</span>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error">
      <span>❌ {{ error }}</span>
    </div>
    
    <!-- 文件预览内容 -->
    <div v-else class="preview-content">
      <!-- 文件名标题 -->
      <div class="preview-header">
        <h3>{{ fileName }}</h3>
        <span class="file-type">类型:  {{ fileData.type }} | MIME:  {{ fileData.mimeType }}</span>
      </div>
      
      <!-- 文本类文件预览 -->
      <div v-if="fileData. type === 'text'" class="text-preview">
        <pre v-if="isJsonl" class="json-content">{{ formatJsonl(fileData.content) }}</pre>
        <pre v-else-if="fileData.mimeType === 'application/json'" class="json-content">{{ formatJson(fileData.content) }}</pre>
        <pre v-else class="text-content">{{ fileData.content }}</pre>
      </div>
      
      <!-- 图片预览 -->
      <div v-else-if="fileData. type === 'image'" class="image-preview">
        <img :src="fileData.content" :alt="fileName" />
      </div>
      
      <!-- PDF预览 -->
      <div v-else-if="fileData.type === 'pdf'" class="pdf-preview">
        <iframe 
          :src="fileData. url" 
          frameborder="0"
          width="100%"
          height="100%"
        ></iframe>
      </div>
      
      <!-- 视频预览 -->
      <div v-else-if="fileData.type === 'video'" class="video-preview">
        <video controls :src="fileData.url">
          您的浏览器不支持视频播放
        </video>
      </div>
      
      <!-- 音频预览 -->
      <div v-else-if="fileData.type === 'audio'" class="audio-preview">
        <div class="audio-icon">🎵</div>
        <p class="audio-name">{{ fileName }}</p>
        <audio controls :src="fileData.url">
          您的浏览器不支持音频播放
        </audio>
      </div>
      
      <!-- 二进制文件 -->
      <div v-else-if="fileData.type === 'binary'" class="binary-preview">
        <div class="binary-info">
          <span class="icon">📦</span>
          <p>{{ fileData.message }}</p>
          <a :href="fileData.url" download class="download-btn">下载文件</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import axios from 'axios';

const props = defineProps({
  filePath: {
    type:  String,
    default: ''
  },
  fileName: {
    type: String,
    default: ''
  }
});

const fileData = ref({});
const loading = ref(false);
const error = ref('');

const isJsonl = computed(() => {
  return props.fileName?. toLowerCase().endsWith('.jsonl');
});

const fetchFileContent = async () => {
  if (!props.filePath) return;
  
  loading.value = true;
  error.value = '';
  fileData.value = {};
  
  try {
    const response = await axios.get('/api/files/content', {
      params: { path: props. filePath }
    });
    
    if (response.data. success) {
      fileData.value = response.data;
    } else {
      error.value = response.data.message || '获取文件内容失败';
    }
  } catch (err) {
    error.value = err.response?. data?.message || '网络请求失败';
    console. error('获取文件内容失败:', err);
  } finally {
    loading.value = false;
  }
};

const formatJson = (content) => {
  try {
    const parsed = JSON.parse(content);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return content;
  }
};

const formatJsonl = (content) => {
  try {
    const lines = content.trim().split('\n');
    const formatted = lines.map((line, index) => {
      try {
        const parsed = JSON.parse(line);
        return `// 第 ${index + 1} 条记录\n${JSON.stringify(parsed, null, 2)}`;
      } catch {
        return line;
      }
    });
    return formatted.join('\n\n');
  } catch {
    return content;
  }
};

watch(() => props.filePath, () => {
  fetchFileContent();
});
</script>

<style scoped>
.file-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.no-file {
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
  font-size: 48px;
  display: block;
  margin-bottom: 15px;
}

.loading, .error {
  flex: 1;
  display:  flex;
  align-items:  center;
  justify-content:  center;
  color: #666;
}

.error {
  color: #e74c3c;
}

.preview-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow:  hidden;
}

.preview-header {
  padding: 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.preview-header h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #333;
  word-break: break-all;
}

.file-type {
  font-size: 12px;
  color: #888;
}

.text-preview {
  flex: 1;
  overflow: auto;
  padding: 15px;
  background: #fafafa;
}

.text-content, .json-content {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size:  13px;
  line-height:  1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.json-content {
  color: #2c3e50;
}

.image-preview {
  flex:  1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #f0f0f0;
  overflow: auto;
}

.image-preview img {
  max-width:  100%;
  max-height: 100%;
  object-fit: contain;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* PDF预览样式 */
.pdf-preview {
  flex: 1;
  display:  flex;
  background: #525659;
}

.pdf-preview iframe {
  flex: 1;
  border: none;
}

.video-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #000;
}

.video-preview video {
  max-width: 100%;
  max-height: 100%;
}

.audio-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.audio-icon {
  font-size: 80px;
  margin-bottom:  20px;
}

.audio-name {
  color: white;
  font-size: 18px;
  margin-bottom:  30px;
  text-align: center;
  word-break: break-all;
}

.audio-preview audio {
  width: 100%;
  max-width: 400px;
  height: 50px;
}

.binary-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.binary-info {
  text-align: center;
  color: #666;
}

.binary-info .icon {
  font-size: 48px;
  display: block;
  margin-bottom: 15px;
}

.download-btn {
  display: inline-block;
  margin-top: 15px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 5px;
  text-decoration: none;
}

.download-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
</style>