/* ── Partner Companies & MOAs Page — CIER Portal ── */
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

export default async function CierCompaniesPage(container) {
  return renderCompaniesWorkspace(container, {
    mode: 'cier',
    api: { apiGetCached, getCached, apiPost, apiPostForm, apiPatch, apiDelete },
    icon,
    renderIcons,
  });
}
