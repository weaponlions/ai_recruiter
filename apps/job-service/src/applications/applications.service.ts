import { Injectable } from '@nestjs/common';
import { ApplicationsRepository } from './applications.repository';
import { JobPublisher } from '../events/job.publisher';
import { CreateApplicationDto } from './dto/create-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly repo: ApplicationsRepository,
    private readonly publisher: JobPublisher,
  ) {}

  async create(tenantId: string, dto: CreateApplicationDto) {
    const app = await this.repo.create(tenantId, dto);
    await this.publisher.applicationSubmitted(tenantId, {
      applicationId: app.id, jobId: app.jobId, candidateId: app.candidateId, tenantId,
    });
    return app;
  }

  findByJob(tenantId: string, jobId: string) {
    return this.repo.findByJob(tenantId, jobId);
  }
}
