/**
 * Create Application Folder in Google Drive
 * Buat folder khusus untuk Platform CMS uploads
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function createAppFolder() {
  try {
    console.log('Creating Platform CMS folder in Google Drive...\n');
    
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
    
    if (!clientId || !clientSecret || !refreshToken) {
      console.error('[ERROR] OAuth credentials not found in .env');
      console.error('Run: node scripts/setup-google-oauth.js first');
      process.exit(1);
    }
    
    // Create OAuth client
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'http://localhost:3333/oauth2callback',
    );
    
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });
    
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    // Check if folder already exists
    console.log('[1] Checking for existing folder...');
    const searchResponse = await drive.files.list({
      q: "name='Platform CMS Uploads' and mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: 'files(id, name, webViewLink)',
      spaces: 'drive',
    });
    
    let folder;
    
    if (searchResponse.data.files && searchResponse.data.files.length > 0) {
      folder = searchResponse.data.files[0];
      console.log('[OK] Folder already exists!');
      console.log(`Folder ID: ${folder.id}`);
      console.log(`Folder Name: ${folder.name}`);
      console.log(`View Link: ${folder.webViewLink}\n`);
    } else {
      // Create new folder
      console.log('[1] Creating new folder...');
      
      const folderMetadata = {
        name: 'Platform CMS Uploads',
        mimeType: 'application/vnd.google-apps.folder',
      };
      
      const folderResponse = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id, name, webViewLink',
      });
      
      folder = folderResponse.data;
      
      console.log('[OK] Folder created!');
      console.log(`Folder ID: ${folder.id}`);
      console.log(`Folder Name: ${folder.name}`);
      console.log(`View Link: ${folder.webViewLink}\n`);
    }
    
    // Test upload to this folder
    console.log('[2] Testing upload to folder...');
    
    const fileMetadata = {
      name: 'test-' + Date.now() + '.txt',
      parents: [folder.id],
    };
    
    const media = {
      mimeType: 'text/plain',
      body: 'Test file from Platform CMS\nFolder test upload\nTimestamp: ' + new Date().toISOString(),
    };
    
    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink',
    });
    
    console.log('[OK] Test file uploaded!');
    console.log(`File: ${file.data.name}`);
    console.log(`Link: ${file.data.webViewLink}\n`);
    
    // Make file public
    await drive.permissions.create({
      fileId: file.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
    
    const publicUrl = `https://drive.google.com/uc?export=view&id=${file.data.id}`;
    console.log(`Public URL: ${publicUrl}\n`);
    
    // Cleanup test file
    console.log('[3] Cleaning up test file...');
    await drive.files.delete({ fileId: file.data.id });
    console.log('[OK] Test file deleted\n');
    
    // Update .env
    console.log('[4] Updating .env file...');
    
    const envPath = path.resolve(__dirname, '..', '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update or add GOOGLE_DRIVE_FOLDER_ID
    if (envContent.includes('GOOGLE_DRIVE_FOLDER_ID=')) {
      envContent = envContent.replace(
        /GOOGLE_DRIVE_FOLDER_ID=.*/,
        `GOOGLE_DRIVE_FOLDER_ID=${folder.id}`,
      );
    } else {
      envContent += `\nGOOGLE_DRIVE_FOLDER_ID=${folder.id}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    
    console.log('[OK] .env updated\n');
    
    // Success
    console.log('='.repeat(70));
    console.log('[SUCCESS] Folder setup complete!');
    console.log('='.repeat(70));
    console.log('');
    console.log(`Folder ID: ${folder.id}`);
    console.log(`Folder Link: ${folder.webViewLink}`);
    console.log('');
    console.log('NEXT STEPS:');
    console.log('1. Restart backend server');
    console.log('2. Test upload via API');
    console.log('3. Files will be uploaded to "Platform CMS Uploads" folder');
    console.log('');
    console.log('NOTE: You can create subfolders by specifying folder parameter:');
    console.log('  curl -F "folder=tenants" ... (creates subfolder "tenants")');
    console.log('');
    
  } catch (error) {
    console.error('\n[ERROR]', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

createAppFolder();
