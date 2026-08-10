const grid=document.getElementById('wallpaper-grid');
const dialog=document.getElementById('preview-dialog');
const preview=document.getElementById('preview-image');

function esc(s=''){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')}

fetch('data/wallpapers.json')
  .then(r=>r.json())
  .then(data=>{
    const items=(data.wallpapers||[]).slice().reverse();
    grid.innerHTML=items.map(w=>{
      const credit=w.credit_name
        ? `<p class="credit">Credit: ${w.credit_url ? `<a href="${w.credit_url}" target="_blank" rel="noopener noreferrer">${esc(w.credit_name)} ↗</a>` : esc(w.credit_name)}</p>`
        : '';
      return `<article class="wallpaper-card">
        <button class="image-button" data-full="${w.image}">
          <img class="wallpaper-image" src="${w.image}" alt="${esc(w.title)}" loading="lazy">
        </button>
        <div class="card-body">
          <div><h3>${esc(w.title)}</h3><p class="category">${esc(w.category||'')}</p>${credit}</div>
          <a class="download-button" href="${w.image}" download>Download HD</a>
        </div>
      </article>`;
    }).join('');

    document.querySelectorAll('.image-button').forEach(b=>b.addEventListener('click',()=>{
      preview.src=b.dataset.full; dialog.showModal();
    }));
  });

document.getElementById('close-preview').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
