#!/bin/bash

# Definir DATABASE_URL explicitamente para SQLite
export DATABASE_URL="file:./analytics.db"

# Executar o teste
cd "$(dirname "$0")"
npx tsx test-complete-flow.ts
