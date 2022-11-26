const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
var request = require("request");
const axios = require("axios");
var mysql = require('mysql');
const mongoose = require("mongoose");
require("dotenv").config();


const User = require("./models/users");
const Account = require("./models/account");
const Transaction = require("./models/transactions");
const Logs = require("./models/logs");


const app = express();

const server = http.createServer(app);  
let interval;

const io = socketIo(server, {
  cors: {
    origin: "https://safaribust.co.ke",
  },
});

let ids=[]
const set = new Set(ids.map(obj => obj.trans_id));

io.on("connection", (socket) => {
  console.log("client connected: ", socket.id);
  if (interval) {
    clearInterval(interval);
  }
  setInterval(() => getApiAndEmit(socket), 10000);
  socket.on("disconnect", (reason) => {
  });
});
const getApiAndEmit = (socket) => {
          try{
               var con = mysql.createConnection({
                  host: "173.214.168.54",
                  user: "bustadmin_dbadm",
                  password: ";,bp~AcEX,*a",
                  database:"bustadmin_paydb"
                });
                  con.connect(function(err) {
                    if (err) throw err;
                        con.query(`SELECT * FROM transaction`, function (err, result) {
                        if (err) throw err;                       
                        Object.keys(result).forEach(async function(key) {
                        var row = result[key];
                        const transaction= await Transaction.findOne({trans_id:row.trans_id})
                        //  console.log(row)
                        // const account = await Account.findOne({ phone:row.bill_ref_number});
                        if(transaction){
                          // console.log("Hello2")
                          const response = {deposited: false};                            
                          io.sockets.emit("FromAPI2", response);
                          return
                        }
                        let it = ids.filter((item)=>item.trans_id === row.trans_id)
                        // console.log(it)
                          if(it.length < 1){
                            ids.push(row)
                            console.log(ids)
                          }
                        // console.log("Hello");
                        // console.log(set)
                        
                          //   await trans.save().then(async(res)=>{
                          //     console.log(res);
                          //     if(res.type){
                          //       account.balance=parseFloat(+account?.balance) + parseFloat(+row.trans_amount)
                          //       await account.save()
                          //       const response = {
                          //                 deposited: true,
                          //                 trans_id:row.trans_id
                          //               };
                          //       io.sockets.emit("FromAPI2", response);
                          //       // const user = await User.findOne({ phone:row.bill_ref_number});
                          //       // const av_log = await Logs.findOne({ transactionId:row.trans_id});
                          //       // if(!av_log){
                          //       //     const log = new Logs({
                          //       //         ip: "deposit",
                          //       //         description: `${row.bill_ref_number} deposited ${row.trans_amount} - Code:${row.trans_id}`,
                          //       //         user: user.id,
                          //       //         transactionId:row.trans_id
                          //       //     });
                          //       //   await log.save();
                          //       //}
                          //     return 
                          //   }
                          // }).catch(err=>console.log(err))
                     });
                })
               ids.length>0&&ids.map(async(item)=>{
                  const trans= new Transaction({
                                  type:"Deposit",
                                  trans_id:item.trans_id,
                                  bill_ref_number:item.bill_ref_number,
                                  trans_time:item.trans_time,
                                  amount:item.trans_amount
                                  })
                  await trans.save().then(async(res)=>{
                    if(res.type){
                            const account = await Account.findOne({ phone:item.bill_ref_number});
                  account.balance=parseFloat(+account?.balance) + parseFloat(+item.trans_amount)
                  await account.save().then(async()=>{
                     const response = {
                                          deposited: true,
                                          trans_id:item.trans_id
                                        };
                      io.sockets.emit("FromAPI2", response);
                    console.log(ids)
                  })
                    }
                  }).catch(err=>console.log(err))         
             
                })

              return con.end(()=>console.log("connection closed"))
            });
          }catch(err){
          console.log(err)
      }
};

mongoose
  .connect(
    `mongodb+srv://Trisonweru:${process.env.PASSWORD}@cluster0.rgm0s.mongodb.net/safaribustdb?retryWrites=true&w=majority`
  )
  .then(() => {
    server.listen(process.env.PORT || 8050, () => {
      console.log(`Server is running at http://localhost:${8050}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });