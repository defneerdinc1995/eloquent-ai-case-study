import {
 SNAPSHOT_DATE,STORAGE_KEY,LOG_KEY,SEED,EDITABLE_IDS,ASSOCIATES,BRANCHES,STATUSES,TYPES,
 applyEdits,filterTransactions,computeMetrics,groupDaily,summarizeAssociates,
 validateDraft,normalizeDraft,money,integer,percentage,asUTC
} from './data.mjs';

const APP_NAME='ITM Operations';
function storageRead(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
const state={
 edits:storageRead(STORAGE_KEY,{}),logs:storageRead(LOG_KEY,[]),
 q:'',status:'All statuses',type:'All types',branch:'All branches',period:'30 days',
 pageNumber:1,pageSize:10,sort:'id',sortDirection:'asc',chart:'transactions',
 notifications:false,mobileMenu:false,draft:null,draftId:null,errors:[],toast:'',
 compact:storageRead('eloquent-compact',false),privacy:storageRead('eloquent-privacy',false),
};
let toastTimer;
const app=document.querySelector('#app');
const icons={
 'grid':'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
 'bank':'<path d="m3 10 9-7 9 7M4 10h16M6 10v9m4-9v9m4-9v9m4-9v9M3 21h18"/>',
 'arrows':'<path d="m7 7 4-4 4 4M11 3v11M17 17l-4 4-4-4m4 4V10"/>',
 'checklist':'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8 8 1 1 2-2m2 1h4m-9 5 1 1 2-2m2 1h4m-9 5 1 1 2-2m2 1h4"/>',
 'users':'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m14-13a4 4 0 1 1 0 8M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>',
 'clock':'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 'settings':'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.07.07-1.88 1.88-.07-.07A1.7 1.7 0 0 0 16 18.4l-.4 2.1h-2.67l-.4-2.1a1.7 1.7 0 0 0-1.9-1.12l-1.6 1.3-1.9-1.9 1.3-1.6A1.7 1.7 0 0 0 7.3 13l-2.1-.4V10l2.1-.4a1.7 1.7 0 0 0 1.12-1.9l-1.3-1.6 1.9-1.9 1.6 1.3A1.7 1.7 0 0 0 12.5 4.4l.4-2.1h2.67l.4 2.1a1.7 1.7 0 0 0 1.9 1.12l1.6-1.3 1.9 1.9-1.3 1.6a1.7 1.7 0 0 0 1.12 1.9l2.1.4v2.67l-2.1.4A1.7 1.7 0 0 0 19.4 15" transform="translate(-2,-1) scale(.95)"/>',
 'search':'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
 'bell':'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
 'calendar':'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
 'download':'<path d="M12 3v12m-4-4 4 4 4-4M5 18v3h14v-3"/>',
 'chevron-down':'<path d="m6 9 6 6 6-6"/>','chevron-right':'<path d="m9 5 7 7-7 7"/>','chevron-left':'<path d="m15 5-7 7 7 7"/>',
 'arrow-left':'<path d="m12 19-7-7 7-7M5 12h14"/>','arrow-right':'<path d="M5 12h14m-6-6 6 6-6 6"/>',
 'plus':'<path d="M12 5v14M5 12h14"/>','trash':'<path d="M3 6h18M8 6V4h8v2m3 0-1 15H6L5 6m5 4v7m4-7v7"/>',
 'shield':'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
 'chart':'<path d="M3 3v18h18M7 16l4-4 3 2 6-7"/>',
 'dollar':'<circle cx="12" cy="12" r="10"/><path d="M12 5v14M16 8c-2-2-8-2-8 1s8 2 8 5-6 3-8 1"/>',
 'alert':'<path d="m12 2 10 18H2L12 2Zm0 7v4m0 3h.01"/>',
 'check':'<path d="m5 12 4 4L19 6"/>',
 'info':'<circle cx="12" cy="12" r="10"/><path d="M12 11v6m0-10h.01"/>',
 'refresh':'<path d="M20 7v5h-5M4 17v-5h5M5 9a8 8 0 0 1 14-2l1 2M4 15l1 2a8 8 0 0 0 14-2"/>',
 'file':'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Zm0 0v6h6M8 13h8m-8 4h8"/>',
 'activity':'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
 'menu':'<path d="M3 6h18M3 12h18M3 18h18"/>',
 'close':'<path d="M18 6 6 18M6 6l12 12"/>',
 'lock':'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
 'eye':'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
};
function ic(name,size=17){return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.info}</svg>`;}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function route(){const s=(location.hash||'#/overview').replace(/^#\/?/,'');if(s.startsWith('transaction/'))return {name:'detail',id:s.slice('transaction/'.length)};return {name:s||'overview'};}
function currentRows(){return applyEdits(SEED,state.edits);}
function selectedRows(){return filterTransactions(currentRows(),state);}
function setToast(message){state.toast=message;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{state.toast='';document.querySelector('.toast')?.remove();},3200);}
function saveEdits(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state.edits));localStorage.setItem(LOG_KEY,JSON.stringify(state.logs));}
function moneyDisplay(amount){return state.privacy?'••••••':money(amount);}
function statusHtml(s){const cl=({Automated:'automated','Needs Review':'review',Processing:'processing',Manual:'manual'})[s]||'manual';return `<span class="status ${cl}">${esc(s)}</span>`;}
function timeLabel(row){return `${row.date.slice(5).replace('-','/')} • ${row.time}`;}
function numDelta(current,previous){return previous?((current-previous)/previous):0;}
const routes=[['overview','Overview','grid'],['transactions','Transactions','arrows'],['reconciliation','Reconciliation','checklist'],['associates','Associates','users'],['audit','Audit Trail','clock'],['settings','Settings','settings']];
function sidebar(active){return `<aside class="sidebar ${state.mobileMenu?'open':''}">
 <a class="brand" href="#/overview"><span class="brand-mark">${ic('bank',21)}</span><span><div class="brand-title">Eloquent<span style="color:#94abff">.</span></div><div class="brand-sub">OPERATIONS</div></span></a>
 <div class="nav-label">WORKSPACE</div><nav class="side-nav">${routes.slice(0,4).map(([id,label,icon])=>`<a class="nav-link ${id===active?'active':''}" href="#/${id}" data-nav="${id}">${ic(icon)}<span>${label}</span>${id==='reconciliation'?'<span style="margin-left:auto;font-size:9px;background:#334b6c;border-radius:7px;padding:3px 5px">NEW</span>':''}</a>`).join('')}</nav>
 <div class="nav-label">MANAGEMENT</div><nav class="side-nav">${routes.slice(4).map(([id,label,icon])=>`<a class="nav-link ${id===active?'active':''}" href="#/${id}" data-nav="${id}">${ic(icon)}<span>${label}</span></a>`).join('')}</nav>
 <div class="side-spacer"></div><div class="sidebar-panel"><div class="sidebar-panel-title">${ic('shield',15)} Safe operations first</div><p>Read-only demo data. All edits stay inside your browser.</p></div>
 <div class="sidebar-bottom"><span class="avatar">DM</span><span><div class="side-user">Demo Manager</div><div class="side-role">Workspace Admin</div></span></div></aside>`;}
function topbar(active){const crumb=active==='detail'?'Transaction Detail':routes.find(x=>x[0]===active)?.[1]||'Overview';
 return `<header class="topbar"><div class="breadcrumb"><button class="top-icon mobile-menu" data-action="menu" aria-label="Toggle menu">${ic('menu')}</button>Workspace ${ic('chevron-right',12)} <b>${esc(crumb)}</b></div><div class="topbar-right"><div class="date-label">${ic('calendar',15)} Thu, Nov 19, 2026</div><button class="top-icon" data-action="notifications" aria-label="Notifications" aria-expanded="${state.notifications}">${ic('bell',17)}<span class="notification-dot"></span></button><div class="separator"></div><div class="user-chip"><span class="avatar">DM</span><span>Demo Manager</span>${ic('chevron-down',12)}</div></div>
 ${state.notifications?`<div class="notifications"><h4>Notifications</h4><div class="notification-item"><b>Review queue</b><br>${integer(computeMetrics(currentRows()).needingReview)} synthetic records need review.</div><div class="notification-item"><b>Data status</b><br>Local sample dataset • No live bank connection.</div><div class="notification-item"><b>Saved changes</b><br>${integer(state.logs.length)} local edit event${state.logs.length===1?'':'s'}.</div></div>`:''}</header>`;}
function heading({overline='OVERVIEW',title,description,actions=''}){return `<div class="page-heading"><div><div class="eyebrow">${esc(overline)}</div><h1>${esc(title)}</h1><p class="page-description">${esc(description)}</p></div>${actions?`<div class="actions">${actions}</div>`:''}</div>`;}
function button(action,label,icon='download',primary=false){return `<button type="button" class="btn ${primary?'btn-primary':''}" data-action="${action}">${ic(icon,15)}${label}</button>`;}
function select(name,values,value){return `<select class="filter-control" aria-label="${esc(name)}" data-filter="${esc(name)}">${values.map(v=>`<option value="${esc(v)}" ${v===value?'selected':''}>${esc(v)}</option>`).join('')}</select>`;}
function smallPill(rate){return `<span class="trend-pill ${rate<0?'warn':''}">${rate>=0?'+':''}${(rate*100).toFixed(1)}%</span>`;}
function kpiGrid(rows){const m=computeMetrics(rows),all=currentRows(),now=asUTC(SNAPSHOT_DATE),prev7=all.filter(x=>asUTC(x.date)>=now-13*86400000&&asUTC(x.date)<=now-7*86400000),last7=all.filter(x=>asUTC(x.date)>=now-6*86400000); const trend=numDelta(last7.length,prev7.length);
 const kpis=[
  {label:'Total transactions',value:integer(m.total),subtitle:`${smallPill(trend)} vs previous 7 days`,icon:'arrows',color:'blue'},
  {label:'Automation rate',value:percentage(m.automationRate),subtitle:`${integer(m.automated)} completed automatically`,icon:'activity',color:'green'},
  {label:'Transaction volume',value:moneyDisplay(m.amount),subtitle:'Gross posted/processed value • demo',icon:'dollar',color:'purple'},
  {label:'Needs review',value:integer(m.needingReview),subtitle:`${integer(m.pending)} still processing`,icon:'alert',color:'amber'}];
 return `<section class="kpi-grid">${kpis.map(k=>`<div class="card kpi-card"><div class="kpi-top"><span class="kpi-label">${k.label}</span><span class="kpi-icon ${k.color}">${ic(k.icon,19)}</span></div><div class="kpi-value">${k.value}</div><div class="kpi-sub">${k.subtitle}</div></div>`).join('')}</section>`;}
function chart(rows){const daily=groupDaily(rows),max=Math.max(1,...daily.map(x=>x.total));
 const points=daily.map((x,i)=>({x:40+i*28.0,y:191-(x.total/max)*144,v:x.total,day:Number(x.date.slice(-2))}));
 const auto=daily.map((x,i)=>({x:40+i*28,y:191-(x.automated/max)*144,v:x.automated}));
 const path = pts => pts.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
 const p1=path(points),p2=path(auto),area=`${p1} L${points.at(-1).x},191 L${points[0].x},191 Z`;
 const labels=[0,.25,.5,.75,1].map(t=>{const y=191-144*t;return `<line class="chart-gridline" x1="39" x2="556" y1="${y}" y2="${y}"/><text class="chart-axis" x="28" y="${y+4}" text-anchor="end">${integer(max*t)}</text>`}).join('');
 const xlabels=daily.filter((_,i)=>i%3===0).map(d=>{const i=daily.findIndex(x=>x===d);return `<text class="chart-axis" x="${40+i*28}" y="221" text-anchor="middle">Nov ${Number(d.date.slice(-2))}</text>`}).join('');
 const graph=state.chart==='transactions'?`<defs><linearGradient id="chartGlow" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#6685f6" stop-opacity=".23"/><stop offset="100%" stop-color="#6685f6" stop-opacity=".01"/></linearGradient></defs><path d="${area}" fill="url(#chartGlow)"/><path d="${p1}" fill="none" stroke="#5975ed" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round"/><path d="${p2}" fill="none" stroke="#49c0b6" stroke-width="2.5" stroke-dasharray="6 5" stroke-linecap="round" stroke-linejoin="round"/>`:daily.map((d,i)=>{const full=(d.total/max)*144,done=(d.automated/max)*144;return `<rect x="${32+i*28}" y="${191-full}" width="17" height="${full}" rx="3" fill="#e1e8fa"/><rect x="${32+i*28}" y="${191-done}" width="17" height="${done}" rx="3" fill="#5b79ed"/>`}).join('');
 return `<div class="card chart-card"><div class="card-header"><div><h2 class="card-title">Transaction activity</h2><p class="card-description">Volume and automation performance over time</p></div><div class="mini-tabs"><button data-action="chart-transactions" class="${state.chart==='transactions'?'active':''}">Trend</button><button data-action="chart-bars" class="${state.chart==='bars'?'active':''}">Bars</button></div></div>
 <div class="chart-container"><svg class="line-chart-svg" viewBox="0 0 570 238" role="img" aria-label="Daily total and automated transaction counts for November 1 to 19">${labels}${graph}${xlabels}</svg></div><div class="chart-legend"><span><i class="chart-dot" style="background:#5b79ed"></i>Total transactions</span><span><i class="chart-dot" style="background:#49c0b6"></i>Automated</span></div></div>`;
}
function reconCard(rows){const m=computeMetrics(rows);const completedRate=m.total?m.automated/m.total*100:0;
 return `<div class="card recon-card"><div class="card-header"><div><h2 class="card-title">Workflow status</h2><p class="card-description">At-a-glance transaction distribution</p></div><span class="kpi-icon green" style="height:31px;width:31px">${ic('checklist',15)}</span></div>
 <div class="recon-hero"><div class="ring" style="--progress:${completedRate}%"><div class="ring-center">${percentage(m.automationRate)}<small>Automated</small></div></div><div class="recon-lines">
 <div class="recon-line"><span>Automated</span><b>${integer(m.automated)}</b></div><div class="recon-line human"><span>Manual / review</span><b>${integer(m.manual+m.needingReview)}</b></div><div class="recon-line pending"><span>Processing</span><b>${integer(m.pending)}</b></div>
 </div></div><div class="recon-note">${ic('shield',13)} &nbsp; Only explicitly saved changes affect these demo metrics. No actual posting occurs.</div></div>`;
}
function getTableRows(rows){const sorted=[...rows];const factor=state.sortDirection==='desc'?-1:1;
 if(state.sort==='amount')sorted.sort((a,b)=>(a.amount-b.amount)*factor);
 else if(state.sort==='date')sorted.sort((a,b)=>(`${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))*factor);
 else if(state.sort==='status')sorted.sort((a,b)=>a.status.localeCompare(b.status)*factor);
 else sorted.sort((a,b)=>a.id.localeCompare(b.id)*factor);
 return sorted;}
function tableControls(){return `<div class="filters"><div class="search-wrapper">${ic('search',15)}<input class="filter-control" id="transaction-search" type="search" placeholder="Search transactions, customers..." value="${esc(state.q)}" aria-label="Search transactions" data-filter="q"></div>${select('status',['All statuses',...STATUSES],state.status)}${select('type',['All types',...TYPES],state.type)}${select('branch',['All branches',...BRANCHES],state.branch)}${select('period',['7 days','14 days','30 days','All time'],state.period)}</div>`;}
function table(rows,{title='Recent transactions',description='Review and monitor associate-assisted activity',controls=true,small=false}={}){
 const sorted=getTableRows(rows);const perPage=small?10:state.pageSize;const count=Math.max(1,Math.ceil(sorted.length/perPage));
 const page=Math.max(1,Math.min(state.pageNumber,count));state.pageNumber=page;
 const displayed=sorted.slice((page-1)*perPage,page*perPage);
 return `<section class="card table-card"><div class="table-top"><div><h2 class="card-title">${esc(title)}</h2><p class="card-description">${esc(description)}</p></div><div class="table-actions">${button('export','Export CSV','download')}<button class="btn" data-action="go-transactions">${ic('arrow-right',14)} All transactions</button></div></div>
 ${controls?tableControls():''}<div class="table-scroll"><table class="data-table"><thead><tr><th>Transaction ID</th><th>Date / time</th><th>Customer</th><th>Type</th><th>Amount</th><th>Associate</th><th>Status</th><th aria-label="Open detail"></th></tr></thead><tbody>
 ${displayed.map(row=>{const clickable=EDITABLE_IDS.includes(row.id);return `<tr ${clickable?`class="row-clickable" data-open-row="${row.id}" tabindex="0" role="link" aria-label="Edit transaction ${row.id}"`:''}><td class="txn-id">${esc(row.id)}</td><td>${esc(timeLabel(row))}</td><td class="primary-cell">${esc(row.customer)}<span class="secondary-cell">${esc(row.branch)}</span></td><td>${esc(row.type)}</td><td class="amount-cell">${moneyDisplay(row.amount)}</td><td>${esc(row.associate)}</td><td>${statusHtml(row.status)}</td><td>${clickable?`<span style="color:#456ae8">${ic('chevron-right',15)}</span>`:`<span title="Read-only row" style="color:#cad3e1">${ic('lock',13)}</span>`}</td></tr>`;}).join('')||`<tr><td colspan="8" class="empty"><strong>No transactions found</strong>Try changing your filters.</td></tr>`}
 </tbody></table></div><div class="table-footer"><span>Showing <b>${sorted.length?integer((page-1)*perPage+1):'0'}–${integer(Math.min(sorted.length,page*perPage))}</b> of <b>${integer(sorted.length)}</b> records</span><div class="pagination"><button data-action="page-prev" aria-label="Previous page" ${page<=1?'disabled':''}>${ic('chevron-left',13)}</button>${[page-1,page,page+1].filter(n=>n>=1&&n<=count).map(n=>`<button data-action="page-${n}" class="${n===page?'active':''}">${n}</button>`).join('')}<button data-action="page-next" aria-label="Next page" ${page>=count?'disabled':''}>${ic('chevron-right',13)}</button></div></div></section>`;
}
function renderOverview(){const rows=selectedRows();return `${heading({title:'ITM Operations Dashboard',description:'Monitor transaction automation, exceptions, and associate activity.',actions:`${button('export','Export report','download')}${button('go-transactions','View transactions','arrow-right',true)}`})}<div class="demo-strip">${ic('info',16)} <span><strong>Demonstration workspace.</strong> Synthetic data dated Nov 1–19, 2026; numbers are computed locally and are not tied to a real bank.</span></div>${kpiGrid(rows)}<div class="analytics-grid">${chart(rows)}${reconCard(rows)}</div>${table(rows,{title:'Recent transactions',description:'Click any of the first five transaction IDs to open an editable detail page'})}`;}
function renderTransactions(){const rows=selectedRows();return `${heading({overline:'TRANSACTION CENTER',title:'All transactions',description:'Search the synthetic ITM ledger and edit the first five demo records.',actions:button('export','Download CSV','download',true)})}${kpiGrid(rows)}${table(rows,{title:'Transaction list',description:'Amounts, status, and counts are recalculated after every saved edit'})}`;}
function renderReconciliation(){const rows=selectedRows(),m=computeMetrics(rows);const exceptions=rows.filter(x=>x.status==='Needs Review'||(x.status==='Automated'&&!x.reconciled));
 return `${heading({overline:'OPERATIONS CONTROL',title:'Reconciliation',description:'See pending exceptions and reconcile synthetic source / core record status.',actions:button('export','Export exceptions','download')})}
 <div class="subtle-grid"><div class="card simple-card"><h3>Reconciled transactions</h3><div class="big positive">${integer(m.reconciled)}</div><p>${percentage(m.reconciliationRate)} of selected records</p></div><div class="card simple-card"><h3>Unresolved exceptions</h3><div class="big" style="color:#d29339">${integer(m.exceptions)}</div><p>Needs review or automated without reconciliation</p></div><div class="card simple-card"><h3>Value under review</h3><div class="big">${moneyDisplay(exceptions.reduce((s,r)=>s+r.amount,0))}</div><p>Gross value of exception-tagged transactions</p></div></div>
 <div class="panel-column"><div>${table(exceptions,{title:'Exception queue',description:'Unresolved synthetic records',controls:true})}</div><div class="card section-card"><h2 class="section-header">${ic('shield',18)} Control principles</h2><p class="page-description" style="line-height:1.8">A ledger entry must not be treated as reconciled solely because an operator initiated a write. A verified core reference and item-level match are necessary for production posting.</p><div class="warning-strip">${ic('alert',15)} Financial write timeouts must be held for investigation, never automatically re-posted.</div><h3 class="section-header" style="margin-top:23px;font-size:12px">Demo scope</h3><p class="metric-note">This page models a control queue only. It neither reads Teller Now nor accesses a core banking system.</p></div></div>`;}
function renderAssociates(){const rows=selectedRows(),people=summarizeAssociates(rows),top=people.slice(0,5);return `${heading({overline:'TEAM PERFORMANCE',title:'Associate insights',description:'Understand transaction distribution across remote associates.',actions:button('export','Export CSV','download',true)})}
 <div class="subtle-grid"><div class="card simple-card"><h3>Active associates</h3><div class="big">${people.length}</div><p>Represented in selected records</p></div><div class="card simple-card"><h3>Avg. automation rate</h3><div class="big">${percentage(computeMetrics(rows).automationRate)}</div><p>Weighted across all selected transactions</p></div><div class="card simple-card"><h3>Transaction volume</h3><div class="big">${integer(rows.length)}</div><p>Current date and status filters</p></div></div>
 <div class="panel-column"><div class="card section-card"><h2 class="section-header">${ic('users',19)} Associate performance</h2><div class="table-scroll"><table class="data-table"><thead><tr><th>Associate</th><th>Transactions</th><th>Automated</th><th>Automation rate</th><th>Volume</th></tr></thead><tbody>${people.map(a=>`<tr><td class="primary-cell">${esc(a.name)}</td><td>${integer(a.total)}</td><td>${integer(a.automated)}</td><td><b style="color:#247a71">${percentage(a.rate)}</b></td><td class="amount-cell">${moneyDisplay(a.amount)}</td></tr>`).join('')}</tbody></table></div></div>
 <div class="card section-card"><h2 class="section-header">${ic('chart',19)} Highest-volume associates</h2><div class="assoc-list">${top.map(a=>`<div class="assoc-line"><span class="assoc-avatar">${esc(a.name.split(' ').map(n=>n[0]).join(''))}</span><div class="assoc-meta"><b>${esc(a.name)}</b><small>${percentage(a.rate)} automated</small><div class="progress-track" style="margin-top:7px"><div class="progress-fill" style="width:${top[0]?a.total/top[0].total*100:0}%"></div></div></div><div class="assoc-value">${integer(a.total)}<span>records</span></div></div>`).join('')}</div></div></div>`;}
function renderAudit(){return `${heading({overline:'AUDITABILITY',title:'Audit trail',description:'Local change history for the five editable demonstration records.',actions:button('go-settings','Demo settings','settings')})}<div class="panel-column"><div class="card section-card"><h2 class="section-header">${ic('clock',18)} Saved changes <span style="font-weight:500;color:#94a1b4;font-size:11px">(${state.logs.length})</span></h2>${state.logs.length?state.logs.slice().reverse().map(log=>`<div class="log-entry"><span class="log-dot">${ic('file',15)}</span><div><strong>${esc(log.id)} — record updated</strong><p>${esc(log.summary)}</p><time>${esc(new Date(log.at).toLocaleString('en-US'))} • Demo Manager</time></div></div>`).join(''):`<div class="empty">${ic('file',32)}<strong>No changes saved yet</strong>Open one of the first five rows, edit a field and save to create a local audit entry.</div>`}</div><div class="card section-card"><h2 class="section-header">${ic('lock',18)} About this audit</h2><p class="page-description" style="line-height:1.8">The audit list is stored only in this browser's localStorage for demonstration. It is not an immutable, tamper-evident production audit trail.</p><div class="warning-strip">A real bank deployment requires signed event records, access control, retention policies, source/core references and independent monitoring.</div></div></div>`;}
function renderSettings(){return `${heading({overline:'DEMONSTRATION CONTROLS',title:'Settings',description:'Manage local demo preferences and inspect how dashboard metrics are calculated.'})}<div class="panel-column"><div class="card section-card"><h2 class="section-header">${ic('settings',18)} Display preferences</h2><div class="settings-switch"><div><strong>Hide transaction amounts</strong><p>Mask displayed dollar values, without changing calculations.</p></div><button class="switch ${state.privacy?'on':''}" data-action="toggle-privacy" aria-label="Toggle amount privacy" aria-pressed="${state.privacy}"></button></div><div class="settings-switch"><div><strong>Compact table density</strong><p>Reduce table row padding to see more entries.</p></div><button class="switch ${state.compact?'on':''}" data-action="toggle-compact" aria-label="Toggle compact tables" aria-pressed="${state.compact}"></button></div><div style="padding-top:20px"><button class="btn btn-danger" data-action="reset">${ic('refresh',15)} Reset sample edits and audit history</button></div><p class="metric-note">Changes are persistent only in this browser. The underlying source fixtures remain unchanged.</p></div>
 <div class="card section-card"><h2 class="section-header">${ic('info',18)} Calculation reference</h2><ul class="formula-list"><li><b>Total transactions</b>Count of rows that match current filters.</li><li><b>Automation rate</b>Number of rows with status “Automated” ÷ total selected rows × 100.</li><li><b>Transaction volume</b>Sum of the amount field across selected rows; calculated in integer cents.</li><li><b>Needs review</b>Count of rows with status “Needs Review”.</li><li><b>Reconciliation rate</b>Count of rows with reconciled=true ÷ total selected rows × 100.</li><li><b>Check deposit total</b>Cash component + sum of individual check amounts, rounded to cents.</li><li><b>7-day trend</b>Transactions from Nov 13–19 compared with Nov 6–12.</li></ul></div></div>`;}
function field(label,key,value,{type='text',options=null,readonly=false,wide=false,help='',prefix=false}={}){
 const id=`field-${key}`;let el='';
 if(options)el=`<select id="${id}" data-field="${key}">${options.map(n=>`<option value="${esc(n)}" ${n===value?'selected':''}>${esc(n)}</option>`).join('')}</select>`;
 else if(type==='textarea')el=`<textarea id="${id}" data-field="${key}" rows="3" maxlength="500">${esc(value)}</textarea>`;
 else el=`${prefix?'<div class="input-prefix"><span>$</span>':''}<input id="${id}" data-field="${key}" type="${type}" value="${esc(value)}" ${readonly?'readonly':''} ${type==='number'?'min="0" step="0.01"':''}>${prefix?'</div>':''}`;
 return `<div class="form-field ${wide?'wide':''}"><label for="${id}">${esc(label)}</label>${el}${help?`<small>${esc(help)}</small>`:''}</div>`;
}
function checksEditor(d){if(d.type!=='Check Deposit')return '';
 return `<div class="card section-card"><h2 class="section-header">${ic('checklist',19)} Individual check items <span style="margin-left:auto;font-weight:550;color:#8291a6;font-size:11px">${d.checks.length} check${d.checks.length!==1?'s':''}</span></h2><p class="section-helper">Check amounts are added individually. Deposit total is recalculated automatically.</p>${d.checks.map((c,index)=>`<div class="check-item"><div class="check-title">Check ${index+1}<button type="button" data-action="remove-check" data-index="${index}" class="btn btn-quiet" title="Remove check" aria-label="Remove check ${index+1}">${ic('trash',15)}</button></div><div class="check-grid"><div class="form-field"><label for="number-${index}">Check number</label><input type="text" data-check-field="number" data-index="${index}" id="number-${index}" value="${esc(c.number)}"></div><div class="form-field"><label for="routing-${index}">Routing number</label><input type="text" data-check-field="routing" data-index="${index}" id="routing-${index}" value="${esc(c.routing)}"></div><div class="form-field"><label for="checkamount-${index}">Amount (USD)</label><input type="number" min="0.01" step="0.01" data-check-field="amount" data-index="${index}" id="checkamount-${index}" value="${esc(c.amount)}"></div><label class="toggle-row"><input type="checkbox" data-check-field="onUs" data-index="${index}" ${c.onUs?'checked':''}> On-us</label></div></div>`).join('')}
 <button class="add-item" type="button" data-action="add-check">${ic('plus',15)} Add another check item</button></div>`;
}
function renderDetail(id){const row=currentRows().find(x=>x.id===id);if(!row||!EDITABLE_IDS.includes(id))return `<div class="card section-card"><h1>Read-only transaction</h1><p>Only the first five transaction records are editable in this exercise.</p><a class="btn" href="#/transactions">Back to transactions</a></div>`;
 if(state.draftId!==id){state.draft=structuredClone(row);state.draftId=id;state.errors=[];}
 const d=state.draft;
 return `<button class="back-link" data-action="back">${ic('arrow-left',15)} Back to transactions</button>${heading({overline:'TRANSACTION DETAIL',title:d.id,description:`Edit sample details for ${d.customer}. Changes are persisted locally and update all dashboard totals.`,actions:`${button('cancel','Cancel changes','close')}${button('save','Save changes','check',true)}`})}<div class="demo-strip">${ic('info',15)} <span>This is an <strong>editable mock record</strong>, not a real banking transaction. No core system is connected.</span></div>
 <div class="detail-layout"><div><div class="card section-card"><h2 class="section-header">${ic('file',19)} Transaction information</h2><div class="form-grid">${field('Transaction ID','id',d.id,{readonly:true})}${field('Transaction date','date',d.date,{type:'date'})}${field('Customer name','customer',d.customer)}${field('Transaction type','type',d.type,{options:TYPES})}${field('Status','status',d.status,{options:STATUSES})}${field('Associate','associate',d.associate,{options:ASSOCIATES})}${field('Branch','branch',d.branch,{options:BRANCHES})}${field('Time (HH:MM)','time',d.time,{type:'time'})}</div></div>
 <div class="card section-card"><h2 class="section-header">${ic('dollar',19)} Amount breakdown</h2><div class="form-grid">${field('Transaction total (USD)','amount',d.amount,{type:'number',readonly:d.type==='Check Deposit',prefix:true,help:d.type==='Check Deposit'?'Calculated from cash and check items':'Editable transaction amount'})}${d.type==='Check Deposit'?field('Cash component (USD)','cash',d.cash,{type:'number',prefix:true}):`<div class="form-field"><label>Check items</label><div class="filter-control" style="display:flex;align-items:center;background:#f8faff;color:#9da8b8">Not applicable for this type</div></div>`}</div></div>
 ${checksEditor(d)}<div class="card section-card"><h2 class="section-header">${ic('file',18)} Internal notes</h2>${field('Reviewer comments','notes',d.notes,{type:'textarea',wide:true,help:'Demo annotations only; avoid real customer data.'})}</div></div>
 <aside class="card summary-card"><div class="summary-label">Transaction overview</div><div class="summary-amount" id="summary-amount">${moneyDisplay(d.amount)}</div><div style="margin:10px 0 18px">${statusHtml(d.status)}</div><div class="detail-stat"><span>Transaction ID</span><b>${esc(d.id)}</b></div><div class="detail-stat"><span>Transaction type</span><b id="summary-type">${esc(d.type)}</b></div><div class="detail-stat"><span>Check items</span><b id="summary-checks">${d.checks.length}</b></div><div class="detail-stat"><span>Associate</span><b id="summary-associate">${esc(d.associate)}</b></div><div class="summary-note">${ic('shield',15)} &nbsp; Totals and validation are calculated in the browser. Saving updates the dashboard, transaction table and local audit history.</div><div id="draft-errors">${state.errors.length?errorHTML(state.errors):''}</div><button class="btn btn-primary" data-action="save">${ic('check',16)} Save changes</button></aside></div>`;
}
function errorHTML(errors){return `<div class="error-list"><b>Please correct the following:</b><ul>${errors.map(e=>`<li>${esc(e)}</li>`).join('')}</ul></div>`;}
function render(){const r=route();const nav=r.name==='detail'?'transactions':r.name;
 const pages={overview:renderOverview,transactions:renderTransactions,reconciliation:renderReconciliation,associates:renderAssociates,audit:renderAudit,settings:renderSettings};
 const content=r.name==='detail'?renderDetail(r.id):(pages[r.name]||renderOverview)();
 app.innerHTML=`<div class="app-shell">${sidebar(nav)}<div class="main-column">${topbar(r.name)}<main class="page-content">${content}</main></div></div>${state.toast?`<div class="toast" role="status">${ic('check',15)} ${esc(state.toast)}</div>`:''}`;
 document.body.classList.toggle('compact-mode',state.compact);
 if(state.compact){document.querySelectorAll('.data-table td').forEach(el=>el.style.padding='9px 17px');}
}
function goto(page){state.mobileMenu=false;state.notifications=false;if(location.hash!==`#/${page}`)location.hash=`#/${page}`;render();window.scrollTo(0,0);}
function action(e){const hit=e.target.closest('[data-action]');if(!hit)return;const what=hit.dataset.action;
 if(what==='menu'){state.mobileMenu=!state.mobileMenu;render();return;}
 if(what==='notifications'){state.notifications=!state.notifications;render();return;}
 if(what==='go-transactions'){goto('transactions');return;}
 if(what==='go-settings'){goto('settings');return;}
 if(what==='back'||what==='cancel'){state.draft=null;state.draftId=null;state.errors=[];goto('transactions');return;}
 if(what==='export'){exportCSV();return;}
 if(what==='chart-transactions'||what==='chart-bars'){state.chart=what==='chart-bars'?'bars':'transactions';render();return;}
 if(what==='page-prev'){state.pageNumber=Math.max(1,state.pageNumber-1);render();return;}
 if(what==='page-next'){state.pageNumber++;render();return;}
 if(what.startsWith('page-')){state.pageNumber=Number(what.slice(5));render();return;}
 if(what==='add-check'){state.draft.checks.push({id:`CHK-NEW-${Date.now()}`,number:'',routing:'',amount:0,onUs:false});updateDepositTotal();render();return;}
 if(what==='remove-check'){if(state.draft.checks.length<=1){state.errors=['A check deposit requires at least one item.'];render();return;}state.draft.checks.splice(Number(hit.dataset.index),1);updateDepositTotal();render();return;}
 if(what==='save'){saveDraft();return;}
 if(what==='toggle-privacy'){state.privacy=!state.privacy;localStorage.setItem('eloquent-privacy',JSON.stringify(state.privacy));render();return;}
 if(what==='toggle-compact'){state.compact=!state.compact;localStorage.setItem('eloquent-compact',JSON.stringify(state.compact));render();return;}
 if(what==='reset'){if(!confirm('Reset all saved edits and local audit entries?'))return;state.edits={};state.logs=[];saveEdits();setToast('Sample data has been restored');render();return;}
}
function exportCSV(){const r=route();let rows=selectedRows();if(r.name==='reconciliation')rows=rows.filter(x=>x.status==='Needs Review'||(x.status==='Automated'&&!x.reconciled));
 const headers=['ID','Date','Time','Customer','Type','Amount','Status','Associate','Branch','Check Count','Reconciled'];
 const cols=x=>[x.id,x.date,x.time,x.customer,x.type,x.amount.toFixed(2),x.status,x.associate,x.branch,x.checks.length,x.reconciled];
 const csv=[headers,...rows.map(cols)].map(row=>row.map(c=>`"${String(c).replaceAll('"','""')}"`).join(',')).join('\r\n');
 const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download=`itm-${r.name}-2026-11-19.csv`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);setToast(`Exported ${integer(rows.length)} records`);render();}
function updateDepositTotal(){if(state.draft?.type==='Check Deposit'){state.draft.amount=Math.round((Number(state.draft.cash||0)+state.draft.checks.reduce((s,c)=>s+Number(c.amount||0),0))*100)/100;}}
function syncSummary(){if(!state.draft)return;const d=state.draft;document.querySelector('#summary-amount')?.replaceChildren(document.createTextNode(moneyDisplay(d.amount)));document.querySelector('#summary-type')?.replaceChildren(document.createTextNode(d.type));document.querySelector('#summary-checks')?.replaceChildren(document.createTextNode(String(d.checks.length)));document.querySelector('#summary-associate')?.replaceChildren(document.createTextNode(d.associate));
 const total=document.querySelector('#field-amount');if(total?.readOnly)total.value=d.amount.toFixed(2);
}
function onInput(e){const t=e.target;if(t.dataset.filter){const key=t.dataset.filter;state[key]=t.value;state.pageNumber=1;
  if(key==='q'){const start=t.selectionStart,end=t.selectionEnd;render();const el=document.querySelector('#transaction-search');el?.focus();if(el)el.setSelectionRange(start,end);}else render();return;}
 if(!state.draft)return;
 if(t.dataset.field){const key=t.dataset.field;state.draft[key]=['amount','cash'].includes(key)?(t.value===''?0:Number(t.value)):t.value;
  if(key==='type'){if(state.draft.type==='Check Deposit'&&!state.draft.checks.length){state.draft.checks=[{id:'CHK-NEW-1',number:'',routing:'',amount:state.draft.amount||0,onUs:false}];state.draft.cash=0;}}
  updateDepositTotal();if(['type','status'].includes(key))render();else syncSummary();return;}
 if(t.dataset.checkField){const index=Number(t.dataset.index),key=t.dataset.checkField;
  if(!state.draft.checks[index])return;state.draft.checks[index][key]=key==='onUs'?t.checked:key==='amount'?(t.value===''?0:Number(t.value)):t.value;
  updateDepositTotal();syncSummary();return;}
}
function saveDraft(){const old=currentRows().find(x=>x.id===state.draftId);if(!old||!EDITABLE_IDS.includes(old.id))return;
 const draft=normalizeDraft(state.draft);const errors=validateDraft(draft);
 if(draft.date>'2026-11-19'||draft.date<'2026-11-01')errors.push('Date must be within the synthetic Nov 1–19, 2026 dataset.');
 if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(draft.time))errors.push('Time must have 24-hour HH:MM format.');
 if(draft.checks.some(c=>!c.number?.trim()||!/^\d{9}$/.test(c.routing)))errors.push('Each check needs a number and a 9-digit routing number.');
 if(errors.length){state.errors=errors;render();document.querySelector('#draft-errors')?.scrollIntoView({behavior:'smooth',block:'center'});return;}
 state.edits[old.id]={...draft};
 const summary=[];for(const key of ['customer','type','status','amount','associate','branch','cash'])if(old[key]!==draft[key])summary.push(`${key}: ${String(old[key])} → ${String(draft[key])}`);
 if(JSON.stringify(old.checks)!==JSON.stringify(draft.checks))summary.push('check items updated');
 if(old.notes!==draft.notes)summary.push('notes updated');
 state.logs.push({id:old.id,at:new Date().toISOString(),summary:summary.length?summary.join('; '):'Saved without changing field values'});
 saveEdits();state.draftId=null;state.draft=null;state.errors=[];state.sort='id';state.sortDirection='asc';state.pageNumber=1;setToast(`Saved ${old.id} and updated dashboard KPIs`);goto('transactions');}
app.addEventListener('click',e=>{
 if(e.target.closest('[data-action]')){e.preventDefault();action(e);return;}
 const row=e.target.closest('[data-open-row]');if(row){goto(`transaction/${row.dataset.openRow}`);return;}
 const nav=e.target.closest('[data-nav]');if(nav){e.preventDefault();state.pageNumber=1;goto(nav.dataset.nav);return;}
 const brand=e.target.closest('.brand');if(brand){e.preventDefault();state.pageNumber=1;goto('overview');return;}
});
app.addEventListener('keydown',e=>{const row=e.target.closest('[data-open-row]');if(row&&(e.key==='Enter'||e.key===' ')){e.preventDefault();goto(`transaction/${row.dataset.openRow}`);}});
app.addEventListener('input',onInput);
app.addEventListener('change',e=>{if(e.target.dataset.filter||e.target.dataset.field||e.target.dataset.checkField)onInput(e);});
window.addEventListener('hashchange',()=>{state.pageNumber=1;state.notifications=false;render();window.scrollTo(0,0);});
window.addEventListener('storage',e=>{if([STORAGE_KEY,LOG_KEY].includes(e.key)){state.edits=storageRead(STORAGE_KEY,{});state.logs=storageRead(LOG_KEY,[]);render();}});
if(!location.hash)history.replaceState(null,'','#/overview');render();
