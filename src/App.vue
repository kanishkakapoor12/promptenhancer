<template>
  <div class="root">
    <!-- Decorative blobs -->
    <div class="blob blob1"></div>
    <div class="blob blob2"></div>
    <div class="blob blob3"></div>
    <div class="dots-grid"></div>

    <div class="app">
      <!-- Header -->
      <div class="header">
        <div class="badge">
          <span class="badge-icon">⚡</span> Senior Prompt Engineer
        </div>
        <h1 class="title">
          Prompt <span class="title-highlight">Enhancer</span>
        </h1>
        <p class="subtitle">Transform basic prompts into expert-level Claude instructions — instantly.</p>
        <div class="pills">
          <span class="pill pill-blue">🎭 Role Definition</span>
          <span class="pill pill-purple">🏗️ XML Structure</span>
          <span class="pill pill-pink">🧠 Chain-of-Thought</span>
          <span class="pill pill-orange">🎯 Output Format</span>
        </div>
      </div>

      <!-- Main card -->
      <div class="card">
        <!-- Top bar -->
        <div class="card-top-bar">
          <div class="traffic"><span class="tl r"></span><span class="tl y"></span><span class="tl g"></span></div>
          <span class="bar-label">prompt-enhancer.vue</span>
          <div class="model-chip"><span class="live-dot"></span>claude-sonnet-4</div>
        </div>

        <div class="panels">
          <!-- Input -->
          <div class="panel panel-left">
            <div class="panel-header">
              <span class="panel-title">✏️ Your Prompt</span>
              <span class="char-pill" :class="{ warn: userPrompt.length > 800 }">{{ userPrompt.length }} chars</span>
            </div>
            <textarea
              v-model="userPrompt"
              placeholder="e.g. create a calculator app with React only."
              @keydown.ctrl.enter="enhance"
              @keydown.meta.enter="enhance"
            ></textarea>
            <div class="example-row">
              <span class="example-label">Try:</span>
              <span
                class="example-chip"
                v-for="ex in examples" :key="ex"
                @click="userPrompt = ex"
              >{{ ex.slice(0, 28) }}…</span>
            </div>
            <div v-if="error" class="error-box">⚠️ {{ error }}</div>
          </div>

          <!-- Output -->
          <div class="panel panel-right">
            <div class="panel-header">
              <span class="panel-title">✨ Enhanced Prompt</span>
              <div v-if="enhanced" class="result-chips">
                <span class="rc rc-green">✓ Enhanced</span>
                <span class="rc rc-purple">XML</span>
                <span class="rc rc-blue">CoT</span>
              </div>
            </div>
            <div class="output-box" :class="{ active: enhanced || loading }">
              <template v-if="!enhanced && !loading">
                <div class="empty-state">
                  <div class="empty-icon">✨</div>
                  <div class="empty-text">Your enhanced prompt will appear here</div>
                </div>
              </template>
              <template v-else>{{ displayText }}<span v-if="loading" class="cursor"></span></template>
            </div>
          </div>
        </div>

        <!-- Action bar -->
        <div class="action-bar">
          <div class="action-left">
            <button class="btn-enhance" @click="enhance" :disabled="loading || !userPrompt.trim()">
              <span v-if="loading" class="spinner"></span>
              <span v-else>⚡</span>
              {{ loading ? 'Enhancing…' : 'Enhance Prompt' }}
            </button>
            <span class="shortcut">⌘ Enter</span>
          </div>
          <button class="btn-copy" :class="{ copied }" @click="copy" :disabled="!enhanced">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
            {{ copied ? '✓ Copied!' : 'Copy Result' }}
          </button>
        </div>
      </div>

      <!-- Feature grid -->
      <div class="features">
        <p class="features-label">WHAT GETS ENHANCED</p>
        <div class="features-grid">
          <div class="feat" v-for="f in features" :key="f.name">
            <div class="feat-icon">{{ f.icon }}</div>
            <div class="feat-name">{{ f.name }}</div>
            <div class="feat-desc">{{ f.desc }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const userPrompt = ref('')
const enhanced = ref('')
const displayText = ref('')
const loading = ref(false)
const copied = ref(false)
const error = ref('')

const examples = [
  'create a calculator app with React only.',
  'write a Python web scraper for news sites.',
  'explain machine learning to a beginner.',
]

const features = [
  { icon: '🎭', name: 'Role Definition',  desc: 'Assigns expert persona for domain-specific authority.' },
  { icon: '🏗️', name: 'XML Structure',    desc: 'Claude-native XML tags for clear hierarchy.' },
  { icon: '🧠', name: 'Chain-of-Thought', desc: 'Explicit reasoning steps for complex tasks.' },
  { icon: '🎯', name: 'Output Format',    desc: 'Specifies format, tone, length & structure.' },
  { icon: '📌', name: 'Context & Scope',  desc: 'Defines boundaries and edge cases.' },
  { icon: '✅', name: 'Examples & Rules', desc: 'Positive/negative examples and constraints.' },
]

async function enhance() {
  if (!userPrompt.value.trim() || loading.value) return
  loading.value = true
  enhanced.value = ''
  displayText.value = ''
  error.value = ''

  try {
    const res = await fetch('/api/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userPrompt.value.trim() })
    })

    if (!res.ok) {
      const d = await res.json()
      throw new Error(d?.error || `Server error ${res.status}`)
    }

    const data = await res.json()
    const full = data.result || ''
    enhanced.value = full

    displayText.value = ''
    let i = 0
    const tick = () => {
      if (i < full.length) {
        displayText.value += full[i++]
        requestAnimationFrame(tick)
      } else {
        loading.value = false
      }
    }
    requestAnimationFrame(tick)

  } catch (e) {
    error.value = e.message
    loading.value = false
  }
}

async function copy() {
  if (!enhanced.value) return
  await navigator.clipboard.writeText(enhanced.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.root {
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  background: #f0f4ff;
  position: relative;
  overflow-x: hidden;
}

/* Blobs */
.blob {
  position: fixed; border-radius: 50%; filter: blur(70px);
  pointer-events: none; z-index: 0; opacity: .55;
}
.blob1 { width: 480px; height: 480px; top: -140px; left: -120px; background: radial-gradient(circle, #a78bfa, #818cf8); animation: b1 14s ease-in-out infinite alternate; }
.blob2 { width: 420px; height: 420px; bottom: -100px; right: -80px; background: radial-gradient(circle, #f9a8d4, #fb923c); animation: b2 17s ease-in-out infinite alternate; }
.blob3 { width: 320px; height: 320px; top: 45%; left: 55%; background: radial-gradient(circle, #6ee7b7, #38bdf8); animation: b3 20s ease-in-out infinite alternate; }

@keyframes b1 { to { transform: translate(50px, 60px) scale(1.1); } }
@keyframes b2 { to { transform: translate(-40px, -50px) scale(1.15); } }
@keyframes b3 { to { transform: translate(-30px, 40px) scale(1.08); } }

.dots-grid {
  position: fixed; inset: 0; z-index: 0; opacity: .35;
  background-image: radial-gradient(circle, #94a3b8 1px, transparent 1px);
  background-size: 28px 28px;
}

.app {
  position: relative; z-index: 1;
  max-width: 1060px; margin: 0 auto; padding: 48px 24px 80px;
}

/* Header */
.header { text-align: center; margin-bottom: 44px; }

.badge {
  display: inline-flex; align-items: center; gap: 7px;
  background: #fff; border: 2px solid #e0e7ff;
  border-radius: 999px; padding: 6px 18px;
  font-size: 12px; font-weight: 700; color: #6366f1;
  letter-spacing: .06em; text-transform: uppercase;
  box-shadow: 0 2px 12px rgba(99,102,241,.12);
  margin-bottom: 22px;
}
.badge-icon { font-size: 14px; }

.title {
  font-size: clamp(2.4rem, 5.5vw, 3.8rem);
  font-weight: 900; line-height: 1.08; color: #1e1b4b;
  margin-bottom: 14px; letter-spacing: -.02em;
}
.title-highlight {
  background: linear-gradient(135deg, #6366f1, #ec4899);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

.subtitle { color: #64748b; font-size: 1.05rem; max-width: 480px; margin: 0 auto 22px; line-height: 1.65; }

.pills { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
.pill {
  font-size: 12px; font-weight: 600; padding: 5px 14px; border-radius: 999px;
  border: 2px solid transparent;
}
.pill-blue   { background: #eff6ff; color: #3b82f6; border-color: #bfdbfe; }
.pill-purple { background: #f5f3ff; color: #7c3aed; border-color: #ddd6fe; }
.pill-pink   { background: #fdf2f8; color: #db2777; border-color: #fbcfe8; }
.pill-orange { background: #fff7ed; color: #ea580c; border-color: #fed7aa; }

/* Card */
.card {
  background: #fff;
  border: 2px solid #e0e7ff;
  border-radius: 24px;
  box-shadow: 0 8px 40px rgba(99,102,241,.1), 0 2px 8px rgba(0,0,0,.06);
  overflow: hidden;
  transition: box-shadow .3s;
}
.card:hover { box-shadow: 0 16px 60px rgba(99,102,241,.16), 0 2px 8px rgba(0,0,0,.06); }

.card-top-bar {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 20px; background: #f8faff;
  border-bottom: 2px solid #e0e7ff;
}
.traffic { display: flex; gap: 6px; }
.tl { width: 11px; height: 11px; border-radius: 50%; }
.tl.r { background: #ff5f57; } .tl.y { background: #febc2e; } .tl.g { background: #28c840; }
.bar-label { font-size: 12px; font-weight: 600; color: #94a3b8; margin-left: 4px; }
.model-chip {
  margin-left: auto; display: flex; align-items: center; gap: 6px;
  background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 8px;
  padding: 4px 12px; font-size: 11px; font-weight: 700; color: #16a34a;
}
.live-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 6px #22c55e; animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .4; } }

.panels { display: grid; grid-template-columns: 1fr 1fr; }
@media (max-width: 680px) { .panels { grid-template-columns: 1fr; } }

.panel { padding: 24px; }
.panel-left { border-right: 2px solid #e0e7ff; }
@media (max-width: 680px) { .panel-left { border-right: none; border-bottom: 2px solid #e0e7ff; } }

.panel-header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;
}
.panel-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; color: #94a3b8; }
.char-pill {
  font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 999px;
  background: #eff6ff; color: #3b82f6; border: 1.5px solid #bfdbfe;
}
.char-pill.warn { background: #fff7ed; color: #ea580c; border-color: #fed7aa; }

textarea {
  width: 100%; min-height: 216px; border: 2px solid #e2e8f0; border-radius: 14px;
  background: #f8faff; color: #1e1b4b; font-family: 'Inter', sans-serif;
  font-size: 14px; line-height: 1.75; padding: 14px 16px; resize: vertical; outline: none;
  transition: border-color .2s, box-shadow .2s;
}
textarea::placeholder { color: #cbd5e1; }
textarea:focus { border-color: #818cf8; box-shadow: 0 0 0 4px rgba(129,140,248,.12); background: #fff; }

.example-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
.example-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .06em; }
.example-chip {
  font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 999px;
  background: #f1f5f9; color: #64748b; border: 1.5px solid #e2e8f0;
  cursor: pointer; transition: all .15s;
}
.example-chip:hover { background: #eff6ff; color: #6366f1; border-color: #c7d2fe; }

.output-box {
  min-height: 216px; border: 2px solid #e2e8f0; border-radius: 14px;
  background: #f8faff; padding: 14px 16px; font-size: 14px; line-height: 1.8;
  color: #1e1b4b; white-space: pre-wrap; word-break: break-word;
  font-family: 'Inter', monospace; position: relative; transition: border-color .3s, background .3s;
}
.output-box.active { border-color: #818cf8; background: #fff; box-shadow: 0 0 0 4px rgba(129,140,248,.08); }

.empty-state {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 10px;
}
.empty-icon { font-size: 30px; opacity: .25; }
.empty-text { font-size: 13px; color: #cbd5e1; font-family: 'Inter', sans-serif; font-weight: 500; }

.result-chips { display: flex; gap: 6px; }
.rc { font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 999px; letter-spacing: .04em; text-transform: uppercase; }
.rc-green  { background: #f0fdf4; color: #16a34a; border: 1.5px solid #bbf7d0; }
.rc-purple { background: #f5f3ff; color: #7c3aed; border: 1.5px solid #ddd6fe; }
.rc-blue   { background: #eff6ff; color: #2563eb; border: 1.5px solid #bfdbfe; }

.cursor {
  display: inline-block; width: 2px; height: 1.1em; background: #6366f1;
  margin-left: 2px; vertical-align: text-bottom; animation: blink .7s step-end infinite;
}
@keyframes blink { 50% { opacity: 0; } }

/* Action bar */
.action-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 24px; border-top: 2px solid #e0e7ff;
  background: #f8faff; gap: 12px; flex-wrap: wrap;
}
.action-left { display: flex; align-items: center; gap: 12px; }
.shortcut { font-size: 12px; color: #94a3b8; font-weight: 600; }

.btn-enhance {
  display: flex; align-items: center; gap: 9px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none; border-radius: 12px; padding: 12px 26px;
  color: #fff; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 700;
  cursor: pointer; box-shadow: 0 4px 20px rgba(99,102,241,.4);
  transition: all .2s; letter-spacing: .01em;
}
.btn-enhance:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(99,102,241,.5); filter: brightness(1.05); }
.btn-enhance:active { transform: translateY(0); }
.btn-enhance:disabled { opacity: .45; cursor: not-allowed; transform: none; box-shadow: none; }

.btn-copy {
  display: flex; align-items: center; gap: 8px;
  background: #fff; border: 2px solid #e2e8f0; border-radius: 10px;
  padding: 10px 18px; color: #64748b; font-family: 'Inter', sans-serif;
  font-size: 13px; font-weight: 700; cursor: pointer; transition: all .2s;
}
.btn-copy:hover { border-color: #818cf8; color: #6366f1; background: #f5f3ff; }
.btn-copy.copied { border-color: #86efac; color: #16a34a; background: #f0fdf4; }
.btn-copy:disabled { opacity: .3; cursor: not-allowed; }

.spinner {
  width: 15px; height: 15px; border: 2.5px solid rgba(255,255,255,.35);
  border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.error-box {
  margin-top: 10px; background: #fff1f2; border: 1.5px solid #fecdd3;
  border-radius: 10px; padding: 10px 14px; font-size: 13px; color: #e11d48;
  font-weight: 500;
}

/* Features */
.features { margin-top: 36px; }
.features-label {
  text-align: center; font-size: 11px; font-weight: 800; letter-spacing: .1em;
  color: #94a3b8; margin-bottom: 16px;
}
.features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }

.feat {
  background: #fff; border: 2px solid #e0e7ff; border-radius: 16px;
  padding: 18px 16px; transition: all .2s;
  box-shadow: 0 2px 8px rgba(99,102,241,.06);
}
.feat:hover { border-color: #a5b4fc; transform: translateY(-3px); box-shadow: 0 8px 24px rgba(99,102,241,.12); }
.feat-icon { font-size: 20px; margin-bottom: 8px; }
.feat-name { font-size: 13px; font-weight: 800; color: #1e1b4b; margin-bottom: 4px; }
.feat-desc { font-size: 12px; color: #64748b; line-height: 1.5; }
</style>