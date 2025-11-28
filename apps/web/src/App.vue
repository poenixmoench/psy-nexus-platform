<template>
  <div id="app" class="app-container">
    <h1>🚀 PSY-NEXUS Dev Studio</h1>
    <p>AI Development Environment powered by Qwen 14B Coder</p>
    <SafeCodePreview
      code="<div>Hello World</div>"
      codeType="vue"
      :securityIssues="[]"
      @copy="handleCopy"
      @approve="handleApprove"
    />
  </div>
</template>

<script setup lang="ts">
import SafeCodePreview from './components/SafeCodePreview.vue'

const handleCopy = () => {
  console.log('Code copied!')
}

const handleApprove = () => {
  console.log('Code approved!')
}
</script>

<style scoped>
.app-container {
  padding: 40px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #00d4ff;
  margin-bottom: 10px;
}

p {
  color: #999;
  margin-bottom: 30px;
}
</style>
