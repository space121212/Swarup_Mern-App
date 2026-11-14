const notFound=(req,res,next)=>{


    const error=new Error(`Route is not available ${req.method} ${req.originalUrl}`);

    error.statusCode=404;

   next(error);
}

module.exports=notFound;