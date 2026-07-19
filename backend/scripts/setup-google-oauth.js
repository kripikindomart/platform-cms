/**
 * Setup Google OAuth2 for Personal Gmail
 * 
 * This script will:
 * 1. Guide you to create OAuth2 credentials
 * 2. Start local server to receive callback
 * 3. Exchange authorization code for refresh token
 * 4. Save refresh token to .env
 * 
 * Usage: node scripts/setup-google-oauth.js
 */

const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// SCOPES yang dibutuhkan
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// Redirect URI - localhost untuk receive callback
const REDIRECT_URI = 'http://localhost:3333/oauth2callback';
const PORT = 3333;

async function setupOAuth() {
  console.log('='.repeat(70));
  console.log('GOOGLE DRIVE OAUTH2 SETUP');
  console.log('='.repeat(70));
  console.log('');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));
  
  try {
    let clientId, clientSecret;
    
    // Check .env
    const envPath = path.resolve(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const clientIdMatch = envContent.match(/GOOGLE_OAUTH_CLIENT_ID=(.+)/);
      const clientSecretMatch = envContent.match(/GOOGLE_OAUTH_CLIENT_SECRET=(.+)/);
      
      if (clientIdMatch) clientId = clientIdMatch[1].trim();
      if (clientSecretMatch) clientSecret = clientSecretMatch[1].trim();
    }
    
    if (!clientId || !clientSecret) {
      console.log('[STEP 1] Create OAuth2 Credentials');
      console.log('');
      console.log('Go to: https://console.cloud.google.com/apis/credentials');
      console.log('');
      console.log('1. Select your project (buoyant-site-283407)');
      console.log('2. Click "Create Credentials" > "OAuth 2.0 Client ID"');
      console.log('3. If prompted, configure OAuth consent screen first:');
      console.log('   - User Type: External');
      console.log('   - App name: Platform CMS');
      console.log('   - Support email: your email');
      console.log('   - Add your email to "Test users"');
      console.log('4. Application type: "Desktop app"');
      console.log('5. Name: "Platform CMS Desktop"');
      console.log('6. Click "Create"');
      console.log('7. Copy Client ID and Client Secret');
      console.log('');
      
      clientId = await question('Enter Client ID: ');
      clientSecret = await question('Enter Client Secret: ');
      
      if (!clientId || !clientSecret) {
        console.error('[ERROR] Client ID and Secret are required!');
        process.exit(1);
      }
      
      console.log('');
    } else {
      console.log('[OK] Found OAuth2 credentials in .env');
      console.log(`Client ID: ${clientId.substring(0, 20)}...`);
      console.log('');
    }
    
    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      REDIRECT_URI,
    );
    
    // Generate authorization URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent', // Force to get refresh token
    });
    
    console.log('[STEP 2] Authorize Application');
    console.log('');
    console.log('Starting local server on port', PORT, '...');
    console.log('');
    console.log('Please visit this URL to authorize:');
    console.log('');
    console.log(authUrl);
    console.log('');
    console.log('Waiting for authorization...');
    console.log('(Browser will redirect to localhost after you approve)');
    console.log('');
    
    // Start local server to receive callback
    const tokens = await new Promise((resolve, reject) => {
      const server = http.createServer(async (req, res) => {
        try {
          if (req.url.indexOf('/oauth2callback') > -1) {
            const qs = new url.URL(req.url, REDIRECT_URI).searchParams;
            const code = qs.get('code');
            
            if (!code) {
              const error = qs.get('error');
              res.end('Authorization failed: ' + error);
              server.close();
              reject(new Error('Authorization failed: ' + error));
              return;
            }
            
            res.end('Authorization successful! You can close this window and return to terminal.');
            server.close();
            
            // Exchange code for tokens
            const { tokens } = await oauth2Client.getToken(code);
            resolve(tokens);
          }
        } catch (error) {
          res.end('Error: ' + error.message);
          server.close();
          reject(error);
        }
      });
      
      server.listen(PORT, () => {
        console.log(`[OK] Server listening on http://localhost:${PORT}`);
      });
      
      // Timeout after 5 minutes
      setTimeout(() => {
        server.close();
        reject(new Error('Authorization timeout (5 minutes)'));
      }, 5 * 60 * 1000);
    });
    
    if (!tokens.refresh_token) {
      console.error('');
      console.error('[ERROR] No refresh token received!');
      console.error('');
      console.error('This usually means you already authorized this app before.');
      console.error('');
      console.error('To fix:');
      console.error('1. Go to: https://myaccount.google.com/permissions');
      console.error('2. Remove "Platform CMS" from the list');
      console.error('3. Run this script again');
      console.error('');
      process.exit(1);
    }
    
    console.log('');
    console.log('[OK] Tokens received!');
    console.log('');
    
    // Save to .env
    console.log('[STEP 3] Saving to .env...');
    
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Remove old OAuth entries if exist
    envContent = envContent.replace(/GOOGLE_OAUTH_CLIENT_ID=.*/g, '');
    envContent = envContent.replace(/GOOGLE_OAUTH_CLIENT_SECRET=.*/g, '');
    envContent = envContent.replace(/GOOGLE_OAUTH_REFRESH_TOKEN=.*/g, '');
    envContent = envContent.replace(/\n\n+/g, '\n\n'); // Clean extra newlines
    
    // Add new OAuth entries
    const oauthSection = `
# Google OAuth2 (for Personal Gmail)
GOOGLE_OAUTH_CLIENT_ID=${clientId}
GOOGLE_OAUTH_CLIENT_SECRET=${clientSecret}
GOOGLE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}
`;
    
    // Find Google Drive section and add OAuth before it
    if (envContent.includes('# Google Drive Configuration')) {
      envContent = envContent.replace(
        '# Google Drive Configuration',
        oauthSection + '\n# Google Drive Configuration',
      );
    } else {
      envContent += '\n' + oauthSection;
    }
    
    fs.writeFileSync(envPath, envContent);
    
    console.log('[OK] Saved to .env');
    console.log('');
    
    // Test connection
    console.log('[STEP 4] Testing connection...');
    
    oauth2Client.setCredentials(tokens);
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    const aboutResponse = await drive.about.get({
      fields: 'user, storageQuota',
    });
    
    console.log('[OK] Connection successful!');
    console.log(`User: ${aboutResponse.data.user.emailAddress}`);
    console.log(`Display Name: ${aboutResponse.data.user.displayName}`);
    
    if (aboutResponse.data.storageQuota) {
      const used = parseInt(aboutResponse.data.storageQuota.usage || '0');
      const limit = parseInt(aboutResponse.data.storageQuota.limit || '0');
      console.log(`Storage Used: ${(used / 1024 / 1024 / 1024).toFixed(2)} GB`);
      if (limit > 0) {
        console.log(`Storage Limit: ${(limit / 1024 / 1024 / 1024).toFixed(2)} GB`);
      } else {
        console.log('Storage: Unlimited (Google Workspace/One)');
      }
    }
    console.log('');
    
    // Success
    console.log('='.repeat(70));
    console.log('[SUCCESS] OAuth2 setup complete!');
    console.log('='.repeat(70));
    console.log('');
    console.log('NEXT STEPS:');
    console.log('1. Make sure STORAGE_PROVIDER=google-drive in .env');
    console.log('2. Set GOOGLE_DRIVE_FOLDER_ID in .env (optional)');
    console.log('3. Restart backend server');
    console.log('4. Test upload via API');
    console.log('');
    console.log('IMPORTANT:');
    console.log('- Refresh token is valid until revoked');
    console.log('- No need to login again');
    console.log('- Logout from browser does NOT affect uploads');
    console.log('- Keep .env secure (do not commit to git)');
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('[ERROR]', error.message);
    console.error('');
    
    if (error.message.includes('invalid_grant')) {
      console.error('Authorization failed. Please try again.');
    } else if (error.message.includes('redirect_uri_mismatch')) {
      console.error('Redirect URI mismatch!');
      console.error('');
      console.error('Make sure you created "Desktop app" OAuth client.');
      console.error('If you created "Web application", delete it and create new "Desktop app".');
    } else if (error.message.includes('timeout')) {
      console.error('Authorization timeout. Please run script again.');
    }
    
    console.error('');
  } finally {
    rl.close();
    process.exit(0);
  }
}

setupOAuth();
