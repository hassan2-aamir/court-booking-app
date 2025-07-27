import { Injectable } from '@nestjs/common';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';

@Injectable()
export class CourtsService {
  create(createCourtDto: CreateCourtDto) {
    return 'This action adds a new court';
  }

  findAll() {
    return `This action returns all courts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} court`;
  }

  update(id: number, updateCourtDto: UpdateCourtDto) {
    return `This action updates a #${id} court`;
  }

  remove(id: number) {
    return `This action removes a #${id} court`;
  }
}
