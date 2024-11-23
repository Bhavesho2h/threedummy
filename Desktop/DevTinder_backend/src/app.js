const express = require('express');
const app = express();

app.use('/test',(req,res)=> {
    res.send('this is foor the testt file')
})

app.use('/hello',(req,res)=>{
    res.send('hello from the server');
})



app.listen(7777);
