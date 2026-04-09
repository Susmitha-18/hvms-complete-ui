(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/worker/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: 'worker1', password: 'worker123' })
    })
    console.log('status', res.status)
    const text = await res.text()
    console.log(text)
  } catch (err) {
    console.error('fetch error', err)
  }
})()
