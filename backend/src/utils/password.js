const bcrypt = require('bcrypt');
require('dotenv').config();

/**
 * 密码加密和验证工具
 */

// 获取加密盐值轮数，默认为10
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

/**
 * 加密密码
 * @param {string} password - 明文密码
 * @returns {Promise<string>} - 加密后的密码哈希值
 */
const hashPassword = async (password) => {
  try {
    // 验证密码参数
    if (!password || typeof password !== 'string' || password.length < 6) {
      throw new Error('密码至少需要6个字符');
    }
    
    // 生成密码哈希
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    
    return hash;
  } catch (error) {
    console.error('密码加密失败:', error);
    throw error;
  }
};

/**
 * 验证密码
 * @param {string} password - 明文密码
 * @param {string} hash - 加密后的密码哈希值
 * @returns {Promise<boolean>} - 密码是否匹配
 */
const verifyPassword = async (password, hash) => {
  try {
    // 验证参数
    if (!password || !hash) {
      return false;
    }
    
    // 比较密码
    const isValid = await bcrypt.compare(password, hash);
    return isValid;
  } catch (error) {
    console.error('密码验证失败:', error);
    return false;
  }
};

/**
 * 生成随机密码
 * @param {number} length - 密码长度，默认为8
 * @returns {string} - 生成的随机密码
 */
const generateRandomPassword = (length = 8) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
};

/**
 * 检查密码强度
 * @param {string} password - 要检查的密码
 * @returns {Object} - 密码强度信息
 */
const checkPasswordStrength = (password) => {
  let strength = 0;
  const feedback = [];
  
  // 检查长度
  if (password.length >= 8) {
    strength += 1;
  } else {
    feedback.push('密码长度应至少为8个字符');
  }
  
  // 检查是否包含小写字母
  if (/[a-z]/.test(password)) {
    strength += 1;
  } else {
    feedback.push('密码应包含小写字母');
  }
  
  // 检查是否包含大写字母
  if (/[A-Z]/.test(password)) {
    strength += 1;
  } else {
    feedback.push('密码应包含大写字母');
  }
  
  // 检查是否包含数字
  if (/\d/.test(password)) {
    strength += 1;
  } else {
    feedback.push('密码应包含数字');
  }
  
  // 检查是否包含特殊字符
  if (/[^A-Za-z0-9]/.test(password)) {
    strength += 1;
  } else {
    feedback.push('密码应包含特殊字符');
  }
  
  // 确定密码强度级别
  let level = '弱';
  if (strength >= 4) {
    level = '强';
  } else if (strength >= 3) {
    level = '中';
  }
  
  return {
    strength,
    level,
    feedback,
    isStrong: strength >= 4
  };
};

module.exports = {
  hashPassword,
  verifyPassword,
  generateRandomPassword,
  checkPasswordStrength
};