create table if not exists payment
(
    id                 integer not null primary key,
    amount             numeric(38, 2),
    payment_method     varchar(255),
    order_id           integer,
    created_date       timestamp not null,
    last_modified_date timestamp
);

create sequence if not exists payment_seq increment by 50;
