#!/bin/bash
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="/var/www/meat-lovers-cims/database/backups"
DB_NAME="meat_lovers_cims"
DB_USER="meat_lovers_user"
DB_PASS="StrongLocalPassword"
mkdir -p "$BACKUP_DIR"
mysqldump -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$BACKUP_DIR/meat_lovers_$DATE.sql"
find "$BACKUP_DIR" -type f -mtime +14 -delete
