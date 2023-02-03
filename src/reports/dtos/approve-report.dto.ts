import { IsBoolean } from 'class-validator';

export class AppproveReportDto {
  @IsBoolean()
  approved: boolean;
}
