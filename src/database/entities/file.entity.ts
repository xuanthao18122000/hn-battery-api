import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('files')
export class File {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 500,
        comment: 'Tên file gốc',
    })
    originalName: string;

    @Column({
        length: 500,
        comment: 'Tên file đã lưu',
    })
    fileName: string;

    @Column({
        length: 500,
        comment: 'Đường dẫn file',
    })
    path: string;

    @Column({
        length: 100,
        comment: "MIME type của file",
    })
    mimeType: string;

    @Column({
        type: 'bigint',
        comment: 'Kích thước file (bytes)',
    })
    size: number;

    @Column({
        length: 50,
        nullable: true,
        comment: 'Loại file (image, document, etc.)',
    })
    fileType?: string;

    @Column({
        type: 'boolean',
        default: false,
        comment: 'Đánh dấu file đang được sử dụng',
    })
    isUsed: boolean = false;

    constructor(partial: Partial<File>) {
        Object.assign(this, partial);
    }
}
