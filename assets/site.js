const tabs=[...document.querySelectorAll('.tab')];
function activate(t){tabs.forEach(x=>{const active=x===t;x.setAttribute('aria-selected',String(active));x.tabIndex=active?0:-1;document.getElementById(x.getAttribute('aria-controls')).hidden=!active;});}
tabs.forEach((t,i)=>{t.addEventListener('click',()=>activate(t));t.addEventListener('keydown',e=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?tabs.length-1:e.key==='ArrowRight'?(i+1)%tabs.length:(i-1+tabs.length)%tabs.length;activate(tabs[n]);tabs[n].focus();}});});
const menu=document.querySelector('.menu'),nav=document.querySelector('nav');menu.setAttribute('aria-controls',nav.id);
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Ouvrir le menu');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu');nav.classList.toggle('open',open);});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
document.querySelectorAll('[data-need]').forEach(a=>a.addEventListener('click',()=>{document.getElementById('need').value=a.dataset.need;}));
document.getElementById('contact-form').addEventListener('submit',e=>{e.preventDefault();const field=document.getElementById('name'),name=field.value.trim();if(!name){field.setCustomValidity('Indiquez votre prénom pour préparer le message.');field.reportValidity();return;}field.setCustomValidity('');const need=document.getElementById('need').value,purpose=document.getElementById('purpose').value;const msg=`Bonjour Monsieur Doumbia, je m’appelle ${name}. Je vous contacte depuis le site Coaching-Succès. Sujet : ${need}. Ma demande : ${purpose}. Merci.`;const url='https://wa.me/2250707299943?text='+encodeURIComponent(msg);const status=document.getElementById('form-status');status.replaceChildren(document.createTextNode('Votre message est préparé. Envoyez-le dans WhatsApp pour transmettre votre demande. '));const retry=document.createElement('a');retry.href=url;retry.textContent='Ouvrir le message dans WhatsApp';status.appendChild(retry);window.location.assign(url);});
document.getElementById('name').addEventListener('input',e=>e.target.setCustomValidity(''));

// ===== Animations d'apparition des sections et des cartes =====
(function(){
const root=document.documentElement;if(!root.classList.contains('js-motion'))return;
const mark=(el,type,delay)=>{el.setAttribute('data-reveal',type||'');if(delay)el.style.setProperty('--d',delay+'ms');};
// Groupe : les enfants apparaissent en cascade (décalage plafonné)
const group=(containerSel,childSel,step,type)=>document.querySelectorAll(containerSel).forEach(c=>c.querySelectorAll(childSel).forEach((el,i)=>mark(el,type,Math.min(i*step,450))));
group('.section-head',':scope > *',110);
group('.cards','.card',120);
group('.steps','.step',110,'left');
group('.tools-grid','article',130);
group('.coach-grid > div:last-child',':scope > *',70);
group('.faq > div:last-child','details',70);
document.querySelectorAll('.tabs, .method > div:first-child, .scope-note, .faq > div:first-child').forEach(el=>mark(el));
document.querySelectorAll('.coach .quote').forEach(el=>mark(el,'left'));
document.querySelectorAll('.contact-box').forEach(el=>mark(el,'zoom'));
const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return;e.target.classList.add('is-in');io.unobserve(e.target);}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
document.querySelectorAll('[data-reveal]').forEach(el=>io.observe(el));
// Changement d'onglet : les cartes du nouvel onglet rejouent leur cascade
const replay=new MutationObserver(list=>list.forEach(m=>{const panel=m.target;if(panel.hidden)return;panel.querySelectorAll('.card.is-in').forEach(card=>{card.classList.remove('is-in');void card.offsetWidth;card.classList.add('is-in');});}));
document.querySelectorAll('.cards[role=tabpanel]').forEach(p=>replay.observe(p,{attributes:true,attributeFilter:['hidden']}));
window.csRevealReady=true;
})();

// ===== Bouton retour en haut =====
(function(){
const btn=document.getElementById('to-top');if(!btn)return;
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
let ticking=false;
const update=()=>{btn.classList.toggle('visible',window.scrollY>600);ticking=false;};
window.addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(update);}},{passive:true});
update();
btn.addEventListener('click',()=>{window.scrollTo({top:0,behavior:reduce.matches?'auto':'smooth'});const brand=document.querySelector('.brand');if(brand)brand.focus({preventScroll:true});});
})();
