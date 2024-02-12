const { sendOTP, verifyOTP, resendOTP } = require('otpless-node-js-auth-sdk')


exports.sendOtp = async (mobile) => {
    const response = await sendOTP(`+91${mobile}`,
        null, null, null, null, null, null,
        process.env.OTP_CLIENT_ID,
        process.env.OTP_CLIENT_SECRET
    );
    return response
}

exports.resendOtp = async(orderId)=>{
    const response = await resendOTP(orderId, 
        process.env.OTP_CLIENT_ID, 
        process.env.OTP_CLIENT_SECRET
    );
    return response
}


exports.verifyOtp = async(mobile,otp,orderId)=>{
    const response = await verifyOTP(null, 
        `+91${mobile}`, 
        orderId ,otp, 
        process.env.OTP_CLIENT_ID, 
        process.env.OTP_CLIENT_SECRET
    );
    return response
}