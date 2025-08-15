
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

// Nav active state
(function() {
  const here = location.pathname.split('/').pop() || 'index.html';
  $$('.nav a').forEach(a => {
    const target = a.getAttribute('href');
    if ((here === '' && target === 'index.html') || here === target) {
      a.classList.add('active');
    }
  });
})();

// LocalStorage helpers
function loadLS(key){ try { return JSON.parse(localStorage.getItem(key)) || []; } catch(e){ return []; } }
function saveLS(key, value){ localStorage.setItem(key, JSON.stringify(value)); }

// Generic replies UI
function setupReplies({key, formSel, listSel}){
  const form = $(formSel);
  const list = $(listSel);
  const items = loadLS(key);

  function render(){
    list.innerHTML = '';
    items.slice().sort((a,b)=>b.time-a.time).forEach(({name,process,text,time})=>{
      const li = document.createElement('li');
      li.className = 'item';
      li.innerHTML = `
        <div class="meta">
          <span class="badge">${process || 'Design'}</span>
          ${name ? `<span>• ${escapeHtml(name)}</span>`:''}
          <span>• ${new Date(time).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</span>
        </div>
        <div class="text">${escapeHtml(text).replace(/\n/g,'<br>')}</div>
      `;
      list.appendChild(li);
    });
  }

  function escapeHtml(str){ return str.replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',\"'\":'&#39;'}[c])); }

  form.addEventListener('submit', e=>{
    e.preventDefault();
    const name = form.querySelector('[name=name]').value.trim().slice(0,80);
    const process = form.querySelector('[name=process]').value.trim();
    const text = form.querySelector('[name=text]').value.trim();
    if(!text){ form.querySelector('[name=text]').focus(); return; }
    items.push({name, process, text, time: Date.now()});
    saveLS(key, items);
    form.reset();
    render();
  });

  // Export & clear
  form.querySelector('[data-export]').addEventListener('click', ()=>{
    const blob = new Blob([JSON.stringify(items,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download = key + '.json'; a.click();
    setTimeout(()=>URL.revokeObjectURL(url), 500);
  });
  form.querySelector('[data-clear]').addEventListener('click', ()=>{
    if(confirm('Remove all saved replies for this page on THIS device?')){
      items.length = 0; saveLS(key, items); render();
    }
  });

  render();
}

// Index page helpers for showing PDF/image posters without upload
function setupPoster(){
  const input = document.getElementById('posterInput');
  const grid = document.getElementById('posterGrid');
  if(!input || !grid) return;
  input.addEventListener('change', ()=>{
    grid.innerHTML='';
    const files = Array.from(input.files || []);
    files.forEach(file=>{
      const url = URL.createObjectURL(file);
      let el;
      if(file.type === 'application/pdf'){
        el = document.createElement('iframe');
        el.setAttribute('title','PDF preview');
        el.style.height='360px';
      } else {
        el = document.createElement('img');
      }
      el.src = url;
      grid.appendChild(el);
    });
  });
}
