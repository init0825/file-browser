<template>
  <div>
    <header>
      <button @click="switchToTosMode">Switch to TOS Mode</button>
    </header>
    <main>
      <div v-if="mode === 'tos'">
        TOS Path: <input v-model="tosPath" @change="loadTosPath" />
        <ul>
          <li v-for="file in files" :key="file.name">{{ file.name }}</li>
        </ul>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useFileSystem } from './composables/useFileSystem.js';

const { currentMode, setTosMode, fetchTosList } = useFileSystem();
const mode = currentMode;
const tosPath = ref('');
const files = ref([]);

function switchToTosMode() {
  setTosMode(tosPath.value);
}

async function loadTosPath() {
  try {
    const result = await fetchTosList(tosPath.value);
    files.value = result.data;
  } catch (error) {
    console.error('Failed to load TOS path:', error);
  }
}
</script>

<style>
header {
  padding: 10px;
  background: #f4f4f4;
}
</style>