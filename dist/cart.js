(() => {
  'use strict';
  const key = 'adly-cart-v1';
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = n => new Intl.NumberFormat('en-EG', {style:'currency',currency:'EGP',maximumFractionDigits:2}).format(n);
  const id = p => new URL(p.url, location.origin).pathname;
  let cart = [], catalog = [], busy = false, reference = null;
  function read() { try { const saved=JSON.parse(localStorage.getItem(key)||'[]'); return Array.isArray(saved)?saved.filter(x=>x&&typeof x.id==='string'&&Number.isInteger(x.quantity)&&x.quantity>0&&x.quantity<=99):[]; } catch { return []; } }
  cart=read();
  const header=document.querySelector('.header');
  const trigger=document.createElement('button');
  trigger.className='cart-trigger';trigger.type='button';trigger.innerHTML='<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 3h2l2.5 12h11l2-9H6M9 20h.01M18 20h.01" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Cart</span><b data-cart-count>0</b>';
  header?.insertBefore(trigger,header.querySelector('.menu-toggle'));
  document.body.insertAdjacentHTML('beforeend', `<div class="cart-toast" role="status" aria-live="polite"></div>
  <dialog id="cart-dialog" class="cart-dialog" aria-labelledby="cart-title"><button class="close" type="button" aria-label="Close cart">✕</button>
    <p class="eyebrow">THE ADLY COLLECTION</p><h2 id="cart-title">Your next moves.</h2><p class="cart-intro">Your collection, ready when you are.</p>
    <div id="cart-lines"></div><div id="cart-bottom"></div>
  </dialog>
  <dialog id="checkout-dialog" class="checkout-dialog" aria-labelledby="checkout-title"><button class="close" type="button" aria-label="Close checkout">✕</button>
    <p class="eyebrow">YOUR COLLECTION / CHECKOUT</p><h2 id="checkout-title">Make it yours.</h2><p class="cart-intro">Online order submission is not enabled yet. Your cart remains saved on this device.</p>
    <div class="checkout-layout"><form id="order-form"><div class="checkout-fields">
      <label>Full name<input name="Name" required autocomplete="name" maxlength="120"></label>
      <label>Email<input name="email" type="email" required autocomplete="email" maxlength="200"></label>
      <label>Phone number<input name="Phone" type="tel" required autocomplete="tel" maxlength="40"></label>
      <label>Delivery preference<select name="Delivery" required><option value="delivery">Request delivery</option><option value="pickup">Request academy pickup</option></select></label>
      <label data-address>City<input name="City" autocomplete="address-level2" required maxlength="120"></label>
      <label data-address>Country<input name="Country" autocomplete="country-name" required maxlength="120" value="Egypt"></label>
      <label data-address class="wide">Delivery address<textarea name="Address" autocomplete="street-address" required maxlength="500" rows="2"></textarea></label>
      <label class="wide">Item options & notes (optional)<textarea name="Notes" maxlength="1500" rows="3" placeholder="Sizes, colours, or anything we should know. Options are subject to availability."></textarea></label>
      <div class="order-policy wide"><strong>What happens next?</strong><p>The academy will confirm stock, item options, final prices, delivery charges and payment arrangements with you. Submitting this request does not confirm an order or take payment.</p></div>
      <label class="order-consent wide"><input type="checkbox" required name="Acknowledgement" value="Accepted"><span>I understand this is an order request and the final total must be confirmed by the academy.</span></label>
      <div class="order-honey" aria-hidden="true"><input name="_honey" tabindex="-1" autocomplete="off" aria-label="Leave empty"></div>
      <button class="button wide" type="submit" disabled>Online ordering unavailable</button>
      <p class="checkout-privacy wide">No form data is sent from this checkout. Please contact the academy to arrange your order.</p>
      <div class="order-status wide" role="status" aria-live="polite" hidden></div>
    </div></form><aside class="checkout-summary" aria-label="Order summary"></aside></div>
  </dialog>`);
  const drawer=document.querySelector('#cart-dialog'), checkout=document.querySelector('#checkout-dialog'), form=document.querySelector('#order-form'), status=form.querySelector('.order-status');
  function announce(message){const toast=document.querySelector('.cart-toast');toast.textContent=message;toast.classList.add('visible');clearTimeout(announce.timer);announce.timer=setTimeout(()=>toast.classList.remove('visible'),3500);}
  function lines(){return cart.map(x=>({...x,product:catalog.find(p=>id(p)===x.id)})).filter(x=>x.product);}
  function total(){return lines().reduce((sum,x)=>sum+x.product.price*x.quantity,0);}
  function persist(){try{localStorage.setItem(key,JSON.stringify(cart));}catch{announce('Your cart is available for this visit, but this browser could not save it.');}reference=null;render();}
  function render(){const items=lines(),count=items.reduce((sum,x)=>sum+x.quantity,0);document.querySelector('[data-cart-count]').textContent=count;trigger.setAttribute('aria-label',`Open cart, ${count} items`);
    document.querySelector('#cart-lines').innerHTML=items.length?items.map(x=>`<article class="cart-line"><img src="/${esc(x.product.image.replace(/^\/+/,''))}" alt="${esc(x.product.name)}"><div><h3>${esc(x.product.name)}</h3><p>${money(x.product.price)} each</p><div class="quantity"><button type="button" data-change="-1" data-id="${esc(x.id)}" aria-label="Decrease quantity of ${esc(x.product.name)}" ${x.quantity===1?'disabled':''}>−</button><span aria-label="Quantity">${x.quantity}</span><button type="button" data-change="1" data-id="${esc(x.id)}" aria-label="Increase quantity of ${esc(x.product.name)}" ${x.quantity===99?'disabled':''}>+</button></div><button type="button" class="remove-item" data-remove="${esc(x.id)}">Remove<span class="sr-only"> ${esc(x.product.name)}</span></button></div><strong>${money(x.product.price*x.quantity)}</strong></article>`).join(''):'<div class="cart-empty"><span aria-hidden="true">♞</span><h3>Your next move starts here.</h3><p>Add a board, a clock or a little inspiration.</p><a class="button" href="/shop/#collection">Explore the collection ↗</a></div>';
    document.querySelector('#cart-bottom').innerHTML=items.length?`<div class="cart-total"><span>Estimated subtotal</span><strong>${money(total())}</strong></div><p class="cart-fine">Delivery, availability and final prices will be confirmed by the academy. No payment is taken at checkout.</p><button class="button cart-checkout" type="button">Continue to checkout <span>↗</span></button><button class="keep-shopping" type="button">Continue shopping</button>`:'';
    checkout.querySelector('.checkout-summary').innerHTML='<p class="eyebrow">YOUR ORDER</p>'+items.map(x=>`<div class="summary-item"><span>${esc(x.product.name)} <small>× ${x.quantity}</small></span><strong>${money(x.product.price*x.quantity)}</strong></div>`).join('')+`<div class="cart-total"><span>Estimated subtotal</span><strong>${money(total())}</strong></div><p class="cart-fine">Delivery: to be confirmed<br>Payment: arranged after confirmation</p>`;
  }
  const ready=fetch('/products.json').then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{catalog=data.filter(p=>typeof p.url==='string'&&Number.isFinite(p.price)&&p.price>=0);cart=cart.filter(x=>catalog.some(p=>id(p)===x.id));render();}).catch(()=>{document.querySelector('#cart-lines').innerHTML='<p>We couldn’t load your cart. <a href="">Reload this page</a> to try again. Your saved items have been kept.</p>';});
  window.AdlyCart={async add(product){await ready;if(busy)return;const canonical=catalog.find(p=>id(p)===id(product));if(!canonical){announce('The collection is unavailable. Please reload and try again.');return;}const item=cart.find(x=>x.id===id(canonical));if(item&&item.quantity>=99){announce('Maximum quantity is 99 per item.');return;}if(item)item.quantity++;else cart.push({id:id(canonical),quantity:1});persist();announce(`${canonical.name} added to cart.`);},open(){drawer.showModal();}};
  trigger.addEventListener('click',()=>window.AdlyCart.open());
  for(const modal of [drawer,checkout]){modal.querySelector('.close').addEventListener('click',()=>{if(!busy)modal.close();});modal.addEventListener('cancel',e=>{if(busy)e.preventDefault();});modal.addEventListener('click',e=>{if(e.target===modal&&!busy){const b=modal.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)modal.close();}});}
  drawer.addEventListener('click',e=>{const change=e.target.closest('[data-change]'),remove=e.target.closest('[data-remove]');if(change){const item=cart.find(x=>x.id===change.dataset.id);if(item){item.quantity=Math.max(1,Math.min(99,item.quantity+Number(change.dataset.change)));persist();}}if(remove){cart=cart.filter(x=>x.id!==remove.dataset.remove);persist();}if(e.target.closest('.keep-shopping'))drawer.close();if(e.target.closest('.cart-checkout')&&lines().length){drawer.close();status.hidden=true;form.querySelectorAll('.checkout-fields > :not(.order-status)').forEach(el=>el.hidden=false);form.elements.Delivery.dispatchEvent(new Event('change'));checkout.showModal();}});
  form.elements.Delivery.addEventListener('change',()=>{const delivery=form.elements.Delivery.value==='delivery';for(const label of form.querySelectorAll('[data-address]')){label.hidden=!delivery;const input=label.querySelector('input,textarea');input.required=delivery;input.disabled=!delivery;}});
  window.addEventListener('storage',e=>{if(e.key===key&&!busy){cart=read();reference=null;render();}});
  form.addEventListener('submit', e => { e.preventDefault(); status.hidden=false; status.textContent='Online order submission is not enabled on this website. Please contact the academy to arrange your order.'; });
})();
