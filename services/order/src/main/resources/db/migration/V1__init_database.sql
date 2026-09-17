create table if not exists customer_order
(
    id                 integer not null primary key,
    reference          varchar(255) not null unique,
    total_amount       numeric(38, 2),
    payment_method     varchar(255),
    customer_id        varchar(255),
    created_date       timestamp not null,
    last_modified_date timestamp
);

create table if not exists customer_line
(
    id         integer not null primary key,
    order_id   integer constraint fk_order_line_order references customer_order,
    product_id integer,
    quantity   double precision
);

create sequence if not exists customer_order_seq increment by 50;
create sequence if not exists customer_line_seq increment by 50;
