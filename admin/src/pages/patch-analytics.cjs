const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'analytics.js');
let src = fs.readFileSync(filePath, 'utf8');

/* ── Find bounds of the old studentTable section ── */
// startIdx: the '/* ' comment block just before 'function studentTable'
const fnStart = src.indexOf('function studentTable(students, course, batch)');
if (fnStart === -1) { console.error('FUNCTION NOT FOUND'); process.exit(1); }
const startIdx = src.lastIndexOf('/* ', fnStart);
// endIdx: the '\r\n/* ' comment block that follows the function
const endIdx = src.indexOf('\r\n/* ', fnStart);

if (startIdx === -1) { console.error('START MARKER NOT FOUND'); process.exit(1); }
if (endIdx === -1)   { console.error('END MARKER NOT FOUND');   process.exit(1); }

console.log('Found start at:', startIdx, 'end at:', endIdx);

const newStudentTableSection = `/* \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   STUDENT TABLE  (paginated \u2013 PAGE_SIZE rows per page)
   \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
const PAGE_SIZE = 12;

function studentTableRows(students, page) {
  const start = page * PAGE_SIZE;
  return students.slice(start, start + PAGE_SIZE).map((s, i) => \`
    <tr class="an-tbl-row">
      <td class="an-tbl-td an-tbl-td--num">\${start + i + 1}</td>
      <td class="an-tbl-td">
        <div class="an-tbl-name">
          <div class="an-tbl-avatar">\${s.name.split(' ').map(w => w[0]).slice(0,2).join('')}</div>
          \${s.name}
        </div>
      </td>
      <td class="an-tbl-td"><span class="an-tbl-section">Section \${s.section}</span></td>
      <td class="an-tbl-td">\${s.role}</td>
      <td class="an-tbl-td an-tbl-td--emp">\${s.employer}</td>
      <td class="an-tbl-td">
        <span class="an-path-badge \${s.inPath ? 'an-path-badge--yes' : 'an-path-badge--no'}">
          \${s.inPath ? icon('checkCircle', 12) + ' In Path' : icon('alertCircle', 12) + ' Not in Path'}
        </span>
      </td>
    </tr>\`).join('');
}

function studentTablePagination(total, page) {
  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (totalPages <= 1) return '';
  const pageButtons = Array.from({ length: totalPages }, (_, i) =>
    \`<button class="an-pg-btn\${i === page ? ' an-pg-btn--active' : ''}" data-page="\${i}">\${i + 1}</button>\`
  ).join('');
  return \`
    <div class="an-pagination">
      <button class="an-pg-btn an-pg-btn--nav" data-page="\${page - 1}"\${page === 0 ? ' disabled' : ''}>\${icon('chevronLeft', 14)}</button>
      \${pageButtons}
      <button class="an-pg-btn an-pg-btn--nav" data-page="\${page + 1}"\${page >= totalPages - 1 ? ' disabled' : ''}>\${icon('chevronRight', 14)}</button>
      <span class="an-pg-info">Page \${page + 1} of \${totalPages}</span>
    </div>\`;
}

function studentTable(students, course, batch, batchId, page = 0) {
  const inCount  = students.filter(s => s.inPath).length;
  const outCount = students.length - inCount;
  const start    = page * PAGE_SIZE;
  const end      = Math.min(start + PAGE_SIZE, students.length);
  const countLabel = students.length > PAGE_SIZE
    ? \`\${start + 1}\u2013\${end} of \${students.length}\`
    : \`\${students.length} shown\`;

  return \`
    <div class="an-student-section" data-batch-id="\${batchId}" data-page="\${page}">
      <div class="an-student-header">
        <div class="an-student-title">
          \${icon('users', 14)}
          Student Records \u2013 \${course} Batch \${batch}
          <span class="an-student-count">\${countLabel}</span>
        </div>
        <div class="an-student-summary">
          <span class="an-path-badge an-path-badge--yes">\${icon('checkCircle', 11)} \${inCount} in path</span>
          <span class="an-path-badge an-path-badge--no">\${icon('alertCircle', 11)} \${outCount} not in path</span>
        </div>
      </div>
      <div class="an-tbl-wrap">
        <table class="an-tbl">
          <thead>
            <tr>
              <th class="an-tbl-th an-tbl-th--num">#</th>
              <th class="an-tbl-th">Student Name</th>
              <th class="an-tbl-th">Section</th>
              <th class="an-tbl-th">Current Role</th>
              <th class="an-tbl-th">Employer</th>
              <th class="an-tbl-th">Path Status</th>
            </tr>
          </thead>
          <tbody>\${studentTableRows(students, page)}</tbody>
        </table>
      </div>
      \${studentTablePagination(students.length, page)}
    </div>\`;
}

`;

const result = src.slice(0, startIdx) + newStudentTableSection + src.slice(endIdx);
fs.writeFileSync(filePath, result, 'utf8');
console.log('Done! File patched successfully.');
