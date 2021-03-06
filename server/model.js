const mongoose = require("mongoose")
const DB_URL = "mongodb://127.0.0.1:27017/chat"
mongoose.connect(DB_URL)
mongoose.connection.on("connected", () => {
  console.log("mongoDB connected!")
})
const models = {
  user: {
    "userName": { type: String, require: true },
    "pwd": { type: String, require: true },
    "avatar": { type: String },
    "sex": { type: String },
    "title": { type: String },
    "desc": { type: String },
    "address": { type: String },
    "friends": [{
      "userId": { type: mongoose.Schema.ObjectId, require: true },
      "from": { type: String, require: true },
      "agree": { type: Boolean, default: false },
      "unread": { type: Boolean, default: false },
      "ignore": { type: Boolean, default: false },
      "avatar": { type: String },
      "create_time": { type: Number },
      "userName": { type: String },
    }],
  },
  chat: {
    "chatId": { type: String, require: true },
    "from": { type: String, require: true },
    "to": { type: String, require: true },
    "read": { type: Boolean, default: false },
    "content": { type: String, require: true, default: "" },
    "create_time": { type: Number, default: Date.now },
  },
  groupChat: {
    "groupId": { type: String, require: true },
    "userId": { type: String, require: true },
    "userName": { type: String, require: true },
    "avatar": { type: String, require: true },
    "contentType": { type: String, require: true },
    "content": { type: String, require: true, default: "" },
    "create_time": { type: Number, default: Date.now },
  },
  video: {
    "name": { type: String, require: true },
    "singer": { type: String, require: true },
    "videoUrl": { type: String, require: true },
    "poster": { type: String, require: true },
  },
  moments: {
    "userId": { type: mongoose.Schema.ObjectId, require: true },
    "description": { type: String, require: false },
    "geolocation": {
      "addr": { type: String, require: false },
      "name": { type: String, require: false },
      "tag": { type: String, require: false },
      "uid": { type: String, require: false },
    },
    "canSeeUser": { type: Array, require: false },
    "callUser": { type: Array, require: false },
    "imageLists": [{
      "url": { type: String, require: true },
    }],
    "status": { type: String, require: false },
    "likeUser": { type: Array, require: false },
    "comment": [{
      "timeStamp": { type: Number, default: Date.now },
      "commentId": { type: mongoose.Schema.ObjectId, require: false },
      "commentName": { type: String, require: false },
      "replyId": { type: mongoose.Schema.ObjectId, require: false },
      "replyName": { type: String, require: false },
      "content": { type: String, require: false },
      "type": { type: String, require: false },
    }],
    "timeStamp": { type: Number, default: Date.now },
    "tag": { type: String, require: false },
  },
}
for (let m in models) {
  mongoose.model(m, new mongoose.Schema(models[m]))
}
module.exports = {
  getModel: function (name) {
    return mongoose.model(name)
  },
}
// const User=mongoose.model('user',mongoose.Schema({
//     userName:{type:String,required:true},
//     age:{type:Number,required:true}
// }))
