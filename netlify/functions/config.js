/* =====================================================================
 * GET /api/config
 * ---------------------------------------------------------------------
 * Returns the *public* Supabase configuration so the admin SPA can
 * initialize its client. The anon key is safe to expose — Row Level
 * Security on the database controls who can read/write.
 *
 * The service-role key is NEVER returned here — it stays server-side.
 * ==================================================================== */

const env = (k, fb = '') => (process.env[k] ?? fb).trim();

export const handler = async () => ({
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=60',
  },
  body: JSON.stringify({
    supabaseUrl:     env('PUBLIC_SUPABASE_URL') || env('SUPABASE_URL'),
    supabaseAnonKey: env('PUBLIC_SUPABASE_ANON_KEY'),
    clinicPhone:     env('CLINIC_PHONE', '+919815171917'),
    clinicName:      env('CLINIC_NAME',  'Jindal Dental Clinic'),
  }),
});
