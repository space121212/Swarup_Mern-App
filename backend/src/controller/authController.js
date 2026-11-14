const {registerUser,loginUser,refreshAccessToken,logout}=require("../services/authService")
const {setRefreshTokenCookie,clearRefrehTokenCookie}=require('../util/cookie.js')

const registerController=async(req,res,next)=>{


    try{

    const user=await registerUser(req.body);

    return res.status(201).json({
        success:true,
        message:"User registered successfully",
        user
    });

}
catch(error){
    next(error);
}
}


const loginController = async (req, res, next) => {
    try {

        

        const data = await loginUser(req.body);

        setRefreshTokenCookie(res, data.refreshToken);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: data.user,
            accessToken: data.accessToken
        });

    } catch (error) {
        next(error);
    }
};

const refreshController=async(req,res,next)=>{

    try {

        const refreshToken=req.cookies.refreshToken;

        if(!refreshToken){
            const error = new Error("Refresh token is missing");
            error.statusCode = 401;
            throw error;
        }

        const result=await refreshAccessToken(refreshToken);
        setRefreshTokenCookie(res,result.refreshToken)

        res.status(200).json({
            success:true,
            accessToken:result.accessToken
        })

        
    } 
   catch (error) {
    console.error("[Refresh Controller Error]", error);
    clearRefrehTokenCookie(res);
    next(error);
}
}

const logoutController = async (req, res, next) => {
    try {

        const refreshToken = req.cookies.refreshToken;

        

        await logout(refreshToken);

        clearRefrehTokenCookie(res);

        return res.status(200).json({
            success: true,
            message: "Logout successful"
        });

    } catch (error) {
        next(error);
    }
};
module.exports={registerController,loginController,refreshController,logoutController}