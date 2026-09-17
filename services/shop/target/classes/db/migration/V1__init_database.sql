create table if not exists shop
(
    id                 integer not null primary key,
    name               varchar(255) not null,
    description        varchar(1000),
    street             varchar(255),
    city               varchar(255),
    zip_code           varchar(20),
    manager_id         varchar(255) unique,
    manager_email      varchar(255),
    status             varchar(50),
    created_date       timestamp not null,
    last_modified_date timestamp
);

create table if not exists stock_item
(
    id                  integer not null primary key,
    shop_id             integer not null constraint fk_stock_item_shop references shop,
    name                varchar(255) not null,
    description         varchar(1000),
    category            varchar(255),
    price               numeric(38, 2) not null,
    quantity            integer not null,
    low_stock_threshold integer,
    created_date        timestamp not null,
    last_modified_date  timestamp
);

create table if not exists sale
(
    id           integer not null primary key,
    shop_id      integer not null constraint fk_sale_shop references shop,
    reference    varchar(255) not null unique,
    total_amount numeric(38, 2),
    created_date timestamp not null
);

create table if not exists sale_item
(
    id               integer not null primary key,
    sale_id          integer constraint fk_sale_item_sale references sale,
    stock_item_id    integer,
    stock_item_name  varchar(255),
    unit_price       numeric(38, 2),
    quantity         integer
);

create index if not exists idx_stock_item_shop on stock_item (shop_id);
create index if not exists idx_sale_shop on sale (shop_id);

create sequence if not exists shop_seq increment by 50;
create sequence if not exists stock_item_seq increment by 50;
create sequence if not exists sale_seq increment by 50;
create sequence if not exists sale_item_seq increment by 50;
