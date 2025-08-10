import { PartialType } from '@nestjs/swagger';
import { CreateCourtPeakScheduleDto } from './create-court-peak-schedule.dto';

export class UpdateCourtPeakScheduleDto extends PartialType(CreateCourtPeakScheduleDto) {}