/**
 * CHMSU HireMe — Partner Companies Directory (Student Portal)
 * Professional UI/UX redesign with grid/list views, dynamic category filters,
 * live search, stats banner, and rich company cards.
 */
import { icon } from '../components/icons.js';
import { apiGet } from '../api/client.js';
import { navigate } from '../router.js';

let currentView = 'grid'; // 'grid' | 'list'
let searchQuery = '';
let selectedCategory = 'all';
let sortBy = 'name';

function logoSrc(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `http://localhost:8000${url}`;
}

const GRADIENTS = [
  'linear-gradient(135deg, #064e3b 0%, #005930 50%, #047857 100%)', // Signature CHMSU Emerald
  'linear-gradient(135deg, #022c22 0%, #065f46 50%, #059669 100%)', // Deep Pine
  'linear-gradient(135deg, #064e3b 0%, #0f766e 50%, #14b8a6 100%)', // Marine Forest
  'linear-gradient(135deg, #0f172a 0%, #064e3b 50%, #005930 100%)', // Midnight Emerald
  'linear-gradient(135deg, #14532d 0%, #15803d 50%, #16a34a 100%)', // Lush Forest
  'linear-gradient(135deg, #134e4a 0%, #065f46 50%, #047857 100%)'  // Deep Teal
];

const AVATAR_PALETTES = [
  { bg: '#e6f4ea', text: '#005930', border: '#b7e1cd' }, // CHMSU Mint
  { bg: '#e8f0fe', text: '#1a73e8', border: '#aecbfa' }, // Google Blue
  { bg: '#f3e8fd', text: '#7627bb', border: '#d7aefb' }, // Royal Violet
  { bg: '#e0f2fe', text: '#0284c7', border: '#bae6fd' }, // Sky Blue
  { bg: '#fef3c7', text: '#b45309', border: '#fde68a' }, // Amber
  { bg: '#ccfbf1', text: '#0f766e', border: '#99f6e4' }, // Teal
];

export async function renderCompanies(container) {
  // Skeleton Loading View
  container.innerHTML = `
    <div class="cp-page-wrap animate-fade-in" style="max-width: 1200px; margin: 0 auto; padding-bottom: 40px;">
      <!-- Hero Skeleton -->
      <div style="background: var(--bg-elevated); border: 1px solid var(--border-default); border-radius: 16px; padding: 28px; margin-bottom: 24px;">
        <div class="skeleton" style="width: 220px; height: 32px; border-radius: 8px; margin-bottom: 10px;"></div>
        <div class="skeleton" style="width: 380px; height: 18px; border-radius: 6px; margin-bottom: 24px;"></div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px;">
          <div class="skeleton" style="height: 64px; border-radius: 12px;"></div>
          <div class="skeleton" style="height: 64px; border-radius: 12px;"></div>
          <div class="skeleton" style="height: 64px; border-radius: 12px;"></div>
        </div>
      </div>
      <!-- Cards Skeleton -->
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px;">
        ${[1, 2, 3, 4, 5, 6].map(() => `<div class="skeleton skeleton--card" style="height: 240px; border-radius: 16px;"></div>`).join('')}
      </div>
    </div>
  `;

  const res = await apiGet('/companies');
  const companies = res?.data || [];

  if (!companies.length) {
    container.innerHTML = `
      <div class="cp-page-wrap animate-fade-in" style="max-width: 1200px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; background: var(--bg-elevated); border: 1px solid var(--border-default); border-radius: 20px; padding: 60px 24px;">
          <div style="width: 80px; height: 80px; margin: 0 auto 20px; border-radius: 24px; background: var(--color-primary-bg); color: var(--color-primary); display: flex; align-items: center; justify-content: center;">
            ${icon('briefcase', 38)}
          </div>
          <h2 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 8px; color: var(--text-primary);">No Partner Companies Yet</h2>
          <p style="color: var(--text-secondary); max-width: 440px; margin: 0 auto 24px; line-height: 1.6;">
            Accredited industry partners and employers will appear here once they complete their onboarding and job postings.
          </p>
        </div>
      </div>
    `;
    return;
  }

  // Extract Categories
  const categoriesMap = {};
  companies.forEach(c => {
    const type = (c.company_type || 'General').trim();
    categoriesMap[type] = (categoriesMap[type] || 0) + 1;
  });
  const categories = Object.keys(categoriesMap).sort();

  // Aggregate Stats
  const totalCompanies = companies.length;
  const totalOpenJobs = companies.reduce((acc, c) => acc + (c.open_jobs_count || 0), 0);
  const totalOpenOjt = companies.reduce((acc, c) => acc + (c.open_ojt_count || 0), 0);

  function getFilteredCompanies() {
    const q = searchQuery.toLowerCase().trim();
    let list = companies.filter(c => {
      const matchSearch = !q ||
        (c.company_name || '').toLowerCase().includes(q) ||
        (c.company_type || '').toLowerCase().includes(q) ||
        (c.company_location || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q);

      const matchCategory = selectedCategory === 'all' || (c.company_type || '').trim() === selectedCategory;

      return matchSearch && matchCategory;
    });

    // Sort
    if (sortBy === 'name') {
      list.sort((a, b) => (a.company_name || '').localeCompare(b.company_name || ''));
    } else if (sortBy === 'jobs') {
      list.sort((a, b) => (b.open_jobs_count || 0) - (a.open_jobs_count || 0));
    } else if (sortBy === 'ojt') {
      list.sort((a, b) => (b.open_ojt_count || 0) - (a.open_ojt_count || 0));
    }

    return list;
  }

  function renderUI() {
    const filtered = getFilteredCompanies();

    container.innerHTML = `
      <div class="cp-page-wrap animate-fade-in" style="max-width: 1200px; margin: 0 auto; padding-bottom: 40px;">
        
        <!-- Hero Header with Stats -->
        <header class="cp-hero" style="background: var(--bg-elevated); border: 1px solid var(--border-default); border-radius: 20px; padding: 28px 32px; margin-bottom: 24px; position: relative; overflow: hidden; box-shadow: var(--shadow-sm);">
          <div style="position: absolute; right: -40px; top: -40px; width: 220px; height: 220px; background: radial-gradient(circle, var(--color-primary-bg) 0%, transparent 70%); pointer-events: none; border-radius: 50%;"></div>

          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 20px; margin-bottom: 24px;">
            <div>
              <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: var(--color-primary-bg); color: var(--color-primary); border-radius: 999px; font-size: 0.78rem; font-weight: 600; margin-bottom: 10px; letter-spacing: 0.02em;">
                ${icon('shieldCheck', 14)} VERIFIED PARTNER DIRECTORY
              </div>
              <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--text-primary); margin: 0 0 8px; letter-spacing: -0.02em; font-family: var(--font-heading);">
                Partner Companies
              </h1>
              <p style="color: var(--text-secondary); margin: 0; font-size: 0.95rem; max-width: 600px; line-height: 1.5;">
                Explore industry-leading corporate partners, view verified workplace details, and apply directly to open jobs and OJT programs.
              </p>
            </div>

            <!-- Stats Bar -->
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
              <div style="background: var(--bg-secondary); border: 1px solid var(--border-default); border-radius: 12px; padding: 10px 18px; display: flex; align-items: center; gap: 12px;">
                <div style="width: 36px; height: 36px; border-radius: 10px; background: var(--color-primary-bg); color: var(--color-primary); display: flex; align-items: center; justify-content: center;">
                  ${icon('briefcase', 18)}
                </div>
                <div>
                  <div style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary); line-height: 1;">${totalCompanies}</div>
                  <div style="font-size: 0.72rem; color: var(--text-secondary); font-weight: 500; margin-top: 2px;">Partners</div>
                </div>
              </div>

              <div style="background: var(--bg-secondary); border: 1px solid var(--border-default); border-radius: 12px; padding: 10px 18px; display: flex; align-items: center; gap: 12px;">
                <div style="width: 36px; height: 36px; border-radius: 10px; background: var(--color-success-bg); color: var(--color-success); display: flex; align-items: center; justify-content: center;">
                  ${icon('zap', 18)}
                </div>
                <div>
                  <div style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary); line-height: 1;">${totalOpenJobs}</div>
                  <div style="font-size: 0.72rem; color: var(--text-secondary); font-weight: 500; margin-top: 2px;">Open Jobs</div>
                </div>
              </div>

              <div style="background: var(--bg-secondary); border: 1px solid var(--border-default); border-radius: 12px; padding: 10px 18px; display: flex; align-items: center; gap: 12px;">
                <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(175, 82, 222, 0.12); color: #af52de; display: flex; align-items: center; justify-content: center;">
                  ${icon('graduationCap', 18)}
                </div>
                <div>
                  <div style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary); line-height: 1;">${totalOpenOjt}</div>
                  <div style="font-size: 0.72rem; color: var(--text-secondary); font-weight: 500; margin-top: 2px;">OJT Postings</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Search & Filter Controls -->
          <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center; padding-top: 20px; border-top: 1px solid var(--border-default);">
            
            <!-- Search Input -->
            <div style="flex: 1; min-width: 260px; position: relative;">
              <span style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-tertiary); display: flex; pointer-events: none;">
                ${icon('search', 17)}
              </span>
              <input
                id="cp-search-input"
                type="text"
                placeholder="Search by company name, industry, or location..."
                value="${searchQuery}"
                style="width: 100%; height: 44px; padding: 0 38px 0 42px; border-radius: 12px; border: 1.5px solid var(--border-default); background: var(--bg-secondary); color: var(--text-primary); font-size: 0.9rem; font-family: var(--font-body); outline: none; transition: all 0.2s;"
              />
              ${searchQuery ? `
                <button id="cp-clear-search" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-tertiary); cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; font-size: 14px;">
                  ✕
                </button>
              ` : ''}
            </div>

            <!-- Sort Dropdown -->
            <div style="position: relative;">
              <select
                id="cp-sort-select"
                style="height: 44px; padding: 0 34px 0 14px; border-radius: 12px; border: 1.5px solid var(--border-default); background: var(--bg-secondary); color: var(--text-primary); font-size: 0.86rem; font-weight: 500; font-family: var(--font-body); outline: none; cursor: pointer; appearance: none; -webkit-appearance: none;"
              >
                <option value="name" ${sortBy === 'name' ? 'selected' : ''}>Sort: Company Name (A-Z)</option>
                <option value="jobs" ${sortBy === 'jobs' ? 'selected' : ''}>Sort: Most Open Jobs</option>
                <option value="ojt" ${sortBy === 'ojt' ? 'selected' : ''}>Sort: Most OJT Postings</option>
              </select>
              <span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: var(--text-tertiary); pointer-events: none; display: flex;">
                ${icon('chevronDown', 14)}
              </span>
            </div>

            <!-- View Switcher (Grid / List) -->
            <div style="display: flex; background: var(--bg-secondary); border: 1px solid var(--border-default); border-radius: 12px; padding: 3px;">
              <button
                id="cp-view-grid"
                title="Grid View"
                style="height: 36px; width: 38px; border-radius: 9px; border: none; background: ${currentView === 'grid' ? 'var(--bg-elevated)' : 'transparent'}; color: ${currentView === 'grid' ? 'var(--color-primary)' : 'var(--text-tertiary)'}; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: ${currentView === 'grid' ? 'var(--shadow-sm)' : 'none'}; transition: all 0.2s;"
              >
                ${icon('layers', 17)}
              </button>
              <button
                id="cp-view-list"
                title="List View"
                style="height: 36px; width: 38px; border-radius: 9px; border: none; background: ${currentView === 'list' ? 'var(--bg-elevated)' : 'transparent'}; color: ${currentView === 'list' ? 'var(--color-primary)' : 'var(--text-tertiary)'}; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: ${currentView === 'list' ? 'var(--shadow-sm)' : 'none'}; transition: all 0.2s;"
              >
                ${icon('menu', 17)}
              </button>
            </div>

          </div>

          <!-- Category Chips -->
          <div style="display: flex; gap: 8px; overflow-x: auto; padding-top: 16px; margin-top: 14px; border-top: 1px solid var(--border-default); scrollbar-width: none; -ms-overflow-style: none;">
            <button
              class="cp-cat-btn"
              data-cat="all"
              style="white-space: nowrap; padding: 6px 14px; border-radius: 999px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s; border: 1px solid ${selectedCategory === 'all' ? 'var(--color-primary)' : 'var(--border-default)'}; background: ${selectedCategory === 'all' ? 'var(--color-primary)' : 'var(--bg-secondary)'}; color: ${selectedCategory === 'all' ? '#fff' : 'var(--text-secondary)'};"
            >
              All Partners (${totalCompanies})
            </button>
            ${categories.map(cat => `
              <button
                class="cp-cat-btn"
                data-cat="${cat}"
                style="white-space: nowrap; padding: 6px 14px; border-radius: 999px; font-size: 0.8rem; font-weight: 500; cursor: pointer; transition: all 0.2s; border: 1px solid ${selectedCategory === cat ? 'var(--color-primary)' : 'var(--border-default)'}; background: ${selectedCategory === cat ? 'var(--color-primary)' : 'var(--bg-secondary)'}; color: ${selectedCategory === cat ? '#fff' : 'var(--text-secondary)'};"
              >
                ${cat} (${categoriesMap[cat]})
              </button>
            `).join('')}
          </div>

        </header>

        <!-- Result Info Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding: 0 4px;">
          <span style="font-size: 0.88rem; color: var(--text-secondary); font-weight: 500;">
            Showing <strong style="color: var(--text-primary);">${filtered.length}</strong> ${filtered.length === 1 ? 'company' : 'companies'}
            ${selectedCategory !== 'all' ? ` in <strong style="color: var(--color-primary);">${selectedCategory}</strong>` : ''}
            ${searchQuery ? ` matching "<em>${searchQuery}</em>"` : ''}
          </span>
          ${(searchQuery || selectedCategory !== 'all') ? `
            <button id="cp-reset-all" style="background: none; border: none; color: var(--color-primary); font-size: 0.82rem; font-weight: 600; cursor: pointer; padding: 4px 8px;">
              Reset Filters
            </button>
          ` : ''}
        </div>

        <!-- Directory Container -->
        <div id="cp-cards-container">
          ${filtered.length > 0
            ? (currentView === 'grid' ? renderGrid(filtered) : renderList(filtered))
            : renderEmptyState()
          }
        </div>

      </div>
    `;

    bindEvents();
  }

  function renderGrid(list) {
    return `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px;">
        ${list.map((c, i) => companyCardGrid(c, i)).join('')}
      </div>
    `;
  }

  function renderList(list) {
    return `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        ${list.map((c, i) => companyCardList(c, i)).join('')}
      </div>
    `;
  }

  function companyCardGrid(c, idx) {
    const initial = (c.company_name || 'C')[0].toUpperCase();
    const gradient = GRADIENTS[idx % GRADIENTS.length];
    const palette = AVATAR_PALETTES[idx % AVATAR_PALETTES.length];
    const logo = logoSrc(c.logo_url);
    const jobsCount = c.open_jobs_count || 0;
    const ojtCount = c.open_ojt_count || 0;

    return `
      <article
        class="cp-card cp-card--grid animate-fade-in-up"
        data-company-id="${c.id}"
        style="--enter-delay: ${idx * 40}ms; background: var(--bg-elevated); border: 1px solid var(--border-default); border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; cursor: pointer; transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 2px 8px rgba(0,0,0,0.04); position: relative;"
      >
        <!-- Card Cover Header -->
        <div style="height: 76px; background: ${gradient}; position: relative;">
          <!-- Subtle Decorative Pattern/Overlay -->
          <div style="position: absolute; inset: 0; background: radial-gradient(circle at top right, rgba(255,255,255,0.18), transparent 70%); pointer-events: none;"></div>
          <!-- Verified Partner Badge -->
          <div style="position: absolute; right: 14px; top: 12px; display: inline-flex; align-items: center; gap: 5px; padding: 4px 11px; background: rgba(255,255,255,0.94); backdrop-filter: blur(8px); border-radius: 999px; color: #047857; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.02em; box-shadow: 0 2px 8px rgba(0,0,0,0.12);">
            ${icon('checkCircle', 12)} Verified Partner
          </div>
        </div>

        <!-- Card Body -->
        <div style="padding: 0 20px 20px; display: flex; flex-direction: column; flex: 1;">
          
          <!-- Top Row: Logo & Opportunities Badges -->
          <div style="margin-top: -34px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: flex-end; gap: 12px;">
            <!-- Logo Frame (High Contrast) -->
            <div style="width: 64px; height: 64px; border-radius: 16px; background: #ffffff; border: 3px solid #ffffff; box-shadow: 0 6px 16px -2px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.06); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; z-index: 2;">
              ${logo
                ? `<img src="${logo}" alt="${c.company_name}" style="width: 100%; height: 100%; object-fit: contain; padding: 4px;" onerror="this.style.display='none';this.parentElement.style.background='${palette.bg}';this.parentElement.innerHTML='<span style=\\'color:${palette.text};font-size:1.55rem;font-weight:800;font-family:var(--font-heading,inherit);\\'>${initial}</span>'"/>`
                : `<div style="width: 100%; height: 100%; background: ${palette.bg}; color: ${palette.text}; border: 1px solid ${palette.border}; border-radius: 13px; display: flex; align-items: center; justify-content: center; font-size: 1.55rem; font-weight: 800; font-family: var(--font-heading, inherit);">${initial}</div>`
              }
            </div>

            <!-- Opportunities Badges on Right -->
            <div style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; align-items: center; margin-bottom: 2px;">
              ${ojtCount > 0 ? `
                <span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; background: rgba(0, 89, 48, 0.08); color: #005930; border: 1px solid rgba(0, 89, 48, 0.2); border-radius: 20px; font-size: 0.74rem; font-weight: 700;">
                  ${icon('graduationCap', 12)} ${ojtCount} OJT
                </span>
              ` : ''}
              ${jobsCount > 0 ? `
                <span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; background: rgba(37, 99, 235, 0.08); color: #2563eb; border: 1px solid rgba(37, 99, 235, 0.2); border-radius: 20px; font-size: 0.74rem; font-weight: 700;">
                  ${icon('briefcase', 12)} ${jobsCount} ${jobsCount === 1 ? 'Job' : 'Jobs'}
                </span>
              ` : ''}
              ${ojtCount === 0 && jobsCount === 0 ? `
                <span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; background: var(--bg-secondary); color: var(--text-tertiary); border: 1px solid var(--border-default); border-radius: 20px; font-size: 0.72rem; font-weight: 600;">
                  Partner
                </span>
              ` : ''}
            </div>
          </div>

          <!-- Company Details -->
          <h3 class="cp-card__title" style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary); margin: 0 0 8px; line-height: 1.35; letter-spacing: -0.01em; transition: color 0.2s;">
            ${c.company_name}
          </h3>

          <!-- Tags / Meta -->
          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;">
            ${c.company_type ? `
              <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.75rem; font-weight: 600; color: var(--color-primary); background: rgba(0, 89, 48, 0.06); padding: 3px 9px; border-radius: 6px;">
                ${icon('briefcase', 11)} ${c.company_type}
              </span>
            ` : ''}
            ${c.company_location ? `
              <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.75rem; font-weight: 500; color: var(--text-secondary); background: var(--bg-secondary); padding: 3px 9px; border-radius: 6px;">
                ${icon('mapPin', 11)} ${c.company_location}
              </span>
            ` : ''}
            ${c.company_size ? `
              <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.75rem; font-weight: 500; color: var(--text-secondary); background: var(--bg-secondary); padding: 3px 9px; border-radius: 6px;">
                ${icon('users', 11)} ${c.company_size}
              </span>
            ` : ''}
          </div>

          <!-- Description Snippet -->
          <p style="font-size: 0.84rem; color: var(--text-secondary); line-height: 1.55; margin: 0 0 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.6em; flex: 1;">
            ${c.description || 'Accredited company profile on CHMSU HireMe. Click to view open career paths and workplace information.'}
          </p>

          <!-- Card Action Footer -->
          <div style="padding-top: 14px; border-top: 1px solid var(--border-default); display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.76rem; color: var(--text-tertiary); font-weight: 500; display: inline-flex; align-items: center; gap: 5px;">
              ${c.year_founded ? `${icon('calendar', 11)} Est. ${c.year_founded}` : `${icon('shield', 11)} Verified Partner`}
            </span>
            <span class="cp-card-btn" style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.84rem; font-weight: 700; color: var(--color-primary); transition: transform 0.2s;">
              View Company ${icon('arrowRight', 14)}
            </span>
          </div>

        </div>
      </article>
    `;
  }

  function companyCardList(c, idx) {
    const initial = (c.company_name || 'C')[0].toUpperCase();
    const palette = AVATAR_PALETTES[idx % AVATAR_PALETTES.length];
    const logo = logoSrc(c.logo_url);
    const jobsCount = c.open_jobs_count || 0;
    const ojtCount = c.open_ojt_count || 0;

    return `
      <article
        class="cp-card cp-card--list animate-fade-in-up"
        data-company-id="${c.id}"
        style="--enter-delay: ${idx * 30}ms; background: var(--bg-elevated); border: 1px solid var(--border-default); border-radius: 18px; padding: 18px 24px; display: flex; align-items: center; gap: 20px; cursor: pointer; transition: all 0.25s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.03);"
      >
        <!-- Logo -->
        <div style="width: 58px; height: 58px; border-radius: 15px; background: #ffffff; border: 2px solid var(--border-default); box-shadow: 0 3px 10px rgba(0,0,0,0.06); display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden;">
          ${logo
            ? `<img src="${logo}" alt="${c.company_name}" style="width: 100%; height: 100%; object-fit: contain; padding: 4px;" onerror="this.style.display='none';this.parentElement.style.background='${palette.bg}';this.parentElement.innerHTML='<span style=\\'color:${palette.text};font-size:1.4rem;font-weight:800;\\'>${initial}</span>'" />`
            : `<div style="width: 100%; height: 100%; background: ${palette.bg}; color: ${palette.text}; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: 800; font-family: var(--font-heading, inherit);">${initial}</div>`}
        </div>

        <!-- Info -->
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <h3 class="cp-card__title" style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin: 0; transition: color 0.2s;">${c.company_name}</h3>
            <span style="color: var(--color-primary); display: flex;" title="Verified Employer">${icon('checkCircle', 14)}</span>
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 6px;">
            ${c.company_type ? `<span style="background: rgba(0,89,48,0.06); color: var(--color-primary); padding: 2px 8px; border-radius: 5px; font-weight: 600;">${icon('briefcase', 11)} ${c.company_type}</span>` : ''}
            ${c.company_location ? `<span style="background: var(--bg-secondary); padding: 2px 8px; border-radius: 5px;">${icon('mapPin', 11)} ${c.company_location}</span>` : ''}
            ${c.company_size ? `<span style="background: var(--bg-secondary); padding: 2px 8px; border-radius: 5px;">${icon('users', 11)} ${c.company_size}</span>` : ''}
          </div>

          <p style="font-size: 0.84rem; color: var(--text-secondary); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 650px;">
            ${c.description || 'Accredited company profile on CHMSU HireMe.'}
          </p>
        </div>

        <!-- Openings Badges & Button -->
        <div style="display: flex; align-items: center; gap: 14px; flex-shrink: 0;">
          <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-end;">
            ${ojtCount > 0 ? `
              <span style="padding: 3px 10px; background: rgba(0, 89, 48, 0.08); color: #005930; border: 1px solid rgba(0, 89, 48, 0.2); border-radius: 12px; font-size: 0.74rem; font-weight: 700;">
                ${icon('graduationCap', 11)} ${ojtCount} OJT Slots
              </span>
            ` : ''}
            ${jobsCount > 0 ? `
              <span style="padding: 3px 10px; background: rgba(37, 99, 235, 0.08); color: #2563eb; border: 1px solid rgba(37, 99, 235, 0.2); border-radius: 12px; font-size: 0.74rem; font-weight: 700;">
                ${icon('briefcase', 11)} ${jobsCount} Open ${jobsCount === 1 ? 'Job' : 'Jobs'}
              </span>
            ` : ''}
          </div>

          <div class="cp-card-arrow" style="width: 36px; height: 36px; border-radius: 10px; background: var(--bg-secondary); color: var(--text-tertiary); display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
            ${icon('chevronRight', 18)}
          </div>
        </div>
      </article>
    `;
  }

  function renderEmptyState() {
    return `
      <div style="text-align: center; background: var(--bg-elevated); border: 1px solid var(--border-default); border-radius: 20px; padding: 50px 20px;">
        <div style="width: 64px; height: 64px; margin: 0 auto 16px; border-radius: 20px; background: var(--bg-secondary); color: var(--text-tertiary); display: flex; align-items: center; justify-content: center;">
          ${icon('search', 28)}
        </div>
        <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--text-primary); margin: 0 0 6px;">No Matching Companies Found</h3>
        <p style="color: var(--text-secondary); font-size: 0.9rem; max-width: 380px; margin: 0 auto 18px;">
          We couldn't find any partners matching your search or category filter. Try clearing your filters or search query.
        </p>
        <button id="cp-reset-btn" class="btn btn--primary btn--sm" style="padding: 8px 18px; border-radius: 10px;">
          Clear All Filters
        </button>
      </div>
    `;
  }

  function bindEvents() {
    // Search input
    const searchInput = container.querySelector('#cp-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        searchQuery = e.target.value;
        const containerCards = container.querySelector('#cp-cards-container');
        if (containerCards) {
          const filtered = getFilteredCompanies();
          containerCards.innerHTML = filtered.length > 0
            ? (currentView === 'grid' ? renderGrid(filtered) : renderList(filtered))
            : renderEmptyState();
          bindCardClicks();
        }
      });
      // Focus style
      searchInput.addEventListener('focus', () => {
        searchInput.style.borderColor = 'var(--color-primary)';
        searchInput.style.boxShadow = '0 0 0 3px var(--color-primary-bg)';
        searchInput.style.background = 'var(--bg-elevated)';
      });
      searchInput.addEventListener('blur', () => {
        searchInput.style.borderColor = 'var(--border-default)';
        searchInput.style.boxShadow = 'none';
        searchInput.style.background = 'var(--bg-secondary)';
      });
    }

    // Clear search
    container.querySelector('#cp-clear-search')?.addEventListener('click', () => {
      searchQuery = '';
      renderUI();
    });

    // Reset filters
    container.querySelector('#cp-reset-all')?.addEventListener('click', () => {
      searchQuery = '';
      selectedCategory = 'all';
      renderUI();
    });
    container.querySelector('#cp-reset-btn')?.addEventListener('click', () => {
      searchQuery = '';
      selectedCategory = 'all';
      renderUI();
    });

    // Category buttons
    container.querySelectorAll('.cp-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedCategory = btn.dataset.cat;
        renderUI();
      });
    });

    // Sort select
    const sortSelect = container.querySelector('#cp-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', e => {
        sortBy = e.target.value;
        renderUI();
      });
    }

    // View toggles
    container.querySelector('#cp-view-grid')?.addEventListener('click', () => {
      if (currentView !== 'grid') {
        currentView = 'grid';
        renderUI();
      }
    });
    container.querySelector('#cp-view-list')?.addEventListener('click', () => {
      if (currentView !== 'list') {
        currentView = 'list';
        renderUI();
      }
    });

    bindCardClicks();
  }

  function bindCardClicks() {
    container.querySelectorAll('.cp-card').forEach(card => {
      card.addEventListener('click', () => {
        navigate(`/company/${card.dataset.companyId}`);
      });

      // Hover interactions
      card.addEventListener('mouseenter', () => {
        card.style.borderColor = 'var(--color-primary)';
        card.style.transform = 'translateY(-4px)';
        card.style.boxShadow = '0 14px 28px -4px rgba(0, 89, 48, 0.16), 0 4px 10px rgba(0,0,0,0.04)';
        const btn = card.querySelector('.cp-card-btn');
        if (btn) btn.style.transform = 'translateX(4px)';
        const title = card.querySelector('.cp-card__title');
        if (title) title.style.color = 'var(--color-primary)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.borderColor = 'var(--border-default)';
        card.style.transform = 'none';
        card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
        const btn = card.querySelector('.cp-card-btn');
        if (btn) btn.style.transform = 'none';
        const title = card.querySelector('.cp-card__title');
        if (title) title.style.color = 'var(--text-primary)';
      });
    });
  }

  renderUI();
}

