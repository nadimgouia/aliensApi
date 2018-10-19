var mongoose = require('mongoose'); 
var Schema = mongoose.Schema; 
var ObjectId = mongoose.ObjectId;

var AlienSchema = new Schema( {
fullName:String, 
email:String, 
userImage:String, 
famille:String, 
race:String, 
nouriture:String, 
password:String, 
age:Number, 
friends:[ {
    type : ObjectId
}
]
}); 

module.exports = mongoose.model('Alien', AlienSchema); 