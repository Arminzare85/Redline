"use strict";
/* Admin dashboard. Uses only the existing API. Product form fields come from the backend's own DRF OPTIONS
   metadata, so no Product field names are hardcoded. Authorization is enforced by the backend on every request. */
const CFG={imagesEndpoint:null,/* e.g. "/api/v1/product-images/"; null = discover from the API root */pageSize:20};
document.addEventListener("DOMContentLoaded",async()=>{
const P=`${API_BASE}/products/`,gate=$("#gate");
if(!Auth.on)return location.replace("login.html");
gate.innerHTML=spin;let schema,m;
try{if(!await API.canManage(true))throw Object.assign(new Error("denied"),{denied:true});
schema=(await API.options(P)).actions.POST;m=await API.meta()}
catch(e){gate.innerHTML=`<div class="panel text-center"><h4>${e.denied?"Access denied":"Cannot load dashboard"}</h4><p class="text-mute">${e.denied?"Your account is not allowed to manage products.":esc(e.message)}</p><a class="btn btn-ghost" href="index.html">Back to store</a></div>`;return}
gate.remove();$("#app").classList.remove("d-none");$("#addp").classList.remove("d-none");
const fields=Object.entries(schema).filter(([k,f])=>!f.read_only&&!["image upload","file upload","nested object","list"].includes(f.type));
const activeKey=Object.keys(schema).find(k=>/^(is_)?active$/.test(k)),S={page:1,editing:null,raw:new Map(),ctl:null,img:null};
const modal=s=>bootstrap.Modal.getOrCreateInstance(s);
function flash(t,bad){let w=$(".toast-wrap");if(!w){w=document.createElement("div");w.className="toast-wrap";document.body.append(w)}const d=document.createElement("div");d.className="panel py-2 px-3 mb-2 border-danger";d.innerHTML=`<i class="bi bi-${bad?"exclamation-triangle":"check-circle"} text-red me-2"></i>${esc(t)}`;w.append(d);setTimeout(()=>d.remove(),bad?4500:2200)}
const fail=e=>{if(e.status===401){Auth.clear();location.replace("login.html")}else flash(e.status===403?"You do not have permission for this action.":e.message,true)};
const nextPath=u=>{const x=new URL(u,location.href);return x.pathname+x.search};
/* stats: counted from the products the API returns to this account (all pages) */
async function stats(){$$("[data-stat]").forEach(x=>x.textContent="\u2026");
try{let url=`${P}?${qstr({page_size:100})}`,items=[],count=0,n=0;
while(url&&n<30){const d=await http(url,{auth:true});if(!n)count=Array.isArray(d)?d.length:d.count;items.push(...asList(d));n++;url=d&&d.next?nextPath(d.next):null}
const pre=url?"\u2265 ":"",ps=items.map(normalizeProduct),set=(k,v)=>$(`[data-stat="${k}"]`).textContent=pre+v;
set("total",count);set("out",ps.filter(p=>p.inStock===false).length);set("views",ps.reduce((a,p)=>a+(p.views||0),0));
$('[data-stat="active"]').textContent=activeKey?pre+items.filter(r=>r[activeKey]).length:"n/a";
$("#statnote").textContent=`Counted from ${items.length} products returned by the API for your account${url?" (stopped at 3000)":""}.${activeKey?"":" The API exposes no active flag, so Active is unavailable."}`}
catch(e){$$("[data-stat]").forEach(x=>x.textContent="\u2014");$("#statnote").textContent="Could not load statistics: "+e.message}}
const row=r=>{const p=normalizeProduct(r);S.raw.set(String(r.id),r);
const st=activeKey?(r[activeKey]?'<span class="badge bg-success">Active</span>':'<span class="badge bg-secondary">Inactive</span>'):"";
return `<tr><td style="width:64px">${p.img?`<img class="thumb" src="${esc(p.img)}" alt="" onerror="noimg(this)">`:'<span class="thumb noimg"><i class="bi bi-image"></i></span>'}</td><td><div class="fw-semibold">${esc(p.name)}</div><small class="text-mute">${esc(p.sku)}</small></td><td class="d-none d-md-table-cell">${esc(p.category)}</td><td class="d-none d-lg-table-cell">${esc(p.brand)}</td><td>${money(p.price)}${p.old?`<div class="old small">${money(p.old)}</div>`:""}</td><td>${p.stock!=null?esc(p.stock):"\u2014"}${p.inStock===false?' <span class="badge bg-danger">Out</span>':""}</td><td class="d-none d-lg-table-cell">${p.views??"\u2014"}</td><td>${st}</td>
<td class="text-end text-nowrap"><button class="btn btn-ghost btn-sm" data-img="${esc(r.id)}" title="Images"><i class="bi bi-images"></i></button> <button class="btn btn-ghost btn-sm" data-edit="${esc(r.id)}" title="Edit"><i class="bi bi-pencil"></i></button> <button class="btn btn-ghost btn-sm" data-del="${esc(r.id)}" title="Delete"><i class="bi bi-trash"></i></button></td></tr>`};
async function load(){S.ctl?.abort();S.ctl=new AbortController();const av=$("#fa").value;
const p={search:$("#q").value.trim(),category:$("#fc").value,brand:$("#fb").value,in_stock:{in:"true",out:"false"}[av]||"",page:S.page>1?S.page:"",page_size:CFG.pageSize,ordering:"-created_at"},tb=$("#rows");
tb.innerHTML=`<tr><td colspan="9" class="text-center text-mute py-5">Loading\u2026</td></tr>`;$("#wout").classList.add("d-none");
try{const d=await http(`${P}?${qstr(p)}`,{auth:true,signal:S.ctl.signal}),items=asList(d),count=Array.isArray(d)?items.length:d.count;
$("#cnt").textContent=`${count} product${count==1?"":"s"}`;
tb.innerHTML=items.length?items.map(row).join(""):`<tr><td colspan="9" class="text-center text-mute py-5">No products found.</td></tr>`;
if(av==="out"&&items.some(r=>normalizeProduct(r).inStock))$("#wout").classList.remove("d-none");
const pages=Array.isArray(d)?1:Math.ceil(count/CFG.pageSize);$("#pg").innerHTML=pages>1?`<button class="btn btn-ghost btn-sm" data-pg="${S.page-1}" ${S.page<2?"disabled":""}>\u2039</button><small class="text-mute">Page ${S.page} of ${pages}</small><button class="btn btn-ghost btn-sm" data-pg="${S.page+1}" ${S.page>=pages?"disabled":""}>\u203a</button>`:""}
catch(e){if(e.name==="AbortError")return;if(e.status===404&&S.page>1){S.page=1;return load()}if(e.status===401||e.status===403)return fail(e);tb.innerHTML=`<tr><td colspan="9" class="text-center text-mute py-5">${esc(e.message)} <button class="btn btn-ghost btn-sm ms-2" id="rt">Retry</button></td></tr>`;$("#rt").onclick=load}}
/* form generated from backend metadata */
function fieldHtml(k,f,v){const id="f_"+k,n=`id="${id}" name="${esc(k)}"`,rq=f.required?" required":"",
lab=`<label class="small text-mute" for="${id}">${esc(f.label||k)}${f.required?" *":""}</label>`,err=`<div class="invalid-feedback" data-err="${esc(k)}"></div>`;
const opts=(a,blank)=>(blank?'<option value=""></option>':"")+a.map(([x,y])=>`<option value="${esc(x)}" ${String(v)===String(x)?"selected":""}>${esc(y)}</option>`).join("");let w=6,inp;
if(f.type==="boolean"){const on=v===undefined?/active|available/i.test(k):!!v;return `<div class="col-md-6 pt-3"><div class="form-check form-switch"><input class="form-check-input" type="checkbox" ${n} ${on?"checked":""}><label class="form-check-label" for="${id}">${esc(f.label||k)}</label></div>${err}</div>`}
if(f.type==="choice")inp=`<select class="form-select" ${n}${rq}>${opts((f.choices||[]).map(c=>[c.value,c.display_name]),!f.required)}</select>`;
else if(k==="category"||k==="brand")inp=`<select class="form-select" ${n}${rq}>${opts((k==="category"?m.categories:m.brands).map(c=>[c.id,c.name]),!f.required)}</select>`;
else if(["integer","decimal","float"].includes(f.type))inp=`<input class="form-control" type="number" step="${f.type==="integer"?1:"any"}" ${n} value="${esc(v)}"${rq}>`;
else if(/description/i.test(k)){w=12;inp=`<textarea class="form-control" rows="${/short/i.test(k)?2:5}" ${n}${rq}>${esc(v)}</textarea>`}
else inp=`<input class="form-control" ${f.max_length?`maxlength="${f.max_length}"`:""} ${n} value="${esc(v)}"${rq}>`;
return `<div class="col-md-${w}">${lab}${inp}${err}</div>`}
const clearErr=()=>{$$("#pf2 .is-invalid").forEach(x=>x.classList.remove("is-invalid"));$$("#pf2 [data-err]").forEach(x=>{x.textContent="";x.classList.remove("d-block")});$("#pfe").classList.add("d-none")};
function showErr(d){const top=[];for(const[k,v]of Object.entries(d||{})){const t=[].concat(v).map(x=>typeof x==="object"?JSON.stringify(x):x).join(" "),el=$(`[data-err="${CSS.escape(k)}"]`);
if(el){el.textContent=t;el.classList.add("d-block");$(`#pf2 [name="${CSS.escape(k)}"]`)?.classList.add("is-invalid")}else top.push(`${k}: ${t}`)}
if(top.length){$("#pfe").textContent=top.join(" | ");$("#pfe").classList.remove("d-none")}}
function openForm(r){S.editing=r;$("#pt").textContent=r?"Edit product":"Add product";
$("#pfields").innerHTML=fields.map(([k,f])=>fieldHtml(k,f,r?(k==="category"||k==="brand"?idOf(r[k]):r[k]):undefined)).join("");clearErr();modal("#pm").show()}
function collect(){const o={};for(const[k,f]of fields){const el=$(`#pf2 [name="${CSS.escape(k)}"]`);if(!el)continue;
if(f.type==="boolean"){o[k]=el.checked;continue}const v=el.value.trim();
if(v===""){if(S.editing&&!f.required)o[k]=f.type==="string"?"":null;else if(f.required)o[k]="";continue}o[k]=v}return o}
$("#pf2").onsubmit=async e=>{e.preventDefault();clearErr();const b=$("#psave"),ed=S.editing;b.disabled=true;
try{const r=await http(ed?`${P}${encodeURIComponent(ed.id)}/`:P,{method:ed?"PATCH":"POST",body:collect(),auth:true});
modal("#pm").hide();flash(ed?"Product updated":"Product created");await Promise.all([load(),stats()]);if(!ed&&r&&r.id!=null)openImages(r)}
catch(er){if(er.status===400&&er.data)showErr(er.data);else fail(er)}finally{b.disabled=false}};
/* delete */
let del=null;
$("#dgo").onclick=async()=>{if(!del)return;const b=$("#dgo");b.disabled=true;
try{await http(`${P}${encodeURIComponent(del.id)}/`,{method:"DELETE",auth:true});modal("#dm").hide();flash("Product deleted");await Promise.all([load(),stats()])}catch(e){fail(e)}finally{b.disabled=false}};
/* images (existing ProductImage API; fields mapped from its OPTIONS metadata) */
let EP;const imgEp=()=>EP||(EP=(async()=>{if(CFG.imagesEndpoint)return CFG.imagesEndpoint;
try{const r=await http(`${API_BASE}/`,{auth:true}),k=Object.keys(r||{}).find(x=>/image/i.test(x));return k?new URL(r[k],location.href).pathname:null}catch{return null}})());
async function openImages(r){S.img=null;$("#in").textContent=r.name||"";$("#iw").classList.add("d-none");$("#ib").innerHTML=spin;modal("#im").show();
try{const ep=await imgEp();if(!ep)return $("#ib").innerHTML='<p class="text-mute">No product-image endpoint was found at the API root. Set CFG.imagesEndpoint in admin-dashboard.js.</p>';
const f=(await API.options(ep)).actions?.POST;if(!f)return $("#ib").innerHTML='<p class="text-mute">Your account cannot manage product images.</p>';
const ks=Object.keys(f),file=ks.find(k=>/upload/.test(f[k].type)),fk=ks.includes("product")?"product":ks.find(k=>f[k].type==="field"&&!f[k].read_only),
alt=ks.find(k=>/alt/i.test(k)),prim=ks.find(k=>f[k].type==="boolean"&&/primary|main|cover/i.test(k));
if(!file||!fk)return $("#ib").innerHTML=`<p class="text-mute">Could not map the image fields. Found: ${esc(ks.join(", "))}</p>`;
S.img={pid:r.id,name:r.name||"",ep,file,fk,alt,prim};$("#ib").innerHTML="";$("#iw").classList.remove("d-none");await renderImgs()}
catch(e){$("#ib").innerHTML=`<p class="text-mute">${esc(e.message)}</p>`}}
async function renderImgs(){const I=S.img,g=$("#ig");g.innerHTML=spin;
try{const d=await http(`${I.ep}?${qstr({product:I.pid,page_size:100})}`,{auth:true}),a=asList(d).filter(x=>String(idOf(x[I.fk]))===String(I.pid));
g.innerHTML=a.length?a.map(x=>{const u=safeUrl(imgOf(x[I.file])),pr=I.prim&&x[I.prim];
return `<div class="col-6 col-md-4 col-lg-3"><div class="imgcard">${u?`<img src="${esc(u)}" alt="" onerror="noimg(this)">`:'<span class="noimg" style="aspect-ratio:4/3"><i class="bi bi-image"></i></span>'}
${I.alt?`<input class="form-control form-control-sm my-2" value="${esc(x[I.alt])}" data-alt="${esc(x.id)}" placeholder="Alt text">`:""}<div class="d-flex gap-1 flex-wrap mt-2">
${I.prim?(pr?'<span class="badge bg-danger">Primary</span>':`<button class="btn btn-ghost btn-sm" data-ip="${esc(x.id)}">Set primary</button>`):""}${I.alt?`<button class="btn btn-ghost btn-sm" data-ia="${esc(x.id)}">Save alt</button>`:""}<button class="btn btn-ghost btn-sm" data-idel="${esc(x.id)}"><i class="bi bi-trash"></i></button></div></div></div>`}).join(""):'<div class="col-12 text-mute">No images yet.</div>'}
catch(e){g.innerHTML=`<div class="col-12 text-mute">${esc(e.message)}</div>`}}
$("#iu").onsubmit=async e=>{e.preventDefault();const I=S.img,fs=[...$("#ifiles").files],st=$("#ist");if(!I||!fs.length)return;let bad=0;
for(const[i,fl]of fs.entries()){st.textContent=`Uploading ${i+1}/${fs.length}\u2026`;if(!fl.type.startsWith("image/")){bad++;flash(`${fl.name}: not an image`,true);continue}
const fd=new FormData();fd.append(I.fk,I.pid);fd.append(I.file,fl);if(I.alt)fd.append(I.alt,I.name);
try{await http(I.ep,{method:"POST",body:fd,auth:true})}catch(er){bad++;flash(`${fl.name}: ${er.message}`,true)}}
st.textContent=bad?`${bad} failed`:"Uploaded";$("#ifiles").value="";await renderImgs();load()};
$("#ig").addEventListener("click",async e=>{const I=S.img,b=e.target.closest("button");if(!I||!b)return;const u=k=>`${I.ep}${encodeURIComponent(b.dataset[k])}/`;
try{if(b.dataset.ia){await http(u("ia"),{method:"PATCH",body:{[I.alt]:$(`[data-alt="${CSS.escape(b.dataset.ia)}"]`).value},auth:true});flash("Alt text saved")}
else if(b.dataset.ip){await http(u("ip"),{method:"PATCH",body:{[I.prim]:true},auth:true});flash("Primary image set")}
else if(b.dataset.idel){if(!confirm("Remove this image?"))return;await http(u("idel"),{method:"DELETE",auth:true});flash("Image removed")}
else return;await renderImgs();load()}catch(er){if(er.status===400&&er.data)flash(apiMsg(er.data),true);else fail(er)}});
/* page wiring */
const opt=(l,a)=>`<option value="">${l}</option>`+a.map(x=>`<option value="${esc(x.id)}">${esc(x.name)}</option>`).join("");
$("#fc").innerHTML=opt("All categories",m.categories);$("#fb").innerHTML=opt("All brands",m.brands);
let t;$("#q").addEventListener("input",()=>{clearTimeout(t);t=setTimeout(()=>{S.page=1;load()},400)});
["#fc","#fb","#fa"].forEach(s=>$(s).addEventListener("change",()=>{S.page=1;load()}));
$("#rs").onclick=()=>{$("#q").value="";["#fc","#fb","#fa"].forEach(s=>$(s).value="");S.page=1;load()};
$("#addp").onclick=()=>openForm(null);
document.addEventListener("click",e=>{const b=e.target.closest("[data-edit],[data-del],[data-img],[data-pg]");if(!b||!$("#rows").contains(b)&&!$("#pg").contains(b))return;
if(b.dataset.pg){S.page=+b.dataset.pg;return load()}const r=S.raw.get(String(b.dataset.edit||b.dataset.del||b.dataset.img));if(!r)return;
if(b.dataset.edit)openForm(r);else if(b.dataset.img)openImages(r);else{del=r;$("#dn").textContent=r.name||"this product";modal("#dm").show()}});
stats();load()});
