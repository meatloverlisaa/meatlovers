#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

# Load environment variables from .env
if [ -f "$ROOT_DIR/.env" ]; then
    while IFS= read -r line || [ -n "$line" ]; do
        # Clean line endings
        line=$(echo "$line" | tr -d '\r')
        if [[ ! "$line" =~ ^# ]] && [[ "$line" =~ = ]]; then
            name=$(echo "$line" | cut -d'=' -f1)
            val=$(echo "$line" | cut -d'=' -f2- | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
            export "$name=$val"
        fi
    done < "$ROOT_DIR/.env"
fi

DB_HOST=${DB_HOST:-127.0.0.1}
DB_PORT=${DB_PORT:-3306}
DB_DATABASE=${DB_DATABASE:-meat_lovers_cims}
DB_USERNAME=${DB_USERNAME:-meat_lovers_user}
DB_PASSWORD=${DB_PASSWORD:-StrongLocalPassword}

echo "============================================="
echo "Meat Lovers CIMS Database Initializer"
echo "============================================="
echo "Connecting to MySQL at $DB_HOST:$DB_PORT"
echo "Database: $DB_DATABASE"
echo "User:     $DB_USERNAME"
echo "============================================="

# 1. Create database and configure user
echo "Creating database and configuring user..."
if [ "$DB_HOST" = "127.0.0.1" ] || [ "$DB_HOST" = "localhost" ]; then
    sudo mysql -e "DROP DATABASE IF EXISTS \`$DB_DATABASE\`;"
    sudo mysql -e "CREATE DATABASE \`$DB_DATABASE\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    sudo mysql -e "CREATE USER IF NOT EXISTS '$DB_USERNAME'@'localhost' IDENTIFIED BY '$DB_PASSWORD';"
    sudo mysql -e "GRANT ALL PRIVILEGES ON \`$DB_DATABASE\`.* TO '$DB_USERNAME'@'localhost';"
    sudo mysql -e "FLUSH PRIVILEGES;"
else
    # Remote database host connection fallback
    echo "Creating database on remote host..."
    if [ -z "$DB_PASSWORD" ]; then
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -e "DROP DATABASE IF EXISTS \`$DB_DATABASE\`; CREATE DATABASE \`$DB_DATABASE\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    else
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" -e "DROP DATABASE IF EXISTS \`$DB_DATABASE\`; CREATE DATABASE \`$DB_DATABASE\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    fi
fi

# Define the connection command for the user
MYSQL_CMD="mysql -h $DB_HOST -P $DB_PORT -u $DB_USERNAME"
if [ ! -z "$DB_PASSWORD" ]; then
    MYSQL_CMD_EXEC="$MYSQL_CMD -p$DB_PASSWORD"
else
    MYSQL_CMD_EXEC="$MYSQL_CMD"
fi

# 2. Run migrations
echo "Running migrations..."
for file in "$ROOT_DIR"/database/migrations/*.sql; do
    if [ -f "$file" ]; then
        echo "Executing: $(basename "$file")"
        $MYSQL_CMD_EXEC "$DB_DATABASE" < "$file"
        if [ $? -ne 0 ]; then
            echo "Error running migration: $file"
            exit 1
        fi
    fi
done

# 3. Run seeds
echo "Running seeds..."
for file in "$ROOT_DIR"/database/seeds/*.sql; do
    if [ -f "$file" ]; then
        # Skip seed loader to avoid duplication
        if [[ "$(basename "$file")" == *"013_seed_loader.sql"* ]]; then
            continue
        fi
        echo "Executing: $(basename "$file")"
        $MYSQL_CMD_EXEC "$DB_DATABASE" < "$file"
        if [ $? -ne 0 ]; then
            echo "Error running seed: $file"
            exit 1
        fi
    fi
done

echo "Database initialization completed successfully!"
