export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  // Doit correspondre aux règles du backend : 8+ caractères, une majuscule,
  // une minuscule et un chiffre.
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
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
