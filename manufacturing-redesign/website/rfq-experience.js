// Upload feedback and receipt handling for the current contact form.
(() => {
 const form = document.querySelector('.contact-rfq-form');
 if (!form || !window.XMLHttpRequest || !window.FormData) return;
 const input = form.querySelector('[name="drawings"]');
 const list = form.querySelector('#rfqAttachments');
 const status = form.querySelector('#rfqStatus');
 const progressBox = form.querySelector('#rfqUploadProgress');
 const progress = progressBox.querySelector('progress');
 const progressText = progressBox.querySelector('span');
 const submit = form.querySelector('[type="submit"]');
 let busy = false;
 const size = bytes => bytes < 1048576 ? `${Math.max(1,Math.round(bytes/1024))} KB` : `${(bytes/1048576).toFixed(1)} MB`;
 function renderFiles() {
  list.replaceChildren();
  [...input.files].forEach((file,index) => {
   const li = document.createElement('li');
   const name = document.createElement('span');
   name.textContent = `${file.name} · ${size(file.size)}`;
   li.append(name);
   if (typeof DataTransfer === 'function') {
    const remove = document.createElement('button');
    remove.type = 'button'; remove.textContent = 'Remove';
    remove.setAttribute('aria-label', `Remove ${file.name}`);
    remove.addEventListener('click', () => {
     if (busy) return;
     const transfer = new DataTransfer();
     [...input.files].filter((_,i) => i !== index).forEach(f => transfer.items.add(f));
     input.files = transfer.files; input.dispatchEvent(new Event('change',{bubbles:true}));
     const buttons = list.querySelectorAll('button');
     (buttons[Math.min(index,buttons.length-1)] || input).focus();
    });
    li.append(remove);
   }
   list.append(li);
  });
 }
 input.addEventListener('change', renderFiles);
 form.addEventListener('reset', () => setTimeout(renderFiles,0));
 function setStatus(message, state) {
  status.textContent = message;
  status.className = `form-note is-${state}`;
 }
 function send(data) {
  return new Promise((resolve,reject) => {
   const xhr = new XMLHttpRequest();
   xhr.open('POST', '/api/rfq'); xhr.timeout = 120000;
   xhr.upload.onprogress = event => {
    if (event.lengthComputable) {
     const percentage = Math.min(100,Math.round(event.loaded/event.total*100));
     progress.value = percentage;
     progressText.textContent = percentage < 100 ? `Uploading request · ${percentage}%` : 'Upload complete · waiting for server confirmation…';
    }
   };
   xhr.onload = () => {
    let result;try { result = JSON.parse(xhr.responseText); } catch { result = {}; }
    if (xhr.status >= 200 && xhr.status < 300 && result.ok && typeof result.id === 'string' && result.id) resolve(result);
    else reject({uncertain: xhr.status >= 500 || (xhr.status >= 200 && xhr.status < 300),message:result.error});
   };
   xhr.onerror = () => reject({uncertain:true});
   xhr.ontimeout = () => reject({uncertain:true,timeout:true});
   xhr.onabort = () => reject({uncertain:true});
   xhr.send(data);
  });
 }
 form.addEventListener('submit', async event => {
  event.preventDefault();
  if (busy || !form.reportValidity()) return;
  busy = true;
  const data = new FormData(form);
  const controls = [...form.querySelectorAll('input,select,textarea,button')].map(el => [el,el.disabled]);
  controls.forEach(([el]) => el.disabled = true);
  submit.setAttribute('aria-busy','true'); submit.textContent = 'Sending your request…';
  progressBox.hidden = false; progress.removeAttribute('value');
  progressText.textContent = 'Preparing your request…';
  setStatus('Please keep this page open while your request is submitted.','pending');
  try {
   const result = await send(data);
   form.reset();
   const started = form.querySelector('[name="form_started_at"]');
   const nonce = form.querySelector('[name="form_nonce"]');
   if (started) started.value = String(Date.now());
   if (nonce) nonce.value = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}-rfq`;
   const summary = form.querySelector('[data-rfq-file-summary]');
   if(summary){summary.textContent='No files selected';summary.classList.remove('is-warning')}
   try { localStorage.removeItem('metalcorex-local-rfqs'); } catch {}
   const emailNote = result.customerEmail?.ok ? ' A confirmation email has been sent. If it does not arrive, check your spam folder.' : ' Keep this reference for any follow-up with sales@metalcorex.com.';
   setStatus(`Request received. Your enquiry reference: ${result.id}.${emailNote} We will review your requirements and contact you.`, 'success');
   submit.textContent = 'Send another quote request ↗';
  } catch (error) {
   const message = error.uncertain
    ? 'We could not confirm whether your request was received. Your details and selected files remain on this page. Check for a confirmation email or contact sales@metalcorex.com before resubmitting.'
    : `${typeof error.message === 'string' ? error.message.slice(0,300) : 'The request could not be accepted.'} Your details and files remain selected. Review the information and try again, or email sales@metalcorex.com.`;
   setStatus(message,'error');
   submit.textContent = error.uncertain ? 'Resubmit quote request ↗' : 'Try sending again ↗';
  } finally {
   controls.forEach(([el,disabled]) => el.disabled = disabled);
   busy = false; submit.removeAttribute('aria-busy'); progressBox.hidden = true;
   status.focus();
  }
 });
 form.dataset.enhancedRfq = 'true';
})();
