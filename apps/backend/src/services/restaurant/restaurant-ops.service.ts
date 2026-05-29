import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RestaurantOnboardingEntity, OnboardingStep, OnboardingStatus } from '../../db/entities/restaurant-onboarding.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
import { MenuItemEntity } from '../../db/entities/menu-item.entity';
import { MenuCategoryEntity } from '../../db/entities/menu-category.entity';
import { UserEntity } from '../../db/entities/user.entity';

@Injectable()
export class RestaurantOpsService {
  private readonly logger = new Logger(RestaurantOpsService.name);

  constructor(
    @InjectRepository(RestaurantOnboardingEntity)
    private onboardingRepo: Repository<RestaurantOnboardingEntity>,
    @InjectRepository(RestaurantEntity)
    private restaurantRepo: Repository<RestaurantEntity>,
    @InjectRepository(RestaurantBranchEntity)
    private branchRepo: Repository<RestaurantBranchEntity>,
    @InjectRepository(MenuItemEntity)
    private itemRepo: Repository<MenuItemEntity>,
    @InjectRepository(MenuCategoryEntity)
    private categoryRepo: Repository<MenuCategoryEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    private dataSource: DataSource,
  ) {}

  async startOnboarding(userId: string, restaurantData: {
    name: string;
    slug: string;
    description?: string;
    businessDetails?: any;
  }): Promise<RestaurantOnboardingEntity> {
    // Check if slug exists
    const existing = await this.restaurantRepo.findOne({ where: { slug: restaurantData.slug } });
    if (existing) {
      throw new BadRequestException('Restaurant slug already exists');
    }

    const restaurant = this.restaurantRepo.create({
      name: restaurantData.name,
      slug: restaurantData.slug,
      description: restaurantData.description || '',
      status: 'pending',
    });
    const savedRestaurant = await this.restaurantRepo.save(restaurant);

    const onboarding = this.onboardingRepo.create({
      restaurantId: savedRestaurant.id,
      currentStep: OnboardingStep.BUSINESS_REGISTRATION,
      status: OnboardingStatus.IN_PROGRESS,
      businessDetails: restaurantData.businessDetails || {},
    });

    return this.onboardingRepo.save(onboarding);
  }

  async updateStep(onboardingId: string, step: OnboardingStep, data?: any): Promise<RestaurantOnboardingEntity> {
    const onboarding = await this.onboardingRepo.findOne({ where: { id: onboardingId } });
    if (!onboarding) {
      throw new NotFoundException('Onboarding not found');
    }

    let updateData: any = { currentStep: step };

    switch (step) {
      case OnboardingStep.DOCUMENT_UPLOAD:
        updateData.documentStatus = { ...onboarding.documentStatus, ...(data?.documents || {}) };
        break;
      case OnboardingStep.BANK_VERIFICATION:
        updateData.bankDetails = { ...onboarding.bankDetails, ...(data?.bankDetails || {}) };
        break;
      case OnboardingStep.MENU_SETUP:
        updateData.menuSetup = { ...onboarding.menuSetup, ...(data?.menuSetup || {}) };
        break;
    }

    await this.onboardingRepo.update(onboardingId, updateData);
    return this.onboardingRepo.findOne({ where: { id: onboardingId } });
  }

  async completeOnboarding(onboardingId: string, userId: string): Promise<RestaurantOnboardingEntity> {
    const onboarding = await this.onboardingRepo.findOne({ where: { id: onboardingId } });
    if (!onboarding) {
      throw new NotFoundException('Onboarding not found');
    }

    await this.onboardingRepo.update(onboardingId, {
      status: OnboardingStatus.COMPLETED,
      currentStep: OnboardingStep.COMPLETION,
    });

    await this.restaurantRepo.update(onboarding.restaurantId, { status: 'active' });

    return this.onboardingRepo.findOne({ where: { id: onboardingId } });
  }

  async getOnboardingProgress(onboardingId: string): Promise<any> {
    const onboarding = await this.onboardingRepo.findOne({
      where: { id: onboardingId },
      relations: ['restaurant'],
    });

    if (!onboarding) {
      throw new NotFoundException('Onboarding not found');
    }

    const steps = Object.values(OnboardingStep);
    const currentStepIndex = steps.indexOf(onboarding.currentStep);

    return {
      ...onboarding,
      progress: Math.round(((currentStepIndex + 1) / steps.length) * 100),
      stepsCompleted: currentStepIndex + 1,
      totalSteps: steps.length,
    };
  }
}