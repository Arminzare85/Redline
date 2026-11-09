"use strict";
/* Redline API layer (Django REST Framework). All backend access lives here.
   FIELD MAPPING for products is in normalizeProduct() - adjust there if your serializer differs.
   Set localStorage.rl_debug="1" to log the first raw API product in the console. */
const API_BASE="/api/v1",ACC_BASE="/accounts/api/v1";
const Auth={
  get access(){return localStorage.getItem("rl_access")},
  get refresh(){return localStorage.getItem("rl_refresh")},
  get on(){return !!localStorage.getItem("rl_access")},
  set(a,r){a&&localStorage.setItem("rl_access",a);r&&localStorage.setItem("rl_refresh",r)},
  clear(){localStorage.removeItem("rl_access");localStorage.removeItem("rl_refresh");sessionStorage.removeItem("rl_cm")}
};
function apiMsg(d){if(!d)return"";if(typeof d==="string")return d.slice(0,200);if(d.detail)return String(d.detail);
  if(typeof d==="object")return Object.entries(d).map(([k,v])=>`${k}: ${[].concat(v).join(" ")}`).join(" | ").slice(0,300);return""}
async function http(url,{method="GET",body,auth=false,signal}={}){
  const fd=typeof FormData!=="undefined"&&body instanceof FormData;const h={Accept:"application/json"};if(body&&!fd)h["Content-Type"]="application/json";
  if(auth&&Auth.access)h.Authorization="Bearer "+Auth.access;
  let r;try{r=await fetch(url,{method,headers:h,body:body?(fd?body:JSON.stringify(body)):undefined,signal})}
  catch(e){if(e.name==="AbortError")throw e;const x=new Error("Cannot reach the server. Check your connection and that the backend is running.");x.network=true;throw x}
  let data=null;try{data=await r.json()}catch{}
  if(!r.ok){const x=new Error(apiMsg(data)||`Request failed (${r.status})`);x.status=r.status;x.data=data;if(r.status===401&&auth)Auth.clear();throw x}
  return data}
const qstr=o=>{const p=new URLSearchParams();for(const[k,v]of Object.entries(o))if(v!==""&&v!=null&&v!==false)p.set(k,v);return p.toString()};
const asList=d=>Array.isArray(d)?d:(d&&Array.isArray(d.results)?d.results:[]);
const safeUrl=u=>{if(typeof u!=="string"||!u)return"";try{const x=new URL(u,location.href);return(x.protocol==="http:"||x.protocol==="https:")?u:""}catch{return""}};
const imgOf=v=>typeof v==="string"?v:(v&&(v.image||v.url||v.src||v.file||v.thumbnail))||"";

/* meta: categories + brands (loaded once, used for filters and for resolving ids to names) */
const catMap=new Map(),brandMap=new Map();let _meta;
const normMeta=c=>({id:c.id,name:String(c.name||c.title||c.id)});
function meta(){return _meta||(_meta=Promise.all([
  http(`${API_BASE}/categories/?page_size=200`).then(d=>asList(d).map(normMeta)).catch(()=>null),
  http(`${API_BASE}/brands/?page_size=200`).then(d=>asList(d).map(normMeta)).catch(()=>null)
]).then(([c,b])=>{(c||[]).forEach(x=>catMap.set(String(x.id),x.name));(b||[]).forEach(x=>brandMap.set(String(x.id),x.name));
  if(!c&&!b)_meta=null;return{categories:c||[],brands:b||[],failed:!c||!b}}))}
const nameOf=(v,map)=>v==null?"":typeof v==="object"?String(v.name||v.title||map.get(String(v.id))||""):(map.get(String(v))||(isNaN(v)?String(v):""));
const idOf=v=>v==null?"":typeof v==="object"?v.id:v;

function normalizeProduct(r){
  if(localStorage.rl_debug&&!normalizeProduct._d){normalizeProduct._d=1;console.info("[Redline] raw product",r)}
  const n=v=>(v==null||v===""||isNaN(+v))?null:+v;
  let price=n(r.price),old=0;const dp=n(r.discount_price??r.final_price),pc=n(r.discount_percent);
  if(price!=null){if(dp!=null&&dp<price){old=price;price=dp}else if(pc>0&&pc<100){old=price;price=+(price*(1-pc/100)).toFixed(2)}}
  const imgs=[...new Set([].concat(r.images||[],r.image||[],r.main_image||[],r.thumbnail||[]).map(imgOf).map(safeUrl).filter(Boolean))];
  const stock=n(r.stock??r.stock_quantity??r.quantity),flag=r.in_stock??r.is_in_stock;
  return{id:r.id,name:String(r.name||r.title||"Untitled"),desc:String(r.description||""),sku:String(r.sku||""),price,old,
    brand:nameOf(r.brand,brandMap),category:nameOf(r.category,catMap),catId:idOf(r.category),stock,
    inStock:flag!=null?!!flag:(stock!=null?stock>0:null),views:n(r.views_count),rating:n(r.rating??r.average_rating),
    imgs,img:imgs[0]||"",created:r.created_at||""}}

/* product cache: avoids refetching (detail requests increment views_count on the backend) */
const mem=new Map(),TTL=300000,inflight=new Map();
try{const o=JSON.parse(sessionStorage.getItem("rl_pc")||"{}");for(const k in o)mem.set(k,o[k])}catch{}
const persist=()=>{try{const o={};mem.forEach((v,k)=>o[k]=v);sessionStorage.setItem("rl_pc",JSON.stringify(o))}catch{}};
const putMany=a=>{a.forEach(p=>mem.set(String(p.id),{t:Date.now(),p}));persist()};
const peek=id=>mem.get(String(id))?.p||null;

const API={
  async getProducts(params,signal){
    const [d]=await Promise.all([http(`${API_BASE}/products/?${qstr(params)}`,{signal}),meta()]);
    const items=asList(d).map(normalizeProduct);putMany(items);
    const paginated=!!d&&!Array.isArray(d)&&typeof d.count==="number";
    return{items,count:paginated?d.count:items.length,paginated}},
  getProduct(id){const k=String(id);if(inflight.has(k))return inflight.get(k);
    const p=Promise.all([http(`${API_BASE}/products/${encodeURIComponent(k)}/`),meta()]).then(([d])=>{const x=normalizeProduct(d);putMany([x]);return x}).finally(()=>inflight.delete(k));
    inflight.set(k,p);return p},
  getProductCached(id){const c=mem.get(String(id));return(c&&Date.now()-c.t<TTL)?Promise.resolve(c.p):API.getProduct(id)},
  meta,
  async login(email,password){const d=await http(`${ACC_BASE}/token/`,{method:"POST",body:{email,username:email,password}});Auth.set(d.access,d.refresh);return d},
  register(f){return http(`${ACC_BASE}/register/`,{method:"POST",body:{email:f.email,username:f.email,first_name:f.name,password:f.password,password2:f.password}})},
  /* DRF OPTIONS metadata only lists POST "actions" if the backend's own permission classes allow this user to create products. */
  options:u=>http(u,{method:"OPTIONS",auth:true}),
  async canManage(force){if(!Auth.access)return false;const k=Auth.access.slice(-24);
    try{const c=JSON.parse(sessionStorage.getItem("rl_cm")||"null");if(!force&&c&&c.k===k&&Date.now()-c.t<300000)return c.v}catch{}
    let v=false;try{const d=await http(`${API_BASE}/products/`,{method:"OPTIONS",auth:true});v=!!(d&&d.actions&&d.actions.POST)}catch{}
    try{sessionStorage.setItem("rl_cm",JSON.stringify({k,t:Date.now(),v}))}catch{}return v},
  async profile(){const d=await http(`${ACC_BASE}/profile/me/`,{auth:true});return d.user||d}
};
