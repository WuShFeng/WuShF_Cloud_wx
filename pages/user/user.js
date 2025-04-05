import {
  updateUsername
} from "../../apis/user"

Page({
  data: {
    username: wx.getStorageSync("username")
  },
  changeUsername() {
    wx.showModal({
      title: "更新用户名",
      editable: true,
      success: (res) => {
        if (res.confirm && res.content && res.content != this.data.username) {
          let username = res.content;
          updateUsername({
            username: username,
            success: (res) => {
              wx.setStorageSync("username", res.data.username);
              this.setData({
                username: res.data.username
              })
            }
          });
        }
      }
    })
  }
})