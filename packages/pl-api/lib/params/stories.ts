interface CreateStoryPollParams {
  /** From 6 to 140 characters. */
  question: string;
  /** Between 2 and 4 answers. */
  answers: string;
  can_reply: boolean;
  can_react: boolean;
}

type StoryReportType = 'spam' | 'sensitive' | 'abusive' | 'underage' | 'copyright' | 'impersonation' | 'scam' | 'terrorism';

interface CropStoryPhotoParams {
  width: number;
  height: number;
  x: number;
  y: number;
}

interface CreateStoryParams {
  /** Between 3 and 120 (in seconds). */
  duration: number;
  can_reply: boolean;
  can_react: boolean;
}

export type { CreateStoryPollParams, StoryReportType, CropStoryPhotoParams, CreateStoryParams };
