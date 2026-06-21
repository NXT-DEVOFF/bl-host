const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  // Minimum 8 characters, at least one uppercase, one lowercase, one number
  return password.length >= 8 && 
         /[A-Z]/.test(password) && 
         /[a-z]/.test(password) && 
         /[0-9]/.test(password);
};

const validateServerName = (name) => {
  return name && name.length >= 3 && name.length <= 100;
};

const validatePort = (port) => {
  const num = parseInt(port);
  return !isNaN(num) && num > 0 && num < 65536;
};

const validateIP = (ip) => {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$|^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
  return ipRegex.test(ip);
};

module.exports = {
  validateEmail,
  validatePassword,
  validateServerName,
  validatePort,
  validateIP,
};
