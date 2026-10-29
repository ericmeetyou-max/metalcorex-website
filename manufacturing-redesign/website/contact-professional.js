(() => {
  const form = document.querySelector('#rfqForm');
  if (!form) return;
  const files = form.querySelector('[name="drawings"]');
  const error = form.querySelector('#fileError');
  const clear = form.querySelector('.clear-files');
  const extensions = new Set(['pdf','step','stp','stl','igs','iges','dwg','dxf','zip','rar','7z','png','jpg','jpeg']);
  const validate = () => {
    const selected = [...files.files];
    let message = '';
    if (selected.length > 8) message = 'Choose up to 8 files. Combine related drawings into an archive if needed.';
    else if (selected.some(file => !extensions.has(file.name.split('.').pop().toLowerCase()))) message = 'One or more files have an unsupported format. Use a listed CAD, drawing, image or archive format.';
    else if (selected.some(file => file.size > 25 * 1024 * 1024)) message = 'Each file must be 25 MB or smaller.';
    else if (selected.reduce((sum, file) => sum + file.size, 0) > 50 * 1024 * 1024) message = 'The combined file size must be 50 MB or smaller.';
    files.setCustomValidity(message);
    files.setAttribute('aria-invalid', String(Boolean(message)));
    error.textContent = message;
    error.hidden = !message;
    clear.hidden = !selected.length;
    return !message;
  };
  files.addEventListener('change', validate);
  clear.addEventListener('click', () => { files.value = ''; files.dispatchEvent(new Event('change', {bubbles:true})); files.focus(); });
  form.addEventListener('reset', () => { files.setCustomValidity(''); files.removeAttribute('aria-invalid'); error.hidden = true; clear.hidden = true; });
  // Preserve the existing API contract: additional project fields travel in message.
  form.addEventListener('formdata', event => {
    const data = event.formData;
    const fields = [['quote_quantity','Quantity to quote'],['requested_finish','Surface finish'],['delivery_destination','Delivery destination'],['delivery_timing','Target delivery timing']];
    const notes = fields.map(([key,label]) => data.get(key)?.trim() ? `${label}: ${data.get(key).trim()}` : '').filter(Boolean);
    if (notes.length) data.set('message', `${data.get('message') || ''}\n\nProject specifications\n${notes.join('\n')}`);
  });
})();
