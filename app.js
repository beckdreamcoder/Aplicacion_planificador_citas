'use strict';
const $ = id => document.getElementById(id);
let selectedPlan='Un cafecito', escapes=0;
const sections=['intro','planner','result'];
function show(id){sections.forEach(s=>$(s).classList.toggle('hidden',s!==id));window.scrollTo({top:0,behavior:'smooth'});}
const no=$('no'), area=$('playground');
function dodge(e){
 if(e.cancelable)e.preventDefault();
 const a=area.getBoundingClientRect(), b=no.getBoundingClientRect();
 const point=e.touches?.[0] || e;
 const px=Number.isFinite(point.clientX)?point.clientX-a.left:b.left-a.left+b.width/2;
 const py=Number.isFinite(point.clientY)?point.clientY-a.top:b.top-a.top+b.height/2;
 const positions=[{x:0,y:0},{x:Math.max(0,a.width-b.width),y:0},{x:0,y:Math.max(0,a.height-b.height)},{x:Math.max(0,a.width-b.width),y:Math.max(0,a.height-b.height)}];
 positions.sort((p,q)=>Math.hypot(q.x+b.width/2-px,q.y+b.height/2-py)-Math.hypot(p.x+b.width/2-px,p.y+b.height/2-py));
 no.classList.add('moving'); no.style.left=positions[0].x+'px';no.style.top=positions[0].y+'px';
 escapes++;$('hint').textContent=['Uy, se escapó 🙈','Este botón vino con patitas…','¡No se deja atrapar! ✨','Creo que quiere jugar a las escondidas ♡'][((escapes-1)%4)];
}
no.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')dodge(e);});
no.addEventListener('pointerdown',dodge,{passive:false});
no.addEventListener('touchstart',e=>{if(!window.PointerEvent)dodge(e);else if(e.cancelable)e.preventDefault();},{passive:false});
no.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();dodge(e);},true);
no.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();dodge(e);}});
area.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const b=no.getBoundingClientRect();if(e.clientX>b.left-14&&e.clientX<b.right+14&&e.clientY>b.top-14&&e.clientY<b.bottom+14)dodge(e);});
window.addEventListener('resize',()=>{no.classList.remove('moving');no.style.left='';no.style.top='';});
function celebrate(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const host=$('confetti');host.replaceChildren();for(let i=0;i<25;i++){const el=document.createElement('span');el.className='confetto';el.textContent=i%3?'♡':'✧';el.style.left=Math.random()*100+'%';el.style.animationDelay=Math.random()*.7+'s';el.style.fontSize=12+Math.random()*18+'px';host.append(el);}setTimeout(()=>host.replaceChildren(),3800);}
$('yes').onclick=()=>{show('planner');celebrate();};$('back').onclick=()=>show('intro');$('change').onclick=()=>show('planner');
const planIdeas={
 'Un cafecito':{icon:'☕',story:'Un café, una buena charla y cero prisa.',place:'Un café acogedor',time:'17:00'},
 'Cena para dos':{icon:'🍝',story:'La mesa para dos. Las ganas de verte, para mil.',place:'Un restaurante bonito',time:'20:00'},
 'Un paseo':{icon:'🌷',story:'Un paseo, un helado y una conversación que se alarga.',place:'Un parque bonito',time:'17:00'},
 '¡Sorpréndeme!':{icon:'✨',story:'El plan es una sorpresa. La compañía es lo mejor.',place:'Tú eliges el lugar',time:'19:00'}
};
function localDate(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function parseDay(s){return /^\d{4}-\d{2}-\d{2}$/.test(s)?new Date(s+'T12:00:00'):new Date(NaN);}
function allowedTimes(date,now=new Date()){
 const d=parseDay(date),day=d.getDay(); if(!Number.isFinite(d.getTime())||localDate(d)!==date||date<localDate(now)||(day!==0&&day!==6))return [];
 const times=[];for(let mins=day===6?720:540;mins<=(day===6?1140:1439);mins+=15){const value=String(Math.floor(mins/60)).padStart(2,'0')+':'+String(mins%60).padStart(2,'0');if(new Date(date+'T'+value)>now)times.push(value);}return times;
}
function selectable(date){return allowedTimes(date).length>0;}
let viewMonth=new Date();viewMonth=new Date(viewMonth.getFullYear(),viewMonth.getMonth(),1);
function renderCalendar(){
 $('calendar-month').textContent=viewMonth.toLocaleDateString('es-PE',{month:'long',year:'numeric'});
 const now=new Date();$('prev-month').disabled=viewMonth.getFullYear()===now.getFullYear()&&viewMonth.getMonth()===now.getMonth();
 const host=$('calendar-days');host.replaceChildren();const offset=(viewMonth.getDay()+6)%7;
 for(let i=0;i<offset;i++){const blank=document.createElement('span');blank.className='calendar-empty';host.append(blank);}
 const count=new Date(viewMonth.getFullYear(),viewMonth.getMonth()+1,0).getDate();for(let day=1;day<=count;day++){const d=new Date(viewMonth.getFullYear(),viewMonth.getMonth(),day),value=localDate(d),button=document.createElement('button');button.type='button';button.textContent=day;button.disabled=!selectable(value);button.className=value===$('date').value?'selected-day':'';button.setAttribute('aria-label',d.toLocaleDateString('es-PE',{weekday:'long',day:'numeric',month:'long',year:'numeric'}));button.setAttribute('aria-pressed',String(value===$('date').value));button.onclick=()=>chooseDate(value);host.append(button);}
}
function minuteValue(value){const [h,m]=value.split(':').map(Number);return h*60+m;}
function clockValue(mins){return String(Math.floor(mins/60)).padStart(2,'0')+':'+String(mins%60).padStart(2,'0');}
function prettyTime(value){if(!value)return '';return new Date('2000-01-01T'+value).toLocaleTimeString('es-PE',{hour:'numeric',minute:'2-digit'});}
function syncTime(){const slider=$('time-slider');if(slider.disabled)return;const value=clockValue(Number(slider.value));$('time').value=value;$('time-display').textContent=prettyTime(value);slider.setAttribute('aria-valuetext',prettyTime(value));const min=Number(slider.min),max=Number(slider.max);$('time-minus').disabled=Number(slider.value)<=min;$('time-plus').disabled=Number(slider.value)>=max;slider.style.setProperty('--progress',(max===min?100:(Number(slider.value)-min)/(max-min)*100)+'%');}
function fillTimes(preferred){
 const date=$('date').value,valid=allowedTimes(date),slider=$('time-slider');slider.disabled=!valid.length;
 if(!valid.length){$('time').value='';$('time-display').textContent='Sin horarios disponibles';$('time-start').textContent='—';$('time-end').textContent='—';$('time-minus').disabled=true;$('time-plus').disabled=true;slider.setAttribute('aria-valuetext','Sin horarios disponibles');return;}
 slider.min=minuteValue(valid[0]);slider.max=minuteValue(valid[valid.length-1]);slider.step=15;slider.value=minuteValue(valid.includes(preferred)?preferred:valid.includes('17:00')?'17:00':valid[0]);
 $('time-start').textContent=prettyTime(valid[0]);$('time-end').textContent=prettyTime(valid[valid.length-1]);syncTime();
 $('availability-status').textContent=parseDay(date).getDay()===6?'Sábado: de 12:00 m. a 7:00 p. m.':'Domingo: desde las 9:00 a. m. · horarios en tu hora local';
}
function chooseDate(value){if(!selectable(value))return;$('date').value=value;$('chosen-date').textContent='♡ '+parseDay(value).toLocaleDateString('es-PE',{weekday:'long',day:'numeric',month:'long'});fillTimes($('time').value);renderCalendar();}
$('prev-month').onclick=()=>{const now=new Date(),earliest=new Date(now.getFullYear(),now.getMonth(),1);if(viewMonth>earliest){viewMonth.setMonth(viewMonth.getMonth()-1);renderCalendar();}};
$('next-month').onclick=()=>{viewMonth.setMonth(viewMonth.getMonth()+1);renderCalendar();};
function selectPlan(plan){selectedPlan=plan;document.querySelectorAll('.plan').forEach(p=>{const active=p.dataset.plan===plan;p.classList.toggle('selected',active);p.setAttribute('aria-pressed',String(active));});const first=document.querySelector('[data-place]');first.dataset.place=planIdeas[plan].place;first.textContent=planIdeas[plan].place;}
for(const button of document.querySelectorAll('.plan'))button.onclick=()=>selectPlan(button.dataset.plan);
for(const button of document.querySelectorAll('[data-place]'))button.onclick=()=>{$('place').value=button.dataset.place;};
$('time-slider').addEventListener('input',syncTime);
$('time-minus').onclick=()=>{const s=$('time-slider');if(!s.disabled){s.value=Math.max(Number(s.min),Number(s.value)-15);syncTime();}};
$('time-plus').onclick=()=>{const s=$('time-slider');if(!s.disabled){s.value=Math.min(Number(s.max),Number(s.value)+15);syncTime();}};
$('lucky').onclick=()=>{const plans=Object.keys(planIdeas).filter(p=>p!==selectedPlan&&p!=='¡Sorpréndeme!');selectPlan(plans[Math.floor(Math.random()*plans.length)]);let d=new Date();for(let i=0;i<15;i++){const value=localDate(d);if(selectable(value)){viewMonth=new Date(d.getFullYear(),d.getMonth(),1);chooseDate(value);const times=allowedTimes(value);const preferred=planIdeas[selectedPlan].time;fillTimes(times.includes(preferred)?preferred:times.find(t=>Number(t.slice(3))%15===0));break;}d.setDate(d.getDate()+1);}$('place').value=planIdeas[selectedPlan].place;celebrate();};
let booking=null,cardFile=null,inviteFile=null;
const SITE_URL='https://una-cita-contigo-beckham.blondemu258.chatgpt.site/';
function wrapText(ctx,text,x,y,maxWidth,lineHeight){let line='';for(const char of text){const candidate=line+char;if(ctx.measureText(candidate).width>maxWidth&&line){ctx.fillText(line.trim(),x,y);y+=lineHeight;line=char;}else line=candidate;}if(line)ctx.fillText(line.trim(),x,y);return y+lineHeight;}
async function makeCard(data){
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1700;const ctx=canvas.getContext('2d');ctx.fillStyle='#f8f5ed';ctx.fillRect(0,0,1080,1700);ctx.strokeStyle='#d4c9b3';ctx.lineWidth=2;ctx.strokeRect(55,55,970,1590);ctx.fillStyle='#b54534';ctx.font='70px Georgia';ctx.textAlign='center';ctx.beginPath();ctx.moveTo(540,185);ctx.bezierCurveTo(440,130,495,85,540,128);ctx.bezierCurveTo(585,85,640,130,540,185);ctx.fill();ctx.font='20px Arial';ctx.fillText(data?'INVITACIÓN PARA DOS':'TENGO UNA PREGUNTA PARA TI',540,250);ctx.fillStyle='#343d32';ctx.font='66px Georgia';ctx.fillText(data?'Tenemos un plan.':'¿Quieres salir',540,365);if(!data){ctx.fillStyle='#b54534';ctx.font='italic 80px Georgia';ctx.fillText('conmigo?',540,470);ctx.fillStyle='#7a7d70';ctx.font='30px Arial';ctx.fillText('Un ratito juntos, algo rico',540,620);ctx.fillText('y muchas risas.',540,665);ctx.font='24px Arial';ctx.fillText('Abre el enlace y elige nuestro plan.',540,850);}else{ctx.textAlign='left';ctx.fillStyle='#b54534';ctx.font='48px Georgia';let y=wrapText(ctx,data.plan,115,490,850,62);ctx.fillStyle='#7a7d70';ctx.font='23px Arial';ctx.fillText('DÍA Y HORA',115,y+40);ctx.fillStyle='#343d32';ctx.font='32px Arial';y=wrapText(ctx,data.formatted,115,y+95,850,45);ctx.fillText(data.formattedTime,115,y+20);ctx.font='28px Arial';y=wrapText(ctx,'Lugar: '+(data.place||'Lo coordinamos juntos'),115,y+105,850,40);if(data.message){ctx.font='italic 27px Georgia';wrapText(ctx,data.message,115,y+35,850,38);}}ctx.textAlign='center';ctx.fillStyle='#b54534';ctx.font='italic 37px Georgia';ctx.fillText('Tú + yo, un buen comienzo.',540,1530);ctx.fillStyle='#7a7d70';ctx.font='22px Arial';ctx.fillText('Un fin de semana para recordar.',540,1590);
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('No se pudo crear la imagen');return new File([blob],data?'nuestra-cita.png':'una-invitacion-para-ti.png',{type:'image/png'});
}
function download(file){const url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}
function shareText(data){return data?`¡Tenemos un plan! ♡\n${data.plan}\n📅 ${data.formatted}\n🕒 ${data.formattedTime}\n📍 ${data.place||'Lugar por coordinar'}${data.message?'\n💬 '+data.message:''}\n\n¿Confirmamos los detalles?\n${SITE_URL}`:`Tengo una invitación para ti 💌\n¿Quieres salir conmigo? Abre el enlace y elige nuestro plan.\n${SITE_URL}`;}
async function shareCard(data,statusId,file){
 const status=$(statusId);if(!file){status.textContent='La tarjeta se está preparando. Vuelve a tocar en un momento.';return;}
 if(navigator.canShare&&navigator.canShare({files:[file]})&&navigator.share){try{await navigator.share({files:[file],title:'Una cita contigo ♡',text:shareText(data)});status.textContent='Revisa que WhatsApp incluya la imagen y el enlace antes de enviar.';}catch(error){status.textContent=error.name==='AbortError'?'No se envió nada. Puedes volver a compartir cuando quieras.':'No se pudo compartir. Guarda la imagen y adjúntala en WhatsApp.';}}else{download(file);status.textContent='Imagen descargada. Abre el mensaje en WhatsApp y adjunta la imagen guardada.';window.open('https://wa.me/?text='+encodeURIComponent(shareText(data)),'_blank','noopener');}
}
$('share-invite').onclick=()=>shareCard(null,'invite-status',inviteFile);
$('send').onclick=()=>shareCard(booking,'share-status',cardFile);
$('download-card').onclick=()=>{if(cardFile)download(cardFile);};
$('text-only').onclick=()=>{if(booking)window.open('https://wa.me/?text='+encodeURIComponent(shareText(booking)),'_blank','noopener');};
$('save-calendar').onclick=()=>{if(!booking)return;const stamp=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z/,'Z');const escape=s=>s.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Una cita contigo//ES','BEGIN:VEVENT','UID:'+crypto.randomUUID()+'@una-cita-contigo','DTSTAMP:'+stamp(new Date()),'DTSTART:'+stamp(booking.when),'SUMMARY:'+escape(booking.plan),'LOCATION:'+escape(booking.place||'Por coordinar'),'DESCRIPTION:'+escape((booking.message||'Un plan para dos')+'\nPendiente de confirmar por ambos.'),'END:VEVENT','END:VCALENDAR'].join('\r\n');download(new File([ics],'nuestra-cita.ics',{type:'text/calendar;charset=utf-8'}));};
$('date-form').onsubmit=async e=>{e.preventDefault();const date=$('date').value,time=$('time').value;if(!allowedTimes(date).includes(time)){$('availability-status').textContent='Elige un sábado de 12:00 a 19:00 o un domingo desde las 09:00, en una hora futura.';if(date)fillTimes('');return;}
 const when=new Date(date+'T'+time),formatted=when.toLocaleDateString('es-PE',{weekday:'long',day:'numeric',month:'long',year:'numeric'}),formattedTime=when.toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'}),place=$('place').value.trim(),message=$('message').value.trim();booking={plan:selectedPlan,when,formatted,formattedTime,place,message};cardFile=null;$('send').disabled=true;$('download-card').disabled=true;$('share-status').textContent='Preparando tu invitación…';$('ticket-plan').textContent=selectedPlan;$('ticket-date').textContent=formatted;$('ticket-time').textContent=formattedTime;$('ticket-place').textContent='Lugar: '+(place||'Lo coordinamos juntos');$('ticket-message').textContent=message;const hours=Math.floor((when-new Date())/3600000);$('countdown').textContent=hours>=24?`♡ Faltan ${Math.floor(hours/24)} días para este plan bonito.`:`♡ Este plan bonito está a menos de ${hours+1} horas.`;show('result');celebrate();try{cardFile=await makeCard(booking);$('send').disabled=false;$('download-card').disabled=false;$('share-status').textContent='Imagen y enlace listos. Toca el botón y elige WhatsApp.';}catch{$('share-status').textContent='No se pudo crear la imagen. Puedes abrir el mensaje en WhatsApp.';}
};
renderCalendar();makeCard(null).then(file=>{inviteFile=file;}).catch(()=>{$('invite-status').textContent='No se pudo preparar la imagen de la invitación.';});
