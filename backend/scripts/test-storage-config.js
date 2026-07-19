/**
 * Test Storage Configuration
 * Debug storage provider configuration
 */

require('dotenv').config();

console.log('\n=== STORAGE CONFIGURATION DEBUG ===\n');

console.log('Environment Variables:');
console.log('- STORAGE_PROVIDER:', process.env.STORAGE_PROVIDER);
console.log('- GOOGLE_OAUTH_CLIENT_ID:', process.env.GOOGLE_OAUTH_CLIENT_ID ? '[SET]' : '[NOT SET]');
console.log('- GOOGLE_OAUTH_CLIENT_SECRET:', process.env.GOOGLE_OAUTH_CLIENT_SECRET ? '[SET]' : '[NOT SET]');
console.log('- GOOGLE_OAUTH_REFRESH_TOKEN:', process.env.GOOGLE_OAUTH_REFRESH_TOKEN ? '[SET]' : '[NOT SET]');
console.log('- GOOGLE_DRIVE_FOLDER_ID:', process.env.GOOGLE_DRIVE_FOLDER_ID || '[NOT SET]');

console.log('\n=== RAW ENV CHECK ===\n');
console.log('typeof STORAGE_PROVIDER:', typeof process.env.STORAGE_PROVIDER);
console.log('STORAGE_PROVIDER length:', process.env.STORAGE_PROVIDER ? process.env.STORAGE_PROVIDER.length : 0);
console.log('STORAGE_PROVIDER value (with quotes):', JSON.stringify(process.env.STORAGE_PROVIDER));

const expectedValue = 'google-drive';
console.log('\nComparison:');
console.log('- Expected:', JSON.stringify(expectedValue));
console.log('- Actual:', JSON.stringify(process.env.STORAGE_PROVIDER));
console.log('- Match:', process.env.STORAGE_PROVIDER === expectedValue);

// Check for hidden characters
if (process.env.STORAGE_PROVIDER) {
  console.log('\nCharacter codes:');
  for (let i = 0; i < process.env.STORAGE_PROVIDER.length; i++) {
    console.log(`  [${i}] '${process.env.STORAGE_PROVIDER[i]}' (code: ${process.env.STORAGE_PROVIDER.charCodeAt(i)})`);
  }
}

console.log('\n===================================\n');
