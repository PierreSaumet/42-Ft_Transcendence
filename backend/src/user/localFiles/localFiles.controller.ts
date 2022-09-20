import {
    Controller,
    Get,
    Param,
    UseInterceptors,
    ClassSerializerInterceptor,
    StreamableFile,
    Res,
    ParseIntPipe,
    UseGuards
  } from '@nestjs/common';
  import LocalFilesService from './localFiles.service';
  import { Response } from 'express';
  import { createReadStream } from 'fs';
  import { join } from 'path';
  import { UserController } from '../user.controller';
  import { JwtAuthenticationGuard } from 'src/authentification/jwt-authentification.guard';
  import { promises } from "fs";

  @Controller('localFiles')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtAuthenticationGuard)
  export default class LocalFilesController {
    constructor(
      private readonly localFilesService: LocalFilesService
    ) {}
  
    @Get('/:id')
      async getDatabaseFileById(@Param('id', ParseIntPipe) id: string, @Res({ passthrough: true }) response: Response) {

      const file = await this.localFilesService.getFileById(id);
      if (file)
      {
        const stream = createReadStream(join(process.cwd(), file.path));
        response.set({
          'Content-Disposition': `inline; filename="${file.filename}"`,
          'Content-Type': file.mimetype
        })
        return new StreamableFile(stream);
      }
      else {
      }
    }
    
    @Get('/test/:id')
    async getDatabaseFile(@Param('id', ParseIntPipe) id: string, @Res({ passthrough: true }) response: Response) {

      const file = await this.localFilesService.getFileById(id);
      if (file)
      {
        const content = await promises.readFile(file.path)
        return content.toString()
        
      }
      else {
      }
    }

  }