import { Controller, Get, Post, Body, UseGuards, Req, Query } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';

@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @UseGuards(JwtAuthGuard)
  @Get('recommendations')
  async getRecs(@Req() req: any) {
    return this.aiService.getRecommendations(req.user.userId);
  }

  @Post('chatbot')
  async askChatbot(@Body('message') message: string) {
    const reply = await this.aiService.chatbotResponse(message);
    return { reply };
  }

  @Get('forecast')
  async getForecast(@Query('branchId') branchId: string) {
    return this.aiService.predictDemand(branchId, new Date());
  }
}
