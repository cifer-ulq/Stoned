--
-- PostgreSQL database dump
--


-- Dumped from database version 17.9
-- Dumped by pg_dump version 17.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.time_logs DROP CONSTRAINT IF EXISTS time_logs_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.time_logs DROP CONSTRAINT IF EXISTS time_logs_ojt_record_id_foreign;
ALTER TABLE IF EXISTS ONLY public.supervisor_profiles DROP CONSTRAINT IF EXISTS supervisor_profiles_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.student_skills DROP CONSTRAINT IF EXISTS student_skills_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.student_profiles DROP CONSTRAINT IF EXISTS student_profiles_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.student_ojt_requirements DROP CONSTRAINT IF EXISTS student_ojt_requirements_supervisor_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.student_ojt_requirements DROP CONSTRAINT IF EXISTS student_ojt_requirements_student_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.student_ojt_requirements DROP CONSTRAINT IF EXISTS student_ojt_requirements_posting_id_foreign;
ALTER TABLE IF EXISTS ONLY public.student_ojt_requirements DROP CONSTRAINT IF EXISTS student_ojt_requirements_interest_id_foreign;
ALTER TABLE IF EXISTS ONLY public.student_ojt_interests DROP CONSTRAINT IF EXISTS student_ojt_interests_student_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.student_ojt_interests DROP CONSTRAINT IF EXISTS student_ojt_interests_ojt_posting_id_foreign;
ALTER TABLE IF EXISTS ONLY public.student_ojt_interests DROP CONSTRAINT IF EXISTS student_ojt_interests_endorsed_by_foreign;
ALTER TABLE IF EXISTS ONLY public.student_experiences DROP CONSTRAINT IF EXISTS student_experiences_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.student_evaluations DROP CONSTRAINT IF EXISTS student_evaluations_template_id_foreign;
ALTER TABLE IF EXISTS ONLY public.student_evaluations DROP CONSTRAINT IF EXISTS student_evaluations_supervisor_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.student_evaluations DROP CONSTRAINT IF EXISTS student_evaluations_student_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.student_evaluations DROP CONSTRAINT IF EXISTS student_evaluations_ojt_record_id_foreign;
ALTER TABLE IF EXISTS ONLY public.student_evaluations DROP CONSTRAINT IF EXISTS student_evaluations_ojt_posting_id_foreign;
ALTER TABLE IF EXISTS ONLY public.student_evaluations DROP CONSTRAINT IF EXISTS student_evaluations_company_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.student_evaluation_answers DROP CONSTRAINT IF EXISTS student_evaluation_answers_student_evaluation_id_foreign;
ALTER TABLE IF EXISTS ONLY public.student_evaluation_answers DROP CONSTRAINT IF EXISTS student_evaluation_answers_evaluation_question_id_foreign;
ALTER TABLE IF EXISTS ONLY public.student_education DROP CONSTRAINT IF EXISTS student_education_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.student_achievements DROP CONSTRAINT IF EXISTS student_achievements_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.portfolio_projects DROP CONSTRAINT IF EXISTS portfolio_projects_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.ojt_records DROP CONSTRAINT IF EXISTS ojt_records_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.ojt_pull_out_requests DROP CONSTRAINT IF EXISTS ojt_pull_out_requests_supervisor_id_foreign;
ALTER TABLE IF EXISTS ONLY public.ojt_pull_out_requests DROP CONSTRAINT IF EXISTS ojt_pull_out_requests_student_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.ojt_pull_out_requests DROP CONSTRAINT IF EXISTS ojt_pull_out_requests_ojt_record_id_foreign;
ALTER TABLE IF EXISTS ONLY public.ojt_pull_out_requests DROP CONSTRAINT IF EXISTS ojt_pull_out_requests_ojt_interest_id_foreign;
ALTER TABLE IF EXISTS ONLY public.ojt_pull_out_requests DROP CONSTRAINT IF EXISTS ojt_pull_out_requests_admin_action_by_foreign;
ALTER TABLE IF EXISTS ONLY public.ojt_postings DROP CONSTRAINT IF EXISTS ojt_postings_company_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.ojt_emergency_requests DROP CONSTRAINT IF EXISTS ojt_emergency_requests_student_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.ojt_emergency_requests DROP CONSTRAINT IF EXISTS ojt_emergency_requests_ojt_record_id_foreign;
ALTER TABLE IF EXISTS ONLY public.ojt_emergency_requests DROP CONSTRAINT IF EXISTS ojt_emergency_requests_ojt_interest_id_foreign;
ALTER TABLE IF EXISTS ONLY public.ojt_emergency_requests DROP CONSTRAINT IF EXISTS ojt_emergency_requests_coordinator_action_by_foreign;
ALTER TABLE IF EXISTS ONLY public.jobseeker_profiles DROP CONSTRAINT IF EXISTS jobseeker_profiles_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.job_listings DROP CONSTRAINT IF EXISTS job_listings_company_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.job_applications DROP CONSTRAINT IF EXISTS job_applications_job_listing_id_foreign;
ALTER TABLE IF EXISTS ONLY public.job_applications DROP CONSTRAINT IF EXISTS job_applications_applicant_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.interviews DROP CONSTRAINT IF EXISTS interviews_job_application_id_foreign;
ALTER TABLE IF EXISTS ONLY public.interviews DROP CONSTRAINT IF EXISTS interviews_company_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.graduate_profiles DROP CONSTRAINT IF EXISTS graduate_profiles_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.evaluation_templates DROP CONSTRAINT IF EXISTS evaluation_templates_supervisor_id_foreign;
ALTER TABLE IF EXISTS ONLY public.evaluation_questions DROP CONSTRAINT IF EXISTS evaluation_questions_template_id_foreign;
ALTER TABLE IF EXISTS ONLY public.company_profiles DROP CONSTRAINT IF EXISTS company_profiles_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_sender_id_foreign;
ALTER TABLE IF EXISTS ONLY public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_receiver_id_foreign;
ALTER TABLE IF EXISTS ONLY public.app_notifications DROP CONSTRAINT IF EXISTS app_notifications_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.alumni_peo_assessments DROP CONSTRAINT IF EXISTS alumni_peo_assessments_user_id_foreign;
ALTER TABLE IF EXISTS ONLY public.alumni_peo_assessments DROP CONSTRAINT IF EXISTS alumni_peo_assessments_peo_id_foreign;
DROP INDEX IF EXISTS public.student_evaluations_student_user_id_term_status_index;
DROP INDEX IF EXISTS public.student_evaluations_student_user_id_company_user_id_status_inde;
DROP INDEX IF EXISTS public.sessions_user_id_index;
DROP INDEX IF EXISTS public.sessions_last_activity_index;
DROP INDEX IF EXISTS public.personal_access_tokens_tokenable_type_tokenable_id_index;
DROP INDEX IF EXISTS public.personal_access_tokens_expires_at_index;
DROP INDEX IF EXISTS public.ojt_pull_out_requests_student_user_id_status_index;
DROP INDEX IF EXISTS public.ojt_pull_out_requests_status_index;
DROP INDEX IF EXISTS public.ojt_emergency_requests_type_index;
DROP INDEX IF EXISTS public.ojt_emergency_requests_student_user_id_coordinator_status_index;
DROP INDEX IF EXISTS public.jobs_queue_index;
DROP INDEX IF EXISTS public.chat_messages_receiver_id_read_at_index;
DROP INDEX IF EXISTS public.chat_messages_conversation_key_created_at_index;
DROP INDEX IF EXISTS public.cache_locks_expiration_index;
DROP INDEX IF EXISTS public.cache_expiration_index;
DROP INDEX IF EXISTS public.app_notifications_user_id_read_at_index;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_unique;
ALTER TABLE IF EXISTS ONLY public.alumni_peo_assessments DROP CONSTRAINT IF EXISTS unique_alumni_peo_year;
ALTER TABLE IF EXISTS ONLY public.time_logs DROP CONSTRAINT IF EXISTS time_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.supervisor_profiles DROP CONSTRAINT IF EXISTS supervisor_profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.student_skills DROP CONSTRAINT IF EXISTS student_skills_pkey;
ALTER TABLE IF EXISTS ONLY public.student_profiles DROP CONSTRAINT IF EXISTS student_profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.student_ojt_requirements DROP CONSTRAINT IF EXISTS student_ojt_requirements_pkey;
ALTER TABLE IF EXISTS ONLY public.student_ojt_interests DROP CONSTRAINT IF EXISTS student_ojt_interests_student_user_id_ojt_posting_id_unique;
ALTER TABLE IF EXISTS ONLY public.student_ojt_interests DROP CONSTRAINT IF EXISTS student_ojt_interests_pkey;
ALTER TABLE IF EXISTS ONLY public.student_experiences DROP CONSTRAINT IF EXISTS student_experiences_pkey;
ALTER TABLE IF EXISTS ONLY public.student_evaluations DROP CONSTRAINT IF EXISTS student_evaluations_pkey;
ALTER TABLE IF EXISTS ONLY public.student_evaluation_answers DROP CONSTRAINT IF EXISTS student_evaluation_answers_pkey;
ALTER TABLE IF EXISTS ONLY public.student_education DROP CONSTRAINT IF EXISTS student_education_pkey;
ALTER TABLE IF EXISTS ONLY public.student_achievements DROP CONSTRAINT IF EXISTS student_achievements_pkey;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.portfolio_projects DROP CONSTRAINT IF EXISTS portfolio_projects_pkey;
ALTER TABLE IF EXISTS ONLY public.personal_access_tokens DROP CONSTRAINT IF EXISTS personal_access_tokens_token_unique;
ALTER TABLE IF EXISTS ONLY public.personal_access_tokens DROP CONSTRAINT IF EXISTS personal_access_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.peo_definitions DROP CONSTRAINT IF EXISTS peo_definitions_pkey;
ALTER TABLE IF EXISTS ONLY public.password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.ojt_records DROP CONSTRAINT IF EXISTS ojt_records_pkey;
ALTER TABLE IF EXISTS ONLY public.ojt_pull_out_requests DROP CONSTRAINT IF EXISTS ojt_pull_out_requests_pkey;
ALTER TABLE IF EXISTS ONLY public.ojt_postings DROP CONSTRAINT IF EXISTS ojt_postings_pkey;
ALTER TABLE IF EXISTS ONLY public.ojt_emergency_requests DROP CONSTRAINT IF EXISTS ojt_emergency_requests_pkey;
ALTER TABLE IF EXISTS ONLY public.migrations DROP CONSTRAINT IF EXISTS migrations_pkey;
ALTER TABLE IF EXISTS ONLY public.jobseeker_profiles DROP CONSTRAINT IF EXISTS jobseeker_profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.jobs DROP CONSTRAINT IF EXISTS jobs_pkey;
ALTER TABLE IF EXISTS ONLY public.job_listings DROP CONSTRAINT IF EXISTS job_listings_pkey;
ALTER TABLE IF EXISTS ONLY public.job_batches DROP CONSTRAINT IF EXISTS job_batches_pkey;
ALTER TABLE IF EXISTS ONLY public.job_applications DROP CONSTRAINT IF EXISTS job_applications_pkey;
ALTER TABLE IF EXISTS ONLY public.job_applications DROP CONSTRAINT IF EXISTS job_applications_job_listing_id_applicant_user_id_unique;
ALTER TABLE IF EXISTS ONLY public.interviews DROP CONSTRAINT IF EXISTS interviews_pkey;
ALTER TABLE IF EXISTS ONLY public.graduate_profiles DROP CONSTRAINT IF EXISTS graduate_profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.failed_jobs DROP CONSTRAINT IF EXISTS failed_jobs_uuid_unique;
ALTER TABLE IF EXISTS ONLY public.failed_jobs DROP CONSTRAINT IF EXISTS failed_jobs_pkey;
ALTER TABLE IF EXISTS ONLY public.evaluation_templates DROP CONSTRAINT IF EXISTS evaluation_templates_pkey;
ALTER TABLE IF EXISTS ONLY public.evaluation_questions DROP CONSTRAINT IF EXISTS evaluation_questions_pkey;
ALTER TABLE IF EXISTS ONLY public.company_profiles DROP CONSTRAINT IF EXISTS company_profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_pkey;
ALTER TABLE IF EXISTS ONLY public.cache DROP CONSTRAINT IF EXISTS cache_pkey;
ALTER TABLE IF EXISTS ONLY public.cache_locks DROP CONSTRAINT IF EXISTS cache_locks_pkey;
ALTER TABLE IF EXISTS ONLY public.app_notifications DROP CONSTRAINT IF EXISTS app_notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.alumni_peo_assessments DROP CONSTRAINT IF EXISTS alumni_peo_assessments_pkey;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.time_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.supervisor_profiles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.student_skills ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.student_profiles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.student_ojt_requirements ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.student_ojt_interests ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.student_experiences ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.student_evaluations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.student_evaluation_answers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.student_education ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.student_achievements ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.portfolio_projects ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.personal_access_tokens ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.peo_definitions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.ojt_records ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.ojt_pull_out_requests ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.ojt_postings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.ojt_emergency_requests ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.migrations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.jobseeker_profiles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.jobs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.job_listings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.job_applications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.interviews ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.graduate_profiles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.failed_jobs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.evaluation_templates ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.evaluation_questions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.company_profiles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.chat_messages ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.app_notifications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.alumni_peo_assessments ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.time_logs_id_seq;
DROP TABLE IF EXISTS public.time_logs;
DROP SEQUENCE IF EXISTS public.supervisor_profiles_id_seq;
DROP TABLE IF EXISTS public.supervisor_profiles;
DROP SEQUENCE IF EXISTS public.student_skills_id_seq;
DROP TABLE IF EXISTS public.student_skills;
DROP SEQUENCE IF EXISTS public.student_profiles_id_seq;
DROP TABLE IF EXISTS public.student_profiles;
DROP SEQUENCE IF EXISTS public.student_ojt_requirements_id_seq;
DROP TABLE IF EXISTS public.student_ojt_requirements;
DROP SEQUENCE IF EXISTS public.student_ojt_interests_id_seq;
DROP TABLE IF EXISTS public.student_ojt_interests;
DROP SEQUENCE IF EXISTS public.student_experiences_id_seq;
DROP TABLE IF EXISTS public.student_experiences;
DROP SEQUENCE IF EXISTS public.student_evaluations_id_seq;
DROP TABLE IF EXISTS public.student_evaluations;
DROP SEQUENCE IF EXISTS public.student_evaluation_answers_id_seq;
DROP TABLE IF EXISTS public.student_evaluation_answers;
DROP SEQUENCE IF EXISTS public.student_education_id_seq;
DROP TABLE IF EXISTS public.student_education;
DROP SEQUENCE IF EXISTS public.student_achievements_id_seq;
DROP TABLE IF EXISTS public.student_achievements;
DROP TABLE IF EXISTS public.sessions;
DROP SEQUENCE IF EXISTS public.portfolio_projects_id_seq;
DROP TABLE IF EXISTS public.portfolio_projects;
DROP SEQUENCE IF EXISTS public.personal_access_tokens_id_seq;
DROP TABLE IF EXISTS public.personal_access_tokens;
DROP SEQUENCE IF EXISTS public.peo_definitions_id_seq;
DROP TABLE IF EXISTS public.peo_definitions;
DROP TABLE IF EXISTS public.password_reset_tokens;
DROP SEQUENCE IF EXISTS public.ojt_records_id_seq;
DROP TABLE IF EXISTS public.ojt_records;
DROP SEQUENCE IF EXISTS public.ojt_pull_out_requests_id_seq;
DROP TABLE IF EXISTS public.ojt_pull_out_requests;
DROP SEQUENCE IF EXISTS public.ojt_postings_id_seq;
DROP TABLE IF EXISTS public.ojt_postings;
DROP SEQUENCE IF EXISTS public.ojt_emergency_requests_id_seq;
DROP TABLE IF EXISTS public.ojt_emergency_requests;
DROP SEQUENCE IF EXISTS public.migrations_id_seq;
DROP TABLE IF EXISTS public.migrations;
DROP SEQUENCE IF EXISTS public.jobseeker_profiles_id_seq;
DROP TABLE IF EXISTS public.jobseeker_profiles;
DROP SEQUENCE IF EXISTS public.jobs_id_seq;
DROP TABLE IF EXISTS public.jobs;
DROP SEQUENCE IF EXISTS public.job_listings_id_seq;
DROP TABLE IF EXISTS public.job_listings;
DROP TABLE IF EXISTS public.job_batches;
DROP SEQUENCE IF EXISTS public.job_applications_id_seq;
DROP TABLE IF EXISTS public.job_applications;
DROP SEQUENCE IF EXISTS public.interviews_id_seq;
DROP TABLE IF EXISTS public.interviews;
DROP SEQUENCE IF EXISTS public.graduate_profiles_id_seq;
DROP TABLE IF EXISTS public.graduate_profiles;
DROP SEQUENCE IF EXISTS public.failed_jobs_id_seq;
DROP TABLE IF EXISTS public.failed_jobs;
DROP SEQUENCE IF EXISTS public.evaluation_templates_id_seq;
DROP TABLE IF EXISTS public.evaluation_templates;
DROP SEQUENCE IF EXISTS public.evaluation_questions_id_seq;
DROP TABLE IF EXISTS public.evaluation_questions;
DROP SEQUENCE IF EXISTS public.company_profiles_id_seq;
DROP TABLE IF EXISTS public.company_profiles;
DROP SEQUENCE IF EXISTS public.chat_messages_id_seq;
DROP TABLE IF EXISTS public.chat_messages;
DROP TABLE IF EXISTS public.cache_locks;
DROP TABLE IF EXISTS public.cache;
DROP SEQUENCE IF EXISTS public.app_notifications_id_seq;
DROP TABLE IF EXISTS public.app_notifications;
DROP SEQUENCE IF EXISTS public.alumni_peo_assessments_id_seq;
DROP TABLE IF EXISTS public.alumni_peo_assessments;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alumni_peo_assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alumni_peo_assessments (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    peo_id bigint NOT NULL,
    score numeric(4,2) NOT NULL,
    assessment_source character varying(50) DEFAULT 'direct_survey'::character varying NOT NULL,
    survey_year character varying(20) NOT NULL,
    evidence_summary text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: alumni_peo_assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.alumni_peo_assessments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: alumni_peo_assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.alumni_peo_assessments_id_seq OWNED BY public.alumni_peo_assessments.id;


--
-- Name: app_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_notifications (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    type character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    data json,
    read_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: app_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.app_notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: app_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.app_notifications_id_seq OWNED BY public.app_notifications.id;


--
-- Name: cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration bigint NOT NULL
);


--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration bigint NOT NULL
);


--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_messages (
    id bigint NOT NULL,
    conversation_key character varying(255) NOT NULL,
    sender_id bigint NOT NULL,
    receiver_id bigint NOT NULL,
    message text NOT NULL,
    read_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: chat_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chat_messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chat_messages_id_seq OWNED BY public.chat_messages.id;


--
-- Name: company_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_profiles (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    company_name character varying(255),
    company_location character varying(255),
    company_type character varying(255),
    website character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    company_size character varying(255),
    contact_email character varying(255),
    contact_phone character varying(255),
    description text,
    logo_url character varying(255),
    profile_completed boolean DEFAULT false NOT NULL,
    contact_person character varying(255),
    moa_file_path character varying(255),
    moa_start_date date,
    moa_end_date date,
    moa_status character varying(255) DEFAULT 'Pending'::character varying NOT NULL,
    status character varying(255) DEFAULT 'Pending'::character varying NOT NULL,
    ownership_type character varying(255),
    year_founded character varying(255),
    full_address character varying(255),
    contact_title character varying(255),
    registration_source character varying(255) DEFAULT 'admin'::character varying NOT NULL,
    moa_requested_at timestamp(0) without time zone,
    moa_request_notes text
);


--
-- Name: company_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.company_profiles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: company_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.company_profiles_id_seq OWNED BY public.company_profiles.id;


--
-- Name: evaluation_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.evaluation_questions (
    id bigint NOT NULL,
    template_id bigint NOT NULL,
    category character varying(100) NOT NULL,
    question_text text NOT NULL,
    question_type character varying(30) DEFAULT 'rating'::character varying NOT NULL,
    options json,
    scale_min integer DEFAULT 1 NOT NULL,
    scale_max integer DEFAULT 5 NOT NULL,
    is_required boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: evaluation_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.evaluation_questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: evaluation_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.evaluation_questions_id_seq OWNED BY public.evaluation_questions.id;


--
-- Name: evaluation_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.evaluation_templates (
    id bigint NOT NULL,
    supervisor_id bigint,
    program character varying(50),
    title character varying(255) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    term character varying(20) DEFAULT 'both'::character varying NOT NULL
);


--
-- Name: evaluation_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.evaluation_templates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: evaluation_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.evaluation_templates_id_seq OWNED BY public.evaluation_templates.id;


--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: graduate_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.graduate_profiles (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    year_graduated character varying(255),
    campus character varying(255),
    course character varying(255),
    section character varying(255),
    employment_status character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: graduate_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.graduate_profiles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: graduate_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.graduate_profiles_id_seq OWNED BY public.graduate_profiles.id;


--
-- Name: interviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.interviews (
    id bigint NOT NULL,
    job_application_id bigint NOT NULL,
    company_user_id bigint NOT NULL,
    type character varying(255) NOT NULL,
    scheduled_date date NOT NULL,
    scheduled_time time(0) without time zone NOT NULL,
    platform character varying(255),
    status character varying(255) DEFAULT 'upcoming'::character varying NOT NULL,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    interviewer_name character varying(255),
    duration character varying(255),
    meeting_link character varying(255),
    CONSTRAINT interviews_status_check CHECK (((status)::text = ANY ((ARRAY['upcoming'::character varying, 'pending'::character varying, 'done'::character varying, 'cancelled'::character varying])::text[])))
);


--
-- Name: interviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.interviews_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: interviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.interviews_id_seq OWNED BY public.interviews.id;


--
-- Name: job_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_applications (
    id bigint NOT NULL,
    job_listing_id bigint NOT NULL,
    applicant_user_id bigint NOT NULL,
    status character varying(255) DEFAULT 'applied'::character varying NOT NULL,
    match_score integer,
    cover_letter text,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    offer_details json,
    offer_decision character varying(20),
    offer_decided_at timestamp(0) without time zone,
    CONSTRAINT job_applications_status_check CHECK (((status)::text = ANY (ARRAY['applied'::text, 'reviewed'::text, 'screened'::text, 'interview'::text, 'interviewed'::text, 'offered'::text, 'hired'::text, 'rejected'::text])))
);


--
-- Name: job_applications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.job_applications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: job_applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.job_applications_id_seq OWNED BY public.job_applications.id;


--
-- Name: job_batches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


--
-- Name: job_listings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_listings (
    id bigint NOT NULL,
    company_user_id bigint NOT NULL,
    title character varying(255) NOT NULL,
    department character varying(255),
    location character varying(255) NOT NULL,
    employment_type character varying(255) DEFAULT 'full_time'::character varying NOT NULL,
    salary_range character varying(255),
    description text,
    responsibilities json,
    requirements json,
    benefits json,
    required_skills json,
    status character varying(255) DEFAULT 'open'::character varying NOT NULL,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    experience_level character varying(60),
    CONSTRAINT job_listings_status_check CHECK (((status)::text = ANY ((ARRAY['open'::character varying, 'closed'::character varying, 'draft'::character varying, 'filled'::character varying])::text[])))
);


--
-- Name: job_listings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.job_listings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: job_listings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.job_listings_id_seq OWNED BY public.job_listings.id;


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: jobseeker_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobseeker_profiles (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    desired_job_title character varying(255),
    work_preference character varying(255),
    years_of_experience character varying(255),
    headline character varying(255),
    bio text,
    location character varying(255),
    portfolio_url character varying(255),
    linkedin_url character varying(255),
    phone character varying(255),
    avatar_url character varying(255),
    profile_completed boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT jobseeker_profiles_work_preference_check CHECK (((work_preference)::text = ANY ((ARRAY['remote'::character varying, 'hybrid'::character varying, 'onsite'::character varying])::text[]))),
    CONSTRAINT jobseeker_profiles_years_of_experience_check CHECK (((years_of_experience)::text = ANY ((ARRAY['fresh_graduate'::character varying, 'less_than_1'::character varying, '1_to_3'::character varying, '3_to_5'::character varying, '5_plus'::character varying])::text[])))
);


--
-- Name: jobseeker_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.jobseeker_profiles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jobseeker_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.jobseeker_profiles_id_seq OWNED BY public.jobseeker_profiles.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: ojt_emergency_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ojt_emergency_requests (
    id bigint NOT NULL,
    student_user_id bigint NOT NULL,
    ojt_record_id bigint,
    ojt_interest_id bigint,
    type character varying(30) NOT NULL,
    category character varying(50) NOT NULL,
    reason text NOT NULL,
    supporting_document_path character varying(255),
    supporting_document_name character varying(255),
    start_date date NOT NULL,
    expected_return_date date,
    actual_return_date date,
    hours_rendered_snapshot numeric(6,2) DEFAULT '0'::numeric NOT NULL,
    required_hours_snapshot numeric(6,2) DEFAULT '600'::numeric NOT NULL,
    coordinator_status character varying(30) DEFAULT 'pending'::character varying NOT NULL,
    coordinator_remarks text,
    coordinator_action_by bigint,
    coordinator_action_at timestamp(0) without time zone,
    credited_hours numeric(6,2),
    academic_verdict character varying(50),
    company_status character varying(30) DEFAULT 'pending'::character varying NOT NULL,
    company_clearance_notes text,
    company_cleared_at timestamp(0) without time zone,
    assets_returned boolean DEFAULT false NOT NULL,
    fit_to_work_document_path character varying(255),
    cleared_to_resume_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: ojt_emergency_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ojt_emergency_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ojt_emergency_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ojt_emergency_requests_id_seq OWNED BY public.ojt_emergency_requests.id;


--
-- Name: ojt_postings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ojt_postings (
    id bigint NOT NULL,
    company_user_id bigint NOT NULL,
    title character varying(255) NOT NULL,
    company_name character varying(255) NOT NULL,
    company_initial character varying(4),
    company_color character varying(20) DEFAULT '#4A6CF7'::character varying NOT NULL,
    department character varying(255),
    industry character varying(255),
    location character varying(255) NOT NULL,
    description text,
    required_skills json,
    preferred_courses json,
    slots_total integer DEFAULT 1 NOT NULL,
    slots_remaining integer DEFAULT 1 NOT NULL,
    duration character varying(255),
    schedule_type character varying(255) DEFAULT 'full_day'::character varying NOT NULL,
    status character varying(255) DEFAULT 'open'::character varying NOT NULL,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    branch_name character varying(255),
    latitude numeric(10,7),
    longitude numeric(10,7),
    learning_outcomes text,
    required_documents json,
    qualifications json,
    CONSTRAINT ojt_postings_schedule_type_check CHECK (((schedule_type)::text = ANY ((ARRAY['full_day'::character varying, 'half_day'::character varying])::text[]))),
    CONSTRAINT ojt_postings_status_check CHECK (((status)::text = ANY ((ARRAY['open'::character varying, 'filling_up'::character varying, 'closed'::character varying, 'draft'::character varying])::text[])))
);


--
-- Name: ojt_postings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ojt_postings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ojt_postings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ojt_postings_id_seq OWNED BY public.ojt_postings.id;


--
-- Name: ojt_pull_out_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ojt_pull_out_requests (
    id bigint NOT NULL,
    student_user_id bigint NOT NULL,
    ojt_record_id bigint,
    ojt_interest_id bigint,
    reason_category character varying(50) NOT NULL,
    reason text NOT NULL,
    student_letter_path character varying(255) NOT NULL,
    student_letter_name character varying(255),
    hours_rendered_snapshot numeric(8,2) DEFAULT '0'::numeric NOT NULL,
    required_hours_snapshot numeric(8,2) DEFAULT '600'::numeric NOT NULL,
    status character varying(40) DEFAULT 'pending_supervisor'::character varying NOT NULL,
    supervisor_id bigint,
    supervisor_remarks text,
    supervisor_action_at timestamp(0) without time zone,
    dean_name character varying(255),
    dean_email character varying(255),
    generated_letter_body text,
    delivery_method character varying(30),
    emailed_at timestamp(0) without time zone,
    admin_action_by bigint,
    admin_remarks text,
    admin_action_at timestamp(0) without time zone,
    dean_verdict character varying(30),
    credited_hours numeric(8,2),
    allow_redeployment boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: ojt_pull_out_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ojt_pull_out_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ojt_pull_out_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ojt_pull_out_requests_id_seq OWNED BY public.ojt_pull_out_requests.id;


--
-- Name: ojt_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ojt_records (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    company_name character varying(255) NOT NULL,
    supervisor_name character varying(255),
    supervisor_email character varying(255),
    location character varying(255),
    start_date date,
    end_date date,
    required_hours integer DEFAULT 500 NOT NULL,
    completed_hours numeric(8,2) DEFAULT '0'::numeric NOT NULL,
    status character varying(255) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    company_instructions text,
    schedule_days json,
    shift_start character varying(10),
    shift_end character varying(10),
    lunch_start character varying(10),
    lunch_end character varying(10),
    has_lunch_break boolean DEFAULT true NOT NULL,
    daily_hours numeric(4,2),
    weekly_hours numeric(5,2),
    allow_overtime boolean DEFAULT false NOT NULL,
    max_overtime_hours numeric(4,2),
    estimated_end_date date
);


--
-- Name: ojt_records_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ojt_records_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ojt_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ojt_records_id_seq OWNED BY public.ojt_records.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


--
-- Name: peo_definitions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.peo_definitions (
    id bigint NOT NULL,
    program character varying(100) DEFAULT 'Bachelor of Science in Information Technology'::character varying NOT NULL,
    code character varying(20) NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    target_benchmark numeric(5,2) DEFAULT '70'::numeric NOT NULL,
    indicators json,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: peo_definitions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.peo_definitions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: peo_definitions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.peo_definitions_id_seq OWNED BY public.peo_definitions.id;


--
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personal_access_tokens (
    id bigint NOT NULL,
    tokenable_type character varying(255) NOT NULL,
    tokenable_id bigint NOT NULL,
    name text NOT NULL,
    token character varying(64) NOT NULL,
    abilities text,
    last_used_at timestamp(0) without time zone,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- Name: portfolio_projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.portfolio_projects (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    tech_stack json,
    project_url character varying(255),
    repo_url character varying(255),
    image_url character varying(255),
    is_featured boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    category character varying(255),
    role character varying(255),
    date_completed character varying(255),
    outcomes text
);


--
-- Name: portfolio_projects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.portfolio_projects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: portfolio_projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.portfolio_projects_id_seq OWNED BY public.portfolio_projects.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


--
-- Name: student_achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_achievements (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    type character varying(255) DEFAULT 'academic'::character varying NOT NULL,
    icon character varying(255) DEFAULT 'award'::character varying NOT NULL,
    date character varying(255),
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    issuer character varying(255),
    credential_id character varying(255),
    credential_url character varying(255),
    certificate_url character varying(255),
    award_level character varying(255),
    expires_at character varying(255),
    does_not_expire boolean DEFAULT true NOT NULL
);


--
-- Name: student_achievements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_achievements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_achievements_id_seq OWNED BY public.student_achievements.id;


--
-- Name: student_education; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_education (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    school character varying(255) NOT NULL,
    degree character varying(255) NOT NULL,
    year_start character varying(255),
    year_end character varying(255),
    gpa character varying(255),
    description text,
    is_current boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: student_education_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_education_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_education_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_education_id_seq OWNED BY public.student_education.id;


--
-- Name: student_evaluation_answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_evaluation_answers (
    id bigint NOT NULL,
    student_evaluation_id bigint NOT NULL,
    evaluation_question_id bigint NOT NULL,
    rating_value integer,
    text_value text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: student_evaluation_answers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_evaluation_answers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_evaluation_answers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_evaluation_answers_id_seq OWNED BY public.student_evaluation_answers.id;


--
-- Name: student_evaluations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_evaluations (
    id bigint NOT NULL,
    template_id bigint NOT NULL,
    student_user_id bigint NOT NULL,
    company_user_id bigint NOT NULL,
    supervisor_user_id bigint,
    ojt_record_id bigint,
    ojt_posting_id bigint,
    status character varying(30) DEFAULT 'pending'::character varying NOT NULL,
    overall_score numeric(5,2),
    general_feedback text,
    recommendation character varying(100),
    evaluator_name character varying(255),
    evaluator_position character varying(255),
    sent_at timestamp(0) without time zone,
    submitted_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    term character varying(20) DEFAULT 'endterm'::character varying NOT NULL,
    is_waived boolean DEFAULT false NOT NULL,
    waiver_reason text,
    weight numeric(4,2) DEFAULT 0.5 NOT NULL
);


--
-- Name: student_evaluations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_evaluations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_evaluations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_evaluations_id_seq OWNED BY public.student_evaluations.id;


--
-- Name: student_experiences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_experiences (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    role character varying(255) NOT NULL,
    company character varying(255) NOT NULL,
    type character varying(255) DEFAULT 'OJT'::character varying NOT NULL,
    period_start character varying(255),
    period_end character varying(255),
    description text,
    skills json,
    is_current boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    location character varying(255),
    is_it_related boolean DEFAULT false NOT NULL
);


--
-- Name: student_experiences_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_experiences_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_experiences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_experiences_id_seq OWNED BY public.student_experiences.id;


--
-- Name: student_ojt_interests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_ojt_interests (
    id bigint NOT NULL,
    student_user_id bigint NOT NULL,
    ojt_posting_id bigint NOT NULL,
    status character varying(255) DEFAULT 'interested'::character varying NOT NULL,
    student_message text,
    endorsed_by bigint,
    endorsed_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    endorsement_letter character varying(255),
    company_accepted_at timestamp(0) without time zone,
    endorsement_requested_at timestamp(0) without time zone,
    ojt_started_at timestamp(0) without time zone,
    resume_viewed_at timestamp(0) without time zone,
    company_note text,
    interview_scheduled_at timestamp(0) without time zone,
    interview_type character varying(255),
    interview_location text,
    coordinator_note text,
    endorsement_letter_sent_at timestamp(0) without time zone,
    ojt_start_date date,
    ojt_instructions text,
    schedule_days json,
    shift_start character varying(10),
    shift_end character varying(10),
    lunch_start character varying(10),
    lunch_end character varying(10),
    has_lunch_break boolean DEFAULT true NOT NULL,
    daily_hours numeric(4,2),
    weekly_hours numeric(5,2),
    allow_overtime boolean DEFAULT false NOT NULL,
    max_overtime_hours numeric(4,2),
    estimated_end_date date
);


--
-- Name: student_ojt_interests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_ojt_interests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_ojt_interests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_ojt_interests_id_seq OWNED BY public.student_ojt_interests.id;


--
-- Name: student_ojt_requirements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_ojt_requirements (
    id bigint NOT NULL,
    student_user_id bigint NOT NULL,
    supervisor_user_id bigint NOT NULL,
    interest_id bigint,
    posting_id bigint,
    title character varying(255) DEFAULT 'Pre-Deployment OJT Document Packet'::character varying NOT NULL,
    items json NOT NULL,
    instructions text,
    due_date date,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    drive_url text,
    supervisor_remarks text,
    submitted_at timestamp(0) without time zone,
    verified_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: student_ojt_requirements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_ojt_requirements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_ojt_requirements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_ojt_requirements_id_seq OWNED BY public.student_ojt_requirements.id;


--
-- Name: student_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_profiles (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    school character varying(255),
    campus character varying(255),
    program character varying(255),
    year_level character varying(255),
    student_id character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    headline character varying(255),
    bio text,
    location character varying(255),
    github_url character varying(255),
    linkedin_url character varying(255),
    portfolio_url character varying(255),
    status character varying(255) DEFAULT 'active_ojt'::character varying NOT NULL,
    phone character varying(255),
    cover_color character varying(255),
    resume_type character varying(255) DEFAULT 'objective'::character varying NOT NULL,
    resume_objective text,
    section character varying(255),
    batch character varying(255),
    requirements_drive_url text
);


--
-- Name: student_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_profiles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_profiles_id_seq OWNED BY public.student_profiles.id;


--
-- Name: student_skills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_skills (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    level smallint DEFAULT '50'::smallint NOT NULL,
    category character varying(255) DEFAULT 'other'::character varying NOT NULL,
    endorsed_count integer DEFAULT 0 NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: student_skills_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_skills_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_skills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_skills_id_seq OWNED BY public.student_skills.id;


--
-- Name: supervisor_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supervisor_profiles (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    company_name character varying(255),
    "position" character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    course character varying(255),
    phone character varying(50)
);


--
-- Name: supervisor_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.supervisor_profiles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: supervisor_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.supervisor_profiles_id_seq OWNED BY public.supervisor_profiles.id;


--
-- Name: time_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.time_logs (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    ojt_record_id bigint,
    log_date date NOT NULL,
    time_in time(0) without time zone,
    time_out time(0) without time zone,
    hours_rendered numeric(4,2) DEFAULT '0'::numeric NOT NULL,
    description text,
    latitude numeric(10,7),
    longitude numeric(10,7),
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    time_in_lat numeric(10,7),
    time_in_lon numeric(10,7),
    time_out_lat numeric(10,7),
    time_out_lon numeric(10,7),
    location_validity character varying(255),
    distance_meters integer,
    morning_in time(0) without time zone,
    morning_out time(0) without time zone,
    afternoon_in time(0) without time zone,
    afternoon_out time(0) without time zone,
    morning_hours numeric(4,2) DEFAULT '0'::numeric NOT NULL,
    afternoon_hours numeric(4,2) DEFAULT '0'::numeric NOT NULL,
    morning_in_lat numeric(10,7),
    morning_in_lon numeric(10,7),
    morning_out_lat numeric(10,7),
    morning_out_lon numeric(10,7),
    afternoon_in_lat numeric(10,7),
    afternoon_in_lon numeric(10,7),
    afternoon_out_lat numeric(10,7),
    afternoon_out_lon numeric(10,7),
    morning_validity character varying(255),
    afternoon_validity character varying(255),
    auto_morning_timeout boolean DEFAULT false NOT NULL,
    auto_afternoon_timeout boolean DEFAULT false NOT NULL
);


--
-- Name: time_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.time_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: time_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.time_logs_id_seq OWNED BY public.time_logs.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    password character varying(255) NOT NULL,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    role character varying(255) DEFAULT 'student'::character varying NOT NULL,
    onboarding_completed boolean DEFAULT false NOT NULL,
    avatar_url character varying(255),
    must_change_password boolean DEFAULT false NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: alumni_peo_assessments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alumni_peo_assessments ALTER COLUMN id SET DEFAULT nextval('public.alumni_peo_assessments_id_seq'::regclass);


--
-- Name: app_notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_notifications ALTER COLUMN id SET DEFAULT nextval('public.app_notifications_id_seq'::regclass);


--
-- Name: chat_messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages ALTER COLUMN id SET DEFAULT nextval('public.chat_messages_id_seq'::regclass);


--
-- Name: company_profiles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_profiles ALTER COLUMN id SET DEFAULT nextval('public.company_profiles_id_seq'::regclass);


--
-- Name: evaluation_questions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluation_questions ALTER COLUMN id SET DEFAULT nextval('public.evaluation_questions_id_seq'::regclass);


--
-- Name: evaluation_templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluation_templates ALTER COLUMN id SET DEFAULT nextval('public.evaluation_templates_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: graduate_profiles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graduate_profiles ALTER COLUMN id SET DEFAULT nextval('public.graduate_profiles_id_seq'::regclass);


--
-- Name: interviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interviews ALTER COLUMN id SET DEFAULT nextval('public.interviews_id_seq'::regclass);


--
-- Name: job_applications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_applications ALTER COLUMN id SET DEFAULT nextval('public.job_applications_id_seq'::regclass);


--
-- Name: job_listings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_listings ALTER COLUMN id SET DEFAULT nextval('public.job_listings_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: jobseeker_profiles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobseeker_profiles ALTER COLUMN id SET DEFAULT nextval('public.jobseeker_profiles_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: ojt_emergency_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ojt_emergency_requests ALTER COLUMN id SET DEFAULT nextval('public.ojt_emergency_requests_id_seq'::regclass);


--
-- Name: ojt_postings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ojt_postings ALTER COLUMN id SET DEFAULT nextval('public.ojt_postings_id_seq'::regclass);


--
-- Name: ojt_pull_out_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ojt_pull_out_requests ALTER COLUMN id SET DEFAULT nextval('public.ojt_pull_out_requests_id_seq'::regclass);


--
-- Name: ojt_records id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ojt_records ALTER COLUMN id SET DEFAULT nextval('public.ojt_records_id_seq'::regclass);


--
-- Name: peo_definitions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.peo_definitions ALTER COLUMN id SET DEFAULT nextval('public.peo_definitions_id_seq'::regclass);


--
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- Name: portfolio_projects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_projects ALTER COLUMN id SET DEFAULT nextval('public.portfolio_projects_id_seq'::regclass);


--
-- Name: student_achievements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_achievements ALTER COLUMN id SET DEFAULT nextval('public.student_achievements_id_seq'::regclass);


--
-- Name: student_education id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_education ALTER COLUMN id SET DEFAULT nextval('public.student_education_id_seq'::regclass);


--
-- Name: student_evaluation_answers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_evaluation_answers ALTER COLUMN id SET DEFAULT nextval('public.student_evaluation_answers_id_seq'::regclass);


--
-- Name: student_evaluations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_evaluations ALTER COLUMN id SET DEFAULT nextval('public.student_evaluations_id_seq'::regclass);


--
-- Name: student_experiences id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_experiences ALTER COLUMN id SET DEFAULT nextval('public.student_experiences_id_seq'::regclass);


--
-- Name: student_ojt_interests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_ojt_interests ALTER COLUMN id SET DEFAULT nextval('public.student_ojt_interests_id_seq'::regclass);


--
-- Name: student_ojt_requirements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_ojt_requirements ALTER COLUMN id SET DEFAULT nextval('public.student_ojt_requirements_id_seq'::regclass);


--
-- Name: student_profiles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles ALTER COLUMN id SET DEFAULT nextval('public.student_profiles_id_seq'::regclass);


--
-- Name: student_skills id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_skills ALTER COLUMN id SET DEFAULT nextval('public.student_skills_id_seq'::regclass);


--
-- Name: supervisor_profiles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisor_profiles ALTER COLUMN id SET DEFAULT nextval('public.supervisor_profiles_id_seq'::regclass);


--
-- Name: time_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_logs ALTER COLUMN id SET DEFAULT nextval('public.time_logs_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: alumni_peo_assessments; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: app_notifications; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (318, 5, 'pull_out_requested', '⚠️ OJT Pull-Out Request Filed', 'Joshua Vance Rivera filed an OJT pull-out request from Na Ah Company (Breach Of Moa). Request letter submitted for recommendation.', '{"pull_out_id":2,"student_id":58,"student_name":"Joshua Vance Rivera","company":"Na Ah Company"}', NULL, '2026-10-14 02:36:27', '2026-10-14 02:36:27');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (1, 2, 'requirements_assigned', 'OJT Requirements Assigned: Pre-Deployment OJT Document Packet', 'Prof. Mariene Labrador assigned 3 requirement(s) (Parents / Guardian Waiver (Notarized), Medical Examination Certificate (Fit to Work), Barangay or Police Clearance) for your OJT. Please submit your documents by Oct 19, 2026. Upload your files to Google Drive and submit your folder link.', '{"requirement_id":1,"supervisor_id":5,"supervisor_name":"Mariene Labrador","due_date":"2026-10-19","action_url":"#portfolio"}', '2026-10-05 15:58:53', '2026-10-05 15:58:39', '2026-10-05 15:58:53');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (2, 5, 'requirements_submitted', 'OJT Requirements Submitted: Juan Dela Cruz', 'Juan Dela Cruz has submitted their Google Drive folder for OJT requirements review (Pre-Deployment OJT Document Packet).', '{"requirement_id":1,"student_id":2,"student_name":"Juan Dela Cruz","drive_url":"https:\/\/drive.google.com\/drive\/folders\/104yI_7TrQFChZgC4jbSD28Q0R6gtMaiN?usp=sharing","action_url":"#trainees"}', NULL, '2026-10-05 15:58:59', '2026-10-05 15:58:59');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (319, 57, 'pull_out_requested', '⚠️ OJT Pull-Out Request Filed', 'Joshua Vance Rivera filed an OJT pull-out request from Na Ah Company (Breach Of Moa). Request letter submitted for recommendation.', '{"pull_out_id":2,"student_id":58,"student_name":"Joshua Vance Rivera","company":"Na Ah Company"}', '2026-10-14 02:36:31', '2026-10-14 02:36:27', '2026-10-14 02:36:31');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (320, 11, 'trainee_pull_out_notice', '⚠️ Trainee Pull-Out Request Notice', 'Trainee Joshua Vance Rivera has requested an official pull-out from their OJT training. Academic coordinators are reviewing the case.', '{"pull_out_id":2,"student_id":58,"student_name":"Joshua Vance Rivera"}', '2026-10-14 02:36:53', '2026-10-14 02:36:27', '2026-10-14 02:36:53');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (3, 2, 'requirements_verified', 'OJT Requirements Approved!', 'Prof. Mariene Labrador has reviewed and verified your OJT requirements folder (Pre-Deployment OJT Document Packet). You are approved for the next OJT placement stage!', '{"requirement_id":1,"supervisor_id":5,"supervisor_name":"Mariene Labrador","action_url":"#ojt"}', '2026-10-05 16:11:21', '2026-10-05 15:59:42', '2026-10-05 16:11:21');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (8, 5, 'requirements_submitted', 'OJT Requirements Submitted: Maria Santos', 'Maria Santos has submitted their Google Drive folder for OJT requirements review (Pre-Deployment OJT Document Packet).', '{"requirement_id":2,"student_id":3,"student_name":"Maria Santos","drive_url":"https:\/\/drive.google.com\/drive\/folders\/104yI_7TrQFChZgC4jbSD28Q0R6gtMaiN?usp=sharing","action_url":"#trainees"}', NULL, '2026-10-05 16:11:48', '2026-10-05 16:11:48');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (333, 58, 'pull_out_recommended_student', '✅ OJT Pull-Out Recommended by Supervisor', 'Your academic coordinator recommended approval for your OJT pull-out from Na Ah Company. Request forwarded to the Program Chair (Admin) for Dean''s letter generation.', '{"pull_out_id":4}', NULL, '2026-10-14 11:27:52', '2026-10-14 11:27:52');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (10, 6, 'student_applied', 'New OJT Application', 'Juan Dela Cruz applied to your OJT posting "IT Support Intern".', '{"interest_id":null,"posting_id":1,"student_name":"Juan Dela Cruz"}', NULL, '2026-10-05 16:16:30', '2026-10-05 16:16:30');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (344, 5, 'pull_out_requested', '⚠️ OJT Pull-Out Request Filed', 'Bea Bianca Castillo filed an OJT pull-out request from Na Ah Company (Breach Of Moa). Request letter submitted for recommendation.', '{"pull_out_id":6,"student_id":22,"student_name":"Bea Bianca Castillo","company":"Na Ah Company"}', NULL, '2026-10-14 12:29:47', '2026-10-14 12:29:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (11, 2, 'company_accepted', 'Application Reviewed', 'PGLang has reviewed your application for "IT Support Intern". Message: We have reviewed your profile and portfolio and would like to proceed with your application.', '{"posting_id":1,"interest_id":1}', '2026-10-05 16:29:44', '2026-10-05 16:29:22', '2026-10-05 16:29:44');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (13, 2, 'endorsement_requested', 'Endorsement Requested', 'The company PGLang has requested an endorsement letter from the OJT Coordinator for your application to "IT Support Intern". Please wait for the coordinator to upload it.', '{"posting_id":1,"interest_id":1}', NULL, '2026-10-05 16:30:28', '2026-10-05 16:30:28');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (12, 5, 'endorsement_requested', 'Endorsement Letter Requested', 'PGLang is requesting an endorsement letter for student Juan Dela Cruz applying to "IT Support Intern". Please upload the endorsement letter.', '{"interest_id":1,"posting_id":1}', '2026-10-05 16:31:54', '2026-10-05 16:30:28', '2026-10-05 16:31:54');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (15, 2, 'endorsement_sent', 'Endorsement Letter Sent', 'Your supervisor has sent the endorsement letter to PGLang for "IT Support Intern". Waiting for OJT confirmation.', '{"posting_id":1,"interest_id":1}', NULL, '2026-10-05 16:32:32', '2026-10-05 16:32:32');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (14, 6, 'endorsement_sent', 'Endorsement Letter Received', 'The endorsement letter for Juan Dela Cruz applying to "IT Support Intern" has been sent by the supervisor. You can now start their OJT.', '{"interest_id":1,"posting_id":1,"student_name":"Juan Dela Cruz"}', '2026-10-05 16:33:00', '2026-10-05 16:32:32', '2026-10-05 16:33:00');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (16, 2, 'interview_scheduled', 'Interview Scheduled', 'PGLang has scheduled a Face-to-Face interview for you on Oct 10, 2026 at 01:00 PM. Location: BACOLOD CITY. Note: donot be late', '{"posting_id":1,"interest_id":1}', '2026-10-05 16:42:32', '2026-10-05 16:38:10', '2026-10-05 16:42:32');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (17, 6, 'student_applied', 'New OJT Application', 'Maria Santos applied to your OJT posting "IT Support Intern".', '{"interest_id":2,"posting_id":1,"student_name":"Maria Santos"}', '2026-10-05 16:25:10', '2026-10-05 16:53:27', '2026-10-05 16:53:27');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (18, 3, 'company_accepted', 'Application Reviewed', 'PGLang has reviewed your application for "IT Support Intern". Message: We have evaluated your resume, BSIT coursework, and portfolio. Your profile is well-suited for our IT Support department.', '{"posting_id":1,"interest_id":2}', '2026-10-05 16:27:00', '2026-10-05 16:53:27', '2026-10-05 16:53:27');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (19, 5, 'endorsement_requested', 'Endorsement Letter Requested', 'PGLang is requesting an endorsement letter for student Maria Santos applying to "IT Support Intern". Please upload the endorsement letter.', '{"interest_id":2,"posting_id":1}', '2026-10-05 16:30:00', '2026-10-05 16:53:27', '2026-10-05 16:53:27');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (20, 3, 'endorsement_requested', 'Endorsement Requested', 'The company PGLang has requested an endorsement letter from the OJT Coordinator for your application to "IT Support Intern". Please wait for the coordinator to upload it.', '{"posting_id":1,"interest_id":2}', '2026-10-05 16:30:15', '2026-10-05 16:53:27', '2026-10-05 16:53:27');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (21, 6, 'endorsement_sent', 'Endorsement Letter Received', 'The endorsement letter for Maria Santos applying to "IT Support Intern" has been sent by the supervisor. You can now start their OJT.', '{"interest_id":2,"posting_id":1,"student_name":"Maria Santos"}', '2026-10-05 16:33:00', '2026-10-05 16:53:27', '2026-10-05 16:53:27');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (22, 3, 'endorsement_sent', 'Endorsement Letter Sent', 'Your supervisor has sent the endorsement letter to PGLang for "IT Support Intern". Waiting for OJT confirmation.', '{"posting_id":1,"interest_id":2}', '2026-10-05 16:33:30', '2026-10-05 16:53:27', '2026-10-05 16:53:27');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (23, 3, 'interview_scheduled', 'Interview Scheduled', 'PGLang has scheduled a Face-to-Face interview for you on Oct 05, 2026 at 06:00 PM. Location: PGLang Headquarters, Unit 4 TechPark Bldg, Lacson St., Bacolod City. Note: Please bring your school ID, updated CV, and be prepared for technical troubleshooting questions.', '{"posting_id":1,"interest_id":2}', '2026-10-05 16:36:00', '2026-10-05 16:53:27', '2026-10-05 16:53:27');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (25, 5, 'company_accepted', 'Student Accepted — Final OJT Approval Needed', 'PGLang has accepted Maria Santos after their interview for "IT Support Intern". Please review and give final OJT approval.', '{"interest_id":2,"posting_id":1}', NULL, '2026-10-05 16:53:27', '2026-10-05 16:53:27');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (27, 6, 'ojt_approved', 'OJT Coordinator Approved — Set Start Date', 'The OJT Coordinator has approved Maria Santos''s OJT for "IT Support Intern". Please log in and set the OJT start date and instructions for this student so they know when to report.', '{"posting_id":1,"interest_id":2}', NULL, '2026-10-05 16:57:06', '2026-10-05 16:57:06');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (321, 58, 'pull_out_rejected_student', '❌ OJT Pull-Out Request Not Recommended', 'Your coordinator did not recommend approval for your pull-out request. Remarks: dawdwadwadwadwadwadwa', '{"pull_out_id":2}', NULL, '2026-10-14 02:37:30', '2026-10-14 02:37:30');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (29, 5, 'ojt_confirmed', 'Student OJT Start Date & Schedule Set', 'Maria Santos''s OJT at PGLang is set for Oct 11, 2026 (Mon, Tue, Wed, Thu, Fri, 08:00 – 17:00).', '{"posting_id":1,"interest_id":2}', NULL, '2026-10-05 16:57:41', '2026-10-05 16:57:41');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (7, 3, 'requirements_assigned', 'OJT Requirements Assigned: Pre-Deployment OJT Document Packet', 'Prof. Mariene Labrador assigned 6 requirement(s) (Parents / Guardian Waiver (Notarized), Medical Examination Certificate (Fit to Work), Certificate of Registration (COR) / Study Load and 3 more) for your OJT. Please submit your documents by Oct 19, 2026. Upload your files to Google Drive and submit your folder link.', '{"requirement_id":2,"supervisor_id":5,"supervisor_name":"Mariene Labrador","due_date":"2026-10-19","action_url":"#portfolio"}', '2026-10-05 16:58:17', '2026-10-05 16:11:33', '2026-10-05 16:58:17');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (9, 3, 'requirements_verified', 'OJT Requirements Approved!', 'Prof. Mariene Labrador has reviewed and verified your OJT requirements folder (Pre-Deployment OJT Document Packet). You are approved for the next OJT placement stage!', '{"requirement_id":2,"supervisor_id":5,"supervisor_name":"Mariene Labrador","action_url":"#ojt"}', '2026-10-05 16:58:17', '2026-10-05 16:12:02', '2026-10-05 16:58:17');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (24, 3, 'company_accepted', 'Interview Result — Accepted! 🎉', 'PGLang has accepted you after the interview for "IT Support Intern". Message: Interview completed. Maria demonstrated impressive problem-solving, hardware troubleshooting acumen, and professionalism. Formally accepted for the IT Support Intern role.. The OJT Coordinator will give final approval shortly.', '{"posting_id":1,"interest_id":2}', '2026-10-05 16:58:17', '2026-10-05 16:53:27', '2026-10-05 16:58:17');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (26, 3, 'ojt_approved', 'OJT Approved by Coordinator! 🎉', 'The OJT Coordinator has approved your OJT at PGLang. The company will contact you soon with your OJT start date and instructions. Stay tuned!', '{"posting_id":1,"interest_id":2}', '2026-10-05 16:58:17', '2026-10-05 16:57:06', '2026-10-05 16:58:17');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (28, 3, 'ojt_confirmed', 'OJT Start Date & Schedule Confirmed — Oct 11, 2026 📅', 'PGLang confirmed your start date: Oct 11, 2026. Schedule: Mon, Tue, Wed, Thu, Fri, 08:00 – 17:00 (Lunch: 12:00 – 13:00). Instructions: Dont be late', '{"posting_id":1,"interest_id":2}', '2026-10-05 16:58:17', '2026-10-05 16:57:41', '2026-10-05 16:58:17');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (332, 1, 'pull_out_recommended', '📄 OJT Pull-Out Recommended', 'Coordinator IT Supervisor recommended pull-out for Joshua Vance Rivera (Na Ah Company). Awaiting Program Chair & Dean approval.', '{"pull_out_id":4,"student_id":58,"student_name":"Joshua Vance Rivera","supervisor_name":"IT Supervisor"}', '2026-10-14 11:28:07', '2026-10-14 11:27:52', '2026-10-14 11:28:07');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (345, 57, 'pull_out_requested', '⚠️ OJT Pull-Out Request Filed', 'Bea Bianca Castillo filed an OJT pull-out request from Na Ah Company (Breach Of Moa). Request letter submitted for recommendation.', '{"pull_out_id":6,"student_id":22,"student_name":"Bea Bianca Castillo","company":"Na Ah Company"}', NULL, '2026-10-14 12:29:47', '2026-10-14 12:29:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (346, 11, 'trainee_pull_out_notice', '⚠️ Trainee Pull-Out Request Notice', 'Trainee Bea Bianca Castillo has requested an official pull-out from their OJT training. Academic coordinators are reviewing the case.', '{"pull_out_id":6,"student_id":22,"student_name":"Bea Bianca Castillo"}', NULL, '2026-10-14 12:29:47', '2026-10-14 12:29:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (362, 5, 'fit_to_work_uploaded', '🩺 Medical Fit-to-Work Clearance Uploaded', 'Althea Joy Villanueva uploaded a Fit-to-Work clearance certificate to resume OJT training.', '{"emergency_id":2,"student_id":18,"student_name":"Althea Joy Villanueva","route":"#\/trainees?student_id=18&action=review_emergency"}', NULL, '2026-10-15 21:00:14', '2026-10-15 21:00:14');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (363, 57, 'fit_to_work_uploaded', '🩺 Medical Fit-to-Work Clearance Uploaded', 'Althea Joy Villanueva uploaded a Fit-to-Work clearance certificate to resume OJT training.', '{"emergency_id":2,"student_id":18,"student_name":"Althea Joy Villanueva","route":"#\/trainees?student_id=18&action=review_emergency"}', NULL, '2026-10-15 21:00:14', '2026-10-15 21:00:14');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (375, 11, 'endorsement_sent', 'Endorsement Letter Received', 'The endorsement letter for Cedric Miguel Ramos applying to "Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)" has been issued by Coordinator Mariene Labrador. You may now proceed with interview scheduling.', '{"interest_id":28,"posting_id":15,"student_name":"Cedric Miguel Ramos"}', NULL, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (376, 59, 'endorsement_sent', 'Endorsement Letter Issued', 'Prof. Mariene Labrador has sent your official endorsement letter to Na Ah Company for "Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)".', '{"posting_id":15,"interest_id":28}', NULL, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (377, 11, 'endorsement_sent', 'Endorsement Letter Received', 'The endorsement letter for Princess Nicole Reyes applying to "Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)" has been issued by Coordinator Mariene Labrador. You may now proceed with interview scheduling.', '{"interest_id":29,"posting_id":15,"student_name":"Princess Nicole Reyes"}', NULL, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (378, 20, 'endorsement_sent', 'Endorsement Letter Issued', 'Prof. Mariene Labrador has sent your official endorsement letter to Na Ah Company for "Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)".', '{"posting_id":15,"interest_id":29}', NULL, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (379, 11, 'endorsement_sent', 'Endorsement Letter Received', 'The endorsement letter for John Paul Bautista applying to "Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)" has been issued by Coordinator Mariene Labrador. You may now proceed with interview scheduling.', '{"interest_id":30,"posting_id":15,"student_name":"John Paul Bautista"}', NULL, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (380, 21, 'endorsement_sent', 'Endorsement Letter Issued', 'Prof. Mariene Labrador has sent your official endorsement letter to Na Ah Company for "Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)".', '{"posting_id":15,"interest_id":30}', NULL, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (381, 59, 'interview_scheduled', 'Face-to-Face Technical Interview Scheduled 📅', 'Na Ah Company scheduled your interview for Oct 16, 2026 at 09:00 AM. Location: Na Ah Company Tech Hub, 45 Rizal St., Bacolod City (Conference Room B). Note: Please bring your student ID and a copy of your endorsement letter. Prepare for a technical discussion on full-stack web and cloud systems.', '{"posting_id":15,"interest_id":28}', NULL, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (47, 5, 'endorsement_requested', 'Endorsement Letter Requested', 'Na Ah Company is requesting an endorsement letter for student Kevin Morales applying to "Web Development Intern". Please upload the endorsement letter.', '{"interest_id":5,"posting_id":4}', NULL, '2026-10-05 17:44:31', '2026-10-05 17:44:31');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (45, 11, 'student_applied', 'New OJT Application', 'Kevin Morales applied to your OJT posting "Web Development Intern".', '{"interest_id":5,"posting_id":4,"student_name":"Kevin Morales"}', '2026-10-14 02:17:47', '2026-10-05 17:44:31', '2026-10-14 02:17:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (322, 5, 'pull_out_requested', '⚠️ OJT Pull-Out Request Filed', 'Joshua Vance Rivera filed an OJT pull-out request from Na Ah Company (Breach Of Moa). Request letter submitted for recommendation.', '{"pull_out_id":3,"student_id":58,"student_name":"Joshua Vance Rivera","company":"Na Ah Company"}', NULL, '2026-10-14 02:38:09', '2026-10-14 02:38:09');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (334, 58, 'pull_out_emailed', '✉️ OJT Pull-Out Letter Dispatched to Dean', 'Program Chair has emailed the official pull-out memorandum to Dean Dean of College. Awaiting Dean''s email response.', '{"pull_out_id":4}', NULL, '2026-10-14 11:28:58', '2026-10-14 11:28:58');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (53, 5, 'company_accepted', 'Student Accepted — Final OJT Approval Needed', 'Na Ah Company has accepted Kevin Morales after their interview for "Web Development Intern". Please review and give final OJT approval.', '{"interest_id":5,"posting_id":4}', NULL, '2026-10-05 17:44:31', '2026-10-05 17:44:31');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (57, 5, 'ojt_confirmed', 'Student OJT Start Date & Schedule Set', 'Kevin Morales''s OJT at Na Ah Company is set for Oct 05, 2026 (Mon–Fri, 08:00 – 17:00).', '{"posting_id":4,"interest_id":5}', NULL, '2026-10-05 17:44:31', '2026-10-05 17:44:31');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (59, 12, 'company_accepted', 'Application Reviewed', 'Na Ah Company has reviewed your application for "Web Development Intern". Message: Impressive web portfolio and solid foundation in PHP, JavaScript, and MySQL. Candidate confirmed for endorsement.', '{"posting_id":4,"interest_id":6}', NULL, '2026-10-05 17:45:08', '2026-10-05 17:45:08');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (60, 5, 'endorsement_requested', 'Endorsement Letter Requested', 'Na Ah Company is requesting an endorsement letter for student Kevin Morales applying to "Web Development Intern". Please upload the endorsement letter.', '{"interest_id":6,"posting_id":4}', NULL, '2026-10-05 17:45:08', '2026-10-05 17:45:08');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (61, 12, 'endorsement_requested', 'Endorsement Requested', 'The company Na Ah Company has requested an endorsement letter from the OJT Coordinator for your application to "Web Development Intern". Please wait for the coordinator to upload it.', '{"posting_id":4,"interest_id":6}', NULL, '2026-10-05 17:45:08', '2026-10-05 17:45:08');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (63, 12, 'endorsement_sent', 'Endorsement Letter Sent', 'Your supervisor has sent the endorsement letter to Na Ah Company for "Web Development Intern". Waiting for OJT confirmation.', '{"posting_id":4,"interest_id":6}', NULL, '2026-10-05 17:45:08', '2026-10-05 17:45:08');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (64, 12, 'interview_scheduled', 'Interview Scheduled', 'Na Ah Company has scheduled a Face-to-Face interview for you on Oct 05, 2026 at 12:45 PM. Location: Na Ah Company Tech Hub, 45 Rizal St., Bacolod City (Room 302). Note: Please bring a copy of your school ID, verified endorsement letter, and be ready for a brief technical walkthrough.', '{"posting_id":4,"interest_id":6}', NULL, '2026-10-05 17:45:08', '2026-10-05 17:45:08');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (65, 12, 'company_accepted', 'Interview Result — Accepted! 🎉', 'Na Ah Company has accepted you after the interview for "Web Development Intern". Message: Kevin passed the technical interview with flying colors. Strong problem-solving abilities and great cultural fit. We are thrilled to welcome Kevin to our team!. The OJT Coordinator will give final approval shortly.', '{"posting_id":4,"interest_id":6}', NULL, '2026-10-05 17:45:08', '2026-10-05 17:45:08');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (66, 5, 'company_accepted', 'Student Accepted — Final OJT Approval Needed', 'Na Ah Company has accepted Kevin Morales after their interview for "Web Development Intern". Please review and give final OJT approval.', '{"interest_id":6,"posting_id":4}', NULL, '2026-10-05 17:45:08', '2026-10-05 17:45:08');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (67, 12, 'ojt_approved', 'OJT Approved by Coordinator! 🎉', 'The OJT Coordinator has approved your OJT at Na Ah Company. The company will contact you soon with your OJT start date and instructions. Stay tuned!', '{"posting_id":4,"interest_id":6}', NULL, '2026-10-05 17:45:08', '2026-10-05 17:45:08');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (69, 12, 'ojt_confirmed', 'OJT Start Date & Schedule Confirmed — Oct 05, 2026 📅', 'Na Ah Company confirmed your start date: Oct 05, 2026. Schedule: Mon–Fri, 08:00 – 17:00 (Lunch: 12:00 – 13:00). Instructions: Welcome to Na Ah Company! Report to Na Ah Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp. Bring your CHMSU student ID and laptop. Look for Ms. Karen at reception.', '{"posting_id":4,"interest_id":6}', NULL, '2026-10-05 17:45:08', '2026-10-05 17:45:08');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (70, 5, 'ojt_confirmed', 'Student OJT Start Date & Schedule Set', 'Kevin Morales''s OJT at Na Ah Company is set for Oct 05, 2026 (Mon–Fri, 08:00 – 17:00).', '{"posting_id":4,"interest_id":6}', NULL, '2026-10-05 17:45:08', '2026-10-05 17:45:08');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (71, 5, 'student_time_in', 'Student Logged In', 'Kevin Morales logged in (Time In (Afternoon)) at 1:00 PM on 2026-10-05 (Too Far).', '{"student_id":12,"log_id":1,"date":"2026-10-05","time_in":"1:00 PM","session":"Time In (Afternoon)","location_validity":"Too Far"}', NULL, '2026-10-05 17:48:37', '2026-10-05 17:48:37');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (72, 5, 'student_time_out', 'Student Logged Out', 'Kevin Morales logged out (Time Out (Afternoon)) at 1:01 PM on 2026-10-05 (0.02 hrs rendered).', '{"student_id":12,"log_id":1,"date":"2026-10-05","time_out":"1:01 PM","session":"Time Out (Afternoon)","hours":0.02}', NULL, '2026-10-05 17:53:25', '2026-10-05 17:53:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (73, 5, 'student_time_in', 'Student Logged In', 'Kevin Morales logged in (Time In (Afternoon)) at 1:00 PM on 2026-10-05 (In Site).', '{"student_id":12,"log_id":2,"date":"2026-10-05","time_in":"1:00 PM","session":"Time In (Afternoon)","location_validity":"In Site"}', NULL, '2026-10-05 17:56:25', '2026-10-05 17:56:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (74, 5, 'student_time_out', 'Student Logged Out', 'Kevin Morales logged out (Time Out (Afternoon)) at 1:50 PM on 2026-10-05 (0.83 hrs rendered).', '{"student_id":12,"log_id":2,"date":"2026-10-05","time_out":"1:50 PM","session":"Time Out (Afternoon)","hours":0.83}', NULL, '2026-10-05 17:56:25', '2026-10-05 17:56:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (198, 12, 'emergency_withdrawal_finalized', 'OJT Stoppage & Withdrawal Finalized', 'Your OJT stoppage has been officially processed. 0 hours have been credited on your record. Academic verdict: Incomplete Inc.', '{"emergency_id":1,"credited_hours":0}', NULL, '2026-10-11 14:17:02', '2026-10-11 14:17:02');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (282, 11, 'student_applied', 'New OJT Application', 'Joshua Vance Rivera applied to your OJT posting "Enterprise Cloud & Full-Stack Systems Intern".', '{"interest_id":25,"posting_id":14,"student_name":"Joshua Vance Rivera"}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (283, 11, 'student_applied', 'New OJT Application', 'Althea Joy Villanueva applied to your OJT posting "Enterprise Cloud & Full-Stack Systems Intern".', '{"interest_id":26,"posting_id":14,"student_name":"Althea Joy Villanueva"}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (284, 11, 'student_applied', 'New OJT Application', 'Bea Bianca Castillo applied to your OJT posting "Enterprise Cloud & Full-Stack Systems Intern".', '{"interest_id":27,"posting_id":14,"student_name":"Bea Bianca Castillo"}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (285, 58, 'endorsement_requested', 'Endorsement Requested by Company', 'Na Ah Company reviewed your application for "Enterprise Cloud & Full-Stack Systems Intern" and requested an endorsement letter from your OJT Coordinator.', '{"posting_id":14,"interest_id":25}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (286, 5, 'endorsement_requested', 'Endorsement Letter Requested', 'Na Ah Company is requesting an endorsement letter for student Joshua Vance Rivera applying to "Enterprise Cloud & Full-Stack Systems Intern". Please review and upload the endorsement letter.', '{"interest_id":25,"posting_id":14}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (287, 18, 'endorsement_requested', 'Endorsement Requested by Company', 'Na Ah Company reviewed your application for "Enterprise Cloud & Full-Stack Systems Intern" and requested an endorsement letter from your OJT Coordinator.', '{"posting_id":14,"interest_id":26}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (78, 5, 'endorsement_requested', 'Endorsement Letter Requested', 'Na Ah Company is requesting an endorsement letter for student Mark Vincent Tan applying to "Associate Software & Cloud Infrastructure Intern". Please review and upload the endorsement letter.', '{"interest_id":7,"posting_id":7}', NULL, '2026-10-06 03:18:03', '2026-10-06 03:18:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (323, 57, 'pull_out_requested', '⚠️ OJT Pull-Out Request Filed', 'Joshua Vance Rivera filed an OJT pull-out request from Na Ah Company (Breach Of Moa). Request letter submitted for recommendation.', '{"pull_out_id":3,"student_id":58,"student_name":"Joshua Vance Rivera","company":"Na Ah Company"}', NULL, '2026-10-14 02:38:09', '2026-10-14 02:38:09');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (80, 5, 'endorsement_requested', 'Endorsement Letter Requested', 'Na Ah Company is requesting an endorsement letter for student Alyssa Nicole Castro applying to "Associate Software & Cloud Infrastructure Intern". Please review and upload the endorsement letter.', '{"interest_id":8,"posting_id":7}', NULL, '2026-10-06 03:18:03', '2026-10-06 03:18:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (324, 11, 'trainee_pull_out_notice', '⚠️ Trainee Pull-Out Request Notice', 'Trainee Joshua Vance Rivera has requested an official pull-out from their OJT training. Academic coordinators are reviewing the case.', '{"pull_out_id":3,"student_id":58,"student_name":"Joshua Vance Rivera"}', NULL, '2026-10-14 02:38:09', '2026-10-14 02:38:09');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (335, 58, 'pull_out_rejected_dean', '⚠️ Dean Declined OJT Pull-Out Request', 'Dean did not authorize the pull-out. Remarks: Please consult your OJT Coordinator.', '{"pull_out_id":4}', '2026-10-14 11:30:28', '2026-10-14 11:29:14', '2026-10-14 11:30:28');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (347, 1, 'pull_out_recommended', '📄 OJT Pull-Out Recommended', 'Coordinator IT Supervisor recommended pull-out for Bea Bianca Castillo (Na Ah Company). Awaiting Program Chair & Dean approval.', '{"pull_out_id":6,"student_id":22,"student_name":"Bea Bianca Castillo","supervisor_name":"IT Supervisor"}', NULL, '2026-10-14 12:38:10', '2026-10-14 12:38:10');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (348, 22, 'pull_out_recommended_student', '✅ OJT Pull-Out Recommended by Supervisor', 'Your academic coordinator recommended approval for your OJT pull-out from Na Ah Company. Request forwarded to the Program Chair (Admin) for Dean''s letter generation.', '{"pull_out_id":6}', NULL, '2026-10-14 12:38:10', '2026-10-14 12:38:10');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (353, 5, 'emergency_stoppage_filed', '🚨 Urgent: OJT Emergency Notice Filed', 'Althea Joy Villanueva filed a Emergency Leave of Absence (Other). Supporting proof provided for review.', '{"emergency_id":2,"student_id":18,"student_name":"Althea Joy Villanueva","type":"temporary_leave","category":"other"}', NULL, '2026-10-15 20:37:14', '2026-10-15 20:37:14');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (88, 5, 'company_accepted', 'Student Accepted — Final OJT Approval Needed', 'Na Ah Company has accepted Mark Vincent Tan after their interview for "Associate Software & Cloud Infrastructure Intern". Please review and grant final OJT deployment approval.', '{"interest_id":7,"posting_id":7}', NULL, '2026-10-06 03:18:03', '2026-10-06 03:18:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (355, 11, 'trainee_emergency_notice', '⚠️ Trainee Emergency Notice', 'Trainee Althea Joy Villanueva filed an Emergency Leave of Absence (Other). Academic coordinator has been alerted.', '{"emergency_id":2,"student_id":18,"student_name":"Althea Joy Villanueva","type":"temporary_leave"}', NULL, '2026-10-15 20:37:14', '2026-10-15 20:37:14');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (90, 5, 'company_accepted', 'Student Accepted — Final OJT Approval Needed', 'Na Ah Company has accepted Alyssa Nicole Castro after their interview for "Associate Software & Cloud Infrastructure Intern". Please review and grant final OJT deployment approval.', '{"interest_id":8,"posting_id":7}', NULL, '2026-10-06 03:18:03', '2026-10-06 03:18:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (354, 57, 'emergency_stoppage_filed', '🚨 Urgent: OJT Emergency Notice Filed', 'Althea Joy Villanueva filed a Emergency Leave of Absence (Other). Supporting proof provided for review.', '{"emergency_id":2,"student_id":18,"student_name":"Althea Joy Villanueva","type":"temporary_leave","category":"other"}', '2026-10-15 20:37:21', '2026-10-15 20:37:14', '2026-10-15 20:37:21');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (365, 11, 'trainee_resumed_ojt', 'Trainee Resumed OJT Training', 'Althea Joy Villanueva has been medically cleared and resumes their internship training today.', '{"emergency_id":2,"student_id":18}', NULL, '2026-10-15 21:00:46', '2026-10-15 21:00:46');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (364, 18, 'fit_to_work_cleared', '🎉 Cleared to Resume OJT Training!', 'Your Fit-to-Work medical clearance was accepted by your Coordinator. Attendance time-in is now reactivated.', '{"emergency_id":2}', '2026-10-15 21:02:43', '2026-10-15 21:00:46', '2026-10-15 21:02:43');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (382, 20, 'interview_scheduled', 'Face-to-Face Technical Interview Scheduled 📅', 'Na Ah Company scheduled your interview for Oct 16, 2026 at 10:30 AM. Location: Na Ah Company Tech Hub, 45 Rizal St., Bacolod City (Conference Room B). Note: Please bring your student ID and a copy of your endorsement letter. Prepare for a technical discussion on full-stack web and cloud systems.', '{"posting_id":15,"interest_id":29}', NULL, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (96, 5, 'ojt_confirmed', 'Student OJT Start Date & Schedule Set', 'Mark Vincent Tan''s OJT at Na Ah Company has been confirmed to start on Jun 22, 2026 (Mon–Fri, 08:00 – 17:00).', '{"posting_id":7,"interest_id":7}', NULL, '2026-10-06 03:18:03', '2026-10-06 03:18:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (98, 5, 'ojt_confirmed', 'Student OJT Start Date & Schedule Set', 'Alyssa Nicole Castro''s OJT at Na Ah Company has been confirmed to start on Jun 22, 2026 (Mon–Fri, 08:00 – 17:00).', '{"posting_id":7,"interest_id":8}', NULL, '2026-10-06 03:18:03', '2026-10-06 03:18:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (102, 5, 'endorsement_requested', 'Endorsement Letter Requested', 'Na Ah Company is requesting an endorsement letter for student Mark Vincent Tan applying to "Associate Software & Cloud Infrastructure Intern". Please review and upload the endorsement letter.', '{"interest_id":9,"posting_id":8}', NULL, '2026-10-06 03:18:59', '2026-10-06 03:18:59');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (104, 5, 'endorsement_requested', 'Endorsement Letter Requested', 'Na Ah Company is requesting an endorsement letter for student Alyssa Nicole Castro applying to "Associate Software & Cloud Infrastructure Intern". Please review and upload the endorsement letter.', '{"interest_id":10,"posting_id":8}', NULL, '2026-10-06 03:18:59', '2026-10-06 03:18:59');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (128, 5, 'endorsement_requested', 'Endorsement Letter Requested', 'Na Ah Company is requesting an endorsement letter for student Alyssa Nicole Castro applying to "Associate Software & Cloud Infrastructure Intern". Please review and upload the endorsement letter.', '{"interest_id":12,"posting_id":9}', NULL, '2026-10-06 03:19:15', '2026-10-06 03:19:15');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (81, 11, 'endorsement_sent', 'Endorsement Letter Received', 'The endorsement letter for Mark Vincent Tan applying to "Associate Software & Cloud Infrastructure Intern" has been issued by Coordinator Mariene Labrador. You may now proceed with interview scheduling.', '{"interest_id":7,"posting_id":7,"student_name":"Mark Vincent Tan"}', '2026-10-14 02:17:47', '2026-10-06 03:18:03', '2026-10-14 02:17:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (83, 11, 'endorsement_sent', 'Endorsement Letter Received', 'The endorsement letter for Alyssa Nicole Castro applying to "Associate Software & Cloud Infrastructure Intern" has been issued by Coordinator Mariene Labrador. You may now proceed with interview scheduling.', '{"interest_id":8,"posting_id":7,"student_name":"Alyssa Nicole Castro"}', '2026-10-14 02:17:47', '2026-10-06 03:18:03', '2026-10-14 02:17:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (92, 11, 'ojt_approved', 'OJT Coordinator Approved — Set Start Date', 'The OJT Coordinator has approved Mark Vincent Tan''s deployment for "Associate Software & Cloud Infrastructure Intern". Please set the OJT start date and work shift instructions.', '{"posting_id":7,"interest_id":7}', '2026-10-14 02:17:47', '2026-10-06 03:18:03', '2026-10-14 02:17:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (99, 11, 'student_applied', 'New OJT Application', 'Mark Vincent Tan applied to your OJT posting "Associate Software & Cloud Infrastructure Intern".', '{"interest_id":9,"posting_id":8,"student_name":"Mark Vincent Tan"}', '2026-10-14 02:17:47', '2026-10-06 03:18:59', '2026-10-14 02:17:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (326, 58, 'pull_out_recommended_student', '✅ OJT Pull-Out Recommended by Supervisor', 'Your academic coordinator recommended approval for your OJT pull-out from Na Ah Company. Request forwarded to the Program Chair (Admin) for Dean''s letter generation.', '{"pull_out_id":3}', '2026-10-14 02:38:55', '2026-10-14 02:38:38', '2026-10-14 02:38:55');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (325, 1, 'pull_out_recommended', '📄 OJT Pull-Out Recommended', 'Coordinator IT Supervisor recommended pull-out for Joshua Vance Rivera (Na Ah Company). Awaiting Program Chair & Dean approval.', '{"pull_out_id":3,"student_id":58,"student_name":"Joshua Vance Rivera","supervisor_name":"IT Supervisor"}', '2026-10-14 02:39:15', '2026-10-14 02:38:38', '2026-10-14 02:39:15');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (336, 5, 'pull_out_requested', '⚠️ OJT Pull-Out Request Filed', 'Joshua Vance Rivera filed an OJT pull-out request from Na Ah Company (Breach Of Moa). Request letter submitted for recommendation.', '{"pull_out_id":5,"student_id":58,"student_name":"Joshua Vance Rivera","company":"Na Ah Company"}', NULL, '2026-10-14 11:32:27', '2026-10-14 11:32:27');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (337, 57, 'pull_out_requested', '⚠️ OJT Pull-Out Request Filed', 'Joshua Vance Rivera filed an OJT pull-out request from Na Ah Company (Breach Of Moa). Request letter submitted for recommendation.', '{"pull_out_id":5,"student_id":58,"student_name":"Joshua Vance Rivera","company":"Na Ah Company"}', NULL, '2026-10-14 11:32:27', '2026-10-14 11:32:27');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (338, 11, 'trainee_pull_out_notice', '⚠️ Trainee Pull-Out Request Notice', 'Trainee Joshua Vance Rivera has requested an official pull-out from their OJT training. Academic coordinators are reviewing the case.', '{"pull_out_id":5,"student_id":58,"student_name":"Joshua Vance Rivera"}', NULL, '2026-10-14 11:32:27', '2026-10-14 11:32:27');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (112, 5, 'company_accepted', 'Student Accepted — Final OJT Approval Needed', 'Na Ah Company has accepted Mark Vincent Tan after their interview for "Associate Software & Cloud Infrastructure Intern". Please review and grant final OJT deployment approval.', '{"interest_id":9,"posting_id":8}', NULL, '2026-10-06 03:18:59', '2026-10-06 03:18:59');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (349, 22, 'pull_out_finalized_student', '🎉 Dean Approved OJT Pull-Out', 'Official pull-out from Na Ah Company approved. 0 hours credited. You are authorized for re-deployment to another host company.', '{"pull_out_id":6,"credited_hours":0}', NULL, '2026-10-14 12:39:30', '2026-10-14 12:39:30');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (114, 5, 'company_accepted', 'Student Accepted — Final OJT Approval Needed', 'Na Ah Company has accepted Alyssa Nicole Castro after their interview for "Associate Software & Cloud Infrastructure Intern". Please review and grant final OJT deployment approval.', '{"interest_id":10,"posting_id":8}', NULL, '2026-10-06 03:18:59', '2026-10-06 03:18:59');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (350, 11, 'trainee_pulled_out_company', 'ℹ️ Trainee OJT Pull-Out Finalized', 'The College Dean officially approved the pull-out for Bea Bianca Castillo. 1 training slot has been restored to your posting.', '{"pull_out_id":6,"student_id":22}', NULL, '2026-10-14 12:39:30', '2026-10-14 12:39:30');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (351, 5, 'pull_out_approved_supervisor', '✅ Dean Approved Trainee Pull-Out', 'Dean approved official pull-out for Bea Bianca Castillo (Na Ah Company). Student status updated to Undeployed and eligible for re-endorsement.', '{"pull_out_id":6,"student_id":22}', NULL, '2026-10-14 12:39:30', '2026-10-14 12:39:30');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (352, 57, 'pull_out_approved_supervisor', '✅ Dean Approved Trainee Pull-Out', 'Dean approved official pull-out for Bea Bianca Castillo (Na Ah Company). Student status updated to Undeployed and eligible for re-endorsement.', '{"pull_out_id":6,"student_id":22}', NULL, '2026-10-14 12:39:30', '2026-10-14 12:39:30');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (356, 18, 'emergency_leave_approved', '✅ Medical / Emergency Leave Approved', 'Your OJT Coordinator approved your leave until Oct 17, 2026. Attendance is safely paused; get well soon!', '{"emergency_id":2}', NULL, '2026-10-15 20:38:09', '2026-10-15 20:38:09');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (357, 11, 'emergency_leave_approved_company', 'ℹ️ Trainee Leave of Absence Authorized', 'OJT Coordinator approved an emergency leave of absence for Althea Joy Villanueva until Oct 17, 2026.', '{"emergency_id":2,"student_id":18}', NULL, '2026-10-15 20:38:09', '2026-10-15 20:38:09');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (120, 5, 'ojt_confirmed', 'Student OJT Start Date & Schedule Set', 'Mark Vincent Tan''s OJT at Na Ah Company has been confirmed to start on Jun 22, 2026 (Mon–Fri, 08:00 – 17:00).', '{"posting_id":8,"interest_id":9}', NULL, '2026-10-06 03:18:59', '2026-10-06 03:18:59');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (366, 11, 'student_applied', 'New OJT Application', 'Cedric Miguel Ramos applied to your OJT posting "Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)".', '{"interest_id":28,"posting_id":15,"student_name":"Cedric Miguel Ramos"}', NULL, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (122, 5, 'ojt_confirmed', 'Student OJT Start Date & Schedule Set', 'Alyssa Nicole Castro''s OJT at Na Ah Company has been confirmed to start on Jun 22, 2026 (Mon–Fri, 08:00 – 17:00).', '{"posting_id":8,"interest_id":10}', NULL, '2026-10-06 03:18:59', '2026-10-06 03:18:59');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (367, 11, 'student_applied', 'New OJT Application', 'Princess Nicole Reyes applied to your OJT posting "Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)".', '{"interest_id":29,"posting_id":15,"student_name":"Princess Nicole Reyes"}', NULL, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (368, 11, 'student_applied', 'New OJT Application', 'John Paul Bautista applied to your OJT posting "Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)".', '{"interest_id":30,"posting_id":15,"student_name":"John Paul Bautista"}', NULL, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (126, 5, 'endorsement_requested', 'Endorsement Letter Requested', 'Na Ah Company is requesting an endorsement letter for student Mark Vincent Tan applying to "Associate Software & Cloud Infrastructure Intern". Please review and upload the endorsement letter.', '{"interest_id":11,"posting_id":9}', NULL, '2026-10-06 03:19:15', '2026-10-06 03:19:15');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (105, 11, 'endorsement_sent', 'Endorsement Letter Received', 'The endorsement letter for Mark Vincent Tan applying to "Associate Software & Cloud Infrastructure Intern" has been issued by Coordinator Mariene Labrador. You may now proceed with interview scheduling.', '{"interest_id":9,"posting_id":8,"student_name":"Mark Vincent Tan"}', '2026-10-14 02:17:47', '2026-10-06 03:18:59', '2026-10-14 02:17:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (107, 11, 'endorsement_sent', 'Endorsement Letter Received', 'The endorsement letter for Alyssa Nicole Castro applying to "Associate Software & Cloud Infrastructure Intern" has been issued by Coordinator Mariene Labrador. You may now proceed with interview scheduling.', '{"interest_id":10,"posting_id":8,"student_name":"Alyssa Nicole Castro"}', '2026-10-14 02:17:47', '2026-10-06 03:18:59', '2026-10-14 02:17:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (116, 11, 'ojt_approved', 'OJT Coordinator Approved — Set Start Date', 'The OJT Coordinator has approved Mark Vincent Tan''s deployment for "Associate Software & Cloud Infrastructure Intern". Please set the OJT start date and work shift instructions.', '{"posting_id":8,"interest_id":9}', '2026-10-14 02:17:47', '2026-10-06 03:18:59', '2026-10-14 02:17:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (118, 11, 'ojt_approved', 'OJT Coordinator Approved — Set Start Date', 'The OJT Coordinator has approved Alyssa Nicole Castro''s deployment for "Associate Software & Cloud Infrastructure Intern". Please set the OJT start date and work shift instructions.', '{"posting_id":8,"interest_id":10}', '2026-10-14 02:17:47', '2026-10-06 03:18:59', '2026-10-14 02:17:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (123, 11, 'student_applied', 'New OJT Application', 'Mark Vincent Tan applied to your OJT posting "Associate Software & Cloud Infrastructure Intern".', '{"interest_id":11,"posting_id":9,"student_name":"Mark Vincent Tan"}', '2026-10-14 02:17:47', '2026-10-06 03:19:15', '2026-10-14 02:17:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (124, 11, 'student_applied', 'New OJT Application', 'Alyssa Nicole Castro applied to your OJT posting "Associate Software & Cloud Infrastructure Intern".', '{"interest_id":12,"posting_id":9,"student_name":"Alyssa Nicole Castro"}', '2026-10-14 02:17:47', '2026-10-06 03:19:15', '2026-10-14 02:17:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (327, 58, 'pull_out_printed', '📄 OJT Pull-Out Letter Printed', 'Program Chair has generated and printed the official pull-out memorandum for the Dean''s physical signature.', '{"pull_out_id":3}', NULL, '2026-10-14 02:41:22', '2026-10-14 02:41:22');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (136, 5, 'company_accepted', 'Student Accepted — Final OJT Approval Needed', 'Na Ah Company has accepted Mark Vincent Tan after their interview for "Associate Software & Cloud Infrastructure Intern". Please review and grant final OJT deployment approval.', '{"interest_id":11,"posting_id":9}', NULL, '2026-10-06 03:19:16', '2026-10-06 03:19:16');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (339, 1, 'pull_out_recommended', '📄 OJT Pull-Out Recommended', 'Coordinator IT Supervisor recommended pull-out for Joshua Vance Rivera (Na Ah Company). Awaiting Program Chair & Dean approval.', '{"pull_out_id":5,"student_id":58,"student_name":"Joshua Vance Rivera","supervisor_name":"IT Supervisor"}', NULL, '2026-10-14 11:34:05', '2026-10-14 11:34:05');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (138, 5, 'company_accepted', 'Student Accepted — Final OJT Approval Needed', 'Na Ah Company has accepted Alyssa Nicole Castro after their interview for "Associate Software & Cloud Infrastructure Intern". Please review and grant final OJT deployment approval.', '{"interest_id":12,"posting_id":9}', NULL, '2026-10-06 03:19:16', '2026-10-06 03:19:16');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (340, 58, 'pull_out_recommended_student', '✅ OJT Pull-Out Recommended by Supervisor', 'Your academic coordinator recommended approval for your OJT pull-out from Na Ah Company. Request forwarded to the Program Chair (Admin) for Dean''s letter generation.', '{"pull_out_id":5}', NULL, '2026-10-14 11:34:05', '2026-10-14 11:34:05');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (358, 5, 'fit_to_work_uploaded', '🩺 Medical Fit-to-Work Clearance Uploaded', 'Althea Joy Villanueva uploaded a Fit-to-Work clearance certificate to resume OJT training.', '{"emergency_id":2,"student_id":18,"student_name":"Althea Joy Villanueva"}', NULL, '2026-10-15 20:38:52', '2026-10-15 20:38:52');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (359, 57, 'fit_to_work_uploaded', '🩺 Medical Fit-to-Work Clearance Uploaded', 'Althea Joy Villanueva uploaded a Fit-to-Work clearance certificate to resume OJT training.', '{"emergency_id":2,"student_id":18,"student_name":"Althea Joy Villanueva"}', '2026-10-15 20:39:00', '2026-10-15 20:38:52', '2026-10-15 20:39:00');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (369, 59, 'endorsement_requested', 'Endorsement Requested by Company', 'Na Ah Company reviewed your application for "Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)" and requested an endorsement letter from your OJT Coordinator.', '{"posting_id":15,"interest_id":28}', NULL, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (144, 5, 'ojt_confirmed', 'Student OJT Start Date & Schedule Set', 'Mark Vincent Tan''s OJT at Na Ah Company has been confirmed to start on Jun 22, 2026 (Mon–Fri, 08:00 – 17:00).', '{"posting_id":9,"interest_id":11}', NULL, '2026-10-06 03:19:16', '2026-10-06 03:19:16');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (146, 5, 'ojt_confirmed', 'Student OJT Start Date & Schedule Set', 'Alyssa Nicole Castro''s OJT at Na Ah Company has been confirmed to start on Jun 22, 2026 (Mon–Fri, 08:00 – 17:00).', '{"posting_id":9,"interest_id":12}', NULL, '2026-10-06 03:19:16', '2026-10-06 03:19:16');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (435, 6, 'student_applied', 'New OJT Application', 'Slot Test Student applied to your OJT posting "QA Trainee - Zero Slots Test".', '{"interest_id":null,"posting_id":16,"student_name":"Slot Test Student"}', NULL, '2026-10-21 09:46:05', '2026-10-21 09:46:05');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (149, 13, 'endorsement_requested', 'Endorsement Requested by Company', 'Na Ah Company reviewed your application for "Associate Software & Cloud Infrastructure Intern" and requested an endorsement letter from your OJT Coordinator.', '{"posting_id":10,"interest_id":13}', NULL, '2026-10-06 03:19:43', '2026-10-06 03:19:43');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (150, 5, 'endorsement_requested', 'Endorsement Letter Requested', 'Na Ah Company is requesting an endorsement letter for student Mark Vincent Tan applying to "Associate Software & Cloud Infrastructure Intern". Please review and upload the endorsement letter.', '{"interest_id":13,"posting_id":10}', NULL, '2026-10-06 03:19:43', '2026-10-06 03:19:43');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (151, 14, 'endorsement_requested', 'Endorsement Requested by Company', 'Na Ah Company reviewed your application for "Associate Software & Cloud Infrastructure Intern" and requested an endorsement letter from your OJT Coordinator.', '{"posting_id":10,"interest_id":14}', NULL, '2026-10-06 03:19:43', '2026-10-06 03:19:43');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (152, 5, 'endorsement_requested', 'Endorsement Letter Requested', 'Na Ah Company is requesting an endorsement letter for student Alyssa Nicole Castro applying to "Associate Software & Cloud Infrastructure Intern". Please review and upload the endorsement letter.', '{"interest_id":14,"posting_id":10}', NULL, '2026-10-06 03:19:43', '2026-10-06 03:19:43');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (154, 13, 'endorsement_sent', 'Endorsement Letter Issued', 'Prof. Mariene Labrador has sent your official endorsement letter to Na Ah Company for "Associate Software & Cloud Infrastructure Intern".', '{"posting_id":10,"interest_id":13}', NULL, '2026-10-06 03:19:43', '2026-10-06 03:19:43');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (156, 14, 'endorsement_sent', 'Endorsement Letter Issued', 'Prof. Mariene Labrador has sent your official endorsement letter to Na Ah Company for "Associate Software & Cloud Infrastructure Intern".', '{"posting_id":10,"interest_id":14}', NULL, '2026-10-06 03:19:44', '2026-10-06 03:19:44');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (140, 11, 'ojt_approved', 'OJT Coordinator Approved — Set Start Date', 'The OJT Coordinator has approved Mark Vincent Tan''s deployment for "Associate Software & Cloud Infrastructure Intern". Please set the OJT start date and work shift instructions.', '{"posting_id":9,"interest_id":11}', '2026-10-14 02:17:47', '2026-10-06 03:19:16', '2026-10-14 02:17:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (142, 11, 'ojt_approved', 'OJT Coordinator Approved — Set Start Date', 'The OJT Coordinator has approved Alyssa Nicole Castro''s deployment for "Associate Software & Cloud Infrastructure Intern". Please set the OJT start date and work shift instructions.', '{"posting_id":9,"interest_id":12}', '2026-10-14 02:17:47', '2026-10-06 03:19:16', '2026-10-14 02:17:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (147, 11, 'student_applied', 'New OJT Application', 'Mark Vincent Tan applied to your OJT posting "Associate Software & Cloud Infrastructure Intern".', '{"interest_id":13,"posting_id":10,"student_name":"Mark Vincent Tan"}', '2026-10-14 02:17:47', '2026-10-06 03:19:43', '2026-10-14 02:17:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (148, 11, 'student_applied', 'New OJT Application', 'Alyssa Nicole Castro applied to your OJT posting "Associate Software & Cloud Infrastructure Intern".', '{"interest_id":14,"posting_id":10,"student_name":"Alyssa Nicole Castro"}', '2026-10-14 02:17:47', '2026-10-06 03:19:43', '2026-10-14 02:17:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (153, 11, 'endorsement_sent', 'Endorsement Letter Received', 'The endorsement letter for Mark Vincent Tan applying to "Associate Software & Cloud Infrastructure Intern" has been issued by Coordinator Mariene Labrador. You may now proceed with interview scheduling.', '{"interest_id":13,"posting_id":10,"student_name":"Mark Vincent Tan"}', '2026-10-14 02:17:47', '2026-10-06 03:19:43', '2026-10-14 02:17:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (155, 11, 'endorsement_sent', 'Endorsement Letter Received', 'The endorsement letter for Alyssa Nicole Castro applying to "Associate Software & Cloud Infrastructure Intern" has been issued by Coordinator Mariene Labrador. You may now proceed with interview scheduling.', '{"interest_id":14,"posting_id":10,"student_name":"Alyssa Nicole Castro"}', '2026-10-14 02:17:47', '2026-10-06 03:19:44', '2026-10-14 02:17:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (260, 22, 'endorsement_sent', 'Endorsement Letter Issued', 'Prof. Mariene Labrador has sent your official endorsement letter to Na Ah Company for "Enterprise Cloud & Full-Stack Systems Intern".', '{"posting_id":13,"interest_id":24}', NULL, '2026-10-14 02:33:40', '2026-10-14 02:33:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (261, 58, 'interview_scheduled', 'Face-to-Face Technical Interview Scheduled 📅', 'Na Ah Company scheduled your interview for Oct 13, 2026 at 09:00 AM. Location: Na Ah Company Tech Hub, 45 Rizal St., Bacolod City (Conference Room B). Note: Please bring your student ID and a printed copy of your endorsement letter. Prepare for a technical discussion on full-stack architecture.', '{"posting_id":13,"interest_id":22}', NULL, '2026-10-14 02:33:40', '2026-10-14 02:33:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (157, 13, 'interview_scheduled', 'Face-to-Face Technical Interview Scheduled', 'Na Ah Company scheduled your interview for Jun 16, 2026 at 10:00 AM. Location: Na Ah Company Tech Hub, 45 Rizal St., Bacolod City (Conference Room B). Note: Please arrive 15 minutes before your time slot. Bring your student ID, a printed copy of your endorsement letter, and be ready for a brief technical walkthrough.', '{"posting_id":10,"interest_id":13}', NULL, '2026-10-06 03:19:44', '2026-10-06 03:19:44');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (158, 14, 'interview_scheduled', 'Face-to-Face Technical Interview Scheduled', 'Na Ah Company scheduled your interview for Jun 16, 2026 at 10:00 AM. Location: Na Ah Company Tech Hub, 45 Rizal St., Bacolod City (Conference Room B). Note: Please arrive 15 minutes before your time slot. Bring your student ID, a printed copy of your endorsement letter, and be ready for a brief technical walkthrough.', '{"posting_id":10,"interest_id":14}', NULL, '2026-10-06 03:19:44', '2026-10-06 03:19:44');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (159, 13, 'company_accepted', 'Interview Result — Accepted! 🎉', 'Na Ah Company has officially accepted you after the interview for "Associate Software & Cloud Infrastructure Intern". Message: Candidate demonstrated exceptional proficiency during the technical panel and great collaborative aptitude. Accepted for 600-hour practicum placement.. The OJT Coordinator will provide final approval shortly.', '{"posting_id":10,"interest_id":13}', NULL, '2026-10-06 03:19:44', '2026-10-06 03:19:44');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (160, 5, 'company_accepted', 'Student Accepted — Final OJT Approval Needed', 'Na Ah Company has accepted Mark Vincent Tan after their interview for "Associate Software & Cloud Infrastructure Intern". Please review and grant final OJT deployment approval.', '{"interest_id":13,"posting_id":10}', NULL, '2026-10-06 03:19:44', '2026-10-06 03:19:44');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (161, 14, 'company_accepted', 'Interview Result — Accepted! 🎉', 'Na Ah Company has officially accepted you after the interview for "Associate Software & Cloud Infrastructure Intern". Message: Candidate demonstrated exceptional proficiency during the technical panel and great collaborative aptitude. Accepted for 600-hour practicum placement.. The OJT Coordinator will provide final approval shortly.', '{"posting_id":10,"interest_id":14}', NULL, '2026-10-06 03:19:44', '2026-10-06 03:19:44');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (162, 5, 'company_accepted', 'Student Accepted — Final OJT Approval Needed', 'Na Ah Company has accepted Alyssa Nicole Castro after their interview for "Associate Software & Cloud Infrastructure Intern". Please review and grant final OJT deployment approval.', '{"interest_id":14,"posting_id":10}', NULL, '2026-10-06 03:19:44', '2026-10-06 03:19:44');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (163, 13, 'ojt_approved', 'OJT Approved by Coordinator! 🎉', 'Prof. Mariene Labrador has granted final approval for your OJT at Na Ah Company. The company will now configure your start date and schedule.', '{"posting_id":10,"interest_id":13}', NULL, '2026-10-06 03:19:44', '2026-10-06 03:19:44');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (328, 58, 'pull_out_rejected_dean', '⚠️ Dean Declined OJT Pull-Out Request', 'Dean did not authorize the pull-out. Remarks: Please consult your OJT Coordinator.', '{"pull_out_id":3}', NULL, '2026-10-14 11:13:17', '2026-10-14 11:13:17');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (165, 14, 'ojt_approved', 'OJT Approved by Coordinator! 🎉', 'Prof. Mariene Labrador has granted final approval for your OJT at Na Ah Company. The company will now configure your start date and schedule.', '{"posting_id":10,"interest_id":14}', NULL, '2026-10-06 03:19:44', '2026-10-06 03:19:44');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (341, 58, 'pull_out_finalized_student', '🎉 Dean Approved OJT Pull-Out', 'Official pull-out from Na Ah Company approved. 0 hours credited. You are authorized for re-deployment to another host company.', '{"pull_out_id":5,"credited_hours":0}', NULL, '2026-10-14 11:34:59', '2026-10-14 11:34:59');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (167, 13, 'ojt_confirmed', 'OJT Start Date & Schedule Confirmed — Jun 22, 2026 📅', 'Na Ah Company confirmed your OJT start date: Jun 22, 2026. Schedule: Mon–Fri, 08:00 – 17:00 (Lunch: 12:00 – 13:00). Instructions: Report to Na Ah Company Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp on June 22, 2026. Bring your CHMSU student ID and personal developer laptop. Look for Ms. Karen at reception.', '{"posting_id":10,"interest_id":13}', NULL, '2026-10-06 03:19:44', '2026-10-06 03:19:44');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (168, 5, 'ojt_confirmed', 'Student OJT Start Date & Schedule Set', 'Mark Vincent Tan''s OJT at Na Ah Company has been confirmed to start on Jun 22, 2026 (Mon–Fri, 08:00 – 17:00).', '{"posting_id":10,"interest_id":13}', NULL, '2026-10-06 03:19:44', '2026-10-06 03:19:44');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (169, 14, 'ojt_confirmed', 'OJT Start Date & Schedule Confirmed — Jun 22, 2026 📅', 'Na Ah Company confirmed your OJT start date: Jun 22, 2026. Schedule: Mon–Fri, 08:00 – 17:00 (Lunch: 12:00 – 13:00). Instructions: Report to Na Ah Company Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp on June 22, 2026. Bring your CHMSU student ID and personal developer laptop. Look for Ms. Karen at reception.', '{"posting_id":10,"interest_id":14}', NULL, '2026-10-06 03:19:44', '2026-10-06 03:19:44');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (170, 5, 'ojt_confirmed', 'Student OJT Start Date & Schedule Set', 'Alyssa Nicole Castro''s OJT at Na Ah Company has been confirmed to start on Jun 22, 2026 (Mon–Fri, 08:00 – 17:00).', '{"posting_id":10,"interest_id":14}', NULL, '2026-10-06 03:19:44', '2026-10-06 03:19:44');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (430, 15, 'chat_message', 'New message from Na Ah Company', 'ily', '{"conversation_key":"ojt_interest_32","sender_id":11}', '2026-10-17 16:18:43', '2026-10-17 16:18:27', '2026-10-17 16:18:43');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (172, 55, 'company_accepted', 'Application Reviewed', 'Na Ah Company has reviewed your application for "Quality Assurance & Software Testing Intern". Message: Impressive QA portfolio and thorough test case samples. Strong proficiency in Cypress and API testing. Accepted for endorsement processing.', '{"posting_id":11,"interest_id":15}', NULL, '2026-10-06 09:13:45', '2026-10-06 09:13:45');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (173, 5, 'endorsement_requested', 'Endorsement Letter Requested', 'Na Ah Company is requesting an endorsement letter for student Dave Salvador applying to "Quality Assurance & Software Testing Intern". Please upload the endorsement letter.', '{"interest_id":15,"posting_id":11}', NULL, '2026-10-06 09:13:45', '2026-10-06 09:13:45');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (174, 55, 'endorsement_requested', 'Endorsement Requested', 'The company Na Ah Company has requested an endorsement letter from the OJT Coordinator for your application to "Quality Assurance & Software Testing Intern". Please wait for the coordinator to upload it.', '{"posting_id":11,"interest_id":15}', NULL, '2026-10-06 09:13:45', '2026-10-06 09:13:45');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (176, 55, 'endorsement_sent', 'Endorsement Letter Sent', 'Prof. Mariene Labrador has sent your official endorsement letter to Na Ah Company for "Quality Assurance & Software Testing Intern". Waiting for company interview scheduling.', '{"posting_id":11,"interest_id":15}', NULL, '2026-10-06 09:13:45', '2026-10-06 09:13:45');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (177, 55, 'interview_scheduled', 'Interview Scheduled', 'Na Ah Company has scheduled a Face-to-Face interview for you on Oct 06, 2026 at 05:13 AM. Location: Na Ah Company Tech Hub, 45 Rizal St., Bacolod City (QA Assessment Lab 2). Note: Please arrive 15 minutes before schedule. Bring your CHMSU student ID, a printed copy of your endorsement letter, and developer laptop for a practical test case design walkthrough.', '{"posting_id":11,"interest_id":15}', NULL, '2026-10-06 09:13:45', '2026-10-06 09:13:45');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (171, 11, 'student_applied', 'New OJT Application', 'Dave Salvador applied to your OJT posting "Quality Assurance & Software Testing Intern".', '{"interest_id":15,"posting_id":11,"student_name":"Dave Salvador"}', '2026-10-11 11:40:50', '2026-10-06 09:13:45', '2026-10-11 11:40:50');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (164, 11, 'ojt_approved', 'OJT Coordinator Approved — Set Start Date', 'The OJT Coordinator has approved Mark Vincent Tan''s deployment for "Associate Software & Cloud Infrastructure Intern". Please set the OJT start date and work shift instructions.', '{"posting_id":10,"interest_id":13}', '2026-10-14 02:17:47', '2026-10-06 03:19:44', '2026-10-14 02:17:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (178, 17, 'requirements_assigned', 'OJT Requirements Assigned: Pre-Deployment OJT Document Packet', 'Prof. Mariene Labrador assigned 6 requirement(s) (Parents / Guardian Waiver (Notarized), Medical Examination Certificate (Fit to Work), Certificate of Registration (COR) / Study Load and 3 more) for your OJT. Please submit your documents by Oct 21, 2026. Upload your files to Google Drive and submit your folder link.', '{"requirement_id":17,"supervisor_id":5,"supervisor_name":"Mariene Labrador","due_date":"2026-10-21","action_url":"#portfolio"}', NULL, '2026-10-07 11:22:12', '2026-10-07 11:22:12');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (179, 15, 'requirements_assigned', 'OJT Requirements Assigned: Pre-Deployment OJT Document Packet', 'Prof. Mariene Labrador assigned 6 requirement(s) (Parents / Guardian Waiver (Notarized), Medical Examination Certificate (Fit to Work), Certificate of Registration (COR) / Study Load and 3 more) for your OJT. Please submit your documents by Oct 21, 2026. Upload your files to Google Drive and submit your folder link.', '{"requirement_id":18,"supervisor_id":5,"supervisor_name":"Mariene Labrador","due_date":"2026-10-21","action_url":"#portfolio"}', NULL, '2026-10-08 00:39:52', '2026-10-08 00:39:52');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (180, 5, 'requirements_submitted', 'OJT Requirements Submitted: Christian Dave Ramos', 'Christian Dave Ramos has submitted their Google Drive folder for OJT requirements review (Pre-Deployment OJT Document Packet).', '{"requirement_id":18,"student_id":15,"student_name":"Christian Dave Ramos","drive_url":"https:\/\/drive.google.com\/drive\/folders\/104yI_7TrQFChZgC4jbSD28Q0R6gtMaiN?usp=sharing","action_url":"#trainees"}', NULL, '2026-10-08 00:43:49', '2026-10-08 00:43:49');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (181, 15, 'requirements_verified', 'OJT Requirements Approved!', 'Prof. Mariene Labrador has reviewed and verified your OJT requirements folder (Pre-Deployment OJT Document Packet). You are approved for the next OJT placement stage!', '{"requirement_id":18,"supervisor_id":5,"supervisor_name":"Mariene Labrador","action_url":"#ojt"}', NULL, '2026-10-08 00:44:27', '2026-10-08 00:44:27');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (182, 6, 'student_applied', 'New OJT Application', 'Christian Dave Ramos applied to your OJT posting "Full Stack Web Developer Intern".', '{"interest_id":null,"posting_id":6,"student_name":"Christian Dave Ramos"}', '2026-10-08 00:45:47', '2026-10-08 00:45:31', '2026-10-08 00:45:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (183, 15, 'company_accepted', 'Application Reviewed', 'PGLang has reviewed your application for "Full Stack Web Developer Intern". Message: We have reviewed your profile and portfolio and would like to proceed with your application.', '{"posting_id":6,"interest_id":16}', NULL, '2026-10-08 00:46:24', '2026-10-08 00:46:24');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (184, 15, 'company_rejected', 'Application Not Accepted', 'PGLang was unable to proceed with your application for "Full Stack Web Developer Intern". Reason: you are not qualified', '{"posting_id":6,"interest_id":16}', NULL, '2026-10-08 00:47:04', '2026-10-08 00:47:04');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (185, 6, 'student_applied', 'New OJT Application', 'Christian Dave Ramos applied to your OJT posting "IT Support Intern".', '{"interest_id":null,"posting_id":1,"student_name":"Christian Dave Ramos"}', NULL, '2026-10-08 00:47:53', '2026-10-08 00:47:53');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (186, 23, 'requirements_assigned', 'OJT Requirements Assigned: Pre-Deployment OJT Document Packet', 'Prof. Mariene Labrador assigned 6 requirement(s) (Parents / Guardian Waiver (Notarized), Medical Examination Certificate (Fit to Work), Certificate of Registration (COR) / Study Load and 3 more) for your OJT. Please submit your documents by Oct 22, 2026. Upload your files to Google Drive and submit your folder link.', '{"requirement_id":19,"supervisor_id":5,"supervisor_name":"Mariene Labrador","due_date":"2026-10-22","action_url":"#portfolio"}', '2026-10-08 18:58:25', '2026-10-08 18:58:15', '2026-10-08 18:58:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (187, 5, 'requirements_submitted', 'OJT Requirements Submitted: Kevin James Aguilar', 'Kevin James Aguilar has submitted their Google Drive folder for OJT requirements review (Pre-Deployment OJT Document Packet).', '{"requirement_id":19,"student_id":23,"student_name":"Kevin James Aguilar","drive_url":"https:\/\/drive.google.com\/drive\/folders\/104yI_7TrQFChZgC4jbSD28Q0R6gtMaiN?usp=sharing","action_url":"#trainees"}', NULL, '2026-10-08 19:03:56', '2026-10-08 19:03:56');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (188, 23, 'requirements_verified', 'OJT Requirements Approved!', 'Prof. Mariene Labrador has reviewed and verified your OJT requirements folder (Pre-Deployment OJT Document Packet). You are approved for the next OJT placement stage!', '{"requirement_id":19,"supervisor_id":5,"supervisor_name":"Mariene Labrador","action_url":"#ojt"}', NULL, '2026-10-08 19:04:41', '2026-10-08 19:04:41');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (189, 6, 'student_applied', 'New OJT Application', 'Kevin James Aguilar applied to your OJT posting "Full Stack Web Developer Intern".', '{"interest_id":null,"posting_id":6,"student_name":"Kevin James Aguilar"}', NULL, '2026-10-08 19:05:29', '2026-10-08 19:05:29');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (190, 23, 'company_accepted', 'Application Reviewed', 'PGLang has reviewed your application for "Full Stack Web Developer Intern". Message: We have reviewed your profile and portfolio and would like to proceed with your application.', '{"posting_id":6,"interest_id":18}', NULL, '2026-10-08 19:07:30', '2026-10-08 19:07:30');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (191, 5, 'endorsement_requested', 'Endorsement Letter Requested', 'PGLang is requesting an endorsement letter for student Kevin James Aguilar applying to "Full Stack Web Developer Intern". Please upload the endorsement letter.', '{"interest_id":18,"posting_id":6}', NULL, '2026-10-08 19:08:24', '2026-10-08 19:08:24');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (192, 23, 'endorsement_requested', 'Endorsement Requested', 'The company PGLang has requested an endorsement letter from the OJT Coordinator for your application to "Full Stack Web Developer Intern". Please wait for the coordinator to upload it.', '{"posting_id":6,"interest_id":18}', NULL, '2026-10-08 19:08:24', '2026-10-08 19:08:24');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (193, 6, 'endorsement_sent', 'Endorsement Letter Received', 'The endorsement letter for Kevin James Aguilar applying to "Full Stack Web Developer Intern" has been sent by the supervisor. You can now start their OJT.', '{"interest_id":18,"posting_id":6,"student_name":"Kevin James Aguilar"}', NULL, '2026-10-08 19:09:15', '2026-10-08 19:09:15');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (194, 23, 'endorsement_sent', 'Endorsement Letter Sent', 'Your supervisor has sent the endorsement letter to PGLang for "Full Stack Web Developer Intern". Waiting for OJT confirmation.', '{"posting_id":6,"interest_id":18}', NULL, '2026-10-08 19:09:15', '2026-10-08 19:09:15');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (195, 23, 'interview_scheduled', 'Interview Scheduled', 'PGLang has scheduled a Face-to-Face interview for you on Oct 17, 2026 at 01:00 PM. Location: BACOLOD CITY. Note: Dont be late and bring all the requirements', '{"posting_id":6,"interest_id":18}', NULL, '2026-10-08 19:11:41', '2026-10-08 19:11:41');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (196, 5, 'emergency_stoppage_filed', '🚨 Urgent: OJT Emergency Notice Filed', 'Kevin Morales filed a Formal Stoppage & Withdrawal (Other). Supporting proof provided for review.', '{"emergency_id":1,"student_id":12,"student_name":"Kevin Morales","type":"permanent_withdrawal","category":"other"}', '2026-10-09 02:22:01', '2026-10-09 02:21:19', '2026-10-09 02:22:01');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (197, 11, 'trainee_emergency_notice', '⚠️ Trainee Emergency Notice', 'Trainee Kevin Morales filed an Formal Stoppage & Withdrawal (Other). Academic coordinator has been alerted.', '{"emergency_id":1,"student_id":12,"student_name":"Kevin Morales","type":"permanent_withdrawal"}', '2026-10-11 11:40:40', '2026-10-09 02:21:19', '2026-10-11 11:40:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (175, 11, 'endorsement_sent', 'Endorsement Letter Received', 'The endorsement letter for Dave Salvador applying to "Quality Assurance & Software Testing Intern" has been issued by Coordinator Mariene Labrador. You may now proceed with interview scheduling.', '{"interest_id":15,"posting_id":11,"student_name":"Dave Salvador"}', '2026-10-11 11:40:44', '2026-10-06 09:13:45', '2026-10-11 11:40:44');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (200, 5, 'company_clearance_submitted', 'Company Clearance Submitted', 'Host Company (Na Ah Company) signed clearance for Kevin Morales.', '{"emergency_id":1}', NULL, '2026-10-11 14:21:37', '2026-10-11 14:21:37');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (202, 14, 'ojt_evaluation_sent', 'OJT Evaluation Request Sent 🚀', 'Your OJT Coordinator has requested your performance evaluation from Na Ah Company. You will be notified once they submit it.', '{"evaluation_id":1,"company_name":"Na Ah Company"}', NULL, '2026-10-12 14:35:59', '2026-10-12 14:35:59');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (203, 57, 'ojt_evaluation_completed', 'OJT Evaluation Submitted! ⭐', 'Na Ah Company has submitted the performance evaluation for Alyssa Nicole Castro with an overall score of 5/5.0.', '{"evaluation_id":1,"student_id":14,"overall_score":5}', NULL, '2026-10-12 14:37:27', '2026-10-12 14:37:27');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (204, 14, 'ojt_evaluation_completed', 'Your OJT Evaluation is Complete! 🎉', 'Your host company has completed your OJT performance evaluation with a rating of 5/5.0. Congratulations on completing your training!', '{"evaluation_id":1,"overall_score":5}', NULL, '2026-10-12 14:37:27', '2026-10-12 14:37:27');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (205, 1, 'student_eligible_graduation', 'OJT Evaluation Submitted', 'Host company submitted performance evaluation for Alyssa Nicole Castro (5/5.0). Candidate is ready for graduation review.', '{"student_id":14,"evaluation_id":1,"route":"\/students"}', NULL, '2026-10-12 14:37:27', '2026-10-12 14:37:27');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (206, 14, 'graduation_promotion', 'Congratulations on your Graduation!', 'You have successfully completed your OJT requirement (600h) and your host company evaluation has been verified with an evaluation rating of 5/5.0. Your account has been promoted to Alumni/Graduate. Welcome to the CHMSU Alumni & Career Network!', '{"year_graduated":"2026","completed_hours":600,"evaluation_score":5,"role":"graduate","status":"alumni"}', NULL, '2026-10-12 14:42:46', '2026-10-12 14:42:46');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (49, 11, 'endorsement_sent', 'Endorsement Letter Received', 'The endorsement letter for Kevin Morales applying to "Web Development Intern" has been sent by the supervisor. You can now start their OJT.', '{"interest_id":5,"posting_id":4,"student_name":"Kevin Morales"}', '2026-10-14 02:17:47', '2026-10-05 17:44:31', '2026-10-14 02:17:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (55, 11, 'ojt_approved', 'OJT Coordinator Approved — Set Start Date', 'The OJT Coordinator has approved Kevin Morales''s OJT for "Web Development Intern". Please log in and set the OJT start date and instructions for this student so they know when to report.', '{"posting_id":4,"interest_id":5}', '2026-10-14 02:17:47', '2026-10-05 17:44:31', '2026-10-14 02:17:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (58, 11, 'student_applied', 'New OJT Application', 'Kevin Morales applied to your OJT posting "Web Development Intern".', '{"interest_id":6,"posting_id":4,"student_name":"Kevin Morales"}', '2026-10-14 02:17:47', '2026-10-05 17:45:08', '2026-10-14 02:17:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (62, 11, 'endorsement_sent', 'Endorsement Letter Received', 'The endorsement letter for Kevin Morales applying to "Web Development Intern" has been sent by the supervisor. You can now start their OJT.', '{"interest_id":6,"posting_id":4,"student_name":"Kevin Morales"}', '2026-10-14 02:17:47', '2026-10-05 17:45:08', '2026-10-14 02:17:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (68, 11, 'ojt_approved', 'OJT Coordinator Approved — Set Start Date', 'The OJT Coordinator has approved Kevin Morales''s OJT for "Web Development Intern". Please log in and set the OJT start date and instructions for this student so they know when to report.', '{"posting_id":4,"interest_id":6}', '2026-10-14 02:17:47', '2026-10-05 17:45:08', '2026-10-14 02:17:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (75, 11, 'student_applied', 'New OJT Application', 'Mark Vincent Tan applied to your OJT posting "Associate Software & Cloud Infrastructure Intern".', '{"interest_id":7,"posting_id":7,"student_name":"Mark Vincent Tan"}', '2026-10-14 02:17:47', '2026-10-06 03:18:03', '2026-10-14 02:17:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (76, 11, 'student_applied', 'New OJT Application', 'Alyssa Nicole Castro applied to your OJT posting "Associate Software & Cloud Infrastructure Intern".', '{"interest_id":8,"posting_id":7,"student_name":"Alyssa Nicole Castro"}', '2026-10-14 02:17:47', '2026-10-06 03:18:03', '2026-10-14 02:17:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (199, 11, 'emergency_withdrawal_company', 'Trainee OJT Withdrawal Finalized', 'OJT Stoppage for Kevin Morales has been finalized. 1 training slot has been restored to your posting "Web Development Intern".', '{"emergency_id":1,"student_id":12,"posting_id":4}', '2026-10-14 02:17:47', '2026-10-11 14:17:02', '2026-10-14 02:17:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (94, 11, 'ojt_approved', 'OJT Coordinator Approved — Set Start Date', 'The OJT Coordinator has approved Alyssa Nicole Castro''s deployment for "Associate Software & Cloud Infrastructure Intern". Please set the OJT start date and work shift instructions.', '{"posting_id":7,"interest_id":8}', '2026-10-14 02:17:47', '2026-10-06 03:18:03', '2026-10-14 02:17:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (100, 11, 'student_applied', 'New OJT Application', 'Alyssa Nicole Castro applied to your OJT posting "Associate Software & Cloud Infrastructure Intern".', '{"interest_id":10,"posting_id":8,"student_name":"Alyssa Nicole Castro"}', '2026-10-14 02:17:47', '2026-10-06 03:18:59', '2026-10-14 02:17:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (129, 11, 'endorsement_sent', 'Endorsement Letter Received', 'The endorsement letter for Mark Vincent Tan applying to "Associate Software & Cloud Infrastructure Intern" has been issued by Coordinator Mariene Labrador. You may now proceed with interview scheduling.', '{"interest_id":11,"posting_id":9,"student_name":"Mark Vincent Tan"}', '2026-10-14 02:17:47', '2026-10-06 03:19:15', '2026-10-14 02:17:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (131, 11, 'endorsement_sent', 'Endorsement Letter Received', 'The endorsement letter for Alyssa Nicole Castro applying to "Associate Software & Cloud Infrastructure Intern" has been issued by Coordinator Mariene Labrador. You may now proceed with interview scheduling.', '{"interest_id":12,"posting_id":9,"student_name":"Alyssa Nicole Castro"}', '2026-10-14 02:17:47', '2026-10-06 03:19:16', '2026-10-14 02:17:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (166, 11, 'ojt_approved', 'OJT Coordinator Approved — Set Start Date', 'The OJT Coordinator has approved Alyssa Nicole Castro''s deployment for "Associate Software & Cloud Infrastructure Intern". Please set the OJT start date and work shift instructions.', '{"posting_id":10,"interest_id":14}', '2026-10-14 02:17:47', '2026-10-06 03:19:44', '2026-10-14 02:17:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (201, 11, 'ojt_evaluation_request', 'OJT Performance Evaluation Request 📋', 'Trainee Alyssa Nicole Castro has completed their required OJT hours (600/600 hrs). Please complete their performance evaluation.', '{"evaluation_id":1,"student_id":14,"student_name":"Alyssa Nicole Castro","posting_id":10}', '2026-10-14 02:17:47', '2026-10-12 14:35:59', '2026-10-14 02:17:47');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (210, 11, 'student_applied', 'New OJT Application', 'Joshua Vance Rivera applied to your OJT posting "Enterprise Cloud & Full-Stack Systems Intern".', '{"interest_id":19,"posting_id":12,"student_name":"Joshua Vance Rivera"}', NULL, '2026-10-14 02:33:24', '2026-10-14 02:33:24');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (211, 11, 'student_applied', 'New OJT Application', 'Althea Joy Villanueva applied to your OJT posting "Enterprise Cloud & Full-Stack Systems Intern".', '{"interest_id":20,"posting_id":12,"student_name":"Althea Joy Villanueva"}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (212, 11, 'student_applied', 'New OJT Application', 'Bea Bianca Castillo applied to your OJT posting "Enterprise Cloud & Full-Stack Systems Intern".', '{"interest_id":21,"posting_id":12,"student_name":"Bea Bianca Castillo"}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (213, 58, 'endorsement_requested', 'Endorsement Requested by Company', 'Na Ah Company reviewed your application for "Enterprise Cloud & Full-Stack Systems Intern" and requested an endorsement letter from your OJT Coordinator.', '{"posting_id":12,"interest_id":19}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (214, 5, 'endorsement_requested', 'Endorsement Letter Requested', 'Na Ah Company is requesting an endorsement letter for student Joshua Vance Rivera applying to "Enterprise Cloud & Full-Stack Systems Intern". Please review and upload the endorsement letter.', '{"interest_id":19,"posting_id":12}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (215, 18, 'endorsement_requested', 'Endorsement Requested by Company', 'Na Ah Company reviewed your application for "Enterprise Cloud & Full-Stack Systems Intern" and requested an endorsement letter from your OJT Coordinator.', '{"posting_id":12,"interest_id":20}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (216, 5, 'endorsement_requested', 'Endorsement Letter Requested', 'Na Ah Company is requesting an endorsement letter for student Althea Joy Villanueva applying to "Enterprise Cloud & Full-Stack Systems Intern". Please review and upload the endorsement letter.', '{"interest_id":20,"posting_id":12}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (217, 22, 'endorsement_requested', 'Endorsement Requested by Company', 'Na Ah Company reviewed your application for "Enterprise Cloud & Full-Stack Systems Intern" and requested an endorsement letter from your OJT Coordinator.', '{"posting_id":12,"interest_id":21}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (218, 5, 'endorsement_requested', 'Endorsement Letter Requested', 'Na Ah Company is requesting an endorsement letter for student Bea Bianca Castillo applying to "Enterprise Cloud & Full-Stack Systems Intern". Please review and upload the endorsement letter.', '{"interest_id":21,"posting_id":12}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (219, 11, 'endorsement_sent', 'Endorsement Letter Received', 'The endorsement letter for Joshua Vance Rivera applying to "Enterprise Cloud & Full-Stack Systems Intern" has been issued by Coordinator Mariene Labrador. You may now proceed with interview scheduling.', '{"interest_id":19,"posting_id":12,"student_name":"Joshua Vance Rivera"}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (220, 58, 'endorsement_sent', 'Endorsement Letter Issued', 'Prof. Mariene Labrador has sent your official endorsement letter to Na Ah Company for "Enterprise Cloud & Full-Stack Systems Intern".', '{"posting_id":12,"interest_id":19}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (221, 11, 'endorsement_sent', 'Endorsement Letter Received', 'The endorsement letter for Althea Joy Villanueva applying to "Enterprise Cloud & Full-Stack Systems Intern" has been issued by Coordinator Mariene Labrador. You may now proceed with interview scheduling.', '{"interest_id":20,"posting_id":12,"student_name":"Althea Joy Villanueva"}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (222, 18, 'endorsement_sent', 'Endorsement Letter Issued', 'Prof. Mariene Labrador has sent your official endorsement letter to Na Ah Company for "Enterprise Cloud & Full-Stack Systems Intern".', '{"posting_id":12,"interest_id":20}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (223, 11, 'endorsement_sent', 'Endorsement Letter Received', 'The endorsement letter for Bea Bianca Castillo applying to "Enterprise Cloud & Full-Stack Systems Intern" has been issued by Coordinator Mariene Labrador. You may now proceed with interview scheduling.', '{"interest_id":21,"posting_id":12,"student_name":"Bea Bianca Castillo"}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (224, 22, 'endorsement_sent', 'Endorsement Letter Issued', 'Prof. Mariene Labrador has sent your official endorsement letter to Na Ah Company for "Enterprise Cloud & Full-Stack Systems Intern".', '{"posting_id":12,"interest_id":21}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (225, 58, 'interview_scheduled', 'Face-to-Face Technical Interview Scheduled 📅', 'Na Ah Company scheduled your interview for Oct 13, 2026 at 09:00 AM. Location: Na Ah Company Tech Hub, 45 Rizal St., Bacolod City (Conference Room B). Note: Please bring your student ID and a printed copy of your endorsement letter. Prepare for a technical discussion on full-stack architecture.', '{"posting_id":12,"interest_id":19}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (226, 18, 'interview_scheduled', 'Face-to-Face Technical Interview Scheduled 📅', 'Na Ah Company scheduled your interview for Oct 13, 2026 at 10:30 AM. Location: Na Ah Company Tech Hub, 45 Rizal St., Bacolod City (Conference Room B). Note: Please bring your student ID and a printed copy of your endorsement letter. Prepare for a technical discussion on full-stack architecture.', '{"posting_id":12,"interest_id":20}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (227, 22, 'interview_scheduled', 'Face-to-Face Technical Interview Scheduled 📅', 'Na Ah Company scheduled your interview for Oct 13, 2026 at 01:30 PM. Location: Na Ah Company Tech Hub, 45 Rizal St., Bacolod City (Conference Room B). Note: Please bring your student ID and a printed copy of your endorsement letter. Prepare for a technical discussion on full-stack architecture.', '{"posting_id":12,"interest_id":21}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (228, 58, 'company_accepted', 'Interview Result — Accepted! 🎉', 'Na Ah Company has officially accepted you after the interview for "Enterprise Cloud & Full-Stack Systems Intern". Message: Candidate demonstrated exceptional performance during the technical panel and exhibited strong team collaboration aptitude. Formally accepted for 600-hour practicum placement.. The OJT Coordinator will provide final approval shortly.', '{"posting_id":12,"interest_id":19}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (229, 5, 'company_accepted', 'Student Accepted — Final OJT Approval Needed', 'Na Ah Company has accepted Joshua Vance Rivera after their interview for "Enterprise Cloud & Full-Stack Systems Intern". Please review and grant final OJT deployment approval.', '{"interest_id":19,"posting_id":12}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (230, 18, 'company_accepted', 'Interview Result — Accepted! 🎉', 'Na Ah Company has officially accepted you after the interview for "Enterprise Cloud & Full-Stack Systems Intern". Message: Candidate demonstrated exceptional performance during the technical panel and exhibited strong team collaboration aptitude. Formally accepted for 600-hour practicum placement.. The OJT Coordinator will provide final approval shortly.', '{"posting_id":12,"interest_id":20}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (231, 5, 'company_accepted', 'Student Accepted — Final OJT Approval Needed', 'Na Ah Company has accepted Althea Joy Villanueva after their interview for "Enterprise Cloud & Full-Stack Systems Intern". Please review and grant final OJT deployment approval.', '{"interest_id":20,"posting_id":12}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (232, 22, 'company_accepted', 'Interview Result — Accepted! 🎉', 'Na Ah Company has officially accepted you after the interview for "Enterprise Cloud & Full-Stack Systems Intern". Message: Candidate demonstrated exceptional performance during the technical panel and exhibited strong team collaboration aptitude. Formally accepted for 600-hour practicum placement.. The OJT Coordinator will provide final approval shortly.', '{"posting_id":12,"interest_id":21}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (233, 5, 'company_accepted', 'Student Accepted — Final OJT Approval Needed', 'Na Ah Company has accepted Bea Bianca Castillo after their interview for "Enterprise Cloud & Full-Stack Systems Intern". Please review and grant final OJT deployment approval.', '{"interest_id":21,"posting_id":12}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (234, 58, 'ojt_approved', 'OJT Approved by Coordinator! 🎉', 'Prof. Mariene Labrador has granted final approval for your OJT at Na Ah Company. The company will now configure your start date and schedule.', '{"posting_id":12,"interest_id":19}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (235, 11, 'ojt_approved', 'OJT Coordinator Approved — Set Start Date', 'The OJT Coordinator has approved Joshua Vance Rivera''s deployment for "Enterprise Cloud & Full-Stack Systems Intern". Please set the OJT start date and work shift instructions.', '{"posting_id":12,"interest_id":19}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (236, 18, 'ojt_approved', 'OJT Approved by Coordinator! 🎉', 'Prof. Mariene Labrador has granted final approval for your OJT at Na Ah Company. The company will now configure your start date and schedule.', '{"posting_id":12,"interest_id":20}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (237, 11, 'ojt_approved', 'OJT Coordinator Approved — Set Start Date', 'The OJT Coordinator has approved Althea Joy Villanueva''s deployment for "Enterprise Cloud & Full-Stack Systems Intern". Please set the OJT start date and work shift instructions.', '{"posting_id":12,"interest_id":20}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (238, 22, 'ojt_approved', 'OJT Approved by Coordinator! 🎉', 'Prof. Mariene Labrador has granted final approval for your OJT at Na Ah Company. The company will now configure your start date and schedule.', '{"posting_id":12,"interest_id":21}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (239, 11, 'ojt_approved', 'OJT Coordinator Approved — Set Start Date', 'The OJT Coordinator has approved Bea Bianca Castillo''s deployment for "Enterprise Cloud & Full-Stack Systems Intern". Please set the OJT start date and work shift instructions.', '{"posting_id":12,"interest_id":21}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (240, 58, 'ojt_confirmed', 'OJT Start Date & Schedule Confirmed — Oct 14, 2026 📅', 'Na Ah Company confirmed your OJT start date: Oct 14, 2026. Schedule: Mon–Fri, 08:00 – 17:00 (Lunch: 12:00 – 13:00). Instructions: Report to Na Ah Company Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp on October 14, 2026. Bring your CHMSU student ID and personal development laptop. Report to Ms. Karen dela Rosa at IT Reception.', '{"posting_id":12,"interest_id":19}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (241, 5, 'ojt_confirmed', 'Student OJT Start Date & Schedule Set', 'Joshua Vance Rivera''s OJT at Na Ah Company has been confirmed to start on Oct 14, 2026 (Mon–Fri, 08:00 – 17:00).', '{"posting_id":12,"interest_id":19}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (242, 18, 'ojt_confirmed', 'OJT Start Date & Schedule Confirmed — Oct 14, 2026 📅', 'Na Ah Company confirmed your OJT start date: Oct 14, 2026. Schedule: Mon–Fri, 08:00 – 17:00 (Lunch: 12:00 – 13:00). Instructions: Report to Na Ah Company Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp on October 14, 2026. Bring your CHMSU student ID and personal development laptop. Report to Ms. Karen dela Rosa at IT Reception.', '{"posting_id":12,"interest_id":20}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (243, 5, 'ojt_confirmed', 'Student OJT Start Date & Schedule Set', 'Althea Joy Villanueva''s OJT at Na Ah Company has been confirmed to start on Oct 14, 2026 (Mon–Fri, 08:00 – 17:00).', '{"posting_id":12,"interest_id":20}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (244, 22, 'ojt_confirmed', 'OJT Start Date & Schedule Confirmed — Oct 14, 2026 📅', 'Na Ah Company confirmed your OJT start date: Oct 14, 2026. Schedule: Mon–Fri, 08:00 – 17:00 (Lunch: 12:00 – 13:00). Instructions: Report to Na Ah Company Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp on October 14, 2026. Bring your CHMSU student ID and personal development laptop. Report to Ms. Karen dela Rosa at IT Reception.', '{"posting_id":12,"interest_id":21}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (245, 5, 'ojt_confirmed', 'Student OJT Start Date & Schedule Set', 'Bea Bianca Castillo''s OJT at Na Ah Company has been confirmed to start on Oct 14, 2026 (Mon–Fri, 08:00 – 17:00).', '{"posting_id":12,"interest_id":21}', NULL, '2026-10-14 02:33:25', '2026-10-14 02:33:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (246, 11, 'student_applied', 'New OJT Application', 'Joshua Vance Rivera applied to your OJT posting "Enterprise Cloud & Full-Stack Systems Intern".', '{"interest_id":22,"posting_id":13,"student_name":"Joshua Vance Rivera"}', NULL, '2026-10-14 02:33:40', '2026-10-14 02:33:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (247, 11, 'student_applied', 'New OJT Application', 'Althea Joy Villanueva applied to your OJT posting "Enterprise Cloud & Full-Stack Systems Intern".', '{"interest_id":23,"posting_id":13,"student_name":"Althea Joy Villanueva"}', NULL, '2026-10-14 02:33:40', '2026-10-14 02:33:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (248, 11, 'student_applied', 'New OJT Application', 'Bea Bianca Castillo applied to your OJT posting "Enterprise Cloud & Full-Stack Systems Intern".', '{"interest_id":24,"posting_id":13,"student_name":"Bea Bianca Castillo"}', NULL, '2026-10-14 02:33:40', '2026-10-14 02:33:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (249, 58, 'endorsement_requested', 'Endorsement Requested by Company', 'Na Ah Company reviewed your application for "Enterprise Cloud & Full-Stack Systems Intern" and requested an endorsement letter from your OJT Coordinator.', '{"posting_id":13,"interest_id":22}', NULL, '2026-10-14 02:33:40', '2026-10-14 02:33:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (250, 5, 'endorsement_requested', 'Endorsement Letter Requested', 'Na Ah Company is requesting an endorsement letter for student Joshua Vance Rivera applying to "Enterprise Cloud & Full-Stack Systems Intern". Please review and upload the endorsement letter.', '{"interest_id":22,"posting_id":13}', NULL, '2026-10-14 02:33:40', '2026-10-14 02:33:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (251, 18, 'endorsement_requested', 'Endorsement Requested by Company', 'Na Ah Company reviewed your application for "Enterprise Cloud & Full-Stack Systems Intern" and requested an endorsement letter from your OJT Coordinator.', '{"posting_id":13,"interest_id":23}', NULL, '2026-10-14 02:33:40', '2026-10-14 02:33:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (252, 5, 'endorsement_requested', 'Endorsement Letter Requested', 'Na Ah Company is requesting an endorsement letter for student Althea Joy Villanueva applying to "Enterprise Cloud & Full-Stack Systems Intern". Please review and upload the endorsement letter.', '{"interest_id":23,"posting_id":13}', NULL, '2026-10-14 02:33:40', '2026-10-14 02:33:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (253, 22, 'endorsement_requested', 'Endorsement Requested by Company', 'Na Ah Company reviewed your application for "Enterprise Cloud & Full-Stack Systems Intern" and requested an endorsement letter from your OJT Coordinator.', '{"posting_id":13,"interest_id":24}', NULL, '2026-10-14 02:33:40', '2026-10-14 02:33:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (254, 5, 'endorsement_requested', 'Endorsement Letter Requested', 'Na Ah Company is requesting an endorsement letter for student Bea Bianca Castillo applying to "Enterprise Cloud & Full-Stack Systems Intern". Please review and upload the endorsement letter.', '{"interest_id":24,"posting_id":13}', NULL, '2026-10-14 02:33:40', '2026-10-14 02:33:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (255, 11, 'endorsement_sent', 'Endorsement Letter Received', 'The endorsement letter for Joshua Vance Rivera applying to "Enterprise Cloud & Full-Stack Systems Intern" has been issued by Coordinator Mariene Labrador. You may now proceed with interview scheduling.', '{"interest_id":22,"posting_id":13,"student_name":"Joshua Vance Rivera"}', NULL, '2026-10-14 02:33:40', '2026-10-14 02:33:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (256, 58, 'endorsement_sent', 'Endorsement Letter Issued', 'Prof. Mariene Labrador has sent your official endorsement letter to Na Ah Company for "Enterprise Cloud & Full-Stack Systems Intern".', '{"posting_id":13,"interest_id":22}', NULL, '2026-10-14 02:33:40', '2026-10-14 02:33:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (257, 11, 'endorsement_sent', 'Endorsement Letter Received', 'The endorsement letter for Althea Joy Villanueva applying to "Enterprise Cloud & Full-Stack Systems Intern" has been issued by Coordinator Mariene Labrador. You may now proceed with interview scheduling.', '{"interest_id":23,"posting_id":13,"student_name":"Althea Joy Villanueva"}', NULL, '2026-10-14 02:33:40', '2026-10-14 02:33:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (258, 18, 'endorsement_sent', 'Endorsement Letter Issued', 'Prof. Mariene Labrador has sent your official endorsement letter to Na Ah Company for "Enterprise Cloud & Full-Stack Systems Intern".', '{"posting_id":13,"interest_id":23}', NULL, '2026-10-14 02:33:40', '2026-10-14 02:33:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (259, 11, 'endorsement_sent', 'Endorsement Letter Received', 'The endorsement letter for Bea Bianca Castillo applying to "Enterprise Cloud & Full-Stack Systems Intern" has been issued by Coordinator Mariene Labrador. You may now proceed with interview scheduling.', '{"interest_id":24,"posting_id":13,"student_name":"Bea Bianca Castillo"}', NULL, '2026-10-14 02:33:40', '2026-10-14 02:33:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (262, 18, 'interview_scheduled', 'Face-to-Face Technical Interview Scheduled 📅', 'Na Ah Company scheduled your interview for Oct 13, 2026 at 10:30 AM. Location: Na Ah Company Tech Hub, 45 Rizal St., Bacolod City (Conference Room B). Note: Please bring your student ID and a printed copy of your endorsement letter. Prepare for a technical discussion on full-stack architecture.', '{"posting_id":13,"interest_id":23}', NULL, '2026-10-14 02:33:40', '2026-10-14 02:33:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (263, 22, 'interview_scheduled', 'Face-to-Face Technical Interview Scheduled 📅', 'Na Ah Company scheduled your interview for Oct 13, 2026 at 01:30 PM. Location: Na Ah Company Tech Hub, 45 Rizal St., Bacolod City (Conference Room B). Note: Please bring your student ID and a printed copy of your endorsement letter. Prepare for a technical discussion on full-stack architecture.', '{"posting_id":13,"interest_id":24}', NULL, '2026-10-14 02:33:40', '2026-10-14 02:33:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (264, 58, 'company_accepted', 'Interview Result — Accepted! 🎉', 'Na Ah Company has officially accepted you after the interview for "Enterprise Cloud & Full-Stack Systems Intern". Message: Candidate demonstrated exceptional performance during the technical panel and exhibited strong team collaboration aptitude. Formally accepted for 600-hour practicum placement.. The OJT Coordinator will provide final approval shortly.', '{"posting_id":13,"interest_id":22}', NULL, '2026-10-14 02:33:40', '2026-10-14 02:33:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (265, 5, 'company_accepted', 'Student Accepted — Final OJT Approval Needed', 'Na Ah Company has accepted Joshua Vance Rivera after their interview for "Enterprise Cloud & Full-Stack Systems Intern". Please review and grant final OJT deployment approval.', '{"interest_id":22,"posting_id":13}', NULL, '2026-10-14 02:33:40', '2026-10-14 02:33:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (266, 18, 'company_accepted', 'Interview Result — Accepted! 🎉', 'Na Ah Company has officially accepted you after the interview for "Enterprise Cloud & Full-Stack Systems Intern". Message: Candidate demonstrated exceptional performance during the technical panel and exhibited strong team collaboration aptitude. Formally accepted for 600-hour practicum placement.. The OJT Coordinator will provide final approval shortly.', '{"posting_id":13,"interest_id":23}', NULL, '2026-10-14 02:33:40', '2026-10-14 02:33:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (267, 5, 'company_accepted', 'Student Accepted — Final OJT Approval Needed', 'Na Ah Company has accepted Althea Joy Villanueva after their interview for "Enterprise Cloud & Full-Stack Systems Intern". Please review and grant final OJT deployment approval.', '{"interest_id":23,"posting_id":13}', NULL, '2026-10-14 02:33:40', '2026-10-14 02:33:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (268, 22, 'company_accepted', 'Interview Result — Accepted! 🎉', 'Na Ah Company has officially accepted you after the interview for "Enterprise Cloud & Full-Stack Systems Intern". Message: Candidate demonstrated exceptional performance during the technical panel and exhibited strong team collaboration aptitude. Formally accepted for 600-hour practicum placement.. The OJT Coordinator will provide final approval shortly.', '{"posting_id":13,"interest_id":24}', NULL, '2026-10-14 02:33:40', '2026-10-14 02:33:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (269, 5, 'company_accepted', 'Student Accepted — Final OJT Approval Needed', 'Na Ah Company has accepted Bea Bianca Castillo after their interview for "Enterprise Cloud & Full-Stack Systems Intern". Please review and grant final OJT deployment approval.', '{"interest_id":24,"posting_id":13}', NULL, '2026-10-14 02:33:40', '2026-10-14 02:33:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (270, 58, 'ojt_approved', 'OJT Approved by Coordinator! 🎉', 'Prof. Mariene Labrador has granted final approval for your OJT at Na Ah Company. The company will now configure your start date and schedule.', '{"posting_id":13,"interest_id":22}', NULL, '2026-10-14 02:33:40', '2026-10-14 02:33:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (271, 11, 'ojt_approved', 'OJT Coordinator Approved — Set Start Date', 'The OJT Coordinator has approved Joshua Vance Rivera''s deployment for "Enterprise Cloud & Full-Stack Systems Intern". Please set the OJT start date and work shift instructions.', '{"posting_id":13,"interest_id":22}', NULL, '2026-10-14 02:33:40', '2026-10-14 02:33:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (272, 18, 'ojt_approved', 'OJT Approved by Coordinator! 🎉', 'Prof. Mariene Labrador has granted final approval for your OJT at Na Ah Company. The company will now configure your start date and schedule.', '{"posting_id":13,"interest_id":23}', NULL, '2026-10-14 02:33:40', '2026-10-14 02:33:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (273, 11, 'ojt_approved', 'OJT Coordinator Approved — Set Start Date', 'The OJT Coordinator has approved Althea Joy Villanueva''s deployment for "Enterprise Cloud & Full-Stack Systems Intern". Please set the OJT start date and work shift instructions.', '{"posting_id":13,"interest_id":23}', NULL, '2026-10-14 02:33:40', '2026-10-14 02:33:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (274, 22, 'ojt_approved', 'OJT Approved by Coordinator! 🎉', 'Prof. Mariene Labrador has granted final approval for your OJT at Na Ah Company. The company will now configure your start date and schedule.', '{"posting_id":13,"interest_id":24}', NULL, '2026-10-14 02:33:40', '2026-10-14 02:33:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (275, 11, 'ojt_approved', 'OJT Coordinator Approved — Set Start Date', 'The OJT Coordinator has approved Bea Bianca Castillo''s deployment for "Enterprise Cloud & Full-Stack Systems Intern". Please set the OJT start date and work shift instructions.', '{"posting_id":13,"interest_id":24}', NULL, '2026-10-14 02:33:40', '2026-10-14 02:33:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (276, 58, 'ojt_confirmed', 'OJT Start Date & Schedule Confirmed — Oct 14, 2026 📅', 'Na Ah Company confirmed your OJT start date: Oct 14, 2026. Schedule: Mon–Fri, 08:00 – 17:00 (Lunch: 12:00 – 13:00). Instructions: Report to Na Ah Company Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp on October 14, 2026. Bring your CHMSU student ID and personal development laptop. Report to Ms. Karen dela Rosa at IT Reception.', '{"posting_id":13,"interest_id":22}', NULL, '2026-10-14 02:33:40', '2026-10-14 02:33:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (277, 5, 'ojt_confirmed', 'Student OJT Start Date & Schedule Set', 'Joshua Vance Rivera''s OJT at Na Ah Company has been confirmed to start on Oct 14, 2026 (Mon–Fri, 08:00 – 17:00).', '{"posting_id":13,"interest_id":22}', NULL, '2026-10-14 02:33:40', '2026-10-14 02:33:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (278, 18, 'ojt_confirmed', 'OJT Start Date & Schedule Confirmed — Oct 14, 2026 📅', 'Na Ah Company confirmed your OJT start date: Oct 14, 2026. Schedule: Mon–Fri, 08:00 – 17:00 (Lunch: 12:00 – 13:00). Instructions: Report to Na Ah Company Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp on October 14, 2026. Bring your CHMSU student ID and personal development laptop. Report to Ms. Karen dela Rosa at IT Reception.', '{"posting_id":13,"interest_id":23}', NULL, '2026-10-14 02:33:41', '2026-10-14 02:33:41');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (279, 5, 'ojt_confirmed', 'Student OJT Start Date & Schedule Set', 'Althea Joy Villanueva''s OJT at Na Ah Company has been confirmed to start on Oct 14, 2026 (Mon–Fri, 08:00 – 17:00).', '{"posting_id":13,"interest_id":23}', NULL, '2026-10-14 02:33:41', '2026-10-14 02:33:41');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (280, 22, 'ojt_confirmed', 'OJT Start Date & Schedule Confirmed — Oct 14, 2026 📅', 'Na Ah Company confirmed your OJT start date: Oct 14, 2026. Schedule: Mon–Fri, 08:00 – 17:00 (Lunch: 12:00 – 13:00). Instructions: Report to Na Ah Company Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp on October 14, 2026. Bring your CHMSU student ID and personal development laptop. Report to Ms. Karen dela Rosa at IT Reception.', '{"posting_id":13,"interest_id":24}', NULL, '2026-10-14 02:33:41', '2026-10-14 02:33:41');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (281, 5, 'ojt_confirmed', 'Student OJT Start Date & Schedule Set', 'Bea Bianca Castillo''s OJT at Na Ah Company has been confirmed to start on Oct 14, 2026 (Mon–Fri, 08:00 – 17:00).', '{"posting_id":13,"interest_id":24}', NULL, '2026-10-14 02:33:41', '2026-10-14 02:33:41');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (288, 5, 'endorsement_requested', 'Endorsement Letter Requested', 'Na Ah Company is requesting an endorsement letter for student Althea Joy Villanueva applying to "Enterprise Cloud & Full-Stack Systems Intern". Please review and upload the endorsement letter.', '{"interest_id":26,"posting_id":14}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (289, 22, 'endorsement_requested', 'Endorsement Requested by Company', 'Na Ah Company reviewed your application for "Enterprise Cloud & Full-Stack Systems Intern" and requested an endorsement letter from your OJT Coordinator.', '{"posting_id":14,"interest_id":27}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (290, 5, 'endorsement_requested', 'Endorsement Letter Requested', 'Na Ah Company is requesting an endorsement letter for student Bea Bianca Castillo applying to "Enterprise Cloud & Full-Stack Systems Intern". Please review and upload the endorsement letter.', '{"interest_id":27,"posting_id":14}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (291, 11, 'endorsement_sent', 'Endorsement Letter Received', 'The endorsement letter for Joshua Vance Rivera applying to "Enterprise Cloud & Full-Stack Systems Intern" has been issued by Coordinator Mariene Labrador. You may now proceed with interview scheduling.', '{"interest_id":25,"posting_id":14,"student_name":"Joshua Vance Rivera"}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (292, 58, 'endorsement_sent', 'Endorsement Letter Issued', 'Prof. Mariene Labrador has sent your official endorsement letter to Na Ah Company for "Enterprise Cloud & Full-Stack Systems Intern".', '{"posting_id":14,"interest_id":25}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (293, 11, 'endorsement_sent', 'Endorsement Letter Received', 'The endorsement letter for Althea Joy Villanueva applying to "Enterprise Cloud & Full-Stack Systems Intern" has been issued by Coordinator Mariene Labrador. You may now proceed with interview scheduling.', '{"interest_id":26,"posting_id":14,"student_name":"Althea Joy Villanueva"}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (294, 18, 'endorsement_sent', 'Endorsement Letter Issued', 'Prof. Mariene Labrador has sent your official endorsement letter to Na Ah Company for "Enterprise Cloud & Full-Stack Systems Intern".', '{"posting_id":14,"interest_id":26}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (295, 11, 'endorsement_sent', 'Endorsement Letter Received', 'The endorsement letter for Bea Bianca Castillo applying to "Enterprise Cloud & Full-Stack Systems Intern" has been issued by Coordinator Mariene Labrador. You may now proceed with interview scheduling.', '{"interest_id":27,"posting_id":14,"student_name":"Bea Bianca Castillo"}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (296, 22, 'endorsement_sent', 'Endorsement Letter Issued', 'Prof. Mariene Labrador has sent your official endorsement letter to Na Ah Company for "Enterprise Cloud & Full-Stack Systems Intern".', '{"posting_id":14,"interest_id":27}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (297, 58, 'interview_scheduled', 'Face-to-Face Technical Interview Scheduled 📅', 'Na Ah Company scheduled your interview for Oct 13, 2026 at 09:00 AM. Location: Na Ah Company Tech Hub, 45 Rizal St., Bacolod City (Conference Room B). Note: Please bring your student ID and a printed copy of your endorsement letter. Prepare for a technical discussion on full-stack architecture.', '{"posting_id":14,"interest_id":25}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (298, 18, 'interview_scheduled', 'Face-to-Face Technical Interview Scheduled 📅', 'Na Ah Company scheduled your interview for Oct 13, 2026 at 10:30 AM. Location: Na Ah Company Tech Hub, 45 Rizal St., Bacolod City (Conference Room B). Note: Please bring your student ID and a printed copy of your endorsement letter. Prepare for a technical discussion on full-stack architecture.', '{"posting_id":14,"interest_id":26}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (299, 22, 'interview_scheduled', 'Face-to-Face Technical Interview Scheduled 📅', 'Na Ah Company scheduled your interview for Oct 13, 2026 at 01:30 PM. Location: Na Ah Company Tech Hub, 45 Rizal St., Bacolod City (Conference Room B). Note: Please bring your student ID and a printed copy of your endorsement letter. Prepare for a technical discussion on full-stack architecture.', '{"posting_id":14,"interest_id":27}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (300, 58, 'company_accepted', 'Interview Result — Accepted! 🎉', 'Na Ah Company has officially accepted you after the interview for "Enterprise Cloud & Full-Stack Systems Intern". Message: Candidate demonstrated exceptional performance during the technical panel and exhibited strong team collaboration aptitude. Formally accepted for 600-hour practicum placement.. The OJT Coordinator will provide final approval shortly.', '{"posting_id":14,"interest_id":25}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (301, 5, 'company_accepted', 'Student Accepted — Final OJT Approval Needed', 'Na Ah Company has accepted Joshua Vance Rivera after their interview for "Enterprise Cloud & Full-Stack Systems Intern". Please review and grant final OJT deployment approval.', '{"interest_id":25,"posting_id":14}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (302, 18, 'company_accepted', 'Interview Result — Accepted! 🎉', 'Na Ah Company has officially accepted you after the interview for "Enterprise Cloud & Full-Stack Systems Intern". Message: Candidate demonstrated exceptional performance during the technical panel and exhibited strong team collaboration aptitude. Formally accepted for 600-hour practicum placement.. The OJT Coordinator will provide final approval shortly.', '{"posting_id":14,"interest_id":26}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (303, 5, 'company_accepted', 'Student Accepted — Final OJT Approval Needed', 'Na Ah Company has accepted Althea Joy Villanueva after their interview for "Enterprise Cloud & Full-Stack Systems Intern". Please review and grant final OJT deployment approval.', '{"interest_id":26,"posting_id":14}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (304, 22, 'company_accepted', 'Interview Result — Accepted! 🎉', 'Na Ah Company has officially accepted you after the interview for "Enterprise Cloud & Full-Stack Systems Intern". Message: Candidate demonstrated exceptional performance during the technical panel and exhibited strong team collaboration aptitude. Formally accepted for 600-hour practicum placement.. The OJT Coordinator will provide final approval shortly.', '{"posting_id":14,"interest_id":27}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (305, 5, 'company_accepted', 'Student Accepted — Final OJT Approval Needed', 'Na Ah Company has accepted Bea Bianca Castillo after their interview for "Enterprise Cloud & Full-Stack Systems Intern". Please review and grant final OJT deployment approval.', '{"interest_id":27,"posting_id":14}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (306, 58, 'ojt_approved', 'OJT Approved by Coordinator! 🎉', 'Prof. Mariene Labrador has granted final approval for your OJT at Na Ah Company. The company will now configure your start date and schedule.', '{"posting_id":14,"interest_id":25}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (307, 11, 'ojt_approved', 'OJT Coordinator Approved — Set Start Date', 'The OJT Coordinator has approved Joshua Vance Rivera''s deployment for "Enterprise Cloud & Full-Stack Systems Intern". Please set the OJT start date and work shift instructions.', '{"posting_id":14,"interest_id":25}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (308, 18, 'ojt_approved', 'OJT Approved by Coordinator! 🎉', 'Prof. Mariene Labrador has granted final approval for your OJT at Na Ah Company. The company will now configure your start date and schedule.', '{"posting_id":14,"interest_id":26}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (309, 11, 'ojt_approved', 'OJT Coordinator Approved — Set Start Date', 'The OJT Coordinator has approved Althea Joy Villanueva''s deployment for "Enterprise Cloud & Full-Stack Systems Intern". Please set the OJT start date and work shift instructions.', '{"posting_id":14,"interest_id":26}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (310, 22, 'ojt_approved', 'OJT Approved by Coordinator! 🎉', 'Prof. Mariene Labrador has granted final approval for your OJT at Na Ah Company. The company will now configure your start date and schedule.', '{"posting_id":14,"interest_id":27}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (311, 11, 'ojt_approved', 'OJT Coordinator Approved — Set Start Date', 'The OJT Coordinator has approved Bea Bianca Castillo''s deployment for "Enterprise Cloud & Full-Stack Systems Intern". Please set the OJT start date and work shift instructions.', '{"posting_id":14,"interest_id":27}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (312, 58, 'ojt_confirmed', 'OJT Start Date & Schedule Confirmed — Oct 14, 2026 📅', 'Na Ah Company confirmed your OJT start date: Oct 14, 2026. Schedule: Mon–Fri, 08:00 – 17:00 (Lunch: 12:00 – 13:00). Instructions: Report to Na Ah Company Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp on October 14, 2026. Bring your CHMSU student ID and personal development laptop. Report to Ms. Karen dela Rosa at IT Reception.', '{"posting_id":14,"interest_id":25}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (313, 5, 'ojt_confirmed', 'Student OJT Start Date & Schedule Set', 'Joshua Vance Rivera''s OJT at Na Ah Company has been confirmed to start on Oct 14, 2026 (Mon–Fri, 08:00 – 17:00).', '{"posting_id":14,"interest_id":25}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (314, 18, 'ojt_confirmed', 'OJT Start Date & Schedule Confirmed — Oct 14, 2026 📅', 'Na Ah Company confirmed your OJT start date: Oct 14, 2026. Schedule: Mon–Fri, 08:00 – 17:00 (Lunch: 12:00 – 13:00). Instructions: Report to Na Ah Company Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp on October 14, 2026. Bring your CHMSU student ID and personal development laptop. Report to Ms. Karen dela Rosa at IT Reception.', '{"posting_id":14,"interest_id":26}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (315, 5, 'ojt_confirmed', 'Student OJT Start Date & Schedule Set', 'Althea Joy Villanueva''s OJT at Na Ah Company has been confirmed to start on Oct 14, 2026 (Mon–Fri, 08:00 – 17:00).', '{"posting_id":14,"interest_id":26}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (316, 22, 'ojt_confirmed', 'OJT Start Date & Schedule Confirmed — Oct 14, 2026 📅', 'Na Ah Company confirmed your OJT start date: Oct 14, 2026. Schedule: Mon–Fri, 08:00 – 17:00 (Lunch: 12:00 – 13:00). Instructions: Report to Na Ah Company Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp on October 14, 2026. Bring your CHMSU student ID and personal development laptop. Report to Ms. Karen dela Rosa at IT Reception.', '{"posting_id":14,"interest_id":27}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (317, 5, 'ojt_confirmed', 'Student OJT Start Date & Schedule Set', 'Bea Bianca Castillo''s OJT at Na Ah Company has been confirmed to start on Oct 14, 2026 (Mon–Fri, 08:00 – 17:00).', '{"posting_id":14,"interest_id":27}', NULL, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (329, 5, 'pull_out_requested', '⚠️ OJT Pull-Out Request Filed', 'Joshua Vance Rivera filed an OJT pull-out request from Na Ah Company (Breach Of Moa). Request letter submitted for recommendation.', '{"pull_out_id":4,"student_id":58,"student_name":"Joshua Vance Rivera","company":"Na Ah Company"}', NULL, '2026-10-14 11:14:39', '2026-10-14 11:14:39');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (331, 11, 'trainee_pull_out_notice', '⚠️ Trainee Pull-Out Request Notice', 'Trainee Joshua Vance Rivera has requested an official pull-out from their OJT training. Academic coordinators are reviewing the case.', '{"pull_out_id":4,"student_id":58,"student_name":"Joshua Vance Rivera"}', NULL, '2026-10-14 11:14:39', '2026-10-14 11:14:39');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (330, 57, 'pull_out_requested', '⚠️ OJT Pull-Out Request Filed', 'Joshua Vance Rivera filed an OJT pull-out request from Na Ah Company (Breach Of Moa). Request letter submitted for recommendation.', '{"pull_out_id":4,"student_id":58,"student_name":"Joshua Vance Rivera","company":"Na Ah Company"}', '2026-10-14 11:29:32', '2026-10-14 11:14:39', '2026-10-14 11:29:32');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (342, 11, 'trainee_pulled_out_company', 'ℹ️ Trainee OJT Pull-Out Finalized', 'The College Dean officially approved the pull-out for Joshua Vance Rivera. 1 training slot has been restored to your posting.', '{"pull_out_id":5,"student_id":58}', NULL, '2026-10-14 11:34:59', '2026-10-14 11:34:59');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (343, 57, 'pull_out_approved_supervisor', '✅ Dean Approved Trainee Pull-Out', 'Dean approved official pull-out for Joshua Vance Rivera (Na Ah Company). Student is eligible for new endorsement.', '{"pull_out_id":5,"student_id":58}', NULL, '2026-10-14 11:34:59', '2026-10-14 11:34:59');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (360, 5, 'fit_to_work_uploaded', '🩺 Medical Fit-to-Work Clearance Uploaded', 'Althea Joy Villanueva uploaded a Fit-to-Work clearance certificate to resume OJT training.', '{"emergency_id":2,"student_id":18,"student_name":"Althea Joy Villanueva"}', NULL, '2026-10-15 20:40:43', '2026-10-15 20:40:43');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (361, 57, 'fit_to_work_uploaded', '🩺 Medical Fit-to-Work Clearance Uploaded', 'Althea Joy Villanueva uploaded a Fit-to-Work clearance certificate to resume OJT training.', '{"emergency_id":2,"student_id":18,"student_name":"Althea Joy Villanueva"}', '2026-10-15 20:40:52', '2026-10-15 20:40:43', '2026-10-15 20:40:52');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (370, 5, 'endorsement_requested', 'Endorsement Letter Requested', 'Na Ah Company is requesting an endorsement letter for student Cedric Miguel Ramos applying to "Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)". Please review and upload the endorsement letter.', '{"interest_id":28,"posting_id":15}', NULL, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (371, 20, 'endorsement_requested', 'Endorsement Requested by Company', 'Na Ah Company reviewed your application for "Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)" and requested an endorsement letter from your OJT Coordinator.', '{"posting_id":15,"interest_id":29}', NULL, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (372, 5, 'endorsement_requested', 'Endorsement Letter Requested', 'Na Ah Company is requesting an endorsement letter for student Princess Nicole Reyes applying to "Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)". Please review and upload the endorsement letter.', '{"interest_id":29,"posting_id":15}', NULL, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (373, 21, 'endorsement_requested', 'Endorsement Requested by Company', 'Na Ah Company reviewed your application for "Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)" and requested an endorsement letter from your OJT Coordinator.', '{"posting_id":15,"interest_id":30}', NULL, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (374, 5, 'endorsement_requested', 'Endorsement Letter Requested', 'Na Ah Company is requesting an endorsement letter for student John Paul Bautista applying to "Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)". Please review and upload the endorsement letter.', '{"interest_id":30,"posting_id":15}', NULL, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (383, 21, 'interview_scheduled', 'Face-to-Face Technical Interview Scheduled 📅', 'Na Ah Company scheduled your interview for Oct 16, 2026 at 01:30 PM. Location: Na Ah Company Tech Hub, 45 Rizal St., Bacolod City (Conference Room B). Note: Please bring your student ID and a copy of your endorsement letter. Prepare for a technical discussion on full-stack web and cloud systems.', '{"posting_id":15,"interest_id":30}', NULL, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (384, 59, 'company_accepted', 'Interview Result — Accepted! 🎉', 'Na Ah Company has officially accepted you after the interview for "Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)". Message: Candidate demonstrated exceptional performance during the technical interview panel and exhibited strong team collaboration aptitude. Formally accepted for 600-hour practicum placement.. The OJT Coordinator will provide final approval shortly.', '{"posting_id":15,"interest_id":28}', NULL, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (385, 5, 'company_accepted', 'Student Accepted — Final OJT Approval Needed', 'Na Ah Company has accepted Cedric Miguel Ramos after their interview for "Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)". Please review and grant final OJT deployment approval.', '{"interest_id":28,"posting_id":15}', NULL, '2026-10-17 12:09:29', '2026-10-17 12:09:29');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (386, 20, 'company_accepted', 'Interview Result — Accepted! 🎉', 'Na Ah Company has officially accepted you after the interview for "Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)". Message: Candidate demonstrated exceptional performance during the technical interview panel and exhibited strong team collaboration aptitude. Formally accepted for 600-hour practicum placement.. The OJT Coordinator will provide final approval shortly.', '{"posting_id":15,"interest_id":29}', NULL, '2026-10-17 12:09:29', '2026-10-17 12:09:29');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (387, 5, 'company_accepted', 'Student Accepted — Final OJT Approval Needed', 'Na Ah Company has accepted Princess Nicole Reyes after their interview for "Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)". Please review and grant final OJT deployment approval.', '{"interest_id":29,"posting_id":15}', NULL, '2026-10-17 12:09:29', '2026-10-17 12:09:29');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (388, 21, 'company_accepted', 'Interview Result — Accepted! 🎉', 'Na Ah Company has officially accepted you after the interview for "Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)". Message: Candidate demonstrated exceptional performance during the technical interview panel and exhibited strong team collaboration aptitude. Formally accepted for 600-hour practicum placement.. The OJT Coordinator will provide final approval shortly.', '{"posting_id":15,"interest_id":30}', NULL, '2026-10-17 12:09:29', '2026-10-17 12:09:29');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (389, 5, 'company_accepted', 'Student Accepted — Final OJT Approval Needed', 'Na Ah Company has accepted John Paul Bautista after their interview for "Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)". Please review and grant final OJT deployment approval.', '{"interest_id":30,"posting_id":15}', NULL, '2026-10-17 12:09:29', '2026-10-17 12:09:29');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (390, 59, 'ojt_approved', 'OJT Approved by Coordinator! 🎉', 'Prof. Mariene Labrador has granted final approval for your OJT at Na Ah Company. The company will now configure your start date and schedule.', '{"posting_id":15,"interest_id":28}', NULL, '2026-10-17 12:09:29', '2026-10-17 12:09:29');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (391, 11, 'ojt_approved', 'OJT Coordinator Approved — Set Start Date', 'The OJT Coordinator has approved Cedric Miguel Ramos''s deployment for "Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)". Please set the OJT start date and work shift instructions.', '{"posting_id":15,"interest_id":28}', NULL, '2026-10-17 12:09:29', '2026-10-17 12:09:29');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (392, 20, 'ojt_approved', 'OJT Approved by Coordinator! 🎉', 'Prof. Mariene Labrador has granted final approval for your OJT at Na Ah Company. The company will now configure your start date and schedule.', '{"posting_id":15,"interest_id":29}', NULL, '2026-10-17 12:09:29', '2026-10-17 12:09:29');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (393, 11, 'ojt_approved', 'OJT Coordinator Approved — Set Start Date', 'The OJT Coordinator has approved Princess Nicole Reyes''s deployment for "Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)". Please set the OJT start date and work shift instructions.', '{"posting_id":15,"interest_id":29}', NULL, '2026-10-17 12:09:29', '2026-10-17 12:09:29');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (394, 21, 'ojt_approved', 'OJT Approved by Coordinator! 🎉', 'Prof. Mariene Labrador has granted final approval for your OJT at Na Ah Company. The company will now configure your start date and schedule.', '{"posting_id":15,"interest_id":30}', NULL, '2026-10-17 12:09:29', '2026-10-17 12:09:29');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (395, 11, 'ojt_approved', 'OJT Coordinator Approved — Set Start Date', 'The OJT Coordinator has approved John Paul Bautista''s deployment for "Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)". Please set the OJT start date and work shift instructions.', '{"posting_id":15,"interest_id":30}', NULL, '2026-10-17 12:09:29', '2026-10-17 12:09:29');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (396, 59, 'ojt_confirmed', 'OJT Start Date & Weekend Schedule Confirmed — Oct 17, 2026 (Saturday) 📅', 'Na Ah Company confirmed your OJT start date: Oct 17, 2026 (Saturday). Schedule: Sat–Fri (Weekends Active), 08:00 – 17:00 (Lunch: 13:00 – 14:00). Instructions: Welcome to Na Ah Company! Report to Na Ah Company Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp on Saturday, October 17, 2026. Weekend operations enabled. Bring your CHMSU student ID and personal developer laptop.', '{"posting_id":15,"interest_id":28}', NULL, '2026-10-17 12:09:29', '2026-10-17 12:09:29');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (397, 5, 'ojt_confirmed', 'Student OJT Start Date & Weekend Schedule Set', 'Cedric Miguel Ramos''s OJT at Na Ah Company has been confirmed to start on Oct 17, 2026 (Saturday) with weekend operations enabled.', '{"posting_id":15,"interest_id":28}', NULL, '2026-10-17 12:09:29', '2026-10-17 12:09:29');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (398, 20, 'ojt_confirmed', 'OJT Start Date & Weekend Schedule Confirmed — Oct 17, 2026 (Saturday) 📅', 'Na Ah Company confirmed your OJT start date: Oct 17, 2026 (Saturday). Schedule: Sat–Fri (Weekends Active), 08:00 – 17:00 (Lunch: 13:00 – 14:00). Instructions: Welcome to Na Ah Company! Report to Na Ah Company Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp on Saturday, October 17, 2026. Weekend operations enabled. Bring your CHMSU student ID and personal developer laptop.', '{"posting_id":15,"interest_id":29}', NULL, '2026-10-17 12:09:29', '2026-10-17 12:09:29');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (399, 5, 'ojt_confirmed', 'Student OJT Start Date & Weekend Schedule Set', 'Princess Nicole Reyes''s OJT at Na Ah Company has been confirmed to start on Oct 17, 2026 (Saturday) with weekend operations enabled.', '{"posting_id":15,"interest_id":29}', NULL, '2026-10-17 12:09:29', '2026-10-17 12:09:29');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (400, 21, 'ojt_confirmed', 'OJT Start Date & Weekend Schedule Confirmed — Oct 17, 2026 (Saturday) 📅', 'Na Ah Company confirmed your OJT start date: Oct 17, 2026 (Saturday). Schedule: Sat–Fri (Weekends Active), 08:00 – 17:00 (Lunch: 13:00 – 14:00). Instructions: Welcome to Na Ah Company! Report to Na Ah Company Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp on Saturday, October 17, 2026. Weekend operations enabled. Bring your CHMSU student ID and personal developer laptop.', '{"posting_id":15,"interest_id":30}', NULL, '2026-10-17 12:09:29', '2026-10-17 12:09:29');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (401, 5, 'ojt_confirmed', 'Student OJT Start Date & Weekend Schedule Set', 'John Paul Bautista''s OJT at Na Ah Company has been confirmed to start on Oct 17, 2026 (Saturday) with weekend operations enabled.', '{"posting_id":15,"interest_id":30}', NULL, '2026-10-17 12:09:29', '2026-10-17 12:09:29');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (402, 5, 'student_time_in', 'Student Logged In', 'Cedric Miguel Ramos logged in (Time In (Morning)) at 12:11 PM on 2026-10-17 (Too Far).', '{"student_id":59,"log_id":453,"date":"2026-10-17","time_in":"12:11 PM","session":"Time In (Morning)","location_validity":"Too Far"}', NULL, '2026-10-17 12:11:09', '2026-10-17 12:11:09');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (404, 11, 'student_time_in', 'Trainee Time In (Morning): Cedric Miguel Ramos', 'Cedric Miguel Ramos (Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)) logged Time In (Morning) at 12:11 PM on 2026-10-17 [Too Far · 7682m].', '{"student_id":59,"student_name":"Cedric Miguel Ramos","posting_id":15,"posting_title":"Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)","log_id":453,"date":"2026-10-17","time_in":"12:11 PM","session":"Time In (Morning)","location_validity":"Too Far","distance_meters":7682,"action_url":"#\/ojt-trainees"}', NULL, '2026-10-17 12:11:09', '2026-10-17 12:11:09');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (403, 57, 'student_time_in', 'Student Logged In', 'Cedric Miguel Ramos logged in (Time In (Morning)) at 12:11 PM on 2026-10-17 (Too Far).', '{"student_id":59,"log_id":453,"date":"2026-10-17","time_in":"12:11 PM","session":"Time In (Morning)","location_validity":"Too Far"}', '2026-10-17 12:11:46', '2026-10-17 12:11:09', '2026-10-17 12:11:46');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (405, 11, 'student_applied', 'New OJT Application', 'Christian Dave Ramos applied to your OJT posting "Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)".', '{"interest_id":null,"posting_id":15,"student_name":"Christian Dave Ramos"}', NULL, '2026-10-17 13:47:19', '2026-10-17 13:47:19');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (406, 15, 'company_accepted', 'Application Reviewed', 'Na Ah Company has reviewed your application for "Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)". Message: We have reviewed your profile and portfolio and would like to proceed with your application.', '{"posting_id":15,"interest_id":31}', NULL, '2026-10-17 13:49:04', '2026-10-17 13:49:04');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (407, 5, 'endorsement_requested', 'Endorsement Letter Requested', 'Na Ah Company is requesting an endorsement letter for student Christian Dave Ramos applying to "Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)". Please upload the endorsement letter.', '{"interest_id":31,"posting_id":15}', NULL, '2026-10-17 13:49:33', '2026-10-17 13:49:33');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (409, 15, 'endorsement_requested', 'Endorsement Requested', 'The company Na Ah Company has requested an endorsement letter from the OJT Coordinator for your application to "Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)". Please wait for the coordinator to upload it.', '{"posting_id":15,"interest_id":31}', NULL, '2026-10-17 13:49:33', '2026-10-17 13:49:33');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (408, 57, 'endorsement_requested', 'Endorsement Letter Requested', 'Na Ah Company is requesting an endorsement letter for student Christian Dave Ramos applying to "Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)". Please upload the endorsement letter.', '{"interest_id":31,"posting_id":15}', '2026-10-17 13:49:58', '2026-10-17 13:49:33', '2026-10-17 13:49:58');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (410, 11, 'endorsement_sent', 'Endorsement Letter Received', 'The endorsement letter for Christian Dave Ramos applying to "Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)" has been sent by the supervisor. You can now start their OJT.', '{"interest_id":31,"posting_id":15,"student_name":"Christian Dave Ramos"}', NULL, '2026-10-17 13:50:42', '2026-10-17 13:50:42');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (411, 15, 'endorsement_sent', 'Endorsement Letter Sent', 'Your supervisor has sent the endorsement letter to Na Ah Company for "Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)". Waiting for OJT confirmation.', '{"posting_id":15,"interest_id":31}', '2026-10-17 13:51:11', '2026-10-17 13:50:42', '2026-10-17 13:51:11');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (412, 15, 'interview_scheduled', 'Interview Scheduled', 'Na Ah Company has scheduled a Face-to-Face interview for you on Oct 22, 2026 at 01:52 PM. Location: BACOLOD CITY. Note: interview', '{"posting_id":15,"interest_id":31}', NULL, '2026-10-17 13:52:36', '2026-10-17 13:52:36');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (413, 5, 'student_time_in', 'Student Logged In', 'Cedric Miguel Ramos logged in (Time In (Afternoon)) at 2:04 PM on 2026-10-17 (Too Far).', '{"student_id":59,"log_id":453,"date":"2026-10-17","time_in":"2:04 PM","session":"Time In (Afternoon)","location_validity":"Too Far"}', NULL, '2026-10-17 14:04:53', '2026-10-17 14:04:53');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (414, 57, 'student_time_in', 'Student Logged In', 'Cedric Miguel Ramos logged in (Time In (Afternoon)) at 2:04 PM on 2026-10-17 (Too Far).', '{"student_id":59,"log_id":453,"date":"2026-10-17","time_in":"2:04 PM","session":"Time In (Afternoon)","location_validity":"Too Far"}', NULL, '2026-10-17 14:04:53', '2026-10-17 14:04:53');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (415, 60, 'student_time_in', 'Student Logged In', 'Cedric Miguel Ramos logged in (Time In (Afternoon)) at 2:04 PM on 2026-10-17 (Too Far).', '{"student_id":59,"log_id":453,"date":"2026-10-17","time_in":"2:04 PM","session":"Time In (Afternoon)","location_validity":"Too Far"}', NULL, '2026-10-17 14:04:53', '2026-10-17 14:04:53');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (416, 11, 'student_time_in', 'Trainee Time In (Afternoon): Cedric Miguel Ramos', 'Cedric Miguel Ramos (Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)) logged Time In (Afternoon) at 2:04 PM on 2026-10-17 [Too Far · 3969m].', '{"student_id":59,"student_name":"Cedric Miguel Ramos","posting_id":15,"posting_title":"Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)","log_id":453,"date":"2026-10-17","time_in":"2:04 PM","session":"Time In (Afternoon)","location_validity":"Too Far","distance_meters":3969,"action_url":"#\/ojt-trainees"}', NULL, '2026-10-17 14:04:53', '2026-10-17 14:04:53');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (417, 11, 'student_applied', 'New Job Application', 'Alyssa Nicole Castro has applied for your "Full Stack Web Developer" position.', '{"application_id":3,"job_title":"Full Stack Web Developer","applicant_name":"Alyssa Nicole Castro"}', NULL, '2026-10-17 16:06:55', '2026-10-17 16:06:55');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (418, 11, 'student_applied', 'New OJT Application', 'Christian Dave Ramos applied to your OJT posting "Enterprise Cloud & Full-Stack Systems Intern".', '{"interest_id":null,"posting_id":14,"student_name":"Christian Dave Ramos"}', NULL, '2026-10-17 16:11:19', '2026-10-17 16:11:19');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (419, 15, 'company_accepted', 'Application Reviewed', 'Na Ah Company has reviewed your application for "Enterprise Cloud & Full-Stack Systems Intern". Message: We have reviewed your profile and portfolio and would like to proceed with your application.', '{"posting_id":14,"interest_id":32}', NULL, '2026-10-17 16:11:40', '2026-10-17 16:11:40');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (420, 5, 'endorsement_requested', 'Endorsement Letter Requested', 'Na Ah Company is requesting an endorsement letter for student Christian Dave Ramos applying to "Enterprise Cloud & Full-Stack Systems Intern". Please upload the endorsement letter.', '{"interest_id":32,"posting_id":14}', NULL, '2026-10-17 16:11:57', '2026-10-17 16:11:57');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (421, 57, 'endorsement_requested', 'Endorsement Letter Requested', 'Na Ah Company is requesting an endorsement letter for student Christian Dave Ramos applying to "Enterprise Cloud & Full-Stack Systems Intern". Please upload the endorsement letter.', '{"interest_id":32,"posting_id":14}', NULL, '2026-10-17 16:11:57', '2026-10-17 16:11:57');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (422, 60, 'endorsement_requested', 'Endorsement Letter Requested', 'Na Ah Company is requesting an endorsement letter for student Christian Dave Ramos applying to "Enterprise Cloud & Full-Stack Systems Intern". Please upload the endorsement letter.', '{"interest_id":32,"posting_id":14}', NULL, '2026-10-17 16:11:57', '2026-10-17 16:11:57');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (423, 15, 'endorsement_requested', 'Endorsement Requested', 'The company Na Ah Company has requested an endorsement letter from the OJT Coordinator for your application to "Enterprise Cloud & Full-Stack Systems Intern". Please wait for the coordinator to upload it.', '{"posting_id":14,"interest_id":32}', NULL, '2026-10-17 16:11:57', '2026-10-17 16:11:57');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (424, 11, 'endorsement_sent', 'Endorsement Letter Received', 'The endorsement letter for Christian Dave Ramos applying to "Enterprise Cloud & Full-Stack Systems Intern" has been sent by the supervisor. You can now start their OJT.', '{"interest_id":32,"posting_id":14,"student_name":"Christian Dave Ramos"}', NULL, '2026-10-17 16:12:25', '2026-10-17 16:12:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (425, 15, 'endorsement_sent', 'Endorsement Letter Sent', 'Your supervisor has sent the endorsement letter to Na Ah Company for "Enterprise Cloud & Full-Stack Systems Intern". Waiting for OJT confirmation.', '{"posting_id":14,"interest_id":32}', NULL, '2026-10-17 16:12:25', '2026-10-17 16:12:25');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (426, 5, 'student_time_in', 'Student Logged In', 'John Paul Bautista logged in (Time In (Afternoon)) at 4:15 PM on 2026-10-17 (Too Far).', '{"student_id":21,"log_id":454,"date":"2026-10-17","time_in":"4:15 PM","session":"Time In (Afternoon)","location_validity":"Too Far"}', NULL, '2026-10-17 16:16:01', '2026-10-17 16:16:01');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (427, 57, 'student_time_in', 'Student Logged In', 'John Paul Bautista logged in (Time In (Afternoon)) at 4:15 PM on 2026-10-17 (Too Far).', '{"student_id":21,"log_id":454,"date":"2026-10-17","time_in":"4:15 PM","session":"Time In (Afternoon)","location_validity":"Too Far"}', NULL, '2026-10-17 16:16:01', '2026-10-17 16:16:01');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (428, 60, 'student_time_in', 'Student Logged In', 'John Paul Bautista logged in (Time In (Afternoon)) at 4:15 PM on 2026-10-17 (Too Far).', '{"student_id":21,"log_id":454,"date":"2026-10-17","time_in":"4:15 PM","session":"Time In (Afternoon)","location_validity":"Too Far"}', NULL, '2026-10-17 16:16:01', '2026-10-17 16:16:01');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (429, 11, 'student_time_in', 'Trainee Time In (Afternoon): John Paul Bautista', 'John Paul Bautista (Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)) logged Time In (Afternoon) at 4:15 PM on 2026-10-17 [Too Far · 2760m].', '{"student_id":21,"student_name":"John Paul Bautista","posting_id":15,"posting_title":"Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)","log_id":454,"date":"2026-10-17","time_in":"4:15 PM","session":"Time In (Afternoon)","location_validity":"Too Far","distance_meters":2760,"action_url":"#\/ojt-trainees"}', NULL, '2026-10-17 16:16:01', '2026-10-17 16:16:01');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (431, 5, 'student_time_in', 'Student Logged In', 'John Paul Bautista logged in (Time In (Morning)) at 8:32 AM on 2026-10-21 (Too Far).', '{"student_id":21,"log_id":455,"date":"2026-10-21","time_in":"8:32 AM","session":"Time In (Morning)","location_validity":"Too Far"}', NULL, '2026-10-21 08:32:27', '2026-10-21 08:32:27');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (432, 57, 'student_time_in', 'Student Logged In', 'John Paul Bautista logged in (Time In (Morning)) at 8:32 AM on 2026-10-21 (Too Far).', '{"student_id":21,"log_id":455,"date":"2026-10-21","time_in":"8:32 AM","session":"Time In (Morning)","location_validity":"Too Far"}', NULL, '2026-10-21 08:32:27', '2026-10-21 08:32:27');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (433, 60, 'student_time_in', 'Student Logged In', 'John Paul Bautista logged in (Time In (Morning)) at 8:32 AM on 2026-10-21 (Too Far).', '{"student_id":21,"log_id":455,"date":"2026-10-21","time_in":"8:32 AM","session":"Time In (Morning)","location_validity":"Too Far"}', NULL, '2026-10-21 08:32:27', '2026-10-21 08:32:27');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (434, 11, 'student_time_in', 'Trainee Time In (Morning): John Paul Bautista', 'John Paul Bautista (Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)) logged Time In (Morning) at 8:32 AM on 2026-10-21 [Too Far · 7577m].', '{"student_id":21,"student_name":"John Paul Bautista","posting_id":15,"posting_title":"Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)","log_id":455,"date":"2026-10-21","time_in":"8:32 AM","session":"Time In (Morning)","location_validity":"Too Far","distance_meters":7577,"action_url":"#\/ojt-trainees"}', NULL, '2026-10-21 08:32:27', '2026-10-21 08:32:27');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (436, 6, 'student_applied', 'New OJT Application', 'Bea Bianca Castillo applied to your OJT posting "Full Stack Web Developer Intern".', '{"interest_id":null,"posting_id":6,"student_name":"Bea Bianca Castillo"}', NULL, '2026-10-21 11:22:35', '2026-10-21 11:22:35');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (437, 11, 'student_applied', 'New OJT Application', 'Bea Bianca Castillo applied to your OJT posting "Web Development Intern".', '{"interest_id":null,"posting_id":4,"student_name":"Bea Bianca Castillo"}', NULL, '2026-10-21 11:36:41', '2026-10-21 11:36:41');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (438, 22, 'company_accepted', 'Application Reviewed', 'Na Ah Company has reviewed your application for "Web Development Intern". Message: We have reviewed your profile and portfolio and would like to proceed with your application.', '{"posting_id":4,"interest_id":35}', NULL, '2026-10-21 11:37:57', '2026-10-21 11:37:57');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (439, 5, 'endorsement_requested', 'Endorsement Letter Requested', 'Na Ah Company is requesting an endorsement letter for student Bea Bianca Castillo applying to "Web Development Intern". Please upload the endorsement letter.', '{"interest_id":35,"posting_id":4}', NULL, '2026-10-21 11:38:59', '2026-10-21 11:38:59');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (440, 57, 'endorsement_requested', 'Endorsement Letter Requested', 'Na Ah Company is requesting an endorsement letter for student Bea Bianca Castillo applying to "Web Development Intern". Please upload the endorsement letter.', '{"interest_id":35,"posting_id":4}', NULL, '2026-10-21 11:38:59', '2026-10-21 11:38:59');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (441, 60, 'endorsement_requested', 'Endorsement Letter Requested', 'Na Ah Company is requesting an endorsement letter for student Bea Bianca Castillo applying to "Web Development Intern". Please upload the endorsement letter.', '{"interest_id":35,"posting_id":4}', NULL, '2026-10-21 11:38:59', '2026-10-21 11:38:59');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (442, 22, 'endorsement_requested', 'Endorsement Requested', 'The company Na Ah Company has requested an endorsement letter from the OJT Coordinator for your application to "Web Development Intern". Please wait for the coordinator to upload it.', '{"posting_id":4,"interest_id":35}', NULL, '2026-10-21 11:38:59', '2026-10-21 11:38:59');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (443, 11, 'endorsement_sent', 'Endorsement Letter Received', 'The endorsement letter for Bea Bianca Castillo applying to "Web Development Intern" has been sent by the supervisor. You can now start their OJT.', '{"interest_id":35,"posting_id":4,"student_name":"Bea Bianca Castillo"}', NULL, '2026-10-21 11:40:00', '2026-10-21 11:40:00');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (444, 22, 'endorsement_sent', 'Endorsement Letter Sent', 'Your supervisor has sent the endorsement letter to Na Ah Company for "Web Development Intern". Waiting for OJT confirmation.', '{"posting_id":4,"interest_id":35}', NULL, '2026-10-21 11:40:00', '2026-10-21 11:40:00');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (445, 22, 'interview_scheduled', 'Interview Scheduled', 'Na Ah Company has scheduled a Face-to-Face interview for you on Oct 31, 2026 at 01:00 AM. Location: BACOLOD CITY. Note: hfhgfghfhfhfg', '{"posting_id":4,"interest_id":35}', NULL, '2026-10-21 11:42:04', '2026-10-21 11:42:04');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (446, 5, 'student_time_in', 'Student Logged In', 'Cedric Miguel Ramos logged in (Time In (Morning)) at 11:44 AM on 2026-10-21 (Too Far).', '{"student_id":59,"log_id":457,"date":"2026-10-21","time_in":"11:44 AM","session":"Time In (Morning)","location_validity":"Too Far"}', NULL, '2026-10-21 11:45:12', '2026-10-21 11:45:12');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (447, 57, 'student_time_in', 'Student Logged In', 'Cedric Miguel Ramos logged in (Time In (Morning)) at 11:44 AM on 2026-10-21 (Too Far).', '{"student_id":59,"log_id":457,"date":"2026-10-21","time_in":"11:44 AM","session":"Time In (Morning)","location_validity":"Too Far"}', NULL, '2026-10-21 11:45:12', '2026-10-21 11:45:12');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (448, 60, 'student_time_in', 'Student Logged In', 'Cedric Miguel Ramos logged in (Time In (Morning)) at 11:44 AM on 2026-10-21 (Too Far).', '{"student_id":59,"log_id":457,"date":"2026-10-21","time_in":"11:44 AM","session":"Time In (Morning)","location_validity":"Too Far"}', NULL, '2026-10-21 11:45:12', '2026-10-21 11:45:12');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (449, 11, 'student_time_in', 'Trainee Time In (Morning): Cedric Miguel Ramos', 'Cedric Miguel Ramos (Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)) logged Time In (Morning) at 11:44 AM on 2026-10-21 [Too Far · 3916m].', '{"student_id":59,"student_name":"Cedric Miguel Ramos","posting_id":15,"posting_title":"Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)","log_id":457,"date":"2026-10-21","time_in":"11:44 AM","session":"Time In (Morning)","location_validity":"Too Far","distance_meters":3916,"action_url":"#\/ojt-trainees"}', NULL, '2026-10-21 11:45:12', '2026-10-21 11:45:12');
INSERT INTO public.app_notifications (id, user_id, type, title, message, data, read_at, created_at, updated_at) VALUES (450, 6, 'student_applied', 'New OJT Application', 'Kyla Marie Mendoza applied to your OJT posting "IT Support Intern".', '{"interest_id":null,"posting_id":1,"student_name":"Kyla Marie Mendoza"}', NULL, '2026-10-21 20:54:08', '2026-10-21 20:54:08');


--
-- Data for Name: cache; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: cache_locks; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.chat_messages (id, conversation_key, sender_id, receiver_id, message, read_at, created_at, updated_at) VALUES (1, 'ojt_interest_32', 11, 15, 'ily', '2026-10-17 16:18:48', '2026-10-17 16:18:27', '2026-10-17 16:18:48');


--
-- Data for Name: company_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.company_profiles (id, user_id, company_name, company_location, company_type, website, created_at, updated_at, company_size, contact_email, contact_phone, description, logo_url, profile_completed, contact_person, moa_file_path, moa_start_date, moa_end_date, moa_status, status, ownership_type, year_founded, full_address, contact_title, registration_source, moa_requested_at, moa_request_notes) VALUES (1, 6, 'PGLang', 'Bacolod City', 'Software Development', 'https://www.facebook.com/photo/?fbid=2624130328020289&set=a.139682073131806', '2026-10-05 16:12:55', '2026-10-05 16:15:09', '11-50', 'gimaranganvhan@gmail.com', '09123456789', 'awsss', NULL, true, 'Jermain Lamar Cole', 'moa_documents/69NSsOHKwIc6cEWTJf8RIr0WgPi4XMGXSOG7XHEp.pdf', '2026-10-05', '2029-10-04', 'Active', 'Active', 'Private Corporation', '2007', 'Bacolod City', 'HR Director', 'admin', NULL, NULL);
INSERT INTO public.company_profiles (id, user_id, company_name, company_location, company_type, website, created_at, updated_at, company_size, contact_email, contact_phone, description, logo_url, profile_completed, contact_person, moa_file_path, moa_start_date, moa_end_date, moa_status, status, ownership_type, year_founded, full_address, contact_title, registration_source, moa_requested_at, moa_request_notes) VALUES (3, 11, 'Na Ah Company', NULL, NULL, 'https://naahcompany.com', '2026-10-05 17:17:09', '2026-10-05 17:17:09', '51-200', NULL, '+63 34 123 4567', 'Na Ah Company is a growing IT solutions provider specializing in software development, web services, and digital transformation for SMEs in Western Visayas.', NULL, true, NULL, NULL, '2025-10-05', '2028-10-05', 'Active', 'Active', 'Private', '2015', '45 Rizal St., Bacolod City, Negros Occidental', 'HR Manager', 'admin', NULL, NULL);
INSERT INTO public.company_profiles (id, user_id, company_name, company_location, company_type, website, created_at, updated_at, company_size, contact_email, contact_phone, description, logo_url, profile_completed, contact_person, moa_file_path, moa_start_date, moa_end_date, moa_status, status, ownership_type, year_founded, full_address, contact_title, registration_source, moa_requested_at, moa_request_notes) VALUES (4, 61, 'Dreamville', 'Bacolod City', 'IT Consulting & Services', NULL, '2026-10-17 15:38:51', '2026-10-17 15:38:51', NULL, 'ctrlmyre@gmail.com', '0912345687', NULL, NULL, false, 'Jermain Lamar Cole', 'moa_documents/iELOETC7kmBGiivyDcK8W7JPhKQeMYEM8wG3sL28.docx', '2026-10-17', '2029-10-16', 'Active', 'Pending', NULL, NULL, NULL, NULL, 'admin', NULL, NULL);


--
-- Data for Name: evaluation_questions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.evaluation_questions (id, template_id, category, question_text, question_type, options, scale_min, scale_max, is_required, sort_order, created_at, updated_at) VALUES (1, 1, 'Technical Competence', 'Demonstrates sound technical knowledge and proficiency in executing assigned tasks and tools.', 'rating', NULL, 1, 5, true, 1, '2026-10-05 15:41:18', '2026-10-05 15:41:18');
INSERT INTO public.evaluation_questions (id, template_id, category, question_text, question_type, options, scale_min, scale_max, is_required, sort_order, created_at, updated_at) VALUES (2, 1, 'Technical Competence', 'Consistently produces accurate, neat, and high-quality outputs with attention to detail.', 'rating', NULL, 1, 5, true, 2, '2026-10-05 15:41:18', '2026-10-05 15:41:18');
INSERT INTO public.evaluation_questions (id, template_id, category, question_text, question_type, options, scale_min, scale_max, is_required, sort_order, created_at, updated_at) VALUES (3, 1, 'Technical Competence', 'Applies critical thinking and problem-solving skills when encountering challenges.', 'rating', NULL, 1, 5, true, 3, '2026-10-05 15:41:18', '2026-10-05 15:41:18');
INSERT INTO public.evaluation_questions (id, template_id, category, question_text, question_type, options, scale_min, scale_max, is_required, sort_order, created_at, updated_at) VALUES (4, 1, 'Professionalism & Work Ethic', 'Punctuality and attendance: Reports to work on time and adheres strictly to the agreed schedule.', 'rating', NULL, 1, 5, true, 4, '2026-10-05 15:41:18', '2026-10-05 15:41:18');
INSERT INTO public.evaluation_questions (id, template_id, category, question_text, question_type, options, scale_min, scale_max, is_required, sort_order, created_at, updated_at) VALUES (5, 1, 'Professionalism & Work Ethic', 'Observes office decorum, company policies, confidentiality, and professional code of conduct.', 'rating', NULL, 1, 5, true, 5, '2026-10-05 15:41:18', '2026-10-05 15:41:18');
INSERT INTO public.evaluation_questions (id, template_id, category, question_text, question_type, options, scale_min, scale_max, is_required, sort_order, created_at, updated_at) VALUES (6, 1, 'Professionalism & Work Ethic', 'Takes initiative and shows eagerness to learn new concepts and responsibilities.', 'rating', NULL, 1, 5, true, 6, '2026-10-05 15:41:18', '2026-10-05 15:41:18');
INSERT INTO public.evaluation_questions (id, template_id, category, question_text, question_type, options, scale_min, scale_max, is_required, sort_order, created_at, updated_at) VALUES (7, 1, 'Communication & Teamwork', 'Effectively communicates ideas, status updates, and questions with supervisors and team members.', 'rating', NULL, 1, 5, true, 7, '2026-10-05 15:41:18', '2026-10-05 15:41:18');
INSERT INTO public.evaluation_questions (id, template_id, category, question_text, question_type, options, scale_min, scale_max, is_required, sort_order, created_at, updated_at) VALUES (8, 1, 'Communication & Teamwork', 'Collaborates constructively in team tasks and accepts feedback with an open, positive mindset.', 'rating', NULL, 1, 5, true, 8, '2026-10-05 15:41:18', '2026-10-05 15:41:18');
INSERT INTO public.evaluation_questions (id, template_id, category, question_text, question_type, options, scale_min, scale_max, is_required, sort_order, created_at, updated_at) VALUES (9, 1, 'Overall Recommendation', 'Would your company consider hiring this student as a regular employee upon graduation?', 'multiple_choice', '["Highly Recommended - Ready for immediate employment","Recommended - Would consider after graduation","Needs further academic\/technical preparation","Not recommended at this time"]', 1, 5, true, 9, '2026-10-05 15:41:18', '2026-10-05 15:41:18');
INSERT INTO public.evaluation_questions (id, template_id, category, question_text, question_type, options, scale_min, scale_max, is_required, sort_order, created_at, updated_at) VALUES (10, 1, 'Company Feedback', 'What are the student trainee''s notable strengths observed during their internship?', 'text', NULL, 1, 5, true, 10, '2026-10-05 15:41:18', '2026-10-05 15:41:18');
INSERT INTO public.evaluation_questions (id, template_id, category, question_text, question_type, options, scale_min, scale_max, is_required, sort_order, created_at, updated_at) VALUES (11, 1, 'Company Feedback', 'What constructive advice or areas for improvement do you recommend for their professional development?', 'text', NULL, 1, 5, false, 11, '2026-10-05 15:41:18', '2026-10-05 15:41:18');
INSERT INTO public.evaluation_questions (id, template_id, category, question_text, question_type, options, scale_min, scale_max, is_required, sort_order, created_at, updated_at) VALUES (12, 2, 'Technical Competence', 'Are they GOOD?', 'multiple_choice', '["No","maybe","but no"]', 1, 5, true, 1, '2026-10-06 03:23:57', '2026-10-06 03:23:57');
INSERT INTO public.evaluation_questions (id, template_id, category, question_text, question_type, options, scale_min, scale_max, is_required, sort_order, created_at, updated_at) VALUES (13, 2, 'Technical Competence', 'asdasda', 'rating', NULL, 1, 5, true, 2, '2026-10-06 03:24:20', '2026-10-06 03:24:20');


--
-- Data for Name: evaluation_templates; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.evaluation_templates (id, supervisor_id, program, title, description, is_active, created_at, updated_at, term) VALUES (1, NULL, NULL, 'CHMSU Host Company OJT Trainee Performance Evaluation', 'Official evaluation for trainees who have completed their required on-the-job training hours. Please provide an objective assessment of the trainee''s performance, technical skills, and workplace conduct.', true, '2026-10-05 15:41:18', '2026-10-05 15:41:18', 'both');
INSERT INTO public.evaluation_templates (id, supervisor_id, program, title, description, is_active, created_at, updated_at, term) VALUES (2, 5, 'Bachelor of Science in Information Technology', 'Eval For NA AH', NULL, true, '2026-10-06 03:22:57', '2026-10-06 03:22:57', 'both');
INSERT INTO public.evaluation_templates (id, supervisor_id, program, title, description, is_active, created_at, updated_at, term) VALUES (3, 5, 'Bachelor of Science in Information Technology', 'll', NULL, true, '2026-10-12 12:57:53', '2026-10-12 12:57:53', 'both');


--
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: graduate_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.graduate_profiles (id, user_id, year_graduated, campus, course, section, employment_status, created_at, updated_at) VALUES (1, 25, '2020', 'Alijis Campus', 'Bachelor of Science in Information Technology', '4B', 'employed', '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.graduate_profiles (id, user_id, year_graduated, campus, course, section, employment_status, created_at, updated_at) VALUES (2, 26, '2020', 'Alijis Campus', 'Bachelor of Science in Information Technology', '4B', 'employed', '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.graduate_profiles (id, user_id, year_graduated, campus, course, section, employment_status, created_at, updated_at) VALUES (3, 27, '2020', 'Alijis Campus', 'Bachelor of Science in Information Technology', '4B', 'employed', '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.graduate_profiles (id, user_id, year_graduated, campus, course, section, employment_status, created_at, updated_at) VALUES (4, 28, '2020', 'Alijis Campus', 'Bachelor of Science in Information Technology', '4B', 'employed', '2026-10-06 07:55:41', '2026-10-06 07:55:41');
INSERT INTO public.graduate_profiles (id, user_id, year_graduated, campus, course, section, employment_status, created_at, updated_at) VALUES (5, 29, '2020', 'Alijis Campus', 'Bachelor of Science in Information Technology', '4B', 'employed', '2026-10-06 07:55:41', '2026-10-06 07:55:41');
INSERT INTO public.graduate_profiles (id, user_id, year_graduated, campus, course, section, employment_status, created_at, updated_at) VALUES (6, 30, '2020', 'Alijis Campus', 'Bachelor of Science in Information Technology', '4B', 'employed', '2026-10-06 07:55:41', '2026-10-06 07:55:41');
INSERT INTO public.graduate_profiles (id, user_id, year_graduated, campus, course, section, employment_status, created_at, updated_at) VALUES (7, 31, '2020', 'Alijis Campus', 'Bachelor of Science in Information Technology', '4B', 'freelance', '2026-10-06 07:55:41', '2026-10-06 07:55:41');
INSERT INTO public.graduate_profiles (id, user_id, year_graduated, campus, course, section, employment_status, created_at, updated_at) VALUES (8, 32, '2020', 'Alijis Campus', 'Bachelor of Science in Information Technology', '4B', 'employed', '2026-10-06 07:55:42', '2026-10-06 07:55:42');
INSERT INTO public.graduate_profiles (id, user_id, year_graduated, campus, course, section, employment_status, created_at, updated_at) VALUES (9, 33, '2020', 'Alijis Campus', 'Bachelor of Science in Information Technology', '4B', 'employed', '2026-10-06 07:55:42', '2026-10-06 07:55:42');
INSERT INTO public.graduate_profiles (id, user_id, year_graduated, campus, course, section, employment_status, created_at, updated_at) VALUES (10, 34, '2020', 'Alijis Campus', 'Bachelor of Science in Information Technology', '4B', 'looking', '2026-10-06 07:55:42', '2026-10-06 07:55:42');
INSERT INTO public.graduate_profiles (id, user_id, year_graduated, campus, course, section, employment_status, created_at, updated_at) VALUES (11, 35, '2020-2021', 'Main Campus', 'Bachelor of Science in Information Technology', 'A', 'employed', '2026-10-06 08:14:51', '2026-10-06 08:14:51');
INSERT INTO public.graduate_profiles (id, user_id, year_graduated, campus, course, section, employment_status, created_at, updated_at) VALUES (12, 36, '2020-2021', 'Main Campus', 'Bachelor of Science in Information Technology', 'A', 'employed', '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.graduate_profiles (id, user_id, year_graduated, campus, course, section, employment_status, created_at, updated_at) VALUES (13, 37, '2020-2021', 'Main Campus', 'Bachelor of Science in Information Technology', 'A', 'employed', '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.graduate_profiles (id, user_id, year_graduated, campus, course, section, employment_status, created_at, updated_at) VALUES (14, 38, '2020-2021', 'Main Campus', 'Bachelor of Science in Information Technology', 'A', 'freelance', '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.graduate_profiles (id, user_id, year_graduated, campus, course, section, employment_status, created_at, updated_at) VALUES (15, 39, '2020-2021', 'Main Campus', 'Bachelor of Science in Information Technology', 'A', 'employed', '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.graduate_profiles (id, user_id, year_graduated, campus, course, section, employment_status, created_at, updated_at) VALUES (16, 40, '2020-2021', 'Main Campus', 'Bachelor of Science in Information Technology', 'A', 'employed', '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.graduate_profiles (id, user_id, year_graduated, campus, course, section, employment_status, created_at, updated_at) VALUES (17, 41, '2020-2021', 'Main Campus', 'Bachelor of Science in Information Technology', 'A', 'employed', '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.graduate_profiles (id, user_id, year_graduated, campus, course, section, employment_status, created_at, updated_at) VALUES (18, 42, '2020-2021', 'Main Campus', 'Bachelor of Science in Information Technology', 'A', 'studying', '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.graduate_profiles (id, user_id, year_graduated, campus, course, section, employment_status, created_at, updated_at) VALUES (19, 43, '2020-2021', 'Main Campus', 'Bachelor of Science in Information Technology', 'A', 'employed', '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.graduate_profiles (id, user_id, year_graduated, campus, course, section, employment_status, created_at, updated_at) VALUES (20, 44, '2020-2021', 'Main Campus', 'Bachelor of Science in Information Technology', 'A', 'employed', '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.graduate_profiles (id, user_id, year_graduated, campus, course, section, employment_status, created_at, updated_at) VALUES (21, 45, '2020-2021', 'Main Campus', 'Bachelor of Science in Information Technology', 'B', 'employed', '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.graduate_profiles (id, user_id, year_graduated, campus, course, section, employment_status, created_at, updated_at) VALUES (22, 46, '2020-2021', 'Main Campus', 'Bachelor of Science in Information Technology', 'B', 'employed', '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.graduate_profiles (id, user_id, year_graduated, campus, course, section, employment_status, created_at, updated_at) VALUES (23, 47, '2020-2021', 'Main Campus', 'Bachelor of Science in Information Technology', 'B', 'employed', '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.graduate_profiles (id, user_id, year_graduated, campus, course, section, employment_status, created_at, updated_at) VALUES (24, 48, '2020-2021', 'Main Campus', 'Bachelor of Science in Information Technology', 'B', 'employed', '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.graduate_profiles (id, user_id, year_graduated, campus, course, section, employment_status, created_at, updated_at) VALUES (25, 49, '2020-2021', 'Main Campus', 'Bachelor of Science in Information Technology', 'B', 'employed', '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.graduate_profiles (id, user_id, year_graduated, campus, course, section, employment_status, created_at, updated_at) VALUES (26, 50, '2020-2021', 'Main Campus', 'Bachelor of Science in Information Technology', 'B', 'looking', '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.graduate_profiles (id, user_id, year_graduated, campus, course, section, employment_status, created_at, updated_at) VALUES (27, 51, '2020-2021', 'Main Campus', 'Bachelor of Science in Information Technology', 'B', 'employed', '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.graduate_profiles (id, user_id, year_graduated, campus, course, section, employment_status, created_at, updated_at) VALUES (28, 52, '2020-2021', 'Main Campus', 'Bachelor of Science in Information Technology', 'B', 'employed', '2026-10-06 08:14:56', '2026-10-06 08:14:56');
INSERT INTO public.graduate_profiles (id, user_id, year_graduated, campus, course, section, employment_status, created_at, updated_at) VALUES (29, 53, '2020-2021', 'Main Campus', 'Bachelor of Science in Information Technology', 'B', 'employed', '2026-10-06 08:14:56', '2026-10-06 08:14:56');
INSERT INTO public.graduate_profiles (id, user_id, year_graduated, campus, course, section, employment_status, created_at, updated_at) VALUES (30, 54, '2020-2021', 'Main Campus', 'Bachelor of Science in Information Technology', 'B', 'employed', '2026-10-06 08:14:56', '2026-10-06 08:14:56');
INSERT INTO public.graduate_profiles (id, user_id, year_graduated, campus, course, section, employment_status, created_at, updated_at) VALUES (31, 14, '2026', 'Talisay Campus', 'Bachelor of Science in Information Technology', 'BSIT 4-B', 'looking', '2026-10-12 14:42:46', '2026-10-12 14:42:46');


--
-- Data for Name: interviews; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: job_applications; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.job_applications (id, job_listing_id, applicant_user_id, status, match_score, cover_letter, notes, created_at, updated_at, offer_details, offer_decision, offer_decided_at) VALUES (1, 1, 31, 'hired', NULL, NULL, 'Promoted from Junior Developer to Regular Mid-Level Full Stack Web Developer. Outstanding performance in client API integrations.', '2026-10-17 01:32:00', '2026-10-17 01:32:00', '{"salary":"?45,000\/month","start_date":"2025-06-01","employment_status":"Regular","department":"Software Development","employee_number":"EMP-2025-001","supervisor_name":"Lead Architect","employee_notes":"Promoted from Junior Developer to Regular Mid-Level Full Stack Web Developer. Outstanding performance in client API integrations."}', 'accepted', '2026-10-17 01:32:00');
INSERT INTO public.job_applications (id, job_listing_id, applicant_user_id, status, match_score, cover_letter, notes, created_at, updated_at, offer_details, offer_decision, offer_decided_at) VALUES (2, 2, 40, 'hired', NULL, NULL, 'Completed initial onboarding. Excellent Figma component library creation and design system tokens.', '2026-10-17 01:32:01', '2026-10-17 01:32:01', '{"salary":"?32,000\/month","start_date":"2026-08-15","employment_status":"Probationary","department":"Design & Product","employee_number":"EMP-2026-008","supervisor_name":"Creative Director","employee_notes":"Completed initial onboarding. Excellent Figma component library creation and design system tokens."}', 'accepted', '2026-10-17 01:32:01');
INSERT INTO public.job_applications (id, job_listing_id, applicant_user_id, status, match_score, cover_letter, notes, created_at, updated_at, offer_details, offer_decision, offer_decided_at) VALUES (3, 1, 14, 'applied', NULL, 'applicagtion', NULL, '2026-10-17 16:06:55', '2026-10-17 16:06:55', NULL, NULL, NULL);
INSERT INTO public.job_applications (id, job_listing_id, applicant_user_id, status, match_score, cover_letter, notes, created_at, updated_at, offer_details, offer_decision, offer_decided_at) VALUES (4, 3, 55, 'applied', 30, NULL, NULL, '2026-10-21 11:32:19', '2026-10-21 11:32:19', NULL, NULL, NULL);


--
-- Data for Name: job_batches; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: job_listings; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.job_listings (id, company_user_id, title, department, location, employment_type, salary_range, description, responsibilities, requirements, benefits, required_skills, status, expires_at, created_at, updated_at, experience_level) VALUES (1, 11, 'Full Stack Web Developer', 'Software Development', 'Bacolod City, Negros Occidental', 'Full-time', '₱40,000 – ₱65,000/month', 'Na Ah Company is seeking an experienced and enthusiastic Mid-Level Full Stack Web Developer to join our core engineering team in Bacolod City. In this role, you will design, build, and deploy mission-critical web applications for our growing roster of regional and national SME clients. You will work across both client-facing frontends and scalable backend APIs, collaborating closely with UI designers, project managers, and fellow engineers in an agile sprint environment.', '["Architect, develop, and maintain responsive web applications using modern JavaScript\/TypeScript and PHP frameworks","Design and optimize relational database schemas, migrations, and high-performance queries in PostgreSQL and MySQL","Develop clean, secure, and well-documented RESTful APIs to integrate with third-party payment gateways and services","Participate actively in sprint planning, backlog grooming, daily standups, and rigorous peer code reviews","Identify, troubleshoot, and resolve performance bottlenecks, security vulnerabilities, and application bugs","Write automated unit and integration tests to ensure cross-browser compatibility and continuous reliability"]', '["Bachelor''s degree in Information Technology, Computer Science, or equivalent practical experience","3+ years of professional full-stack development experience utilizing modern web technologies","Demonstrated proficiency with backend development (PHP\/Laravel or Node.js) and relational databases","Solid frontend experience with modern frameworks (Vue.js, React, or modern vanilla ES6+ with Tailwind CSS)","Strong understanding of Git version control, collaborative branching workflows, and CI\/CD concepts","Excellent analytical mindset, problem-solving abilities, and collaborative team communication skills"]', '["13th Month Pay","Health Insurance (HMO)","Paid Vacation Leave","Paid Sick Leave","Performance Bonus","Flexible Hours","Internet Allowance","Training & Development"]', '["PHP","Laravel","JavaScript","Vue.js","REST API","PostgreSQL","MySQL","Tailwind CSS","Git","Docker"]', 'open', '2026-11-30 00:00:00', '2026-10-17 01:22:56', '2026-10-17 01:23:06', 'Mid-Level');
INSERT INTO public.job_listings (id, company_user_id, title, department, location, employment_type, salary_range, description, responsibilities, requirements, benefits, required_skills, status, expires_at, created_at, updated_at, experience_level) VALUES (2, 11, 'Frontend UI/UX Engineer', 'Design & Product', 'Bacolod City, Negros Occidental', 'Full-time', '₱28,000 – ₱42,000/month', 'Na Ah Company is looking for a creative and detail-oriented Frontend UI/UX Engineer to craft intuitive, accessible, and high-converting web and mobile experiences. Bridging the gap between design vision and technical execution, you will transform Figma design systems into pixel-perfect, performant code while advocating for user empathy and seamless ergonomics across all digital touchpoints.', '["Translate high-fidelity Figma mockups, wireframes, and interactive prototypes into modular, reusable frontend components","Collaborate with product designers and backend engineers to define seamless API contracts and UI states","Maintain, document, and evolve our company UI component library and design token architecture","Conduct usability evaluations, responsive design audits, and accessibility (WCAG 2.1) compliance checks","Optimize client-side bundle sizes, asset delivery, and rendering performance for blazing-fast page load times","Participate in daily agile standups and present interactive design-to-code implementations to project stakeholders"]', '["Bachelor''s degree in Information Technology, Multimedia Arts, Computer Science, or equivalent portfolio experience","1\u20132 years of practical experience in frontend engineering and UI\/UX design implementation","High proficiency in semantic HTML5, CSS3\/SCSS, modern JavaScript, and UI styling frameworks like Tailwind CSS","Hands-on experience with frontend component frameworks such as React or Vue.js","Deep familiarity with Figma (auto-layout, components, variants, and design token handoff)","Strong eye for typography, spatial harmony, micro-interactions, and visual storytelling"]', '["13th Month Pay","Health Insurance (HMO)","Paid Vacation Leave","Paid Sick Leave","Remote Work Option","Internet Allowance","Training & Development","Performance Bonus"]', '["HTML","CSS","JavaScript","React","Tailwind CSS","Figma","UI Design","UX Research","Responsive Design","Git"]', 'open', '2026-11-30 00:00:00', '2026-10-17 01:23:23', '2026-10-17 01:23:23', 'Junior');
INSERT INTO public.job_listings (id, company_user_id, title, department, location, employment_type, salary_range, description, responsibilities, requirements, benefits, required_skills, status, expires_at, created_at, updated_at, experience_level) VALUES (3, 11, 'QA Automation Engineer', 'QA / Testing', 'Remote / Work from Home', 'Full-time', '₱35,000 – ₱55,000/month', 'Na Ah Company is expanding its Quality Assurance team and looking for a Mid-Level QA Automation Engineer. You will be responsible for defining and executing automated test strategies that ensure high reliability, performance, and security across our software products. You will partner directly with developers to embed quality early into the software development lifecycle.', '["Author, maintain, and execute automated end-to-end and regression test suites using Playwright and Cypress","Develop automated API testing suites in Postman and JavaScript to validate backend contract reliability","Execute exploratory, functional, and smoke testing for new feature rollouts and releases","Log, isolate, track, and verify software defects and edge cases systematically using Jira","Integrate automated test runs into GitHub Actions CI\/CD pipelines to catch regression early","Collaborate with developers to reproduce tricky issues, analyze root causes, and verify bug fixes"]', '["Bachelor''s degree in Computer Science, Information Technology, or relevant engineering field","3+ years of experience in software quality assurance with at least 2 years focused on test automation","Hands-on experience with test automation frameworks such as Cypress, Playwright, or Selenium","Solid understanding of RESTful API testing, HTTP status codes, and JSON schema validation","Experience working in Agile\/Scrum environments with Jira or similar issue management tools","High attention to detail, proactive quality mindset, and clear bug reporting documentation skills"]', '["13th Month Pay","Health Insurance (HMO)","Life Insurance","Paid Vacation Leave","Paid Sick Leave","Remote Work Option","Internet Allowance","Performance Bonus"]', '["QA \/ Testing","Cypress","Playwright","Postman","Automated Testing","Manual Testing","REST API","Jira","CI\/CD","JavaScript"]', 'open', '2026-12-15 00:00:00', '2026-10-17 01:23:23', '2026-10-17 01:23:23', 'Mid-Level');
INSERT INTO public.job_listings (id, company_user_id, title, department, location, employment_type, salary_range, description, responsibilities, requirements, benefits, required_skills, status, expires_at, created_at, updated_at, experience_level) VALUES (4, 11, 'Junior Cloud & DevOps Specialist', 'Cloud Infrastructure', 'Bacolod City, Negros Occidental', 'Full-time', '₱30,000 – ₱45,000/month', 'We are seeking a motivated Junior Cloud & DevOps Specialist to support and scale Na Ah Company’s cloud environments, deployment automation, and server infrastructure. Working under the guidance of our lead engineers, you will gain hands-on experience orchestrating containers, automating CI/CD pipelines, and ensuring maximum uptime and security for our client applications.', '["Assist in provisioning, configuring, and monitoring cloud infrastructure on AWS and Linux VPS servers","Containerize microservices and web applications using Docker and Docker Compose","Maintain and improve automated build, test, and deployment pipelines using GitHub Actions","Configure reverse proxies, SSL\/TLS certificates, domain DNS, and server firewalls using Nginx and Linux tooling","Monitor server health, resource utilization, uptime metrics, and assist in routine automated backups","Document operational procedures, network configurations, and system troubleshooting guides"]', '["Bachelor''s degree in Information Technology, Computer Engineering, or related technical field","1\u20132 years of practical experience or relevant coursework\/internship in Linux server administration and cloud computing","Hands-on familiarity with Linux command-line, Bash scripting, and basic networking fundamentals (TCP\/IP, DNS, SSH)","Practical understanding of Docker containerization and CI\/CD concepts with GitHub Actions or GitLab CI","Exposure to cloud platforms such as AWS (EC2, S3, RDS) or Google Cloud Platform","Eagerness to learn cloud-native tooling, security best practices, and high-availability architecture"]', '["13th Month Pay","Health Insurance (HMO)","Paid Vacation Leave","Paid Sick Leave","Performance Bonus","Flexible Hours","Internet Allowance","Training & Development"]', '["Linux","Docker","AWS","CI\/CD","GitHub Actions","Nginx","Git","Bash Scripting","DevOps","Cloud Infrastructure"]', 'open', '2026-12-15 00:00:00', '2026-10-17 01:23:24', '2026-10-17 01:23:24', 'Junior');
INSERT INTO public.job_listings (id, company_user_id, title, department, location, employment_type, salary_range, description, responsibilities, requirements, benefits, required_skills, status, expires_at, created_at, updated_at, experience_level) VALUES (5, 11, 'IT Technical Support Specialist', 'IT Support', 'Bacolod City, Negros Occidental', 'Full-time', '₱20,000 – ₱30,000/month', 'Na Ah Company is welcoming fresh graduates and ambitious entry-level tech enthusiasts for the position of IT Technical Support Specialist. In this role, you will be the first line of technical assistance for our internal staff and client workstations, diagnosing hardware, software, and local network issues while maintaining high customer satisfaction.', '["Provide prompt, courteous, and effective first-line technical support via helpdesk tickets, phone, and in-person","Diagnose and resolve hardware issues, operating system errors (Windows\/Linux\/macOS), and software application faults","Set up, configure, and maintain company laptops, desktop workstations, peripherals, and network printers","Administer user accounts, email groups, file sharing permissions, and access credentials in company workspaces","Assist in managing local office LAN\/Wi-Fi connectivity, routers, switches, and backup power supplies","Maintain an updated inventory of company IT hardware, equipment licenses, and technical troubleshooting documentation"]', '["Bachelor''s degree in Information Technology, Computer Science, Computer Engineering, or related field (Fresh graduates are encouraged to apply)","Strong foundational knowledge of computer hardware components, OS troubleshooting, and basic networking","Familiarity with helpdesk ticketing systems, remote desktop utilities, and office productivity suites","Patient, professional demeanor with outstanding interpersonal and active listening communication skills","Strong passion for customer service, continuous technical learning, and team problem-solving","Relevant certifications (such as CompTIA A+, Network+, or Cisco CCNA) are a welcome plus"]', '["13th Month Pay","Health Insurance (HMO)","Paid Vacation Leave","Paid Sick Leave","Performance Bonus","Meal Allowance","Transportation Allowance","Training & Development"]', '["Technical Support","IT Support","Hardware Troubleshooting","Networking","Customer Support","Windows","Linux","Helpdesk","Problem Solving","Communication"]', 'open', '2026-12-31 00:00:00', '2026-10-17 01:23:24', '2026-10-17 01:23:24', 'Entry Level');


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.jobs (id, queue, payload, attempts, reserved_at, available_at, created_at) VALUES (1, 'default', '{"uuid":"e5fd3825-e18b-4473-98f7-ae158caf4af5","displayName":"App\\Mail\\StudentWelcome","job":"Illuminate\\Queue\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"deleteWhenMissingModels":false,"data":{"commandName":"Illuminate\\Mail\\SendQueuedMailable","command":"O:34:\"Illuminate\\Mail\\SendQueuedMailable\":17:{s:8:\"mailable\";O:23:\"App\\Mail\\StudentWelcome\":8:{s:11:\"studentName\";s:14:\"Juan Dela Cruz\";s:5:\"email\";s:22:\"jdelacruz@chmsu.edu.ph\";s:9:\"studentId\";s:8:\"20230001\";s:7:\"program\";s:45:\"Bachelor of Science in Information Technology\";s:6:\"campus\";s:11:\"Main Campus\";s:8:\"loginUrl\";s:27:\"http:\/\/localhost:5173\/login\";s:2:\"to\";a:1:{i:0;a:2:{s:4:\"name\";N;s:7:\"address\";s:22:\"jdelacruz@chmsu.edu.ph\";}}s:6:\"mailer\";s:4:\"smtp\";}s:5:\"tries\";N;s:7:\"timeout\";N;s:13:\"maxExceptions\";N;s:17:\"shouldBeEncrypted\";b:0;s:3:\"job\";N;s:10:\"connection\";N;s:5:\"queue\";N;s:12:\"messageGroup\";N;s:12:\"deduplicator\";N;s:5:\"delay\";N;s:11:\"afterCommit\";N;s:10:\"middleware\";a:0:{}s:7:\"chained\";a:0:{}s:15:\"chainConnection\";N;s:10:\"chainQueue\";N;s:19:\"chainCatchCallbacks\";N;}","batchId":null},"createdAt":1791214993,"delay":null}', 0, NULL, 1791214993, 1791214993);
INSERT INTO public.jobs (id, queue, payload, attempts, reserved_at, available_at, created_at) VALUES (2, 'default', '{"uuid":"56b5c86d-b210-481b-b0d8-a6c9355a02d6","displayName":"App\\Mail\\StudentWelcome","job":"Illuminate\\Queue\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"deleteWhenMissingModels":false,"data":{"commandName":"Illuminate\\Mail\\SendQueuedMailable","command":"O:34:\"Illuminate\\Mail\\SendQueuedMailable\":17:{s:8:\"mailable\";O:23:\"App\\Mail\\StudentWelcome\":8:{s:11:\"studentName\";s:12:\"Maria Santos\";s:5:\"email\";s:20:\"msantos@chmsu.edu.ph\";s:9:\"studentId\";s:8:\"20230002\";s:7:\"program\";s:45:\"Bachelor of Science in Information Technology\";s:6:\"campus\";s:13:\"Alijis Campus\";s:8:\"loginUrl\";s:27:\"http:\/\/localhost:5173\/login\";s:2:\"to\";a:1:{i:0;a:2:{s:4:\"name\";N;s:7:\"address\";s:20:\"msantos@chmsu.edu.ph\";}}s:6:\"mailer\";s:4:\"smtp\";}s:5:\"tries\";N;s:7:\"timeout\";N;s:13:\"maxExceptions\";N;s:17:\"shouldBeEncrypted\";b:0;s:3:\"job\";N;s:10:\"connection\";N;s:5:\"queue\";N;s:12:\"messageGroup\";N;s:12:\"deduplicator\";N;s:5:\"delay\";N;s:11:\"afterCommit\";N;s:10:\"middleware\";a:0:{}s:7:\"chained\";a:0:{}s:15:\"chainConnection\";N;s:10:\"chainQueue\";N;s:19:\"chainCatchCallbacks\";N;}","batchId":null},"createdAt":1791214994,"delay":null}', 0, NULL, 1791214994, 1791214994);


--
-- Data for Name: jobseeker_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.jobseeker_profiles (id, user_id, desired_job_title, work_preference, years_of_experience, headline, bio, location, portfolio_url, linkedin_url, phone, avatar_url, profile_completed, created_at, updated_at) VALUES (1, 25, 'Lead Backend / Solutions Architect', 'remote', '5_plus', 'Senior Laravel & Cloud Solutions Architect | 5+ Years Exp', '2020 CHMSU BSIT 4B Alumnus. Senior Software Engineer specializing in distributed enterprise backends, high-concurrency microservices, and AWS infrastructure.', 'Bacolod City, Negros Occidental', 'https://markalcantara.com', 'https://linkedin.com/in/markjoseph-alcantara', '+63 917 800 4001', NULL, true, '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.jobseeker_profiles (id, user_id, desired_job_title, work_preference, years_of_experience, headline, bio, location, portfolio_url, linkedin_url, phone, avatar_url, profile_completed, created_at, updated_at) VALUES (2, 26, 'Staff Product Designer / Design Lead', 'hybrid', '5_plus', 'Lead UI/UX Product Designer & Design Systems Lead', '2020 BSIT 4B Alumna. Product design leader crafting accessible multi-platform interfaces for FinTech and HealthTech applications across Southeast Asia.', 'Makati City, Metro Manila / Bacolod City', 'https://christinesalgado.design', 'https://linkedin.com/in/christinemaesalgado', '+63 918 800 4002', NULL, true, '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.jobseeker_profiles (id, user_id, desired_job_title, work_preference, years_of_experience, headline, bio, location, portfolio_url, linkedin_url, phone, avatar_url, profile_completed, created_at, updated_at) VALUES (3, 27, 'Principal Site Reliability Engineer', 'remote', '5_plus', 'Senior DevOps & Site Reliability Engineer (SRE)', '2020 BSIT 4B Graduate. Cloud infrastructure specialist managing zero-downtime Kubernetes deployments, Terraform IaC, and Datadog observability suites.', 'Pasig City, Metro Manila / Remote', 'https://neilcordova.cloud', 'https://linkedin.com/in/neilpatrickcordova', '+63 919 800 4003', NULL, true, '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.jobseeker_profiles (id, user_id, desired_job_title, work_preference, years_of_experience, headline, bio, location, portfolio_url, linkedin_url, phone, avatar_url, profile_completed, created_at, updated_at) VALUES (4, 28, 'QA Engineering Manager / Lead SDET', 'hybrid', '5_plus', 'Lead QA Automation Engineer | Playwright, Cypress & Appium', '2020 BSIT 4B Graduate. Quality engineering strategist leading automated testing transformation for multi-national fintech platforms.', 'Iloilo City / Bacolod City', 'https://hannahmontinola.dev', 'https://linkedin.com/in/hannahgracemontinola', '+63 920 800 4004', NULL, true, '2026-10-06 07:55:41', '2026-10-06 07:55:41');
INSERT INTO public.jobseeker_profiles (id, user_id, desired_job_title, work_preference, years_of_experience, headline, bio, location, portfolio_url, linkedin_url, phone, avatar_url, profile_completed, created_at, updated_at) VALUES (5, 29, 'Staff Mobile Engineer', 'remote', '5_plus', 'Senior Mobile Engineer | React Native, iOS (Swift) & Android', '2020 BSIT 4B Graduate. Mobile specialist with 5+ years experience crafting offline-first native and cross-platform apps with 1M+ downloads.', 'Cebu City / Remote', 'https://jesterespina.dev', 'https://linkedin.com/in/jesterianespina', '+63 921 800 4005', NULL, true, '2026-10-06 07:55:41', '2026-10-06 07:55:41');
INSERT INTO public.jobseeker_profiles (id, user_id, desired_job_title, work_preference, years_of_experience, headline, bio, location, portfolio_url, linkedin_url, phone, avatar_url, profile_completed, created_at, updated_at) VALUES (6, 30, 'Lead Data Engineer / Analytics Lead', 'remote', '5_plus', 'Data Analytics & Business Intelligence Lead | Snowflake, dbt & Python', '2020 BSIT 4B Graduate. Modern data stack practitioner transforming complex enterprise datasets into executive decision dashboards and automated ETL pipelines.', 'Taguig City, Metro Manila / Remote', 'https://rheagatuslao.com', 'https://linkedin.com/in/rheacamille-gatuslao', '+63 922 800 4006', NULL, true, '2026-10-06 07:55:41', '2026-10-06 07:55:41');
INSERT INTO public.jobseeker_profiles (id, user_id, desired_job_title, work_preference, years_of_experience, headline, bio, location, portfolio_url, linkedin_url, phone, avatar_url, profile_completed, created_at, updated_at) VALUES (7, 31, 'Senior Full-Stack Consultant / Contractor', 'remote', '5_plus', 'Full-Stack TypeScript & Next.js Consultant | Top-Rated Upwork', '2020 BSIT 4B Graduate. Independent software consultant and top-rated freelancer engineering full-stack web platforms for US and UK technology startups.', 'Bacolod City, Negros Occidental', 'https://adrianlacson.io', 'https://linkedin.com/in/adrianpaullacson', '+63 923 800 4007', NULL, true, '2026-10-06 07:55:41', '2026-10-06 07:55:41');
INSERT INTO public.jobseeker_profiles (id, user_id, desired_job_title, work_preference, years_of_experience, headline, bio, location, portfolio_url, linkedin_url, phone, avatar_url, profile_completed, created_at, updated_at) VALUES (8, 32, 'Senior Cybersecurity Engineer / SOC Lead', 'hybrid', '5_plus', 'Cybersecurity & Infrastructure Security Specialist | CISSP Candidate', '2020 BSIT 4B Graduate. Security operations engineer defending critical national infrastructure and banking financial transactions from advanced persistent threats (APT).', 'Makati City / Bacolod City', 'https://daphnearrieta.info', 'https://linkedin.com/in/daphnerosearrieta', '+63 924 800 4008', NULL, true, '2026-10-06 07:55:42', '2026-10-06 07:55:42');
INSERT INTO public.jobseeker_profiles (id, user_id, desired_job_title, work_preference, years_of_experience, headline, bio, location, portfolio_url, linkedin_url, phone, avatar_url, profile_completed, created_at, updated_at) VALUES (9, 33, 'Chief Technology Officer / Solutions Architect', 'onsite', '5_plus', 'Solutions Engineer & Technology Entrepreneur | Founder @ DevLink PH', '2020 BSIT 4B Graduate. Co-founder of a Bacolod-based software engineering agency providing custom ERP, POS, and inventory solutions to regional SMEs.', 'Bacolod City, Negros Occidental', 'https://kennethjamero.ph', 'https://linkedin.com/in/kennethrayjamero', '+63 925 800 4009', NULL, true, '2026-10-06 07:55:42', '2026-10-06 07:55:42');
INSERT INTO public.jobseeker_profiles (id, user_id, desired_job_title, work_preference, years_of_experience, headline, bio, location, portfolio_url, linkedin_url, phone, avatar_url, profile_completed, created_at, updated_at) VALUES (10, 34, 'Lead Systems Analyst / Technical Project Manager', 'remote', '5_plus', 'Senior Systems Analyst & Business Systems Consultant', '2020 BSIT 4B Graduate. Strategic analyst bridging functional business operations and software engineering. Currently actively evaluating senior leadership roles in enterprise IT transformation.', 'Bacolod City, Negros Occidental', 'https://stephanieguanzon.dev', 'https://linkedin.com/in/stephanienicoleguanzon', '+63 926 800 4010', NULL, true, '2026-10-06 07:55:42', '2026-10-06 07:55:42');


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.migrations (id, migration, batch) VALUES (1, '0001_01_01_000000_create_users_table', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (2, '0001_01_01_000001_create_cache_table', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (3, '0001_01_01_000002_create_jobs_table', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (4, '2026_04_19_000010_add_role_fields_to_users_and_create_profiles', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (5, '2026_04_19_000020_create_student_data_tables', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (6, '2026_04_19_000030_create_portfolio_detail_tables', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (7, '2026_04_19_142959_create_personal_access_tokens_table', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (8, '2026_04_20_000010_create_ojt_postings_tables', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (9, '2026_04_20_100000_create_company_dashboard_tables', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (10, '2026_04_21_000001_add_coordinates_to_ojt_postings', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (11, '2026_04_26_000001_add_learning_outcomes_to_ojt_postings', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (12, '2026_04_26_000002_add_checkin_checkout_fields_to_time_logs', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (13, '2026_04_28_000001_expand_company_profiles_table', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (14, '2026_04_28_000001_fix_employment_type_column', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (15, '2026_04_28_000002_create_jobseeker_profiles_table', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (16, '2026_04_29_000001_add_extra_fields_to_interviews_table', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (17, '2026_04_29_000002_fix_job_applications_status_constraint', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (18, '2026_04_29_000010_add_offer_fields_to_job_applications', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (19, '2026_05_02_000001_add_moa_fields_to_company_profiles', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (20, '2026_05_04_000001_add_extra_fields_to_company_profiles', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (21, '2026_05_04_155636_fix_job_applications_add_hired_status', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (22, '2026_05_05_000001_create_graduate_profiles_table', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (23, '2026_05_05_000002_add_section_batch_to_student_profiles', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (24, '2026_05_05_000003_add_location_and_it_related_to_student_experiences', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (25, '2026_05_16_000001_expand_ojt_interest_flow', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (26, '2026_05_16_000002_drop_ojt_status_check_constraint', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (27, '2026_05_17_000001_create_app_notifications_table', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (28, '2026_08_28_000001_add_pipeline_fields_to_ojt_interests', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (29, '2026_09_03_092423_add_endorsement_requested_at_to_ojt_interests', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (30, '2026_09_06_063043_add_ojt_instructions_to_interests', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (31, '2026_09_06_063044_add_company_instructions_to_ojt_records', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (32, '2026_09_13_000002_create_chat_messages_table', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (33, '2026_09_16_000001_add_experience_level_to_job_listings_table', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (34, '2026_09_16_000002_add_documents_and_qualifications_to_ojt_postings', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (35, '2026_09_17_000001_normalize_all_student_and_graduate_courses', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (36, '2026_09_17_000002_add_course_to_supervisor_profiles_table', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (37, '2026_09_17_145430_normalize_student_sections', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (38, '2026_09_18_000001_enhance_projects_and_achievements_credibility', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (39, '2026_09_21_000001_add_schedule_fields_to_ojt_interests_and_records', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (40, '2026_09_21_000002_add_morning_afternoon_sessions_to_time_logs', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (41, '2026_09_21_000003_change_completed_hours_to_decimal_in_ojt_records', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (42, '2026_09_21_000004_add_registration_source_and_moa_request_to_company_profiles', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (43, '2026_09_26_140000_add_requirements_drive_url_to_student_profiles', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (44, '2026_09_28_000001_create_ojt_evaluations_tables', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (45, '2026_10_02_171804_create_student_ojt_requirements_table', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (46, '2026_10_06_000001_create_peo_tables', 2);
INSERT INTO public.migrations (id, migration, batch) VALUES (47, '2026_10_09_000001_create_ojt_emergency_requests_table', 3);
INSERT INTO public.migrations (id, migration, batch) VALUES (48, '2026_10_12_000001_add_phone_to_supervisor_profiles_table', 4);
INSERT INTO public.migrations (id, migration, batch) VALUES (49, '2026_10_14_000001_create_ojt_pull_out_requests_table', 5);
INSERT INTO public.migrations (id, migration, batch) VALUES (50, '2026_10_14_000002_add_term_and_waiver_to_evaluations_tables', 6);
INSERT INTO public.migrations (id, migration, batch) VALUES (51, '2026_10_21_000001_add_auto_afternoon_timeout_to_time_logs', 7);
INSERT INTO public.migrations (id, migration, batch) VALUES (52, '2026_10_21_092442_add_must_change_password_to_users_table', 8);


--
-- Data for Name: ojt_emergency_requests; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.ojt_emergency_requests (id, student_user_id, ojt_record_id, ojt_interest_id, type, category, reason, supporting_document_path, supporting_document_name, start_date, expected_return_date, actual_return_date, hours_rendered_snapshot, required_hours_snapshot, coordinator_status, coordinator_remarks, coordinator_action_by, coordinator_action_at, credited_hours, academic_verdict, company_status, company_clearance_notes, company_cleared_at, assets_returned, fit_to_work_document_path, cleared_to_resume_at, created_at, updated_at) VALUES (1, 12, 4, 6, 'permanent_withdrawal', 'other', 'Family Emergency', 'ojt_emergencies/XulqZcMYxqUfAyFKWq3bC2iaNcZmq497Got6xYfO.pdf', 'lk.pdf', '2026-10-08', NULL, NULL, 0.00, 600.00, 'approved', NULL, 5, '2026-10-11 14:17:02', 0.00, 'incomplete_inc', 'cleared', NULL, '2026-10-11 14:21:37', false, NULL, NULL, '2026-10-09 02:21:19', '2026-10-11 14:21:37');
INSERT INTO public.ojt_emergency_requests (id, student_user_id, ojt_record_id, ojt_interest_id, type, category, reason, supporting_document_path, supporting_document_name, start_date, expected_return_date, actual_return_date, hours_rendered_snapshot, required_hours_snapshot, coordinator_status, coordinator_remarks, coordinator_action_by, coordinator_action_at, credited_hours, academic_verdict, company_status, company_clearance_notes, company_cleared_at, assets_returned, fit_to_work_document_path, cleared_to_resume_at, created_at, updated_at) VALUES (2, 18, 20, 26, 'temporary_leave', 'other', 'dasdasdasdaadsdasda', 'ojt_emergencies/lrrPJXDyHsfEhV3M2xY1n2ffvm3nmPN8jOVEE1Pr.png', '3332.png', '2026-10-15', '2026-10-17', '2026-10-15', 0.00, 600.00, 'approved', 'Fit to work clearance accepted. Trainee resumed OJT training.', 57, '2026-10-15 21:00:46', NULL, 'incomplete_inc', 'notified', NULL, NULL, false, 'ojt_emergencies/fit_to_work/T9PGzPGhGK7NnsRwegydjb14d9W1kJr4jXDDawrv.png', '2026-10-15 21:00:46', '2026-10-15 20:37:14', '2026-10-15 21:00:46');


--
-- Data for Name: ojt_postings; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.ojt_postings (id, company_user_id, title, company_name, company_initial, company_color, department, industry, location, description, required_skills, preferred_courses, slots_total, slots_remaining, duration, schedule_type, status, expires_at, created_at, updated_at, branch_name, latitude, longitude, learning_outcomes, required_documents, qualifications) VALUES (1, 6, 'IT Support Intern', 'PGLang', 'P', '#06B6D4', 'IT Department', NULL, 'Unit 4, TechPark Building, Lacson St., Bacolod City, Negros Occidental', NULL, '["HTML","CSS","JavaScript","PHP"]', '["Bachelor of Science in Information Technology"]', 2, 1, '5 months (600 hours)', 'full_day', 'open', NULL, '2026-10-05 16:15:57', '2026-10-05 16:53:27', NULL, NULL, NULL, NULL, '["OJT Endorsement Letter from School \/ CIER","Parent \/ Guardian Consent & Waiver Form"]', '["Currently enrolled in 3rd or 4th Year","Willing to render 486 - 600 required hours"]');
INSERT INTO public.ojt_postings (id, company_user_id, title, company_name, company_initial, company_color, department, industry, location, description, required_skills, preferred_courses, slots_total, slots_remaining, duration, schedule_type, status, expires_at, created_at, updated_at, branch_name, latitude, longitude, learning_outcomes, required_documents, qualifications) VALUES (5, 6, 'Mobile App Development Intern', 'PGLang', 'PG', '#8B5CF6', 'Software Engineering', 'Software Development', 'Bacolod City', 'PGLang is seeking a passionate Mobile App Development Intern to join our engineering team. You will assist in developing cross-platform mobile applications using React Native and Flutter, contributing to real products used by thousands of users.', '["JavaScript","React Native","REST APIs","Git","Problem Solving"]', '["Bachelor of Science in Information Technology","Bachelor of Science in Computer Science"]', 2, 2, '5 months (600 hours)', 'full_day', 'open', '2027-01-05 17:17:09', '2026-10-05 17:17:09', '2026-10-05 17:17:09', NULL, NULL, NULL, 'Interns will gain experience in:
1. Mobile app development with React Native / Flutter
2. State management and API integration
3. App deployment to Google Play and Apple App Store
4. Code review and version control best practices
5. UI/UX principles for mobile platforms', '["Resume\/CV","Endorsement Letter","Medical Certificate"]', '["BSIT, BSCS, or related course","Basic JavaScript knowledge","Enthusiastic and eager to learn"]');
INSERT INTO public.ojt_postings (id, company_user_id, title, company_name, company_initial, company_color, department, industry, location, description, required_skills, preferred_courses, slots_total, slots_remaining, duration, schedule_type, status, expires_at, created_at, updated_at, branch_name, latitude, longitude, learning_outcomes, required_documents, qualifications) VALUES (6, 6, 'Full Stack Web Developer Intern', 'PGLang', 'PG', '#4A6CF7', 'Engineering & Digital Innovation', 'Information Technology', 'Lacson St., Bacolod City, Negros Occidental', 'PGLang is looking for an enthusiastic Full Stack Web Developer Intern to assist in creating responsive web applications, backend APIs, and modern frontend interfaces using React and Laravel.', '["PHP","Laravel","React","JavaScript","MySQL","Git"]', '["Bachelor of Science in Information Technology","Bachelor of Science in Computer Science"]', 3, 3, '5 months (600 hours)', 'full_day', 'open', '2027-04-05 17:44:31', '2026-10-05 17:44:31', '2026-10-05 17:44:31', 'Bacolod Creative Technology Hub', 10.6800000, 122.9550000, '1. Build full-stack web applications with modern MVC architecture.
2. Develop secure RESTful APIs with database migrations.
3. Integrate responsive user interfaces with Tailwind CSS and React.
4. Participate in agile code reviews and team sprints.', '["Resume\/CV","Endorsement Letter","Medical Certificate","Parents Consent"]', '["BSIT or BSCS 3rd or 4th year student","Working knowledge of modern web stacks","Passion for clean code and UI"]');
INSERT INTO public.ojt_postings (id, company_user_id, title, company_name, company_initial, company_color, department, industry, location, description, required_skills, preferred_courses, slots_total, slots_remaining, duration, schedule_type, status, expires_at, created_at, updated_at, branch_name, latitude, longitude, learning_outcomes, required_documents, qualifications) VALUES (10, 11, 'Associate Software & Cloud Infrastructure Intern', 'Na Ah Company', 'NA', '#0F766E', 'Cloud Infrastructure & Software Systems', 'Information Technology & Cloud Services', '45 Rizal St., Bacolod City, Negros Occidental', 'Na Ah Company is actively recruiting dedicated student interns for our Systems & Cloud Engineering Division. Selected trainees will work on modern microservices, automated testing, cloud deployments, and scalable full-stack applications.', '["PHP","Laravel","React","JavaScript","PostgreSQL","Docker","Git"]', '["Bachelor of Science in Information Technology","Bachelor of Science in Computer Science"]', 4, 3, '5 months (600 hours)', 'full_day', 'open', '2027-04-06 03:19:43', '2026-10-06 03:19:43', '2026-10-12 14:43:41', 'Na Ah Bacolod Technology Innovation Hub', 10.6765000, 122.9509000, '1. Design and maintain resilient RESTful APIs using Laravel and PostgreSQL.
2. Implement responsive web user interfaces and automated quality assurance suites.
3. Configure continuous deployment pipelines and containerized Docker environments.
4. Apply professional agile development practices and collaborative version control.', '["Resume\/CV","Endorsement Letter","Medical Certificate","Parents Consent Waiver"]', '["BS Information Technology 4th year student","Solid grasp of web architecture and databases","Strong analytical and problem-solving skills"]');
INSERT INTO public.ojt_postings (id, company_user_id, title, company_name, company_initial, company_color, department, industry, location, description, required_skills, preferred_courses, slots_total, slots_remaining, duration, schedule_type, status, expires_at, created_at, updated_at, branch_name, latitude, longitude, learning_outcomes, required_documents, qualifications) VALUES (11, 11, 'Quality Assurance & Software Testing Intern', 'Na Ah Company', 'NA', '#10B981', 'Quality Assurance & Systems Engineering', 'Information Technology & Software Quality', '45 Rizal St., Bacolod City, Negros Occidental', 'Na Ah Company is seeking a proactive Quality Assurance & Software Testing Intern to join our engineering division. You will design test plans, execute functional and regression tests, write API automation scripts in Postman/Cypress, and collaborate closely with developers to ensure enterprise-grade software releases.', '["Manual Testing","Postman","Cypress","SQL","Git","Test Case Design"]', '["Bachelor of Science in Information Technology","Bachelor of Science in Computer Science"]', 3, 3, '5 months (600 hours)', 'full_day', 'open', '2027-04-06 09:13:44', '2026-10-06 09:13:44', '2026-10-06 09:13:44', 'Na Ah Bacolod Tech Hub', 10.6765000, 122.9509000, '1. Author comprehensive test specifications, test matrices, and defect bug reports.
2. Perform automated API functional testing using Postman and Newman.
3. Execute automated end-to-end browser tests using Cypress and Selenium.
4. Participate in agile sprint ceremonies, bug triage meetings, and CI/CD quality gates.', '["Resume \/ Curriculum Vitae","Official Endorsement Letter from CHMSU CIER","Medical Examination Certificate (Fit to Work)","Notarized Parent \/ Guardian Consent Waiver"]', '["Enrolled in Bachelor of Science in Information Technology (3rd or 4th Year)","Strong analytical thinking, attention to detail, and problem-solving mindset","Willing to render 600 required internship hours"]');
INSERT INTO public.ojt_postings (id, company_user_id, title, company_name, company_initial, company_color, department, industry, location, description, required_skills, preferred_courses, slots_total, slots_remaining, duration, schedule_type, status, expires_at, created_at, updated_at, branch_name, latitude, longitude, learning_outcomes, required_documents, qualifications) VALUES (4, 11, 'Web Development Intern', 'Na Ah Company', 'NA', '#10B981', 'IT Department', 'Information Technology', '45 Rizal St., Bacolod City, Negros Occidental', 'Join our IT team as a Web Development Intern! You will be working on real-world projects using modern web technologies. You will collaborate with senior developers, assist in UI/UX design implementation, and gain hands-on experience in full-stack development.', '["HTML\/CSS","JavaScript","PHP","MySQL","Git"]', '["Bachelor of Science in Information Technology"]', 3, 3, '5 months (600 hours)', 'full_day', 'open', '2027-01-05 17:17:09', '2026-10-05 17:17:09', '2026-10-14 02:18:31', NULL, 10.6765000, 122.9509000, 'By the end of this internship, students will be able to:
1. Build and deploy responsive web applications
2. Work with RESTful APIs and database management
3. Apply agile development methodologies
4. Understand real-world SDLC processes
5. Collaborate effectively in a professional team environment', '["Resume\/CV","Endorsement Letter","Medical Certificate","PSA Birth Certificate"]', '["BSIT or related course","At least 2nd year standing","Basic knowledge of web technologies"]');
INSERT INTO public.ojt_postings (id, company_user_id, title, company_name, company_initial, company_color, department, industry, location, description, required_skills, preferred_courses, slots_total, slots_remaining, duration, schedule_type, status, expires_at, created_at, updated_at, branch_name, latitude, longitude, learning_outcomes, required_documents, qualifications) VALUES (14, 11, 'Enterprise Cloud & Full-Stack Systems Intern', 'Na Ah Company', 'NA', '#0F766E', 'Cloud Infrastructure & Enterprise Systems', 'Information Technology & Cloud Solutions', '45 Rizal St., Bacolod City, Negros Occidental', 'Na Ah Company is actively recruiting 3 ambitious student interns for our Systems Engineering Division. Selected trainees will gain immersive experience building high-throughput microservices, Docker container deployments, and responsive client architectures under senior engineering mentorship.', '["PHP","Laravel","React","JavaScript","PostgreSQL","Docker","Git"]', '["Bachelor of Science in Information Technology","Bachelor of Science in Computer Science"]', 3, 2, '5 months (600 hours)', 'full_day', 'open', '2027-04-14 02:34:03', '2026-10-14 02:34:03', '2026-10-17 00:32:49', 'Na Ah Bacolod Technology Innovation Hub', 10.6765000, 122.9509000, '1. Develop modular REST APIs with robust unit & integration testing.
2. Containerize applications using Docker and CI/CD pipelines.
3. Implement modern reactive frontend components.
4. Participate in daily agile stand-ups and sprint retrospectives.', '["Resume\/CV","Endorsement Letter","Medical Certificate","Parents Consent Waiver"]', '["BSIT 4th year student in good academic standing","Solid foundation in web technologies","Strong analytical mindset"]');
INSERT INTO public.ojt_postings (id, company_user_id, title, company_name, company_initial, company_color, department, industry, location, description, required_skills, preferred_courses, slots_total, slots_remaining, duration, schedule_type, status, expires_at, created_at, updated_at, branch_name, latitude, longitude, learning_outcomes, required_documents, qualifications) VALUES (15, 11, 'Enterprise Cloud & Full-Stack Systems Intern (Weekend Accelerated)', 'Na Ah Company', 'NA', '#0F766E', 'Cloud Infrastructure & Enterprise Systems', 'Information Technology & Cloud Solutions', '45 Rizal St., Bacolod City, Negros Occidental', 'Na Ah Company is actively recruiting 3 ambitious student interns for our Systems Engineering Division. Selected trainees will gain immersive experience building high-throughput microservices, Docker container deployments, and responsive client architectures under senior engineering mentorship. Flexible weekend operations supported.', '["PHP","Laravel","React","JavaScript","PostgreSQL","Docker","Git"]', '["Bachelor of Science in Information Technology","Bachelor of Science in Computer Science"]', 3, 0, '5 months (600 hours)', 'full_day', 'open', '2027-04-17 12:09:28', '2026-10-17 12:09:28', '2026-10-17 12:09:29', 'Na Ah Bacolod Technology Innovation Hub', 10.6765000, 122.9509000, '1. Develop modular REST APIs with robust unit & integration testing.
2. Containerize applications using Docker and CI/CD pipelines.
3. Implement modern reactive frontend components.
4. Participate in daily agile stand-ups and weekend deployment cycles.', '["Resume\/CV","Endorsement Letter","Medical Certificate","Parents Consent Waiver"]', '["BSIT 4th year student in good academic standing","Solid foundation in web technologies","Strong analytical mindset"]');


--
-- Data for Name: ojt_pull_out_requests; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.ojt_pull_out_requests (id, student_user_id, ojt_record_id, ojt_interest_id, reason_category, reason, student_letter_path, student_letter_name, hours_rendered_snapshot, required_hours_snapshot, status, supervisor_id, supervisor_remarks, supervisor_action_at, dean_name, dean_email, generated_letter_body, delivery_method, emailed_at, admin_action_by, admin_remarks, admin_action_at, dean_verdict, credited_hours, allow_redeployment, created_at, updated_at) VALUES (2, 58, 19, 25, 'breach_of_moa', 'asdawdawdawdasdwadwadwadwa', 'pull_out_letters/LHly2xWOWWmCKVSkMvJ1zdRn9odbnNxDjLhlIXFZ.png', 'erd_full_system_2x.png', 0.00, 600.00, 'rejected_by_supervisor', 57, 'dawdwadwadwadwadwadwa', '2026-10-14 02:37:30', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2026-10-14 02:36:27', '2026-10-14 02:37:30');
INSERT INTO public.ojt_pull_out_requests (id, student_user_id, ojt_record_id, ojt_interest_id, reason_category, reason, student_letter_path, student_letter_name, hours_rendered_snapshot, required_hours_snapshot, status, supervisor_id, supervisor_remarks, supervisor_action_at, dean_name, dean_email, generated_letter_body, delivery_method, emailed_at, admin_action_by, admin_remarks, admin_action_at, dean_verdict, credited_hours, allow_redeployment, created_at, updated_at) VALUES (3, 58, 19, 25, 'breach_of_moa', 'dawdwadwadwaasdasdasdasdsadasdas', 'pull_out_letters/0HhvVONWD6z75ww21ib6G2McjYFFdQhswmTC1yB7.png', 'erd_full_system_2x.png', 0.00, 600.00, 'rejected', 57, 'dawdwadwadwadawdaw', '2026-10-14 02:38:38', 'Dean of College', NULL, 'CARLOS HILADO MEMORIAL STATE UNIVERSITY
Office of the Program Chairperson & Placement Services

MEMORANDUM

DATE:       October 14, 2026
TO:         Dean of College, Dean
THROUGH:    Office of the OJT & Career Placement Coordinator
FROM:       Program Chairperson, Program Chairperson
SUBJECT:    ENDORSEMENT FOR OFFICIAL OJT PULL-OUT — Joshua Vance Rivera

Dear Dean Dean of College,

Respectfully submitting for your official approval the request for Pull-Out from On-the-Job Training (OJT) for the trainee detailed below:

  • Student Name:       Joshua Vance Rivera
  • Student ID Number:  2023-BSIT4B-015
  • Degree & Section:   Bachelor of Science in Information Technology (BSIT 4-B)
  • Host Establishment: Na Ah Company
  • Progress Snapshot:  0 of 600 Hours Rendered
  • Category:           Breach Of Moa

JUSTIFICATION & REASON FOR PULL-OUT:
"dawdwadwadwaasdasdasdasdsadasdas"

COORDINATOR''S RECOMMENDATION:
dawdwadwadwadawdaw
Endorsed by: IT Supervisor (OJT Coordinator)

RECOMMENDATION:
In light of the verified circumstances, we respectfully recommend your authorization to officially pull out the student from Na Ah Company and grant clearance for re-deployment to an alternative accredited host training establishment with crediting of rendered hours.

Respectfully endorsed,


___________________________________          ___________________________________
Program Chairperson                              IT Supervisor
Program Chairperson                          OJT Coordinator


CONFORME / APPROVED:

___________________________________
Dean of College
Dean', 'manual_print', NULL, 1, 'Dean declined pull-out request.', '2026-10-14 11:13:17', 'rejected', NULL, true, '2026-10-14 02:38:09', '2026-10-14 11:13:17');
INSERT INTO public.ojt_pull_out_requests (id, student_user_id, ojt_record_id, ojt_interest_id, reason_category, reason, student_letter_path, student_letter_name, hours_rendered_snapshot, required_hours_snapshot, status, supervisor_id, supervisor_remarks, supervisor_action_at, dean_name, dean_email, generated_letter_body, delivery_method, emailed_at, admin_action_by, admin_remarks, admin_action_at, dean_verdict, credited_hours, allow_redeployment, created_at, updated_at) VALUES (4, 58, 19, 25, 'breach_of_moa', 'dawdawdawdawadsadsadasd', 'pull_out_letters/rc7JRibQirYaA265U4EO1AbtQcu2RyMGF3uuM3RL.png', 'erd_full_system_2x.png', 0.00, 600.00, 'rejected', 57, 'asdfghjklasdfghjkasdfgh', '2026-10-14 11:27:52', 'Dean of College', 'dean.cit@chmsu.edu.ph', 'CARLOS HILADO MEMORIAL STATE UNIVERSITY
Office of the Program Chairperson & Placement Services

MEMORANDUM

DATE:       October 14, 2026
TO:         Dean of College, Dean
THROUGH:    Office of the OJT & Career Placement Coordinator
FROM:       Marites Manganti, Program Chairperson
SUBJECT:    ENDORSEMENT FOR OFFICIAL OJT PULL-OUT — Joshua Vance Rivera

Dear Dean Dean of College,

Respectfully submitting for your official approval the request for Pull-Out from On-the-Job Training (OJT) for the trainee detailed below:

  • Student Name:       Joshua Vance Rivera
  • Student ID Number:  2023-BSIT4B-015
  • Degree & Section:   Bachelor of Science in Information Technology (BSIT 4-B)
  • Host Establishment: Na Ah Company
  • Progress Snapshot:  0 of 600 Hours Rendered
  • Category:           Breach Of Moa

JUSTIFICATION & REASON FOR PULL-OUT:
"dawdawdawdawadsadsadasd"

COORDINATOR''S RECOMMENDATION:
asdfghjklasdfghjkasdfgh
Endorsed by: IT Supervisor (OJT Coordinator)

RECOMMENDATION:
In light of the verified circumstances, we respectfully recommend your authorization to officially pull out the student from Na Ah Company and grant clearance for re-deployment to an alternative accredited host training establishment with crediting of rendered hours.

Respectfully endorsed,


___________________________________          ___________________________________
Marites Manganti                              IT Supervisor
Program Chairperson                          OJT Coordinator


CONFORME / APPROVED:

___________________________________
Dean of College
Dean', 'email', '2026-10-14 11:28:58', 1, 'Dean declined pull-out request.', '2026-10-14 11:29:14', 'rejected', NULL, true, '2026-10-14 11:14:39', '2026-10-14 11:29:14');
INSERT INTO public.ojt_pull_out_requests (id, student_user_id, ojt_record_id, ojt_interest_id, reason_category, reason, student_letter_path, student_letter_name, hours_rendered_snapshot, required_hours_snapshot, status, supervisor_id, supervisor_remarks, supervisor_action_at, dean_name, dean_email, generated_letter_body, delivery_method, emailed_at, admin_action_by, admin_remarks, admin_action_at, dean_verdict, credited_hours, allow_redeployment, created_at, updated_at) VALUES (5, 58, 19, 25, 'breach_of_moa', 'dasdasdasdasdasdasdasd', 'pull_out_letters/PKglSl9zaF4YDVT9eajDwVj0VDgXo1U97ZJBLtsH.png', 'erd_full_system_2x.png', 0.00, 600.00, 'approved', 57, 'asdsadasdasdsadsadsadsadsadsa', '2026-10-14 11:34:05', NULL, NULL, 'CARLOS HILADO MEMORIAL STATE UNIVERSITY
Office of the Program Chairperson & Placement Services

MEMORANDUM

DATE:       October 14, 2026
TO:         Dean of College, Dean
THROUGH:    Office of the OJT & Career Placement Coordinator
FROM:       Program Chairperson, Program Chairperson
SUBJECT:    ENDORSEMENT FOR OFFICIAL OJT PULL-OUT — Joshua Vance Rivera

Dear Dean Dean of College,

Respectfully submitting for your official approval the request for Pull-Out from On-the-Job Training (OJT) for the trainee detailed below:

  • Student Name:       Joshua Vance Rivera
  • Student ID Number:  2023-BSIT4B-015
  • Degree & Section:   Bachelor of Science in Information Technology (BSIT 4-B)
  • Host Establishment: Na Ah Company
  • Progress Snapshot:  0 of 600 Hours Rendered
  • Category:           Breach Of Moa

JUSTIFICATION & REASON FOR PULL-OUT:
"dasdasdasdasdasdasdasd"

COORDINATOR''S RECOMMENDATION:
asdsadasdasdsadsadsadsadsadsa
Endorsed by: IT Supervisor (OJT Coordinator)

RECOMMENDATION:
In light of the verified circumstances, we respectfully recommend your authorization to officially pull out the student from Na Ah Company and grant clearance for re-deployment to an alternative accredited host training establishment with crediting of rendered hours.

Respectfully endorsed,


___________________________________          ___________________________________
Program Chairperson                              IT Supervisor
Program Chairperson                          OJT Coordinator


CONFORME / APPROVED:

___________________________________
Dean of College
Dean', NULL, NULL, 1, NULL, '2026-10-14 11:34:59', 'approved', 0.00, true, '2026-10-14 11:32:27', '2026-10-14 11:34:59');
INSERT INTO public.ojt_pull_out_requests (id, student_user_id, ojt_record_id, ojt_interest_id, reason_category, reason, student_letter_path, student_letter_name, hours_rendered_snapshot, required_hours_snapshot, status, supervisor_id, supervisor_remarks, supervisor_action_at, dean_name, dean_email, generated_letter_body, delivery_method, emailed_at, admin_action_by, admin_remarks, admin_action_at, dean_verdict, credited_hours, allow_redeployment, created_at, updated_at) VALUES (6, 22, 21, 27, 'breach_of_moa', 'TSJGHKAhskaHSKhkjhkD', 'pull_out_letters/qwl39ttl10Oe7fCFs8ZeWdM729j1dhXy0pf2JpeD.png', 'erd_full_system_2x.png', 0.00, 600.00, 'approved', 57, 'sadsadsadsadsadsadasdsadas', '2026-10-14 12:38:10', NULL, NULL, 'CARLOS HILADO MEMORIAL STATE UNIVERSITY
Office of the Program Chairperson & Placement Services

MEMORANDUM

DATE:       October 14, 2026
TO:         Dean of College, Dean
THROUGH:    Office of the OJT & Career Placement Coordinator
FROM:       Program Chairperson, Program Chairperson
SUBJECT:    ENDORSEMENT FOR OFFICIAL OJT PULL-OUT — Bea Bianca Castillo

Dear Dean Dean of College,

Respectfully submitting for your official approval the request for Pull-Out from On-the-Job Training (OJT) for the trainee detailed below:

  • Student Name:       Bea Bianca Castillo
  • Student ID Number:  2023-BSIT4B-008
  • Degree & Section:   Bachelor of Science in Information Technology (BSIT 4-B)
  • Host Establishment: Na Ah Company
  • Progress Snapshot:  0 of 600 Hours Rendered
  • Category:           Breach Of Moa

JUSTIFICATION & REASON FOR PULL-OUT:
"TSJGHKAhskaHSKhkjhkD"

COORDINATOR''S RECOMMENDATION:
sadsadsadsadsadsadasdsadas
Endorsed by: IT Supervisor (OJT Coordinator)

RECOMMENDATION:
In light of the verified circumstances, we respectfully recommend your authorization to officially pull out the student from Na Ah Company and grant clearance for re-deployment to an alternative accredited host training establishment with crediting of rendered hours.

Respectfully endorsed,


___________________________________          ___________________________________
Program Chairperson                              IT Supervisor
Program Chairperson                          OJT Coordinator


CONFORME / APPROVED:

___________________________________
Dean of College
Dean', NULL, NULL, 1, NULL, '2026-10-14 12:39:30', 'approved', 0.00, true, '2026-10-14 12:29:47', '2026-10-14 12:39:30');


--
-- Data for Name: ojt_records; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.ojt_records (id, user_id, company_name, supervisor_name, supervisor_email, location, start_date, end_date, required_hours, completed_hours, status, created_at, updated_at, company_instructions, schedule_days, shift_start, shift_end, lunch_start, lunch_end, has_lunch_break, daily_hours, weekly_hours, allow_overtime, max_overtime_hours, estimated_end_date) VALUES (1, 3, 'PGLang', 'PGLang', 'gimaranganvhan@gmail.com', 'Unit 4, TechPark Building, Lacson St., Bacolod City, Negros Occidental', '2026-10-11', '2027-01-22', 600, 0.00, 'pending', '2026-10-05 16:57:41', '2026-10-05 16:57:41', 'Dont be late', '["Mon","Tue","Wed","Thu","Fri"]', '08:00', '17:00', '12:00', '13:00', true, 8.00, 40.00, false, 0.00, '2027-01-22');
INSERT INTO public.ojt_records (id, user_id, company_name, supervisor_name, supervisor_email, location, start_date, end_date, required_hours, completed_hours, status, created_at, updated_at, company_instructions, schedule_days, shift_start, shift_end, lunch_start, lunch_end, has_lunch_break, daily_hours, weekly_hours, allow_overtime, max_overtime_hours, estimated_end_date) VALUES (20, 18, 'Na Ah Company', 'Na Ah Company', 'hr@naahcompany.com', '45 Rizal St., Bacolod City, Negros Occidental', '2026-10-14', '2027-03-14', 600, 0.00, 'active', '2026-10-14 02:34:03', '2026-10-15 21:00:46', 'Report to Na Ah Company Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp on October 14, 2026. Bring your CHMSU student ID and personal development laptop. Report to Ms. Karen dela Rosa at IT Reception.', '["Mon","Tue","Wed","Thu","Fri"]', '08:00', '17:00', '12:00', '13:00', true, 8.00, 40.00, false, 0.00, '2027-03-14');
INSERT INTO public.ojt_records (id, user_id, company_name, supervisor_name, supervisor_email, location, start_date, end_date, required_hours, completed_hours, status, created_at, updated_at, company_instructions, schedule_days, shift_start, shift_end, lunch_start, lunch_end, has_lunch_break, daily_hours, weekly_hours, allow_overtime, max_overtime_hours, estimated_end_date) VALUES (11, 13, 'Na Ah Company', 'Na Ah Company', 'hr@naahcompany.com', '45 Rizal St., Bacolod City, Negros Occidental', '2026-06-22', '2026-10-02', 600, 600.00, 'completed', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 'Report to Na Ah Company Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp on June 22, 2026. Bring your CHMSU student ID and personal developer laptop. Look for Ms. Karen at reception.', '["Mon","Tue","Wed","Thu","Fri"]', '08:00', '17:00', '12:00', '13:00', true, 8.00, 40.00, false, 0.00, '2026-10-02');
INSERT INTO public.ojt_records (id, user_id, company_name, supervisor_name, supervisor_email, location, start_date, end_date, required_hours, completed_hours, status, created_at, updated_at, company_instructions, schedule_days, shift_start, shift_end, lunch_start, lunch_end, has_lunch_break, daily_hours, weekly_hours, allow_overtime, max_overtime_hours, estimated_end_date) VALUES (12, 14, 'Na Ah Company', 'Na Ah Company', 'hr@naahcompany.com', '45 Rizal St., Bacolod City, Negros Occidental', '2026-06-22', '2026-10-02', 600, 600.00, 'completed', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 'Report to Na Ah Company Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp on June 22, 2026. Bring your CHMSU student ID and personal developer laptop. Look for Ms. Karen at reception.', '["Mon","Tue","Wed","Thu","Fri"]', '08:00', '17:00', '12:00', '13:00', true, 8.00, 40.00, false, 0.00, '2026-10-02');
INSERT INTO public.ojt_records (id, user_id, company_name, supervisor_name, supervisor_email, location, start_date, end_date, required_hours, completed_hours, status, created_at, updated_at, company_instructions, schedule_days, shift_start, shift_end, lunch_start, lunch_end, has_lunch_break, daily_hours, weekly_hours, allow_overtime, max_overtime_hours, estimated_end_date) VALUES (4, 12, 'Na Ah Company', 'Na Ah Company', 'hr@naahcompany.com', '45 Rizal St., Bacolod City, Negros Occidental', '2026-10-06', '2027-02-05', 600, 0.00, 'withdrawn_emergency', '2026-10-05 17:45:08', '2026-10-11 14:17:02', 'Welcome to Na Ah Company! Report to Na Ah Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp. Bring your CHMSU student ID and laptop. Look for Ms. Karen at reception.', '["Mon","Tue","Wed","Thu","Fri"]', '08:00', '17:00', '12:00', '13:00', true, 8.00, 40.00, false, 0.00, '2027-02-05');
INSERT INTO public.ojt_records (id, user_id, company_name, supervisor_name, supervisor_email, location, start_date, end_date, required_hours, completed_hours, status, created_at, updated_at, company_instructions, schedule_days, shift_start, shift_end, lunch_start, lunch_end, has_lunch_break, daily_hours, weekly_hours, allow_overtime, max_overtime_hours, estimated_end_date) VALUES (19, 58, 'Na Ah Company', 'Na Ah Company', 'hr@naahcompany.com', '45 Rizal St., Bacolod City, Negros Occidental', '2026-10-14', '2027-03-14', 600, 0.00, 'pulled_out', '2026-10-14 02:34:03', '2026-10-14 11:34:59', 'Report to Na Ah Company Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp on October 14, 2026. Bring your CHMSU student ID and personal development laptop. Report to Ms. Karen dela Rosa at IT Reception.', '["Mon","Tue","Wed","Thu","Fri"]', '08:00', '17:00', '12:00', '13:00', true, 8.00, 40.00, false, 0.00, '2027-03-14');
INSERT INTO public.ojt_records (id, user_id, company_name, supervisor_name, supervisor_email, location, start_date, end_date, required_hours, completed_hours, status, created_at, updated_at, company_instructions, schedule_days, shift_start, shift_end, lunch_start, lunch_end, has_lunch_break, daily_hours, weekly_hours, allow_overtime, max_overtime_hours, estimated_end_date) VALUES (21, 22, 'Na Ah Company', 'Na Ah Company', 'hr@naahcompany.com', '45 Rizal St., Bacolod City, Negros Occidental', '2026-10-14', '2027-03-14', 600, 0.00, 'pulled_out', '2026-10-14 02:34:03', '2026-10-14 12:39:30', 'Report to Na Ah Company Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp on October 14, 2026. Bring your CHMSU student ID and personal development laptop. Report to Ms. Karen dela Rosa at IT Reception.', '["Mon","Tue","Wed","Thu","Fri"]', '08:00', '17:00', '12:00', '13:00', true, 8.00, 40.00, false, 0.00, '2027-03-14');
INSERT INTO public.ojt_records (id, user_id, company_name, supervisor_name, supervisor_email, location, start_date, end_date, required_hours, completed_hours, status, created_at, updated_at, company_instructions, schedule_days, shift_start, shift_end, lunch_start, lunch_end, has_lunch_break, daily_hours, weekly_hours, allow_overtime, max_overtime_hours, estimated_end_date) VALUES (24, 21, 'Na Ah Company', 'Na Ah Company', 'hr@naahcompany.com', '45 Rizal St., Bacolod City, Negros Occidental', '2026-10-17', '2027-03-17', 600, 5.22, 'active', '2026-10-17 12:09:29', '2026-10-21 20:54:23', 'Welcome to Na Ah Company! Report to Na Ah Company Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp on Saturday, October 17, 2026. Weekend operations enabled. Bring your CHMSU student ID and personal developer laptop.', '["Sat","Sun","Mon","Tue","Wed","Thu","Fri"]', '08:00', '17:00', '13:00', '14:00', true, 8.00, 40.00, false, 0.00, '2027-03-17');
INSERT INTO public.ojt_records (id, user_id, company_name, supervisor_name, supervisor_email, location, start_date, end_date, required_hours, completed_hours, status, created_at, updated_at, company_instructions, schedule_days, shift_start, shift_end, lunch_start, lunch_end, has_lunch_break, daily_hours, weekly_hours, allow_overtime, max_overtime_hours, estimated_end_date) VALUES (23, 20, 'Na Ah Company', 'Na Ah Company', 'hr@naahcompany.com', '45 Rizal St., Bacolod City, Negros Occidental', '2026-10-17', '2027-03-17', 600, 0.00, 'active', '2026-10-17 12:09:29', '2026-10-17 12:09:29', 'Welcome to Na Ah Company! Report to Na Ah Company Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp on Saturday, October 17, 2026. Weekend operations enabled. Bring your CHMSU student ID and personal developer laptop.', '["Sat","Sun","Mon","Tue","Wed","Thu","Fri"]', '08:00', '17:00', '13:00', '14:00', true, 8.00, 40.00, false, 0.00, '2027-03-17');
INSERT INTO public.ojt_records (id, user_id, company_name, supervisor_name, supervisor_email, location, start_date, end_date, required_hours, completed_hours, status, created_at, updated_at, company_instructions, schedule_days, shift_start, shift_end, lunch_start, lunch_end, has_lunch_break, daily_hours, weekly_hours, allow_overtime, max_overtime_hours, estimated_end_date) VALUES (22, 59, 'Na Ah Company', 'Na Ah Company', 'hr@naahcompany.com', '45 Rizal St., Bacolod City, Negros Occidental', '2026-10-17', '2027-03-17', 600, 5.02, 'active', '2026-10-17 12:09:29', '2026-10-21 20:54:23', 'Welcome to Na Ah Company! Report to Na Ah Company Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp on Saturday, October 17, 2026. Weekend operations enabled. Bring your CHMSU student ID and personal developer laptop.', '["Sat","Sun","Mon","Tue","Wed","Thu","Fri"]', '08:00', '17:00', '13:00', '14:00', true, 8.00, 40.00, false, 0.00, '2027-03-17');


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.password_reset_tokens (email, token, created_at) VALUES ('ctrlmyre@gmail.com', '$2y$12$v0K6IUx0e/kGj7OQKN32mupmrzNPMJktCw89pMo0UB6zgnvC7NP52', '2026-10-17 15:38:54');


--
-- Data for Name: peo_definitions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.peo_definitions (id, program, code, title, description, target_benchmark, indicators, sort_order, created_at, updated_at) VALUES (1, 'Bachelor of Science in Information Technology', 'PEO 1', 'Employment Alignment', 'Graduates obtain professional employment that aligns directly with their computing degree objectives and technical education.', 70.00, '["Practicing in IT software, systems architecture, infrastructure, or data engineering roles","Demonstrates professional application of computing principles in enterprise environments","Curriculum-to-industry occupational alignment verification"]', 1, '2026-10-06 07:54:56', '2026-10-06 08:17:56');
INSERT INTO public.peo_definitions (id, program, code, title, description, target_benchmark, indicators, sort_order, created_at, updated_at) VALUES (2, 'Bachelor of Science in Information Technology', 'PEO 2', 'Career Progression', 'Alumni achieve leadership roles, advance to senior technical positions, launch technology businesses, or pass industry certifications and board exams within 3–5 years of graduating.', 70.00, '["Promotion to senior, lead, supervisory, management, or systems architect roles","Establishment of freelance consulting practices, digital agencies, or tech startups","Earning recognized vendor\/board certifications (AWS, Cisco, DICT, Civil Service) or postgraduate degrees"]', 2, '2026-10-06 07:54:56', '2026-10-06 08:17:56');
INSERT INTO public.peo_definitions (id, program, code, title, description, target_benchmark, indicators, sort_order, created_at, updated_at) VALUES (3, 'Bachelor of Science in Information Technology', 'PEO 3', 'Skill Relevancy', 'The academic program effectively prepares graduates for actual industry requirements, closing technological gaps and meeting employer competency standards.', 70.00, '["Demonstrated proficiency in high-demand industry tech stacks and frameworks","High percentage match against active employer job requirements and vacancies","Adaptability to emergent frameworks, cloud platforms, and engineering methodologies"]', 3, '2026-10-06 07:54:56', '2026-10-06 08:17:56');
INSERT INTO public.peo_definitions (id, program, code, title, description, target_benchmark, indicators, sort_order, created_at, updated_at) VALUES (5, 'Bachelor of Science in Computer Science', 'PEO 1', 'Employment Alignment', 'Graduates obtain professional employment that aligns directly with their computing degree objectives and technical education.', 70.00, '["Practicing in IT software, systems architecture, infrastructure, or data engineering roles","Demonstrates professional application of computing principles in enterprise environments","Curriculum-to-industry occupational alignment verification"]', 1, '2026-10-06 07:54:56', '2026-10-06 08:17:56');
INSERT INTO public.peo_definitions (id, program, code, title, description, target_benchmark, indicators, sort_order, created_at, updated_at) VALUES (6, 'Bachelor of Science in Computer Science', 'PEO 2', 'Career Progression', 'Alumni achieve leadership roles, advance to senior technical positions, launch technology businesses, or pass industry certifications and board exams within 3–5 years of graduating.', 70.00, '["Promotion to senior, lead, supervisory, management, or systems architect roles","Establishment of freelance consulting practices, digital agencies, or tech startups","Earning recognized vendor\/board certifications (AWS, Cisco, DICT, Civil Service) or postgraduate degrees"]', 2, '2026-10-06 07:54:56', '2026-10-06 08:17:56');
INSERT INTO public.peo_definitions (id, program, code, title, description, target_benchmark, indicators, sort_order, created_at, updated_at) VALUES (7, 'Bachelor of Science in Computer Science', 'PEO 3', 'Skill Relevancy', 'The academic program effectively prepares graduates for actual industry requirements, closing technological gaps and meeting employer competency standards.', 70.00, '["Demonstrated proficiency in high-demand industry tech stacks and frameworks","High percentage match against active employer job requirements and vacancies","Adaptability to emergent frameworks, cloud platforms, and engineering methodologies"]', 3, '2026-10-06 07:54:56', '2026-10-06 08:17:56');


--
-- Data for Name: personal_access_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) VALUES (2, 'App\Models\User', 2, 'auth_token', '66104a42eb2de9b3b3f23de28c3c8721134f4ac837a04748402eb1f7a7be796a', '["*"]', '2026-10-05 16:55:27', NULL, '2026-10-05 15:43:43', '2026-10-05 16:55:27');
INSERT INTO public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) VALUES (71, 'App\Models\User', 62, 'auth_token', '903d50ce6c7fc35f811409965849748264933f67b6a664258a4f8309cf56a957', '["*"]', NULL, NULL, '2026-10-21 09:31:51', '2026-10-21 09:31:51');
INSERT INTO public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) VALUES (56, 'App\Models\User', 11, 'auth_token', 'da8d6d22e7e5ad0e207463315662b7baa6884ef33a7fddf28cae24c872903a6a', '["*"]', '2026-10-21 11:57:17', NULL, '2026-10-17 14:00:23', '2026-10-21 11:57:17');
INSERT INTO public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) VALUES (78, 'App\Models\User', 59, 'auth_token', '67d265ca4fc90a40aeae395979ecc92a2608ede6d147003c4db55f33aed22378', '["*"]', '2026-10-21 11:57:18', NULL, '2026-10-21 11:44:00', '2026-10-21 11:57:18');
INSERT INTO public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) VALUES (67, 'App\Models\User', 1, 'admin_token', '1dc47da53bba8076317f054070f8e408beb1926bee09ddadd5d82302bce8cbff', '["*"]', '2026-10-21 11:57:19', NULL, '2026-10-21 09:05:47', '2026-10-21 11:57:19');
INSERT INTO public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) VALUES (72, 'App\Models\User', 55, 'auth_token', 'deb4a8e037fd1ac542fad06ee0ab738878c4c239960b8c97718cd6c5c9f0a427', '["*"]', '2026-10-21 11:34:42', NULL, '2026-10-21 09:36:28', '2026-10-21 11:34:42');
INSERT INTO public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) VALUES (30, 'App\Models\User', 6, 'auth_token', 'acd851ab649f34b84bdfd6b5d21cb37278fdedf1b40dd17d21116e8d9b6b8864', '["*"]', '2026-10-12 01:08:34', NULL, '2026-10-11 21:28:13', '2026-10-12 01:08:34');
INSERT INTO public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) VALUES (25, 'App\Models\User', 23, 'auth_token', 'b31237b5a09df14687fc12dcfae787989594d8d46ae12e560f1273fd8cf50e2a', '["*"]', '2026-10-09 01:44:09', NULL, '2026-10-08 18:57:12', '2026-10-09 01:44:09');
INSERT INTO public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) VALUES (57, 'App\Models\User', 60, 'auth_token', '7f8afe208b4b4d9abc40af51c7147efe76732ccbe4b3fe863df01b719250ca1b', '["*"]', '2026-10-21 11:57:25', NULL, '2026-10-17 14:03:49', '2026-10-21 11:57:25');
INSERT INTO public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) VALUES (29, 'App\Models\User', 12, 'auth_token', 'f4c49ab21a7af842e3d12ccaa2d7b2e0f80ad34ce7653ffd879230f65a5379c6', '["*"]', '2026-10-12 12:56:51', NULL, '2026-10-11 14:18:25', '2026-10-12 12:56:51');
INSERT INTO public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) VALUES (74, 'App\Models\User', 67, 'auth_token', '5bdac994e5de9b566326c81ef0a69ae3c84a2cf575277f9f1259ff8cad57e07a', '["*"]', NULL, NULL, '2026-10-21 09:58:36', '2026-10-21 09:58:36');
INSERT INTO public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) VALUES (21, 'App\Models\User', 56, 'auth_token', '5e5ab451c62f1ab4346287ee7793b43485a32dbc8391478965eb7752692dda25', '["*"]', '2026-10-07 11:28:25', NULL, '2026-10-07 11:18:26', '2026-10-07 11:28:25');
INSERT INTO public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) VALUES (75, 'App\Models\User', 68, 'auth_token', '17103cc94ad6b49faacefeb088dcfb4fe508ffd03ee72250f1c879f3fbc73233', '["*"]', NULL, NULL, '2026-10-21 09:58:56', '2026-10-21 09:58:56');


--
-- Data for Name: portfolio_projects; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (1, 15, 'AgriTrace: Smart Farm Logistics Portal', 'Web portal connecting local Negros agricultural producers directly to distributors with real-time route optimization.', '["Laravel","PostgreSQL","Tailwind CSS","Leaflet.js"]', 'https://agritrace-chmsu.ph', 'https://github.com/christiandave-ramos/agritrace', 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=600&h=350&fit=crop', true, 0, '2026-10-06 07:55:37', '2026-10-06 07:55:37', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (2, 15, 'QuickBite Food Ordering Application', 'Cross-platform mobile ordering app with kitchen real-time dispatch dashboard.', '["Flutter","Firebase","Dart"]', NULL, 'https://github.com/christiandave-ramos/quickbite-mobile', 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=600&h=350&fit=crop', false, 1, '2026-10-06 07:55:37', '2026-10-06 07:55:37', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (3, 16, 'Nexus Design System UI Kit', 'Accessible, component-driven design system with Figma token synchronizer and React UI library.', '["React","TypeScript","Tailwind CSS","Storybook"]', 'https://nexus-ui.kylamendoza.design', 'https://github.com/kylamendoza-dev/nexus-ui', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&h=350&fit=crop', true, 0, '2026-10-06 07:55:38', '2026-10-06 07:55:38', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (4, 17, 'Sentinel: Real-time Server Health Monitor', 'Lightweight daemon and dashboard monitoring server CPU, RAM, and database disk IO with Discord webhook notifications.', '["Python","FastAPI","Docker","SQLite"]', NULL, 'https://github.com/jhonmark-delacruz/sentinel-monitor', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=350&fit=crop', true, 0, '2026-10-06 07:55:38', '2026-10-06 07:55:38', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (5, 18, 'Automated Regression Suite for E-Commerce', 'End-to-end Cypress test suite covering checkout, cart management, and payment gateway simulation.', '["Cypress","JavaScript","Node.js"]', NULL, 'https://github.com/altheajoy-villanueva/e2e-test-suite', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=350&fit=crop', true, 0, '2026-10-06 07:55:38', '2026-10-06 07:55:38', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (6, 19, 'Automated Multi-Stage CI/CD Deployment Pipeline', 'GitHub Actions pipeline running linters, automated tests, and triggering zero-downtime SSH Docker deployments.', '["GitHub Actions","Docker","Bash","Nginx"]', NULL, 'https://github.com/marktan-devops/cicd-pipeline-boilerplate', 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&h=350&fit=crop', true, 0, '2026-10-06 07:55:38', '2026-10-06 07:55:38', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (7, 20, 'Negros Occidental Tourism Insights Dashboard', 'Interactive visual analytics tracking tourist arrivals, accommodation metrics, and seasonal revenue streams.', '["Python","Streamlit","Pandas","Plotly"]', 'https://negros-tourism.streamlit.app', 'https://github.com/princess-reyes-data/tourism-analytics', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=350&fit=crop', true, 0, '2026-10-06 07:55:39', '2026-10-06 07:55:39', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (8, 21, 'CarePulse: Barangay Health Record App', 'Cross-platform app offering offline patient record intake with background cloud synchronization when connected.', '["Flutter","Dart","Firebase","SQLite"]', NULL, 'https://github.com/jp-bautista-mobile/carepulse-app', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=350&fit=crop', true, 0, '2026-10-06 07:55:39', '2026-10-06 07:55:39', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (9, 22, 'Silay Heritage Virtual Tour Web Guide', 'Tourism and historical landmark guide featuring responsive photo galleries and interactive maps.', '["HTML5","Tailwind CSS","JavaScript","Leaflet.js"]', 'https://silayheritage.beacastillo.design', 'https://github.com/beabianca-castillo/silay-heritage-guide', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=350&fit=crop', true, 0, '2026-10-06 07:55:39', '2026-10-06 07:55:39', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (10, 23, 'LockDown: Automated Web Vulnerability Scanner', 'Python script identifying unencrypted HTTP transmission, missing CORS policies, and outdated SSL certificates.', '["Python","Bash","Docker"]', NULL, 'https://github.com/kevinaguilar-sec/lockdown-scanner', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=350&fit=crop', true, 0, '2026-10-06 07:55:39', '2026-10-06 07:55:39', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (11, 24, 'EquiLedger: Cooperative Loan & Savings ERP', 'Comprehensive multi-branch ledger system managing member deposits, loan amortization schedules, and dividend shares.', '["Java","Spring Boot","MySQL","Thymeleaf","Bootstrap 5"]', NULL, 'https://github.com/trishamorales-dev/equiledger-erp', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=350&fit=crop', true, 0, '2026-10-06 07:55:40', '2026-10-06 07:55:40', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (12, 25, 'CloudScale: Kubernetes Autoscaler Controller', 'Custom Kubernetes metrics scraper and horizontal pod autoscaler optimizing compute costs across spot instances.', '["Go","Kubernetes","Docker","AWS"]', 'https://cloudscale.markalcantara.com', 'https://github.com/markalcantara-tech/cloudscale', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=350&fit=crop', true, 0, '2026-10-06 07:55:40', '2026-10-06 07:55:40', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (13, 26, 'PulsePay: Digital Wallet Mobile System', 'End-to-end user experience overhaul for modern micro-savings and contactless payments.', '["Figma","React Native","Design System"]', 'https://pulsepay.christinesalgado.design', NULL, 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&h=350&fit=crop', true, 0, '2026-10-06 07:55:40', '2026-10-06 07:55:40', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (14, 27, 'Terraform AWS EKS Multi-Region Blueprint', 'Open-source infrastructure-as-code repository provisioned for production clusters with GitOps ArgoCD.', '["Terraform","AWS","Kubernetes","ArgoCD"]', NULL, 'https://github.com/neilcordova-sre/eks-blueprint', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=350&fit=crop', true, 0, '2026-10-06 07:55:40', '2026-10-06 07:55:40', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (15, 28, 'Enterprise Cross-Browser Playwright Framework', 'Modular test execution engine supporting parallel cloud browser runners with video reporting.', '["Playwright","TypeScript","Allure Reports","Docker"]', NULL, 'https://github.com/hannahmontinola-qa/playwright-enterprise-starter', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=350&fit=crop', true, 0, '2026-10-06 07:55:41', '2026-10-06 07:55:41', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (16, 29, 'DispatchPro: Driver Fleet Route Optimization App', 'Real-time GPS dispatch and turn-by-turn routing app used by 4,000 daily active delivery drivers.', '["React Native","TypeScript","Redux Toolkit","Mapbox"]', 'https://apps.apple.com/app/dispatchpro', NULL, 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=600&h=350&fit=crop', true, 0, '2026-10-06 07:55:41', '2026-10-06 07:55:41', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (17, 30, 'Enterprise Customer Lifetime Value (LTV) Prediction Pipeline', 'Automated regression modeling and dashboard predicting e-commerce churn and lifetime customer value.', '["Python","Snowflake","dbt","Tableau"]', NULL, 'https://github.com/rheagatuslao-data/ltv-prediction-pipeline', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=350&fit=crop', true, 0, '2026-10-06 07:55:41', '2026-10-06 07:55:41', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (18, 31, 'DocuSigner AI: Automated Contract Intelligence', 'Next.js SaaS application analyzing legal agreement risks and redlining clauses with OpenAI APIs.', '["Next.js","TypeScript","Tailwind CSS","OpenAI","Prisma"]', 'https://docusigner.adrianlacson.io', 'https://github.com/adrianlacson-dev/docusigner-saas', 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&h=350&fit=crop', true, 0, '2026-10-06 07:55:41', '2026-10-06 07:55:41', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (19, 32, 'Automated Ransomware Canary Detection System', 'File-integrity monitoring daemon identifying abnormal mass encryption routines and triggering host isolation.', '["Python","PowerShell","Splunk API"]', NULL, 'https://github.com/daphnearrieta-sec/ransomware-canary', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=350&fit=crop', true, 0, '2026-10-06 07:55:42', '2026-10-06 07:55:42', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (49, 48, 'HA Database Cluster Setup', 'Designed and documented a high-availability MySQL cluster with Galera replication for a fintech client handling 1M+ daily transactions.', '["MySQL","Galera Cluster","Linux","Keepalived"]', NULL, NULL, NULL, false, 1, '2026-10-06 08:14:55', '2026-10-06 08:14:55', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (20, 33, 'BizSync POS & Multi-Store Inventory Cloud', 'Real-time retail cloud software supporting barcode scanning, BIR sales audits, and automated stock reordering.', '["Laravel","Vue.js","PostgreSQL","Tailwind CSS"]', 'https://bizsync.ph', NULL, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=350&fit=crop', true, 0, '2026-10-06 07:55:42', '2026-10-06 07:55:42', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (21, 34, 'Enterprise Workflow Modernization Blueprint', 'Comprehensive requirements mapping document reducing redundant operational steps by 35% across customer support routing.', '["BPMN","Confluence","SQL","Lucidchart"]', NULL, NULL, 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=350&fit=crop', true, 0, '2026-10-06 07:55:42', '2026-10-06 07:55:42', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (22, 35, 'Fleet Tracker Web App', 'A real-time fleet management SaaS built with Laravel and Vue.js. Features live GPS tracking, driver management, and automated maintenance scheduling.', '["Laravel","Vue.js","MySQL","Google Maps API","Docker"]', NULL, NULL, NULL, true, 0, '2026-10-06 08:14:51', '2026-10-06 08:14:51', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (23, 35, 'E-Invoice System', 'An automated invoicing system with PDF generation, email delivery, and payment status tracking for SME clients.', '["PHP","Laravel","MySQL","dompdf"]', NULL, NULL, NULL, false, 1, '2026-10-06 08:14:51', '2026-10-06 08:14:51', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (24, 35, 'Portfolio CMS', 'A custom headless CMS for managing personal portfolio content with a REST API and Vue.js frontend.', '["Laravel","Vue.js","REST API","Tailwind CSS"]', NULL, NULL, NULL, false, 2, '2026-10-06 08:14:51', '2026-10-06 08:14:51', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (25, 36, 'HealthTrack Mobile UI', 'Complete mobile app UI/UX design for a personal health tracker. Includes onboarding flow, dashboard, and activity logging screens in Figma.', '["Figma","Prototyping","User Research"]', NULL, NULL, NULL, true, 0, '2026-10-06 08:14:52', '2026-10-06 08:14:52', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (26, 36, 'Fintech Dashboard Redesign', 'Redesigned the web dashboard of a fintech platform to improve usability. Increased task completion rate by 28% in usability testing.', '["Figma","React","Tailwind CSS"]', NULL, NULL, NULL, true, 1, '2026-10-06 08:14:52', '2026-10-06 08:14:52', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (27, 36, 'Design System – Luminary UI', 'Built a reusable component library and design system with 80+ components used across 4 product lines.', '["Figma","React","Storybook"]', NULL, NULL, NULL, false, 2, '2026-10-06 08:14:52', '2026-10-06 08:14:52', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (28, 37, 'Retail Sales Data Pipeline', 'End-to-end ETL pipeline ingesting POS data from 50+ store branches into a centralized data warehouse for analytics.', '["Python","Apache Airflow","AWS Glue","Redshift"]', NULL, NULL, NULL, true, 0, '2026-10-06 08:14:52', '2026-10-06 08:14:52', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (29, 37, 'Real-Time Fraud Detection Pipeline', 'Streaming data pipeline for detecting anomalous banking transactions using Kafka and Spark Structured Streaming.', '["Apache Spark","Kafka","Python","AWS"]', NULL, NULL, NULL, true, 1, '2026-10-06 08:14:52', '2026-10-06 08:14:52', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (30, 38, 'Artisanal Goods Shopify Store', 'Custom Shopify store for a local artisan brand featuring a bespoke liquid theme with product customization and upsell flows.', '["Shopify Liquid","CSS","JavaScript"]', NULL, NULL, NULL, true, 0, '2026-10-06 08:14:52', '2026-10-06 08:14:52', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (31, 38, 'Restaurant Booking Website', 'WordPress site with integrated OpenTable reservation widget, dynamic menu pages, and Google Reviews carousel.', '["WordPress","Elementor","PHP","MySQL"]', NULL, NULL, NULL, false, 1, '2026-10-06 08:14:52', '2026-10-06 08:14:52', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (32, 39, 'LogiTrack Mobile App', 'Cross-platform logistics tracking app with real-time GPS, driver performance monitoring, and delivery confirmation features. 10K+ downloads.', '["Flutter","Dart","Firebase","Google Maps API"]', NULL, NULL, NULL, true, 0, '2026-10-06 08:14:52', '2026-10-06 08:14:52', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (33, 39, 'WellnessPlus Health App', 'Mobile health app for step tracking, water intake logging, and guided meditation. Published on Google Play and App Store.', '["Flutter","Dart","Firebase","REST API"]', NULL, NULL, NULL, true, 1, '2026-10-06 08:14:52', '2026-10-06 08:14:52', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (34, 40, 'Recruitment Dashboard', 'Internal HR dashboard built to track applicant pipeline, interview schedules, and hiring metrics. Built using Google Sheets + AppScript.', '["Google Sheets","Apps Script","Airtable"]', NULL, NULL, NULL, true, 0, '2026-10-06 08:14:53', '2026-10-06 08:14:53', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (35, 41, 'Automated Deployment Pipeline', 'GitHub Actions CI/CD pipeline for deploying a microservices application on AWS ECS with blue-green deployment strategy.', '["AWS ECS","GitHub Actions","Docker","Terraform"]', NULL, NULL, NULL, true, 0, '2026-10-06 08:14:53', '2026-10-06 08:14:53', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (36, 41, 'Infrastructure as Code – PH Startup', 'Terraform modules for provisioning a complete AWS environment (VPC, RDS, ECS, CloudFront) for a Series A startup.', '["Terraform","AWS","Ansible"]', NULL, NULL, NULL, false, 1, '2026-10-06 08:14:53', '2026-10-06 08:14:53', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (37, 42, 'Filipino Sentiment Analysis Model', 'Fine-tuned mBERT model for sentiment classification of Filipino tweets. Achieved 87% accuracy on the test set.', '["Python","TensorFlow","HuggingFace Transformers","Jupyter"]', NULL, NULL, NULL, true, 0, '2026-10-06 08:14:53', '2026-10-06 08:14:53', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (38, 42, 'Handwritten Digit Classifier', 'CNN-based classifier trained on MNIST dataset with a Flask API for inference, deployed on Heroku.', '["Python","TensorFlow","Flask","Heroku"]', NULL, NULL, NULL, false, 1, '2026-10-06 08:14:53', '2026-10-06 08:14:53', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (39, 43, 'Web App Pentest Toolkit', 'A curated personal toolkit of Python scripts for automating common web application penetration testing tasks.', '["Python","Burp Suite","OWASP ZAP"]', NULL, NULL, NULL, true, 0, '2026-10-06 08:14:53', '2026-10-06 08:14:53', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (40, 43, 'CTF Write-ups Blog', 'Personal blog documenting solutions to Capture the Flag cybersecurity challenges from HackTheBox and TryHackMe.', '["Markdown","Jekyll","GitHub Pages"]', NULL, NULL, NULL, false, 1, '2026-10-06 08:14:53', '2026-10-06 08:14:53', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (41, 44, 'Government Digital Transformation BRD', 'Business Requirements Document and process maps for a national government agency digitization project covering 12 major processes.', '["MS Visio","Confluence","JIRA"]', NULL, NULL, NULL, true, 0, '2026-10-06 08:14:54', '2026-10-06 08:14:54', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (42, 45, 'Digital Payments API', 'REST API microservice for processing fund transfers and bill payments, integrated with GCash and Maya payment gateways.', '["Node.js","TypeScript","PostgreSQL","Kafka"]', NULL, NULL, NULL, true, 0, '2026-10-06 08:14:54', '2026-10-06 08:14:54', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (43, 45, 'Healthcare Patient API', 'HIPAA-compliant RESTful API for patient record management, appointment scheduling, and prescription tracking.', '["Node.js","Express.js","PostgreSQL","Jest"]', NULL, NULL, NULL, false, 1, '2026-10-06 08:14:54', '2026-10-06 08:14:54', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (44, 46, 'SEO Campaign – Local Restaurant Chain', 'Grew organic search traffic by 120% in 6 months for a 5-branch restaurant chain through on-page SEO, local citations, and content marketing.', '["Ahrefs","Google Search Console","WordPress"]', NULL, NULL, NULL, true, 0, '2026-10-06 08:14:54', '2026-10-06 08:14:54', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (45, 46, 'Facebook Ads Funnel – Beauty Brand', 'Built a full-funnel Facebook Ads campaign for a local beauty brand achieving 4.2x ROAS in 3 months.', '["Facebook Ads Manager","Canva","Google Analytics"]', NULL, NULL, NULL, false, 1, '2026-10-06 08:14:54', '2026-10-06 08:14:54', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (46, 47, 'Shadow Run – Mobile RPG', 'A 3D mobile action RPG in development, featuring roguelike dungeon exploration, shader-based visual effects, and online multiplayer.', '["Unity","C#","Photon SDK","Blender"]', NULL, NULL, NULL, true, 0, '2026-10-06 08:14:54', '2026-10-06 08:14:54', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (47, 47, 'Pixel Dungeon – Web Game', 'A browser-based 2D dungeon crawler released on itch.io with 3,000+ plays and 4.5-star rating.', '["Unity","C#","WebGL"]', NULL, NULL, NULL, false, 1, '2026-10-06 08:14:54', '2026-10-06 08:14:54', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (48, 48, 'Database Optimization Suite', 'A set of SQL scripts and automation tools for routine DBA tasks including index health checks, bloat analysis, and backup validation.', '["MySQL","PostgreSQL","Bash","Python"]', NULL, NULL, NULL, true, 0, '2026-10-06 08:14:55', '2026-10-06 08:14:55', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (50, 49, 'ERP Implementation Project Plan', 'End-to-end project plan and risk register for a 9-month SAP ERP implementation for a manufacturing company with 500 employees.', '["MS Project","JIRA","Confluence"]', NULL, NULL, NULL, true, 0, '2026-10-06 08:14:55', '2026-10-06 08:14:55', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (51, 50, 'E2E Test Framework – Cypress', 'Built a comprehensive Cypress end-to-end test framework for a digital payments web app with 300+ test scenarios and CI integration.', '["Cypress","JavaScript","GitHub Actions","Allure Reports"]', NULL, NULL, NULL, true, 0, '2026-10-06 08:14:55', '2026-10-06 08:14:55', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (52, 50, 'API Test Suite – Postman', 'Automated API regression test collection covering 150+ endpoints with environment-based configs and Newman CI integration.', '["Postman","Newman","JavaScript","Jenkins"]', NULL, NULL, NULL, false, 1, '2026-10-06 08:14:55', '2026-10-06 08:14:55', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (53, 51, 'AWS Landing Zone – Enterprise Client', 'Designed and implemented a multi-account AWS Landing Zone with SCPs, centralized logging, and network segmentation for a Fortune 500 subsidiary.', '["AWS Control Tower","Terraform","CloudFormation"]', NULL, NULL, NULL, true, 0, '2026-10-06 08:14:55', '2026-10-06 08:14:55', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (54, 51, 'Kubernetes Multi-Cluster Setup', 'Set up production and staging Kubernetes clusters on AWS EKS with Helm charts, Ingress controllers, and GitOps via ArgoCD.', '["Kubernetes","AWS EKS","Helm","ArgoCD"]', NULL, NULL, NULL, false, 1, '2026-10-06 08:14:55', '2026-10-06 08:14:55', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (55, 52, 'FinPay API Reference Docs', 'Comprehensive developer documentation for a fintech payment API including quickstart guides, endpoint references, code samples in 4 languages, and webhook documentation.', '["OpenAPI","Redoc","Markdown","Git"]', NULL, NULL, NULL, true, 0, '2026-10-06 08:14:56', '2026-10-06 08:14:56', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (56, 52, 'Internal Dev Wiki', 'Architected and populated an internal Confluence wiki covering engineering onboarding, architectural decisions, and runbooks for 3 product teams.', '["Confluence","Markdown","Mermaid Diagrams"]', NULL, NULL, NULL, false, 1, '2026-10-06 08:14:56', '2026-10-06 08:14:56', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (57, 53, 'Document OCR Pipeline', 'Production ML pipeline for extracting structured data from scanned business documents using custom-trained CNN and transformer models.', '["PyTorch","OpenCV","Python","AWS SageMaker"]', NULL, NULL, NULL, true, 0, '2026-10-06 08:14:56', '2026-10-06 08:14:56', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (58, 53, 'Defect Detection System', 'Real-time visual defect detection system for a manufacturing production line using YOLOv8, deployed on edge GPU devices.', '["PyTorch","YOLOv8","Python","NVIDIA Jetson"]', NULL, NULL, NULL, true, 1, '2026-10-06 08:14:56', '2026-10-06 08:14:56', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (59, 54, 'E-commerce Operations Dashboard', 'Power BI dashboard aggregating Lazada, Shopee, and warehouse data to provide real-time GMV, inventory, and logistics metrics.', '["Power BI","Excel","SQL","API Connectors"]', NULL, NULL, NULL, true, 0, '2026-10-06 08:14:56', '2026-10-06 08:14:56', NULL, NULL, NULL, NULL);
INSERT INTO public.portfolio_projects (id, user_id, title, description, tech_stack, project_url, repo_url, image_url, is_featured, sort_order, created_at, updated_at, category, role, date_completed, outcomes) VALUES (60, 55, 'Automated Test Suite for E-Commerce Platform', 'Built 120+ automated regression and smoke test cases covering user authentication, cart checkout, and payment gateways using Cypress and Postman.', '["Cypress","Postman","JavaScript","Newman","GitLab CI"]', NULL, NULL, NULL, true, 0, '2026-10-06 09:13:44', '2026-10-06 09:13:44', 'Software Quality Assurance', 'Lead Test Automation Specialist', 'May 2026', 'Identified 18 high-priority functional bugs before staging deployment.');


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: student_achievements; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (1, 15, 'CHMSU Dean''s Lister (4 Consecutive Semesters)', 'Recognized for outstanding academic performance maintaining GPA above 1.40.', 'academic', 'award', '2024-2025', 0, '2026-10-06 07:55:37', '2026-10-06 07:55:37', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (2, 15, '1st Runner Up - Western Visayas Hackathon 2025', 'Co-developed an emergency response dispatch application within 48 hours.', 'competition', 'trophy', 'Nov 2025', 1, '2026-10-06 07:55:37', '2026-10-06 07:55:37', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (3, 16, 'Certified Figma UI/UX Designer', 'Completed comprehensive advanced interaction design certification.', 'certification', 'certificate', 'Jul 2025', 0, '2026-10-06 07:55:38', '2026-10-06 07:55:38', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (4, 17, 'AWS Certified Cloud Practitioner (Foundational)', 'Demonstrated overall understanding of AWS cloud platform, security, and architectural concepts.', 'certification', 'certificate', 'Aug 2025', 0, '2026-10-06 07:55:38', '2026-10-06 07:55:38', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (5, 18, 'ISTQB Foundation Level Cert Prep Distinction', 'Completed intensive 60-hour software testing and verification bootcamp.', 'certification', 'certificate', 'Oct 2025', 0, '2026-10-06 07:55:38', '2026-10-06 07:55:38', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (6, 19, 'Cisco Certified Network Associate (CCNA) Modules 1-3', 'Successfully cleared Cisco Networking Academy exams with distinction.', 'certification', 'certificate', 'Sep 2025', 0, '2026-10-06 07:55:38', '2026-10-06 07:55:38', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (7, 20, 'Google Data Analytics Professional Certificate', 'Completed 8-course rigorous data cleaning, analysis, and visualization program.', 'certification', 'certificate', 'May 2025', 0, '2026-10-06 07:55:39', '2026-10-06 07:55:39', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (8, 21, 'Best Mobile App Capstone Concept 2025', 'Awarded by CHMSU College of Computer Studies Faculty.', 'academic', 'award', 'Dec 2025', 0, '2026-10-06 07:55:39', '2026-10-06 07:55:39', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (9, 22, 'HubSpot Digital Marketing & Inbound Certification', 'Certified in conversion optimization and content strategy.', 'certification', 'certificate', 'Jun 2025', 0, '2026-10-06 07:55:39', '2026-10-06 07:55:39', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (10, 23, 'CompTIA Security+ Certification', 'Validated baseline cybersecurity skills and threat mitigation proficiency.', 'certification', 'certificate', 'Aug 2025', 0, '2026-10-06 07:55:39', '2026-10-06 07:55:39', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (11, 24, 'Top 1 Academic Performer - BSIT Junior Year', 'Highest overall general weighted average in the CICT academic cohort.', 'academic', 'award', 'Jul 2025', 0, '2026-10-06 07:55:40', '2026-10-06 07:55:40', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (12, 25, 'AWS Certified Solutions Architect – Associate', 'Globally certified cloud architecture and infrastructure specialist.', 'certification', 'certificate', '2023', 0, '2026-10-06 07:55:40', '2026-10-06 07:55:40', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (13, 26, 'Nielsen Norman Group UX Master Certified', 'Internationally recognized UX credential in Interaction Design and Research.', 'certification', 'certificate', '2023', 0, '2026-10-06 07:55:40', '2026-10-06 07:55:40', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (14, 27, 'Certified Kubernetes Administrator (CKA)', 'Linux Foundation and Cloud Native Computing Foundation standard credential.', 'certification', 'certificate', '2024', 0, '2026-10-06 07:55:40', '2026-10-06 07:55:40', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (15, 28, 'ISTQB Advanced Test Automation Engineer', 'Certified automated test architecture and lifecycle specialist.', 'certification', 'certificate', '2023', 0, '2026-10-06 07:55:41', '2026-10-06 07:55:41', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (16, 29, 'Meta Certified React Native Mobile Developer', 'Validated advanced cross-platform mobile application architecture credential.', 'certification', 'certificate', '2023', 0, '2026-10-06 07:55:41', '2026-10-06 07:55:41', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (17, 30, 'Snowflake Certified Data Engineer (Core)', 'Certified cloud data warehousing and data pipelining expert.', 'certification', 'certificate', '2024', 0, '2026-10-06 07:55:41', '2026-10-06 07:55:41', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (18, 31, 'Upwork Top Rated Plus Freelancer', 'Maintained 100% job success score with over $80,000+ in contracts completed.', 'professional', 'trophy', '2023-2025', 0, '2026-10-06 07:55:41', '2026-10-06 07:55:41', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (19, 32, 'CompTIA CySA+ (Cybersecurity Analyst)', 'Specialized credential validating behavioral security analysis.', 'certification', 'certificate', '2023', 0, '2026-10-06 07:55:42', '2026-10-06 07:55:42', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (20, 33, 'Western Visayas Tech Startup Grant Awardee', 'DOST regional innovation seed grant recipient for local retail digitalization.', 'professional', 'trophy', '2022', 0, '2026-10-06 07:55:42', '2026-10-06 07:55:42', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (21, 34, 'Certified ScrumMaster (CSM)', 'Scrum Alliance globally certified agile delivery specialist.', 'certification', 'certificate', '2023', 0, '2026-10-06 07:55:42', '2026-10-06 07:55:42', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (22, 35, 'Best Capstone Project Award', 'Awarded best capstone project for developing a web-based student monitoring system for the IT department.', 'academic', 'award', 'Apr 2021', 0, '2026-10-06 08:14:51', '2026-10-06 08:14:51', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (23, 35, 'AWS Certified Developer – Associate', 'Passed the AWS Certified Developer – Associate exam, validating proficiency in developing and deploying cloud applications on AWS.', 'certification', 'badge', 'Mar 2025', 1, '2026-10-06 08:14:51', '2026-10-06 08:14:51', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (24, 36, 'Dean''s Lister – 2nd Year', 'Recognized on the Dean''s List for academic excellence during the second year of BSIT.', 'academic', 'star', 'Jun 2019', 0, '2026-10-06 08:14:52', '2026-10-06 08:14:52', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (25, 36, 'Google UX Design Certificate', 'Completed the Google UX Design Professional Certificate via Coursera covering the full design thinking process.', 'certification', 'badge', 'Nov 2022', 1, '2026-10-06 08:14:52', '2026-10-06 08:14:52', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (26, 36, '1st Place – Regional Web Design Competition', 'Won first place in the regional UI/UX Web Design category at the CIT Skills Olympics 2024.', 'competition', 'trophy', 'Feb 2024', 2, '2026-10-06 08:14:52', '2026-10-06 08:14:52', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (27, 37, 'Google Data Analytics Certificate', 'Completed the Google Data Analytics Professional Certificate covering data cleaning, analysis, and visualization.', 'certification', 'badge', 'Aug 2022', 0, '2026-10-06 08:14:52', '2026-10-06 08:14:52', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (28, 37, 'AWS Certified Data Engineer – Associate', 'Certified in designing and managing AWS data engineering solutions including Glue, Redshift, and S3.', 'certification', 'badge', 'Jan 2025', 1, '2026-10-06 08:14:52', '2026-10-06 08:14:52', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (29, 38, 'Shopify Partner Certification', 'Officially certified as a Shopify Partner Developer, recognized for proficiency in theme development and app configuration.', 'certification', 'badge', 'Jun 2023', 0, '2026-10-06 08:14:52', '2026-10-06 08:14:52', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (30, 38, 'Top Freelancer – Upwork (Rising Talent)', 'Earned Upwork Rising Talent badge with a 5-star average rating across 15 completed projects.', 'professional', 'award', 'Dec 2022', 1, '2026-10-06 08:14:52', '2026-10-06 08:14:52', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (31, 39, 'Google Flutter Developer Certification', 'Completed and passed the Google-endorsed Flutter development certification track via Coursera.', 'certification', 'badge', 'Feb 2023', 0, '2026-10-06 08:14:52', '2026-10-06 08:14:52', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (32, 39, '10K+ Downloads – LogiTrack App', 'Led development of LogiTrack mobile app which surpassed 10,000 downloads within the first quarter of release.', 'professional', 'award', 'Mar 2024', 1, '2026-10-06 08:14:52', '2026-10-06 08:14:52', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (33, 40, 'SHRM Fundamentals Certificate', 'Completed the SHRM Fundamentals of Human Resources Management certificate program.', 'certification', 'badge', 'May 2023', 0, '2026-10-06 08:14:53', '2026-10-06 08:14:53', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (34, 40, 'Employee of the Month – Q3 2023', 'Recognized as Employee of the Month for achieving a 95% offer acceptance rate and reducing time-to-hire by 20%.', 'professional', 'award', 'Sep 2023', 1, '2026-10-06 08:14:53', '2026-10-06 08:14:53', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (35, 41, 'AWS Solutions Architect – Associate', 'Earned the AWS Certified Solutions Architect – Associate credential, demonstrating proficiency in designing resilient AWS architectures.', 'certification', 'badge', 'Sep 2023', 0, '2026-10-06 08:14:53', '2026-10-06 08:14:53', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (36, 41, 'HashiCorp Terraform Associate', 'Passed the HashiCorp Certified: Terraform Associate exam validating infrastructure-as-code expertise.', 'certification', 'badge', 'Apr 2025', 1, '2026-10-06 08:14:53', '2026-10-06 08:14:53', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (37, 42, 'DOST-SEI Scholar', 'Received a full undergraduate scholarship from the Department of Science and Technology – Science Education Institute.', 'academic', 'award', 'Aug 2017', 0, '2026-10-06 08:14:53', '2026-10-06 08:14:53', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (38, 42, 'Best Research Paper – PCSC 2024', 'Co-authored paper on Filipino sentiment analysis recognized as Best Paper in the NLP track at the Philippine Computing Science Congress 2024.', 'competition', 'trophy', 'Mar 2024', 1, '2026-10-06 08:14:53', '2026-10-06 08:14:53', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (39, 43, 'Certified Ethical Hacker (CEH)', 'Achieved CEH certification from EC-Council, validating knowledge of ethical hacking tools and techniques.', 'certification', 'badge', 'Jul 2023', 0, '2026-10-06 08:14:53', '2026-10-06 08:14:53', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (40, 43, 'CompTIA Security+', 'Passed CompTIA Security+ SY0-601, establishing a foundational cybersecurity credential.', 'certification', 'badge', 'Feb 2022', 1, '2026-10-06 08:14:53', '2026-10-06 08:14:53', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (41, 43, 'Top 10 – National Cybersecurity CTF', 'Ranked in the top 10 nationwide at the DICT National Cybersecurity CTF Competition.', 'competition', 'trophy', 'Nov 2024', 2, '2026-10-06 08:14:53', '2026-10-06 08:14:53', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (42, 44, 'IIBA CBAP Certification', 'Earned the IIBA Certified Business Analysis Professional credential after passing the rigorous CBAP examination.', 'certification', 'badge', 'Jun 2025', 0, '2026-10-06 08:14:54', '2026-10-06 08:14:54', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (43, 44, 'Certified Scrum Product Owner (CSPO)', 'Completed the Certified Scrum Product Owner course and certification from Scrum Alliance.', 'certification', 'badge', 'Sep 2023', 1, '2026-10-06 08:14:54', '2026-10-06 08:14:54', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (44, 45, 'Node.js Application Developer – IBM', 'Earned IBM''s Node.js Application Developer badge, validating proficiency in building and deploying Node.js applications.', 'certification', 'badge', 'Oct 2022', 0, '2026-10-06 08:14:54', '2026-10-06 08:14:54', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (45, 45, 'Top Performer – FinPulse Fintech Q1 2025', 'Recognized as top performer for successfully migrating the core transactions API to a microservices architecture with zero downtime.', 'professional', 'award', 'Mar 2025', 1, '2026-10-06 08:14:54', '2026-10-06 08:14:54', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (46, 46, 'Google Digital Marketing Certificate', 'Completed the Google Digital Marketing & E-commerce Professional Certificate via Coursera.', 'certification', 'badge', 'Mar 2022', 0, '2026-10-06 08:14:54', '2026-10-06 08:14:54', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (47, 46, 'HubSpot Inbound Marketing Certified', 'Passed the HubSpot Academy Inbound Marketing certification covering content strategy, SEO, and lead nurturing.', 'certification', 'badge', 'Nov 2023', 1, '2026-10-06 08:14:54', '2026-10-06 08:14:54', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (48, 47, 'Unity Certified Associate Game Developer', 'Passed the Unity Certified Associate: Game Developer exam demonstrating proficiency in Unity game development fundamentals.', 'certification', 'badge', 'Aug 2022', 0, '2026-10-06 08:14:54', '2026-10-06 08:14:54', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (49, 47, '1st Place – GameJam PH 2023', 'Won first place at the GameJam Philippines 2023 48-hour game development competition with the entry "Chrono Escape".', 'competition', 'trophy', 'Nov 2023', 1, '2026-10-06 08:14:54', '2026-10-06 08:14:54', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (50, 48, 'MySQL 8.0 Database Administrator Certified', 'Earned the Oracle MySQL 8.0 Database Administrator professional certification.', 'certification', 'badge', 'Apr 2023', 0, '2026-10-06 08:14:55', '2026-10-06 08:14:55', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (51, 48, 'PostgreSQL Associate Certification', 'Passed the EDB PostgreSQL 14 Associate exam demonstrating advanced database administration skills.', 'certification', 'badge', 'Jan 2025', 1, '2026-10-06 08:14:55', '2026-10-06 08:14:55', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (52, 49, 'PMP Certified', 'Passed the PMI Project Management Professional (PMP) exam on the first attempt, validating expertise in leading projects across methodologies.', 'certification', 'badge', 'Sep 2024', 0, '2026-10-06 08:14:55', '2026-10-06 08:14:55', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (53, 49, 'Certified Scrum Master (CSM)', 'Completed the Certified ScrumMaster course and credential from Scrum Alliance.', 'certification', 'badge', 'Mar 2023', 1, '2026-10-06 08:14:55', '2026-10-06 08:14:55', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (54, 50, 'ISTQB Foundation Level Certified', 'Passed the ISTQB Certified Tester Foundation Level exam, establishing a formal QA certification.', 'certification', 'badge', 'Mar 2022', 0, '2026-10-06 08:14:55', '2026-10-06 08:14:55', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (55, 50, 'Cypress.io Ambassador Recognition', 'Recognized by Cypress.io community as a regional ambassador for contributing open-source test utilities and writing community tutorials.', 'professional', 'award', 'Jul 2024', 1, '2026-10-06 08:14:55', '2026-10-06 08:14:55', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (56, 51, 'AWS Certified Solutions Architect – Professional', 'Passed the most advanced AWS architecture certification, demonstrating expert-level cloud design skills.', 'certification', 'badge', 'Nov 2024', 0, '2026-10-06 08:14:55', '2026-10-06 08:14:55', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (57, 51, 'CCNA Certified', 'Passed the Cisco CCNA exam, establishing foundational network engineering credentials.', 'certification', 'badge', 'May 2022', 1, '2026-10-06 08:14:55', '2026-10-06 08:14:55', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (58, 52, 'Google Technical Writing Certificate', 'Completed Google''s Technical Writing One and Two courses, formalizing documentation best practices.', 'certification', 'badge', 'Sep 2022', 0, '2026-10-06 08:14:56', '2026-10-06 08:14:56', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (59, 52, 'Best Documentation – DevFest PH 2024', 'Awarded Best Developer Documentation at Google DevFest Philippines 2024 for the FinPay API reference docs.', 'competition', 'trophy', 'Nov 2024', 1, '2026-10-06 08:14:56', '2026-10-06 08:14:56', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (60, 53, 'AWS Certified Machine Learning – Specialty', 'Earned the AWS Certified Machine Learning Specialty credential, one of the most specialized AWS certifications.', 'certification', 'badge', 'Dec 2024', 0, '2026-10-06 08:14:56', '2026-10-06 08:14:56', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (61, 53, 'Kaggle Expert – Competitions', 'Achieved Kaggle Expert rank through top-25 finishes in 3 machine learning competitions.', 'professional', 'award', 'Aug 2023', 1, '2026-10-06 08:14:56', '2026-10-06 08:14:56', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (62, 54, 'Lazada Star Seller Award 2023', 'Led operations for 2 stores that earned Lazada Star Seller certification for outstanding service ratings and on-time shipping.', 'professional', 'award', 'Dec 2023', 0, '2026-10-06 08:14:56', '2026-10-06 08:14:56', NULL, NULL, NULL, NULL, NULL, NULL, true);
INSERT INTO public.student_achievements (id, user_id, title, description, type, icon, date, sort_order, created_at, updated_at, issuer, credential_id, credential_url, certificate_url, award_level, expires_at, does_not_expire) VALUES (63, 54, 'Six Sigma Yellow Belt', 'Completed the Six Sigma Yellow Belt course and project, applying process improvement methodology to warehouse operations.', 'certification', 'badge', 'Jun 2024', 1, '2026-10-06 08:14:56', '2026-10-06 08:14:56', NULL, NULL, NULL, NULL, NULL, NULL, true);


--
-- Data for Name: student_education; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (2, 12, 'Carlos Hilado Memorial State University', 'Bachelor of Science in Information Technology', NULL, NULL, NULL, NULL, true, 0, '2026-10-05 17:45:08', '2026-10-05 17:45:08');
INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (9, 13, 'Carlos Hilado Memorial State University', 'Bachelor of Science in Information Technology', NULL, NULL, NULL, NULL, true, 0, '2026-10-06 03:19:43', '2026-10-06 03:19:43');
INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (11, 15, 'Negros Occidental High School', 'Senior High School - TVL ICT Strand', '2020', '2022', '93.50', 'Graduated with Honors. Lead developer for the ICT Club Capstone showcase.', false, 1, '2026-10-06 07:55:37', '2026-10-06 07:55:37');
INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (12, 15, 'Carlos Hilado Memorial State University', 'Bachelor of Science in Information Technology', '2023', '2027', '1.38', '4th Year Standing, Section 4B. Consistent Dean''s Lister. Specializing in Systems Development.', true, 0, '2026-10-06 07:55:37', '2026-10-06 07:55:37');
INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (13, 16, 'Rafael B. Lacson Memorial High School', 'Senior High School - STEM Strand', '2020', '2022', '94.00', 'Graduated With High Honors. Visual Arts & Media Graphics Officer.', false, 1, '2026-10-06 07:55:38', '2026-10-06 07:55:38');
INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (14, 16, 'Carlos Hilado Memorial State University', 'Bachelor of Science in Information Technology', '2023', '2027', '1.32', '4th Year Standing, Section 4B. President of the CHMSU UI/UX Guild.', true, 0, '2026-10-06 07:55:38', '2026-10-06 07:55:38');
INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (15, 17, 'Silay Institute', 'Senior High School - TVL ICT', '2020', '2022', '92.80', 'Graduated with Honors. Cisco IT Essentials certified during high school.', false, 1, '2026-10-06 07:55:38', '2026-10-06 07:55:38');
INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (16, 17, 'Carlos Hilado Memorial State University', 'Bachelor of Science in Information Technology', '2023', '2027', '1.45', '4th Year Standing, Section 4B. Member of Google Developer Student Club CHMSU.', true, 0, '2026-10-06 07:55:38', '2026-10-06 07:55:38');
INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (19, 19, 'Bago City National High School', 'Senior High School - TVL ICT', '2020', '2022', '91.75', 'Graduated with Honors. Campus LAN troubleshooting assistant.', false, 1, '2026-10-06 07:55:38', '2026-10-06 07:55:38');
INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (20, 19, 'Carlos Hilado Memorial State University', 'Bachelor of Science in Information Technology', '2023', '2027', '1.48', '4th Year Standing, Section 4B. Student System Administrator at CHMSU Alijis IT Lab.', true, 0, '2026-10-06 07:55:38', '2026-10-06 07:55:38');
INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (27, 23, 'Rafael B. Lacson Memorial High School', 'Senior High School - TVL ICT', '2020', '2022', '93.10', 'Graduated with Honors. Champion, Regional Computer Skills Olympiad.', false, 1, '2026-10-06 07:55:39', '2026-10-06 07:55:39');
INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (28, 23, 'Carlos Hilado Memorial State University', 'Bachelor of Science in Information Technology', '2023', '2027', '1.35', '4th Year Standing, Section 4B. President, CHMSU Cybersecurity Club.', true, 0, '2026-10-06 07:55:39', '2026-10-06 07:55:39');
INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (29, 24, 'St. Scholastica''s Academy Bacolod', 'Senior High School - STEM Strand', '2020', '2022', '94.80', 'Graduated With High Honors. Mathematics and Logic Guild Officer.', false, 1, '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (30, 24, 'Carlos Hilado Memorial State University', 'Bachelor of Science in Information Technology', '2023', '2027', '1.28', '4th Year Standing, Section 4B. Vice-Governor, College of Computer Studies.', true, 0, '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (31, 25, 'Negros Occidental High School', 'High School Diploma', '2012', '2016', '91.50', 'Science and Technology curriculum honors.', false, 1, '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (32, 25, 'Carlos Hilado Memorial State University', 'Bachelor of Science in Information Technology', '2016', '2020', '1.35', 'Graduated Cum Laude, Section 4B. Class of 2020. Outstanding Programmer Awardee.', false, 0, '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (33, 26, 'Carlos Hilado Memorial State University', 'Bachelor of Science in Information Technology', '2016', '2020', '1.30', 'Graduated Magna Cum Laude, Section 4B. Batch 2020 Valedictory Finalist.', false, 0, '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (34, 27, 'Carlos Hilado Memorial State University', 'Bachelor of Science in Information Technology', '2016', '2020', '1.40', 'Graduated with Honors, Section 4B. Class of 2020. Head of System Operations.', false, 0, '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (35, 28, 'Carlos Hilado Memorial State University', 'Bachelor of Science in Information Technology', '2016', '2020', '1.38', 'Graduated with Honors, Section 4B. Class of 2020.', false, 0, '2026-10-06 07:55:41', '2026-10-06 07:55:41');
INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (36, 29, 'Carlos Hilado Memorial State University', 'Bachelor of Science in Information Technology', '2016', '2020', '1.42', 'Class of 2020, Section 4B. Mobile App Capstone Lead.', false, 0, '2026-10-06 07:55:41', '2026-10-06 07:55:41');
INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (37, 30, 'Carlos Hilado Memorial State University', 'Bachelor of Science in Information Technology', '2016', '2020', '1.32', 'Graduated Magna Cum Laude, Section 4B. Class of 2020.', false, 0, '2026-10-06 07:55:41', '2026-10-06 07:55:41');
INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (38, 31, 'Carlos Hilado Memorial State University', 'Bachelor of Science in Information Technology', '2016', '2020', '1.39', 'Class of 2020, Section 4B. Student Council IT Committee Head.', false, 0, '2026-10-06 07:55:41', '2026-10-06 07:55:41');
INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (39, 32, 'Carlos Hilado Memorial State University', 'Bachelor of Science in Information Technology', '2016', '2020', '1.34', 'Graduated Cum Laude, Section 4B. Class of 2020.', false, 0, '2026-10-06 07:55:42', '2026-10-06 07:55:42');
INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (40, 33, 'Carlos Hilado Memorial State University', 'Bachelor of Science in Information Technology', '2016', '2020', '1.41', 'Class of 2020, Section 4B. CHMSU Innovator of the Year 2020.', false, 0, '2026-10-06 07:55:42', '2026-10-06 07:55:42');
INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (41, 34, 'Carlos Hilado Memorial State University', 'Bachelor of Science in Information Technology', '2016', '2020', '1.31', 'Graduated Magna Cum Laude, Section 4B. Class of 2020. Outstanding Student Leader.', false, 0, '2026-10-06 07:55:42', '2026-10-06 07:55:42');
INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (42, 55, 'Carlos Hilado Memorial State University', 'Bachelor of Science in Information Technology', '2023', '2027', '1.42', '4th Year Standing, Section BSIT 4-B. Dean''s Lister & QA Lead for Capstone Project.', true, 0, '2026-10-06 09:13:44', '2026-10-06 09:13:44');
INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (10, 14, 'Carlos Hilado Memorial State University', 'Bachelor of Science in Information Technology', NULL, '2026', NULL, NULL, false, 0, '2026-10-06 03:19:43', '2026-10-12 14:42:46');
INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (49, 58, 'Carlos Hilado Memorial State University', 'Bachelor of Science in Information Technology', NULL, NULL, NULL, NULL, true, 1, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (50, 18, 'Carlos Hilado Memorial State University', 'Bachelor of Science in Information Technology', NULL, NULL, NULL, NULL, true, 1, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (51, 22, 'Carlos Hilado Memorial State University', 'Bachelor of Science in Information Technology', NULL, NULL, NULL, NULL, true, 1, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (52, 59, 'Carlos Hilado Memorial State University', 'Bachelor of Science in Information Technology', NULL, NULL, NULL, NULL, true, 1, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (53, 20, 'Carlos Hilado Memorial State University', 'Bachelor of Science in Information Technology', NULL, NULL, NULL, NULL, true, 1, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.student_education (id, user_id, school, degree, year_start, year_end, gpa, description, is_current, sort_order, created_at, updated_at) VALUES (54, 21, 'Carlos Hilado Memorial State University', 'Bachelor of Science in Information Technology', NULL, NULL, NULL, NULL, true, 1, '2026-10-17 12:09:28', '2026-10-17 12:09:28');


--
-- Data for Name: student_evaluation_answers; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.student_evaluation_answers (id, student_evaluation_id, evaluation_question_id, rating_value, text_value, created_at, updated_at) VALUES (1, 1, 1, 5, NULL, '2026-10-12 14:37:27', '2026-10-12 14:37:27');
INSERT INTO public.student_evaluation_answers (id, student_evaluation_id, evaluation_question_id, rating_value, text_value, created_at, updated_at) VALUES (2, 1, 2, 5, NULL, '2026-10-12 14:37:27', '2026-10-12 14:37:27');
INSERT INTO public.student_evaluation_answers (id, student_evaluation_id, evaluation_question_id, rating_value, text_value, created_at, updated_at) VALUES (3, 1, 3, 5, NULL, '2026-10-12 14:37:27', '2026-10-12 14:37:27');
INSERT INTO public.student_evaluation_answers (id, student_evaluation_id, evaluation_question_id, rating_value, text_value, created_at, updated_at) VALUES (4, 1, 4, 5, NULL, '2026-10-12 14:37:27', '2026-10-12 14:37:27');
INSERT INTO public.student_evaluation_answers (id, student_evaluation_id, evaluation_question_id, rating_value, text_value, created_at, updated_at) VALUES (5, 1, 5, 5, NULL, '2026-10-12 14:37:27', '2026-10-12 14:37:27');
INSERT INTO public.student_evaluation_answers (id, student_evaluation_id, evaluation_question_id, rating_value, text_value, created_at, updated_at) VALUES (6, 1, 6, 5, NULL, '2026-10-12 14:37:27', '2026-10-12 14:37:27');
INSERT INTO public.student_evaluation_answers (id, student_evaluation_id, evaluation_question_id, rating_value, text_value, created_at, updated_at) VALUES (7, 1, 7, 5, NULL, '2026-10-12 14:37:27', '2026-10-12 14:37:27');
INSERT INTO public.student_evaluation_answers (id, student_evaluation_id, evaluation_question_id, rating_value, text_value, created_at, updated_at) VALUES (8, 1, 8, 5, NULL, '2026-10-12 14:37:27', '2026-10-12 14:37:27');
INSERT INTO public.student_evaluation_answers (id, student_evaluation_id, evaluation_question_id, rating_value, text_value, created_at, updated_at) VALUES (9, 1, 9, NULL, 'Needs further academic/technical preparation', '2026-10-12 14:37:27', '2026-10-12 14:37:27');
INSERT INTO public.student_evaluation_answers (id, student_evaluation_id, evaluation_question_id, rating_value, text_value, created_at, updated_at) VALUES (10, 1, 10, NULL, 'asdasd', '2026-10-12 14:37:27', '2026-10-12 14:37:27');
INSERT INTO public.student_evaluation_answers (id, student_evaluation_id, evaluation_question_id, rating_value, text_value, created_at, updated_at) VALUES (11, 1, 11, NULL, 'asda', '2026-10-12 14:37:27', '2026-10-12 14:37:27');


--
-- Data for Name: student_evaluations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.student_evaluations (id, template_id, student_user_id, company_user_id, supervisor_user_id, ojt_record_id, ojt_posting_id, status, overall_score, general_feedback, recommendation, evaluator_name, evaluator_position, sent_at, submitted_at, created_at, updated_at, term, is_waived, waiver_reason, weight) VALUES (1, 1, 14, 11, 57, 12, 10, 'submitted', 5.00, 'asdaa', 'Highly Recommended - Ready for immediate employment', 'asdsw', 'asdasdas', '2026-10-12 14:35:59', '2026-10-12 14:37:27', '2026-10-12 14:35:59', '2026-10-12 14:37:27', 'endterm', false, NULL, 0.50);


--
-- Data for Name: student_experiences; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (1, 15, 'Lead Full-Stack Developer (Capstone)', 'CHMSU College of Computer Studies', 'OJT', 'Aug 2025', 'Dec 2025', 'Architected and built a micro-lending and inventory tracking system using Laravel 11 and Vue 3 with automated PDF invoice generation.', '["Laravel","Vue.js","MySQL","Tailwind CSS"]', false, 0, '2026-10-06 07:55:37', '2026-10-06 07:55:37', 'Bacolod City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (2, 15, 'Freelance Web Designer', 'Self-Employed / Local Businesses', 'Freelance', 'Jan 2024', NULL, 'Developed custom promotional landing pages and e-commerce product catalogs for Bacolod food and retail merchants.', '["HTML5","CSS3","JavaScript","Figma"]', true, 1, '2026-10-06 07:55:37', '2026-10-06 07:55:37', 'Remote', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (3, 16, 'Lead UI/UX Designer & Frontend Assistant', 'CHMSU Student Government', 'Volunteer', 'Sep 2024', NULL, 'Redesigned the official student council voting portal and created reusable Tailwind components used across campus portals.', '["Figma","React","Tailwind CSS"]', true, 0, '2026-10-06 07:55:38', '2026-10-06 07:55:38', 'Talisay City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (4, 17, 'Backend API Developer (Academic)', 'CHMSU Systems Lab', 'OJT', 'Jul 2025', 'Nov 2025', 'Implemented JWT authentication, rate limiting, and database caching for a campus laboratory equipment loan tracker.', '["Node.js","PostgreSQL","Docker","Redis"]', false, 0, '2026-10-06 07:55:38', '2026-10-06 07:55:38', 'Bacolod City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (5, 18, 'Quality Assurance Lead (Academic Capstone)', 'CHMSU IT Department', 'OJT', 'Aug 2025', 'Dec 2025', 'Authored 120+ test scenarios, logged 45 critical bugs, and created automated Cypress integration tests for a multi-tenant university portal.', '["Cypress","Postman","Jira"]', false, 0, '2026-10-06 07:55:38', '2026-10-06 07:55:38', 'Bacolod City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (6, 19, 'Student Laboratory Network Assistant', 'CHMSU Management Information Systems', 'Part-time', 'Jan 2025', NULL, 'Assisted in maintenance of 80+ workstations, CAT6 cabling, pfSense router setup, and active directory student logins.', '["pfSense","Networking","Linux","Windows Server"]', true, 0, '2026-10-06 07:55:38', '2026-10-06 07:55:38', 'Alijis, Bacolod City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (7, 20, 'Data Analyst Intern (Institutional Research)', 'CHMSU Planning & Development Office', 'OJT', 'Jun 2025', 'Oct 2025', 'Consolidated and visualized enrollment retention trends across 4 campuses using Power BI dashboards for institutional accreditation reports.', '["Power BI","SQL","Excel"]', false, 0, '2026-10-06 07:55:39', '2026-10-06 07:55:39', 'Talisay City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (8, 21, 'Mobile Application Developer (Capstone Lead)', 'Local Barangay Healthcare Unit', 'OJT', 'Aug 2025', 'Dec 2025', 'Built an offline-first patient immunization scheduling app used by 6 local health workers.', '["Flutter","Firebase","SQLite"]', false, 0, '2026-10-06 07:55:39', '2026-10-06 07:55:39', 'Bacolod City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (9, 22, 'Digital Media Coordinator', 'Silay Heritage Cultural Society', 'Volunteer', 'Mar 2024', NULL, 'Managed official website content, enhanced search engine discoverability by 45%, and produced digital event banners.', '["WordPress","SEO","Canva"]', true, 0, '2026-10-06 07:55:39', '2026-10-06 07:55:39', 'Silay City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (10, 23, 'Security Audit Lead (Capstone Project)', 'CHMSU IT Security Research Group', 'OJT', 'Sep 2025', 'Dec 2025', 'Performed vulnerability scans, identified SQL injection and XSS loopholes in student portal prototypes, and documented remediation code fixes.', '["Burp Suite","OWASP","Linux","PHP"]', false, 0, '2026-10-06 07:55:39', '2026-10-06 07:55:39', 'Talisay City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (11, 24, 'Enterprise System Analyst & Developer', 'Negros Cooperative Federation', 'OJT', 'Jul 2025', 'Nov 2025', 'Modeled relational schemas for member dividend tracking and built REST services processing loan ledger balances.', '["Java","Spring Boot","MySQL"]', false, 0, '2026-10-06 07:55:40', '2026-10-06 07:55:40', 'Bacolod City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (12, 25, 'Senior Backend Engineer', 'Boldr Solutions Philippines', 'Full-time', 'May 2023', NULL, 'Architected enterprise microservices handling 2.5M daily webhook transactions. Reduced database query latency by 42% through connection pooling and index optimization.', '["Laravel","PostgreSQL","AWS","Docker","Redis"]', true, 0, '2026-10-06 07:55:40', '2026-10-06 07:55:40', 'Remote / Bacolod', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (13, 25, 'Mid-Level Full Stack Developer', 'Mediascape IT Solutions', 'Full-time', 'Jun 2021', 'Apr 2023', 'Maintained high-traffic SaaS CRM platform using Vue 3 and Laravel. Built automated billing webhooks with Stripe.', '["Laravel","Vue.js","MySQL","Stripe"]', false, 1, '2026-10-06 07:55:40', '2026-10-06 07:55:40', 'Cebu City / Remote', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (14, 25, 'Junior Web Developer', 'InnoTech Solutions Inc.', 'Full-time', 'Sep 2020', 'May 2021', 'Started right after graduation. Engineered client CMS portals and REST APIs.', '["PHP","MySQL","JavaScript","HTML5"]', false, 2, '2026-10-06 07:55:40', '2026-10-06 07:55:40', 'Bacolod City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (15, 26, 'Lead Product Designer', 'Maya Philippines (formerly PayMaya)', 'Full-time', 'Jan 2023', NULL, 'Leads UX initiatives for mobile merchant checkouts servicing 12M monthly transactions. Established unified design token library.', '["Figma","Design Systems","User Research"]', true, 0, '2026-10-06 07:55:40', '2026-10-06 07:55:40', 'Makati City / Hybrid', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (16, 26, 'Senior UI/UX Designer', 'Appnovation Technologies', 'Full-time', 'Jul 2021', 'Dec 2022', 'Designed digital portals for North American commercial enterprise clients.', '["Figma","Prototyping","Design Systems"]', false, 1, '2026-10-06 07:55:40', '2026-10-06 07:55:40', 'Remote', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (17, 27, 'Senior Site Reliability Engineer', 'Globe Telecom / 917Ventures', 'Full-time', 'Feb 2023', NULL, 'Maintains 99.99% uptime SLAs across microservices clusters. Automated multi-region disaster recovery failovers.', '["Kubernetes","Terraform","Datadog","AWS"]', true, 0, '2026-10-06 07:55:40', '2026-10-06 07:55:40', 'Bonifacio Global City / Remote', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (18, 28, 'Lead QA Automation Engineer', 'Reed Elsevier Philippines', 'Full-time', 'Sep 2022', NULL, 'Architected TypeScript Playwright testing framework reducing sprint regression validation time from 3 days to 45 minutes.', '["Playwright","TypeScript","k6","Docker"]', true, 0, '2026-10-06 07:55:41', '2026-10-06 07:55:41', 'Iloilo City / Hybrid', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (19, 29, 'Senior Mobile Engineer', 'GoTeam Global Software', 'Full-time', 'Jul 2022', NULL, 'Directs mobile architecture for Australian logistics and driver fleet application.', '["React Native","TypeScript","GraphQL","Fastlane"]', true, 0, '2026-10-06 07:55:41', '2026-10-06 07:55:41', 'Cebu City / Remote', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (20, 30, 'Lead Analytics Engineer', 'Shopee Philippines', 'Full-time', 'Aug 2022', NULL, 'Designs dbt transformation models on Snowflake servicing regional marketing and GMV financial forecast reporting.', '["Snowflake","dbt","SQL","Python"]', true, 0, '2026-10-06 07:55:41', '2026-10-06 07:55:41', 'Bonifacio Global City / Remote', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (21, 31, 'Principal Software Consultant', 'Independent Contractor (Upwork Top Rated Plus)', 'Freelance', 'Oct 2021', NULL, 'Shipped 15+ production applications including multi-tenant AI tools, healthcare portals, and booking systems for Silicon Valley clients.', '["Next.js","TypeScript","Node.js","Supabase"]', true, 0, '2026-10-06 07:55:41', '2026-10-06 07:55:41', 'Remote', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (22, 32, 'Senior SOC Analyst', 'Bank of the Philippine Islands (BPI)', 'Full-time', 'May 2023', NULL, 'Investigates Level 3 security incidents, fine-tunes detection rules, and conducts red-team intrusion simulations.', '["Splunk","CrowdStrike","Wireshark","Python"]', true, 0, '2026-10-06 07:55:42', '2026-10-06 07:55:42', 'Makati City / Hybrid', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (23, 33, 'Managing Director & CTO', 'DevLink Software Technologies', 'Full-time', 'Jan 2021', NULL, 'Directs engineering of POS and inventory cloud software deployed across 60+ retail storefronts in Western Visayas.', '["Laravel","Vue.js","PostgreSQL","DigitalOcean"]', true, 0, '2026-10-06 07:55:42', '2026-10-06 07:55:42', 'Bacolod City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (24, 34, 'Senior Systems Analyst', 'Concentrix Philippines', 'Full-time', 'Jan 2021', 'Dec 2025', 'Conducted business process requirements gathering, translated legacy CRM databases to modern cloud architectures, and steered sprint backlogs for 3 engineering pods.', '["Jira","Agile","SQL","BPMN"]', false, 0, '2026-10-06 07:55:42', '2026-10-06 07:55:42', 'Bacolod City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (25, 35, 'Technical Support Representative', 'CloudServe BPO', 'Full-time', 'Aug 2021', 'Apr 2022', 'Provided tier-1 technical support for a US-based SaaS client, troubleshooting software issues and escalating complex cases to engineering teams.', '["Technical Support","CRM","Troubleshooting","Communication"]', false, 0, '2026-10-06 08:14:51', '2026-10-06 08:14:51', 'Bacolod City', false);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (26, 35, 'Junior Web Developer', 'WebCraft Digital', 'Full-time', 'May 2022', 'Jul 2023', 'Built and maintained client websites and internal tools using Laravel and vanilla JS. Handled database design and API integration.', '["PHP","HTML","CSS","JavaScript","MySQL","Laravel"]', false, 1, '2026-10-06 08:14:51', '2026-10-06 08:14:51', 'Bacolod City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (27, 35, 'Full Stack Developer', 'Nexus Systems Inc.', 'Full-time', 'Aug 2023', 'Nov 2024', 'Developed full-stack features for a fleet management SaaS platform serving over 500 logistics companies nationwide.', '["Laravel","Vue.js","MySQL","REST API","Docker","Git"]', false, 2, '2026-10-06 08:14:51', '2026-10-06 08:14:51', 'Cebu City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (28, 35, 'Senior Full Stack Developer', 'Nexus Systems Inc.', 'Full-time', 'Dec 2024', NULL, 'Leading backend architecture decisions for the core platform, mentoring 3 junior developers, and driving migration from monolith to microservices.', '["Laravel","Vue.js","PostgreSQL","Microservices","CI\/CD","Docker"]', true, 3, '2026-10-06 08:14:51', '2026-10-06 08:14:51', 'Cebu City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (29, 36, 'Social Media Coordinator', 'VividMark Agency', 'Full-time', 'Jul 2021', 'Dec 2021', 'Managed social media accounts for 5 local brands, created content calendars and visual assets for Facebook and Instagram.', '["Content Creation","Canva","Social Media","Copywriting"]', false, 0, '2026-10-06 08:14:52', '2026-10-06 08:14:52', 'Bacolod City', false);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (30, 36, 'Junior UI/UX Designer', 'CreativeHub PH', 'Full-time', 'Jan 2022', 'Jun 2023', 'Designed wireframes and high-fidelity prototypes for web and mobile apps. Conducted usability tests and iterated designs based on user feedback.', '["Figma","Adobe XD","Wireframing","Prototyping","User Testing"]', false, 1, '2026-10-06 08:14:52', '2026-10-06 08:14:52', 'Makati City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (31, 36, 'Frontend Developer', 'Pixel Republic Studio', 'Full-time', 'Jul 2023', 'Feb 2025', 'Built responsive, accessible frontend interfaces for fintech and health-tech clients. Worked closely with UX designers and backend engineers in an Agile team.', '["React","Tailwind CSS","JavaScript","Figma","TypeScript"]', false, 2, '2026-10-06 08:14:52', '2026-10-06 08:14:52', 'Makati City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (32, 36, 'UI/UX Lead', 'Pixel Republic Studio', 'Full-time', 'Mar 2025', NULL, 'Leading a team of 3 designers, establishing a unified design system, and driving product UX strategy across 4 active product lines.', '["Figma","React","Design Systems","User Research","Leadership"]', true, 3, '2026-10-06 08:14:52', '2026-10-06 08:14:52', 'Makati City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (33, 37, 'Data Entry Specialist', 'PrimeData Services', 'Full-time', 'Sep 2021', 'Mar 2022', 'Encoded and validated large volumes of business data into client databases, performed regular quality checks.', '["Data Entry","MS Excel","Accuracy","Database Encoding"]', false, 0, '2026-10-06 08:14:52', '2026-10-06 08:14:52', 'Pasig City', false);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (34, 37, 'Data Analyst', 'InsightBridge Analytics', 'Full-time', 'Apr 2022', 'Mar 2024', 'Analyzed multi-source datasets for retail and banking clients, produced weekly and monthly executive dashboards and ad hoc reports.', '["Python","SQL","Tableau","Power BI","Data Visualization"]', false, 1, '2026-10-06 08:14:52', '2026-10-06 08:14:52', 'Pasig City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (35, 37, 'Data Engineer', 'DataStream PH', 'Full-time', 'Apr 2024', NULL, 'Designing and maintaining ETL pipelines that process over 5 million records daily. Led migration of legacy batch jobs to a real-time streaming architecture.', '["Apache Spark","Python","Apache Airflow","AWS Glue","dbt","Redshift"]', true, 2, '2026-10-06 08:14:52', '2026-10-06 08:14:52', 'Pasig City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (36, 38, 'Fitness Instructor', 'FitLife Gym & Wellness', 'Part-time', 'Jul 2021', NULL, 'Conducting Zumba and HIIT group classes on weekends while freelancing as a web developer.', '["Group Training","Physical Fitness","Client Coaching","Scheduling"]', true, 0, '2026-10-06 08:14:52', '2026-10-06 08:14:52', 'Iloilo City', false);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (37, 38, 'WordPress Developer', 'Self-employed / Freelance', 'Freelance', 'Oct 2021', 'Dec 2023', 'Built 20+ custom WordPress and WooCommerce websites for small businesses including restaurants, boutiques, and service providers.', '["WordPress","PHP","Elementor","WooCommerce","CSS"]', false, 1, '2026-10-06 08:14:52', '2026-10-06 08:14:52', 'Iloilo City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (38, 38, 'E-commerce Web Developer', 'Self-employed / Freelance', 'Freelance', 'Jan 2024', NULL, 'Specializing in Shopify store builds and customizations for international clients. Managing recurring maintenance contracts for 12 active stores.', '["Shopify Liquid","Shopify","JavaScript","CSS","Google Analytics"]', true, 2, '2026-10-06 08:14:52', '2026-10-06 08:14:52', 'Iloilo City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (39, 39, 'Technical Support Agent', 'Transcom BPO', 'Full-time', 'Aug 2021', 'May 2022', 'Handled inbound tech support for a US mobile carrier, resolving device and service issues for 50+ customers per shift.', '["Customer Service","Technical Troubleshooting","CRM","Phone Support"]', false, 0, '2026-10-06 08:14:52', '2026-10-06 08:14:52', 'Cebu City', false);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (40, 39, 'Junior Mobile Developer', 'AppBuild Studio', 'Full-time', 'Jun 2022', 'Sep 2023', 'Developed cross-platform mobile features for a health and wellness app with 50K+ downloads on Google Play and App Store.', '["Flutter","Dart","Firebase","REST API","Git"]', false, 1, '2026-10-06 08:14:52', '2026-10-06 08:14:52', 'Cebu City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (41, 39, 'Mobile Developer', 'LogiMove Technologies', 'Full-time', 'Oct 2023', 'Dec 2025', 'Built a logistics tracking app from scratch that achieved 10K+ downloads in its first quarter. Implemented real-time GPS tracking and push notifications.', '["Flutter","React Native","Firebase","Google Maps API","REST API"]', false, 2, '2026-10-06 08:14:52', '2026-10-06 08:14:52', 'Cebu City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (42, 39, 'Lead Mobile Developer', 'LogiMove Technologies', 'Full-time', 'Jan 2026', NULL, 'Leading a 4-person mobile team, defining app architecture and release strategy for 3 active mobile products.', '["Flutter","React Native","Dart","CI\/CD","App Architecture","Leadership"]', true, 3, '2026-10-06 08:14:52', '2026-10-06 08:14:52', 'Cebu City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (43, 40, 'Customer Service Representative', 'IBEX Global', 'Full-time', 'Aug 2021', 'Jan 2022', 'Handled inbound customer concerns for a US retail account, maintained high CSAT scores throughout the engagement.', '["Customer Service","Call Handling","CRM","Active Listening"]', false, 0, '2026-10-06 08:14:53', '2026-10-06 08:14:53', 'Bacolod City', false);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (44, 40, 'HR Assistant', 'NovaTech Staffing Corp.', 'Full-time', 'Feb 2022', 'Dec 2023', 'Assisted in end-to-end recruitment, onboarding 60+ new hires annually, and maintaining employee records in SAP SuccessFactors.', '["Recruitment","Onboarding","HRIS","Payroll","Employee Records"]', false, 1, '2026-10-06 08:14:53', '2026-10-06 08:14:53', 'Bacolod City', false);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (45, 40, 'HR Specialist – Tech Recruitment', 'NovaTech Staffing Corp.', 'Full-time', 'Jan 2024', NULL, 'Specializing in sourcing and hiring IT professionals including developers, QA engineers, and DevOps specialists for BPO and tech clients.', '["Tech Recruitment","LinkedIn Sourcing","Job Description Writing","ATS","Interviewing"]', true, 2, '2026-10-06 08:14:53', '2026-10-06 08:14:53', 'Bacolod City', false);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (46, 41, 'IT Support Technician', 'DataLink Networks', 'Full-time', 'Jul 2021', 'Jun 2022', 'Provided end-user IT support, managed hardware lifecycle, and assisted in server and network maintenance for a 300-person organization.', '["Windows Server","Hardware Support","Active Directory","Helpdesk"]', false, 0, '2026-10-06 08:14:53', '2026-10-06 08:14:53', 'Mandaluyong City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (47, 41, 'Systems Administrator', 'DataLink Networks', 'Full-time', 'Jul 2022', 'Jun 2024', 'Managed on-premise server infrastructure, configured virtualized environments, and automated routine maintenance tasks reducing downtime by 30%.', '["Linux","VMware","Windows Server","Monitoring","Backup Solutions"]', false, 1, '2026-10-06 08:14:53', '2026-10-06 08:14:53', 'Mandaluyong City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (48, 41, 'DevOps Engineer', 'CloudBridge Solutions', 'Full-time', 'Jul 2024', NULL, 'Building and maintaining cloud infrastructure on AWS, implementing CI/CD pipelines in GitHub Actions, and automating deployment workflows for 15+ microservices.', '["AWS","Docker","Kubernetes","Terraform","CI\/CD","Ansible"]', true, 2, '2026-10-06 08:14:53', '2026-10-06 08:14:53', 'Mandaluyong City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (49, 42, 'Coding Tutor', 'Self-employed', 'Part-time', 'Oct 2021', NULL, 'Teaching programming fundamentals and data structures to college students and career shifters. Currently tutoring 6 active students online.', '["Python","Teaching","Java","Algorithm Design","Mentoring"]', true, 0, '2026-10-06 08:14:53', '2026-10-06 08:14:53', 'Quezon City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (50, 42, 'Research Assistant', 'University of the Philippines Diliman', 'Part-time', 'Aug 2022', 'Jul 2024', 'Assisted a faculty researcher in conducting experiments on NLP-based sentiment analysis models, co-authored a paper submitted to a local computing conference.', '["Research","Python","Data Analysis","LaTeX","Machine Learning"]', false, 1, '2026-10-06 08:14:53', '2026-10-06 08:14:53', 'Quezon City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (51, 42, 'Graduate Teaching Fellow', 'University of the Philippines Diliman', 'Part-time', 'Aug 2024', NULL, 'Facilitating laboratory sessions for an undergraduate Machine Learning course while completing MS thesis on transfer learning for low-resource Filipino text classification.', '["Teaching","Machine Learning","Python","TensorFlow","Academic Writing"]', true, 2, '2026-10-06 08:14:53', '2026-10-06 08:14:53', 'Quezon City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (52, 43, 'IT Helpdesk Technician', 'Accenture Philippines', 'Full-time', 'Aug 2021', 'Apr 2022', 'Provided L1/L2 technical support to internal employees, resolved ticket queues, and maintained SLA compliance.', '["Helpdesk","Windows","Active Directory","ServiceNow","ITIL"]', false, 0, '2026-10-06 08:14:53', '2026-10-06 08:14:53', 'Taguig City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (53, 43, 'Junior Security Analyst', 'ShieldNet Cybersecurity', 'Full-time', 'May 2022', 'Oct 2023', 'Monitored security event logs, conducted vulnerability assessments, and responded to tier-1 security incidents within a 24/7 SOC environment.', '["SIEM","Log Analysis","Vulnerability Scanning","Network Monitoring","OWASP"]', false, 1, '2026-10-06 08:14:53', '2026-10-06 08:14:53', 'Taguig City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (54, 43, 'Penetration Tester', 'ShieldNet Cybersecurity', 'Full-time', 'Nov 2023', NULL, 'Conducting web application, API, and network penetration tests for banking and government clients. Authored detailed security assessment reports and remediation roadmaps.', '["Penetration Testing","Kali Linux","Metasploit","Burp Suite","Python","Report Writing"]', true, 2, '2026-10-06 08:14:53', '2026-10-06 08:14:53', 'Taguig City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (55, 44, 'Sales Operations Coordinator', 'Megaworld Corp.', 'Full-time', 'Sep 2021', 'May 2022', 'Coordinated pre-selling and after-sales operations, maintained CRM data, and generated weekly sales pipeline reports for management.', '["CRM","Sales Coordination","MS Office","Reporting","Data Entry"]', false, 0, '2026-10-06 08:14:54', '2026-10-06 08:14:54', 'Quezon City', false);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (56, 44, 'Junior Business Analyst', 'TechBridge Consulting', 'Full-time', 'Jun 2022', 'Jul 2024', 'Gathered and documented business requirements from stakeholders, translated them into user stories and functional specs for dev teams working on ERP integrations.', '["Business Analysis","User Stories","JIRA","Agile\/Scrum","Stakeholder Interviews"]', false, 1, '2026-10-06 08:14:54', '2026-10-06 08:14:54', 'Quezon City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (57, 44, 'Business Analyst', 'GlobalEdge IT Services', 'Full-time', 'Aug 2024', NULL, 'Leading requirements analysis for a large-scale government digital transformation project, facilitating workshops with 10+ stakeholder groups and producing BRDs and functional specifications.', '["Business Analysis","JIRA","Confluence","Process Mapping","Data Modeling","SQL"]', true, 2, '2026-10-06 08:14:54', '2026-10-06 08:14:54', 'Quezon City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (58, 45, 'Junior Software Developer', 'CodingLab PH', 'Full-time', 'Aug 2021', 'Jun 2022', 'Developed backend features and REST APIs for internal tools and client projects in an Agile startup environment.', '["JavaScript","Node.js","Express.js","MongoDB","Git"]', false, 0, '2026-10-06 08:14:54', '2026-10-06 08:14:54', 'Quezon City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (59, 45, 'Backend Developer', 'HealthSync Technologies', 'Full-time', 'Jul 2022', 'Mar 2024', 'Built and maintained APIs for a healthcare SaaS platform, ensuring HIPAA-compliant data handling. Introduced unit testing culture that increased code coverage from 20% to 75%.', '["Node.js","Express.js","PostgreSQL","REST API","Jest","Docker"]', false, 1, '2026-10-06 08:14:54', '2026-10-06 08:14:54', 'Quezon City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (60, 45, 'Senior Backend Developer', 'FinPulse Fintech', 'Full-time', 'Apr 2024', NULL, 'Designing and building microservices for a digital payments platform processing 2M+ transactions monthly. Driving API versioning strategy and backend performance optimization.', '["Node.js","TypeScript","PostgreSQL","Microservices","Kafka","AWS"]', true, 2, '2026-10-06 08:14:54', '2026-10-06 08:14:54', 'Quezon City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (61, 46, 'Customer Service Agent', 'Teleperformance Philippines', 'Full-time', 'Aug 2021', 'Dec 2021', 'Handled customer inquiries via phone and email for a US-based retail client, maintaining consistent quality scores.', '["Customer Service","CRM","Communication","Email Support"]', false, 0, '2026-10-06 08:14:54', '2026-10-06 08:14:54', 'Bacolod City', false);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (62, 46, 'Content Writer & SEO Specialist', 'DigitalBoost Agency', 'Full-time', 'Jan 2022', 'Dec 2023', 'Produced SEO-optimized blog content and managed on-page SEO for 10+ client websites, improving organic traffic by 45% on average over 12 months.', '["SEO Writing","Ahrefs","Keyword Research","WordPress","Content Strategy"]', false, 1, '2026-10-06 08:14:54', '2026-10-06 08:14:54', 'Bacolod City', false);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (63, 46, 'Digital Marketing Specialist', 'GrowthHive Marketing', 'Full-time', 'Jan 2024', NULL, 'Managing paid media campaigns with a combined monthly budget of ₱3M+, optimizing conversion funnels, and reporting weekly performance metrics to 15 active clients.', '["Google Ads","Facebook Ads","SEO","Google Analytics","Email Marketing","CRO"]', true, 2, '2026-10-06 08:14:54', '2026-10-06 08:14:54', 'Bacolod City', false);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (64, 47, 'Freelance Game Developer', 'Self-employed', 'Freelance', 'Sep 2021', 'May 2022', 'Developed indie game prototypes and mod packs, releasing two free web games on itch.io that collectively received 5,000+ plays.', '["Unity","C#","Game Design","2D Game Development","Git"]', false, 0, '2026-10-06 08:14:54', '2026-10-06 08:14:54', 'Cebu City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (65, 47, 'Junior Game Programmer', 'Pixelion Game Studio', 'Full-time', 'Jun 2022', 'Sep 2023', 'Programmed core gameplay systems, multiplayer networking, and in-app purchase flows for two published mobile games on Google Play.', '["Unity","C#","Photon SDK","Shader Programming","Firebase"]', false, 1, '2026-10-06 08:14:54', '2026-10-06 08:14:54', 'Cebu City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (66, 47, 'Game Programmer', 'Pixelion Game Studio', 'Full-time', 'Oct 2023', NULL, 'Developing a new 3D mobile RPG title from conception to launch. Responsible for game engine optimization, shader development, and cross-platform build management.', '["Unity","C#","Blender","Multiplayer Networking","Performance Optimization"]', true, 2, '2026-10-06 08:14:54', '2026-10-06 08:14:54', 'Cebu City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (67, 48, 'Database Operator', 'GlobalData Corp.', 'Full-time', 'Aug 2021', 'May 2022', 'Performed routine database operations, executed SQL queries for reporting, and assisted in database backup and restore procedures.', '["MySQL","Data Entry","SQL Queries","Database Maintenance"]', false, 0, '2026-10-06 08:14:55', '2026-10-06 08:14:55', 'Manila City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (68, 48, 'Junior DBA', 'EnterpriseTech Solutions', 'Full-time', 'Jun 2022', 'Sep 2024', 'Managed and optimized databases for 20+ enterprise clients. Improved query performance by 40% through indexing strategies and query rewrites.', '["MySQL","PostgreSQL","Performance Tuning","Backup & Recovery","Replication"]', false, 1, '2026-10-06 08:14:55', '2026-10-06 08:14:55', 'Manila City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (69, 48, 'Senior DBA', 'EnterpriseTech Solutions', 'Full-time', 'Oct 2024', NULL, 'Overseeing database infrastructure for multi-TB production environments, implementing high-availability clustering, and leading a DBA team of 2.', '["MySQL","PostgreSQL","Oracle DB","SQL Server","HA Clustering","Linux"]', true, 2, '2026-10-06 08:14:55', '2026-10-06 08:14:55', 'Manila City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (70, 49, 'Junior Software Developer', 'AppFactory PH', 'Full-time', 'Sep 2021', 'Aug 2022', 'Developed features for a web-based inventory management system, participated in sprint planning and code reviews.', '["PHP","Laravel","JavaScript","MySQL","Git"]', false, 0, '2026-10-06 08:14:55', '2026-10-06 08:14:55', 'Pasig City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (71, 49, 'IT Project Coordinator', 'Integrated Systems Corp.', 'Full-time', 'Sep 2022', 'Dec 2023', 'Coordinated software delivery projects for banking clients, tracked milestones, facilitated stand-ups, and escalated blockers to project managers.', '["Project Coordination","JIRA","Agile","Risk Management","Documentation"]', false, 1, '2026-10-06 08:14:55', '2026-10-06 08:14:55', 'Ortigas, Pasig City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (72, 49, 'IT Project Manager', 'Integrated Systems Corp.', 'Full-time', 'Jan 2024', NULL, 'Managing 3 concurrent IT projects with combined budgets exceeding ₱15M, leading cross-functional teams of up to 15 and reporting to C-suite stakeholders.', '["Project Management","Agile\/Scrum","Budgeting","Stakeholder Mgmt","JIRA","MS Project"]', true, 2, '2026-10-06 08:14:55', '2026-10-06 08:14:55', 'Ortigas, Pasig City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (73, 50, 'Sales Associate', 'Iloilo City Mall', 'Full-time', 'Jul 2021', 'Nov 2021', 'Assisted customers, handled POS transactions, and managed product displays in the consumer electronics section.', '["Retail Sales","Customer Service","POS Systems","Cash Handling"]', false, 0, '2026-10-06 08:14:55', '2026-10-06 08:14:55', 'Iloilo City', false);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (74, 50, 'Manual QA Tester', 'DevSync Solutions', 'Full-time', 'Dec 2021', 'Nov 2022', 'Executed test cases for web and mobile apps, documented defects, and coordinated with developers to verify fixes.', '["Manual Testing","Test Case Writing","Bug Reporting","JIRA","Regression Testing"]', false, 1, '2026-10-06 08:14:55', '2026-10-06 08:14:55', 'Iloilo City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (75, 50, 'QA Automation Engineer', 'PaySwift Fintech', 'Full-time', 'Dec 2022', 'Feb 2025', 'Automated end-to-end test suites for a digital payments platform, reducing manual QA effort by 55% and enabling daily deployments.', '["Selenium","Cypress","Postman","API Testing","JavaScript","CI\/CD"]', false, 2, '2026-10-06 08:14:55', '2026-10-06 08:14:55', 'Iloilo City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (76, 50, 'Senior QA Engineer', 'PaySwift Fintech', 'Full-time', 'Mar 2025', NULL, 'Leading QA strategy for 2 product teams, defining testing standards, and integrating performance testing into the CI pipeline.', '["QA Strategy","Cypress","Selenium","Performance Testing","Test Architecture"]', true, 3, '2026-10-06 08:14:55', '2026-10-06 08:14:55', 'Iloilo City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (77, 51, 'Network Engineer Trainee', 'PeakNet ISP', 'Full-time', 'Aug 2021', 'Jul 2022', 'Assisted senior network engineers in configuring Cisco routers and switches, performing site surveys, and maintaining network documentation.', '["Cisco","Networking","LAN\/WAN","Network Troubleshooting","CCNA"]', false, 0, '2026-10-06 08:14:55', '2026-10-06 08:14:55', 'BGC, Taguig City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (78, 51, 'Network Engineer', 'PeakNet ISP', 'Full-time', 'Aug 2022', 'May 2024', 'Managed core ISP infrastructure serving 30,000+ subscribers. Led fiber rollout projects across 3 municipalities and implemented BGP peering with 2 new transit providers.', '["Cisco","BGP","OSPF","Firewall","VPN","Network Monitoring"]', false, 1, '2026-10-06 08:14:55', '2026-10-06 08:14:55', 'BGC, Taguig City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (79, 51, 'Cloud Solutions Architect', 'NimbusTech PH', 'Full-time', 'Jun 2024', NULL, 'Designing cloud-native architectures on AWS for enterprise clients, reducing infrastructure costs by 35% on average through right-sizing and reserved instance strategies.', '["AWS","Terraform","CloudFormation","Kubernetes","Docker","Cost Optimization"]', true, 2, '2026-10-06 08:14:55', '2026-10-06 08:14:55', 'BGC, Taguig City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (80, 52, 'Encoder / Administrative Aide', 'LGU Bacolod City', 'Full-time', 'Sep 2021', 'Mar 2022', 'Encoded citizen data and maintained official records for the City Health Office, ensuring accuracy and timely submission of reports.', '["Data Entry","MS Office","Document Filing","Public Service"]', false, 0, '2026-10-06 08:14:56', '2026-10-06 08:14:56', 'Bacolod City', false);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (81, 52, 'Junior Technical Writer', 'DevDocs Manila', 'Full-time', 'Apr 2022', 'Jun 2024', 'Wrote and maintained developer documentation for REST APIs, SDKs, and internal wikis. Collaborated with engineering teams to ensure accuracy and completeness.', '["Technical Writing","Markdown","API Documentation","Swagger\/OpenAPI","Confluence"]', false, 1, '2026-10-06 08:14:56', '2026-10-06 08:14:56', 'Bacolod City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (82, 52, 'Senior Technical Writer', 'DevDocs Manila', 'Full-time', 'Jul 2024', NULL, 'Leading documentation strategy for 3 product teams, authoring API references used by 500+ external developers, and mentoring 2 junior technical writers.', '["API Documentation","Developer Experience","Style Guide Creation","Git","OpenAPI"]', true, 2, '2026-10-06 08:14:56', '2026-10-06 08:14:56', 'Bacolod City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (83, 53, 'Junior Software Developer', 'InfoTech Builders', 'Full-time', 'Aug 2021', 'Mar 2022', 'Developed backend modules for a company HRIS system, wrote unit tests, and participated in code review sessions.', '["Python","Django","MySQL","REST API","Git"]', false, 0, '2026-10-06 08:14:56', '2026-10-06 08:14:56', 'Mandaluyong City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (84, 53, 'Data Scientist', 'Analytix Solutions', 'Full-time', 'Apr 2022', 'Mar 2024', 'Built predictive models for churn analysis and credit scoring for retail banking clients, deploying models via REST APIs consumed by production systems.', '["Python","scikit-learn","Pandas","TensorFlow","SQL","Data Visualization"]', false, 1, '2026-10-06 08:14:56', '2026-10-06 08:14:56', 'Mandaluyong City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (85, 53, 'Machine Learning Engineer', 'DeepVision AI', 'Full-time', 'Apr 2024', NULL, 'Training and deploying production ML models for document OCR and defect detection pipelines serving manufacturing clients across Southeast Asia.', '["PyTorch","TensorFlow","Computer Vision","NLP","Python","MLOps","AWS SageMaker"]', true, 2, '2026-10-06 08:14:56', '2026-10-06 08:14:56', 'Mandaluyong City', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (86, 54, 'Warehouse Associate', 'LBC Express', 'Full-time', 'Jul 2021', 'Dec 2021', 'Processed inbound and outbound shipments, maintained accurate inventory records, and ensured timely parcel sorting.', '["Inventory Counting","Logistics","Packing","Teamwork"]', false, 0, '2026-10-06 08:14:56', '2026-10-06 08:14:56', 'Mandaluyong City', false);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (87, 54, 'E-commerce Operations Coordinator', 'ShopNow Philippines', 'Full-time', 'Jan 2022', 'Dec 2023', 'Managed day-to-day operations for 4 online store accounts on Lazada and Shopee, coordinating logistics, inventory replenishment, and seller ratings maintenance.', '["Lazada Seller Center","Shopee Seller Tools","Order Management","Excel","Customer Service"]', false, 1, '2026-10-06 08:14:56', '2026-10-06 08:14:56', 'Mandaluyong City', false);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (88, 54, 'E-commerce Operations Manager', 'ShopNow Philippines', 'Full-time', 'Jan 2024', NULL, 'Leading a team of 8 operations staff, managing 12 online store accounts generating ₱8M+ monthly GMV. Implemented Power BI dashboards that reduced reporting time by 70%.', '["Operations Management","Supply Chain","Power BI","Team Leadership","Process Improvement"]', true, 2, '2026-10-06 08:14:56', '2026-10-06 08:14:56', 'Mandaluyong City', false);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (89, 31, 'OJT Trainee / IT Intern', 'Host Training Establishment', 'Internship', 'Start', 'Oct 2026', 'Completed 600 hours of On-the-Job Training (OJT) practicum at Host Training Establishment. Verified by host company supervisor and academic coordinator.', '["On-the-Job Training","Industry Practicum","Professional Ethics"]', false, 0, '2026-10-12 01:14:37', '2026-10-12 01:14:37', 'Philippines', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (90, 14, 'OJT Trainee / IT Intern', 'Na Ah Company', 'Internship', 'Jun 2026', 'Oct 2026', 'Completed 600 hours of On-the-Job Training (OJT) practicum at Na Ah Company (Evaluation Rating: 5/5.0). Verified by host company supervisor and academic coordinator. Recommendation: Highly Recommended - Ready for immediate employment', '["On-the-Job Training","Industry Practicum","Professional Ethics"]', false, 0, '2026-10-12 14:42:46', '2026-10-12 14:42:46', '45 Rizal St., Bacolod City, Negros Occidental', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (91, 49, 'OJT Trainee / IT Intern', 'Host Training Establishment', 'Internship', 'Start', 'Oct 2026', 'Completed 600 hours of On-the-Job Training (OJT) practicum at Host Training Establishment. Verified by host company supervisor and academic coordinator.', '["On-the-Job Training","Industry Practicum","Professional Ethics"]', false, 0, '2026-10-17 00:13:57', '2026-10-17 00:13:57', 'Philippines', true);
INSERT INTO public.student_experiences (id, user_id, role, company, type, period_start, period_end, description, skills, is_current, sort_order, created_at, updated_at, location, is_it_related) VALUES (92, 33, 'OJT Trainee / IT Intern', 'Host Training Establishment', 'Internship', 'Start', 'Oct 2026', 'Completed 600 hours of On-the-Job Training (OJT) practicum at Host Training Establishment. Verified by host company supervisor and academic coordinator.', '["On-the-Job Training","Industry Practicum","Professional Ethics"]', false, 0, '2026-10-17 14:10:32', '2026-10-17 14:10:32', 'Philippines', true);


--
-- Data for Name: student_ojt_interests; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.student_ojt_interests (id, student_user_id, ojt_posting_id, status, student_message, endorsed_by, endorsed_at, created_at, updated_at, endorsement_letter, company_accepted_at, endorsement_requested_at, ojt_started_at, resume_viewed_at, company_note, interview_scheduled_at, interview_type, interview_location, coordinator_note, endorsement_letter_sent_at, ojt_start_date, ojt_instructions, schedule_days, shift_start, shift_end, lunch_start, lunch_end, has_lunch_break, daily_hours, weekly_hours, allow_overtime, max_overtime_hours, estimated_end_date) VALUES (1, 2, 1, 'interview_scheduled', NULL, 5, '2026-10-05 16:32:32', '2026-10-05 16:16:30', '2026-10-05 16:38:10', 'endorsement-letters/8YN814ZUAtMcnNsLubl1BpcNvfIgoODtqbeOCQRd.pdf', '2026-10-05 16:29:22', '2026-10-05 16:30:28', NULL, '2026-10-05 16:29:14', 'donot be late', '2026-10-10 13:00:00', 'face_to_face', 'BACOLOD CITY', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, NULL, false, NULL, NULL);
INSERT INTO public.student_ojt_interests (id, student_user_id, ojt_posting_id, status, student_message, endorsed_by, endorsed_at, created_at, updated_at, endorsement_letter, company_accepted_at, endorsement_requested_at, ojt_started_at, resume_viewed_at, company_note, interview_scheduled_at, interview_type, interview_location, coordinator_note, endorsement_letter_sent_at, ojt_start_date, ojt_instructions, schedule_days, shift_start, shift_end, lunch_start, lunch_end, has_lunch_break, daily_hours, weekly_hours, allow_overtime, max_overtime_hours, estimated_end_date) VALUES (2, 3, 1, 'ojt_confirmed', 'Good day! I am Maria Santos, 4th Year BSIT student. I have completed my pre-deployment requirements and I am very interested in applying for the IT Support Intern position at PGLang.', 5, '2026-10-05 16:31:00', '2026-10-05 16:53:27', '2026-10-05 16:57:40', 'endorsement-letters/endorsement_letter_maria_santos.pdf', '2026-10-05 16:26:00', '2026-10-05 16:28:00', NULL, '2026-10-05 16:25:30', 'Interview completed. Maria demonstrated impressive problem-solving, hardware troubleshooting acumen, and professionalism. Formally accepted for the IT Support Intern role.', '2026-10-05 18:00:00', 'face_to_face', 'PGLang Headquarters, Unit 4 TechPark Bldg, Lacson St., Bacolod City', 'yizzz', '2026-10-05 16:31:00', '2026-10-11', 'Dont be late', '["Mon","Tue","Wed","Thu","Fri"]', '08:00', '17:00', '12:00', '13:00', true, 8.00, 40.00, false, 0.00, '2027-01-22');
INSERT INTO public.student_ojt_interests (id, student_user_id, ojt_posting_id, status, student_message, endorsed_by, endorsed_at, created_at, updated_at, endorsement_letter, company_accepted_at, endorsement_requested_at, ojt_started_at, resume_viewed_at, company_note, interview_scheduled_at, interview_type, interview_location, coordinator_note, endorsement_letter_sent_at, ojt_start_date, ojt_instructions, schedule_days, shift_start, shift_end, lunch_start, lunch_end, has_lunch_break, daily_hours, weekly_hours, allow_overtime, max_overtime_hours, estimated_end_date) VALUES (14, 14, 10, 'completed', 'Dear Na Ah Company Hiring Team, I am Alyssa Nicole Castro, a 4th-year BSIT student. I have a strong passion for frontend engineering and modern web stacks. I look forward to rendering my 600-hour OJT with your development team.', 5, '2026-06-12 11:00:00', '2026-10-06 03:19:43', '2026-10-12 14:42:46', 'endorsement-letters/endorsement_alyssa_nicole_castro_naah.pdf', '2026-06-10 14:00:00', '2026-06-11 10:30:00', '2026-06-22 00:00:00', '2026-06-10 14:00:00', 'Candidate demonstrated exceptional proficiency during the technical panel and great collaborative aptitude. Accepted for 600-hour practicum placement.', '2026-06-16 10:00:00', 'face_to_face', 'Na Ah Company Tech Hub, 45 Rizal St., Bacolod City (Conference Room B)', 'Official OJT clearance granted. Alyssa Nicole Castro is officially deployed to Na Ah Company for 600 hours of industry training.', '2026-06-12 11:00:00', '2026-06-22', 'Report to Na Ah Company Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp on June 22, 2026. Bring your CHMSU student ID and personal developer laptop. Look for Ms. Karen at reception.', '["Mon","Tue","Wed","Thu","Fri"]', '08:00', '17:00', '12:00', '13:00', true, 8.00, 40.00, false, 0.00, '2026-10-02');
INSERT INTO public.student_ojt_interests (id, student_user_id, ojt_posting_id, status, student_message, endorsed_by, endorsed_at, created_at, updated_at, endorsement_letter, company_accepted_at, endorsement_requested_at, ojt_started_at, resume_viewed_at, company_note, interview_scheduled_at, interview_type, interview_location, coordinator_note, endorsement_letter_sent_at, ojt_start_date, ojt_instructions, schedule_days, shift_start, shift_end, lunch_start, lunch_end, has_lunch_break, daily_hours, weekly_hours, allow_overtime, max_overtime_hours, estimated_end_date) VALUES (13, 13, 10, 'ojt_started', 'Good day! I am Mark Vincent Tan, a 4th-year BSIT student at CHMSU Talisay. I am eager to contribute to Na Ah Company''s Cloud Infrastructure & Systems Division and complete my 600-hour practicum under your esteemed team.', 5, '2026-06-12 11:00:00', '2026-10-06 03:19:43', '2026-10-06 03:19:44', 'endorsement-letters/endorsement_mark_vincent_tan_naah.pdf', '2026-06-10 14:00:00', '2026-06-11 10:30:00', '2026-06-22 00:00:00', '2026-06-10 14:00:00', 'Candidate demonstrated exceptional proficiency during the technical panel and great collaborative aptitude. Accepted for 600-hour practicum placement.', '2026-06-16 10:00:00', 'face_to_face', 'Na Ah Company Tech Hub, 45 Rizal St., Bacolod City (Conference Room B)', 'Official OJT clearance granted. Mark Vincent Tan is officially deployed to Na Ah Company for 600 hours of industry training.', '2026-06-12 11:00:00', '2026-06-22', 'Report to Na Ah Company Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp on June 22, 2026. Bring your CHMSU student ID and personal developer laptop. Look for Ms. Karen at reception.', '["Mon","Tue","Wed","Thu","Fri"]', '08:00', '17:00', '12:00', '13:00', true, 8.00, 40.00, false, 0.00, '2026-10-02');
INSERT INTO public.student_ojt_interests (id, student_user_id, ojt_posting_id, status, student_message, endorsed_by, endorsed_at, created_at, updated_at, endorsement_letter, company_accepted_at, endorsement_requested_at, ojt_started_at, resume_viewed_at, company_note, interview_scheduled_at, interview_type, interview_location, coordinator_note, endorsement_letter_sent_at, ojt_start_date, ojt_instructions, schedule_days, shift_start, shift_end, lunch_start, lunch_end, has_lunch_break, daily_hours, weekly_hours, allow_overtime, max_overtime_hours, estimated_end_date) VALUES (6, 12, 4, 'withdrawn_emergency', 'Good day! I am Kevin Morales, a 4th-year BSIT student from CHMSU. I am passionate about web development and eager to render my 600-hour internship at Na Ah Company. I have attached my verified requirements packet and portfolio. Thank you!', 5, '2026-10-04 13:45:08', '2026-10-05 17:45:08', '2026-10-11 14:17:02', 'endorsement-letters/endorsement_kevin_morales_naah_company.pdf', '2026-10-04 10:45:08', '2026-10-04 11:45:08', '2026-10-05 17:45:08', '2026-10-04 09:45:08', 'Kevin passed the technical interview with flying colors. Strong problem-solving abilities and great cultural fit. We are thrilled to welcome Kevin to our team!', '2026-10-05 12:45:08', 'face_to_face', 'Na Ah Company Tech Hub, 45 Rizal St., Bacolod City (Room 302)', 'Final clearance approved. Kevin Morales has met all CHMSU College of Information and Communications Technology internship criteria. Officially deployed to Na Ah Company for 600 hours.', NULL, '2026-10-06', 'Welcome to Na Ah Company! Report to Na Ah Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp. Bring your CHMSU student ID and laptop. Look for Ms. Karen at reception.', '["Mon","Tue","Wed","Thu","Fri"]', '08:00', '17:00', '12:00', '13:00', true, 8.00, 40.00, false, 0.00, '2027-02-05');
INSERT INTO public.student_ojt_interests (id, student_user_id, ojt_posting_id, status, student_message, endorsed_by, endorsed_at, created_at, updated_at, endorsement_letter, company_accepted_at, endorsement_requested_at, ojt_started_at, resume_viewed_at, company_note, interview_scheduled_at, interview_type, interview_location, coordinator_note, endorsement_letter_sent_at, ojt_start_date, ojt_instructions, schedule_days, shift_start, shift_end, lunch_start, lunch_end, has_lunch_break, daily_hours, weekly_hours, allow_overtime, max_overtime_hours, estimated_end_date) VALUES (15, 55, 11, 'interview_scheduled', 'Good day, Na Ah Company Hiring Team! I am Dave Salvador, a 4th-year BSIT student from CHMSU. I specialize in Software Quality Assurance, test automation with Cypress/Postman, and test case authoring. I am eager to render my 600-hour practicum with your engineering team. My verified requirements and portfolio are ready for your review. Thank you!', 5, '2026-10-05 04:13:45', '2026-10-06 09:13:45', '2026-10-06 09:13:45', 'endorsement-letters/endorsement_dave_salvador_naah_company.pdf', '2026-10-05 00:13:45', '2026-10-05 01:13:45', NULL, '2026-10-04 23:13:45', 'Please arrive 15 minutes before schedule. Bring your CHMSU student ID, a printed copy of your endorsement letter, and developer laptop for a practical test case design walkthrough.', '2026-10-06 05:13:45', 'face_to_face', 'Na Ah Company Tech Hub, 45 Rizal St., Bacolod City (QA Assessment Lab 2)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, NULL, false, NULL, NULL);
INSERT INTO public.student_ojt_interests (id, student_user_id, ojt_posting_id, status, student_message, endorsed_by, endorsed_at, created_at, updated_at, endorsement_letter, company_accepted_at, endorsement_requested_at, ojt_started_at, resume_viewed_at, company_note, interview_scheduled_at, interview_type, interview_location, coordinator_note, endorsement_letter_sent_at, ojt_start_date, ojt_instructions, schedule_days, shift_start, shift_end, lunch_start, lunch_end, has_lunch_break, daily_hours, weekly_hours, allow_overtime, max_overtime_hours, estimated_end_date) VALUES (16, 15, 6, 'rejected', NULL, NULL, NULL, '2026-10-08 00:45:31', '2026-10-08 00:47:04', NULL, '2026-10-08 00:46:24', NULL, NULL, '2026-10-08 00:45:58', 'you are not qualified', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, NULL, false, NULL, NULL);
INSERT INTO public.student_ojt_interests (id, student_user_id, ojt_posting_id, status, student_message, endorsed_by, endorsed_at, created_at, updated_at, endorsement_letter, company_accepted_at, endorsement_requested_at, ojt_started_at, resume_viewed_at, company_note, interview_scheduled_at, interview_type, interview_location, coordinator_note, endorsement_letter_sent_at, ojt_start_date, ojt_instructions, schedule_days, shift_start, shift_end, lunch_start, lunch_end, has_lunch_break, daily_hours, weekly_hours, allow_overtime, max_overtime_hours, estimated_end_date) VALUES (17, 15, 1, 'interested', NULL, NULL, NULL, '2026-10-08 00:47:53', '2026-10-08 00:47:53', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, NULL, false, NULL, NULL);
INSERT INTO public.student_ojt_interests (id, student_user_id, ojt_posting_id, status, student_message, endorsed_by, endorsed_at, created_at, updated_at, endorsement_letter, company_accepted_at, endorsement_requested_at, ojt_started_at, resume_viewed_at, company_note, interview_scheduled_at, interview_type, interview_location, coordinator_note, endorsement_letter_sent_at, ojt_start_date, ojt_instructions, schedule_days, shift_start, shift_end, lunch_start, lunch_end, has_lunch_break, daily_hours, weekly_hours, allow_overtime, max_overtime_hours, estimated_end_date) VALUES (18, 23, 6, 'interview_scheduled', NULL, 5, '2026-10-08 19:09:15', '2026-10-08 19:05:29', '2026-10-08 19:11:41', 'endorsement-letters/K8iDYL0cbe9S7jzqSpmzJpbXBv4adNA2lw4UC5sU.pdf', '2026-10-08 19:07:30', '2026-10-08 19:08:24', NULL, '2026-10-08 19:07:01', 'Dont be late and bring all the requirements', '2026-10-17 13:00:00', 'face_to_face', 'BACOLOD CITY', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, NULL, false, NULL, NULL);
INSERT INTO public.student_ojt_interests (id, student_user_id, ojt_posting_id, status, student_message, endorsed_by, endorsed_at, created_at, updated_at, endorsement_letter, company_accepted_at, endorsement_requested_at, ojt_started_at, resume_viewed_at, company_note, interview_scheduled_at, interview_type, interview_location, coordinator_note, endorsement_letter_sent_at, ojt_start_date, ojt_instructions, schedule_days, shift_start, shift_end, lunch_start, lunch_end, has_lunch_break, daily_hours, weekly_hours, allow_overtime, max_overtime_hours, estimated_end_date) VALUES (25, 58, 14, 'pulled_out', 'Good day! I am Joshua Vance Rivera, a 4th-year BSIT student at CHMSU. I am passionate about cloud infrastructure and web systems. I am excited to apply my skills to Na Ah Company and complete my 600-hour industry training.', 5, '2026-10-12 14:00:00', '2026-10-14 02:34:03', '2026-10-14 11:34:59', 'endorsement-letters/endorsement_joshua_vance_rivera_naah.pdf', '2026-10-13 16:00:00', '2026-10-11 10:45:00', '2026-10-14 02:34:03', '2026-10-11 10:30:00', 'Candidate demonstrated exceptional performance during the technical panel and exhibited strong team collaboration aptitude. Formally accepted for 600-hour practicum placement.', '2026-10-13 09:00:00', 'face_to_face', 'Na Ah Company Tech Hub, 45 Rizal St., Bacolod City (Conference Room B)', 'Official OJT clearance and institutional deployment granted. Joshua Vance Rivera is officially cleared to render 600 hours at Na Ah Company.', '2026-10-12 14:00:00', '2026-10-14', 'Report to Na Ah Company Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp on October 14, 2026. Bring your CHMSU student ID and personal development laptop. Report to Ms. Karen dela Rosa at IT Reception.', '["Mon","Tue","Wed","Thu","Fri"]', '08:00', '17:00', '12:00', '13:00', true, 8.00, 40.00, false, 0.00, '2027-03-14');
INSERT INTO public.student_ojt_interests (id, student_user_id, ojt_posting_id, status, student_message, endorsed_by, endorsed_at, created_at, updated_at, endorsement_letter, company_accepted_at, endorsement_requested_at, ojt_started_at, resume_viewed_at, company_note, interview_scheduled_at, interview_type, interview_location, coordinator_note, endorsement_letter_sent_at, ojt_start_date, ojt_instructions, schedule_days, shift_start, shift_end, lunch_start, lunch_end, has_lunch_break, daily_hours, weekly_hours, allow_overtime, max_overtime_hours, estimated_end_date) VALUES (27, 22, 14, 'pulled_out', 'Greetings! I am Bea Bianca Castillo, a senior BSIT student. I specialize in backend database systems and API development. I look forward to working with Na Ah Company to deliver high-quality software solutions.', 5, '2026-10-12 14:00:00', '2026-10-14 02:34:03', '2026-10-14 12:39:30', 'endorsement-letters/endorsement_bea_bianca_castillo_naah.pdf', '2026-10-13 16:00:00', '2026-10-11 10:45:00', '2026-10-14 02:34:03', '2026-10-11 10:30:00', 'Candidate demonstrated exceptional performance during the technical panel and exhibited strong team collaboration aptitude. Formally accepted for 600-hour practicum placement.', '2026-10-13 13:30:00', 'face_to_face', 'Na Ah Company Tech Hub, 45 Rizal St., Bacolod City (Conference Room B)', 'Official OJT clearance and institutional deployment granted. Bea Bianca Castillo is officially cleared to render 600 hours at Na Ah Company.', '2026-10-12 14:00:00', '2026-10-14', 'Report to Na Ah Company Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp on October 14, 2026. Bring your CHMSU student ID and personal development laptop. Report to Ms. Karen dela Rosa at IT Reception.', '["Mon","Tue","Wed","Thu","Fri"]', '08:00', '17:00', '12:00', '13:00', true, 8.00, 40.00, false, 0.00, '2027-03-14');
INSERT INTO public.student_ojt_interests (id, student_user_id, ojt_posting_id, status, student_message, endorsed_by, endorsed_at, created_at, updated_at, endorsement_letter, company_accepted_at, endorsement_requested_at, ojt_started_at, resume_viewed_at, company_note, interview_scheduled_at, interview_type, interview_location, coordinator_note, endorsement_letter_sent_at, ojt_start_date, ojt_instructions, schedule_days, shift_start, shift_end, lunch_start, lunch_end, has_lunch_break, daily_hours, weekly_hours, allow_overtime, max_overtime_hours, estimated_end_date) VALUES (30, 21, 15, 'ojt_started', 'Greetings! I am John Paul Bautista, senior BSIT student at CHMSU Talisay. I specialize in database management and backend web systems. I am eager to contribute to Na Ah Company and expand my technical competencies.', 5, '2026-10-14 14:00:00', '2026-10-17 12:09:28', '2026-10-17 12:09:29', 'endorsement-letters/endorsement_john_paul_bautista_naah.pdf', '2026-10-16 16:00:00', '2026-10-13 10:30:00', '2026-10-17 12:09:29', '2026-10-13 10:15:00', 'Candidate demonstrated exceptional performance during the technical interview panel and exhibited strong team collaboration aptitude. Formally accepted for 600-hour practicum placement.', '2026-10-16 13:30:00', 'face_to_face', 'Na Ah Company Tech Hub, 45 Rizal St., Bacolod City (Conference Room B)', 'Official OJT clearance and institutional deployment granted. John Paul Bautista is officially cleared to render 600 hours at Na Ah Company.', '2026-10-14 14:00:00', '2026-10-17', 'Welcome to Na Ah Company! Report to Na Ah Company Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp on Saturday, October 17, 2026. Weekend operations enabled. Bring your CHMSU student ID and personal developer laptop.', '["Sat","Sun","Mon","Tue","Wed","Thu","Fri"]', '08:00', '17:00', '13:00', '14:00', true, 8.00, 40.00, false, 0.00, '2027-03-17');
INSERT INTO public.student_ojt_interests (id, student_user_id, ojt_posting_id, status, student_message, endorsed_by, endorsed_at, created_at, updated_at, endorsement_letter, company_accepted_at, endorsement_requested_at, ojt_started_at, resume_viewed_at, company_note, interview_scheduled_at, interview_type, interview_location, coordinator_note, endorsement_letter_sent_at, ojt_start_date, ojt_instructions, schedule_days, shift_start, shift_end, lunch_start, lunch_end, has_lunch_break, daily_hours, weekly_hours, allow_overtime, max_overtime_hours, estimated_end_date) VALUES (28, 59, 15, 'ojt_started', 'Dear Na Ah Company Hiring Team, I am Cedric Miguel Ramos, a senior BSIT student at CHMSU. I specialize in cloud infrastructure and full-stack software development. I am excited to apply my skills to your Systems Engineering Division and complete my 600-hour practicum training.', 5, '2026-10-14 14:00:00', '2026-10-17 12:09:28', '2026-10-17 12:09:29', 'endorsement-letters/endorsement_cedric_miguel_ramos_naah.pdf', '2026-10-16 16:00:00', '2026-10-13 10:30:00', '2026-10-17 12:09:29', '2026-10-13 10:15:00', 'Candidate demonstrated exceptional performance during the technical interview panel and exhibited strong team collaboration aptitude. Formally accepted for 600-hour practicum placement.', '2026-10-16 09:00:00', 'face_to_face', 'Na Ah Company Tech Hub, 45 Rizal St., Bacolod City (Conference Room B)', 'Official OJT clearance and institutional deployment granted. Cedric Miguel Ramos is officially cleared to render 600 hours at Na Ah Company.', '2026-10-14 14:00:00', '2026-10-17', 'Welcome to Na Ah Company! Report to Na Ah Company Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp on Saturday, October 17, 2026. Weekend operations enabled. Bring your CHMSU student ID and personal developer laptop.', '["Sat","Sun","Mon","Tue","Wed","Thu","Fri"]', '08:00', '17:00', '13:00', '14:00', true, 8.00, 40.00, false, 0.00, '2027-03-17');
INSERT INTO public.student_ojt_interests (id, student_user_id, ojt_posting_id, status, student_message, endorsed_by, endorsed_at, created_at, updated_at, endorsement_letter, company_accepted_at, endorsement_requested_at, ojt_started_at, resume_viewed_at, company_note, interview_scheduled_at, interview_type, interview_location, coordinator_note, endorsement_letter_sent_at, ojt_start_date, ojt_instructions, schedule_days, shift_start, shift_end, lunch_start, lunch_end, has_lunch_break, daily_hours, weekly_hours, allow_overtime, max_overtime_hours, estimated_end_date) VALUES (26, 18, 14, 'ojt_started', 'Dear Na Ah Company Hiring Team, I am Althea Joy Villanueva, a 4th-year BSIT student at CHMSU. I have developed several web applications and design systems. I would love to contribute to your enterprise solutions as an intern.', 5, '2026-10-12 14:00:00', '2026-10-14 02:34:03', '2026-10-15 21:00:46', 'endorsement-letters/endorsement_althea_joy_villanueva_naah.pdf', '2026-10-13 16:00:00', '2026-10-11 10:45:00', '2026-10-14 02:34:03', '2026-10-11 10:30:00', 'Candidate demonstrated exceptional performance during the technical panel and exhibited strong team collaboration aptitude. Formally accepted for 600-hour practicum placement.', '2026-10-13 10:30:00', 'face_to_face', 'Na Ah Company Tech Hub, 45 Rizal St., Bacolod City (Conference Room B)', 'Official OJT clearance and institutional deployment granted. Althea Joy Villanueva is officially cleared to render 600 hours at Na Ah Company.', '2026-10-12 14:00:00', '2026-10-14', 'Report to Na Ah Company Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp on October 14, 2026. Bring your CHMSU student ID and personal development laptop. Report to Ms. Karen dela Rosa at IT Reception.', '["Mon","Tue","Wed","Thu","Fri"]', '08:00', '17:00', '12:00', '13:00', true, 8.00, 40.00, false, 0.00, '2027-03-14');
INSERT INTO public.student_ojt_interests (id, student_user_id, ojt_posting_id, status, student_message, endorsed_by, endorsed_at, created_at, updated_at, endorsement_letter, company_accepted_at, endorsement_requested_at, ojt_started_at, resume_viewed_at, company_note, interview_scheduled_at, interview_type, interview_location, coordinator_note, endorsement_letter_sent_at, ojt_start_date, ojt_instructions, schedule_days, shift_start, shift_end, lunch_start, lunch_end, has_lunch_break, daily_hours, weekly_hours, allow_overtime, max_overtime_hours, estimated_end_date) VALUES (29, 20, 15, 'ojt_started', 'Good day! I am Princess Nicole Reyes, a 4th-year BSIT student at CHMSU. I am passionate about frontend component systems and responsive web design. I would love to contribute to Na Ah Company as a frontend engineering intern.', 5, '2026-10-14 14:00:00', '2026-10-17 12:09:28', '2026-10-17 12:09:29', 'endorsement-letters/endorsement_princess_nicole_reyes_naah.pdf', '2026-10-16 16:00:00', '2026-10-13 10:30:00', '2026-10-17 12:09:29', '2026-10-13 10:15:00', 'Candidate demonstrated exceptional performance during the technical interview panel and exhibited strong team collaboration aptitude. Formally accepted for 600-hour practicum placement.', '2026-10-16 10:30:00', 'face_to_face', 'Na Ah Company Tech Hub, 45 Rizal St., Bacolod City (Conference Room B)', 'Official OJT clearance and institutional deployment granted. Princess Nicole Reyes is officially cleared to render 600 hours at Na Ah Company.', '2026-10-14 14:00:00', '2026-10-17', 'Welcome to Na Ah Company! Report to Na Ah Company Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp on Saturday, October 17, 2026. Weekend operations enabled. Bring your CHMSU student ID and personal developer laptop.', '["Sat","Sun","Mon","Tue","Wed","Thu","Fri"]', '08:00', '17:00', '13:00', '14:00', true, 8.00, 40.00, false, 0.00, '2027-03-17');
INSERT INTO public.student_ojt_interests (id, student_user_id, ojt_posting_id, status, student_message, endorsed_by, endorsed_at, created_at, updated_at, endorsement_letter, company_accepted_at, endorsement_requested_at, ojt_started_at, resume_viewed_at, company_note, interview_scheduled_at, interview_type, interview_location, coordinator_note, endorsement_letter_sent_at, ojt_start_date, ojt_instructions, schedule_days, shift_start, shift_end, lunch_start, lunch_end, has_lunch_break, daily_hours, weekly_hours, allow_overtime, max_overtime_hours, estimated_end_date) VALUES (32, 15, 14, 'endorsed', NULL, 60, '2026-10-17 16:12:25', '2026-10-17 16:11:19', '2026-10-17 16:12:25', 'endorsement-letters/nc00V3Pd2KXWjORop1VdOiAZEdsyJnGBNUAPjLXj.png', '2026-10-17 16:11:40', '2026-10-17 16:11:57', NULL, '2026-10-17 16:11:31', 'We have reviewed your profile and portfolio and would like to proceed with your application.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, NULL, false, NULL, NULL);
INSERT INTO public.student_ojt_interests (id, student_user_id, ojt_posting_id, status, student_message, endorsed_by, endorsed_at, created_at, updated_at, endorsement_letter, company_accepted_at, endorsement_requested_at, ojt_started_at, resume_viewed_at, company_note, interview_scheduled_at, interview_type, interview_location, coordinator_note, endorsement_letter_sent_at, ojt_start_date, ojt_instructions, schedule_days, shift_start, shift_end, lunch_start, lunch_end, has_lunch_break, daily_hours, weekly_hours, allow_overtime, max_overtime_hours, estimated_end_date) VALUES (34, 22, 6, 'interested', NULL, NULL, NULL, '2026-10-21 11:22:35', '2026-10-21 11:22:35', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, NULL, false, NULL, NULL);
INSERT INTO public.student_ojt_interests (id, student_user_id, ojt_posting_id, status, student_message, endorsed_by, endorsed_at, created_at, updated_at, endorsement_letter, company_accepted_at, endorsement_requested_at, ojt_started_at, resume_viewed_at, company_note, interview_scheduled_at, interview_type, interview_location, coordinator_note, endorsement_letter_sent_at, ojt_start_date, ojt_instructions, schedule_days, shift_start, shift_end, lunch_start, lunch_end, has_lunch_break, daily_hours, weekly_hours, allow_overtime, max_overtime_hours, estimated_end_date) VALUES (31, 15, 15, 'interview_scheduled', NULL, 57, '2026-10-17 13:50:42', '2026-10-17 13:47:19', '2026-10-17 13:52:36', 'endorsement-letters/EQtjdjfFDw2NueEV15ZvTNAuPfKy8Hk0SCiEVHrg.png', '2026-10-17 13:49:04', '2026-10-17 13:49:33', NULL, '2026-10-17 13:48:42', 'interview', '2026-10-22 13:52:00', 'face_to_face', 'BACOLOD CITY', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, NULL, false, NULL, NULL);
INSERT INTO public.student_ojt_interests (id, student_user_id, ojt_posting_id, status, student_message, endorsed_by, endorsed_at, created_at, updated_at, endorsement_letter, company_accepted_at, endorsement_requested_at, ojt_started_at, resume_viewed_at, company_note, interview_scheduled_at, interview_type, interview_location, coordinator_note, endorsement_letter_sent_at, ojt_start_date, ojt_instructions, schedule_days, shift_start, shift_end, lunch_start, lunch_end, has_lunch_break, daily_hours, weekly_hours, allow_overtime, max_overtime_hours, estimated_end_date) VALUES (35, 22, 4, 'interview_scheduled', NULL, 60, '2026-10-21 11:40:00', '2026-10-21 11:36:41', '2026-10-21 11:42:04', 'endorsement-letters/MedYmMiF6QicbVGQadeABwq59O2P4oOrMFoRJ6xJ.jpg', '2026-10-21 11:37:57', '2026-10-21 11:38:59', NULL, '2026-10-21 11:37:14', 'hfhgfghfhfhfg', '2026-10-31 01:00:00', 'face_to_face', 'BACOLOD CITY', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, NULL, false, NULL, NULL);


--
-- Data for Name: student_ojt_requirements; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.student_ojt_requirements (id, student_user_id, supervisor_user_id, interest_id, posting_id, title, items, instructions, due_date, status, drive_url, supervisor_remarks, submitted_at, verified_at, created_at, updated_at) VALUES (1, 2, 5, NULL, NULL, 'Pre-Deployment OJT Document Packet', '[{"name":"Parents \/ Guardian Waiver (Notarized)","required":true},{"name":"Medical Examination Certificate (Fit to Work)","required":true},{"name":"Barangay or Police Clearance","required":true}]', 'Upload all signed and stamped documents into your designated Google Drive folder. Ensure file sharing is set to "Anyone with the link can view".', '2026-10-19', 'verified', 'https://drive.google.com/drive/folders/104yI_7TrQFChZgC4jbSD28Q0R6gtMaiN?usp=sharing', 'All documents verified and complete.', '2026-10-05 15:58:59', '2026-10-05 15:59:42', '2026-10-05 15:58:39', '2026-10-05 15:59:42');
INSERT INTO public.student_ojt_requirements (id, student_user_id, supervisor_user_id, interest_id, posting_id, title, items, instructions, due_date, status, drive_url, supervisor_remarks, submitted_at, verified_at, created_at, updated_at) VALUES (2, 3, 5, NULL, NULL, 'Pre-Deployment OJT Document Packet', '[{"name":"Parents \/ Guardian Waiver (Notarized)","required":true},{"name":"Medical Examination Certificate (Fit to Work)","required":true},{"name":"Certificate of Registration (COR) \/ Study Load","required":true},{"name":"Barangay or Police Clearance","required":true},{"name":"OJT Training Agreement \/ MOA","required":true},{"name":"Updated Resume \/ Curriculum Vitae","required":true}]', 'Upload all signed and stamped documents into your designated Google Drive folder. Ensure file sharing is set to "Anyone with the link can view".', '2026-10-19', 'verified', 'https://drive.google.com/drive/folders/104yI_7TrQFChZgC4jbSD28Q0R6gtMaiN?usp=sharing', 'All documents verified and complete.', '2026-10-05 16:11:48', '2026-10-05 16:12:02', '2026-10-05 16:11:33', '2026-10-05 16:12:02');
INSERT INTO public.student_ojt_requirements (id, student_user_id, supervisor_user_id, interest_id, posting_id, title, items, instructions, due_date, status, drive_url, supervisor_remarks, submitted_at, verified_at, created_at, updated_at) VALUES (7, 12, 5, NULL, NULL, 'Pre-Deployment Internship Clearance Packet (BSIT 4th Year)', '[{"name":"Resume \/ Curriculum Vitae","required":true},{"name":"Medical Clearance & Drug Test","required":true},{"name":"Parents \/ Guardian Consent Waiver","required":true},{"name":"Barangay Clearance & Police Clearance","required":true},{"name":"CHMSU Curriculum Evaluation Checklist","required":true}]', NULL, NULL, 'verified', 'https://drive.google.com/drive/folders/chmsu-ojt-requirements-kevin-morales', 'All mandatory documents verified and complete. Student is cleared to apply for OJT placements.', NULL, '2026-10-03 17:45:08', '2026-10-05 17:45:08', '2026-10-05 17:45:08');
INSERT INTO public.student_ojt_requirements (id, student_user_id, supervisor_user_id, interest_id, posting_id, title, items, instructions, due_date, status, drive_url, supervisor_remarks, submitted_at, verified_at, created_at, updated_at) VALUES (14, 13, 5, NULL, NULL, 'Pre-Deployment Internship Clearance Packet (BSIT 4th Year)', '[{"name":"Resume \/ Curriculum Vitae","required":true},{"name":"Medical Clearance & Drug Screening","required":true},{"name":"Parents \/ Guardian Consent Waiver","required":true},{"name":"Barangay Clearance & Police Clearance","required":true},{"name":"CHMSU Curriculum Evaluation Checklist","required":true}]', NULL, NULL, 'verified', 'https://drive.google.com/drive/folders/chmsu-ojt-requirements-13', 'All mandatory documents verified. Cleared to apply for OJT placements.', NULL, '2026-06-05 10:00:00', '2026-10-06 03:19:43', '2026-10-06 03:19:43');
INSERT INTO public.student_ojt_requirements (id, student_user_id, supervisor_user_id, interest_id, posting_id, title, items, instructions, due_date, status, drive_url, supervisor_remarks, submitted_at, verified_at, created_at, updated_at) VALUES (15, 14, 5, NULL, NULL, 'Pre-Deployment Internship Clearance Packet (BSIT 4th Year)', '[{"name":"Resume \/ Curriculum Vitae","required":true},{"name":"Medical Clearance & Drug Screening","required":true},{"name":"Parents \/ Guardian Consent Waiver","required":true},{"name":"Barangay Clearance & Police Clearance","required":true},{"name":"CHMSU Curriculum Evaluation Checklist","required":true}]', NULL, NULL, 'verified', 'https://drive.google.com/drive/folders/chmsu-ojt-requirements-14', 'All mandatory documents verified. Cleared to apply for OJT placements.', NULL, '2026-06-05 10:00:00', '2026-10-06 03:19:43', '2026-10-06 03:19:43');
INSERT INTO public.student_ojt_requirements (id, student_user_id, supervisor_user_id, interest_id, posting_id, title, items, instructions, due_date, status, drive_url, supervisor_remarks, submitted_at, verified_at, created_at, updated_at) VALUES (16, 55, 5, NULL, NULL, 'Pre-Deployment OJT Document Packet (BSIT 4th Year)', '[{"name":"Resume \/ Curriculum Vitae","required":true},{"name":"Medical Examination Certificate (Fit to Work)","required":true},{"name":"Notarized Parent \/ Guardian Consent Waiver","required":true},{"name":"Barangay or Police Clearance","required":true},{"name":"CHMSU Curriculum Evaluation Checklist","required":true}]', NULL, NULL, 'verified', 'https://drive.google.com/drive/folders/chmsu-ojt-requirements-dave-salvador', 'All mandatory pre-deployment requirements verified and approved. Cleared for OJT application.', '2026-10-03 09:13:44', '2026-10-04 09:13:44', '2026-10-06 09:13:44', '2026-10-06 09:13:44');
INSERT INTO public.student_ojt_requirements (id, student_user_id, supervisor_user_id, interest_id, posting_id, title, items, instructions, due_date, status, drive_url, supervisor_remarks, submitted_at, verified_at, created_at, updated_at) VALUES (17, 17, 5, NULL, NULL, 'Pre-Deployment OJT Document Packet', '[{"name":"Parents \/ Guardian Waiver (Notarized)","required":true},{"name":"Medical Examination Certificate (Fit to Work)","required":true},{"name":"Certificate of Registration (COR) \/ Study Load","required":true},{"name":"Barangay or Police Clearance","required":true},{"name":"OJT Training Agreement \/ MOA","required":true},{"name":"Updated Resume \/ Curriculum Vitae","required":true}]', 'Upload all signed and stamped documents into your designated Google Drive folder. Ensure file sharing is set to "Anyone with the link can view".', '2026-10-21', 'pending', NULL, NULL, NULL, NULL, '2026-10-07 11:22:12', '2026-10-07 11:22:12');
INSERT INTO public.student_ojt_requirements (id, student_user_id, supervisor_user_id, interest_id, posting_id, title, items, instructions, due_date, status, drive_url, supervisor_remarks, submitted_at, verified_at, created_at, updated_at) VALUES (18, 15, 5, NULL, NULL, 'Pre-Deployment OJT Document Packet', '[{"name":"Parents \/ Guardian Waiver (Notarized)","required":true},{"name":"Medical Examination Certificate (Fit to Work)","required":true},{"name":"Certificate of Registration (COR) \/ Study Load","required":true},{"name":"Barangay or Police Clearance","required":true},{"name":"OJT Training Agreement \/ MOA","required":true},{"name":"Updated Resume \/ Curriculum Vitae","required":true}]', 'Upload all signed and stamped documents into your designated Google Drive folder. Ensure file sharing is set to "Anyone with the link can view".', '2026-10-21', 'verified', 'https://drive.google.com/drive/folders/104yI_7TrQFChZgC4jbSD28Q0R6gtMaiN?usp=sharing', 'All documents verified and complete.', '2026-10-08 00:43:49', '2026-10-08 00:44:27', '2026-10-08 00:39:52', '2026-10-08 00:44:27');
INSERT INTO public.student_ojt_requirements (id, student_user_id, supervisor_user_id, interest_id, posting_id, title, items, instructions, due_date, status, drive_url, supervisor_remarks, submitted_at, verified_at, created_at, updated_at) VALUES (19, 23, 5, NULL, NULL, 'Pre-Deployment OJT Document Packet', '[{"name":"Parents \/ Guardian Waiver (Notarized)","required":true},{"name":"Medical Examination Certificate (Fit to Work)","required":true},{"name":"Certificate of Registration (COR) \/ Study Load","required":true},{"name":"Barangay or Police Clearance","required":true},{"name":"OJT Training Agreement \/ MOA","required":true},{"name":"Updated Resume \/ Curriculum Vitae","required":true}]', 'Upload all signed and stamped documents into your designated Google Drive folder. Ensure file sharing is set to "Anyone with the link can view".', '2026-10-22', 'verified', 'https://drive.google.com/drive/folders/104yI_7TrQFChZgC4jbSD28Q0R6gtMaiN?usp=sharing', 'All documents verified and complete.', '2026-10-08 19:03:56', '2026-10-08 19:04:41', '2026-10-08 18:58:15', '2026-10-08 19:04:41');
INSERT INTO public.student_ojt_requirements (id, student_user_id, supervisor_user_id, interest_id, posting_id, title, items, instructions, due_date, status, drive_url, supervisor_remarks, submitted_at, verified_at, created_at, updated_at) VALUES (26, 58, 5, NULL, NULL, 'Pre-Deployment Internship Clearance Packet (BSIT 4th Year)', '[{"name":"Resume \/ Curriculum Vitae","required":true},{"name":"Medical Clearance & Drug Screening","required":true},{"name":"Parents \/ Guardian Consent Waiver","required":true},{"name":"Barangay & Police Clearance","required":true},{"name":"CHMSU Curriculum Evaluation Checklist","required":true}]', 'Submit verified documents to Coordinator before placement.', NULL, 'verified', NULL, 'All mandatory documents verified. Cleared to apply for OJT placements.', NULL, '2026-10-09 02:34:03', '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.student_ojt_requirements (id, student_user_id, supervisor_user_id, interest_id, posting_id, title, items, instructions, due_date, status, drive_url, supervisor_remarks, submitted_at, verified_at, created_at, updated_at) VALUES (27, 18, 5, NULL, NULL, 'Pre-Deployment Internship Clearance Packet (BSIT 4th Year)', '[{"name":"Resume \/ Curriculum Vitae","required":true},{"name":"Medical Clearance & Drug Screening","required":true},{"name":"Parents \/ Guardian Consent Waiver","required":true},{"name":"Barangay & Police Clearance","required":true},{"name":"CHMSU Curriculum Evaluation Checklist","required":true}]', 'Submit verified documents to Coordinator before placement.', NULL, 'verified', NULL, 'All mandatory documents verified. Cleared to apply for OJT placements.', NULL, '2026-10-09 02:34:03', '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.student_ojt_requirements (id, student_user_id, supervisor_user_id, interest_id, posting_id, title, items, instructions, due_date, status, drive_url, supervisor_remarks, submitted_at, verified_at, created_at, updated_at) VALUES (28, 22, 5, NULL, NULL, 'Pre-Deployment Internship Clearance Packet (BSIT 4th Year)', '[{"name":"Resume \/ Curriculum Vitae","required":true},{"name":"Medical Clearance & Drug Screening","required":true},{"name":"Parents \/ Guardian Consent Waiver","required":true},{"name":"Barangay & Police Clearance","required":true},{"name":"CHMSU Curriculum Evaluation Checklist","required":true}]', 'Submit verified documents to Coordinator before placement.', NULL, 'verified', NULL, 'All mandatory documents verified. Cleared to apply for OJT placements.', NULL, '2026-10-09 02:34:03', '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.student_ojt_requirements (id, student_user_id, supervisor_user_id, interest_id, posting_id, title, items, instructions, due_date, status, drive_url, supervisor_remarks, submitted_at, verified_at, created_at, updated_at) VALUES (29, 59, 5, NULL, NULL, 'Pre-Deployment Internship Clearance Packet (BSIT 4th Year)', '[{"name":"Resume \/ Curriculum Vitae","required":true},{"name":"Medical Clearance & Drug Screening","required":true},{"name":"Parents \/ Guardian Consent Waiver","required":true},{"name":"Barangay & Police Clearance","required":true},{"name":"CHMSU Curriculum Evaluation Checklist","required":true}]', 'Submit verified documents to Coordinator before placement.', NULL, 'verified', NULL, 'All mandatory documents verified. Cleared to apply for OJT placements.', NULL, '2026-10-10 12:09:28', '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.student_ojt_requirements (id, student_user_id, supervisor_user_id, interest_id, posting_id, title, items, instructions, due_date, status, drive_url, supervisor_remarks, submitted_at, verified_at, created_at, updated_at) VALUES (30, 20, 5, NULL, NULL, 'Pre-Deployment Internship Clearance Packet (BSIT 4th Year)', '[{"name":"Resume \/ Curriculum Vitae","required":true},{"name":"Medical Clearance & Drug Screening","required":true},{"name":"Parents \/ Guardian Consent Waiver","required":true},{"name":"Barangay & Police Clearance","required":true},{"name":"CHMSU Curriculum Evaluation Checklist","required":true}]', 'Submit verified documents to Coordinator before placement.', NULL, 'verified', NULL, 'All mandatory documents verified. Cleared to apply for OJT placements.', NULL, '2026-10-10 12:09:28', '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.student_ojt_requirements (id, student_user_id, supervisor_user_id, interest_id, posting_id, title, items, instructions, due_date, status, drive_url, supervisor_remarks, submitted_at, verified_at, created_at, updated_at) VALUES (31, 21, 5, NULL, NULL, 'Pre-Deployment Internship Clearance Packet (BSIT 4th Year)', '[{"name":"Resume \/ Curriculum Vitae","required":true},{"name":"Medical Clearance & Drug Screening","required":true},{"name":"Parents \/ Guardian Consent Waiver","required":true},{"name":"Barangay & Police Clearance","required":true},{"name":"CHMSU Curriculum Evaluation Checklist","required":true}]', 'Submit verified documents to Coordinator before placement.', NULL, 'verified', NULL, 'All mandatory documents verified. Cleared to apply for OJT placements.', NULL, '2026-10-10 12:09:28', '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.student_ojt_requirements (id, student_user_id, supervisor_user_id, interest_id, posting_id, title, items, instructions, due_date, status, drive_url, supervisor_remarks, submitted_at, verified_at, created_at, updated_at) VALUES (35, 16, 5, NULL, NULL, 'Pre-Deployment Internship Clearance Packet (BSIT 4th Year)', '[{"name":"Resume \/ Curriculum Vitae","required":true},{"name":"Medical Clearance & Drug Screening","required":true},{"name":"Parents \/ Guardian Consent Waiver","required":true},{"name":"Barangay & Police Clearance","required":true},{"name":"CHMSU Curriculum Evaluation Checklist","required":true}]', 'Submit verified documents to Coordinator before placement.', NULL, 'verified', NULL, 'All mandatory documents verified. Cleared to apply for OJT placements.', NULL, '2026-10-16 20:53:37', '2026-10-21 20:53:37', '2026-10-21 20:53:37');
INSERT INTO public.student_ojt_requirements (id, student_user_id, supervisor_user_id, interest_id, posting_id, title, items, instructions, due_date, status, drive_url, supervisor_remarks, submitted_at, verified_at, created_at, updated_at) VALUES (36, 19, 5, NULL, NULL, 'Pre-Deployment Internship Clearance Packet (BSIT 4th Year)', '[{"name":"Resume \/ Curriculum Vitae","required":true},{"name":"Medical Clearance & Drug Screening","required":true},{"name":"Parents \/ Guardian Consent Waiver","required":true},{"name":"Barangay & Police Clearance","required":true},{"name":"CHMSU Curriculum Evaluation Checklist","required":true}]', 'Submit verified documents to Coordinator before placement.', NULL, 'verified', NULL, 'All mandatory documents verified. Cleared to apply for OJT placements.', NULL, '2026-10-16 20:53:37', '2026-10-21 20:53:37', '2026-10-21 20:53:37');
INSERT INTO public.student_ojt_requirements (id, student_user_id, supervisor_user_id, interest_id, posting_id, title, items, instructions, due_date, status, drive_url, supervisor_remarks, submitted_at, verified_at, created_at, updated_at) VALUES (37, 24, 5, NULL, NULL, 'Pre-Deployment Internship Clearance Packet (BSIT 4th Year)', '[{"name":"Resume \/ Curriculum Vitae","required":true},{"name":"Medical Clearance & Drug Screening","required":true},{"name":"Parents \/ Guardian Consent Waiver","required":true},{"name":"Barangay & Police Clearance","required":true},{"name":"CHMSU Curriculum Evaluation Checklist","required":true}]', 'Submit verified documents to Coordinator before placement.', NULL, 'verified', NULL, 'All mandatory documents verified. Cleared to apply for OJT placements.', NULL, '2026-10-16 20:53:37', '2026-10-21 20:53:37', '2026-10-21 20:53:37');
INSERT INTO public.student_ojt_requirements (id, student_user_id, supervisor_user_id, interest_id, posting_id, title, items, instructions, due_date, status, drive_url, supervisor_remarks, submitted_at, verified_at, created_at, updated_at) VALUES (38, 56, 5, NULL, NULL, 'Pre-Deployment Internship Clearance Packet (BSIT 4th Year)', '[{"name":"Resume \/ Curriculum Vitae","required":true},{"name":"Medical Clearance & Drug Screening","required":true},{"name":"Parents \/ Guardian Consent Waiver","required":true},{"name":"Barangay & Police Clearance","required":true},{"name":"CHMSU Curriculum Evaluation Checklist","required":true}]', 'Submit verified documents to Coordinator before placement.', NULL, 'verified', NULL, 'All mandatory documents verified. Cleared to apply for OJT placements.', NULL, '2026-10-16 20:53:37', '2026-10-21 20:53:37', '2026-10-21 20:53:37');
INSERT INTO public.student_ojt_requirements (id, student_user_id, supervisor_user_id, interest_id, posting_id, title, items, instructions, due_date, status, drive_url, supervisor_remarks, submitted_at, verified_at, created_at, updated_at) VALUES (39, 66, 5, NULL, NULL, 'Pre-Deployment Internship Clearance Packet (BSIT 4th Year)', '[{"name":"Resume \/ Curriculum Vitae","required":true},{"name":"Medical Clearance & Drug Screening","required":true},{"name":"Parents \/ Guardian Consent Waiver","required":true},{"name":"Barangay & Police Clearance","required":true},{"name":"CHMSU Curriculum Evaluation Checklist","required":true}]', 'Submit verified documents to Coordinator before placement.', NULL, 'verified', NULL, 'All mandatory documents verified. Cleared to apply for OJT placements.', NULL, '2026-10-16 20:53:37', '2026-10-21 20:53:37', '2026-10-21 20:53:37');
INSERT INTO public.student_ojt_requirements (id, student_user_id, supervisor_user_id, interest_id, posting_id, title, items, instructions, due_date, status, drive_url, supervisor_remarks, submitted_at, verified_at, created_at, updated_at) VALUES (40, 69, 5, NULL, NULL, 'Pre-Deployment Internship Clearance Packet (BSIT 4th Year)', '[{"name":"Resume \/ Curriculum Vitae","required":true},{"name":"Medical Clearance & Drug Screening","required":true},{"name":"Parents \/ Guardian Consent Waiver","required":true},{"name":"Barangay & Police Clearance","required":true},{"name":"CHMSU Curriculum Evaluation Checklist","required":true}]', 'Submit verified documents to Coordinator before placement.', NULL, 'verified', NULL, 'All mandatory documents verified. Cleared to apply for OJT placements.', NULL, '2026-10-16 20:53:37', '2026-10-21 20:53:37', '2026-10-21 20:53:37');


--
-- Data for Name: student_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (12, 18, 'Carlos Hilado Memorial State University', 'Talisay Campus', 'Bachelor of Science in Information Technology', '4th Year', '2023-BSIT4B-004', '2026-10-06 07:55:38', '2026-10-14 02:34:03', 'Frontend Engineer & UI Systems Designer | React & Tailwind', 'Detail-focused 4th-year BSIT student with deep enthusiasm for component architecture, responsive web applications, and intuitive user experiences. Ready to contribute 600 practicum hours.', 'Bacolod City, Negros Occidental', 'https://github.com/altheajoy-villanueva', 'https://linkedin.com/in/altheajoyvillanueva', 'https://altheavillanueva.qa', 'active_ojt', '+63 917 888 6666', '#1e40af', 'objective', 'Seeking an intensive 600-hour practicum placement at Na Ah Company to apply software engineering competencies.', 'BSIT 4-B', '2026', 'https://drive.google.com/drive/folders/chmsu-clearance-18');
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (1, 2, 'Carlos Hilado Memorial State University', 'Main Campus', 'Bachelor of Science in Information Technology', '4th Year', '20230001', '2026-10-05 15:43:09', '2026-10-05 15:58:59', NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, 'objective', NULL, '4B', '2026-2027', 'https://drive.google.com/drive/folders/104yI_7TrQFChZgC4jbSD28Q0R6gtMaiN?usp=sharing');
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (2, 3, 'Carlos Hilado Memorial State University', 'Alijis Campus', 'Bachelor of Science in Information Technology', '4th Year', '20230002', '2026-10-05 15:43:14', '2026-10-05 16:11:48', 'Full Stack Developer', 'me', 'Bacolod City, Philippines', NULL, NULL, NULL, 'Active', '+63 123213221', NULL, 'objective', NULL, '4B', '2026-2027', 'https://drive.google.com/drive/folders/104yI_7TrQFChZgC4jbSD28Q0R6gtMaiN?usp=sharing');
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (6, 12, 'Carlos Hilado Memorial State University', 'Talisay Campus', 'Bachelor of Science in Information Technology', '4th Year', '2023-08241', '2026-10-05 17:44:31', '2026-10-05 17:44:31', 'Aspiring Full Stack Web Developer & UI Designer', 'Diligent 4th-year BSIT student eager to render 600 hours of industry internship in full stack web development and software engineering.', 'Bacolod City, Negros Occidental', NULL, NULL, NULL, 'active_ojt', '+63 917 555 0192', NULL, 'objective', 'Seeking an internship role as a Web Development Intern where I can apply my skills in PHP, JavaScript, MySQL, and modern web frameworks to develop real-world applications.', 'BSIT 4-B', '2026', 'https://drive.google.com/drive/folders/chmsu-ojt-requirements-kevin-morales');
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (10, 16, 'Carlos Hilado Memorial State University', 'Alijis Campus', 'Bachelor of Science in Information Technology', '4th Year', '2023-BSIT4B-002', '2026-10-06 07:55:38', '2026-10-06 07:55:38', 'Frontend Engineer & UI/UX Specialist | React, Tailwind CSS & Figma', 'User-centric frontend developer and UI/UX designer. Passionate about design systems, accessibility, and translating complex concepts into delightful digital interfaces.', 'Talisay City, Negros Occidental', 'https://github.com/kylamendoza-dev', 'https://linkedin.com/in/kylamariemendoza', 'https://kylamendoza.design', 'active_ojt', '+63 918 333 3002', '#1e40af', 'objective', 'Seeking an OJT position in Frontend Development and UI/UX Design to leverage my Figma and React skills in crafting high-impact user experiences.', '4B', '2026-2027', NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (11, 17, 'Carlos Hilado Memorial State University', 'Alijis Campus', 'Bachelor of Science in Information Technology', '4th Year', '2023-BSIT4B-003', '2026-10-06 07:55:38', '2026-10-06 07:55:38', 'Backend & Cloud Systems Enthusiast | Node.js, Python & Docker', 'Focused on robust server-side architecture, microservices, and database optimization. Skilled in building resilient REST and GraphQL APIs with Dockerized deployments.', 'Silay City, Negros Occidental', 'https://github.com/jhonmark-delacruz', 'https://linkedin.com/in/jhonmark-delacruz', 'https://jhonmark.tech', 'active_ojt', '+63 919 444 3003', '#1e40af', 'objective', 'Motivated BSIT student aiming to secure a Backend Developer OJT role to master API architecture, database tuning, and cloud computing principles.', '4B', '2026-2027', NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (7, 13, 'Carlos Hilado Memorial State University', 'Talisay Campus', 'Bachelor of Science in Information Technology', '4th Year', '2023-09101', '2026-10-06 03:18:03', '2026-10-06 03:19:43', 'Aspiring Cloud Solutions & Backend Systems Developer', 'Proactive 4th-year BSIT student specializing in backend architecture, database modeling, and cloud deployments. Passionate about writing scalable and maintainable code.', 'Bacolod City, Negros Occidental', NULL, NULL, NULL, 'active_ojt', '+63 917 555 6377', NULL, 'objective', 'Seeking a challenging 600-hour OJT placement at Na Ah Company to apply skills in software development and industry best practices.', 'BSIT 4-A', '2026', 'https://drive.google.com/drive/folders/chmsu-ojt-requirements-13');
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (13, 19, 'Carlos Hilado Memorial State University', 'Alijis Campus', 'Bachelor of Science in Information Technology', '4th Year', '2023-BSIT4B-005', '2026-10-06 07:55:38', '2026-10-06 07:55:38', 'DevOps & Network Infrastructure Trainee | Linux, CI/CD & Cloud', 'Passionate about computer networks, Linux systems administration, and automated CI/CD deployment pipelines. Enjoys configuring reverse proxies, SSL certificates, and firewalls.', 'Bago City, Negros Occidental', 'https://github.com/marktan-devops', 'https://linkedin.com/in/markanthonytan-it', 'https://marktan.systems', 'active_ojt', '+63 921 666 3005', '#1e40af', 'objective', 'Seeking an IT Systems / Network / DevOps OJT placement to gain practical experience in infrastructure automation, cloud deployment, and system maintenance.', '4B', '2026-2027', NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (8, 14, 'Carlos Hilado Memorial State University', 'Talisay Campus', 'Bachelor of Science in Information Technology', 'Graduated', '2023-09102', '2026-10-06 03:18:03', '2026-10-12 14:42:46', 'Full Stack Web Developer & UI Systems Specialist', 'Detail-oriented 4th-year BSIT student focused on modern responsive web applications, component architecture, and client-server integrations. Eager to render 600 hours of intensive industry training.', 'Bacolod City, Negros Occidental', NULL, NULL, NULL, 'alumni', '+63 917 555 5556', NULL, 'objective', 'Seeking a challenging 600-hour OJT placement at Na Ah Company to apply skills in software development and industry best practices.', 'BSIT 4-B', '2026', 'https://drive.google.com/drive/folders/chmsu-ojt-requirements-14');
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (14, 20, 'Carlos Hilado Memorial State University', 'Talisay Campus', 'Bachelor of Science in Information Technology', '4th Year', '2023-BSIT4B-018', '2026-10-06 07:55:39', '2026-10-17 12:09:28', 'Frontend Engineer & UI/UX Developer | React & Tailwind CSS', 'Detail-oriented 4th-year BSIT student with strong expertise in building reactive user interfaces, component design systems, and responsive web experiences. Seeking 600 hours OJT placement.', 'Bacolod City, Negros Occidental', 'https://github.com/princess-reyes-data', 'https://linkedin.com/in/princessnicolereyes', 'https://princessreyes.me', 'active_ojt', '+63 917 555 4975', '#1e40af', 'objective', 'Seeking a 600-hour practicum placement at Na Ah Company to apply software engineering competencies.', 'BSIT 4-B', '2026', 'https://drive.google.com/drive/folders/chmsu-clearance-20');
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (18, 24, 'Carlos Hilado Memorial State University', 'Alijis Campus', 'Bachelor of Science in Information Technology', '4th Year', '2023-BSIT4B-010', '2026-10-06 07:55:40', '2026-10-06 07:55:40', 'Enterprise Systems & ERP Solutions Developer | Java, Spring & MySQL', 'Enterprise-focused software development student interested in corporate information architecture, business workflows, and robust object-oriented system design with Spring Boot and relational storage.', 'Bacolod City, Negros Occidental', 'https://github.com/trishamorales-dev', 'https://linkedin.com/in/trishaannmorales', 'https://trishamorales.tech', 'active_ojt', '+63 926 202 3010', '#1e40af', 'objective', 'Seeking an Enterprise Software Development OJT internship where I can apply Java, Spring Boot, and database modeling in mission-critical applications.', '4B', '2026-2027', NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (19, 25, 'Carlos Hilado Memorial State University', 'Alijis Campus', 'Bachelor of Science in Information Technology', 'Graduated', '2016-BSIT4B-022', '2026-10-06 07:55:40', '2026-10-06 07:55:40', 'Senior Laravel & Cloud Solutions Architect | 5+ Years Exp', '2020 CHMSU BSIT 4B Alumnus. Senior Software Engineer specializing in distributed enterprise backends, high-concurrency microservices, and AWS infrastructure.', 'Bacolod City, Negros Occidental', 'https://github.com/markalcantara-tech', 'https://linkedin.com/in/markjoseph-alcantara', 'https://markalcantara.com', 'alumni', '+63 917 800 4001', '#059669', 'summary', '2020 CHMSU BSIT 4B Alumnus. Senior Software Engineer specializing in distributed enterprise backends, high-concurrency microservices, and AWS infrastructure.', '4B', '2019-2020', NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (20, 26, 'Carlos Hilado Memorial State University', 'Alijis Campus', 'Bachelor of Science in Information Technology', 'Graduated', '2016-BSIT4B-066', '2026-10-06 07:55:40', '2026-10-06 07:55:40', 'Lead UI/UX Product Designer & Design Systems Lead', '2020 BSIT 4B Alumna. Product design leader crafting accessible multi-platform interfaces for FinTech and HealthTech applications across Southeast Asia.', 'Makati City, Metro Manila / Bacolod City', 'https://github.com/christinesalgado-design', 'https://linkedin.com/in/christinemaesalgado', 'https://christinesalgado.design', 'alumni', '+63 918 800 4002', '#059669', 'summary', '2020 BSIT 4B Alumna. Product design leader crafting accessible multi-platform interfaces for FinTech and HealthTech applications across Southeast Asia.', '4B', '2019-2020', NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (21, 27, 'Carlos Hilado Memorial State University', 'Alijis Campus', 'Bachelor of Science in Information Technology', 'Graduated', '2016-BSIT4B-011', '2026-10-06 07:55:40', '2026-10-06 07:55:40', 'Senior DevOps & Site Reliability Engineer (SRE)', '2020 BSIT 4B Graduate. Cloud infrastructure specialist managing zero-downtime Kubernetes deployments, Terraform IaC, and Datadog observability suites.', 'Pasig City, Metro Manila / Remote', 'https://github.com/neilcordova-sre', 'https://linkedin.com/in/neilpatrickcordova', 'https://neilcordova.cloud', 'alumni', '+63 919 800 4003', '#059669', 'summary', '2020 BSIT 4B Graduate. Cloud infrastructure specialist managing zero-downtime Kubernetes deployments, Terraform IaC, and Datadog observability suites.', '4B', '2019-2020', NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (22, 28, 'Carlos Hilado Memorial State University', 'Alijis Campus', 'Bachelor of Science in Information Technology', 'Graduated', '2016-BSIT4B-033', '2026-10-06 07:55:41', '2026-10-06 07:55:41', 'Lead QA Automation Engineer | Playwright, Cypress & Appium', '2020 BSIT 4B Graduate. Quality engineering strategist leading automated testing transformation for multi-national fintech platforms.', 'Iloilo City / Bacolod City', 'https://github.com/hannahmontinola-qa', 'https://linkedin.com/in/hannahgracemontinola', 'https://hannahmontinola.dev', 'alumni', '+63 920 800 4004', '#059669', 'summary', '2020 BSIT 4B Graduate. Quality engineering strategist leading automated testing transformation for multi-national fintech platforms.', '4B', '2019-2020', NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (23, 29, 'Carlos Hilado Memorial State University', 'Alijis Campus', 'Bachelor of Science in Information Technology', 'Graduated', '2016-BSIT4B-053', '2026-10-06 07:55:41', '2026-10-06 07:55:41', 'Senior Mobile Engineer | React Native, iOS (Swift) & Android', '2020 BSIT 4B Graduate. Mobile specialist with 5+ years experience crafting offline-first native and cross-platform apps with 1M+ downloads.', 'Cebu City / Remote', 'https://github.com/jesterespina-mobile', 'https://linkedin.com/in/jesterianespina', 'https://jesterespina.dev', 'alumni', '+63 921 800 4005', '#059669', 'summary', '2020 BSIT 4B Graduate. Mobile specialist with 5+ years experience crafting offline-first native and cross-platform apps with 1M+ downloads.', '4B', '2019-2020', NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (24, 30, 'Carlos Hilado Memorial State University', 'Alijis Campus', 'Bachelor of Science in Information Technology', 'Graduated', '2016-BSIT4B-089', '2026-10-06 07:55:41', '2026-10-06 07:55:41', 'Data Analytics & Business Intelligence Lead | Snowflake, dbt & Python', '2020 BSIT 4B Graduate. Modern data stack practitioner transforming complex enterprise datasets into executive decision dashboards and automated ETL pipelines.', 'Taguig City, Metro Manila / Remote', 'https://github.com/rheagatuslao-data', 'https://linkedin.com/in/rheacamille-gatuslao', 'https://rheagatuslao.com', 'alumni', '+63 922 800 4006', '#059669', 'summary', '2020 BSIT 4B Graduate. Modern data stack practitioner transforming complex enterprise datasets into executive decision dashboards and automated ETL pipelines.', '4B', '2019-2020', NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (16, 22, 'Carlos Hilado Memorial State University', 'Talisay Campus', 'Bachelor of Science in Information Technology', '4th Year', '2023-BSIT4B-008', '2026-10-06 07:55:39', '2026-10-14 02:34:03', 'Backend & Database Systems Developer | PHP & MySQL', 'Methodical 4th-year BSIT student focused on API architecture, relational database management, and system integrations. Looking to render 600 hours in a collaborative environment.', 'Bacolod City, Negros Occidental', 'https://github.com/beabianca-castillo', 'https://linkedin.com/in/beabiancacastillo', 'https://beacastillo.design', 'active_ojt', '+63 917 888 1863', '#1e40af', 'objective', 'Seeking an intensive 600-hour practicum placement at Na Ah Company to apply software engineering competencies.', 'BSIT 4-B', '2026', 'https://drive.google.com/drive/folders/chmsu-clearance-22');
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (15, 21, 'Carlos Hilado Memorial State University', 'Talisay Campus', 'Bachelor of Science in Information Technology', '4th Year', '2023-BSIT4B-019', '2026-10-06 07:55:39', '2026-10-17 12:09:28', 'Backend & Database Systems Specialist | MySQL & API Services', 'Analytical 4th-year BSIT student focused on relational database modeling, backend API optimization, and secure server-side logic. Ready to commit 600 practicum hours with high discipline.', 'Bacolod City, Negros Occidental', 'https://github.com/jp-bautista-mobile', 'https://linkedin.com/in/johnpaulbautista-dev', 'https://jpbautista.app', 'active_ojt', '+63 917 555 8026', '#1e40af', 'objective', 'Seeking a 600-hour practicum placement at Na Ah Company to apply software engineering competencies.', 'BSIT 4-B', '2026', 'https://drive.google.com/drive/folders/chmsu-clearance-21');
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (25, 31, 'Carlos Hilado Memorial State University', 'Alijis Campus', 'Bachelor of Science in Information Technology', 'Graduated', '2016-BSIT4B-023', '2026-10-06 07:55:41', '2026-10-06 07:55:41', 'Full-Stack TypeScript & Next.js Consultant | Top-Rated Upwork', '2020 BSIT 4B Graduate. Independent software consultant and top-rated freelancer engineering full-stack web platforms for US and UK technology startups.', 'Bacolod City, Negros Occidental', 'https://github.com/adrianlacson-dev', 'https://linkedin.com/in/adrianpaullacson', 'https://adrianlacson.io', 'alumni', '+63 923 800 4007', '#059669', 'summary', '2020 BSIT 4B Graduate. Independent software consultant and top-rated freelancer engineering full-stack web platforms for US and UK technology startups.', '4B', '2019-2020', NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (26, 32, 'Carlos Hilado Memorial State University', 'Alijis Campus', 'Bachelor of Science in Information Technology', 'Graduated', '2016-BSIT4B-034', '2026-10-06 07:55:42', '2026-10-06 07:55:42', 'Cybersecurity & Infrastructure Security Specialist | CISSP Candidate', '2020 BSIT 4B Graduate. Security operations engineer defending critical national infrastructure and banking financial transactions from advanced persistent threats (APT).', 'Makati City / Bacolod City', 'https://github.com/daphnearrieta-sec', 'https://linkedin.com/in/daphnerosearrieta', 'https://daphnearrieta.info', 'alumni', '+63 924 800 4008', '#059669', 'summary', '2020 BSIT 4B Graduate. Security operations engineer defending critical national infrastructure and banking financial transactions from advanced persistent threats (APT).', '4B', '2019-2020', NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (27, 33, 'Carlos Hilado Memorial State University', 'Alijis Campus', 'Bachelor of Science in Information Technology', 'Graduated', '2016-BSIT4B-097', '2026-10-06 07:55:42', '2026-10-06 07:55:42', 'Solutions Engineer & Technology Entrepreneur | Founder @ DevLink PH', '2020 BSIT 4B Graduate. Co-founder of a Bacolod-based software engineering agency providing custom ERP, POS, and inventory solutions to regional SMEs.', 'Bacolod City, Negros Occidental', 'https://github.com/kennethjamero', 'https://linkedin.com/in/kennethrayjamero', 'https://kennethjamero.ph', 'alumni', '+63 925 800 4009', '#059669', 'summary', '2020 BSIT 4B Graduate. Co-founder of a Bacolod-based software engineering agency providing custom ERP, POS, and inventory solutions to regional SMEs.', '4B', '2019-2020', NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (28, 34, 'Carlos Hilado Memorial State University', 'Alijis Campus', 'Bachelor of Science in Information Technology', 'Graduated', '2016-BSIT4B-014', '2026-10-06 07:55:42', '2026-10-06 07:55:42', 'Senior Systems Analyst & Business Systems Consultant', '2020 BSIT 4B Graduate. Strategic analyst bridging functional business operations and software engineering. Currently actively evaluating senior leadership roles in enterprise IT transformation.', 'Bacolod City, Negros Occidental', 'https://github.com/stephanieguanzon', 'https://linkedin.com/in/stephanienicoleguanzon', 'https://stephanieguanzon.dev', 'alumni', '+63 926 800 4010', '#059669', 'summary', '2020 BSIT 4B Graduate. Strategic analyst bridging functional business operations and software engineering. Currently actively evaluating senior leadership roles in enterprise IT transformation.', '4B', '2019-2020', NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (29, 35, NULL, NULL, NULL, NULL, NULL, '2026-10-06 08:14:51', '2026-10-06 08:14:51', 'Full Stack Developer | Laravel & Vue.js | 4+ years in web development', 'Passionate software developer with a strong background in full-stack web development. Started in BPO then transitioned into technology. Loves clean code and scalable systems.', 'Bacolod City, Negros Occidental', 'github.com/carlomfernandez', 'linkedin.com/in/carlomfernandez', 'carlofernandez.dev', 'alumni', '+63 912 345 6701', NULL, 'objective', NULL, NULL, NULL, NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (30, 36, NULL, NULL, NULL, NULL, NULL, '2026-10-06 08:14:52', '2026-10-06 08:14:52', 'UI/UX Designer & Frontend Developer | Figma, React, Tailwind CSS', 'Creative technologist bridging design and development. Advocate for accessible, user-centered interfaces. Previously worked in digital marketing before pivoting to tech.', 'Makati City, Metro Manila', 'github.com/patriciaannelim', 'linkedin.com/in/patriciaannelim', 'patricialim.design', 'alumni', '+63 917 234 5602', NULL, 'objective', NULL, NULL, NULL, NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (31, 37, NULL, NULL, NULL, NULL, NULL, '2026-10-06 08:14:52', '2026-10-06 08:14:52', 'Data Engineer | Python, SQL, Spark | Building data pipelines since 2021', 'Data-driven professional who started as a data analyst and grew into data engineering. Enjoys solving complex ETL problems and optimizing query performance.', 'Pasig City, Metro Manila', 'github.com/renzaldwintorres', 'linkedin.com/in/renzaldwintorres', NULL, 'alumni', '+63 918 765 4303', NULL, 'objective', NULL, NULL, NULL, NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (32, 38, NULL, NULL, NULL, NULL, NULL, '2026-10-06 08:14:52', '2026-10-06 08:14:52', 'Freelance WordPress & Shopify Developer | E-commerce Specialist', 'Independent web developer with a niche in e-commerce solutions. Has built over 30 online stores for local and international clients. Also moonlights as a fitness instructor.', 'Iloilo City, Iloilo', 'github.com/maravillanueva', 'linkedin.com/in/maravillanueva', 'maravillanueva.com', 'alumni', '+63 919 876 5404', NULL, 'objective', NULL, NULL, NULL, NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (33, 39, NULL, NULL, NULL, NULL, NULL, '2026-10-06 08:14:52', '2026-10-06 08:14:52', 'Mobile Developer | Flutter & React Native | Cross-platform apps', 'Mobile app developer specializing in cross-platform solutions using Flutter and React Native. Shipped 5 apps to production, including a logistics app with 10K+ downloads.', 'Cebu City, Cebu', 'github.com/jerichopsantos', 'linkedin.com/in/jerichopsantos', NULL, 'alumni', '+63 920 987 6505', NULL, 'objective', NULL, NULL, NULL, NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (34, 40, NULL, NULL, NULL, NULL, NULL, '2026-10-06 08:14:53', '2026-10-06 08:14:53', 'HR & Recruitment Specialist | Talent Acquisition | Employee Relations', 'BSIT graduate who found her calling in human resources. Passionate about people, culture building, and using HR tech to streamline recruitment. Now handles tech talent acquisition for a BPO.', 'Bacolod City, Negros Occidental', NULL, 'linkedin.com/in/abigailmaecruz', NULL, 'alumni', '+63 921 098 7606', NULL, 'objective', NULL, NULL, NULL, NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (35, 41, NULL, NULL, NULL, NULL, NULL, '2026-10-06 08:14:53', '2026-10-06 08:14:53', 'DevOps Engineer | AWS, Docker, Kubernetes | Automation & CI/CD', 'Cloud and DevOps engineer with experience in AWS and on-premise infrastructure. Transitioned from systems administration to DevOps after discovering a passion for automation.', 'Mandaluyong City, Metro Manila', 'github.com/daniloreyesjr', 'linkedin.com/in/daniloreyesjr', NULL, 'alumni', '+63 922 109 8707', NULL, 'objective', NULL, NULL, NULL, NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (36, 42, NULL, NULL, NULL, NULL, NULL, '2026-10-06 08:14:53', '2026-10-06 08:14:53', 'Graduate Student | MS Computer Science | Research in Machine Learning', 'Currently pursuing a Master of Science in Computer Science with research focus on machine learning and natural language processing. Part-time research assistant and coding tutor.', 'Diliman, Quezon City', 'github.com/camille-ramos', 'linkedin.com/in/lourescamilleramos', NULL, 'alumni', '+63 923 210 9808', NULL, 'objective', NULL, NULL, NULL, NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (37, 43, NULL, NULL, NULL, NULL, NULL, '2026-10-06 08:14:53', '2026-10-06 08:14:53', 'Cybersecurity Analyst | Penetration Testing | SOC Operations', 'Security-minded IT professional specializing in vulnerability assessment and SOC monitoring. Certified Ethical Hacker. Started career in technical support before finding a passion for information security.', 'Taguig City, Metro Manila', 'github.com/aldrincastillo-sec', 'linkedin.com/in/aldrinmiguelcastillo', NULL, 'alumni', '+63 924 321 0909', NULL, 'objective', NULL, NULL, NULL, NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (38, 44, NULL, NULL, NULL, NULL, NULL, '2026-10-06 08:14:54', '2026-10-06 08:14:54', 'Business Analyst | Requirements Gathering | Agile & Scrum', 'Tech-savvy business analyst who bridges the gap between stakeholders and development teams. Experienced in gathering requirements, writing user stories, and driving Agile ceremonies.', 'Quezon City, Metro Manila', NULL, 'linkedin.com/in/nikkafayemendoza', NULL, 'alumni', '+63 925 432 1010', NULL, 'objective', NULL, NULL, NULL, NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (39, 45, NULL, NULL, NULL, NULL, NULL, '2026-10-06 08:14:54', '2026-10-06 08:14:54', 'Backend Developer | Node.js & Express | API Design & Microservices', 'Backend-focused developer who loves building robust REST APIs and microservices. Has worked in healthcare tech and fintech domains. Strong advocate for test-driven development.', 'Quezon City, Metro Manila', 'github.com/emmanueljgarcia', 'linkedin.com/in/emmanueljgarcia', NULL, 'alumni', '+63 926 543 2111', NULL, 'objective', NULL, NULL, NULL, NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (40, 46, NULL, NULL, NULL, NULL, NULL, '2026-10-06 08:14:54', '2026-10-06 08:14:54', 'Digital Marketing Specialist | SEO, SEM, Content Strategy', 'IT graduate who transitioned into digital marketing and quickly rose to specialize in SEO and paid media. Combines technical know-how with creative strategy to drive measurable online growth.', 'Bacolod City, Negros Occidental', NULL, 'linkedin.com/in/sophiadelatorre', 'sophiadelatorre.com', 'alumni', '+63 927 654 3212', NULL, 'objective', NULL, NULL, NULL, NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (41, 47, NULL, NULL, NULL, NULL, NULL, '2026-10-06 08:14:54', '2026-10-06 08:14:54', 'Game Developer | Unity, C# | Indie Game Enthusiast', 'Indie game developer and full-time game programmer at a mobile gaming studio. Developed two published mobile games and several prototypes. Also does freelance game modding.', 'Cebu City, Cebu', 'github.com/harveyjocampo', 'linkedin.com/in/harveyjocampo', 'harveygames.itch.io', 'alumni', '+63 928 765 4313', NULL, 'objective', NULL, NULL, NULL, NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (42, 48, NULL, NULL, NULL, NULL, NULL, '2026-10-06 08:14:55', '2026-10-06 08:14:55', 'Database Administrator | MySQL, PostgreSQL | Performance Tuning', 'Database professional passionate about data integrity, performance, and reliability. Manages multi-TB databases for enterprise clients. Started as a junior DBA and grew into senior roles.', 'Manila City, Metro Manila', 'github.com/isabelleclairedb', 'linkedin.com/in/isabelclairereyes', NULL, 'alumni', '+63 929 876 5414', NULL, 'objective', NULL, NULL, NULL, NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (43, 49, NULL, NULL, NULL, NULL, NULL, '2026-10-06 08:14:55', '2026-10-06 08:14:55', 'IT Project Manager | PMP Certified | Agile Transformation', 'PMP-certified project manager with background in software development. Leads cross-functional teams of up to 15 people on enterprise digital transformation projects.', 'Ortigas, Pasig City', NULL, 'linkedin.com/in/francislloyd', NULL, 'alumni', '+63 930 987 6515', NULL, 'objective', NULL, NULL, NULL, NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (44, 50, NULL, NULL, NULL, NULL, NULL, '2026-10-06 08:14:55', '2026-10-06 08:14:55', 'QA Engineer | Automated Testing | Selenium & Cypress', 'Detail-oriented QA professional with experience in both manual and automated testing. Worked in fintech and e-commerce. Currently exploring opportunities in test architecture and DevSecOps.', 'Iloilo City, Iloilo', 'github.com/rinamaeaquino', 'linkedin.com/in/rinamaeaquino', NULL, 'alumni', '+63 931 098 7616', NULL, 'objective', NULL, NULL, NULL, NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (45, 51, NULL, NULL, NULL, NULL, NULL, '2026-10-06 08:14:55', '2026-10-06 08:14:55', 'Solutions Architect | AWS Certified | Cloud-Native Infrastructure', 'AWS-certified solutions architect who designs and implements cloud-native infrastructure for startups and enterprises. Previously worked as a network engineer before shifting to cloud.', 'BGC, Taguig City', 'github.com/genecarlop', 'linkedin.com/in/genecarlop', NULL, 'alumni', '+63 932 109 8717', NULL, 'objective', NULL, NULL, NULL, NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (46, 52, NULL, NULL, NULL, NULL, NULL, '2026-10-06 08:14:56', '2026-10-06 08:14:56', 'Technical Writer | API Documentation | Developer Experience', 'Technical writer specializing in developer-facing documentation for APIs, SDKs, and open-source tools. Combines IT background with strong communication skills to make complex topics accessible.', 'Bacolod City, Negros Occidental', 'github.com/aliciafayecorpuz', 'linkedin.com/in/aliciafayecorpuz', 'aliciacorpuz.tech', 'alumni', '+63 933 210 9818', NULL, 'objective', NULL, NULL, NULL, NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (47, 53, NULL, NULL, NULL, NULL, NULL, '2026-10-06 08:14:56', '2026-10-06 08:14:56', 'Machine Learning Engineer | Python, TensorFlow, PyTorch', 'ML engineer building production-grade models for computer vision and NLP applications. Transitioned from software development after completing online ML specializations. Kaggle competitor.', 'Mandaluyong City, Metro Manila', 'github.com/patrickjnavarro', 'linkedin.com/in/patrickjnavarro', 'patricknavarro.ai', 'alumni', '+63 934 321 0919', NULL, 'objective', NULL, NULL, NULL, NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (48, 54, NULL, NULL, NULL, NULL, NULL, '2026-10-06 08:14:56', '2026-10-06 08:14:56', 'E-commerce Operations Manager | Lazada & Shopee | Supply Chain Tech', 'Operations manager leveraging her IT background to optimize e-commerce supply chains and seller platforms. Manages a team of 8 and oversees technology tools for a mid-size e-commerce company.', 'Mandaluyong City, Metro Manila', NULL, 'linkedin.com/in/christinejoyespinosa', NULL, 'alumni', '+63 935 432 1020', NULL, 'objective', NULL, NULL, NULL, NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (49, 55, 'Carlos Hilado Memorial State University', 'Talisay Campus', 'Bachelor of Science in Information Technology', '4th Year', '2023-09482', '2026-10-06 09:13:44', '2026-10-06 09:13:44', 'QA Software Tester & Automated Test Engineer', 'Dedicated 4th-year BSIT student with a strong passion for software testing, quality assurance automation, and defect lifecycle management. Seeking to render 600 hours of intensive industry training.', 'Bacolod City, Negros Occidental', NULL, NULL, NULL, 'looking_for_ojt', '+63 917 888 2341', NULL, 'objective', 'Seeking the Quality Assurance & Software Testing Internship at Na Ah Company to leverage my skills in manual test design, automated API testing, and defect tracking in a professional software development environment.', 'BSIT 4-B', '2026', 'https://drive.google.com/drive/folders/chmsu-ojt-requirements-dave-salvador');
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (50, 56, 'Carlos Hilado Memorial State University', NULL, 'Bachelor of Science in Information Technology', '4th Year', NULL, '2026-10-07 11:08:37', '2026-10-07 11:08:37', NULL, NULL, NULL, NULL, NULL, NULL, 'active_ojt', NULL, NULL, 'objective', NULL, '4B', '2026-2027', NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (9, 15, 'Carlos Hilado Memorial State University', 'Alijis Campus', 'Bachelor of Science in Information Technology', '4th Year', '2023-BSIT4B-001', '2026-10-06 07:55:37', '2026-10-08 00:43:49', 'Full-Stack Web & Mobile Developer | Laravel, Vue 3 & Flutter', 'Passionate BSIT senior at CHMSU Alijis specializing in modern web and cross-platform mobile apps. Experienced in building responsive UI and architecting REST APIs. Ready for a challenging industry internship.', 'Bacolod City, Negros Occidental', 'https://github.com/christiandave-ramos', 'https://linkedin.com/in/christiandave-ramos', 'https://christianramos.dev', 'active_ojt', '+63 917 222 3001', '#1e40af', 'objective', 'Dedicated BSIT 4th-year student seeking an OJT internship in Full-Stack Web Development to contribute to enterprise solutions and gain professional software engineering experience.', '4B', '2026-2027', 'https://drive.google.com/drive/folders/104yI_7TrQFChZgC4jbSD28Q0R6gtMaiN?usp=sharing');
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (17, 23, 'Carlos Hilado Memorial State University', 'Alijis Campus', 'Bachelor of Science in Information Technology', '4th Year', '2023-BSIT4B-009', '2026-10-06 07:55:39', '2026-10-08 19:03:55', 'Cybersecurity & API Security Enthusiast | Ethical Hacking & OWASP', 'Focused on web application security testing, vulnerability assessment, and defensive secure coding standards. Experienced in pen-testing local lab setups and identifying OWASP Top 10 risks.', 'Talisay City, Negros Occidental', 'https://github.com/kevinaguilar-sec', 'https://linkedin.com/in/kevinjamesaguilar', 'https://kevinaguilar.security', 'active_ojt', '+63 925 101 3009', '#1e40af', 'objective', 'Seeking an Information Security / Cybersecurity OJT role to support threat detection, vulnerability remediation, and enterprise compliance.', '4B', '2026-2027', 'https://drive.google.com/drive/folders/104yI_7TrQFChZgC4jbSD28Q0R6gtMaiN?usp=sharing');
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (51, 58, 'Carlos Hilado Memorial State University', 'Talisay Campus', 'Bachelor of Science in Information Technology', '4th Year', '2023-BSIT4B-015', '2026-10-14 02:33:24', '2026-10-14 02:34:03', 'Full-Stack Developer & Cloud Systems Enthusiast', 'High-achieving 4th-year BSIT student specializing in full-stack architecture, clean code standards, and relational database design. Eager to render 600 hours of rigorous practicum.', 'Bacolod City, Negros Occidental', NULL, NULL, NULL, 'active_ojt', '+63 917 888 9870', NULL, 'objective', 'Seeking an intensive 600-hour practicum placement at Na Ah Company to apply software engineering competencies.', 'BSIT 4-B', '2026', 'https://drive.google.com/drive/folders/chmsu-clearance-58');
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (52, 59, 'Carlos Hilado Memorial State University', 'Talisay Campus', 'Bachelor of Science in Information Technology', '4th Year', '2023-BSIT4B-028', '2026-10-17 12:09:28', '2026-10-17 12:09:28', 'Cloud Infrastructure & Full-Stack Systems Developer | Laravel & React', 'Proactive 4th-year BSIT student specializing in enterprise backend architecture, REST API design, and containerized deployments. Ready to render 600 hours of rigorous practicum training.', 'Bacolod City, Negros Occidental', NULL, NULL, NULL, 'active_ojt', '+63 917 555 1213', NULL, 'objective', 'Seeking a 600-hour practicum placement at Na Ah Company to apply software engineering competencies.', 'BSIT 4-B', '2026', 'https://drive.google.com/drive/folders/chmsu-clearance-59');
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (53, 66, 'Carlos Hilado Memorial State University', 'Alijis Campus', 'Bachelor of Science in Information Technology', '4th Year', 'GVC05190500', '2026-10-21 09:52:10', '2026-10-21 09:52:10', NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, 'objective', NULL, '4 B', '2026-2027', NULL);
INSERT INTO public.student_profiles (id, user_id, school, campus, program, year_level, student_id, created_at, updated_at, headline, bio, location, github_url, linkedin_url, portfolio_url, status, phone, cover_color, resume_type, resume_objective, section, batch, requirements_drive_url) VALUES (54, 69, 'Carlos Hilado Memorial State University', 'Main Campus', 'Bachelor of Science in Information Technology', '4th Year', '1234123', '2026-10-21 11:16:41', '2026-10-21 11:16:41', NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, 'objective', NULL, 'IT-4B', '2026-2027', NULL);


--
-- Data for Name: student_skills; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (1, 3, 'SQL', 50, 'language', 0, 0, '2026-10-05 16:12:20', '2026-10-05 16:12:20');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (9, 12, 'HTML/CSS', 50, 'other', 0, 0, '2026-10-05 17:45:08', '2026-10-05 17:45:08');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (10, 12, 'JavaScript', 50, 'other', 0, 0, '2026-10-05 17:45:08', '2026-10-05 17:45:08');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (11, 12, 'PHP', 50, 'other', 0, 0, '2026-10-05 17:45:08', '2026-10-05 17:45:08');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (12, 12, 'MySQL', 50, 'other', 0, 0, '2026-10-05 17:45:08', '2026-10-05 17:45:08');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (13, 12, 'Git', 50, 'other', 0, 0, '2026-10-05 17:45:08', '2026-10-05 17:45:08');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (14, 12, 'Laravel', 50, 'other', 0, 0, '2026-10-05 17:45:08', '2026-10-05 17:45:08');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (15, 12, 'REST APIs', 50, 'other', 0, 0, '2026-10-05 17:45:08', '2026-10-05 17:45:08');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (58, 13, 'PHP', 50, 'other', 0, 0, '2026-10-06 03:19:43', '2026-10-06 03:19:43');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (59, 13, 'Laravel', 50, 'other', 0, 0, '2026-10-06 03:19:43', '2026-10-06 03:19:43');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (60, 13, 'PostgreSQL', 50, 'other', 0, 0, '2026-10-06 03:19:43', '2026-10-06 03:19:43');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (61, 13, 'Docker', 50, 'other', 0, 0, '2026-10-06 03:19:43', '2026-10-06 03:19:43');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (62, 13, 'Git', 50, 'other', 0, 0, '2026-10-06 03:19:43', '2026-10-06 03:19:43');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (63, 13, 'REST APIs', 50, 'other', 0, 0, '2026-10-06 03:19:43', '2026-10-06 03:19:43');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (64, 13, 'Linux', 50, 'other', 0, 0, '2026-10-06 03:19:43', '2026-10-06 03:19:43');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (65, 14, 'JavaScript', 50, 'other', 0, 0, '2026-10-06 03:19:43', '2026-10-06 03:19:43');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (66, 14, 'React', 50, 'other', 0, 0, '2026-10-06 03:19:43', '2026-10-06 03:19:43');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (67, 14, 'HTML/CSS', 50, 'other', 0, 0, '2026-10-06 03:19:43', '2026-10-06 03:19:43');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (68, 14, 'Tailwind CSS', 50, 'other', 0, 0, '2026-10-06 03:19:43', '2026-10-06 03:19:43');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (69, 14, 'PHP', 50, 'other', 0, 0, '2026-10-06 03:19:43', '2026-10-06 03:19:43');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (70, 14, 'MySQL', 50, 'other', 0, 0, '2026-10-06 03:19:43', '2026-10-06 03:19:43');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (71, 14, 'Git', 50, 'other', 0, 0, '2026-10-06 03:19:43', '2026-10-06 03:19:43');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (72, 15, 'PHP', 86, 'language', 6, 0, '2026-10-06 07:55:37', '2026-10-06 07:55:37');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (73, 15, 'Laravel', 84, 'framework', 2, 1, '2026-10-06 07:55:37', '2026-10-06 07:55:37');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (74, 15, 'JavaScript', 82, 'language', 7, 2, '2026-10-06 07:55:37', '2026-10-06 07:55:37');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (75, 15, 'Vue.js', 80, 'framework', 6, 3, '2026-10-06 07:55:37', '2026-10-06 07:55:37');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (76, 15, 'MySQL / PostgreSQL', 83, 'database', 6, 4, '2026-10-06 07:55:37', '2026-10-06 07:55:37');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (77, 15, 'Git & GitHub', 88, 'tool', 4, 5, '2026-10-06 07:55:37', '2026-10-06 07:55:37');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (78, 16, 'Figma', 92, 'tool', 4, 0, '2026-10-06 07:55:38', '2026-10-06 07:55:38');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (79, 16, 'HTML5 / Modern CSS3', 90, 'language', 3, 1, '2026-10-06 07:55:38', '2026-10-06 07:55:38');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (80, 16, 'Tailwind CSS', 88, 'framework', 2, 2, '2026-10-06 07:55:38', '2026-10-06 07:55:38');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (81, 16, 'JavaScript / TypeScript', 80, 'language', 6, 3, '2026-10-06 07:55:38', '2026-10-06 07:55:38');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (82, 16, 'React.js', 82, 'framework', 6, 4, '2026-10-06 07:55:38', '2026-10-06 07:55:38');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (83, 16, 'UI/UX Prototyping', 89, 'other', 3, 5, '2026-10-06 07:55:38', '2026-10-06 07:55:38');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (84, 17, 'Python', 84, 'language', 3, 0, '2026-10-06 07:55:38', '2026-10-06 07:55:38');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (85, 17, 'Node.js / Express', 83, 'framework', 2, 1, '2026-10-06 07:55:38', '2026-10-06 07:55:38');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (86, 17, 'PostgreSQL', 85, 'database', 7, 2, '2026-10-06 07:55:38', '2026-10-06 07:55:38');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (87, 17, 'Docker', 78, 'tool', 5, 3, '2026-10-06 07:55:38', '2026-10-06 07:55:38');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (88, 17, 'Redis', 75, 'database', 7, 4, '2026-10-06 07:55:38', '2026-10-06 07:55:38');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (89, 17, 'Linux / Bash', 80, 'tool', 8, 5, '2026-10-06 07:55:38', '2026-10-06 07:55:38');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (96, 19, 'Linux (Ubuntu/Debian)', 88, 'tool', 4, 0, '2026-10-06 07:55:38', '2026-10-06 07:55:38');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (97, 19, 'Computer Networking (CCNA)', 84, 'other', 7, 1, '2026-10-06 07:55:38', '2026-10-06 07:55:38');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (98, 19, 'Docker', 80, 'tool', 5, 2, '2026-10-06 07:55:38', '2026-10-06 07:55:38');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (99, 19, 'GitHub Actions CI/CD', 79, 'tool', 7, 3, '2026-10-06 07:55:38', '2026-10-06 07:55:38');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (100, 19, 'Nginx Reverse Proxy', 82, 'tool', 5, 4, '2026-10-06 07:55:38', '2026-10-06 07:55:38');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (101, 19, 'Bash Scripting', 81, 'language', 3, 5, '2026-10-06 07:55:38', '2026-10-06 07:55:38');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (117, 23, 'OWASP Top 10 Assessment', 86, 'other', 5, 0, '2026-10-06 07:55:39', '2026-10-06 07:55:39');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (118, 23, 'Burp Suite / ZAP', 82, 'tool', 6, 1, '2026-10-06 07:55:39', '2026-10-06 07:55:39');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (119, 23, 'Linux / Kali', 85, 'tool', 5, 2, '2026-10-06 07:55:39', '2026-10-06 07:55:39');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (120, 23, 'Wireshark Packet Analysis', 80, 'tool', 3, 3, '2026-10-06 07:55:39', '2026-10-06 07:55:39');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (121, 23, 'Python for Security', 78, 'language', 3, 4, '2026-10-06 07:55:39', '2026-10-06 07:55:39');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (122, 24, 'Java / Spring Boot', 86, 'language', 6, 0, '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (123, 24, 'MySQL Database Architecture', 87, 'database', 3, 1, '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (124, 24, 'Object-Oriented Design (OOP)', 88, 'other', 7, 2, '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (125, 24, 'RESTful API Architecture', 84, 'framework', 6, 3, '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (126, 24, 'Git & Maven', 82, 'tool', 4, 4, '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (127, 25, 'PHP / Laravel', 96, 'framework', 10, 0, '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (128, 25, 'AWS (EC2, RDS, S3, ECS)', 90, 'tool', 24, 1, '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (129, 25, 'Docker & Kubernetes', 88, 'tool', 9, 2, '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (130, 25, 'PostgreSQL Optimization', 92, 'database', 11, 3, '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (131, 25, 'Redis Caching & Queues', 90, 'database', 11, 4, '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (132, 25, 'Go (Golang)', 82, 'language', 19, 5, '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (133, 26, 'Figma / FigJam', 98, 'tool', 11, 0, '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (134, 26, 'Design Systems (Tokens)', 95, 'other', 17, 1, '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (135, 26, 'User Research & Usability Testing', 92, 'other', 13, 2, '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (136, 26, 'Frontend (HTML/CSS/Tailwind)', 88, 'framework', 13, 3, '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (137, 26, 'Prototyping & Motion Design', 90, 'tool', 8, 4, '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (138, 27, 'Kubernetes (EKS/GKE)', 94, 'tool', 17, 0, '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (139, 27, 'Terraform (IaC)', 92, 'tool', 18, 1, '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (140, 27, 'CI/CD (GitLab / GitHub Actions)', 95, 'tool', 14, 2, '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (141, 27, 'AWS & Google Cloud', 90, 'tool', 16, 3, '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (142, 27, 'Prometheus & Grafana', 88, 'tool', 8, 4, '2026-10-06 07:55:40', '2026-10-06 07:55:40');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (143, 28, 'Playwright Automation', 95, 'framework', 8, 0, '2026-10-06 07:55:41', '2026-10-06 07:55:41');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (144, 28, 'Cypress E2E Testing', 92, 'framework', 16, 1, '2026-10-06 07:55:41', '2026-10-06 07:55:41');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (145, 28, 'TypeScript', 90, 'language', 25, 2, '2026-10-06 07:55:41', '2026-10-06 07:55:41');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (146, 28, 'k6 Performance Testing', 88, 'tool', 19, 3, '2026-10-06 07:55:41', '2026-10-06 07:55:41');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (147, 28, 'CI/CD Test Pipelines', 91, 'tool', 13, 4, '2026-10-06 07:55:41', '2026-10-06 07:55:41');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (148, 29, 'React Native', 95, 'framework', 21, 0, '2026-10-06 07:55:41', '2026-10-06 07:55:41');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (149, 29, 'Swift / iOS', 88, 'language', 14, 1, '2026-10-06 07:55:41', '2026-10-06 07:55:41');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (150, 29, 'Kotlin / Android', 86, 'language', 25, 2, '2026-10-06 07:55:41', '2026-10-06 07:55:41');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (151, 29, 'Mobile CI/CD (Fastlane)', 90, 'tool', 12, 3, '2026-10-06 07:55:41', '2026-10-06 07:55:41');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (152, 29, 'GraphQL Client', 87, 'framework', 24, 4, '2026-10-06 07:55:41', '2026-10-06 07:55:41');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (153, 30, 'SQL (Expert)', 96, 'database', 16, 0, '2026-10-06 07:55:41', '2026-10-06 07:55:41');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (154, 30, 'Snowflake Data Warehouse', 92, 'database', 20, 1, '2026-10-06 07:55:41', '2026-10-06 07:55:41');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (155, 30, 'dbt (Data Build Tool)', 90, 'tool', 22, 2, '2026-10-06 07:55:41', '2026-10-06 07:55:41');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (156, 30, 'Python (Pandas, PySpark)', 88, 'language', 10, 3, '2026-10-06 07:55:41', '2026-10-06 07:55:41');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (157, 30, 'Tableau & Power BI', 94, 'tool', 17, 4, '2026-10-06 07:55:41', '2026-10-06 07:55:41');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (158, 31, 'Next.js & React', 96, 'framework', 22, 0, '2026-10-06 07:55:41', '2026-10-06 07:55:41');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (159, 31, 'TypeScript (Strict)', 94, 'language', 23, 1, '2026-10-06 07:55:41', '2026-10-06 07:55:41');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (160, 31, 'Node.js / NestJS', 91, 'framework', 11, 2, '2026-10-06 07:55:41', '2026-10-06 07:55:41');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (161, 31, 'Prisma / Drizzle ORM', 90, 'database', 20, 3, '2026-10-06 07:55:41', '2026-10-06 07:55:41');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (162, 31, 'Tailwind CSS', 95, 'framework', 20, 4, '2026-10-06 07:55:41', '2026-10-06 07:55:41');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (163, 32, 'SIEM / Splunk / Sentinel', 93, 'tool', 22, 0, '2026-10-06 07:55:42', '2026-10-06 07:55:42');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (164, 32, 'Incident Response & Forensics', 91, 'other', 14, 1, '2026-10-06 07:55:42', '2026-10-06 07:55:42');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (165, 32, 'Penetration Testing (Kali Linux)', 88, 'tool', 20, 2, '2026-10-06 07:55:42', '2026-10-06 07:55:42');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (166, 32, 'Network Firewalls & Zero Trust', 90, 'tool', 10, 3, '2026-10-06 07:55:42', '2026-10-06 07:55:42');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (167, 32, 'ISO 27001 & NIST Standards', 89, 'other', 10, 4, '2026-10-06 07:55:42', '2026-10-06 07:55:42');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (168, 33, 'Software Architecture', 93, 'other', 14, 0, '2026-10-06 07:55:42', '2026-10-06 07:55:42');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (169, 33, 'Laravel / Vue.js', 94, 'framework', 11, 1, '2026-10-06 07:55:42', '2026-10-06 07:55:42');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (170, 33, 'PostgreSQL / Redis', 90, 'database', 24, 2, '2026-10-06 07:55:42', '2026-10-06 07:55:42');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (171, 33, 'Product Management', 88, 'other', 21, 3, '2026-10-06 07:55:42', '2026-10-06 07:55:42');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (172, 33, 'Cloud Hosting (DigitalOcean/AWS)', 89, 'tool', 19, 4, '2026-10-06 07:55:42', '2026-10-06 07:55:42');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (173, 34, 'Systems Analysis & Modeling', 95, 'other', 10, 0, '2026-10-06 07:55:42', '2026-10-06 07:55:42');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (174, 34, 'Agile / Scrum Master (CSM)', 94, 'other', 11, 1, '2026-10-06 07:55:42', '2026-10-06 07:55:42');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (175, 34, 'SQL Queries & Data Modeling', 88, 'database', 25, 2, '2026-10-06 07:55:42', '2026-10-06 07:55:42');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (176, 34, 'Jira & Confluence Administration', 92, 'tool', 10, 3, '2026-10-06 07:55:42', '2026-10-06 07:55:42');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (177, 34, 'UML / Process Flow Diagramming', 93, 'tool', 9, 4, '2026-10-06 07:55:42', '2026-10-06 07:55:42');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (178, 35, 'PHP', 90, 'language', 0, 0, '2026-10-06 08:14:51', '2026-10-06 08:14:51');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (179, 35, 'Laravel', 88, 'framework', 0, 1, '2026-10-06 08:14:51', '2026-10-06 08:14:51');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (180, 35, 'Vue.js', 85, 'framework', 0, 2, '2026-10-06 08:14:51', '2026-10-06 08:14:51');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (181, 35, 'MySQL', 80, 'database', 0, 3, '2026-10-06 08:14:51', '2026-10-06 08:14:51');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (182, 35, 'REST API', 82, 'other', 0, 4, '2026-10-06 08:14:51', '2026-10-06 08:14:51');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (183, 35, 'Git', 78, 'tool', 0, 5, '2026-10-06 08:14:51', '2026-10-06 08:14:51');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (184, 35, 'Docker', 65, 'tool', 0, 6, '2026-10-06 08:14:51', '2026-10-06 08:14:51');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (185, 35, 'JavaScript', 80, 'language', 0, 7, '2026-10-06 08:14:51', '2026-10-06 08:14:51');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (186, 36, 'Figma', 92, 'tool', 0, 0, '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (187, 36, 'React', 84, 'framework', 0, 1, '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (188, 36, 'Tailwind CSS', 88, 'framework', 0, 2, '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (189, 36, 'Adobe XD', 80, 'tool', 0, 3, '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (190, 36, 'JavaScript', 78, 'language', 0, 4, '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (191, 36, 'User Research', 75, 'other', 0, 5, '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (192, 36, 'Prototyping', 85, 'other', 0, 6, '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (193, 36, 'CSS', 87, 'language', 0, 7, '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (194, 37, 'Python', 90, 'language', 0, 0, '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (195, 37, 'SQL', 88, 'language', 0, 1, '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (196, 37, 'Apache Spark', 78, 'tool', 0, 2, '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (197, 37, 'Apache Airflow', 72, 'tool', 0, 3, '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (198, 37, 'Power BI', 76, 'tool', 0, 4, '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (199, 37, 'AWS Glue', 68, 'tool', 0, 5, '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (200, 37, 'Tableau', 74, 'tool', 0, 6, '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (201, 37, 'dbt', 65, 'tool', 0, 7, '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (202, 38, 'WordPress', 93, 'framework', 0, 0, '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (203, 38, 'PHP', 78, 'language', 0, 1, '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (204, 38, 'Shopify Liquid', 85, 'framework', 0, 2, '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (205, 38, 'JavaScript', 72, 'language', 0, 3, '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (206, 38, 'Elementor', 90, 'tool', 0, 4, '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (207, 38, 'WooCommerce', 88, 'tool', 0, 5, '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (208, 38, 'CSS', 80, 'language', 0, 6, '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (209, 38, 'Google Analytics', 70, 'tool', 0, 7, '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (210, 39, 'Flutter', 90, 'framework', 0, 0, '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (211, 39, 'Dart', 88, 'language', 0, 1, '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (212, 39, 'React Native', 82, 'framework', 0, 2, '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (213, 39, 'Firebase', 78, 'tool', 0, 3, '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (214, 39, 'JavaScript', 76, 'language', 0, 4, '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (215, 39, 'REST API', 80, 'other', 0, 5, '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (216, 39, 'Android SDK', 70, 'tool', 0, 6, '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (217, 39, 'Git', 75, 'tool', 0, 7, '2026-10-06 08:14:52', '2026-10-06 08:14:52');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (218, 40, 'Recruitment', 88, 'other', 0, 0, '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (219, 40, 'MS Office', 82, 'tool', 0, 1, '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (220, 40, 'HRIS Software', 78, 'tool', 0, 2, '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (221, 40, 'Payroll Processing', 74, 'other', 0, 3, '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (222, 40, 'Employee Relations', 80, 'other', 0, 4, '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (223, 40, 'Onboarding', 85, 'other', 0, 5, '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (224, 40, 'Google Workspace', 79, 'tool', 0, 6, '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (225, 40, 'Data Entry', 72, 'other', 0, 7, '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (226, 41, 'AWS', 88, 'tool', 0, 0, '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (227, 41, 'Docker', 86, 'tool', 0, 1, '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (228, 41, 'Kubernetes', 80, 'tool', 0, 2, '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (229, 41, 'Terraform', 78, 'tool', 0, 3, '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (230, 41, 'CI/CD', 84, 'other', 0, 4, '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (231, 41, 'Linux', 82, 'tool', 0, 5, '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (232, 41, 'Bash', 76, 'language', 0, 6, '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (233, 41, 'Ansible', 72, 'tool', 0, 7, '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (234, 42, 'Python', 88, 'language', 0, 0, '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (235, 42, 'Machine Learning', 78, 'other', 0, 1, '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (236, 42, 'TensorFlow', 72, 'tool', 0, 2, '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (237, 42, 'R', 75, 'language', 0, 3, '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (238, 42, 'SQL', 80, 'language', 0, 4, '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (239, 42, 'Data Analysis', 82, 'other', 0, 5, '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (240, 42, 'LaTeX', 70, 'tool', 0, 6, '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (241, 42, 'NumPy', 76, 'tool', 0, 7, '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (242, 43, 'Penetration Testing', 85, 'other', 0, 0, '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (243, 43, 'Kali Linux', 82, 'tool', 0, 1, '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (244, 43, 'Wireshark', 80, 'tool', 0, 2, '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (245, 43, 'Metasploit', 78, 'tool', 0, 3, '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (246, 43, 'SIEM', 74, 'tool', 0, 4, '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (247, 43, 'Network Security', 83, 'other', 0, 5, '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (248, 43, 'Python', 68, 'language', 0, 6, '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (249, 43, 'OWASP', 80, 'other', 0, 7, '2026-10-06 08:14:53', '2026-10-06 08:14:53');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (250, 44, 'Business Analysis', 88, 'other', 0, 0, '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (251, 44, 'Agile/Scrum', 85, 'other', 0, 1, '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (252, 44, 'JIRA', 82, 'tool', 0, 2, '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (253, 44, 'User Stories', 84, 'other', 0, 3, '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (254, 44, 'MS Visio', 76, 'tool', 0, 4, '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (255, 44, 'Confluence', 78, 'tool', 0, 5, '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (256, 44, 'Data Modeling', 72, 'other', 0, 6, '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (257, 44, 'SQL', 68, 'language', 0, 7, '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (258, 45, 'Node.js', 90, 'framework', 0, 0, '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (259, 45, 'JavaScript', 88, 'language', 0, 1, '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (260, 45, 'TypeScript', 82, 'language', 0, 2, '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (261, 45, 'Express.js', 87, 'framework', 0, 3, '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (262, 45, 'MongoDB', 78, 'database', 0, 4, '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (263, 45, 'PostgreSQL', 76, 'database', 0, 5, '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (264, 45, 'REST API', 85, 'other', 0, 6, '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (265, 45, 'Jest', 72, 'tool', 0, 7, '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (266, 46, 'SEO', 90, 'other', 0, 0, '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (267, 46, 'Google Ads', 85, 'tool', 0, 1, '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (268, 46, 'Facebook Ads', 84, 'tool', 0, 2, '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (269, 46, 'Canva', 80, 'tool', 0, 3, '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (270, 46, 'Content Writing', 78, 'other', 0, 4, '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (271, 46, 'Google Analytics', 82, 'tool', 0, 5, '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (272, 46, 'Email Marketing', 75, 'other', 0, 6, '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (273, 46, 'Ahrefs', 72, 'tool', 0, 7, '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (274, 47, 'Unity', 92, 'tool', 0, 0, '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (275, 47, 'C#', 88, 'language', 0, 1, '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (276, 47, 'Game Design', 80, 'other', 0, 2, '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (277, 47, 'Blender', 65, 'tool', 0, 3, '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (278, 47, 'Git', 76, 'tool', 0, 4, '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (279, 47, 'Shader Programming', 70, 'other', 0, 5, '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (280, 47, 'Photon SDK', 72, 'tool', 0, 6, '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (281, 47, 'Firebase', 68, 'tool', 0, 7, '2026-10-06 08:14:54', '2026-10-06 08:14:54');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (282, 48, 'MySQL', 93, 'database', 0, 0, '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (283, 48, 'PostgreSQL', 88, 'database', 0, 1, '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (284, 48, 'SQL Server', 85, 'database', 0, 2, '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (285, 48, 'Oracle DB', 78, 'database', 0, 3, '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (286, 48, 'Performance Tuning', 84, 'other', 0, 4, '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (287, 48, 'Backup & Recovery', 80, 'other', 0, 5, '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (288, 48, 'Replication', 76, 'other', 0, 6, '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (289, 48, 'Linux', 72, 'tool', 0, 7, '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (290, 49, 'Project Management', 92, 'other', 0, 0, '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (291, 49, 'Agile/Scrum', 88, 'other', 0, 1, '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (292, 49, 'JIRA', 85, 'tool', 0, 2, '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (293, 49, 'Risk Management', 82, 'other', 0, 3, '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (294, 49, 'MS Project', 78, 'tool', 0, 4, '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (295, 49, 'Stakeholder Mgmt', 84, 'other', 0, 5, '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (296, 49, 'Budgeting', 76, 'other', 0, 6, '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (297, 49, 'Resource Planning', 80, 'other', 0, 7, '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (298, 50, 'Selenium', 88, 'tool', 0, 0, '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (299, 50, 'Cypress', 85, 'tool', 0, 1, '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (300, 50, 'Postman', 84, 'tool', 0, 2, '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (301, 50, 'JIRA', 80, 'tool', 0, 3, '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (302, 50, 'Manual Testing', 90, 'other', 0, 4, '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (303, 50, 'API Testing', 82, 'other', 0, 5, '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (304, 50, 'JavaScript', 70, 'language', 0, 6, '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (305, 50, 'Python', 66, 'language', 0, 7, '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (306, 51, 'AWS', 92, 'tool', 0, 0, '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (307, 51, 'Terraform', 86, 'tool', 0, 1, '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (308, 51, 'CloudFormation', 82, 'tool', 0, 2, '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (309, 51, 'Kubernetes', 80, 'tool', 0, 3, '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (310, 51, 'Networking', 85, 'other', 0, 4, '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (311, 51, 'Linux', 84, 'tool', 0, 5, '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (312, 51, 'Python', 72, 'language', 0, 6, '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (313, 51, 'Docker', 80, 'tool', 0, 7, '2026-10-06 08:14:55', '2026-10-06 08:14:55');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (314, 52, 'Technical Writing', 93, 'other', 0, 0, '2026-10-06 08:14:56', '2026-10-06 08:14:56');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (315, 52, 'Markdown', 88, 'other', 0, 1, '2026-10-06 08:14:56', '2026-10-06 08:14:56');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (316, 52, 'API Documentation', 90, 'other', 0, 2, '2026-10-06 08:14:56', '2026-10-06 08:14:56');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (317, 52, 'Git', 76, 'tool', 0, 3, '2026-10-06 08:14:56', '2026-10-06 08:14:56');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (318, 52, 'REST APIs', 78, 'other', 0, 4, '2026-10-06 08:14:56', '2026-10-06 08:14:56');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (319, 52, 'Swagger/OpenAPI', 82, 'tool', 0, 5, '2026-10-06 08:14:56', '2026-10-06 08:14:56');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (320, 52, 'Confluence', 80, 'tool', 0, 6, '2026-10-06 08:14:56', '2026-10-06 08:14:56');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (321, 52, 'HTML', 72, 'language', 0, 7, '2026-10-06 08:14:56', '2026-10-06 08:14:56');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (322, 53, 'Python', 93, 'language', 0, 0, '2026-10-06 08:14:56', '2026-10-06 08:14:56');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (323, 53, 'TensorFlow', 88, 'tool', 0, 1, '2026-10-06 08:14:56', '2026-10-06 08:14:56');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (324, 53, 'PyTorch', 85, 'tool', 0, 2, '2026-10-06 08:14:56', '2026-10-06 08:14:56');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (325, 53, 'scikit-learn', 84, 'tool', 0, 3, '2026-10-06 08:14:56', '2026-10-06 08:14:56');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (326, 53, 'Pandas', 86, 'tool', 0, 4, '2026-10-06 08:14:56', '2026-10-06 08:14:56');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (327, 53, 'SQL', 76, 'language', 0, 5, '2026-10-06 08:14:56', '2026-10-06 08:14:56');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (328, 53, 'Computer Vision', 80, 'other', 0, 6, '2026-10-06 08:14:56', '2026-10-06 08:14:56');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (329, 53, 'NLP', 78, 'other', 0, 7, '2026-10-06 08:14:56', '2026-10-06 08:14:56');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (330, 54, 'Operations Management', 90, 'other', 0, 0, '2026-10-06 08:14:56', '2026-10-06 08:14:56');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (331, 54, 'Lazada Seller Center', 88, 'tool', 0, 1, '2026-10-06 08:14:56', '2026-10-06 08:14:56');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (332, 54, 'Shopee Seller Tools', 86, 'tool', 0, 2, '2026-10-06 08:14:56', '2026-10-06 08:14:56');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (333, 54, 'Excel / Google Sheets', 84, 'tool', 0, 3, '2026-10-06 08:14:56', '2026-10-06 08:14:56');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (334, 54, 'Inventory Management', 82, 'other', 0, 4, '2026-10-06 08:14:56', '2026-10-06 08:14:56');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (335, 54, 'Supply Chain', 78, 'other', 0, 5, '2026-10-06 08:14:56', '2026-10-06 08:14:56');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (336, 54, 'Power BI', 72, 'tool', 0, 6, '2026-10-06 08:14:56', '2026-10-06 08:14:56');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (337, 54, 'Project Management', 76, 'other', 0, 7, '2026-10-06 08:14:56', '2026-10-06 08:14:56');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (338, 55, 'Manual Testing', 85, 'tool', 0, 0, '2026-10-06 09:13:44', '2026-10-06 09:13:44');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (339, 55, 'Test Case Design', 81, 'tool', 0, 1, '2026-10-06 09:13:44', '2026-10-06 09:13:44');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (340, 55, 'Postman', 77, 'tool', 0, 2, '2026-10-06 09:13:44', '2026-10-06 09:13:44');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (341, 55, 'Cypress', 73, 'tool', 0, 3, '2026-10-06 09:13:44', '2026-10-06 09:13:44');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (342, 55, 'SQL', 69, 'tool', 0, 4, '2026-10-06 09:13:44', '2026-10-06 09:13:44');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (343, 55, 'Git', 65, 'tool', 0, 5, '2026-10-06 09:13:44', '2026-10-06 09:13:44');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (344, 55, 'Jira / Defect Tracking', 61, 'tool', 0, 6, '2026-10-06 09:13:44', '2026-10-06 09:13:44');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (345, 56, 'Scala', 50, 'language', 0, 0, '2026-10-07 11:14:05', '2026-10-07 11:14:05');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (388, 58, 'PHP', 50, 'other', 0, 0, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (389, 58, 'Laravel', 50, 'other', 0, 1, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (390, 58, 'React', 50, 'other', 0, 2, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (391, 58, 'PostgreSQL', 50, 'other', 0, 3, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (392, 58, 'Docker', 50, 'other', 0, 4, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (393, 58, 'Git', 50, 'other', 0, 5, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (394, 58, 'Tailwind CSS', 50, 'other', 0, 6, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (395, 18, 'JavaScript', 50, 'other', 0, 0, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (396, 18, 'React', 50, 'other', 0, 1, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (397, 18, 'HTML/CSS', 50, 'other', 0, 2, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (398, 18, 'Tailwind CSS', 50, 'other', 0, 3, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (399, 18, 'Git', 50, 'other', 0, 4, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (400, 18, 'PHP', 50, 'other', 0, 5, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (401, 18, 'Figma', 50, 'other', 0, 6, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (402, 22, 'PHP', 50, 'other', 0, 0, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (403, 22, 'Laravel', 50, 'other', 0, 1, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (404, 22, 'MySQL', 50, 'other', 0, 2, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (405, 22, 'PostgreSQL', 50, 'other', 0, 3, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (406, 22, 'Git', 50, 'other', 0, 4, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (407, 22, 'REST APIs', 50, 'other', 0, 5, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (408, 22, 'JavaScript', 50, 'other', 0, 6, '2026-10-14 02:34:03', '2026-10-14 02:34:03');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (409, 59, 'PHP', 50, 'other', 0, 0, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (410, 59, 'Laravel', 50, 'other', 0, 1, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (411, 59, 'React', 50, 'other', 0, 2, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (412, 59, 'Docker', 50, 'other', 0, 3, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (413, 59, 'PostgreSQL', 50, 'other', 0, 4, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (414, 59, 'Git', 50, 'other', 0, 5, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (415, 59, 'Tailwind CSS', 50, 'other', 0, 6, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (416, 59, 'REST APIs', 50, 'other', 0, 7, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (417, 20, 'JavaScript', 50, 'other', 0, 0, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (418, 20, 'React', 50, 'other', 0, 1, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (419, 20, 'Tailwind CSS', 50, 'other', 0, 2, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (420, 20, 'HTML5/CSS3', 50, 'other', 0, 3, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (421, 20, 'Git', 50, 'other', 0, 4, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (422, 20, 'Figma', 50, 'other', 0, 5, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (423, 20, 'PHP', 50, 'other', 0, 6, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (424, 21, 'PHP', 50, 'other', 0, 0, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (425, 21, 'Laravel', 50, 'other', 0, 1, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (426, 21, 'MySQL', 50, 'other', 0, 2, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (427, 21, 'PostgreSQL', 50, 'other', 0, 3, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (428, 21, 'RESTful APIs', 50, 'other', 0, 4, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (429, 21, 'Git', 50, 'other', 0, 5, '2026-10-17 12:09:28', '2026-10-17 12:09:28');
INSERT INTO public.student_skills (id, user_id, name, level, category, endorsed_count, sort_order, created_at, updated_at) VALUES (430, 21, 'Linux', 50, 'other', 0, 6, '2026-10-17 12:09:28', '2026-10-17 12:09:28');


--
-- Data for Name: supervisor_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.supervisor_profiles (id, user_id, company_name, "position", created_at, updated_at, course, phone) VALUES (2, 5, 'CHMSU', 'Bachelor of Science in Information Technology', '2026-10-05 15:57:39', '2026-10-05 15:57:39', 'Bachelor of Science in Information Technology', NULL);
INSERT INTO public.supervisor_profiles (id, user_id, company_name, "position", created_at, updated_at, course, phone) VALUES (3, 57, 'CHMSU', 'Bachelor of Science in Information Technology', '2026-10-12 01:12:46', '2026-10-12 01:12:46', 'Bachelor of Science in Information Technology', NULL);
INSERT INTO public.supervisor_profiles (id, user_id, company_name, "position", created_at, updated_at, course, phone) VALUES (4, 60, 'CHMSU', 'Bachelor of Science in Information Technology', '2026-10-17 14:03:26', '2026-10-17 14:03:26', 'Bachelor of Science in Information Technology', NULL);


--
-- Data for Name: time_logs; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (303, 13, 11, '2026-06-22', '08:00:00', '17:00:00', 8.00, 'Attended Na Ah Company onboarding, signed NDA, received development environment specifications and workstation access.', 10.6760599, 122.9512021, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6760599, 122.9512021, 10.6768856, 122.9511175, 'In Site', 59, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6760599, 122.9512021, 10.6762934, 122.9507882, 10.6766240, 122.9511019, 10.6768856, 122.9511175, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (304, 13, 11, '2026-06-23', '08:00:00', '17:00:00', 8.00, 'Configured local PHP 8.2 development environment, Composer, PostgreSQL client, and Docker desktop on dev laptop.', 10.6765543, 122.9511597, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6765543, 122.9511597, 10.6760099, 122.9509701, 'In Site', 29, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6765543, 122.9511597, 10.6767140, 122.9510961, 10.6764118, 122.9507618, 10.6760099, 122.9509701, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (305, 13, 11, '2026-06-24', '08:00:00', '17:00:00', 8.00, 'Cloned backend repositories, inspected MVC architecture, database migrations, and verified local environment test suites.', 10.6768892, 122.9507864, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6768892, 122.9507864, 10.6763210, 122.9507771, 'In Site', 45, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6768892, 122.9507864, 10.6763289, 122.9506419, 10.6768496, 122.9507109, 10.6763210, 122.9507771, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (306, 13, 11, '2026-06-25', '08:00:00', '17:00:00', 8.00, 'Reviewed company Git workflow, branch naming policies, commit message conventions, and pull request checklist.', 10.6763208, 122.9510053, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6763208, 122.9510053, 10.6768662, 122.9508542, 'In Site', 23, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6763208, 122.9510053, 10.6761472, 122.9510378, 10.6759611, 122.9510469, 10.6768662, 122.9508542, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (307, 13, 11, '2026-06-26', '08:00:00', '17:00:00', 8.00, 'Created database schema migration for trainee audit logging table with composite indexing on timestamp and user ID.', 10.6770548, 122.9509593, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6770548, 122.9509593, 10.6764663, 122.9510612, 'In Site', 62, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6770548, 122.9509593, 10.6761633, 122.9507254, 10.6766272, 122.9510295, 10.6764663, 122.9510612, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (308, 13, 11, '2026-06-29', '08:00:00', '17:00:00', 8.00, 'Implemented Eloquent model relationships, soft deletes, and custom attribute accessors for the trainee service.', 10.6766416, 122.9512566, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6766416, 122.9512566, 10.6766764, 122.9509915, 'In Site', 42, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6766416, 122.9512566, 10.6766363, 122.9509707, 10.6763128, 122.9507285, 10.6766764, 122.9509915, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (309, 13, 11, '2026-06-30', '08:00:00', '17:00:00', 8.00, 'Created REST API endpoints for batch time-log verification with JSON request validation and structured error responses.', 10.6769452, 122.9511942, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6769452, 122.9511942, 10.6769502, 122.9511863, 'In Site', 59, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6769452, 122.9511942, 10.6759704, 122.9509377, 10.6765664, 122.9513806, 10.6769502, 122.9511863, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (310, 13, 11, '2026-07-01', '08:00:00', '17:00:00', 8.00, 'Added unit tests for time-log calculation helper verifying normal days, half-days, and automatic lunch break deduction.', 10.6761886, 122.9509909, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6761886, 122.9509909, 10.6768124, 122.9506237, 'In Site', 36, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6761886, 122.9509909, 10.6762763, 122.9506877, 10.6768504, 122.9510441, 10.6768124, 122.9506237, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (311, 13, 11, '2026-07-02', '08:00:00', '17:00:00', 8.00, 'Refactored database queries in student monitoring module to eliminate N+1 queries using eager loading with withCount.', 10.6768625, 122.9512562, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6768625, 122.9512562, 10.6765259, 122.9514029, 'In Site', 56, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6768625, 122.9512562, 10.6765709, 122.9510881, 10.6763749, 122.9508486, 10.6765259, 122.9514029, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (312, 13, 11, '2026-07-03', '08:00:00', '17:00:00', 8.00, 'Designed and documented Swagger/OpenAPI specifications for OJT attendance tracking endpoints.', 10.6767524, 122.9503733, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6767524, 122.9503733, 10.6769313, 122.9508067, 'In Site', 64, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6767524, 122.9503733, 10.6764363, 122.9508002, 10.6766812, 122.9511277, 10.6769313, 122.9508067, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (313, 13, 11, '2026-07-06', '08:00:00', '17:00:00', 8.00, 'Integrated Redis caching layer for frequent read operations on company profile and active internship listings.', 10.6766818, 122.9507502, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6766818, 122.9507502, 10.6767718, 122.9512297, 'In Site', 26, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6766818, 122.9507502, 10.6762136, 122.9508694, 10.6765875, 122.9510909, 10.6767718, 122.9512297, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (314, 13, 11, '2026-07-07', '08:00:00', '17:00:00', 8.00, 'Optimized query performance on large attendance tables by applying partitioned date indexes in PostgreSQL.', 10.6764412, 122.9509921, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6764412, 122.9509921, 10.6765000, 122.9507901, 'In Site', 12, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6764412, 122.9509921, 10.6760450, 122.9512123, 10.6760832, 122.9505804, 10.6765000, 122.9507901, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (315, 13, 11, '2026-07-08', '08:00:00', '17:00:00', 8.00, 'Configured Laravel Sanctum token expiration policies and implemented secure token refresh endpoint.', 10.6766393, 122.9511025, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6766393, 122.9511025, 10.6765589, 122.9513262, 'In Site', 27, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6766393, 122.9511025, 10.6760352, 122.9506794, 10.6762333, 122.9509830, 10.6765589, 122.9513262, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (316, 13, 11, '2026-07-09', '08:00:00', '17:00:00', 8.00, 'Added rate limiting middleware to prevent brute-force punch submissions on public-facing time-clock endpoints.', 10.6767050, 122.9511670, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6767050, 122.9511670, 10.6763792, 122.9511760, 'In Site', 37, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6767050, 122.9511670, 10.6765668, 122.9511944, 10.6763653, 122.9507929, 10.6763792, 122.9511760, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (317, 13, 11, '2026-07-10', '08:00:00', '17:00:00', 8.00, 'Implemented automated database seeding script for generating realistic institutional testing environments.', 10.6763317, 122.9507346, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6763317, 122.9507346, 10.6770306, 122.9507246, 'In Site', 26, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6763317, 122.9507346, 10.6766080, 122.9510903, 10.6764395, 122.9512889, 10.6770306, 122.9507246, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (318, 13, 11, '2026-07-13', '08:00:00', '17:00:00', 8.00, 'Developed service class for calculating Haversine distance and geofence boundary verification against posting coordinates.', 10.6764887, 122.9510644, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6764887, 122.9510644, 10.6766999, 122.9509545, 'In Site', 18, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6764887, 122.9510644, 10.6762927, 122.9510899, 10.6762558, 122.9510553, 10.6766999, 122.9509545, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (319, 13, 11, '2026-07-14', '08:00:00', '17:00:00', 8.00, 'Added automated unit tests asserting accurate distance calculation within 100 meters geofence radius.', 10.6766866, 122.9506891, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6766866, 122.9506891, 10.6765221, 122.9513298, 'In Site', 31, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6766866, 122.9506891, 10.6760246, 122.9505858, 10.6764581, 122.9507408, 10.6765221, 122.9513298, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (320, 13, 11, '2026-07-15', '08:00:00', '17:00:00', 8.00, 'Wrote feature tests simulating unauthorized time-in attempts originating beyond allowed geofence perimeter.', 10.6760599, 122.9509952, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6760599, 122.9509952, 10.6763675, 122.9508428, 'In Site', 50, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6760599, 122.9509952, 10.6760068, 122.9511235, 10.6763124, 122.9509890, 10.6763675, 122.9508428, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (321, 13, 11, '2026-07-16', '08:00:00', '17:00:00', 8.00, 'Configured Dockerfile and docker-compose configurations for multi-container PHP, PostgreSQL, and Redis stack.', 10.6765267, 122.9505899, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6765267, 122.9505899, 10.6763670, 122.9510613, 'In Site', 34, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6765267, 122.9505899, 10.6765063, 122.9512662, 10.6760422, 122.9509326, 10.6763670, 122.9510613, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (322, 13, 11, '2026-07-17', '08:00:00', '17:00:00', 8.00, 'Assisted senior infrastructure engineer in auditing Docker image size and minimizing production build layers.', 10.6768195, 122.9513314, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6768195, 122.9513314, 10.6770168, 122.9508261, 'In Site', 59, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6768195, 122.9513314, 10.6762601, 122.9508613, 10.6765594, 122.9512427, 10.6770168, 122.9508261, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (323, 13, 11, '2026-07-20', '08:00:00', '17:00:00', 8.00, 'Implemented background queued job for sending notification digests to academic coordinators.', 10.6760654, 122.9512982, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6760654, 122.9512982, 10.6762107, 122.9510014, 'In Site', 65, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6760654, 122.9512982, 10.6762435, 122.9507670, 10.6767238, 122.9507156, 10.6762107, 122.9510014, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (324, 13, 11, '2026-07-21', '08:00:00', '17:00:00', 8.00, 'Configured Laravel Horizon for monitoring Redis queue throughput, latency, and failed job retries.', 10.6761298, 122.9513489, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6761298, 122.9513489, 10.6765258, 122.9510348, 'In Site', 64, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6761298, 122.9513489, 10.6769538, 122.9512608, 10.6761230, 122.9508114, 10.6765258, 122.9510348, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (325, 13, 11, '2026-07-22', '08:00:00', '17:00:00', 8.00, 'Resolved memory leak in long-running queue workers during batch document export processing.', 10.6766753, 122.9513415, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6766753, 122.9513415, 10.6765631, 122.9506899, 'In Site', 52, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6766753, 122.9513415, 10.6767252, 122.9509926, 10.6766145, 122.9508272, 10.6765631, 122.9506899, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (326, 13, 11, '2026-07-23', '08:00:00', '17:00:00', 8.00, 'Built scheduled artisan command to auto-detect missing daily time-outs and flag pending logs.', 10.6769290, 122.9506679, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6769290, 122.9506679, 10.6767123, 122.9513851, 'In Site', 54, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6769290, 122.9506679, 10.6766301, 122.9505882, 10.6768667, 122.9512244, 10.6767123, 122.9513851, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (327, 13, 11, '2026-07-24', '08:00:00', '17:00:00', 8.00, 'Created daily activity audit trail module recording administrative approval and endorsement events.', 10.6760472, 122.9506550, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6760472, 122.9506550, 10.6763027, 122.9509894, 'In Site', 57, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6760472, 122.9506550, 10.6764900, 122.9510461, 10.6766160, 122.9508499, 10.6763027, 122.9509894, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (328, 13, 11, '2026-07-27', '08:00:00', '17:00:00', 8.00, 'Integrated AWS S3 compatible object storage client for uploading verified student clearance documents.', 10.6761181, 122.9512753, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6761181, 122.9512753, 10.6764532, 122.9506761, 'In Site', 59, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6761181, 122.9512753, 10.6769396, 122.9506312, 10.6766474, 122.9510050, 10.6764532, 122.9506761, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (329, 13, 11, '2026-07-28', '08:00:00', '17:00:00', 8.00, 'Added server-side file mime-type validation and malware scan placeholder for uploaded PDF clearance files.', 10.6762091, 122.9507003, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6762091, 122.9507003, 10.6763984, 122.9506161, 'In Site', 39, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6762091, 122.9507003, 10.6766213, 122.9509602, 10.6767148, 122.9508770, 10.6763984, 122.9506161, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (330, 13, 11, '2026-07-29', '08:00:00', '17:00:00', 8.00, 'Implemented secure temporary pre-signed download URLs for confidential student medical records.', 10.6767154, 122.9504877, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6767154, 122.9504877, 10.6761956, 122.9510127, 'In Site', 51, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6767154, 122.9504877, 10.6766608, 122.9509201, 10.6763764, 122.9504885, 10.6761956, 122.9510127, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (331, 13, 11, '2026-07-30', '08:00:00', '17:00:00', 8.00, 'Conducted load testing on time-in endpoint using k6 simulating 500 concurrent student punches at 8:00 AM.', 10.6762873, 122.9510691, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6762873, 122.9510691, 10.6762631, 122.9506752, 'In Site', 30, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6762873, 122.9510691, 10.6761367, 122.9510060, 10.6764207, 122.9507889, 10.6762631, 122.9506752, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (332, 13, 11, '2026-07-31', '08:00:00', '17:00:00', 8.00, 'Analyzed bottleneck in database connection pool and adjusted PostgreSQL max_connections and pool limits.', 10.6767129, 122.9513647, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6767129, 122.9513647, 10.6762139, 122.9504341, 'In Site', 56, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6767129, 122.9513647, 10.6765714, 122.9503832, 10.6766073, 122.9513728, 10.6762139, 122.9504341, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (333, 13, 11, '2026-08-03', '08:00:00', '17:00:00', 8.00, 'Refactored authentication middleware to support role-based permission checks across supervisor and company portals.', 10.6762301, 122.9508952, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6762301, 122.9508952, 10.6765192, 122.9503418, 'In Site', 30, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6762301, 122.9508952, 10.6766526, 122.9514079, 10.6765047, 122.9506254, 10.6765192, 122.9503418, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (334, 13, 11, '2026-08-04', '08:00:00', '17:00:00', 8.00, 'Created database view for student completion progress tracking to accelerate coordinator dashboard metrics.', 10.6765613, 122.9510624, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6765613, 122.9510624, 10.6765563, 122.9505383, 'In Site', 19, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6765613, 122.9510624, 10.6769396, 122.9506312, 10.6764500, 122.9511885, 10.6765563, 122.9505383, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (335, 13, 11, '2026-08-05', '08:00:00', '17:00:00', 8.00, 'Implemented webhook listener for processing third-party electronic signature status notifications.', 10.6766843, 122.9507687, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6766843, 122.9507687, 10.6767356, 122.9513324, 'In Site', 25, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6766843, 122.9507687, 10.6767888, 122.9512629, 10.6764788, 122.9506537, 10.6767356, 122.9513324, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (336, 13, 11, '2026-08-06', '08:00:00', '17:00:00', 8.00, 'Added comprehensive error logging and context metadata injection using Monolog with structured JSON formatter.', 10.6761713, 122.9511708, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6761713, 122.9511708, 10.6765437, 122.9506475, 'In Site', 47, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6761713, 122.9511708, 10.6763816, 122.9512940, 10.6763971, 122.9507387, 10.6765437, 122.9506475, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (337, 13, 11, '2026-08-07', '08:00:00', '17:00:00', 8.00, 'Resolved database transaction lock contention when updating slots_remaining during concurrent acceptances.', 10.6767667, 122.9509830, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6767667, 122.9509830, 10.6762712, 122.9504227, 'In Site', 31, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6767667, 122.9509830, 10.6768452, 122.9507436, 10.6764962, 122.9507902, 10.6762712, 122.9504227, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (338, 13, 11, '2026-08-10', '08:00:00', '17:00:00', 8.00, 'Implemented database transaction rollback safety mechanisms across multi-step acceptance workflows.', 10.6767382, 122.9505897, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6767382, 122.9505897, 10.6765906, 122.9508402, 'In Site', 43, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6767382, 122.9505897, 10.6767066, 122.9510118, 10.6765620, 122.9506800, 10.6765906, 122.9508402, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (339, 13, 11, '2026-08-11', '08:00:00', '17:00:00', 8.00, 'Conducted peer code review on pull requests submitted by intern colleagues and provided architectural feedback.', 10.6765259, 122.9505990, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6765259, 122.9505990, 10.6766383, 122.9510023, 'In Site', 33, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6765259, 122.9505990, 10.6762590, 122.9504919, 10.6767783, 122.9508802, 10.6766383, 122.9510023, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (340, 13, 11, '2026-08-12', '08:00:00', '17:00:00', 8.00, 'Wrote database migration adding GPS coordinate columns to time log entries for enhanced spatial auditing.', 10.6765188, 122.9506260, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6765188, 122.9506260, 10.6768007, 122.9505719, 'In Site', 30, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6765188, 122.9506260, 10.6763267, 122.9511340, 10.6761867, 122.9506850, 10.6768007, 122.9505719, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (341, 13, 11, '2026-08-13', '08:00:00', '17:00:00', 8.00, 'Configured SSL/TLS certificates and reverse proxy rules in local Nginx configuration for staging mirror.', 10.6761437, 122.9505374, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6761437, 122.9505374, 10.6768538, 122.9511521, 'In Site', 56, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6761437, 122.9505374, 10.6765461, 122.9504538, 10.6766063, 122.9507880, 10.6768538, 122.9511521, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (342, 13, 11, '2026-08-14', '08:00:00', '17:00:00', 8.00, 'Implemented automated data backup script with AES-256 encryption and automated remote sync.', 10.6763843, 122.9510746, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6763843, 122.9510746, 10.6769401, 122.9505979, 'In Site', 23, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6763843, 122.9510746, 10.6766108, 122.9510443, 10.6769768, 122.9511160, 10.6769401, 122.9505979, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (343, 13, 11, '2026-08-17', '08:00:00', '17:00:00', 8.00, 'Developed API endpoint for exporting trainee attendance timesheets into standardized CSV and Excel formats.', 10.6762797, 122.9507757, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6762797, 122.9507757, 10.6762812, 122.9511305, 'In Site', 28, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6762797, 122.9507757, 10.6764901, 122.9510920, 10.6763651, 122.9508952, 10.6762812, 122.9511305, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (344, 13, 11, '2026-08-18', '08:00:00', '17:00:00', 8.00, 'Wrote feature tests verifying Excel timesheet generation accuracy and mathematical sum of hours rendered.', 10.6767552, 122.9509894, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6767552, 122.9509894, 10.6764198, 122.9503845, 'In Site', 30, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6767552, 122.9509894, 10.6760249, 122.9509423, 10.6765907, 122.9510893, 10.6764198, 122.9503845, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (345, 13, 11, '2026-08-19', '08:00:00', '17:00:00', 8.00, 'Added server-side validation ensuring morning punch out does not exceed afternoon punch in timestamp.', 10.6763384, 122.9508434, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6763384, 122.9508434, 10.6767990, 122.9505957, 'In Site', 19, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6763384, 122.9508434, 10.6760576, 122.9510550, 10.6766413, 122.9509280, 10.6767990, 122.9505957, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (346, 13, 11, '2026-08-20', '08:00:00', '17:00:00', 8.00, 'Implemented supervisor endorsement letter upload pipeline with automatic public asset publishing.', 10.6762590, 122.9513081, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6762590, 122.9513081, 10.6767274, 122.9512071, 'In Site', 52, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6762590, 122.9513081, 10.6764531, 122.9511705, 10.6765053, 122.9505887, 10.6767274, 122.9512071, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (347, 13, 11, '2026-08-21', '08:00:00', '17:00:00', 8.00, 'Refactored notification dispatch architecture to broadcast event payloads via WebSocket channels.', 10.6761634, 122.9505693, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6761634, 122.9505693, 10.6763519, 122.9511074, 'In Site', 52, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6761634, 122.9505693, 10.6761433, 122.9504517, 10.6766384, 122.9509404, 10.6763519, 122.9511074, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (348, 13, 11, '2026-08-24', '08:00:00', '17:00:00', 8.00, 'Configured Laravel Echo Server and Pusher mock drivers for real-time notification testing.', 10.6762736, 122.9512416, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6762736, 122.9512416, 10.6761721, 122.9504407, 'In Site', 45, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6762736, 122.9512416, 10.6762835, 122.9507878, 10.6768056, 122.9508225, 10.6761721, 122.9504407, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (349, 13, 11, '2026-08-25', '08:00:00', '17:00:00', 8.00, 'Investigated and resolved bug causing duplicate notification records upon rapid repeated button clicks.', 10.6766496, 122.9508676, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6766496, 122.9508676, 10.6762347, 122.9512583, 'In Site', 17, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6766496, 122.9508676, 10.6766470, 122.9508571, 10.6762287, 122.9510229, 10.6762347, 122.9512583, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (350, 13, 11, '2026-08-26', '08:00:00', '17:00:00', 8.00, 'Built database cleanup command for purging soft-deleted test records older than 90 days.', 10.6764630, 122.9503611, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6764630, 122.9503611, 10.6765769, 122.9507243, 'In Site', 59, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6764630, 122.9503611, 10.6763756, 122.9506156, 10.6768488, 122.9512310, 10.6765769, 122.9507243, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (351, 13, 11, '2026-08-27', '08:00:00', '17:00:00', 8.00, 'Added database foreign key constraint cascade rules to maintain referential integrity across student records.', 10.6768841, 122.9509975, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6768841, 122.9509975, 10.6767617, 122.9513805, 'In Site', 44, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6768841, 122.9509975, 10.6764381, 122.9512979, 10.6763219, 122.9510813, 10.6767617, 122.9513805, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (352, 13, 11, '2026-08-28', '08:00:00', '17:00:00', 8.00, 'Implemented multi-tenant data scoping ensuring company users only access their direct trainee records.', 10.6765947, 122.9505848, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6765947, 122.9505848, 10.6764569, 122.9503983, 'In Site', 36, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6765947, 122.9505848, 10.6763806, 122.9503736, 10.6765417, 122.9512453, 10.6764569, 122.9503983, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (353, 13, 11, '2026-08-31', '08:00:00', '17:00:00', 8.00, 'Conducted security audit identifying and fixing authorization vulnerability in student document view route.', 10.6767356, 122.9504676, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6767356, 122.9504676, 10.6767992, 122.9508353, 'In Site', 54, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6767356, 122.9504676, 10.6768653, 122.9509522, 10.6766585, 122.9504036, 10.6767992, 122.9508353, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (354, 13, 11, '2026-09-01', '08:00:00', '17:00:00', 8.00, 'Implemented IP address whitelisting check for administrative system maintenance routes.', 10.6763109, 122.9509857, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6763109, 122.9509857, 10.6767693, 122.9507009, 'In Site', 23, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6763109, 122.9509857, 10.6767437, 122.9512291, 10.6764965, 122.9511014, 10.6767693, 122.9507009, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (355, 13, 11, '2026-09-02', '08:00:00', '17:00:00', 8.00, 'Added automated health check route monitoring database latency, disk space, and Redis connectivity.', 10.6762875, 122.9506761, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6762875, 122.9506761, 10.6762481, 122.9509045, 'In Site', 34, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6762875, 122.9506761, 10.6765164, 122.9507637, 10.6769905, 122.9507474, 10.6762481, 122.9509045, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (356, 13, 11, '2026-09-03', '08:00:00', '17:00:00', 8.00, 'Created Docker entrypoint script with automated migration execution and route caching in staging.', 10.6769559, 122.9510071, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6769559, 122.9510071, 10.6764950, 122.9506070, 'In Site', 52, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6769559, 122.9510071, 10.6769065, 122.9507814, 10.6762550, 122.9505160, 10.6764950, 122.9506070, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (357, 13, 11, '2026-09-04', '08:00:00', '17:00:00', 8.00, 'Assisted DevOps engineer in writing GitHub Actions CI pipeline to run PHPUnit and PHPStan on every push.', 10.6762533, 122.9508136, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6762533, 122.9508136, 10.6765400, 122.9504348, 'In Site', 29, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6762533, 122.9508136, 10.6769751, 122.9508577, 10.6761261, 122.9506622, 10.6765400, 122.9504348, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (358, 13, 11, '2026-09-07', '08:00:00', '17:00:00', 8.00, 'Resolved 14 PHPStan level 5 static analysis errors across controller and model classes.', 10.6763033, 122.9514214, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6763033, 122.9514214, 10.6762063, 122.9506580, 'In Site', 61, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6763033, 122.9514214, 10.6764649, 122.9514115, 10.6759731, 122.9508342, 10.6762063, 122.9506580, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (359, 13, 11, '2026-09-08', '08:00:00', '17:00:00', 8.00, 'Added unit tests for company schedule parser validating morning, afternoon, and lunch hour intervals.', 10.6762513, 122.9505984, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6762513, 122.9505984, 10.6763733, 122.9506575, 'In Site', 43, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6762513, 122.9505984, 10.6766092, 122.9509807, 10.6764493, 122.9512256, 10.6763733, 122.9506575, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (453, 59, 22, '2026-10-17', '12:11:00', '17:00:00', 3.75, NULL, 10.6103246, 122.9306964, 'Too Far', '2026-10-17 12:11:09', '2026-10-21 08:47:53', 10.6103246, 122.9306964, NULL, NULL, 'Too Far', 3969, '12:11:00', '13:00:00', '14:04:00', '17:00:00', 0.82, 2.93, 10.6103246, 122.9306964, NULL, NULL, 10.6425870, 122.9395625, NULL, NULL, 'Too Far', 'No Exit GPS (Auto)', true, true);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (360, 13, 11, '2026-09-09', '08:00:00', '17:00:00', 8.00, 'Implemented fallback logic for trainee required hours calculation handling null database values cleanly.', 10.6764931, 122.9506987, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6764931, 122.9506987, 10.6767004, 122.9506294, 'In Site', 22, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6764931, 122.9506987, 10.6768673, 122.9513151, 10.6762022, 122.9507957, 10.6767004, 122.9506294, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (361, 13, 11, '2026-09-10', '08:00:00', '17:00:00', 8.00, 'Designed and tested database schema for institutional evaluation templates and rubrics.', 10.6764953, 122.9506254, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6764953, 122.9506254, 10.6763099, 122.9505362, 'In Site', 30, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6764953, 122.9506254, 10.6765091, 122.9514310, 10.6763316, 122.9509302, 10.6763099, 122.9505362, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (362, 13, 11, '2026-09-11', '08:00:00', '17:00:00', 8.00, 'Created migration for evaluation questions with configurable answer types, scales, and required flags.', 10.6763985, 122.9509376, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6763985, 122.9509376, 10.6766157, 122.9508293, 'In Site', 12, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6763985, 122.9509376, 10.6762822, 122.9505311, 10.6765466, 122.9507231, 10.6766157, 122.9508293, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (363, 13, 11, '2026-09-14', '08:00:00', '17:00:00', 8.00, 'Built REST API for fetching supervisor evaluation templates with eager-loaded question rubrics.', 10.6762688, 122.9507413, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6762688, 122.9507413, 10.6760023, 122.9509802, 'In Site', 31, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6762688, 122.9507413, 10.6769733, 122.9510472, 10.6763580, 122.9511963, 10.6760023, 122.9509802, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (364, 13, 11, '2026-09-15', '08:00:00', '17:00:00', 8.00, 'Added backend endpoint allowing companies to submit completed numerical and textual trainee evaluations.', 10.6769342, 122.9508221, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6769342, 122.9508221, 10.6762548, 122.9508092, 'In Site', 49, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6769342, 122.9508221, 10.6765549, 122.9510051, 10.6766456, 122.9509722, 10.6762548, 122.9508092, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (365, 13, 11, '2026-09-16', '08:00:00', '17:00:00', 8.00, 'Implemented automatic calculation of trainee overall evaluation score using weighted category averages.', 10.6762126, 122.9506796, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6762126, 122.9506796, 10.6768087, 122.9504162, 'In Site', 40, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6762126, 122.9506796, 10.6759981, 122.9510759, 10.6763381, 122.9510964, 10.6768087, 122.9504162, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (366, 13, 11, '2026-09-17', '08:00:00', '17:00:00', 8.00, 'Added transaction block updating OjtRecord status to completed upon successful evaluation submission.', 10.6760874, 122.9505600, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6760874, 122.9505600, 10.6759962, 122.9508911, 'In Site', 59, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6760874, 122.9505600, 10.6763188, 122.9511277, 10.6766903, 122.9504650, 10.6759962, 122.9508911, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (367, 13, 11, '2026-09-18', '08:00:00', '17:00:00', 8.00, 'Created automated notification dispatcher alerting student and supervisor upon evaluation finalization.', 10.6762346, 122.9513678, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6762346, 122.9513678, 10.6765845, 122.9514426, 'In Site', 59, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6762346, 122.9513678, 10.6767978, 122.9511368, 10.6765618, 122.9505764, 10.6765845, 122.9514426, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (368, 13, 11, '2026-09-21', '08:00:00', '17:00:00', 8.00, 'Wrote comprehensive unit and integration tests covering the complete evaluation submission lifecycle.', 10.6763110, 122.9509000, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6763110, 122.9509000, 10.6762924, 122.9508394, 'In Site', 21, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6763110, 122.9509000, 10.6766023, 122.9504824, 10.6766250, 122.9509156, 10.6762924, 122.9508394, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (369, 13, 11, '2026-09-22', '08:00:00', '17:00:00', 8.00, 'Benchmarked evaluation retrieval query reducing query execution time from 140ms down to 18ms.', 10.6760479, 122.9511048, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6760479, 122.9511048, 10.6764713, 122.9514578, 'In Site', 55, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6760479, 122.9511048, 10.6759490, 122.9508112, 10.6763212, 122.9512283, 10.6764713, 122.9514578, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (370, 13, 11, '2026-09-23', '08:00:00', '17:00:00', 8.00, 'Assisted senior architect in drafting API deprecation policy and versioning roadmap for mobile clients.', 10.6761043, 122.9509141, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6761043, 122.9509141, 10.6765695, 122.9507411, 'In Site', 44, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6761043, 122.9509141, 10.6763802, 122.9508604, 10.6766490, 122.9508650, 10.6765695, 122.9507411, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (371, 13, 11, '2026-09-24', '08:00:00', '17:00:00', 8.00, 'Resolved time-zone discrepancy bug ensuring all timestamps conform strictly to Asia/Manila (UTC+8).', 10.6766084, 122.9512396, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6766084, 122.9512396, 10.6760745, 122.9507251, 'In Site', 39, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6766084, 122.9512396, 10.6767836, 122.9508491, 10.6767566, 122.9511435, 10.6760745, 122.9507251, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (372, 13, 11, '2026-09-25', '08:00:00', '17:00:00', 8.00, 'Performed database indexing overhaul on time_logs table covering user_id, log_date, and status columns.', 10.6764674, 122.9510708, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6764674, 122.9510708, 10.6765762, 122.9511251, 'In Site', 19, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6764674, 122.9510708, 10.6766188, 122.9513511, 10.6759785, 122.9510422, 10.6765762, 122.9511251, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (373, 13, 11, '2026-09-28', '08:00:00', '17:00:00', 8.00, 'Created database maintenance routine for VACUUM and ANALYZE on frequently updated attendance tables.', 10.6760052, 122.9509088, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6760052, 122.9509088, 10.6762757, 122.9511626, 'In Site', 55, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6760052, 122.9509088, 10.6767082, 122.9506475, 10.6763243, 122.9512508, 10.6762757, 122.9511626, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (374, 13, 11, '2026-09-29', '08:00:00', '17:00:00', 8.00, 'Documented complete backend API architecture and deployment guide in company engineering wiki.', 10.6768355, 122.9513875, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6768355, 122.9513875, 10.6768531, 122.9512124, 'In Site', 65, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6768355, 122.9513875, 10.6768687, 122.9511931, 10.6769933, 122.9506552, 10.6768531, 122.9512124, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (375, 13, 11, '2026-09-30', '08:00:00', '17:00:00', 8.00, 'Conducted technical presentation demonstrating backend attendance microservice to senior engineering leads.', 10.6766235, 122.9514442, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6766235, 122.9514442, 10.6765868, 122.9511890, 'In Site', 61, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6766235, 122.9514442, 10.6765150, 122.9507543, 10.6764397, 122.9513998, 10.6765868, 122.9511890, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (376, 13, 11, '2026-10-01', '08:00:00', '17:00:00', 8.00, 'Assisted in knowledge transfer, architecture handover, and final code reviews for incoming intern batch.', 10.6764456, 122.9506779, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6764456, 122.9506779, 10.6766237, 122.9509915, 'In Site', 25, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6764456, 122.9506779, 10.6766391, 122.9508621, 10.6765962, 122.9508501, 10.6766237, 122.9509915, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (377, 13, 11, '2026-10-02', '08:00:00', '17:00:00', 8.00, 'Completed final engineering exit documentation, returned hardware credentials, and finalized 600-hour practicum.', 10.6762339, 122.9514093, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6762339, 122.9514093, 10.6767376, 122.9509514, 'In Site', 63, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6762339, 122.9514093, 10.6763807, 122.9505837, 10.6764161, 122.9508309, 10.6767376, 122.9509514, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (378, 14, 12, '2026-06-22', '08:00:00', '17:00:00', 8.00, 'Attended Na Ah Company orientation, received UI/UX design tokens, Figma access, and frontend workstation setup.', 10.6767689, 122.9508761, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6767689, 122.9508761, 10.6766820, 122.9507655, 'In Site', 30, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6767689, 122.9508761, 10.6759895, 122.9510789, 10.6764226, 122.9504026, 10.6766820, 122.9507655, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (379, 14, 12, '2026-06-23', '08:00:00', '17:00:00', 8.00, 'Set up frontend project repository with Vite, React 18, Tailwind CSS, Lucide icons, and ESLint configuration.', 10.6765118, 122.9507632, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6765118, 122.9507632, 10.6766624, 122.9506806, 'In Site', 15, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6765118, 122.9507632, 10.6764732, 122.9503788, 10.6761973, 122.9511872, 10.6766624, 122.9506806, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (380, 14, 12, '2026-06-24', '08:00:00', '17:00:00', 8.00, 'Explored existing design system components, typography scales, primary color palettes, and responsive breakpoints.', 10.6761730, 122.9507983, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6761730, 122.9507983, 10.6764306, 122.9509842, 'In Site', 38, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6761730, 122.9507983, 10.6766773, 122.9507591, 10.6767401, 122.9512763, 10.6764306, 122.9509842, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (381, 14, 12, '2026-06-25', '08:00:00', '17:00:00', 8.00, 'Created reusable FormInput and FormSelect components with floating label animations and error states.', 10.6767055, 122.9509931, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6767055, 122.9509931, 10.6762100, 122.9510844, 'In Site', 25, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6767055, 122.9509931, 10.6763797, 122.9508376, 10.6766078, 122.9508173, 10.6762100, 122.9510844, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (382, 14, 12, '2026-06-26', '08:00:00', '17:00:00', 8.00, 'Built responsive applicant profile summary card adhering strictly to company design specifications.', 10.6769207, 122.9513134, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6769207, 122.9513134, 10.6764446, 122.9507451, 'In Site', 65, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6769207, 122.9513134, 10.6763113, 122.9509101, 10.6764035, 122.9508176, 10.6764446, 122.9507451, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (383, 14, 12, '2026-06-29', '08:00:00', '17:00:00', 8.00, 'Implemented client-side form validation for student pre-deployment clearance upload form.', 10.6766806, 122.9504213, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6766806, 122.9504213, 10.6768126, 122.9509391, 'In Site', 56, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6766806, 122.9504213, 10.6765858, 122.9510713, 10.6763495, 122.9507299, 10.6768126, 122.9509391, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (384, 14, 12, '2026-06-30', '08:00:00', '17:00:00', 8.00, 'Added drag-and-drop file upload component with real-time file size check and visual progress bar.', 10.6764761, 122.9512471, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6764761, 122.9512471, 10.6765758, 122.9507976, 'In Site', 38, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6764761, 122.9512471, 10.6762055, 122.9505786, 10.6764132, 122.9510811, 10.6765758, 122.9507976, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (385, 14, 12, '2026-07-01', '08:00:00', '17:00:00', 8.00, 'Created interactive skill tags input component with auto-suggestions and duplicate prevention.', 10.6763462, 122.9510409, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6763462, 122.9510409, 10.6763695, 122.9508381, 'In Site', 23, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6763462, 122.9510409, 10.6770834, 122.9508585, 10.6769659, 122.9505556, 10.6763695, 122.9508381, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (386, 14, 12, '2026-07-02', '08:00:00', '17:00:00', 8.00, 'Built OJT posting filter sidebar with faceted search by course, department, and available slot badges.', 10.6765505, 122.9506582, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6765505, 122.9506582, 10.6760874, 122.9505600, 'In Site', 27, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6765505, 122.9506582, 10.6767167, 122.9513730, 10.6763927, 122.9513728, 10.6760874, 122.9505600, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (387, 14, 12, '2026-07-03', '08:00:00', '17:00:00', 8.00, 'Integrated DebouncedSearch input component to eliminate redundant API requests during live filtering.', 10.6768311, 122.9509354, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6768311, 122.9509354, 10.6763667, 122.9509215, 'In Site', 37, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6768311, 122.9509354, 10.6766239, 122.9510800, 10.6765744, 122.9511640, 10.6763667, 122.9509215, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (388, 14, 12, '2026-07-06', '08:00:00', '17:00:00', 8.00, 'Developed responsive OJT posting detail view modal with tabs for description, qualifications, and outcomes.', 10.6764980, 122.9507810, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6764980, 122.9507810, 10.6765947, 122.9512152, 'In Site', 13, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6764980, 122.9507810, 10.6767888, 122.9505371, 10.6760357, 122.9505691, 10.6765947, 122.9512152, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (389, 14, 12, '2026-07-07', '08:00:00', '17:00:00', 8.00, 'Created application submission modal with customized cover letter text area and character countdown.', 10.6763194, 122.9511041, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6763194, 122.9511041, 10.6767603, 122.9509185, 'In Site', 30, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6763194, 122.9511041, 10.6768449, 122.9511645, 10.6765585, 122.9510031, 10.6767603, 122.9509185, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (390, 14, 12, '2026-07-08', '08:00:00', '17:00:00', 8.00, 'Built toast notification system supporting success, warning, error, and info notification types.', 10.6761594, 122.9508697, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6761594, 122.9508697, 10.6766504, 122.9510824, 'In Site', 38, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6761594, 122.9508697, 10.6761635, 122.9512939, 10.6760362, 122.9506997, 10.6766504, 122.9510824, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (391, 14, 12, '2026-07-09', '08:00:00', '17:00:00', 8.00, 'Integrated real-time notification bell component with unread counter badge and dropdown preview.', 10.6766132, 122.9508252, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6766132, 122.9508252, 10.6763332, 122.9508097, 'In Site', 15, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6766132, 122.9508252, 10.6763347, 122.9507065, 10.6762589, 122.9510917, 10.6763332, 122.9508097, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (392, 14, 12, '2026-07-10', '08:00:00', '17:00:00', 8.00, 'Implemented optimistic UI updates for notification mark-as-read actions to provide instant feedback.', 10.6766377, 122.9508572, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6766377, 122.9508572, 10.6762490, 122.9508777, 'In Site', 16, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6766377, 122.9508572, 10.6765197, 122.9507734, 10.6766023, 122.9509577, 10.6762490, 122.9508777, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (393, 14, 12, '2026-07-13', '08:00:00', '17:00:00', 8.00, 'Created responsive company trainee dashboard with KPI metric cards for active interns and hours logged.', 10.6760777, 122.9509225, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6760777, 122.9509225, 10.6761403, 122.9509128, 'In Site', 47, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6760777, 122.9509225, 10.6760829, 122.9511353, 10.6768007, 122.9512281, 10.6761403, 122.9509128, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (394, 14, 12, '2026-07-14', '08:00:00', '17:00:00', 8.00, 'Developed visual progress bar component rendering percentage of 600 OJT hours rendered in real time.', 10.6761988, 122.9503899, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6761988, 122.9503899, 10.6764940, 122.9510739, 'In Site', 65, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6761988, 122.9503899, 10.6767416, 122.9508742, 10.6761375, 122.9512820, 10.6764940, 122.9510739, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (395, 14, 12, '2026-07-15', '08:00:00', '17:00:00', 8.00, 'Built interactive attendance calendar view color-coding present, late, absent, and holiday workdays.', 10.6763030, 122.9503493, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6763030, 122.9503493, 10.6766596, 122.9508377, 'In Site', 64, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6763030, 122.9503493, 10.6766603, 122.9508169, 10.6762343, 122.9506810, 10.6766596, 122.9508377, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (396, 14, 12, '2026-07-16', '08:00:00', '17:00:00', 8.00, 'Implemented Day 1 OJT Tracker punch interface with large accessible Time-In and Time-Out buttons.', 10.6762055, 122.9505786, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6762055, 122.9505786, 10.6766074, 122.9509115, 'In Site', 48, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6762055, 122.9505786, 10.6767066, 122.9506581, 10.6761537, 122.9505936, 10.6766074, 122.9509115, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (397, 14, 12, '2026-07-17', '08:00:00', '17:00:00', 8.00, 'Integrated browser Geolocation API to capture precise latitude and longitude coordinates upon punch.', 10.6764554, 122.9511337, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6764554, 122.9511337, 10.6763597, 122.9508670, 'In Site', 26, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6764554, 122.9511337, 10.6765282, 122.9511732, 10.6763223, 122.9509286, 10.6763597, 122.9508670, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (398, 14, 12, '2026-07-20', '08:00:00', '17:00:00', 8.00, 'Added visual geofence indicator chip showing whether current GPS location falls within 100m office radius.', 10.6764108, 122.9512643, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6764108, 122.9512643, 10.6767801, 122.9510996, 'In Site', 41, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6764108, 122.9512643, 10.6766717, 122.9506763, 10.6765097, 122.9503324, 10.6767801, 122.9510996, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (399, 14, 12, '2026-07-21', '08:00:00', '17:00:00', 8.00, 'Built countdown timer displaying remaining minutes until lunch break and afternoon shift conclusion.', 10.6767040, 122.9507064, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6767040, 122.9507064, 10.6764055, 122.9506039, 'In Site', 31, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6767040, 122.9507064, 10.6760286, 122.9510196, 10.6764264, 122.9509804, 10.6764055, 122.9506039, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (400, 14, 12, '2026-07-22', '08:00:00', '17:00:00', 8.00, 'Created warning modal prompting student if attempting to punch in outside scheduled shift gate hours.', 10.6761554, 122.9511943, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6761554, 122.9511943, 10.6763690, 122.9507882, 'In Site', 50, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6761554, 122.9511943, 10.6767991, 122.9505104, 10.6763669, 122.9511904, 10.6763690, 122.9507882, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (401, 14, 12, '2026-07-23', '08:00:00', '17:00:00', 8.00, 'Implemented automated lunch break detection disabling time-in button during mandatory lunch hour.', 10.6762936, 122.9506000, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6762936, 122.9506000, 10.6767830, 122.9506315, 'In Site', 40, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6762936, 122.9506000, 10.6766925, 122.9506581, 10.6761625, 122.9512683, 10.6767830, 122.9506315, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (402, 14, 12, '2026-07-24', '08:00:00', '17:00:00', 8.00, 'Developed daily task description input dialog prompting students to summarize daily accomplishments upon time-out.', 10.6766908, 122.9510811, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6766908, 122.9510811, 10.6765742, 122.9510966, 'In Site', 29, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6766908, 122.9510811, 10.6764687, 122.9506733, 10.6762593, 122.9506794, 10.6765742, 122.9510966, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (403, 14, 12, '2026-07-27', '08:00:00', '17:00:00', 8.00, 'Built trainee timesheet summary table with sortable columns for date, time in, time out, and total hours.', 10.6760548, 122.9510739, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6760548, 122.9510739, 10.6762128, 122.9509204, 'In Site', 53, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6760548, 122.9510739, 10.6764702, 122.9510056, 10.6759631, 122.9510161, 10.6762128, 122.9509204, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (404, 14, 12, '2026-07-28', '08:00:00', '17:00:00', 8.00, 'Integrated pagination controls and items-per-page selector for trainee attendance logs table.', 10.6762482, 122.9507580, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6762482, 122.9507580, 10.6760148, 122.9511408, 'In Site', 32, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6762482, 122.9507580, 10.6761656, 122.9509723, 10.6761985, 122.9504778, 10.6760148, 122.9511408, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (405, 14, 12, '2026-07-29', '08:00:00', '17:00:00', 8.00, 'Created print stylesheet optimizing timesheet view for physical A4 printing and PDF export.', 10.6764912, 122.9507721, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6764912, 122.9507721, 10.6763760, 122.9513401, 'In Site', 14, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6764912, 122.9507721, 10.6764198, 122.9508265, 10.6761333, 122.9505756, 10.6763760, 122.9513401, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (406, 14, 12, '2026-07-30', '08:00:00', '17:00:00', 8.00, 'Added dark mode theme toggle using CSS custom properties with persistent preference in localStorage.', 10.6761455, 122.9513618, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6761455, 122.9513618, 10.6766250, 122.9507683, 'In Site', 64, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6761455, 122.9513618, 10.6766225, 122.9511447, 10.6764258, 122.9510868, 10.6766250, 122.9507683, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (407, 14, 12, '2026-07-31', '08:00:00', '17:00:00', 8.00, 'Audited color contrast ratios across primary and secondary UI components ensuring WCAG 2.1 AA compliance.', 10.6760869, 122.9511235, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6760869, 122.9511235, 10.6761668, 122.9506351, 'In Site', 52, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6760869, 122.9511235, 10.6764344, 122.9512787, 10.6767336, 122.9505195, 10.6761668, 122.9506351, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (408, 14, 12, '2026-08-03', '08:00:00', '17:00:00', 8.00, 'Refactored modal dialogs to trap keyboard focus and support Esc key closure for enhanced accessibility.', 10.6766543, 122.9508057, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6766543, 122.9508057, 10.6765952, 122.9510333, 'In Site', 20, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6766543, 122.9508057, 10.6764078, 122.9508267, 10.6762472, 122.9510200, 10.6765952, 122.9510333, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (409, 14, 12, '2026-08-04', '08:00:00', '17:00:00', 8.00, 'Built supervisor trainee monitoring table with real-time status indicators and last seen timestamp chips.', 10.6766574, 122.9512597, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6766574, 122.9512597, 10.6768563, 122.9512754, 'In Site', 43, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6766574, 122.9512597, 10.6766677, 122.9504555, 10.6767501, 122.9508688, 10.6768563, 122.9512754, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (410, 14, 12, '2026-08-05', '08:00:00', '17:00:00', 8.00, 'Created interactive map modal displaying GPS punch pins and 100m geofence circle overlay.', 10.6768811, 122.9512492, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6768811, 122.9512492, 10.6767375, 122.9511503, 'In Site', 57, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6768811, 122.9512492, 10.6768863, 122.9510750, 10.6766225, 122.9505752, 10.6767375, 122.9511503, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (411, 14, 12, '2026-08-06', '08:00:00', '17:00:00', 8.00, 'Implemented endorsement letter viewer modal with embedded PDF preview and download action button.', 10.6768047, 122.9512968, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6768047, 122.9512968, 10.6765088, 122.9510279, 'In Site', 55, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6768047, 122.9512968, 10.6762427, 122.9503860, 10.6770599, 122.9509902, 10.6765088, 122.9510279, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (412, 14, 12, '2026-08-07', '08:00:00', '17:00:00', 8.00, 'Built interview scheduling modal allowing company HR to select date, time, venue, and add special instructions.', 10.6760529, 122.9507950, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6760529, 122.9507950, 10.6759807, 122.9507877, 'In Site', 51, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6760529, 122.9507950, 10.6763839, 122.9509145, 10.6764783, 122.9513206, 10.6759807, 122.9507877, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (413, 14, 12, '2026-08-10', '08:00:00', '17:00:00', 8.00, 'Created post-interview candidate evaluation dialog with pass/fail decision toggles and review comments.', 10.6769019, 122.9509502, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6769019, 122.9509502, 10.6768663, 122.9506671, 'In Site', 45, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6769019, 122.9509502, 10.6760623, 122.9511892, 10.6763922, 122.9510689, 10.6768663, 122.9506671, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (414, 14, 12, '2026-08-11', '08:00:00', '17:00:00', 8.00, 'Developed supervisor final approval modal with bulk student selection and single-click deployment confirmation.', 10.6766969, 122.9513720, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6766969, 122.9513720, 10.6763178, 122.9509787, 'In Site', 56, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6766969, 122.9513720, 10.6761943, 122.9511260, 10.6762125, 122.9508847, 10.6763178, 122.9509787, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (415, 14, 12, '2026-08-12', '08:00:00', '17:00:00', 8.00, 'Integrated skeleton loading placeholders across dashboard cards to prevent layout shift during data fetching.', 10.6766065, 122.9511324, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6766065, 122.9511324, 10.6764909, 122.9511654, 'In Site', 28, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6766065, 122.9511324, 10.6769013, 122.9505057, 10.6761437, 122.9512754, 10.6764909, 122.9511654, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (416, 14, 12, '2026-08-13', '08:00:00', '17:00:00', 8.00, 'Optimized React component rendering using React.memo and useMemo on heavy timesheet data transformations.', 10.6761901, 122.9514047, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6761901, 122.9514047, 10.6766828, 122.9504617, 'In Site', 65, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6761901, 122.9514047, 10.6769910, 122.9510153, 10.6760651, 122.9512099, 10.6766828, 122.9504617, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (454, 21, 24, '2026-10-17', '16:15:00', '17:00:00', 0.75, NULL, 10.6535155, 122.9413717, 'Too Far', '2026-10-17 16:16:01', '2026-10-21 08:47:53', 10.6535155, 122.9413717, NULL, NULL, 'Too Far', 2760, NULL, NULL, '16:15:00', '17:00:00', 0.00, 0.75, NULL, NULL, NULL, NULL, 10.6535155, 122.9413717, NULL, NULL, NULL, 'No Exit GPS (Auto)', false, true);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (417, 14, 12, '2026-08-14', '08:00:00', '17:00:00', 8.00, 'Created custom useOjtTracker hook encapsulating timer interval, geolocation capture, and punch mutations.', 10.6766174, 122.9503825, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6766174, 122.9503825, 10.6765094, 122.9503507, 'In Site', 58, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6766174, 122.9503825, 10.6763125, 122.9507024, 10.6761029, 122.9505843, 10.6765094, 122.9503507, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (418, 14, 12, '2026-08-17', '08:00:00', '17:00:00', 8.00, 'Added error boundary component to gracefully catch and display runtime errors without crashing the application.', 10.6763741, 122.9508955, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6763741, 122.9508955, 10.6761087, 122.9507629, 'In Site', 14, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6763741, 122.9508955, 10.6763067, 122.9513032, 10.6766267, 122.9511425, 10.6761087, 122.9507629, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (419, 14, 12, '2026-08-18', '08:00:00', '17:00:00', 8.00, 'Built multi-step onboarding wizard guiding newly registered students through profile completion steps.', 10.6763968, 122.9511735, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6763968, 122.9511735, 10.6762904, 122.9503444, 'In Site', 32, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6763968, 122.9511735, 10.6761270, 122.9506440, 10.6760243, 122.9508661, 10.6762904, 122.9503444, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (420, 14, 12, '2026-08-19', '08:00:00', '17:00:00', 8.00, 'Integrated client-side image compression for student profile avatar uploads using canvas rendering.', 10.6762050, 122.9512334, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6762050, 122.9512334, 10.6765769, 122.9511728, 'In Site', 49, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6762050, 122.9512334, 10.6765419, 122.9507408, 10.6766617, 122.9505123, 10.6765769, 122.9511728, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (421, 14, 12, '2026-08-20', '08:00:00', '17:00:00', 8.00, 'Created interactive attendance analytics charts using Chart.js displaying weekly hours distribution.', 10.6762423, 122.9508585, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6762423, 122.9508585, 10.6763529, 122.9507652, 'In Site', 29, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6762423, 122.9508585, 10.6764286, 122.9514168, 10.6765220, 122.9505803, 10.6763529, 122.9507652, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (422, 14, 12, '2026-08-21', '08:00:00', '17:00:00', 8.00, 'Added mobile drawer navigation menu for seamless usability on smartphone and tablet screens.', 10.6767429, 122.9513282, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6767429, 122.9513282, 10.6759493, 122.9510713, 'In Site', 54, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6767429, 122.9513282, 10.6766960, 122.9509280, 10.6761712, 122.9508470, 10.6759493, 122.9510713, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (423, 14, 12, '2026-08-24', '08:00:00', '17:00:00', 8.00, 'Tested and verified UI responsiveness across iPhone, Samsung Galaxy, iPad, and desktop widescreen displays.', 10.6768257, 122.9510762, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6768257, 122.9510762, 10.6762482, 122.9510601, 'In Site', 41, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6768257, 122.9510762, 10.6767563, 122.9506300, 10.6764859, 122.9507634, 10.6762482, 122.9510601, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (424, 14, 12, '2026-08-25', '08:00:00', '17:00:00', 8.00, 'Built company OJT trainees management tab with filterable stages: In Progress, Finished Hours, and Evaluated.', 10.6761673, 122.9508882, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6761673, 122.9508882, 10.6767074, 122.9504027, 'In Site', 37, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6761673, 122.9508882, 10.6761214, 122.9507822, 10.6762591, 122.9508250, 10.6767074, 122.9504027, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (425, 14, 12, '2026-08-26', '08:00:00', '17:00:00', 8.00, 'Implemented urgent action ribbon alerting company HR when student evaluations are pending completion.', 10.6766660, 122.9506495, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6766660, 122.9506495, 10.6760643, 122.9507026, 'In Site', 33, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6766660, 122.9506495, 10.6761857, 122.9506120, 10.6768226, 122.9513519, 10.6760643, 122.9507026, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (426, 14, 12, '2026-08-27', '08:00:00', '17:00:00', 8.00, 'Designed and built interactive Trainee Performance Evaluation Form with 5-point rating scale rubrics.', 10.6761687, 122.9505509, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6761687, 122.9505509, 10.6769219, 122.9509300, 'In Site', 53, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6761687, 122.9505509, 10.6770077, 122.9507421, 10.6769704, 122.9507162, 10.6769219, 122.9509300, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (427, 14, 12, '2026-08-28', '08:00:00', '17:00:00', 8.00, 'Added interactive star rating component with smooth hover animations and numeric score display.', 10.6766612, 122.9513274, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6766612, 122.9513274, 10.6763092, 122.9510213, 'In Site', 50, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6766612, 122.9513274, 10.6768185, 122.9504009, 10.6764346, 122.9510305, 10.6763092, 122.9510213, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (428, 14, 12, '2026-08-31', '08:00:00', '17:00:00', 8.00, 'Created category score subtotal indicators dynamically calculating category averages as questions are answered.', 10.6770391, 122.9508712, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6770391, 122.9508712, 10.6767494, 122.9510465, 'In Site', 60, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6770391, 122.9508712, 10.6766387, 122.9512676, 10.6767445, 122.9503898, 10.6767494, 122.9510465, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (429, 14, 12, '2026-09-01', '08:00:00', '17:00:00', 8.00, 'Added mandatory question validation highlighting unanswered criteria before allowing evaluation submission.', 10.6768936, 122.9510302, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6768936, 122.9510302, 10.6766758, 122.9514194, 'In Site', 46, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6768936, 122.9510302, 10.6769735, 122.9510754, 10.6761614, 122.9508516, 10.6766758, 122.9514194, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (430, 14, 12, '2026-09-02', '08:00:00', '17:00:00', 8.00, 'Built general qualitative feedback and final hiring recommendation radio selector in evaluation form.', 10.6764799, 122.9514856, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6764799, 122.9514856, 10.6764931, 122.9513028, 'In Site', 64, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6764799, 122.9514856, 10.6764727, 122.9514303, 10.6767660, 122.9512226, 10.6764931, 122.9513028, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (431, 14, 12, '2026-09-03', '08:00:00', '17:00:00', 8.00, 'Developed evaluation submission confirmation dialog with summary scorecard preview.', 10.6768343, 122.9512063, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6768343, 122.9512063, 10.6761913, 122.9513838, 'In Site', 50, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6768343, 122.9512063, 10.6767410, 122.9513813, 10.6762861, 122.9508293, 10.6761913, 122.9513838, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (432, 14, 12, '2026-09-04', '08:00:00', '17:00:00', 8.00, 'Created read-only evaluation scorecard modal for students and supervisors to inspect finalized ratings.', 10.6767870, 122.9512876, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6767870, 122.9512876, 10.6763091, 122.9511315, 'In Site', 53, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6767870, 122.9512876, 10.6762934, 122.9507882, 10.6763214, 122.9509223, 10.6763091, 122.9511315, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (433, 14, 12, '2026-09-07', '08:00:00', '17:00:00', 8.00, 'Integrated printable Certificate of OJT Completion template styled with CHMSU and company branding.', 10.6769213, 122.9512860, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6769213, 122.9512860, 10.6769022, 122.9510330, 'In Site', 63, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6769213, 122.9512860, 10.6766293, 122.9512614, 10.6763451, 122.9508518, 10.6769022, 122.9510330, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (434, 14, 12, '2026-09-08', '08:00:00', '17:00:00', 8.00, 'Added confetti celebration animation triggering upon 100% completion of 600 required OJT hours.', 10.6763382, 122.9507410, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6763382, 122.9507410, 10.6765601, 122.9505854, 'In Site', 25, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6763382, 122.9507410, 10.6767003, 122.9512261, 10.6764783, 122.9513206, 10.6765601, 122.9505854, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (435, 14, 12, '2026-09-09', '08:00:00', '17:00:00', 8.00, 'Built bulk evaluation dispatch modal in supervisor portal allowing batch dispatch to host companies.', 10.6769150, 122.9506257, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6769150, 122.9506257, 10.6769480, 122.9512826, 'In Site', 55, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6769150, 122.9506257, 10.6766483, 122.9505265, 10.6761171, 122.9505956, 10.6769480, 122.9512826, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (457, 59, 22, '2026-10-21', '11:44:00', '13:00:00', 1.27, NULL, 10.6429706, 122.9399292, 'Too Far', '2026-10-21 11:45:12', '2026-10-21 20:54:23', 10.6429706, 122.9399292, NULL, NULL, 'Too Far', 3916, '11:44:00', '13:00:00', NULL, NULL, 1.27, 0.00, 10.6429706, 122.9399292, NULL, NULL, NULL, NULL, NULL, NULL, 'Too Far', NULL, true, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (455, 21, 24, '2026-10-21', '08:32:00', '13:00:00', 4.47, NULL, 10.6111452, 122.9312632, 'Too Far', '2026-10-21 08:32:27', '2026-10-21 20:54:23', 10.6111452, 122.9312632, NULL, NULL, 'Too Far', 7577, '08:32:00', '13:00:00', NULL, NULL, 4.47, 0.00, 10.6111452, 122.9312632, NULL, NULL, NULL, NULL, NULL, NULL, 'Too Far', NULL, true, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (436, 14, 12, '2026-09-10', '08:00:00', '17:00:00', 8.00, 'Implemented empty state illustrations and helpful call-to-action buttons for zero-state scenarios.', 10.6766195, 122.9506134, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6766195, 122.9506134, 10.6766438, 122.9509077, 'In Site', 34, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6766195, 122.9506134, 10.6767632, 122.9512825, 10.6764636, 122.9507394, 10.6766438, 122.9509077, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (437, 14, 12, '2026-09-11', '08:00:00', '17:00:00', 8.00, 'Conducted end-to-end user experience walkthrough identifying and rectifying 7 minor styling inconsistencies.', 10.6764079, 122.9512065, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6764079, 122.9512065, 10.6760857, 122.9507466, 'In Site', 35, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6764079, 122.9512065, 10.6763971, 122.9507387, 10.6762508, 122.9504023, 10.6760857, 122.9507466, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (438, 14, 12, '2026-09-14', '08:00:00', '17:00:00', 8.00, 'Audited bundle size using Vite rollup-plugin-visualizer and lazy-loaded heavy chart and PDF modules.', 10.6767823, 122.9510795, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6767823, 122.9510795, 10.6762283, 122.9504901, 'In Site', 37, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6767823, 122.9510795, 10.6768436, 122.9512750, 10.6765225, 122.9507553, 10.6762283, 122.9504901, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (439, 14, 12, '2026-09-15', '08:00:00', '17:00:00', 8.00, 'Reduced initial JavaScript bundle footprint by 38% through route-level code splitting with React.lazy.', 10.6765000, 122.9514036, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6765000, 122.9514036, 10.6767619, 122.9514012, 'In Site', 55, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6765000, 122.9514036, 10.6769489, 122.9508029, 10.6764625, 122.9506836, 10.6767619, 122.9514012, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (440, 14, 12, '2026-09-16', '08:00:00', '17:00:00', 8.00, 'Resolved CSS z-index stacking context conflict between sticky navigation header and modal backdrops.', 10.6762487, 122.9511223, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6762487, 122.9511223, 10.6770611, 122.9507682, 'In Site', 37, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6762487, 122.9511223, 10.6765481, 122.9506483, 10.6764634, 122.9511351, 10.6770611, 122.9507682, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (441, 14, 12, '2026-09-17', '08:00:00', '17:00:00', 8.00, 'Refactored hardcoded API base URLs into standardized environment variable configuration.', 10.6764642, 122.9514206, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6764642, 122.9514206, 10.6763600, 122.9507576, 'In Site', 57, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6764642, 122.9514206, 10.6767366, 122.9504473, 10.6769076, 122.9505986, 10.6763600, 122.9507576, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (442, 14, 12, '2026-09-18', '08:00:00', '17:00:00', 8.00, 'Wrote comprehensive unit tests for date formatting, time-diff calculation, and percentage utility functions.', 10.6767125, 122.9511239, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6767125, 122.9511239, 10.6762958, 122.9504921, 'In Site', 34, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6767125, 122.9511239, 10.6764900, 122.9507539, 10.6764336, 122.9513806, 10.6762958, 122.9504921, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (443, 14, 12, '2026-09-21', '08:00:00', '17:00:00', 8.00, 'Created interactive tour guide using driver.js introducing first-time trainees to the OJT tracker interface.', 10.6764099, 122.9514788, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6764099, 122.9514788, 10.6764292, 122.9507217, 'In Site', 64, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6764099, 122.9514788, 10.6761472, 122.9510829, 10.6767717, 122.9507205, 10.6764292, 122.9507217, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (444, 14, 12, '2026-09-22', '08:00:00', '17:00:00', 8.00, 'Conducted peer code reviews for junior teammates focusing on semantic HTML and clean component hierarchy.', 10.6764363, 122.9508002, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6764363, 122.9508002, 10.6768024, 122.9510181, 'In Site', 13, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6764363, 122.9508002, 10.6764519, 122.9511517, 10.6769077, 122.9510935, 10.6768024, 122.9510181, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (445, 14, 12, '2026-09-23', '08:00:00', '17:00:00', 8.00, 'Implemented fallback offline banner notifying trainees when internet connection is temporarily interrupted.', 10.6763300, 122.9509182, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6763300, 122.9509182, 10.6762900, 122.9508180, 'In Site', 19, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6763300, 122.9509182, 10.6766444, 122.9503517, 10.6761815, 122.9504009, 10.6762900, 122.9508180, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (446, 14, 12, '2026-09-24', '08:00:00', '17:00:00', 8.00, 'Tested and verified smooth WebSocket real-time updates for live punch synchronization on supervisor screens.', 10.6763591, 122.9511125, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6763591, 122.9511125, 10.6760401, 122.9512527, 'In Site', 28, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6763591, 122.9511125, 10.6767848, 122.9511799, 10.6762601, 122.9513405, 10.6760401, 122.9512527, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (447, 14, 12, '2026-09-25', '08:00:00', '17:00:00', 8.00, 'Prepared frontend component library documentation and design token handover guide in Storybook.', 10.6762635, 122.9512568, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6762635, 122.9512568, 10.6762863, 122.9509968, 'In Site', 47, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6762635, 122.9512568, 10.6761640, 122.9510313, 10.6762482, 122.9507399, 10.6762863, 122.9509968, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (448, 14, 12, '2026-09-28', '08:00:00', '17:00:00', 8.00, 'Delivered final UI/UX showcase presentation demonstrating complete student and company portals to stakeholders.', 10.6768325, 122.9508823, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6768325, 122.9508823, 10.6764354, 122.9507193, 'In Site', 37, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6768325, 122.9508823, 10.6762352, 122.9506657, 10.6762622, 122.9506011, 10.6764354, 122.9507193, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (449, 14, 12, '2026-09-29', '08:00:00', '17:00:00', 8.00, 'Assisted incoming intern batch with workstation onboarding and frontend architecture walkthrough.', 10.6765695, 122.9507411, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6765695, 122.9507411, 10.6767552, 122.9508106, 'In Site', 19, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6765695, 122.9507411, 10.6765992, 122.9512521, 10.6769858, 122.9508914, 10.6767552, 122.9508106, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (450, 14, 12, '2026-09-30', '08:00:00', '17:00:00', 8.00, 'Completed final UI polish, closed assigned Jira backlog tickets, and finalized 600-hour practicum portfolio.', 10.6766779, 122.9509883, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6766779, 122.9509883, 10.6769240, 122.9505749, 'In Site', 22, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6766779, 122.9509883, 10.6762735, 122.9511226, 10.6763091, 122.9507058, 10.6769240, 122.9505749, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (451, 14, 12, '2026-10-01', '08:00:00', '17:00:00', 8.00, 'Rendered 8.0 hours of professional software development and systems engineering tasks.', 10.6760375, 122.9512174, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6760375, 122.9512174, 10.6770103, 122.9507511, 'In Site', 62, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6760375, 122.9512174, 10.6766562, 122.9507618, 10.6763646, 122.9507172, 10.6770103, 122.9507511, 'In Site', 'In Site', false, false);
INSERT INTO public.time_logs (id, user_id, ojt_record_id, log_date, time_in, time_out, hours_rendered, description, latitude, longitude, status, created_at, updated_at, time_in_lat, time_in_lon, time_out_lat, time_out_lon, location_validity, distance_meters, morning_in, morning_out, afternoon_in, afternoon_out, morning_hours, afternoon_hours, morning_in_lat, morning_in_lon, morning_out_lat, morning_out_lon, afternoon_in_lat, afternoon_in_lon, afternoon_out_lat, afternoon_out_lon, morning_validity, afternoon_validity, auto_morning_timeout, auto_afternoon_timeout) VALUES (452, 14, 12, '2026-10-02', '08:00:00', '17:00:00', 8.00, 'Rendered 8.0 hours of professional software development and systems engineering tasks.', 10.6764101, 122.9507205, 'approved', '2026-10-06 03:19:44', '2026-10-06 03:19:44', 10.6764101, 122.9507205, 10.6765207, 122.9506997, 'In Site', 22, '08:00:00', '12:00:00', '13:00:00', '17:00:00', 4.00, 4.00, 10.6764101, 122.9507205, 10.6766463, 122.9514193, 10.6761579, 122.9506471, 10.6765207, 122.9506997, 'In Site', 'In Site', false, false);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (1, 'Marites Manganti', 'admin@chmsu.edu.ph', NULL, '$2y$12$jP0vaq842jor0tDGGvuuj.RyOHUpBOW7PDYicQ/LHeccQ5JMRHD6G', NULL, '2026-10-05 15:41:18', '2026-10-05 15:41:18', 'admin', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (2, 'Juan Dela Cruz', 'jdelacruz@chmsu.edu.ph', NULL, '$2y$12$MWUfvtYlSJYidCzpDwVH..TxZKoMq4fCZ86TDVCCBRRpE75gf/gFe', NULL, '2026-10-05 15:43:09', '2026-10-05 15:43:09', 'student', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (3, 'Maria Santos', 'msantos@chmsu.edu.ph', NULL, '$2y$12$tPcBr2kqTSc4NvD86WgVXuwvqub0FE3MPUMgjr7eB9I00zD6t2Vne', NULL, '2026-10-05 15:43:14', '2026-10-05 15:43:14', 'student', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (19, 'Mark Anthony Tan', 'mark.tan.bsit4b@chmsu.edu.ph', NULL, '$2y$12$VsYOnCRaBSfBkw/4/c/q.OioJHBK3OFfQKabmbMg4AyHAlU/9wesC', NULL, '2026-10-06 07:55:38', '2026-10-06 07:55:38', 'student', true, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&fit=crop&crop=faces', false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (23, 'Kevin James Aguilar', 'kevin.aguilar.bsit4b@chmsu.edu.ph', NULL, '$2y$12$n6QBgqi8/ML4Wt4BAJBgm.L64OiYN0Yoh3daFBEFwUA2ByBbrKInO', NULL, '2026-10-06 07:55:39', '2026-10-06 07:55:39', 'student', true, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=256&h=256&fit=crop&crop=faces', false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (24, 'Trisha Ann Morales', 'trisha.morales.bsit4b@chmsu.edu.ph', NULL, '$2y$12$2gZXVQVwjvt6URcOrbiCVOQloPagdoP0C3kS0arWgGmk0d00CeChq', NULL, '2026-10-06 07:55:40', '2026-10-06 07:55:40', 'student', true, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces', false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (6, 'PGLang', 'gimaranganvhan@gmail.com', NULL, '$2y$12$HKdUS0QnjkBA08FtjQ/L8.P3SnMNVTChzyhnhCRzfl8ZFA0Fq7X0u', NULL, '2026-10-05 16:12:55', '2026-10-06 02:10:37', 'company', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (25, 'Mark Joseph Alcantara', 'mark.alcantara.bsit2020@gmail.com', NULL, '$2y$12$3MZxVW.695mhRidIGyNAc.FjzuJ9iX/1BzarQYHHCMesVYEnOL/3m', NULL, '2026-10-06 07:55:40', '2026-10-06 07:55:40', 'graduate', true, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=faces', false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (12, 'Kevin Morales', 'kevin.morales@chmsu.edu.ph', NULL, '$2y$12$HKdUS0QnjkBA08FtjQ/L8.P3SnMNVTChzyhnhCRzfl8ZFA0Fq7X0u', NULL, '2026-10-05 17:44:31', '2026-10-06 02:10:37', 'student', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (26, 'Christine Mae Salgado', 'christine.salgado.bsit2020@gmail.com', NULL, '$2y$12$ZOd/A6qXy9BgJpp0iKKN.evA2qa4ZRiE7kDakpcCn1PvSJ6iTYO3S', NULL, '2026-10-06 07:55:40', '2026-10-06 07:55:40', 'graduate', true, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces', false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (27, 'Neil Patrick Cordova', 'neil.cordova.bsit2020@gmail.com', NULL, '$2y$12$u22f61382HBu1q5wP0M6k.QUA9Gys.i.sJPG7NI.LA0cmNi42Hjru', NULL, '2026-10-06 07:55:40', '2026-10-06 07:55:40', 'graduate', true, 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=256&h=256&fit=crop&crop=faces', false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (28, 'Hannah Grace Montinola', 'hannah.montinola.bsit2020@gmail.com', NULL, '$2y$12$bhHF3AVY2nT3nzHF9r2pc.P..Zv7aLT08qi/GkgXlDaywXPUVoohG', NULL, '2026-10-06 07:55:41', '2026-10-06 07:55:41', 'graduate', true, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=256&h=256&fit=crop&crop=faces', false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (29, 'Jester Ian Espina', 'jester.espina.bsit2020@gmail.com', NULL, '$2y$12$EkJ5awns24eRT8Qbo1d7UeLx9PuTBeux8aqUJqkLac7p5sU6QUjQW', NULL, '2026-10-06 07:55:41', '2026-10-06 07:55:41', 'graduate', true, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&fit=crop&crop=faces', false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (30, 'Rhea Camille Gatuslao', 'rhea.gatuslao.bsit2020@gmail.com', NULL, '$2y$12$k6X9Qp.rKExaCVUFW2i8FOYWiFX0viV4j5JG2EIoYdsw5wmLjH3ua', NULL, '2026-10-06 07:55:41', '2026-10-06 07:55:41', 'graduate', true, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop&crop=faces', false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (31, 'Adrian Paul Lacson', 'adrian.lacson.bsit2020@gmail.com', NULL, '$2y$12$OcCm1mdpj2De6uFNyeFcq.KNKyEHReWSjvRXcwbACDpniZu8nfiVC', NULL, '2026-10-06 07:55:41', '2026-10-06 07:55:41', 'graduate', true, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=256&h=256&fit=crop&crop=faces', false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (32, 'Daphne Rose Arrieta', 'daphne.arrieta.bsit2020@gmail.com', NULL, '$2y$12$fXFkXQGdZn.CxSX8SA1rSeCCZQKkf1H/iPZSzf7vGzChwsaRPZIcS', NULL, '2026-10-06 07:55:42', '2026-10-06 07:55:42', 'graduate', true, 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=256&h=256&fit=crop&crop=faces', false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (33, 'Kenneth Ray Jamero', 'kenneth.jamero.bsit2020@gmail.com', NULL, '$2y$12$qOWNKSE9.nrICD.cuVs8cuJhHSbE9B5tTyLXeddZqeWnJwL2A.JmW', NULL, '2026-10-06 07:55:42', '2026-10-06 07:55:42', 'graduate', true, 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=256&h=256&fit=crop&crop=faces', false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (34, 'Stephanie Nicole Guanzon', 'stephanie.guanzon.bsit2020@gmail.com', NULL, '$2y$12$BqkweAoXe8B6lHp0NPFJe.SYUrUAjHQXlAotnLp0o.TuJeFgWT3YK', NULL, '2026-10-06 07:55:42', '2026-10-06 07:55:42', 'graduate', true, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces', false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (35, 'Carlo Miguel Fernandez', 'carlo.fernandez.bsita2021@gmail.com', NULL, '$2y$12$78OKbuLsj/qWPGt8WUDfGeSiiyaoFIsDG4gonLtSp2ayFnGD3GoFq', NULL, '2026-10-06 08:14:51', '2026-10-06 08:14:51', 'graduate', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (11, 'Na Ah Company', 'hr@naahcompany.com', NULL, '$2y$12$qIWrpzytdh.EMH2jrQaupegsZjuxgnZaH4ryUFeUM4KC2YdLWqEpK', NULL, '2026-10-05 17:17:09', '2026-10-06 03:19:43', 'company', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (5, 'Mariene Labrador', 'mariene@labrador.com', NULL, '$2y$12$qIWrpzytdh.EMH2jrQaupegsZjuxgnZaH4ryUFeUM4KC2YdLWqEpK', NULL, '2026-10-05 15:57:39', '2026-10-06 03:19:43', 'supervisor', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (13, 'Mark Vincent Tan', 'mark.tan@chmsu.edu.ph', NULL, '$2y$12$qIWrpzytdh.EMH2jrQaupegsZjuxgnZaH4ryUFeUM4KC2YdLWqEpK', NULL, '2026-10-06 03:18:03', '2026-10-06 03:19:43', 'student', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (20, 'Princess Nicole Reyes', 'princess.reyes.bsit4b@chmsu.edu.ph', NULL, '$2y$12$b5E7uTeFn3FQft9/Qpn8ZePLsmR6y.JkFpvUBC75YJ7SJZgufKX/G', NULL, '2026-10-06 07:55:39', '2026-10-17 12:09:28', 'student', true, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=256&h=256&fit=crop&crop=faces', false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (15, 'Christian Dave Ramos', 'christian.ramos.bsit4b@chmsu.edu.ph', NULL, '$2y$12$Gwf/UFy9I7nCyTCfWpewP.cQVHBde1FIEOYBCWFZ96cAD3XHkNFHO', NULL, '2026-10-06 07:55:37', '2026-10-06 07:55:37', 'student', true, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces', false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (16, 'Kyla Marie Mendoza', 'kyla.mendoza.bsit4b@chmsu.edu.ph', NULL, '$2y$12$4KAtogEo32jNh6BuoBUAtuiqsS0UPDRm/M5MSr9Om8rS4wFGtrHWS', NULL, '2026-10-06 07:55:38', '2026-10-06 07:55:38', 'student', true, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop&crop=faces', false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (17, 'Jhon Mark Dela Cruz', 'jhonmark.delacruz.bsit4b@chmsu.edu.ph', NULL, '$2y$12$8qsoLQUV7tEuEayjmL8FrexkbMR/qBQbfXjnlNdU8NKJkyUdU3dgW', NULL, '2026-10-06 07:55:38', '2026-10-06 07:55:38', 'student', true, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=faces', false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (36, 'Patricia Anne Lim', 'patricia.lim.bsita2021@gmail.com', NULL, '$2y$12$YxCRPHVp.lvMNhMAbh7LH.Rd9om5yAmjBEYMrXnwiezLcDrcDtUya', NULL, '2026-10-06 08:14:52', '2026-10-06 08:14:52', 'graduate', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (37, 'Renz Aldwin Torres', 'renz.torres.bsita2021@gmail.com', NULL, '$2y$12$M7eqUERcgkC02xaeph/DgOyTdNVeeElsLI7Jw7ofi2gz7wfxuoT5y', NULL, '2026-10-06 08:14:52', '2026-10-06 08:14:52', 'graduate', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (18, 'Althea Joy Villanueva', 'althea.villanueva.bsit4b@chmsu.edu.ph', NULL, '$2y$12$T5Agjo2TuDAYA5rryg7EmuPGsIasjjIUWqFohoiKxyjPEyyY9lZb6', NULL, '2026-10-06 07:55:38', '2026-10-14 02:34:03', 'student', true, 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=256&h=256&fit=crop&crop=faces', false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (22, 'Bea Bianca Castillo', 'bea.castillo.bsit4b@chmsu.edu.ph', NULL, '$2y$12$T5Agjo2TuDAYA5rryg7EmuPGsIasjjIUWqFohoiKxyjPEyyY9lZb6', NULL, '2026-10-06 07:55:39', '2026-10-14 02:34:03', 'student', true, 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=256&h=256&fit=crop&crop=faces', false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (21, 'John Paul Bautista', 'johnpaul.bautista.bsit4b@chmsu.edu.ph', NULL, '$2y$12$b5E7uTeFn3FQft9/Qpn8ZePLsmR6y.JkFpvUBC75YJ7SJZgufKX/G', NULL, '2026-10-06 07:55:39', '2026-10-17 12:09:28', 'student', true, 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=256&h=256&fit=crop&crop=faces', false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (38, 'Mara Cecille Villanueva', 'mara.villanueva.bsita2021@gmail.com', NULL, '$2y$12$tiWqSBna1oyRfq2ti2koJu6PmuZhJesoTFnq3KgRx.Trt.cZrUrIO', NULL, '2026-10-06 08:14:52', '2026-10-06 08:14:52', 'graduate', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (39, 'Jericho Paul Santos', 'jericho.santos.bsita2021@gmail.com', NULL, '$2y$12$evqQCQlvrmHwGr5/hf.q5eD7lQ/.la.c9SkYz57aPkRQlDVxApJrK', NULL, '2026-10-06 08:14:52', '2026-10-06 08:14:52', 'graduate', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (40, 'Abigail Mae Cruz', 'abigail.cruz.bsita2021@gmail.com', NULL, '$2y$12$PKN00rvc590R/LX0NvybJepx.cOoln2x3XD42aiN4NyhztFkbdyR6', NULL, '2026-10-06 08:14:53', '2026-10-06 08:14:53', 'graduate', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (41, 'Danilo Reyes Jr.', 'danilo.reyesjr.bsita2021@gmail.com', NULL, '$2y$12$Vkm2kq0FnXAASo.mv09CsubxOf8q.q1Vfory36xfP3VGfy4Sj/j0.', NULL, '2026-10-06 08:14:53', '2026-10-06 08:14:53', 'graduate', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (42, 'Lourdes Camille Ramos', 'camille.ramos.bsita2021@gmail.com', NULL, '$2y$12$v38zl9teXB5vP3hI7DtsBemuFqGPTBEeYOBukh285o6BiRb67ruHW', NULL, '2026-10-06 08:14:53', '2026-10-06 08:14:53', 'graduate', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (43, 'Aldrin Miguel Castillo', 'aldrin.castillo.bsita2021@gmail.com', NULL, '$2y$12$PnvUnBGNnR7j0HlXIzdOPObYPH9RBvnIYJEe55sJSzMqA3pLKKn7i', NULL, '2026-10-06 08:14:53', '2026-10-06 08:14:53', 'graduate', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (44, 'Nikka Faye Mendoza', 'nikka.mendoza.bsita2021@gmail.com', NULL, '$2y$12$.feRI7F.7wZLlWxKCeJF.OibOSjLwb4SbEzsXSjGh/k/WOH4YXKWS', NULL, '2026-10-06 08:14:54', '2026-10-06 08:14:54', 'graduate', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (45, 'Emmanuel Javier Garcia', 'emmanuel.garcia.bsitb2021@gmail.com', NULL, '$2y$12$xpG4cD.almMxvkB.I8xjHuZ.wlR4FkZYliFpqgotcQH7lPFHwPzmm', NULL, '2026-10-06 08:14:54', '2026-10-06 08:14:54', 'graduate', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (46, 'Sophia Rose Dela Torre', 'sophia.delatorre.bsitb2021@gmail.com', NULL, '$2y$12$jIU4MggfUgry46aOrbmw..kDR3kY6TPcvmjlybK.ZH2muDnthWjm2', NULL, '2026-10-06 08:14:54', '2026-10-06 08:14:54', 'graduate', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (47, 'Harvey James Ocampo', 'harvey.ocampo.bsitb2021@gmail.com', NULL, '$2y$12$EtAvej4b90CZvpEFIc05vOyX1aJHtZyhACcbmEQPSZdlNAFBNeLo.', NULL, '2026-10-06 08:14:54', '2026-10-06 08:14:54', 'graduate', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (48, 'Isabel Claire Reyes', 'isabel.reyes.bsitb2021@gmail.com', NULL, '$2y$12$XmLQOOri5FUGfDdGe6XtjuWoIOOS.b/yunPuhGaMZW.qzxovJCKNC', NULL, '2026-10-06 08:14:55', '2026-10-06 08:14:55', 'graduate', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (49, 'Francis Lloyd Bautista', 'francis.bautista.bsitb2021@gmail.com', NULL, '$2y$12$WHy8on1PRr3COKZQ9vJ30e.xTpkvCR0.c72GXPpe2cdpKfK5nhcY6', NULL, '2026-10-06 08:14:55', '2026-10-06 08:14:55', 'graduate', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (50, 'Rina Mae Aquino', 'rina.aquino.bsitb2021@gmail.com', NULL, '$2y$12$OTWJRO58kvJrDDUpqZhYAeOvRmjj3TedYOq3s5KNrT/PiAlhlHAx2', NULL, '2026-10-06 08:14:55', '2026-10-06 08:14:55', 'graduate', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (51, 'Gene Carlo Pascual', 'gene.pascual.bsitb2021@gmail.com', NULL, '$2y$12$ABuClzbWsVTU60rlOJrbfOci8DhWF2IYUzPX0CwV.oxgO2ZQzl9RK', NULL, '2026-10-06 08:14:55', '2026-10-06 08:14:55', 'graduate', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (52, 'Alicia Faye Corpuz', 'alicia.corpuz.bsitb2021@gmail.com', NULL, '$2y$12$oVhZRruKg1ITruuORzdI3.YBxJQJiGy2PpqHBTzLkXsvJddp.nIDq', NULL, '2026-10-06 08:14:56', '2026-10-06 08:14:56', 'graduate', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (53, 'Patrick John Navarro', 'patrick.navarro.bsitb2021@gmail.com', NULL, '$2y$12$oi2nFvuV4YpWA0v9SzyGEu7agqdqUEjEX88npp/p4zXagtSnQxil2', NULL, '2026-10-06 08:14:56', '2026-10-06 08:14:56', 'graduate', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (54, 'Christine Joy Espinosa', 'christine.espinosa.bsitb2021@gmail.com', NULL, '$2y$12$q9c/4LBdegSWnsxdh11heuBsTIjelLLvDvUdjBxVn9qRnZWHpmCkK', NULL, '2026-10-06 08:14:56', '2026-10-06 08:14:56', 'graduate', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (55, 'Dave Salvador', 'dave.salvador.bsit4b@chmsu.edu.ph', NULL, '$2y$12$LqAFoG2zD8W9e4eix4hTPO0AXCvgdMBDexDYXRfpQKnZhfTf9r9Di', NULL, '2026-10-06 09:13:44', '2026-10-06 09:13:44', 'student', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (56, 'John Eduard', 'john@eduard.com', NULL, '$2y$12$KiP6yP0Ar9gqxcdFn2RuXOUMKE48CLLDNb9b9djn3oRcpTdnOd/VK', NULL, '2026-10-07 11:08:32', '2026-10-07 11:08:37', 'student', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (57, 'IT Supervisor', 'supervisor@chmsu.edu.ph', NULL, '$2y$12$MbWBMSXPNQJOl1jW/WtrZuDW/ZW9kuibdZZisy3L0Izj9/Uk.HegS', NULL, '2026-10-12 01:12:46', '2026-10-12 01:12:46', 'supervisor', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (14, 'Alyssa Nicole Castro', 'alyssa.castro@chmsu.edu.ph', NULL, '$2y$12$qIWrpzytdh.EMH2jrQaupegsZjuxgnZaH4ryUFeUM4KC2YdLWqEpK', NULL, '2026-10-06 03:18:03', '2026-10-12 14:42:46', 'graduate', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (58, 'Joshua Vance Rivera', 'joshua.rivera.bsit4b@chmsu.edu.ph', NULL, '$2y$12$T5Agjo2TuDAYA5rryg7EmuPGsIasjjIUWqFohoiKxyjPEyyY9lZb6', NULL, '2026-10-14 02:33:24', '2026-10-14 02:34:03', 'student', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (59, 'Cedric Miguel Ramos', 'cedric.ramos.bsit4b@chmsu.edu.ph', NULL, '$2y$12$b5E7uTeFn3FQft9/Qpn8ZePLsmR6y.JkFpvUBC75YJ7SJZgufKX/G', NULL, '2026-10-17 12:09:28', '2026-10-17 12:09:28', 'student', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (60, 'Kate', 'kate@bermejo.com', NULL, '$2y$12$qDu.EBV9rhwHnqWlW5rZuOwgMrPq3GCw0Vo1iPLAbYHx05BQHu/I6', NULL, '2026-10-17 14:03:26', '2026-10-17 14:03:26', 'supervisor', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (61, 'Dreamville', 'ctrlmyre@gmail.com', NULL, '$2y$12$4eCGbOq3SFYyM.Vn311YPugH5HlZhTWZ9HQZICIKeL1xCUd.G956y', NULL, '2026-10-17 15:38:51', '2026-10-17 15:38:51', 'company', true, NULL, false);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (66, 'Vhan Gimarangan', 'vhanjhun.gimarangan@chmsu.edu.ph', NULL, '$2y$12$zR7KQTW3WecOSCEAM9ap9uAo4bbDRl/GSoqJLqifAr78glPYNSyd2', NULL, '2026-10-21 09:52:10', '2026-10-21 09:52:10', 'student', true, NULL, true);
INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role, onboarding_completed, avatar_url, must_change_password) VALUES (69, 'Vhan Giimarangan', 'vhan@gmail.com', NULL, '$2y$12$S428OlGqeFtG0327wsUH8Ow5BFVqLEx37XxuxncmntXPybTQy60be', NULL, '2026-10-21 11:16:41', '2026-10-21 11:16:41', 'student', true, NULL, true);


--
-- Name: alumni_peo_assessments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.alumni_peo_assessments_id_seq', 1, false);


--
-- Name: app_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.app_notifications_id_seq', 450, true);


--
-- Name: chat_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.chat_messages_id_seq', 1, true);


--
-- Name: company_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.company_profiles_id_seq', 4, true);


--
-- Name: evaluation_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.evaluation_questions_id_seq', 24, true);


--
-- Name: evaluation_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.evaluation_templates_id_seq', 4, true);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.failed_jobs_id_seq', 1, false);


--
-- Name: graduate_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.graduate_profiles_id_seq', 31, true);


--
-- Name: interviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.interviews_id_seq', 1, false);


--
-- Name: job_applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.job_applications_id_seq', 4, true);


--
-- Name: job_listings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.job_listings_id_seq', 5, true);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.jobs_id_seq', 2, true);


--
-- Name: jobseeker_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.jobseeker_profiles_id_seq', 10, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.migrations_id_seq', 52, true);


--
-- Name: ojt_emergency_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ojt_emergency_requests_id_seq', 2, true);


--
-- Name: ojt_postings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ojt_postings_id_seq', 16, true);


--
-- Name: ojt_pull_out_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ojt_pull_out_requests_id_seq', 6, true);


--
-- Name: ojt_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ojt_records_id_seq', 24, true);


--
-- Name: peo_definitions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.peo_definitions_id_seq', 8, true);


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.personal_access_tokens_id_seq', 78, true);


--
-- Name: portfolio_projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.portfolio_projects_id_seq', 60, true);


--
-- Name: student_achievements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.student_achievements_id_seq', 63, true);


--
-- Name: student_education_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.student_education_id_seq', 54, true);


--
-- Name: student_evaluation_answers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.student_evaluation_answers_id_seq', 11, true);


--
-- Name: student_evaluations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.student_evaluations_id_seq', 1, true);


--
-- Name: student_experiences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.student_experiences_id_seq', 92, true);


--
-- Name: student_ojt_interests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.student_ojt_interests_id_seq', 36, true);


--
-- Name: student_ojt_requirements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.student_ojt_requirements_id_seq', 40, true);


--
-- Name: student_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.student_profiles_id_seq', 54, true);


--
-- Name: student_skills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.student_skills_id_seq', 430, true);


--
-- Name: supervisor_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.supervisor_profiles_id_seq', 4, true);


--
-- Name: time_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.time_logs_id_seq', 457, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 69, true);


--
-- Name: alumni_peo_assessments alumni_peo_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alumni_peo_assessments
    ADD CONSTRAINT alumni_peo_assessments_pkey PRIMARY KEY (id);


--
-- Name: app_notifications app_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_notifications
    ADD CONSTRAINT app_notifications_pkey PRIMARY KEY (id);


--
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: company_profiles company_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_profiles
    ADD CONSTRAINT company_profiles_pkey PRIMARY KEY (id);


--
-- Name: evaluation_questions evaluation_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluation_questions
    ADD CONSTRAINT evaluation_questions_pkey PRIMARY KEY (id);


--
-- Name: evaluation_templates evaluation_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluation_templates
    ADD CONSTRAINT evaluation_templates_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: graduate_profiles graduate_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graduate_profiles
    ADD CONSTRAINT graduate_profiles_pkey PRIMARY KEY (id);


--
-- Name: interviews interviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_pkey PRIMARY KEY (id);


--
-- Name: job_applications job_applications_job_listing_id_applicant_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_job_listing_id_applicant_user_id_unique UNIQUE (job_listing_id, applicant_user_id);


--
-- Name: job_applications job_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_pkey PRIMARY KEY (id);


--
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- Name: job_listings job_listings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_listings
    ADD CONSTRAINT job_listings_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: jobseeker_profiles jobseeker_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobseeker_profiles
    ADD CONSTRAINT jobseeker_profiles_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: ojt_emergency_requests ojt_emergency_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ojt_emergency_requests
    ADD CONSTRAINT ojt_emergency_requests_pkey PRIMARY KEY (id);


--
-- Name: ojt_postings ojt_postings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ojt_postings
    ADD CONSTRAINT ojt_postings_pkey PRIMARY KEY (id);


--
-- Name: ojt_pull_out_requests ojt_pull_out_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ojt_pull_out_requests
    ADD CONSTRAINT ojt_pull_out_requests_pkey PRIMARY KEY (id);


--
-- Name: ojt_records ojt_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ojt_records
    ADD CONSTRAINT ojt_records_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: peo_definitions peo_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.peo_definitions
    ADD CONSTRAINT peo_definitions_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNIQUE (token);


--
-- Name: portfolio_projects portfolio_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_projects
    ADD CONSTRAINT portfolio_projects_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: student_achievements student_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_achievements
    ADD CONSTRAINT student_achievements_pkey PRIMARY KEY (id);


--
-- Name: student_education student_education_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_education
    ADD CONSTRAINT student_education_pkey PRIMARY KEY (id);


--
-- Name: student_evaluation_answers student_evaluation_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_evaluation_answers
    ADD CONSTRAINT student_evaluation_answers_pkey PRIMARY KEY (id);


--
-- Name: student_evaluations student_evaluations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_evaluations
    ADD CONSTRAINT student_evaluations_pkey PRIMARY KEY (id);


--
-- Name: student_experiences student_experiences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_experiences
    ADD CONSTRAINT student_experiences_pkey PRIMARY KEY (id);


--
-- Name: student_ojt_interests student_ojt_interests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_ojt_interests
    ADD CONSTRAINT student_ojt_interests_pkey PRIMARY KEY (id);


--
-- Name: student_ojt_interests student_ojt_interests_student_user_id_ojt_posting_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_ojt_interests
    ADD CONSTRAINT student_ojt_interests_student_user_id_ojt_posting_id_unique UNIQUE (student_user_id, ojt_posting_id);


--
-- Name: student_ojt_requirements student_ojt_requirements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_ojt_requirements
    ADD CONSTRAINT student_ojt_requirements_pkey PRIMARY KEY (id);


--
-- Name: student_profiles student_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_pkey PRIMARY KEY (id);


--
-- Name: student_skills student_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_skills
    ADD CONSTRAINT student_skills_pkey PRIMARY KEY (id);


--
-- Name: supervisor_profiles supervisor_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisor_profiles
    ADD CONSTRAINT supervisor_profiles_pkey PRIMARY KEY (id);


--
-- Name: time_logs time_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_logs
    ADD CONSTRAINT time_logs_pkey PRIMARY KEY (id);


--
-- Name: alumni_peo_assessments unique_alumni_peo_year; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alumni_peo_assessments
    ADD CONSTRAINT unique_alumni_peo_year UNIQUE (user_id, peo_id, survey_year);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: app_notifications_user_id_read_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX app_notifications_user_id_read_at_index ON public.app_notifications USING btree (user_id, read_at);


--
-- Name: cache_expiration_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cache_expiration_index ON public.cache USING btree (expiration);


--
-- Name: cache_locks_expiration_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cache_locks_expiration_index ON public.cache_locks USING btree (expiration);


--
-- Name: chat_messages_conversation_key_created_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX chat_messages_conversation_key_created_at_index ON public.chat_messages USING btree (conversation_key, created_at);


--
-- Name: chat_messages_receiver_id_read_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX chat_messages_receiver_id_read_at_index ON public.chat_messages USING btree (receiver_id, read_at);


--
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- Name: ojt_emergency_requests_student_user_id_coordinator_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ojt_emergency_requests_student_user_id_coordinator_status_index ON public.ojt_emergency_requests USING btree (student_user_id, coordinator_status);


--
-- Name: ojt_emergency_requests_type_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ojt_emergency_requests_type_index ON public.ojt_emergency_requests USING btree (type);


--
-- Name: ojt_pull_out_requests_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ojt_pull_out_requests_status_index ON public.ojt_pull_out_requests USING btree (status);


--
-- Name: ojt_pull_out_requests_student_user_id_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ojt_pull_out_requests_student_user_id_status_index ON public.ojt_pull_out_requests USING btree (student_user_id, status);


--
-- Name: personal_access_tokens_expires_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX personal_access_tokens_expires_at_index ON public.personal_access_tokens USING btree (expires_at);


--
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: student_evaluations_student_user_id_company_user_id_status_inde; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX student_evaluations_student_user_id_company_user_id_status_inde ON public.student_evaluations USING btree (student_user_id, company_user_id, status);


--
-- Name: student_evaluations_student_user_id_term_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX student_evaluations_student_user_id_term_status_index ON public.student_evaluations USING btree (student_user_id, term, status);


--
-- Name: alumni_peo_assessments alumni_peo_assessments_peo_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alumni_peo_assessments
    ADD CONSTRAINT alumni_peo_assessments_peo_id_foreign FOREIGN KEY (peo_id) REFERENCES public.peo_definitions(id) ON DELETE CASCADE;


--
-- Name: alumni_peo_assessments alumni_peo_assessments_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alumni_peo_assessments
    ADD CONSTRAINT alumni_peo_assessments_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: app_notifications app_notifications_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_notifications
    ADD CONSTRAINT app_notifications_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: chat_messages chat_messages_receiver_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_receiver_id_foreign FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: chat_messages chat_messages_sender_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_sender_id_foreign FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: company_profiles company_profiles_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_profiles
    ADD CONSTRAINT company_profiles_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: evaluation_questions evaluation_questions_template_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluation_questions
    ADD CONSTRAINT evaluation_questions_template_id_foreign FOREIGN KEY (template_id) REFERENCES public.evaluation_templates(id) ON DELETE CASCADE;


--
-- Name: evaluation_templates evaluation_templates_supervisor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluation_templates
    ADD CONSTRAINT evaluation_templates_supervisor_id_foreign FOREIGN KEY (supervisor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: graduate_profiles graduate_profiles_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graduate_profiles
    ADD CONSTRAINT graduate_profiles_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: interviews interviews_company_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_company_user_id_foreign FOREIGN KEY (company_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: interviews interviews_job_application_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_job_application_id_foreign FOREIGN KEY (job_application_id) REFERENCES public.job_applications(id) ON DELETE CASCADE;


--
-- Name: job_applications job_applications_applicant_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_applicant_user_id_foreign FOREIGN KEY (applicant_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: job_applications job_applications_job_listing_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_job_listing_id_foreign FOREIGN KEY (job_listing_id) REFERENCES public.job_listings(id) ON DELETE CASCADE;


--
-- Name: job_listings job_listings_company_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_listings
    ADD CONSTRAINT job_listings_company_user_id_foreign FOREIGN KEY (company_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: jobseeker_profiles jobseeker_profiles_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobseeker_profiles
    ADD CONSTRAINT jobseeker_profiles_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ojt_emergency_requests ojt_emergency_requests_coordinator_action_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ojt_emergency_requests
    ADD CONSTRAINT ojt_emergency_requests_coordinator_action_by_foreign FOREIGN KEY (coordinator_action_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: ojt_emergency_requests ojt_emergency_requests_ojt_interest_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ojt_emergency_requests
    ADD CONSTRAINT ojt_emergency_requests_ojt_interest_id_foreign FOREIGN KEY (ojt_interest_id) REFERENCES public.student_ojt_interests(id) ON DELETE SET NULL;


--
-- Name: ojt_emergency_requests ojt_emergency_requests_ojt_record_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ojt_emergency_requests
    ADD CONSTRAINT ojt_emergency_requests_ojt_record_id_foreign FOREIGN KEY (ojt_record_id) REFERENCES public.ojt_records(id) ON DELETE SET NULL;


--
-- Name: ojt_emergency_requests ojt_emergency_requests_student_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ojt_emergency_requests
    ADD CONSTRAINT ojt_emergency_requests_student_user_id_foreign FOREIGN KEY (student_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ojt_postings ojt_postings_company_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ojt_postings
    ADD CONSTRAINT ojt_postings_company_user_id_foreign FOREIGN KEY (company_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ojt_pull_out_requests ojt_pull_out_requests_admin_action_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ojt_pull_out_requests
    ADD CONSTRAINT ojt_pull_out_requests_admin_action_by_foreign FOREIGN KEY (admin_action_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: ojt_pull_out_requests ojt_pull_out_requests_ojt_interest_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ojt_pull_out_requests
    ADD CONSTRAINT ojt_pull_out_requests_ojt_interest_id_foreign FOREIGN KEY (ojt_interest_id) REFERENCES public.student_ojt_interests(id) ON DELETE SET NULL;


--
-- Name: ojt_pull_out_requests ojt_pull_out_requests_ojt_record_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ojt_pull_out_requests
    ADD CONSTRAINT ojt_pull_out_requests_ojt_record_id_foreign FOREIGN KEY (ojt_record_id) REFERENCES public.ojt_records(id) ON DELETE SET NULL;


--
-- Name: ojt_pull_out_requests ojt_pull_out_requests_student_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ojt_pull_out_requests
    ADD CONSTRAINT ojt_pull_out_requests_student_user_id_foreign FOREIGN KEY (student_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ojt_pull_out_requests ojt_pull_out_requests_supervisor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ojt_pull_out_requests
    ADD CONSTRAINT ojt_pull_out_requests_supervisor_id_foreign FOREIGN KEY (supervisor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: ojt_records ojt_records_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ojt_records
    ADD CONSTRAINT ojt_records_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: portfolio_projects portfolio_projects_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolio_projects
    ADD CONSTRAINT portfolio_projects_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: student_achievements student_achievements_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_achievements
    ADD CONSTRAINT student_achievements_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: student_education student_education_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_education
    ADD CONSTRAINT student_education_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: student_evaluation_answers student_evaluation_answers_evaluation_question_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_evaluation_answers
    ADD CONSTRAINT student_evaluation_answers_evaluation_question_id_foreign FOREIGN KEY (evaluation_question_id) REFERENCES public.evaluation_questions(id) ON DELETE CASCADE;


--
-- Name: student_evaluation_answers student_evaluation_answers_student_evaluation_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_evaluation_answers
    ADD CONSTRAINT student_evaluation_answers_student_evaluation_id_foreign FOREIGN KEY (student_evaluation_id) REFERENCES public.student_evaluations(id) ON DELETE CASCADE;


--
-- Name: student_evaluations student_evaluations_company_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_evaluations
    ADD CONSTRAINT student_evaluations_company_user_id_foreign FOREIGN KEY (company_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: student_evaluations student_evaluations_ojt_posting_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_evaluations
    ADD CONSTRAINT student_evaluations_ojt_posting_id_foreign FOREIGN KEY (ojt_posting_id) REFERENCES public.ojt_postings(id) ON DELETE SET NULL;


--
-- Name: student_evaluations student_evaluations_ojt_record_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_evaluations
    ADD CONSTRAINT student_evaluations_ojt_record_id_foreign FOREIGN KEY (ojt_record_id) REFERENCES public.ojt_records(id) ON DELETE SET NULL;


--
-- Name: student_evaluations student_evaluations_student_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_evaluations
    ADD CONSTRAINT student_evaluations_student_user_id_foreign FOREIGN KEY (student_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: student_evaluations student_evaluations_supervisor_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_evaluations
    ADD CONSTRAINT student_evaluations_supervisor_user_id_foreign FOREIGN KEY (supervisor_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: student_evaluations student_evaluations_template_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_evaluations
    ADD CONSTRAINT student_evaluations_template_id_foreign FOREIGN KEY (template_id) REFERENCES public.evaluation_templates(id) ON DELETE CASCADE;


--
-- Name: student_experiences student_experiences_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_experiences
    ADD CONSTRAINT student_experiences_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: student_ojt_interests student_ojt_interests_endorsed_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_ojt_interests
    ADD CONSTRAINT student_ojt_interests_endorsed_by_foreign FOREIGN KEY (endorsed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: student_ojt_interests student_ojt_interests_ojt_posting_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_ojt_interests
    ADD CONSTRAINT student_ojt_interests_ojt_posting_id_foreign FOREIGN KEY (ojt_posting_id) REFERENCES public.ojt_postings(id) ON DELETE CASCADE;


--
-- Name: student_ojt_interests student_ojt_interests_student_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_ojt_interests
    ADD CONSTRAINT student_ojt_interests_student_user_id_foreign FOREIGN KEY (student_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: student_ojt_requirements student_ojt_requirements_interest_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_ojt_requirements
    ADD CONSTRAINT student_ojt_requirements_interest_id_foreign FOREIGN KEY (interest_id) REFERENCES public.student_ojt_interests(id) ON DELETE SET NULL;


--
-- Name: student_ojt_requirements student_ojt_requirements_posting_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_ojt_requirements
    ADD CONSTRAINT student_ojt_requirements_posting_id_foreign FOREIGN KEY (posting_id) REFERENCES public.ojt_postings(id) ON DELETE SET NULL;


--
-- Name: student_ojt_requirements student_ojt_requirements_student_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_ojt_requirements
    ADD CONSTRAINT student_ojt_requirements_student_user_id_foreign FOREIGN KEY (student_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: student_ojt_requirements student_ojt_requirements_supervisor_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_ojt_requirements
    ADD CONSTRAINT student_ojt_requirements_supervisor_user_id_foreign FOREIGN KEY (supervisor_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: student_profiles student_profiles_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: student_skills student_skills_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_skills
    ADD CONSTRAINT student_skills_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: supervisor_profiles supervisor_profiles_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisor_profiles
    ADD CONSTRAINT supervisor_profiles_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: time_logs time_logs_ojt_record_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_logs
    ADD CONSTRAINT time_logs_ojt_record_id_foreign FOREIGN KEY (ojt_record_id) REFERENCES public.ojt_records(id) ON DELETE SET NULL;


--
-- Name: time_logs time_logs_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_logs
    ADD CONSTRAINT time_logs_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


