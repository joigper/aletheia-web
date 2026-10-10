(function () {
"use strict";

async function initializeAletheiaConnection() {
const pageIsHost = Boolean(document.getElementById("setup-panel"));
const pageIsController = Boolean(document.getElementById("remote-app"));
if (!pageIsHost && !pageIsController) return;

const settings = window.AletheiaFirebaseConfig;
if (!settings) throw new Error("No se ha cargado aletheia-firebase-config.js.");

const [firebaseAppModule, firebaseAuthModule, firebaseDatabaseModule] = await Promise.all([
  import("https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js"),
  import("https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js"),
  import("https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js")
]);
const { initializeApp, getApps } = firebaseAppModule;
const { getAuth, signInAnonymously } = firebaseAuthModule;
const { getDatabase, onDisconnect, onValue, ref, remove, serverTimestamp, set, update } = firebaseDatabaseModule;
const { connectionSettings, firebaseConfig } = settings;

const app = getApps()[0] || initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const roomAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const state = { roomId: "", humanSlots: [], invitations: {}, players: {}, unsubscribe: null, unsubscribeStatus: null, unsubscribeCommands: null, disconnectStatus: null, heartbeatWatch: null, active: false, selectionBusy: Boolean(window.AletheiaTVSetupState?.selectionBusy), syncingSlots: false, commandSeq: {}, publishQueue: Promise.resolve(), publishedRevision: 0 };
const controllerState = { invitation: null, expectedSlots: [], players: {}, unsubscribeMeta: null, unsubscribeSlots: null, unsubscribeGame: null, unsubscribeAck: null, starting: false, heartbeat: null, commandSeq: 0, serverOffset: 0, gameRevision: 0, closed: false };

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
      new window.QRCode(qrBox, { text: controllerUrl(slot), width: 320, height: 320, colorDark: "#000000", colorLight: "#ffffff", correctLevel: window.QRCode.CorrectLevel.M });
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
  document.querySelectorAll("[data-toggle-slot]").forEach(toggle => { toggle.disabled = state.selectionBusy || state.syncingSlots; });
  if (button) {
    button.textContent = state.active ? "CANCELAR MANDOS" : state.selectionBusy ? "SELECCIONANDO TRIPULACIÓN…" : "USAR MÓVILES COMO MANDO";
    button.classList.toggle("is-active", state.active);
    button.disabled = state.selectionBusy || state.syncingSlots;
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
    if (document.getElementById("game-panel") && !document.getElementById("game-panel").hidden) {
      const missing = state.humanSlots.find(slot => !players[slot]?.connected || Date.now() - Number(players[slot]?.lastSeen || 0) > 35000);
      if (missing) window.dispatchEvent(new CustomEvent("aletheia:remote-presence", { detail: { slot: missing, connected: false } }));
    }
    setSetupMessage(connected === state.humanSlots.length
      ? `Los ${connected} mandos están conectados. Ya puedes comenzar o seguir cambiando las plazas HUMANO/CPU.`
      : `Sala ${state.roomId}: ${connected} de ${state.humanSlots.length} mandos conectados. Puedes seguir cambiando las plazas HUMANO/CPU.`);
  }, error => {
    console.error("No se pudo observar la sala", error);
    setSetupMessage("No se pudo leer la sala. Comprueba las reglas de Firebase.");
  });
}

function observeCommands() {
  state.unsubscribeCommands?.();
  state.unsubscribeCommands = onValue(ref(database, `rooms/${state.roomId}/commands`), snapshot => {
    const commands = snapshot.val() || {};
    Object.entries(commands).forEach(([slotText, command]) => {
      const slot = Number(slotText), seq = Number(command?.seq || 0);
      if (!seq || seq <= Number(state.commandSeq[slot] || 0)) return;
      state.commandSeq[slot] = seq;
      window.dispatchEvent(new CustomEvent("aletheia:remote-command", { detail: { slot, seq, type: command.type, value: command.value || "" } }));
    });
  });
}

async function publishGameState(publicState) {
  if (!state.active || !state.roomId || !publicState) return;
  const revision = Number(publicState.revision || 0);
  state.publishQueue = state.publishQueue.then(async () => {
    if (!state.active || revision <= state.publishedRevision) return;
    await set(ref(database, `rooms/${state.roomId}/game`), { ...publicState, publishedAt: serverTimestamp() });
    state.publishedRevision = revision;
  }).catch(error => console.error("No se pudo sincronizar la partida", error));
  await state.publishQueue;
}

async function reconcileHumanSlots() {
  if (!state.active || state.syncingSlots) return;
  const nextSlots = currentHumanSlots();
  const previousKey = state.humanSlots.join("");
  const nextKey = nextSlots.join("");
  if (previousKey === nextKey) return;
  state.syncingSlots = true;
  updateHostControls(state.humanSlots.filter(slot => state.players[slot]?.connected).length);
  setSetupMessage("Actualizando las plazas y preparando sus códigos QR…");
  try {
    const removed = state.humanSlots.filter(slot => !nextSlots.includes(slot));
    const added = nextSlots.filter(slot => !state.humanSlots.includes(slot));
    const changes = { "meta/humanSlots": nextKey };
    removed.forEach(slot => {
      changes[`invitations/${slot}`] = null;
      changes[`slots/${slot}`] = null;
      delete state.invitations[slot];
      delete state.players[slot];
    });
    added.forEach(slot => {
      const token = randomText(32);
      state.invitations[slot] = token;
      changes[`invitations/${slot}`] = { token };
    });
    await update(ref(database, `rooms/${state.roomId}`), changes);
    state.humanSlots = nextSlots;
    document.querySelectorAll(".tv-remote-slot-layer").forEach(layer => layer.remove());
    document.querySelectorAll(".tv-remote-host").forEach(target => target.classList.remove("tv-remote-host"));
    state.humanSlots.forEach(slot => renderQr(slot, state.players[slot] || null));
    const connected = state.humanSlots.filter(slot => state.players[slot]?.connected).length;
    setSetupMessage(`Sala ${state.roomId}: ${connected} de ${state.humanSlots.length} mandos conectados. Puedes seguir cambiando las plazas HUMANO/CPU.`);
  } catch (error) {
    console.error("No se pudieron actualizar las plazas", error);
    setSetupMessage("No se pudieron actualizar las plazas. Vuelve a intentarlo.");
  } finally {
    state.syncingSlots = false;
    updateHostControls(state.humanSlots.filter(slot => state.players[slot]?.connected).length);
  }
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
  const roomId = randomText(6);
  const invitationTokens = Object.fromEntries(state.humanSlots.map(slot => [slot, randomText(32)]));
  const invitations = Object.fromEntries(state.humanSlots.map(slot => [slot, { token: invitationTokens[slot] }]));
  await set(ref(database, `rooms/${roomId}`), {
    meta: { hostUid: user.uid, createdAt: serverTimestamp(), status: "waiting", humanSlots: state.humanSlots.join("") },
    invitations
  });
  state.roomId = roomId;
  state.invitations = invitationTokens;
  state.active = true;
  if (window.AletheiaPlayMode) window.AletheiaPlayMode.remoteActive = true;
  state.disconnectStatus = onDisconnect(ref(database, `rooms/${state.roomId}/meta/status`));
  state.disconnectStatus.set("offline");
  state.humanSlots.forEach(slot => renderQr(slot));
  updateHostControls(0);
  observeSlots();
  observeCommands();
  state.unsubscribeStatus?.();
  state.unsubscribeStatus = onValue(ref(database, `rooms/${state.roomId}/meta/status`), snapshot => {
    if (snapshot.val() === "playing" && !document.getElementById("setup-panel")?.hidden) document.getElementById("start-game")?.click();
  });
}

async function closeRoom() {
  state.unsubscribe?.();
  state.unsubscribe = null;
  state.unsubscribeStatus?.();
  state.unsubscribeStatus = null;
  state.unsubscribeCommands?.(); state.unsubscribeCommands = null;
  await state.disconnectStatus?.cancel().catch(() => {}); state.disconnectStatus = null;
  if (state.roomId && auth.currentUser) await remove(ref(database, `rooms/${state.roomId}`)).catch(() => {});
  document.querySelectorAll(".tv-remote-slot-layer").forEach(layer => layer.remove());
  document.querySelectorAll(".tv-remote-host").forEach(target => target.classList.remove("tv-remote-host"));
  state.active = false;
  if (window.AletheiaPlayMode) window.AletheiaPlayMode.remoteActive = false;
  state.roomId = "";
  state.humanSlots = [];
  state.invitations = {};
  state.players = {};
  state.publishedRevision = 0;
  updateHostControls();
  const start = document.getElementById("start-game");
  if (start) start.disabled = false;
  setSetupMessage("Modo mando cancelado. Puedes configurar la partida de forma local.");
}

async function toggleHostRoom() {
  if (state.selectionBusy) return;
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
  if (window.AletheiaPlayMode?.phoneStandalone) {
    const button = document.getElementById("enable-remotes");
    if (button) button.hidden = true;
    return;
  }
  document.getElementById("enable-remotes")?.addEventListener("click", toggleHostRoom);
  let reconcileQueued = false;
  const observer = new MutationObserver(() => {
    if (!state.active || reconcileQueued) return;
    const nextKey = currentHumanSlots().join("");
    if (nextKey === state.humanSlots.join("")) return;
    reconcileQueued = true;
    queueMicrotask(() => { reconcileQueued = false; void reconcileHumanSlots(); });
  });
  const preview = document.getElementById("rival-preview");
  if (preview) observer.observe(preview, { childList: true });
  document.getElementById("start-game")?.addEventListener("click", () => {
    if (state.active && state.roomId) update(ref(database, `rooms/${state.roomId}/meta`), { status: "playing" }).catch(() => {});
  });
  window.addEventListener("aletheia:game-state", event => { void publishGameState(event.detail); });
  window.addEventListener("aletheia:remote-ack", event => {
    const ack = event.detail || {};
    if (!state.active || !state.roomId || ![1, 2, 3].includes(Number(ack.slot))) return;
    set(ref(database, `rooms/${state.roomId}/acks/${ack.slot}`), { seq: Number(ack.seq || 0), accepted: Boolean(ack.accepted), message: String(ack.message || "").slice(0, 180), createdAt: serverTimestamp() }).catch(error => console.error("No se pudo confirmar la orden", error));
  });
  window.addEventListener("aletheia:session-restart", async () => {
    if (!state.active || !state.roomId) { window.dispatchEvent(new CustomEvent("aletheia:session-restart-ready")); return; }
    try {
      state.commandSeq = {}; state.publishedRevision = 0; state.publishQueue = Promise.resolve();
      await update(ref(database, `rooms/${state.roomId}`), { "meta/status": "restarting", game: null, commands: null, acks: null });
      window.dispatchEvent(new CustomEvent("aletheia:session-restart-ready"));
    } catch (error) { console.error("No se pudo preparar la revancha", error); }
  });
  window.addEventListener("aletheia:session-playing", () => {
    if (state.active && state.roomId) update(ref(database, `rooms/${state.roomId}/meta`), { status: "playing" }).catch(error => console.error("No se pudo reanudar la sala", error));
  });
  window.addEventListener("aletheia:session-close", async () => {
    if (!state.active || !state.roomId) { window.dispatchEvent(new CustomEvent("aletheia:session-closed-host")); return; }
    try {
      const closedRoomId = state.roomId;
      await update(ref(database, `rooms/${closedRoomId}/meta`), { status: "closed" });
      await state.disconnectStatus?.cancel().catch(() => {}); state.disconnectStatus = null;
      window.dispatchEvent(new CustomEvent("aletheia:session-closed-host"));
      state.unsubscribe?.(); state.unsubscribe = null; state.unsubscribeStatus?.(); state.unsubscribeStatus = null; state.unsubscribeCommands?.(); state.unsubscribeCommands = null;
      document.querySelectorAll(".tv-remote-slot-layer").forEach(layer => layer.remove());
      document.querySelectorAll(".tv-remote-host").forEach(target => target.classList.remove("tv-remote-host"));
      state.active = false; state.roomId = ""; state.humanSlots = []; state.invitations = {}; state.players = {};
      if (window.AletheiaPlayMode) window.AletheiaPlayMode.remoteActive = false;
      updateHostControls();
      setTimeout(() => remove(ref(database, `rooms/${closedRoomId}`)).catch(() => {}), 5000);
    } catch (error) { console.error("No se pudo cerrar la sala", error); }
  });
  window.addEventListener("aletheia:setup-selection", event => {
    state.selectionBusy = Boolean(event.detail?.busy);
    updateHostControls(state.humanSlots.filter(slot => state.players[slot]?.connected).length);
    if (state.selectionBusy && !state.active) setSetupMessage("Primero estoy terminando de seleccionar la tripulación. Después podrás configurar las plazas y activar los mandos.");
  });
  updateHostControls(0);
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

function updateControllerLobby() {
  const invitation = controllerState.invitation;
  if (!invitation) return;
  const expected = controllerState.expectedSlots;
  const connected = expected.filter(slot => controllerState.players[slot]?.connected).length;
  const ready = expected.length > 0 && connected === expected.length;
  const notice = document.querySelector(".remote-notice strong");
  const start = document.getElementById("controller-start");
  if (invitation.slot === 1) {
    if (notice) notice.textContent = ready ? `${connected} de ${expected.length} jugadores preparados. Puedes comenzar.` : `Esperando jugadores: ${connected} de ${expected.length} conectados.`;
    if (start) { start.hidden = !ready; start.disabled = controllerState.starting; }
  } else {
    if (notice) notice.textContent = ready ? "Todos preparados. Esperando a que la plaza 1 comience…" : `Esperando jugadores: ${connected} de ${expected.length} conectados.`;
    if (start) start.hidden = true;
  }
}

function observeControllerRoom() {
  const invitation = controllerState.invitation;
  if (!invitation) return;
  controllerState.unsubscribeMeta?.();
  controllerState.unsubscribeSlots?.();
  controllerState.unsubscribeGame?.();
  controllerState.unsubscribeAck?.();
  controllerState.unsubscribeMeta = onValue(ref(database, `rooms/${invitation.roomId}/meta`), snapshot => {
    const meta = snapshot.val();
    if (!meta) {
      if (controllerState.closed) return;
      setRemoteStatus("SALA CERRADA", "error");
      window.dispatchEvent(new CustomEvent("aletheia:mando-room-state", { detail: { status: "offline" } }));
      return;
    }
    controllerState.expectedSlots = String(meta.humanSlots || "1").split("").map(Number).filter(slot => [1, 2, 3].includes(slot));
    updateControllerLobby();
    if (meta.status === "closed") {
      controllerState.closed = true;
      clearInterval(controllerState.heartbeat); controllerState.heartbeat = null;
      controllerState.unsubscribeGame?.(); controllerState.unsubscribeGame = null;
      controllerState.unsubscribeAck?.(); controllerState.unsubscribeAck = null;
    }
    window.dispatchEvent(new CustomEvent("aletheia:mando-room-state", { detail: { status: meta.status } }));
  }, error => {
    console.error("No se pudo leer el estado del plató", error);
    setRemoteStatus("SIN SINCRONIZACIÓN", "error");
  });
  controllerState.unsubscribeSlots = onValue(ref(database, `rooms/${invitation.roomId}/slots`), snapshot => {
    controllerState.players = snapshot.val() || {};
    updateControllerLobby();
  }, error => console.error("No se pudo leer el estado de los jugadores", error));
  controllerState.unsubscribeGame = onValue(ref(database, `rooms/${invitation.roomId}/game`), snapshot => {
    const game = snapshot.val(); if (!game) return;
    const revision = Number(game.revision || 0);
    if (revision && revision < controllerState.gameRevision) return;
    controllerState.gameRevision = revision;
    const playerCollection = game.players || {};
    const player = playerCollection[String(invitation.slot)] || Object.values(playerCollection).find(item => Number(item?.slot) === invitation.slot) || null;
    const elapsed = Math.max(0, Date.now() + controllerState.serverOffset - Number(game.publishedAt || 0));
    const remaining = Math.max(0, Number(game.remainingMs || 0) - elapsed);
    const seconds = Math.ceil(remaining / 1000);
    window.dispatchEvent(new CustomEvent("aletheia:mando-game-state", { detail: { ...game, slot: invitation.slot, player, clock: `${String(Math.floor(seconds / 60)).padStart(2,"0")}:${String(seconds % 60).padStart(2,"0")}` } }));
  }, error => console.error("No se pudo leer la partida", error));
  controllerState.unsubscribeAck = onValue(ref(database, `rooms/${invitation.roomId}/acks/${invitation.slot}`), snapshot => {
    const ack = snapshot.val(); if (!ack) return;
    window.dispatchEvent(new CustomEvent("aletheia:mando-ack", { detail: ack }));
  }, error => console.error("No se pudo leer la confirmación", error));
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
  controllerState.invitation = invitation;
  onValue(ref(database, ".info/serverTimeOffset"), snapshot => { controllerState.serverOffset = Number(snapshot.val() || 0); }, { onlyOnce: true });
  clearInterval(controllerState.heartbeat);
  controllerState.heartbeat = setInterval(() => update(slotRef, { connected: true, lastSeen: serverTimestamp() }).catch(() => {}), 10000);
  observeControllerRoom();
}

async function sendControllerCommand(command) {
  const invitation = controllerState.invitation;
  if (!invitation || !auth.currentUser) return;
  controllerState.commandSeq = Math.max(Date.now(), controllerState.commandSeq + 1);
  await set(ref(database, `rooms/${invitation.roomId}/commands/${invitation.slot}`), {
    controllerUid: auth.currentUser.uid,
    seq: controllerState.commandSeq,
    type: String(command.type || "").slice(0, 20),
    value: String(command.value || "").slice(0, 100),
    createdAt: serverTimestamp()
  }).catch(error => console.error("No se pudo enviar la orden", error));
}

function initController() {
  const invitation = invitationFromUrl();
  if (!invitation.roomId) { setRemoteStatus("DEMO LOCAL", "demo"); return; }
  setRemoteStatus("ENLACE PREPARADO", "pending");
  const demoButton = document.getElementById("demo-start");
  if (demoButton) demoButton.hidden = true;
  document.getElementById("controller-start")?.addEventListener("click", async event => {
    const invitation = controllerState.invitation;
    if (!invitation || invitation.slot !== 1 || controllerState.starting) return;
    controllerState.starting = true;
    event.currentTarget.disabled = true;
    event.currentTarget.textContent = "INICIANDO…";
    try {
      await set(ref(database, `rooms/${invitation.roomId}/meta/status`), "playing");
    } catch (error) {
      console.error("No se pudo iniciar la partida desde el mando", error);
      controllerState.starting = false;
      event.currentTarget.disabled = false;
      event.currentTarget.textContent = "COMENZAR PARTIDA";
      const notice = document.querySelector(".remote-notice strong");
      if (notice) notice.textContent = "No se pudo iniciar. Inténtalo de nuevo o utiliza el botón del plató.";
    }
  });
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
  window.addEventListener("aletheia:mando-command", event => { void sendControllerCommand(event.detail || {}); });
}

if (pageIsHost) initHost();
if (pageIsController) initController();
}

function reportConnectionError(error) {
  console.error("No se pudo iniciar la conexión de ALÉTHEIA-TV", error);
  const message = document.getElementById("setup-message");
  if (message) message.textContent = "No se pudo cargar la conexión de los mandos. Comprueba que todos los archivos estén publicados.";
  const pill = document.getElementById("connection-pill");
  if (pill) {
    pill.innerHTML = "<i></i> SIN CONEXIÓN";
    pill.dataset.status = "error";
  }
}

function startConnection() {
  if (window.__aletheiaConnectionStarted) return;
  window.__aletheiaConnectionStarted = true;
  initializeAletheiaConnection().catch(reportConnectionError);
}

if (document.readyState === "complete") setTimeout(startConnection, 0);
else window.addEventListener("load", startConnection, { once: true });
})();
