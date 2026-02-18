-- ============================================================================
-- ADD MISSING COLUMNS TO yakap_applications TABLE
-- Run this in your Supabase SQL editor
-- ============================================================================

-- Add resident_id column (links to residents table)
ALTER TABLE public.yakap_applications
ADD COLUMN IF NOT EXISTS resident_id uuid REFERENCES public.residents(id);

-- Add form_data column (stores the full PhilHealth Konsulta form as JSON)
ALTER TABLE public.yakap_applications
ADD COLUMN IF NOT EXISTS form_data jsonb;

-- Index for looking up applications by resident
CREATE INDEX IF NOT EXISTS idx_yakap_resident_id
ON public.yakap_applications(resident_id);

-- ============================================================================
-- FIX membership_type CHECK CONSTRAINT
-- Allow 'member', 'dependent', 'non-member' values used by the app
-- ============================================================================

ALTER TABLE public.yakap_applications 
DROP CONSTRAINT IF EXISTS yakap_applications_membership_type_check;

ALTER TABLE public.yakap_applications 
ADD CONSTRAINT yakap_applications_membership_type_check 
CHECK (membership_type = ANY (ARRAY['member', 'dependent', 'non-member', 'individual', 'family', 'senior', 'pwd']));

-- ============================================================================
-- RLS POLICIES for resident access
-- ============================================================================

-- Residents can view their own applications
CREATE POLICY "Users can view their own yakap applications"
ON public.yakap_applications FOR SELECT
USING (
  resident_id IN (
    SELECT id FROM public.residents WHERE auth_id = (
      SELECT id FROM public.users WHERE id = auth.uid()
    )
  )
);

-- Residents can insert their own applications
CREATE POLICY "Users can submit yakap applications"
ON public.yakap_applications FOR INSERT
WITH CHECK (
  resident_id IN (
    SELECT id FROM public.residents WHERE auth_id = (
      SELECT id FROM public.users WHERE id = auth.uid()
    )
  )
);
