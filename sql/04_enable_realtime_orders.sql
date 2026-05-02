-- Activer le Realtime (WebSockets) pour la table 'orders'
-- Cela permet à Supabase d'envoyer des événements INSERT, UPDATE, DELETE aux clients abonnés.

begin;
  -- Vérifier si la table n'est pas déjà dans la publication (pour éviter une erreur)
  do $$
  begin
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime' and tablename = 'orders'
    ) then
      alter publication supabase_realtime add table orders;
    end if;
  end
  $$;
commit;
