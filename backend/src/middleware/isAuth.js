const jwt=require('jsonwebtoken');

const authenticate=(req,res,next)=>{

    try {

        const authHeader=req.headers.authorization

        if(!authHeader){

            const error=new Error("Authoriztion header does not exist");
            error.statusCode=401;
            throw error;
        }

        const [schema,token]=authHeader.split(" ");

        if(schema!=='Bearer' || !token){

            const error=new Error("Invalid authhorication format");
           error.statusCode=401;
            throw error       
        
        
        
        }

        const result=jwt.verify(token,process.env.JWT_ACCESS_SECRET)

        req.user=result;
        next();



        
    } catch (error) {

        if(error.name==="TokenExpiredError"){
            error.statusCode=401;
            error.message="Access token expired"

        }

          if (error.name === "JsonWebTokenError") {
            error.statusCode = 401;
            error.message = "Invalid access token";
        }

        next(error);
        
    }




}

module.exports=authenticate;