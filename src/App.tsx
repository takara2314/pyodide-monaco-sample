import { useCallback, useEffect, useState } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import usePyodide from './hooks/usePyodide';
import { generateRandomString } from './utils/random';

const defaultCode = '# code it!\nprint("Hello, World!")';

const App = () => {
  const monaco = useMonaco();
  const [code, setCode] = useState(defaultCode);
  const {
    // pyodide,
    initPyodide,
    runPythonAsync,
    isLoading,
    stdout,
    stderr,
  } = usePyodide();

  useEffect(() => {
    initPyodide();
  }, []);

  useEffect(() => {
    if (monaco) {
      console.log('here is the monaco instance:', monaco);
    }
  }, [monaco]);

  const handleChange = useCallback((value: string | undefined) => {
    if (!value) {
      return;
    }
    setCode(value);
  }, []);

  const handleRun = useCallback(async () => {
    runPythonAsync(code);
  }, [code, runPythonAsync]);

  return (
    <main className="p-8">
      <h1 className="mb-5 text-3xl font-bold text-emerald-600">
        <div>
          Pyodide Monaco Sample (Online Python Interpreter)
        </div>
        <div className="text-base text-gray-500">
          Run code only in the browser! No code is sent to the server!
        </div>
      </h1>

      <section className="h-[40svh]">
        {isLoading ? (
          <div className="w-full h-full bg-gray-300 flex justify-center items-center rounded-2xl">
            <p className="text-2xl font-bold text-gray-900">Loading Monaco Editor...</p>
          </div>
        ) : (
          <Editor
            defaultLanguage="python"
            defaultValue={defaultCode}
            className="h-full border-4 border-emerald-500 rounded-2xl overflow-hidden"
            onChange={handleChange}
          />
        )}
      </section>

      <button
        className={
          `my-3 px-6 py-3 text-white font-bold ${isLoading ? 'bg-gray-400' : 'bg-emerald-900'} rounded-xl`
        }
        aria-label="Run"
        onClick={handleRun}
        disabled={isLoading}
      >
        {isLoading ? 'Loading Pyodide...' : 'Run'}
      </button>

      <h2 className="mt-5 text-gray-900 font-medium text-xl">
        Outputs
      </h2>
      <section className="mt-2 p-3 w-full h-52 bg-gray-100 rounded-2xl overflow-y-auto">
        {stdout.map((line: string) => (
          <p key={generateRandomString(5)}>
            {line}
          </p>
        ))}

        {stderr.map((line: string) => (
          <p className="font-bold text-red-600" key={generateRandomString(5)}>
            {line}
          </p>
        ))}
      </section>
    </main>
  );
};

export default App;
