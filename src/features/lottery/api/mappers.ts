import type {
  Lottery,
  LotteryMode,
  LotteryOption,
  LotterySummary,
} from '../types';

export interface CandidateDto {
  type: 'TEXT' | 'USER';
  // TEXT: a label. USER: the user ID.
  value: string | number;
  weight: number;
}

// Fields shared by every draw response; List items stop here.
export interface DrawSummaryDto {
  id: number;
  group_id: number;
  created_by_member_id: number;
  title: string;
  draw_type: 'EQUAL' | 'WEIGHTED';
  candidate_count: number;
  status: 'DRAFT' | 'COMPLETED';
  is_frozen: boolean;
  can_edit: boolean;
  can_run: boolean;
  result: (CandidateDto & { index: number }) | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Create, Get, Update and Run also return the candidates.
export interface DrawDetailDto extends DrawSummaryDto {
  candidates: CandidateDto[];
  total_weight: number;
}

const toMode = (drawType: DrawSummaryDto['draw_type']): LotteryMode =>
  drawType === 'WEIGHTED' ? 'weighted' : 'equal';

const toStatus = (status: DrawSummaryDto['status']) =>
  status === 'COMPLETED' ? ('completed' as const) : ('draft' as const);

const toKind = (type: CandidateDto['type']) =>
  type === 'USER' ? ('user' as const) : ('text' as const);

function toOption(candidate: CandidateDto, index: number): LotteryOption {
  return {
    id: String(index),
    kind: toKind(candidate.type),
    userId: candidate.type === 'USER' ? String(candidate.value) : null,
    // For USER candidates this is replaced by the member's name later.
    label: String(candidate.value),
    weight: candidate.weight,
    member: null,
  };
}

export function toLottery(dto: DrawDetailDto): Lottery {
  return {
    id: String(dto.id),
    groupId: String(dto.group_id),
    createdByMemberId: String(dto.created_by_member_id),
    title: dto.title,
    status: toStatus(dto.status),
    mode: toMode(dto.draw_type),
    isFrozen: dto.is_frozen,
    canEdit: dto.can_edit,
    canRun: dto.can_run,
    options: dto.candidates.map(toOption),
    totalWeight: dto.total_weight,
    createdAt: dto.created_at,
    result:
      dto.result && dto.completed_at
        ? { optionId: String(dto.result.index), drawnAt: dto.completed_at }
        : null,
  };
}

export function toSummary(dto: DrawSummaryDto): LotterySummary {
  return {
    id: String(dto.id),
    title: dto.title,
    status: toStatus(dto.status),
    mode: toMode(dto.draw_type),
    optionCount: dto.candidate_count,
    isFrozen: dto.is_frozen,
    createdAt: dto.created_at,
    result:
      dto.result && dto.completed_at
        ? {
            kind: toKind(dto.result.type),
            value: String(dto.result.value),
            weight: dto.result.weight,
            drawnAt: dto.completed_at,
          }
        : null,
  };
}
