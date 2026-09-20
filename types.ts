export interface Form {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  form_id: string;
  question_text: string;
  required: boolean;
  position: number;
  created_at: string;
}

export interface Response {
  id: string;
  form_id: string;
  submitted_at: string;
}

export interface Answer {
  id: string;
  response_id: string;
  question_id: string;
  answer_text: string;
}

export interface ResponseWithAnswers {
  id: string;
  form_id: string;
  submitted_at: string;
  answers: Answer[];
}
