/* HabalGo data layer: localStorage. Replace these helpers with fetch() calls to use a real backend later. */
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const DB={get(k,d=[]){try{const v=localStorage.getItem('hg_'+k);return v===null?d:JSON.parse(v)}catch{return d}},set(k,v){localStorage.setItem('hg_'+k,JSON.stringify(v))}};
const BASE_FARE=40,PER_KM=12,fare=km=>Math.round(BASE_FARE+PER_KM*km); // fare = base + per-km rate
const saveRide=(id,p)=>DB.set('rides',DB.get('rides').map(r=>r.id===id?{...r,...p}:r));
/* Demo accounts (all passwords: Pass1234) */
function seed(){if(DB.get('seeded',false))return;
 const m=(id,name,email,phone,role,x={})=>({id,name,email,phone,role,password:'Pass1234',status:role==='rider'?'approved':'active',rating:5,n:0,online:false,...x});
 DB.set('users',[
  m('a1','Admin Aida','admin@habalgo.ph','09170000001','admin'),
  m('u1','Juan Dela Cruz','juan@habalgo.ph','09170000002','user'),
  m('u2','Maria Santos','maria@habalgo.ph','09170000003','user'),
  m('r1','Pedro Reyes','pedro@habalgo.ph','09170000004','rider',{bike:'Honda TMX 155',plate:'ABC 1234',address:'Poblacion',rating:4.8,n:10,online:true}),
  m('r2','Ana Lim','ana@habalgo.ph','09170000005','rider',{bike:'Yamaha Mio',plate:'XYZ 5678',address:'Brgy. 2',rating:4.9,n:10,online:true}),
  m('r3','Luis Garcia','luis@habalgo.ph','09170000006','rider',{bike:'Suzuki Raider',plate:'LMN 9012',address:'Brgy. 5',status:'pending'})]);
 DB.set('rides',[]);DB.set('seeded',true)}
/* Role guard: returns the logged-in user or redirects to login */
function guard(role){seed();const u=DB.get('users').find(x=>x.id===DB.get('session',null));
 if(!u||u.role!==role){location.replace('login.html');throw new Error('Unauthorized')}
 $('#who').textContent=`${role[0].toUpperCase()+role.slice(1)}: ${u.name}`;$('#role').textContent=role;return u}
function logout(){localStorage.removeItem('hg_session');location.href='login.html'}
