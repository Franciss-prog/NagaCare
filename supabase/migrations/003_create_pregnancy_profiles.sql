-- ============================================================================
-- PREGNANCY PROFILING MODULE
-- Migration 003: Create pregnancy_profiles and related tables
-- ============================================================================

-- ============================================================================
-- 1. PREGNANCY PROFILES (main table)
-- ============================================================================
CREATE TABLE IF NOT EXISTS pregnancy_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'inactive')),

  -- ============================
  -- SECTION 1: Pregnancy History
  -- ============================
  gravida INT DEFAULT 0,
  para INT DEFAULT 0,
  term INT DEFAULT 0,
  pre_term INT DEFAULT 0,
  abortion INT DEFAULT 0,
  living INT DEFAULT 0,
  delivery_type TEXT CHECK (delivery_type IN (
    'vaginal', 'cesarean', 'vacuum_assisted', 'forceps_assisted', 'vbac', NULL
  )),

  -- ============================
  -- SECTION 2: Physical Examination
  -- ============================
  blood_pressure TEXT,                -- e.g. "120/80"
  heart_rate INT,
  respiratory_rate INT,
  height_cm NUMERIC(5,1),
  weight_kg NUMERIC(5,1),
  bmi NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE WHEN height_cm > 0 THEN weight_kg / ((height_cm / 100.0) * (height_cm / 100.0))
    ELSE NULL END
  ) STORED,
  temperature_c NUMERIC(4,1),
  visual_acuity_left TEXT,
  visual_acuity_right TEXT,

  -- ============================
  -- SECTION 3: Pediatric 0-24 months
  -- ============================
  pediatric_0_24_applicable BOOLEAN DEFAULT FALSE,
  ped_length_cm NUMERIC(5,1),
  ped_waist_circumference_cm NUMERIC(5,1),
  ped_muac_cm NUMERIC(5,1),           -- mid-upper arm circumference
  ped_head_circumference_cm NUMERIC(5,1),
  ped_hip_cm NUMERIC(5,1),
  ped_skinfold_thickness_mm NUMERIC(5,1),
  ped_limbs_description TEXT,

  -- ============================
  -- SECTION 4: Pediatric 0-60 months
  -- ============================
  ped_blood_type TEXT CHECK (ped_blood_type IN (
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', NULL
  )),
  ped_z_score NUMERIC(5,2),

  -- ============================
  -- SECTION 5: General Survey (JSONB for checkbox groups)
  -- Each key maps to { selected: string[], others: string }
  -- ============================
  general_survey JSONB DEFAULT '{}'::JSONB,
  /*
    Structure:
    {
      "heent": { "selected": ["essentially_normal", "pale_conjunctiva"], "others": "" },
      "chest_breast_lungs": { "selected": [...], "others": "" },
      "heart": { "selected": [...], "others": "" },
      "abdomen": { "selected": [...], "others": "" },
      "genitourinary": { "selected": [...], "others": "" },
      "digital_rectal": { "selected": [...], "others": "" },
      "skin_extremities": { "selected": [...], "others": "" },
      "neurological": { "selected": [...], "others": "" }
    }
  */

  -- ============================
  -- SECTION 6: NCD High Risk Assessment (JSONB)
  -- ============================
  ncd_assessment JSONB DEFAULT '{}'::JSONB,
  /*
    Structure:
    {
      "eats_processed_foods": true/false,
      "three_servings_vegetables": true/false,
      "physically_active": true/false,
      "uses_tobacco": true/false,
      "consumes_alcohol": true/false,
      "diabetes_status": "yes" | "no" | "do_not_know",
      "diabetes_medication": true/false,
      "symptoms": ["polydipsia", "polyuria", "polyphagia"],
      "angina_heart_attack": true/false,
      "chest_pain_activity": true/false,
      "chest_pain_rest": true/false,
      "left_arm_pain": true/false,
      "risk_level": "<10%" | "10-<20%" | "20-<30%" | "30-<40%" | ">=40%"
    }
  */

  -- ============================
  -- SECTION 7: Lab Results (JSONB array)
  -- ============================
  lab_results JSONB DEFAULT '[]'::JSONB,
  /*
    Structure (array of):
    [
      {
        "test_type": "raised_blood_glucose" | "raised_blood_lipids" | "urine_ketones" | "urine_protein",
        "result": "yes" | "no",
        "date": "2026-01-15",
        "value": "126 mg/dL"
      }
    ]
  */

  -- ============================
  -- METADATA
  -- ============================
  last_menstrual_period DATE,
  estimated_due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_pregnancy_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pregnancy_profiles_updated
  BEFORE UPDATE ON pregnancy_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_pregnancy_profile_timestamp();

-- Indexes
CREATE INDEX idx_pregnancy_profiles_resident ON pregnancy_profiles(resident_id);
CREATE INDEX idx_pregnancy_profiles_status ON pregnancy_profiles(status);
CREATE INDEX idx_pregnancy_profiles_created_at ON pregnancy_profiles(created_at DESC);


-- ============================================================================
-- 2. ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE pregnancy_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: residents can view/edit their own profiles
CREATE POLICY "residents_own_profile"
  ON pregnancy_profiles
  FOR ALL
  USING (
    resident_id IN (
      SELECT r.id FROM residents r
      JOIN users u ON r.auth_id = u.id
      WHERE u.id = auth.uid()
    )
  )
  WITH CHECK (
    resident_id IN (
      SELECT r.id FROM residents r
      JOIN users u ON r.auth_id = u.id
      WHERE u.id = auth.uid()
    )
  );

-- Policy: staff users (city health personnel) can view all profiles
CREATE POLICY "staff_view_all_profiles"
  ON pregnancy_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.user_role = 'staff'
    )
  );

-- Policy: staff users can update profiles (not delete)
CREATE POLICY "staff_update_profiles"
  ON pregnancy_profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.user_role = 'staff'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.user_role = 'staff'
    )
  );

-- Policy: staff can insert profiles on behalf of residents
CREATE POLICY "staff_insert_profiles"
  ON pregnancy_profiles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.user_role = 'staff'
    )
  );


-- ============================================================================
-- 3. AUDIT LOG for sensitive health data changes
-- ============================================================================
CREATE TABLE IF NOT EXISTS pregnancy_profile_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES pregnancy_profiles(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES users(id),
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'status_changed')),
  changed_fields JSONB,
  previous_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE pregnancy_profile_audit ENABLE ROW LEVEL SECURITY;

-- Only staff can view audit logs
CREATE POLICY "staff_view_audit"
  ON pregnancy_profile_audit
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.user_role = 'staff'
    )
  );

-- Anyone authenticated can insert audit entries (via triggers/service)
CREATE POLICY "authenticated_insert_audit"
  ON pregnancy_profile_audit
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX idx_audit_profile ON pregnancy_profile_audit(profile_id);
CREATE INDEX idx_audit_created ON pregnancy_profile_audit(created_at DESC);


-- ============================================================================
-- 4. AUDIT TRIGGER (auto-log changes)
-- ============================================================================
CREATE OR REPLACE FUNCTION log_pregnancy_profile_changes()
RETURNS TRIGGER AS $$
DECLARE
  changed JSONB := '{}'::JSONB;
  prev JSONB := '{}'::JSONB;
  curr JSONB := '{}'::JSONB;
  col TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO pregnancy_profile_audit (profile_id, changed_by, action, new_values)
    VALUES (NEW.id, NEW.created_by, 'created', to_jsonb(NEW));
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    -- Compare columns and log only changes
    FOR col IN
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'pregnancy_profiles'
      AND column_name NOT IN ('id', 'created_at', 'updated_at', 'bmi')
    LOOP
      IF to_jsonb(NEW) -> col IS DISTINCT FROM to_jsonb(OLD) -> col THEN
        changed := changed || jsonb_build_object(col, true);
        prev := prev || jsonb_build_object(col, to_jsonb(OLD) -> col);
        curr := curr || jsonb_build_object(col, to_jsonb(NEW) -> col);
      END IF;
    END LOOP;

    IF changed != '{}'::JSONB THEN
      INSERT INTO pregnancy_profile_audit (profile_id, changed_by, action, changed_fields, previous_values, new_values)
      VALUES (NEW.id, COALESCE(NEW.created_by, auth.uid()), 'updated', changed, prev, curr);
    END IF;

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_pregnancy_audit
  AFTER INSERT OR UPDATE ON pregnancy_profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_pregnancy_profile_changes();
