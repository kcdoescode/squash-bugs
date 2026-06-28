import { useEffect, useState } from 'react'

function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch('/api/hello')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => setMessage('Failed to connect to backend'));
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Squash Bugs</h1>
      <p>Backend Status: {message}</p>
    </div>
  )
}

export default App