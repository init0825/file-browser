<template>
  <div class="global-preview">
    <!-- 未选择文件夹时的提示 -->
    <div v-if="!folderPath" class="no-