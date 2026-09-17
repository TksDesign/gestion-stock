alter table sale
    add column if not exists order_reference varchar(255),
    add column if not exists source varchar(50) not null default 'MANUAL',
    add column if not exists customer_id varchar(255),
    add column if not exists customer_firstname varchar(255),
    add column if not exists customer_lastname varchar(255),
    add column if not exists customer_email varchar(255);

alter table sale_item
    add column if not exists status varchar(50) not null default 'CONFIRMED';

create index if not exists idx_sale_order_reference on sale (order_reference);
create index if not exists idx_sale_customer_id on sale (customer_id);
