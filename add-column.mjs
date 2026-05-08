import pg from 'pg'
const { Client } = pg

const client = new Client({
  host: '127.0.0.1',
  port: 54321,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres',
})

await client.connect()
console.log('Connected')

try {
  await client.query('ALTER TABLE public.signers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();')
  console.log('Column added successfully')
} catch(e) {
  if (e.code === '42701') console.log('Column already exists:', e.message)
  else console.error('Error:', e.code, e.message)
}

// Verify
const cols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'signers' ORDER BY ordinal_position")
console.log('Columns:', cols.rows.map(r => r.column_name))

await client.end()
