import emailValidator from 'deep-email-validator';

async function testEmail(email) {
  const result = await emailValidator({
    email,
    validateRegex: true,
    validateMx: true,
    validateTypo: true,
    validateDisposable: true,
    validateSMTP: true,
  });
  console.log(`Email: ${email}`);
  console.log(`IsValid: ${result.valid}`);
  console.log(result.validators);
  console.log('---');
}

async function run() {
  await testEmail('mmmm@gmail.com');
  await testEmail('muzamiltahliil1@gmail.com');
}

run();
