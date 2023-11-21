const Mongoose = require("mongoose");

const feedSchema = Mongoose.Schema({
        name:{
        type:String,
        required:[true,"Name"]},

        username:{
            type:String,
            required:[true,"username"]},
    
        userId:{
                    type:String,
                    required:[true,"userId"]},
            
        Feed:{
                    type:String,
                    required:[true,"Feed"]}
       
        },
        {
            timestamps:true
    });

    const Feedmodel = Mongoose.model("Feeds", feedSchema);

    module.exports = {Feedmodel};
    
    