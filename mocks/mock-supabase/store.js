/**
 * In-memory data store for mock Supabase.
 * Each table has a schema definition (columns, userIdColumn for RLS, adminOnly flag).
 * Data is stored as simple JSON arrays.
 */

const fs = require('fs');
const path = require('path');

// Table schema definitions — all tables from specs/schema/database-schema.md
const TABLE_SCHEMAS = {
  // ─── V1 Base Tables ───
  users: {
    columns: [
      'id', 'email', 'role', 'plan', 'display_name', 'avatar_url',
      'analysis_count', 'spec_count', 'investigation_count',
      'monthly_analysis_count', 'monthly_spec_count',
      'stripe_customer_id', 'stripe_subscription_id',
      'created_at', 'updated_at'
    ],
    userIdColumn: 'id', // users table: the id IS the user_id
    adminOnly: false,
  },

  failure_analyses: {
    columns: [
      'id', 'user_id', 'adhesive_type', 'substrate_a', 'substrate_b',
      'failure_mode', 'environment_conditions', 'application_method',
      'surface_preparation', 'cure_conditions', 'additional_details',
      'result', 'confidence_score', 'status',
      // V2 additions
      'substrate_a_normalized', 'substrate_b_normalized',
      'root_cause_category', 'industry', 'production_impact',
      'created_at', 'updated_at'
    ],
    userIdColumn: 'user_id',
    adminOnly: false,
  },

  spec_requests: {
    columns: [
      'id', 'user_id', 'application_description', 'substrate_a', 'substrate_b',
      'operating_temp_min', 'operating_temp_max', 'load_type',
      'environment', 'cure_constraints', 'additional_requirements',
      'result', 'confidence_score', 'status',
      'source_analysis_id',
      'created_at', 'updated_at'
    ],
    userIdColumn: 'user_id',
    adminOnly: false,
  },

  case_library: {
    columns: [
      'id', 'material_category', 'material_subcategory', 'failure_mode',
      'root_cause', 'title', 'summary', 'solution', 'lessons_learned',
      'industry', 'slug', 'meta_description', 'is_featured',
      'created_at', 'updated_at'
    ],
    userIdColumn: null, // Public table, no RLS by user_id
    adminOnly: false,
  },

  product_specifications: {
    columns: [
      'id', 'product_name', 'manufacturer', 'chemistry_type',
      'recommended_substrates', 'surface_prep_requirements', 'cure_schedule',
      'operating_temp_min_c', 'operating_temp_max_c', 'mechanical_properties',
      'mix_ratio', 'pot_life_minutes', 'fixture_time_minutes',
      'full_cure_hours', 'shelf_life_months', 'tds_pdf_url',
      'extraction_confidence', 'field_failure_count', 'field_failure_rate',
      'verified_by_user_id', 'manufacturer_claimed', 'manufacturer_org_id',
      'manufacturer_verified_at', 'manufacturer_contact_email',
      'claimed_tds_version', 'page_published', 'page_slug',
      'created_at', 'updated_at'
    ],
    userIdColumn: null, // Not user-scoped
    adminOnly: false,
  },

  // ─── V2 Feedback & Knowledge ───
  analysis_feedback: {
    columns: [
      'id', 'user_id', 'analysis_id', 'spec_id',
      'was_helpful', 'root_cause_confirmed', 'recommendation_implemented',
      'outcome', 'actual_root_cause', 'what_worked', 'what_didnt_work',
      'time_to_resolution', 'estimated_cost_saved',
      'substrate_a_actual', 'substrate_b_actual',
      'surface_prep_actual', 'adhesive_used_actual',
      'feedback_source', 'created_at'
    ],
    userIdColumn: 'user_id',
    adminOnly: false,
  },

  knowledge_patterns: {
    columns: [
      'id', 'pattern_type', 'pattern_key',
      'total_cases', 'cases_with_feedback', 'resolved_cases', 'resolution_rate',
      'top_root_causes', 'effective_solutions', 'ineffective_solutions', 'common_specs',
      'confidence_level', 'last_updated'
    ],
    userIdColumn: null, // Readable by all authenticated users
    adminOnly: false,
  },

  // ─── V2 Observability ───
  ai_engine_logs: {
    columns: [
      'id', 'user_id', 'request_type', 'analysis_id', 'spec_id',
      'model', 'temperature', 'max_tokens',
      'system_prompt_tokens', 'user_prompt_tokens', 'knowledge_context_tokens',
      'completion_tokens', 'total_tokens',
      'had_knowledge_context', 'knowledge_patterns_used', 'knowledge_confidence_level',
      'latency_ms', 'time_to_first_token_ms',
      'response_parsed_ok', 'confidence_score', 'root_causes_count',
      'error', 'error_type', 'error_message', 'retry_count',
      'estimated_cost_usd', 'created_at'
    ],
    userIdColumn: 'user_id',
    adminOnly: true,
  },

  api_request_logs: {
    columns: [
      'id', 'method', 'path', 'status_code', 'latency_ms',
      'user_id', 'user_plan', 'ip_address', 'user_agent',
      'error_code', 'error_message', 'created_at'
    ],
    userIdColumn: 'user_id',
    adminOnly: true,
  },

  admin_audit_log: {
    columns: [
      'id', 'admin_user_id', 'action', 'resource_type', 'resource_id',
      'metadata', 'ip_address', 'created_at'
    ],
    userIdColumn: 'admin_user_id',
    adminOnly: true,
  },

  daily_metrics: {
    columns: [
      'id', 'date',
      'total_analyses', 'total_specs', 'total_signups', 'total_feedback',
      'active_users', 'returning_users', 'feedback_rate',
      'avg_latency_ms', 'p95_latency_ms', 'p99_latency_ms',
      'ai_error_rate', 'avg_confidence', 'total_tokens_used', 'estimated_ai_cost_usd',
      'analyses_with_knowledge', 'knowledge_coverage_rate',
      'free_to_pro_conversions', 'pdf_exports', 'expert_review_requests',
      'feedback_resolved', 'feedback_not_resolved', 'resolution_rate',
      'created_at', 'updated_at'
    ],
    userIdColumn: null,
    adminOnly: true,
  },

  // ─── Quality Module (8D) Tables ───
  investigations: {
    columns: [
      'id', 'investigation_number', 'title', 'status', 'severity',
      'product_part_number', 'customer_name', 'customer_complaint_ref',
      'lot_batch_number', 'defect_quantity', 'scrap_rework_cost',
      'analysis_id', 'spec_id',
      'five_whys', 'escape_point', 'fishbone_data',
      'closure_summary', 'lessons_learned', 'publish_case',
      'report_template_key', 'source_email_id',
      'created_by', 'created_at', 'updated_at', 'closed_at'
    ],
    userIdColumn: 'created_by',
    adminOnly: false,
  },

  investigation_members: {
    columns: [
      'id', 'investigation_id', 'user_id', 'role', 'added_at'
    ],
    userIdColumn: 'user_id',
    adminOnly: false,
  },

  investigation_actions: {
    columns: [
      'id', 'investigation_id', 'discipline', 'action_type', 'category',
      'description', 'owner_user_id', 'priority', 'due_date', 'completed_date',
      'status', 'verification_method', 'verification_criteria',
      'verification_result', 'evidence_urls', 'created_at'
    ],
    userIdColumn: 'owner_user_id',
    adminOnly: false,
  },

  investigation_signatures: {
    columns: [
      'id', 'investigation_id', 'user_id', 'discipline',
      'signature_hash', 'signed_at'
    ],
    userIdColumn: 'user_id',
    adminOnly: false,
  },

  investigation_attachments: {
    columns: [
      'id', 'investigation_id', 'action_id', 'discipline',
      'file_name', 'file_url', 'file_size_bytes', 'is_image',
      'annotation_data', 'annotated_file_url', 'original_file_url',
      'caption', 'sort_order', 'uploaded_by', 'uploaded_at'
    ],
    userIdColumn: 'uploaded_by',
    adminOnly: false,
  },

  investigation_comments: {
    columns: [
      'id', 'investigation_id', 'discipline', 'parent_comment_id',
      'user_id', 'body', 'is_resolution', 'is_pinned', 'is_external',
      'mentioned_user_ids', 'image_urls', 'edited_at', 'created_at'
    ],
    userIdColumn: 'user_id',
    adminOnly: false,
  },

  investigation_audit_log: {
    columns: [
      'id', 'investigation_id', 'event_type', 'event_detail',
      'actor_user_id', 'discipline', 'target_type', 'target_id',
      'diff_data', 'ai_original_content', 'ip_address', 'created_at'
    ],
    userIdColumn: 'actor_user_id',
    adminOnly: false,
  },

  // Alias for spec requirement "investigation_sessions"
  investigation_sessions: {
    columns: [
      'id', 'analysis_id', 'investigation_id', 'user_id',
      'mode', 'status', 'conversation_history', 'tool_calls',
      'extracted_data', 'final_analysis', 'message_count',
      'ai_token_usage', 'created_at', 'updated_at'
    ],
    userIdColumn: 'user_id',
    adminOnly: false,
  },

  // Alias for spec: "investigation_disciplines" — using investigation_members + a discipline dimension
  // This maps to investigation_members (the "team" table) since spec says investigation_disciplines
  investigation_disciplines: {
    columns: [
      'id', 'investigation_id', 'discipline', 'status',
      'started_at', 'completed_at', 'user_id', 'created_at'
    ],
    userIdColumn: 'user_id',
    adminOnly: false,
  },

  // Alias for spec: "investigation_timeline"
  investigation_timeline: {
    columns: [
      'id', 'investigation_id', 'event_type', 'event_detail',
      'discipline', 'actor_user_id', 'created_at'
    ],
    userIdColumn: 'actor_user_id',
    adminOnly: false,
  },

  // Alias for spec: "investigation_team_members"
  investigation_team_members: {
    columns: [
      'id', 'investigation_id', 'user_id', 'role', 'added_at'
    ],
    userIdColumn: 'user_id',
    adminOnly: false,
  },

  // Notifications
  notifications: {
    columns: [
      'id', 'user_id', 'investigation_id', 'event_type',
      'title', 'body', 'link_path', 'is_read', 'email_sent', 'created_at'
    ],
    userIdColumn: 'user_id',
    adminOnly: false,
  },

  // Alias for spec: "notification_events"
  notification_events: {
    columns: [
      'id', 'user_id', 'investigation_id', 'event_type',
      'title', 'body', 'link_path', 'is_read', 'email_sent', 'created_at'
    ],
    userIdColumn: 'user_id',
    adminOnly: false,
  },

  notification_preferences: {
    columns: [
      'id', 'user_id', 'email_enabled', 'digest_mode', 'digest_hour_utc',
      'quiet_start_utc', 'quiet_end_utc', 'event_overrides', 'muted_investigations'
    ],
    userIdColumn: 'user_id',
    adminOnly: false,
  },

  report_templates: {
    columns: [
      'id', 'org_id', 'template_key', 'display_name',
      'paper_size', 'orientation', 'logo_url',
      'brand_primary_color', 'brand_accent_color', 'company_info',
      'custom_fields', 'hide_gravix_branding', 'section_config', 'is_default'
    ],
    userIdColumn: null,
    adminOnly: false,
  },

  visual_analysis_results: {
    columns: [
      'id', 'analysis_id', 'image_url', 'image_hash',
      'ai_failure_mode', 'ai_visual_findings', 'ai_confidence',
      'confirmed_failure_mode', 'confirmed_root_cause',
      'substrate_pair_normalized', 'adhesive_chemistry',
      'environment_tags', 'is_reference_image', 'created_at'
    ],
    userIdColumn: null,
    adminOnly: false,
  },

  pattern_alerts: {
    columns: [
      'id', 'alert_type', 'severity', 'title', 'description',
      'affected_product', 'affected_substrates', 'affected_failure_mode',
      'statistical_confidence', 'baseline_rate', 'observed_rate', 'window_days',
      'affected_investigation_ids', 'affected_org_count',
      'hypothesis', 'status', 'created_at', 'resolved_at'
    ],
    userIdColumn: null,
    adminOnly: true,
  },

  rate_limits: {
    columns: [
      'id', 'user_id', 'ip_address', 'endpoint', 'window_key',
      'window_start', 'request_count', 'limit_value', 'plan_tier'
    ],
    userIdColumn: 'user_id',
    adminOnly: false,
  },

  // Cron run log (from spec requirement)
  cron_run_log: {
    columns: [
      'id', 'job_name', 'status', 'started_at', 'completed_at',
      'records_processed', 'error_message', 'metadata', 'created_at'
    ],
    userIdColumn: null,
    adminOnly: true,
  },
};

class Store {
  constructor() {
    this.tables = {};
    this.authUsers = []; // Separate auth user store (email + hashed password)
    this._initTables();
  }

  _initTables() {
    for (const tableName of Object.keys(TABLE_SCHEMAS)) {
      this.tables[tableName] = [];
    }
  }

  getTableSchema(tableName) {
    return TABLE_SCHEMAS[tableName] || null;
  }

  getTableNames() {
    return Object.keys(TABLE_SCHEMAS);
  }

  getTableData(tableName) {
    return this.tables[tableName] || null;
  }

  setTableData(tableName, data) {
    if (TABLE_SCHEMAS[tableName]) {
      this.tables[tableName] = data;
    }
  }

  /**
   * Load seed data from seed.json and reset all tables.
   */
  loadSeed() {
    this._initTables();
    this.authUsers = [];

    const seedPath = path.join(__dirname, 'seed.json');
    if (!fs.existsSync(seedPath)) {
      console.warn('[store] seed.json not found, starting with empty tables');
      return;
    }

    const seed = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

    // Load auth users
    if (seed.auth_users) {
      this.authUsers = seed.auth_users;
    }

    // Load table data
    for (const [tableName, rows] of Object.entries(seed.tables || {})) {
      if (TABLE_SCHEMAS[tableName]) {
        this.tables[tableName] = rows;
      }
    }

    const tableCount = Object.keys(TABLE_SCHEMAS).length;
    const seededTables = Object.keys(seed.tables || {}).length;
    console.log(`[store] Loaded seed data: ${this.authUsers.length} auth users, ${seededTables} seeded tables, ${tableCount} total tables`);
  }
}

module.exports = { Store, TABLE_SCHEMAS };
