import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://chmsu-hireme.vercel.app';
const OUT_DIR = path.resolve('manual_screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const issuesFound = [];

function recordIssue(context, message) {
  issuesFound.push({ context, message, time: new Date().toISOString() });
  console.warn(`[ISSUE] ${context}: ${message}`);
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function highlight(page, selector, label = null) {
  try {
    await page.evaluate(({ sel, lbl }) => {
      // Remove any existing highlights
      document.querySelectorAll('.manual-highlight-box').forEach(el => el.remove());
      const target = document.querySelector(sel);
      if (!target) return;
      
      const rect = target.getBoundingClientRect();
      const box = document.createElement('div');
      box.className = 'manual-highlight-box';
      box.style.position = 'fixed';
      box.style.left = `${rect.left - 4}px`;
      box.style.top = `${rect.top - 4}px`;
      box.style.width = `${rect.width + 8}px`;
      box.style.height = `${rect.height + 8}px`;
      box.style.border = '3px solid #005930';
      box.style.boxShadow = '0 0 15px rgba(0, 89, 48, 0.6), inset 0 0 10px rgba(0, 89, 48, 0.2)';
      box.style.borderRadius = '8px';
      box.style.pointerEvents = 'none';
      box.style.zIndex = '999999';
      box.style.transition = 'all 0.2s ease-in-out';
      
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
        tag.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        box.appendChild(tag);
      }
      
      document.body.appendChild(box);
    }, { sel: selector, lbl: label });
    await sleep(200);
  } catch (err) {
    // Non-critical
  }
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

// Masking PII utility if needed
async function maskPii(page) {
  try {
    await page.evaluate(() => {
      // Find elements that look like real phone numbers or full student IDs and blur them slightly
      const allText = document.querySelectorAll('.student-id, .user-phone, .contact-phone');
      allText.forEach(el => {
        el.style.filter = 'blur(4px)';
      });
    });
  } catch (_) {}
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  console.log('--- STARTING SECTION 0: PUBLIC & ONBOARDING ---');
  
  // Public 01: Landing Page
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await sleep(1000);
  await highlight(page, '.landing-nav__actions .landing-btn--primary', 'Get Started');
  await snap(page, 'Public_01_LandingPage.png');

  // Public 02: Landing Page Roles
  const rolesSection = await page.$('#roles');
  if (rolesSection) {
    await rolesSection.scrollIntoViewIfNeeded();
    await sleep(600);
    await snap(page, 'Public_02_LandingRoles.png');
  }

  // Public 03: Register Form
  await page.goto(`${BASE_URL}/login/?view=signup`, { waitUntil: 'networkidle' });
  await sleep(800);
  await highlight(page, '#submit-btn', 'Create Account');
  await snap(page, 'Public_03_RegisterForm.png');

  // Public 04: Onboarding Role Selection
  await page.goto(`${BASE_URL}/login/onboarding`, { waitUntil: 'networkidle' });
  await sleep(800);
  await highlight(page, '.onb-role-card:first-child', 'Student Role');
  await snap(page, 'Public_04_OnboardingRole.png');

  // Public 05: Onboarding Academic Details
  const studentRoleCard = await page.$('.onb-role-card:first-child');
  if (studentRoleCard) {
    await studentRoleCard.click();
    await sleep(500);
    const nextBtn = await page.$('#btn-next');
    if (nextBtn) await nextBtn.click();
    await sleep(600);
    await highlight(page, '#onb-form', 'Academic Information');
    await snap(page, 'Public_05_OnboardingDetails.png');
  }

  // Public 06: Company Self-Registration
  await page.goto(`${BASE_URL}/login/?view=company-signup`, { waitUntil: 'networkidle' });
  await sleep(800);
  await highlight(page, '#cr-submit-btn', 'Register Company');
  await snap(page, 'Public_06_CompanySignup.png');

  // Public 07: Dedicated Admin Login Gateway
  await page.goto(`${BASE_URL}/login/admin-login`, { waitUntil: 'networkidle' });
  await sleep(800);
  await highlight(page, '#admin-submit-btn', 'Administrator Sign In');
  await snap(page, 'Public_07_AdminLogin.png');

  console.log('--- SECTION 0 COMPLETE ---');

  await browser.close();
}

run().catch(console.error);
