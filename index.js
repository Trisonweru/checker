const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
var request = require("request");
const axios = require("axios");
var mysql = require('mysql2');
const mongoose = require("mongoose");
require("dotenv").config();


const User = require("./models/users");
const Account = require("./models/account");
const Transaction = require("./models/transactions");
const Logs = require("./models/logs");


const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


const server = http.createServer(app);  
let interval;

const io = socketIo(server, {
  cors: {
    origin: "https://safaribust.co.ke",
  },
});

const ids=[]

io.on("connection", (socket) => {
  console.log("client connected: ", socket.id);
  if (interval) {
    clearInterval(interval);
  }
  setInterval(() => getApiAndEmit(socket), 5000);
  socket.on("disconnect", (reason) => {
  });

});
const getApiAndEmit = (socket) => {
          try{
               var con = mysql.createConnection({
                  host: "173.214.168.54",
                  user: "bustadmin_dbadm",
                  password: ";,bp~AcEX,*a",
                  database:"bustadmin_paydb",
                });
                  con.connect(function(err) {
                    if (err) throw err;
                        con.query(`SELECT * FROM transaction`, function (err, result) {
                        if (err) throw err;                       
                        Object.keys(result).forEach(async function(key) {
                        var row = result[key];
                        const transaction= await Transaction.findOne({trans_id:row.trans_id})

                        if(transaction){
                          const response = {deposited: false};                            
                          io.sockets.emit("FromAPI2", response);
                          return response
                        }

                          ids.push(row.trans_id)
                       
                          const account = await Account.findOne({ phone:row.bill_ref_number});
                          const user = await User.findOne({ phone:row.bill_ref_number});
                          account.balance=user.label === "1"? parseFloat(account?.balance) + (parseFloat(row.trans_amount)*2): parseFloat(account?.balance) + parseFloat(row.trans_amount)
                          user.label =user.label="1"&&"2"
                          user.firstDeposit =user.label ==="1"&& parseFloat(row.trans_amount).toFixed(2)
                          const av_log = await Logs.findOne({ transactionId:row.trans_id});
                          const trans= new Transaction({
                                  type:"Deposit",
                                  trans_id:row.trans_id,
                                  bill_ref_number:row.bill_ref_number,
                                  trans_time:row.trans_time,
                                  amount:row.trans_amount,
                                  phone: row.bill_ref_number,
                                  username:user.username,
                                  balance:account.balance
                            })
                          await account.save()
                          await trans.save()
                          await user.save()
                          if(!av_log){
                              const log = new Logs({
                                  ip: "deposit",
                                  description: `${row.bill_ref_number} deposited ${row.trans_amount} - Code:${row.trans_id}`,
                                  user: user.id,
                                  transactionId:row.trans_id
                              });
                            log.save();
                          }
                          const response = {
                                deposited: true,
                              };
                           io.sockets.emit("FromAPI2", response);
                         return 
                     });
                })
              con.end(()=>console.log("connection closed"))              
            });
          }catch(err){
          console.log(err)
      }
};
server.timeout = 0;
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