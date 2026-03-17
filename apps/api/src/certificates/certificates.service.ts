import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CertificatePdfService } from './certificate-pdf.service';
import { StorageAppService } from '../storage/storage-app.service';

@Injectable()
export class CertificatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: CertificatePdfService,
    private readonly storageAppService: StorageAppService,
  ) {}

  async findByUser(userId: string) {
    const certificates = await this.prisma.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: 'desc' },
      include: {
        course: { select: { id: true, title: true, thumbnailUrl: true } },
      },
    });

    return certificates.map((c) => ({
      id: c.id,
      courseId: c.course.id,
      courseTitle: c.course.title,
      courseThumbnailUrl: c.course.thumbnailUrl,
      certificateNumber: c.certificateNumber,
      issuedAt: c.issuedAt,
    }));
  }

  async downloadCertificate(certificateId: string, userId: string) {
    const cert = await this.prisma.certificate.findUnique({
      where: { id: certificateId },
      include: { course: { select: { title: true } } },
    });

    if (!cert) throw new NotFoundException('Certificate not found');
    if (cert.userId !== userId) throw new NotFoundException('Certificate not found');

    const { body } = await this.storageAppService.getFile(cert.pdfKey);
    const safeTitle = cert.course.title.replace(/[^a-zA-Z0-9-_ ]/g, '').trim();
    const fileName = `Certificate-${safeTitle}-${cert.certificateNumber}.pdf`;

    return { buffer: body, fileName };
  }

  async generateCertificate(courseId: string, userId: string) {
    // Check if certificate already exists
    const existing = await this.prisma.certificate.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) return existing;

    // Verify course completion — all quizzes must be passed
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true },
    });
    if (!course) throw new NotFoundException('Course not found');

    const assignment = await this.prisma.courseAssignment.findFirst({
      where: { courseId, userId, status: 'COMPLETED' },
    });
    if (!assignment) {
      throw new BadRequestException('Course not yet completed');
    }

    // Verify all quizzes are passed
    const quizzes = await this.prisma.quiz.findMany({
      where: { courseId },
      select: { id: true },
    });

    if (quizzes.length > 0) {
      for (const quiz of quizzes) {
        const passedAttempt = await this.prisma.quizAttempt.findFirst({
          where: { quizId: quiz.id, userId, passed: true },
        });
        if (!passedAttempt) {
          throw new BadRequestException(
            'Not all quizzes have been passed for this course',
          );
        }
      }
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    if (!user) throw new NotFoundException('User not found');

    // Generate certificate number
    const certificateNumber = this.generateCertificateNumber();

    const issuedAt = new Date();

    // Generate PDF
    const pdfBuffer = await this.pdfService.generate({
      userName: user.name,
      courseName: course.title,
      certificateNumber,
      issuedAt,
    });

    // Upload to S3
    const pdfKey = `certificates/${userId}/${courseId}/${certificateNumber}.pdf`;
    await this.storageAppService.uploadFile(pdfKey, pdfBuffer, 'application/pdf');

    // Save to database
    const certificate = await this.prisma.certificate.create({
      data: {
        userId,
        courseId,
        certificateNumber,
        pdfKey,
        issuedAt,
      },
    });

    return certificate;
  }

  private generateCertificateNumber(): string {
    const prefix = 'STA';
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${year}-${random}`;
  }
}
