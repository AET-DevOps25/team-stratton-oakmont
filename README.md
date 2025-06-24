# 📱 TUM Study Planer powered by Stratton Oakmont

## 🚀 Getting Started

> _Instructions to run the app locally._

How to start the frontend:

```bash
# start frontend (localhost:80)
cd client
npm install
npm run dev
```

How to start the server:

```bash
# start program-catalog-service (localhost:8080)
cd server
./gradlew :program-catalog-service:bootRun
```

New terminal window:

```bash
# start study-plan-service (localhost:8081)
cd server
./gradlew :study-plan-service:bootRun
```

New terminal window:

```bash
# start ai-advisor-service (localhost:8082)
cd server
./gradlew :ai-advisor-service:bootRun
```

New terminal window:

```bash
# start user-auth-service (localhost:8083)
cd server
./gradlew :user-auth-service:bootRun
```

> _Instructions to run with docker._

```bash
cd team-stratton-oakmont
#Build images locally with docker compose
docker compose build

#Run the apps with docker compose
docker compose up -d

#Stop the containers and remove the images
docker compose down
```

## 🧩 Main Functionality

> What is the core purpose of this app?  
> _Describe the key features and the problem it solves._

## 🎯 Intended Users

> Who will use this app?  
> _Define the target audience and their needs._

## 🤖 Integration of GenAI

> How is Generative AI integrated meaningfully?  
> _Explain the role of GenAI in enhancing user experience or solving problems._

## 💡 Example Scenarios

> How does the app work in real-world use cases?  
> _List 2–3 example scenarios or workflows to demonstrate functionality._

## 🛠 Tech Stack

_List key technologies and frameworks used._

- Frontend: React + Vite
- Backend: Springboot (Gradle Groovy)
- GenAI API:

## 📄 License

_MIT, Apache 2.0, etc._
"""
