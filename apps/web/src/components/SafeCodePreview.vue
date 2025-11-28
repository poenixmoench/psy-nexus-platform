<script setup lang="ts">
import { ref } from 'vue'
import DOMPurify from 'dompurify'

const props = withDefaults(defineProps<{
  code: string
  codeType: string
  securityIssues?: string[]
}>(), {
  securityIssues: () => []
})

const emit = defineEmits<{
  copy: []
  approve: []
}>()

const generateSandboxHTML = (): string => {
  const sanitizedCode = DOMPurify.sanitize(props.code, {
    ALLOWED_TAGS: ['template', 'div', 'span', 'p', 'style', 'h1', 'h2', 'h3', 'button', 'input', 'form'],
    ALLOWED_ATTR: ['class', 'id', 'style'],
    FORCE_BODY: true,
    RETURN_DOM_FRAGMENT: false
  })

  const htmlContent = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; object-src 'none';"><style>*{box-sizing:border-box}body{margin:0;padding:20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#fff;color:#333}</style></head><body><div id="app">${sanitizedCode}</div><script>Object.defineProperty(window,'parent',{value:null,writable:false});Object.defineProperty(window,'top',{value:null,writable:false});try{Object.defineProperty(window,'location',{get(){throw new Error('blocked');},writable:false});}catch(e){}<\/script></body></html>`
  
  return htmlContent
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code)
    emit('copy')
  } catch (error) {
    console.error('Copy failed:', error)
  }
}

const approveCode = () => {
  emit('approve')
}

const handleIframeError = (error: Event) => {
  console.error('Iframe error:', error)
}

const handleIframeLoad = () => {
  console.log('Preview ready')
}
</script>

<template>
  <div class="code-preview-container">
    <div v-if="securityIssues.length > 0" class="security-banner">
      <span class="banner-icon">⚠️</span>
      <div class="banner-content">
        <p class="banner-title">Security Issues Detected</p>
        <ul class="banner-list">
          <li v-for="(issue, idx) in securityIssues" :key="`issue-${idx}`">{{ issue }}</li>
        </ul>
        <p class="banner-notice">Code cannot be previewed until issues are resolved.</p>
      </div>
    </div>
    <iframe
      v-if="codeType === 'vue' && !securityIssues.length"
      :srcdoc="generateSandboxHTML()"
      sandbox="allow-scripts"
      referrerpolicy="no-referrer"
      @error="handleIframeError"
      @load="handleIframeLoad"
      class="preview-iframe"
      title="Live code preview sandbox"
    />
    <pre
      v-else-if="codeType !== 'vue' || securityIssues.length > 0"
      v-highlight
      :class="`language-${codeType}`"
      class="code-display"
    >{{ code }}</pre>
    <div class="preview-actions">
      <button
        class="action-btn"
        @click="copyCode"
        :disabled="securityIssues.length > 0"
        title="Copy code to clipboard"
      >📋 Copy</button>
      <button
        v-if="!securityIssues.length"
        class="action-btn approve"
        @click="approveCode"
        title="Approve this code for use"
      >✅ Approve</button>
    </div>
  </div>
</template>

<style scoped>
.code-preview-container {
  border: 1px solid #00d4ff;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.1);
}

.security-banner {
  background: rgba(239, 68, 68, 0.1);
  border-left: 3px solid #ef4444;
  padding: 15px;
  color: #ef4444;
  display: flex;
  gap: 12px;
}

.banner-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.banner-content {
  flex: 1;
}

.banner-title {
  margin: 0 0 8px 0;
  font-weight: 600;
  font-size: 13px;
}

.banner-list {
  margin: 0 0 8px 0;
  padding-left: 20px;
  font-size: 12px;
}

.banner-list li {
  margin: 4px 0;
}

.banner-notice {
  margin: 0;
  font-size: 11px;
  opacity: 0.8;
}

.preview-iframe {
  width: 100%;
  height: 400px;
  border: none;
  background-color: white;
}

.code-display {
  background-color: #0a0a0a;
  padding: 15px;
  overflow-x: auto;
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  color: #00d4ff;
}

.preview-actions {
  display: flex;
  gap: 10px;
  padding: 15px;
  border-top: 1px solid #00d4ff;
  background: rgba(0, 0, 0, 0.05);
}

.action-btn {
  padding: 10px 16px;
  background: rgba(0, 212, 255, 0.2);
  border: 1px solid #00d4ff;
  color: #00d4ff;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.action-btn:hover:not(:disabled) {
  background: rgba(0, 212, 255, 0.4);
  transform: translateY(-1px);
}

.action-btn:active:not(:disabled) {
  transform: translateY(0);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.approve {
  background: rgba(34, 197, 94, 0.2);
  border-color: #22c55e;
  color: #22c55e;
}

.action-btn.approve:hover {
  background: rgba(34, 197, 94, 0.4);
}
</style>
