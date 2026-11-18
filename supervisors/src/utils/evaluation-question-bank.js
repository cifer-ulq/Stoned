/* ==========================================================================
   Dynamic Evaluation Criterion Suggestion Bank — Supervisor Portal
   Provides curated default OJT evaluation questions per Category & Response Type
   ========================================================================== */

export const RESPONSE_TYPE_LABELS = {
  rating: '1 to 5 Rating Scale',
  multiple_choice: 'Multiple Choice',
  text: 'Open-ended Text',
};

const BANK = {
  'Technical Competence': {
    rating: [
      {
        text: 'Demonstrates sound technical knowledge and proficiency in executing assigned tasks and tools.',
      },
      {
        text: 'Applies classroom theories and program-specific competencies effectively to real workplace assignments.',
      },
      {
        text: 'Learns new workplace software, equipment, or technical procedures quickly with minimal supervision.',
      },
      {
        text: 'Applies critical thinking and structured problem-solving skills when encountering technical challenges.',
      },
      {
        text: 'Follows industry standards, safety protocols, and technical best practices during daily operations.',
      },
    ],
    multiple_choice: [
      {
        text: "How would you rate the trainee's overall technical readiness for entry-level industry tasks?",
        options: [
          'Exceeds entry-level expectations',
          'Meets entry-level expectations',
          'Developing — requires guided supervision',
          'Needs substantial technical reinforcement',
        ],
      },
      {
        text: 'How independently can the trainee operate workplace tools, systems, or equipment?',
        options: [
          'Fully independent with minimal guidance',
          'Mostly independent after initial orientation',
          'Requires regular technical check-ins',
          'Requires constant close supervision',
        ],
      },
      {
        text: 'How effectively does the trainee troubleshoot and resolve routine technical issues?',
        options: [
          'Resolves issues proactively and accurately',
          'Resolves most issues with occasional assistance',
          'Identifies issues but needs guidance to fix them',
          'Struggles to diagnose technical problems',
        ],
      },
      {
        text: "How well did the trainee's academic background prepare them for the technical demands of this role?",
        options: [
          'Very well prepared',
          'Adequately prepared',
          'Partially prepared — minor skill gaps',
          'Underprepared — significant skill gaps',
        ],
      },
      {
        text: 'How quickly does the trainee adapt to new tools, workflows, or technical instructions?',
        options: [
          'Adapts rapidly on first explanation',
          'Adapts well within a short practice period',
          'Needs repeated demonstrations',
          'Has difficulty adapting to new procedures',
        ],
      },
    ],
    text: [
      {
        text: 'Which specific technical skills, tools, or workflows did the trainee demonstrate strong proficiency in?',
      },
      {
        text: 'What technical competencies or industry tools should the trainee focus on strengthening before graduation?',
      },
      {
        text: 'Describe a notable technical task or project where the trainee applied effective problem-solving skills.',
      },
      {
        text: "How well did the trainee's academic coursework align with the practical technical requirements of your company?",
      },
      {
        text: 'What additional technical training or hands-on exposure would you recommend for future interns in this program?',
      },
    ],
  },

  'Professionalism & Work Ethic': {
    rating: [
      {
        text: 'Punctuality and attendance: Reports to work on time and adheres strictly to the agreed schedule.',
      },
      {
        text: 'Observes office decorum, company policies, confidentiality, and professional code of conduct.',
      },
      {
        text: 'Takes initiative and shows eagerness to learn new concepts and workplace responsibilities.',
      },
      {
        text: 'Manages time effectively and meets assigned task deadlines with dependability and accountability.',
      },
      {
        text: 'Maintains composure, positive attitude, and professionalism even under pressure or changing priorities.',
      },
    ],
    multiple_choice: [
      {
        text: "How consistent is the trainee's attendance and punctuality throughout the internship period?",
        options: [
          'Exemplary — always punctual with no unexcused absences',
          'Reliable — consistently on time with rare excused absences',
          'Moderate — occasional tardiness or absences',
          'Needs improvement — frequent tardiness or absences',
        ],
      },
      {
        text: 'How well does the trainee uphold workplace policies, dress code, and confidentiality standards?',
        options: [
          'Consistently exemplary compliance',
          'Complies reliably with all policies',
          'Occasional reminders needed',
          'Frequently overlooks workplace guidelines',
        ],
      },
      {
        text: "How would you describe the trainee's level of initiative and accountability?",
        options: [
          'Highly proactive — volunteers for tasks and owns outcomes',
          'Dependable — completes assigned duties responsibly',
          'Passive — waits for explicit instructions',
          'Needs closer monitoring to stay on task',
        ],
      },
      {
        text: 'How does the trainee respond to deadlines and workload pressure?',
        options: [
          'Consistently delivers ahead of or on schedule',
          'Usually meets deadlines reliably',
          'Occasionally misses deadlines without early notice',
          'Frequently struggles with time management',
        ],
      },
      {
        text: 'How professionally does the trainee conduct themselves with clients, colleagues, and supervisors?',
        options: [
          'Always courteous, respectful, and composed',
          'Generally professional and respectful',
          'Occasionally informal or inconsistent',
          'Needs coaching on workplace etiquette',
        ],
      },
    ],
    text: [
      {
        text: "Comment on the trainee's punctuality, dependability, and adherence to workplace policies.",
      },
      {
        text: 'Provide an example of how the trainee demonstrated initiative, integrity, or accountability during their OJT.',
      },
      {
        text: 'Are there any work habits, time-management practices, or professional behaviors the trainee should improve?',
      },
      {
        text: 'How well did the trainee handle workplace confidentiality, ethics, and organizational culture?',
      },
      {
        text: "Share any observations regarding the trainee's attitude toward learning and daily responsibilities.",
      },
    ],
  },

  'Communication & Teamwork': {
    rating: [
      {
        text: 'Effectively communicates ideas, status updates, and questions with supervisors and team members.',
      },
      {
        text: 'Collaborates constructively in team tasks and accepts feedback with an open, positive mindset.',
      },
      {
        text: 'Prepares clear, organized, and concise written reports, emails, or workplace documentation.',
      },
      {
        text: 'Demonstrates active listening and accurately follows verbal and written instructions.',
      },
      {
        text: 'Contributes respectfully to a harmonious, inclusive, and supportive team environment.',
      },
    ],
    multiple_choice: [
      {
        text: 'How effectively does the trainee communicate task progress, blockers, and questions?',
        options: [
          'Clear, proactive, and timely communication',
          'Communicates adequately when expected',
          'Hesitant to ask questions or report blockers early',
          'Communication is frequently unclear or delayed',
        ],
      },
      {
        text: 'How does the trainee respond to constructive criticism and supervisor feedback?',
        options: [
          'Welcomes feedback eagerly and applies it immediately',
          'Accepts feedback professionally and improves',
          'Accepts feedback but applies changes slowly',
          'Defensive or resistant to constructive feedback',
        ],
      },
      {
        text: 'How well does the trainee collaborate within a team setting?',
        options: [
          'Strong team player who elevates group productivity',
          'Cooperates smoothly and fulfills shared duties',
          'Works better individually than in groups',
          'Needs support in collaborating with teammates',
        ],
      },
      {
        text: "How clear and accurate is the trainee's written and verbal workplace communication?",
        options: [
          'Consistently clear, concise, and professional',
          'Generally clear with minor refinements needed',
          'Occasionally ambiguous or disorganized',
          'Needs substantial improvement in clarity',
        ],
      },
      {
        text: 'How effectively does the trainee follow multi-step instructions from supervisors?',
        options: [
          'Follows instructions accurately without repetition',
          'Follows most instructions with occasional clarification',
          'Frequently needs instructions repeated',
          'Struggles to follow structured directives',
        ],
      },
    ],
    text: [
      {
        text: 'How effectively did the trainee communicate and collaborate with supervisors and team members?',
      },
      {
        text: 'Describe how the trainee responded to constructive feedback or coaching during the internship.',
      },
      {
        text: "What strengths or areas for growth did you observe in the trainee's written and verbal communication?",
      },
      {
        text: 'How well did the trainee integrate into your team culture and contribute to collaborative projects?',
      },
      {
        text: 'What interpersonal or communication skills would help this trainee succeed in their future career?',
      },
    ],
  },

  'Quality & Accuracy of Work': {
    rating: [
      {
        text: 'Consistently produces accurate, neat, and high-quality outputs with strong attention to detail.',
      },
      {
        text: 'Reviews and verifies own work to minimize errors before submitting deliverables.',
      },
      {
        text: 'Maintains consistent productivity and quality standards even across repetitive or complex tasks.',
      },
      {
        text: 'Follows established quality assurance checklists, templates, and documentation requirements.',
      },
      {
        text: 'Delivers practical, well-organized outputs that meet host company standards and objectives.',
      },
    ],
    multiple_choice: [
      {
        text: "How consistently do the trainee's deliverables meet your company's quality standards?",
        options: [
          'Consistently exceeds quality standards',
          'Consistently meets quality standards',
          'Meets standards after minor revisions',
          'Frequently requires substantial rework',
        ],
      },
      {
        text: "How much review or revision is typically needed before the trainee's outputs can be finalized?",
        options: [
          'Ready for use with little to no revision',
          'Requires minor edits or polishing',
          'Requires moderate supervision and corrections',
          'Requires extensive rework',
        ],
      },
      {
        text: "How thorough is the trainee's attention to detail when handling data, files, or tasks?",
        options: [
          'Exceptionally thorough and error-free',
          'Careful with only occasional minor slips',
          'Inconsistent — sometimes overlooks details',
          'Frequently misses critical details',
        ],
      },
      {
        text: "How would you evaluate the trainee's balance between work speed and output accuracy?",
        options: [
          'Fast and highly accurate',
          'Steady pace with reliable accuracy',
          'Accurate but slower than expected',
          'Rushes tasks at the expense of accuracy',
        ],
      },
      {
        text: 'How consistently does the trainee follow established formats, SOPs, and quality guidelines?',
        options: [
          'Always adheres strictly to SOPs and templates',
          'Usually follows guidelines accurately',
          'Needs occasional reminders on formatting/SOPs',
          'Rarely adheres to standard procedures',
        ],
      },
    ],
    text: [
      {
        text: "Comment on the overall accuracy, thoroughness, and quality of the trainee's completed outputs.",
      },
      {
        text: "Which deliverable or assignment best demonstrated the trainee's attention to detail and work quality?",
      },
      {
        text: 'What recurring errors or quality gaps, if any, should the trainee address moving forward?',
      },
      {
        text: 'How well did the trainee balance productivity, deadlines, and quality standards?',
      },
      {
        text: 'What quality-assurance habits or practices would you advise the trainee to adopt in future roles?',
      },
    ],
  },

  'Overall Recommendation': {
    rating: [
      {
        text: 'Overall job readiness: Prepared to transition into an entry-level professional role in the industry.',
      },
      {
        text: 'Overall internship performance relative to expectations for a graduating OJT trainee.',
      },
      {
        text: 'Demonstrated consistent growth and measurable skill improvement from start to completion of OJT.',
      },
      {
        text: "Added meaningful value and reliable support to the host department's daily operations.",
      },
      {
        text: 'Confidence in recommending this trainee to partner employers or hiring managers.',
      },
    ],
    multiple_choice: [
      {
        text: 'Would your company consider hiring this student as a regular employee upon graduation?',
        options: [
          'Highly Recommended - Ready for immediate employment',
          'Recommended - Would consider after graduation',
          'Needs further academic/technical preparation',
          'Not recommended at this time',
        ],
      },
      {
        text: "What is your overall performance rating summary for this trainee's internship?",
        options: [
          'Outstanding — Top-tier intern performance',
          'Very Satisfactory — Above standard expectations',
          'Satisfactory — Met core internship requirements',
          'Needs Improvement — Below expected standards',
        ],
      },
      {
        text: 'Would your company be willing to endorse or refer this trainee to partner organizations?',
        options: [
          'Yes, with highest endorsement',
          'Yes, with standard recommendation',
          'Only for supervised junior roles',
          'No, not at this time',
        ],
      },
      {
        text: 'How ready is this trainee for full-time employment in their field of specialization?',
        options: [
          'Immediately job-ready',
          'Job-ready with standard onboarding',
          'Needs additional mentoring before full-time work',
          'Not yet ready for industry placement',
        ],
      },
      {
        text: 'Would your organization welcome future OJT trainees from this academic program based on this experience?',
        options: [
          'Definitely yes — eager to host more trainees',
          'Yes — open to future placements',
          'Maybe — depending on candidate screening',
          'No — not planning to host at this time',
        ],
      },
    ],
    text: [
      {
        text: 'Provide your overall endorsement statement or hiring recommendation for this trainee.',
      },
      {
        text: "Which specific job roles or industry tracks do you believe best fit this trainee's capabilities?",
      },
      {
        text: "Summarize the trainee's overall growth and impact during their placement with your organization.",
      },
      {
        text: 'What key milestone or achievement made this trainee stand out (or need additional support)?',
      },
      {
        text: "Do you have any final recommendations for the university regarding this student's career readiness?",
      },
    ],
  },

  'Company Feedback & Remarks': {
    rating: [
      {
        text: 'Overall satisfaction with the CHMSU OJT coordination, documentation, and placement process.',
      },
      {
        text: "Alignment between the university's academic curriculum and current industry workplace needs.",
      },
      {
        text: 'Effectiveness of pre-deployment orientation and readiness of the assigned trainee.',
      },
      {
        text: 'Responsiveness and support provided by the OJT academic coordinator throughout the practicum.',
      },
      {
        text: 'Likelihood of continuing partnership with CHMSU for future internship and graduate hiring programs.',
      },
    ],
    multiple_choice: [
      {
        text: 'How satisfied is your company with the overall OJT placement and coordination experience?',
        options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied'],
      },
      {
        text: "How well aligned was the trainee's academic curriculum with your workplace tools and practices?",
        options: [
          'Strongly aligned with industry standards',
          'Mostly aligned with minor gaps',
          'Partially aligned — curriculum updates recommended',
          'Poorly aligned with current industry needs',
        ],
      },
      {
        text: 'Which area would most improve future CHMSU OJT trainees before deployment?',
        options: [
          'Hands-on technical tools and software',
          'Workplace communication and reporting',
          'Time management and professional etiquette',
          'Current preparation is already strong',
        ],
      },
      {
        text: 'Would your company like to stay connected with CHMSU for graduate recruitment and future OJT cohorts?',
        options: [
          'Yes — both OJT hosting and graduate hiring',
          'Yes — OJT hosting only',
          'Yes — graduate hiring only',
          'Not at this time',
        ],
      },
      {
        text: 'How clear and practical was this evaluation process for your company supervisors?',
        options: [
          'Very clear and efficient',
          'Clear and manageable',
          'Somewhat lengthy',
          'Needs simplification',
        ],
      },
    ],
    text: [
      {
        text: "What are the student trainee's notable strengths observed during their internship?",
      },
      {
        text: 'What constructive advice or areas for improvement do you recommend for their professional development?',
      },
      {
        text: 'What skills, software, or topics should the university emphasize more in its curriculum to better prepare future trainees?',
      },
      {
        text: "Share any additional remarks, commendations, or observations regarding the trainee's OJT performance.",
      },
      {
        text: 'Do you have suggestions on how CHMSU can strengthen its OJT partnership and coordination with your company?',
      },
    ],
  },

  'Leadership & Initiative': {
    rating: [
      {
        text: 'Proactively identifies tasks that need attention and takes ownership without waiting to be asked.',
      },
      {
        text: 'Demonstrates sound judgment and confidence when coordinating activities or assisting peers.',
      },
      {
        text: 'Proposes practical ideas or workflow improvements that benefit the team or department.',
      },
      {
        text: 'Stays accountable for outcomes and follows through persistently until tasks are completed.',
      },
      {
        text: 'Models positive energy, resilience, and constructive leadership behavior in group assignments.',
      },
    ],
    multiple_choice: [
      {
        text: 'How frequently does the trainee take proactive initiative on workplace tasks?',
        options: [
          'Consistently proactive — regularly goes beyond assigned tasks',
          'Often takes initiative when opportunities arise',
          'Occasionally takes initiative with encouragement',
          'Rarely takes initiative — relies on direct instruction',
        ],
      },
      {
        text: 'How effectively does the trainee step up during challenging or fast-moving team tasks?',
        options: [
          'Takes ownership calmly and helps guide others',
          'Steps up reliably to support team priorities',
          'Follows direction well but avoids leading',
          'Hesitates under pressure and requires direction',
        ],
      },
      {
        text: 'How would you evaluate the trainee’s potential for future leadership or senior responsibilities?',
        options: [
          'High leadership potential',
          'Promising potential with further experience',
          'Best suited for individual contributor roles for now',
          'Needs foundational confidence and ownership first',
        ],
      },
      {
        text: 'How often does the trainee contribute constructive suggestions or process improvements?',
        options: [
          'Frequently shares valuable, actionable ideas',
          'Occasionally offers helpful suggestions',
          'Rarely offers suggestions unless asked',
          'Does not yet contribute improvement ideas',
        ],
      },
      {
        text: 'How responsibly does the trainee handle independent or lightly supervised assignments?',
        options: [
          'Thrives with autonomy and delivers reliably',
          'Handles independent work well with periodic check-ins',
          'Needs structured milestones to stay on track',
          'Requires direct supervision throughout',
        ],
      },
    ],
    text: [
      {
        text: 'Describe a situation where the trainee showed strong initiative, ownership, or leadership.',
      },
      {
        text: 'How effectively did the trainee handle independent responsibilities without close supervision?',
      },
      {
        text: 'What leadership or decision-making habits could help this trainee grow further?',
      },
      {
        text: 'Did the trainee propose any helpful ideas or solutions during their placement? Please share.',
      },
      {
        text: 'Share any remarks on the trainee’s readiness to take on greater ownership in a professional role.',
      },
    ],
  },
};

const ALIAS_MAP = {
  'company feedback': 'Company Feedback & Remarks',
  'company feedback & remarks': 'Company Feedback & Remarks',
  'feedback & remarks': 'Company Feedback & Remarks',
  'technical skills': 'Technical Competence',
  'technical competence': 'Technical Competence',
  'technical skills & quality of work': 'Technical Competence',
  'professionalism': 'Professionalism & Work Ethic',
  'work ethic': 'Professionalism & Work Ethic',
  'professionalism & work ethic': 'Professionalism & Work Ethic',
  'communication': 'Communication & Teamwork',
  'teamwork': 'Communication & Teamwork',
  'communication & teamwork': 'Communication & Teamwork',
  'quality of work': 'Quality & Accuracy of Work',
  'quality & accuracy of work': 'Quality & Accuracy of Work',
  'overall recommendation': 'Overall Recommendation',
  'overall assessment': 'Overall Recommendation',
  'overall assessment & recommendation': 'Overall Recommendation',
  'leadership & initiative': 'Leadership & Initiative',
  'leadership': 'Leadership & Initiative',
  'initiative': 'Leadership & Initiative',
};

function resolvePresetKey(rawCategory) {
  const norm = String(rawCategory || '').trim().toLowerCase();
  if (!norm) return null;

  if (ALIAS_MAP[norm]) return ALIAS_MAP[norm];

  // Exact case-insensitive match against BANK keys
  const direct = Object.keys(BANK).find(k => k.toLowerCase() === norm);
  if (direct) return direct;

  // Keyword matching for common custom category names
  if (/(leader|initiat|proactiv|ownership)/.test(norm)) return 'Leadership & Initiative';
  if (/(tech|skill|software|system|tool|coding|program|competenc|engineer)/.test(norm)) return 'Technical Competence';
  if (/(ethic|profess|conduct|punctual|attend|disciplin|reliab|integrity|attitude)/.test(norm)) return 'Professionalism & Work Ethic';
  if (/(comm|team|collab|interpersonal|present|report)/.test(norm)) return 'Communication & Teamwork';
  if (/(qualit|accura|output|deliver|detail|productiv|efficien)/.test(norm)) return 'Quality & Accuracy of Work';
  if (/(recommend|hire|employ|endorse|readiness|overall)/.test(norm)) return 'Overall Recommendation';
  if (/(feedback|remark|comment|suggest|advice|strength)/.test(norm)) return 'Company Feedback & Remarks';

  return null;
}

function buildCustomCategorySuggestions(categoryName, responseType) {
  const cat = String(categoryName || '').trim();
  if (!cat) return [];

  if (responseType === 'rating') {
    return [
      { text: `Demonstrates consistent competence and reliability in ${cat}.` },
      { text: `Applies established standards and best practices related to ${cat} in daily tasks.` },
      { text: `Proactively identifies and addresses challenges involving ${cat}.` },
      { text: `Shows measurable progress and responsiveness to coaching in ${cat}.` },
      { text: `Maintains high performance expectations in ${cat} with minimal supervision.` },
    ];
  }

  if (responseType === 'multiple_choice') {
    return [
      {
        text: `How would you rate the trainee's overall performance in ${cat}?`,
        options: [
          'Exceeds Expectations',
          'Meets Expectations',
          'Developing / Partially Meets',
          'Needs Improvement',
        ],
      },
      {
        text: `How independently does the trainee handle responsibilities related to ${cat}?`,
        options: [
          'Fully independent',
          'Mostly independent with occasional guidance',
          'Requires regular supervision',
          'Requires constant coaching',
        ],
      },
      {
        text: `How consistently does the trainee apply workplace standards in ${cat}?`,
        options: [
          'Always consistent',
          'Usually consistent',
          'Occasionally inconsistent',
          'Needs frequent reminders',
        ],
      },
      {
        text: `How much improvement did the trainee show in ${cat} during the internship?`,
        options: [
          'Significant growth',
          'Steady improvement',
          'Maintained baseline level',
          'Limited progress observed',
        ],
      },
      {
        text: `How prepared is the trainee to handle ${cat} in an entry-level workplace role?`,
        options: [
          'Fully job-ready',
          'Ready with standard onboarding',
          'Needs further practice',
          'Not yet ready',
        ],
      },
    ];
  }

  if (responseType === 'text') {
    return [
      { text: `What key strengths did the trainee demonstrate in ${cat}?` },
      { text: `Describe a specific task or situation where the trainee applied ${cat} effectively.` },
      { text: `What areas of ${cat} should the trainee focus on improving for future roles?` },
      { text: `How well did the trainee respond to coaching or feedback regarding ${cat}?` },
      { text: `Share any additional remarks or recommendations regarding the trainee's performance in ${cat}.` },
    ];
  }

  return [];
}

/**
 * Returns 5 suggested default criteria for a given category and responseType.
 * @param {string} category
 * @param {'rating'|'multiple_choice'|'text'|''} responseType
 * @returns {Array<{ text: string, options?: string[] }>}
 */
export function getSuggestedCriteria(category, responseType) {
  const cleanCat = String(category || '').trim();
  const cleanType = String(responseType || '').trim();
  if (!cleanCat || !cleanType) return [];
  if (!['rating', 'multiple_choice', 'text'].includes(cleanType)) return [];

  const presetKey = resolvePresetKey(cleanCat);
  if (presetKey && BANK[presetKey]?.[cleanType]) {
    return BANK[presetKey][cleanType];
  }

  return buildCustomCategorySuggestions(cleanCat, cleanType);
}
