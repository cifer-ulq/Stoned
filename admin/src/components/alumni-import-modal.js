/* ── Alumni Batch Import Modal ── */
import { apiPostForm } from '../api/client.js';
import { icon, renderIcons } from './icons.js';

/* ─────────────────────────────────────────────────────────────────────────────
   CSV Template download
───────────────────────────────────────────────────────────────────────────── */
function downloadTemplate() {
  const csv = [
    'batch,section,name,studentid,email,course',
    '2023-2024,IT-4A,Juan Dela Cruz,20200001,jdelacruz@gmail.com,Bachelor of Science in Information Technology',
    '2023-2024,IT-4B,Maria Santos,20200002,msantos@gmail.com,Bachelor of Science in Information Systems',
    '2022-2023,CS-4A,Carlo Reyes,20190003,creyes@gmail.com,Bachelor of Science in Computer Science',
  ].join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'alumni_import_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

/* ─────────────────────────────────────────────────────────────────────────────
   Parse CSV in-browser
───────────────────────────────────────────────────────────────────────────── */
function parseCSV(text) {
  text = text.replace(/^\uFEFF/, '');
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '');
  if (lines.length < 1) return { headers: [], rows: [] };

  function splitCSVLine(line) {
    const result = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
        else { inQuote = !inQuote; }
      } else if (ch === ',' && !inQuote) {
        result.push(cur.trim()); cur = '';
      } else {
        cur += ch;
      }
    }
    result.push(cur.trim());
    return result;
  }

  const headers = splitCSVLine(lines[0]).map(h => h.toLowerCase());
  const rows = lines.slice(1).map((l, i) => {
    const vals = splitCSVLine(l);
    const obj  = { _row: i + 2 };
    headers.forEach((h, j) => { obj[h] = vals[j] ?? ''; });
    if (!obj.student_id && obj.studentid) obj.student_id = obj.studentid;
    if (!obj.batch && obj.year_graduated) obj.batch = obj.year_graduated;
    return obj;
  });

  return { headers, rows };
}

/* ─────────────────────────────────────────────────────────────────────────────
   Validate parsed rows in-browser for instant feedback
───────────────────────────────────────────────────────────────────────────── */
const REQUIRED_COLS = ['name', 'email', 'course', 'batch'];

function validateRows(rows) {
  const seenEmails = new Set();
  const seenIds    = new Set();
  return rows.map(row => {
    const issues = [];
    const sid = row.student_id || row.studentid;

    if (!row.name)       issues.push('Missing name');
    if (!row.email)      issues.push('Missing email');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) issues.push('Invalid email');
    if (!sid)            issues.push('Missing studentid');
    if (!row.course)     issues.push('Missing course');
    if (!row.batch)      issues.push('Missing batch');

    if (row.email && seenEmails.has(row.email.toLowerCase())) issues.push('Duplicate email');
    else if (row.email) seenEmails.add(row.email.toLowerCase());

    if (sid && seenIds.has(sid)) issues.push('Duplicate studentid');
    else if (sid) seenIds.add(sid);

    return { ...row, _student_id: sid, _issues: issues, _valid: issues.length === 0 };
  });
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main export — mounts the modal into DOM
───────────────────────────────────────────────────────────────────────────── */
export function openAlumniImportModal(onSuccess) {
  /* Remove any existing instance */
  document.querySelector('.sim-backdrop')?.remove();

  const backdrop = document.createElement('div');
  backdrop.className = 'sim-backdrop modal-backdrop';

  backdrop.innerHTML = `
    <div class="modal sim-modal">
      <!-- Header -->
      <div class="sim-modal__header">
        <div class="sim-modal__header-left">
          <div class="sim-modal__icon-badge" style="background:rgba(99,102,241,0.12);color:#4F46E5;">
            ${icon('award', 18)}
          </div>
          <div>
            <h3 class="sim-modal__title">Batch Register Alumni</h3>
            <p class="sim-modal__subtitle">Bulk-register alumni and graduates into the tracking system</p>
          </div>
        </div>
        <button class="sim-modal__close" id="aim-close" aria-label="Close modal">
          ${icon('x', 16)}
        </button>
      </div>

      <!-- Step Indicator -->
      <div class="sim-steps">
        <div class="sim-step sim-step--active" data-step="1">
          <div class="sim-step__dot">1</div>
          <span class="sim-step__label">Upload CSV</span>
        </div>
        <div class="sim-step__line"></div>
        <div class="sim-step" data-step="2">
          <div class="sim-step__dot">2</div>
          <span class="sim-step__label">Preview & Verify</span>
        </div>
        <div class="sim-step__line"></div>
        <div class="sim-step" data-step="3">
          <div class="sim-step__dot">3</div>
          <span class="sim-step__label">Results</span>
        </div>
      </div>

      <!-- Step Content -->
      <div class="sim-body" id="aim-body">
        <!-- Step 1 is rendered dynamically -->
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);
  renderIcons();

  const body     = backdrop.querySelector('#aim-body');
  let parsedData = null;

  function setStep(n) {
    backdrop.querySelectorAll('.sim-step').forEach(el => {
      const s = parseInt(el.dataset.step);
      el.classList.toggle('sim-step--active',   s === n);
      el.classList.toggle('sim-step--done',      s < n);
      el.classList.toggle('sim-step--inactive',  s > n);
    });
  }

  /* ── Step 1: Upload ─────────────────────────────────────────────────────── */
  function renderStep1() {
    setStep(1);
    body.innerHTML = `
      <div class="sim-upload-zone" id="aim-dropzone">
        <div class="sim-upload-zone__icon">${icon('upload', 32)}</div>
        <div class="sim-upload-zone__title">Drop your Alumni CSV file here</div>
        <div class="sim-upload-zone__sub">or click to browse — max 4 MB</div>
        <input type="file" id="aim-file-input" accept=".csv,text/csv" style="display:none">
        <button class="btn btn--primary sim-upload-zone__btn" id="aim-browse-btn">
          ${icon('folder-open', 14)} Browse File
        </button>
      </div>

      <div class="sim-format-card">
        <div class="sim-format-card__head">
          ${icon('info', 13)}
          <span>Required CSV Columns</span>
          <button class="btn btn--ghost btn--sm sim-download-tpl" id="aim-download-tpl">
            ${icon('download', 12)} Download Template
          </button>
        </div>
        <div class="sim-format-columns">
          ${['batch ✦', 'section', 'name ✦', 'studentid ✦', 'email ✦', 'course ✦'].map(c => {
            const req = c.includes('✦');
            return `<span class="sim-col-pill ${req ? 'sim-col-pill--req' : ''}">${c.replace(' ✦','')}</span>`;
          }).join('')}
        </div>
        <p class="sim-format-note">✦ Required &nbsp;·&nbsp; Case-insensitive headers &nbsp;·&nbsp; "studentid" or "student_id" accepted</p>
      </div>
    `;
    renderIcons();

    const dropzone  = body.querySelector('#aim-dropzone');
    const fileInput = body.querySelector('#aim-file-input');

    body.querySelector('#aim-browse-btn').addEventListener('click', () => fileInput.click());
    body.querySelector('#aim-download-tpl').addEventListener('click', downloadTemplate);

    fileInput.addEventListener('change', () => {
      if (fileInput.files[0]) handleFile(fileInput.files[0]);
    });

    dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('sim-upload-zone--drag'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('sim-upload-zone--drag'));
    dropzone.addEventListener('drop', e => {
      e.preventDefault();
      dropzone.classList.remove('sim-upload-zone--drag');
      const file = e.dataTransfer?.files[0];
      if (file) handleFile(file);
    });
  }

  /* ── Handle file selection ─────────────────────────────────────────────── */
  function handleFile(file) {
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      showFileError('Only .csv files are accepted. Please convert your spreadsheet to CSV format first.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      showFileError('File is too large. Maximum size is 4 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const { headers, rows } = parseCSV(e.target.result);

      // Verify required headers
      const hasId = headers.includes('studentid') || headers.includes('student_id');
      const missing = REQUIRED_COLS.filter(c => !headers.includes(c));
      if (!hasId) missing.push('studentid');

      if (missing.length > 0) {
        showFileError(`Missing required columns: ${missing.map(c => `"${c}"`).join(', ')}. Please check your CSV header row.`);
        return;
      }

      const validated = validateRows(rows);
      parsedData = { file, rows: validated, headers };
      renderStep2(file.name);
    };
    reader.readAsText(file, 'utf-8');
  }

  function showFileError(msg) {
    const existing = body.querySelector('.sim-file-error');
    if (existing) existing.remove();
    const el = document.createElement('div');
    el.className = 'sim-file-error';
    el.innerHTML = `${icon('alert-triangle', 14)} ${msg}`;
    body.querySelector('.sim-upload-zone').after(el);
    renderIcons();
  }

  /* ── Step 2: Preview ────────────────────────────────────────────────────── */
  function renderStep2(fileName) {
    setStep(2);
    const rows    = parsedData.rows;
    const valid   = rows.filter(r => r._valid);
    const invalid = rows.filter(r => !r._valid);
    const preview = rows.slice(0, 10);

    body.innerHTML = `
      <div class="sim-preview-stats">
        <div class="sim-preview-stat sim-preview-stat--file">
          ${icon('file-text', 15)}
          <span class="sim-preview-stat__val">${fileName}</span>
        </div>
        <div class="sim-preview-stat sim-preview-stat--good">
          ${icon('check-circle', 14)}
          <span><strong>${valid.length}</strong> ready to register</span>
        </div>
        ${invalid.length > 0 ? `
        <div class="sim-preview-stat sim-preview-stat--bad">
          ${icon('alert-circle', 14)}
          <span><strong>${invalid.length}</strong> will be skipped</span>
        </div>` : ''}
      </div>

      ${valid.length === 0 ? `
        <div class="sim-empty-notice">
          ${icon('alert-triangle', 18)}
          <p>No valid rows found. Please fix your CSV and try again.</p>
        </div>
      ` : ''}

      <!-- Preview Table -->
      <div class="sim-table-wrap">
        <table class="sim-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Batch</th>
              <th>Section</th>
              <th>Name</th>
              <th>Student ID</th>
              <th>Email</th>
              <th>Course</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${preview.map(r => `
              <tr class="${r._valid ? '' : 'sim-table__row--bad'}">
                <td class="sim-table__row-num">${r._row}</td>
                <td><strong>${r.batch || '—'}</strong></td>
                <td>${r.section || '—'}</td>
                <td>${r.name || '<span class="sim-missing">—</span>'}</td>
                <td>${r._student_id || '<span class="sim-missing">—</span>'}</td>
                <td>${r.email || '<span class="sim-missing">—</span>'}</td>
                <td>${r.course || '<span class="sim-missing">—</span>'}</td>
                <td>
                  ${r._valid
                    ? `<span class="sim-status-pill sim-status-pill--ok">${icon('check', 10)} Ready</span>`
                    : `<span class="sim-status-pill sim-status-pill--err">${icon('x', 10)} ${r._issues[0]}</span>`}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${rows.length > 10 ? `<p class="sim-table-more">Showing first 10 of ${rows.length} rows. All ${rows.length} rows will be processed on import.</p>` : ''}
      </div>

      ${invalid.length > 0 ? `
        <div class="sim-warn-box">
          ${icon('alert-triangle', 14)}
          <span>${invalid.length} row(s) have validation issues and will be skipped. The remaining ${valid.length} valid alumni will still be registered.</span>
        </div>
      ` : ''}

      <div class="sim-actions">
        <button class="btn btn--ghost" id="aim-back-btn">${icon('arrow-left', 13)} Back</button>
        <button class="btn btn--primary" id="aim-import-btn" ${valid.length === 0 ? 'disabled' : ''}>
          ${icon('upload', 14)} Register ${valid.length} Alumni
        </button>
      </div>
    `;
    renderIcons();

    body.querySelector('#aim-back-btn').addEventListener('click', () => { parsedData = null; renderStep1(); });
    body.querySelector('#aim-import-btn')?.addEventListener('click', () => runImport());
  }

  /* ── Run the actual import ──────────────────────────────────────────────── */
  async function runImport() {
    const importBtn = body.querySelector('#aim-import-btn');
    if (importBtn) {
      importBtn.disabled = true;
      importBtn.innerHTML = `<span class="sim-spinner"></span> Registering…`;
    }

    const formData = new FormData();
    formData.append('file', parsedData.file);

    try {
      const res = await apiPostForm('/admin/alumni/import', formData);
      renderStep3(res);
    } catch (err) {
      renderStep3({
        imported: 0,
        skipped: parsedData?.rows?.length ?? 0,
        errors: [{ row: '—', email: '—', reason: err?.message || 'Network or server error during import' }]
      });
    }
  }

  /* ── Step 3: Results ────────────────────────────────────────────────────── */
  function renderStep3(res) {
    setStep(3);

    const imported = res?.imported ?? 0;
    const skipped  = res?.skipped  ?? 0;
    const errors   = res?.errors   ?? [];
    const success  = imported > 0;

    body.innerHTML = `
      <div class="sim-result-hero ${success ? 'sim-result-hero--ok' : 'sim-result-hero--warn'}">
        <div class="sim-result-hero__icon">
          ${success ? icon('check-circle', 36) : icon('alert-circle', 36)}
        </div>
        <div>
          <div class="sim-result-hero__title">
            ${success ? `${imported} Alumni Registered Successfully` : 'No Alumni Registered'}
          </div>
          <div class="sim-result-hero__sub">
            ${success
              ? `Alumni accounts are active and immediately visible in the Alumni Tracker.`
              : `All rows were skipped. Please review the reasons below.`}
          </div>
        </div>
      </div>

      <div class="sim-result-stats">
        <div class="sim-result-stat sim-result-stat--ok">
          <div class="sim-result-stat__num">${imported}</div>
          <div class="sim-result-stat__lbl">Registered</div>
        </div>
        <div class="sim-result-stat sim-result-stat--skip">
          <div class="sim-result-stat__num">${skipped}</div>
          <div class="sim-result-stat__lbl">Skipped</div>
        </div>
      </div>

      ${success ? `
      <div class="sim-credential-note">
        ${icon('key', 13)}
        <span>Default password for each alumni account is their <strong>Student ID</strong> with role <strong>Graduate / Alumni</strong>.</span>
      </div>
      ` : ''}

      ${errors.length > 0 ? `
        <div class="sim-errors-section">
          <div class="sim-errors-head">
            ${icon('alert-triangle', 13)}
            <span>Skipped Rows (${errors.length})</span>
          </div>
          <div class="sim-errors-table-wrap">
            <table class="sim-table sim-table--compact">
              <thead>
                <tr><th>Row</th><th>Email</th><th>Reason</th></tr>
              </thead>
              <tbody>
                ${errors.map(e => `
                  <tr>
                    <td class="sim-table__row-num">${e.row}</td>
                    <td>${e.email || '—'}</td>
                    <td><span class="sim-err-reason">${e.reason}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}

      <div class="sim-actions sim-actions--right">
        ${!success && errors.length > 0 ? `<button class="btn btn--ghost" id="aim-retry-btn">${icon('refresh-cw', 13)} Try Again</button>` : ''}
        <button class="btn btn--primary" id="aim-done-btn">${icon('check', 13)} Done</button>
      </div>
    `;
    renderIcons();

    body.querySelector('#aim-done-btn').addEventListener('click', () => {
      backdrop.remove();
      if (success && typeof onSuccess === 'function') onSuccess();
    });
    body.querySelector('#aim-retry-btn')?.addEventListener('click', () => {
      parsedData = null;
      renderStep1();
    });
  }

  /* ── Close modal ─────────────────────────────────────────────────────────── */
  backdrop.querySelector('#aim-close').addEventListener('click', () => backdrop.remove());
  backdrop.addEventListener('click', e => { if (e.target === backdrop) backdrop.remove(); });

  /* ── Kick off ─────────────────────────────────────────────────────────── */
  renderStep1();
}
