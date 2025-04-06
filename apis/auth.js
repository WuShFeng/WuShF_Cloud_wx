import {
  request
} from '../utils/request'
export const getQrCodeStatus = (sessionId, success) => {
  request({
    url: "/auth/status",
    method: "GET",
    header: {
      "W-Session": sessionId
    },
    success
  })
}

export const confirm = (sessionId, success) => {
  request({
    url: "/auth/confirm",
    method: "POST",
    header: {
      "W-Session": sessionId
    },
    success
  })
}