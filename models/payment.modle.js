import { model, Schema } from "mongoose";

const paymentSchema=new Schema({
    Razorpay_payment_id:{
        type:String,
        required:true
    },
    Razorpay_subscription_id:{
        type:String,
        required:true,
    },
    Razorpay_signature:{
        type:String,
        required:true,
    }
},{
    timestamps:true
})

const Payment=model('Payment',paymentSchema);

export default  Payment;