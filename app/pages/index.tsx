// pages/index.tsx
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function Home() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase.from('your_table_name').select('*')
      if (error) console.error('Error:', error)
      else setData(data)
    }

    fetchData()
  }, [])

  return (
    <div>
      <h1>Supabase Data</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
