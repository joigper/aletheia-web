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
    $("#selected-avatar-mini").innerHTML=portraitMarkup();
    $("#selected-avatar-label").textContent=selectedAvatar.name;
    $("#selected-avatar-mini img")?.addEventListener("error",event=>{event.currentTarget.replaceWith(Object.assign(document.createElement("span"),{textContent:selectedAvatar.initials}))});
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
      card.addEventListener("click",()=>{if(index!==carouselIndex){carouselIndex=index;renderCarousel()}else if(avatar.selfie)$("#selfie-input").click()});
      track.append(card);
    });
    $("#avatar-name").textContent=current.selfie&&selfieImage?"Selfie preparado":current.name;
    $("#avatar-role").textContent=current.selfie?(selfieImage?"Toca para repetir la fotografía":"Toca la tarjeta para abrir la cámara"):current.role;
    $("#avatar-dots").textContent=`${carouselIndex+1} / ${avatars.length}`;
    renderSelectedMini();
  }
  function moveCarousel(direction){if(!avatars.length)return;carouselIndex=(carouselIndex+direction+avatars.length)%avatars.length;renderCarousel()}
  $("#avatar-prev").addEventListener("click",()=>moveCarousel(-1));
  $("#avatar-next").addEventListener("click",()=>moveCarousel(1));
  $("#carousel-stage").addEventListener("pointerdown",event=>{swipeStartX=event.clientX});
  $("#carousel-stage").addEventListener("pointerup",event=>{if(swipeStartX===null)return;const distance=event.clientX-swipeStartX;swipeStartX=null;if(Math.abs(distance)>35)moveCarousel(distance>0?-1:1)});
  function prepareSelfie(file){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onerror=reject;
      reader.onload=()=>{
        const image=new Image();
        image.onerror=reject;
        image.onload=()=>{
          const size=320,canvas=document.createElement("canvas"),context=canvas.getContext("2d");
          canvas.width=size;canvas.height=size;
          const scale=Math.max(size/image.width,size/image.height);
          const width=image.width*scale,height=image.height*scale;
          context.drawImage(image,(size-width)/2,(size-height)/2,width,height);
          resolve(canvas.toDataURL("image/jpeg",.76));
        };
        image.src=reader.result;
      };
      reader.readAsDataURL(file);
    });
  }
  $("#selfie-input").addEventListener("change",async event=>{
    const file=event.target.files?.[0];if(!file)return;
    try{selfieImage=await prepareSelfie(file);carouselIndex=avatars.findIndex(avatar=>avatar.selfie);renderCarousel()}
    catch(error){console.warn("No se pudo preparar el selfie",error)}
  });
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
    spin:{kicker:"ES TU TURNO",title:"GIRA LA RULETA",copy:"Pulsa cuando estés preparado.",content:'<button class="remote-button remote-spin" type="button" data-action="spin"><span>GIRAR</span><small>RULETA</small></button>'},
    letters:{kicker:"PREMIO: 75 POR COINCIDENCIA",title:"ELIGE CONSONANTE",copy:"Las vocales cuestan 50 créditos.",content:`<div class="letter-grid">${alphabet.map(letter=>`<button type="button" class="${vowels.has(letter)?"vowel":""}" ${vowels.has(letter)?"disabled":""}>${letter}</button>`).join("")}</div>`},
    wait:{kicker:"TURNO DE ROSE WHITMORE",title:"OBSERVA EL PLATÓ",copy:"Tu mando se activará cuando llegue tu turno.",content:'<div class="remote-wait-orb" aria-hidden="true"></div>'},
    speed:{kicker:"PANEL DE VELOCIDAD",title:"¿CONOCES LA SOLUCIÓN?",copy:"La primera pulsación detendrá el panel para todos.",content:'<button class="remote-button remote-danger" type="button" data-action="solve-now"><span>RESOLVER YA</span></button>'},
    solve:{kicker:"HAS DETENIDO EL PANEL",title:"ESCRIBE LA SOLUCIÓN",copy:"Dispones de 10 segundos.",content:'<form class="solve-form"><input class="solve-input" maxlength="80" autocomplete="off" placeholder="Solución completa"><button class="remote-button solve-submit" type="submit">COMPROBAR RESPUESTA</button></form>'}
  };
  function renderScene(name){
    const scene=scenes[name]||scenes.spin;$("#action-kicker").textContent=scene.kicker;$("#action-title").textContent=scene.title;$("#action-copy").textContent=scene.copy;$("#action-content").innerHTML=scene.content;
    $("#action-content [data-action='spin']")?.addEventListener("click",()=>{renderScene("letters")});
    $("#action-content [data-action='solve-now']")?.addEventListener("click",()=>{renderScene("solve");setTimeout(()=>$(".solve-input")?.focus(),50)});
    $("#action-content .solve-form")?.addEventListener("submit",event=>{event.preventDefault();$("#action-kicker").textContent="RESPUESTA ENVIADA";$("#action-title").textContent="ESPERA AL PLATÓ";$("#action-copy").textContent="Prometeo está comprobando la solución.";$("#action-content").innerHTML='<div class="remote-wait-orb" aria-hidden="true"></div>'});
    $$("#action-content .letter-grid button").forEach(button=>button.addEventListener("click",()=>{button.disabled=true;$("#action-kicker").textContent=`LETRA ${button.textContent} ENVIADA`;$("#action-copy").textContent="La pantalla principal mostrará el resultado."}));
  }
  $("#demo-start").addEventListener("click",()=>{showScreen("game");renderScene("spin");startClock()});
  $$("[data-demo]").forEach(button=>button.addEventListener("click",()=>renderScene(button.dataset.demo)));
  $("#pause-demo").addEventListener("click",event=>{event.currentTarget.classList.toggle("is-active");event.currentTarget.querySelector("span").textContent=event.currentTarget.classList.contains("is-active")?"REANUDAR":"PAUSA"});
  $("#sound-demo").addEventListener("click",event=>{event.currentTarget.classList.toggle("is-active");event.currentTarget.querySelector("span").textContent=event.currentTarget.classList.contains("is-active")?"SILENCIO":"SONIDO"});
})();
