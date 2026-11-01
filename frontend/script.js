// =================================================================
// Grove — Calm AI Chat Demo
// =================================================================

const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const chatHistory = document.getElementById('chatHistory');
const chatContainer = document.getElementById('chatContainer');
const welcomeScreen = document.getElementById('welcomeScreen');
const tokenBalance = document.getElementById('tokenBalance');
const tokenLabel = document.getElementById('tokenLabel');
const currentPlan = document.getElementById('currentPlan');
const chatHistoryList = document.getElementById('chatHistoryList');
const newChatBtn = document.getElementById('newChatBtn');
const scrollBottom = document.getElementById('scrollBottom');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const chips = document.querySelectorAll('.chip');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const authButtons = document.getElementById('authButtons');
const userMenu = document.getElementById('userMenu');
const userMenuTrigger = document.getElementById('userMenuTrigger');
const userDropdown = document.getElementById('userDropdown');
const userName = document.getElementById('userName');
const userDisplayName = document.getElementById('userDisplayName');
const userEmail = document.getElementById('userEmail');
const userAvatar = document.getElementById('userAvatar');
const userAvatarLarge = document.getElementById('userAvatarLarge');
const chatSearchInput = document.getElementById('chatSearchInput');
const clearAllChatsBtn = document.getElementById('clearAllChatsBtn');
const sidebarUpgradeBtn = document.getElementById('sidebarUpgradeBtn');
const tokenAddBtn = document.getElementById('tokenAddBtn');
const modelSelectorTrigger = document.getElementById('modelSelectorTrigger');
const modelDropdown = document.getElementById('modelDropdown');
const inputModelBtn = document.getElementById('inputModelBtn');
const attachmentBtn = document.getElementById('attachmentBtn');
const attachmentInput = document.getElementById('attachmentInput');
const voiceInputBtn = document.getElementById('voiceInputBtn');

const authModal = document.getElementById('authModal');
const authForm = document.getElementById('authForm');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const modalTitle = document.getElementById('modalTitle');
const modalSubtitle = document.getElementById('modalSubtitle');
const modalSubmit = document.getElementById('modalSubmit');
const authToggle = document.getElementById('authToggle');
const authToggleText = document.getElementById('authToggleText');
const passwordToggle = document.getElementById('passwordToggle');
const authSetupStatus = document.getElementById('authSetupStatus');
const authSetupToggle = document.getElementById('authSetupToggle');
const authSetupFields = document.getElementById('authSetupFields');
const supabaseUrlInput = document.getElementById('supabaseUrl');
const supabaseKeyInput = document.getElementById('supabaseKey');
const authSetupSave = document.getElementById('authSetupSave');

const settingsModal = document.getElementById('settingsModal');
const settingsBtn = document.getElementById('settingsBtn');
const profileSettingsBtn = document.getElementById('profileSettingsBtn');
const settingsNavItems = document.querySelectorAll('.settings-nav-item');
const settingsTabs = document.querySelectorAll('.settings-tab');
const themeOptions = document.querySelectorAll('.theme-option');
const densityOptions = document.querySelectorAll('.density-option');
const fontSizeSlider = document.getElementById('fontSizeSlider');
const fontSizeValue = document.getElementById('fontSizeValue');
const settingsDisplayName = document.getElementById('settingsDisplayName');
const settingsCurrentPlan = document.getElementById('settingsCurrentPlan');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const deleteDataBtn = document.getElementById('deleteDataBtn');

const upgradeModal = document.getElementById('upgradeModal');
const upgradeAccountBtn = document.getElementById('upgradeAccountBtn');
const pricingBtns = document.querySelectorAll('[data-select-plan]');

const shareModal = document.getElementById('shareModal');
const shareChatBtn = document.getElementById('shareChatBtn');
const referralLink = document.getElementById('referralLink');
const copyReferralBtn = document.getElementById('copyReferralBtn');

const shortcutsModal = document.getElementById('shortcutsModal');
const keyboardShortcutsBtn = document.getElementById('keyboardShortcutsBtn');

const feedbackModal = document.getElementById('feedbackModal');
const feedbackForm = document.getElementById('feedbackForm');
const feedbackRating = document.getElementById('feedbackRating');
const feedbackText = document.getElementById('feedbackText');

const confirmModal = document.getElementById('confirmModal');
const confirmTitle = document.getElementById('confirmTitle');
const confirmMessage = document.getElementById('confirmMessage');
const confirmCancel = document.getElementById('confirmCancel');
const confirmOk = document.getElementById('confirmOk');

const exportChatsBtn = document.getElementById('exportChatsBtn');
const importChatsBtn = document.getElementById('importChatsBtn');
const importFileInput = document.getElementById('importFileInput');
const helpBtn = document.getElementById('helpBtn');
const logoutBtn = document.getElementById('logoutBtn');

const toastContainer = document.getElementById('toastContainer');

let tokens = 100;
let isGuest = true;
let isTyping = false;
let authMode = 'login';
let chats = [];
let currentChatId = null;
let currentPlanKey = 'free';
let currentModel = 'mathbrain-local';
const MATHBRAIN_API = 'http://127.0.0.1:8000/api/chat';
let currentUser = { name: 'Guest', email: 'guest@grove.ai' };
let supabaseConfig = null;
let authSession = null;
let confirmCallback = null;
let settings = { theme: 'dark', fontSize: 15, density: 'normal', saveHistory: true };

const planState = {
  free: { name: 'Free Plan', desc: '100 tokens per session', tokens: 100, price: '$0' },
  basic: { name: 'Basic Plan', desc: '1,000 tokens per month', tokens: 1000, price: '$9.99' },
  pro: { name: 'Pro Plan', desc: 'Unlimited tokens', tokens: Infinity, price: '$19.99' }
};

const modelInfo = {
  'grove-web-test': { name: 'MathBrain AI', icon: '🧮' },
  'grove-test-1-0': { name: 'Grove Test 1.0', icon: '🧪' }
};

// -----------------------------------------------------------------
// Init
// -----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
  loadSettings();
  loadState();
  initEventListeners();
  initModelDropdown();
  updateModelUI();
  updatePlanSelectionUI();
  loadSupabaseConfig();
  refreshAuthSetupUI();
  sendBtn.disabled = true;
  await restoreSupabaseSession();
});

function loadSettings() {
  try {
    const saved = localStorage.getItem('grove_settings');
    if (saved) settings = { ...settings, ...JSON.parse(saved) };
  } catch (e) {}

  document.documentElement.setAttribute('data-theme', settings.theme);
  document.documentElement.setAttribute('data-density', settings.density);
  document.documentElement.style.fontSize = settings.fontSize + 'px';

  themeOptions.forEach(opt => opt.classList.toggle('active', opt.dataset.theme === settings.theme));
  densityOptions.forEach(opt => opt.classList.toggle('active', opt.dataset.density === settings.density));
  fontSizeSlider.value = settings.fontSize;
  fontSizeValue.textContent = settings.fontSize + 'px';
}

function saveSettingsToStorage() {
  try { localStorage.setItem('grove_settings', JSON.stringify(settings)); } catch (e) {}
}

function loadState() {
  try {
    const savedChats = localStorage.getItem('grove_chats');
    const savedTokens = localStorage.getItem('grove_tokens');
    const savedPlan = localStorage.getItem('grove_plan');

    if (savedChats) chats = JSON.parse(savedChats);
    if (savedTokens) tokens = parseInt(savedTokens, 10);
    if (savedPlan) currentPlanKey = savedPlan;
    localStorage.removeItem('grove_user');
  } catch (e) {}

  setPlan(currentPlanKey, false);

  if (chats.length > 0) {
    currentChatId = chats[0].id;
    loadChat(currentChatId);
  } else {
    renderChatHistoryList();
  }
  updateAuthUI();
}

function persistState() {
  try {
    if (settings.saveHistory) localStorage.setItem('grove_chats', JSON.stringify(chats));
    else localStorage.removeItem('grove_chats');
    localStorage.setItem('grove_tokens', tokens.toString());
    localStorage.setItem('grove_plan', currentPlanKey);
  } catch (e) {}
}

// -----------------------------------------------------------------
// Events
// -----------------------------------------------------------------
function initEventListeners() {
  userInput.addEventListener('input', autoResize);
  userInput.addEventListener('keydown', handleInputKeydown);
  sendBtn.addEventListener('click', handleSend);

  newChatBtn.addEventListener('click', startNewChat);
  chatSearchInput.addEventListener('input', handleChatSearch);
  clearAllChatsBtn.addEventListener('click', confirmClearAllChats);
  sidebarUpgradeBtn?.addEventListener('click', () => openModal(upgradeModal));
  tokenAddBtn.addEventListener('click', () => openModal(upgradeModal));

  mobileMenuBtn.addEventListener('click', toggleSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      userInput.value = chip.dataset.prompt;
      userInput.focus();
      autoResize();
    });
  });

  loginBtn.addEventListener('click', () => openAuthModal('login'));
  signupBtn.addEventListener('click', () => openAuthModal('signup'));
  authToggle.addEventListener('click', (e) => {
    e.preventDefault();
    openAuthModal(authMode === 'login' ? 'signup' : 'login');
  });
  authForm.addEventListener('submit', handleAuthSubmit);
  passwordToggle.addEventListener('click', togglePasswordVisibility);
  authSetupToggle.addEventListener('click', () => {
    authSetupFields.classList.toggle('hidden');
    if (!authSetupFields.classList.contains('hidden')) {
      supabaseUrlInput.value = supabaseConfig?.url || '';
      supabaseKeyInput.value = supabaseConfig?.key || '';
      supabaseUrlInput.focus();
    }
  });
  authSetupSave.addEventListener('click', saveSupabaseConfig);

  userMenuTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle('open');
    userMenuTrigger.setAttribute('aria-expanded', userDropdown.classList.contains('open'));
  });
  logoutBtn.addEventListener('click', handleLogout);
  upgradeAccountBtn.addEventListener('click', () => { closeUserDropdown(); openModal(upgradeModal); });
  profileSettingsBtn.addEventListener('click', () => { closeUserDropdown(); openSettingsTab('account'); openModal(settingsModal); });
  shareChatBtn.addEventListener('click', () => { closeUserDropdown(); openModal(shareModal); });
  keyboardShortcutsBtn.addEventListener('click', () => { closeUserDropdown(); openModal(shortcutsModal); });

  chatContainer.addEventListener('scroll', handleScroll);
  scrollBottom.addEventListener('click', () => scrollToBottom(true));

  settingsBtn.addEventListener('click', () => openModal(settingsModal));
  settingsNavItems.forEach(item => item.addEventListener('click', () => openSettingsTab(item.dataset.settingsTab)));
  themeOptions.forEach(opt => opt.addEventListener('click', () => setTheme(opt.dataset.theme)));
  densityOptions.forEach(opt => opt.addEventListener('click', () => setDensity(opt.dataset.density)));
  fontSizeSlider.addEventListener('input', (e) => {
    settings.fontSize = parseInt(e.target.value, 10);
    fontSizeValue.textContent = settings.fontSize + 'px';
    document.documentElement.style.fontSize = settings.fontSize + 'px';
    saveSettingsToStorage();
  });
  document.getElementById('dataSaveHistory').addEventListener('change', (e) => {
    settings.saveHistory = e.target.checked;
    saveSettingsToStorage();
    persistState();
    showToast('Preference saved', 'success');
  });
  saveSettingsBtn.addEventListener('click', saveAccountSettings);
  deleteDataBtn.addEventListener('click', confirmDeleteData);

  pricingBtns.forEach(btn => btn.addEventListener('click', () => handlePlanSelect(btn.dataset.selectPlan)));

  copyReferralBtn.addEventListener('click', async () => {
    try { await copyTextToClipboard(referralLink.value); showToast('Link copied', 'success'); }
    catch { showToast('Could not copy', 'error'); }
  });
  document.querySelectorAll('.share-btn').forEach(button => {
    button.addEventListener('click', () => {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent('Try Grove, a calmer place to chat.');
      const destinations = {
        twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
      };
      const key = [...button.classList].find(name => destinations[name]);
      if (key) window.open(destinations[key], '_blank', 'noopener,noreferrer');
    });
  });

  feedbackRating.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      feedbackRating.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  feedbackForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Thanks for your feedback', 'success');
    closeModal(feedbackModal);
  });

  confirmCancel.addEventListener('click', () => closeModal(confirmModal));
  confirmOk.addEventListener('click', () => {
    if (confirmCallback) confirmCallback();
    confirmCallback = null;
    closeModal(confirmModal);
  });

  exportChatsBtn.addEventListener('click', exportChats);
  exportChatsBtn.addEventListener('keydown', handleSidebarActionKeydown);
  importChatsBtn.addEventListener('click', () => importFileInput.click());
  importChatsBtn.addEventListener('keydown', handleSidebarActionKeydown);
  importFileInput.addEventListener('change', importChats);
  helpBtn.addEventListener('click', showHelp);
  helpBtn.addEventListener('keydown', handleSidebarActionKeydown);
  settingsBtn.addEventListener('keydown', handleSidebarActionKeydown);

  attachmentBtn.addEventListener('click', () => attachmentInput.click());
  attachmentInput.addEventListener('change', handleAttachment);
  voiceInputBtn.addEventListener('click', startVoiceInput);
  inputModelBtn.addEventListener('click', () => modelSelectorTrigger.click());

  document.getElementById('sidebarBrand').addEventListener('click', (e) => {
    e.preventDefault();
    startNewChat();
    userInput.focus();
  });

  document.addEventListener('keydown', handleGlobalKeydown);
  document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target)) closeUserDropdown();
    if (!modelSelectorTrigger.closest('.model-selector').contains(e.target)) closeModelDropdown();
  });

  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    const closeButton = target.closest('.modal-close');
    const backdrop = target.closest('.modal-backdrop');
    const modal = closeButton?.closest('.modal') ?? backdrop?.closest('.modal');
    if (modal) closeModal(modal);
  });
}

// -----------------------------------------------------------------
// Sidebar
// -----------------------------------------------------------------
function toggleSidebar() {
  sidebar.classList.toggle('open');
  const isOpen = sidebar.classList.contains('open');
  sidebarOverlay.classList.toggle('visible', isOpen);
  sidebarOverlay.setAttribute('aria-hidden', String(!isOpen));
}

function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('visible');
  sidebarOverlay.setAttribute('aria-hidden', 'true');
}

function handleChatSearch(e) {
  renderChatHistoryList(e.target.value.toLowerCase());
}

function handleSidebarActionKeydown(e) {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  e.preventDefault();
  e.currentTarget.click();
}

// -----------------------------------------------------------------
// Input
// -----------------------------------------------------------------
function autoResize() {
  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 200) + 'px';
  sendBtn.disabled = userInput.value.trim().length === 0;
}

function handleInputKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
}

function handleAttachment() {
  const file = attachmentInput.files[0];
  attachmentInput.value = '';
  if (!file) return;

  if (file.size > 100_000) {
    showToast('Please choose a text file smaller than 100 KB', 'warning');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const content = String(reader.result || '').trim();
    userInput.value = userInput.value.trimEnd() + `\n\n[File: ${file.name}]\n${content}`;
    autoResize();
    userInput.focus();
    showToast(`${file.name} added`, 'success');
  };
  reader.onerror = () => showToast('Could not read file', 'error');
  reader.readAsText(file);
}

function startVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) { showToast('Voice input not supported', 'info'); return; }

  const recognition = new SpeechRecognition();
  recognition.lang = navigator.language || 'en-US';
  recognition.interimResults = false;
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = `${userInput.value.trim()}${userInput.value.trim() ? ' ' : ''}${transcript}`;
    autoResize();
    userInput.focus();
  };
  recognition.onerror = () => showToast('Could not capture speech', 'warning');
  recognition.start();
  showToast('Listening…', 'info');
}

function handleGlobalKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
    e.preventDefault();
    startNewChat();
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
    e.preventDefault();
    if (window.innerWidth <= 768) toggleSidebar();
    else document.body.classList.toggle('sidebar-collapsed');
  }
  if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    openModal(shortcutsModal);
  }
  if (e.key === '/' && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'INPUT') {
    e.preventDefault();
    userInput.focus();
  }
  if (e.key === 'Escape') {
    const openModalEl = [...document.querySelectorAll('.modal.open')].at(-1);
    if (openModalEl) closeModal(openModalEl);
  }
}

// -----------------------------------------------------------------
// Auth
// -----------------------------------------------------------------
function openAuthModal(mode) {
  authMode = mode;
  modalTitle.textContent = mode === 'login' ? 'Welcome back' : 'Create account';
  modalSubtitle.textContent = mode === 'login'
    ? 'Sign in to your Grove account.'
    : 'Create an account and verify your email to get started.';
  modalSubmit.textContent = mode === 'login' ? 'Log in' : 'Sign up';
  authToggleText.textContent = mode === 'login' ? 'New here?' : 'Already have an account?';
  authToggle.textContent = mode === 'login' ? 'Create account' : 'Log in';
  authPassword.autocomplete = mode === 'login' ? 'current-password' : 'new-password';
  authPassword.minLength = mode === 'signup' ? 8 : 1;
  modalSubmit.disabled = false;
  refreshAuthSetupUI();
  openModal(authModal);
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  if (!authForm.reportValidity()) return;

  if (!supabaseConfig) {
    authSetupFields.classList.remove('hidden');
    showToast('Connect Supabase once to enable real email accounts.', 'warning');
    return;
  }

  const email = authEmail.value.trim().toLowerCase();
  const password = authPassword.value;
  if (!email || !password || !authEmail.validity.valid) return;

  modalSubmit.disabled = true;
  modalSubmit.textContent = authMode === 'login' ? 'Signing in…' : 'Creating account…';
  try {
    if (authMode === 'signup') {
      const result = await supabaseAuthRequest('/signup', {
        method: 'POST',
        body: { email, password }
      });
      if (result.access_token && result.user) {
        if (!result.user.email_confirmed_at && !result.user.confirmed_at) {
          throw new Error('Email confirmation is disabled in Supabase. Enable it under Authentication → Providers → Email, then try again.');
        }
        await completeSupabaseSignIn(result);
      } else {
        authEmail.value = email;
        authPassword.value = '';
        modalSubtitle.textContent = 'Check your inbox for the verification link, then come back to log in.';
        closeModal(authModal);
        showToast('Check your inbox for a verification link. If you already have an account, log in instead.', 'success');
      }
    } else {
      const result = await supabaseAuthRequest('/token?grant_type=password', {
        method: 'POST',
        body: { email, password }
      });
      if (!result.access_token || !result.user) {
        throw new Error('Sign-in response was incomplete. Please try again.');
      }
      await completeSupabaseSignIn(result);
    }
  } catch (error) {
    showToast(error.message || 'Authentication failed. Please try again.', 'error');
  } finally {
    modalSubmit.disabled = false;
    modalSubmit.textContent = authMode === 'login' ? 'Log in' : 'Sign up';
  }
}

async function handleLogout() {
  const session = authSession;
  authSession = null;
  try { localStorage.removeItem('grove_auth_session'); }
  catch (error) { showToast('Could not clear the saved sign-in on this device.', 'error'); }
  if (session?.access_token && supabaseConfig) {
    try {
      await supabaseAuthRequest('/logout', { method: 'POST', accessToken: session.access_token });
    } catch (error) {
      showToast(`Signed out on this device, but the server could not revoke the session: ${error.message}`, 'warning');
    }
  }
  isGuest = true;
  currentUser = { name: 'Guest', email: 'guest@grove.ai' };
  setPlan('free', false);
  updateAuthUI();
  closeUserDropdown();
  startNewChat();
  showToast('Logged out', 'info');
}

function loadSupabaseConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem('grove_supabase_config') || 'null');
    if (saved && typeof saved.url === 'string' && typeof saved.key === 'string') {
      supabaseConfig = saved;
    }
  } catch (error) {
    showToast('Saved authentication settings could not be read. Reconnect Supabase to continue.', 'error');
  }
}

function refreshAuthSetupUI() {
  const connected = Boolean(supabaseConfig);
  authSetupStatus.textContent = connected
    ? 'Supabase settings are saved. Sign-up and sign-in requests will use this project.'
    : 'Connect your Supabase project once to enable real accounts and verification emails.';
  authSetupToggle.textContent = connected ? 'Manage' : 'Connect';
}

function saveSupabaseConfig() {
  const rawUrl = supabaseUrlInput.value.trim();
  const key = supabaseKeyInput.value.trim();
  let parsedUrl;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    showToast('Enter a valid Supabase Project URL.', 'error');
    supabaseUrlInput.focus();
    return;
  }
  if (parsedUrl.protocol !== 'https:' && parsedUrl.hostname !== 'localhost' && parsedUrl.hostname !== '127.0.0.1') {
    showToast('Use your Supabase HTTPS Project URL.', 'error');
    supabaseUrlInput.focus();
    return;
  }
  if (!key || key.toLowerCase().includes('service_role')) {
    showToast('Enter the publishable/anon key only. Never put a service_role key in a browser.', 'error');
    supabaseKeyInput.focus();
    return;
  }

  const config = { url: parsedUrl.origin, key };
  try {
    localStorage.setItem('grove_supabase_config', JSON.stringify(config));
  } catch (error) {
    showToast('Could not save the Supabase connection in this browser.', 'error');
    return;
  }
  supabaseConfig = config;
  refreshAuthSetupUI();
  authSetupFields.classList.add('hidden');
  showToast('Supabase settings saved. Check the project email settings before signing up.', 'success');
}

async function supabaseAuthRequest(path, { method = 'GET', body, accessToken } = {}) {
  if (!supabaseConfig) throw new Error('Connect your Supabase project first.');
  let response;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    response = await fetch(`${supabaseConfig.url}/auth/v1${path}`, {
      method,
      headers: {
        apikey: supabaseConfig.key,
        Authorization: `Bearer ${accessToken || supabaseConfig.key}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      ...(body ? { body: JSON.stringify(body) } : {})
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('Supabase took too long to respond. Please try again.');
    throw new Error('Could not reach Supabase. Check your connection and make sure this site is allowed in your project.');
  } finally {
    clearTimeout(timeout);
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = result.msg || result.message || result.error_description || result.error;
    const error = new Error(message || `Supabase returned HTTP ${response.status}.`);
    error.status = response.status;
    throw error;
  }
  return result;
}

async function saveAuthSession(session) {
  const expiresAt = session.expires_at || Math.floor(Date.now() / 1000) + (session.expires_in || 3600);
  authSession = { ...session, expires_at: expiresAt };
  try {
    localStorage.setItem('grove_auth_session', JSON.stringify(authSession));
  } catch {
    authSession = null;
    throw new Error('Could not save the sign-in session in this browser. Check browser storage settings.');
  }
}

async function completeSupabaseSignIn(session) {
  if (!session.user.email_confirmed_at && !session.user.confirmed_at) {
    throw new Error('This email is not verified yet. Check your inbox for Supabase’s confirmation link.');
  }
  await saveAuthSession(session);
  const email = session.user.email;
  const metadata = session.user.user_metadata || {};
  currentUser = {
    name: metadata.display_name || email.split('@')[0],
    email
  };
  isGuest = false;
  updateAuthUI();
  persistState();
  closeModal(authModal);
  authForm.reset();
  startNewChat();
  addMessage('ai', `Welcome${authMode === 'signup' ? ' to Grove' : ' back'}, **${currentUser.name}**! 🌿`);
  showToast(authMode === 'signup' ? 'Your email is verified and your account is ready.' : 'You are signed in.', 'success');
}

async function restoreSupabaseSession() {
  if (!supabaseConfig) return;
  const redirectParams = new URLSearchParams(window.location.hash.slice(1));
  const redirectError = redirectParams.get('error_description') || redirectParams.get('error');
  const redirectAccessToken = redirectParams.get('access_token');
  if (redirectError || redirectAccessToken) {
    try {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    } catch {
      showToast('Email confirmation requires Grove to run from a website or localhost, not a file:// page.', 'error');
      return;
    }
    if (redirectError) {
      showToast(`Email confirmation did not finish: ${redirectError}`, 'error');
      return;
    }
    try {
      const user = await supabaseAuthRequest('/user', { accessToken: redirectAccessToken });
      if (!user.email || (!user.email_confirmed_at && !user.confirmed_at)) {
        throw new Error('Supabase did not confirm this email. Open the latest confirmation link and try again.');
      }
      const session = {
        access_token: redirectAccessToken,
        refresh_token: redirectParams.get('refresh_token'),
        expires_in: Number(redirectParams.get('expires_in')) || 3600,
        expires_at: Number(redirectParams.get('expires_at')) || undefined,
        token_type: redirectParams.get('token_type') || 'bearer',
        user
      };
      if (!session.refresh_token) throw new Error('Supabase did not return a refresh token. Please log in.');
      await saveAuthSession(session);
      const metadata = user.user_metadata || {};
      currentUser = { name: metadata.display_name || user.email.split('@')[0], email: user.email };
      isGuest = false;
      updateAuthUI();
      persistState();
      showToast('Email verified. Your Grove account is ready.', 'success');
      return;
    } catch (error) {
      showToast(`Could not finish email verification: ${error.message}`, 'error');
      return;
    }
  }

  let saved;
  try {
    saved = JSON.parse(localStorage.getItem('grove_auth_session') || 'null');
  } catch {
    localStorage.removeItem('grove_auth_session');
    showToast('Saved sign-in could not be read. Please log in again.', 'warning');
    return;
  }
  if (!saved?.access_token || !saved?.refresh_token) return;

  try {
    let session = saved;
    if (saved.expires_at <= Math.floor(Date.now() / 1000) + 30) {
      session = await supabaseAuthRequest('/token?grant_type=refresh_token', {
        method: 'POST',
        body: { refresh_token: saved.refresh_token }
      });
      await saveAuthSession(session);
    }
    const user = await supabaseAuthRequest('/user', { accessToken: session.access_token });
    const email = user.email;
    if (!email) throw new Error('Supabase returned a session without an email address.');
    const metadata = user.user_metadata || {};
    currentUser = { name: metadata.display_name || email.split('@')[0], email };
    authSession = session;
    isGuest = false;
    updateAuthUI();
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      authSession = null;
      localStorage.removeItem('grove_auth_session');
      showToast('Your sign-in expired. Please log in again.', 'info');
      return;
    }
    showToast(`Could not restore your sign-in: ${error.message}`, 'warning');
  }
}

function updateAuthUI() {
  if (isGuest) {
    authButtons.classList.remove('hidden');
    userMenu.classList.add('hidden');
  } else {
    authButtons.classList.add('hidden');
    userMenu.classList.remove('hidden');
    userName.textContent = currentUser.name;
    userDisplayName.textContent = currentUser.name;
    userEmail.textContent = currentUser.email;
    const initial = currentUser.name.charAt(0).toUpperCase();
    userAvatar.textContent = initial;
    userAvatarLarge.textContent = initial;
    settingsDisplayName.value = currentUser.name;
    referralLink.value = `https://grove.ai/?ref=${currentUser.name.toUpperCase()}123`;
  }
}

function closeUserDropdown() {
  userDropdown.classList.remove('open');
  userMenuTrigger.setAttribute('aria-expanded', 'false');
}

function togglePasswordVisibility() {
  const type = authPassword.type === 'password' ? 'text' : 'password';
  authPassword.type = type;
  passwordToggle.setAttribute('aria-label', type === 'password' ? 'Show password' : 'Hide password');
}

// -----------------------------------------------------------------
// Plans
// -----------------------------------------------------------------
function setPlan(plan, showNotification = true) {
  currentPlanKey = plan;
  const p = planState[plan];
  currentPlan.textContent = p.name;
  tokens = p.tokens === Infinity ? Infinity : p.tokens;
  updateTokens();
  updatePlanSelectionUI();
  updateSettingsPlanCard();
  persistState();

  if (showNotification) showToast(`Switched to ${p.name}`, 'success');
}

function updateTokens() {
  tokenBalance.textContent = tokens === Infinity ? '∞' : tokens;
  tokenLabel.textContent = tokens === Infinity ? 'unlimited' : 'tokens left';
}

function updatePlanSelectionUI() {
  pricingBtns.forEach(btn => {
    const plan = btn.dataset.selectPlan;
    if (plan === currentPlanKey) {
      btn.textContent = 'Current plan';
      btn.classList.add('btn-secondary');
      btn.classList.remove('btn-primary');
    } else {
      btn.textContent = `Choose ${plan.charAt(0).toUpperCase() + plan.slice(1)}`;
      btn.classList.add('btn-primary');
      btn.classList.remove('btn-secondary');
    }
  });
}

function updateSettingsPlanCard() {
  const p = planState[currentPlanKey];
  settingsCurrentPlan.innerHTML = `
    <div>
      <strong>${p.name}</strong>
      <span>${p.desc}</span>
    </div>
    <button class="btn btn-sm btn-primary" id="settingsUpgradeBtn" type="button">Upgrade</button>
  `;
  document.getElementById('settingsUpgradeBtn')?.addEventListener('click', () => {
    closeModal(settingsModal);
    openModal(upgradeModal);
  });
}

function handlePlanSelect(plan) {
  setPlan(plan);
  closeModal(upgradeModal);
  addMessage('ai', `You selected the **${planState[plan].name}** preview. ${planState[plan].desc}. Payments are not enabled yet.`);
}

// -----------------------------------------------------------------
// Chat management
// -----------------------------------------------------------------
function startNewChat() {
  if (currentChatId) {
    const chat = chats.find(c => c.id === currentChatId);
    if (chat && chat.messages.length === 0) return;
  }

  currentChatId = Date.now().toString();
  chats.unshift({ id: currentChatId, title: 'New chat', messages: [], createdAt: Date.now() });
  renderChatHistoryList();
  clearChat();
  persistState();
  userInput.focus();
}

function renderChatHistoryList(filterQuery = '') {
  chatHistoryList.innerHTML = '';

  let filtered = chats;
  if (filterQuery) filtered = chats.filter(c => c.title.toLowerCase().includes(filterQuery));

  if (filtered.length === 0) {
    chatHistoryList.innerHTML = `<li class="chat-history-item empty">${filterQuery ? 'No matches' : 'No chats yet'}</li>`;
    return;
  }

  filtered.forEach(chat => {
    const li = document.createElement('li');
    li.className = 'chat-history-item';
    li.setAttribute('role', 'button');
    li.tabIndex = 0;
    if (chat.id === currentChatId) li.classList.add('active');

    const titleSpan = document.createElement('span');
    titleSpan.textContent = chat.title;
    titleSpan.style.cssText = 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1';

    const actions = document.createElement('div');
    actions.className = 'chat-item-actions';
    actions.innerHTML = `<button class="chat-item-action rename" title="Rename" aria-label="Rename">✎</button><button class="chat-item-action delete" title="Delete" aria-label="Delete">×</button>`;

    li.appendChild(titleSpan);
    li.appendChild(actions);

    li.addEventListener('click', (e) => {
      if (e.target.closest('.chat-item-action')) return;
      loadChat(chat.id);
      if (window.innerWidth <= 768) closeSidebar();
    });
    li.addEventListener('keydown', (e) => {
      if ((e.key !== 'Enter' && e.key !== ' ') || e.target.closest('.chat-item-action')) return;
      e.preventDefault();
      loadChat(chat.id);
      if (window.innerWidth <= 768) closeSidebar();
    });

    actions.querySelector('.rename').addEventListener('click', (e) => { e.stopPropagation(); beginRenameChat(chat, titleSpan); });
    actions.querySelector('.delete').addEventListener('click', (e) => { e.stopPropagation(); confirmDeleteChat(chat.id); });

    chatHistoryList.appendChild(li);
  });
}

function beginRenameChat(chat, titleSpan) {
  const field = document.createElement('input');
  field.type = 'text';
  field.value = chat.title;
  field.maxLength = 60;
  field.className = 'chat-rename-input';
  titleSpan.replaceWith(field);
  field.focus();
  field.select();

  let finished = false;
  const finish = (save) => {
    if (finished) return;
    finished = true;
    if (save && field.value.trim()) { chat.title = field.value.trim(); persistState(); }
    renderChatHistoryList(chatSearchInput.value.toLowerCase());
  };
  field.addEventListener('click', e => e.stopPropagation());
  field.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); finish(true); } if (e.key === 'Escape') { e.preventDefault(); finish(false); } });
  field.addEventListener('blur', () => finish(true));
}

function loadChat(id) {
  const chat = chats.find(c => c.id === id);
  if (!chat) return;
  currentChatId = id;
  renderChatHistoryList(chatSearchInput.value.toLowerCase());
  chatHistory.innerHTML = '';

  if (chat.messages.length === 0) {
    welcomeScreen.style.display = 'flex';
  } else {
    welcomeScreen.style.display = 'none';
    chat.messages.forEach(m => appendMessageToDOM(m.sender, m.text, false));
  }
}

function clearChat() {
  chatHistory.innerHTML = '';
  welcomeScreen.style.display = 'flex';
}

function confirmDeleteChat(id) {
  confirmTitle.textContent = 'Delete chat?';
  confirmMessage.textContent = 'This chat will be removed.';
  confirmCallback = () => {
    chats = chats.filter(c => c.id !== id);
    if (currentChatId === id) { currentChatId = null; clearChat(); }
    renderChatHistoryList(chatSearchInput.value.toLowerCase());
    persistState();
    showToast('Chat deleted', 'info');
  };
  openModal(confirmModal);
}

function confirmClearAllChats() {
  if (chats.length === 0) return;
  confirmTitle.textContent = 'Clear all chats?';
  confirmMessage.textContent = 'All chats will be deleted.';
  confirmCallback = () => {
    chats = [];
    currentChatId = null;
    clearChat();
    renderChatHistoryList();
    persistState();
    showToast('All chats cleared', 'info');
  };
  openModal(confirmModal);
}

// -----------------------------------------------------------------
// Send message
// -----------------------------------------------------------------
function handleSend() {
  const text = userInput.value.trim();
  if (!text || isTyping) return;


  if (!currentChatId) startNewChat();
  const chat = chats.find(c => c.id === currentChatId);

  if (chat && chat.messages.length === 0) {
    chat.title = text.length > 28 ? text.slice(0, 28) + '…' : text;
    renderChatHistoryList(chatSearchInput.value.toLowerCase());
  }

  addMessage('user', text);
  userInput.value = '';
  userInput.style.height = 'auto';
  sendBtn.disabled = true;


  welcomeScreen.style.display = 'none';
  showTyping();

  askMathBrain(text)
    .then(reply => addMessage('ai', reply))
    .catch(error => addMessage('ai', `I could not reach MathBrain. Please check that the Python API is running.\\n\\n${error.message}`))
    .finally(() => { removeTyping(); sendBtn.disabled = false; });
}

async function askMathBrain(message) {
  const response = await fetch(MATHBRAIN_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  if (!response.ok) throw new Error(`MathBrain returned HTTP ${response.status}`);
  const data = await response.json();
  return data.reply || 'I could not create a maths explanation. Please try again.';
}

function addMessage(sender, text) {
  const chat = chats.find(c => c.id === currentChatId);
  if (chat) {
    chat.messages.push({ sender, text, timestamp: Date.now() });
    persistState();
  }
  appendMessageToDOM(sender, text, true);
}

function appendMessageToDOM(sender, text, animate = true) {
  welcomeScreen.style.display = 'none';

  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${sender}`;
  if (!animate) msgDiv.style.animation = 'none';

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = sender === 'user' ? 'You' : '🌿';

  const content = document.createElement('div');
  content.className = 'message-content';

  const header = document.createElement('div');
  header.className = 'message-header';
  header.textContent = sender === 'user' ? 'You' : 'Grove';

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = formatMessage(text);
  bubble.querySelectorAll('.code-copy').forEach(button => {
    button.addEventListener('click', async () => {
      const code = button.closest('pre')?.querySelector('code')?.textContent || '';
      try { await copyTextToClipboard(code); button.textContent = 'Copied'; setTimeout(() => button.textContent = 'Copy', 1200); }
      catch { showToast('Could not copy code', 'error'); }
    });
  });

  content.appendChild(header);
  content.appendChild(bubble);

  if (sender === 'ai') {
    const actions = document.createElement('div');
    actions.className = 'message-actions';
    actions.innerHTML = `
      <button class="action-btn" title="Copy" aria-label="Copy">📋</button>
      <button class="action-btn" title="Like" aria-label="Like">👍</button>
      <button class="action-btn" title="Dislike" aria-label="Dislike">👎</button>
      <button class="action-btn" title="Regenerate" aria-label="Regenerate">↻</button>
    `;

    const copyBtn = actions.children[0];
    const likeBtn = actions.children[1];
    const dislikeBtn = actions.children[2];
    const regenBtn = actions.children[3];

    copyBtn.addEventListener('click', async () => {
      try { await copyTextToClipboard(text); showToast('Copied', 'success'); }
      catch { showToast('Could not copy', 'error'); }
    });
    likeBtn.addEventListener('click', () => { likeBtn.classList.add('active'); dislikeBtn.classList.remove('active'); showToast('Thanks', 'success'); });
    dislikeBtn.addEventListener('click', () => { dislikeBtn.classList.add('active'); likeBtn.classList.remove('active'); openModal(feedbackModal); });
    regenBtn.addEventListener('click', () => {
      if (isTyping) return;
      const sourceChat = chats.find(c => c.id === currentChatId);
      const lastUserMsg = [...(sourceChat?.messages || [])].reverse().find(m => m.sender === 'user')?.text || text;
      showTyping();
      askMathBrain(lastUserMsg)
        .then(reply => addMessage('ai', reply))
        .catch(error => addMessage('ai', `I could not reach MathBrain. Please check that the Python API is running.\n\n${error.message}`))
        .finally(() => removeTyping());
    });

    content.appendChild(actions);
  }

  msgDiv.appendChild(avatar);
  msgDiv.appendChild(content);
  chatHistory.appendChild(msgDiv);
  scrollToBottom();
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return; }
  const t = document.createElement('textarea');
  t.value = text;
  t.setAttribute('readonly', '');
  t.style.position = 'fixed';
  t.style.opacity = '0';
  document.body.appendChild(t);
  t.select();
  const copied = document.execCommand('copy');
  t.remove();
  if (!copied) throw new Error('copy failed');
}

function formatMessage(text) {
  let formatted = escapeHtml(text);

  formatted = formatted.replace(/```(\w*)\n?([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><div class="code-header"><span class="code-lang">${lang || 'code'}</span><button class="code-copy" type="button">Copy</button></div><code>${code.trim()}</code></pre>`;
  });
  formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
  formatted = formatted.replace(/~~(.+?)~~/g, '<del>$1</del>');
  formatted = formatted.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  formatted = formatted.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  formatted = formatted.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  formatted = formatted.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
  formatted = formatted.replace(/^---$/gm, '<hr>');

  const lines = formatted.split('\n');
  let inList = false;
  let result = [];
  lines.forEach(line => {
    const m = line.match(/^[-*] (.+)$/);
    if (m) { if (!inList) { result.push('<ul>'); inList = true; } result.push(`<li>${m[1]}</li>`); }
    else { if (inList) { result.push('</ul>'); inList = false; } result.push(line); }
  });
  if (inList) result.push('</ul>');
  formatted = result.join('\n');

  formatted = formatted.replace(/(?:^|\n)\d+\.\s+(.+)(?:\n|$)/g, (match, item) => `<ol><li>${item}</li></ol>`);

  const blocks = formatted.split(/\n{2,}/);
  return blocks.map(block => {
    block = block.trim();
    if (!block) return '';
    if (block.startsWith('<') && !block.startsWith('<br')) return block;
    return `<p>${block.replace(/\n/g, '<br>')}</p>`;
  }).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showTyping() {
  isTyping = true;
  sendBtn.disabled = true;
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message ai typing-indicator';
  typingDiv.innerHTML = `<div class="avatar">🌿</div><div class="message-content"><div class="message-header">Grove</div><div class="bubble"><div class="typing"><span></span><span></span><span></span></div></div></div>`;
  chatHistory.appendChild(typingDiv);
  scrollToBottom();
}

function removeTyping() {
  isTyping = false;
  sendBtn.disabled = userInput.value.trim().length === 0;
  document.querySelector('.typing-indicator')?.remove();
}

function scrollToBottom(smooth = true) {
  chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
}

function handleScroll() {
  const nearBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 120;
  scrollBottom.classList.toggle('visible', !nearBottom);
}

// -----------------------------------------------------------------
// Model selector
// -----------------------------------------------------------------
function initModelDropdown() {
  modelSelectorTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = modelDropdown.classList.contains('open');
    modelDropdown.classList.toggle('open', !isOpen);
    modelSelectorTrigger.setAttribute('aria-expanded', !isOpen);
  });

  document.querySelectorAll('.model-option').forEach(option => {
    option.tabIndex = 0;
    const selectModel = () => {
      currentModel = option.dataset.model;
      updateModelUI();
      closeModelDropdown();
      showToast(`Switched to ${modelInfo[currentModel].name}`, 'info');
    };
    option.addEventListener('click', selectModel);
    option.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectModel(); } });
  });
}

function updateModelUI() {
  const info = modelInfo[currentModel];
  modelSelectorTrigger.querySelector('.model-name').textContent = info.name;
  modelSelectorTrigger.querySelector('.model-icon').textContent = info.icon;
  inputModelBtn.querySelector('span').textContent = info.icon;
  document.querySelectorAll('.model-option').forEach(opt => opt.classList.toggle('active', opt.dataset.model === currentModel));
}

function closeModelDropdown() {
  modelDropdown.classList.remove('open');
  modelSelectorTrigger.setAttribute('aria-expanded', 'false');
}

// -----------------------------------------------------------------
// Modals
// -----------------------------------------------------------------
function openModal(modal) {
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  const firstInput = modal.querySelector('input, textarea, button:not(.modal-close)');
  if (firstInput) setTimeout(() => firstInput.focus(), 50);
}

function closeModal(modal) {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  if (!document.querySelector('.modal.open')) document.body.classList.remove('modal-open');
}

function openSettingsTab(tabName) {
  settingsNavItems.forEach(item => item.classList.toggle('active', item.dataset.settingsTab === tabName));
  settingsTabs.forEach(tab => tab.classList.toggle('active', tab.id === `tab-${tabName}`));
}

function setTheme(theme) {
  settings.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  themeOptions.forEach(opt => opt.classList.toggle('active', opt.dataset.theme === theme));
  saveSettingsToStorage();
}

function setDensity(density) {
  settings.density = density;
  document.documentElement.setAttribute('data-density', density);
  densityOptions.forEach(opt => opt.classList.toggle('active', opt.dataset.density === density));
  saveSettingsToStorage();
}

function saveAccountSettings() {
  const newName = settingsDisplayName.value.trim();
  if (newName) {
    currentUser.name = newName;
    updateAuthUI();
    persistState();
    showToast('Saved', 'success');
  }
}

function confirmDeleteData() {
  confirmTitle.textContent = 'Delete all data?';
  confirmMessage.textContent = 'Everything will be removed.';
  confirmCallback = () => {
    ['grove_chats', 'grove_tokens', 'grove_plan', 'grove_user', 'grove_settings', 'grove_auth_session', 'grove_supabase_config'].forEach(k => localStorage.removeItem(k));
    chats = [];
    currentChatId = null;
    currentUser = { name: 'Guest', email: 'guest@grove.ai' };
    isGuest = true;
    authSession = null;
    supabaseConfig = null;
    refreshAuthSetupUI();
    settings = { theme: 'dark', fontSize: 15, density: 'normal', saveHistory: true };
    setPlan('free', false);
    updateAuthUI();
    loadSettings();
    clearChat();
    renderChatHistoryList();
    closeModal(settingsModal);
    showToast('All data deleted', 'info');
  };
  openModal(confirmModal);
}

// -----------------------------------------------------------------
// Export / Import
// -----------------------------------------------------------------
function exportChats() {
  if (chats.length === 0) { showToast('No chats to export', 'warning'); return; }
  const data = { version: '2.0', exportedAt: new Date().toISOString(), user: currentUser, plan: currentPlanKey, chats };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `grove-chats-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast('Chats exported', 'success');
}

function importChats(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      if (data.chats && Array.isArray(data.chats)) {
        chats = data.chats;
        currentChatId = chats[0]?.id || null;
        if (currentChatId) loadChat(currentChatId); else clearChat();
        persistState();
        showToast('Chats imported', 'success');
      } else throw new Error('bad format');
    } catch { showToast('Failed to import', 'error'); }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function showHelp() {
  startNewChat();
  setTimeout(() => {
    addMessage('ai', `**Grove Help** 🌿\n\n- Type a message and press Enter\n- Use the sidebar to manage chats\n- Switch models from the top menu\n- Export/import chats as JSON\n- Connect Supabase in the sign-in window for verified email accounts\n\nChat replies are simulated until an AI provider is connected, and plan payments are not enabled.`);
  }, 200);
}

// -----------------------------------------------------------------
// Toast
// -----------------------------------------------------------------
function showToast(message, type = 'info', title = '') {
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><div class="toast-content">${title ? `<div class="toast-title">${title}</div>` : ''}<div class="toast-message">${message}</div></div><button class="toast-close" aria-label="Close">×</button>`;
  toast.querySelector('.toast-close').addEventListener('click', () => { toast.classList.add('hiding'); setTimeout(() => toast.remove(), 300); });
  toastContainer.appendChild(toast);
  setTimeout(() => { toast.classList.add('hiding'); setTimeout(() => toast.remove(), 300); }, 3500);
}

// -----------------------------------------------------------------
// AI responses
// -----------------------------------------------------------------
function generateResponse(input) {
  const text = input.toLowerCase();
  const model = currentModel;

  if (model === 'grove-test-1-0') {
    return `**Grove Test 1.0** 🧪\n\nThis alternate build is active. Your prompt was: *${input}*\n\nTry it for quick, direct test responses and compare the vibe with the main web model.`;
  }

  if (text.includes('hello') || text === 'hi' || text.includes('hey')) return "Hello! I'm **Grove Web Test**. How can I help? 🌿";
  if (text.includes('help')) return "**Grove Help** 🌿\n\nAsk me anything, click a suggestion, or switch models from the top menu.";
  if (text.includes('token') || text.includes('plan') || text.includes('upgrade')) return "Plans:\n- **Free**: 100 tokens/session\n- **Basic**: 1,000 tokens/month\n- **Pro**: Unlimited\n\nUpgrade anytime from the sidebar.";
  if (text.includes('code') || text.includes('python') || text.includes('javascript')) return "I can help with code ideas and examples. Try the alternate **Grove Test 1.0** model if you want a different response style.";
  if (text.includes('satellite') || text.includes('space')) return "Grove is powered by a thoughtful, lightweight approach to AI interactions. 🛰️🌱";
  if (text.includes('climate') || text.includes('earth')) return "I can help with climate topics, renewable energy, and greener choices. What do you want to know?";
  if (text.includes('thank')) return "You're welcome! 🌿";
  if (text.includes('joke')) return "Why did the satellite go to school? To improve its orbit. 🛰️";

  return "That's interesting. Tell me more, or try one of the suggestion chips.";
}
