#!/bin/bash

# Export users from nfldraft database
PGPASSWORD=postgres psql -U postgres -d nfldraft -c "COPY (SELECT id, email, password, first_name, last_name, username, profile_logo, created_at, updated_at FROM users) TO STDOUT WITH CSV" > /tmp/users.csv

# Import users into nbadraft database
PGPASSWORD=postgres psql -U postgres -d nbadraft -c "COPY nba_users (id, email, password, first_name, last_name, username, profile_logo, created_at, updated_at) FROM STDIN WITH CSV" < /tmp/users.csv

# Clean up
rm /tmp/users.csv 