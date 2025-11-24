/**
 * 邮件服务工具模块
 * 用于发送系统通知、验证码等邮件功能
 */

const nodemailer = require('nodemailer');
const { logger } = require('./logger');

/**
 * 创建邮件传输器
 */
const createTransporter = () => {
  // 邮件配置从环境变量读取
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      // 允许不验证证书
      rejectUnauthorized: process.env.EMAIL_REJECT_UNAUTHORIZED !== 'false'
    }
  });

  return transporter;
};

/**
 * 发送邮件
 * @param {Object} options - 邮件选项
 * @param {string} options.to - 收件人邮箱
 * @param {string} options.subject - 邮件主题
 * @param {string} options.text - 邮件纯文本内容
 * @param {string} options.html - 邮件HTML内容
 * @returns {Promise<Object>} 发送结果
 */
async function sendEmail(options) {
  try {
    // 如果没有配置邮件服务，则记录日志但不发送
    if (!process.env.EMAIL_HOST) {
      logger.warn('邮件服务未配置，跳过发送', {
        to: options.to,
        subject: options.subject
      });
      return { success: true, message: '邮件服务未配置，已跳过发送' };
    }

    // 创建传输器
    const transporter = createTransporter();

    // 发送邮件
    const info = await transporter.sendMail({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    });

    logger.info('邮件发送成功', {
      to: options.to,
      subject: options.subject,
      messageId: info.messageId
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('邮件发送失败', {
      to: options.to,
      subject: options.subject,
      error: error.message
    });
    throw new Error(`邮件发送失败: ${error.message}`);
  }
}

/**
 * 发送密码重置邮件
 * @param {string} to - 收件人邮箱
 * @param {string} resetToken - 重置令牌
 * @returns {Promise<Object>} 发送结果
 */
async function sendPasswordResetEmail(to, resetToken) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const options = {
    to,
    subject: '密码重置请求',
    text: `您收到此邮件是因为有人请求重置您的密码。请点击以下链接重置密码：\n\n${resetUrl}\n\n如果您没有发起此请求，请忽略此邮件。`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>密码重置请求</h2>
        <p>您收到此邮件是因为有人请求重置您的密码。</p>
        <p>请点击下方按钮重置密码：</p>
        <a href="${resetUrl}" 
           style="display: inline-block; padding: 10px 20px; background-color: #4285F4; color: white; text-decoration: none; border-radius: 4px; margin: 15px 0;">
          重置密码
        </a>
        <p>或者复制以下链接到浏览器中打开：</p>
        <p style="word-break: break-all;">${resetUrl}</p>
        <p>如果您没有发起此请求，请忽略此邮件。</p>
        <p>此链接将在 24 小时后失效。</p>
        <hr>
        <p style="color: #666; font-size: 12px;">这是一封自动发送的邮件，请勿直接回复。</p>
      </div>
    `
  };
  
  return sendEmail(options);
}

/**
 * 发送账户激活邮件
 * @param {string} to - 收件人邮箱
 * @param {string} activationToken - 激活令牌
 * @returns {Promise<Object>} 发送结果
 */
async function sendAccountActivationEmail(to, activationToken) {
  const activationUrl = `${process.env.FRONTEND_URL}/activate-account?token=${activationToken}`;
  
  const options = {
    to,
    subject: '账户激活',
    text: `感谢您注册我们的系统！请点击以下链接激活您的账户：\n\n${activationUrl}\n\n如果您没有注册我们的系统，请忽略此邮件。`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>欢迎加入我们的系统！</h2>
        <p>感谢您的注册。为了完成账户设置，请点击下方按钮激活您的账户：</p>
        <a href="${activationUrl}" 
           style="display: inline-block; padding: 10px 20px; background-color: #34A853; color: white; text-decoration: none; border-radius: 4px; margin: 15px 0;">
          激活账户
        </a>
        <p>或者复制以下链接到浏览器中打开：</p>
        <p style="word-break: break-all;">${activationUrl}</p>
        <p>如果您没有注册我们的系统，请忽略此邮件。</p>
        <hr>
        <p style="color: #666; font-size: 12px;">这是一封自动发送的邮件，请勿直接回复。</p>
      </div>
    `
  };
  
  return sendEmail(options);
}

/**
 * 发送挂号成功通知邮件
 * @param {string} to - 收件人邮箱
 * @param {Object} registrationInfo - 挂号信息
 * @returns {Promise<Object>} 发送结果
 */
async function sendRegistrationConfirmationEmail(to, registrationInfo) {
  const { patientName, doctorName, departmentName, registrationType, visitDate, registrationNumber } = registrationInfo;
  
  const formattedDate = new Date(visitDate).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const options = {
    to,
    subject: '挂号成功通知',
    text: `尊敬的${patientName}：\n\n您已成功挂号，详情如下：\n\n- 科室：${departmentName}\n- 医生：${doctorName}\n- 挂号类型：${registrationType}\n- 就诊时间：${formattedDate}\n- 挂号编号：${registrationNumber}\n\n请提前到达医院，凭挂号编号取号就诊。`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>挂号成功通知</h2>
        <p>尊敬的 ${patientName}：</p>
        <p>您已成功挂号，详情如下：</p>
        <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <tr>
            <td style="background-color: #f2f2f2; font-weight: bold;">科室</td>
            <td>${departmentName}</td>
          </tr>
          <tr>
            <td style="background-color: #f2f2f2; font-weight: bold;">医生</td>
            <td>${doctorName}</td>
          </tr>
          <tr>
            <td style="background-color: #f2f2f2; font-weight: bold;">挂号类型</td>
            <td>${registrationType}</td>
          </tr>
          <tr>
            <td style="background-color: #f2f2f2; font-weight: bold;">就诊时间</td>
            <td>${formattedDate}</td>
          </tr>
          <tr>
            <td style="background-color: #f2f2f2; font-weight: bold;">挂号编号</td>
            <td>${registrationNumber}</td>
          </tr>
        </table>
        <p>请提前到达医院，凭挂号编号取号就诊。</p>
        <hr>
        <p style="color: #666; font-size: 12px;">这是一封自动发送的邮件，请勿直接回复。</p>
      </div>
    `
  };
  
  return sendEmail(options);
}

/**
 * 发送通用系统通知邮件
 * @param {string} to - 收件人邮箱
 * @param {string} subject - 邮件主题
 * @param {string} content - 邮件内容
 * @returns {Promise<Object>} 发送结果
 */
async function sendSystemNotificationEmail(to, subject, content) {
  const options = {
    to,
    subject,
    text: content,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${subject}</h2>
        <div style="white-space: pre-wrap;">${content}</div>
        <hr>
        <p style="color: #666; font-size: 12px;">这是一封自动发送的系统通知，请勿直接回复。</p>
      </div>
    `
  };
  
  return sendEmail(options);
}

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendAccountActivationEmail,
  sendRegistrationConfirmationEmail,
  sendSystemNotificationEmail
};