const mongoose=require('mongoose');

const organisationSchema=new mongoose.Schema({


    name:{

        type:String,
        required:true,
        trim:true,
        minlength:2,
        maxlength:100,
    },

    slug:{

        type:String,
        required:true,
        trim:true,
        unique:true,
        lowecase:true

    },

    ownerId:{

        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
        index:true
    }
},

    {
     timestamps:true
    }




);

const Organisation=mongoose.model('Organization',organisationSchema)


module.exports=Organisation;