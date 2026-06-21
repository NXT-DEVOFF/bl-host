export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const validateServerName = (name) => {
  return name && name.length >= 3 && name.length <= 100;
};

export const validatePort = (port) => {
  const num = parseInt(port);
  return !isNaN(num) && num > 0 && num < 65536;
};

export const validateIP = (ip) => {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  return ipRegex.test(ip);
};
