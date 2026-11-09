"use strict";
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money=n=>n==null?"\u2014":"$"+Number(n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const ls={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
const qs=new URLSearchParams(location.search),CK="rl_cart2";localStorage.removeItem("rl_cart");
const cart=()=>ls.get(CK,{}),pct=p=>p.old?Math.round((1-p.price/p.old)*100):0;
window.noimg=el=>{const s=document.createElement("span");s.className="noimg";s.innerHTML='<i class="bi bi-image"></i>';el.replaceWith(s)};
const pic=p=>p.img?`<img loading="lazy" src="${esc(p.img)}" alt="${esc(p.name)}" onerror="noimg(this)">`:`<span class="noimg"><i class="bi bi-image"></i></span>`;
const spin=`<div class="col-12 text-center text-mute py-5"><div class="spinner-border spinner-border-sm text-danger me-2"></div>Loading\u2026</div>`;
function showMsg(el,text,retry){el.innerHTML=`<div class="col-12 text-center text-mute py-5"><p class="mb-3">${esc(text)}</p>${retry?'<button class="btn btn-ghost btn-sm" data-retry>Try again</button>':""}</div>`;if(retry)$("[data-retry]",el).onclick=retry}
function card(p){const sold=p.inStock===false,u=encodeURIComponent(p.id);
return `<div class="col-6 col-lg-3 reveal"><article class="pc"><a href="product.html?id=${u}" class="pc-img">${p.old?`<span class="pc-disc">-${pct(p)}%</span>`:""}${pic(p)}<button class="pc-qv" data-qv="${esc(p.id)}" onclick="event.preventDefault()">Quick view</button></a>
<div class="pc-body"><div>${p.category?`<small>${esc(p.category)}</small>`:""}<a href="product.html?id=${u}" class="pc-name">${esc(p.name)}</a><span class="pc-price">${money(p.price)}${p.old?`<s>${money(p.old)}</s>`:""}</span>${p.rating!=null?`<span class="pc-rate"><i class="bi bi-star-fill"></i> ${esc(p.rating)}</span>`:""}</div>
<button class="pc-add" data-add="${esc(p.id)}" ${sold?'disabled title="Out of stock"':""} aria-label="Add to cart">${sold?"\u2013":"+"}</button></div><i class="pc-line"></i></article></div>`}
function toast(m){let w=$(".toast-wrap");if(!w){w=document.createElement("div");w.className="toast-wrap";document.body.append(w)}
const t=document.createElement("div");t.className="panel py-2 px-3 mb-2 border-danger";t.innerHTML=`<i class="bi bi-check-circle text-red me-2"></i>${esc(m)}`;w.append(t);setTimeout(()=>t.remove(),2200)}
function add(id,q=1){const p=peek(id);if(p&&p.inStock===false)return toast("Out of stock");const c=cart();let n=(c[id]||0)+q;if(p&&p.stock!=null)n=Math.min(n,p.stock);c[id]=n;ls.set(CK,c);badge();toast("Added to cart")}
function badge(){const n=Object.values(cart()).reduce((a,b)=>a+b,0);$$(".badge-cart").forEach(b=>b.textContent=n)}
function layout(){const pg=document.body.dataset.page,L=[["index","Home"],["shop","Shop"],["index#cats","Categories"],["index#brands","Brands"],["index#about","About Us"],["index#contact","Contact"]];
$("#nav").innerHTML=`<nav class="navbar navbar-expand-lg navbar-dark"><div class="container"><a class="navbar-brand brand" href="index.html">REDLINE <span>PERFORMANCE</span></a>
<button class="navbar-toggler border-0" data-bs-toggle="collapse" data-bs-target="#nv"><span class="navbar-toggler-icon"></span></button>
<div class="collapse navbar-collapse" id="nv"><ul class="navbar-nav mx-auto">${L.map(l=>`<li class="nav-item"><a class="nav-link ${l[0]==pg?"active":""}" href="${l[0].replace("#",".html#")}${l[0].includes("#")?"":".html"}">${l[1]}</a></li>`).join("")}</ul>
<div class="d-flex gap-3 align-items-center"><button class="icon-btn" data-bs-toggle="modal" data-bs-target="#sm"><i class="bi bi-search"></i></button>
<a class="icon-btn" href="${Auth.on?"profile":"login"}.html"><i class="bi bi-person"></i></a><a class="icon-btn" href="cart.html"><i class="bi bi-bag"></i><span class="badge-cart">0</span></a></div></div></div></nav>
<div class="modal fade" id="sm"><div class="modal-dialog modal-dialog-centered"><div class="modal-content p-3"><form onsubmit="event.preventDefault();location='shop.html?search='+encodeURIComponent(this.q.value)"><input name="q" class="form-control form-control-lg" placeholder="Search products, SKU, brands..." autofocus></form></div></div></div>
<div class="modal fade" id="qvm"><div class="modal-dialog modal-lg modal-dialog-centered"><div class="modal-content"><div class="modal-body p-4" id="qvb"></div></div></div></div>`;
$("#foot").innerHTML=`<footer><div class="container"><div class="row g-4"><div class="col-md-4"><div class="brand fs-5">REDLINE <span>PERFORMANCE</span></div><p class="text-mute mt-2">Premium tuning parts and sport accessories. Speed, precision, passion.</p></div>
<div class="col-6 col-md-2"><h6>Shop</h6><a href="shop.html">All Products</a><a href="shop.html?has_discount=true">Offers</a></div>
<div class="col-6 col-md-2"><h6>Account</h6><a href="login.html">Login</a><a href="profile.html">Profile</a><a href="orders.html">Orders</a></div>
<div class="col-md-4"><h6>Newsletter</h6><form class="d-flex gap-2" onsubmit="event.preventDefault();toast('Subscribed');this.reset()"><input class="form-control" type="email" required placeholder="Email"><button class="btn btn-red">Join</button></form></div></div>
<hr class="border-secondary mt-4"><small class="text-mute">&copy; 2026 Redline Performance. All rights reserved.</small></div></footer>`;badge();navDash(pg)}
function navDash(pg){if(!Auth.on)return;API.canManage().then(ok=>{const ul=$("#nv .navbar-nav");if(ok&&ul&&!$("#nav-dash"))ul.insertAdjacentHTML("beforeend",`<li class="nav-item" id="nav-dash"><a class="nav-link ${pg==="admin-dashboard"?"active":""}" href="admin-dashboard.html">Dashboard</a></li>`)})}
document.addEventListener("click",e=>{const a=e.target.closest("[data-add]"),q=e.target.closest("[data-qv]");
if(a&&!a.disabled){add(a.dataset.add,+(a.dataset.q||1));if(a.classList.contains("pc-add")){a.classList.add("ok");a.textContent="\u2713";setTimeout(()=>{a.classList.remove("ok");a.textContent="+"},1400)}}
if(q){const p=peek(q.dataset.qv);if(!p)return;$("#qvb").innerHTML=`<div class="row g-4"><div class="col-md-6" style="aspect-ratio:4/5;overflow:hidden">${pic(p)}</div><div class="col-md-6"><h4>${esc(p.name)}</h4><p class="text-mute small">${esc([p.brand,p.category].filter(Boolean).join(" \u00b7 "))}</p><div class="mb-3"><span class="price fs-4">${money(p.price)}</span> ${p.old?`<span class="old">${money(p.old)}</span>`:""}</div><p class="text-mute small">${p.inStock===false?"Out of stock":p.stock!=null?p.stock+" in stock":""}</p><button class="btn btn-red me-2" data-add="${esc(p.id)}" ${p.inStock===false?"disabled":""}>Add to Cart</button><a class="btn btn-ghost" href="product.html?id=${encodeURIComponent(p.id)}">Details</a></div></div>`;bootstrap.Modal.getOrCreateInstance("#qvm").show()}});

async function fillProducts(sel,params){const el=$(sel);if(!el)return;el.innerHTML=spin;
try{const r=await API.getProducts(params);if(!r.items.length)return showMsg(el,"No products available yet.");el.innerHTML=r.items.map(card).join("")}
catch(e){showMsg(el,e.message,()=>fillProducts(sel,params))}}
async function loadCart(){const c=cart(),ids=Object.keys(c);
const ps=await Promise.all(ids.map(id=>API.getProductCached(id).catch(e=>e.network?{id,err:"net"}:null)));
return ids.map((id,i)=>({id,q:c[id],p:ps[i]&&!ps[i].err?ps[i]:null,net:ps[i]&&ps[i].err}))}
const shipFor=s=>s>500||!s?0:25;
const R={
async index(){fillProducts("#best",{ordering:"-views_count",page_size:4});fillProducts("#new",{ordering:"-created_at",page_size:4});
const m=await API.meta();const cEl=$("#cats");
cEl.innerHTML=m.categories.map(c=>`<a class="link-arrow me-3 d-inline-block mb-3" href="shop.html?category=${encodeURIComponent(c.id)}">${esc(c.name)}</a>`).join("");
const b=$("#brandrow");if(m.brands.length)b.innerHTML=m.brands.slice(0,6).map(x=>`<a href="shop.html?brand=${encodeURIComponent(x.id)}"><span>${esc(x.name)}</span></a>`).join("");else $("#brands").style.display="none"},
async shop(){const S={search:qs.get("search")||"",category:qs.get("category")||"",brand:qs.get("brand")||"",min_price:qs.get("min_price")||"",max_price:qs.get("max_price")||"",
has_discount:qs.get("has_discount")==="true",in_stock:qs.get("in_stock")==="true",ordering:qs.get("ordering")||"",page:Math.max(1,+qs.get("page")||1),page_size:+qs.get("page_size")||12};
const list=$("#plist");list.innerHTML=spin;const m=await API.meta();
const opt=(l,a)=>`<option value="">${l}</option>`+a.map(x=>`<option value="${esc(x.id)}">${esc(x.name)}</option>`).join("");
$("#fcat").innerHTML=opt("All categories",m.categories);$("#fbrand").innerHTML=opt("All brands",m.brands);
const set=()=>{$("#fq").value=S.search;$("#fcat").value=S.category;$("#fbrand").value=S.brand;$("#fmin").value=S.min_price;$("#fmax").value=S.max_price;$("#fdisc").checked=S.has_discount;$("#fstock").checked=S.in_stock;$("#fsort").value=S.ordering;$("#fsize").value=S.page_size};set();
const read=()=>{S.search=$("#fq").value.trim();S.category=$("#fcat").value;S.brand=$("#fbrand").value;S.min_price=$("#fmin").value;S.max_price=$("#fmax").value;S.has_discount=$("#fdisc").checked;S.in_stock=$("#fstock").checked;S.ordering=$("#fsort").value;S.page_size=+$("#fsize").value||12};
let ctl;const params=()=>({search:S.search,category:S.category,brand:S.brand,min_price:S.min_price,max_price:S.max_price,has_discount:S.has_discount?"true":"",in_stock:S.in_stock?"true":"",ordering:S.ordering,page:S.page>1?S.page:"",page_size:S.page_size});
async function run(){if(S.min_price!==""&&S.max_price!==""&&+S.min_price>+S.max_price){$("#pager").innerHTML="";$("#cnt").textContent="";return showMsg(list,"Minimum price is higher than maximum price.")}
ctl?.abort();ctl=new AbortController();const p=params();history.replaceState(null,"",location.pathname+(qstr(p)?"?"+qstr(p):""));list.innerHTML=spin;
try{const r=await API.getProducts(p,ctl.signal);$("#cnt").textContent=`${r.count} product${r.count==1?"":"s"}`;
if(!r.items.length){$("#pager").innerHTML="";return showMsg(list,"No products match your filters.")}
list.innerHTML=r.items.map(x=>card(x).replace("col-lg-3","col-lg-4")).join("");pager(r.paginated?r.count:0)}
catch(e){if(e.name==="AbortError")return;if(e.status===404&&S.page>1){S.page=1;return run()}$("#pager").innerHTML="";showMsg(list,e.message,run)}}
function pager(count){const pages=Math.ceil(count/S.page_size),el=$("#pager");if(pages<2){el.innerHTML="";return}
const nums=[...new Set([1,pages,S.page-1,S.page,S.page+1])].filter(n=>n>=1&&n<=pages).sort((a,b)=>a-b);let h="",last=0;
const b=(l,n,d,a)=>`<button class="btn btn-ghost btn-sm px-3 ${a?"border-danger":""}" data-page="${n}" ${d?"disabled":""}>${l}</button>`;
h+=b("\u2039",S.page-1,S.page<=1);nums.forEach(n=>{if(n-last>1)h+='<span class="text-mute px-1">\u2026</span>';h+=b(n,n,false,n==S.page);last=n});h+=b("\u203a",S.page+1,S.page>=pages);el.innerHTML=h}
$("#pager").addEventListener("click",e=>{const b=e.target.closest("[data-page]");if(!b||b.disabled)return;S.page=+b.dataset.page;run();scrollTo({top:0,behavior:"smooth"})});
let t;$$("#filters [data-f]").forEach(el=>el.addEventListener(["text","number","search"].includes(el.type)?"input":"change",()=>{clearTimeout(t);t=setTimeout(()=>{read();S.page=1;run()},["text","number"].includes(el.type)?400:0)}));
$("#freset").onclick=()=>{location.href="shop.html"};run()},
async product(){const box=$("#pd"),id=qs.get("id");if(!id||!/^[\w-]+$/.test(id)){$("#rel").closest("section").style.display="none";return showMsg(box,"Invalid product link.")}
box.innerHTML=spin;let p;
try{p=await API.getProduct(id)}catch(e){$("#rel").closest("section").style.display="none";return showMsg(box,e.status===404?"Product not found.":e.message,e.status===404?null:R.product)}
document.title=p.name+" | Redline Performance";const sold=p.inStock===false;
box.innerHTML=`<div class="col-md-6"><div class="panel p-2" style="aspect-ratio:4/5;overflow:hidden" id="mi">${pic(p)}</div>${p.imgs.length>1?`<div class="d-flex gap-2 mt-2 flex-wrap">${p.imgs.map((u,i)=>`<button class="btn p-0 border-0" data-th="${i}" style="width:72px;height:72px"><img src="${esc(u)}" alt="" class="w-100 h-100" style="object-fit:cover" onerror="this.closest('button').remove()"></button>`).join("")}</div>`:""}</div>
<div class="col-md-6">${p.category?`<small class="text-red text-uppercase fw-bold">${esc(p.category)}</small>`:""}<h1 class="h2 my-2">${esc(p.name)}</h1>
<p class="text-mute small">${[p.brand&&"Brand: "+esc(p.brand),p.sku&&"SKU: "+esc(p.sku)].filter(Boolean).join(" \u00b7 ")}</p>
<div class="mb-3"><span class="price fs-2">${money(p.price)}</span>${p.old?` <span class="old fs-6 ms-2">${money(p.old)}</span> <span class="badge bg-danger">-${pct(p)}%</span>`:""}</div>
<p class="${sold?"text-red":"text-mute"} small">${sold?"Out of stock":p.stock!=null?p.stock+" in stock":"In stock"}${p.views!=null?` \u00b7 ${p.views} views`:""}</p>
<p class="text-mute" style="white-space:pre-line">${esc(p.desc)}</p>
<div class="d-flex gap-2 mt-4"><input id="pq" type="number" min="1" ${p.stock!=null?`max="${p.stock}"`:""} value="1" class="form-control qty" ${sold?"disabled":""}><button class="btn btn-red px-4" id="pa" ${sold?"disabled":""}>Add to Cart</button></div></div>`;
$("#pa").onclick=()=>add(p.id,Math.max(1,+$("#pq").value||1));
box.addEventListener("click",e=>{const t=e.target.closest("[data-th]");if(t)$("#mi").innerHTML=`<img src="${esc(p.imgs[+t.dataset.th])}" alt="${esc(p.name)}" onerror="noimg(this)">`});
const rel=$("#rel");if(p.catId===""){rel.closest("section").style.display="none";return}
try{const r=await API.getProducts({category:p.catId,page_size:5});const l=r.items.filter(x=>String(x.id)!==String(p.id)).slice(0,4);if(l.length)rel.innerHTML=l.map(card).join("");else rel.closest("section").style.display="none"}catch{rel.closest("section").style.display="none"}},
async cart(){const box=$("#items");let first=true;
const draw=async()=>{badge();if(!Object.keys(cart()).length){box.innerHTML=`<tr><td colspan="5" class="text-center text-mute py-5">Your cart is empty. <a class="text-red" href="shop.html">Shop now</a></td></tr>`;return tot(0,false)}
if(first)box.innerHTML=`<tr><td colspan="5" class="text-center text-mute py-5">Loading\u2026</td></tr>`;first=false;let rows=await loadCart(),sub=0,bad=false;
box.innerHTML=rows.map(r=>{if(!r.p){bad=true;return `<tr><td colspan="4" class="text-mute">${r.net?"Could not load this item (network error).":"This item is no longer available."}</td><td><button class="icon-btn" data-rm="${esc(r.id)}"><i class="bi bi-trash"></i></button></td></tr>`}
const t=r.p.price*r.q;sub+=t;return `<tr><td style="width:90px"><div style="width:72px;aspect-ratio:1;overflow:hidden">${pic(r.p)}</div></td><td><a href="product.html?id=${encodeURIComponent(r.id)}">${esc(r.p.name)}</a><div class="text-mute small">${money(r.p.price)}</div></td><td><input type="number" min="1" ${r.p.stock!=null?`max="${r.p.stock}"`:""} value="${r.q}" data-q="${esc(r.id)}" class="form-control qty"></td><td>${money(t)}</td><td><button class="icon-btn" data-rm="${esc(r.id)}"><i class="bi bi-trash"></i></button></td></tr>`}).join("");tot(sub,bad)};
const tot=(sub,bad)=>{const sh=shipFor(sub);$("#sub").textContent=money(sub);$("#ship").textContent=sh?money(sh):"Free";$("#tot").textContent=money(sub+sh);$("#co").classList.toggle("disabled",!sub||bad)};
document.addEventListener("change",e=>{const q=e.target.dataset.q;if(q){const c=cart(),p=peek(q);let n=Math.max(1,+e.target.value||1);if(p&&p.stock!=null)n=Math.min(n,p.stock);c[q]=n;ls.set(CK,c);draw()}});
document.addEventListener("click",e=>{const r=e.target.closest("[data-rm]");if(r){const c=cart();delete c[r.dataset.rm];ls.set(CK,c);draw()}});draw()},
async checkout(){if(!Object.keys(cart()).length)return location.replace("cart.html");const sum=$("#sum"),btn=$("#cf button");sum.innerHTML="Loading\u2026";btn.disabled=true;
const rows=await loadCart();let sub=0,bad=rows.some(r=>!r.p);
sum.innerHTML=rows.map(r=>{if(!r.p)return `<div class="small text-red mb-2">An item is unavailable. <a href="cart.html">Review cart</a></div>`;sub+=r.p.price*r.q;return `<div class="d-flex justify-content-between small mb-2"><span>${esc(r.p.name)} \u00d7 ${r.q}</span><span>${money(r.p.price*r.q)}</span></div>`}).join("");
const sh=shipFor(sub);$("#tot").textContent=money(sub+sh);btn.disabled=bad||!sub;
$("#cf").onsubmit=e=>{e.preventDefault();if(btn.disabled)return;const o=ls.get("rl_orders",[]);o.unshift({id:"RL"+Date.now().toString().slice(-6),date:new Date().toLocaleDateString(),total:sub+sh,status:"Local demo",items:rows.map(r=>({n:r.p.name,q:r.q}))});ls.set("rl_orders",o);ls.set(CK,{});location="orders.html"}},
login(){if(Auth.on)return location.replace("profile.html");
const run=async(form,errEl,fn)=>{const b=$("button",form);errEl.classList.add("d-none");b.disabled=true;try{await fn();location="profile.html"}catch(e){errEl.textContent=e.message;errEl.classList.remove("d-none");b.disabled=false}};
$("#lf").onsubmit=e=>{e.preventDefault();const f=e.target;run(f,$("#le"),()=>API.login(f.email.value.trim(),f.pw.value))};
$("#rf").onsubmit=e=>{e.preventDefault();const f=e.target;run(f,$("#re"),async()=>{await API.register({name:f.name.value.trim(),email:f.email.value.trim(),password:f.pw.value});await API.login(f.email.value.trim(),f.pw.value)})}},
async profile(){if(!Auth.on)return location.replace("login.html");$("#lo").onclick=()=>{Auth.clear();location="index.html"};
try{const u=await API.profile();const nm=u.full_name||[u.first_name,u.last_name].filter(Boolean).join(" ")||u.name||u.username||"";$("#pn").value=nm;$("#pe").value=u.email||"";$("#hi").textContent=nm||u.email||""}
catch(e){if(e.status===401)return location.replace("login.html");$("#pf").insertAdjacentHTML("beforebegin",`<div class="alert alert-danger">${esc(e.message)}</div>`)}},
orders(){const o=ls.get("rl_orders",[]);$("#ol").innerHTML=o.length?o.map(x=>`<div class="panel mb-3"><div class="d-flex justify-content-between flex-wrap"><strong>#${esc(x.id)}</strong><span class="badge bg-secondary">${esc(x.status)}</span></div><div class="text-mute small mb-2">${esc(x.date)}</div>${x.items.map(i=>`<div>${esc(i.n)} \u00d7 ${esc(i.q)}</div>`).join("")}<div class="text-end price mt-2">${money(x.total)}</div></div>`).join(""):`<p class="text-mute">No orders yet. <a class="text-red" href="shop.html">Start shopping</a></p>`}};
function fx(){const nb=$(".navbar"),sc=()=>nb.classList.toggle("solid",scrollY>40||document.body.dataset.page!="index");sc();addEventListener("scroll",sc,{passive:true});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{threshold:.12});
const seen=()=>$$(".reveal:not(.in)").forEach(n=>io.observe(n));seen();new MutationObserver(seen).observe(document.body,{childList:true,subtree:true});
const bg=$$(".banner .bg");addEventListener("scroll",()=>bg.forEach(b=>{const r=b.parentElement.getBoundingClientRect();b.style.transform=`translateY(${r.top*-.12}px)`}),{passive:true})}
document.addEventListener("DOMContentLoaded",()=>{layout();R[document.body.dataset.page]?.();fx()});
