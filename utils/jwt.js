export const atobPolyfill = (base64) => {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  var output = '';
  var buffer = 0;
  var bitCount = 0;
  for (var i = 0; i < base64.length; i++) {
    var char = base64.charAt(i);
    if (char === '=') break;

    buffer = (buffer << 6) | chars.indexOf(char);
    bitCount += 6;

    if (bitCount >= 8) {
      bitCount -= 8;
      output += String.fromCharCode((buffer >> bitCount) & 0xFF);
      buffer &= (1 << bitCount) - 1;
    }
  }
  return output;
}
export const parseJwtPayload = (token) => {
  const payload = token.split('.')[1];
  const decoded = atobPolyfill(payload);
  return JSON.parse(decoded);
}