CREATE TABLE users (
   id bigserial,
   chat_id bigint PRIMARY KEY,
   phone_number text,
   step text DEFAULT 'start',
   subscribe boolean DEFAULT false,
   expired int DEFAULT 0,
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
   user_id int REFERENCES users(chat_id) ON DELETE CASCADE,
   active boolean DEFAULT true,
   create_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE checks (
   id bigserial PRIMARY KEY,
   user_id int REFERENCES users(chat_id) ON DELETE CASCADE,
   success_trans_id text,
   method text,
   amount text,
   transaction_id int,
   ofd_url text,
   create_at timestamptz DEFAULT CURRENT_TIMESTAMP
);