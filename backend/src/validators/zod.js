const z=require('zod')


const registerSchema=z.object({

    name:z.string().trim().min(2,"Name must be atleast 2 character long").max(50,"Name should be atleast 50 characters long"),
    email:z.string().trim().email("Invalid email"),
    password:z.string().trim().min(8,"Password should be atleast 8 characters long").max(128,"Password should not exceed 128 characters").regex(/[A-Z]/,"Password must contain atleast one uppercase character")
    .regex(/[a-z]/,"Password must contain atleast on lowercase character")
    .regex(/[0-9]/,"Password must contain atleast one number")
     .regex(
            /[^A-Za-z0-9]/,
            "Password must contain at least one special character")
})





const loginSchema=z.object({
   
    email:z.string().trim().email("Invalid email"),
    password:z.string().trim().min(1,"Password shopuld be minimum 1 charcater").max(128, "Password must not exceed 128 characters")
})

const createOrganizationSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Organization name must be at least 2 characters")
        .max(100, "Organization name must not exceed 100 characters"),

    slug: z
        .string()
        .trim()
        .toLowerCase()
        .min(2, "Organization slug must be at least 2 characters")
        .max(100, "Organization slug must not exceed 100 characters")
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Slug can only contain lowercase letters, numbers, and hyphens"
        )
});


const membershipSchema=z.object({
    email:z.string().trim().email("Please provide a valid email"),
    role:z.enum(
        
        ['Admin','Member','Viewer'],
        {
            message:"Invalid role"
        }


    )
});


const createProjectSchema=z.object({

    name:z.string().trim().min(2,"Project name should be atleast 2 characters"),
    description:z.string().trim().max(500,"Project description should not exceed 500 characters").optional()
})


const updateProjectSchema=z.object({
    name:z.string().trim().min(2, "Project name must be at least 2 characters")
        .max(100, "Project name must not exceed 100 characters").optional(),

     description: z
        .string()
        .trim()
        .max(500)
        .optional()
}).refine((data)=>Object.keys(data).length > 0,{
    message:"Atleast one field is required"
});




const createTaskSchema = z.object({
    title: z
        .string()
        .trim()
        .min(2)
        .max(150),

    description: z
        .string()
        .trim()
        .max(1000)
        .optional(),

    assignedTo: z
        .string()
        .nullable().optional(),

    priority: z
        .enum(["low", "medium", "high"])
        .optional()
});

const updateTaskSchema=z.object({
    title:z.string().trim().min(2).max(100).optional(),
   description: z
    .string()
    .trim()
    .max(1000)
    .optional(),

    assignedTo:z.string().nullable().optional(),
    status:z.enum(["todo","in_progress","completed"]).optional(),
    priority:z.enum(["low","medium","high"]).optional()

}).refine((data)=>Object.keys(data).length>0,{
    message:"At least one field is required"

})





module.exports={registerSchema,loginSchema,createOrganizationSchema,membershipSchema,createProjectSchema,updateProjectSchema,createTaskSchema,updateTaskSchema}




