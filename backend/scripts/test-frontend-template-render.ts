/* eslint-disable no-console */
import { TemplateService } from '../src/modules/module-generator/services/template.service';
import * as fs from 'fs';
import * as path from 'path';

const baseFields = [
  { name: 'title', camelCase: 'title', label: 'Judul', type: 'string', tsType: 'string', isRequired: true, isVisibleInList: true },
  { name: 'body', camelCase: 'body', label: 'Isi', type: 'text', tsType: 'string', isRequired: false, isVisibleInList: false },
  { name: 'price', camelCase: 'price', label: 'Harga', type: 'number', tsType: 'number', isRequired: true, isVisibleInList: true },
  { name: 'is_published', camelCase: 'isPublished', label: 'Terbit', type: 'boolean', tsType: 'boolean', isRequired: false, isVisibleInList: true },
  { name: 'published_at', camelCase: 'publishedAt', label: 'Tanggal Terbit', type: 'date', tsType: 'string', isRequired: false, isVisibleInList: true },
  { name: 'meeting_at', camelCase: 'meetingAt', label: 'Waktu Meeting', type: 'datetime', tsType: 'string', isRequired: false, isVisibleInList: false },
  { name: 'contact_email', camelCase: 'contactEmail', label: 'Email Kontak', type: 'email', tsType: 'string', isRequired: false, isVisibleInList: false },
  { name: 'website', camelCase: 'website', label: 'Website', type: 'url', tsType: 'string', isRequired: false, isVisibleInList: false },
  { name: 'metadata', camelCase: 'metadata', label: 'Metadata', type: 'json', tsType: 'any', isRequired: false, isVisibleInList: false },
  { name: 'status', camelCase: 'status', label: 'Status', type: 'enum', tsType: 'string', isRequired: true, isVisibleInList: true, enumOptions: ['draft', 'published', 'archived'] },
];

function buildContext(createFormType: 'modal' | 'page', editFormType: 'modal' | 'page') {
  return {
    moduleName: 'product_review',
    displayName: 'Product Review',
    className: 'ProductReview',
    tableName: 'product_reviews',
    hasSoftDelete: true,
    hasAudit: true,
    fields: baseFields,
    uiConfig: { createFormType, editFormType },
  };
}

const templates = [
  'frontend/service.ts.hbs',
  'frontend/hook.ts.hbs',
  'frontend/list-page.tsx.hbs',
  'frontend/table.tsx.hbs',
  'frontend/delete-dialog.tsx.hbs',
  'frontend/create-modal.tsx.hbs',
  'frontend/edit-modal.tsx.hbs',
  'frontend/create-page.tsx.hbs',
  'frontend/edit-page.tsx.hbs',
];

async function main() {
  const templateService = new TemplateService();
  const outDir = path.join(__dirname, '..', '.tmp-template-render-test');
  fs.mkdirSync(outDir, { recursive: true });

  const combos: Array<['modal' | 'page', 'modal' | 'page']> = [
    ['modal', 'modal'],
    ['page', 'page'],
    ['modal', 'page'],
  ];

  let hasError = false;

  for (const [createFormType, editFormType] of combos) {
    const context = buildContext(createFormType, editFormType);
    for (const tpl of templates) {
      try {
        const rendered = await templateService.render(tpl, context);
        const outName = `${createFormType}-${editFormType}__${tpl.replace(/\//g, '__')}`;
        fs.writeFileSync(path.join(outDir, outName), rendered, 'utf-8');

        // Basic brace-balance sanity check (catches unescaped Handlebars/JSX collisions)
        const openBraces = (rendered.match(/{/g) || []).length;
        const closeBraces = (rendered.match(/}/g) || []).length;
        if (openBraces !== closeBraces) {
          console.error(`[UNBALANCED BRACES] ${outName}: {=${openBraces} }=${closeBraces}`);
          hasError = true;
        }
        // Detect leftover unrendered Handlebars artifacts
        if (/\{\{[^}]*\}\}/.test(rendered)) {
          console.error(`[LEFTOVER HANDLEBARS TAG] ${outName}`);
          const match = rendered.match(/.{0,40}\{\{[^}]*\}\}.{0,40}/);
          if (match) console.error(`  context: ...${match[0]}...`);
          hasError = true;
        }
        console.log(`[OK] ${outName}`);
      } catch (error: any) {
        console.error(`[FAIL] ${createFormType}-${editFormType} ${tpl}: ${error.message}`);
        hasError = true;
      }
    }
  }

  console.log(`\nRendered files written to: ${outDir}`);
  if (hasError) {
    console.error('\nSome templates FAILED or produced suspicious output.');
    process.exit(1);
  } else {
    console.log('\nAll templates rendered successfully.');
  }
}

main();
