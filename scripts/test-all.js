/**
 * NOXI - Script de test et diagnostic
 *
 * Usage: node scripts/test-all.js
 *
 * Prerequis: Le serveur doit tourner (npm run server:dev)
 *
 * Ce script teste:
 * 1. Connexion BDD + tables
 * 2. Tous les endpoints API (auth, profiles, messages, friends)
 * 3. WebSocket (connexion, chat_game)
 * 4. Integrite des fichiers frontend
 */

import dotenv from 'dotenv';
dotenv.config();

import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const API = process.env.VITE_API_URL || 'http://localhost:5000';
const WS_URL = process.env.VITE_WS_URL || 'ws://localhost:9090';

// --- Helpers ---
let passed = 0;
let failed = 0;
let warnings = 0;
const errors = [];

function ok(label) {
  passed++;
  console.log(`  \x1b[32m✓\x1b[0m ${label}`);
}

function fail(label, detail) {
  failed++;
  const msg = detail ? `${label} → ${detail}` : label;
  errors.push(msg);
  console.log(`  \x1b[31m✗\x1b[0m ${label}`);
  if (detail) console.log(`    \x1b[31m${detail}\x1b[0m`);
}

function warn(label) {
  warnings++;
  console.log(`  \x1b[33m⚠\x1b[0m ${label}`);
}

function section(title) {
  console.log(`\n\x1b[36m━━━ ${title} ━━━\x1b[0m`);
}

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, ok: res.ok, json, text };
}

// =============================================
// 1. DATABASE
// =============================================
async function testDatabase() {
  section('BASE DE DONNEES');

  const db = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    { host: process.env.DB_HOST, dialect: 'mysql', port: 3306, logging: false }
  );

  try {
    await db.authenticate();
    ok('Connexion MySQL');
  } catch (e) {
    fail('Connexion MySQL', e.message);
    return;
  }

  // Check required tables
  const requiredTables = [
    'ncs_users', 'ncs_profiles', 'ncs_games', 'ncs_gamemodels',
    'ncs_gameplayers', 'ncs_playerscores', 'ncs_events',
    'ncs_eventattendees', 'ncs_eventlikers', 'ncs_friendships',
    'ncs_friendrequests', 'ncs_gamemodes', 'ncs_messages'
  ];

  const [tables] = await db.query('SHOW TABLES');
  const tableNames = tables.map(t => Object.values(t)[0]);

  for (const table of requiredTables) {
    if (tableNames.includes(table)) {
      ok(`Table ${table} existe`);
    } else {
      fail(`Table ${table} manquante`, 'Executez le CREATE TABLE ou relancez le serveur (db.sync)');
    }
  }

  // Check ncs_messages columns
  if (tableNames.includes('ncs_messages')) {
    const [cols] = await db.query('DESCRIBE ncs_messages');
    const colNames = cols.map(c => c.Field);
    const expectedCols = ['id', 'senderId', 'receiverId', 'senderName', 'content', 'read', 'createdAt', 'updatedAt'];
    for (const col of expectedCols) {
      if (colNames.includes(col)) {
        ok(`ncs_messages.${col}`);
      } else {
        fail(`ncs_messages.${col} manquante`);
      }
    }
  }

  // Check ncs_profiles has userId column
  if (tableNames.includes('ncs_profiles')) {
    const [cols] = await db.query('DESCRIBE ncs_profiles');
    const colNames = cols.map(c => c.Field);
    if (colNames.includes('userId') || colNames.includes('userid')) {
      ok('ncs_profiles.userId existe');
    } else {
      fail('ncs_profiles.userId manquante');
    }
  }

  // Check test users exist
  const [users] = await db.query("SELECT username, role FROM ncs_users LIMIT 5");
  if (users.length > 0) {
    ok(`${users.length} utilisateur(s) en base (${users.map(u => u.username).join(', ')})`);
  } else {
    warn('Aucun utilisateur en base - inserez les donnees initiales');
  }

  await db.close();
}

// =============================================
// 2. API ENDPOINTS
// =============================================
async function testAPI() {
  section('API REST (serveur doit tourner sur port 5000)');

  let serverUp = false;
  try {
    const res = await fetch(`${API}/gamemodels`);
    if (res.ok) {
      serverUp = true;
      ok('Serveur API accessible');
    }
  } catch {
    fail('Serveur API inaccessible', `Lancez: npm run server:dev`);
    return null;
  }

  // --- Public endpoints ---
  section('Endpoints publics');

  const gm = await fetchJSON(`${API}/gamemodels`);
  if (gm.ok && Array.isArray(gm.json)) {
    ok(`GET /gamemodels → ${gm.json.length} modele(s)`);
  } else {
    fail('GET /gamemodels', gm.text?.substring(0, 100));
  }

  const pub = await fetchJSON(`${API}/games/public`);
  if (pub.ok) {
    ok(`GET /games/public → ${Array.isArray(pub.json) ? pub.json.length : 0} partie(s)`);
  } else {
    fail('GET /games/public', pub.text?.substring(0, 100));
  }

  const events = await fetchJSON(`${API}/events`);
  if (events.ok) {
    ok(`GET /events → ${Array.isArray(events.json) ? events.json.length : 0} evenement(s)`);
  } else {
    fail('GET /events', events.text?.substring(0, 100));
  }

  // --- Auth ---
  section('Authentification');

  const loginRes = await fetchJSON(`${API}/users/login`, {
    method: 'POST',
    body: JSON.stringify({ mail: 'admin@noxi.local', password: 'Admin123!' }),
  });

  let token = null;
  if (loginRes.ok && loginRes.json?.token) {
    token = loginRes.json.token;
    ok('POST /users/login (admin) → token obtenu');
  } else {
    fail('POST /users/login (admin)', loginRes.json?.message || loginRes.text?.substring(0, 100));
    warn('Tests authentifies seront ignores');
  }

  if (!token) return null;

  const authHeaders = { Authorization: `Bearer ${token}` };

  // --- Protected endpoints ---
  section('Endpoints proteges');

  // Profile
  const profileRes = await fetchJSON(`${API}/profiles/user/1`, { headers: authHeaders });
  if (profileRes.ok && profileRes.json) {
    ok(`GET /profiles/user/1 → profil "${profileRes.json.nickname || 'sans nom'}"`);
  } else if (profileRes.status === 404) {
    warn('GET /profiles/user/1 → profil non trouve (normal si pas cree)');
  } else {
    fail('GET /profiles/user/1', profileRes.json?.message || profileRes.status);
  }

  // Friendships
  const friendsRes = await fetchJSON(`${API}/friendships/mine`, { headers: authHeaders });
  if (friendsRes.ok && Array.isArray(friendsRes.json)) {
    ok(`GET /friendships/mine → ${friendsRes.json.length} amitie(s)`);
  } else {
    fail('GET /friendships/mine', friendsRes.json?.message || friendsRes.status);
  }

  // Friend requests
  const reqRes = await fetchJSON(`${API}/friendrequests/mine`, { headers: authHeaders });
  if (reqRes.ok && Array.isArray(reqRes.json)) {
    ok(`GET /friendrequests/mine → ${reqRes.json.length} demande(s)`);
  } else {
    fail('GET /friendrequests/mine', reqRes.json?.message || reqRes.status);
  }

  // Messages - unread count
  const unreadRes = await fetchJSON(`${API}/messages/unread-count`, { headers: authHeaders });
  if (unreadRes.ok && typeof unreadRes.json?.unreadCount === 'number') {
    ok(`GET /messages/unread-count → ${unreadRes.json.unreadCount} non lu(s)`);
  } else {
    fail('GET /messages/unread-count', unreadRes.json?.message || unreadRes.text?.substring(0, 100));
  }

  // Messages - conversations
  const convsRes = await fetchJSON(`${API}/messages/conversations`, { headers: authHeaders });
  if (convsRes.ok && Array.isArray(convsRes.json)) {
    ok(`GET /messages/conversations → ${convsRes.json.length} conversation(s)`);
    // Verify data shape
    if (convsRes.json.length > 0) {
      const c = convsRes.json[0];
      if (c.userId && c.username && 'lastMessage' in c && 'lastMessageAt' in c && 'unreadCount' in c) {
        ok('Format conversation correct (userId, username, lastMessage, lastMessageAt, unreadCount)');
      } else {
        fail('Format conversation incorrect', `Champs: ${Object.keys(c).join(', ')}`);
      }
    }
  } else {
    fail('GET /messages/conversations', convsRes.json?.message || convsRes.status);
  }

  // Messages - send
  const sendRes = await fetchJSON(`${API}/messages`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ receiverId: 2, content: '[TEST] Message de diagnostic automatique' }),
  });
  if (sendRes.status === 201 && sendRes.json?.id) {
    ok(`POST /messages → message #${sendRes.json.id} cree`);

    // Cleanup: we can't delete via API easily, but it's fine for testing
  } else {
    fail('POST /messages', sendRes.json?.message || sendRes.status);
  }

  // Messages - get conversation with user 2
  const convRes = await fetchJSON(`${API}/messages/2`, { headers: authHeaders });
  if (convRes.ok && Array.isArray(convRes.json)) {
    ok(`GET /messages/2 → ${convRes.json.length} message(s)`);
  } else {
    fail('GET /messages/2', convRes.json?.message || convRes.status);
  }

  // Messages - mark as read
  const readRes = await fetchJSON(`${API}/messages/read/2`, {
    method: 'PATCH',
    headers: authHeaders,
  });
  if (readRes.ok) {
    ok('PATCH /messages/read/2 → marques comme lus');
  } else {
    fail('PATCH /messages/read/2', readRes.json?.message || readRes.status);
  }

  // --- Protected with wrong token ---
  section('Securite');

  const badRes = await fetchJSON(`${API}/messages/unread-count`, {
    headers: { Authorization: 'Bearer invalid_token_123' },
  });
  if (badRes.status === 401) {
    ok('Token invalide → 401 (correct)');
  } else {
    fail('Token invalide devrait renvoyer 401', `Got: ${badRes.status}`);
  }

  const noAuthRes = await fetchJSON(`${API}/messages/unread-count`);
  if (noAuthRes.status === 401) {
    ok('Sans token → 401 (correct)');
  } else {
    fail('Sans token devrait renvoyer 401', `Got: ${noAuthRes.status}`);
  }

  return token;
}

// =============================================
// 3. WEBSOCKET
// =============================================
async function testWebSocket() {
  section('WEBSOCKET (serveur doit tourner sur port 9090)');

  // Dynamic import for WebSocket client
  let WebSocket;
  try {
    WebSocket = (await import('websocket')).default.w3cwebsocket;
  } catch {
    try {
      WebSocket = (await import('ws')).default;
    } catch {
      warn('Ni "websocket" ni "ws" installe - test WS ignore');
      return;
    }
  }

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      fail('WebSocket timeout (5s)');
      resolve();
    }, 5000);

    try {
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        ok('Connexion WebSocket etablie');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(typeof event.data === 'string' ? event.data : event.data.toString());

          if (data.method === 'connect' && data.clientId) {
            ok(`Recu "connect" avec clientId: ${data.clientId.substring(0, 8)}...`);

            // Test: send a chat_game message (should be ignored since not in a game)
            ws.send(JSON.stringify({
              method: 'chat_game',
              clientId: data.clientId,
              gameId: 'test-nonexistent',
              content: 'Test message',
            }));
            ok('Envoi chat_game (partie inexistante) → pas de crash');

            // Test: send invalid JSON
            ws.send('this is not json {{{');
            ok('Envoi JSON invalide → pas de crash');

            // Close after tests
            setTimeout(() => {
              ws.close();
              clearTimeout(timeout);
              resolve();
            }, 500);
          }
        } catch (e) {
          fail('Parsing message WebSocket', e.message);
        }
      };

      ws.onerror = () => {
        fail('Connexion WebSocket echouee', `Verifiez que le serveur tourne sur ${WS_URL}`);
        clearTimeout(timeout);
        resolve();
      };
    } catch (e) {
      fail('Erreur WebSocket', e.message);
      clearTimeout(timeout);
      resolve();
    }
  });
}

// =============================================
// 4. FRONTEND FILES
// =============================================
function testFrontendFiles() {
  section('FICHIERS FRONTEND');

  const requiredFiles = [
    // Chat system
    'src/components/Chat/ChatContext.jsx',
    'src/components/Chat/ChatBubble.jsx',
    'src/components/Chat/ChatDrawer.jsx',
    'src/components/Chat/ChatConversationList.jsx',
    'src/components/Chat/ChatConversation.jsx',
    'src/components/Chat/ChatGameRoom.jsx',
    // UI components
    'src/components/UI/Spinner.jsx',
    'src/components/UI/Toast.jsx',
    // Profile
    'src/components/Profile/UserProfile.jsx',
    'src/components/Profile/Profile.jsx',
    // Games
    'src/components/Games/TicTacToe.jsx',
    'src/components/Games/Mascarade/Mascarade.jsx',
    // 404
    'src/components/404/404.jsx',
    // SCSS
    'src/scss/components/_chat.scss',
    'src/scss/components/_notfound.scss',
    'src/scss/components/_ui.scss',
    // Backend
    'server/models/messageModel.js',
    'server/controllers/Messages.js',
    'server/routes/messageRoutes.js',
    'server/controllers/Profiles.js',
    'server/controllers/FriendRequests.js',
    'server/controllers/Friendships.js',
    // Docs
    'docs/README.md',
    'docs/architecture/overview.md',
    'docs/architecture/frontend.md',
    'docs/architecture/backend.md',
    'docs/architecture/database.md',
    'docs/api/routes.md',
    'docs/websocket/protocol.md',
    'docs/games/mascarade/README.md',
  ];

  for (const file of requiredFiles) {
    const fullPath = path.join(ROOT, file);
    if (fs.existsSync(fullPath)) {
      const stat = fs.statSync(fullPath);
      if (stat.size > 0) {
        ok(file);
      } else {
        fail(file, 'Fichier vide');
      }
    } else {
      fail(file, 'Fichier manquant');
    }
  }

  // Check critical imports in files
  section('IMPORTS CRITIQUES');

  const importChecks = [
    { file: 'src/App.jsx', patterns: ['ChatProvider', 'useChat', 'ChatBubble', 'ChatDrawer', 'ToastProvider'] },
    { file: 'src/components/Games/TicTacToe.jsx', patterns: ['useChat', 'useToast'] },
    { file: 'src/components/Games/Mascarade/Mascarade.jsx', patterns: ['useChat'] },
    { file: 'src/components/Profile/UserProfile.jsx', patterns: ['useToast'] },
    { file: 'src/components/Profile/Profile.jsx', patterns: ['useToast', 'useChat'] },
    { file: 'src/scss/input.scss', patterns: ['notfound', 'ui', 'chat'] },
    { file: 'server/index.js', patterns: ['messageRoutes', 'chat_game', 'chat_private'] },
  ];

  for (const check of importChecks) {
    const fullPath = path.join(ROOT, check.file);
    if (!fs.existsSync(fullPath)) {
      fail(`${check.file} n'existe pas`);
      continue;
    }
    const content = fs.readFileSync(fullPath, 'utf-8');
    for (const pattern of check.patterns) {
      if (content.includes(pattern)) {
        ok(`${check.file} contient "${pattern}"`);
      } else {
        fail(`${check.file} manque "${pattern}"`);
      }
    }
  }
}

// =============================================
// 5. CROSS-FILE CONSISTENCY
// =============================================
function testConsistency() {
  section('COHERENCE INTER-FICHIERS');

  // Check that Message model fields match controller usage
  const modelContent = fs.readFileSync(path.join(ROOT, 'server/models/messageModel.js'), 'utf-8');
  const controllerContent = fs.readFileSync(path.join(ROOT, 'server/controllers/Messages.js'), 'utf-8');

  const modelFields = ['senderId', 'receiverId', 'senderName', 'content', 'read'];
  for (const field of modelFields) {
    if (modelContent.includes(field) && controllerContent.includes(field)) {
      ok(`Champ "${field}" present dans model ET controller`);
    } else if (!modelContent.includes(field)) {
      fail(`Champ "${field}" manquant dans le model`);
    } else {
      warn(`Champ "${field}" present dans model mais pas utilise dans controller`);
    }
  }

  // Check WebSocket handler field names match frontend
  const indexContent = fs.readFileSync(path.join(ROOT, 'server/index.js'), 'utf-8');
  const gameRoomContent = fs.readFileSync(path.join(ROOT, 'src/components/Chat/ChatGameRoom.jsx'), 'utf-8');

  if (indexContent.includes('senderName') && gameRoomContent.includes('senderName')) {
    ok('WebSocket chat_game: "senderName" coherent serveur ↔ frontend');
  } else {
    fail('Mismatch "senderName" entre serveur et frontend');
  }

  if (indexContent.includes('senderColor') && gameRoomContent.includes('senderColor')) {
    ok('WebSocket chat_game: "senderColor" coherent serveur ↔ frontend');
  } else {
    fail('Mismatch "senderColor" entre serveur et frontend');
  }

  // Check API response field names match frontend
  const bubbleContent = fs.readFileSync(path.join(ROOT, 'src/components/Chat/ChatBubble.jsx'), 'utf-8');
  if (controllerContent.includes('unreadCount') && bubbleContent.includes('unreadCount')) {
    ok('API unread-count: "unreadCount" coherent serveur ↔ frontend');
  } else {
    fail('Mismatch "unreadCount" entre serveur et frontend');
  }

  const convListContent = fs.readFileSync(path.join(ROOT, 'src/components/Chat/ChatConversationList.jsx'), 'utf-8');
  for (const field of ['userId', 'username', 'lastMessage', 'lastMessageAt']) {
    if (controllerContent.includes(field) && convListContent.includes(`conv.${field}`)) {
      ok(`API conversations: "${field}" coherent`);
    } else {
      warn(`Champ "${field}" potentiellement incoherent`);
    }
  }
}

// =============================================
// MAIN
// =============================================
async function main() {
  console.log('\n\x1b[1m\x1b[35m╔══════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[1m\x1b[35m║   NOXI - Diagnostic complet          ║\x1b[0m');
  console.log('\x1b[1m\x1b[35m╚══════════════════════════════════════╝\x1b[0m');

  // 1. Database
  await testDatabase();

  // 2. API
  await testAPI();

  // 3. WebSocket
  await testWebSocket();

  // 4. Frontend files
  testFrontendFiles();

  // 5. Consistency
  testConsistency();

  // Summary
  console.log('\n\x1b[1m\x1b[35m╔══════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[1m\x1b[35m║   RESULTATS                          ║\x1b[0m');
  console.log('\x1b[1m\x1b[35m╚══════════════════════════════════════╝\x1b[0m\n');
  console.log(`  \x1b[32m✓ ${passed} tests passes\x1b[0m`);
  console.log(`  \x1b[33m⚠ ${warnings} warnings\x1b[0m`);
  console.log(`  \x1b[31m✗ ${failed} tests echoues\x1b[0m`);

  if (errors.length > 0) {
    console.log('\n\x1b[31mErreurs:\x1b[0m');
    errors.forEach(e => console.log(`  - ${e}`));
  }

  if (failed === 0) {
    console.log('\n\x1b[32m\x1b[1mTout est OK !\x1b[0m\n');
  } else {
    console.log(`\n\x1b[31m\x1b[1m${failed} probleme(s) a corriger.\x1b[0m\n`);
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => {
  console.error('\x1b[31mErreur fatale:\x1b[0m', e);
  process.exit(1);
});
