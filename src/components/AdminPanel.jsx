import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/qa";

const AdminPanel = () => {
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    keyword: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(API_URL);
      setData(response.data);
    } catch (error) {
      setError("Lỗi khi tải dữ liệu: " + error.message);
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }
      await fetchData();
      setFormData({ question: "", answer: "", keyword: "" });
      setEditingId(null);
    } catch (error) {
      setError("Lỗi khi lưu dữ liệu: " + error.message);
      console.error("Error saving data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      question: item.question,
      answer: item.answer,
      keyword: item.keyword,
    });
    setEditingId(item._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa?")) {
      try {
        setLoading(true);
        setError(null);
        await axios.delete(`${API_URL}/${id}`);
        await fetchData();
      } catch (error) {
        setError("Lỗi khi xóa dữ liệu: " + error.message);
        console.error("Error deleting data:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Quản lý thông tin</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mb-8 bg-white p-6 rounded-lg shadow-md"
      >
        <div className="mb-4">
          <label className="block text-black text-sm font-bold mb-2">
            Câu hỏi:
          </label>
          <input
            type="text"
            name="question"
            value={formData.question}
            onChange={handleChange}
            className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-black text-sm font-bold mb-2">
            Câu trả lời:
          </label>
          <textarea
            name="answer"
            value={formData.answer}
            onChange={handleChange}
            className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          />
        </div>
        <div className="mb-4">
          <label className="block text-black text-sm font-bold mb-2">
            Keyword:
          </label>
          <input
            type="text"
            name="keyword"
            value={formData.keyword}
            onChange={handleChange}
            className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
        >
          {editingId ? "Cập nhật" : "Thêm mới"}
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                Câu hỏi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                Câu trả lời
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                Keyword
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item._id}>
                <td className="px-6 py-4 whitespace-pre-wrap">
                  {item.question}
                </td>
                <td className="px-6 py-4 whitespace-pre-wrap">{item.answer}</td>
                <td className="px-6 py-4 whitespace-pre-wrap">
                  {item.keyword}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(item)}
                    className="bg-yellow-500 text-black font-bold py-1 px-3 rounded mr-2 hover:bg-yellow-600 transition duration-200"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="bg-red-500 text-black font-bold py-1 px-3 rounded hover:bg-red-600 transition duration-200"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
