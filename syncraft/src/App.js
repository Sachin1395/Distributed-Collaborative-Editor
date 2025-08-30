import logo from './logo.svg';
import { useState, useEffect } from 'react'
import './App.css';
import Editor from './components/editor';
import Login from './components/login'
import { supabase } from './components/supabase_client';

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="App">
      {!session ? <Login /> : <Editor />}
    </div>
  )
}

export default App;
