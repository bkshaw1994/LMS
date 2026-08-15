require('dotenv').config();
const mongoose = require('mongoose');
const CourseModule = require('./models/CourseModule');

const curriculumSeedData = [
  {
    weekNumber: 1,
    title: 'Vanilla JS Fundamentals',
    description: 'Master JavaScript core concepts including scope, data types, DOM manipulation, and modern ES6+ syntax.',
    category: 'Vanilla JS',
    lessons: [
      { title: 'Variables, Scope & Data Types', videoUrl: 'https://www.youtube.com/embed/W6NZfCO5SIk', duration: '45 mins' },
      { title: 'Functions, Arrow Functions & Scope Chain', videoUrl: 'https://www.youtube.com/embed/ggt4Z5rATC8', duration: '50 mins' },
      { title: 'DOM Manipulation & Event Listeners', videoUrl: 'https://www.youtube.com/embed/y17RuWkWdn8', duration: '60 mins' },
      { title: 'ES6+ Features: Destructuring, Spread/Rest & Modules', videoUrl: 'https://www.youtube.com/embed/NCwa_xi0Uuc', duration: '40 mins' },
    ],
    assignment: {
      title: 'Interactive DOM Task Manager & Tip Calculator App',
      description: 'Build a responsive Task Manager web application using Vanilla JS, DOM manipulation, event listeners, and LocalStorage for state persistence.',
      requirements: [
        'Implement add, edit, mark complete, and delete task functionality using vanilla DOM methods.',
        'Persist task items in browser localStorage so data survives page refresh.',
        'Use ES6+ array methods (map, filter, reduce) to display task metrics (Active vs Completed).',
        'Push code to a public GitHub repository with a clean README.md documentation.',
      ],
      starterRepoUrl: 'https://github.com/fullstack-bootcamp/week1-vanilla-js-starter',
      starterFileName: 'index.js',
      starterCode: `// Week 1 Starter Template: Task Manager & Tip Calculator App
// Document Object Model (DOM) Event Handling

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Week 1 App Initialized");

  const taskForm = document.getElementById("task-form");
  const taskInput = document.getElementById("task-input");
  const taskList = document.getElementById("task-list");

  // Load saved tasks from LocalStorage
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  function renderTasks() {
    taskList.innerHTML = "";
    tasks.forEach((task, index) => {
      const li = document.createElement("li");
      li.className = "task-item";
      li.innerHTML = \`
        <span class="\${task.completed ? 'done' : ''}">\${task.title}</span>
        <button onclick="toggleTask(\${index})">✓</button>
        <button onclick="deleteTask(\${index})">✕</button>
      \`;
      taskList.appendChild(li);
    });
  }

  // TODO: Implement addTask, toggleTask, and deleteTask handlers below
  renderTasks();
});`,
      points: 100,
    },
    quiz: {
      title: 'Week 1 Assessment: Vanilla JS & DOM Debugging',
      passingScore: 70,
      questions: [
        {
          id: 'w1_q1',
          type: 'mcq',
          question: 'Which keyword in JavaScript declares a block-scoped variable that cannot be reassigned?',
          codeSnippet: '',
          options: ['var', 'let', 'const', 'global'],
          correctAnswer: 2,
          explanation: 'const creates a block-scoped read-only reference to a value and cannot be reassigned.',
        },
        {
          id: 'w1_q2',
          type: 'code_debug',
          question: 'Fix the Code Bug: Why does this event listener throw "TypeError: Cannot read properties of null"?',
          codeSnippet: 'const btn = document.querySelector("#submit-btn");\nbtn.addEventListener("click", () => {\n  console.log("Clicked!");\n});',
          options: [
            'The script is executing before the DOM HTML element "#submit-btn" is parsed. Add defer attribute or DOMContentLoaded listener.',
            'addEventListener method is misspelled.',
            'Arrow function syntax is invalid inside addEventListener.',
            'querySelector requires document.getElementById instead.'
          ],
          correctAnswer: 0,
          explanation: 'If the script tag runs before the DOM element is rendered, document.querySelector returns null, causing a TypeError when accessing addEventListener.',
        },
        {
          id: 'w1_q3',
          type: 'mcq',
          question: 'What will be printed to the console: console.log(typeof NaN)?',
          codeSnippet: '',
          options: ['"number"', '"undefined"', '"NaN"', '"object"'],
          correctAnswer: 0,
          explanation: 'In JavaScript, NaN (Not-a-Number) is technically a numeric type representing an unrepresentable value.',
        },
        {
          id: 'w1_q4',
          type: 'code_debug',
          question: 'Fix the Code Bug: Why does this array loop print "4, 4, 4, 4" instead of "0, 1, 2, 3"?',
          codeSnippet: 'for (var i = 0; i < 4; i++) {\n  setTimeout(() => console.log(i), 100);\n}',
          options: [
            'var is function-scoped so all callbacks reference the final value of i (4). Change var i to let i.',
            'setTimeout delay 100ms is too small.',
            'console.log cannot accept outer scope variables.',
            'The loop condition should be i <= 4.'
          ],
          correctAnswer: 0,
          explanation: 'Using let creates a fresh binding for i in each loop iteration, preserving the value for each async callback.',
        },
      ],
    },
  },
  {
    weekNumber: 2,
    title: 'Advanced JavaScript & Async Programming',
    description: 'Deep dive into JavaScript runtime, Event Loop, Closures, Callbacks, Promises, and Async/Await.',
    category: 'Vanilla JS',
    lessons: [
      { title: 'Execution Context & Closures', videoUrl: 'https://www.youtube.com/embed/3a0I8ICR1Vg', duration: '55 mins' },
      { title: 'Asynchronous JS & The Event Loop', videoUrl: 'https://www.youtube.com/embed/8aGhZQkoFbQ', duration: '65 mins' },
      { title: 'Promises & Chaining', videoUrl: 'https://www.youtube.com/embed/DHvZLI7aU3c', duration: '45 mins' },
      { title: 'Async/Await & Error Handling with Fetch API', videoUrl: 'https://www.youtube.com/embed/V_Kr9OSfDeU', duration: '50 mins' },
    ],
    assignment: {
      title: 'Async Public API Weather & Crypto Dashboard',
      description: 'Build an asynchronous API dashboard using Fetch API, Async/Await, try/catch error handling, and Promise.all for parallel data fetching.',
      requirements: [
        'Fetch weather data from OpenWeather API and crypto rates from CoinGecko API in parallel using Promise.all.',
        'Implement robust loading spinner states and user-friendly error banners when API calls fail.',
        'Use custom JavaScript closures to implement a debounced search input field.',
        'Publish your codebase on GitHub with clean commits.',
      ],
      starterRepoUrl: 'https://github.com/fullstack-bootcamp/week2-async-js-starter',
      starterFileName: 'api.js',
      starterCode: `// Week 2 Starter Template: Async Weather & Crypto Dashboard
// Fetch API & Promise.all implementation

async function fetchDashboardData(city, coinId) {
  const weatherUrl = \`https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true\`;
  const cryptoUrl = \`https://api.coingecko.com/api/v3/simple/price?ids=\${coinId}&vs_currencies=usd\`;

  try {
    // TODO: Use Promise.all to fetch both endpoints in parallel
    const [weatherRes, cryptoRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(cryptoUrl)
    ]);

    if (!weatherRes.ok || !cryptoRes.ok) {
      throw new Error("Failed to fetch dashboard metrics");
    }

    const weatherData = await weatherRes.json();
    const cryptoData = await cryptoRes.json();

    return { weatherData, cryptoData };
  } catch (error) {
    console.error("Dashboard error:", error.message);
    throw error;
  }
}`,
      points: 100,
    },
    quiz: {
      title: 'Week 2 Assessment: Promises, Async/Await & Event Loop',
      passingScore: 70,
      questions: [
        {
          id: 'w2_q1',
          type: 'mcq',
          question: 'In which order are Microtasks (Promises) executed relative to Macrotasks (setTimeout)?',
          codeSnippet: '',
          options: [
            'Microtask queue has higher priority and executes completely before the next Macrotask.',
            'Macrotask queue always executes before Microtasks.',
            'They are executed randomly based on CPU availability.',
            'Microtasks execute only after page reload.'
          ],
          correctAnswer: 0,
          explanation: 'The JavaScript Event Loop processes all microtasks (Promise.then callbacks) before taking the next macrotask (setTimeout).',
        },
        {
          id: 'w2_q2',
          type: 'code_debug',
          question: 'Fix the Code Bug: What is missing in this async function to handle network failures gracefully?',
          codeSnippet: 'async function fetchUser() {\n  const res = await fetch("https://api.example.com/user");\n  const data = await res.json();\n  return data;\n}',
          options: [
            'Wrap the fetch call in a try/catch block and check if res.ok is true.',
            'Change async keyword to function*.',
            'Replace await with .then callbacks.',
            'Pass a callback function to fetchUser.'
          ],
          correctAnswer: 0,
          explanation: 'fetch() does not reject on HTTP 404/500 errors. You must check res.ok and wrap in try/catch to catch network errors.',
        },
        {
          id: 'w2_q3',
          type: 'mcq',
          question: 'What is a JavaScript Closure?',
          codeSnippet: '',
          options: [
            'A function bundled together with references to its surrounding lexical environment.',
            'A method that terminates an HTML window.',
            'A special CSS selector for hidden elements.',
            'A database query string.'
          ],
          correctAnswer: 0,
          explanation: 'A closure gives an inner function access to an outer function’s scope even after the outer function has returned.',
        },
        {
          id: 'w2_q4',
          type: 'code_debug',
          question: 'Fix the Code Bug: Why does Promise.all reject when one request fails?',
          codeSnippet: 'const results = await Promise.all([req1, req2, req3]);',
          options: [
            'Promise.all fail-fast behavior rejects immediately if any promise rejects. Use Promise.allSettled for independent results.',
            'Promise.all cannot accept an array of promises.',
            'req1 must be called inside a for loop.',
            'await should be placed inside the array.'
          ],
          correctAnswer: 0,
          explanation: 'Promise.all rejects as soon as one promise rejects. Use Promise.allSettled if you want all outcomes regardless of individual failures.',
        },
      ],
    },
  },
  {
    weekNumber: 3,
    title: 'React Fundamentals',
    description: 'Build component-driven user interfaces using React, JSX, Props, State, and Core Hooks.',
    category: 'React',
    lessons: [
      { title: 'Introduction to React & JSX Architecture', videoUrl: 'https://www.youtube.com/embed/bMknfKXIFA8', duration: '50 mins' },
      { title: 'Components, Props & Composition', videoUrl: 'https://www.youtube.com/embed/SqcY0GlETPk', duration: '45 mins' },
      { title: 'Managing State with useState Hook', videoUrl: 'https://www.youtube.com/embed/O6P86uwfdR0', duration: '55 mins' },
      { title: 'Handling Side Effects with useEffect', videoUrl: 'https://www.youtube.com/embed/0ZJgOiRWLWA', duration: '60 mins' },
    ],
    assignment: {
      title: 'Interactive E-Commerce Product Catalog App',
      description: 'Create a component-driven React application featuring product search filtering, category tabs, and an interactive shopping cart with live price calculations.',
      requirements: [
        'Decompose UI into modular React components (ProductCard, CartDrawer, SearchBar, CategoryFilter).',
        'Manage cart state using useState hook and pass updater functions down via props.',
        'Fetch product items from a mock JSON endpoint using useEffect hook on component mount.',
        'Submit your React application code to GitHub.',
      ],
      starterRepoUrl: 'https://github.com/fullstack-bootcamp/week3-react-fundamentals-starter',
      starterFileName: 'App.jsx',
      starterCode: `import React, { useState, useEffect } from 'react';

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // TODO: Fetch products from endpoint
    setProducts([
      { id: 1, name: 'Wireless Headphones', price: 99.99, category: 'Electronics' },
      { id: 2, name: 'Ergonomic Keyboard', price: 149.50, category: 'Electronics' },
    ]);
  }, []);

  const addToCart = (product) => {
    setCart(prev => [...prev, product]);
  };

  return (
    <div className="container">
      <h1>🛍️ E-Commerce React Store</h1>
      {/* TODO: Add SearchBar and ProductGrid components */}
    </div>
  );
}`,
      points: 100,
    },
    quiz: {
      title: 'Week 3 Assessment: React Components, Props & Hooks',
      passingScore: 70,
      questions: [
        {
          id: 'w3_q1',
          type: 'mcq',
          question: 'Why should React state NEVER be mutated directly (e.g. state.count = 5)?',
          codeSnippet: '',
          options: [
            'Direct state mutation bypasses React reconciliation and will not trigger a component re-render.',
            'React will crash immediately with a compiler error.',
            'JavaScript forbids changing object properties.',
            'Props will be automatically deleted.'
          ],
          correctAnswer: 0,
          explanation: 'React relies on immutable state checks to know when to re-render components. Always use setter functions like setCount(5).',
        },
        {
          id: 'w3_q2',
          type: 'code_debug',
          question: 'Fix the Code Bug: Why does this useEffect run in an infinite render loop?',
          codeSnippet: 'useEffect(() => {\n  setItems(prev => [...prev, newObj]);\n});',
          options: [
            'Missing dependency array. Add [] as second argument so effect runs only on mount.',
            'setItems cannot be called inside useEffect.',
            'useEffect requires an async arrow function.',
            'newObj is not defined.'
          ],
          correctAnswer: 0,
          explanation: 'Omitting the dependency array causes useEffect to run after every single render. Calling setState inside causes an infinite loop.',
        },
        {
          id: 'w3_q3',
          type: 'mcq',
          question: 'What is the purpose of the key prop when rendering lists in React?',
          codeSnippet: '',
          options: [
            'It helps React identify which items have changed, been added, or removed for efficient Virtual DOM diffing.',
            'It applies CSS styles to list items.',
            'It encrypts component props.',
            'It binds database primary keys automatically.'
          ],
          correctAnswer: 0,
          explanation: 'Keys give elements a stable identity across renders so React re-uses existing DOM nodes efficiently.',
        },
        {
          id: 'w3_q4',
          type: 'code_debug',
          question: 'Fix the Code Bug: Why does this component fail to update state correctly when clicked rapidly?',
          codeSnippet: 'const handleClick = () => {\n  setCount(count + 1);\n  setCount(count + 1);\n};',
          options: [
            'Use functional state update setCount(prev => prev + 1) because state updates are batched asynchronously.',
            'count variable must be defined with var.',
            'handleClick cannot call setCount twice.',
            'React prohibits multiple state updates.'
          ],
          correctAnswer: 0,
          explanation: 'Stale closure values in batched updates cause count + 1 to use the old snapshot. Functional updates ensure previous state is passed.',
        },
      ],
    },
  },
  {
    weekNumber: 4,
    title: 'Advanced React & Architecture',
    description: 'Manage global application state using Context API, custom hooks, and optimize rendering performance.',
    category: 'React',
    lessons: [
      { title: 'Global State with React Context API', videoUrl: 'https://www.youtube.com/embed/5LrDIWkK_h8', duration: '55 mins' },
      { title: 'Creating Reusable Custom Hooks', videoUrl: 'https://www.youtube.com/embed/6ThXsUwLWvc', duration: '50 mins' },
      { title: 'Performance Optimization: useMemo, useCallback & React.memo', videoUrl: 'https://www.youtube.com/embed/vpE9I_1xUTc', duration: '60 mins' },
      { title: 'Form Management & Controlled Components', videoUrl: 'https://www.youtube.com/embed/IkMND33x0qQ', duration: '45 mins' },
    ],
    assignment: {
      title: 'Global Auth & Dark Theme Portal with Context API',
      description: 'Build an advanced React application utilizing React Context API for global theme switching and user authentication state management.',
      requirements: [
        'Create a ThemeContext providing light/dark mode state and toggle methods across app hierarchy.',
        'Create an AuthContext providing user login, logout, and token persistence.',
        'Build a custom hook useLocalStorage to sync state to browser storage.',
        'Submit repository link to GitHub.',
      ],
      starterRepoUrl: 'https://github.com/fullstack-bootcamp/week4-advanced-react-starter',
      starterFileName: 'ThemeContext.jsx',
      starterCode: `import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme}>{children}</div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);`,
      points: 100,
    },
    quiz: {
      title: 'Week 4 Assessment: Context API, Custom Hooks & Optimization',
      passingScore: 70,
      questions: [
        {
          id: 'w4_q1',
          type: 'mcq',
          question: 'When should you use useCallback hook in React?',
          codeSnippet: '',
          options: [
            'To memoize callback functions passed to optimized child components to prevent unnecessary re-renders.',
            'To fetch data from backend REST APIs.',
            'To replace useState hook entirely.',
            'To execute synchronous database operations.'
          ],
          correctAnswer: 0,
          explanation: 'useCallback returns a memoized version of the callback that only changes if dependency values change.',
        },
        {
          id: 'w4_q2',
          type: 'code_debug',
          question: 'Fix the Code Bug: Custom hook useFetch throws "Invalid Hook Call" error. Why?',
          codeSnippet: 'function handleClick() {\n  const { data } = useFetch("https://api.com");\n}',
          options: [
            'React Hooks can only be called at the top level of a component or custom hook, never inside event handlers or loops.',
            'useFetch must be renamed to fetchCustom.',
            'useFetch requires an async keyword.',
            'Custom hooks are not supported in React 18.'
          ],
          correctAnswer: 0,
          explanation: 'Rules of Hooks require calling hooks at the top level. Calling hooks inside click handlers breaks React hook ordering.',
        },
        {
          id: 'w4_q3',
          type: 'mcq',
          question: 'What happens when a Context Provider value object changes?',
          codeSnippet: '',
          options: [
            'All consumer components consuming that Context will re-render.',
            'Only the top-level App component re-renders.',
            'React stops rendering until page refresh.',
            'The Context value is deleted.'
          ],
          correctAnswer: 0,
          explanation: 'Every component calling useContext(MyContext) will re-render whenever the Provider value changes.',
        },
        {
          id: 'w4_q4',
          type: 'code_debug',
          question: 'Fix the Code Bug: Expensive calculation runs on every render despite useMemo. Why?',
          codeSnippet: 'const result = useMemo(() => compute(val), [obj]);',
          options: [
            'If obj is an unmemoized object created inline in render, its reference changes every render, invalidating useMemo.',
            'useMemo cannot take an array as second argument.',
            'compute function must return a promise.',
            'useMemo requires useEffect.'
          ],
          correctAnswer: 0,
          explanation: 'In JavaScript object references change on every render. Pass primitive values or memoized object references to dependency arrays.',
        },
      ],
    },
  },
  {
    weekNumber: 5,
    title: 'Next.js App Router Architecture',
    description: 'Learn modern full-stack web development with Next.js App Router, Server Components, and Layouts.',
    category: 'Next.js',
    lessons: [
      { title: 'Next.js Overview & App Router File Conventions', videoUrl: 'https://www.youtube.com/embed/ZVnjOPwW4ZA', duration: '50 mins' },
      { title: 'Server Components vs Client Components', videoUrl: 'https://www.youtube.com/embed/vwSlYG7h3DU', duration: '55 mins' },
      { title: 'Dynamic Routing & Nested Layouts', videoUrl: 'https://www.youtube.com/embed/R59e1Vl5lCA', duration: '45 mins' },
      { title: 'SEO Optimization, Metadata API & Fonts', videoUrl: 'https://www.youtube.com/embed/843nec-IvW0', duration: '40 mins' },
    ],
    assignment: {
      title: 'Full-Stack Next.js Multi-Page Blog & Portfolio',
      description: 'Build a multi-page web application using Next.js 14 App Router, nested layouts, Server Components, dynamic route handlers, and Metadata API.',
      requirements: [
        'Organize app/ folder using layout.js, page.js, and loading.js conventions.',
        'Implement dynamic route pages under app/blog/[slug]/page.js for reading blog posts.',
        'Export dynamic metadata using generateMetadata() function for SEO optimization.',
        'Push code to GitHub repository.',
      ],
      starterRepoUrl: 'https://github.com/fullstack-bootcamp/week5-nextjs-app-router-starter',
      starterFileName: 'app/blog/[slug]/page.js',
      starterCode: `// Next.js 14 App Router Dynamic Route Component

export async function generateMetadata({ params }) {
  return {
    title: \`Blog Post: \${params.slug}\`,
    description: \`Read our latest full-stack insights on \${params.slug}\`,
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = params;

  return (
    <article className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-extrabold capitalize">{slug.replace('-', ' ')}</h1>
      <p className="text-gray-600 mt-2">Published on Next.js Server Components</p>
      {/* TODO: Add blog post content */}
    </article>
  );
}`,
      points: 100,
    },
    quiz: {
      title: 'Week 5 Assessment: Next.js App Router & Server Components',
      passingScore: 70,
      questions: [
        {
          id: 'w5_q1',
          type: 'mcq',
          question: 'By default, what type are components inside the Next.js app/ directory?',
          codeSnippet: '',
          options: [
            'React Server Components (RSC)',
            'Client Components',
            'Redux Reducers',
            'Express Middleware'
          ],
          correctAnswer: 0,
          explanation: 'Next.js App Router components default to React Server Components unless marked with "use client".',
        },
        {
          id: 'w5_q2',
          type: 'code_debug',
          question: 'Fix the Code Bug: Next.js build fails with "useState can only be used in Client Component". Why?',
          codeSnippet: '// app/counter/page.js\nimport { useState } from "react";\nexport default function Counter() {\n  const [c, setC] = useState(0);\n  return <button onClick={() => setC(c+1)}>{c}</button>;\n}',
          options: [
            'Add the "use client" directive at the very top line of the file.',
            'Import useState from "next/state".',
            'Convert button element to div.',
            'Remove useState and use global var.'
          ],
          correctAnswer: 0,
          explanation: 'Stateful hooks (useState, useEffect) require Client Component environment. Add "use client"; at top.',
        },
        {
          id: 'w5_q3',
          type: 'mcq',
          question: 'What is the role of layout.js in Next.js App Router?',
          codeSnippet: '',
          options: [
            'To define shared UI across multiple pages that preserves state and does not re-render on navigation.',
            'To write backend database connections.',
            'To compile Tailwind CSS files.',
            'To handle user authentication tokens.'
          ],
          correctAnswer: 0,
          explanation: 'Layouts encapsulate shared subtrees (headers, footers, sidebars) and preserve state across route changes.',
        },
        {
          id: 'w5_q4',
          type: 'code_debug',
          question: 'Fix the Code Bug: How do you extract params in dynamic route app/posts/[id]/page.js?',
          codeSnippet: 'export default function PostPage(props) {\n  return <h1>Post ID: {props.id}</h1>;\n}',
          options: [
            'Access params.id from props: export default function PostPage({ params }) { return <h1>{params.id}</h1>; }',
            'Import useRouter from "next/router".',
            'Call getStaticProps.',
            'Use window.location.pathname.'
          ],
          correctAnswer: 0,
          explanation: 'Next.js App Router page components receive params object as a prop containing dynamic segment values.',
        },
      ],
    },
  },
  {
    weekNumber: 6,
    title: 'Next.js Data Fetching & Server Actions',
    description: 'Master server-side rendering (SSR), static generation (SSG), caching, and Next.js Server Actions.',
    category: 'Next.js',
    lessons: [
      { title: 'Data Fetching & Caching Strategies in Next.js', videoUrl: 'https://www.youtube.com/embed/gSSsZReIFRk', duration: '55 mins' },
      { title: 'Server Actions & Form Mutating', videoUrl: 'https://www.youtube.com/embed/dDpZfOQBMaU', duration: '60 mins' },
      { title: 'Route Handlers (API Routes in App Router)', videoUrl: 'https://www.youtube.com/embed/O-A8R_R-Dmg', duration: '50 mins' },
      { title: 'Middleware & Route Protection', videoUrl: 'https://www.youtube.com/embed/1v_4v817m3I', duration: '45 mins' },
    ],
    assignment: {
      title: 'Full-Stack Next.js Feedback Board with Server Actions',
      description: 'Build a data-driven web app leveraging Next.js Server Actions for form submissions, revalidatePath for data revalidation, and Route Handlers.',
      requirements: [
        'Create Server Actions in app/actions.js marked with "use server" to handle form posts.',
        'Use revalidatePath("/feedback") to automatically refresh UI after submitting new entries.',
        'Implement route middleware.js to protect authenticated routes.',
        'Push code to GitHub repository.',
      ],
      starterRepoUrl: 'https://github.com/fullstack-bootcamp/week6-nextjs-server-actions-starter',
      starterFileName: 'app/actions.js',
      starterCode: `'use server';

import { revalidatePath } from 'next/cache';

export async function addFeedback(formData) {
  const author = formData.get('author');
  const comment = formData.get('comment');

  console.log('Server Action received:', { author, comment });

  // TODO: Save feedback to database
  revalidatePath('/feedback');
}`,
      points: 100,
    },
    quiz: {
      title: 'Week 6 Assessment: Server Actions & Data Fetching',
      passingScore: 70,
      questions: [
        {
          id: 'w6_q1',
          type: 'mcq',
          question: 'What directive declares a Next.js Server Action?',
          codeSnippet: '',
          options: ['"use server"', '"use action"', '"server-only"', '"async server"'],
          correctAnswer: 0,
          explanation: '"use server" at top of file or function marks it as a Server Action that can be called from client or server.',
        },
        {
          id: 'w6_q2',
          type: 'code_debug',
          question: 'Fix the Code Bug: Data updated on server does not reflect on page until manual browser reload. Why?',
          codeSnippet: 'async function addComment(formData) {\n  "use server";\n  await db.comments.insert(formData.get("comment"));\n}',
          options: [
            'Call revalidatePath("/comments") or revalidateTag() inside the Server Action to purge cache and re-render.',
            'Add window.location.reload() inside Server Action.',
            'Change form method to GET.',
            'Import fetch from node-fetch.'
          ],
          correctAnswer: 0,
          explanation: 'revalidatePath purges cached data for specific routes, causing Next.js to fetch fresh data on submission.',
        },
        {
          id: 'w6_q3',
          type: 'mcq',
          question: 'What file convention defines custom API endpoints in Next.js App Router?',
          codeSnippet: '',
          options: ['app/api/[route]/route.js', 'pages/api.js', 'server/api.js', 'routes/handler.js'],
          correctAnswer: 0,
          explanation: 'Route Handlers are defined using route.js files inside the app/ directory.',
        },
        {
          id: 'w6_q4',
          type: 'code_debug',
          question: 'Fix the Code Bug: How do you return JSON response in App Router route.js?',
          codeSnippet: 'export async function GET() {\n  return { message: "Hello" };\n}',
          options: [
            'Return NextResponse.json({ message: "Hello" }) or Response.json().',
            'res.send({ message: "Hello" }).',
            'res.status(200).json().',
            'return JSON.stringify().'
          ],
          correctAnswer: 0,
          explanation: 'Route Handlers use standard Web Response objects or NextResponse.json() helper.',
        },
      ],
    },
  },
  {
    weekNumber: 7,
    title: 'Node.js & Express Fundamentals',
    description: 'Build backend servers with Node.js runtime, Express framework, HTTP protocol, and middleware architecture.',
    category: 'Node.js',
    lessons: [
      { title: 'Node.js Architecture & Event Loop', videoUrl: 'https://www.youtube.com/embed/fBNz5xF-Kx4', duration: '45 mins' },
      { title: 'Creating HTTP Servers with Express.js', videoUrl: 'https://www.youtube.com/embed/L72fhGm1tfE', duration: '50 mins' },
      { title: 'Express Middleware Pattern & Request Processing', videoUrl: 'https://www.youtube.com/embed/lY6icfhap2s', duration: '55 mins' },
      { title: 'Environment Variables & Application Config', videoUrl: 'https://www.youtube.com/embed/17UVejOw3zA', duration: '40 mins' },
    ],
    assignment: {
      title: 'Express HTTP Server & Custom Logging Middleware',
      description: 'Create a Node.js Express backend server with custom request logging middleware, CORS configuration, and HTTP status handling.',
      requirements: [
        'Initialize Express application listening on configurable PORT from .env file.',
        'Create custom middleware logging request method, URL, and timestamp to console.',
        'Implement JSON body parsing middleware (express.json()).',
        'Upload repository code to GitHub.',
      ],
      starterRepoUrl: 'https://github.com/fullstack-bootcamp/week7-express-fundamentals-starter',
      starterFileName: 'server.js',
      starterCode: `const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Custom Logging Middleware
app.use((req, res, next) => {
  console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.url}\`);
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Express Server Running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server started on port \${PORT}\`));`,
      points: 100,
    },
    quiz: {
      title: 'Week 7 Assessment: Node.js Architecture & Express',
      passingScore: 70,
      questions: [
        {
          id: 'w7_q1',
          type: 'mcq',
          question: 'What is Express Middleware in Node.js?',
          codeSnippet: '',
          options: [
            'A function with access to req, res, and next that executes during the request-response lifecycle.',
            'A database query tool.',
            'A front-end CSS framework.',
            'A browser plugin.'
          ],
          correctAnswer: 0,
          explanation: 'Middleware functions execute sequentially in Express to modify request/response or end request cycles.',
        },
        {
          id: 'w7_q2',
          type: 'code_debug',
          question: 'Fix the Code Bug: Express route hangs indefinitely without sending response. Why?',
          codeSnippet: 'app.use((req, res, next) => {\n  console.log("Request received!");\n});',
          options: [
            'Middleware must call next() to pass control to next handler or return a response (e.g. res.send()).',
            'app.use requires an HTTP method like app.get.',
            'console.log blocks the main thread.',
            'Express requires TypeScript.'
          ],
          correctAnswer: 0,
          explanation: 'If a middleware does not call next() or send a response, the request hangs until timeout.',
        },
        {
          id: 'w7_q3',
          type: 'mcq',
          question: 'What built-in module in Node.js handles environment variables?',
          codeSnippet: '',
          options: ['process.env', 'node.env', 'sys.config', 'env.get'],
          correctAnswer: 0,
          explanation: 'process.env is a global object in Node.js storing environment variables.',
        },
        {
          id: 'w7_q4',
          type: 'code_debug',
          question: 'Fix the Code Bug: req.body is undefined in POST route. Why?',
          codeSnippet: 'app.post("/api/users", (req, res) => {\n  console.log(req.body.name);\n});',
          options: [
            'Add app.use(express.json()) before route definitions to parse incoming JSON payloads.',
            'Change POST to GET.',
            'Use req.query instead of req.body.',
            'req.body is deprecated.'
          ],
          correctAnswer: 0,
          explanation: 'Express requires body-parsing middleware like express.json() to populate req.body.',
        },
      ],
    },
  },
  {
    weekNumber: 8,
    title: 'RESTful API Design & Error Handling',
    description: 'Design production-ready RESTful APIs with Express controllers, input validation, and centralized error handling.',
    category: 'Node.js',
    lessons: [
      { title: 'REST Architecture Principles & Resource Naming', videoUrl: 'https://www.youtube.com/embed/7H_Xuu8iPjY', duration: '50 mins' },
      { title: 'Structuring Express Controllers & Services', videoUrl: 'https://www.youtube.com/embed/pKd0Rpw7O48', duration: '55 mins' },
      { title: 'Request Payload Validation & Sanitization', videoUrl: 'https://www.youtube.com/embed/2d2H1_sA2yE', duration: '45 mins' },
      { title: 'Centralized Error Handling Middleware', videoUrl: 'https://www.youtube.com/embed/DyqVqypl6fY', duration: '45 mins' },
    ],
    assignment: {
      title: 'RESTful Student Management API Service',
      description: 'Design a RESTful Express API for student resources featuring full CRUD endpoints, input validation, and centralized error middleware.',
      requirements: [
        'Implement GET /api/students, POST /api/students, PUT /api/students/:id, DELETE /api/students/:id.',
        'Validate input fields (email format, required fields) and return 400 Bad Request on failure.',
        'Implement centralized error handling middleware app.use((err, req, res, next) => ...).',
        'Submit repository to GitHub.',
      ],
      starterRepoUrl: 'https://github.com/fullstack-bootcamp/week8-rest-api-starter',
      starterFileName: 'controllers/studentController.js',
      starterCode: `// RESTful Student Controller Boilerplate

exports.createStudent = async (req, res, next) => {
  try {
    const { name, email, course } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required fields' });
    }

    // TODO: Save student to database
    res.status(201).json({ success: true, data: { name, email, course } });
  } catch (err) {
    next(err); // Pass to centralized error middleware
  }
};`,
      points: 100,
    },
    quiz: {
      title: 'Week 8 Assessment: RESTful Standards & Error Middleware',
      passingScore: 70,
      questions: [
        {
          id: 'w8_q1',
          type: 'mcq',
          question: 'Which HTTP status code should be returned when creating a new resource successfully?',
          codeSnippet: '',
          options: ['201 Created', '200 OK', '204 No Content', '302 Found'],
          correctAnswer: 0,
          explanation: 'HTTP 201 Created indicates that the request succeeded and a new resource was created.',
        },
        {
          id: 'w8_q2',
          type: 'code_debug',
          question: 'Fix the Code Bug: Express error handling middleware is not being triggered. Why?',
          codeSnippet: 'app.use((req, res, next) => {\n  res.status(500).json({ error: "Server Error" });\n});',
          options: [
            'Express error handling middleware MUST have 4 parameters: (err, req, res, next).',
            'Error middleware must be placed above all routes.',
            'Use app.get instead of app.use.',
            'next() must be called with true.'
          ],
          correctAnswer: 0,
          explanation: 'Express identifies error handling middleware specifically by the 4-parameter signature (err, req, res, next).',
        },
        {
          id: 'w8_q3',
          type: 'mcq',
          question: 'What REST HTTP verb should be used to completely replace an existing resource?',
          codeSnippet: '',
          options: ['PUT', 'POST', 'PATCH', 'GET'],
          correctAnswer: 0,
          explanation: 'PUT replaces the entire target resource with request payload. PATCH performs partial updates.',
        },
        {
          id: 'w8_q4',
          type: 'code_debug',
          question: 'Fix the Code Bug: Unhandled async error crashes Express node process. Why?',
          codeSnippet: 'app.get("/api/data", async (req, res) => {\n  const data = await fetchFromDB();\n  res.json(data);\n});',
          options: [
            'Wrap async route logic in try/catch and pass error to next(err).',
            'Remove async keyword.',
            'Return res.json inside setTimeout.',
            'Disable error middleware.'
          ],
          correctAnswer: 0,
          explanation: 'Express 4 does not automatically catch rejected async promises. Always catch async errors and pass to next(err).',
        },
      ],
    },
  },
  {
    weekNumber: 9,
    title: 'MongoDB & Mongoose ODM',
    description: 'Model application data using MongoDB NoSQL database and write queries/aggregations using Mongoose ORM.',
    category: 'MongoDB',
    lessons: [
      { title: 'Document Databases vs Relational Databases', videoUrl: 'https://www.youtube.com/embed/oSIv-E67sHM', duration: '45 mins' },
      { title: 'Mongoose Schemas, Models & Validation', videoUrl: 'https://www.youtube.com/embed/DZBGEExL05o', duration: '55 mins' },
      { title: 'CRUD Operations & Query Operators', videoUrl: 'https://www.youtube.com/embed/c2M-rlkkT5o', duration: '50 mins' },
      { title: 'Schema Relationships & Population Pipeline', videoUrl: 'https://www.youtube.com/embed/5_5oE5lbnA0', duration: '60 mins' },
    ],
    assignment: {
      title: 'MongoDB Courses & Enrollment System API',
      description: 'Build a MongoDB & Mongoose backend service featuring schemas with validation, ObjectId relationships, and populated queries.',
      requirements: [
        'Define Course and Student Mongoose models with ObjectId references.',
        'Use .populate("courses") to join referenced documents in API query responses.',
        'Implement schema field validations (minlength, match regex, enum roles).',
        'Push code to GitHub.',
      ],
      starterRepoUrl: 'https://github.com/fullstack-bootcamp/week9-mongodb-mongoose-starter',
      starterFileName: 'models/Student.js',
      starterCode: `const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }]
});

module.exports = mongoose.model('Student', StudentSchema);`,
      points: 100,
    },
    quiz: {
      title: 'Week 9 Assessment: MongoDB & Mongoose Data Modeling',
      passingScore: 70,
      questions: [
        {
          id: 'w9_q1',
          type: 'mcq',
          question: 'What Mongoose method populates referenced ObjectId documents in query results?',
          codeSnippet: '',
          options: ['.populate()', '.join()', '.include()', '.merge()'],
          correctAnswer: 0,
          explanation: '.populate() automatically replaces referenced ObjectIds with actual documents from other collections.',
        },
        {
          id: 'w9_q2',
          type: 'code_debug',
          question: 'Fix the Code Bug: Mongoose schema allows duplicate emails despite unique: true. Why?',
          codeSnippet: 'const userSchema = new mongoose.Schema({ email: { type: String, unique: true } });',
          options: [
            'unique is a build-index hint in MongoDB, not a validator. Ensure index is created or handle MongoDB E11000 duplicate key error in code.',
            'Change String to Text.',
            'unique: true requires lowercase: false.',
            'Mongoose does not support unique fields.'
          ],
          correctAnswer: 0,
          explanation: 'MongoDB creates unique indexes asynchronously. Handle E11000 error code when inserting duplicate keys.',
        },
        {
          id: 'w9_q3',
          type: 'mcq',
          question: 'What is the default primary key field created by MongoDB for every document?',
          codeSnippet: '',
          options: ['_id', 'id', 'uuid', 'pk'],
          correctAnswer: 0,
          explanation: 'MongoDB automatically generates a 12-byte ObjectId assigned to the _id field.',
        },
        {
          id: 'w9_q4',
          type: 'code_debug',
          question: 'Fix the Code Bug: Mongoose update query returns old document instead of updated document. Why?',
          codeSnippet: 'const updated = await User.findByIdAndUpdate(id, { name: "New" });',
          options: [
            'Add { new: true } option: await User.findByIdAndUpdate(id, { name: "New" }, { new: true });',
            'Call .save() on updated.',
            'findByIdAndUpdate cannot accept object payloads.',
            'Use findOneAndDelete instead.'
          ],
          correctAnswer: 0,
          explanation: 'By default findByIdAndUpdate returns the document BEFORE update. Set { new: true } to receive modified document.',
        },
      ],
    },
  },
  {
    weekNumber: 10,
    title: 'Authentication & Security',
    description: 'Implement user authentication with JWTs, secure password hashing, role-based access control, and CORS.',
    category: 'Node.js',
    lessons: [
      { title: 'Password Hashing with Bcrypt', videoUrl: 'https://www.youtube.com/embed/mbsmsi7l3r4', duration: '45 mins' },
      { title: 'JWT Authentication Flow & Token Storage', videoUrl: 'https://www.youtube.com/embed/7nafaH9SddU', duration: '60 mins' },
      { title: 'Role-Based Access Control (RBAC)', videoUrl: 'https://www.youtube.com/embed/H6u0bZ2jY9A', duration: '50 mins' },
      { title: 'Web Security Best Practices: CORS, Helmet & Rate Limiting', videoUrl: 'https://www.youtube.com/embed/9w_v0yK8q08', duration: '50 mins' },
    ],
    assignment: {
      title: 'Secure JWT Auth Microservice with Role Guards',
      description: 'Build a secure authentication microservice featuring user sign-up, bcrypt password hashing, JWT token generation, and authorization middleware.',
      requirements: [
        'Implement POST /api/auth/register and POST /api/auth/login.',
        'Hash passwords using bcryptjs with salt factor 10 before saving to database.',
        'Implement auth middleware verifying Bearer JWT tokens in request headers.',
        'Submit code to GitHub.',
      ],
      starterRepoUrl: 'https://github.com/fullstack-bootcamp/week10-jwt-auth-starter',
      starterFileName: 'middleware/auth.js',
      starterCode: `const jwt = require('jsonwebtoken');

module.exports = function protect(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No authorization token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};`,
      points: 100,
    },
    quiz: {
      title: 'Week 10 Assessment: JWT, Hashing & Web Security',
      passingScore: 70,
      questions: [
        {
          id: 'w10_q1',
          type: 'mcq',
          question: 'Why should plain-text passwords NEVER be stored in a database?',
          codeSnippet: '',
          options: [
            'Database breaches would compromise user passwords immediately. Always store salted one-way hashes (e.g. bcrypt).',
            'Plain text takes too much disk space.',
            'MongoDB converts text to binary automatically.',
            'HTTP headers reject plain text.'
          ],
          correctAnswer: 0,
          explanation: 'Hashing with bcrypt adds salt and CPU work factor to prevent rainbow table attacks.',
        },
        {
          id: 'w10_q2',
          type: 'code_debug',
          question: 'Fix the Code Bug: JWT verification fails with "JsonWebTokenError: invalid signature". Why?',
          codeSnippet: 'const decoded = jwt.verify(token, "SECRET_KEY_A");',
          options: [
            'The secret key passed to jwt.verify must exactly match the secret key used during jwt.sign.',
            'jwt.verify requires an async callback.',
            'Tokens cannot be verified on backend.',
            'Remove Bearer prefix from secret key.'
          ],
          correctAnswer: 0,
          explanation: 'JWT signatures are generated using the signing secret. If the secret differs during verification, signature check fails.',
        },
        {
          id: 'w10_q3',
          type: 'mcq',
          question: 'What are the 3 parts of a JSON Web Token (JWT) separated by dots?',
          codeSnippet: '',
          options: ['Header . Payload . Signature', 'Key . Value . Index', 'User . Hash . Salt', 'Token . Scope . Role'],
          correctAnswer: 0,
          explanation: 'A JWT consists of base64url encoded Header, Payload, and Signature.',
        },
        {
          id: 'w10_q4',
          type: 'code_debug',
          question: 'Fix the Code Bug: Frontend browser throws CORS error when calling backend API. Why?',
          codeSnippet: '// Express backend\napp.get("/api/data", (req, res) => res.json({ ok: true }));',
          options: [
            'Configure CORS middleware on backend: app.use(cors()) or set Access-Control-Allow-Origin header.',
            'Change backend port to match frontend port.',
            'Disable browser security in settings.',
            'Use POST instead of GET.'
          ],
          correctAnswer: 0,
          explanation: 'Browsers block cross-origin HTTP requests unless the server includes CORS headers.',
        },
      ],
    },
  },
  {
    weekNumber: 11,
    title: 'Full-Stack Integration',
    description: 'Connect Next.js frontend application with Express API backend, state management, and real-time user progress persistence.',
    category: 'Next.js',
    lessons: [
      { title: 'Integrating Next.js Client with Express API', videoUrl: 'https://www.youtube.com/embed/82CXvOof69U', duration: '60 mins' },
      { title: 'Client-Side Auth State & Token Interceptors', videoUrl: 'https://www.youtube.com/embed/3A8S_F6K_8U', duration: '55 mins' },
      { title: 'Optimistic UI Updates & Error Recovery', videoUrl: 'https://www.youtube.com/embed/N4yUiQiTmkU', duration: '50 mins' },
      { title: 'End-to-End User Dashboard Integration', videoUrl: 'https://www.youtube.com/embed/K8Y6WupPd4U', duration: '65 mins' },
    ],
    assignment: {
      title: 'Integrated Full-Stack Dashboard Application',
      description: 'Connect a Next.js frontend with an Express + MongoDB backend featuring client-side auth context, JWT token interceptors, and real-time data persistence.',
      requirements: [
        'Implement AuthContext in Next.js managing login, sign-up, and localStorage token.',
        'Connect client components to Express REST endpoints via fetch API with Bearer headers.',
        'Implement optimistic UI updates when mutating user records.',
        'Upload repository code to GitHub.',
      ],
      starterRepoUrl: 'https://github.com/fullstack-bootcamp/week11-fullstack-integration-starter',
      starterFileName: 'lib/apiClient.js',
      starterCode: `const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export async function fetchApi(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: \`Bearer \${token}\` }),
    ...options.headers,
  };

  const res = await fetch(\`\${API_BASE}\${endpoint}\`, { ...options, headers });
  return res.json();
}`,
      points: 100,
    },
    quiz: {
      title: 'Week 11 Assessment: End-to-End Integration',
      passingScore: 70,
      questions: [
        {
          id: 'w11_q1',
          type: 'mcq',
          question: 'What is Optimistic UI updating?',
          codeSnippet: '',
          options: [
            'Immediately updating the UI state before the server confirms the request, reverting if server rejects.',
            'Disabling buttons while waiting for network response.',
            'Caching API responses forever.',
            'Rendering placeholder skeletons only.'
          ],
          correctAnswer: 0,
          explanation: 'Optimistic UI makes applications feel instant by assuming server requests will succeed.',
        },
        {
          id: 'w11_q2',
          type: 'code_debug',
          question: 'Fix the Code Bug: Authenticated API calls fail with 401 on page refresh. Why?',
          codeSnippet: 'const token = localStorage.getItem("token");\nfetch(url, { headers: { Authorization: token } });',
          options: [
            'Format authorization header correctly with Bearer prefix: Authorization: `Bearer ${token}`.',
            'localStorage cannot store strings.',
            'fetch API is disabled on refresh.',
            'Use cookies instead of fetch.'
          ],
          correctAnswer: 0,
          explanation: 'JWT authentication convention requires standard "Bearer <token>" header format.',
        },
        {
          id: 'w11_q3',
          type: 'mcq',
          question: 'How should API base URLs be configured for development vs production environments?',
          codeSnippet: '',
          options: [
            'Using environment variables like process.env.NEXT_PUBLIC_API_URL.',
            'Hardcoding http://localhost:5001 directly in components.',
            'Writing URLs in HTML comments.',
            'Importing URLs from package.json.'
          ],
          correctAnswer: 0,
          explanation: 'Environment variables allow dynamic target endpoints per environment (local vs production).',
        },
        {
          id: 'w11_q4',
          type: 'code_debug',
          question: 'Fix the Code Bug: React AuthProvider component loses user state on browser refresh. Why?',
          codeSnippet: 'const [user, setUser] = useState(null);\n// No useEffect to restore user from token',
          options: [
            'Add useEffect on mount to read token from localStorage/cookies and fetch user profile.',
            'Store user password in global variable.',
            'useState should not be initialized to null.',
            'AuthProvider must be a Server Component.'
          ],
          correctAnswer: 0,
          explanation: 'React in-memory state resets on reload. Restore session by verifying stored token on mount.',
        },
      ],
    },
  },
  {
    weekNumber: 12,
    title: 'DevOps, Deployment & CI/CD',
    description: 'Package applications for production deployment, set up environment variables, and configure CI/CD pipelines.',
    category: 'DevOps',
    lessons: [
      { title: 'Containerization Basics with Docker', videoUrl: 'https://www.youtube.com/embed/3c-iBn73dDE', duration: '55 mins' },
      { title: 'Deploying Next.js to Vercel & Express to Render', videoUrl: 'https://www.youtube.com/embed/gAkwW2tuIqE', duration: '60 mins' },
      { title: 'Database Hosting with MongoDB Atlas', videoUrl: 'https://www.youtube.com/embed/rPqRyYJMy28', duration: '45 mins' },
      { title: 'Continuous Integration with GitHub Actions', videoUrl: 'https://www.youtube.com/embed/R8_veQiYBjU', duration: '50 mins' },
    ],
    assignment: {
      title: 'Production Full-Stack Cloud Deployment & CI/CD Pipeline',
      description: 'Deploy Next.js frontend to Vercel, Express backend to Render, MongoDB to Atlas, and configure a GitHub Actions CI workflow.',
      requirements: [
        'Deploy Next.js app to Vercel and set production NEXT_PUBLIC_API_URL environment variable.',
        'Deploy Express backend to Render/Koyeb and connect to MongoDB Atlas cloud database.',
        'Write a .github/workflows/ci.yml GitHub Action running automated tests on pull requests.',
        'Submit production URLs and GitHub repo link.',
      ],
      starterRepoUrl: 'https://github.com/fullstack-bootcamp/week12-devops-deployment-starter',
      starterFileName: 'Dockerfile',
      starterCode: `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5001
CMD ["node", "server.js"]`,
      points: 100,
    },
    quiz: {
      title: 'Week 12 Assessment: DevOps, Docker & Cloud Deployment',
      passingScore: 70,
      questions: [
        {
          id: 'w12_q1',
          type: 'mcq',
          question: 'What is the primary benefit of containerizing applications with Docker?',
          codeSnippet: '',
          options: [
            'Ensures application runs identically across all development, staging, and production environments.',
            'Increases internet connection speed.',
            'Replaces database storage.',
            'Generates frontend HTML automatically.'
          ],
          correctAnswer: 0,
          explanation: 'Docker packages code and dependencies into portable containers to eliminate "works on my machine" issues.',
        },
        {
          id: 'w12_q2',
          type: 'code_debug',
          question: 'Fix the Code Bug: Production Next.js build on Vercel fails with "Environment Variable API_URL is missing". Why?',
          codeSnippet: '// client/lib/api.js\nconst API = process.env.API_URL;',
          options: [
            'Next.js client-side environment variables MUST be prefixed with NEXT_PUBLIC_ to be exposed to browser.',
            'Rename file to api.env.',
            'Hardcode database password in code.',
            'Vercel does not support environment variables.'
          ],
          correctAnswer: 0,
          explanation: 'Next.js inline embeds environment variables starting with NEXT_PUBLIC_ into client bundle.',
        },
        {
          id: 'w12_q3',
          type: 'mcq',
          question: 'What is a GitHub Actions Workflow file written in?',
          codeSnippet: '',
          options: ['YAML (.yml)', 'JSON', 'XML', 'Python'],
          correctAnswer: 0,
          explanation: 'GitHub Actions workflow configurations are written in YAML syntax under .github/workflows/.',
        },
        {
          id: 'w12_q4',
          type: 'code_debug',
          question: 'Fix the Code Bug: Docker build fails because node_modules were copied into container image. Why?',
          codeSnippet: '// Dockerfile\nCOPY . .',
          options: [
            'Create a .dockerignore file listing node_modules and .next to exclude local build artifacts from image context.',
            'Delete Dockerfile.',
            'Use npm install --force inside container.',
            'Container images require Windows OS.'
          ],
          correctAnswer: 0,
          explanation: '.dockerignore prevents large local node_modules from bloating Docker build context.',
        },
      ],
    },
  },
];

async function seedData() {
  const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/lms_db';
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    await CourseModule.deleteMany({});
    console.log('Cleared existing modules.');

    const created = await CourseModule.insertMany(curriculumSeedData);
    console.log(`Successfully seeded ${created.length} course modules with rich starter templates!`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedData();
}

module.exports = { curriculumSeedData };
