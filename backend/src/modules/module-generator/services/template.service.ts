import { Injectable, Logger } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);
  private readonly templatesDir = path.join(
    process.cwd(),
    'src',
    'modules',
    'module-generator',
    'templates',
  );
  private templateCache = new Map<string, HandlebarsTemplateDelegate>();
  private partialsRegistered = false;

  constructor() {
    this.registerHelpers();
  }

  /**
   * Render template with context
   */
  async render(templateName: string, context: any): Promise<string> {
    try {
      await this.ensurePartialsRegistered();
      const template = await this.loadTemplate(templateName);
      return template(context);
    } catch (error: any) {
      this.logger.error(`Failed to render template ${templateName}: ${error.message}`);
      throw new Error(`Template rendering failed: ${error.message}`);
    }
  }

  /**
   * Register every .hbs file under templates/frontend/partials/ as a
   * Handlebars partial (named by filename, without extension), so multiple
   * templates can share the same block (e.g. per-field form input
   * rendering) instead of duplicating it and drifting out of sync.
   */
  private async ensurePartialsRegistered(): Promise<void> {
    if (this.partialsRegistered) {
      return;
    }
    this.partialsRegistered = true;

    const partialsDir = path.join(this.templatesDir, 'frontend', 'partials');
    let files: string[];
    try {
      files = await fs.readdir(partialsDir);
    } catch {
      return; // no partials directory - nothing to register
    }

    for (const file of files) {
      if (!file.endsWith('.hbs')) continue;
      const name = file.replace(/\.hbs$/, '');
      const content = await fs.readFile(path.join(partialsDir, file), 'utf-8');
      Handlebars.registerPartial(name, content);
      this.logger.log(`  Registered partial: ${name}`);
    }
  }

  /**
   * Load template (with caching)
   */
  private async loadTemplate(
    templateName: string,
  ): Promise<HandlebarsTemplateDelegate> {
    // Check cache
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!;
    }

    // Load from file
    const templatePath = path.join(this.templatesDir, templateName);
    
    try {
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      const compiled = Handlebars.compile(templateContent);
      
      // Cache it
      this.templateCache.set(templateName, compiled);
      
      return compiled;
    } catch (error) {
      throw new Error(`Template not found: ${templateName}`);
    }
  }

  /**
   * Register Handlebars helpers
   */
  private registerHelpers(): void {
    // Helper: capitalize
    Handlebars.registerHelper('capitalize', (str: string) => {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    });

    // Helper: uppercase
    Handlebars.registerHelper('uppercase', (str: string) => {
      return str ? str.toUpperCase() : '';
    });

    // Helper: lowercase
    Handlebars.registerHelper('lowercase', (str: string) => {
      return str ? str.toLowerCase() : '';
    });

    // Helper: pluralize (simple English pluralization)
    Handlebars.registerHelper('pluralize', (str: string) => {
      if (!str) return '';
      if (str.endsWith('y')) {
        return str.slice(0, -1) + 'ies';
      }
      if (str.endsWith('s') || str.endsWith('x') || str.endsWith('z')) {
        return str + 'es';
      }
      return str + 's';
    });

    // Helper: eq (equality check)
    Handlebars.registerHelper('eq', (a, b) => a === b);

    // Helper: ne (not equal)
    Handlebars.registerHelper('ne', (a, b) => a !== b);

    // Helper: or
    Handlebars.registerHelper('or', (...args) => {
      return args.slice(0, -1).some(Boolean);
    });

    // Helper: and
    Handlebars.registerHelper('and', (...args) => {
      return args.slice(0, -1).every(Boolean);
    });

    // Helper: join array
    Handlebars.registerHelper('join', (arr: any[], separator = ', ') => {
      return Array.isArray(arr) ? arr.join(separator) : '';
    });

    // Helper: quote string
    Handlebars.registerHelper('quote', (str: string) => {
      return `'${str}'`;
    });

    // Helper: backtick
    Handlebars.registerHelper('backtick', (str: string) => {
      return `\`${str}\``;
    });

    // Helper: resolveInputType - Form Builder's per-field `inputType`
    // (23 options: text/textarea/wysiwyg/select/date/etc) takes priority;
    // falls back to a sensible default derived from the base schema `type`
    // (string/text/number/boolean/date/...) when Form Builder wasn't used
    // for this field. Mirrors frontend's getDefaultInputType().
    Handlebars.registerHelper('resolveInputType', (inputType: string | undefined, type: string) => {
      if (inputType) return inputType;
      const defaults: Record<string, string> = {
        string: 'text',
        text: 'textarea',
        number: 'number',
        boolean: 'switch',
        date: 'date',
        datetime: 'datetime-local',
        email: 'email',
        url: 'url',
        uuid: 'text',
        json: 'json-editor',
        enum: 'select',
      };
      return defaults[type] || 'text';
    });

    // Helper: toCamelCase (e.g. "product_review" -> "productReview")
    // NOTE: deliberately NOT named "camelCase" - FieldContext already exposes
    // a `camelCase` property on each field, and Handlebars helpers take
    // precedence over context properties of the same name. Using that name
    // here would silently break every bare `{{camelCase}}` field reference.
    Handlebars.registerHelper('toCamelCase', (str: string) => {
      if (!str) return '';
      const pascal = str
        .split(/[-_]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
      return pascal.charAt(0).toLowerCase() + pascal.slice(1);
    });
  }

  /**
   * Clear template cache (for hot reload in dev)
   */
  clearCache(): void {
    this.templateCache.clear();
    this.partialsRegistered = false;
    this.logger.log('Template cache cleared');
  }
}
