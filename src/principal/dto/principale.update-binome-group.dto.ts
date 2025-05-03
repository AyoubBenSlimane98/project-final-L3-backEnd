import { IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateOneBinomeGroupDto {
  @IsNumber()
  studentId: number;

  @IsNumber()
  groupId: number;
}

export class UpdateBinomeGroupDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOneBinomeGroupDto)
  updates: UpdateOneBinomeGroupDto[];
}
