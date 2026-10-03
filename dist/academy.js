const menuButton=document.querySelector('.menu-toggle'),nav=document.querySelector('#site-nav');
menuButton?.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('is-open')){nav.classList.remove('is-open');menuButton.setAttribute('aria-expanded','false');menuButton.focus()}});
for (const form of document.querySelectorAll('.academy-form')) {
 const status=form.querySelector('.form-status');
 const button=form.querySelector('button[type="submit"]');
 if(button){button.disabled=true;button.textContent='Online submission unavailable';}
 if(status){status.hidden=false;status.textContent='Online form submission is not enabled. Please contact the academy using the email or phone listed on this page.';}
 form.addEventListener('submit',event=>event.preventDefault());
}

const lightbox=document.querySelector('#gallery-dialog');
if(lightbox){const buttons=[...document.querySelectorAll('.gallery-item')],photo=lightbox.querySelector('img'),counter=lightbox.querySelector('[data-counter]');let index=0;function show(n){index=(n+buttons.length)%buttons.length;photo.src=buttons[index].dataset.full;photo.alt=buttons[index].querySelector('img').alt;counter.textContent=(index+1)+' / '+buttons.length;}for(const [i,b] of buttons.entries())b.addEventListener('click',()=>{show(i);lightbox.showModal()});lightbox.querySelector('.close').addEventListener('click',()=>lightbox.close());lightbox.querySelector('[data-prev]').addEventListener('click',()=>show(index-1));lightbox.querySelector('[data-next]').addEventListener('click',()=>show(index+1));lightbox.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();show(index+1)}if(e.key==='ArrowLeft'){e.preventDefault();show(index-1)}});lightbox.addEventListener('click',e=>{if(e.target===lightbox){const r=lightbox.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)lightbox.close()}});}
