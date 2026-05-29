import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from '../llm/llm.service';
import { AiPublisher } from '../events/ai.publisher';
import { MatchJob } from '@prisma/client';

const MATCHING_SYSTEM_PROMPT = `You are an expert HR recruiter performing candidate-job matching.
Given a job description and candidate profile, evaluate the match and return ONLY valid JSON:
{
  "score": 0.85,
  "confidence": 0.92,
  "reasoning": "brief explanation",
  "strengths": ["matching skills"],
  "gaps": ["missing requirements"],
  "recommendation": "STRONG_MATCH|GOOD_MATCH|PARTIAL_MATCH|WEAK_MATCH"
}
Score and confidence must be floats between 0 and 1.`;

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmService: LlmService,
    private readonly aiPublisher: AiPublisher,
  ) {}

  async computeMatch(
    tenantId: string,
    jobId: string,
    candidateId: string,
  ): Promise<MatchJob> {
    this.logger.log(`Computing match: tenant=${tenantId} job=${jobId} candidate=${candidateId}`);

    // In production: fetch job description from job-service and candidate profile from candidate-service
    const jobDescription = `Job ID: ${jobId} — Senior Software Engineer with 5+ years TypeScript experience`;
    const candidateProfile = `Candidate ID: ${candidateId} — 4 years TypeScript, NestJS, PostgreSQL`;

    // Initial match with default model
    const initialResponse = await this.llmService.complete({
      tenantId,
      prompt: `Job Description:\n${jobDescription}\n\nCandidate Profile:\n${candidateProfile}\n\nCompute the match score.`,
      systemPrompt: MATCHING_SYSTEM_PROMPT,
      operation: 'candidate-match',
      confidence: 1.0, // Start with high confidence = use default model
    });

    let matchData: {
      score: number;
      confidence: number;
      reasoning: string;
      strengths: string[];
      gaps: string[];
      recommendation: string;
    };

    try {
      matchData = JSON.parse(initialResponse.content) as typeof matchData;
    } catch {
      matchData = {
        score: 0.5,
        confidence: 0.5,
        reasoning: initialResponse.content,
        strengths: [],
        gaps: [],
        recommendation: 'PARTIAL_MATCH',
      };
    }

    let finalInputTokens = initialResponse.inputTokens;
    let finalOutputTokens = initialResponse.outputTokens;
    let modelUsed = initialResponse.modelUsed;

    // If confidence < 0.9, re-run with fallback (cheaper) model for verification
    if (matchData.confidence < 0.9) {
      this.logger.log(
        `Low confidence ${matchData.confidence} for match ${jobId}/${candidateId}, running fallback model`,
      );
      const fallbackResponse = await this.llmService.complete({
        tenantId,
        prompt: `Verify this match score (${matchData.score}) for:\nJob: ${jobDescription}\nCandidate: ${candidateProfile}\nPrevious reasoning: ${matchData.reasoning}`,
        systemPrompt: MATCHING_SYSTEM_PROMPT,
        operation: 'candidate-match-verify',
        confidence: 0.5, // Force fallback model
      });

      try {
        const fallbackData = JSON.parse(fallbackResponse.content) as typeof matchData;
        // Average the scores for better accuracy
        matchData.score = (matchData.score + fallbackData.score) / 2;
        matchData.confidence = (matchData.confidence + fallbackData.confidence) / 2;
        finalInputTokens += fallbackResponse.inputTokens;
        finalOutputTokens += fallbackResponse.outputTokens;
        modelUsed = `${modelUsed}+${fallbackResponse.modelUsed}`;
      } catch {
        this.logger.warn('Failed to parse fallback match response');
      }
    }

    const matchJob = await this.prisma.matchJob.create({
      data: {
        tenantId,
        jobId,
        candidateId,
        score: matchData.score,
        confidence: matchData.confidence,
        modelUsed,
        tokensUsed: finalInputTokens + finalOutputTokens,
      },
    });

    await this.aiPublisher.publishMatchGenerated(tenantId, matchJob.id, jobId, candidateId, matchData.score);

    return matchJob;
  }

  async getMatchJob(tenantId: string, matchJobId: string): Promise<MatchJob> {
    const job = await this.prisma.matchJob.findUnique({ where: { id: matchJobId } });
    if (!job || job.tenantId !== tenantId) {
      throw new NotFoundException(`Match job ${matchJobId} not found`);
    }
    return job;
  }
}
