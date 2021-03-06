const express = require("express")
const Router = express.Router()
const Utility = require("utility")
const model = require("./model")
const User = model.getModel("user")
const Chat = model.getModel("chat")
const Video = model.getModel("video")
const Moments = model.getModel("moments")
const GroupChatModel = model.getModel("groupChat")
const _filter = { "pwd": 0, "__v": 0 } // 过滤返回doc中的用户密码
function md5Pwd (pwd) {
  // 在MD5的基础上使用更深的加密：加盐加密
  const salt = "vision0823!@#"
  return Utility.md5(Utility.md5(pwd + salt))
}

// 返回所有用户列表
Router.get("/list", (req, res) => {
  // User.remove({},(err,doc)=>{})
  User.find({}, (err, doc) => {
    if (doc) {
      return res.json({
        code: 0,
        data: doc,
      })
    }
  })
})

// 发帖
Router.post("/posting", (req, res) => {
  const { userId } = req.cookies
  const { description, canSeeUser, callUser, geolocation, imageLists } = req.body
  Moments.create({
    userId,
    description,
    canSeeUser,
    callUser,
    geolocation,
    imageLists,
  }, (err, doc) => {
    if (err) {
      return res.json({
        code: 1,
        msg: err,
      })
    } else {
      return res.json({
        code: 0,
        msg: "success",
      })
    }
  })
})

// 获取帖子数据
Router.get("/getPosting", (req, res) => {
  const { page, pageNumber } = req.query
  let totalPage = 0
  Moments.count({}, function (error, count) {
    console.log(count)
    totalPage = Math.ceil(count / pageNumber)
  })
  let result = Moments.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $sort: { timeStamp: -1 } },
    { $skip: parseInt(page - 1) * parseInt(pageNumber) },
    { $limit: parseInt(pageNumber) },

  ])
  result.exec(function (err, doc) {
    if (err) {
      return res.json({
        code: 1,
        error: err,
      })
    }
    if (doc) {
      return res.json({
        code: 0,
        data: {
          result: doc,
          totalPage: totalPage,
          page: parseInt(page, 10),
        },
      })
    }
  })
})

// 点赞帖子
Router.post("/likeOrDislikePosting", (req, res) => {
  const { _id, userInfo } = req.body
  Moments.findOne({ _id }, (err, doc) => {
    if (err) {
      return res.json({
        code: 1,
        data: "意外错误",
      })
    }
    if (doc) {
      let flag = false
      doc.likeUser.map((item, index) => {
        if (item.userId === userInfo.userId) {
          doc.likeUser.splice(index, 1)
          flag = true
        }
      })
      if (!flag) (
        doc.likeUser.push(userInfo)
      )
      doc.save(function (err1, doc1) {
        if (!err1) {
          return res.json({
            code: 0,
            msg: "success",
            data: doc1,
          })
        }
      })
    }
  })
})

//评论帖子
Router.post("/commentPosting", (req, res) => {
  const { _id, commentData } = req.body
  console.log(commentData)
  Moments.findOne({ _id }, (err, doc) => {
    if (err) {
      return res.json({
        code: 1,
        data: "意外错误",
      })
    }
    if (doc) {
      doc.comment.push(commentData)
      doc.save(function (err1, doc1) {
        if (!err1) {
          return res.json({
            code: 0,
            msg: "success",
            data: doc1,
          })
        }
      })
    }
  })
})

// 视频接口
Router.get("/video", (req, res) => {
  const { page, pageNumber } = req.query
  let totalPage = 0
  Video.count({}, function (error, count) {
    console.log(count)
    totalPage = Math.ceil(count / pageNumber)
  })
  let query = Video.find({}).skip(parseInt(page - 1) * parseInt(pageNumber)).limit(parseInt(pageNumber))
  query.exec((err, doc) => {
    if (err) {
      return res.json({
        code: 1,
        data: "意外错误",
      })
    }
    if (doc) {
      return res.json({
        code: 0,
        data: {
          result: doc,
          totalPage: totalPage,
          page: parseInt(page, 10),
        },
      })
    }
  })
})
// 返回用户好友列表
Router.get("/friendsAllList", (req, res) => {
  const { userId } = req.cookies
  User.findOne({ _id: userId }, (err, doc) => {
    if (err) {
      return res.json({
        code: 1,
        data: "意外错误",
      })
    }
    if (doc) {
      return res.json({
        code: 0,
        data: doc.friends,
      })
    }
  })
})
// 返回用户好友列表(已同意)
Router.get("/friendsAgreeList", (req, res) => {
  const { userId } = req.cookies
  User.findOne({ _id: userId }, (err, doc) => {
    if (err) {
      return res.json({
        code: 1,
        data: "意外错误",
      })
    }
    if (doc) {
      let friendsIds = doc.friends.filter(item => item.agree).map(({ userId }) => {
        return userId
      })
      User.find({ "_id": { $in: friendsIds } }, (err1, doc1) => {
        if (err1) {
          return res.json({
            code: 1,
            data: "意外错误",
          })
        }
        if (doc1) {
          return res.json({
            code: 0,
            data: doc1,
          })
        }
      })
    }
  })
})
Router.get("/getmsglist", (req, res) => {
  const { userId } = req.cookies
  User.find({}, (err, userdoc) => {
    let userInfo = {}
    userdoc.forEach(v => {
      userInfo[v._id] = { name: v.userName, avatar: v.avatar }
    })
    Chat.find({ "$or": [{ from: userId }, { to: userId }] }, (err, doc) => {
      if (!err) {
        return res.json({ code: 0, data: doc, userInfo: userInfo })
      }
    })
  })
})

Router.get("/getGroupMsgList", (req, res) => {
  GroupChatModel.find({}, (err, doc) => {
    if (!err) {
      return res.json({ code: 0, data: doc })
    } else {
      return res.json({
        code: 1,
        data: "意外错误",
      })
    }

  })
})

// 修改未读消息数量
Router.post("/readmsg", (req, res) => {
  const { userId } = req.cookies
  const { from } = req.body
  Chat.update({ from, to: userId }, { "$set": { read: true } }, { "multi": true }, (err, doc) => {
    if (doc) {
      return res.json({
        code: 0,
        data: doc.nModified,
      })
    }
    if (err) {
      return res.json({
        code: 1,
        data: "修改失败",
      })
    }
  })
})
// 登录
Router.post("/login", (req, res) => {
  const { userName, pwd } = req.body
  User.findOne({ userName, pwd: Utility.md5(pwd) }, _filter, (err, doc) => {
    if (!doc) {
      return res.json({
        code: 1,
        msg: "用户名或密码错误",
      })
    } else {
      res.cookie("userId", doc._id)
      return res.json({
        code: 0,
        data: doc,
      })
    }
  })
})
Router.get("/search", (req, res) => {
  const searchValue = req.param("searchValue")
  User.find({ userName: { $regex: searchValue } }, (err, doc) => {
    if (!err) {
      res.json({ code: 0, data: doc })
    }
  })
})
// 编辑资料
Router.post("/edit", (req, res) => {
  const { userId } = req.cookies
  const { avatar, address, title, sex, desc } = req.body
  User.update({ _id: userId }, { "$set": { avatar, address, title, sex, desc } }, (err, doc) => {
    if (doc) {
      return res.json({
        code: 0,
        data: doc,
      })
    }
    if (err) {
      return res.json({
        code: 1,
        data: "修改失败",
      })
    }
  })
})
// 注册用户
Router.post("/register", (req, res) => {
  const { userName, pwd } = req.body
  User.findOne({ userName }, (err, doc) => {
    if (doc) {
      return res.json({
        code: 1,
        msg: "已存在用户",
      })
    }
    User.create({
      userName,
      pwd: Utility.md5(pwd),
      avatar: "http://pqgrbj9dn.bkt.clouddn.com/default.png",
      sex: "人妖",
      title: "默认的个性签名--不要迷恋哥，哥只是传说",
      desc: "",
      address: "广州市天河区中山大道西293号",
    }, (e, d) => {
      if (e) {
        return res.json({
          code: 1,
          msg: e,
        })
      } else {
        return res.json({
          code: 0,
          msg: "success",
        })
      }
    })
  })
})

// 返回用户的登录状态
Router.get("/info", (req, res) => {
  // 用户有没有cookie
  const { userId } = req.cookies
  if (!userId) {
    return res.json({
      code: 1,
      msg: "err",
    })
  }
  User.findOne({ _id: userId }, _filter, (err, doc) => {
    if (err) {
      return res.json({
        code: 1,
        msg: err,
      })
    }
    if (doc) {
      return res.json({
        code: 0,
        data: doc,
      })
    }
  })
})
// 忽略好友请求
Router.post("/ignorerequest", (req, res) => {
  // res.json({
  //     code:0,
  //     msg:'success'
  // })
  const { friendsId } = req.body
  const { userId } = req.cookies
  User.findOne({ _id: userId }, (err, doc) => {
    if (doc) {
      doc.friends.forEach((item) => {
        if (item.userId == friendsId) {
          item.unread = true
          item.ignore = true
        }
      })
      doc.save((e, d) => {
        return res.json({
          code: 0,
          msg: "success",
        })
      })
    }
    if (err) {
      return res.json({
        code: 1,
        msg: "failed",
      })
    }
  })
})
// 同意好友请求
Router.post("/agreerequest", (req, res) => {

  const { friendsId } = req.body
  const { userId } = req.cookies
  User.findOne({ _id: userId }, (err, doc) => {
    if (doc) {
      doc.friends.forEach((item) => {
        if (item.userId == friendsId && !item.ignore) {
          item.agree = true
          item.unread = true
        }
      })
      doc.save((e, d) => {
      })
    }
    if (err) {
      res.json({
        code: 1,
        msg: "failed",
      })
    }
  })
  User.findOne({ _id: friendsId }, (err, doc) => {
    if (doc) {
      doc.friends.forEach((item) => {
        if (item.userId == userId && !item.ignore) {
          item.agree = true
          item.unread = true
        }
      })
      doc.save((e, d) => {
        if (d) {
          res.json({
            code: 0,
            msg: "success",
          })
        }
      })
    }
    if (err) {
      res.json({
        code: 1,
        msg: "failed",
      })
    }
  })
})
// 删除好友
Router.post("/delfriend", (req, res) => {
  const { friendId } = req.body
  const { userId } = req.cookies
  User.findOne({ _id: userId }, (err, doc) => {
    if (doc) {
      doc.friends.forEach((item, index) => {
        if (item.userId == friendId) {
          doc.friends.splice(index, 1)
        }
      })
      doc.save((e, d) => {
        return res.json({
          code: 0,
          msg: "success",
        })
      })
    }
    if (err) {
      res.json({
        code: 1,
        msg: "failed",
      })
    }
  })
})
module.exports = Router
