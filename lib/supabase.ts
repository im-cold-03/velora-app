import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qcidggnjcqtugkedbdco.supabase.co/'
const supabaseAnonKey = 'sb_publishable_E7BheTe-QyXItEwdG6oaqw_1O7l1F5O'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)