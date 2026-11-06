/* Login, registration and validation */
seed();
const V={email:v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)||'Enter a valid email address.',
 pw:v=>v.length>=8||'Password must be at least 8 characters.',
 phone:v=>/^(09\d{9}|\+639\d{9})$/.test(v.replace(/[\s-]/g,''))||'Use 09XXXXXXXXX or +639XXXXXXXXX.',
 req:v=>!!v.trim()||'This field is required.'};
const norm=p=>p.replace(/[\s-]/g,'').replace(/^\+63/,'0');
const DEST={admin:'admin.html',user:'user.html',rider:'rider.html'};
function check(form,rules){let ok=true;for(const[n,fn]of Object.entries(rules)){const el=form.elements[n],r=fn(el.value,form);
 form.querySelector('#e-'+n).textContent=r===true?'':'⚠ '+r;el.setAttribute('aria-invalid',r!==true);if(r!==true)ok=false}return ok}
const users=()=>DB.get('users');
const lf=$('#loginForm');
if(lf){let role='user';
 lf.elements.email.value=DB.get('remember','');
 document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{role=b.dataset.role;document.querySelectorAll('.tabs button').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-selected',x===b)})});
 $('#toggle').onclick=()=>{const p=lf.elements.password;p.type=p.type==='password'?'text':'password'};
 $('#forgot').onclick=e=>{e.preventDefault();alert('Demo only: all demo passwords are Pass1234.')};
 lf.onsubmit=e=>{e.preventDefault();if(!check(lf,{email:v=>V.email(v.trim()),password:V.pw,phone:V.phone}))return;
  const f=lf.elements,u=users().find(x=>x.email===f.email.value.trim().toLowerCase()&&x.password===f.password.value&&norm(x.phone)===norm(f.phone.value)&&x.role===role);
  const er=$('#formerr');
  if(!u){er.textContent='⚠ No matching account for that email, password, contact number and role.';return}
  if(['suspended','rejected'].includes(u.status)){er.textContent='⚠ This account is '+u.status+'. Contact the admin.';return}
  DB.set('remember',f.remember.checked?u.email:'');DB.set('session',u.id);location.href=DEST[u.role]}}
const rf=$('#regForm');
if(rf){const f=rf.elements,isR=()=>f.role.value==='rider';
 const q=new URLSearchParams(location.search).get('role');if(q)f.role.value=q;
 const tog=()=>$('#riderFields').classList.toggle('hide',!isR());f.role.onchange=tog;tog();
 rf.querySelectorAll('input[type=file]').forEach(i=>i.onchange=()=>{const p=$('#pv-'+i.name);p.src=i.files[0]?URL.createObjectURL(i.files[0]):'';p.classList.toggle('hide',!i.files[0])});
 rf.onsubmit=e=>{e.preventDefault();
  const rules={name:V.req,email:v=>V.email(v.trim()),password:V.pw,confirm:(v,fm)=>v===fm.elements.password.value||'Passwords do not match.',phone:V.phone};
  if(isR())Object.assign(rules,{address:V.req,bike:V.req,plate:V.req,license:V.req});
  if(!check(rf,rules))return;
  const email=f.email.value.trim().toLowerCase();
  if(users().some(u=>u.email===email)){$('#e-email').textContent='⚠ Email already registered.';return}
  const u={id:'u'+Date.now(),name:f.name.value.trim(),email,password:f.password.value,phone:f.phone.value,role:f.role.value,status:isR()?'pending':'active',rating:5,n:0,online:false};
  if(isR())Object.assign(u,{address:f.address.value,bike:f.bike.value,plate:f.plate.value,license:f.license.value});
  DB.set('users',[...users(),u]);alert(isR()?'Registered! Your rider account is Pending until an admin approves it.':'Registered! Please log in.');location.href='login.html'}}
