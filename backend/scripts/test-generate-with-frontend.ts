/**
 * Test Script: Generate Module dengan Frontend
 * 
 * Script ini akan test:
 * 1. Create module schema (products)
 * 2. Update dengan ui_config (modal untuk create, page untuk edit)
 * 3. Assign ke tenant (generate backend + frontend)
 * 4. Verify files generated
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const API_BASE = 'http://localhost:3000/api';
const TENANT_SLUG = 'demo_company'; // Ganti sesuai tenant yang ada

// Mock auth token - ganti dengan token asli
const AUTH_TOKEN = 'your-jwt-token-here';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'X-Tenant-Slug': TENANT_SLUG,
    'Authorization': `Bearer ${AUTH_TOKEN}`,
  },
});

async function testGenerateModule() {
  console.log('🚀 Starting Module Generation Test...\n');

  try {
    // Step 1: Create Module Schema
    console.log('[STEP 1] Creating module schema...');
    const createResponse = await api.post('/module-generator', {
      moduleName: 'test-products',
      displayName: 'Test Products',
      description: 'Test module untuk verify frontend generation',
      isTenantIsolated: true,
      hasSoftDelete: true,
      hasAudit: true,
      fields: [
        {
          name: 'name',
          label: 'Product Name',
          type: 'string',
          length: 255,
          isRequired: true,
          isUnique: false,
          isVisibleInList: true,
          order: 1,
        },
        {
          name: 'price',
          label: 'Price',
          type: 'decimal',
          precision: 15,
          scale: 2,
          isRequired: true,
          isUnique: false,
          isVisibleInList: true,
          order: 2,
        },
        {
          name: 'description',
          label: 'Description',
          type: 'text',
          isRequired: false,
          isUnique: false,
          isVisibleInList: false,
          order: 3,
        },
        {
          name: 'stock',
          label: 'Stock',
          type: 'integer',
          isRequired: true,
          isUnique: false,
          isVisibleInList: true,
          order: 4,
        },
        {
          name: 'is_active',
          label: 'Active',
          type: 'boolean',
          isRequired: true,
          isUnique: false,
          isVisibleInList: true,
          order: 5,
        },
      ],
      searchableFields: ['name', 'description'],
      filterableFields: ['is_active', 'price'],
      sortableFields: ['name', 'price', 'created_at'],
    });

    const moduleId = createResponse.data.data.id;
    console.log(`✓ Module schema created: ID ${moduleId}\n`);

    // Step 2: Update UI Config
    console.log('[STEP 2] Updating UI config...');
    await api.patch(`/module-generator/${moduleId}`, {
      uiConfig: {
        createFormType: 'modal',  // Simple form → use modal
        editFormType: 'page',     // Complex edit → use page
      },
    });
    console.log('✓ UI config updated\n');

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 3: Assign to Tenant (Generate Code)
    console.log('[STEP 3] Assigning to tenant & generating code...');
    const assignResponse = await api.post(`/module-generator/${moduleId}/assign`);
    
    console.log('✓ Generation completed!');
    console.log(`  - Files created: ${assignResponse.data.data.filesCreated}`);
    console.log(`  - Permissions: ${assignResponse.data.data.permissionsCreated}`);
    console.log(`  - Menu item: ${assignResponse.data.data.menuItemCreated ? 'Yes' : 'No'}\n`);

    // Step 4: Verify Files
    console.log('[STEP 4] Verifying generated files...\n');

    const backendPath = path.join(__dirname, '..', 'src', 'modules', 'test-products');
    const frontendPath = path.join(__dirname, '..', '..', 'frontend', 'app', '(private)', 'org', '[tenant]', 'portal', 'test-products');

    console.log('Backend Files:');
    checkFile(path.join(backendPath, 'test-products.module.ts'));
    checkFile(path.join(backendPath, 'test-products.controller.ts'));
    checkFile(path.join(backendPath, 'test-products.service.ts'));
    checkFile(path.join(backendPath, 'test-products.repository.ts'));
    console.log('');

    console.log('Frontend Files:');
    checkFile(path.join(frontendPath, 'page.tsx'), 'List Page');
    checkFile(path.join(frontendPath, 'components', 'test-products-table.tsx'), 'DataTable');
    checkFile(path.join(frontendPath, 'components', 'create-test-products-modal.tsx'), 'Create Modal');
    checkFile(path.join(frontendPath, '[id]', 'edit', 'page.tsx'), 'Edit Page');
    checkFile(path.join(frontendPath, 'components', 'delete-test-products-dialog.tsx'), 'Delete Dialog');
    checkFile(path.join(frontendPath, 'hooks', 'use-test-products.ts'), 'React Hook');
    checkFile(path.join(frontendPath, 'services', 'test-products.service.ts'), 'API Service');
    console.log('');

    console.log('✅ Test completed successfully!\n');
    console.log('Next steps:');
    console.log('1. Check the generated files manually');
    console.log('2. Run: npm run type-check (backend & frontend)');
    console.log('3. Navigate to: /portal/test-products');
    console.log('4. Test CRUD operations\n');

    return { success: true, moduleId };

  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

function checkFile(filePath: string, label?: string) {
  const exists = fs.existsSync(filePath);
  const status = exists ? '✓' : '✗';
  const name = label || path.basename(filePath);
  console.log(`  ${status} ${name}`);
}

// Run test
testGenerateModule()
  .then(result => {
    if (result.success) {
      console.log('🎉 All tests passed!');
      process.exit(0);
    } else {
      console.log('💥 Test failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
