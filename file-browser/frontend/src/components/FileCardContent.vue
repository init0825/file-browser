<template>
  <div class="card-content-wrapper">
    <!-- 加载状态 -->
    <div v-if="loading" class="status loading">
      <span>加载中...</span>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="status error">
      <span>{{ error }}</span>
    </div>
    
    <!-- 文件内容 -->
    <template v-else>
      <!-- 文本类文件 -->
      <div v-if="fileData.type === 'text'" class="text-content">
        <pre>{{ formatContent(fileData.content) }}</pre>
      </div>
      
      <!-- 图片文件 -->
      <div v-else-if="fileData. type === 'image'" class="image-content">
        <img :src="fileData.content" :alt="fileName" />
      </div>
      
      <!-- PDF文件 -->
      <div v-else-if="fileData.type === 'pdf'" class="pdf-content">
        <iframe 
          :src="fileData.url" 
          frameborder="0"
          width="100%"
          height="100%"
        ></iframe>
      </div>
      
      <!-- 视频文件 -->
      <div v-else-if="fileData. type === 'video'" class="video-content">
        <video controls :src="fileData.url">
          您的浏览器不支持视频播放
        </video>
      </div>
      
      <!-- 音频文件 -->
      <div v-else-if="fileData.type === 'audio'" class="audio-content">
        <div class="audio-icon">🎵</div>
        <audio controls :src="fileData.url">
          您的浏览器不支持音频播放
        </audio>
      </div>
      
      <!-- 二进制文件 -->
      <div v-else-if="fileData.type === 'binary'" class="binary-content">
        <div class="binary-icon">📦</div>
        <p>不支持预览</p>
        <a :href="fileData. url" download class="download-link">下载文件</a>
      </div>
      
      <!-- 未知类型 -->
      <div v-else class="unknown-content">
        <span>暂无预览</span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useFileSystem } from '../composables/useFileSystem.js';

const { getFileContent } = useFileSystem();

const props = defineProps({
  filePath: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  mimeType: {
    type:  String,
    default: ''
  }
});

const fileData = ref({});
const loading = ref(false);
const error = ref('');
const blobUrls = ref([]);

const fetchContent = async () => {
  if (!props.filePath) return;
  
  loading.value = true;
  error.value = '';
  
  // 清理之前的 blob URL
  cleanupBlobUrls();
  
  try {
    const result = await getFileContent(props.filePath);
    
    if (result.success) {
      fileData.value = result;
      if (result.isBlob && result.url) {
        blobUrls.value.push(result.url);
      }
    } else {
      error.value = result.message || '加载失败';
    }
  } catch (err) {
    error.value = '加载失败';
    console.error('获取文件内容失败:', err);
  } finally {
    loading.value = false;
  }
};

const cleanupBlobUrls = () => {
  blobUrls.value.forEach(url => {
    URL.revokeObjectURL(url);
  });
  blobUrls.value = [];
};

const formatContent = (content) => {
  if (! content) return '';
  
  if (props.fileName. endsWith('.json')) {
    try {
      const parsed = JSON.parse(content);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return content;
    }
  }
  
  if (props.fileName.endsWith('. jsonl')) {
    try {
      const lines = content.trim().split('\n');
      return lines.map((line, i) => {
        try {
          const parsed = JSON.parse(line);
          return `// 第${i + 1}条\n${JSON.stringify(parsed, null, 2)}`;
        } catch {
          return line;
        }
      }).join('\n\n');
    } catch {
      return content;
    }
  }
  
  return content;
};

onMounted(() => {
  fetchContent();
});

watch(() => props.filePath, () => {
  fetchContent();
});

onUnmounted(() => {
  cleanupBlobUrls();
});
</script>

<style scoped>
. card-content-wrapper {
  height: 100%;
  overflow: auto;
}

.status {
  height: 100%;
  display:  flex;
  align-items:  center;
  justify-content:  center;
  color: #999;
  font-size: 13px;
}

.status. error {
  color: #e74c3c;
}

. text-content {
  padding: 10px;
  height: 100%;
  overflow:  auto;
}

.text-content pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height:  1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: #333;
}

.image-content {
  height: 100%;
  display:  flex;
  align-items:  center;
  justify-content:  center;
  padding: 10px;
  background: #f0f0f0;
}

.image-content img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.pdf-content {
  height: 100%;
  display: flex;
  background: #525659;
}

.pdf-content iframe {
  flex: 1;
  border: none;
}

.video-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

. video-content video {
  max-width: 100%;
  max-height: 100%;
}

.audio-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.audio-icon {
  font-size: 48px;
  margin-bottom:  15px;
}

.audio-content audio {
  width: 100%;
  max-width: 250px;
}

.binary-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
}

. binary-icon {
  font-size: 40px;
  margin-bottom:  10px;
}

.binary-content p {
  margin: 0 0 15px 0;
  font-size: 13px;
}

.download-link {
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-size: 13px;
}

.download-link:hover {
  background: #5a6fd6;
}

.unknown-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}
</style>