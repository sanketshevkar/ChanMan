const express=require('express');
const connectDB=require('./config/db');
const app=express();
app.use(express.json({extended: false}));

connectDB();


app.get('/',(req, res)=>res.send('api running'));

app.use('/user', require('./routes/user'));
app.use('/profile', require('./routes/profile'));
//app.use('/api/posts', require('./routes/api/posts'));
app.use('/auth', require('./routes/auth'));

const PORT =process.env.PORT||5000;
app.listen(PORT, () => console.log('server started on port ${PORT}'));