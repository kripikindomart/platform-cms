import { IsArray, IsNumber, IsOptional, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class UserRoleMapping {
  @ApiProperty({ description: 'User ID' })
  @IsNumber()
  user_id!: number;

  @ApiProperty({ description: 'Role ID' })
  @IsNumber()
  role_id!: number;
}

export class BulkAddUsersDto {
  @ApiProperty({ 
    description: 'Array of user IDs to add to tenant',
    type: [Number],
    example: [1, 2, 3]
  })
  @IsArray()
  @Type(() => Number)
  @ArrayMinSize(1, { message: 'At least one user ID is required' })
  @IsNumber({}, { each: true })
  user_ids!: number[];

  @ApiPropertyOptional({ 
    description: 'Default role ID for all users (if user_role_mapping not provided)',
    example: 2
  })
  @IsNumber()
  @IsOptional()
  default_role_id?: number;

  @ApiPropertyOptional({
    description: 'Specific role mapping for each user',
    type: [UserRoleMapping]
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UserRoleMapping)
  user_role_mapping?: UserRoleMapping[];
}
