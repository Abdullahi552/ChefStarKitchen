import { useEffect, useState } from 'react';
export default function useAsync(fn, initial = []) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { fn().then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false)); }, []);
  return { data, loading, error, setData };
}
