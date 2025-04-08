import {
  getQrCodeStatus,
  confirm
} from "../../apis/auth";
import {
  parseJwtPayload
} from "../../utils/jwt";
Page({
  canvas: null,
  ctx: null,
  angle: 0,
  text: "YYDS",
  speed: Math.PI / 180,
  color0: "#dee2ff",
  color1: "#c2f8cb",
  data: {
    isFocus: false,
    session: ""
  },
  onLoad(query) {
    if ('scene' in query) {
      const scene = decodeURIComponent(query.scene)
      this.setData({
        session: scene
      })
      this.getSessionStatus();
    }
  },
  onReady() {
    this.initCanvas();
  },
  initCanvas() {
    const query = wx.createSelectorQuery()
    query.select('#canvas')
      .fields({
        node: true,
        size: true
      })
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getSystemInfoSync().pixelRatio
        canvas.width = res[0].width * dpr
        canvas.height = res[0].height * dpr
        this.canvas = canvas;
        this.ctx = ctx;
        this.startRotation();
      })
  },
  startRotation() {
    setInterval(() => {
      this.angle += this.speed;
      this.draw();
    }, 1000 / 60);
  },
  draw() {
    this.clearCanvas();
    this.drawOuterRing();
    this.drawCircle();
    this.drawText();
  },
  drawCircle() {
    const ctx = this.ctx;
    const width = this.canvas.width / 2;
    const x = this.canvas.width / 2;
    const y = this.canvas.height / 2;

    ctx.beginPath();
    ctx.arc(x, y, width * 0.95, 0, 2 * Math.PI);
    ctx.fillStyle = '#f0f0f0';
    ctx.fill();

  },
  clearCanvas() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // 清空画布
  },
  drawText() {
    const ctx = this.ctx;
    const x = this.canvas.width / 2;
    const y = this.canvas.height / 2;
    ctx.fillStyle = 'black';
    const fontSize = this.canvas.width / 6;
    ctx.font = fontSize + 'px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.text, x, y);
  },
  drawOuterRing() {
    const ctx = this.ctx;
    const width = this.canvas.width / 2;
    const x = this.canvas.width / 2;
    const y = this.canvas.height / 2;
    const gradient = ctx.createLinearGradient(0 - width, y, width, y);
    gradient.addColorStop(0, this.color0);
    gradient.addColorStop(1, this.color1);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.angle);
    ctx.beginPath();
    ctx.arc(0, 0, width, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.restore();
  },
  changeForce(res) {
    this.setData({
      isFocus: res.type == "focus"
    })
  },
  onScan() {
    wx.scanCode({
      scanType: ["wxCode"],
      success: (res) => {
        const queryString = decodeURIComponent(res.path.split('?')[1]);
        if (queryString.startsWith("scene=")) {
          this.setData({
            session: queryString.substr(6)
          })
          this.getSessionStatus();
        }
      }
    })
  },
  getSessionStatus() {
    if (this.data.session.length != 6) {
      wx.showModal({
        title: '请扫码或手动填写临时凭证',
        showCancel: false
      })
      return;
    }
    getQrCodeStatus(this.data.session, (res) => {
      console.log(res);
      if (res.code == 200) {
        if (res.data.status == "SCANNED") {
          if (parseJwtPayload(res.data.userToken).auth == parseJwtPayload(wx.getStorageSync('token')).auth)
            this.authorize();
          else {
            wx.showModal({
              title: '二维码已被扫描',
              showCancel: false
            })
          }
        } else if (res.data.status == "CONFIRMED") {
          if (parseJwtPayload(res.data.userToken).auth == parseJwtPayload(wx.getStorageSync('token')).auth)
            wx.showModal({
              title: '二维码已使用',
              showCancel: false
            })
          else {
            wx.showModal({
              title: '二维码已过期',
              showCancel: false
            })
          }
        }
      } else {
        wx.showModal({
          title: "二维码无效",
          content: res.message,
          showCancel: false
        })
      }
    });
  },
  switchCanvasStatus(status) {
    //0 起始
    if (status == 0) {
      this.speed = Math.PI / 180;
      this.color0 = "#dee2ff";
      this.color1 = "#c2f8cb";
    }
    //1提交时
    else if (status == 1) {
      this.speed = Math.PI / 180 * 10;
      this.color0 = "#dee2ff";
      this.color1 = "#c2f8cb";
    }
    //2授权失败
    else if (status == 2) {
      this.speed = Math.PI / 180;
      this.color0 = "#600";
      this.color1 = "#e00";
    }
  },
  authorize() {
    this.switchCanvasStatus(1);
    wx.showModal({
      title: "确认授权",
      content: "授权后该终端的一切操作将以你的身份进行",
      success: (res) => {
        if (res.confirm) {
          confirm(this.data.session, (res) => {
            if (res.code == 200 && res.data.status == "CONFIRMED") {
              wx.showModal({
                title: '授权成功',
                showCancel: false
              })
              this.switchCanvasStatus(0);
              return;
            }
            wx.showModal({
              title: '授权失败',
              content: '请检查自身权限',
              showCancel: false
            })
            this.switchCanvasStatus(2);
          })
        }
      }
    })
  }
})