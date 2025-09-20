<template>
  <div class="tts-container">
    <div class="header">
      <h1 class="title">AI语音合成</h1>
      <p class="subtitle">将文本转换为自然流畅的语音，支持多种语言</p>
    </div>

    <div class="content">
      <div class="input-section">
        <div class="input-group">
          <span class="icon">📝</span>
          <input
            v-model="text"
            type="text"
            placeholder="输入要转换的文本内容..."
            @keyup.enter="generateAudio"
            class="input-field"
          />
          <button @click="generateAudio" class="generate-btn" :disabled="loading">
            <span v-if="!loading">生成语音</span>
            <span v-else>处理中...</span>
          </button>
        </div>
        
        <div class="character-count" :class="{ 'warning': text.length > 500 }">
          {{ text.length }}/500 字符
        </div>
      </div>

      <div v-if="audioUrl" class="audio-section">
        <div class="audio-player">
          <audio ref="audioElement" :src="audioUrl" controls></audio>
        </div>
        <div class="player-controls">
          <button @click="playAudio" class="play-btn" :disabled="!audioUrl">
            <span v-if="!isPlaying">▶ 播放</span>
            <span v-else>⏸ 暂停</span>
          </button>
          <button @click="downloadAudio" class="download-btn">
            <span>下载MP3</span>
          </button>
        </div>
      </div>

      <div v-if="error" class="error-message">
        <span class="error-icon">⚠️</span>
        {{ error }}
      </div>
    </div>

    <div class="features">
      <div class="feature-card">
        <div class="feature-icon">🗣️</div>
        <h3>自然语音</h3>
        <p>使用先进的神经网络技术，生成接近真人发音的语音</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🌍</div>
        <h3>多语言支持</h3>
        <p>支持中文、英文、日语等10+种语言</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">⏱️</div>
        <h3>快速生成</h3>
        <p>平均响应时间低于2秒，即时体验</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, watch } from 'vue';

// 状态管理
const text = ref('');
const audioUrl = ref('');
const isPlaying = ref(false);
const loading = ref(false);
const error = ref('');
const audioElement = ref(null);

// 字符限制检查
const isOverLimit = computed(() => text.value.length > 500);

// 生成语音
const generateAudio = async () => {
  if (!text.value.trim()) {
    error.value = '请输入要转换的文本';
    return;
  }

  if (text.value.length > 500) {
    error.value = '文本长度不能超过500个字符';
    return;
  }

  loading.value = true;
  error.value = '';
  
  try {
    // 使用代理路径（解决跨域问题） + GET请求
    const encodedText = encodeURIComponent(text.value);
    const response = await fetch(`http://127.0.0.1:9882/kokoro/?text=${encodedText}`);

    if (!response.ok) {
      throw new Error('语音生成失败，请重试');
    }

    // 创建音频URL
    const blob = await response.blob();
    audioUrl.value = URL.createObjectURL(blob);
    
    // 自动播放
    await playAudio();
  } catch (err) {
    error.value = err.message || '语音生成请求失败';
  } finally {
    loading.value = false;
  }
};

// 播放/暂停音频
const playAudio = async () => {
  if (!audioElement.value) return;
  
  if (isPlaying.value) {
    audioElement.value.pause();
  } else {
    audioElement.value.play();
  }
  isPlaying.value = !isPlaying.value;
};

// 下载音频
const downloadAudio = () => {
  if (!audioUrl.value) return;
  
  const a = document.createElement('a');
  a.href = audioUrl.value;
  a.download = `tts-${new Date().toISOString().replace(/[:.]/g, '-')}.mp3`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// 清理URL对象
onUnmounted(() => {
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
  }
});
</script>

<style scoped>
.tts-container {
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
  min-height: 100vh;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.tts-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg, #4facfe, #00f2fe);
}

.header {
  text-align: center;
  margin-bottom: 3rem;
  padding-top: 1.5rem;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, #4facfe, #00f2fe);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.content {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  margin-bottom: 2.5rem;
}

.input-section {
  margin-bottom: 2.5rem;
}

.input-group {
  display: flex;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  background: white;
  transition: all 0.3s ease;
}

.input-group:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: white;
  font-size: 1.3rem;
}

.input-field {
  flex: 1;
  padding: 1.2rem 1.5rem;
  border: none;
  outline: none;
  font-size: 1.1rem;
  background: transparent;
  transition: all 0.3s ease;
}

.input-field::placeholder {
  color: #bdc3c7;
  opacity: 1;
}

.input-field:focus {
  background: #f8f9fa;
}

.generate-btn {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: white;
  border: none;
  padding: 0 2.2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 0 12px 12px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);
}

.generate-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  box-shadow: none;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.6);
}

.character-count {
  text-align: right;
  margin-top: 0.5rem;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.character-count.warning {
  color: #e74c3c;
  font-weight: 600;
}

.audio-section {
  margin-top: 2.5rem;
}

.audio-player {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  background: #f8f9fa;
  margin-bottom: 1.5rem;
}

.audio-player audio {
  width: 100%;
  border: none;
  background: #f8f9fa;
}

.player-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.play-btn, .download-btn {
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.play-btn {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
}

.download-btn {
  background: linear-gradient(135deg, #3498db, #2c3e50);
  color: white;
}

.play-btn:hover, .download-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.error-message {
  background: #ffebee;
  color: #c62828;
  border-left: 4px solid #f44336;
  padding: 1rem;
  border-radius: 0 4px 4px 0;
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-icon {
  font-size: 1.2rem;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 3rem;
}

.feature-card {
  background: white;
  border-radius: 12px;
  padding: 1.8rem;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  text-align: center;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #4facfe;
}

.feature-card h3 {
  font-size: 1.4rem;
  margin-bottom: 0.8rem;
  color: #2c3e50;
}

.feature-card p {
  color: #7f8c8d;
  line-height: 1.5;
}

/* 响应式调整 */
@media (max-width: 600px) {
  .title {
    font-size: 2rem;
  }
  
  .content {
    padding: 1.5rem;
  }
  
  .input-group {
    flex-direction: column;
  }
  
  .generate-btn {
    border-radius: 12px;
    margin-top: 0.5rem;
  }
}
</style>