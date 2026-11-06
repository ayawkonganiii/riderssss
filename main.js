/* Mouse-following glow + scroll-reveal */
document.addEventListener('mousemove',e=>document.querySelectorAll('.glow').forEach(el=>{const r=el.getBoundingClientRect();el.style.setProperty('--mx',e.clientX-r.left+'px');el.style.setProperty('--my',e.clientY-r.top+'px')}));
const io=new IntersectionObserver(es=>es.forEach(x=>x.isIntersecting&&x.target.classList.add('in')),{threshold:.15});
document.querySelectorAll('.rv').forEach(e=>io.observe(e));
