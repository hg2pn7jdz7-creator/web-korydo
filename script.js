const WHATSAPP_NUMBER = '34630954418';

function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'fixed bottom-5 right-5 z-[100] flex flex-col gap-3 max-w-sm w-full px-4 pointer-events-none';
    document.body.appendChild(container);
  }

  const colors = {
    success: 'bg-slate-900 text-white border-emerald-500',
    error: 'bg-red-950 text-white border-red-500',
    info: 'bg-indigo-950 text-white border-indigo-400'
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };

  const toast = document.createElement('div');
  toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-2xl border-l-4 ${colors[type] || colors.success} animate-fadeIn transition-all duration-300`;
  toast.innerHTML = `
    <span class="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm shrink-0">${icons[type] || '✓'}</span>
    <p class="text-sm font-medium leading-snug flex-1">${message}</p>
    <button onclick="this.parentElement.remove()" class="text-white/60 hover:text-white text-lg leading-none">&times;</button>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => toast.remove(), 300);
  }, 4200);
}

function openLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.remove('hidden');
}

function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.add('hidden');
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) menu.classList.toggle('hidden');
}

function fillAdminLogin() {
  const nameEl = document.getElementById('authName');
  const busEl = document.getElementById('authBusiness');
  const phoneEl = document.getElementById('authPhone');
  const emailEl = document.getElementById('authEmail');
  if (nameEl) nameEl.value = 'Manuel Moderador';
  if (busEl) busEl.value = 'Korydo Admin';
  if (phoneEl) phoneEl.value = '630954418';
  if (emailEl) emailEl.value = 'manuelgrm@icloud.com';
  showToast('Datos de moderador prellenados. Pulsa Continuar.', 'info');
}

function validateLeadData({ name, business, phone, email }) {
  if (!name || name.trim().length < 2) {
    showToast('Introduce un nombre válido (mínimo 2 caracteres).', 'error');
    return false;
  }
  if (!business || business.trim().length < 2) {
    showToast('Indica el nombre de tu negocio o proyecto.', 'error');
    return false;
  }
  const cleanPhone = phone.replace(/\s+/g, '');
  if (!/^\+?[0-9]{9,15}$/.test(cleanPhone)) {
    showToast('Introduce un número de teléfono válido (9 a 15 dígitos).', 'error');
    return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    showToast('Introduce un correo electrónico válido.', 'error');
    return false;
  }
  return true;
}

async function handleAuth(e) {
  e.preventDefault();
  const name = document.getElementById('authName')?.value || '';
  const business = document.getElementById('authBusiness')?.value || '';
  const phone = document.getElementById('authPhone')?.value || '';
  const email = document.getElementById('authEmail')?.value || '';
  const receiptInput = document.getElementById('authReceipt');

  if (!validateLeadData({ name, business, phone, email })) return;

  const formData = new FormData();
  formData.append('name', name);
  formData.append('business', business);
  formData.append('phone', phone);
  formData.append('email', email);
  if (receiptInput && receiptInput.files[0]) {
    formData.append('receipt', receiptInput.files[0]);
  }

  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Error al registrar los datos');

    closeLoginModal();
    e.target.reset();

    if (data.isAdmin && data.token) {
      sessionStorage.setItem('korydo_admin_token', data.token);
      showToast('Acceso de moderador verificado. Redirigiendo...', 'success');
      setTimeout(() => {
        window.location.href = 'moderador.html';
      }, 700);
    } else {
      showToast(data.message || `¡Bienvenido ${name}! Registro completado.`, 'success');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleContactSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('contactName')?.value || '';
  const business = document.getElementById('contactBusiness')?.value || '';
  const phone = document.getElementById('contactPhone')?.value || '';
  const email = document.getElementById('contactEmail')?.value || '';
  const message = document.getElementById('contactMessage')?.value || '';
  const receiptInput = document.getElementById('contactReceipt');

  if (!validateLeadData({ name, business, phone, email })) return;

  const formData = new FormData();
  formData.append('name', name);
  formData.append('business', business);
  formData.append('phone', phone);
  formData.append('email', email);
  formData.append('message', message);
  if (receiptInput && receiptInput.files[0]) {
    formData.append('receipt', receiptInput.files[0]);
  }

  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudo enviar el formulario');

    showToast('Mensaje y documentación enviados correctamente. Te contactaremos muy pronto.', 'success');
    e.target.reset();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function buyNfcProductWhatsApp(productName, price) {
  const formattedPrice = Number(price).toFixed(2);
  const text = `Hola Korydo, estoy interesado en adquirir el producto NFC "${productName}" (${formattedPrice}€). ¿Me podéis indicar los pasos para personalizarlo y realizar el pedido?`;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

async function loadPublicProducts() {
  const grid = document.getElementById('nfcProductsGrid');
  if (!grid) return;

  try {
    const res = await fetch('/api/products');
    const products = await res.json();

    if (!products.length) {
      grid.innerHTML = `<p class="text-slate-500 col-span-full text-center py-8">No hay productos NFC disponibles en este momento.</p>`;
      return;
    }

    grid.innerHTML = products.map(p => {
      const safeName = p.name.replace(/'/g, "\\'");
      return `
        <article class="bg-white rounded-3xl border border-slate-200/80 overflow-hidden card-hover flex flex-col justify-between shadow-sm">
          <div>
            <div class="relative h-56 overflow-hidden bg-slate-100">
              <img src="${p.image_url}" alt="${p.name}" loading="lazy" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
              <span class="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                ${p.badge || 'NFC Pro'}
              </span>
            </div>
            <div class="p-6">
              <div class="flex items-baseline justify-between gap-2 mb-2">
                <h3 class="text-xl font-bold text-slate-900">${p.name}</h3>
                <span class="text-2xl font-extrabold text-indigo-600 shrink-0">${Number(p.price).toFixed(2)}€</span>
              </div>
              <p class="text-slate-600 text-sm leading-relaxed">${p.description}</p>
            </div>
          </div>
          <div class="px-6 pb-6 pt-2">
            <button
              onclick="buyNfcProductWhatsApp('${safeName}', ${Number(p.price)})"
              class="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer">
              <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824z"/></svg>
              Comprar / Personalizar por WhatsApp
            </button>
          </div>
        </article>
      `;
    }).join('');
  } catch (err) {
    showToast('Error al cargar el catálogo NFC', 'error');
  }
}

let allTestimonials = [];
let activeCategory = 'all';

async function loadPublicTestimonials() {
  const track = document.getElementById('testimonialsTrack');
  if (!track) return;

  try {
    const res = await fetch('/api/testimonials');
    allTestimonials = await res.json();
    renderTestimonialsCarousel();
  } catch (err) {
    showToast('No se pudieron cargar los testimonios', 'error');
  }
}

function filterTestimonials(category) {
  activeCategory = category;
  document.querySelectorAll('[data-filter-btn]').forEach(btn => {
    if (btn.dataset.filterBtn === category) {
      btn.className = 'px-4 py-2 rounded-full text-sm font-semibold bg-slate-900 text-white shadow-md transition-all cursor-pointer';
    } else {
      btn.className = 'px-4 py-2 rounded-full text-sm font-semibold bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer';
    }
  });
  renderTestimonialsCarousel();
}

function renderTestimonialsCarousel() {
  const track = document.getElementById('testimonialsTrack');
  if (!track) return;

  const filtered = activeCategory === 'all'
    ? allTestimonials
    : allTestimonials.filter(t => t.category === activeCategory);

  const badgeLabels = {
    web: { text: 'Diseño Web', color: 'bg-blue-100 text-blue-700' },
    ia: { text: 'IA & n8n', color: 'bg-purple-100 text-purple-700' },
    nfc: { text: 'Tecnología NFC', color: 'bg-emerald-100 text-emerald-700' }
  };

  if (!filtered.length) {
    track.innerHTML = `<div class="w-full text-center py-12 text-slate-500">No hay testimonios en esta categoría todavía.</div>`;
    return;
  }

  track.innerHTML = filtered.map(t => {
    const badge = badgeLabels[t.category] || { text: 'Cliente Korydo', color: 'bg-slate-100 text-slate-700' };
    const mediaHtml = t.media_type === 'video'
      ? `<video src="${t.media_url}" controls class="w-full h-52 object-cover bg-slate-900"></video>`
      : `<img src="${t.media_url}" alt="${t.business_name}" loading="lazy" class="w-full h-52 object-cover" />`;

    return `
      <div class="min-w-[310px] md:min-w-[370px] max-w-[370px] bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm card-hover shrink-0 flex flex-col justify-between">
        <div>
          <div class="relative overflow-hidden bg-slate-100">
            ${mediaHtml}
            <span class="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${badge.color} backdrop-blur-sm">
              ${badge.text}
            </span>
          </div>
          <div class="p-6">
            <div class="flex text-amber-400 text-sm mb-3">${'★'.repeat(t.rating || 5)}</div>
            <p class="text-slate-700 text-sm italic leading-relaxed mb-4">"${t.quote}"</p>
          </div>
        </div>
        <div class="px-6 pb-6 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <p class="font-bold text-slate-900 text-sm">${t.client_name}</p>
            <p class="text-xs text-slate-500">${t.business_name}</p>
          </div>
          <span class="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">Verificado</span>
        </div>
      </div>
    `;
  }).join('');
}

function scrollCarousel(direction) {
  const track = document.getElementById('testimonialsTrack');
  if (!track) return;
  const scrollAmount = 390;
  track.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
}

function getAdminHeaders() {
  const token = sessionStorage.getItem('korydo_admin_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

async function initAdminDashboard() {
  if (!document.getElementById('adminDashboard')) return;

  const token = sessionStorage.getItem('korydo_admin_token');
  if (!token) {
    showToast('Sesión no iniciada. Redirigiendo a inicio...', 'error');
    setTimeout(() => { window.location.href = 'index.html'; }, 1000);
    return;
  }

  await Promise.all([
    loadAdminLeads(),
    loadAdminProducts(),
    loadAdminTestimonials()
  ]);
}

function logoutAdmin() {
  sessionStorage.removeItem('korydo_admin_token');
  window.location.href = 'index.html';
}

async function loadAdminLeads() {
  const tbody = document.getElementById('adminLeadsTable');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/leads', { headers: getAdminHeaders() });
    if (res.status === 401) return logoutAdmin();
    const leads = await res.json();

    if (!leads.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400">No hay leads registrados todavía.</td></tr>`;
      return;
    }

    tbody.innerHTML = leads.map(l => `
      <tr class="border-b border-slate-100 hover:bg-slate-50/80 text-sm">
        <td class="py-3.5 px-4 font-semibold text-slate-900">${l.name}</td>
        <td class="py-3.5 px-4 text-slate-600">${l.business}</td>
        <td class="py-3.5 px-4">
          <a href="https://wa.me/34${l.phone.replace(/\D/g, '')}" target="_blank" class="text-emerald-600 hover:underline font-medium">${l.phone}</a>
        </td>
        <td class="py-3.5 px-4 text-slate-600">${l.email}</td>
        <td class="py-3.5 px-4">
          ${l.receipt_filename
            ? `<button onclick="downloadReceipt('${l.receipt_filename}')" class="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold cursor-pointer">📎 Ver Resguardo</button>`
            : `<span class="text-xs text-slate-400">Sin adjunto</span>`
          }
        </td>
        <td class="py-3.5 px-4 text-right">
          <button onclick="deleteLead(${l.id})" class="text-red-500 hover:text-red-700 text-xs font-semibold cursor-pointer">Eliminar</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showToast('Error al cargar leads', 'error');
  }
}

async function downloadReceipt(filename) {
  try {
    const token = sessionStorage.getItem('korydo_admin_token');
    const res = await fetch(`/api/admin/receipts/${filename}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('No se pudo abrir el comprobante');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteLead(id) {
  try {
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    if (res.ok) {
      showToast('Registro eliminado', 'info');
      loadAdminLeads();
    }
  } catch (err) {
    showToast('Error al eliminar registro', 'error');
  }
}

let adminProductsCache = [];

async function loadAdminProducts() {
  const list = document.getElementById('adminProductsList');
  if (!list) return;

  const res = await fetch('/api/products');
  adminProductsCache = await res.json();

  list.innerHTML = adminProductsCache.map(p => `
    <div class="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <img src="${p.image_url}" alt="${p.name}" class="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0" />
        <div>
          <span class="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">${p.badge}</span>
          <h4 class="font-bold text-slate-900 mt-1">${p.name}</h4>
          <p class="text-xs text-slate-500 line-clamp-1">${p.description}</p>
          <p class="text-sm font-extrabold text-indigo-600 mt-1">${Number(p.price).toFixed(2)} €</p>
        </div>
      </div>
      <div class="flex items-center gap-2 self-end sm:self-center">
        <button onclick="editProduct(${p.id})" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer">Editar</button>
        <button onclick="deleteProduct(${p.id})" class="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold cursor-pointer">Borrar</button>
      </div>
    </div>
  `).join('');
}

function editProduct(id) {
  const p = adminProductsCache.find(item => item.id === id);
  if (!p) return;
  document.getElementById('prodId').value = p.id;
  document.getElementById('prodName').value = p.name;
  document.getElementById('prodPrice').value = p.price;
  document.getElementById('prodBadge').value = p.badge;
  document.getElementById('prodImage').value = p.image_url;
  document.getElementById('prodDesc').value = p.description;
  document.getElementById('prodSubmitBtn').textContent = 'Actualizar Producto NFC';
}

function resetProductForm() {
  document.getElementById('productForm')?.reset();
  document.getElementById('prodId').value = '';
  document.getElementById('prodSubmitBtn').textContent = 'Guardar Producto NFC';
}

async function handleProductSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('prodId').value;
  const payload = {
    name: document.getElementById('prodName').value,
    price: parseFloat(document.getElementById('prodPrice').value),
    badge: document.getElementById('prodBadge').value,
    image_url: document.getElementById('prodImage').value,
    description: document.getElementById('prodDesc').value
  };

  const url = id ? `/api/admin/products/${id}` : '/api/admin/products';
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: getAdminHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Error al guardar el producto');
    showToast(id ? 'Producto actualizado' : 'Producto añadido', 'success');
    resetProductForm();
    loadAdminProducts();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteProduct(id) {
  const res = await fetch(`/api/admin/products/${id}`, {
    method: 'DELETE',
    headers: getAdminHeaders()
  });
  if (res.ok) {
    showToast('Producto eliminado', 'info');
    loadAdminProducts();
  }
}

let adminTestimonialsCache = [];

async function loadAdminTestimonials() {
  const list = document.getElementById('adminTestimonialsList');
  if (!list) return;

  const res = await fetch('/api/testimonials');
  adminTestimonialsCache = await res.json();
  const catNames = { web: 'Diseño Web', ia: 'IA / n8n', nfc: 'Tecnología NFC' };

  list.innerHTML = adminTestimonialsCache.map(t => `
    <div class="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center text-xs font-bold text-slate-500">
          ${t.media_type === 'video' ? '🎬 VÍDEO' : `<img src="${t.media_url}" class="w-full h-full object-cover" />`}
        </div>
        <div>
          <span class="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">${catNames[t.category] || t.category}</span>
          <h4 class="font-bold text-slate-900 mt-1">${t.client_name} <span class="text-slate-400 font-normal">· ${t.business_name}</span></h4>
          <p class="text-xs text-slate-600 italic line-clamp-1">"${t.quote}"</p>
        </div>
      </div>
      <div class="flex items-center gap-2 self-end sm:self-center">
        <button onclick="editTestimonial(${t.id})" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer">Editar</button>
        <button onclick="deleteTestimonial(${t.id})" class="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold cursor-pointer">Borrar</button>
      </div>
    </div>
  `).join('');
}

function editTestimonial(id) {
  const t = adminTestimonialsCache.find(item => item.id === id);
  if (!t) return;
  document.getElementById('testId').value = t.id;
  document.getElementById('testClient').value = t.client_name;
  document.getElementById('testBusiness').value = t.business_name;
  document.getElementById('testCategory').value = t.category;
  document.getElementById('testMediaType').value = t.media_type;
  document.getElementById('testMediaUrl').value = t.media_url;
  document.getElementById('testQuote').value = t.quote;
  document.getElementById('testSubmitBtn').textContent = 'Actualizar Testimonio';
}

function resetTestimonialForm() {
  document.getElementById('testimonialForm')?.reset();
  document.getElementById('testId').value = '';
  document.getElementById('testSubmitBtn').textContent = 'Publicar Testimonio';
}

async function handleTestimonialSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('testId').value;
  const payload = {
    client_name: document.getElementById('testClient').value,
    business_name: document.getElementById('testBusiness').value,
    category: document.getElementById('testCategory').value,
    media_type: document.getElementById('testMediaType').value,
    media_url: document.getElementById('testMediaUrl').value,
    quote: document.getElementById('testQuote').value,
    rating: 5
  };

  const url = id ? `/api/admin/testimonials/${id}` : '/api/admin/testimonials';
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: getAdminHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Error al guardar el testimonio');
    showToast(id ? 'Testimonio actualizado' : 'Testimonio publicado', 'success');
    resetTestimonialForm();
    loadAdminTestimonials();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteTestimonial(id) {
  const res = await fetch(`/api/admin/testimonials/${id}`, {
    method: 'DELETE',
    headers: getAdminHeaders()
  });
  if (res.ok) {
    showToast('Testimonio eliminado', 'info');
    loadAdminTestimonials();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadPublicProducts();
  loadPublicTestimonials();
  initAdminDashboard();
});
