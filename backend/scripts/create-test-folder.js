/**
 * Create Test Folder in Google Drive
 * Script ini akan create folder baru langsung dari service account
 * Jadi kita tahu pasti folder owned by service account
 * 
 * Usage: node scripts/create-test-folder.js
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function createTestFolder() {
  try {
    console.log('Creating test folder in Google Drive...\n');
    
    // Load credentials
    const credPath = process.env.GOOGLE_DRIVE_CREDENTIALS_PATH || './google-drive-credentials.json';
    const fullPath = path.resolve(__dirname, '..', credPath);
    const credentials = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    
    console.log(`Service Account: ${credentials.client_email}\n`);
    
    // Create auth
    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    
    const drive = google.drive({ version: 'v3', auth });
    
    // Create folder
    const folderMetadata = {
      name: 'Platform CMS Uploads - ' + Date.now(),
      mimeType: 'application/vnd.google-apps.folder',
    };
    
    console.log('Creating folder...');
    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id, name, webViewLink',
    });
    
    console.log('\n[SUCCESS] Folder created!\n');
    console.log(`Folder Name: ${folder.data.name}`);
    console.log(`Folder ID: ${folder.data.id}`);
    console.log(`View Link: ${folder.data.webViewLink}`);
    console.log('');
    
    // Make folder accessible by link (anyone with link can view)
    await drive.permissions.create({
      fileId: folder.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
    
    console.log('[OK] Folder set to: Anyone with link can view');
    console.log('');
    
    // Test upload to this folder
    console.log('Testing upload to this folder...');
    
    const fileMetadata = {
      name: 'test-file.txt',
      parents: [folder.data.id],
    };
    
    const media = {
      mimeType: 'text/plain',
      body: 'Test upload from Platform CMS',
    };
    
    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink',
    });
    
    console.log('[OK] Test file uploaded!');
    console.log(`File: ${file.data.name}`);
    console.log(`Link: ${file.data.webViewLink}`);
    console.log('');
    
    // Update .env instructions
    console.log('='.repeat(70));
    console.log('NEXT STEPS:');
    console.log('='.repeat(70));
    console.log('');
    console.log('1. Update backend/.env file:');
    console.log('');
    console.log(`   GOOGLE_DRIVE_FOLDER_ID=${folder.data.id}`);
    console.log('');
    console.log('2. Restart backend server');
    console.log('');
    console.log('3. Test upload via API');
    console.log('');
    console.log('4. Check folder in Google Drive:');
    console.log(`   ${folder.data.webViewLink}`);
    console.log('');
    console.log('NOTE: Folder ini sudah owned by service account,');
    console.log('      jadi pasti accessible tanpa perlu manual sharing!');
    console.log('');
    
  } catch (error) {
    console.error('\n[ERROR]', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

createTestFolder();
