const setRefreshTokenCookie=(res,refreshToken)=>{

    res.cookie(
        'refreshToken',refreshToken,{
            httpOnly:true,
            sameSite:process.env.NODE_ENV==='production'?'strict':'lax',
            secure:process.env.NODE_ENV==='production',
            maxAge:7*24*60*60*1000,
            path:'/api/auth'

        }
    )



}


const clearRefrehTokenCookie=(res)=>{

    res.clearCookie("refreshToken",{
            httpOnly:true,
            sameSite:process.env.NODE_ENV==='production'?'strict':'lax',
            secure:process.env.NODE_ENV==='production',
            path:'/api/auth'

    })
}


module.exports={setRefreshTokenCookie,clearRefrehTokenCookie}