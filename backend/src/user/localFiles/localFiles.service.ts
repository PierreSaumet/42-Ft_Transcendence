import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import LocalFiles from './localFiles.entity';
import { User } from 'src/user/user.entity';
import { UserService } from '../user.service';
 
@Injectable()
class LocalFilesService {
  constructor(
    @InjectRepository(LocalFiles)
    private localFilesRepository: Repository<LocalFiles>,
    // private userService: UserService
  ) {}
 
  // Save the Avatar image 
  async saveLocalFileData(fileData: LocalFilesDto) {

    const newFile = await this.localFilesRepository.create(fileData)
    await this.localFilesRepository.save(newFile);

    return newFile;
        
  }

  // Retrieving the Avatar image
  async getFileById(fileId: string) {
    const file = await this.localFilesRepository.findOneBy({ id : fileId});
    if (!file)
      throw new NotFoundException();
    return file;
  }
}
 
export default LocalFilesService;