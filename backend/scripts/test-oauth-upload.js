/**
 * Test OAuth2 Upload
 * Direct test untuk verify OAuth credentials bisa upload
 */

const { google } = require('googleapis');
const fs = require('fs');
require('dotenv').config();

async function testUpload() {
  try {
    console.log('Testing OAuth2 upload...\n');
    
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    
    if (!clientId || !clientSecret || !refreshToken) {
      console.error('[ERROR] OAuth credentials not found in .env');
      process.exit(1);
    }
    
    console.log(`Client ID: ${clientId.substring(0, 30)}...`);
    console.log(`Refresh Token: ${refreshToken.substring(0, 30)}...`);
    console.log(`Folder ID: ${folderId || 'none (will use My Drive root)'}\n`);
    
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
    
    // Test connection
    console.log('[1] Testing connection...');
    const about = await drive.about.get({ fields: 'user' });
    console.log(`[OK] Connected as: ${about.data.user.emailAddress}\n`);
    
    // Upload test file
    console.log('[2] Uploading test file...');
    
    const fileMetadata = {
      name: 'test-oauth-' + Date.now() + '.txt',
      ...(folderId && { parents: [folderId] }),
    };
    
    const media = {
      mimeType: 'text/plain',
      body: 'Test upload from Platform CMS using OAuth2\nTimestamp: ' + new Date().toISOString(),
    };
    
    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink',
    });
    
    console.log('[OK] File uploaded!');
    console.log(`File ID: ${file.data.id}`);
    console.log(`File Name: ${file.data.name}`);
    console.log(`View Link: ${file.data.webViewLink}\n`);
    
    // Make public
    await drive.permissions.create({
      fileId: file.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
    
    const publicUrl = `https://drive.google.com/uc?export=view&id=${file.data.id}`;
    console.log(`Public URL: ${publicUrl}\n`);
    
    // Cleanup
    console.log('[3] Cleaning up test file...');
    await drive.files.delete({ fileId: file.data.id });
    console.log('[OK] Test file deleted\n');
    
    console.log('='.repeat(60));
    console.log('[SUCCESS] OAuth2 upload working!');
    console.log('='.repeat(60));
    console.log('\nBackend should now be able to upload to Google Drive.');
    console.log('If backend still uploads to local, check backend logs for errors.');
    
  } catch (error) {
    console.error('\n[ERROR]', error.message);
    
    if (error.message.includes('invalid_grant')) {
      console.error('\nRefresh token is invalid or expired.');
      console.error('Run: node scripts/setup-google-oauth.js');
    } else if (error.message.includes('403')) {
      console.error('\nPermission denied.');
      console.error('Check folder ID or folder permissions.');
    }
    
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testUpload();
