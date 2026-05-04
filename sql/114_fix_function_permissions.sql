-- MIGRATION 114: FIX PERMISSIONS FOR RLS HELPER FUNCTIONS
-- Resolve "permission denied for function is_collaborator"

begin;

-- RLS policies execute with the privileges of the role performing the query (e.g., 'authenticated').
-- Even if a function is SECURITY DEFINER, the role must have EXECUTE permission to call it within an RLS policy.

-- 1. Redonner l'accès à is_collaborator()
grant execute on function public.is_collaborator() to authenticated;
grant execute on function public.is_collaborator() to service_role;

-- 2. Redonner l'accès à is_admin() (également révoqué dans les migrations précédentes)
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to service_role;

-- Note: Ces fonctions sont en SECURITY DEFINER, ce qui est nécessaire car elles interrogent 
-- la table 'profiles' qui est elle-même protégée par RLS. 
-- Pour éviter les avertissements du linter Supabase sans casser le RLS, 
-- on pourrait les déplacer dans un schéma privé, mais cela nécessiterait de mettre à jour 
-- toutes les politiques RLS existantes. Pour l'instant, on restaure la fonctionnalité.

commit;
