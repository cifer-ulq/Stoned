// Theme Toggle
document.getElementById('themeToggle').addEventListener('click',()=>{
  const t=document.documentElement.dataset.theme==='dark'?'light':'dark';
  document.documentElement.dataset.theme=t;
});
// Tabs
document.querySelectorAll('.tab').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.diagram-panel').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-'+btn.dataset.tab).classList.add('active');
  });
});
// SVG Helpers
const NS='http://www.w3.org/2000/svg';
function svg(w,h){const s=document.createElementNS(NS,'svg');s.setAttribute('viewBox',`0 0 ${w} ${h}`);s.setAttribute('width','100%');s.setAttribute('height',h);return s;}
function rect(x,y,w,h,rx,fill,stroke){const r=document.createElementNS(NS,'rect');r.setAttribute('x',x);r.setAttribute('y',y);r.setAttribute('width',w);r.setAttribute('height',h);r.setAttribute('rx',rx||0);r.setAttribute('fill',fill||'none');if(stroke)r.setAttribute('stroke',stroke);r.setAttribute('stroke-width','1.5');return r;}
function txt(x,y,text,size,color,anchor,weight){const t=document.createElementNS(NS,'text');t.setAttribute('x',x);t.setAttribute('y',y);t.setAttribute('font-size',size||13);t.setAttribute('fill',color||'#334155');t.setAttribute('text-anchor',anchor||'middle');t.setAttribute('font-family','Inter,sans-serif');t.setAttribute('font-weight',weight||'500');t.textContent=text;return t;}
function line(x1,y1,x2,y2,color,dash){const l=document.createElementNS(NS,'line');l.setAttribute('x1',x1);l.setAttribute('y1',y1);l.setAttribute('x2',x2);l.setAttribute('y2',y2);l.setAttribute('stroke',color||'#94a3b8');l.setAttribute('stroke-width','1.5');if(dash)l.setAttribute('stroke-dasharray',dash);return l;}
function arrow(x1,y1,x2,y2,color,label){
  const g=document.createElementNS(NS,'g'),l=line(x1,y1,x2,y2,color||'#64748b');g.appendChild(l);
  const angle=Math.atan2(y2-y1,x2-x1),sz=8;
  const p=document.createElementNS(NS,'polygon');
  p.setAttribute('points',`${x2},${y2} ${x2-sz*Math.cos(angle-0.4)},${y2-sz*Math.sin(angle-0.4)} ${x2-sz*Math.cos(angle+0.4)},${y2-sz*Math.sin(angle+0.4)}`);
  p.setAttribute('fill',color||'#64748b');g.appendChild(p);
  if(label){const mx=(x1+x2)/2,my=(y1+y2)/2;
    const bg=rect(mx-label.length*3-4,my-10,label.length*6+8,16,4,'#f8fafc','#e2e8f0');bg.setAttribute('stroke-width','1');g.appendChild(bg);
    g.appendChild(txt(mx,my+2,label,8,'#64748b','middle','400'));
  }return g;
}
function ellipse(cx,cy,rx,ry,fill,stroke){const e=document.createElementNS(NS,'ellipse');e.setAttribute('cx',cx);e.setAttribute('cy',cy);e.setAttribute('rx',rx);e.setAttribute('ry',ry);e.setAttribute('fill',fill||'#fff');e.setAttribute('stroke',stroke||'#94a3b8');e.setAttribute('stroke-width','1.5');return e;}
function roundRect(x,y,w,h,fill,label,sub,tc){
  const g=document.createElementNS(NS,'g');g.appendChild(rect(x,y,w,h,10,fill));
  g.appendChild(txt(x+w/2,y+h/2+(sub?-4:4),label,11,tc||'#fff','middle','700'));
  if(sub)g.appendChild(txt(x+w/2,y+h/2+10,sub,8,tc||'rgba(255,255,255,0.8)','middle','400'));
  return g;
}

// ═══ 1. OPERATIONAL FRAMEWORK ═══
(function(){
  const s=svg(1000,660),c=document.getElementById('diagram-operational');
  s.appendChild(txt(500,30,'CHMSU HireMe — Operational Framework',18,'#334155','middle','800'));
  // Frontend
  s.appendChild(rect(30,55,940,140,12,'#f0f4ff','#c7d2fe'));
  s.appendChild(txt(500,78,'FRONTEND (Vite + Vanilla JS)',12,'#6366f1','middle','700'));
  [{l:'Landing Page',c:'#6366f1',x:55},{l:'Login / Register',c:'#7c3aed',x:195},{l:'Student Module',c:'#2563eb',x:335},{l:'Company Module',c:'#0891b2',x:475},{l:'Jobseeker Module',c:'#059669',x:615},{l:'Supervisor Module',c:'#d97706',x:755},{l:'Admin Panel',c:'#dc2626',x:870}].forEach(m=>s.appendChild(roundRect(m.x,92,125,38,m.c,m.l)));
  // Admin sub-modules
  s.appendChild(txt(500,150,'Admin: Dashboard | Students | Companies (MOA) | OJT Mgmt | Job Postings | Matching | Reports | Settings',9,'#6366f1','middle','500'));
  // Arrow
  s.appendChild(arrow(500,200,500,240,'#6366f1','REST API Calls'));
  // Backend
  s.appendChild(rect(30,250,940,140,12,'#fef3c7','#fbbf24'));
  s.appendChild(txt(500,272,'BACKEND — Laravel 12 API (Sanctum Auth)',12,'#92400e','middle','700'));
  [{l:'AuthController',c:'#b45309',x:50},{l:'StudentController',c:'#1d4ed8',x:180},{l:'CompanyController',c:'#0e7490',x:310},{l:'JobseekerController',c:'#047857',x:440},{l:'SupervisorController',c:'#a16207',x:570},{l:'AdminController',c:'#b91c1c',x:700},{l:'OjtController',c:'#6d28d9',x:850}].forEach(m=>s.appendChild(roundRect(m.x,285,125,36,m.c,m.l)));
  s.appendChild(txt(500,342,'Models: User, StudentProfile, CompanyProfile, JobseekerProfile, SupervisorProfile, JobListing, JobApplication, Interview, OjtPosting, OjtRecord, TimeLog …',8,'#78716c','middle','400'));
  // Admin detail
  s.appendChild(txt(780,355,'Admin manages: Companies, MOA, Students, OJT, Jobs, Reports, Settings',8,'#b91c1c','middle','500'));
  // Arrow to DB
  s.appendChild(arrow(500,395,500,425,'#f59e0b','Eloquent ORM'));
  // Database
  s.appendChild(rect(30,435,940,110,12,'#ecfdf5','#6ee7b7'));
  s.appendChild(txt(500,458,'DATABASE — SQLite',12,'#065f46','middle','700'));
  ['users','student_profiles','company_profiles','jobseeker_profiles','supervisor_profiles','job_listings','job_applications','interviews','ojt_postings','ojt_records','time_logs'].forEach((t,i)=>{
    s.appendChild(roundRect(50+(i%6)*155,472+Math.floor(i/6)*28,140,24,'#10b981',t));
  });
  // External
  s.appendChild(rect(30,560,940,60,12,'#fdf2f8','#f9a8d4'));
  s.appendChild(txt(500,590,'External: Email Notifications | Geolocation API (OJT Check-in) | File Storage (Resumes, MOA Documents, Avatars)',10,'#9d174d','middle','500'));
  c.appendChild(s);
})();

// ═══ 2. CONTEXT DIAGRAM (Level 0) ═══
(function(){
  const s=svg(1000,700),c=document.getElementById('diagram-context');
  s.appendChild(txt(500,28,'Context Diagram (Level 0 DFD) — CHMSU HireMe',16,'#334155','middle','800'));
  // Central process
  s.appendChild(ellipse(500,330,140,70,'#dbeafe','#3b82f6'));
  s.appendChild(txt(500,320,'0',20,'#1e40af','middle','800'));
  s.appendChild(txt(500,340,'CHMSU HireMe',12,'#1e40af','middle','700'));
  s.appendChild(txt(500,356,'System',11,'#3b82f6','middle','400'));
  // Entities
  const ents=[
    {l:'Student / OJT Trainee',x:100,y:100,clr:'#6366f1'},
    {l:'Company / Employer',x:900,y:100,clr:'#0891b2'},
    {l:'Jobseeker',x:100,y:560,clr:'#059669'},
    {l:'OJT Supervisor',x:900,y:560,clr:'#d97706'},
    {l:'Admin',x:500,y:650,clr:'#dc2626'},
  ];
  ents.forEach(e=>{s.appendChild(rect(e.x-70,e.y-20,140,40,8,e.clr));s.appendChild(txt(e.x,e.y+5,e.l,11,'#fff','middle','600'));});
  // Flows
  const flows=[
    {x1:170,y1:120,x2:370,y2:290,lbl:'Profile, Portfolio, OJT Interest'},
    {x1:370,y1:310,x2:170,y2:130,lbl:'OJT Postings, Dashboard'},
    {x1:830,y1:120,x2:640,y2:290,lbl:'Job/OJT Postings, Profile'},
    {x1:640,y1:310,x2:830,y2:130,lbl:'Applications, Interviews'},
    {x1:170,y1:560,x2:380,y2:380,lbl:'Job Applications, Resume'},
    {x1:380,y1:360,x2:170,y2:550,lbl:'Job Matches, Offers'},
    {x1:830,y1:560,x2:630,y2:380,lbl:'Endorsements, Monitoring'},
    {x1:630,y1:360,x2:830,y2:550,lbl:'Student Logs, Trainees'},
    // Admin — expanded with multiple flows
    {x1:420,y1:630,x2:420,y2:405,lbl:'Register Companies, MOA Mgmt'},
    {x1:500,y1:630,x2:500,y2:405,lbl:'View Students, OJT, Reports'},
    {x1:580,y1:405,x2:580,y2:630,lbl:'Analytics, System Health'},
  ];
  flows.forEach(f=>s.appendChild(arrow(f.x1,f.y1,f.x2,f.y2,'#64748b',f.lbl)));
  c.appendChild(s);
})();

// ═══ 3. DFD LEVEL 1 ═══
(function(){
  // ════════════════════════════════════════════════════════
  //  LAYOUT
  //  Left column  — External Entities (cx=72)
  //  Center-Left  — Processes         (cx=310)
  //  Center-Right — Processes         (cx=680)
  //  Right column — Data Stores       (x=880, w=220)
  //
  //  Row centres (Y):
  //   R1 =  115  Register / Authenticate
  //   R2 =  250  Manage Student Profile & Portfolio
  //   R3 =  390  Manage Company Profile & MOA
  //   R4 =  530  Manage OJT Postings
  //   R5 =  670  OJT Interest & Endorsement
  //   R6 =  810  OJT Placement & Time Tracking
  //   R7 =  950  Manage Job Listings
  //   R8 = 1090  Job Application & Hiring Funnel
  //   R9 = 1230  Interview Scheduling
  //  R10 = 1370  Admin Operations
  // ════════════════════════════════════════════════════════

  const W=1130, H=1500;
  const s=svg(W,H), c=document.getElementById('diagram-dfd');
  s.appendChild(txt(W/2,26,'Data Flow Diagram (Level 1) — CHMSU HireMe',17,'#1e293b','middle','800'));
  s.appendChild(txt(W/2,44,'Each data store maps to an actual database table  ·  Flows show exact data written / read',9.5,'#64748b','middle','400'));

  const K={
    student:'#4f46e5', company:'#0891b2', admin:'#dc2626',
    supervisor:'#d97706', jobseeker:'#059669',
    proc:'#dbeafe', procBorder:'#3b82f6', procTxt:'#1e40af',
    store:'#f8fafc', storeLine:'#64748b', storeTxt:'#1e293b',
    flow:'#64748b', lbg:'#ffffff', lbdr:'#cbd5e1', ltxt:'#334155'
  };

  const LE=72, LP=310, RP=680, DSx=880, DSw=220;
  const R1=115,R2=250,R3=390,R4=530,R5=670,R6=810,R7=950,R8=1090,R9=1230,R10=1370;

  // ── helpers ──
  function extBox(cx,cy,label,sub,clr){
    const w=130,h=sub?46:32;
    const g=document.createElementNS(NS,'g');
    g.appendChild(rect(cx-w/2,cy-h/2,w,h,7,clr,'none'));
    g.appendChild(txt(cx,cy+(sub?-7:0),label,11,'#fff','middle','700'));
    if(sub) g.appendChild(txt(cx,cy+8,sub,9,'rgba(255,255,255,0.85)','middle','500'));
    s.appendChild(g);
    return{cx,cy,left:cx-w/2,right:cx+w/2,top:cy-h/2,bottom:cy+h/2};
  }

  function proc(cx,cy,num,line1,line2){
    s.appendChild(ellipse(cx+2,cy+3,84,34,'rgba(0,0,0,0.07)','none'));
    s.appendChild(ellipse(cx,cy,84,34,K.proc,K.procBorder));
    s.appendChild(txt(cx,cy-12,num,10,K.procTxt,'middle','800'));
    s.appendChild(txt(cx,cy+2,line1,9,K.procTxt,'middle','600'));
    if(line2) s.appendChild(txt(cx,cy+13,line2,9,K.procTxt,'middle','600'));
    return{cx,cy,left:cx-84,right:cx+84,top:cy-34,bottom:cy+34};
  }

  // Data store: open-rectangle (two horizontal lines + left vertical)
  function ds(id,x,y,table,alias){
    const h=22,w=DSw;
    // left stripe (ID area)
    s.appendChild(rect(x,y,30,h,0,'#e2e8f0','none'));
    s.appendChild(line(x,y,x+w,y,K.storeLine));
    s.appendChild(line(x,y+h,x+w,y+h,K.storeLine));
    s.appendChild(line(x,y,x,y+h,K.storeLine));
    s.appendChild(line(x+30,y,x+30,y+h,K.storeLine));
    s.appendChild(txt(x+15,y+h/2+4,id,8,'#475569','middle','700'));
    s.appendChild(txt(x+DSw/2+15,y+h/2+4,table,9,K.storeTxt,'middle','600'));
    if(alias) s.appendChild(txt(x+DSw/2+15,y+h+10,alias,7.5,'#94a3b8','middle','400'));
    return{x,y,w,h,left:x,right:x+w,top:y,bottom:y+h,mid:y+h/2,midX:x+w/2};
  }

  function pill(mx,my,lbl,clr){
    clr=clr||K.lbdr;
    const pw=Math.max(lbl.length*5.2+10,30),ph=14;
    const bg=rect(mx-pw/2,my-ph/2,pw,ph,3,K.lbg,clr);
    bg.setAttribute('stroke-width','0.8'); s.appendChild(bg);
    s.appendChild(txt(mx,my+4,lbl,7.5,K.ltxt,'middle','500'));
  }

  function fl(x1,y1,x2,y2,lbl,clr,offset){
    s.appendChild(arrow(x1,y1,x2,y2,clr||K.flow,null));
    if(lbl){
      const ox=offset?offset[0]:0, oy=offset?offset[1]:0;
      pill((x1+x2)/2+ox,(y1+y2)/2+oy,lbl,clr||K.lbdr);
    }
  }

  function bent(pts,lbl,clr,lx,ly){
    clr=clr||K.flow;
    const pl=document.createElementNS(NS,'polyline');
    pl.setAttribute('points',pts.map(p=>p.join(',')).join(' '));
    pl.setAttribute('fill','none');
    pl.setAttribute('stroke',clr);
    pl.setAttribute('stroke-width','1.4');
    s.appendChild(pl);
    const n=pts.length;
    const ang=Math.atan2(pts[n-1][1]-pts[n-2][1],pts[n-1][0]-pts[n-2][0]),sz=7;
    const ar=document.createElementNS(NS,'polygon');
    ar.setAttribute('points',`${pts[n-1][0]},${pts[n-1][1]} ${pts[n-1][0]-sz*Math.cos(ang-0.4)},${pts[n-1][1]-sz*Math.sin(ang-0.4)} ${pts[n-1][0]-sz*Math.cos(ang+0.4)},${pts[n-1][1]-sz*Math.sin(ang+0.4)}`);
    ar.setAttribute('fill',clr); s.appendChild(ar);
    if(lbl) pill(lx!==undefined?lx:(pts[0][0]+pts[n-1][0])/2, ly!==undefined?ly:(pts[0][1]+pts[n-1][1])/2,lbl,clr);
  }

  // section divider band
  function band(y,label,clr){
    s.appendChild(rect(0,y-9,W,12,0,clr,'none')).setAttribute('opacity','0.10');
    s.appendChild(txt(W/2,y+1,label,8,clr,'middle','700'));
  }

  // ════════════════
  //  EXTERNAL ENTITIES (left column)
  // ════════════════
  const eStudent   = extBox(LE,R1,  'Student / OJT Trainee','',K.student);
  const eJobseeker = extBox(LE,R7,  'Jobseeker','',K.jobseeker);
  const eCompany   = extBox(LE,R3+40,'Company / Employer','',K.company);
  const eSupervisor= extBox(LE,R6,  'OJT Supervisor','',K.supervisor);
  const eAdmin     = extBox(LE,R10, 'Admin','',K.admin);

  // ════════════════
  //  DATA STORES (right column, each = one DB table)
  // ════════════════
  const D1 = ds('D1', DSx, R1-11,   'users',                          '(id, email, role, password, avatar_url)');
  const D2 = ds('D2', DSx, R2-11,   'student_profiles',               '(user_id, school, program, headline, status)');
  const D3 = ds('D3', DSx, R2+20,   'student_education',              '(user_id, school, degree, year_start)');
  const D4 = ds('D4', DSx, R2+51,   'student_experiences',            '(user_id, role, company, type)');
  const D5 = ds('D5', DSx, R2+82,   'student_skills',                 '(user_id, name, level, category)');
  const D6 = ds('D6', DSx, R2+113,  'student_achievements',           '(user_id, title, type, date)');
  const D7 = ds('D7', DSx, R2+144,  'portfolio_projects',             '(user_id, title, tech_stack)');
  const D8 = ds('D8', DSx, R3-11,   'company_profiles',               '(user_id, company_name, moa_status, status)');
  const D9 = ds('D9', DSx, R3+20,   'supervisor_profiles',            '(user_id, company_name, position)');
  const D10= ds('D10',DSx, R3+51,   'jobseeker_profiles',             '(user_id, desired_job_title, work_preference)');
  const D11= ds('D11',DSx, R4-11,   'ojt_postings',                   '(company_user_id, title, slots_remaining, status)');
  const D12= ds('D12',DSx, R5-11,   'student_ojt_interests',          '(student_user_id, ojt_posting_id, status, endorsed_by)');
  const D13= ds('D13',DSx, R6-11,   'ojt_records',                    '(user_id, company_name, required_hours, status)');
  const D14= ds('D14',DSx, R6+20,   'time_logs',                      '(user_id, ojt_record_id, log_date, time_in, time_out, lat/lon)');
  const D15= ds('D15',DSx, R7-11,   'job_listings',                   '(company_user_id, title, employment_type, status)');
  const D16= ds('D16',DSx, R8-11,   'job_applications',               '(job_listing_id, applicant_user_id, status, offer_decision)');
  const D17= ds('D17',DSx, R9-11,   'interviews',                     '(job_application_id, company_user_id, type, status)');
  const D18= ds('D18',DSx, R10-11,  'password_reset_tokens',          '(email, token, created_at)');
  const D19= ds('D19',DSx, R10+20,  'personal_access_tokens',         '(tokenable_id, token, abilities)');

  // ════════════════
  //  PROCESSES
  // ════════════════
  const P1 = proc(LP, R1,  '1.0', 'Register &', 'Authenticate');
  const P2 = proc(LP, R2,  '2.0', 'Manage Student Profile', '& Portfolio');
  const P3 = proc(RP, R3,  '3.0', 'Manage Company Profile', '& MOA');
  const P4 = proc(LP, R3,  '3b.0','Manage Jobseeker &', 'Supervisor Profile');
  const P5 = proc(RP, R4,  '4.0', 'Manage OJT Postings', '');
  const P6 = proc(LP, R5,  '5.0', 'Process OJT Interest', '& Endorsement');
  const P7 = proc(RP, R6,  '6.0', 'OJT Placement &', 'Time Tracking');
  const P8 = proc(LP, R7,  '7.0', 'Manage Job Listings', '');
  const P9 = proc(RP, R8,  '8.0', 'Process Job Application', '& Offer');
  const P10= proc(LP, R9,  '9.0', 'Schedule &', 'Conduct Interview');
  const P11= proc(RP, R10, '10.0','Admin: Users, MOA,', 'Reports & Settings');

  // ════════════════
  //  DATA FLOWS
  // ════════════════

  // ── P1: Register & Authenticate ──
  fl(eStudent.right, R1-5, P1.left, R1-5, 'email, password, role', K.student);
  fl(P1.left, R1+5, eStudent.right, R1+5, 'session token (Sanctum)', K.flow);
  fl(P1.right, R1, DSx, D1.mid, 'write: id, email, role, password, avatar_url');
  fl(P1.right, R1+8, DSx, D18.mid, 'write/read: password reset token');
  fl(P1.right, R1+12, DSx, D19.mid, 'write: personal_access_token');

  // ── P2: Manage Student Profile & Portfolio ──
  fl(eStudent.right, R2-5, P2.left, R2-5, 'profile data, portfolio items', K.student);
  fl(P2.left, R2+5, eStudent.right, R2+5, 'saved profile, resume view', K.flow);
  fl(P2.right, R2-20, DSx, D2.mid,  'write: school, program, bio, status');
  fl(P2.right, R2-6,  DSx, D3.mid,  'write: education records');
  fl(P2.right, R2+6,  DSx, D4.mid,  'write: experience records');
  fl(P2.right, R2+18, DSx, D5.mid,  'write: skills + level');
  fl(P2.right, R2+28, DSx, D6.mid,  'write: achievements');
  fl(P2.right, R2+38, DSx, D7.mid,  'write: portfolio projects');

  // ── P3: Manage Company Profile & MOA ──
  fl(eCompany.right, R3+30, P3.left, R3-5, 'company info, MOA docs', K.company);
  fl(P3.left, R3+5, eCompany.right, R3+35, 'profile saved, MOA status', K.flow);
  fl(P3.right, R3-5, DSx, D8.mid,  'write: company_name, moa_file_path, moa_status, status');
  fl(P3.right, R3+5, DSx, D9.mid,  'write: supervisor_profiles (position)');

  // ── P3b: Manage Jobseeker & Supervisor Profile ──
  fl(eJobseeker.right, R7-40, P4.left, R3-5, 'desired role, work preference', K.jobseeker);
  fl(P4.left, R3+5, eJobseeker.right, R7-35, 'profile confirmed', K.flow);
  fl(P4.right, R3+10, DSx, D10.mid, 'write: desired_job_title, work_preference, years_exp');

  // ── P4: Manage OJT Postings ──
  fl(eCompany.right, R4-5, P5.left, R4-5, 'posting details (title, slots, skills)', K.company);
  fl(P5.left, R4+5, eCompany.right, R4+5, 'posting published', K.flow);
  fl(P5.right, R4, DSx, D11.mid, 'write: title, dept, location, lat/lon, slots, status');

  // ── P5: Process OJT Interest & Endorsement ──
  fl(eStudent.right, R5-5, P6.left, R5-5, 'express interest, student_message', K.student);
  fl(P6.left, R5+5, eStudent.right, R5+5, 'matched OJT postings', K.flow);
  // read postings
  fl(DSx, D11.mid, P5.right, R4, 'read: available ojt_postings', K.flow, [-120,-30]);
  fl(P6.right, R5, DSx, D12.mid, 'write: student_user_id, ojt_posting_id, status, endorsed_by');
  // supervisor endorses
  fl(eSupervisor.right, R6-20, P6.right, R5, 'endorse student interest', K.supervisor);

  // ── P6: OJT Placement & Time Tracking ──
  fl(eStudent.right, R6-5, P7.left, R6-5, 'check-in/out + GPS coords', K.student);
  fl(P7.left, R6+5, eStudent.right, R6+5, 'hours rendered, status', K.flow);
  fl(eSupervisor.right, R6+5, P7.right, R6+5, 'monitor attendance', K.supervisor);
  fl(P7.right, R6-5, eSupervisor.right, R6, 'trainee log report', K.flow);
  fl(P7.right, R6-12, DSx, D13.mid, 'write: ojt_records (company, hours, status)');
  fl(P7.right, R6+0,  DSx, D14.mid, 'write: time_logs (time_in, time_out, lat/lon, hours)');
  // read ojt_interests → accepted
  fl(DSx, D12.mid, P6.right, R5+8, 'read: accepted interests', K.flow, [-120,30]);

  // ── P7: Manage Job Listings ──
  fl(eCompany.right, R7-5, P8.left, R7-5, 'job title, requirements, skills', K.company);
  fl(P8.left, R7+5, eCompany.right, R7+5, 'listing live', K.flow);
  fl(P8.right, R7, DSx, D15.mid, 'write: title, employment_type, req_skills, status');

  // ── P8: Process Job Application & Offer ──
  fl(eJobseeker.right, R8-5, P9.left, R8-5, 'apply: cover_letter, resume', K.jobseeker);
  fl(P9.left, R8+5, eJobseeker.right, R8+5, 'application status, offer details', K.flow);
  fl(P9.right, R8-5, DSx, D16.mid, 'write: status, match_score, offer_details, offer_decision');
  // read job listings
  bent([[DSx,D15.mid],[DSx-30,D15.mid],[DSx-30,R8],[P9.right,R8]],
       'read: open job_listings', K.flow, DSx-80, R8-20);

  // ── P9: Schedule & Conduct Interview ──
  fl(eCompany.right, R9-5, P10.left, R9-5, 'schedule interview (date, type, platform)', K.company);
  fl(P10.left, R9+5, eCompany.right, R9+5, 'interview confirmed', K.flow);
  fl(eJobseeker.right, R9-5, P10.left, R9, 'receive interview invite', K.jobseeker);
  fl(P10.right, R9, DSx, D17.mid, 'write: type, date, platform, status, meeting_link');
  // read job_applications
  bent([[DSx,D16.mid],[DSx-40,D16.mid],[DSx-40,R9],[P10.right,R9+8]],
       'read: interviewed applications', K.flow, DSx-80, R9+20);

  // ── P10: Admin Operations ──
  fl(eAdmin.right, R10-5, P11.left, R10-5, 'admin commands', K.admin);
  fl(P11.left, R10+5, eAdmin.right, R10+5, 'reports, dashboards', K.flow);
  // admin reads/writes all key tables
  fl(P11.right, R10-16, DSx, D1.mid,  'manage: users (role, activation)', K.flow, [0,-20]);
  fl(P11.right, R10-8,  DSx, D8.mid,  'approve: company_profiles, MOA');
  fl(P11.right, R10,    DSx, D11.mid, 'manage: ojt_postings (status)');
  fl(P11.right, R10+8,  DSx, D15.mid, 'manage: job_listings (status)');
  fl(P11.right, R10+16, DSx, D16.mid, 'review: job_applications');

  c.appendChild(s);
})();

// ═══ 4. ENTITY RELATIONSHIP DIAGRAM ═══
(function(){
  const W=1475,H=1230;
  const s=svg(W,H),c=document.getElementById('diagram-erd');
  s.appendChild(txt(W/2,24,'Entity Relationship Diagram — CHMSU HireMe',17,'#1e293b','middle','800'));
  s.appendChild(txt(W/2,43,'Complete schema  ·  PK = Primary Key  ·  FK = Foreign Key  ·  Cardinality on lines',10,'#64748b','middle','400'));

  const EW=185,ROWH=15,HDR=26,PAD=8;

  // ── Renders a full entity box with PK/FK field markers ──
  function ent(x,y,name,fields,color){
    const h=HDR+fields.length*ROWH+PAD;
    const g=document.createElementNS(NS,'g');
    // drop shadow
    const sh=rect(x+3,y+3,EW,h,7,'rgba(0,0,0,0.09)','none'); g.appendChild(sh);
    // header fill
    g.appendChild(rect(x,y,EW,HDR,7,color,'none'));
    // body fill
    g.appendChild(rect(x,y+HDR-1,EW,h-HDR+1,0,'#fff','none'));
    // outer border
    const bdr=rect(x,y,EW,h,7,'none',color); bdr.setAttribute('stroke-width','1.5'); g.appendChild(bdr);
    // header/body divider
    const dv=document.createElementNS(NS,'line');
    dv.setAttribute('x1',x);dv.setAttribute('y1',y+HDR);dv.setAttribute('x2',x+EW);dv.setAttribute('y2',y+HDR);
    dv.setAttribute('stroke',color);dv.setAttribute('stroke-width','1');g.appendChild(dv);
    // entity name
    g.appendChild(txt(x+EW/2,y+HDR-7,name,11,'#fff','middle','700'));
    // fields
    fields.forEach((f,i)=>{
      const fy=y+HDR+PAD/2+i*ROWH+ROWH*0.65;
      if(f.startsWith('# ')){
        const lbl=f.slice(2);
        const pkbg=rect(x+4,fy-9,18,12,2,'none',color);pkbg.setAttribute('stroke-width','0.8');pkbg.setAttribute('opacity','0.55');g.appendChild(pkbg);
        g.appendChild(txt(x+13,fy+0.5,'PK',7,color,'middle','700'));
        g.appendChild(txt(x+26,fy+0.5,lbl,9,color,'start','600'));
      } else if(f.startsWith('> ')){
        const lbl=f.slice(2);
        const fkbg=rect(x+4,fy-9,18,12,2,'none','#6d28d9');fkbg.setAttribute('stroke-width','0.8');fkbg.setAttribute('opacity','0.4');g.appendChild(fkbg);
        g.appendChild(txt(x+13,fy+0.5,'FK',7,'#6d28d9','middle','700'));
        g.appendChild(txt(x+26,fy+0.5,lbl,9,'#5b21b6','start','500'));
      } else {
        g.appendChild(txt(x+8,fy+0.5,f,9,'#475569','start','400'));
      }
    });
    s.appendChild(g);
    return{x,y,w:EW,h,cx:x+EW/2,cy:y+h/2,
      top:{x:x+EW/2,y},bottom:{x:x+EW/2,y:y+h},
      left:{x,y:y+h/2},right:{x:x+EW,y:y+h/2}};
  }

  // ── Draws a labelled dashed relationship line ──
  function rel(p1,p2,card){
    s.appendChild(line(p1.x,p1.y,p2.x,p2.y,'#cbd5e1','4,3'));
    if(card){
      const mx=(p1.x+p2.x)/2,my=(p1.y+p2.y)/2;
      const cw=card.length*7+10;
      const cb=rect(mx-cw/2,my-8,cw,14,3,'#f1f5f9','#94a3b8');cb.setAttribute('stroke-width','0.75');s.appendChild(cb);
      s.appendChild(txt(mx,my+2,card,9,'#334155','middle','700'));
    }
  }

  // ── Section label band ──
  function band(x,y,w,label,color){
    const bg=rect(x,y,w,16,3,color,'none');bg.setAttribute('opacity','0.18');s.appendChild(bg);
    s.appendChild(txt(x+7,y+11.5,label,8.5,color,'start','700'));
  }

  // ══════════════════════════════════
  //  SECTION BANDS
  // ══════════════════════════════════
  band(628,52,562,'AUTH / CORE','#6366f1');
  band(8,236,1052,'USER PROFILES','#1e40af');
  band(1068,236,395,'JOB HIRING PIPELINE','#be185d');

  // ══════════════════════════════════
  //  ENTITIES — Auth / Core
  // ══════════════════════════════════
  const U=ent(640,72,'users',[
    '# id',
    '  name',
    '  email',
    '  email_verified_at',
    '  password',
    '  role  [student|company|supervisor|admin]',
    '  onboarding_completed',
    '  avatar_url',
  ],'#6366f1');

  const PAT=ent(1080,72,'personal_access_tokens',[
    '# id',
    '  tokenable_type',
    '  tokenable_id',
    '  name',
    '  token',
    '  abilities',
    '  last_used_at',
    '  expires_at',
  ],'#64748b');

  // ══════════════════════════════════
  //  ENTITIES — User Profiles
  // ══════════════════════════════════
  const SP=ent(10,256,'student_profiles',[
    '# id',
    '> user_id',
    '  school',
    '  campus',
    '  program',
    '  year_level',
    '  student_id',
    '  section',
    '  batch',
    '  headline',
    '  bio',
    '  phone',
    '  location',
    '  github_url',
    '  linkedin_url',
    '  portfolio_url',
    '  cover_color',
    '  resume_type  [objective|summary]',
    '  resume_objective',
    '  status  [active_ojt|alumni]',
  ],'#2563eb');

  const JP=ent(220,256,'jobseeker_profiles',[
    '# id',
    '> user_id',
    '  desired_job_title',
    '  work_preference  [remote|hybrid|onsite]',
    '  years_of_experience',
    '  headline',
    '  bio',
    '  location',
    '  portfolio_url',
    '  linkedin_url',
    '  phone',
    '  avatar_url',
    '  profile_completed',
  ],'#059669');

  const GP=ent(430,256,'graduate_profiles',[
    '# id',
    '> user_id',
    '  year_graduated',
    '  campus',
    '  course',
    '  section',
    '  employment_status  [looking|employed|freelance|studying]',
  ],'#0d9488');

  const CP=ent(640,256,'company_profiles',[
    '# id',
    '> user_id',
    '  company_name',
    '  company_location',
    '  full_address',
    '  company_type',
    '  ownership_type',
    '  company_size',
    '  year_founded',
    '  website',
    '  contact_email',
    '  contact_phone',
    '  contact_person',
    '  contact_title',
    '  description',
    '  logo_url',
    '  moa_file_path',
    '  moa_start_date',
    '  moa_end_date',
    '  moa_status  [Pending|Active|Expired]',
    '  status  [Pending|Approved|Rejected]',
    '  profile_completed',
  ],'#0891b2');

  const SVCP=ent(860,256,'supervisor_profiles',[
    '# id',
    '> user_id',
    '  company_name',
    '  position',
  ],'#d97706');

  // ══════════════════════════════════
  //  ENTITIES — Job Hiring Pipeline
  // ══════════════════════════════════
  const JL=ent(1080,256,'job_listings',[
    '# id',
    '> company_user_id',
    '  title',
    '  department',
    '  location',
    '  employment_type',
    '  salary_range',
    '  description',
    '  responsibilities  [json]',
    '  requirements  [json]',
    '  benefits  [json]',
    '  required_skills  [json]',
    '  status  [open|closed|draft|filled]',
    '  expires_at',
  ],'#be185d');

  const JA=ent(1080,JL.y+JL.h+12,'job_applications',[
    '# id',
    '> job_listing_id',
    '> applicant_user_id',
    '  status  [applied|screened|interviewed|offered|hired|rejected]',
    '  match_score',
    '  cover_letter',
    '  notes',
    '  offer_details  [json]',
    '  offer_decision  [accepted|rejected]',
    '  offer_decided_at',
  ],'#9f1239');

  const IV=ent(1280,JL.y+JL.h+12,'interviews',[
    '# id',
    '> job_application_id',
    '> company_user_id',
    '  type  [Technical|HR Screening|Final|...]',
    '  scheduled_date',
    '  scheduled_time',
    '  platform  [Zoom|Google Meet|On-site|...]',
    '  status  [upcoming|pending|done|cancelled]',
    '  notes',
    '  interviewer_name',
    '  duration',
    '  meeting_link',
  ],'#b45309');

  // ══════════════════════════════════
  //  ENTITIES — Student Portfolio / Resume
  // ══════════════════════════════════
  const portfolioY=SP.y+SP.h+28;
  band(8,portfolioY-16,408,'STUDENT PORTFOLIO & RESUME','#4338ca');

  const SE=ent(10,portfolioY,'student_education',[
    '# id',
    '> user_id',
    '  school',
    '  degree',
    '  year_start',
    '  year_end',
    '  gpa',
    '  description',
    '  is_current',
    '  sort_order',
  ],'#4338ca');

  const SEx=ent(10,SE.y+SE.h+12,'student_experiences',[
    '# id',
    '> user_id',
    '  role',
    '  company',
    '  location',
    '  type  [OJT|Freelance|Volunteer|Full-time|Part-time]',
    '  period_start',
    '  period_end',
    '  description',
    '  skills  [json]',
    '  is_it_related',
    '  is_current',
    '  sort_order',
  ],'#7c3aed');

  const SS=ent(220,portfolioY,'student_skills',[
    '# id',
    '> user_id',
    '  name',
    '  level  [0–100]',
    '  category  [language|framework|tool|database|other]',
    '  endorsed_count',
    '  sort_order',
  ],'#c026d3');

  const SA=ent(220,SS.y+SS.h+12,'student_achievements',[
    '# id',
    '> user_id',
    '  title',
    '  description',
    '  type  [academic|certification|competition|professional]',
    '  icon',
    '  date',
    '  sort_order',
  ],'#db2777');

  const PP=ent(220,SA.y+SA.h+12,'portfolio_projects',[
    '# id',
    '> user_id',
    '  title',
    '  description',
    '  tech_stack  [json]',
    '  project_url',
    '  repo_url',
    '  image_url',
    '  is_featured',
    '  sort_order',
  ],'#e11d48');

  // ══════════════════════════════════
  //  ENTITIES — OJT Tracking
  // ══════════════════════════════════
  const ojtTrackY=GP.y+GP.h+28;
  band(428,ojtTrackY-16,408,'OJT TRACKING','#0d9488');

  const OR=ent(430,ojtTrackY,'ojt_records',[
    '# id',
    '> user_id',
    '  company_name',
    '  supervisor_name',
    '  supervisor_email',
    '  location',
    '  start_date',
    '  end_date',
    '  required_hours',
    '  completed_hours',
    '  status  [active|completed|withdrawn]',
  ],'#0d9488');

  const TL=ent(430,OR.y+OR.h+12,'time_logs',[
    '# id',
    '> user_id',
    '> ojt_record_id',
    '  log_date',
    '  time_in',
    '  time_out',
    '  hours_rendered',
    '  description',
    '  latitude',
    '  longitude',
    '  time_in_lat',
    '  time_in_lon',
    '  time_out_lat',
    '  time_out_lon',
    '  location_validity',
    '  distance_meters',
    '  status  [pending|approved|rejected]',
  ],'#0369a1');

  // ══════════════════════════════════
  //  ENTITIES — OJT Postings
  // ══════════════════════════════════
  const ojtPostY=CP.y+CP.h+28;
  band(628,ojtPostY-16,408,'OJT POSTINGS','#7c3aed');

  const SOI=ent(640,ojtPostY,'student_ojt_interests',[
    '# id',
    '> student_user_id',
    '> ojt_posting_id',
    '  status  [interested|endorsed|accepted|rejected]',
    '  student_message',
    '> endorsed_by  (→ users.id)',
    '  endorsed_at',
  ],'#4f46e5');

  const OP=ent(860,ojtPostY,'ojt_postings',[
    '# id',
    '> company_user_id',
    '  title',
    '  company_name',
    '  company_initial',
    '  company_color',
    '  department',
    '  industry',
    '  location',
    '  branch_name',
    '  latitude',
    '  longitude',
    '  description',
    '  learning_outcomes',
    '  required_skills  [json]',
    '  preferred_courses  [json]',
    '  slots_total',
    '  slots_remaining',
    '  duration',
    '  schedule_type  [full_day|half_day]',
    '  status  [open|filling_up|closed|draft]',
    '  expires_at',
  ],'#7c3aed');

  // ══════════════════════════════════
  //  RELATIONSHIPS
  // ══════════════════════════════════

  // users ──1:1──► profile tables
  rel(U.bottom,SP.top,'1:1');
  rel(U.left,JP.top,'1:1');
  rel(U.bottom,GP.top,'1:1');
  rel(U.bottom,CP.top,'1:1');
  rel(U.right,SVCP.top,'1:1');
  // users ──1:N──► personal_access_tokens (Sanctum)
  rel(U.right,PAT.left,'1:N');

  // student_profiles ──1:N──► portfolio sub-tables (all keyed by user_id → users)
  rel(SP.bottom,SE.top,'1:N');
  rel(SP.bottom,SEx.top,'1:N');
  rel(SP.right,SS.left,'1:N');
  rel(SP.right,SA.left,'1:N');
  rel(SP.right,PP.left,'1:N');

  // student_profiles ──1:N──► ojt_records (user_id)
  rel(SP.right,OR.left,'1:N');
  // ojt_records ──1:N──► time_logs
  rel(OR.bottom,TL.top,'1:N');

  // company_profiles ──1:N──► ojt_postings
  rel(CP.bottom,OP.top,'1:N');
  // ojt_postings ──1:N──► student_ojt_interests
  rel(OP.left,SOI.right,'1:N');
  // student_profiles ──1:N──► student_ojt_interests
  rel(SP.right,SOI.left,'1:N');

  // company_profiles ──1:N──► job_listings
  rel(CP.right,JL.left,'1:N');
  // job_listings ──1:N──► job_applications
  rel(JL.bottom,JA.top,'1:N');
  // jobseeker_profiles ──1:N──► job_applications (applicant_user_id)
  rel(JP.right,JA.left,'1:N');
  // job_applications ──1:N──► interviews
  rel(JA.right,IV.left,'1:N');

  // ── Admin access banner ──
  const botY=Math.max(SEx.y+SEx.h,TL.y+TL.h,PP.y+PP.h,OP.y+OP.h,JA.y+JA.h,IV.y+IV.h)+30;
  s.appendChild(rect(W/2-315,botY,630,40,8,'#dc2626','none'));
  s.appendChild(txt(W/2,botY+16,'Admin Role — Full read / write access to ALL tables',12,'#fff','middle','700'));
  s.appendChild(txt(W/2,botY+30,'Manages: Users · Companies (MOA) · OJT Postings · Job Listings · Applications · Interviews · Reports · System Settings',9,'rgba(255,255,255,0.85)','middle','400'));

  c.appendChild(s);
})();

// ═══ 5. USE CASE DIAGRAM ═══
(function(){
  // ── Layout constants ──
  // Left actors (Student, Graduate, Admin) at x=75 — outside left boundary
  // Right actors (Company, Supervisor)    at x=975 — outside right boundary
  // Left-column UCs: cx=345   Right-column UCs: cx=705
  // Each actor is vertically centred on its own UC group → short, non-crossing lines
  // Login: only Student & Company connect (they are level with it); others get a note
  const W=1050, H=750;
  const s=svg(W,H), c=document.getElementById('diagram-usecase');

  // ── Title ──
  s.appendChild(txt(525,26,'Use Case Diagram — CHMSU HireMe',17,'#111','middle','800'));

  // ── System boundary (plain black & white) ──
  const bx=148, by=48, bw=754, bh=622;
  s.appendChild(rect(bx,by,bw,bh,0,'#fff','#222'));
  // Notch out a label on the top border
  const btitle='CHMSU HireMe System', btw=btitle.length*6+14;
  s.appendChild(rect(bx+18,by-9,btw,18,0,'#fff',null));
  s.appendChild(txt(bx+18+btw/2,by+4,btitle,11,'#111','middle','700'));

  // ── Helpers ──
  function actor(x,y,label){
    const g=document.createElementNS(NS,'g');
    g.appendChild(ellipse(x,y-22,10,10,'#fff','#111'));
    g.appendChild(line(x,y-12,x,y+14,'#111'));
    g.appendChild(line(x-14,y,x+14,y,'#111'));
    g.appendChild(line(x,y+14,x-12,y+30,'#111'));
    g.appendChild(line(x,y+14,x+12,y+30,'#111'));
    g.appendChild(txt(x,y+48,label,11,'#111','middle','700'));
    s.appendChild(g);
    return {x,y};
  }

  function uc(cx,cy,label,isAdmin){
    const rx=Math.max(82,label.length*4);
    s.appendChild(ellipse(cx,cy,rx,22,isAdmin?'#e8e8e8':'#fff','#333'));
    s.appendChild(txt(cx,cy+5,label,10,'#111','middle','500'));
    return {x:cx,y:cy,rx};
  }

  function divider(y){
    s.appendChild(line(bx+18,y,bx+bw-18,y,'#bbb','5,4'));
  }

  function secLabel(x,y,label){
    s.appendChild(txt(x,y,label,9,'#555','middle','600'));
  }

  function assoc(ax,ay,ux,uy){
    s.appendChild(line(ax,ay,ux,uy,'#444'));
  }

  // ─────────────────────────────────────────────
  // SECTION 1 — Student (left) | Company (right)
  // ─────────────────────────────────────────────
  divider(92);
  secLabel(345,104,'Student / OJT Trainee');
  secLabel(705,104,'Company');
  const gap=52, sY=120;

  const uc_s1=uc(345,sY,      'Manage Profile & Portfolio');
  const uc_s2=uc(345,sY+gap,  'Browse & Apply for OJT');
  const uc_s3=uc(345,sY+gap*2,'Log OJT Attendance');
  const studentUCs=[uc_s1,uc_s2,uc_s3]; // centre y = sY+gap = 254

  const uc_c1=uc(705,sY,      'Post OJT Postings');
  const uc_c2=uc(705,sY+gap,  'Post Job Listings');
  const uc_c3=uc(705,sY+gap*2,'Review & Accept Applicants');
  const uc_c4=uc(705,sY+gap*3,'Schedule Interviews & Offers');
  const companyUCs=[uc_c1,uc_c2,uc_c3,uc_c4]; // centre y = sY+1.5*gap = 280

  // ─────────────────────────────────────────────
  // SECTION 2 — Graduate (left) | Supervisor (right)
  // ─────────────────────────────────────────────
  divider(346);
  secLabel(345,358,'Graduate');
  secLabel(705,358,'Supervisor');
  const jY=374;

  const uc_j1=uc(345,jY,      'Manage Profile & Resume');
  const uc_j2=uc(345,jY+gap,  'Search & Apply to Jobs');
  const uc_j3=uc(345,jY+gap*2,'Accept / Reject Job Offers');
  const jobseekerUCs=[uc_j1,uc_j2,uc_j3]; // centre y = jY+gap = 506

  const uc_v1=uc(705,jY,      'Endorse / Reject Students');
  const uc_v2=uc(705,jY+gap,  'Monitor OJT Progress');
  const uc_v3=uc(705,jY+gap*2,'Review Student Time Logs');
  const supervisorUCs=[uc_v1,uc_v2,uc_v3]; // centre y = jY+gap = 506

  // ─────────────────────────────────────────────
  // SECTION 3 — Admin (full-width, bottom)
  // ─────────────────────────────────────────────
  divider(544);
  secLabel(525,556,'Admin');
  const aY=574;

  const uc_a1=uc(345,aY,      'Manage Companies & MOA',true);
  const uc_a2=uc(705,aY,      'Manage Students & OJT', true);
  const uc_a3=uc(345,aY+gap,  'Oversee Jobs & Matching',true);
  const uc_a4=uc(705,aY+gap,  'Generate Reports',       true);
  const adminUCs=[uc_a1,uc_a2,uc_a3,uc_a4]; // centre y = aY+gap/2 = 680

  // ─────────────────────────────────────────────
  // ACTORS — placed outside the boundary,
  //          vertically centred on their own UCs
  // ─────────────────────────────────────────────
  const studentA   =actor(75,  sY+gap,      'Student');   // 254
  const companyA   =actor(975, sY+gap*1.5,  'Company');   // 280
  const jobseekerA =actor(75,  jY+gap,      'Graduate');  // 506
  const supervisorA=actor(975, jY+gap,      'Supervisor');// 506
  const adminA     =actor(75,  aY+gap/2,    'Admin');     // 680

  // ─────────────────────────────────────────────
  // ASSOCIATIONS
  // Each actor only connects to its own UC group.
  // Login: only Student & Company (they are level; their lines do not cross).
  // Graduate / Supervisor / Admin → covered by the note below the Login UC.
  // ─────────────────────────────────────────────

  // Student → left edges of student UCs (right hand)
  studentUCs.forEach(u=>assoc(studentA.x+14, studentA.y, u.x-u.rx, u.y));

  // Company → right edges of company UCs (left hand)
  companyUCs.forEach(u=>assoc(companyA.x-14, companyA.y, u.x+u.rx, u.y));

  // Graduate → left edges of graduate UCs (right hand)
  jobseekerUCs.forEach(u=>assoc(jobseekerA.x+14, jobseekerA.y, u.x-u.rx, u.y));

  // Supervisor → right edges of supervisor UCs (left hand)
  supervisorUCs.forEach(u=>assoc(supervisorA.x-14, supervisorA.y, u.x+u.rx, u.y));

  // Admin → left edges of admin UCs (right hand)
  adminUCs.forEach(u=>assoc(adminA.x+14, adminA.y, u.x-u.rx, u.y));

  // ─────────────────────────────────────────────
  // LEGEND
  // ─────────────────────────────────────────────
  const ly=H-30;
  s.appendChild(rect(bx,ly-6,bw,32,0,'#f5f5f5','#bbb'));
  s.appendChild(ellipse(bx+44,ly+10,17,10,'#fff','#333'));
  s.appendChild(txt(bx+88,ly+14,'Use Case',8,'#222','start','500'));
  s.appendChild(ellipse(bx+210,ly+10,17,10,'#e8e8e8','#333'));
  s.appendChild(txt(bx+254,ly+14,'Admin-Only',8,'#222','start','500'));
  s.appendChild(line(bx+380,ly+10,bx+410,ly+10,'#444'));
  s.appendChild(txt(bx+420,ly+14,'Association Line',8,'#222','start','500'));

  c.appendChild(s);
})();
