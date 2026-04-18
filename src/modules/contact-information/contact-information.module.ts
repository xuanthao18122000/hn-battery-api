import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactInformationController } from './contact-information.controller';
import { ContactInformationService } from './contact-information.service';
import { ContactInformation } from 'src/database/entities/contact-information.entity';
import { ContactInformationFeController } from './controllers/contact-information.fe.controller';
import { CustomerModule } from '../customer/customer.module';

@Module({
  imports: [TypeOrmModule.forFeature([ContactInformation]), CustomerModule],
  controllers: [ContactInformationController, ContactInformationFeController],
  providers: [ContactInformationService],
  exports: [ContactInformationService],
})
export class ContactInformationModule {}
