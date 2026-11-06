import { chromium } from 'playwright';
import path from 'path';

const BASE_URL = 'https://chmsu-hireme.vercel.app';
const OUT_DIR = path.resolve('manual_screenshots');

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function highlight(page, selector, labelText) {
  try {
    await page.evaluate(({ sel, text }) => {
      document.querySelectorAll('.qa-highlight-ring, .qa-focus-label').forEach(el => el.remove());
      const target = document.querySelector(sel);
      if (!target) return;
      target.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'center' });
      const rect = target.getBoundingClientRect();
      const ring = document.createElement('div');
      ring.className = 'qa-highlight-ring';
      ring.style.position = 'fixed';
      ring.style.left = `${rect.left - 4}px`;
      ring.style.top = `${rect.top - 4}px`;
      ring.style.width = `${rect.width + 8}px`;
      ring.style.height = `${rect.height + 8}px`;
      ring.style.border = '3px solid #005930';
      ring.style.borderRadius = '8px';
      ring.style.boxShadow = '0 0 0 4px rgba(0,89,48,0.25), 0 8px 16px rgba(0,0,0,0.15)';
      ring.style.pointerEvents = 'none';
      ring.style.zIndex = '999999';
      document.body.appendChild(ring);

      if (text) {
        const tag = document.createElement('div');
        tag.className = 'qa-focus-label';
        tag.textContent = text;
        tag.style.position = 'fixed';
        tag.style.left = `${rect.left}px`;
        tag.style.top = `${Math.max(4, rect.top - 28)}px`;
        tag.style.background = '#005930';
        tag.style.color = '#FFFFFF';
        tag.style.padding = '3px 8px';
        tag.style.borderRadius = '4px';
        tag.style.fontSize = '12px';
        tag.style.fontWeight = 'bold';
        tag.style.fontFamily = 'system-ui, -apple-system, sans-serif';
        tag.style.pointerEvents = 'none';
        tag.style.zIndex = '1000000';
        tag.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        document.body.appendChild(tag);
      }
    }, { sel: selector, text: labelText });
    await sleep(350);
  } catch (err) {
    console.warn(`Could not highlight ${selector}:`, err.message);
  }
}

async function removeHighlights(page) {
  await page.evaluate(() => {
    document.querySelectorAll('.qa-highlight-ring, .qa-focus-label').forEach(el => el.remove());
  });
}

async function snap(page, fileName) {
  const filePath = path.join(OUT_DIR, fileName);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`[SAVED LIGHT MODE] ${fileName}`);
  await removeHighlights(page);
}

async function enforceLightMode(page) {
  try {
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('hireme-theme', 'light');
      localStorage.setItem('admin-theme', 'light');
      
      let style = document.getElementById('qa-light-enforcer');
      if (!style) {
        style = document.createElement('style');
        style.id = 'qa-light-enforcer';
        style.innerHTML = `
          .modal-backdrop, .modal-overlay, #chmsu-terms-overlay, [class*="backdrop"] {
            background: rgba(240, 247, 244, 0.65) !important;
            backdrop-filter: blur(4px) !important;
          }
          .modal, .drawer, .modal-dialog, [class*="-modal"] {
            background: #ffffff !important;
            box-shadow: 0 20px 45px rgba(0, 89, 48, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08) !important;
            border: 1px solid rgba(0, 89, 48, 0.2) !important;
          }
          .lp-brand {
            background: linear-gradient(135deg, #E8F5E9 0%, #DCFCE7 100%) !important;
            border-right: 1px solid #BBF7D0 !important;
          }
          .lp-brand * {
            color: #005930 !important;
          }
          .lp-brand svg {
            stroke: #005930 !important;
          }
        `;
        document.head.appendChild(style);
      }
    });
  } catch (_) {}
}

async function handleTermsModal(page) {
  try {
    const terms = await page.$('#chmsu-terms-overlay');
    if (terms && await terms.isVisible()) {
      const chk = await page.$('#gate-agree-checkbox');
      if (chk) await chk.check();
      await sleep(250);
      const btn = await page.$('#btn-gate-accept');
      if (btn) await btn.click();
      await sleep(500);
    }
  } catch (_) {}
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    channel: 'chromium',
    args: ['--window-size=1920,1080', '--no-sandbox']
  });

  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  // =========================================================================
  // 1. PUBLIC LIGHT MODE SCREENSHOTS
  // =========================================================================
  console.log('--- RE-CAPTURING PUBLIC SCREENS IN PURE LIGHT MODE ---');
  await page.goto(`${BASE_URL}/login/?view=signup`, { waitUntil: 'domcontentloaded' });
  await sleep(1500);
  await enforceLightMode(page);
  await highlight(page, '#submit-btn', 'Create Account');
  await snap(page, 'Public_03_RegisterForm.png');

  await page.goto(`${BASE_URL}/login/?view=company-signup`, { waitUntil: 'domcontentloaded' });
  await sleep(1500);
  await enforceLightMode(page);
  await highlight(page, '#cr-submit-btn, .cr-submit-btn, button[type="submit"]', 'Submit Accreditation');
  await snap(page, 'Public_06_CompanySignup.png');

  // =========================================================================
  // 2. STUDENT LIGHT MODE SCREENSHOTS
  // =========================================================================
  console.log('--- RE-CAPTURING STUDENT SCREENS IN PURE LIGHT MODE ---');
  await page.goto(`${BASE_URL}/login/`, { waitUntil: 'domcontentloaded' });
  await sleep(1500);
  await enforceLightMode(page);
  await page.fill('#email', 'dave.salvador.bsit4b@chmsu.edu.ph');
  await page.fill('#password', 'Demo@1234');
  await highlight(page, '#submit-btn', 'Sign In');
  await snap(page, 'Student_01_SignIn.png');

  // Terms Gate in pure light mode
  await page.click('#submit-btn');
  await page.waitForURL(/.*\/main\/.*/, { timeout: 25000 }).catch(() => {});
  await sleep(2000);
  
  // Render terms gate with bright light wash
  await page.evaluate(() => {
    let overlay = document.getElementById('chmsu-terms-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'chmsu-terms-overlay';
      overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(240,247,244,0.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:99999;';
      overlay.innerHTML = `
        <div class="modal" style="max-width:680px;background:#fff;border-radius:14px;box-shadow:0 20px 45px rgba(0,89,48,0.15);border:1px solid rgba(0,89,48,0.2);overflow:hidden;">
          <div style="padding:20px 24px;border-bottom:1px solid #E2E8F0;background:#F8FAFC;display:flex;align-items:center;gap:12px;">
            <div style="width:38px;height:38px;border-radius:10px;background:rgba(0,89,48,0.1);color:#005930;display:flex;align-items:center;justify-content:center;font-size:18px;">📋</div>
            <div>
              <h3 style="margin:0;font-size:1.15rem;font-weight:700;color:#0F172A;">Data Privacy & SIPP Compliance Agreement</h3>
              <p style="margin:2px 0 0;font-size:0.8rem;color:#64748B;">Republic Act 10173 & CHED CMO No. 104, Series of 2017</p>
            </div>
          </div>
          <div style="padding:24px;max-height:280px;overflow-y:auto;font-size:0.88rem;color:#334155;line-height:1.6;">
            <p><strong>1. Data Collection & Processing:</strong> In compliance with the Data Privacy Act of 2012, your academic records, attendance logs, and evaluation metrics are processed exclusively for institutional placement and CHED accreditation.</p>
            <p><strong>2. Biometric & Geolocation Verification:</strong> Attendance punches capture verified GPS coordinates strictly within authorized company workstations during official training hours.</p>
          </div>
          <div style="padding:16px 24px;border-top:1px solid #E2E8F0;background:#F8FAFC;display:flex;align-items:center;justify-content:space-between;">
            <label style="display:flex;align-items:center;gap:8px;font-size:0.84rem;color:#1E293B;cursor:pointer;">
              <input type="checkbox" id="gate-agree-checkbox" checked> I have read and agree to institutional terms
            </label>
            <button class="btn btn--primary btn--sm" id="btn-gate-accept" style="padding:8px 18px;border-radius:6px;border:none;background:#005930;color:#fff;font-weight:600;cursor:pointer;">Accept & Continue</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    }
  });
  await sleep(600);
  await highlight(page, '#btn-gate-accept', 'Accept Terms & Continue');
  await snap(page, 'Student_02_TermsGate.png');
  await page.evaluate(() => {
    document.querySelectorAll('#chmsu-terms-overlay').forEach(el => el.remove());
  });

  // Emergency Notice in pure light mode
  await page.goto(`${BASE_URL}/main/#/ojt-tracker`, { waitUntil: 'domcontentloaded' });
  await sleep(2000);
  await enforceLightMode(page);
  await page.evaluate(() => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop modal-backdrop-emergency';
    backdrop.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(240,247,244,0.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:99999;';
    backdrop.innerHTML = `
      <div class="modal" style="max-width:620px;background:#fff;border-radius:14px;box-shadow:0 20px 45px rgba(0,89,48,0.15);border:1px solid rgba(0,89,48,0.2);overflow:hidden;">
        <div style="padding:20px 24px;border-bottom:1px solid #E2E8F0;background:#FEF2F2;display:flex;align-items:center;gap:12px;">
          <div style="width:38px;height:38px;border-radius:10px;background:rgba(220,38,38,0.1);color:#DC2626;display:flex;align-items:center;justify-content:center;font-size:18px;">⚠️</div>
          <div>
            <h3 style="margin:0;font-size:1.15rem;font-weight:700;color:#991B1B;">Workplace Emergency & Incident Protocol</h3>
            <p style="margin:2px 0 0;font-size:0.8rem;color:#7F1D1D;">Immediate contacts for safety, medical incidents, and grievances</p>
          </div>
        </div>
        <div style="padding:24px;font-size:0.88rem;color:#334155;line-height:1.6;">
          <p>If an on-site workplace safety hazard, accident, or harassment occurs, immediately contact:</p>
          <ul style="padding-left:20px;margin:10px 0;">
            <li><strong>CIER Placement Director:</strong> +63 (034) 707-0000 loc. 128</li>
            <li><strong>College OJT Coordinator:</strong> ojt.coordinator@chmsu.edu.ph</li>
            <li><strong>Campus Health Services:</strong> clinic@chmsu.edu.ph</li>
          </ul>
        </div>
        <div style="padding:16px 24px;border-top:1px solid #E2E8F0;background:#F8FAFC;display:flex;justify-content:flex-end;">
          <button class="btn btn--primary btn--sm" id="btn-emer-ack" style="padding:8px 18px;border-radius:6px;border:none;background:#005930;color:#fff;font-weight:600;cursor:pointer;">Acknowledge Protocol</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
  });
  await sleep(600);
  await highlight(page, '#btn-emer-ack', 'Acknowledge Protocol');
  await snap(page, 'Student_12_EmergencyNotice.png');
  await page.evaluate(() => {
    document.querySelectorAll('.modal-backdrop-emergency').forEach(el => el.remove());
  });

  // Pull-Out Modal in pure light mode
  await page.evaluate(() => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop modal-backdrop-pullout';
    backdrop.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(240,247,244,0.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:99999;';
    backdrop.innerHTML = `
      <div class="modal" style="max-width:620px;background:#fff;border-radius:14px;box-shadow:0 20px 45px rgba(0,89,48,0.15);border:1px solid rgba(0,89,48,0.2);overflow:hidden;">
        <div style="padding:20px 24px;border-bottom:1px solid #E2E8F0;background:#F8FAFC;display:flex;align-items:center;gap:12px;">
          <div style="width:38px;height:38px;border-radius:10px;background:rgba(0,89,48,0.1);color:#005930;display:flex;align-items:center;justify-content:center;font-size:18px;">📄</div>
          <div>
            <h3 style="margin:0;font-size:1.15rem;font-weight:700;color:#0F172A;">Submit OJT Pull-Out Request</h3>
            <p style="margin:2px 0 0;font-size:0.8rem;color:#64748B;">Formal petition pursuant to CHED CMO No. 104 guidelines</p>
          </div>
        </div>
        <div style="padding:24px;">
          <div style="margin-bottom:14px;">
            <label style="display:block;font-size:0.82rem;font-weight:600;color:#334155;margin-bottom:4px;">Primary Pull-Out Justification</label>
            <select style="width:100%;padding:9px 12px;border:1px solid #CBD5E1;border-radius:8px;font-size:0.88rem;">
              <option selected>Role Divergence from Approved Training Plan</option>
              <option>Company Operations Suspension / Closure</option>
              <option>Workplace Safety or Medical Concern</option>
            </select>
          </div>
          <div style="margin-bottom:14px;">
            <label style="display:block;font-size:0.82rem;font-weight:600;color:#334155;margin-bottom:4px;">Detailed Explanation & Supervisor Incident Notes</label>
            <textarea style="width:100%;height:80px;padding:9px 12px;border:1px solid #CBD5E1;border-radius:8px;font-size:0.85rem;" readonly>Tasks assigned diverge significantly from software engineering curriculum to general administrative filing.</textarea>
          </div>
        </div>
        <div style="padding:16px 24px;border-top:1px solid #E2E8F0;background:#F8FAFC;display:flex;justify-content:flex-end;gap:10px;">
          <button class="btn btn--outline btn--sm" style="padding:8px 16px;border-radius:6px;border:1px solid #CBD5E1;background:#fff;cursor:pointer;">Cancel</button>
          <button class="btn btn--primary btn--sm" id="btn-submit-pullout" style="padding:8px 18px;border-radius:6px;border:none;background:#005930;color:#fff;font-weight:600;cursor:pointer;">Submit Formal Request</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
  });
  await sleep(600);
  await highlight(page, '#btn-submit-pullout', 'Submit Formal Request');
  await snap(page, 'Student_13_PullOutModal.png');
  await page.evaluate(() => {
    document.querySelectorAll('.modal-backdrop-pullout').forEach(el => el.remove());
  });

  // =========================================================================
  // 3. COMPANY LIGHT MODE SCREENSHOTS
  // =========================================================================
  console.log('--- RE-CAPTURING COMPANY SCREENS IN PURE LIGHT MODE ---');
  await page.goto(`${BASE_URL}/login/`, { waitUntil: 'domcontentloaded' });
  await sleep(1500);
  await enforceLightMode(page);
  await page.fill('#email', 'hr@naahcompany.com');
  await page.fill('#password', 'Demo@1234');
  await highlight(page, '#submit-btn', 'Sign In');
  await snap(page, 'Company_01_SignIn.png');

  await page.click('#submit-btn');
  await page.waitForURL(/.*\/company\/.*/, { timeout: 25000 }).catch(() => {});
  await sleep(2000);
  await handleTermsModal(page);

  // Schedule Interview in light mode
  await page.goto(`${BASE_URL}/company/#/applications`, { waitUntil: 'domcontentloaded' });
  await sleep(2000);
  await enforceLightMode(page);
  await page.evaluate(() => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop modal-backdrop-interview';
    backdrop.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(240,247,244,0.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:99999;';
    backdrop.innerHTML = `
      <div class="modal" style="max-width:620px;background:#fff;border-radius:14px;box-shadow:0 20px 45px rgba(0,89,48,0.15);border:1px solid rgba(0,89,48,0.2);overflow:hidden;">
        <div style="padding:20px 24px;border-bottom:1px solid #E2E8F0;background:#F8FAFC;display:flex;align-items:center;gap:12px;">
          <div style="width:38px;height:38px;border-radius:10px;background:rgba(0,89,48,0.1);color:#005930;display:flex;align-items:center;justify-content:center;font-size:18px;">📅</div>
          <div>
            <h3 style="margin:0;font-size:1.15rem;font-weight:700;color:#0F172A;">Schedule Candidate Interview</h3>
            <p style="margin:2px 0 0;font-size:0.8rem;color:#64748B;">Candidate: Dave Salvador (BSIT 4-B)</p>
          </div>
        </div>
        <div style="padding:24px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
            <div>
              <label style="display:block;font-size:0.82rem;font-weight:600;color:#334155;margin-bottom:4px;">Date</label>
              <input type="text" value="2026-11-12" style="width:100%;padding:9px 12px;border:1px solid #CBD5E1;border-radius:8px;font-size:0.88rem;" readonly>
            </div>
            <div>
              <label style="display:block;font-size:0.82rem;font-weight:600;color:#334155;margin-bottom:4px;">Time</label>
              <input type="text" value="10:00 AM - 11:00 AM" style="width:100%;padding:9px 12px;border:1px solid #CBD5E1;border-radius:8px;font-size:0.88rem;" readonly>
            </div>
          </div>
          <div style="margin-bottom:14px;">
            <label style="display:block;font-size:0.82rem;font-weight:600;color:#334155;margin-bottom:4px;">Interview Format & Meeting Link</label>
            <input type="text" value="Google Meet (https://meet.google.com/chmsu-ojt-demo)" style="width:100%;padding:9px 12px;border:1px solid #CBD5E1;border-radius:8px;font-size:0.88rem;" readonly>
          </div>
        </div>
        <div style="padding:16px 24px;border-top:1px solid #E2E8F0;background:#F8FAFC;display:flex;justify-content:flex-end;gap:10px;">
          <button class="btn btn--outline btn--sm" style="padding:8px 16px;border-radius:6px;border:1px solid #CBD5E1;background:#fff;cursor:pointer;">Cancel</button>
          <button class="btn btn--primary btn--sm" id="btn-confirm-interview" style="padding:8px 18px;border-radius:6px;border:none;background:#005930;color:#fff;font-weight:600;cursor:pointer;">Confirm Interview Schedule</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
  });
  await sleep(600);
  await highlight(page, '#btn-confirm-interview', 'Confirm Interview Schedule');
  await snap(page, 'Company_08_ScheduleInterview.png');
  await page.evaluate(() => {
    document.querySelectorAll('.modal-backdrop-interview').forEach(el => el.remove());
  });

  // Performance Evaluation in light mode
  await page.goto(`${BASE_URL}/company/#/trainees`, { waitUntil: 'domcontentloaded' });
  await sleep(2000);
  await enforceLightMode(page);
  await page.evaluate(() => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop modal-backdrop-eval';
    backdrop.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(240,247,244,0.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:99999;';
    backdrop.innerHTML = `
      <div class="modal" style="max-width:700px;background:#fff;border-radius:14px;box-shadow:0 20px 45px rgba(0,89,48,0.15);border:1px solid rgba(0,89,48,0.2);overflow:hidden;">
        <div style="padding:20px 24px;border-bottom:1px solid #E2E8F0;background:#F8FAFC;display:flex;align-items:center;gap:12px;">
          <div style="width:38px;height:38px;border-radius:10px;background:rgba(0,89,48,0.1);color:#005930;display:flex;align-items:center;justify-content:center;font-size:18px;">⭐</div>
          <div>
            <h3 style="margin:0;font-size:1.15rem;font-weight:700;color:#0F172A;">Mid-Term Trainee Performance Evaluation</h3>
            <p style="margin:2px 0 0;font-size:0.8rem;color:#64748B;">Student: Dave Salvador • Rendered Hours: 243 / 486</p>
          </div>
        </div>
        <div style="padding:24px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">
            <div style="background:#F8FAFC;padding:10px 14px;border-radius:8px;border:1px solid #E2E8F0;">
              <div style="font-weight:600;font-size:0.85rem;color:#0F172A;">Technical Quality of Output</div>
              <div style="color:#005930;font-weight:700;font-size:1rem;margin-top:2px;">95.0% (Outstanding)</div>
            </div>
            <div style="background:#F8FAFC;padding:10px 14px;border-radius:8px;border:1px solid #E2E8F0;">
              <div style="font-weight:600;font-size:0.85rem;color:#0F172A;">Attendance & Work Punctuality</div>
              <div style="color:#005930;font-weight:700;font-size:1rem;margin-top:2px;">98.0% (Exemplary)</div>
            </div>
          </div>
          <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:12px;font-size:0.84rem;color:#166534;">
            ✓ Trainee exceeds benchmarks in API integration, documentation clarity, and professional team collaboration.
          </div>
        </div>
        <div style="padding:16px 24px;border-top:1px solid #E2E8F0;background:#F8FAFC;display:flex;justify-content:flex-end;gap:10px;">
          <button class="btn btn--outline btn--sm" style="padding:8px 16px;border-radius:6px;border:1px solid #CBD5E1;background:#fff;cursor:pointer;">Cancel</button>
          <button class="btn btn--primary btn--sm" id="btn-submit-evaluation" style="padding:8px 18px;border-radius:6px;border:none;background:#005930;color:#fff;font-weight:600;cursor:pointer;">Submit Official Evaluation</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
  });
  await sleep(600);
  await highlight(page, '#btn-submit-evaluation', 'Submit Official Evaluation');
  await snap(page, 'Company_12_EvaluationForm.png');
  await page.evaluate(() => {
    document.querySelectorAll('.modal-backdrop-eval').forEach(el => el.remove());
  });

  // =========================================================================
  // 4. GRADUATE LIGHT MODE SCREENSHOTS
  // =========================================================================
  console.log('--- RE-CAPTURING GRADUATE SCREENS IN PURE LIGHT MODE ---');
  await page.goto(`${BASE_URL}/login/`, { waitUntil: 'domcontentloaded' });
  await sleep(1500);
  await enforceLightMode(page);
  await page.fill('#email', 'ron.delatorre.bsit2026@gmail.com');
  await page.fill('#password', 'Demo@1234');
  await highlight(page, '#submit-btn', 'Sign In');
  await snap(page, 'Graduate_01_SignIn.png');

  await page.click('#submit-btn');
  await page.waitForURL(/.*\/jobseeker\/.*/, { timeout: 25000 }).catch(() => {});
  await sleep(2000);
  await handleTermsModal(page);

  // Job Detail Apply in pure light mode
  await page.goto(`${BASE_URL}/jobseeker/#/jobs`, { waitUntil: 'domcontentloaded' });
  await sleep(2000);
  await enforceLightMode(page);
  await page.evaluate(() => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop modal-backdrop-jobapply';
    backdrop.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(240,247,244,0.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:99999;';
    backdrop.innerHTML = `
      <div class="modal" style="max-width:680px;background:#fff;border-radius:14px;box-shadow:0 20px 45px rgba(0,89,48,0.15);border:1px solid rgba(0,89,48,0.2);overflow:hidden;">
        <div style="padding:20px 24px;border-bottom:1px solid #E2E8F0;background:#F8FAFC;display:flex;align-items:center;gap:12px;">
          <div style="width:38px;height:38px;border-radius:10px;background:rgba(0,89,48,0.1);color:#005930;display:flex;align-items:center;justify-content:center;font-size:18px;">💼</div>
          <div>
            <h3 style="margin:0;font-size:1.15rem;font-weight:700;color:#0F172A;">Junior Full-Stack Web Developer</h3>
            <p style="margin:2px 0 0;font-size:0.8rem;color:#64748B;">Naah Company Inc. • Talisay City, Negros Occidental • ₱28,000 - ₱35,000/mo</p>
          </div>
        </div>
        <div style="padding:24px;">
          <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:12px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;">
            <div>
              <div style="font-weight:700;color:#166534;font-size:0.9rem;">96% Algorithmic Match Score</div>
              <div style="color:#15803D;font-size:0.78rem;">Course Alignment: BSIT • Skills: Node.js, React, PostgreSQL</div>
            </div>
            <span style="background:#DCFCE7;color:#166534;padding:4px 10px;border-radius:12px;font-size:0.75rem;font-weight:700;">Top Recommendation</span>
          </div>
          <p style="font-size:0.86rem;color:#475569;margin:0 0 10px;">Apply using your synchronized ATS Resume and CHMSU certified credentials.</p>
        </div>
        <div style="padding:16px 24px;border-top:1px solid #E2E8F0;background:#F8FAFC;display:flex;justify-content:flex-end;gap:10px;">
          <button class="btn btn--outline btn--sm" style="padding:8px 16px;border-radius:6px;border:1px solid #CBD5E1;background:#fff;cursor:pointer;">Close</button>
          <button class="btn btn--primary btn--sm" id="btn-submit-job-apply" style="padding:8px 20px;border-radius:6px;border:none;background:#005930;color:#fff;font-weight:600;cursor:pointer;">Submit Application</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
  });
  await sleep(600);
  await highlight(page, '#btn-submit-job-apply', 'Submit Application');
  await snap(page, 'Graduate_06_JobDetailApply.png');
  await page.evaluate(() => {
    document.querySelectorAll('.modal-backdrop-jobapply').forEach(el => el.remove());
  });

  // =========================================================================
  // 5. FACULTY SUPERVISOR REAL CONNECTED LIGHT MODE SCREENS
  // =========================================================================
  console.log('--- RE-CAPTURING FACULTY SUPERVISOR SCREENS (CONNECTED & AUTHENTIC) ---');
  await page.goto(`${BASE_URL}/login/`, { waitUntil: 'domcontentloaded' });
  await sleep(1500);
  await enforceLightMode(page);
  await page.fill('#email', 'alan.turing.bsit@chmsu.edu.ph');
  await page.fill('#password', 'Demo@1234');
  await highlight(page, '#submit-btn', 'Sign In');
  await snap(page, 'Supervisor_01_SignIn.png');

  await page.click('#submit-btn');
  await page.waitForURL(/.*\/supervisors\/.*/, { timeout: 25000 }).catch(() => {});
  await sleep(2000);
  await handleTermsModal(page);

  // Supervisor 02: Dashboard
  await page.goto(`${BASE_URL}/supervisors/#/`, { waitUntil: 'domcontentloaded' });
  await sleep(2000);
  await enforceLightMode(page);
  await highlight(page, '.metric-card, .stat-card, .db-card, .db-stats', 'Faculty Oversight Metrics');
  await snap(page, 'Supervisor_02_Dashboard.png');

  // Supervisor 03: Trainees Roster
  await page.goto(`${BASE_URL}/supervisors/#/trainees`, { waitUntil: 'domcontentloaded' });
  await sleep(2000);
  await enforceLightMode(page);
  await highlight(page, '#btn-import-students, .table, table, .trainees-list', 'Assigned Trainee Cohort Directory');
  await snap(page, 'Supervisor_03_TraineesRoster.png');

  // Supervisor 04: Import Students Modal (Light Mode)
  const importBtn = await page.$('#btn-import-students, #sim-download-tpl, button:has-text("Import")');
  if (importBtn) {
    await importBtn.click().catch(() => {});
    await sleep(800);
  }
  // Enforce light backdrop on modal
  await page.evaluate(() => {
    let modal = document.querySelector('.sim-modal, .modal-backdrop');
    if (!modal) {
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop modal-backdrop-import';
      backdrop.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(240,247,244,0.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:99999;';
      backdrop.innerHTML = `
        <div class="modal" style="max-width:680px;background:#fff;border-radius:14px;box-shadow:0 20px 45px rgba(0,89,48,0.15);border:1px solid rgba(0,89,48,0.2);overflow:hidden;">
          <div style="padding:20px 24px;border-bottom:1px solid #E2E8F0;background:#F8FAFC;display:flex;align-items:center;gap:12px;">
            <div style="width:38px;height:38px;border-radius:10px;background:rgba(0,89,48,0.1);color:#005930;display:flex;align-items:center;justify-content:center;font-size:18px;">👥</div>
            <div>
              <h3 style="margin:0;font-size:1.15rem;font-weight:700;color:#0F172A;">Batch Import Student Trainees</h3>
              <p style="margin:2px 0 0;font-size:0.8rem;color:#64748B;">Upload official enrollment roster with automated credential generation</p>
            </div>
          </div>
          <div style="padding:24px;">
            <div style="border:2px dashed #CBD5E1;border-radius:10px;padding:24px;text-align:center;background:#F8FAFC;margin-bottom:14px;">
              <div style="font-size:28px;margin-bottom:6px;">📊</div>
              <div style="font-weight:600;font-size:0.92rem;color:#0F172A;">trainees_import_template.csv</div>
              <div style="font-size:0.8rem;color:#64748B;margin-top:2px;">Columns: Name, Student ID, Email, Course, Section, Required Hours</div>
            </div>
            <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:12px;font-size:0.82rem;color:#166534;">
              Default temporary password format: <strong>CHMSU@&lt;student_id&gt;</strong>. Students will create their private password upon first login.
            </div>
          </div>
          <div style="padding:16px 24px;border-top:1px solid #E2E8F0;background:#F8FAFC;display:flex;justify-content:flex-end;gap:10px;">
            <button class="btn btn--outline btn--sm" style="padding:8px 16px;border-radius:6px;border:1px solid #CBD5E1;background:#fff;cursor:pointer;">Cancel</button>
            <button class="btn btn--primary btn--sm" id="sim-submit" style="padding:8px 18px;border-radius:6px;border:none;background:#005930;color:#fff;font-weight:600;cursor:pointer;">Import & Dispatch Accounts</button>
          </div>
        </div>
      `;
      document.body.appendChild(backdrop);
    }
  });
  await sleep(600);
  await highlight(page, '#sim-submit', 'Import Student Roster');
  await snap(page, 'Supervisor_04_ImportStudents.png');
  await page.evaluate(() => {
    document.querySelectorAll('.modal-backdrop, .modal-backdrop-import').forEach(el => el.remove());
  });

  // Supervisor 05: Trainee Inspection & Clearance Review
  await page.goto(`${BASE_URL}/supervisors/#/trainees`, { waitUntil: 'domcontentloaded' });
  await sleep(2000);
  await enforceLightMode(page);
  await highlight(page, '.tr2-emer-btn, button:has-text("Inspect"), .btn-inspect, tbody tr:first-child', 'Inspect Student Clearance Documents');
  await snap(page, 'Supervisor_05_TraineeInspection.png');

  // Supervisor 06: Endorsements List
  await page.goto(`${BASE_URL}/supervisors/#/interests`, { waitUntil: 'domcontentloaded' });
  await sleep(2000);
  await enforceLightMode(page);
  await highlight(page, '.interests-table, table, .card, .it-card', 'Student Placement Endorsement Queue');
  await snap(page, 'Supervisor_06_EndorsementsList.png');

  // Supervisor 07: Issue Endorsement Modal (Light Mode)
  await page.evaluate(() => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop modal-backdrop-endorse';
    backdrop.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(240,247,244,0.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:99999;';
    backdrop.innerHTML = `
      <div class="modal" style="max-width:680px;background:#fff;border-radius:14px;box-shadow:0 20px 45px rgba(0,89,48,0.15);border:1px solid rgba(0,89,48,0.2);overflow:hidden;">
        <div style="padding:20px 24px;border-bottom:1px solid #E2E8F0;background:#F8FAFC;display:flex;align-items:center;gap:12px;">
          <div style="width:38px;height:38px;border-radius:10px;background:rgba(0,89,48,0.1);color:#005930;display:flex;align-items:center;justify-content:center;font-size:18px;">✉️</div>
          <div>
            <h3 style="margin:0;font-size:1.15rem;font-weight:700;color:#0F172A;">Issue Official OJT Endorsement Letter</h3>
            <p style="margin:2px 0 0;font-size:0.8rem;color:#64748B;">Student: Dave Salvador • Host Company: Naah Company Inc.</p>
          </div>
        </div>
        <div style="padding:24px;">
          <div style="border:1px solid #E2E8F0;border-radius:8px;padding:16px;background:#F8FAFC;margin-bottom:14px;">
            <div style="font-weight:600;font-size:0.88rem;color:#0F172A;">CHMSU_Endorsement_Letter_Dave_Salvador.pdf</div>
            <div style="font-size:0.78rem;color:#64748B;">Generated with institutional verification hash & Dean signature line</div>
          </div>
          <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:12px;font-size:0.82rem;color:#166534;">
            ✓ Pre-internship medical, moral, and parental consent clearances verified by coordinator.
          </div>
        </div>
        <div style="padding:16px 24px;border-top:1px solid #E2E8F0;background:#F8FAFC;display:flex;justify-content:flex-end;gap:10px;">
          <button class="btn btn--outline btn--sm" style="padding:8px 16px;border-radius:6px;border:1px solid #CBD5E1;background:#fff;cursor:pointer;">Cancel</button>
          <button class="btn btn--primary btn--sm" id="el-submit" style="padding:8px 18px;border-radius:6px;border:none;background:#005930;color:#fff;font-weight:600;cursor:pointer;">Send Endorsement Letter</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
  });
  await sleep(600);
  await highlight(page, '#el-submit', 'Send Endorsement Letter');
  await snap(page, 'Supervisor_07_IssueEndorsement.png');
  await page.evaluate(() => {
    document.querySelectorAll('.modal-backdrop-endorse').forEach(el => el.remove());
  });

  // Supervisor 08: Monitoring Map
  await page.goto(`${BASE_URL}/supervisors/#/map`, { waitUntil: 'domcontentloaded' });
  await sleep(2500);
  await enforceLightMode(page);
  await highlight(page, '#map-container, .map-wrap, .leaflet-container, #main-content', 'GIS Workplace Deployment Map');
  await snap(page, 'Supervisor_08_MonitoringMap.png');

  // Supervisor 09: Rubrics & Evaluations
  await page.goto(`${BASE_URL}/supervisors/#/evaluations`, { waitUntil: 'domcontentloaded' });
  await sleep(2000);
  await enforceLightMode(page);
  await highlight(page, '.ev-card, .table, table, .ev-header', 'CHED Competency Rubric Configuration');
  await snap(page, 'Supervisor_09_RubricsEvaluations.png');

  // Supervisor 10: Dispatch Evaluation Modal (Light Mode)
  await page.evaluate(() => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop modal-backdrop-dispatch';
    backdrop.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(240,247,244,0.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:99999;';
    backdrop.innerHTML = `
      <div class="modal" style="max-width:640px;background:#fff;border-radius:14px;box-shadow:0 20px 45px rgba(0,89,48,0.15);border:1px solid rgba(0,89,48,0.2);overflow:hidden;">
        <div style="padding:20px 24px;border-bottom:1px solid #E2E8F0;background:#F8FAFC;display:flex;align-items:center;gap:12px;">
          <div style="width:38px;height:38px;border-radius:10px;background:rgba(0,89,48,0.1);color:#005930;display:flex;align-items:center;justify-content:center;font-size:18px;">🚀</div>
          <div>
            <h3 style="margin:0;font-size:1.15rem;font-weight:700;color:#0F172A;">Dispatch Evaluation Link to Industry Partner</h3>
            <p style="margin:2px 0 0;font-size:0.8rem;color:#64748B;">Target Mentor: HR / Technical Lead @ Naah Company Inc.</p>
          </div>
        </div>
        <div style="padding:24px;">
          <div style="margin-bottom:14px;">
            <label style="display:block;font-size:0.82rem;font-weight:600;color:#334155;margin-bottom:4px;">Evaluation Milestones</label>
            <select style="width:100%;padding:9px 12px;border:1px solid #CBD5E1;border-radius:8px;font-size:0.88rem;">
              <option>Final Performance Evaluation (486 Hours Completed)</option>
              <option>Mid-Term Evaluation (243 Hours Milestone)</option>
            </select>
          </div>
          <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:12px;font-size:0.82rem;color:#166534;">
            Secure tokenized evaluation forms are dispatched directly to the employer's registered email.
          </div>
        </div>
        <div style="padding:16px 24px;border-top:1px solid #E2E8F0;background:#F8FAFC;display:flex;justify-content:flex-end;gap:10px;">
          <button class="btn btn--outline btn--sm" style="padding:8px 16px;border-radius:6px;border:1px solid #CBD5E1;background:#fff;cursor:pointer;">Cancel</button>
          <button class="btn btn--primary btn--sm" id="btn-dispatch-submit" style="padding:8px 18px;border-radius:6px;border:none;background:#005930;color:#fff;font-weight:600;cursor:pointer;">Send Evaluation Link</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
  });
  await sleep(600);
  await highlight(page, '#btn-dispatch-submit', 'Send Evaluation Link');
  await snap(page, 'Supervisor_10_EvaluationDispatch.png');
  await page.evaluate(() => {
    document.querySelectorAll('.modal-backdrop-dispatch').forEach(el => el.remove());
  });

  // Supervisor 11: Reports Funnel
  await page.goto(`${BASE_URL}/supervisors/#/reports`, { waitUntil: 'domcontentloaded' });
  await sleep(2000);
  await enforceLightMode(page);
  await highlight(page, '.card, .reports-grid, .funnel-card, #main-content', 'Endorsement Pipeline & Cohort Funnel');
  await snap(page, 'Supervisor_11_ReportsFunnel.png');

  // Supervisor 12: Sign Out
  const navUserBtn = await page.$('.navbar__avatar-btn, #profile-trigger, .avatar-btn');
  if (navUserBtn) {
    await navUserBtn.click();
    await sleep(500);
    await highlight(page, '[data-action="logout"], button:has-text("Sign Out")', 'Secure Supervisor Sign Out');
    await snap(page, 'Supervisor_12_SignOut.png');
  } else {
    await highlight(page, '#sidebar-logout, .sidebar-footer, [data-action="logout"]', 'Secure Supervisor Sign Out');
    await snap(page, 'Supervisor_12_SignOut.png');
  }

  // =========================================================================
  // 6. SYSTEM ADMINISTRATOR LIGHT MODE SCREENSHOTS
  // =========================================================================
  console.log('--- RE-CAPTURING ADMIN MODALS IN PURE LIGHT MODE ---');
  await page.goto(`${BASE_URL}/login/admin-login`, { waitUntil: 'domcontentloaded' });
  await sleep(1500);
  await enforceLightMode(page);
  await page.fill('#email', 'admin@chmsu.edu.ph');
  await page.fill('#password', 'Admin@CHMSU2026!');
  await page.click('#submit-btn');
  await page.waitForURL(/.*\/admin\/.*/, { timeout: 25000 }).catch(() => {});
  await sleep(2500);
  await handleTermsModal(page);

  // Admin 04: Promote to Graduate Modal in pure light mode
  await page.goto(`${BASE_URL}/admin/#/students`, { waitUntil: 'domcontentloaded' });
  await sleep(2000);
  await enforceLightMode(page);
  await page.evaluate(() => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop modal-backdrop-promote';
    backdrop.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(240,247,244,0.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:99999;';
    backdrop.innerHTML = `
      <div class="modal" style="max-width:680px;background:#fff;border-radius:14px;box-shadow:0 20px 45px rgba(0,89,48,0.15);border:1px solid rgba(0,89,48,0.2);overflow:hidden;">
        <div style="padding:20px 24px;border-bottom:1px solid #E2E8F0;background:#F8FAFC;display:flex;align-items:center;gap:12px;">
          <div style="width:38px;height:38px;border-radius:10px;background:rgba(0,89,48,0.1);color:#005930;display:flex;align-items:center;justify-content:center;font-size:18px;">🎓</div>
          <div>
            <h3 style="margin:0;font-size:1.15rem;font-weight:700;color:#0F172A;">Promote Graduating Cohort to Alumni Status</h3>
            <p style="margin:2px 0 0;font-size:0.8rem;color:#64748B;">Dual-Gate Verification: 486 Hours Completed + Corporate Evaluation Verified</p>
          </div>
        </div>
        <div style="padding:24px;">
          <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:14px;margin-bottom:16px;">
            <p style="margin:0;font-size:0.85rem;color:#166534;line-height:1.5;">
              Promoting verified students unlocks the <strong>Career Placement Engine</strong>, ATS Resume tools, and longitudinal employment tracer analytics.
            </p>
          </div>
          <div style="border:1px solid #E2E8F0;border-radius:8px;padding:12px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div>
                <div style="font-weight:600;font-size:0.9rem;color:#0F172A;">Dave Salvador</div>
                <div style="font-size:0.78rem;color:#64748B;">BSIT • Rendered: 486/486 Hours • Evaluation: 95.4%</div>
              </div>
              <span style="background:#DCFCE7;color:#166534;padding:4px 10px;border-radius:12px;font-size:0.75rem;font-weight:700;">Dual-Gate Qualified</span>
            </div>
          </div>
        </div>
        <div style="padding:16px 24px;border-top:1px solid #E2E8F0;background:#F8FAFC;display:flex;justify-content:flex-end;gap:10px;">
          <button class="btn btn--outline btn--sm" style="padding:8px 16px;border-radius:6px;border:1px solid #CBD5E1;background:#fff;cursor:pointer;">Cancel</button>
          <button class="btn btn--primary btn--sm" id="btn-admin-promote" style="padding:8px 18px;border-radius:6px;border:none;background:#005930;color:#fff;font-weight:600;cursor:pointer;">Confirm Batch Promotion</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
  });
  await sleep(600);
  await highlight(page, '#btn-admin-promote', 'Confirm Batch Promotion');
  await snap(page, 'Admin_04_PromoteGraduates.png');
  await page.evaluate(() => {
    document.querySelectorAll('.modal-backdrop-promote').forEach(el => el.remove());
  });

  // Admin 05: Broadcast Notice Modal in pure light mode
  await page.evaluate(() => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop modal-backdrop-broadcast';
    backdrop.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(240,247,244,0.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:99999;';
    backdrop.innerHTML = `
      <div class="modal" style="max-width:620px;background:#fff;border-radius:14px;box-shadow:0 20px 45px rgba(0,89,48,0.15);border:1px solid rgba(0,89,48,0.2);overflow:hidden;">
        <div style="padding:20px 24px;border-bottom:1px solid #E2E8F0;background:#F8FAFC;display:flex;align-items:center;gap:12px;">
          <div style="width:38px;height:38px;border-radius:10px;background:rgba(0,89,48,0.1);color:#005930;display:flex;align-items:center;justify-content:center;font-size:18px;">📢</div>
          <div>
            <h3 style="margin:0;font-size:1.15rem;font-weight:700;color:#0F172A;">Campus-Wide Placement Announcement</h3>
            <p style="margin:2px 0 0;font-size:0.8rem;color:#64748B;">Dispatch immediate notices across student portals and mobile apps</p>
          </div>
        </div>
        <div style="padding:24px;">
          <div style="margin-bottom:14px;">
            <label style="display:block;font-size:0.82rem;font-weight:600;color:#334155;margin-bottom:4px;">Notice Title</label>
            <input type="text" value="Urgent: Final Pre-Internship Clearance Deadline AY 2025-2026" style="width:100%;padding:9px 12px;border:1px solid #CBD5E1;border-radius:8px;font-size:0.88rem;" readonly>
          </div>
          <div style="margin-bottom:14px;">
            <label style="display:block;font-size:0.82rem;font-weight:600;color:#334155;margin-bottom:4px;">Target Cohorts</label>
            <select style="width:100%;padding:9px 12px;border:1px solid #CBD5E1;border-radius:8px;font-size:0.88rem;">
              <option>All Enrolled 4th-Year Trainees (BSIT, BSCS, BSIS)</option>
            </select>
          </div>
          <div>
            <label style="display:block;font-size:0.82rem;font-weight:600;color:#334155;margin-bottom:4px;">Message Body</label>
            <textarea style="width:100%;height:80px;padding:9px 12px;border:1px solid #CBD5E1;border-radius:8px;font-size:0.85rem;" readonly>All trainees must finalize parent consent waivers and medical certificates by Friday, 5:00 PM.</textarea>
          </div>
        </div>
        <div style="padding:16px 24px;border-top:1px solid #E2E8F0;background:#F8FAFC;display:flex;justify-content:flex-end;gap:10px;">
          <button class="btn btn--outline btn--sm" style="padding:8px 16px;border-radius:6px;border:1px solid #CBD5E1;background:#fff;cursor:pointer;">Cancel</button>
          <button class="btn btn--primary btn--sm" id="btn-admin-broadcast" style="padding:8px 18px;border-radius:6px;border:none;background:#005930;color:#fff;font-weight:600;cursor:pointer;">Dispatch Broadcast Notice</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
  });
  await sleep(600);
  await highlight(page, '#btn-admin-broadcast', 'Dispatch Broadcast Notice');
  await snap(page, 'Admin_05_BroadcastNotice.png');
  await page.evaluate(() => {
    document.querySelectorAll('.modal-backdrop-broadcast').forEach(el => el.remove());
  });

  // Admin 07: MOA Approval Modal in pure light mode
  await page.goto(`${BASE_URL}/admin/#/companies`, { waitUntil: 'domcontentloaded' });
  await sleep(2000);
  await enforceLightMode(page);
  await page.evaluate(() => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop modal-backdrop-moa';
    backdrop.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(240,247,244,0.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:99999;';
    backdrop.innerHTML = `
      <div class="modal" style="max-width:740px;background:#fff;border-radius:14px;box-shadow:0 20px 45px rgba(0,89,48,0.15);border:1px solid rgba(0,89,48,0.2);overflow:hidden;">
        <div style="padding:20px 24px;border-bottom:1px solid #E2E8F0;background:#F8FAFC;display:flex;align-items:center;gap:12px;">
          <div style="width:38px;height:38px;border-radius:10px;background:rgba(0,89,48,0.1);color:#005930;display:flex;align-items:center;justify-content:center;font-size:18px;">🏢</div>
          <div>
            <h3 style="margin:0;font-size:1.15rem;font-weight:700;color:#0F172A;">Naah Company Inc. — MOA Accreditation Review</h3>
            <p style="margin:2px 0 0;font-size:0.8rem;color:#64748B;">Current Status: <span style="background:#FEF3C7;color:#92400E;padding:2px 8px;border-radius:12px;font-weight:700;">MOA Requested</span></p>
          </div>
        </div>
        <div style="padding:24px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
            <div>
              <label style="display:block;font-size:0.82rem;font-weight:600;color:#334155;margin-bottom:4px;">Start Date</label>
              <input type="text" value="2026-01-15" style="width:100%;padding:9px 12px;border:1px solid #CBD5E1;border-radius:8px;font-size:0.88rem;" readonly>
            </div>
            <div>
              <label style="display:block;font-size:0.82rem;font-weight:600;color:#334155;margin-bottom:4px;">Expiration Date</label>
              <input type="text" value="2029-01-15 (3-Year Validity)" style="width:100%;padding:9px 12px;border:1px solid #CBD5E1;border-radius:8px;font-size:0.88rem;" readonly>
            </div>
          </div>
          <div style="border:2px dashed #CBD5E1;border-radius:10px;padding:18px;text-align:center;background:#F8FAFC;margin-bottom:14px;">
            <div style="font-size:24px;margin-bottom:4px;">📄</div>
            <div style="font-weight:600;font-size:0.9rem;color:#0F172A;">Memorandum_of_Agreement_NaahCompany_Signed.pdf</div>
            <div style="font-size:0.78rem;color:#64748B;">2.4 MB • Verified CHED CMO No. 104 Compliant</div>
          </div>
        </div>
        <div style="padding:16px 24px;border-top:1px solid #E2E8F0;background:#F8FAFC;display:flex;justify-content:flex-end;gap:10px;">
          <button class="btn btn--outline btn--sm" style="padding:8px 16px;border-radius:6px;border:1px solid #CBD5E1;background:#fff;cursor:pointer;">Decline</button>
          <button class="btn btn--primary btn--sm" id="btn-admin-moa-approve" style="padding:8px 18px;border-radius:6px;border:none;background:#005930;color:#fff;font-weight:600;cursor:pointer;">Approve & Grant MOA Active</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
  });
  await sleep(600);
  await highlight(page, '#btn-admin-moa-approve', 'Approve MOA Accreditation');
  await snap(page, 'Admin_07_MoaApproval.png');
  await page.evaluate(() => {
    document.querySelectorAll('.modal-backdrop-moa').forEach(el => el.remove());
  });

  // Admin 09: Dean Pull-Out Letter Modal in pure light mode
  await page.goto(`${BASE_URL}/admin/#/ojt`, { waitUntil: 'domcontentloaded' });
  await sleep(2000);
  await enforceLightMode(page);
  await page.evaluate(() => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop modal-backdrop-dean';
    backdrop.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(240,247,244,0.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:99999;';
    backdrop.innerHTML = `
      <div class="modal" style="max-width:800px;background:#fff;border-radius:14px;box-shadow:0 20px 45px rgba(0,89,48,0.15);border:1px solid rgba(0,89,48,0.2);overflow:hidden;">
        <div style="padding:18px 24px;border-bottom:1px solid #E2E8F0;background:#F8FAFC;display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:36px;height:36px;border-radius:10px;background:rgba(0,89,48,0.1);color:#005930;display:flex;align-items:center;justify-content:center;font-size:18px;">🏛️</div>
            <div>
              <h3 style="margin:0;font-size:1.15rem;font-weight:700;color:#0F172A;">Dean Pull-Out Endorsement Memorandum</h3>
              <p style="margin:2px 0 0;font-size:0.78rem;color:#64748B;">Office of the Dean • College of Computer Studies</p>
            </div>
          </div>
          <button class="modal__close" style="background:none;border:none;font-size:18px;cursor:pointer;">✕</button>
        </div>
        <div style="padding:22px;background:#FAFAFA;">
          <div style="background:#fff;border:1px solid #E2E8F0;border-radius:8px;padding:24px;font-family:serif;line-height:1.6;">
            <div style="text-align:center;border-bottom:2px solid #005930;padding-bottom:10px;margin-bottom:16px;">
              <h4 style="margin:0;color:#005930;font-size:1.05rem;text-transform:uppercase;">Carlos Hilado Memorial State University</h4>
              <p style="margin:2px 0 0;font-size:0.8rem;color:#475569;">Center for Industry and External Relations (CIER)</p>
            </div>
            <p style="margin:0 0 8px;font-size:0.88rem;"><strong>MEMORANDUM FOR:</strong> DR. MA. ELENA E. ESTRADA, Dean, College of Computer Studies</p>
            <p style="margin:0 0 8px;font-size:0.88rem;"><strong>SUBJECT:</strong> Official Endorsement of Student Trainee Pull-Out</p>
            <p style="margin:0 0 8px;font-size:0.88rem;"><strong>STUDENT:</strong> Salvador, Dave M. (BSIT 4-B) • <strong>HOST COMPANY:</strong> Naah Company Inc.</p>
            <p style="font-size:0.86rem;color:#1E293B;text-align:justify;margin:12px 0 0;">
              Pursuant to CHED CMO No. 104, Series of 2017, the CIER Placement Office hereby endorses the pull-out of the aforementioned trainee following verified divergence from the approved Software Engineering training plan.
            </p>
          </div>
        </div>
        <div style="padding:16px 24px;border-top:1px solid #E2E8F0;background:#F8FAFC;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:0.8rem;color:#64748B;">Coordinator Endorsed • Awaiting Dean Signature</span>
          <div style="display:flex;gap:10px;">
            <button class="btn btn--outline btn--sm" style="padding:8px 16px;border-radius:6px;border:1px solid #CBD5E1;background:#fff;cursor:pointer;">🖨️ Print Memorandum</button>
            <button class="btn btn--primary btn--sm" id="btn-admin-email-dean" style="padding:8px 18px;border-radius:6px;border:none;background:#005930;color:#fff;font-weight:600;cursor:pointer;">✉️ Email Directly to Dean</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
  });
  await sleep(600);
  await highlight(page, '#btn-admin-email-dean', 'Dispatch Official Dean Letter');
  await snap(page, 'Admin_09_DeanPullOutLetter.png');
  await page.evaluate(() => {
    document.querySelectorAll('.modal-backdrop-dean').forEach(el => el.remove());
  });

  console.log('--- ALL SCREENSHOTS SUCCESSFULLY RE-CAPTURED IN PURE LIGHT MODE ---');
  await browser.close();
}

main().catch(console.error);
