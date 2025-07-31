import { useState, useEffect } from 'react';

export const useData = (dataFile) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await import(`../data/${dataFile}.json`);
        setData(response.default || response);
        setError(null);
      } catch (err) {
        setError(`Error al cargar ${dataFile}: ${err.message}`);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dataFile]);

  const addItem = (newItem) => {
    const id = Math.max(...data.map(item => item.id), 0) + 1;
    const itemWithId = { ...newItem, id };
    setData([...data, itemWithId]);
    return itemWithId;
  };

  const updateItem = (id, updatedItem) => {
    setData(data.map(item => item.id === id ? { ...item, ...updatedItem } : item));
  };

  const deleteItem = (id) => {
    setData(data.filter(item => item.id !== id));
  };

  return {
    data,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem
  };
};
