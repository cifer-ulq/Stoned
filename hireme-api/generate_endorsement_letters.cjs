const fs = require('fs');
const path = require('path');

const destDir = path.join(__dirname, 'storage', 'app', 'public', 'endorsement-letters');
fs.mkdirSync(destDir, { recursive: true });

function generateEndorsementPdf(studentName, studentId, course, section, companyName, coordinatorName) {
  const content = [
    '%PDF-1.4',
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj'
  ];
  const streamText = [
    'BT',
    '/F1 16 Tf',
    '50 730 Td',
    '(CARLOS HILADO MEMORIAL STATE UNIVERSITY) Tj',
    '/F1 11 Tf',
    '0 -20 Td',
    '(Center for Internationalization and External Relations - CIER) Tj',
    '0 -16 Td',
    '(College of Industrial Technology - Information Technology Dept.) Tj',
    '0 -30 Td',
    '/F1 14 Tf',
    '(OFFICIAL ENDORSEMENT LETTER FOR ON-THE-JOB TRAINING) Tj',
    '/F1 11 Tf',
    '0 -30 Td',
    '(' + ('TO: ' + companyName.toUpperCase()).replace(/[()]/g, '') + ') Tj',
    '0 -20 Td',
    '(Dear Industry Partner,) Tj',
    '0 -20 Td',
    '(This serves as formal university endorsement for our bonafide student:) Tj',
    '0 -22 Td',
    '(' + ('Student Name: ' + studentName).replace(/[()]/g, '') + ') Tj',
    '0 -16 Td',
    '(' + ('Student ID: ' + studentId + ' | Program: ' + course).replace(/[()]/g, '') + ') Tj',
    '0 -16 Td',
    '(' + ('Year & Section: 4th Year - Section ' + section + ' | Batch: 2026-2027').replace(/[()]/g, '') + ') Tj',
    '0 -24 Td',
    '(The student has completed all university pre-deployment requirements) Tj',
    '0 -16 Td',
    '(and is cleared to render 600 hours of specialized industry training.) Tj',
    '0 -35 Td',
    '(ENDORSED BY:) Tj',
    '0 -25 Td',
    '(' + coordinatorName.toUpperCase() + ') Tj',
    '0 -16 Td',
    '(OJT Coordinator - BSIT Department, CHMSU) Tj',
    '0 -25 Td',
    '(STATUS: VERIFIED & OFFICIALLY ENDORSED) Tj',
    'ET'
  ].join('\n');
  const streamLen = Buffer.byteLength(streamText);
  content.push('5 0 obj << /Length ' + streamLen + ' >> stream\n' + streamText + '\nendstream endobj');
  const body = content.join('\n');
  return Buffer.from(body + '\n%%EOF');
}

const students = [
  { name: 'Adrian Miguel Ramos', id: '2023-BSIT4A-006', section: 'A', company: 'NexusWave Solutions Inc.' },
  { name: 'Camille Joy Valderrama', id: '2023-BSIT4A-007', section: 'A', company: 'NexusWave Solutions Inc.' },
  { name: 'Elijah James Montefalcon', id: '2023-BSIT4A-008', section: 'A', company: 'CyberForge Defence Systems Phils. Corp.' },
  { name: 'Patricia Ann De Guzman', id: '2023-BSIT4A-009', section: 'A', company: 'Stratum AI Analytics & Data Labs Inc.' },
  { name: 'Vincent Rafael Almodovar', id: '2023-BSIT4A-010', section: 'A', company: 'NexusWave Solutions Inc.' },
  { name: 'Bianca Sofia Magbanua', id: '2023-BSIT4B-006', section: 'B', company: 'NexusWave Solutions Inc.' },
  { name: 'Gabriel Luis Montinola', id: '2023-BSIT4B-007', section: 'B', company: 'CyberForge Defence Systems Phils. Corp.' },
  { name: 'Hannah Mae Villacorta', id: '2023-BSIT4B-008', section: 'B', company: 'CyberForge Defence Systems Phils. Corp.' },
  { name: 'Kyle Patrick Salgado', id: '2023-BSIT4B-009', section: 'B', company: 'Stratum AI Analytics & Data Labs Inc.' },
  { name: 'Rachel Christine Arnaiz', id: '2023-BSIT4B-010', section: 'B', company: 'Stratum AI Analytics & Data Labs Inc.' },
];

students.forEach(s => {
  const fileName = `endorsement_${s.id.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`;
  const filePath = path.join(destDir, fileName);
  fs.writeFileSync(filePath, generateEndorsementPdf(s.name, s.id, 'BSIT', s.section, s.company, 'Prof. Mariene Labrador'));
});

console.log('10 Endorsement Letter PDFs generated successfully in endorsement-letters.');
