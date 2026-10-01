import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Inject,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { DatabaseService } from '../../database/database.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller(['api/chat', 'api/v1/chat'])
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    @Inject(ChatService) private readonly chatService: ChatService,
    @Inject(DatabaseService) private readonly db: DatabaseService,
  ) {}

  @Post()
  async sendMessage(
    @Body() body: { message: string; conversationId?: string },
    @Request() req: any,
  ) {
    return this.chatService.processMessage(body.message, req.user, body.conversationId);
  }

  @Get('quick-questions')
  async getQuickQuestions(@Request() req: any) {
    return {
      quickQuestions: this.chatService.getQuickQuestionsForRole(req.user?.role),
    };
  }

  @Get('conversations')
  async getUserConversations(@Request() req: any) {
    return this.db.getUserConversations(req.user?.userId);
  }

  @Post('conversations')
  async createConversation(@Body() body: { title?: string }, @Request() req: any) {
    return this.db.createConversation(req.user?.userId, body.title);
  }

  @Get('conversations/:id')
  async getConversationMessages(@Param('id') id: string, @Request() req: any) {
    const conv = await this.db.getConversationById(id, req.user?.userId);
    if (!conv) {
      throw new NotFoundException(`Conversation ${id} not found`);
    }
    const messages = await this.db.getConversationMessages(id);
    return {
      conversation: conv,
      messages,
    };
  }

  @Delete('conversations/:id')
  async deleteConversation(@Param('id') id: string, @Request() req: any) {
    const deleted = await this.db.deleteConversation(id, req.user?.userId);
    if (!deleted) throw new NotFoundException(`Conversation ${id} not found`);
    return { success: true, message: 'Conversation deleted' };
  }
}
