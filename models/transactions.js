const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const transactionSchema = new Schema({
  type: {
    type: String,
    required: true,
  },
  trans_id:{
    type: String,
    required: true,
    unique: true,
  },
  bill_ref_number:{
    type: String,
    required: true,
  },
  trans_time:{
    type: String,
    required: true,
  },
  amount: {
    type: String,
    required: true,
  },
  user:{
    type:Schema.Types.ObjectId,
    ref:"User"
  }
},     
{ timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
