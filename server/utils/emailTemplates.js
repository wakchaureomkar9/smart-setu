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

module.exports = {
  welcomeEmail,
  documentUploadedEmail,
};