const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const COLORS = {purple:"#e0517f", orange:"#f08a4b", pale:"#f9d98e", grid:"#f1eaec", text:"#989bad", green:"#1fa88a", yellow:"#f2b134"};
const FIESTA=["#e0517f","#f2b134","#1fa88a","#f08a4b"];
let records = window.CUMPLEANOS || [];
let counts, repeated, sharedPeople, uniquePeople, distinctDates, monthCounts;
function recompute(){
  counts = new Map();
  records.forEach(r => counts.set(r.fecha, (counts.get(r.fecha)||0)+1));
  repeated = [...counts.entries()].filter(([,n])=>n>1).sort((a,b)=>a[0].localeCompare(b[0]));
  sharedPeople = records.filter(r=>counts.get(r.fecha)>1).length;
  uniquePeople = records.length-sharedPeople;
  distinctDates = counts.size;
  monthCounts = MONTHS.map((_,i)=>records.filter(r=>r.mes===i+1).length);
}
recompute();

function probability(n){
  if(n<2) return 0;
  if(n>365) return 100;
  let noMatch=1;
  for(let i=0;i<n;i++) noMatch *= (365-i)/365;
  return (1-noMatch)*100;
}
function formatPct(value){
  if(value>=99.999995) return value.toFixed(8).replace(".",",")+"%";
  if(value>=99.99) return value.toFixed(5).replace(".",",")+"%";
  return value.toFixed(2).replace(".",",")+"%";
}
function dateSortKey(date){const [d,m]=date.split("/").map(Number);return m*100+d}
function setupMetrics(){
  document.querySelectorAll("[data-n]").forEach(e=>e.textContent=records.length);
  document.getElementById("kpiTotal").textContent=records.length;
  document.getElementById("kpiDistinct").textContent=distinctDates;
  document.getElementById("kpiRepeated").textContent=repeated.length;
  document.getElementById("kpiSharedPeople").textContent=sharedPeople;
  document.getElementById("sharedPercent").textContent=(sharedPeople/(records.length||1)*100).toFixed(0)+"%";
  document.getElementById("donutTotal").textContent=records.length;
  document.getElementById("donutShared").textContent=sharedPeople;
  document.getElementById("donutUnique").textContent=uniquePeople;
  const topIndex=monthCounts.indexOf(Math.max(...monthCounts,0));
  document.getElementById("topMonth").textContent=`Mes más frecuente: ${MONTHS[topIndex].toLowerCase()}`;
  document.getElementById("insightTitle").textContent=`${repeated.length} fechas aparecen más de una vez`;
  document.getElementById("insightText").textContent=`${sharedPeople} participantes forman parte de fechas compartidas y ${uniquePeople} tienen una fecha única. Esto describe los datos simulados; no es la probabilidad teórica.`;
}
function canvasContext(canvas){
  const rect=canvas.getBoundingClientRect(), dpr=window.devicePixelRatio||1;
  canvas.width=Math.max(1,Math.round(rect.width*dpr)); canvas.height=Math.max(1,Math.round(rect.height*dpr));
  const ctx=canvas.getContext("2d");ctx.setTransform(dpr,0,0,dpr,0,0);return {ctx,w:rect.width,h:rect.height};
}
function drawBarChart(canvasId, labels, values, color, horizontal=false){
  const canvas=document.getElementById(canvasId);if(!canvas)return;
  const {ctx,w,h}=canvasContext(canvas);ctx.clearRect(0,0,w,h);
  const col=i=>Array.isArray(color)?color[i%color.length]:color;
  const left=horizontal?48:28,right=12,top=12,bottom=horizontal?18:34;
  const max=Math.max(...values,1), chartW=w-left-right, chartH=h-top-bottom;
  ctx.font='9px "DM Sans"';ctx.fillStyle=COLORS.text;ctx.strokeStyle=COLORS.grid;ctx.lineWidth=1;
  if(horizontal){
    const rowH=chartH/labels.length;
    values.forEach((v,i)=>{const y=top+i*rowH+rowH*.23,bh=rowH*.52,bw=chartW*v/(max*1.15);
      ctx.fillStyle="#fbeff2";ctx.fillRect(left,y,chartW,bh);
      const grad=ctx.createLinearGradient(left,0,left+bw,0);grad.addColorStop(0,col(i));grad.addColorStop(1,col(i)+"88");
      ctx.fillStyle=grad;roundRect(ctx,left,y,bw,bh,4);ctx.fill();
      ctx.fillStyle=COLORS.text;ctx.textAlign="right";ctx.textBaseline="middle";ctx.fillText(labels[i],left-9,y+bh/2);
      ctx.fillStyle="#6d5672";ctx.textAlign="left";ctx.fillText(String(v),Math.min(left+bw+6,w-12),y+bh/2);
    });
  }else{
    for(let i=0;i<=4;i++){const y=top+chartH-i*chartH/4;ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(w-right,y);ctx.stroke();ctx.textAlign="right";ctx.textBaseline="middle";ctx.fillText(String(Math.round(max*i/4)),left-7,y);}
    const slot=chartW/labels.length,bw=Math.min(25,slot*.58);
    values.forEach((v,i)=>{const bh=chartH*v/(max*1.2),x=left+i*slot+(slot-bw)/2,y=top+chartH-bh;const g=ctx.createLinearGradient(0,y,0,y+bh);g.addColorStop(0,col(i));g.addColorStop(1,col(i)+"88");ctx.fillStyle=g;roundRect(ctx,x,y,bw,bh,4);ctx.fill();ctx.fillStyle=COLORS.text;ctx.textAlign="center";ctx.textBaseline="top";ctx.fillText(labels[i].slice(0,3),x+bw/2,top+chartH+9);});
  }
}
function roundRect(ctx,x,y,w,h,r){if(w<=0||h<=0)return;ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function drawDonut(){
  const canvas=document.getElementById("donutChart");const {ctx,w,h}=canvasContext(canvas);ctx.clearRect(0,0,w,h);
  const total=sharedPeople+uniquePeople, cx=w/2,cy=h/2,r=Math.min(w,h)*.39;
  ctx.lineWidth=17;ctx.lineCap="round";ctx.beginPath();ctx.strokeStyle=COLORS.pale;ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();
  ctx.beginPath();ctx.strokeStyle=COLORS.purple;ctx.arc(cx,cy,r,-Math.PI/2,-Math.PI/2+Math.PI*2*sharedPeople/total);ctx.stroke();
}
function drawProbability(){
  const canvas=document.getElementById("probabilityChart");const {ctx,w,h}=canvasContext(canvas);ctx.clearRect(0,0,w,h);
  const l=36,r=13,t=12,b=27,cw=w-l-r,ch=h-t-b;
  ctx.font='9px "DM Sans"';ctx.strokeStyle=COLORS.grid;ctx.fillStyle=COLORS.text;ctx.lineWidth=1;
  [0,25,50,75,100].forEach(v=>{const y=t+ch-(v/100)*ch;ctx.beginPath();ctx.moveTo(l,y);ctx.lineTo(w-r,y);ctx.stroke();ctx.textAlign="right";ctx.textBaseline="middle";ctx.fillText(v+"%",l-7,y);});
  [2,20,40,60,80,100].forEach(v=>{const x=l+(v-2)/98*cw;ctx.textAlign="center";ctx.textBaseline="top";ctx.fillText(v,x,t+ch+8);});
  const pts=[];for(let n=2;n<=100;n++){pts.push({x:l+(n-2)/98*cw,y:t+ch-probability(n)/100*ch});}
  ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.lineTo(pts[pts.length-1].x,t+ch);ctx.lineTo(pts[0].x,t+ch);ctx.closePath();const fill=ctx.createLinearGradient(0,t,0,t+ch);fill.addColorStop(0,"#f08ca5");fill.addColorStop(1,"#f08ca508");ctx.fillStyle=fill;ctx.fill();
  ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle=COLORS.purple;ctx.lineWidth=2.5;ctx.stroke();
  const markerX=l+(23-2)/98*cw, markerY=t+ch-probability(23)/100*ch;
  ctx.setLineDash([4,4]);ctx.strokeStyle="#efa45b";ctx.beginPath();ctx.moveTo(markerX,t);ctx.lineTo(markerX,t+ch);ctx.stroke();ctx.setLineDash([]);
  ctx.beginPath();ctx.arc(markerX,markerY,4.5,0,Math.PI*2);ctx.fillStyle=COLORS.orange;ctx.fill();ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.stroke();
  const selected=Number(document.getElementById("groupSize").value), sx=l+(selected-2)/98*cw, sy=t+ch-probability(selected)/100*ch;
  ctx.beginPath();ctx.arc(sx,sy,5,0,Math.PI*2);ctx.fillStyle="#49344d";ctx.fill();ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.stroke();
}
function updateProbability(){
  const n=Number(document.getElementById("groupSize").value), p=probability(n);
  document.getElementById("groupOutput").textContent=n+" "+(n===1?"persona":"personas");
  document.getElementById("probCurrent").textContent=formatPct(p);
  drawProbability();
}
function renderTable(){
  const body=document.getElementById("participantsBody"),q=document.getElementById("searchInput").value.trim().toLowerCase(),month=document.getElementById("monthFilter").value,status=document.getElementById("statusFilter").value;
  const filtered=records.filter(r=>{
    const isShared=counts.get(r.fecha)>1;
    return (!month||String(r.mes)===month)&&(!status||(status==="shared"?isShared:!isShared))&&(!q||String(r.id).includes(q)||r.fecha.includes(q)||MONTHS[r.mes-1].toLowerCase().includes(q));
  });
  body.innerHTML=filtered.map(r=>{const shared=counts.get(r.fecha)>1;return `<tr><td><span class="participant-id">#${String(r.id).padStart(3,"0")}</span></td><td><span class="date-value">${r.fecha}</span></td><td>${MONTHS[r.mes-1]}</td><td><span class="status ${shared?"shared":"unique"}">${shared?"Fecha compartida":"Fecha única"}</span></td><td class="row-actions"><button class="row-btn" data-act="edit" data-id="${r.id}">Editar</button><button class="row-btn danger" data-act="del" data-id="${r.id}">Eliminar</button></td></tr>`}).join("");
  document.getElementById("resultCount").textContent=filtered.length+" registros";
  document.getElementById("tableSummary").textContent=filtered.length===records.length?`Mostrando los ${records.length} participantes`:`Mostrando ${filtered.length} de ${records.length} participantes`;
}
function exportCSV(){
  const rows=[["Participante","Fecha de cumpleaños","Día","Mes","Clasificación"]];
  records.forEach(r=>rows.push([r.id,r.fecha,r.dia,MONTHS[r.mes-1],counts.get(r.fecha)>1?"Fecha compartida":"Fecha única"]));
  const csv="\uFEFF"+rows.map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(";")).join("\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="cumpleanos_100_participantes.csv";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);showToast("Archivo CSV descargado correctamente.");
}
let toastTimer;
function showToast(message){const el=document.getElementById("toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2600)}

function ordinalDay(day, month){
  const lengths=[31,28,31,30,31,30,31,31,30,31,30,31];
  return lengths.slice(0,month-1).reduce((a,b)=>a+b,0)+day;
}
function frequencyRows(values, labels){
  const map=new Map();values.forEach(v=>map.set(v,(map.get(v)||0)+1));
  let cumulative=0;
  return labels.map(label=>{const fi=map.get(label.value)||0;cumulative+=fi;return {label:label.label,fi,hi:fi/(records.length||1),pct:fi/(records.length||1)*100,Fi:cumulative,Hi:cumulative/(records.length||1)};});
}
function fmtNum(value,digits=2){return Number(value).toLocaleString('es-CO',{minimumFractionDigits:digits,maximumFractionDigits:digits});}
function fillFrequencyTable(id,rows,columns,footer){
  const body=document.getElementById(id);if(!body)return;
  body.innerHTML=rows.map(row=>`<tr>${columns.map(col=>`<td>${col.format?col.format(row[col.key]):row[col.key]}</td>`).join('')}</tr>`).join('')||`<tr><td class="empty-cell" colspan="${columns.length}">Sin registros</td></tr>`;
  if(footer){const foot=document.getElementById(footer.id);if(foot)foot.innerHTML=`<tr>${footer.cells.map(v=>`<td>${v}</td>`).join('')}</tr>`;}
}
function calculateDescriptiveStatistics(){
  const sorted=records.map(r=>ordinalDay(r.dia,r.mes)).sort((a,b)=>a-b),n=sorted.length;
  if(!n)return;
  const mean=sorted.reduce((a,b)=>a+b,0)/n;
  const median=n%2?sorted[(n-1)/2]:(sorted[n/2-1]+sorted[n/2])/2;
  const frequencies=new Map();sorted.forEach(v=>frequencies.set(v,(frequencies.get(v)||0)+1));
  const maxFreq=Math.max(...frequencies.values());
  const modes=[...frequencies.entries()].filter(([,f])=>f===maxFreq).map(([v])=>v);
  const variance=sorted.reduce((sum,v)=>sum+(v-mean)**2,0)/n;
  const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value;};
  set('statMean',fmtNum(mean)+' días');set('statMedian',fmtNum(median)+' días');
  set('statMode',modes.length===n?'Sin moda':modes.map(v=>`${v}`).join(', ')+' días');
  set('statRange',(sorted[n-1]-sorted[0])+' días');set('statVariance',fmtNum(variance)+' días²');set('statDeviation',fmtNum(Math.sqrt(variance))+' días');
}
function buildStatisticalTables(){
  const monthRows=frequencyRows(records.map(r=>r.mes),MONTHS.map((m,i)=>({value:i+1,label:m})));
  fillFrequencyTable('monthFrequencyBody',monthRows,[
    {key:'label'},{key:'fi'},{key:'hi',format:v=>fmtNum(v,3)},{key:'pct',format:v=>fmtNum(v,2)+'%'},{key:'Fi'},{key:'Hi',format:v=>fmtNum(v,3)}
  ],{id:'monthFrequencyFoot',cells:['TOTAL',records.length,'1,000','100%',records.length,'1,000']});

  const dayRows=frequencyRows(records.map(r=>r.dia),Array.from({length:31},(_,i)=>({value:i+1,label:i+1}))).map(r=>({...r,label:String(r.label).padStart(2,'0')}));
  fillFrequencyTable('dayFrequencyBody',dayRows,[{key:'label'},{key:'fi'},{key:'hi',format:v=>fmtNum(v,3)},{key:'pct',format:v=>fmtNum(v,2)+'%'},{key:'Fi'}]);

  const exactRows=[...counts.entries()].filter(([,fi])=>fi>1).sort((a,b)=>dateSortKey(a[0])-dateSortKey(b[0])).map(([label,fi])=>({label,fi,pct:fi/records.length*100}));
  fillFrequencyTable('exactFrequencyBody',exactRows,[{key:'label'},{key:'fi'},{key:'pct',format:v=>fmtNum(v,2)+'%'}]);

  const ordinal=records.map(r=>ordinalDay(r.dia,r.mes));
  const intervals=Array.from({length:13},(_,i)=>({value:i,label:`${i*30+1}–${Math.min(i*30+30,365)}`}));
  const intervalRows=intervals.map((it,i)=>{const lo=i*30+1,hi=Math.min(i*30+30,365),fi=ordinal.filter(v=>v>=lo&&v<=hi).length;return {label:it.label,fi,hi:fi/(records.length||1),pct:fi/(records.length||1)*100};});
  let acc=0;intervalRows.forEach(r=>{acc+=r.fi;r.Fi=acc;});
  fillFrequencyTable('intervalFrequencyBody',intervalRows,[{key:'label'},{key:'fi'},{key:'hi',format:v=>fmtNum(v,3)},{key:'pct',format:v=>fmtNum(v,2)+'%'},{key:'Fi'}]);
  calculateDescriptiveStatistics();
  const sharedPct=sharedPeople/(records.length||1)*100;
  document.getElementById('observedShare').textContent=fmtNum(sharedPct,2)+'%';
  document.getElementById('observedDescription').textContent=`${sharedPeople} de ${records.length} personas (${fmtNum(sharedPct,2)}%) pertenecen a fechas que aparecen más de una vez. Es una proporción observada en esta base simulada.`;
  document.getElementById('theoreticalShare').textContent=formatPct(probability(records.length));
  window.frequencyExportRows={monthRows,dayRows,exactRows,intervalRows};
}
function exportFrequencyTables(){
  const groups=window.frequencyExportRows;if(!groups)return;
  const sections=[['TABLA DE FRECUENCIAS POR MES',['Mes','fi','hi','Porcentaje','Fi','Hi'],groups.monthRows.map(r=>[r.label,r.fi,fmtNum(r.hi,3),fmtNum(r.pct,2)+'%',r.Fi,fmtNum(r.Hi,3)])],
    ['TABLA DE FRECUENCIAS POR DIA DEL MES',['Dia','fi','hi','Porcentaje','Fi'],groups.dayRows.map(r=>[r.label,r.fi,fmtNum(r.hi,3),fmtNum(r.pct,2)+'%',r.Fi])],
    ['FECHAS EXACTAS REPETIDAS',['Fecha','fi','Porcentaje'],groups.exactRows.map(r=>[r.label,r.fi,fmtNum(r.pct,2)+'%'])],
    ['INTERVALOS DEL ANO',['Intervalo','fi','hi','Porcentaje','Fi'],groups.intervalRows.map(r=>[r.label,r.fi,fmtNum(r.hi,3),fmtNum(r.pct,2)+'%',r.Fi])]];
  const csv='\uFEFF'+sections.flatMap(([title,headers,rows])=>[[title],headers,...rows,[]]).map(row=>row.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(';')).join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='tablas_frecuencia_paradoja_cumpleanos.csv';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);showToast('Tablas de frecuencias exportadas.');
}

function drawCharts(){
  drawBarChart("monthlyChart",MONTHS,monthCounts,FIESTA);
  const top=repeated.slice().sort((a,b)=>b[1]-a[1]||dateSortKey(a[0])-dateSortKey(b[0])).slice(0,8);
  drawBarChart("repeatedChart",top.map(x=>x[0]),top.map(x=>x[1]),["#1fa88a","#f08a4b","#f2b134","#e0517f"],true);
  drawDonut();drawProbability();
}
function refreshAll(){
  recompute();setupMetrics();buildStatisticalTables();drawCharts();
  if(document.getElementById("monthFilter")) renderTable();
  if(window.renderExtras) window.renderExtras();
}
function init(){
  setupMetrics();
  buildStatisticalTables();
  const frequencyExport=document.getElementById("exportFrequency");if(frequencyExport)frequencyExport.addEventListener("click",exportFrequencyTables);
  drawBarChart("monthlyChart",MONTHS,monthCounts,FIESTA);
  const topRepeated=repeated.slice().sort((a,b)=>b[1]-a[1]||dateSortKey(a[0])-dateSortKey(b[0])).slice(0,8);
  drawBarChart("repeatedChart",topRepeated.map(x=>x[0]),topRepeated.map(x=>x[1]),["#1fa88a","#f08a4b","#f2b134","#e0517f"],true);
  drawDonut();updateProbability();
  const monthFilter=document.getElementById("monthFilter");
  MONTHS.forEach((m,i)=>{const opt=document.createElement("option");opt.value=String(i+1);opt.textContent=m;monthFilter.appendChild(opt)});
  renderTable();
  ["searchInput","monthFilter","statusFilter"].forEach(id=>document.getElementById(id).addEventListener(id==="searchInput"?"input":"change",renderTable));
  document.getElementById("groupSize").addEventListener("input",updateProbability);
  document.getElementById("exportCsv").addEventListener("click",exportCSV);
  document.getElementById("exportCsvTop").addEventListener("click",exportCSV);
  document.getElementById("mobileMenu").addEventListener("click",()=>document.getElementById("sidebar").classList.toggle("open"));
  document.querySelectorAll(".nav-link").forEach(a=>a.addEventListener("click",()=>document.getElementById("sidebar").classList.remove("open")));
  let resizeTimer;window.addEventListener("resize",()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{drawCharts();if(window.renderExtras)window.renderExtras()},120)});
}
document.addEventListener("DOMContentLoaded",init);
