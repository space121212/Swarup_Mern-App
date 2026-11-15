const express=require('express');
const cors=require('cors');
const morgan=require("morgan");
const notFound=require('./middleware/notFound.js')
const authRoutes=require('./routes/authRoutes.js');
const mongoose=require('mongoose');
const organizationRoutes=require('./routes/orgnizationRoutes.js')
const rateLimit = require("express-rate-limit");
const helmet=require("helmet")

const memberRoutes=require('./routes/memberRoutes.js')

const taskRoutes=require("./routes/taskRoutes.js")
const errorHandler=require('./middleware/errorHandler.js')
const projectRoutes=require("./routes/projectRoute.js")
const cookieparser=require('cookie-parser');


const app=express();


const allowedOrigins = (
     "http://localhost:6500" || "http://13.201.190.122"
)
    .split(",")
    .map((origin) => origin.trim());
 
app.use(cors({
    origin(origin, callback) {
        // Requests such as curl/Postman may not send an Origin header.
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
 
        return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true
}));



app.use(express.json());
app.use(cookieparser());
app.use(helmet());

app.use(morgan(process.env.NODE_ENV === "production"
        ? "combined"
        : "dev"));

app.get('/health',(req,res)=>{

    return res.json({
        success:true,
        message:"This is health page",
        time:new Date().toISOString(),
        status:"200"
    })
})


app.get("/ready", (req, res) => {
    const isDatabaseConnected =
        mongoose.connection.readyState === 1;

    if (!isDatabaseConnected) {
        return res.status(503).json({
            success: false,
            status: "not_ready"
        });
    }

    return res.status(200).json({
        success: true,
        status: "ready"
    });
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many login attempts. Try again later."
    }
});

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many registration attempts. Try again later."
    }
});

app.use("/api/auth/login", loginLimiter);
app.use("/api/auth/register", registerLimiter);

app.use('/api/auth',authRoutes);

app.use('/api/organization',organizationRoutes)

app.use('/api/organisations',projectRoutes)

app.use('/api/organisations',taskRoutes);

app.use('/api/orgnisation/',memberRoutes)


app.use(notFound);

app.use(errorHandler);


module.exports=app;



