create table if not exists category
(
    id          integer not null primary key,
    name        varchar(255) not null unique,
    description varchar(500)
);

create sequence if not exists category_seq increment by 50;

insert into category (id, name, description) values
    (1, 'Vêtements', 'Vêtements et textile'),
    (2, 'Accessoires', 'Bijoux, sacs, ceintures et autres accessoires'),
    (3, 'Chaussures', 'Chaussures et articles de chaussant'),
    (4, 'Électronique', 'Appareils électroniques et gadgets'),
    (5, 'Maison', 'Décoration, mobilier et articles pour la maison'),
    (6, 'Beauté', 'Cosmétiques et soins de la personne'),
    (7, 'Alimentation', 'Produits alimentaires et boissons'),
    (8, 'Sport', 'Équipement et vêtements de sport'),
    (9, 'Jouets', 'Jouets et jeux'),
    (10, 'Livres', 'Livres et papeterie'),
    (11, 'Autre', 'Catégorie non listée ci-dessus')
on conflict (name) do nothing;
