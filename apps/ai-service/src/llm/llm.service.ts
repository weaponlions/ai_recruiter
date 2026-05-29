import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { CostService } from '../cost/cost.service';

export interface LlmRequest {
  tenantId: string;
  prompt: string;
  systemPrompt?: string;
  confidence?: number; // 0-1, triggers fallback model if < 0.9
  operation: string;
  maxTokens?: number;
}

export interface LlmResponse {
  content: string;
  modelUsed: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly openai: OpenAI;
  private readonly anthropic: Anthropic;

  private readonly defaultModel: string;
  private readonly fallbackModel: string;
  private readonly maxTokensPerRequest: number;

  constructor(private readonly costService: CostService) {
    this.openai = new OpenAI({ apiKey: process.env['OPENAI_API_KEY'] });
    this.anthropic = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] });
    this.defaultModel = process.env['DEFAULT_MODEL'] ?? 'gpt-4o-mini';
    this.fallbackModel = process.env['FALLBACK_MODEL'] ?? 'gpt-3.5-turbo';
    this.maxTokensPerRequest = Number(process.env['MAX_TOKENS_PER_REQUEST'] ?? 4000);
  }

  async complete(req: LlmRequest): Promise<LlmResponse> {
    // Check tenant monthly limit first
    await this.costService.assertWithinLimit(req.tenantId);

    // Confidence-based model selection: low confidence → use fallback (cheaper) model
    const selectedModel =
      req.confidence !== undefined && req.confidence < 0.9
        ? this.fallbackModel
        : this.defaultModel;

    this.logger.log(
      `LLM call: tenant=${req.tenantId} model=${selectedModel} operation=${req.operation}`,
    );

    let result: LlmResponse;

    // Route to correct provider
    if (selectedModel.startsWith('claude')) {
      result = await this.callAnthropic(selectedModel, req);
    } else {
      result = await this.callOpenAI(selectedModel, req);
    }

    // Record cost in ledger
    await this.costService.recordUsage({
      tenantId: req.tenantId,
      model: result.modelUsed,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      operation: req.operation,
    });

    return result;
  }

  private async callOpenAI(model: string, req: LlmRequest): Promise<LlmResponse> {
    const maxRetries = 3;
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

        if (req.systemPrompt) {
          messages.push({ role: 'system', content: req.systemPrompt });
        }
        messages.push({ role: 'user', content: req.prompt });

        const response = await this.openai.chat.completions.create({
          model,
          messages,
          max_tokens: req.maxTokens ?? this.maxTokensPerRequest,
        });

        const choice = response.choices[0];
        if (!choice || !choice.message.content) {
          throw new Error('Empty response from OpenAI');
        }

        return {
          content: choice.message.content,
          modelUsed: model,
          inputTokens: response.usage?.prompt_tokens ?? 0,
          outputTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0,
        };
      } catch (err) {
        lastError = err as Error;
        this.logger.warn(`OpenAI attempt ${attempt}/${maxRetries} failed: ${lastError.message}`);
        if (attempt < maxRetries) {
          await this.sleep(attempt * 1000);
        }
      }
    }

    throw new HttpException(
      `LLM call failed after ${maxRetries} attempts: ${lastError?.message}`,
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }

  private async callAnthropic(model: string, req: LlmRequest): Promise<LlmResponse> {
    const maxRetries = 3;
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.anthropic.messages.create({
          model,
          max_tokens: req.maxTokens ?? this.maxTokensPerRequest,
          system: req.systemPrompt,
          messages: [{ role: 'user', content: req.prompt }],
        });

        const contentBlock = response.content[0];
        if (!contentBlock || contentBlock.type !== 'text') {
          throw new Error('Empty or non-text response from Anthropic');
        }

        return {
          content: contentBlock.text,
          modelUsed: model,
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        };
      } catch (err) {
        lastError = err as Error;
        this.logger.warn(`Anthropic attempt ${attempt}/${maxRetries} failed: ${lastError.message}`);
        if (attempt < maxRetries) {
          await this.sleep(attempt * 1000);
        }
      }
    }

    throw new HttpException(
      `Anthropic LLM call failed after ${maxRetries} attempts: ${lastError?.message}`,
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0]?.embedding ?? [];
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
