\c "adventure_bros";

CREATE USER bro WITH PASSWORD 'x0_lets_a_go_0x';

-- Grant all privileges on the database to the user 'bro'
GRANT ALL PRIVILEGES ON DATABASE "adventure_bros" TO bro;

-- Grant all privileges on the schema to the user 'bro'
GRANT ALL ON SCHEMA public TO bro;

-- Grant default privileges for future tables to the user 'bro'
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO bro;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO bro;

-- Create the submissions table
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    req_start_date DATE,
    req_end_date DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the volunteer_requests table
CREATE TABLE IF NOT EXISTS volunteer_requests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Change ownership of the tables to 'bro'
ALTER TABLE submissions OWNER TO bro;
ALTER TABLE volunteer_requests OWNER TO bro;

-- Grant all privileges on the tables and their sequences to 'bro' (redundant but explicit)
GRANT ALL PRIVILEGES ON TABLE submissions TO bro;
GRANT ALL PRIVILEGES ON TABLE volunteer_requests TO bro;
GRANT ALL PRIVILEGES ON SEQUENCE submissions_id_seq TO bro;
GRANT ALL PRIVILEGES ON SEQUENCE volunteer_requests_id_seq TO bro;