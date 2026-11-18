const account = document.querySelector('#account');
const contacts = document.querySelector('#contacts');
const messages = document.querySelector('#messages');
const chatName = document.querySelector('#chatName');
const avatar = document.querySelector('#avatar');
const form = document.querySelector('#messageForm');
const input = document.querySelector('#messageInput');
const send = document.querySelector('#send');
let users = [], me = null, other = null, lastSnapshot = '';
const initials = name => name.slice(0,1).toUpperCase();
async function api(path, options) { const response = await fetch(path, options); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Erro de conexão'); return result; }
function setStatus(text) { messages.replaceChildren(); const p = document.createElement('p'); p.className='empty'; p.textContent=text; messages.append(p); }
function renderContacts() {
  contacts.replaceChildren();
  for (const user of users.filter(u => u.id !== me)) {
    const btn=document.createElement('button'); btn.className='contact'+(other===user.id?' active':'');
    const circle=document.createElement('span'); circle.className='avatar'; circle.textContent=initials(user.name);
    const name=document.createElement('span'); name.textContent=user.name;
    btn.append(circle,name); btn.addEventListener('click',()=>selectContact(user.id)); contacts.append(btn);
  }
}
async function selectContact(id) {
  other=id; lastSnapshot=''; renderContacts();
  const user=users.find(u=>u.id===id); chatName.textContent=user.name; avatar.textContent=initials(user.name);
  input.disabled=false; send.disabled=false; setStatus('Carregando mensagens...'); await loadMessages(); input.focus();
}
async function loadMessages() {
  if (me===null || other===null) return;
  const currentMe=me, currentOther=other;
  try {
    const data=await api(`/api/messages?me=${currentMe}&other=${currentOther}`);
    if (me!==currentMe || other!==currentOther) return;
    const snapshot=JSON.stringify(data);
    if(snapshot===lastSnapshot) return;
    const atBottom=messages.scrollHeight-messages.scrollTop-messages.clientHeight<80;
    lastSnapshot=snapshot; messages.replaceChildren();
    if (!data.length) { setStatus('Ainda não há mensagens. Envie a primeira!'); return; }
    for (const msg of data) {
      const bubble=document.createElement('div'); bubble.className='bubble'+(msg.sender_id===me?' mine':'');
      const content=document.createElement('span'); content.textContent=msg.body;
      const time=document.createElement('time'); time.textContent=new Date(msg.created_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
      bubble.append(content,time); messages.append(bubble);
    }
    if(atBottom) messages.scrollTop=messages.scrollHeight;
  } catch(err) { setStatus(err.message); }
}
account.addEventListener('change',()=>{ me=Number(account.value); other=null; lastSnapshot=''; chatName.textContent='Selecione um contato'; avatar.textContent='?'; input.disabled=true; send.disabled=true; renderContacts(); setStatus('Escolha um contato para começar.'); });
form.addEventListener('submit',async event=>{
  event.preventDefault(); const body=input.value.trim(); if(!body||other===null)return;
  const sender_id=me,receiver_id=other; send.disabled=true;
  try { await api('/api/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sender_id,receiver_id,body})}); input.value=''; await loadMessages(); messages.scrollTop=messages.scrollHeight; }
  catch(err){ alert(err.message); } finally {send.disabled=false;input.focus();}
});
async function init(){try{users=await api('/api/users');if(users.length<2)throw new Error('Cadastre pelo menos dois usuários no banco.');for(const u of users){const option=document.createElement('option');option.value=u.id;option.textContent=u.name;account.append(option);}me=users[0].id;renderContacts();setStatus('Escolha um contato para começar.');}catch(err){setStatus(err.message);}}
setInterval(loadMessages,1500);
init();
