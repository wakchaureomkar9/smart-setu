const welcomeEmail = (name) => {
  return `
    <h1>Welcome ${name}</h1>
    <p>Your account was created successfully.</p>
  `;
};

const documentUploadedEmail = (name, docType) => {
  return `
    <h1>Document Uploaded</h1>
    <p>Hello ${name}, your document "${docType}" was uploaded successfully.</p>
  `;
};

const applicationSubmittedEmail = (name, schemeTitle, applicationId) => {
  return `
    <h1>Application Submitted</h1>
    <p>Hello ${name}, your application for "${schemeTitle}" (ID: ${applicationId}) has been successfully submitted and is under review.</p>
  `;
};

const applicationInProgressEmail = (name, schemeTitle, applicationId) => {
  return `
    <h1>Application In Progress</h1>
    <p>Hello ${name}, your application for "${schemeTitle}" (ID: ${applicationId}) is now in progress.</p>
  `;
};

const applicationRejectedEmail = (name, schemeTitle, applicationId, adminNote) => {
  return `
    <h1>Application Rejected</h1>
    <p>Hello ${name}, your application for "${schemeTitle}" (ID: ${applicationId}) was rejected.</p>
    <p><strong>Reason:</strong> ${adminNote || 'No reason provided'}</p>
  `;
};

const otpVerificationEmail = (name, otp) => {
  return `
    <h1>Verify Your Email</h1>
    <p>Hello ${name}, your OTP for email verification is:</p>
    <h2>${otp}</h2>
    <p>This code expires in 5 minutes.</p>
  `;
};

const passwordResetOtpEmail = (name, otp) => {
  return `
    <h1>Password Reset Request</h1>
    <p>Hello ${name}, your OTP for password reset is:</p>
    <h2>${otp}</h2>
    <p>This code expires in 5 minutes. If you didn't request this, please ignore this email.</p>
  `;
};

module.exports = {
  welcomeEmail,
  documentUploadedEmail,
  applicationSubmittedEmail,
  applicationInProgressEmail,
  applicationRejectedEmail,
  otpVerificationEmail,
  passwordResetOtpEmail,
};