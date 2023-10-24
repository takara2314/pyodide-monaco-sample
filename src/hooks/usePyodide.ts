import { useCallback, useRef, useState } from 'react';
import { loadPyodide, PyodideInterface } from 'pyodide';

const usePyodide = (packages: string[] = []) => {
  const pyodide = useRef<PyodideInterface>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [stdout, setStdout] = useState<string[]>([]);
  const [stderr, setStderr] = useState<string[]>([]);

  const handleStdout = useCallback((text: string) => {
    setStdout((prevStdout) => {
      const outs = text.split('\n');
      return [...prevStdout, ...outs];
    });
  }, []);

  const handleStderr = useCallback((text: string) => {
    setStderr((prevStderr) => {
      const errs = text.split('\n');

      for (const i in errs) {
        errs[i] = decrementLineIndex(errs[i]);
      }

      return [...prevStderr, ...errs];
    });
  }, []);

  const initPyodide = useCallback(async () => {
    pyodide.current = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
      stdout: handleStdout,
      stderr: handleStderr,
    });

    if (packages && pyodide.current != null) {
      await pyodide.current.loadPackage('setuptools');
      await pyodide.current.loadPackage('micropip');
      await pyodide.current.loadPackage('numpy');

      const micropip = pyodide.current.pyimport('micropip');

      for (const p of packages) {
        await micropip.install(p);
      }
    }

    await pyodide.current.runPythonAsync('import traceback');

    setIsLoading(false);
  }, [handleStderr, handleStdout, packages]);

  const runPythonAsync = useCallback(async (code: string) => {
    if (!pyodide.current) {
      throw new Error('Pyodide is not initialized');
    }

    setStdout([]);
    setStderr([]);

    const codes = code.split('\n');
    const script = codes.map((c) => '        ' + c).join('\n');

    await pyodide.current.runPythonAsync(`def main():
    try:
${script}
    except:
        traceback.print_exc()
main()
`);
  }, []);

  return {
    pyodide,
    initPyodide,
    runPythonAsync,
    isLoading,
    stdout,
    stderr
  };
};

const decrementLineIndex = (line: string): string => {
  const regex = /line (\d+)/g;

  const output = line.replace(regex, (_, lineNumber: string) => {
    const newLineNumber = parseInt(lineNumber) - 2;
    return `line ${newLineNumber}`;
  });

  return output;
};

export default usePyodide;
