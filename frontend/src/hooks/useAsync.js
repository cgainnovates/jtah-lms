import { useCallback, useEffect, useRef, useState } from "react";

// Runs an async loader and exposes loading / error / data so every page handles
// its three states the same way. `reload` re-runs the loader after a mutation.
export function useAsync(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const latest = useRef(0);

  const run = useCallback(async () => {
    const ticket = ++latest.current;
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await loader();
      if (ticket === latest.current) setState({ data, loading: false, error: null });
    } catch (error) {
      if (ticket === latest.current) setState({ data: null, loading: false, error });
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    run();
    return () => { latest.current += 1; };
  }, [run]);

  return { ...state, reload: run };
}
