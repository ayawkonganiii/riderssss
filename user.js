const me=guard('user');let pins=[],map=null;
const STEPS=[['searching','Searching'],['found','Rider Found'],['ontheway','On the Way'],['arrived','Arrived'],['completed','Completed']];
const active=()=>DB.get('rides').find(r=>r.userId===me.id&&!['completed','cancelled'].includes(r.status));
if(window.L){map=L.map('map').setView([14.5995,120.9842],13);L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(map);
 map.on('click',e=>{if(pins.length===2){pins.forEach(m=>m.remove());pins=[]}pins.push(L.marker(e.latlng).addTo(map));
  $(pins.length===1?'#pickup':'#drop').value=`Pin ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`;est()})}
function est(){const p=$('#pickup').value.trim(),d=$('#drop').value.trim();if(!p||!d){$('#est').textContent='—';return 0}
 let km=pins.length===2?map.distance(pins[0].getLatLng(),pins[1].getLatLng())/1000*1.3:((p.length+d.length)%9)+1.5;km=+km.toFixed(1);
 $('#est').textContent=`${km} km · ₱${fare(km)}`;return km}
['#pickup','#drop'].forEach(s=>$(s).oninput=()=>{pins.forEach(m=>m.remove());pins=[];est()});
$('#book').onsubmit=e=>{e.preventDefault();const p=$('#pickup').value.trim(),d=$('#drop').value.trim();
 if(!p||!d){$('#bk-err').textContent='⚠ Enter pickup and drop-off.';return}
 if(active()){$('#bk-err').textContent='⚠ You already have an active ride.';return}
 const km=est();DB.set('rides',[...DB.get('rides'),{id:'R'+Date.now(),userId:me.id,userName:me.name,pickup:p,drop:d,km,fare:fare(km),status:'searching',t:Date.now(),declined:[]}]);
 $('#bk-err').textContent='';render()};
const cancel=id=>{saveRide(id,{status:'cancelled'});render()};
function rate(id,n){const r=DB.get('rides').find(x=>x.id===id);saveRide(id,{rating:n});
 DB.set('users',DB.get('users').map(u=>u.id===r.riderId?{...u,rating:+((u.rating*u.n+n)/(u.n+1)).toFixed(1),n:u.n+1}:u));render()}
function render(){const a=active(),idx=a?STEPS.findIndex(s=>s[0]===a.status):-1;
 $('#track').innerHTML=STEPS.map(([k,l],i)=>`<span class="${i<=idx?'on':''}">${l}</span>`).join('');
 $('#ride').innerHTML=a?`<p><b>${esc(a.pickup)}</b> → <b>${esc(a.drop)}</b></p><p>${a.km} km · ₱${a.fare}</p>${a.riderName?`<p>Rider: <b>${esc(a.riderName)}</b> · ${esc(a.bike)} · ${esc(a.plate)}</p>`:'<p>Looking for a nearby rider…</p>'}${['searching','found'].includes(a.status)?`<button class="btn sm alt" onclick="cancel('${a.id}')">Cancel ride</button>`:''}`:'<p>No active ride. Book one!</p>';
 const near=DB.get('users').filter(u=>u.role==='rider'&&u.status==='approved'&&u.online);
 $('#nearby').innerHTML=near.length?near.map(r=>`<p><b>${esc(r.name)}</b> · ★ ${r.rating}<br><small>${esc(r.bike)} · ${esc(r.plate)}</small></p>`).join(''):'<p>No riders online right now.</p>';
 const H=DB.get('rides').filter(r=>r.userId===me.id).reverse();
 $('#hist').innerHTML='<tr><th>Date</th><th>Route</th><th>Fare</th><th>Status</th><th>Rating</th></tr>'+(H.length?H.map(r=>`<tr><td>${new Date(r.t).toLocaleDateString()}</td><td>${esc(r.pickup)} → ${esc(r.drop)}</td><td>₱${r.fare}</td><td>${r.status}</td><td class="stars">${r.status!=='completed'?'—':r.rating?'★'.repeat(r.rating):[1,2,3,4,5].map(n=>`<button aria-label="Rate ${n}" onclick="rate('${r.id}',${n})">★</button>`).join('')}</td></tr>`).join(''):'<tr><td colspan="5">No rides yet.</td></tr>')}
render();setInterval(render,1500);
