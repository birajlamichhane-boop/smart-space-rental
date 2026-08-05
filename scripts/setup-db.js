import fs from 'fs'
import path from 'path'
import pg from 'pg'

const pass = 'hRUnjbeSEbMR3d1a'
const ref = 'fdxflvrqchtpmqmfuztc'

const connectionStrings = [
  `postgres://postgres:${encodeURIComponent(pass)}@db.${ref}.supabase.co:5432/postgres`,
  `postgres://postgres.${ref}:${encodeURIComponent(pass)}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`,
  `postgres://postgres.${ref}:${encodeURIComponent(pass)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
  `postgres://postgres.${ref}:${encodeURIComponent(pass)}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`,
  `postgres://postgres.${ref}:${encodeURIComponent(pass)}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`,
  `postgres://postgres.${ref}:${encodeURIComponent(pass)}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`,
  `postgres://postgres:${encodeURIComponent(pass)}@db.${ref}.supabase.co:6543/postgres`,
]

async function run() {
  const sqlPath = path.resolve('supabase/full_setup.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')

  for (const connStr of connectionStrings) {
    console.log(`Trying connection to ${connStr.split('@')[1]}...`)
    const client = new pg.Client({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    })

    try {
      await client.connect()
      console.log('✅ Connected successfully! Executing full_setup.sql...')
      await client.query(sql)
      console.log('🎉 Database setup completed successfully!')
      await client.end()
      process.exit(0)
    } catch (err) {
      console.log(`❌ Failed: ${err.message}`)
      try { await client.end() } catch {}
    }
  }

  console.error('All connection attempts failed. Please verify network accessibility or paste full_setup.sql in Supabase SQL Editor.')
  process.exit(1)
}

run()
