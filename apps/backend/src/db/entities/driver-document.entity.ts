import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { DriverEntity } from './driver.entity';

export enum DocumentType {
  DRIVING_LICENSE = 'driving_license',
  VEHICLE_REGISTRATION = 'vehicle_registration',
  INSURANCE = 'insurance',
  ID_PROOF = 'id_proof',
  ADDRESS_PROOF = 'address_proof',
}

export enum DocumentStatus {
  PENDING = 'pending',
  UPLOADED = 'uploaded',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

@Entity('driver_documents')
export class DriverDocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  driverId!: string;

  @ManyToOne(() => DriverEntity)
  driver!: DriverEntity;

  @Column({ type: 'enum', enum: DocumentType })
  documentType!: DocumentType;

  @Column()
  documentUrl!: string;

  @Column({ type: 'enum', enum: DocumentStatus, default: DocumentStatus.PENDING })
  status!: DocumentStatus;

  @Column({ nullable: true })
  verificationNotes!: string;

  @Column({ nullable: true })
  verifiedBy!: string;

  @Column({ nullable: true })
  verifiedAt!: Date;

  @Column({ nullable: true })
  expiryDate!: Date;

  @CreateDateColumn()
  uploadedAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}