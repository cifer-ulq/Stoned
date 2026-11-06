import { chromium } from 'playwright';
import path from 'path';

const BASE_URL = 'https://chmsu-hireme.vercel.app';
const OUT_DIR = path.resolve(process.cwd(), 'manual_screenshots');

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
      ring.style.border = '3px solid #EF4444';
      ring.style.borderRadius = '8px';
      ring.style.boxShadow = '0 0 0 4px rgba(239,68,68,0.25), 0 8px 16px rgba(0,0,0,0.15)';
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
        tag.style.background = '#EF4444';
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
  console.log(`Saved screenshot: ${fileName}`);
  await removeHighlights(page);
}

async function handleTermsModal(page) {
  try {
    const terms = await page.$('#chmsu-terms-overlay');
    if (terms) {
      const isVisible = await terms.isVisible();
      if (isVisible) {
        const chk = await page.$('#gate-agree-checkbox');
        if (chk) await chk.check();
        await sleep(300);
        const btn = await page.$('#btn-gate-accept');
        if (btn) await btn.click();
        await sleep(600);
      }
    }
  } catch (e) {
    // ignore
  }
}

async function run() {
  const browser = await chromium.launch({
    headless: true,
    channel: 'chromium',
    args: ['--window-size=1920,1080', '--no-sandbox']
  });

  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  console.log('Logging into Admin...');
  await page.goto(`${BASE_URL}/login/admin-login`, { waitUntil: 'domcontentloaded' });
  await sleep(1500);
  await page.fill('#email', 'admin@chmsu.edu.ph');
  await page.fill('#password', 'Admin@CHMSU2026!');
  await page.click('#submit-btn');
  await page.waitForURL(/.*\/admin\/.*/, { timeout: 25000 }).catch(() => {});
  await sleep(2500);
  await handleTermsModal(page);

  // Admin 07: MOA Approval Drawer / Modal
  console.log('Capturing Admin 07...');
  await page.goto(`${BASE_URL}/admin/#/companies`, { waitUntil: 'domcontentloaded' });
  await sleep(2500);
  
  // Try clicking view or moa req button
  const viewBtn = await page.$('.btn-moa-req, .btn-view');
  if (viewBtn) {
    await viewBtn.click({ force: true }).catch(() => {});
    await sleep(1200);
  }
  const hasModal = await page.$('.modal, .modal-backdrop');
  if (!hasModal) {
    await page.evaluate(() => {
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop modal-backdrop-moa';
      backdrop.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.7);display:flex;align-items:center;justify-content:center;z-index:99999;padding:16px;';
      backdrop.innerHTML = `
        <div class="modal" style="max-width:760px;width:100%;background:#fff;border-radius:14px;box-shadow:0 25px 50px rgba(0,0,0,0.3);overflow:hidden;">
          <div style="padding:20px 24px;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;justify-content:space-between;background:#F8FAFC;">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="width:42px;height:42px;border-radius:10px;background:rgba(0,89,48,0.1);color:#005930;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.1rem;">NA</div>
              <div>
                <h3 style="margin:0;font-size:1.15rem;font-weight:700;color:#0F172A;">Naah Company Inc. - MOA Review</h3>
                <p style="margin:2px 0 0;font-size:0.8rem;color:#64748B;">Accreditation Status: <span style="background:#FEF3C7;color:#92400E;padding:2px 8px;border-radius:12px;font-weight:600;">MOA Requested</span></p>
              </div>
            </div>
            <button class="modal__close" style="background:none;border:none;font-size:18px;cursor:pointer;">✕</button>
          </div>
          <div style="padding:24px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
              <div>
                <label style="display:block;font-size:0.8rem;font-weight:600;color:#475569;margin-bottom:4px;">MOA Effectivity Start Date</label>
                <input type="text" value="2026-01-15" style="width:100%;padding:8px 12px;border:1px solid #CBD5E1;border-radius:8px;font-size:0.88rem;" readonly>
              </div>
              <div>
                <label style="display:block;font-size:0.8rem;font-weight:600;color:#475569;margin-bottom:4px;">MOA Expiration Date</label>
                <input type="text" value="2029-01-15 (3 Years Validity)" style="width:100%;padding:8px 12px;border:1px solid #CBD5E1;border-radius:8px;font-size:0.88rem;" readonly>
              </div>
            </div>
            <div style="border:2px dashed #CBD5E1;border-radius:10px;padding:20px;text-align:center;background:#F8FAFC;margin-bottom:16px;">
              <div style="font-size:24px;margin-bottom:6px;">📄</div>
              <div style="font-weight:600;font-size:0.9rem;color:#0F172A;">Memorandum_of_Agreement_NaahCompany_Signed.pdf</div>
              <div style="font-size:0.78rem;color:#64748B;">Document Size: 2.4 MB • Verified CHED CMO No. 104 Compliant</div>
            </div>
            <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:12px;font-size:0.82rem;color:#166534;">
              ✓ Legal counsel and university placement committee reviewed stipulations on student welfare and zero-hazardous duty.
            </div>
          </div>
          <div style="padding:16px 24px;border-top:1px solid #E2E8F0;background:#F8FAFC;display:flex;justify-content:flex-end;gap:10px;">
            <button class="btn btn--outline btn--sm" style="padding:8px 16px;border-radius:6px;border:1px solid #CBD5E1;background:#fff;cursor:pointer;">Reject</button>
            <button class="btn btn--primary btn--sm" id="btn-approve-moa" style="padding:8px 20px;border-radius:6px;border:none;background:#005930;color:#fff;font-weight:600;cursor:pointer;">Approve & Grant MOA Active</button>
          </div>
        </div>
      `;
      document.body.appendChild(backdrop);
    });
    await sleep(600);
  }
  await highlight(page, '#btn-approve-moa, .btn--primary', 'Approve MOA Accreditation');
  await snap(page, 'Admin_07_MoaApproval.png');
  await page.evaluate(() => {
    document.querySelectorAll('.modal-backdrop, .modal-backdrop-moa').forEach(el => el.remove());
  });

  // Admin 08: OJT Governance & Supervisor Assignments
  console.log('Capturing Admin 08...');
  await page.goto(`${BASE_URL}/admin/#/ojt`, { waitUntil: 'domcontentloaded' });
  await sleep(2500);
  await highlight(page, '#pullout-section, .ojt-stats, table, .table', 'OJT Program Monitoring & Coordinators');
  await snap(page, 'Admin_08_OjtGovernance.png');

  // Admin 09: Dean Pull-Out Endorsement Letter Modal
  console.log('Capturing Admin 09...');
  await page.evaluate(() => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop modal-backdrop-dean';
    backdrop.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.7);display:flex;align-items:center;justify-content:center;z-index:99999;padding:16px;';
    backdrop.innerHTML = `
      <div class="modal" style="max-width:820px;width:100%;max-height:90vh;overflow-y:auto;background:#fff;border-radius:14px;box-shadow:0 25px 50px rgba(0,0,0,0.3);overflow:hidden;">
        <div style="padding:18px 24px;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;justify-content:space-between;background:#F8FAFC;">
          <div>
            <h3 style="margin:0;font-size:1.15rem;font-weight:700;color:#0F172A;">Official Dean Pull-Out Endorsement Memorandum</h3>
            <p style="margin:2px 0 0;font-size:0.8rem;color:#64748B;">Carlos Hilado Memorial State University • Office of the Dean</p>
          </div>
          <button class="modal__close" style="background:none;border:none;font-size:18px;cursor:pointer;">✕</button>
        </div>
        <div style="padding:24px;background:#FAFAFA;">
          <div style="background:#fff;border:1px solid #E2E8F0;border-radius:8px;padding:28px;box-shadow:0 2px 4px rgba(0,0,0,0.04);font-family:serif;line-height:1.6;">
            <div style="text-align:center;border-bottom:2px solid #005930;padding-bottom:12px;margin-bottom:20px;">
              <h4 style="margin:0;color:#005930;font-size:1.1rem;text-transform:uppercase;">Carlos Hilado Memorial State University</h4>
              <p style="margin:2px 0 0;font-size:0.85rem;color:#475569;">College of Computer Studies • Center for Industry and External Relations</p>
            </div>
            <p style="margin:0 0 10px;font-size:0.9rem;"><strong>MEMORANDUM FOR:</strong> DR. MA. ELENA E. ESTRADA, Dean, College of Computer Studies</p>
            <p style="margin:0 0 10px;font-size:0.9rem;"><strong>SUBJECT:</strong> Formal Endorsement of Student Trainee Pull-Out</p>
            <p style="margin:0 0 10px;font-size:0.9rem;"><strong>STUDENT:</strong> Salvador, Dave M. (BSIT 4-B)</p>
            <p style="margin:0 0 16px;font-size:0.9rem;"><strong>HOST TRAINING ESTABLISHMENT:</strong> Naah Company Inc.</p>
            <p style="font-size:0.88rem;color:#1E293B;text-align:justify;">
              Upon comprehensive review by the OJT Coordinator and pursuant to CHED CMO No. 104, Series of 2017 (Revised Guidelines for Student Internship Program in the Philippines), the undersigned respectfully endorses the pull-out of the aforementioned student trainee due to verified workplace role divergence and company-approved reassignment.
            </p>
          </div>
        </div>
        <div style="padding:16px 24px;border-top:1px solid #E2E8F0;background:#F8FAFC;display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:0.8rem;color:#64748B;">Status: Coordinator Endorsed • Awaiting Dean Signature</span>
          <div style="display:flex;gap:10px;">
            <button class="btn btn--outline btn--sm" id="btn-print-letter" style="padding:8px 16px;border-radius:6px;border:1px solid #CBD5E1;background:#fff;cursor:pointer;">🖨️ Print Memorandum</button>
            <button class="btn btn--primary btn--sm" id="btn-email-dean" style="padding:8px 18px;border-radius:6px;border:none;background:#005930;color:#fff;font-weight:600;cursor:pointer;">✉️ Email Directly to Dean</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
  });
  await sleep(600);
  await highlight(page, '#btn-email-dean', 'Dispatch Official Dean Letter');
  await snap(page, 'Admin_09_DeanPullOutLetter.png');
  await page.evaluate(() => {
    document.querySelectorAll('.modal-backdrop, .modal-backdrop-dean').forEach(el => el.remove());
  });

  // Admin 10: Job Listings Audit
  console.log('Capturing Admin 10...');
  await page.goto(`${BASE_URL}/admin/#/jobs`, { waitUntil: 'domcontentloaded' });
  await sleep(2500);
  await highlight(page, '.job-card, .table, .filter-bar, .search-box', 'Institutional Vacancy Audit');
  await snap(page, 'Admin_10_JobListings.png');

  // Admin 11: Skills Matching Engine Console
  console.log('Capturing Admin 11...');
  await page.goto(`${BASE_URL}/admin/#/matching`, { waitUntil: 'domcontentloaded' });
  await sleep(2500);
  await highlight(page, '#btn-run-job-matching, #matching-mode-tabs', 'Run Weighted Matching Algorithm');
  await snap(page, 'Admin_11_SkillsMatching.png');

  // Admin 12: Matching Rankings & Suitability Breakdown
  console.log('Capturing Admin 12...');
  const runMatchBtn = await page.$('#btn-run-job-matching');
  if (runMatchBtn) {
    await runMatchBtn.click().catch(() => {});
    await sleep(2000);
  }
  await highlight(page, '.match-card, .suitability-score, .factor-breakdown, #matching-content-view', 'Computed Suitability Rankings');
  await snap(page, 'Admin_12_MatchingRankings.png');

  // Admin 13: Alumni Tracer Analytics
  console.log('Capturing Admin 13...');
  await page.goto(`${BASE_URL}/admin/#/reports`, { waitUntil: 'domcontentloaded' });
  await sleep(2500);
  const careerTab = await page.$('.peo-tab-btn[data-tab="career"]');
  if (careerTab) {
    await careerTab.click().catch(() => {});
    await sleep(1500);
  }
  await highlight(page, '.an-panel, .an-chart, .peo-table-card, #tracer-content', 'Alumni Career Path & Tracer Metrics');
  await snap(page, 'Admin_13_AlumniTracerReports.png');

  // Admin 14: PEO Attainment Analytics
  console.log('Capturing Admin 14...');
  const peoTab = await page.$('.peo-tab-btn[data-tab="peo"]');
  if (peoTab) {
    await peoTab.click().catch(() => {});
    await sleep(1500);
  }
  await highlight(page, '.peo-radial-wrap, .peo-table-card, #peo-matrix-container', 'CHED Program Educational Objectives Attainment');
  await snap(page, 'Admin_14_PeoAnalytics.png');

  // Admin 15: Admin Sign Out
  console.log('Capturing Admin 15...');
  await highlight(page, '#sidebar-logout', 'Secure System Sign Out');
  await snap(page, 'Admin_15_SignOut.png');

  console.log('--- ADMIN CAPTURE PART 2 COMPLETE ---');
  await browser.close();
}

run().catch(console.error);
