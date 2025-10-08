import React, { useState } from 'react';

const QuizView = ({ quizData, onBack }) => {
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

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
      <div className="quiz-header">
        <h2>Quiz Time!</h2>
        <button onClick={onBack} className="back-btn">← Back to PDF</button>
      </div>
      {quizData.mcqs && quizData.mcqs.map(renderMCQ)}
      {/* Yahan SAQs aur LAQs render karne ka code add kar sakte hain */}

      {!showResults && (
        <button onClick={handleSubmit} className="submit-btn">
          Submit Quiz
        </button>
      )}
    </div>
  );
};

export default QuizView;