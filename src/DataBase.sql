--Just for quick sql commands

CREATE TABLE accounts (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL
);

INSERT INTO accounts (username, password)
VALUES ('admin', 'admin123');