export const request = async (options) => {
  const baseUrl = "https://cloud.wushf.top";
  options.url = baseUrl + options.url;
  options.header = {
    ...options.header,
    "W-Auth": "Bearer " + wx.getStorageSync("token")
  }
  if (options.success) {
    const originalSuccess = options.success;
    options.success = function (res) {
      originalSuccess(res.data);
    };
  }
  wx.request(options)
}