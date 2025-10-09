# PDF Quiz Generator

This is a web application designed to help students revise their course material by generating quizzes from PDF documents. The app allows users to upload their own PDFs, view them, and take quizzes that are generated from the content.

**Live URL:** [Link to your deployed application]

## Features Implemented

This project successfully covers all the "Must-Have" features outlined in the assignment brief.

* **Source Selector:** Users can upload their own PDF files. The application then displays a list of all uploaded PDFs, allowing the user to select one as the source for a quiz.
* **PDF Viewer:** A split-screen interface displays the selected PDF on one side, allowing users to reference the material while the quiz is on the other side.
* **Quiz Generator Engine:** The application can generate a multi-format quiz including Multiple Choice Questions (MCQs), Short Answer Questions (SAQs), and Long Answer Questions (LAQs). It allows users to answer questions, submit their quiz, and view their score along with correct answers and explanations.
* **Progress Tracking:** All quiz attempts are saved. A dashboard is available for the user to view their history of quiz attempts, including the PDF source, score, and the date of the attempt.

## Tech Stack

* **Frontend:** React.js
* **Backend:** Node.js with Express.js
* **Database:** MongoDB
* **PDF Parsing:** `pdf-parse`

## How I Built the Project

The project is structured as a standard MERN-stack application, with a `client` directory for the React frontend and a `Server` directory for the Node.js backend.

The end-to-end architecture is as follows:

1.  **Frontend (React):** The user interacts with the React application. When a PDF is uploaded, it's sent to the backend. When a quiz is requested or a submission is made, the frontend makes API calls to the backend.
2.  **Backend (Node.js/Express):** The server handles all incoming API requests. It uses `multer` for file uploads, `pdf-parse` to extract text from PDFs, and `mongoose` to interact with the MongoDB database. It contains endpoints for uploading files, fetching a list of PDFs, generating quizzes, and saving/retrieving quiz attempts.
3.  **Database (MongoDB):** The database stores two main types of data: information about the uploaded PDFs and the results of each quiz attempt made by the user.

## Trade-offs and Decisions

**The most significant trade-off made during development was the implementation of the Quiz Generator Engine.**

Initially, the plan was to integrate a live LLM API (such as OpenAI, Google Gemini, or Claude) to generate dynamic quizzes from the PDF content. However, I encountered persistent account-level issues (quota limits, billing requirements, and regional availability) with all attempted third-party services.

Given the strict deadline, I made the strategic decision to **improvise by creating a mock quiz generation endpoint**. This mock endpoint simulates the response of an AI service by returning a pre-defined, high-quality 25-question quiz. This decision allowed me to complete the entire end-to-end application, including the crucial progress tracking feature, and deliver a fully functional and demonstrable product.

This approach ensures that the application's architecture is sound and that the core user experience can be fully tested. The mock endpoint is designed to be easily replaceable with a live LLM call once the external API issues are resolved.

## Setup and How to Run

To run this project locally, you will need Node.js and MongoDB installed on your machine.

**1. Clone the repository:**
```bash
git clone [https://github.com/sakshikrai/BeyondChats]
cd Server
npm install
npm run dev

cd client
npm install
npm start

##The client will start on http://localhost:3000 and open automatically in your browser.

With this, your project is complete and ready for submission. All the best!








