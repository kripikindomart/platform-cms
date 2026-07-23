import { PartialType } from '@nestjs/swagger';
import { CreateUploadSettingDto } from './create-upload-setting.dto';

/**
 * DTO for updating upload-setting
 * All fields from Create DTO are optional
 */
export class UpdateUploadSettingDto extends PartialType(CreateUploadSettingDto) {}
