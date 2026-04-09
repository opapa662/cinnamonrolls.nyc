-- Add price_approx to NYC locations table
-- Mirrors the same field on city_locations; stores approximate price as text (e.g. '$7', '$6–$8')

alter table public.locations add column if not exists price_approx text;

-- Seed prices for known NYC spots (researched April 2026)
-- Using name patterns since some bakeries have multiple location rows
update public.locations set price_approx = '$9'    where name ilike '%Benji%Buns%'         and price_approx is null;
update public.locations set price_approx = '$6.50' where name ilike '%Radio Bakery%'        and price_approx is null;
update public.locations set price_approx = '$8'    where name ilike '%L''Appartement 4F%'   and price_approx is null;
update public.locations set price_approx = '$5'    where name ilike '%Barachou%'             and price_approx is null;
update public.locations set price_approx = '$8'    where name ilike '%Sunday Morning%'       and price_approx is null;
update public.locations set price_approx = '$5'    where name ilike '%Bakeri%'               and price_approx is null;
update public.locations set price_approx = '$6.50' where name ilike '%Welcome Home%'         and price_approx is null;
update public.locations set price_approx = '$10'   where name ilike '%Spirals%'              and price_approx is null;
update public.locations set price_approx = '$9.50' where name ilike '%Red Gate%'             and price_approx is null;
update public.locations set price_approx = '$6.65' where name ilike '%Ole%Steen%'            and price_approx is null;
update public.locations set price_approx = '$8'    where name ilike '%Ceremonia%'            and price_approx is null;
update public.locations set price_approx = '$5.50' where name ilike '%Ciao Gloria%'          and price_approx is null;
update public.locations set price_approx = '$4.75' where name ilike '%Apt. 2 Bread%'         and price_approx is null;
update public.locations set price_approx = '$7'    where name ilike '%Petit Chou%'           and price_approx is null;
