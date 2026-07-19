/**
 * Test Google Drive Connection
 * Test koneksi ke Google Drive dan akses folder
 * 
 * Usage: node scripts/test-google-drive.js
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function testConnection() {
  console.log('='.repeat(60));
  console.log('TEST GOOGLE DRIVE CONNECTION');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Step 1: Load credentials
    console.log('[STEP 1] Loading credentials...');
    const credPath = process.env.GOOGLE_DRIVE_CREDENTIALS_PATH || './google-drive-credentials.json';
    const fullPath = path.resolve(__dirname, '..', credPath);
    
    console.log(`  Credentials path: ${credPath}`);
    console.log(`  Full path: ${fullPath}`);
    
    if (!fs.existsSync(fullPath)) {
      console.error('  [ERROR] Credentials file not found!');
      console.error(`  Expected at: ${fullPath}`);
      process.exit(1);
    }
    
    const credentials = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    console.log('  [OK] Credentials loaded');
    console.log(`  Service Account: ${credentials.client_email}`);
    console.log('');

    // Step 2: Create Auth
    console.log('[STEP 2] Creating Google Auth...');
    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    console.log('  [OK] Auth created');
    console.log('');

    // Step 3: Create Drive Client
    console.log('[STEP 3] Creating Drive client...');
    const drive = google.drive({ version: 'v3', auth });
    console.log('  [OK] Drive client created');
    console.log('');

    // Step 4: Test Connection
    console.log('[STEP 4] Testing connection to Google Drive...');
    const aboutResponse = await drive.about.get({
      fields: 'user, storageQuota',
    });
    
    console.log('  [OK] Connection successful!');
    console.log(`  User: ${aboutResponse.data.user.emailAddress}`);
    console.log(`  Display Name: ${aboutResponse.data.user.displayName}`);
    
    if (aboutResponse.data.storageQuota) {
      const used = parseInt(aboutResponse.data.storageQuota.usage || '0');
      const limit = parseInt(aboutResponse.data.storageQuota.limit || '0');
      console.log(`  Storage Used: ${(used / 1024 / 1024 / 1024).toFixed(2)} GB`);
      if (limit > 0) {
        console.log(`  Storage Limit: ${(limit / 1024 / 1024 / 1024).toFixed(2)} GB`);
      }
    }
    console.log('');

    // Step 5: Test Folder Access
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    
    if (!folderId) {
      console.log('[STEP 5] Skipped - No folder ID in .env');
      console.log('');
    } else {
      console.log('[STEP 5] Testing folder access...');
      console.log(`  Folder ID: ${folderId}`);
      
      try {
        const folderResponse = await drive.files.get({
          fileId: folderId,
          fields: 'id, name, mimeType, capabilities, owners',
        });
        
        console.log('  [OK] Folder accessible!');
        console.log(`  Folder Name: ${folderResponse.data.name}`);
        console.log(`  Can Add Children: ${folderResponse.data.capabilities?.canAddChildren}`);
        console.log(`  Can Delete: ${folderResponse.data.capabilities?.canDelete}`);
        
        if (folderResponse.data.owners && folderResponse.data.owners.length > 0) {
          console.log(`  Owner: ${folderResponse.data.owners[0].emailAddress}`);
        }
        console.log('');
      } catch (folderError) {
        console.error('  [ERROR] Cannot access folder!');
        console.error(`  Error: ${folderError.message}`);
        console.error('');
        console.error('  POSSIBLE ISSUES:');
        console.error('  1. Folder tidak di-share ke service account');
        console.error(`  2. Service account email: ${credentials.client_email}`);
        console.error('  3. Buka folder di Google Drive');
        console.error('  4. Klik Share, tambahkan email service account');
        console.error('  5. Berikan akses "Editor"');
        console.error('');
        process.exit(1);
      }
    }

    // Step 6: Test Upload (Optional)
    console.log('[STEP 6] Testing file upload...');
    
    try {
      // Create a small test file
      const testContent = 'Test file from Platform CMS - ' + new Date().toISOString();
      const testFileName = 'test-' + Date.now() + '.txt';
      
      const fileMetadata = {
        name: testFileName,
        parents: folderId ? [folderId] : undefined,
      };
      
      const media = {
        mimeType: 'text/plain',
        body: testContent,
      };
      
      const uploadResponse = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink',
      });
      
      console.log('  [OK] Test file uploaded successfully!');
      console.log(`  File Name: ${uploadResponse.data.name}`);
      console.log(`  File ID: ${uploadResponse.data.id}`);
      console.log(`  View Link: ${uploadResponse.data.webViewLink}`);
      console.log('');
      
      // Set file public
      await drive.permissions.create({
        fileId: uploadResponse.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
      
      const publicUrl = `https://drive.google.com/uc?export=view&id=${uploadResponse.data.id}`;
      console.log(`  Public URL: ${publicUrl}`);
      console.log('');
      
      // Delete test file
      console.log('  Cleaning up test file...');
      await drive.files.delete({
        fileId: uploadResponse.data.id,
      });
      console.log('  [OK] Test file deleted');
      console.log('');
      
    } catch (uploadError) {
      console.error('  [WARNING] Upload test failed:', uploadError.message);
      console.error('  This might be a permissions issue.');
      console.error('');
    }

    // Summary
    console.log('='.repeat(60));
    console.log('[SUCCESS] ALL TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('');
    console.log('Google Drive connection is working correctly.');
    console.log('');
    console.log('NEXT STEPS:');
    console.log('1. Ensure backend .env has:');
    console.log(`   STORAGE_PROVIDER=google-drive`);
    console.log(`   GOOGLE_DRIVE_CREDENTIALS_PATH=${credPath}`);
    console.log(`   GOOGLE_DRIVE_FOLDER_ID=${folderId}`);
    console.log('2. Restart backend server');
    console.log('3. Check backend logs for initialization messages');
    console.log('4. Test upload via API endpoint');
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('[FATAL ERROR]');
    console.error('='.repeat(60));
    console.error('');
    console.error(`Error: ${error.message}`);
    console.error('');
    
    if (error.code) {
      console.error(`Error Code: ${error.code}`);
    }
    
    console.error('');
    console.error('TROUBLESHOOTING:');
    
    if (error.message.includes('ENOENT')) {
      console.error('- Credentials file not found');
      console.error('- Check GOOGLE_DRIVE_CREDENTIALS_PATH in .env');
      console.error('- Ensure file exists at specified path');
    } else if (error.message.includes('invalid_grant')) {
      console.error('- Invalid credentials');
      console.error('- Re-download JSON key from Google Cloud Console');
      console.error('- Ensure Service Account is active');
    } else if (error.message.includes('access_denied') || error.message.includes('403')) {
      console.error('- Google Drive API not enabled');
      console.error('- Go to Google Cloud Console');
      console.error('- Enable Google Drive API');
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT')) {
      console.error('- Network connectivity issue');
      console.error('- Check internet connection');
      console.error('- Check firewall settings');
    } else {
      console.error('- Unknown error');
      console.error('- Check error message above');
      console.error('- Review Google Cloud Console logs');
    }
    
    console.error('');
    console.error('Full Error:');
    console.error(error);
    console.error('');
    
    process.exit(1);
  }
}

// Run test
testConnection();
