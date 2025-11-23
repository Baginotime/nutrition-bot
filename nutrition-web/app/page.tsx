import { createClient } from '../lib/supabase'

const supabase = createClient()

export default async function Page() {
  const { data } = await supabase.from('meals').select('*')

  return (
    <main>
      {/* использование data, как было раньше */}
    </main>
  )
}
