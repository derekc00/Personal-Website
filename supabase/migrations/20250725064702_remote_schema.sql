create table "public"."content" (
    "id" uuid not null default gen_random_uuid(),
    "slug" text not null,
    "title" text not null,
    "excerpt" text not null,
    "date" date not null,
    "category" text not null default 'Uncategorized'::text,
    "image" text,
    "type" text not null default 'blog'::text,
    "tags" jsonb default '[]'::jsonb,
    "content" text not null,
    "published" boolean not null default true,
    "comments_enabled" boolean not null default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "author_id" uuid
);


alter table "public"."content" enable row level security;

create table "public"."user_profiles" (
    "id" uuid not null,
    "email" text not null,
    "role" text default 'admin'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."user_profiles" enable row level security;

CREATE UNIQUE INDEX content_pkey ON public.content USING btree (id);

CREATE UNIQUE INDEX content_slug_key ON public.content USING btree (slug);

CREATE INDEX idx_content_category ON public.content USING btree (category);

CREATE INDEX idx_content_date ON public.content USING btree (date DESC);

CREATE INDEX idx_content_published ON public.content USING btree (published);

CREATE INDEX idx_content_published_type ON public.content USING btree (published, type);

CREATE INDEX idx_content_slug ON public.content USING btree (slug);

CREATE INDEX idx_content_type ON public.content USING btree (type);

CREATE UNIQUE INDEX user_profiles_email_key ON public.user_profiles USING btree (email);

CREATE UNIQUE INDEX user_profiles_pkey ON public.user_profiles USING btree (id);

alter table "public"."content" add constraint "content_pkey" PRIMARY KEY using index "content_pkey";

alter table "public"."user_profiles" add constraint "user_profiles_pkey" PRIMARY KEY using index "user_profiles_pkey";

alter table "public"."content" add constraint "content_author_id_fkey" FOREIGN KEY (author_id) REFERENCES auth.users(id) not valid;

alter table "public"."content" validate constraint "content_author_id_fkey";

alter table "public"."content" add constraint "content_slug_key" UNIQUE using index "content_slug_key";

alter table "public"."content" add constraint "content_type_check" CHECK ((type = ANY (ARRAY['blog'::text, 'project'::text]))) not valid;

alter table "public"."content" validate constraint "content_type_check";

alter table "public"."user_profiles" add constraint "user_profiles_email_key" UNIQUE using index "user_profiles_email_key";

alter table "public"."user_profiles" add constraint "user_profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_id_fkey";

alter table "public"."user_profiles" add constraint "user_profiles_role_check" CHECK ((role = ANY (ARRAY['admin'::text, 'editor'::text]))) not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_role_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.user_profiles (id, email, role)
  VALUES (new.id, new.email, 'admin');
  RETURN new;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

grant delete on table "public"."content" to "anon";

grant insert on table "public"."content" to "anon";

grant references on table "public"."content" to "anon";

grant select on table "public"."content" to "anon";

grant trigger on table "public"."content" to "anon";

grant truncate on table "public"."content" to "anon";

grant update on table "public"."content" to "anon";

grant delete on table "public"."content" to "authenticated";

grant insert on table "public"."content" to "authenticated";

grant references on table "public"."content" to "authenticated";

grant select on table "public"."content" to "authenticated";

grant trigger on table "public"."content" to "authenticated";

grant truncate on table "public"."content" to "authenticated";

grant update on table "public"."content" to "authenticated";

grant delete on table "public"."content" to "service_role";

grant insert on table "public"."content" to "service_role";

grant references on table "public"."content" to "service_role";

grant select on table "public"."content" to "service_role";

grant trigger on table "public"."content" to "service_role";

grant truncate on table "public"."content" to "service_role";

grant update on table "public"."content" to "service_role";

grant delete on table "public"."user_profiles" to "anon";

grant insert on table "public"."user_profiles" to "anon";

grant references on table "public"."user_profiles" to "anon";

grant select on table "public"."user_profiles" to "anon";

grant trigger on table "public"."user_profiles" to "anon";

grant truncate on table "public"."user_profiles" to "anon";

grant update on table "public"."user_profiles" to "anon";

grant delete on table "public"."user_profiles" to "authenticated";

grant insert on table "public"."user_profiles" to "authenticated";

grant references on table "public"."user_profiles" to "authenticated";

grant select on table "public"."user_profiles" to "authenticated";

grant trigger on table "public"."user_profiles" to "authenticated";

grant truncate on table "public"."user_profiles" to "authenticated";

grant update on table "public"."user_profiles" to "authenticated";

grant delete on table "public"."user_profiles" to "service_role";

grant insert on table "public"."user_profiles" to "service_role";

grant references on table "public"."user_profiles" to "service_role";

grant select on table "public"."user_profiles" to "service_role";

grant trigger on table "public"."user_profiles" to "service_role";

grant truncate on table "public"."user_profiles" to "service_role";

grant update on table "public"."user_profiles" to "service_role";

create policy "Admin users can update any content"
on "public"."content"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = auth.uid()) AND (user_profiles.role = 'admin'::text)))))
with check ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = auth.uid()) AND (user_profiles.role = 'admin'::text)))));


create policy "Allow content migration"
on "public"."content"
as permissive
for insert
to public
with check (true);


create policy "Anyone can view published content"
on "public"."content"
as permissive
for select
to anon
using ((published = true));


create policy "Authenticated users can create content"
on "public"."content"
as permissive
for insert
to public
with check ((auth.role() = 'authenticated'::text));


create policy "Public content is viewable by everyone"
on "public"."content"
as permissive
for select
to public
using ((published = true));


create policy "Users can create their own content"
on "public"."content"
as permissive
for insert
to authenticated
with check ((auth.uid() = author_id));


create policy "Users can delete own content"
on "public"."content"
as permissive
for delete
to public
using ((auth.uid() = author_id));


create policy "Users can delete their own content"
on "public"."content"
as permissive
for delete
to authenticated
using ((auth.uid() = author_id));


create policy "Users can update own content"
on "public"."content"
as permissive
for update
to public
using ((auth.uid() = author_id));


create policy "Users can update their own content"
on "public"."content"
as permissive
for update
to authenticated
using ((auth.uid() = author_id))
with check ((auth.uid() = author_id));


create policy "Users can view all content"
on "public"."content"
as permissive
for select
to authenticated
using (true);


create policy "Users can read own profile"
on "public"."user_profiles"
as permissive
for select
to public
using ((auth.uid() = id));


create policy "Users can update own profile"
on "public"."user_profiles"
as permissive
for update
to public
using ((auth.uid() = id));


CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON public.content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


