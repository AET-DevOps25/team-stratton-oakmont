## What is the main functionality? 

Our web application is designed to empower students at the Technical University of Munich (TUM) to effectively understand, navigate, and plan their academic journey. Its core functionality revolves around three pillars: 

1. The application provides a clear, structured view of specific TUM study programs (for our MVP M.Sc. Information Systems). Users can easily browse modules, courses, and their detailed descriptions, including ECTS credits, prerequisites, language of instruction, and learning outcomes. A robust search function allows students to quickly find courses based on keywords or natural language questions. 

2. Students can create and manage a personal study plan by selecting courses from their chosen program. The system dynamically calculates total ECTS accumulated and, crucially, breaking this down by specific requirement areas (e.g., "Algorithms", "Electives", "Practical Work"). It will highlight completed ECTS within these areas and clearly indicate any remaining ECTS needed to fulfill program requirements, including checks for mandatory courses. 

3. Leveraging Generative AI, the application offers intelligent support. Students can ask natural language questions about the program structure, specific courses, or prerequisites and receive contextually relevant answers grounded in the official program data. Furthermore, the AI can suggest relevant elective courses based on a student's stated interests or even by analyzing an job description. It can also provide on-demand comparisons between two courses, highlighting similarities and differences in content and objectives to aid decision-making. 

## Who are the intended users? 

The primary intended users are students enrolled at the Technical University of Munich (TUM). This includes: 

- New students, who need to understand the structure of their program, identify mandatory courses, and plan their initial semesters. 
- Continuing students, who are selecting electives, planning their progress towards graduation, and ensuring they meet all academic requirements. 
- Students exploring specializations, who want to find courses aligned with specific career interests or academic focuses. 

While initially focused on a specific program (like M.Sc. Information Systems), the architecture allows for potential expansion to other TUM programs. 

## How will you integrate GenAI meaningfully? 

GenAI integration is a core component designed to provide tangible value, primarily through Retrieval-Augmented Generation (RAG) to ensure accuracy and relevance: 

- **Contextual Q&A**: Instead of manually searching through lengthy PDF documents or complex websites, students can ask direct questions like, "What are the prerequisites for 'Advanced Deep Learning'?" or "Summarize the 'Databases' module." The GenAI (LangChain with an LLM connected to a Weaviate vector database) will retrieve the most relevant information from the indexed program data and synthesize a concise answer. 

- **Personalized Course Recommendations**: Students can input their academic or career interests (e.g., "I'm interested in cybersecurity and distributed systems") or a job description. The GenAI will analyze this input against the descriptions of available elective courses, using semantic understanding to suggest relevant options, complete with justifications. This helps students discover courses they might otherwise overlook. 

- **Intelligent Course Comparison**: When faced with choosing between two courses, students can request an AI-driven comparison. The GenAI will analyze the content, objectives, and prerequisites of both courses and provide a structured summary of their similarities and differences, aiding informed decision-making. 

## Describe some scenarios how your app will function: 

### Scenario 1: New Student Onboarding 

Anna, a new M.Sc. Information Systems student, logs in. She selects her program. The app displays the overall structure: mandatory modules, elective categories, and total ECTS. She clicks on "Foundations of Algorithms" module, sees the courses within, and their ECTS. She adds "Introduction to Deep Learning" and "Advanced Algorithms" to her first-semester plan. The plan view shows "5/5 ECTS completed for Algorithms" and "Total ECTS: 10/120". She then types into the AI chat: "What programming languages are mainly used in the 'Introduction to C++' course"? and gets a direct answer. 

### Scenario 2: Elective Selection for Specialization 

Ben is in his second year and wants to specialize in AI. He navigates to the AI Advisor section and types, "I am interested in natural language processing and machine learning ethics." The AI, using RAG against elective course descriptions, suggests "Advanced NLP", "Ethics in AI", and "Reinforcement Learning", providing brief reasons why each is relevant. Ben clicks on "Advanced NLP" to see its details and adds it to his plan. 

### Scenario 3: Choosing Between Two Advanced Courses 

David is unsure whether to take "Distributed Systems" or "Cloud Computing". He uses the "Compare Courses" feature, selecting both. The AI returns a side-by-side summary: "Distributed Systems focuses more on foundational algorithms and consistency models, while Cloud Computing emphasizes practical platform usage and service-oriented architectures. Both cover scalability, but DS has a stronger theoretical prerequisite.". This helps David pick the one better aligned with his current goals. 
