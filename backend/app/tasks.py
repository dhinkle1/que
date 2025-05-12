from .schemas import QuizRequest, Question
from typing import List

def generate_quiz(request: QuizRequest) -> List[Question]:
    """
    Dummy quiz generator: creates sample questions based on book_id and difficulty.
    """
    questions: List[Question] = []
    for i in range(request.num_questions):
        questions.append(
            Question(
                question=f"Sample question {i+1} ({request.difficulty}) for book {request.book_id}",
                options=[f"Option {chr(65+j)}" for j in range(4)],
                answer_index=i % 4,
                explanation=f"This is a sample explanation for question {i+1}."
            )
        )
    return questions
