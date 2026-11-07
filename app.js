import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
const $=s=>document.querySelector(s),native=Capacitor.isNativePlatform();
const pad=n=>String(n).padStart(2,'0'),iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parse=s=>{const[y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const today=()=>{const t=new Date();return new Date(t.getFullYear(),t.getMonth(),t.getDate())};
const addM=(b,m)=>{const d=parse(b);d.setMonth(d.getMonth()+m);return d};
const addD=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const days=d=>Math.round((d-today())/864e5),fmt=d=>d.toLocaleDateString('pt-BR');
const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ageM=b=>{const d=parse(b),t=today();return (t.getFullYear()-d.getFullYear())*12+t.getMonth()-d.getMonth()-(t.getDate()<d.getDate()?1:0)};
const ageTxt=b=>{const m=ageM(b);return m<24?m+(m==1?' mês':' meses'):Math.floor(m/12)+' anos'};
// Calendário Nacional de Vacinação 2026 (Ministério da Saúde)
// [tipo, valor, vacina, dose, protege contra, opcional]  tipo: m=idade em meses | r=repetir a cada N meses | o=conforme histórico | g=semanas de gestação
const PEN='Difteria, tétano, coqueluche, hepatite B e Hib',PN='Pneumonia, meningite e otite',MEN='Meningite C',COV='Covid-19',CV='Covid-19 (doses conforme o produto)';
const CH=[['m',0,'BCG','Dose única','Formas graves de tuberculose'],['m',0,'Hepatite B','Dose ao nascer','Hepatite B'],
['m',2,'Pentavalente','1ª dose',PEN],['m',2,'VIP (pólio)','1ª dose','Paralisia infantil'],['m',2,'Pneumocócica','1ª dose',PN],['m',2,'Rotavírus','1ª dose','Diarreia grave'],
['m',3,'Meningocócica C','1ª dose',MEN],
['m',4,'Pentavalente','2ª dose',PEN],['m',4,'VIP (pólio)','2ª dose','Paralisia infantil'],['m',4,'Pneumocócica','2ª dose',PN],['m',4,'Rotavírus','2ª dose','Diarreia grave'],
['m',5,'Meningocócica C','2ª dose',MEN],
['m',6,'Pentavalente','3ª dose',PEN],['m',6,'VIP (pólio)','3ª dose','Paralisia infantil'],['m',6,COV,'1ª dose',CV],['m',6,'Influenza','1ª dose','Gripe'],
['m',7,COV,'2ª dose',CV],['m',7,'Influenza','2ª dose (1ª vez que toma)','Gripe'],
['m',9,'Febre amarela','1ª dose','Febre amarela'],['m',9,COV,'3ª dose',CV],
['m',12,'Pneumocócica','Reforço',PN],['m',12,'Meningocócica ACWY','Reforço','Meningites A, C, W e Y'],['m',12,'Tríplice viral','1ª dose','Sarampo, caxumba e rubéola'],
['m',15,'DTP','1º reforço','Difteria, tétano e coqueluche'],['m',15,'VIP (pólio)','Reforço','Paralisia infantil'],['m',15,'Hepatite A','Dose única','Hepatite A'],['m',15,'Tríplice viral','2ª dose (ou tetraviral)','Sarampo, caxumba, rubéola e varicela'],['m',15,'Varicela','1ª dose (ou tetraviral)','Catapora'],
['m',48,'DTP','2º reforço','Difteria, tétano e coqueluche'],['m',48,'Febre amarela','Reforço','Febre amarela'],['m',48,'Varicela','2ª dose','Catapora'],
['m',108,'HPV','Dose única (9 a 14 anos)','Vários tipos de câncer e verrugas genitais'],
['m',120,'Dengue','1ª dose (10 a 14 anos)','Dengue'],['m',120,'Dengue','2ª dose (veja o intervalo na unidade)','Dengue'],
['m',132,'Meningocócica ACWY','Dose única (11 a 14 anos)','Meningites A, C, W e Y'],
['m',168,'dT','Reforço','Difteria e tétano']];
const HB=['o',0,'Hepatite B','3 doses (conforme histórico)','Hepatite B'],YF=['o',0,'Febre amarela','Dose única (conforme histórico)','Febre amarela'],DT=['r',120,'dT','Reforço a cada 10 anos','Difteria e tétano'];
const ADO=[HB,DT,['o',0,'Tríplice viral','2 doses (conforme histórico)','Sarampo, caxumba e rubéola'],YF,['o',0,'HPV','Dose única, se nunca tomou','Vários tipos de câncer e verrugas genitais',1]];
const ADU=[DT,HB,YF,['o',0,'Tríplice viral','Até 29 anos: 2 doses · 30 a 59: 1 dose','Sarampo, caxumba e rubéola']];
const IDO=[DT,['r',12,'Influenza','1 dose todo ano','Gripe'],['r',6,COV,'1 dose a cada 6 meses','Formas graves da Covid-19'],HB,['o',0,'Febre amarela','Só em casos excepcionais (avaliação na unidade)','Febre amarela',1]];
const GES=[HB,['o',0,'dT','3 doses (conforme histórico)','Difteria e tétano'],['o',0,'Influenza','1 dose por temporada','Gripe'],['o',0,COV,'1 dose a cada gestação','Formas graves da Covid-19'],['g',20,'dTpa','1 dose a partir da 20ª semana','Difteria, tétano e coqueluche (protege o bebê)'],['g',28,'VSR','1 dose a partir da 28ª semana','Bronquiolite e pneumonia do bebê nos 6 primeiros meses']];
const LS=[CH,ADO,ADU,IDO,GES];
const EM={BCG:'🛡️','Hepatite B':'🧪','Hepatite A':'🧪',Influenza:'🤧','Covid-19':'🦠','Febre amarela':'🦟',Dengue:'🦟',HPV:'🎗️','Rotavírus':'🍼',Varicela:'🔴','Tríplice viral':'🌡️'};
const emo=n=>EM[n]||'💉';
// Personagens (SVG)
const AV=[{k:'#F6D2B0',h:'#5A3A22',s:'#4FB3A9',t:0},{k:'#E8B98F',h:'#2B1B12',s:'#F29E4C',t:1},{k:'#F6D2B0',h:'#C8872F',s:'#E86F8E',t:2},{k:'#C98E64',h:'#1E1410',s:'#7A6FD0',t:3},{k:'#E8B98F',h:'#3A2A22',s:'#3E88C9',t:4},{k:'#F0C8A4',h:'#E6E6E6',s:'#C9578E',t:5}];
const HAIR=[`<path d="M24 22q8-12 16 0q-8-4-16 0z" fill="H"/>`,`<path d="M20 28q0-16 12-16t12 16q-4-10-12-10t-12 10z" fill="H"/>`,`<path d="M18 40q-4-26 14-26t14 26l-6-14q-8 4-16 0z" fill="H"/><circle cx="42" cy="18" r="4" fill="#E8546F"/>`,`<path d="M19 30q-1-18 13-18t13 18q-5-9-13-9t-13 9z" fill="H"/>`,`<path d="M20 28q0-15 12-15t12 15q-3-8-12-8t-12 8z" fill="H"/><path d="M24 40q8 10 16 0q-2 8-8 8t-8-8z" fill="H" opacity=".85"/>`,`<path d="M19 30q-2-17 13-17t13 17q-4-9-13-9t-13 9z" fill="H"/><g fill="none" stroke="#555" stroke-width="1.4"><circle cx="27" cy="31" r="4.2"/><circle cx="37" cy="31" r="4.2"/><path d="M31 31h2"/></g>`];
const av=(i,z=64)=>{const a=AV[i%6];return `<svg viewBox="0 0 64 64" width="${z}" height="${z}" aria-hidden="true"><circle cx="32" cy="32" r="32" fill="${a.s}" opacity=".25"/><path d="M10 64q2-18 22-18t22 18z" fill="${a.s}"/><circle cx="32" cy="31" r="14" fill="${a.k}"/>${HAIR[a.t].replace(/"H"/g,`"${a.h}"`)}<circle cx="27" cy="32" r="1.6" fill="#222"/><circle cx="37" cy="32" r="1.6" fill="#222"/><path d="M28 38q4 3.5 8 0" stroke="#A04040" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>`};
const HERO=`<svg class="art" viewBox="0 0 220 180" aria-hidden="true"><path d="M110 12l62 22v48c0 42-28 70-62 84C76 152 48 124 48 82V34z" fill="#fff" opacity=".95"/><path d="M110 28l48 17v37c0 33-21 55-48 67-27-12-48-34-48-67V45z" fill="#12A596"/><path d="M104 62h12v16h16v12h-16v16h-12V90H88V78h16z" fill="#fff"/><g transform="rotate(-38 168 120)"><rect x="150" y="112" width="58" height="14" rx="4" fill="#fff"/><rect x="156" y="115" width="30" height="8" rx="2" fill="#7FE0D4"/><rect x="208" y="117" width="14" height="4" fill="#fff"/><rect x="146" y="106" width="4" height="26" rx="2" fill="#fff"/></g><g fill="#fff" opacity=".7"><circle cx="30" cy="40" r="7"/><circle cx="196" cy="30" r="5"/><circle cx="22" cy="130" r="4"/></g></svg>`;
const TIPS=[['🧾','Leve sempre a caderneta','Leve o cartão de vacinas (papel ou Meu SUS Digital) em toda consulta e campanha.'],['🆓','São gratuitas no SUS','As vacinas do Calendário Nacional são oferecidas de graça nas unidades de saúde.'],['⏰','Atrasou? Não precisa recomeçar','Procure a unidade de saúde: em geral o esquema continua de onde parou.'],['🤒','Resfriado leve','Doença leve normalmente não impede a vacina. Febre alta ou doença grave: pergunte na unidade antes.'],['🌡️','Febre depois da vacina','Febre baixa e dor no local são comuns. Se a reação for forte, procure atendimento.'],['🤰','Gestante','A dTpa vale a cada gestação, a partir da 20ª semana, e a VSR a partir da 28ª. Elas protegem o bebê.'],['📲','Guarde uma cópia','Tire foto do cartão e confira também o registro no Meu SUS Digital.']];
let S,V={tab:'home',pid:null},pend=null;
function save(){if(window.DEMO)return;try{localStorage.setItem('vacinas1',JSON.stringify(S))}catch(e){}}
function load(){if(window.DEMO){demo();return}try{S=JSON.parse(localStorage.getItem('vacinas1')||'null')}catch(e){S=null}if(!S||!Array.isArray(S.people))S={people:[],next:1}
  S.people.forEach(p=>{if(p.g&&days(parse(p.g))<-308)delete p.g})}
const li=p=>{if(p.g)return 4;const m=ageM(p.birth);return m<180?0:m<240?1:m<720?2:3};
const wks=p=>Math.floor(-days(parse(p.g))/7);
function items(p){const L=li(p);return LS[L].map((x,i)=>{const k=L*100+i,t=x[0],done=p.done[k]||null;let due=null;
  if(t=='m')due=addM(p.birth,x[1]);else if(t=='g')due=addD(parse(p.g),x[1]*7);else if(t=='r'&&done)due=addM(done,x[1]);
  const dy=due?days(due):null;let s;
  if(t=='o')s=done?'ok':'none';else if(t=='r')s=!done?'none':dy<0?'late':dy<=30?'soon':'fut';else s=done?'ok':dy<0?'late':dy<=30?'soon':'fut';
  return{k,t,n:x[2],d:x[3],w:x[4],opt:x[5],due,done,dy,s,pid:p.id}})}
const pct=p=>{const l=items(p).filter(i=>!i.opt&&(i.t=='r'||i.t=='o'||i.done||i.due<=today())),o=l.filter(i=>i.t=='r'?(i.s!='late'&&i.s!='none'):!!i.done).length;return l.length?Math.round(100*o/l.length):100};
const pending=()=>S.people.flatMap(p=>items(p).map(i=>({...i,p}))).filter(i=>i.s=='late'||i.s=='soon'||(i.s=='fut'&&i.dy<=365)).sort((a,b)=>a.due-b.due);
const chip=i=>i.s=='late'?`<span class="badge late">Atrasada</span>`:i.s=='soon'?`<span class="badge soon">${i.dy==0?'Hoje':'Em '+i.dy+(i.dy==1?' dia':' dias')}</span>`:i.s=='ok'?`<span class="badge ok">Tomada</span>`:i.s=='none'?`<span class="badge none">Sem registro</span>`:i.t=='r'?`<span class="badge ok">Em dia</span>`:`<span class="badge fut">Futura</span>`;
const keys=p=>[0,1,2,3,4].flatMap(L=>LS[L].map((_,i)=>p.id*1000+L*100+i));
async function sched(p){const L=native&&LocalNotifications;if(!L)return;try{const now=new Date(),list=[];
  items(p).forEach(i=>{if(!i.due||i.due<today()||(i.done&&i.t!='r'))return;let at=addD(i.due,-7);at.setHours(9,0,0,0);if(at<=now)at=new Date(now.getTime()+15000);
    list.push({id:p.id*1000+i.k,title:`${p.name}: ${i.n}`,body:`${i.d} — ${i.dy==0?'é hoje':'data prevista '+fmt(i.due)}. Abra o app e marque quando tomar.`,schedule:{at,allowWhileIdle:true}})});
  if(list.length)await L.schedule({notifications:list})}catch(e){console.warn(e)}}
async function unsched(ids){const L=native&&LocalNotifications;if(!L||!ids.length)return;try{await L.cancel({notifications:ids.map(id=>({id}))})}catch(e){}}
const ring=p=>{const v=pct(p),c=2*Math.PI*44;return `<div class="ringw"><svg class="r" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="none" stroke="var(--line)" stroke-width="8"/><circle cx="50" cy="50" r="44" fill="none" stroke="${v<60?'var(--late)':'var(--p)'}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${c*v/100} ${c}" transform="rotate(-90 50 50)"/></svg><div class="a">${av(p.av,'100%')}</div><span class="pct">${v}%</span></div>`};
const prow=i=>`<button class="row ${i.s}" data-a="open" data-p="${i.p.id}"><div class="ico">${emo(i.n)}</div><div><div class="t1">${i.n} <span style="font-weight:400">· ${i.d}</span></div><div class="t2"><span class="mini">${av(i.p.av,22)}</span>${esc(i.p.name)}</div></div><div class="right">${i.due?fmt(i.due):''}<br>${chip(i)}</div></button>`;
const tip=t=>`<div class="tip"><i>${t[0]}</i><div><b>${t[1]}</b>${t[2]}</div></div>`;
function home(){const pe=pending(),late=pe.filter(i=>i.s=='late').length,h=new Date().getHours(),g=h<12?'Bom dia':h<18?'Boa tarde':'Boa noite';
  return `<div class="hero"><span class="bub" style="width:120px;height:120px;left:-30px;bottom:-40px"></span><span class="bub" style="width:60px;height:60px;left:42%;top:-18px"></span>${HERO}<p>${g}!</p><h1>Caderneta da Família</h1><p>${S.people.length?`${S.people.length} pessoa${S.people.length>1?'s':''} acompanhada${S.people.length>1?'s':''}`:'Cadastre a família para começar'}</p></div>`+
  (S.people.length?`<button class="alert ${late?'':'good'}" data-a="tab" data-t="cal"><span style="font-size:26px">${late?'⚠️':'✅'}</span><span>${late?`${late} vacina${late>1?'s':''} atrasada${late>1?'s':''}. Procure a unidade de saúde.`:'Nenhuma vacina atrasada. Parabéns!'}</span></button>`:'<div style="height:16px"></div>')+
  `<h2>👨‍👩‍👧 Minha família</h2><div class="fam">${S.people.map(p=>{const l=items(p).filter(i=>i.s=='late').length;return `<button class="pc" data-a="open" data-p="${p.id}">${ring(p)}<div class="nm">${esc(p.name)}</div><div class="ag">${p.g?'🤰 '+wks(p)+' semanas':ageTxt(p.birth)}</div><span class="badge ${l?'late':'ok'}">${l?l+' atrasada'+(l>1?'s':''):'Em dia'}</span></button>`}).join('')}<button class="pc add" data-a="add"><span style="font-size:38px">➕</span>Adicionar pessoa</button></div>`+
  (pe.length?`<h2>💉 Próximas vacinas</h2>${pe.slice(0,5).map(prow).join('')}`:'')+
  `<h2>🧭 Atalhos</h2><div class="tiles"><button class="tile" data-a="add"><i>🧒</i>Nova pessoa</button><button class="tile" data-a="tab" data-t="cal"><i>📅</i>Calendário</button><button class="tile" data-a="tab" data-t="tips"><i>💡</i>Dicas</button></div>`+
  `<h2>🌟 Dica do dia</h2>${tip(TIPS[new Date().getDate()%TIPS.length])}<p class="small">Baseado no Calendário Nacional de Vacinação 2026 do Ministério da Saúde: criança, adolescente, adulto, idoso e gestante. Confirme sempre as indicações com a sua unidade de saúde.</p>`}
function cal(){const pe=pending();if(!pe.length)return `<div class="bar"><h1 style="margin:0">📅 Calendário</h1></div><p class="small">Nada pendente nos próximos 12 meses. Cadastre pessoas na tela inicial.</p>`;
  const g={};pe.forEach(i=>{const k=i.s=='late'?'⚠️ Atrasadas':i.due.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});(g[k]=g[k]||[]).push(i)});
  return `<div class="bar"><h1 style="margin:0">📅 Calendário</h1></div><p class="small" style="margin:6px 18px">Próximos 12 meses</p>`+Object.entries(g).map(([k,l])=>`<h2 style="text-transform:capitalize">${k}</h2>${l.map(prow).join('')}`).join('')}
function tips(){return `<div class="bar"><h1 style="margin:0">💡 Dicas</h1></div><div style="height:12px"></div>${TIPS.map(t=>`<div class="card"><i>${t[0]}</i><div><b>${t[1]}</b><div class="t2">${t[2]}</div></div></div>`).join('')}<p class="small">Este app é um lembrete e não substitui a orientação de profissionais de saúde.</p>`}
function person(){const p=S.people.find(x=>x.id==V.pid);if(!p){V.pid=null;return home()}const l=items(p),L=li(p);
  const sec=(t,a)=>a.length?`<h2>${t}</h2>`+a.map(i=>`<div class="row ${i.s}"><div class="ico">${emo(i.n)}</div><div><div class="t1">${i.n} <span style="font-weight:400">· ${i.d}</span></div><div class="t2">${i.w}${i.opt?' · só se indicado':''}</div><button class="btn" data-a="dose" data-k="${i.k}">${i.done&&i.t!='r'?'Desfazer':i.t=='r'?(i.done?'Registrar nova dose':'Registrar última dose'):i.t=='o'?'Já tomei':'Tomei'}</button></div><div class="right">${i.due?fmt(i.due):'—'}<br>${chip(i)}</div></div>`).join(''):'';
  const okL=l.filter(i=>i.s=='ok'||(i.t=='r'&&i.s=='fut'));
  return `<div class="bar"><button class="back" data-a="back">← Voltar</button></div><div class="ph">${ring(p)}<h1>${esc(p.name)}</h1><div class="t2">${p.g?'🤰 '+wks(p)+' semanas de gestação · ':''}${ageTxt(p.birth)} · nascimento ${fmt(parse(p.birth))}</div></div><div class="acts">${L==0?'<button class="btn" data-a="all">✔ Marcar tudo até hoje</button>':''}${p.g?'<button class="btn" data-a="endg">Encerrar gestação</button>':(L>0&&L<4?'<button class="btn" data-a="preg">🤰 Estou grávida</button>':'')}<button class="btn del" data-a="del">🗑 Excluir</button></div>`+
  sec('⚠️ Atrasadas',l.filter(i=>i.s=='late'))+sec('⏳ Próximas',l.filter(i=>i.s=='soon'))+sec('📋 Sem registro',l.filter(i=>i.s=='none'))+sec('🗓️ Futuras',l.filter(i=>i.s=='fut'&&i.t!='r'))+sec('✅ Em dia',okL)+
  `<p class="small">Calendário Nacional de Vacinação 2026 (Ministério da Saúde). As datas são previsões e itens "conforme histórico" dependem do que você já tomou: confirme com a unidade de saúde.</p>`}
function render(){$('#app').innerHTML=V.pid?person():V.tab=='cal'?cal():V.tab=='tips'?tips():home();document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',!V.pid&&b.dataset.t==V.tab));window.scrollTo(0,0)}
function demo(){const t=today(),b=(y,m)=>{const d=new Date(t);d.setFullYear(d.getFullYear()-y);d.setMonth(d.getMonth()-m);return iso(d)};
  const mk=(id,name,birth,a,lag)=>{const p={id,name,birth,av:a,done:{}};items(p).forEach(i=>{if(i.t=='m'&&i.due<=addD(t,-lag))p.done[i.k]=iso(i.due)});return p};
  const ana=mk(3,'Ana',b(34,0),4,0),vo=mk(4,'Vovó Rita',b(68,0),5,0),ca=mk(5,'Carla',b(28,0),2,0);
  ana.done[200]=b(9,8);ana.done[201]=b(2,0);vo.done[300]=b(10,2);vo.done[301]=b(0,3);vo.done[302]=b(0,5);ca.g=iso(addD(t,-18*7));ca.done[400]=b(1,0);
  S={next:6,people:[mk(1,'Maria',b(0,5),0,40),mk(2,'Pedro',b(4,3),2,150),ana,ca,vo]}}
// Eventos
const dAdd=$('#dAdd'),dDose=$('#dDose');
$('#avs').innerHTML=AV.map((a,i)=>`<input type="radio" name="av" id="av${i}" value="${i}"${i?'':' checked'}><label for="av${i}">${av(i,52)}</label>`).join('');
$('#gs').onchange=e=>{$('#gw').hidden=!e.target.checked;$('#gk').required=e.target.checked};
document.addEventListener('click',async e=>{const el=e.target.closest('[data-a]');if(!el)return;const a=el.dataset.a,p=S.people.find(x=>x.id==(el.dataset.p||V.pid));
  if(a=='tab'){V.tab=el.dataset.t;V.pid=null}
  else if(a=='open'){V.pid=+el.dataset.p}
  else if(a=='back')V.pid=null;
  else if(a=='add'){$('#fAdd').reset();$('#gw').hidden=true;$('#bd').max=iso(today());dAdd.showModal();if(native)LocalNotifications.requestPermissions().catch(()=>{});return}
  else if(a=='dose'){const k=+el.dataset.k,it=items(p).find(i=>i.k==k);if(it.done&&it.t!='r'){delete p.done[k];save();sched(p)}else{pend=k;$('#dTit').textContent=`${it.n} · ${it.d}`;$('#dd').value=iso(today());$('#dd').max=iso(today());dDose.showModal();return}}
  else if(a=='all'){if(!confirm('Marcar como tomadas todas as vacinas previstas até hoje?'))return;items(p).forEach(i=>{if(i.t=='m'&&!i.done&&i.due<=today())p.done[i.k]=iso(i.due)});save();unsched(keys(p))}
  else if(a=='preg'){const w=parseInt(prompt('Quantas semanas de gestação você tem hoje? (1 a 42)'),10);if(!(w>=1&&w<=42))return;await unsched(keys(p));p.g=iso(addD(today(),-w*7));save();sched(p)}
  else if(a=='endg'){if(!confirm('Encerrar a gestação e voltar ao calendário normal?'))return;await unsched(keys(p));delete p.g;save();sched(p)}
  else if(a=='del'){if(!confirm('Excluir '+p.name+' e todos os registros?'))return;await unsched(keys(p));S.people=S.people.filter(x=>x!=p);V.pid=null;save()}
  render()});
$('#cAdd').onclick=()=>dAdd.close();$('#cDose').onclick=()=>dDose.close();
$('#fAdd').onsubmit=e=>{e.preventDefault();const p={id:S.next++,name:$('#nm').value.trim(),birth:$('#bd').value,av:+document.querySelector('input[name=av]:checked').value,done:{}};
  const w=parseInt($('#gk').value,10);if($('#gs').checked&&w>=1&&w<=42&&ageM(p.birth)>=120)p.g=iso(addD(today(),-w*7));
  S.people.push(p);save();sched(p);V.pid=p.id;dAdd.close();render()};
$('#fDose').onsubmit=e=>{e.preventDefault();const p=S.people.find(x=>x.id==V.pid);p.done[pend]=$('#dd').value;unsched([p.id*1000+pend]);save();sched(p);dDose.close();render()};
load();render();
