import { PartialType } from '@nestjs/swagger';
import { CreateSettingDto } from './create-setting.dto';

/**
 * DTO for updating setting
 * All fields from Create DTO are optional
 */
export class UpdateSettingDto extends PartialType(CreateSettingDto) {}
