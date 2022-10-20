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

io.on("connection", (socket) => {
  console.log("client connected: ", socket.id);
  if (interval) {
    clearInterval(interval);
  }
  setInterval(() => getApiAndEmit(socket), 20000);
  socket.on("disconnect", (reason) => {
    // console.log(reason);
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
                console.log("row")
                  con.connect(function(err) {
                    if (err) throw err;
                      
                        con.query(`SELECT * FROM transaction`, function (err, result) {
                        if (err) throw err;                       
                        Object.keys(result).forEach(async function(key) {
                          var row = result[key];
                          const transaction= await Transaction.findOne({trans_id:row.trans_id})
                          if(!transaction ){
                          const trans= new Transaction({
                                  type:"Deposit",
                                  trans_id:row.trans_id,
                                  bill_ref_number:row.bill_ref_number,
                                  trans_time:row.trans_time,
                                  amount:row.trans_amount,
                                  phone: row.bill_ref_number
                            })
                         trans.save()
                          const account = await Account.findOne({ phone:row.bill_ref_number});
                          account.balance=parseFloat(account?.balance) + parseFloat(row.trans_amount)
                          account.save()
                          // const ipAddress = req.socket.remoteAddress;
                            // console.log(row)
                          const user = await User.findOne({ phone:row.bill_ref_number});
                          const log = new Logs({
                            ip: "deposits",
                            description: `${row.bill_ref_number} deposited ${row.trans_amount}- Account:${row.bill_ref_number}`,
                            user: user.id,
                          });
                          log.save();
                          const response = {
                                deposited: true,
                              };
                              // Emitting a new message. Will be consumed by the client
                           io.sockets.emit("FromAPI2", response);
                         return 
                          }
                                                      console.log(row)
                   const response = {
                                deposited: false,
                              };
                              // Emitting a new message. Will be consumed by the client
                              
                           io.sockets.emit("FromAPI2", response);
                     return 
                     });
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