import React, { useState } from 'react';
import { Send, Sparkles, Copy, Check } from 'lucide-react';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: 'write your OpenAI API key here',
  dangerouslyAllowBrowser: true
});

function App() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }
    
    setLoading(true);
    setError('');
    setResult('');

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a Faker.js function generator that strictly follows the official Faker.js documentation at https://fakerjs.dev/api/.

Rules:
1. ONLY output valid Faker.js function calls from the documentation
2. Include ALL necessary parameters and options
3. Format the response exactly as it would appear in code
4. If no exact match exists, use the closest appropriate function
5. If the request is unclear, respond with a comment explaining what clarification is needed
6. Never include explanations or additional text, only the function call or comment

Example inputs and outputs:
Input: "generate a random first name"
Output: faker.person.firstName()

Input: "create a date of birth for someone over 18"
Output: faker.date.birthdate({ mode: 'age', min: 18, max: 65 })

Input: "generate a valid email"
Output: faker.internet.email()`
          },
          {
            role: "user",
            content: query
          }
        ],
        temperature: 0.1, // Lower temperature for more consistent outputs
        max_tokens: 100
      });

      setResult(completion.choices[0].message.content || '// No suggestion available');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Faker.js Copilot</h1>
          </div>
          <p className="text-gray-600">
            Describe the type of data you need in natural language, and I'll suggest the right Faker.js function.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., Returns a random first name"
                className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                disabled={loading}
              />
              <button
                type="submit"
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 transition ${
                  loading ? 'text-gray-300' : 'text-gray-400 hover:text-indigo-600'
                }`}
                disabled={loading}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>

          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}

          {result && !loading && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-sm font-medium text-gray-700">Suggested Faker Function:</h2>
                <button
                  onClick={copyToClipboard}
                  className="p-2 text-gray-400 hover:text-indigo-600 transition"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
                <code>{result}</code>
              </pre>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Browse all available Faker.js functions in the{' '}
            <a
              href="https://fakerjs.dev/api/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 underline"
            >
              official documentation
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;