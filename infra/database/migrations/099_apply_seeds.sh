#!/bin/sh
# ============================================================================
# HydroNexus — docker-entrypoint helper (runs LAST: 099 prefix).
# Applies versioned seed files mounted at /seeds into the database created
# by 001_initial_schema.sql. Only runs on first container initialization
# (postgres docker-entrypoint-initdb.d semantics).
# ============================================================================
set -e

if [ -z "${POSTGRES_USER:-}" ] || [ -z "${POSTGRES_DB:-}" ]; then
  echo "[hydronexus] POSTGRES_USER/POSTGRES_DB not set; skipping seeds."
  exit 0
fi

# Seeds must run as the app superuser context against the target database.
if [ -d "/seeds" ]; then
  for seed in /seeds/*.sql; do
    # shellcheck disable=SC2012
    if [ -f "$seed" ]; then
      echo "[hydronexus] Applying seed: $seed"
      psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$seed"
    fi
  done
else
  echo "[hydronexus] No /seeds directory mounted; skipping seeds."
fi
