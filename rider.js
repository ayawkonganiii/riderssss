let me=guard('rider');
const NEXT={found:['Start Trip','ontheway'],ontheway:['Arrived at Pickup','arrived'],arrived:['Complete Trip','completed']};
const cur=()=>DB.get('users').find(u=>u.id===me.id);
const setOnline=v=>DB.set('users',DB.get('users').map(u=>u.id===me.id?{...u,online:v}:u));
$('#online').onchange=e=>{setOnline(e.target.checked);render()};
function accept(id){const r=DB.get('rides').find(x=>x.id===id);if(!r||r.status!=='searching'){render();return}
 saveRide(id,{status:'found',riderId:me.id,riderName:me.name,bike:me.bike,plate:me.plate});render()}
function decline(id){const r=DB.get('rides').find(x=>x.id===id);saveRide(id,{declined:[...(r.declined||[]),me.id]});render()}
function advance(id,s){saveRide(id,{status:s});render()}
function render(){me=cur();const ok=me.status==='approved',R=DB.get('rides'),mine=R.filter(r=>r.riderId===me.id);
 const on=$('#online');on.disabled=!ok;on.checked=ok&&me.online;$('#onlbl').textContent=on.checked?'Online':'Offline';
 $('#ver').innerHTML=`Verification: <span class="badge">${me.status}</span>${ok?'':' <small>You can go online once an admin approves you.</small>'}`;
 const trip=mine.find(r=>NEXT[r.status]);
 $('#trip').innerHTML=trip?`<p><b>${esc(trip.pickup)}</b> → <b>${esc(trip.drop)}</b></p><p>Passenger: ${esc(trip.userName)} · ₱${trip.fare}</p><p>Status: <span class="badge">${trip.status}</span></p><button class="btn" onclick="advance('${trip.id}','${NEXT[trip.status][1]}')">${NEXT[trip.status][0]}</button>`:'<p>No active trip.</p>';
 const reqs=ok&&me.online&&!trip?R.filter(r=>r.status==='searching'&&!(r.declined||[]).includes(me.id)):[];
 $('#reqs').innerHTML=reqs.length?reqs.map(r=>`<div class="card"><p><b>${esc(r.userName)}</b></p><p>${esc(r.pickup)} → ${esc(r.drop)}</p><p>${r.km} km · ₱${r.fare}</p><button class="btn sm" onclick="accept('${r.id}')">Accept</button> <button class="btn sm alt" onclick="decline('${r.id}')">Decline</button></div>`).join(''):'<p>'+(ok&&me.online?'Waiting for requests…':'Go online to receive requests.')+'</p>';
 const done=mine.filter(r=>r.status==='completed'),sum=a=>'₱'+a.reduce((s,r)=>s+r.fare,0);
 $('#today').textContent=sum(done.filter(r=>new Date(r.t).toDateString()===new Date().toDateString()));
 $('#week').textContent=sum(done.filter(r=>Date.now()-r.t<6048e5));
 $('#prof').innerHTML=`<p><b>${esc(me.name)}</b> · ★ ${me.rating}</p><p>${esc(me.email)} · ${esc(me.phone)}</p><p>${esc(me.bike)} · ${esc(me.plate)}</p><p>${esc(me.address)}</p>`;
 $('#hist').innerHTML='<tr><th>Date</th><th>Route</th><th>Fare</th><th>Status</th></tr>'+(mine.length?[...mine].reverse().map(r=>`<tr><td>${new Date(r.t).toLocaleDateString()}</td><td>${esc(r.pickup)} → ${esc(r.drop)}</td><td>₱${r.fare}</td><td>${r.status}</td></tr>`).join(''):'<tr><td colspan="4">No trips yet.</td></tr>')}
render();setInterval(render,1500);
