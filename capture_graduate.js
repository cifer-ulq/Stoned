import { chromium } from 'playwright';
import path from 'path';

const BASE_URL = 'https://chmsu-hireme.vercel.app';
const OUT_DIR = path.resolve('manual_screenshots');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function highlight(page, selector, label = null) {
  try {
    await page.evaluate(({ sel, lbl }) => {
      document.querySelectorAll('.manual-highlight-box').forEach(el => el.remove());
      const target = document.querySelector(sel);
      if (!target) return;
      
      const rect = target.getBoundingClientRect();
      const box = document.createElement('div');
      box.className = 'manual-highlight-box';
      box.style.position = 'fixed';
      box.style.left = `${Math.max(0, rect.left - 4)}px`;
      box.style.top = `${Math.max(0, rect.top - 4)}px`;
      box.style.width = `${rect.width + 8}px`;
      box.style.height = `${rect.height + 8}px`;
      box.style.border = '3px solid #005930';
      box.style.boxShadow = '0 0 15px rgba(0, 89, 48, 0.6), inset 0 0 10px rgba(0, 89, 48, 0.2)';
      box.style.borderRadius = '8px';
      box.style.pointerEvents = 'none';
      box.style.zIndex = '999999';
      
      if (lbl) {
        const tag = document.createElement('span');
        tag.textContent = lbl;
        tag.style.position = 'absolute';
        tag.style.top = '-24px';
        tag.style.left = '0';
        tag.style.background = '#005930';
        tag.style.color = '#ffffff';
        tag.style.fontSize = '12px';
        tag.style.fontWeight = 'bold';
        tag.style.padding = '2px 8px';
        tag.style.borderRadius = '4px';
        box.appendChild(tag);
      }
      
      document.body.appendChild(box);
    }, { sel: selector, lbl: label });
    await sleep(250);
  } catch (_) {}
}

async function clearHighlight(page) {
  try {
    await page.evaluate(() => {
      document.querySelectorAll('.manual-highlight-box').forEach(el => el.remove());
    });
  } catch (_) {}
}

async function snap(page, filename) {
  const filePath = path.join(OUT_DIR, filename);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`[SAVED] ${filename}`);
  await clearHighlight(page);
}

async function clearSession(page) {
  try {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await sleep(200);
  } catch (_) {}
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  console.log('=== RESUMING SECTION 4: GRADUATE PORTAL (06-10) ===');
  await clearSession(page);
  await page.goto(`${BASE_URL}/login/`, { waitUntil: 'domcontentloaded' });
  await sleep(800);

  await page.fill('#email', 'ron.delatorre.bsit2026@gmail.com');
  await page.fill('#password', 'Demo@1234');
  await page.click('#submit-btn');
  await page.waitForURL('**/jobseeker/**', { timeout: 15000 });
  await sleep(2000);

  // Check terms modal if any
  const termsOverlay = await page.$('#chmsu-terms-overlay');
  if (termsOverlay && await termsOverlay.isVisible()) {
    const chk = await page.$('#gate-agree-checkbox');
    if (chk) await chk.check();
    await sleep(300);
    const acceptBtn = await page.$('#btn-gate-accept');
    if (acceptBtn) await acceptBtn.click();
    await sleep(1500);
  }

  // 4.6 Job Detail & Apply Modal
  await page.goto(`${BASE_URL}/jobseeker/#/jobs`, { waitUntil: 'domcontentloaded' });
  await sleep(1500);
  const firstJobCard = await page.$('article.jm-card');
  if (firstJobCard) {
    await firstJobCard.click({ force: true });
    await sleep(1000);
    await highlight(page, '#job-detail-modal .modal, .modal-box', 'Job Overview & Application');
    await snap(page, 'Graduate_06_JobDetailApply.png');
    await page.evaluate(() => document.querySelectorAll('.modal-overlay, .modal-backdrop').forEach(el => el.remove()));
    await sleep(500);
  } else {
    await snap(page, 'Graduate_06_JobDetailApply.png');
  }

  // 4.7 Applications Pipeline
  await page.goto(`${BASE_URL}/jobseeker/#/applications`, { waitUntil: 'domcontentloaded' });
  await sleep(1500);
  await highlight(page, '.ap-stage, .application-card, .status-pill, .ap-header', 'Application Stage Progression');
  await snap(page, 'Graduate_07_ApplicationPipeline.png');

  // 4.8 Offer Decision
  await highlight(page, '.ap-card, .application-card, table, .main-content', 'Formal Job Offer Decision');
  await snap(page, 'Graduate_08_OfferDecision.png');

  // 4.9 Interview Schedule
  await page.goto(`${BASE_URL}/jobseeker/#/interview`, { waitUntil: 'domcontentloaded' });
  await sleep(1500);
  await highlight(page, '.interview-card, .session-box, table, .main-content', 'Upcoming Employer Interviews');
  await snap(page, 'Graduate_09_InterviewSchedule.png');

  // 4.10 Graduate Sign Out
  const navUserBtn = await page.$('#profile-trigger, .navbar__avatar-btn');
  if (navUserBtn) {
    await navUserBtn.click();
    await sleep(500);
    await highlight(page, 'button[data-action="logout"]', 'Sign Out');
    await snap(page, 'Graduate_10_SignOut.png');
    const logoutBtn = await page.$('button[data-action="logout"]');
    if (logoutBtn) await logoutBtn.click();
    await sleep(1000);
  }

  console.log('--- SECTION 4 COMPLETE ---');
  await browser.close();
}

main().catch(console.error);
