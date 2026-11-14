const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const User=require('../model/User.js');
const { generateAccessToken, generateRefreshToken } = require('../util/token.js');
const Session=require('../model/Session.js')


const registerUser = async ({ name, email, password }) => {

    const existingUser=await User.findOne({email});

    if(existingUser){

        const error = new Error("User already exists");
         error.statusCode = 409;
         throw error;
    }

    const hashPassword=await bcrypt.hash(password,12)

    const user=await User.create({
        name,
        email,
        password:hashPassword
    })


    return {

        id:user._id,
        name:user.name,
        email:user.email
    }


};



const loginUser = async ({ email, password } = {}) => {
    // 1. Validate input
    if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        !email.trim() ||
        !password
    ) {
        const error = new Error("Email and password are required");
        error.statusCode = 400;
        throw error;
    }

    // 2. Find user
    const user = await User.findOne({
        email: email.trim().toLowerCase()
    });

    if (!user) {
        console.log("[Login] User not found");
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    // 3. Verify stored password hash
    if (typeof user.password !== "string" || !user.password) {
        console.error("[Login] Stored password hash is missing");
        const error = new Error("Unable to authenticate user");
        error.statusCode = 500;
        throw error;
    }

    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordCorrect) {
        console.log("[Login] Password verification failed");
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    // 4. Generate tokens
    const userId = user._id.toString();

    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);

    if (!accessToken || !refreshToken) {
        throw new Error("Token generation failed");
    }

    // 5. Hash refresh token before storing it
    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);

    // 6. Create refresh-token session
    await Session.create({
        userId: user._id,
        refreshTokenHash,
        expiresAt: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        )
    });

    // 7. Return safe user information and tokens
    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        },
        accessToken,
        refreshToken
    };
};

const refreshAccessToken = async (refreshToken) => {

    // 1. Verify refresh token
    let payload;

    try {
        payload = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );
    } catch (error) {
        const err = new Error("Invalid or expired refresh token");
        err.statusCode = 401;
        throw err;
    }

    // 2. Find sessions belonging to this user
    const sessions = await Session.find({
        userId: payload.userId
    });

    // 3. Find the session matching this refresh token
    let matchingSession = null;

    for (const session of sessions) {
        const isMatch = await bcrypt.compare(
            refreshToken,
            session.refreshTokenHash
        );

       if (isMatch) {
    matchingSession = session;

    console.log("[Refresh Debug] Matched session ID:", session._id);
    console.log("[Refresh Debug] Created at:", session.createdAt);
    console.log("[Refresh Debug] Expires at:", session.expiresAt);

    break;
}
    }

    // 4. No matching session
    if (!matchingSession) {
        const err = new Error("Invalid or expired refresh token");
        err.statusCode = 401;
        throw err;
    }

    // 5. Check session expiration
    if (matchingSession.expiresAt < new Date()) {
        // 5. Check session expiration
const currentTime = new Date();

console.log("[Refresh Debug] Session ID:", matchingSession._id);
console.log("[Refresh Debug] Session expiry:", matchingSession.expiresAt);
console.log("[Refresh Debug] Current server time:", currentTime);
console.log(
  "[Refresh Debug] Is session expired:",
  matchingSession.expiresAt.getTime() < currentTime.getTime()
);

if (matchingSession.expiresAt.getTime() < currentTime.getTime()) {
  await Session.deleteOne({ _id: matchingSession._id });

  const err = new Error("Session expired");
  err.statusCode = 401;
  throw err;
}
    }

    // 6. Generate new tokens
    const newAccessToken = generateAccessToken(
        payload.userId
    );

    const newRefreshToken = generateRefreshToken(
        payload.userId
    );

    // 7. Hash new refresh token
    const newRefreshTokenHash = await bcrypt.hash(
        newRefreshToken,
        12
    );

    // 8. Replace old session token
    matchingSession.refreshTokenHash = newRefreshTokenHash;
    matchingSession.expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    await matchingSession.save();

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
    };
};


const logout=async(refreshToken)=>{

    if (!refreshToken){
        return;
    }

    let payload;

    try {

        payload=jwt.verify(refreshToken,process.env.JWT_REFRESH_SECRET)


        
    } catch (error) {
        return
    }

    const sessions=await Session.find({
        userId:payload.userId
    })

    for(const session of sessions){

        const isMatch=await bcrypt.compare(refreshToken,session.refreshTokenHash)

        if(isMatch){

            await Session.deleteOne({
                _id:session._id
            })
            break;
        }

        
    }


}









module.exports={registerUser,loginUser,refreshAccessToken,logout}