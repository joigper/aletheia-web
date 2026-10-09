(function(){
  "use strict";
  if(!document.getElementById("remote-app"))return;
  const $=selector=>document.querySelector(selector);
  const $$=selector=>[...document.querySelectorAll(selector)];
  let selectedAvatar={id:"",name:"Sin seleccionar",initials:"—",image:null};
  let clockTimer=null;
  let carouselIndex=0;
  let selfieImage=null;
  let swipeStartX=null;
  let avatars=[];
  let cameraStream=null;
  let pendingSelfie=null;
  let selfieCaptureActive=false;
  const onlineController=new URLSearchParams(location.search).has("sala");
  let remoteGameState=null;
  let pendingCommand=false;
  let pendingCommandTimer=null;

  async function enterFullscreen(){
    const root=document.documentElement;
    try{if(root.requestFullscreen)await root.requestFullscreen({navigationUI:"hide"});else if(root.webkitRequestFullscreen)root.webkitRequestFullscreen()}catch(error){console.info("El navegador mantiene sus barras",error)}
    $("#remote-fullscreen-entry").hidden=true;updateVisibleHeight();
  }
  $("#open-remote-fullscreen").addEventListener("click",enterFullscreen);

  function updateVisibleHeight(){
    const height=Math.round(window.visualViewport?.height||window.innerHeight);
    document.documentElement.style.setProperty("--remote-visible-height",`${height}px`);
  }
  updateVisibleHeight();
  window.visualViewport?.addEventListener("resize",updateVisibleHeight);
  window.addEventListener("resize",updateVisibleHeight);
  window.addEventListener("orientationchange",()=>setTimeout(updateVisibleHeight,120));

  function thumbnailPath(filename){
    const stem=String(filename||"").replace(/^.*[\\/]/,"").replace(/\.[^.]+$/,"");
    return `assets/img/ocio/personajes/${stem}.webp`;
  }
  function initializeAvatars(){
    const roster=Array.isArray(window.personajes)?window.personajes:[];
    const crew=roster
      .filter(person=>person.retratoDisponible&&person.nombre&&person.imagen&&person.id!=="oscar")
      .map(person=>({
        id:person.id,
        name:`${person.nombre} ${person.apellidos||""}`.trim(),
        shortName:person.nombre,
        role:person.cargo||"Tripulación ALÉTHEIA",
        initials:`${person.nombre?.[0]||""}${person.apellidos?.[0]||""}`.toUpperCase(),
        image:thumbnailPath(person.imagen)
      }));
    avatars=[...(crew.length?crew:[
      {id:"marcus",name:"Marcus Lowe",shortName:"Marcus",role:"Jefe de Seguridad",initials:"ML",image:"assets/img/ocio/personajes/MARCUS.webp"},
      {id:"rose",name:"Rose Whitmore",shortName:"Rose",role:"Primera oficial",initials:"RW",image:"assets/img/ocio/personajes/ROSE.webp"},
      {id:"raha",name:"Raha Nair",shortName:"Raha",role:"Jefa de LAB-01",initials:"RN",image:"assets/img/ocio/personajes/RAHA.webp"}
    ]),{id:"selfie",name:"Tu selfie",shortName:"Selfie",role:"Usar cámara del dispositivo",initials:"TÚ",image:null,selfie:true}];
    carouselIndex=0;
    renderCarousel();
  }

  function showScreen(name){
    $$("[data-screen]").forEach(screen=>{const active=screen.dataset.screen===name;screen.hidden=!active;screen.classList.toggle("is-active",active)});
  }
  function portraitMarkup(){return selectedAvatar.image?`<img src="${selectedAvatar.image}" alt="Avatar seleccionado">`:`<span>${selectedAvatar.initials}</span>`}
  function relativeOffset(index){
    let offset=index-carouselIndex;
    if(offset>avatars.length/2)offset-=avatars.length;
    if(offset<-avatars.length/2)offset+=avatars.length;
    return offset;
  }
  function renderSelectedMini(){
    const mini=$("#selected-avatar-mini"),label=$("#selected-avatar-label");
    if(mini){mini.innerHTML=portraitMarkup();mini.querySelector("img")?.addEventListener("error",event=>{event.currentTarget.replaceWith(Object.assign(document.createElement("span"),{textContent:selectedAvatar.initials}))})}
    if(label)label.textContent=selectedAvatar.name;
  }
  function renderCarousel(){
    const current=avatars[carouselIndex];
    selectedAvatar={id:current.id,name:current.selfie?"Selfie":current.name,initials:current.initials,image:current.selfie?selfieImage:current.image};
    const track=$("#avatar-track");track.innerHTML="";
    avatars.forEach((avatar,index)=>{
      const offset=relativeOffset(index);
      const card=document.createElement("button");
      const positionClass=offset===0?" is-current":offset===-1?" is-left-1":offset===1?" is-right-1":offset===-2?" is-left-2":" is-right-2";
      card.type="button";card.className=`carousel-card${positionClass}${avatar.selfie?" is-selfie":""}`;
      card.style.setProperty("--offset",String(offset));card.hidden=Math.abs(offset)>2;
      card.setAttribute("aria-label",avatar.selfie?"Hacer o elegir selfie":`Elegir a ${avatar.name}`);
      const visual=document.createElement("span");visual.className="carousel-image";
      if((avatar.selfie?selfieImage:avatar.image)){
        const image=document.createElement("img");image.src=avatar.selfie?selfieImage:avatar.image;image.alt="";
        image.addEventListener("error",()=>{visual.innerHTML=`<b>${avatar.initials}</b>`});visual.append(image);
      }else visual.innerHTML=avatar.selfie?'<b class="camera-mark">＋</b>':`<b>${avatar.initials}</b>`;
      const label=document.createElement("span");label.className="carousel-card-label";label.textContent=avatar.selfie?"SELFIE":avatar.shortName;
      card.append(visual,label);
      card.addEventListener("click",()=>{if(index!==carouselIndex){carouselIndex=index;renderCarousel()}else if(avatar.selfie)void openSelfieCamera()});
      track.append(card);
    });
    $("#avatar-name").textContent=current.selfie&&selfieImage?"Selfie preparado":current.name;
    $("#avatar-role").textContent=current.selfie?(selfieImage?"Toca para repetir la fotografía":"Toca la tarjeta para abrir la cámara"):current.role;
    $("#avatar-dots").textContent=`${carouselIndex+1} / ${avatars.length}`;
    renderSelectedMini();
  }
  function moveCarousel(direction){if(!avatars.length)return;if(selfieCaptureActive)cancelSelfieCapture();carouselIndex=(carouselIndex+direction+avatars.length)%avatars.length;renderCarousel()}
  $("#avatar-prev").addEventListener("click",()=>moveCarousel(-1));
  $("#avatar-next").addEventListener("click",()=>moveCarousel(1));
  $("#carousel-stage").addEventListener("pointerdown",event=>{swipeStartX=event.clientX});
  $("#carousel-stage").addEventListener("pointerup",event=>{if(swipeStartX===null)return;const distance=event.clientX-swipeStartX;swipeStartX=null;if(Math.abs(distance)>35)moveCarousel(distance>0?-1:1)});
  function stopSelfieCamera(){cameraStream?.getTracks().forEach(track=>track.stop());cameraStream=null}
  function selfieVisual(){return $("#avatar-track .carousel-card.is-current .carousel-image")}
  function setSelfieButtons(mode){
    $("#selfie-inline-actions").hidden=mode==="closed";
    $("#selfie-capture").hidden=mode!=="live";
    $("#selfie-repeat").hidden=mode!=="captured"&&mode!=="error";
    $("#selfie-use").hidden=mode!=="captured";
  }
  async function requestFrontCamera(){
    const preferred={audio:false,video:{facingMode:{exact:"user"},width:{ideal:1280},height:{ideal:720}}};
    try{return await navigator.mediaDevices.getUserMedia(preferred)}
    catch(error){
      if(error?.name!=="OverconstrainedError"&&error?.name!=="NotFoundError")throw error;
      return navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:"user"}}});
    }
  }
  async function openSelfieCamera(){
    stopSelfieCamera();pendingSelfie=null;selfieCaptureActive=true;setSelfieButtons("live");
    const visual=selfieVisual();if(!visual)return;
    visual.innerHTML='<video class="selfie-inline-preview" autoplay muted playsinline></video><span class="selfie-inline-guide" aria-hidden="true"></span>';
    $("#avatar-name").textContent="Cámara frontal";$("#avatar-role").textContent="Centra tu rostro y pulsa FOTO";
    if(!navigator.mediaDevices?.getUserMedia){visual.innerHTML='<b class="camera-mark">!</b>';$("#avatar-role").textContent="Este navegador no permite utilizar la cámara";setSelfieButtons("error");return}
    try{cameraStream=await requestFrontCamera();const preview=visual.querySelector("video");preview.srcObject=cameraStream;await preview.play()}
    catch(error){console.warn("No se pudo abrir la cámara frontal",error);visual.innerHTML='<b class="camera-mark">!</b>';$("#avatar-role").textContent="Autoriza la cámara y pulsa REPETIR";setSelfieButtons("error")}
  }
  function captureSelfie(){
    const video=selfieVisual()?.querySelector("video");if(!video)return;
    const canvas=document.createElement("canvas"),context=canvas.getContext("2d");canvas.width=320;canvas.height=320;
    if(!video.videoWidth||!video.videoHeight)return;
    const sourceSize=Math.min(video.videoWidth,video.videoHeight),sourceX=(video.videoWidth-sourceSize)/2,sourceY=(video.videoHeight-sourceSize)/2;
    context.save();context.translate(canvas.width,0);context.scale(-1,1);context.drawImage(video,sourceX,sourceY,sourceSize,sourceSize,0,0,canvas.width,canvas.height);context.restore();
    pendingSelfie=canvas.toDataURL("image/jpeg",.76);stopSelfieCamera();selfieVisual().innerHTML=`<img src="${pendingSelfie}" alt="Vista previa del selfie">`;$("#avatar-name").textContent="¿Te gusta?";$("#avatar-role").textContent="Pulsa ACEPTAR o REPETIR";setSelfieButtons("captured");
  }
  function cancelSelfieCapture(render=true){stopSelfieCamera();pendingSelfie=null;selfieCaptureActive=false;setSelfieButtons("closed");if(render)renderCarousel()}
  $("#selfie-capture").addEventListener("click",captureSelfie);
  $("#selfie-cancel").addEventListener("click",()=>cancelSelfieCapture());
  $("#selfie-repeat").addEventListener("click",()=>void openSelfieCamera());
  $("#selfie-use").addEventListener("click",()=>{if(!pendingSelfie)return;selfieImage=pendingSelfie;selfieCaptureActive=false;pendingSelfie=null;setSelfieButtons("closed");renderCarousel()});
  window.addEventListener("pagehide",stopSelfieCamera);
  if(document.readyState==="complete")initializeAvatars();
  else window.addEventListener("load",initializeAvatars,{once:true});
  $("#confirm-player").addEventListener("click",()=>{
    const name=$("#remote-alias").value.trim().slice(0,18)||"Invitado";
    $("#lobby-name").textContent=name;$("#lobby-avatar").textContent=selectedAvatar.name;$("#game-name").textContent=name;$("#lobby-portrait").innerHTML=portraitMarkup();showScreen("lobby");
    window.dispatchEvent(new CustomEvent("aletheia:mando-confirm",{detail:{alias:name,avatarId:selectedAvatar.id,avatarName:selectedAvatar.name,avatarImage:selectedAvatar.image||""}}));
  });
  function startClock(){
    clearInterval(clockTimer);let seconds=25;$("#game-clock").textContent="00:25";
    clockTimer=setInterval(()=>{seconds=seconds<=0?25:seconds-1;$("#game-clock").textContent=`00:${String(seconds).padStart(2,"0")}`},1000);
  }
  const alphabet=[..."ABCDEFGHIJKLMNÑOPQRSTUVWXYZ"];
  const vowels=new Set(["A","E","I","O","U"]);
  const scenes={
    spin:{kicker:"ES TU TURNO",title:"GIRA LA RULETA",copy:"También puedes intentar resolver el panel.",content:'<button class="remote-button remote-spin" type="button" data-action="spin"><span>GIRAR</span><small>RULETA</small></button><button class="remote-button remote-secondary" type="button" data-action="solve-open">RESOLVER PANEL</button>'},
    letters:{kicker:"PREMIO: 75 POR COINCIDENCIA",title:"ELIGE CONSONANTE",copy:"Las vocales cuestan 50 créditos.",content:`<div class="letter-grid">${alphabet.map(letter=>`<button type="button" class="${vowels.has(letter)?"vowel":""}" ${vowels.has(letter)?"disabled":""}>${letter}</button>`).join("")}</div>`},
    wait:{kicker:"TURNO DE OTRO JUGADOR",title:"ESPERA TU TURNO",copy:"Sigue el panel en la pantalla principal.",content:'<div class="active-player-card"><div class="active-player-photo" id="active-player-photo"><span>?</span></div><div class="active-player-data"><small>JUGADOR ACTIVO</small><strong id="active-player-name">OTRO JUGADOR</strong><span id="active-player-role">Concursante</span></div></div>'},
    speed:{kicker:"PANEL DE VELOCIDAD",title:"¿CONOCES LA SOLUCIÓN?",copy:"La primera pulsación detendrá el panel para todos.",content:'<button class="remote-button remote-danger" type="button" data-action="solve-now"><span>RESOLVER YA</span></button>'},
    solve:{kicker:"HAS DETENIDO EL PANEL",title:"ESCRIBE LA SOLUCIÓN",copy:"Dispones de 10 segundos.",content:'<form class="solve-form"><input class="solve-input" maxlength="80" autocomplete="off" placeholder="Solución completa"><button class="remote-button solve-submit" type="submit">COMPROBAR RESPUESTA</button></form>'},
    next:{kicker:"PANEL COMPLETADO",title:"HAS GANADO LA RONDA",copy:"Cuando estés preparado, continúa la partida.",content:'<button class="remote-button remote-primary" type="button" data-action="next">SIGUIENTE RONDA</button>'},
    vowels:{kicker:"NO QUEDAN CONSONANTES",title:"COMPRA UNA VOCAL O RESUELVE",copy:"Cada vocal cuesta 50 créditos.",content:`<div class="letter-grid vowel-only">${[...vowels].map(letter=>`<button type="button" class="vowel">${letter}</button>`).join("")}</div><form class="solve-form"><input class="solve-input" maxlength="80" autocomplete="off" placeholder="Solución completa"><button class="remote-button solve-submit" type="submit">RESOLVER PANEL</button></form>`},
    category:{kicker:"RONDA 2 · TÚ ELIGES",title:"ELIGE CATEGORÍA",copy:"La categoría determinará el siguiente panel.",content:'<div class="remote-choice-grid" id="remote-choice-grid"></div>'},
    question:{kicker:"PREGUNTA DE BONIFICACIÓN",title:"RESPONDE Y GANA 100 CRÉDITOS",copy:"Selecciona una respuesta.",content:'<div class="remote-choice-grid" id="remote-choice-grid"></div>'}
  };
  function renderScene(name){
    const scene=scenes[name]||scenes.spin;$("#action-card").classList.toggle("is-waiting",name==="wait");$("#action-kicker").textContent=scene.kicker;$("#action-title").textContent=scene.title;$("#action-copy").textContent=scene.copy;$("#action-content").innerHTML=scene.content;
    $("#action-content [data-action='spin']")?.addEventListener("click",event=>{if(onlineController){event.currentTarget.disabled=true;event.currentTarget.querySelector("span").textContent="ENVIADO";sendCommand("spin")}else renderScene("letters")});
    $("#action-content [data-action='next']")?.addEventListener("click",event=>{event.currentTarget.disabled=true;sendCommand("next")});
    $("#action-content [data-action='solve-open']")?.addEventListener("click",()=>{renderScene("solve");setTimeout(()=>$(".solve-input")?.focus(),50)});
    $("#action-content [data-action='solve-now']")?.addEventListener("click",event=>{if(onlineController){event.currentTarget.disabled=true;event.currentTarget.querySelector("span").textContent="PULSADO";sendCommand("buzz")}else{renderScene("solve");setTimeout(()=>$(".solve-input")?.focus(),50)}});
    $("#action-content .solve-form")?.addEventListener("submit",event=>{event.preventDefault();const value=event.currentTarget.querySelector("input").value.trim();if(onlineController&&value)sendCommand("solve",value);$("#action-kicker").textContent="RESPUESTA ENVIADA";$("#action-title").textContent="ESPERA AL PLATÓ";$("#action-copy").textContent="Prometeo está comprobando la solución.";$("#action-content").innerHTML='<div class="remote-wait-orb" aria-hidden="true"></div>'});
    $$("#action-content .letter-grid button").forEach(button=>button.addEventListener("click",()=>{$$("#action-content .letter-grid button").forEach(item=>item.disabled=true);if(onlineController)sendCommand("letter",button.textContent);$("#action-kicker").textContent=`LETRA ${button.textContent} ENVIADA`;$("#action-copy").textContent="Esperando confirmación del plató…"}));
  }
  function renderWaitingPlayer(detail,title="ESPERA TU TURNO"){
    const titleNode=$("#action-title");
    titleNode.setAttribute("aria-label",title);
    titleNode.innerHTML=[...title].map((letter,index)=>letter===" "?' <span class="wait-letter-space" aria-hidden="true"> </span>':`<span class="wait-letter" style="--i:${index}" aria-hidden="true">${letter}</span>`).join("");
    const name=String(detail.activeName||"OTRO JUGADOR").toUpperCase();
    $("#active-player-name").textContent=name;
    $("#active-player-role").textContent=detail.activeRole||"Concursante";
    const photo=$("#active-player-photo");
    if(detail.activeImage){photo.innerHTML='<img alt="">';photo.querySelector("img").src=detail.activeImage}
    else photo.innerHTML=`<span>${name.split(/\s+/).slice(0,2).map(part=>part[0]||"").join("")}</span>`;
  }
  function sendCommand(type,value=""){
    if(pendingCommand)return;
    pendingCommand=true;clearTimeout(pendingCommandTimer);
    pendingCommandTimer=setTimeout(()=>{pendingCommand=false;if(remoteGameState){renderRemoteGame(remoteGameState);$("#action-copy").textContent="No llegó la confirmación. Puedes intentarlo de nuevo."}},4500);
    window.dispatchEvent(new CustomEvent("aletheia:mando-command",{detail:{type,value}}));
  }
  function renderRemoteGame(detail){
    remoteGameState=detail;pendingCommand=false;clearTimeout(pendingCommandTimer);showScreen("game");clearInterval(clockTimer);
    $("#game-name").textContent=detail.player?.name||$("#lobby-name").textContent;
    $("#round-score").textContent=detail.player?.round??0;$("#total-score").textContent=detail.player?.total??0;
    $("#game-clock").hidden=!detail.timed;$("#game-clock").textContent=detail.clock||"00:00";
    if(detail.timed&&!detail.paused){let remaining=Number(detail.remainingMs||0);const paint=()=>{const seconds=Math.max(0,Math.ceil(remaining/1000));$("#game-clock").textContent=`${String(Math.floor(seconds/60)).padStart(2,"0")}:${String(seconds%60).padStart(2,"0")}`;remaining=Math.max(0,remaining-1000)};paint();clockTimer=setInterval(paint,1000)}
    const mine=Number(detail.slot)===Number(detail.activeSlot);
    if(detail.paused){renderScene("wait");$("#action-kicker").textContent="PARTIDA EN PAUSA";$("#action-title").textContent="EL PLATÓ ESTÁ DETENIDO";$("#action-copy").textContent="Cualquier jugador puede reanudar la partida."}
    else if(detail.phase==="SPEED_RUNNING"&&!detail.speedReady){renderScene("wait");$("#action-kicker").textContent="PANEL DE VELOCIDAD";$("#action-title").textContent="PREPÁRATE";$("#action-copy").textContent="El pulsador se activará para todos los jugadores."}
    else if(detail.phase==="SPEED_RUNNING"){renderScene("speed");$("#action-copy").textContent="Pulsa en cuanto conozcas la solución."}
    else if(["ROUND_COMPLETE","FINAL_READY"].includes(detail.phase)&&(Number(detail.roundWinnerSlot)===Number(detail.slot)||detail.players?.[String(detail.roundWinnerSlot)]?.cpu)){renderScene("next");$("#action-content [data-action='next']").textContent=detail.phase==="FINAL_READY"?"JUGAR RULETA FINAL":"SIGUIENTE RONDA"}
    else if(!mine){renderScene("wait");$("#action-kicker").textContent=`TURNO DE ${String(detail.activeName||"OTRO JUGADOR").toUpperCase()}`;$("#action-copy").textContent="Sigue el panel en la pantalla principal.";renderWaitingPlayer(detail)}
    else if(Number(detail.interactionLockedMs||0)>0){renderScene("wait");$("#action-kicker").textContent="JUGADA EN CURSO";$("#action-title").textContent="ESPERA A LA RULETA";$("#action-copy").textContent="Tu control se activará al terminar la animación del plató."}
    else if(detail.phase==="AWAITING_SPIN"&&!detail.consonantsRemain){renderScene("vowels");const available=new Set(detail.availableLetters||[]);$$("#action-content .vowel-only button").forEach(button=>button.disabled=!detail.canBuyVowel||!available.has(button.textContent))}
    else if(detail.phase==="AWAITING_SPIN")renderScene("spin");
    else if(["AWAITING_LETTER","SPECIAL_LETTER","FINAL_PICK"].includes(detail.phase)){renderScene("letters");$("#action-kicker").textContent=detail.pending?`PREMIO: ${detail.pending} POR COINCIDENCIA`:$("#action-kicker").textContent;const available=new Set(detail.availableLetters||[]);$$("#action-content .letter-grid button").forEach(button=>button.disabled=!available.has(button.textContent))}
    else if(detail.phase==="CATEGORY_CHOICE"){renderScene("category");$("#remote-choice-grid").innerHTML=(detail.categoryChoices||[]).map(category=>`<button class="remote-button remote-secondary" type="button" data-category="${String(category).replace(/&/g,"&amp;").replace(/\"/g,"&quot;")}">${category}</button>`).join("");$$("#action-content [data-category]").forEach(button=>button.addEventListener("click",()=>{$$("#action-content [data-category]").forEach(item=>item.disabled=true);sendCommand("category",button.dataset.category)}))}
    else if(detail.phase==="CATEGORY_RESULT"){renderScene("wait");$("#action-title").textContent=detail.selectedCategory||"CATEGORÍA ELEGIDA";$("#action-copy").textContent="El plató está preparando el panel."}
    else if(detail.phase==="QUESTION_BONUS"&&Number(detail.roundWinnerSlot)===Number(detail.slot)){renderScene("question");$("#action-copy").textContent=detail.question?.text||"Selecciona una respuesta.";$("#remote-choice-grid").innerHTML=(detail.question?.options||[]).map((option,index)=>`<button class="remote-button remote-secondary" type="button" data-question="${index}">${option}</button>`).join("");$$("#action-content [data-question]").forEach(button=>button.addEventListener("click",()=>{$$("#action-content [data-question]").forEach(item=>item.disabled=true);sendCommand("question",button.dataset.question)}))}
    else if(["QUESTION_SELECTION","QUESTION_RESULT"].includes(detail.phase)){renderScene("wait");$("#action-title").textContent=detail.phase==="QUESTION_RESULT"?(detail.question?.wasCorrect?"RESPUESTA CORRECTA":"RESPUESTA INCORRECTA"):"RESPUESTA REGISTRADA";$("#action-copy").textContent="Consulta el resultado en el plató."}
    else if(["ROUND_COMPLETE","FINAL_READY","GAME_COMPLETE","CATEGORY_CHOICE","CATEGORY_RESULT","QUESTION_BONUS","QUESTION_SELECTION","QUESTION_RESULT"].includes(detail.phase)){renderScene("wait");$("#action-kicker").textContent="EL PLATÓ PREPARA EL SIGUIENTE PASO";$("#action-title").textContent=detail.phase==="GAME_COMPLETE"?"PARTIDA TERMINADA":"ESPERA UN MOMENTO";$("#action-copy").textContent=detail.message||"La pantalla principal indicará cómo continuar."}
    else renderScene("solve");
    const pause=$("#pause-demo");pause.classList.toggle("is-active",Boolean(detail.paused));pause.querySelector("span").textContent=detail.paused?"REANUDAR":"PAUSA";
  }
  $("#demo-start").addEventListener("click",()=>{showScreen("game");renderScene("spin");startClock()});
  window.addEventListener("aletheia:mando-room-state",event=>{
    const status=event.detail?.status;
    if(status==="playing"){showScreen("game");if(!onlineController){renderScene("spin");startClock()}}
    else if(status==="restarting"){clearInterval(clockTimer);showScreen("lobby");$(".remote-notice strong").textContent="Revancha solicitada. El plató está preparando una nueva partida…";$("#controller-start").hidden=true}
    else if(status==="closed"){clearInterval(clockTimer);showScreen("lobby");$("#lobby-title").textContent="SALA CERRADA";$(".remote-notice strong").textContent="La partida ha sido cancelada desde el plató. Para volver a jugar necesitarás un nuevo código QR.";$("#controller-start").hidden=true;$("#demo-start").hidden=true}
    else if(status==="finished"){clearInterval(clockTimer);showScreen("lobby");$(".remote-notice strong").textContent="La partida ha terminado. Consulta el resultado en el plató."}
    else if(status==="offline"){clearInterval(clockTimer);showScreen("lobby");$(".remote-notice strong").textContent="El plató se ha desconectado."}
  });
  $$("[data-demo]").forEach(button=>button.addEventListener("click",()=>renderScene(button.dataset.demo)));
  window.addEventListener("aletheia:mando-game-state",event=>renderRemoteGame(event.detail||{}));
  window.addEventListener("aletheia:mando-ack",event=>{const ack=event.detail||{};pendingCommand=false;clearTimeout(pendingCommandTimer);if(!ack.accepted&&remoteGameState)renderRemoteGame(remoteGameState);$("#action-copy").textContent=ack.message|| (ack.accepted?"Orden aceptada.":"Orden rechazada por el plató.")});
  $("#pause-demo").addEventListener("click",event=>{if(onlineController){sendCommand(remoteGameState?.paused?"resume":"pause");return}event.currentTarget.classList.toggle("is-active");event.currentTarget.querySelector("span").textContent=event.currentTarget.classList.contains("is-active")?"REANUDAR":"PAUSA"});
  $("#sound-demo").addEventListener("click",event=>{event.currentTarget.classList.toggle("is-active");event.currentTarget.querySelector("span").textContent=event.currentTarget.classList.contains("is-active")?"SILENCIO":"SONIDO"});
})();
