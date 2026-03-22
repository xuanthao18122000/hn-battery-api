import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContactInformationDto, UpdateContactInformationDto, ListContactInformationDto } from './dto';
import { ContactInformation } from 'src/database/entities/contact-information.entity';
import { isValueDefinedAndChanged, paginatedResponse } from 'src/helpers';
import { ErrorCode } from 'src/constants';
import { ContactStatusEnum } from 'src/database/entities/contact-information.entity';

@Injectable()
export class ContactInformationService {
  constructor(
    @InjectRepository(ContactInformation)
    private readonly contactInfoRepo: Repository<ContactInformation>,
  ) {}

  /**
   * @description: Danh sách thông tin liên hệ
   */
  async findAll(query: ListContactInformationDto) {
    const queryBuilder = this.contactInfoRepo
      .fCreateFilterBuilder('contact', query)
      .select([
        'contact.id',
        'contact.name',
        'contact.phone',
        'contact.email',
        'contact.message',
        'contact.productId',
        'contact.status',
        'contact.notes',
        'contact.createdAt',
        'contact.updatedAt',
      ]);

    // Search by name, email, phone
    if (query.search) {
      queryBuilder.andWhere(
        '(contact.name LIKE :search OR contact.email LIKE :search OR contact.phone LIKE :search)',
        { search: `%${query.search}%` }
      );
    }

    // Filter by status
    if (query.status) {
      queryBuilder.andWhere('contact.status = :status', { status: query.status });
    }

    queryBuilder
      .fOrderBy('createdAt', 'DESC')
      .fAddPagination();

    const [contacts, total] = await queryBuilder.getManyAndCount();

    return paginatedResponse(contacts, total, query);
  }

  /**
   * @description: Lấy thông tin liên hệ theo ID
   */
  async findOne(id: number): Promise<ContactInformation> {
    const contact = await this.contactInfoRepo.findOne({
      where: { id },
    });

    if (!contact) {
      throw new NotFoundException(ErrorCode.NOT_FOUND);
    }

    return contact;
  }

  /**
   * @description: Tạo thông tin liên hệ mới
   */
  async create(createDto: CreateContactInformationDto): Promise<ContactInformation> {
    const newContact = this.contactInfoRepo.create({
      ...createDto,
      status: createDto.status || ContactStatusEnum.NEW,
    });

    return await this.contactInfoRepo.save(newContact);
  }

  /**
   * @description: Cập nhật thông tin liên hệ
   */
  async update(
    id: number,
    updateDto: UpdateContactInformationDto,
  ): Promise<ContactInformation> {
    const contact = await this.findOne(id);

    isValueDefinedAndChanged(contact.name, updateDto.name) &&
      (contact.name = updateDto.name);
    isValueDefinedAndChanged(contact.phone, updateDto.phone) &&
      (contact.phone = updateDto.phone);
    isValueDefinedAndChanged(contact.email, updateDto.email) &&
      (contact.email = updateDto.email);
    isValueDefinedAndChanged(contact.address, updateDto.address) &&
      (contact.address = updateDto.address);
    isValueDefinedAndChanged(contact.productId, updateDto.productId) &&
      (contact.productId = updateDto.productId);
    isValueDefinedAndChanged(contact.status, updateDto.status) &&
      (contact.status = updateDto.status);
    isValueDefinedAndChanged(contact.notes, updateDto.notes) &&
      (contact.notes = updateDto.notes);

    return await this.contactInfoRepo.save(contact);
  }

  /**
   * @description: Xóa thông tin liên hệ
   */
  async remove(id: number): Promise<void> {
    const contact = await this.findOne(id);
    await this.contactInfoRepo.remove(contact);
  }
}
