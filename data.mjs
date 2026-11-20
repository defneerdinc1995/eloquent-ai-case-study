/* Entirely synthetic data. No banking customer information or transactions are used. */
export const SNAPSHOT_DATE = '2026-11-19';
export const STORAGE_KEY = 'eloquent-itm-demo-edits-v1';
export const LOG_KEY = 'eloquent-itm-demo-log-v1';
export const CUSTOMER_NAMES = [
 'Olivia Martinez','Noah Johnson','Sophia Patel','Liam Anderson','Emma Wilson',
 'Mason Thompson','Isabella Garcia','Ethan Lee','Ava Robinson','Lucas Brown',
 'Mia Williams','James Hernandez','Amelia Lopez','Benjamin Moore','Harper Jackson',
 'Elijah White','Charlotte Davis','Alexander Martin','Evelyn Clark','Henry Rodriguez',
 'Abigail Lewis','Daniel Walker','Ella Hall','Michael Allen','Scarlett Young',
 'William King','Grace Wright','Samuel Scott','Chloe Green','David Adams'
];
export const ASSOCIATES = ['Rachel Kim','Daniel Brooks','Priya Shah','Marcus Chen','Jessica Moore','Anthony Reed','Sarah Evans','Emily Grant'];
export const BRANCHES = ['San Diego','Sacramento','Irvine','Fresno','Santa Rosa','Oakland'];
export const STATUSES = ['Automated','Needs Review','Processing','Manual'];
export const TYPES = ['Check Deposit','Cash Deposit','Cash Withdrawal','Transfer','Check Encashment'];
const modulus = 2147483647;
const seeded = n => { let x = (n * 48271 + 12345) % modulus; x = x * 48271 % modulus; return x/modulus; };
const pad2 = n => String(n).padStart(2,'0');
const roundCents = n => Math.round(Number(n)*100)/100;
// Weighted but deterministic daily distribution; intended only to make the demo chart informative.
const DAY_WEIGHTS = [.68,.72,.84,1.06,1.22,1.28,.95,.75,.71,1.04,1.16,1.14,1.02,.76,.82,1.07,1.21,1.36,1.41];
const WEIGHT_TOTAL = DAY_WEIGHTS.reduce((a,b)=>a+b,0);
function sampleDay(index){
  let target=seeded(index*97+71)*WEIGHT_TOTAL;
  for(let i=0;i<DAY_WEIGHTS.length;i++){target-=DAY_WEIGHTS[i];if(target<0)return i+1;}
  return 19;
}
const input = [
 {customer:'Olivia Martinez',type:'Check Deposit',status:'Needs Review',associate:'Rachel Kim',branch:'San Diego',day:19, time:'09:42',cash:250,checks:[{id:'CHK-A01',number:'10842',routing:'121000248',amount:1425,onUs:false},{id:'CHK-A02',number:'10843',routing:'121140399',amount:675.4,onUs:true}],notes:'On-us item requires policy verification.'},
 {customer:'Noah Johnson',type:'Cash Deposit',status:'Automated',associate:'Daniel Brooks',branch:'Sacramento',day:19,time:'09:36',amount:3200,notes:'All validation checks passed.'},
 {customer:'Sophia Patel',type:'Check Deposit',status:'Automated',associate:'Priya Shah',branch:'Irvine',day:19,time:'09:25',cash:150,checks:[{id:'CHK-C01',number:'64201',routing:'122000247',amount:2300,onUs:false},{id:'CHK-C02',number:'64203',routing:'121000358',amount:1240.75,onUs:false}],notes:'Individual check items confirmed.'},
 {customer:'Liam Anderson',type:'Cash Withdrawal',status:'Processing',associate:'Marcus Chen',branch:'Fresno',day:19,time:'09:12',amount:750,notes:'Awaiting core processing.'},
 {customer:'Emma Wilson',type:'Transfer',status:'Automated',associate:'Jessica Moore',branch:'Oakland',day:19,time:'08:57',amount:4850,notes:'Destination account matched.'}
];
export function createSeedData(count=9240) {
 const result=[];
 for(let i=0;i<count;i++){
  const curated=input[i];
  const r=seeded(i+5); const r2=seeded(i+53),r3=seeded(i+103);
  const type=curated?.type || TYPES[(i*7+Math.floor(r*11))%TYPES.length];
  const status=curated?.status || (r<.824?'Automated':r<.916?'Manual':r<.958?'Needs Review':'Processing');
  const day=curated?.day ?? sampleDay(i);
  const hour=curated?.time?.slice(0,2) ?? pad2(8+(i*7)%10);
  const minute=curated?.time?.slice(3) ?? pad2((i*19)%60);
  const checks=curated?.checks ? structuredClone(curated.checks) : type==='Check Deposit' ? [
    {id:`CHK-${i+1}-1`,number:String(10000+i), routing:i%7===0?'121140399':'122000247',amount:roundCents(100+r2*3600),onUs:i%7===0},
    ...(i%4===0?[{id:`CHK-${i+1}-2`,number:String(23000+i),routing:'121000248',amount:roundCents(50+r3*1450),onUs:false}]:[])
   ] : [];
  const cash=curated?.cash ?? (type==='Check Deposit' ? roundCents((i%5)*100) : 0);
  const amount=curated?.amount ?? (type==='Check Deposit' ? roundCents(cash+checks.reduce((s,x)=>s+x.amount,0)) : roundCents(120+r3*6800));
  result.push({
   id:`ITM-${String(2600001+i)}`,date:`2026-11-${pad2(day)}`,time:`${hour}:${minute}`,
   customer:curated?.customer||CUSTOMER_NAMES[(i*7)%CUSTOMER_NAMES.length],
   type,status,associate:curated?.associate||ASSOCIATES[(i*11)%ASSOCIATES.length],
   branch:curated?.branch||BRANCHES[(i*5)%BRANCHES.length],
   amount, cash,checks,notes:curated?.notes||'',
   reconciled:curated?.status==='Needs Review'?false:(status==='Automated' ? (i%47!==0) : false),
   processingSeconds: status==='Automated' ? 18+(i*29)%155 : null,
   transactionMethod: i%3===0?'Associate assisted':'ITM remote associate',
   riskFlag: status==='Needs Review' || (i%89===0),
  });
 }
 return result;
}
export const SEED = createSeedData();
export const EDITABLE_IDS = SEED.slice(0,5).map(x=>x.id);
export const money = value => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(Number(value)||0);
export const integer = value => new Intl.NumberFormat('en-US').format(Math.round(Number(value)||0));
export const percentage = value => `${(Number(value)*100).toFixed(2)}%`;
export const asUTC = date => new Date(date+'T00:00:00Z').getTime();
export function applyEdits(rows,edits={}) { return rows.map(row=>edits[row.id]? {...row,...edits[row.id], checks:structuredClone(edits[row.id].checks ?? row.checks)}:row); }
export function filterTransactions(rows,{q='',status='All statuses',type='All types',branch='All branches',period='30 days'}={}){
 const query=q.trim().toLowerCase(); const start=asUTC(SNAPSHOT_DATE) - (period==='7 days'?6:period==='14 days'?13:29)*86400000;
 return rows.filter(x=>(period==='All time'||asUTC(x.date)>=start) &&
  (status==='All statuses'||x.status===status) && (type==='All types'||x.type===type) && (branch==='All branches'||x.branch===branch) &&
  (!query||[x.id,x.customer,x.associate,x.branch,x.type].some(s=>s.toLowerCase().includes(query))));
}
export function computeMetrics(rows){
 const total=rows.length;
 const automated=rows.filter(x=>x.status==='Automated').length;
 const needingReview=rows.filter(x=>x.status==='Needs Review').length;
 const pending=rows.filter(x=>x.status==='Processing').length;
 const manual=rows.filter(x=>x.status==='Manual').length;
 const reconciled=rows.filter(x=>x.reconciled).length;
 const exceptions=rows.filter(x=>x.status==='Needs Review'||(x.status==='Automated'&&!x.reconciled)).length;
 const volumeCents=rows.reduce((s,x)=>s+Math.round(x.amount*100),0);
 const processing=rows.filter(x=>x.status==='Automated'&&x.processingSeconds != null);
 const avgSeconds=processing.length?Math.round(processing.reduce((s,x)=>s+x.processingSeconds,0)/processing.length):0;
 return {total,automated,needingReview,pending,manual,reconciled,exceptions,
  automationRate:total?automated/total:0,
  reconciliationRate:total?reconciled/total:0,
  amount:volumeCents/100,avgSeconds};
}
export function groupDaily(rows){
 const m=new Map(); for(let n=1;n<=19;n++)m.set(`2026-11-${pad2(n)}`,{date:`2026-11-${pad2(n)}`,total:0,automated:0});
 for(const row of rows){const item=m.get(row.date);if(item){item.total++;if(row.status==='Automated')item.automated++;}}
 return [...m.values()];
}
export function summarizeAssociates(rows){
 const m=new Map();for(const r of rows){let a=m.get(r.associate);if(!a){a={name:r.associate,total:0,automated:0,amount:0,exceptions:0};m.set(r.associate,a);}a.total++;a.amount+=r.amount;if(r.status==='Automated')a.automated++;if(r.status==='Needs Review')a.exceptions++;}
 return [...m.values()].map(a=>({...a,rate:a.total?a.automated/a.total:0})).sort((a,b)=>b.total-a.total);
}
export function validateDraft(d){
 const errors=[];
 if(!d.customer?.trim())errors.push('Customer is required.');
 if(!ASSOCIATES.includes(d.associate))errors.push('Select a valid associate.');
 if(!TYPES.includes(d.type))errors.push('Select a supported transaction type.');
 if(!STATUSES.includes(d.status))errors.push('Select a supported status.');
 if(!(Number.isFinite(d.amount))||d.amount<=0)errors.push('Amount must be greater than zero.');
 if(d.type==='Check Deposit'){
  if(!Array.isArray(d.checks)||!d.checks.length)errors.push('A check deposit needs at least one check item.');
  if(!Number.isFinite(d.cash)||d.cash<0)errors.push('Cash portion must be non-negative.');
  if(d.checks?.some(c=>!Number.isFinite(c.amount)||c.amount<=0))errors.push('Each check amount must be greater than zero.');
  const expected=Math.round((d.cash+(d.checks||[]).reduce((s,c)=>s+c.amount,0))*100);
  if(Math.round(d.amount*100)!==expected)errors.push('Deposit total must equal cash plus individual check amounts.');
 }
 return errors;
}
export function normalizeDraft(d){
 const result={...d,amount:roundCents(d.amount),cash:roundCents(d.cash||0),checks:(d.checks||[]).map((c,index)=>({...c,id:c.id||`CHK-NEW-${index}`,amount:roundCents(c.amount),onUs:Boolean(c.onUs)}))};
 if(result.type==='Check Deposit')result.amount=roundCents(result.cash+result.checks.reduce((s,c)=>s+c.amount,0));
 else {result.checks=[];result.cash=0;}
 result.reconciled=result.status==='Automated';
 result.processingSeconds=result.status==='Automated'?(result.processingSeconds||65):null;
 return result;
}
