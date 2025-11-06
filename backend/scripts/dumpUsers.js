import mongoose from 'mongoose'

(async ()=>{
  try{
    const uri = process.env.MONGO_URI || 'mongodb://HMVSadmin:Susmi%40_123@localhost:27017/HMVS?authSource=admin'
    await mongoose.connect(uri)
    const users = await mongoose.connection.db.collection('users').find().toArray()
    console.log(JSON.stringify(users, null, 2))
    process.exit(0)
  }catch(e){
    console.error(e);process.exit(1)
  }
})()
