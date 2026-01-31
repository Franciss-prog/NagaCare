-- ============================================================================
-- APPOINTMENTS TABLE
-- Run this in your Supabase SQL editor to create the appointments table
-- ============================================================================

CREATE TABLE public.appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  facility_id uuid NOT NULL,
  resident_id uuid,  -- NULL when slot is available, filled when booked
  appointment_date date NOT NULL,
  time_slot text NOT NULL,  -- e.g., "10:00 AM", "2:30 PM"
  service_type text,  -- e.g., "consultation", "vaccination", "prenatal"
  status text NOT NULL DEFAULT 'available' CHECK (status = ANY (ARRAY['available', 'booked', 'completed', 'cancelled', 'no_show'])),
  booked_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT appointments_pkey PRIMARY KEY (id),
  CONSTRAINT appointments_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES public.health_facilities(id),
  CONSTRAINT appointments_resident_id_fkey FOREIGN KEY (resident_id) REFERENCES public.residents(id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for finding available slots at a facility on a date
CREATE INDEX idx_appointments_facility_date_status 
ON public.appointments(facility_id, appointment_date, status);

-- Index for resident's appointments
CREATE INDEX idx_appointments_resident_id 
ON public.appointments(resident_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Anyone can view available slots
CREATE POLICY "Available slots are viewable by everyone"
ON public.appointments FOR SELECT
USING (status = 'available');

-- Authenticated users can view their own booked appointments
CREATE POLICY "Users can view their own appointments"
ON public.appointments FOR SELECT
USING (
  resident_id IN (
    SELECT id FROM public.residents WHERE auth_id = (
      SELECT id FROM public.users WHERE id::text = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  )
);

-- For now, allow all operations (you can tighten this later)
-- This is permissive for development
CREATE POLICY "Allow all for development"
ON public.appointments FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================================================
-- SAMPLE DATA: Create available slots
-- Run this to populate some test appointment slots
-- ============================================================================

-- Replace 'YOUR_FACILITY_ID' with actual facility IDs from your health_facilities table

-- Example: Create slots for next 7 days
-- You would run this for each facility

/*
DO $$
DECLARE
  facility_id uuid := 'YOUR_FACILITY_ID_HERE';
  current_date date := CURRENT_DATE + 1;
  slot_times text[] := ARRAY['08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'];
  d integer;
  t text;
BEGIN
  FOR d IN 1..7 LOOP
    FOREACH t IN ARRAY slot_times LOOP
      INSERT INTO public.appointments (facility_id, appointment_date, time_slot, status)
      VALUES (facility_id, current_date + d - 1, t, 'available')
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
*/
