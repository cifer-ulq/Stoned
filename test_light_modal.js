import { chromium } from 'playwright';
import path from 'path';

const BASE_URL = 'https://chmsu-hireme.vercel.app';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto(`${BASE_URL}/login/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  
  // Set light theme explicitly
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('hireme-theme', 'light');
  });

  await page.fill('#email', 'dave.salvador.bsit4b@chmsu.edu.ph');
  await page.fill('#password', 'Demo@1234');
  await page.click('#submit-btn');
  await page.waitForURL(/.*\/main\/.*/, { timeout: 25000 }).catch(() => {});
  await page.waitForTimeout(2000);

  // Check if terms overlay appears
  const terms = await page.$('#chmsu-terms-overlay');
  if (terms) {
    // Apply light modal backdrop style
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.id = 'qa-light-modals';
      style.innerHTML = `
        .modal-backdrop, .modal-overlay, #chmsu-terms-overlay, [class*="backdrop"] {
          background: rgba(240, 247, 244, 0.65) !important;
          backdrop-filter: blur(4px) !important;
        }
        .modal, .drawer, .modal-dialog, [class*="-modal"] {
          box-shadow: 0 20px 45px rgba(0, 89, 48, 0.18), 0 4px 12px rgba(0, 0, 0, 0.08) !important;
          border: 1px solid rgba(0, 89, 48, 0.25) !important;
        }
      `;
      document.head.appendChild(style);
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test_light_terms.png' });
    console.log('Saved test_light_terms.png');
  }

  await browser.close();
}

test().catch(console.error);
