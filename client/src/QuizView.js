// In client/src/QuizView.js
import React, { useState } from 'react';

const QuizView = ({ quizData }) => {
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  if (!quizData) {
    return null; // Don't render anything if there's no quiz data
  }

  const handleOptionChange = (questionIndex, option) => {
    setUserAnswers({
      ...userAnswers,
      [`mcq_${questionIndex}`]: option,
    });
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const renderMCQ = (mcq, index) => {
    const questionId = `mcq_${index}`;
    const userAnswer = userAnswers[questionId];
    const isCorrect = userAnswer === mcq.answer;

    return (
      <div key={index} className="question-block">
        <h3>{index + 1}. {mcq.question}</h3>
        <div className="options">
          {mcq.options.map((option, i) => (
            <label
              key={i}
              className={`option-label ${showResults && option === mcq.answer ? 'correct' : ''} ${showResults && userAnswer === option && !isCorrect ? 'incorrect' : ''}`}
            >
              <input
                type="radio"
                name={questionId}
                value={option}
                checked={userAnswer === option}
                onChange={() => handleOptionChange(index, option)}
                disabled={showResults}
              />
              {option}
            </label>
          ))}
        </div>
        {showResults && (
          <div className="explanation">
            <p><strong>Correct Answer:</strong> {mcq.answer}</p>
            <p><strong>Explanation:</strong> {mcq.explanation}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="quiz-container">
      <h2>Quiz Time!</h2>
      {quizData.mcqs && quizData.mcqs.map(renderMCQ)}
      {/* We can add rendering for SAQs and LAQs here later */}

      {!showResults && (
        <button onClick={handleSubmit} className="submit-btn">
          Submit Quiz
        </button>
      )}
    </div>
  );
};

export default QuizView;