import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FilesRepository } from './files.repository';
import { DocumentPublisher } from '../events/document.publisher';
import { StorageModule } from '../storage/storage.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({ imports: [PrismaModule, StorageModule], controllers: [FilesController], providers: [FilesService, FilesRepository, DocumentPublisher] })
export class FilesModule {}
