/**
 * Shared Tripartite Daily Time Record (DTR) Printable Component
 * Conforms to Civil Service Form No. 48 & CHMSU CIER Internship Standards.
 * Usable across Student Portal, Company Portal, and Supervisor Portal.
 */

function esc(str = '') {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getIconSvg(name, size = 16) {
  const icons = {
    printer: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>`,
    x: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    calendar: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
    clock: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    fileText: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
    check: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  };
  return icons[name] || '';
}

/**
 * Normalizes log records from any portal (student, company, or supervisor).
 */
function normalizeLog(l) {
  const rawDate = l.rawDate || l.date || '';
  let dateObj = null;
  try {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) dateObj = d;
  } catch {}

  const dateStr = l.date || (dateObj ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—');
  const dayName = l.dayLabel || (dateObj ? dateObj.toLocaleDateString('en-US', { weekday: 'short' }) : '—');
  const dayNum  = dateObj ? dateObj.getDate() : '—';
  const monthKey = dateObj ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}` : 'All';

  const mIn  = l.morningIn || l.timeIn || '—';
  const mOut = l.morningOut || (l.timeIn && !l.morningIn ? l.timeOut : '—') || '—';
  const aIn  = l.afternoonIn || '—';
  const aOut = l.afternoonOut || (l.afternoonIn ? l.timeOut : '—') || '—';

  const hours = parseFloat(l.hoursCredited ?? l.hours ?? l.hours_rendered ?? 0) || 0;
  const overtimeHours = parseFloat(l.overtimeHours ?? l.overtime_hours ?? 0) || 0;
  const rawReg = parseFloat(l.regularHours ?? l.regular_hours ?? 0) || 0;
  const regularHours = rawReg > 0 ? rawReg : Math.max(0, (parseFloat(l.hours ?? l.hours_rendered ?? 0) || 0) - overtimeHours);
  const overtimeStatus = l.overtimeStatus ?? l.overtime_status ?? 'none';
  const isTimeoutIneligible = !!(l.isTimeoutIneligible ?? l.is_timeout_ineligible);
  const status = (l.status || l.sessionStatus || 'present').toLowerCase();
  const validity = l.locationValidity || (l.distanceMeters != null ? (Number(l.distanceMeters) <= 50 ? 'In Site' : 'Too Far') : 'In Site');

  let remarks = l.task || l.description || '';
  if (status === 'absent') {
    remarks = 'Absent';
  } else if (isTimeoutIneligible) {
    remarks = `Unlogged Exit (${(l.ineligibleHoursEscrow || l.hours || 0)}h Ineligible Escrow)`;
  } else if (!remarks) {
    remarks = validity === 'Too Far' ? 'Off-Site / Verified' : 'Regular Attendance';
  }

  if (overtimeHours > 0) {
    const otTag = overtimeStatus === 'approved'
      ? `+${overtimeHours.toFixed(1)}h OT Approved`
      : (overtimeStatus === 'rejected'
        ? `+${overtimeHours.toFixed(1)}h OT Declined`
        : `+${overtimeHours.toFixed(1)}h OT Pending`);
    remarks = remarks ? `${remarks} (${otTag})` : otTag;
  }

  return {
    rawDate,
    dateStr,
    dayName,
    dayNum,
    monthKey,
    mIn,
    mOut,
    aIn,
    aOut,
    hours,
    regularHours,
    overtimeHours,
    overtimeStatus,
    isTimeoutIneligible,
    status,
    validity,
    remarks,
  };
}

/**
 * Opens the interactive DTR Print Preview Modal.
 */
export function openDtrPrintModal(options = {}) {
  const {
    student = {},
    company = {},
    coordinator = {},
    deployment = {},
    logs = [],
    progress = {},
    role = 'student',
  } = options;

  const studentName   = student.name || 'Student Trainee';
  const studentId     = student.student_id || student.studentId || ('CHMSU-' + (student.id || '2026'));
  const program       = student.program || 'Bachelor of Science in Information Technology';
  const yearLevel     = student.year_level || student.yearLevel || '4th Year';
  const section       = student.section || 'A';
  const campus        = student.campus || 'Alijis Campus, Bacolod City';

  const companyName   = company.name || company.company_name || 'Host Training Establishment';
  const companyDept   = company.department || deployment.department || 'OJT Training Division';
  const companySup    = company.supervisor_name || deployment.supervisor_name || 'Host Company Supervisor';
  const companyTitle  = company.supervisor_title || 'Internship Mentor / Trainer';

  const coordName     = coordinator.name || 'Prof. Mariene Labrador';
  const coordTitle    = coordinator.title || 'OJT Academic Coordinator';
  const college       = coordinator.college || 'College of Computer Studies';
  const department    = coordinator.department || 'Department of Information Technology';

  const requiredHours = parseFloat(deployment.required_hours || progress.requiredHours || progress.totalHours || 600) || 600;

  // Normalize all logs
  const normalizedLogs = (Array.isArray(logs) ? logs : []).map(normalizeLog);

  // Group by distinct months (YYYY-MM)
  const monthMap = new Map();
  normalizedLogs.forEach(l => {
    if (l.monthKey && l.monthKey !== 'All') {
      if (!monthMap.has(l.monthKey)) {
        try {
          const [y, m] = l.monthKey.split('-');
          const d = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
          const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          monthMap.set(l.monthKey, label);
        } catch {
          monthMap.set(l.monthKey, l.monthKey);
        }
      }
    }
  });

  const availableMonths = Array.from(monthMap.entries()).sort((a, b) => b[0].localeCompare(a[0]));

  // Default active filter: most recent month if available, else 'all'
  let activePeriod = availableMonths.length > 0 ? availableMonths[0][0] : 'all';

  // Modal Backdrop
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop modal-backdrop--visible';
  modal.style.zIndex = '99999';

  function renderModal() {
    let filteredLogs = [];
    let periodLabel  = '';

    if (activePeriod === 'all') {
      filteredLogs = [...normalizedLogs].reverse(); // chronological
      periodLabel = 'Cumulative Reporting Period (All Rendered Logs)';
    } else {
      filteredLogs = normalizedLogs.filter(l => l.monthKey === activePeriod).reverse();
      periodLabel = `Month of ${monthMap.get(activePeriod) || activePeriod}`;
    }

    const periodHours = filteredLogs.reduce((sum, l) => sum + (l.status !== 'absent' ? l.hours : 0), 0);
    const cumulativeHours = normalizedLogs.reduce((sum, l) => sum + (l.status !== 'absent' ? l.hours : 0), 0);
    const remainingHours = Math.max(0, requiredHours - cumulativeHours);
    const progressPct = requiredHours > 0 ? Math.min(100, Math.round((cumulativeHours / requiredHours) * 100)) : 0;

    const rowsHtml = filteredLogs.length > 0
      ? filteredLogs.map((l, idx) => {
          const isAbsent = l.status === 'absent';
          return `
            <tr style="border-bottom:1px solid #cbd5e1;${isAbsent ? 'background:#fef2f2;' : (idx % 2 === 1 ? 'background:#f8fafc;' : '')}">
              <td style="padding:5px 6px;text-align:center;font-weight:700;font-size:8pt;border-right:1px solid #cbd5e1;">${esc(l.dayNum)}</td>
              <td style="padding:5px 6px;text-align:center;font-size:8pt;border-right:1px solid #cbd5e1;white-space:nowrap;">${esc(l.dateStr)}</td>
              <td style="padding:5px 6px;text-align:center;font-size:8pt;border-right:1px solid #cbd5e1;font-family:monospace;">${isAbsent ? '—' : esc(l.mIn)}</td>
              <td style="padding:5px 6px;text-align:center;font-size:8pt;border-right:1px solid #cbd5e1;font-family:monospace;">${isAbsent ? '—' : esc(l.mOut)}</td>
              <td style="padding:5px 6px;text-align:center;font-size:8pt;border-right:1px solid #cbd5e1;font-family:monospace;">${isAbsent ? '—' : esc(l.aIn)}</td>
              <td style="padding:5px 6px;text-align:center;font-size:8pt;border-right:1px solid #cbd5e1;font-family:monospace;">${isAbsent ? '—' : esc(l.aOut)}</td>
              <td style="padding:5px 6px;text-align:right;font-weight:700;font-size:8pt;border-right:1px solid #cbd5e1;font-family:monospace;">${isAbsent ? '0.00' : l.hours.toFixed(2)}</td>
              <td style="padding:5px 6px;font-size:7.5pt;color:#334155;">${isAbsent ? '<span style="color:#b91c1c;font-weight:700;">ABSENT</span>' : esc(l.remarks)}</td>
            </tr>
          `;
        }).join('')
      : `
        <tr>
          <td colspan="8" style="padding:30px;text-align:center;color:#64748b;font-style:italic;">
            No attendance entries logged for this period.
          </td>
        </tr>
      `;

    modal.innerHTML = `
      <div class="modal modal--visible" style="max-width:940px;width:96vw;max-height:94vh;display:flex;flex-direction:column;padding:0;overflow:hidden;border-radius:14px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);background:#ffffff;">
        <!-- Modal Toolbar Header (Screen Only) -->
        <div style="padding:14px 24px;border-bottom:1px solid var(--border-default, #e2e8f0);display:flex;align-items:center;justify-content:space-between;background:var(--bg-card, #ffffff);flex-shrink:0;">
          <div style="display:flex;align-items:center;gap:12px;min-width:0;">
            <div style="width:38px;height:38px;border-radius:8px;background:rgba(0,89,48,0.08);color:#005930;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              ${getIconSvg('fileText', 20)}
            </div>
            <div style="min-width:0;">
              <h3 style="margin:0;font-size:1.08rem;font-weight:800;color:#0f172a;">Daily Time Record (DTR) &mdash; CS Form 48</h3>
              <p style="font-size:0.77rem;color:#64748b;margin:2px 0 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                <strong>${esc(studentName)}</strong> &bull; ${esc(studentId)} &bull; ${esc(companyName)}
              </p>
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:8px;">
            <!-- Period Selector -->
            <div style="display:flex;align-items:center;gap:6px;">
              <label for="dtr-period-select" style="font-size:0.75rem;font-weight:600;color:#475569;">Period:</label>
              <select id="dtr-period-select" class="form-input" style="height:32px;padding:3px 10px;font-size:0.78rem;font-weight:600;border-radius:6px;border:1px solid #cbd5e1;cursor:pointer;background:#fff;">
                <option value="all" ${activePeriod === 'all' ? 'selected' : ''}>All Logs (Cumulative)</option>
                ${availableMonths.map(([k, lbl]) => `<option value="${k}" ${activePeriod === k ? 'selected' : ''}>${esc(lbl)}</option>`).join('')}
              </select>
            </div>

            <!-- Print Trigger Button -->
            <button type="button" class="btn btn--primary" id="dtr-do-print-btn" style="height:34px;padding:0 14px;background:#005930;border-color:#005930;color:#ffffff;font-size:0.8rem;font-weight:700;display:inline-flex;align-items:center;gap:6px;border-radius:6px;cursor:pointer;box-shadow:0 2px 6px rgba(0,89,48,0.25);">
              ${getIconSvg('printer', 14)} Print / Save as PDF
            </button>

            <button type="button" id="dtr-modal-close" style="background:none;border:none;cursor:pointer;color:#64748b;padding:6px;border-radius:6px;display:flex;align-items:center;justify-content:center;">
              ${getIconSvg('x', 20)}
            </button>
          </div>
        </div>

        <!-- Scrollable Modal Body (Stationery Paper Container) -->
        <div style="flex:1;overflow-y:auto;padding:24px;background:#f1f5f9;display:flex;justify-content:center;">
          <!-- Printable Sheet Paper Container -->
          <div id="dtr-printable-sheet" style="background:#ffffff;width:100%;max-width:820px;padding:36px 42px;border:1.5px solid #cbd5e1;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.06);font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;color:#0f172a;line-height:1.4;">
            
            <!-- University Header -->
            <div style="text-align:center;border-bottom:2px solid #005930;padding-bottom:12px;margin-bottom:14px;">
              <div style="font-size:0.75rem;font-weight:600;color:#475569;text-transform:uppercase;letter-spacing:0.04em;">Republic of the Philippines</div>
              <div style="font-size:1.15rem;font-weight:900;color:#005930;letter-spacing:0.02em;margin-top:2px;">CARLOS HILADO MEMORIAL STATE UNIVERSITY</div>
              <div style="font-size:0.84rem;font-weight:700;color:#0f172a;margin-top:1px;">${esc(college)} &bull; ${esc(department)}</div>
              <div style="font-size:0.75rem;color:#64748b;margin-top:2px;">${esc(campus)} &bull; www.chmsu.edu.ph</div>
            </div>

            <!-- Title & Form Number -->
            <div style="text-align:center;margin-bottom:16px;">
              <div style="font-size:0.72rem;font-weight:700;color:#64748b;letter-spacing:0.05em;text-transform:uppercase;">
                Civil Service Form No. 48 (CS Form 48) &mdash; University Internship Standard
              </div>
              <h2 style="margin:3px 0 0;font-size:1.12rem;font-weight:900;color:#005930;letter-spacing:0.06em;text-transform:uppercase;">
                DAILY TIME RECORD (DTR)
              </h2>
              <div style="font-size:0.82rem;font-weight:700;color:#1e293b;margin-top:3px;">
                ${esc(periodLabel)}
              </div>
            </div>

            <!-- Student Trainee & HTE Metadata Strip -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;padding:10px 14px;margin-bottom:14px;font-size:0.8rem;">
              <div>
                <div style="margin-bottom:3px;"><span style="color:#64748b;width:120px;display:inline-block;">Trainee Name:</span> <strong>${esc(studentName)}</strong></div>
                <div style="margin-bottom:3px;"><span style="color:#64748b;width:120px;display:inline-block;">Student ID No.:</span> <strong style="font-family:monospace;">${esc(studentId)}</strong></div>
                <div><span style="color:#64748b;width:120px;display:inline-block;">Degree &amp; Section:</span> <strong>${esc(program)} &ndash; ${esc(yearLevel)} (Sec ${esc(section)})</strong></div>
              </div>
              <div>
                <div style="margin-bottom:3px;"><span style="color:#64748b;width:130px;display:inline-block;">Host Establishment:</span> <strong>${esc(companyName)}</strong></div>
                <div style="margin-bottom:3px;"><span style="color:#64748b;width:130px;display:inline-block;">Assigned Division:</span> <strong>${esc(companyDept)}</strong></div>
                <div><span style="color:#64748b;width:130px;display:inline-block;">Official Required Hours:</span> <strong style="color:#005930;">${requiredHours.toFixed(1)} Hours</strong></div>
              </div>
            </div>

            <!-- DTR Attendance Ledger Table (2-Tier Header) -->
            <table style="width:100%;border-collapse:collapse;border:1.5px solid #005930;font-size:8pt;margin-bottom:14px;">
              <thead>
                <tr style="background:#005930;color:#ffffff;text-align:center;">
                  <th rowspan="2" style="padding:6px 4px;border:1px solid #004d2a;width:38px;">DAY</th>
                  <th rowspan="2" style="padding:6px 6px;border:1px solid #004d2a;width:85px;">DATE</th>
                  <th colspan="2" style="padding:4px;border:1px solid #004d2a;font-weight:800;letter-spacing:0.04em;">MORNING SHIFT (A.M.)</th>
                  <th colspan="2" style="padding:4px;border:1px solid #004d2a;font-weight:800;letter-spacing:0.04em;">AFTERNOON SHIFT (P.M.)</th>
                  <th rowspan="2" style="padding:6px 6px;border:1px solid #004d2a;width:68px;text-align:right;">HOURS</th>
                  <th rowspan="2" style="padding:6px 8px;border:1px solid #004d2a;text-align:left;">LOCATION / REMARKS</th>
                </tr>
                <tr style="background:#0a6b3b;color:#ffffff;font-size:7.5pt;text-align:center;">
                  <th style="padding:3px;border:1px solid #004d2a;width:68px;">IN</th>
                  <th style="padding:3px;border:1px solid #004d2a;width:68px;">OUT</th>
                  <th style="padding:3px;border:1px solid #004d2a;width:68px;">IN</th>
                  <th style="padding:3px;border:1px solid #004d2a;width:68px;">OUT</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
              <tfoot>
                <!-- Period Total Row -->
                <tr style="background:#f1f5f9;font-weight:800;border-top:2px solid #005930;border-bottom:1px solid #cbd5e1;">
                  <td colspan="6" style="padding:6px 10px;text-align:right;font-size:8.2pt;color:#0f172a;">
                    TOTAL HOURS RENDERED THIS REPORTING PERIOD:
                  </td>
                  <td style="padding:6px 6px;text-align:right;font-size:9pt;font-weight:900;color:#005930;font-family:monospace;border-right:1px solid #cbd5e1;">
                    ${periodHours.toFixed(2)}
                  </td>
                  <td style="padding:6px 8px;font-size:7.5pt;color:#64748b;">
                    ${filteredLogs.length} attendance record(s)
                  </td>
                </tr>

                <!-- Cumulative Hours Strip -->
                <tr style="background:#f8fafc;font-size:7.8pt;">
                  <td colspan="8" style="padding:8px 12px;border-top:1px solid #cbd5e1;">
                    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
                      <div>
                        Cumulative OJT Hours to Date: <strong style="color:#005930;font-size:8.5pt;">${cumulativeHours.toFixed(1)} / ${requiredHours.toFixed(1)} hrs</strong>
                        <span style="color:#64748b;margin-left:6px;">(${progressPct}% Completed)</span>
                      </div>
                      <div>
                        Remaining Balance to Render: <strong style="color:${remainingHours <= 0 ? '#059669' : '#d97706'};font-size:8.5pt;">${remainingHours.toFixed(1)} hrs</strong>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>

            <!-- Solemn Certification Statement (CS Form 48 Standard Text) -->
            <p style="margin:14px 0 20px;font-size:7.8pt;color:#334155;line-height:1.55;font-style:italic;text-align:justify;border-left:3px solid #005930;padding-left:10px;">
              I certify on my honor that the above is a true and correct report of the hours of work performed, record of which was made daily at the time of arrival and departure from the assigned training station.
            </p>

            <!-- Tripartite Signatures Block -->
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-top:24px;padding-top:10px;">
              <!-- Student Signature -->
              <div style="text-align:center;">
                <div style="border-bottom:1.5px solid #0f172a;height:36px;margin-bottom:4px;"></div>
                <div style="font-weight:800;font-size:8.5pt;text-transform:uppercase;color:#0f172a;">${esc(studentName)}</div>
                <div style="font-size:7.2pt;color:#64748b;margin-top:1px;">Student Trainee (Signature)</div>
                <div style="font-size:7pt;color:#94a3b8;margin-top:2px;">Date: ____________________</div>
              </div>

              <!-- Company Supervisor Signature -->
              <div style="text-align:center;">
                <div style="border-bottom:1.5px solid #0f172a;height:36px;margin-bottom:4px;"></div>
                <div style="font-weight:800;font-size:8.5pt;text-transform:uppercase;color:#0f172a;">${esc(companySup)}</div>
                <div style="font-size:7.2pt;color:#64748b;margin-top:1px;">${esc(companyTitle)} &bull; ${esc(companyName)}</div>
                <div style="font-size:7pt;color:#94a3b8;margin-top:2px;">Verified &bull; Date: ____________________</div>
              </div>

              <!-- University Coordinator Signature -->
              <div style="text-align:center;">
                <div style="border-bottom:1.5px solid #0f172a;height:36px;margin-bottom:4px;"></div>
                <div style="font-weight:800;font-size:8.5pt;text-transform:uppercase;color:#005930;">${esc(coordName)}</div>
                <div style="font-size:7.2pt;color:#64748b;margin-top:1px;">${esc(coordTitle)} &bull; CHMSU</div>
                <div style="font-size:7pt;color:#94a3b8;margin-top:2px;">Accredited &bull; Date: ____________________</div>
              </div>
            </div>

            <!-- Bottom Disclaimer Footnote -->
            <div style="margin-top:22px;border-top:1px dashed #cbd5e1;padding-top:6px;font-size:6.8pt;color:#94a3b8;display:flex;justify-content:space-between;">
              <span>CHMSU CIER Form 48-OJT &bull; Digitally Recorded &amp; Geofence Validated</span>
              <span>Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Wire events
    const closeBtn = modal.querySelector('#dtr-modal-close');
    closeBtn?.addEventListener('click', () => modal.remove());

    const periodSelect = modal.querySelector('#dtr-period-select');
    periodSelect?.addEventListener('change', (e) => {
      activePeriod = e.target.value;
      renderModal();
    });

    // Print Button
    const printBtn = modal.querySelector('#dtr-do-print-btn');
    printBtn?.addEventListener('click', () => {
      const sheetHtml = modal.querySelector('#dtr-printable-sheet').innerHTML;
      const printWin = window.open('', '_blank', 'width=900,height=950');
      if (printWin) {
        printWin.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Official CHMSU Daily Time Record - ${esc(studentName)}</title>
              <style>
                @page {
                  size: letter portrait;
                  margin: 10mm 12mm 10mm 12mm;
                }
                * {
                  box-sizing: border-box;
                }
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                  color: #0f172a;
                  margin: 0;
                  padding: 10px;
                  background: #ffffff;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                table {
                  page-break-inside: auto;
                }
                thead {
                  display: table-header-group;
                }
                tr {
                  page-break-inside: avoid;
                  page-break-after: auto;
                }
                @media print {
                  body { padding: 0; }
                }
              </style>
            </head>
            <body>
              <div style="max-width:800px;margin:0 auto;">
                ${sheetHtml}
              </div>
              <script>
                window.onload = function() {
                  window.print();
                };
              <\/script>
            </body>
          </html>
        `);
        printWin.document.close();
      }
    });
  }

  renderModal();
  document.body.appendChild(modal);
}
