import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getDatabase, get, onDisconnect, onValue, ref, remove, serverTimestamp, set, update } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";
import { connectionSettings, firebaseConfig } from "./aletheia-firebase-config.js";

const app = getApps()[0] || initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const roomAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const state = { roomId: "", humanSlots: [], invitations: {}, players: {}, unsubscribe: null, active: false };

function randomText(length, alphabet = roomAlphabet) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, value => alphabet[value % alphabet.length]).join("");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function currentHumanSlots() {
  return [...document.querySelectorAll('[data-controller="human"][data-slot]')]
    .map(card => Number(String(card.dataset.slot).replace("slot-", "")))
    .filter(slot => slot >= 1 && slot <= 3)
    .sort();
}

function controllerUrl(slot) {
  const url = new URL(connectionSettings.controllerPage, window.location.href);
  url.searchParams.set("sala", state.roomId);
  url.searchParams.set("plaza", String(slot));
  url.searchParams.set("invitacion", state.invitations[slot]);
  return url.href;
}

function qrTarget(slot) {
  return document.getElementById(`human-avatar-slot-${slot}`);
}

function renderQr(slot, player = null) {
  const target = qrTarget(slot);
  if (!target || !state.active) return;
  target.classList.add("tv-remote-host");
  target.querySelector(".tv-remote-slot-layer")?.remove();
  const layer = document.createElement("span");
  layer.className = `tv-remote-slot-layer${player?.connected ? " is-connected" : ""}`;
  if (player?.connected) {
    layer.innerHTML = `<b>PLAZA ${slot} CONECTADA</b><strong>${escapeHtml(player.alias || `Invitado ${slot}`)}</strong><small>MANDO PREPARADO</small>`;
  } else {
    layer.innerHTML = `<b>ESCANEA CON EL MÓVIL</b><span class="tv-remote-qr-image" aria-label="Código QR para la plaza ${slot}"></span><small>SALA ${state.roomId} · PLAZA ${slot}</small>`;
  }
  target.append(layer);
  if (!player?.connected) {
    const qrBox = layer.querySelector(".tv-remote-qr-image");
    if (window.QRCode) {
      new window.QRCode(qrBox, { text: controllerUrl(slot), width: 132, height: 132, colorDark: "#02050b", colorLight: "#ffffff", correctLevel: window.QRCode.CorrectLevel.M });
    } else {
      qrBox.classList.add("is-fallback");
      qrBox.textContent = state.roomId;
    }
  }
}

function setSetupMessage(text) {
  const message = document.getElementById("setup-message");
  if (message) message.textContent = text;
}

function updateHostControls(connectedCount = 0) {
  const button = document.getElementById("enable-remotes");
  const start = document.getElementById("start-game");
  document.querySelectorAll("[data-toggle-slot]").forEach(toggle => { toggle.disabled = state.active; });
  if (button) {
    button.textContent = state.active ? "CANCELAR MANDOS" : "USAR MÓVILES COMO MANDO";
    button.classList.toggle("is-active", state.active);
  }
  if (start && state.active) start.disabled = connectedCount !== state.humanSlots.length;
}

function applyRemotePlayer(slot, player) {
  const aliasInput = slot === 1 ? document.getElementById("alias") : document.querySelector(`[data-human-alias="${slot}"]`);
  if (aliasInput && player.alias) {
    aliasInput.value = player.alias;
    aliasInput.dispatchEvent(new Event("input", { bubbles: true }));
  }
  window.dispatchEvent(new CustomEvent("aletheia:remote-player", { detail: { slot, player } }));
}

function observeSlots() {
  state.unsubscribe?.();
  state.unsubscribe = onValue(ref(database, `rooms/${state.roomId}/slots`), snapshot => {
    const players = snapshot.val() || {};
    state.players = players;
    let connected = 0;
    state.humanSlots.forEach(slot => {
      const player = players[slot] || null;
      if (player?.connected) {
        connected += 1;
        applyRemotePlayer(slot, player);
      }
      renderQr(slot, player);
    });
    updateHostControls(connected);
    setSetupMessage(connected === state.humanSlots.length
      ? `Los ${connected} mandos están conectados. Ya puedes comenzar la partida.`
      : `Sala ${state.roomId}: ${connected} de ${state.humanSlots.length} mandos conectados.`);
  }, error => {
    console.error("No se pudo observar la sala", error);
    setSetupMessage("No se pudo leer la sala. Comprueba las reglas de Firebase.");
  });
}

async function authenticatedUser() {
  if (auth.currentUser) return auth.currentUser;
  const credential = await signInAnonymously(auth);
  return credential.user;
}

async function createRoom() {
  const user = await authenticatedUser();
  state.humanSlots = currentHumanSlots();
  if (!state.humanSlots.length) throw new Error("No hay plazas humanas disponibles.");
  let roomId = "";
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = randomText(6);
    if (!(await get(ref(database, `rooms/${candidate}/meta`))).exists()) { roomId = candidate; break; }
  }
  if (!roomId) throw new Error("No se pudo reservar un código de sala.");
  state.roomId = roomId;
  state.invitations = Object.fromEntries(state.humanSlots.map(slot => [slot, randomText(32)]));
  const invitations = Object.fromEntries(state.humanSlots.map(slot => [slot, { token: state.invitations[slot] }]));
  await set(ref(database, `rooms/${roomId}`), {
    meta: { hostUid: user.uid, createdAt: serverTimestamp(), expiresAt: Date.now() + connectionSettings.roomLifetimeMs, status: "waiting" },
    invitations
  });
  state.active = true;
  onDisconnect(ref(database, `rooms/${roomId}/meta/status`)).set("offline");
  state.humanSlots.forEach(slot => renderQr(slot));
  updateHostControls(0);
  observeSlots();
}

async function closeRoom() {
  state.unsubscribe?.();
  state.unsubscribe = null;
  if (state.roomId && auth.currentUser) await remove(ref(database, `rooms/${state.roomId}`)).catch(() => {});
  document.querySelectorAll(".tv-remote-slot-layer").forEach(layer => layer.remove());
  document.querySelectorAll(".tv-remote-host").forEach(target => target.classList.remove("tv-remote-host"));
  state.active = false;
  state.roomId = "";
  state.humanSlots = [];
  state.invitations = {};
  state.players = {};
  updateHostControls();
  const start = document.getElementById("start-game");
  if (start) start.disabled = false;
  setSetupMessage("Modo mando cancelado. Puedes configurar la partida de forma local.");
}

async function toggleHostRoom() {
  const button = document.getElementById("enable-remotes");
  if (button) button.disabled = true;
  try {
    if (state.active) await closeRoom();
    else {
      setSetupMessage("Creando una sala privada para los mandos…");
      await createRoom();
    }
  } catch (error) {
    console.error("Error al preparar los mandos", error);
    setSetupMessage("No se pudo conectar con Firebase. Revisa la conexión y las reglas de la base de datos.");
  } finally {
    if (button) button.disabled = false;
  }
}

function initHost() {
  document.getElementById("enable-remotes")?.addEventListener("click", toggleHostRoom);
  const observer = new MutationObserver(() => {
    if (!state.active) return;
    state.humanSlots.forEach(slot => renderQr(slot, state.players[slot] || null));
    const connected = state.humanSlots.filter(slot => state.players[slot]?.connected).length;
    updateHostControls(connected);
  });
  const preview = document.getElementById("rival-preview");
  if (preview) observer.observe(preview, { childList: true });
  document.getElementById("start-game")?.addEventListener("click", () => {
    if (state.active && state.roomId) update(ref(database, `rooms/${state.roomId}/meta`), { status: "playing" }).catch(() => {});
  });
}

function setRemoteStatus(label, mode = "") {
  const pill = document.getElementById("connection-pill");
  if (!pill) return;
  pill.innerHTML = `<i></i> ${escapeHtml(label)}`;
  pill.dataset.status = mode;
}

function invitationFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return { roomId: (params.get("sala") || "").toUpperCase(), slot: Number(params.get("plaza")), token: params.get("invitacion") || "" };
}

async function connectController(player) {
  const invitation = invitationFromUrl();
  if (!invitation.roomId || ![1, 2, 3].includes(invitation.slot) || invitation.token.length !== 32) throw new Error("Invitación incompleta");
  setRemoteStatus("CONECTANDO…", "pending");
  const user = await authenticatedUser();
  const slotRef = ref(database, `rooms/${invitation.roomId}/slots/${invitation.slot}`);
  const payload = {
    controllerUid: user.uid,
    inviteToken: invitation.token,
    connected: true,
    alias: String(player.alias || "Invitado").trim().slice(0, 18),
    avatarId: String(player.avatarId || "avatar").slice(0, 60),
    avatarName: String(player.avatarName || "Avatar").slice(0, 80),
    avatarImage: String(player.avatarImage || "").slice(0, 120000),
    joinedAt: serverTimestamp(),
    lastSeen: serverTimestamp()
  };
  await set(slotRef, payload);
  onDisconnect(ref(database, `rooms/${invitation.roomId}/slots/${invitation.slot}/connected`)).set(false);
  setRemoteStatus(`PLAZA ${invitation.slot} CONECTADA`, "connected");
  document.querySelectorAll("[data-screen] .screen-heading span").forEach(label => {
    if (label.textContent.includes("PLAZA")) label.textContent = `PLAZA ${invitation.slot} · JUGADOR HUMANO`;
  });
}

function initController() {
  const invitation = invitationFromUrl();
  if (!invitation.roomId) { setRemoteStatus("DEMO LOCAL", "demo"); return; }
  setRemoteStatus(`SALA ${invitation.roomId}`, "pending");
  const demoButton = document.getElementById("demo-start");
  if (demoButton) demoButton.hidden = true;
  window.addEventListener("aletheia:mando-confirm", async event => {
    try {
      await connectController(event.detail || {});
      const notice = document.querySelector(".remote-notice strong");
      if (notice) notice.textContent = "Conectado. Esperando a los demás jugadores…";
    } catch (error) {
      console.error("No se pudo conectar el mando", error);
      setRemoteStatus("ENLACE NO VÁLIDO", "error");
      const notice = document.querySelector(".remote-notice strong");
      if (notice) notice.textContent = "No se pudo ocupar esta plaza. Vuelve a escanear el código del plató.";
    }
  });
}

if (document.getElementById("setup-panel")) initHost();
if (document.getElementById("remote-app")) initController();
