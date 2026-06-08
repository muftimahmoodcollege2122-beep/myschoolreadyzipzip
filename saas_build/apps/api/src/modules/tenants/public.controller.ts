import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

@ApiTags('Public')
@Controller('public')
export class PublicController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Public school signup — no auth required' })
  @ApiResponse({ status: 201, description: 'School provisioned successfully' })
  async signup(@Body() dto: CreateTenantDto) {
    const result = await this.tenantsService.provision(dto);
    return {
      ...result,
      schoolUrl: `/s/${result.slug}`,
      dashboardUrl: `/dashboard`,
      message: 'Your school is live! You can now log in to your dashboard.',
    };
  }

  @Post('check-slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check if a school name/slug is available' })
  async checkSlug(@Body() body: { schoolName: string }) {
    const slug = body.schoolName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50)
      .replace(/^-|-$/g, '');
    const available = await this.tenantsService.isSlugAvailable(slug);
    return { slug, available };
  }
}
