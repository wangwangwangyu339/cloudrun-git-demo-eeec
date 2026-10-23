"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const API_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const headers = {
  apikey: API_KEY,
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

type Activity = {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  created_at: string;
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchActivities = async () => {
    const res = await fetch(`${API_URL}/activities?select=*&order=created_at.desc`, {
      headers,
    });
    const data = await res.json();
    setActivities(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await fetch(`${API_URL}/activities?id=eq.${editingId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(form),
      });
      alert("更新成功！");
      setEditingId(null);
    } else {
      await fetch(`${API_URL}/activities`, {
        method: "POST",
        headers,
        body: JSON.stringify([form]),
      });
      alert("添加成功！");
    }
    setForm({ title: "", description: "", date: "", location: "" });
    fetchActivities();
  };

  const handleEdit = (activity: Activity) => {
    setForm({
      title: activity.title,
      description: activity.description,
      date: activity.date,
      location: activity.location,
    });
    setEditingId(activity.id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除吗？")) return;
    await fetch(`${API_URL}/activities?id=eq.${id}`, {
      method: "DELETE",
      headers,
    });
    alert("删除成功！");
    fetchActivities();
  };

  if (loading) return <div className="p-8">加载中...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">活动管理 Demo</h1>

      {/* 表单 */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          {editingId ? "编辑活动" : "新增活动"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">标题</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">描述</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">日期</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">地点</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              {editingId ? "更新" : "添加"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ title: "", description: "", date: "", location: "" });
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
              >
                取消
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 列表 */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">活动列表</h2>
        {activities.length === 0 ? (
          <p className="text-gray-500">暂无活动，添加一个吧！</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="border border-gray-200 rounded p-4 flex justify-between items-start bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{activity.title}</h3>
                  <p className="text-gray-600 mt-1">{activity.description}</p>
                  <div className="text-sm text-gray-500 mt-2 space-x-4">
                    <span>📅 {activity.date}</span>
                    <span>📍 {activity.location}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(activity)}
                    className="text-blue-500 hover:underline"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(activity.id)}
                    className="text-red-500 hover:underline"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
