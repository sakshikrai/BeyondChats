import React, { useState } from 'react';
import './QuizView.css';

function QuizView({ quizData }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  if (!quizData || quizData.length === 0) {
    return <div>Loading quiz...</div>;
  }

  const handleAnswerSelect = (questionIndex, selectedOption) => {
    setUserAnswers({
      ...userAnswers,
      [questionIndex]: selectedOption,
    });
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
  };
  
  const handleSubmit = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let score = 0;
    quizData.forEach((question, index) => {
      if (question.type === 'MCQ' && userAnswers[index] === question.answer) {
        score++;
      }
      // Note: SAQ/LAQ scoring would require manual or more advanced AI grading
    });
    return score;
  };
  
  const score = calculateScore();
  const totalMCQs = quizData.filter(q => q.type === 'MCQ').length;

  if (showResults) {
    return (
      <div className="quiz-container">
        <h2>Quiz Results</h2>
        <p>Your score: {score} / {totalMCQs} on Multiple Choice Questions</p>
        <hr/>
        {quizData.map((question, index) => (
          <div key={index} className="result-question">
            <p><strong>{index + 1}. {question.question}</strong></p>
            {question.type === 'MCQ' && (
              <p>Your answer: {userAnswers[index] || "Not answered"}</p>
            )}
            <p className="correct-answer">Correct Answer: {question.answer}</p>
            <p className="explanation"><i>Explanation: {question.explanation}</i></p>
          </div>
        ))}
         <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }
  
  const currentQuestion = quizData[currentQuestionIndex];

  return (
    <div className="quiz-container">
      <h2>Quiz Time!</h2>
      <div className="question-card">
        <h3>Question {currentQuestionIndex + 1} of {quizData.length}</h3>
        <p>{currentQuestion.question}</p>
        
        {currentQuestion.type === 'MCQ' && (
          <div className="options-container">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className={`option-button ${userAnswers[currentQuestionIndex] === option ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(currentQuestionIndex, option)}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {(currentQuestion.type === 'SAQ' || currentQuestion.type === 'LAQ') && (
          <textarea
            className="answer-textarea"
            placeholder="Type your answer here..."
            value={userAnswers[currentQuestionIndex] || ''}
            onChange={(e) => handleAnswerSelect(currentQuestionIndex, e.target.value)}
          />
        )}
      </div>

      <div className="navigation-buttons">
        <button onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
          Previous
        </button>
        {currentQuestionIndex < quizData.length - 1 ? (
          <button onClick={handleNextQuestion}>Next</button>
        ) : (
          <button onClick={handleSubmit} className="submit-button">Submit Quiz</button>
        )}
      </div>
    </div>
  );
}

export default QuizView;