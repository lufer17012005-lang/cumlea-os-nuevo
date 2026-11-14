/* Módulos añadidos: base editable, CSV, espacio muestral, árbol, Bayes, binomial, simulador y conclusiones. */
(function(){
const $=id=>document.getElementById(id), DIM=[31,28,31,30,31,30,31,31,30,31,30,31], p2=n=>String(n).padStart(2,"0");
const KEY="paradoja_cumpleanos_v2", ok=(d,m)=>Number.isInteger(d)&&Number.isInteger(m)&&m>=1&&m<=12&&d>=1&&d<=DIM[m-1];
const pNo=n=>{let r=1;for(let i=0;i<n;i++)r*=Math.max(365-i,0)/365;return r};
const P=x=>x>0&&x<1e-4?fmtNum(x*100,8)+"%":fmtNum(x*100,x>.9999?6:2)+"%";
const html=(id,h)=>{$(id).innerHTML=h}, msg=t=>{$("importMsg").textContent=t};
const card=(a,b,c)=>`<div class="measure-card"><span>${a}</span><strong>${b}</strong><small>${c}</small></div>`;
const pairs=()=>records.map(r=>[r.dia,r.mes]);
function setRecords(list){records=list.map(([d,m],i)=>({id:i+1,dia:d,mes:m,fecha:p2(d)+"/"+p2(m)}));try{localStorage.setItem(KEY,JSON.stringify(list))}catch(e){}refreshAll()}
try{const s=JSON.parse(localStorage.getItem(KEY)||"null");if(Array.isArray(s)&&s.every(x=>ok(x[0],x[1]))){records=s.map(([d,m],i)=>({id:i+1,dia:d,mes:m,fecha:p2(d)+"/"+p2(m)}));recompute()}}catch(e){}
const ORIGINAL=(window.CUMPLEANOS||[]).map(r=>[r.dia,r.mes]);

/* ---------- Espacio muestral y complemento ---------- */
function renderSS(){
  const n=+$("ssN").value;$("ssNOut").textContent=n+(n===1?" persona":" personas");
  let om=1n,ac=1n;for(let i=0;i<n;i++){om*=365n;ac*=BigInt(Math.max(365-i,0))}
  const B=x=>{const s=x.toString();return s.length<=12?Number(x).toLocaleString("es-CO"):`${s[0]},${s.slice(1,4)} × 10<sup>${s.length-1}</sup>`},pc=pNo(n);
  html("ssCards",card("ESPACIO MUESTRAL Ω",B(om),`|Ω| = 365<sup>${n}</sup>`)+card("COMPLEMENTO Aᶜ",B(ac),"|Aᶜ| = 365·364·…·(365−n+1)")+card("EVENTO A",B(om-ac),"|A| = |Ω| − |Aᶜ|")+card("P(Aᶜ)",P(pc),"todos distintos")+card("P(A) = 1 − P(Aᶜ)",P(1-pc),"al menos una coincidencia")+card("COMPROBACIÓN",fmtNum((1-pc)+pc,4),"P(A) + P(Aᶜ) = 1"));
  const f=Array.from({length:Math.min(n,5)},(_,i)=>`${365-i}/365`).join(" × ")+(n>5?` × … × ${366-n}/365`:"");
  $("ssSteps").innerHTML=`P(Aᶜ) = ${f} = ${P(pc)}<br>A ∪ Aᶜ = Ω y A ∩ Aᶜ = ∅, por eso P(A) = 1 − P(Aᶜ) = <b>${P(1-pc)}</b>.`;
}

/* ---------- Árbol de probabilidad (cumpleaños) ---------- */
function renderTree(){
  const n=+$("treeN").value;$("treeNOut").textContent=n+" personas";
  const X=k=>60+(k-1)*150,W=110+n*150;let s=`<svg viewBox="0 0 ${W} 240" width="${W}" height="240" font-size="11" font-family="DM Sans">`,acc=1,rows=[];
  for(let k=1;k<=n;k++){
    if(k>1){const c=(k-1)/365,d=(366-k)/365,leaf=acc*c;rows.push([`Primera coincidencia en la persona ${k}`,leaf]);
      s+=`<line x1="${X(k-1)}" y1="60" x2="${X(k)}" y2="60" stroke="#1fa88a" stroke-width="2"/><text x="${X(k-1)+75}" y="50" text-anchor="middle" fill="#1f8f69">distinto ${366-k}/365</text>`;
      s+=`<line x1="${X(k-1)}" y1="60" x2="${X(k)-20}" y2="160" stroke="#efa45b" stroke-width="2"/><text x="${X(k-1)+12}" y="125" fill="#b8650f">coincide ${k-1}/365</text>`;
      s+=`<rect x="${X(k)-70}" y="160" width="100" height="46" rx="9" fill="#fdf1e3"/><text x="${X(k)-20}" y="179" text-anchor="middle">Coincide (p${k})</text><text x="${X(k)-20}" y="196" text-anchor="middle" font-weight="700">${fmtNum(leaf*100,3)}%</text>`;acc*=d}
    s+=k<n?`<circle cx="${X(k)}" cy="60" r="11" fill="#e0517f"/><text x="${X(k)}" y="64" text-anchor="middle" fill="#fff">${k}</text>`:`<rect x="${X(k)-10}" y="38" width="106" height="46" rx="9" fill="#e4f6ee"/><text x="${X(k)+43}" y="57" text-anchor="middle">Todos distintos</text><text x="${X(k)+43}" y="74" text-anchor="middle" font-weight="700">${fmtNum(acc*100,3)}%</text>`}
  $("treeBox").innerHTML=s+"</svg>";rows.push(["Todas las fechas distintas (Aᶜ)",acc]);
  html("treeBody",rows.map(r=>`<tr><td>${r[0]}</td><td>${fmtNum(r[1]*100,4)}%</td></tr>`).join(""));
  html("treeFoot",`<tr><td>Suma de ramas = 100%. P(A) = suma de coincidencias = 1 − P(Aᶜ)</td><td>${fmtNum(rows.reduce((a,r)=>a+r[1],0)*100,4)}% · P(A) = ${fmtNum((1-acc)*100,4)}%</td></tr>`);
}

/* ---------- Bayes ---------- */
function tree2(root,br){
  const L=br.reduce((a,b)=>a+b.k.length,0),H=L*54+20;let y=10,s=`<svg viewBox="0 0 800 ${H}" width="100%" style="min-width:660px" font-size="11" font-family="DM Sans"><rect x="4" y="${H/2-18}" width="96" height="36" rx="9" fill="#352538"/><text x="52" y="${H/2+4}" text-anchor="middle" fill="#fff">${root}</text>`;
  br.forEach(b=>{const by=y+b.k.length*27;
    s+=`<line x1="100" y1="${H/2}" x2="230" y2="${by}" stroke="#ff9ab3" stroke-width="1.6"/><text x="150" y="${(H/2+by)/2-6}" fill="#e0517f">${b.pr}</text><rect x="230" y="${by-18}" width="160" height="36" rx="9" fill="#ffeaef"/><text x="310" y="${by+4}" text-anchor="middle">${b.l}</text>`;
    b.k.forEach((q,i)=>{const ly=y+i*54+27;s+=`<line x1="390" y1="${by}" x2="470" y2="${ly}" stroke="#eec4ce" stroke-width="1.4"/><text x="415" y="${(by+ly)/2-4}" fill="#a88b92">${q.pr}</text><rect x="470" y="${ly-18}" width="180" height="36" rx="9" fill="#fdf1e3"/><text x="560" y="${ly+4}" text-anchor="middle">${q.l}</text><text x="665" y="${ly+4}" font-weight="700">${q.j}</text>`});y+=b.k.length*54});
  return s+"</svg>"}
function renderBayes(){
  const n1=Math.min(100,Math.max(2,+$("bN1").value||23)),n2=Math.min(100,Math.max(2,+$("bN2").value||10)),g=Math.min(.99,Math.max(.01,(+$("bPrior").value||50)/100)),c1=1-pNo(n1),c2=1-pNo(n2),pc=g*c1+(1-g)*c2,post=g*c1/pc,post0=g*(1-c1)/(1-pc);
  $("bayesTree1").innerHTML=tree2("Se elige un grupo",[{l:`Grupo 1 (${n1} pers.)`,pr:fmtNum(g,3),k:[{l:"C: hay coincidencia",pr:fmtNum(c1,4),j:fmtNum(g*c1,4)},{l:"Cᶜ: sin coincidencia",pr:fmtNum(1-c1,4),j:fmtNum(g*(1-c1),4)}]},{l:`Grupo 2 (${n2} pers.)`,pr:fmtNum(1-g,3),k:[{l:"C: hay coincidencia",pr:fmtNum(c2,4),j:fmtNum((1-g)*c2,4)},{l:"Cᶜ: sin coincidencia",pr:fmtNum(1-c2,4),j:fmtNum((1-g)*(1-c2),4)}]}]);
  html("bayesCards1",card("P(C) TOTAL",fmtNum(pc,4),"ley de probabilidad total")+card("P(Grupo 1 | C)",P(post),`a priori: ${P(g)}`)+card("P(Grupo 1 | Cᶜ)",P(post0),"si NO hubo coincidencia")+card("P(Grupo 2 | C)",P(1-post),"complemento"));
  const m=+$("bMonth").value||1,N=records.length,fm=monthCounts[m-1],sm=records.filter(r=>r.mes===m&&counts.get(r.fecha)>1).length,pS=sharedPeople/(N||1),pM=fm/(N||1),sM=fm?sm/fm:0,so=N-fm?(sharedPeople-sm)/(N-fm):0,pos=sharedPeople?sm/sharedPeople:0;
  $("bayesTree2").innerHTML=tree2("Una persona",[{l:`Mes: ${MONTHS[m-1]}`,pr:fmtNum(pM,3),k:[{l:"S: fecha compartida",pr:fmtNum(sM,3),j:fmtNum(pM*sM,4)},{l:"Sᶜ: fecha única",pr:fmtNum(1-sM,3),j:fmtNum(pM*(1-sM),4)}]},{l:"Otro mes",pr:fmtNum(1-pM,3),k:[{l:"S: fecha compartida",pr:fmtNum(so,3),j:fmtNum((1-pM)*so,4)},{l:"Sᶜ: fecha única",pr:fmtNum(1-so,3),j:fmtNum((1-pM)*(1-so),4)}]}]);
  html("bayesCards2",card("P(Mes)",P(pM),`${fm} de ${N} personas`)+card("P(S | Mes)",P(sM),"fechas compartidas del mes")+card("P(S)",P(pS),"en toda la base")+card("P(Mes | S)",P(pos),"Bayes = P(S|Mes)·P(Mes) / P(S)"));
}

/* ---------- Binomial ---------- */
const lf=[0];const lnF=n=>{while(lf.length<=n)lf.push(lf[lf.length-1]+Math.log(lf.length));return lf[n]};
const pmf=(n,p,k)=>k<0||k>n?0:p<=0?+(k===0):p>=1?+(k===n):Math.exp(lnF(n)-lnF(k)-lnF(n-k)+k*Math.log(p)+(n-k)*Math.log(1-p));
const inEv=(m,k,x,k2=k)=>({eq:x===k,le:x<=k,lt:x<k,ge:x>=k,gt:x>k,ne:x!==k,bt:x>=Math.min(k,k2)&&x<=Math.max(k,k2)})[m];
const parseP=s=>{s=String(s).trim().replace(",",".");let v;if(s.includes("/")){const[a,b]=s.split("/").map(Number);v=a/b}else if(s.endsWith("%"))v=parseFloat(s)/100;else v=parseFloat(s);return Number.isFinite(v)&&v>=0&&v<=1?v:NaN};
function renderBin(){
  const n=Math.min(2000,Math.max(1,Math.round(+$("binN").value||1))),p=parseP($("binP").value),k=Math.max(0,Math.round(+$("binK").value||0)),m=$("binMode").value,k2=Math.max(0,Math.round(+$("binK2").value||0));
  $("binK2w").hidden=m!=="bt";
  if(Number.isNaN(p)){html("binCards",card("p NO VÁLIDA","—","Escribe p entre 0 y 1, como 0,25 · 25% · 1/365"));return}
  const lo2=Math.min(k,k2),hi2=Math.max(k,k2),xs=[];let pr=0;for(let x=0;x<=n;x++)if(inEv(m,k,x,k2)){xs.push(x);pr+=pmf(n,p,x)}pr=Math.min(1,pr);
  const lab={eq:`P(X = ${k})`,le:`P(X ≤ ${k})`,lt:`P(X < ${k})`,ge:`P(X ≥ ${k})`,gt:`P(X > ${k})`,ne:`P(X ≠ ${k})`,bt:`P(${lo2} ≤ X ≤ ${hi2})`}[m];
  html("binCards",card(lab,P(pr),fmtNum(pr,6)+" en decimal")+card("E(X) = np",fmtNum(n*p,4),"valor esperado")+card("Var(X) = np(1−p)",fmtNum(n*p*(1-p),4),"varianza")+card("σ = √Var",fmtNum(Math.sqrt(n*p*(1-p)),4),"desviación estándar"));
  const term=x=>`C(${n},${x})·${fmtNum(p,4)}<sup>${x}</sup>·${fmtNum(1-p,4)}<sup>${n-x}</sup> = ${fmtNum(pmf(n,p,x),6)}`;
  let st=`<div class="formula-label">SOLUCIÓN PASO A PASO</div><p>X ~ Bin(${n}, ${fmtNum(p,6)}) · P(X = x) = C(n,x)·pˣ·(1−p)ⁿ⁻ˣ</p>`;
  st+=!xs.length?"<p>El evento es imposible: probabilidad 0.</p>":xs.length<=5?`<p>${xs.map(term).join("<br>")}${xs.length>1?`<br>Suma = <b>${P(pr)}</b>`:""}</p>`:`<p>Se suman ${xs.length} términos P(X = x), de x = ${xs[0]} a x = ${xs[xs.length-1]}${m==="ne"?" (todos menos "+k+")":""} → <b>${P(pr)}</b>${(m==="ge"&&k>=1)?`<br>Equivale a 1 − P(X ≤ ${k-1})`:m==="gt"?`<br>Equivale a 1 − P(X ≤ ${k})`:m==="ne"?`<br>Equivale a 1 − P(X = ${k})`:""}</p>`;
  html("binSteps",st);
  const mu=n*p,sd=Math.sqrt(n*p*(1-p));let lo=0,hi=n;if(n>40){lo=Math.max(0,Math.floor(mu-4*sd-1));hi=Math.min(n,Math.max(lo+10,Math.ceil(mu+4*sd+1)))}
  const v=[];let cum=0;for(let x=0;x<=hi;x++){const y=pmf(n,p,x);cum+=y;if(x>=lo)v.push([x,y,Math.min(1,cum),Math.max(0,1-(cum-y))])}
  html("binTable",v.map(([x,y,c,u])=>`<tr${inEv(m,k,x,k2)?' style="background:#fde6ee"':""}><td>${x}</td><td>${fmtNum(y,6)}</td><td>${fmtNum(c,6)}</td><td>${fmtNum(u,6)}</td></tr>`).join(""));
  const {ctx,w,h}=canvasContext($("binChart"));ctx.clearRect(0,0,w,h);const mx=Math.max(...v.map(a=>a[1]),1e-9),L=34,B=24,sl=(w-L-10)/v.length;
  ctx.font='9px "DM Sans"';v.forEach(([x,y],i)=>{const bh=(h-B-14)*y/mx,bx=L+i*sl+sl*.12;ctx.fillStyle=inEv(m,k,x,k2)?COLORS.purple:COLORS.pale;ctx.fillRect(bx,h-B-bh,sl*.76,bh);if(v.length<=24||i%Math.ceil(v.length/12)===0){ctx.fillStyle=COLORS.text;ctx.textAlign="center";ctx.fillText(x,bx+sl*.38,h-B+12)}});
  ctx.fillStyle=COLORS.text;ctx.textAlign="right";ctx.fillText(fmtNum(mx,3),L-4,14);ctx.fillText("0",L-4,h-B)
}
function renderBC(){
  const n=Math.max(1,Math.min(365,Math.round(+$("bcN").value||1))),t=Math.min(.9999,Math.max(.0001,(+$("bcT").value||50)/100)),pc=pNo(n);let m=1;while(m<365&&1-pNo(m)<t)m++;
  html("bcCards",card("P(HAYA COINCIDENCIA)",P(1-pc),`entre ${n} personas (A)`)+card("P(TODOS DISTINTOS)",P(pc),"complemento Aᶜ")+card("PERSONAS NECESARIAS",m,`para llegar a ${P(t)}`)+card("P(ALGUIEN EN UNA FECHA DADA)",P(1-Math.pow(364/365,n)),"1 − (364/365)ⁿ")+card("PARES POSIBLES",n*(n-1)/2,"C(n,2)")+card("COINCIDENCIAS ESPERADAS",fmtNum(n*(n-1)/2/365,3),"C(n,2)/365"))}
function exercises(){
  const p1=1/365,q0=Math.pow(364/365,30),pg=pNo(30),p23=1-pNo(23),n=10,b5=pmf(n,p23,5);let b6=0;for(let x=6;x<=n;x++)b6+=pmf(n,p23,x);
  html("exercises",`<div class="exercise-card"><h4>Ejercicio 1 · Una fecha específica</h4><p>En un curso de 30 estudiantes, ¿cuál es la probabilidad de que <b>al menos uno</b> cumpla años el 15 de marzo?</p><p>X = estudiantes que cumplen ese día. X ~ Bin(30, 1/365).</p><p>a) P(X = 0) = (364/365)³⁰ = <b>${fmtNum(q0,4)}</b></p><p>b) P(X ≥ 1) = 1 − P(X = 0) = <b>${P(1-q0)}</b></p><p>c) E(X) = 30/365 = <b>${fmtNum(30/365,4)}</b></p><p><i>Contraste:</i> la probabilidad de que <b>cualquier</b> pareja del grupo coincida es ${P(1-pg)}. Por eso es una paradoja: pedir una fecha concreta es mucho más difícil.</p><button class="row-btn" data-ex="1">Probar en la calculadora</button></div>
  <div class="exercise-card"><h4>Ejercicio 2 · Grupos de 23 personas</h4><p>Se forman 10 grupos independientes de 23 personas. Cada uno tiene p = P(coincidencia) = ${fmtNum(p23,4)}. X = grupos con al menos una coincidencia, X ~ Bin(10, ${fmtNum(p23,4)}).</p><p>a) P(X = 5) = C(10,5)·p⁵·(1−p)⁵ = 252 · … = <b>${fmtNum(b5,4)}</b></p><p>b) P(X ≥ 6) = Σₖ₌₆¹⁰ P(X = k) = <b>${P(b6)}</b></p><p>c) E(X) = np = <b>${fmtNum(n*p23,3)}</b> grupos; σ = √(np(1−p)) = <b>${fmtNum(Math.sqrt(n*p23*(1-p23)),3)}</b></p><button class="row-btn" data-ex="2">Probar en la calculadora</button></div>`);
}

/* ---------- Simulador ---------- */
const ord=o=>{let m=0;while(o>DIM[m]){o-=DIM[m];m++}return p2(o)+"/"+p2(m+1)};
let sim=[];
function drawSim(t){
  const {ctx,w,h}=canvasContext($("simChart"));ctx.clearRect(0,0,w,h);if(!sim.length)return;const L=36,B=22,R=10,T=10,X=i=>L+i/(sim.length-1||1)*(w-L-R),Y=v=>T+(1-v)*(h-T-B);
  ctx.font='9px "DM Sans"';ctx.fillStyle=COLORS.text;ctx.strokeStyle=COLORS.grid;[0,.25,.5,.75,1].forEach(v=>{ctx.beginPath();ctx.moveTo(L,Y(v));ctx.lineTo(w-R,Y(v));ctx.stroke();ctx.textAlign="right";ctx.fillText(v*100+"%",L-5,Y(v)+3)});
  ctx.setLineDash([5,4]);ctx.strokeStyle=COLORS.orange;ctx.beginPath();ctx.moveTo(L,Y(t));ctx.lineTo(w-R,Y(t));ctx.stroke();ctx.setLineDash([]);
  ctx.strokeStyle=COLORS.purple;ctx.lineWidth=2;ctx.beginPath();sim.forEach((v,i)=>i?ctx.lineTo(X(i),Y(v)):ctx.moveTo(X(i),Y(v)));ctx.stroke();ctx.lineWidth=1;ctx.fillStyle=COLORS.text;ctx.textAlign="left";ctx.fillText("Proporción acumulada (violeta) vs. teórica (naranja)",L+6,h-6)}
function simMany(){
  const n=+$("simN").value,R=+$("simReps").value,t=1-pNo(n),step=Math.max(1,Math.floor(R/200));let hit=0;sim=[];
  for(let i=1;i<=R;i++){const s=new Set();let d=false;for(let j=0;j<n;j++){const v=1+Math.floor(Math.random()*365);if(s.has(v)){d=true;break}s.add(v)}if(d)hit++;if(i%step===0||i===R)sim.push(hit/i)}
  const o=hit/R,me=1.96*Math.sqrt(t*(1-t)/R);
  html("simCards",card("GRUPOS CON COINCIDENCIA",`${hit} de ${R}`,"resultado del experimento")+card("PROPORCIÓN SIMULADA",P(o),"frecuencia relativa")+card("PROBABILIDAD TEÓRICA",P(t),`n = ${n} personas`)+card("DIFERENCIA",fmtNum((o-t)*100,2)+" pp",`margen típico ±${fmtNum(me*100,2)} pp`));drawSim(t)}
function simOne(){
  const n=+$("simN").value,a=Array.from({length:n},()=>1+Math.floor(Math.random()*365)),c=new Map();a.forEach(v=>c.set(v,(c.get(v)||0)+1));
  html("simChips",a.slice().sort((x,y)=>x-y).map(v=>`<span class="chip${c.get(v)>1?" hit":""}">${ord(v)}</span>`).join(""));
  const d=[...c.values()].filter(x=>x>1).length;$("simMsg").textContent=d?`Hubo coincidencia: ${d} fecha(s) compartida(s) (en naranja).`:"En este grupo todas las fechas son distintas."}

/* ---------- Conclusiones ---------- */
function renderConc(){
  const N=records.length,pr=[...counts.values()].reduce((a,f)=>a+f*(f-1)/2,0),ex=N*(N-1)/2/365,first=t=>{let n=1;while(n<365&&1-pNo(n)<t)n++;return n};
  const n1=+$("bN1").value||23,n2=+$("bN2").value||10,g=(+$("bPrior").value||50)/100,c1=1-pNo(n1),c2=1-pNo(n2),post=g*c1/(g*c1+(1-g)*c2),p23=1-pNo(23);let b6=0;for(let x=6;x<=10;x++)b6+=pmf(10,p23,x);
  html("conclusionBox",`<article><h3>Hallazgos</h3><ul><li>En los ${N} registros hay ${repeated.length} fechas compartidas que agrupan ${sharedPeople} personas (${fmtNum(sharedPeople/(N||1)*100,1)}%).</li><li>Pares con la misma fecha: ${pr} observados frente a ≈ ${fmtNum(ex,2)} esperados por el modelo (C(${N},2)/365).</li><li>Con 23 personas la probabilidad de coincidencia es ${P(p23)}; llega al 90% con ${first(.9)} y al 99% con ${first(.99)}.</li><li>Bayes: ver una coincidencia eleva P(grupo de ${n1}) de ${P(g)} a ${P(post)} frente a un grupo de ${n2}.</li><li>Binomial: entre 10 grupos de 23, P(al menos 6 con coincidencia) = ${P(b6)}.</li></ul></article>
  <article><h3>Conclusiones</h3><ul><li>La coincidencia crece rápido porque el número de pares aumenta como n(n−1)/2, no como n.</li><li>Calcular el complemento Aᶜ (todos distintos) es más simple que contar A directamente, y el árbol lo muestra paso a paso.</li><li>La proporción observada en los datos y la probabilidad teórica miden cosas distintas, pero los pares observados se acercan a lo esperado por azar.</li><li>El simulador confirma el modelo: al repetir muchas veces, la frecuencia converge a la probabilidad teórica.</li></ul></article>
  <article><h3>Recomendación</h3><ul><li>Presentar los 100 registros como <b>datos simulados</b>, no como una encuesta real.</li><li>Declarar los supuestos: 365 días equiprobables, independencia y sin 29 de febrero.</li><li>Para validar con datos reales, recolectar grupos de 23 o más personas y repetir la comparación observada vs. teórica.</li><li>Usar el simulador con más repeticiones para reducir el margen de error.</li></ul></article>`)}

window.renderExtras=function(){renderSS();renderTree();renderBayes();renderConc()};

document.addEventListener("DOMContentLoaded",()=>{
  ["addMonth","bMonth"].forEach(id=>{$(id).innerHTML=MONTHS.map((m,i)=>`<option value="${i+1}">${m}</option>`).join("")});
  {const sh=MONTHS.map((_,i)=>records.filter(r=>r.mes===i+1&&counts.get(r.fecha)>1).length);$("bMonth").value=sh.indexOf(Math.max(...sh))+1}
  $("addBtn").onclick=()=>{const d=+$("addDay").value,m=+$("addMonth").value;if(!ok(d,m))return msg("Fecha no válida (se excluye el 29 de febrero).");setRecords([...pairs(),[d,m]]);$("addDay").value="";msg(`Registro agregado: ${p2(d)}/${p2(m)}.`)};
  $("participantsBody").onclick=e=>{const b=e.target.closest("button");if(!b)return;const id=+b.dataset.id,r=records.find(x=>x.id===id);if(!r)return;
    if(b.dataset.act==="del"){if(confirm(`¿Eliminar el registro #${id} (${r.fecha})?`)){setRecords(records.filter(x=>x.id!==id).map(x=>[x.dia,x.mes]));msg("Registro eliminado.")}}
    else{const v=prompt("Nueva fecha (DD/MM):",r.fecha);if(v===null)return;const t=v.split(/[\/\-]/).map(Number);if(t.length!==2||!ok(t[0],t[1]))return msg("Fecha no válida.");setRecords(records.map(x=>x.id===id?[t[0],t[1]]:[x.dia,x.mes]));msg("Registro modificado.")}};
  $("importFile").onchange=async e=>{const f=e.target.files[0];if(!f)return;const ls=(await f.text()).replace(/^\uFEFF/,"").split(/\r?\n/).filter(l=>l.trim()),sep=ls[0]&&ls[0].includes(";")?";":",",out=[];let bad=0;
    const h=(ls[0]||"").split(sep).map(x=>x.replace(/"/g,"").trim().toLowerCase()),iD=h.findIndex(x=>/^d[ií]a$/.test(x)),iM=h.indexOf("mes");
    ls.forEach((l,i)=>{const c=l.split(sep).map(x=>x.replace(/"/g,"").trim()),fe=c.find(x=>/^\d{1,2}[\/\-]\d{1,2}$/.test(x));let d,m;
      if(fe)[d,m]=fe.split(/[\/\-]/).map(Number);else if(i&&iD>=0&&iM>=0){d=+c[iD];m=+c[iM]||MONTHS.findIndex(x=>x.toLowerCase()===(c[iM]||"").toLowerCase())+1}else{if(i)bad++;return}
      ok(d,m)?out.push([d,m]):bad++});
    e.target.value="";if(!out.length)return msg("No se encontraron fechas válidas (formato DD/MM o columnas Día y Mes).");
    setRecords($("importMode").value==="append"?[...pairs(),...out]:out);msg(`CSV importado: ${out.length} registros válidos, ${bad} filas omitidas.`)};
  $("resetData").onclick=()=>{if(confirm("¿Restaurar los 100 registros originales? Se perderán los cambios."))setRecords(ORIGINAL.slice()),msg("Base restaurada.")};
  ["ssN","treeN"].forEach(id=>$(id).addEventListener("input",()=>id==="ssN"?renderSS():renderTree()));
  ["bN1","bN2","bPrior","bMonth"].forEach(id=>$(id).addEventListener("input",()=>{renderBayes();renderConc()}));
  ["binN","binP","binK","binK2","binMode"].forEach(id=>$(id).addEventListener("input",renderBin));
  $("exercises").onclick=e=>{const b=e.target.closest("[data-ex]");if(!b)return;const v=b.dataset.ex==="1"?[30,1/365,1,"ge"]:[10,1-pNo(23),6,"ge"];$("binN").value=v[0];$("binP").value=v[1];$("binK").value=v[2];$("binMode").value=v[3];renderBin();$("binomial").scrollIntoView({behavior:"smooth"})};
  $("simN").addEventListener("input",()=>$("simNOut").textContent=$("simN").value);$("simOne").onclick=simOne;$("simMany").onclick=simMany;
  ["bcN","bcT"].forEach(id=>$(id).addEventListener("input",renderBC));exercises();renderExtras();renderBin();renderBC();simOne();simMany();
  window.addEventListener("resize",()=>{renderBin();drawSim(1-pNo(+$("simN").value))});
  const links=[...document.querySelectorAll(".nav-link")],secs=links.map(a=>document.querySelector(a.getAttribute("href")));
  window.addEventListener("scroll",()=>{let c=0;secs.forEach((s,i)=>{if(s&&s.getBoundingClientRect().top<140)c=i});links.forEach((a,i)=>a.classList.toggle("active",i===c))},{passive:true});
});
})();
