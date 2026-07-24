import { IsString, IsNumber, IsBoolean, IsOptional, IsNotEmpty, IsEmail, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Create news DTO
 * @generated
 */
export class CreateNewsDto {
  @ApiProperty({
    description: 'Uuid',
    required: false,
    
    
    
    
  })
  @IsOptional()
  uuid?: string;

  @ApiProperty({
    description: 'Title',
    required: false,
    type: String,
    
    
    
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Content',
    required: false,
    
    
    
    
  })
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: 'Image',
    required: false,
    type: String,
    
    
    
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({
    description: 'Date',
    required: false,
    type: String,
    
    
    
  })
  @IsOptional()
  @IsString()
  date?: string;

}
