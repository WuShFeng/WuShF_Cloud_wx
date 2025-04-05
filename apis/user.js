import {
  request
} from '../utils/request'

export const login = () => {
  wx.login({
    success: (res) => {
      request({
        url: "/login",
        method: "POST",
        data: {
          code: res.code
        },
        success: (ret) => {
          console.log(ret);
          if (ret.code == 200) {
            wx.setStorageSync("username", ret.data.username)
            wx.setStorageSync("token", ret.data.token)
          } else {
            wx.showToast({
              title: ret.message
            })
          }
        }
      })
    },
  })
}
export const updateUsername = (req) => {
  request({
    url: "/update",
    method: "POST",
    data: {
      username: req.username
    },
    success: (res) => {
      if (res.code == 200) {
        req.success(res);
      }
    }
  })
}