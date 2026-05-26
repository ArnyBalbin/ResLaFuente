import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ConveniosService } from './convenios.service';
import { CreateConvenioDto } from './dto/create-convenio.dto';
import { UpdateConvenioDto } from './dto/update-convenio.dto';

@Controller('convenios')
export class ConveniosController {
  constructor(private readonly conveniosService: ConveniosService) {}

}
