/* ── Companies Page — Admin Portal (Read-Only + Emergency Suspend) ── */
import {
  apiGetCached,
  getCached,
  apiPost,
  apiPostForm,
  apiPatch,
  apiDelete,
} from '../api/client.js';
import { icon, renderIcons } from '../components/icons.js';
import { renderCompaniesWorkspace } from '@shared/companies-workspace.js';

export default async function CompaniesPage(container) {
  return renderCompaniesWorkspace(container, {
    mode: 'admin-readonly',
    api: { apiGetCached, getCached, apiPost, apiPostForm, apiPatch, apiDelete },
    icon,
    renderIcons,
  });
}
