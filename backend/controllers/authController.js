const authService = require('../services/authService');
const { handleAsyncError } = require('../utils/errorHandler');

const register = handleAsyncError(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.register(email, password);
  
  res.status(201).json({
    success: true,
    data: result,
  });
});

const login = handleAsyncError(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  
  res.json({
    success: true,
    data: result,
  });
});

const refreshToken = handleAsyncError(async (req, res) => {
  const { userId } = req;
  const result = await authService.refreshToken(userId);
  
  res.json({
    success: true,
    data: result,
  });
});

const me = handleAsyncError(async (req, res) => {
  const { userId } = req;
  const user = await require('../models').User.findByPk(userId, {
    attributes: ['id', 'email', 'role', 'createdAt'],
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: { message: 'User not found' },
    });
  }

  res.json({
    success: true,
    data: { user },
  });
});

module.exports = {
  register,
  login,
  refreshToken,
  me,
};
