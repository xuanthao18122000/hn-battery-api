export enum TaskStatusEnum {
  TODO = 1,
  IN_PROGRESS = 2,
  REVIEW = 3,
  DONE = 4,
  DELAYED = 5,
  BLOCKED = 6,
  CANCELLED = 7,
}

export enum TaskPriorityEnum {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  URGENT = 4,
}

export enum TaskStageEnum {
  PLANNING = 'PLANNING', // Lập kế hoạch
  CONSTRUCTION = 'CONSTRUCTION', // Thi công
  FINISHING = 'FINISHING', // Hoàn thiện
  HANDOVER = 'HANDOVER', // Bàn giao
}
