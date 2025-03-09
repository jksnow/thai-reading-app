import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Word {
  text: string;
  translation?: string;
  isHighlighted: boolean;
}

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

const StoryPage: React.FC = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [paragraphs, setParagraphs] = useState<Word[][]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
  const [showingResults, setShowingResults] = useState(false);

  useEffect(() => {
    // Simulate fetching story data
    const fetchStory = () => {
      // This would normally be an API call
      setTimeout(() => {
        setTitle("Going to the Market");

        // Example paragraphs with words
        const dummyParagraphs: Word[][] = [
          [
            { text: "วันนี้", translation: "Today", isHighlighted: true },
            { text: "ฉัน", translation: "I", isHighlighted: false },
            { text: "ไป", translation: "go", isHighlighted: true },
            { text: "ตลาด", translation: "market", isHighlighted: true },
            { text: "กับ", translation: "with", isHighlighted: false },
            { text: "แม่", translation: "mother", isHighlighted: false },
            { text: "ของ", translation: "of", isHighlighted: false },
            { text: "ฉัน", translation: "I", isHighlighted: false },
          ],
          [
            { text: "ที่", translation: "at", isHighlighted: false },
            { text: "ตลาด", translation: "market", isHighlighted: true },
            { text: "มี", translation: "have", isHighlighted: false },
            { text: "คน", translation: "people", isHighlighted: false },
            { text: "เยอะ", translation: "many", isHighlighted: true },
            { text: "มาก", translation: "very", isHighlighted: false },
          ],
          [
            { text: "เรา", translation: "we", isHighlighted: false },
            { text: "ซื้อ", translation: "buy", isHighlighted: true },
            { text: "ผัก", translation: "vegetables", isHighlighted: true },
            { text: "และ", translation: "and", isHighlighted: false },
            { text: "ผลไม้", translation: "fruits", isHighlighted: true },
            { text: "หลาย", translation: "many", isHighlighted: false },
            { text: "อย่าง", translation: "types", isHighlighted: false },
          ],
        ];

        // Example questions
        const dummyQuestions: Question[] = [
          {
            id: 1,
            text: "ฉันไปไหนกับแม่?",
            options: ["บ้าน", "ตลาด", "โรงเรียน", "ร้านอาหาร"],
            correctAnswer: 1,
          },
          {
            id: 2,
            text: "เราซื้ออะไรที่ตลาด?",
            options: ["เสื้อผ้า", "รองเท้า", "ผักและผลไม้", "ของเล่น"],
            correctAnswer: 2,
          },
        ];

        setParagraphs(dummyParagraphs);
        setQuestions(dummyQuestions);
        setLoading(false);
      }, 1000);
    };

    fetchStory();
  }, [storyId]);

  const handleWordClick = (paragraphIndex: number, wordIndex: number) => {
    const updatedParagraphs = [...paragraphs];
    const word = updatedParagraphs[paragraphIndex][wordIndex];
    word.isHighlighted = !word.isHighlighted;
    setParagraphs(updatedParagraphs);
  };

  const handleAnswerSelect = (questionId: number, answerId: number) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: answerId,
    });
  };

  const checkAnswers = () => {
    setShowingResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return `${correct}/${questions.length}`;
  };

  const resetQuiz = () => {
    setUserAnswers({});
    setShowingResults(false);
  };

  if (loading) {
    return (
      <div className="relative z-10 w-full max-w-3xl p-8 mx-auto bg-white/80 backdrop-blur-md rounded-xl shadow-xl flex justify-center items-center min-h-[300px]">
        <div className="text-gray-500">Loading story...</div>
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full max-w-3xl p-8 mx-auto bg-white/80 backdrop-blur-md rounded-xl shadow-xl">
      <div className="mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
        <div className="flex space-x-2 mb-6">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Beginner
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Daily Life
          </span>
        </div>
      </div>

      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Story</h2>
          <div className="p-4 bg-gray-50 rounded-lg">
            {paragraphs.map((paragraph, pIndex) => (
              <p
                key={pIndex}
                className="mb-4 text-lg leading-relaxed"
              >
                {paragraph.map((word, wIndex) => (
                  <span
                    key={wIndex}
                    onClick={() => handleWordClick(pIndex, wIndex)}
                    className={`cursor-pointer mx-0.5 ${
                      word.isHighlighted ? "bg-yellow-200 rounded px-0.5" : ""
                    }`}
                    title={word.translation}
                  >
                    {word.text}
                  </span>
                ))}
              </p>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Vocabulary
          </h2>
          <div className="flex flex-wrap gap-2">
            {paragraphs
              .flatMap((paragraph) =>
                paragraph.filter((word) => word.isHighlighted)
              )
              .map((word, index) => (
                <div
                  key={index}
                  className="bg-yellow-100 px-3 py-1 rounded-lg"
                >
                  <span className="font-medium">{word.text}</span>
                  <span className="text-gray-600 text-sm ml-2">
                    - {word.translation}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Comprehension Questions
        </h2>

        {questions.map((question, qIndex) => (
          <div
            key={question.id}
            className="mb-6 p-4 bg-gray-50 rounded-lg"
          >
            <p className="font-medium mb-3">
              {qIndex + 1}. {question.text}
            </p>
            <div className="space-y-2">
              {question.options.map((option, oIndex) => (
                <div
                  key={oIndex}
                  className={`p-3 rounded-lg border cursor-pointer ${
                    userAnswers[question.id] === oIndex
                      ? showingResults
                        ? question.correctAnswer === oIndex
                          ? "bg-green-100 border-green-400"
                          : "bg-red-100 border-red-400"
                        : "bg-blue-100 border-blue-400"
                      : showingResults && question.correctAnswer === oIndex
                      ? "bg-green-100 border-green-400"
                      : "border-gray-300 hover:bg-gray-100"
                  }`}
                  onClick={() =>
                    !showingResults && handleAnswerSelect(question.id, oIndex)
                  }
                >
                  {option}
                </div>
              ))}
            </div>
            {showingResults &&
              userAnswers[question.id] !== undefined &&
              userAnswers[question.id] !== question.correctAnswer && (
                <div className="mt-2 text-sm text-red-600">
                  Correct answer: {question.options[question.correctAnswer]}
                </div>
              )}
          </div>
        ))}

        <div className="mt-6 flex justify-between">
          {!showingResults ? (
            <button
              onClick={checkAnswers}
              disabled={Object.keys(userAnswers).length !== questions.length}
              className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              Check Answers
            </button>
          ) : (
            <>
              <div className="text-lg font-medium">
                Score: {calculateScore()}
              </div>
              <button
                onClick={resetQuiz}
                className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryPage;
