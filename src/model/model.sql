CREATE TABLE admins (
   admin_id bigserial PRiMARY KEY,
   admin_email text not null,
   admin_password text not null,
   admin_create_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
   id bigserial,
   chat_id bigint PRIMARY KEY,
   phone_number text,
   step text DEFAULT 'start',
   subscribe boolean DEFAULT false,
   expired int DEFAULT 0,
   source text,
   duration boolean DEFAULT false,
   create_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE atmos_token (
   id bigserial PRIMARY KEY,
   token text,
   expires int
);

CREATE TABLE cards (
   id bigserial PRIMARY KEY,
   card_number_hash text,
   card_id int,
   expiry text,
   otp int,
   card_token text,
   phone_number text,
   card_holder text,
   transaction_id int,
   main boolean DEFAULT false,
   user_id bigint REFERENCES users(chat_id) ON DELETE CASCADE,
   active boolean DEFAULT true,
   create_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE checks (
   id bigserial PRIMARY KEY,
   user_id bigint REFERENCES users(chat_id) ON DELETE CASCADE,
   success_trans_id text,
   method text,
   amount int,
   transaction_id int,
   ofd_url text,
   create_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prices (
   id bigserial PRIMARY KEY,
   name text,
   price bigint,
   create_at timestamptz DEFAULT CURRENT_TIMESTAMP
);