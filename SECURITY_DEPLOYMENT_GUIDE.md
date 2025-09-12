# Security Migration Deployment Guide

## 🚀 Manual Migration Application

Since the Supabase CLI requires authentication, you'll need to apply the security migration manually through the Supabase Dashboard.

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Navigate to your project: `koymmvuhcxlvcuoyjnvv`
3. Go to **SQL Editor**

### Step 2: Apply the Security Migration
Copy and paste the entire content of `supabase/migrations/20250911000001_critical_security_fixes.sql` into the SQL Editor and execute it.

### Step 3: Verify Migration Success
Run these verification queries in the SQL Editor:

```sql
-- 1. Check that RLS is enabled on all sensitive tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'companies', 'applications', 'posts', 'company_employment_requests')
ORDER BY tablename;

-- 2. Verify secure views exist
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles_public_secure', 'companies_public_secure', 'posts_authenticated')
ORDER BY table_name;

-- 3. Check security functions exist
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('get_authorized_candidates', 'get_authorized_applications', 'company_people_secure', 'log_security_event')
ORDER BY routine_name;

-- 4. Verify audit log table exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'security_audit_log' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Check RLS policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'companies', 'applications', 'posts', 'company_employment_requests')
ORDER BY tablename, policyname;
```

### Step 4: Test Security Functions
```sql
-- Test audit logging (should work for authenticated users)
SELECT log_security_event('test_event', 'test_resource', gen_random_uuid());

-- Test secure company people function
SELECT * FROM company_people_secure(gen_random_uuid());

-- Test that audit log was created
SELECT * FROM security_audit_log ORDER BY created_at DESC LIMIT 5;
```

## 🧪 Security Testing Script

After applying the migration, run the security testing script to verify all measures work correctly.

## 📋 Post-Migration Checklist

- [ ] Migration applied successfully
- [ ] All RLS policies enabled
- [ ] Secure views created
- [ ] Security functions working
- [ ] Audit logging functional
- [ ] Privacy settings component integrated
- [ ] Secure API service tested

## 🔍 Ongoing Monitoring

### Daily Security Checks
1. Review audit logs for unusual activity
2. Monitor failed authorization attempts
3. Check for unauthorized access patterns

### Weekly Security Reviews
1. Review user consent changes
2. Monitor data deletion requests
3. Check for security policy violations

### Monthly Security Assessments
1. Review all security policies
2. Update documentation if needed
3. Conduct security testing

---

**Important**: After applying the migration, test all application functionality to ensure the security measures don't break existing features.
