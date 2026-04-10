# DevFlow

A modern, full-stack community-driven platform for developers. Designed to help users ask questions, share knowledge, and discover new opportunities.

DevFlow is akin to platforms like StackOverflow, offering a comprehensive suite of features to ensure a seamless QA experience with modern design, AI integrations, and real-time community engagement features.

## 🚀 Features

- **Ask & Answer Questions:** Create detailed programming questions and provide answers.
- **Rich Text Editing:** Integrated with MDX-powered editor to write code blocks, format text, and add links seamlessly.
- **AI-Powered Assistance:** Integrated with Google's Gemini AI to auto-generate answers or provide hints via `@ai-sdk/google`.
- **Voting System:** Upvote or downvote questions and answers to highlight the most useful content.
- **Robust Search & Filtering:** Global and local search mechanisms spanning the entire platform (questions, users, tags) combined with dynamic URL-based filtering.
- **Tagging & Collections:** Organize content with tags, and save interesting questions to your personal collection.
- **Developer Profiles:** Dedicated user profiles displaying metrics, badges, top interactions, and historical activity.
- **Job Board:** Explore developer jobs through integrated third-party API fetching.
- **Authentication:** Secure credential and social login (OAuth) handled by Auth.js (NextAuth).
- **Responsive & Accessible Design:** A mobile-first UI using Tailwind CSS v4, perfectly optimized across devices with Light and Dark mode options.

## 🛠 Tech Stack

**Frontend:**

- [Next.js (v16 App Router)](https://nextjs.org/) - React framework
- [React 19](https://react.dev/) - UI Library
- [Tailwind CSS v4](https://tailwindcss.com) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components built with Radix UI and Tailwind CSS
- [MDXEditor](https://mdxeditor.dev/) - Rich text editing

**Backend & Database:**

- Next.js API Routes (Server Actions)
- [MongoDB](https://www.mongodb.com/) - NoSQL Database
- [Mongoose](https://mongoosejs.com/) - Object Data Modeling (ODM)
- [Auth.js (NextAuth)](https://next-auth.js.org/) - Authentication layer

**Tools & Others:**

- [AI SDK](https://sdk.vercel.ai/) (Google integration)
- TypeScript for type safety
- ESLint for linting
- Zod / React Hook Form for form validation

## ⚙️ Installation & Setup

Follow these steps to set up the project locally.

1. **Clone the repository**

```bash
git clone https://github.com/your-username/devflow.git
cd devflow
```

2. **Install dependencies**

Ensure you have Node.js 20+ installed.

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Environment Setup**

Create a `.env.local` file in the root directory and add the necessary environment variables. You can find reference below:

```env
# Database
MONGODB_URL=your_mongodb_connection_string

# Authentication
AUTH_SECRET=your_nextauth_secret
GITHUB_CLIENT_ID=your_github_id
GITHUB_CLIENT_SECRET=your_github_secret
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret

# AI Integration
GOOGLE_API_KEY=your_gemini_api_key

# Additional Services (e.g. Job API)
# RAPID_API_KEY=your_api_key
```

4. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

```text
devflow/
├── app/                  # Next.js App Router (pages, layouts, api, (root), (auth))
├── components/           # Reusable UI components (forms, cards, filters, search, editors)
├── constants/            # Application-wide constants & config
├── context/              # React Context providers (Theme, etc)
├── database/             # Mongoose schemas/models (User, Question, Answer, Vote, etc)
├── lib/                  # Helper functions, DB connection, API utilities, server actions
├── public/               # Static assets (images, icons)
└── types/                # Global TypeScript declarations and interfaces
```
