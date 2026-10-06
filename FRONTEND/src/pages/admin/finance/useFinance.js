import { useEffect, useState } from 'react';
import { trackersApi, expensesApi, salesApi } from '../../../api';
import { sum } from '../../../utils';

export default function useFinance() {
  const [s, setS] = useState({ trackers: [], expenses: [], sales: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const reload = () => Promise.all([trackersApi.list(), expensesApi.list(), salesApi.list()])
    .then(([trackers, expenses, sales]) => setS({ trackers, expenses, sales })).catch((e) => setError(e.message)).finally(() => setLoading(false));
  useEffect(() => { reload(); }, []);
  const spentBy = (id) => sum(s.expenses.filter((e) => String(e.trackerId) === String(id)), (e) => e.amount);
  return { ...s, loading, error, reload, spentBy };
}
