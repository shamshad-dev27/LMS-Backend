import Payment from "../models/payment.modle.js";
import User from "../models/user.modle.js";
import { razorpay } from "../server.js";
import appError from "../utils/error.utils.js";
import crypto from "crypto";
const getRazorpayApiKey = (req, res, next) => {
   try {
      res.status(200).json({
         success: true,
         message: 'Razorpay Api key',
         key: process.env.RAZORPAY_KEY_ID
      });
   } catch (e) {
      return next(new appError(e.message, 500))
   }

}

const buySubscription = async (req, res, next) => {
   try {
      const { id } = req.user;
      const user = await User.findById(id);
      if (!user) {
         return next(new appError('Unauthorize , please login ', 500));
      }
      if (user.role === "ADMIN") {
         return next(new appError('Admin can not purchase the subcription', 400));
      }
      const subscription = await razorpay.subscriptions.create({
         plan_id: process.env.RAZORPAY_PLAN_ID,
         customer_notify: 1,
         total_count: 1
      });

      user.subscription = {
         id: subscription.id,
         status: subscription.status
      };
      await user.save();
      res.status(200).json({
         success: true,
         message: 'subcribe successfully',
         subscription_id: subscription.id
      })
   } catch (e) {
      return next(new appError(e.message, 500))
   }
}
const verifySubscription = async (req, res, next) => {
   try {
      const { id } = req.user;
      const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;
      if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
         return next(new appError('Missing payment fields', 400));
      }

      const user = await User.findById(id);
      if (!user) {
         return next(new appError('Unauthorized, please login', 401));
      }

      if (user.subscription?.status === 'active') {
         return next(new appError('Subscription already active', 400));
      }

      const subscriptionId = user.subscription?.id;
      console.log("DB subscription id:", subscriptionId);
      console.log("Request subscription id:", razorpay_subscription_id);
      console.log("Match:", subscriptionId === razorpay_subscription_id);
      if (subscriptionId !== razorpay_subscription_id) {
         return next(new appError('Subscription ID mismatch', 400));
      }

      const generatedSignature = crypto
         .createHmac('sha256', process.env.RAZORPAY_SECRET)
         .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
         .digest('hex');
      if (generatedSignature !== razorpay_signature) {
         return next(new appError('Payment verification failed, please try again', 400));
      }
      console.log("Signature verified ✅");
      // Payment.create ke aage wrap karo
      await Payment.create({
         Razorpay_payment_id: razorpay_payment_id,
         Razorpay_subscription_id: razorpay_subscription_id,
         Razorpay_signature: razorpay_signature,
      });

      user.subscription.status = 'active';
      await user.save();

      res.status(200).json({
         success: true,
         message: 'Payment verified successfully',
      });

   } catch (e) {
      return next(new appError(e.message, 500));
   }
}


const cancelSubscription = async (req, res, next) => {
   try {
      const { id } = req.user;
      const user = await User.findById(id);
      if (!user) {
         return next(new appError('Unauthorized, please login', 401));
      }
      if (user.role === "ADMIN") {
         return next(new appError('Admin cannot cancel subscription', 400));
      }

      const subscriptionId = user.subscription?.id;
      if (!subscriptionId) {
         return next(new appError('No active subscription found', 400));
      }
      try {
         await razorpay.subscriptions.cancel(subscriptionId);
      } catch (razorpayErr) {
         console.log("Razorpay cancel error:", razorpayErr.message);
      }

      user.subscription.status = 'cancelled';
      await user.save();

      res.status(200).json({
         success: true,
         message: 'Subscription cancelled successfully'
      });

   } catch (e) {
      return next(new appError(e.message, 500));
   }
}


const allPayment = async (req, res, next) => {
   try {
      const { count } = req.query;

      const subscriptions = await razorpay.subscriptions.all({
         count: count || 100,
      });

      const monthlyRecords = new Array(12).fill(0);

      if (subscriptions && subscriptions.items) {
         subscriptions.items.forEach((sub) => {
            const date = new Date(sub.created_at * 1000);
            const monthIndex = date.getMonth();
            monthlyRecords[monthIndex] += 1;
         });
      }

      res.status(200).json({
         success: true,
         message: 'Real-time sales data fetched',
         allPayments: subscriptions,
         monthlySaleRecord: monthlyRecords,
         finalMonth: new Date().getMonth() + 1
      });

   } catch (error) {
      return next(new appError(error.description || 'Failed to fetch real data', 500));
   }
};
export { getRazorpayApiKey, buySubscription, verifySubscription, cancelSubscription, allPayment };