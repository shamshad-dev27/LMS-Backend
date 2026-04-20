import User from "../models/user.modle.js";
import appError from "../utils/error.utils.js";
import jwt from 'jsonwebtoken'

const isLoggedIn = async (req, res, next) => {
    const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];

    if (!token) {
        return next(new appError('Unauthenticated, please login again', 401));
    }

    const userDetail = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = userDetail;
    next();
}

const authorization = (...role) => (req, res, next) => {
    const currentUserRole = req.user.role;
    if (!role.includes(currentUserRole)) {
        return next(new appError('You do not have permission to access', 403));
    }
    next();
}

const authorizeSubscriber = async (req, res, next) => {
    const user = await User.findById(req.user.id)
    const currentUserRole = user.role;
    const currentStatus = user.subscription?.status;
    if (currentStatus !== 'active' && currentUserRole !== 'ADMIN') {
        return next(new appError('Please subscribe to access the route', 403));
    }
    next();
}

export { isLoggedIn, authorization, authorizeSubscriber };