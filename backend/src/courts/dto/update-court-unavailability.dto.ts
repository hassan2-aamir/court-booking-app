import { PartialType } from '@nestjs/swagger';
import { CreateCourtUnavailabilityDto } from './create-court-unavailability.dto';

export class UpdateCourtUnavailabilityDto extends PartialType(CreateCourtUnavailabilityDto) {}