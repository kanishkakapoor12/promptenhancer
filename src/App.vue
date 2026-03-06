<template>
  <div>
    <div class="bg-grid"></div>
    <div class="orb orb1"></div>
    <div class="orb orb2"></div>
    <div class="orb orb3"></div>

    <div class="app">
      <!-- Header -->
      <div class="header">
        <div class="badge">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>
          Senior Prompt Engineer
        </div>
        <h1 class="title">Prompt Enhancer</h1>
        <p class="subtitle">
          Transform simple prompts into expert-level Claude instructions using
          battle-tested prompt engineering techniques.
        </p>
        <div class="stats">
          <div class="stat">
            <div class="stat-dot"></div>
            Role Definition
          </div>
          <div class="stat">
            <div
              class="stat-dot"
              style="background: #c084fc; box-shadow: 0 0 8px #c084fc"
            ></div>
            XML Structure
          </div>
          <div class="stat">
            <div
              class="stat-dot"
              style="background: #22d3ee; box-shadow: 0 0 8px #22d3ee"
            ></div>
            Chain-of-Thought
          </div>
          <div class="stat">
            <div
              class="stat-dot"
              style="background: #4ade80; box-shadow: 0 0 8px #4ade80"
            ></div>
            Output Format
          </div>
        </div>
      </div>

      <!-- Main card -->
      <div class="card">
        <div class="card-top-bar">
          <div class="dot dot-r"></div>
          <div class="dot dot-y"></div>
          <div class="dot dot-g"></div>
          <span class="bar-title">prompt-enhancer.vue</span>
          <div style="margin-left: auto">
            <div class="model-badge">
              <div class="model-dot"></div>
              claude-sonnet-4
            </div>
          </div>
        </div>

        <div class="panels">
          <!-- Left Panel -->
          <div class="panel panel-left">
            <div class="panel-label">
              <span>✏️ &nbsp;Your Prompt</span>
              <span
                class="char-count"
                :class="{ warn: userPrompt.length > 800 }"
                >{{ userPrompt.length }} chars</span
              >
            </div>
            <textarea
              v-model="userPrompt"
              placeholder="e.g. create a calculator app with React only."
              @keydown.ctrl.enter="enhance"
              @keydown.meta.enter="enhance"
            ></textarea>
            <div
              style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap"
            >
              <div
                class="tag"
                v-for="ex in examples"
                :key="ex"
                @click="userPrompt = ex"
                style="cursor: pointer"
                title="Click to use"
              >
                {{ ex.slice(0, 30) }}…
              </div>
            </div>
            <div v-if="error" class="error-banner">⚠️ {{ error }}</div>
          </div>

          <!-- Right Panel -->
          <div class="panel">
            <div class="panel-label">
              <span>✨ &nbsp;Enhanced Prompt</span>
              <div class="tags" v-if="enhanced">
                <span class="tag green">Enhanced</span>
                <span class="tag purple">XML</span>
                <span class="tag teal">CoT</span>
              </div>
            </div>
            <div
              class="output-box"
              :class="{ 'has-content': enhanced || loading }"
            >
              <template v-if="!enhanced && !loading">
                <div class="placeholder-state">
                  <div class="placeholder-icon">⚡</div>
                  <div class="placeholder-text">
                    Your enhanced prompt will appear here…
                  </div>
                </div>
              </template>
              <template v-else>
                {{ displayText }}<span v-if="loading" class="cursor"></span>
              </template>
            </div>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="bottom-bar">
          <div
            style="
              display: flex;
              gap: 10px;
              align-items: center;
              flex-wrap: wrap;
            "
          >
            <button
              class="btn-enhance"
              @click="enhance"
              :disabled="loading || !userPrompt.trim()"
            >
              <span v-if="loading"><div class="spinner"></div></span>
              <span v-else>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  style="vertical-align: middle"
                >
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  />
                </svg>
              </span>
              {{ loading ? 'Enhancing…' : 'Enhance Prompt' }}
            </button>
            <span style="font-size: 12px; color: var(--muted)">⌘ + Enter</span>
          </div>
          <button
            class="btn-copy"
            :class="{ copied }"
            @click="copy"
            :disabled="!enhanced"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            {{ copied ? '✓ Copied!' : 'Copy' }}
          </button>
        </div>
      </div>

      <!-- Features -->
      <div class="features">
        <div class="features-title">What gets enhanced</div>
        <div class="features-grid">
          <div class="feature-card" v-for="f in features" :key="f.name">
            <div class="feature-icon">{{ f.icon }}</div>
            <div class="feature-name">{{ f.name }}</div>
            <div class="feature-desc">{{ f.desc }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const userPrompt = ref('');
const enhanced = ref('');
const displayText = ref('');
const loading = ref(false);
const copied = ref(false);
const error = ref('');

const examples = [
  'create a calculator app with React only.',
  'write a Python web scraper for news sites.',
  'explain machine learning to a beginner.',
];

const features = [
  {
    icon: '🎭',
    name: 'Role Definition',
    desc: 'Assigns expert persona for domain-specific authority.',
  },
  {
    icon: '🏗️',
    name: 'XML Structure',
    desc: 'Uses Claude-native XML tags for clear instruction hierarchy.',
  },
  {
    icon: '🧠',
    name: 'Chain-of-Thought',
    desc: 'Adds explicit reasoning steps for complex tasks.',
  },
  {
    icon: '🎯',
    name: 'Output Format',
    desc: 'Specifies format, tone, length & structure clearly.',
  },
  {
    icon: '📌',
    name: 'Context & Scope',
    desc: 'Defines boundaries, assumptions & edge cases.',
  },
  {
    icon: '✅',
    name: 'Examples & Rules',
    desc: 'Adds negative/positive examples and hard constraints.',
  },
];

async function enhance() {
  if (!userPrompt.value.trim() || loading.value) return;
  loading.value = true;
  enhanced.value = '';
  displayText.value = '';
  error.value = '';

  try {
    // Calls our Vercel serverless function — NOT Anthropic directly
    const res = await fetch('/api/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userPrompt.value.trim() }),
    });

    if (!res.ok) {
      const d = await res.json();
      throw new Error(d?.error || `Server error ${res.status}`);
    }

    const data = await res.json();
    const full = data.result || '';
    enhanced.value = full;

    // Typewriter effect
    displayText.value = '';
    let i = 0;
    const tick = () => {
      if (i < full.length) {
        displayText.value += full[i++];
        requestAnimationFrame(tick);
      } else {
        loading.value = false;
      }
    };
    requestAnimationFrame(tick);
  } catch (e) {
    error.value = e.message;
    loading.value = false;
  }
}

async function copy() {
  if (!enhanced.value) return;
  await navigator.clipboard.writeText(enhanced.value);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --bg: #05071a;
  --surface: #0d1130;
  --surface2: #111840;
  --border: #1e2a5e;
  --border2: #2a3a7a;
  --accent: #4f7bff;
  --accent2: #7c3aed;
  --teal: #06b6d4;
  --text: #e8eaf6;
  --muted: #7b85b8;
  --glow: rgba(79, 123, 255, 0.18);
}

.bg-grid {
  position: fixed;
  inset: 0;
  z-index: 0;
  background-image: linear-gradient(
      rgba(79, 123, 255, 0.04) 1px,
      transparent 1px
    ),
    linear-gradient(90deg, rgba(79, 123, 255, 0.04) 1px, transparent 1px);
  background-size: 40px 40px;
}

.orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
}
.orb1 {
  width: 500px;
  height: 500px;
  top: -150px;
  left: -100px;
  background: radial-gradient(
    circle,
    rgba(79, 123, 255, 0.15),
    transparent 70%
  );
  animation: drift1 12s ease-in-out infinite alternate;
}
.orb2 {
  width: 400px;
  height: 400px;
  bottom: -100px;
  right: -80px;
  background: radial-gradient(
    circle,
    rgba(124, 58, 237, 0.15),
    transparent 70%
  );
  animation: drift2 15s ease-in-out infinite alternate;
}
.orb3 {
  width: 300px;
  height: 300px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(6, 182, 212, 0.08), transparent 70%);
  animation: drift3 18s ease-in-out infinite alternate;
}

@keyframes drift1 {
  from {
    transform: translate(0, 0) scale(1);
  }
  to {
    transform: translate(60px, 40px) scale(1.1);
  }
}
@keyframes drift2 {
  from {
    transform: translate(0, 0) scale(1);
  }
  to {
    transform: translate(-50px, -30px) scale(1.15);
  }
}
@keyframes drift3 {
  from {
    transform: translate(-50%, -50%) scale(1);
  }
  to {
    transform: translate(-45%, -55%) scale(1.1);
  }
}

.app {
  font-family: 'Inter', sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.header {
  text-align: center;
  margin-bottom: 52px;
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(79, 123, 255, 0.12);
  border: 1px solid rgba(79, 123, 255, 0.3);
  border-radius: 999px;
  padding: 6px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #7aabff;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 20px;
}
.badge svg {
  width: 14px;
  height: 14px;
}
.title {
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  font-weight: 800;
  line-height: 1.1;
  background: linear-gradient(135deg, #e8eaf6 0%, #7aabff 45%, #c084fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 14px;
}
.subtitle {
  color: var(--muted);
  font-size: 1.05rem;
  max-width: 520px;
  margin: 0 auto;
  line-height: 1.6;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-top: 28px;
  flex-wrap: wrap;
}
.stat {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-size: 13px;
}
.stat-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent);
}

.card {
  background: linear-gradient(
    135deg,
    rgba(13, 17, 48, 0.9),
    rgba(17, 24, 64, 0.8)
  );
  border: 1px solid var(--border);
  border-radius: 20px;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 60px rgba(0, 0, 0, 0.5);
  transition: box-shadow 0.3s;
}
.card:hover {
  box-shadow: 0 12px 80px rgba(0, 0, 0, 0.6), 0 0 40px rgba(79, 123, 255, 0.08);
}

.card-top-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.02);
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.dot-r {
  background: #ff5f57;
}
.dot-y {
  background: #febc2e;
}
.dot-g {
  background: #28c840;
}
.bar-title {
  margin-left: 8px;
  font-size: 12px;
  color: var(--muted);
  font-weight: 500;
}

.panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
@media (max-width: 700px) {
  .panels {
    grid-template-columns: 1fr;
  }
}

.panel {
  padding: 24px;
}
.panel-left {
  border-right: 1px solid var(--border);
}
@media (max-width: 700px) {
  .panel-left {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
}

.panel-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 12px;
}
.char-count {
  font-size: 11px;
  color: var(--muted);
  background: rgba(79, 123, 255, 0.1);
  border: 1px solid rgba(79, 123, 255, 0.2);
  border-radius: 6px;
  padding: 2px 8px;
  font-weight: 600;
}
.char-count.warn {
  color: #fbbf24;
  border-color: rgba(251, 191, 36, 0.3);
}

textarea {
  width: 100%;
  min-height: 220px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--text);
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  line-height: 1.7;
  padding: 14px 16px;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
textarea::placeholder {
  color: rgba(123, 133, 184, 0.5);
}
textarea:focus {
  border-color: rgba(79, 123, 255, 0.5);
  box-shadow: 0 0 0 3px rgba(79, 123, 255, 0.1);
}

.output-box {
  min-height: 220px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 14px;
  line-height: 1.8;
  color: var(--text);
  white-space: pre-wrap;
  word-break: break-word;
  font-family: 'Inter', monospace;
  position: relative;
  transition: border-color 0.3s;
}
.output-box.has-content {
  border-color: rgba(79, 123, 255, 0.3);
}

.placeholder-state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.placeholder-icon {
  font-size: 28px;
  opacity: 0.3;
}
.placeholder-text {
  color: rgba(123, 133, 184, 0.4);
  font-size: 13px;
  font-family: 'Inter', sans-serif;
}

.cursor {
  display: inline-block;
  width: 2px;
  height: 1.1em;
  background: var(--accent);
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: blink 0.7s step-end infinite;
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}

.bottom-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.01);
  gap: 12px;
  flex-wrap: wrap;
}

.btn-enhance {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  border: none;
  border-radius: 12px;
  padding: 12px 28px;
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 24px rgba(79, 123, 255, 0.35);
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}
.btn-enhance::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), transparent);
  opacity: 0;
  transition: opacity 0.2s;
}
.btn-enhance:hover::before {
  opacity: 1;
}
.btn-enhance:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 32px rgba(79, 123, 255, 0.5);
}
.btn-enhance:active {
  transform: translateY(0);
}
.btn-enhance:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-copy {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border2);
  border-radius: 10px;
  padding: 10px 18px;
  color: var(--muted);
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-copy:hover {
  background: rgba(79, 123, 255, 0.1);
  border-color: rgba(79, 123, 255, 0.4);
  color: var(--text);
}
.btn-copy.copied {
  color: #4ade80;
  border-color: rgba(74, 222, 128, 0.4);
  background: rgba(74, 222, 128, 0.08);
}
.btn-copy:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.tag {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: rgba(79, 123, 255, 0.1);
  border: 1px solid rgba(79, 123, 255, 0.2);
  color: #7aabff;
}
.tag.green {
  background: rgba(74, 222, 128, 0.1);
  border-color: rgba(74, 222, 128, 0.2);
  color: #4ade80;
}
.tag.purple {
  background: rgba(192, 132, 252, 0.1);
  border-color: rgba(192, 132, 252, 0.2);
  color: #c084fc;
}
.tag.teal {
  background: rgba(6, 182, 212, 0.1);
  border-color: rgba(6, 182, 212, 0.2);
  color: #22d3ee;
}

.features {
  margin-top: 36px;
}
.features-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  text-align: center;
  margin-bottom: 18px;
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
}
.feature-card {
  background: rgba(13, 17, 48, 0.7);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px 18px;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
}
.feature-card:hover {
  border-color: var(--border2);
  background: rgba(17, 24, 64, 0.8);
  transform: translateY(-2px);
}
.feature-icon {
  font-size: 18px;
  margin-bottom: 8px;
}
.feature-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 4px;
}
.feature-desc {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.5;
}

.error-banner {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13px;
  color: #fca5a5;
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.model-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--muted);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 6px 12px;
  font-weight: 600;
}
.model-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 6px #4ade80;
}
</style>
