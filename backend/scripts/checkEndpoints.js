import http from 'node:http'

const get = (path) => new Promise((resolve, reject) => {
  http.get({ hostname: 'localhost', port: 5000, path, agent: false }, (res) => {
    let data = ''
    res.on('data', chunk => data += chunk)
    res.on('end', () => resolve({ status: res.statusCode, body: data }))
  }).on('error', reject)
})

;(async () => {
  try {
    const v = await get('/api/vehicles')
    console.log('VEHICLES', v.status)
    console.log(v.body.slice(0, 2000))

    const d = await get('/api/drivers')
    console.log('\nDRIVERS', d.status)
    console.log(d.body.slice(0, 2000))
  } catch (err) {
    console.error('fetch error', err)
    process.exit(1)
  }
})()
