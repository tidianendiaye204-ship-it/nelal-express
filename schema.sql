-- ============================================
-- NELAL EXPRESS — Schéma Supabase
-- ============================================

-- ZONES DE LIVRAISON
create table if not exists zones (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  type text check (type in ('dakar_centre', 'banlieue', 'interieur')) not null,
  tarif_base integer not null default 1000, -- en FCFA
  created_at timestamptz default now()
);

-- PROFILS UTILISATEURS
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  role text check (role in ('client', 'livreur', 'admin')) default 'client' not null,
  zone_id uuid references zones(id), -- zone du livreur
  avatar_url text,
  created_at timestamptz default now()
);

-- COMMANDES
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references profiles(id) not null,
  livreur_id uuid references profiles(id),
  zone_from_id uuid references zones(id) not null,
  zone_to_id uuid references zones(id) not null,
  type text check (type in ('particulier', 'vendeur')) not null,
  description text not null,
  pickup_address text not null default 'Non spécifié',
  delivery_address text not null default 'Non spécifié',
  recipient_name text not null,
  recipient_phone text not null,
  address_landmark text, -- Point de repère (ex: "En face pharmacie")
  gps_link text, -- Lien Google Maps ou WhatsApp
  status text check (status in ('en_attente', 'confirme', 'en_cours', 'livre', 'annule')) default 'en_attente' not null,
  price integer not null default 0, -- en FCFA
  payment_method text check (payment_method in ('wave', 'orange_money', 'cash')) default 'wave',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- HISTORIQUE STATUTS
create table if not exists order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade not null,
  status text not null,
  note text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Create a secure function to check if current user is an admin
-- This avoids the infinite recursion when selecting from profiles
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table zones enable row level security;
alter table profiles enable row level security;
alter table orders enable row level security;
alter table order_status_history enable row level security;

-- Zones : lecture publique
drop policy if exists "zones_select_all" on zones;
create policy "zones_select_all" on zones
  for select using (true);

-- Profils
drop policy if exists "profiles_select_public" on profiles;
create policy "profiles_select_public" on profiles
  for select using (true);

drop policy if exists "profiles_insert_own" on profiles;
create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_admin_select_all" on profiles;
create policy "profiles_admin_select_all" on profiles
  for select using (public.is_admin());

-- Commandes — Public (Suivi)
drop policy if exists "orders_public_select" on orders;
create policy "orders_public_select" on orders
  for select using (true);

-- Commandes — Client
drop policy if exists "orders_client_insert" on orders;
create policy "orders_client_insert" on orders
  for insert with check (client_id = auth.uid());

drop policy if exists "orders_client_cancel" on orders;
create policy "orders_client_cancel" on orders
  for update using (client_id = auth.uid() and status = 'en_attente');

-- Commandes — Livreur
drop policy if exists "orders_livreur_update_status" on orders;
create policy "orders_livreur_update_status" on orders
  for update using (livreur_id = auth.uid());

-- Commandes — Admin (tout)
drop policy if exists "orders_admin_all" on orders;
create policy "orders_admin_all" on orders
  for all using (public.is_admin());

-- Historique — Public
drop policy if exists "history_public_select" on order_status_history;
create policy "history_public_select" on order_status_history
  for select using (true);

drop policy if exists "history_insert_auth" on order_status_history;
create policy "history_insert_auth" on order_status_history
  for insert with check (created_by = auth.uid());

drop policy if exists "history_admin_all" on order_status_history;
create policy "history_admin_all" on order_status_history
  for all using (public.is_admin());

-- ============================================
-- TRIGGER : updated_at auto
-- ============================================
create or replace function update_updated_at()
returns trigger 
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists orders_updated_at on orders;
create trigger orders_updated_at
  before update on orders
  for each row execute function update_updated_at();

-- ============================================
-- TRIGGER : auto-create profile after signup
-- ============================================
create or replace function handle_new_user()
returns trigger 
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Utilisateur'),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'client'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================
-- SEED : ZONES
-- ============================================
-- On utilise ON CONFLICT pour éviter les doublons si on relance le script
insert into zones (name, type, tarif_base) 
values
  ('Plateau / Centre-ville', 'dakar_centre', 1000),
  ('Médina', 'dakar_centre', 1000),
  ('Yoff / Almadies', 'dakar_centre', 1500),
  ('Les Mamelles / Ouakam', 'dakar_centre', 1500),
  ('Pikine', 'banlieue', 2000),
  ('Guédiawaye', 'banlieue', 2000),
  ('Parcelles Assainies', 'banlieue', 2000),
  ('Thiaroye', 'banlieue', 2000),
  ('Yeumbeul', 'banlieue', 2000),
  ('Mbao', 'banlieue', 2500),
  ('Rufisque', 'banlieue', 3000),
  ('Keur Massar', 'banlieue', 2500),
  ('Malika', 'banlieue', 2500),
  ('Saint-Louis', 'interieur', 8000),
  ('Ndioum', 'interieur', 10000),
  ('Podor', 'interieur', 12000),
  ('Matam', 'interieur', 12000),
  ('Thiès', 'interieur', 6000),
  ('Touba', 'interieur', 7000),
  ('Kaolack', 'interieur', 7000),
  ('Ziguinchor', 'interieur', 15000)
on conflict (name) do nothing;
