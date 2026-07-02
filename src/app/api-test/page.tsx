'use client';

import { useState } from 'react';

interface Todo {
  id: string;
  name: string;
  completed: boolean;
  priority?: string;
  dueDate?: string;
  tags?: string[];
}

export default function ApiTestPage() {
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [todoName, setTodoName] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [tags, setTags] = useState('');
  const [selectedTodoId, setSelectedTodoId] = useState('');
  const [subtaskName, setSubtaskName] = useState('');

  const apiCall = async (method: string, url: string, body?: any) => {
    setLoading(true);
    setResponse('请求中...');

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const res = await fetch(url, options);
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponse(`错误: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API 测试页面</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：测试按钮 */}
          <div className="space-y-6">
            {/* 待办事项测试 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">待办事项</h2>

              <div className="space-y-3">
                <button
                  onClick={() => apiCall('GET', '/api/todos?page=1&pageSize=20')}
                  disabled={loading}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  获取待办列表
                </button>

                <button
                  onClick={() => apiCall('GET', '/api/todos?action=tags')}
                  disabled={loading}
                  className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 disabled:opacity-50"
                >
                  获取所有标签
                </button>

                <hr />

                <input
                  type="text"
                  placeholder="待办名称"
                  value={todoName}
                  onChange={(e) => setTodoName(e.target.value)}
                  className="w-full border p-2 rounded mb-2"
                />

                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full border p-2 rounded mb-2"
                >
                  <option value="low">低优先级</option>
                  <option value="medium">中优先级</option>
                  <option value="high">高优先级</option>
                </select>

                <input
                  type="text"
                  placeholder="标签 (逗号分隔)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full border p-2 rounded mb-2"
                />

                <button
                  onClick={() => {
                    if (!todoName) return;
                    apiCall('POST', '/api/todos', {
                      name: todoName,
                      priority,
                      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                    });
                  }}
                  disabled={loading || !todoName}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
                >
                  创建待办
                </button>
              </div>
            </div>

            {/* 子任务测试 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">子任务</h2>

              <input
                type="text"
                placeholder="待办 ID"
                value={selectedTodoId}
                onChange={(e) => setSelectedTodoId(e.target.value)}
                className="w-full border p-2 rounded mb-2"
              />

              <button
                onClick={() => {
                  if (!selectedTodoId) return;
                  apiCall('GET', `/api/todos/${selectedTodoId}/subtasks`);
                }}
                disabled={loading || !selectedTodoId}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                获取子任务
              </button>

              <button
                onClick={() => {
                  if (!selectedTodoId) return;
                  apiCall('GET', `/api/todos/${selectedTodoId}/subtasks?action=progress`);
                }}
                disabled={loading || !selectedTodoId}
                className="w-full bg-cyan-500 text-white py-2 px-4 rounded hover:bg-cyan-600 disabled:opacity-50 mt-2"
              >
                获取进度
              </button>

              <hr className="my-4" />

              <input
                type="text"
                placeholder="子任务名称"
                value={subtaskName}
                onChange={(e) => setSubtaskName(e.target.value)}
                className="w-full border p-2 rounded mb-2"
              />

              <button
                onClick={() => {
                  if (!selectedTodoId || !subtaskName) return;
                  apiCall('POST', `/api/todos/${selectedTodoId}/subtasks`, {
                    name: subtaskName,
                  });
                }}
                disabled={loading || !selectedTodoId || !subtaskName}
                className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
              >
                创建子任务
              </button>
            </div>
          </div>

          {/* 右侧：响应显示 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">响应</h2>
            <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-auto max-h-[600px] text-sm">
              {response || '点击左侧按钮进行测试...'}
            </pre>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">API 快速参考</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">待办事项</h3>
              <ul className="space-y-1 text-gray-600">
                <li>GET /api/todos</li>
                <li>POST /api/todos</li>
                <li>PATCH /api/todos/{'{id}'}</li>
                <li>DELETE /api/todos/{'{id}'}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">子任务</h3>
              <ul className="space-y-1 text-gray-600">
                <li>GET /api/todos/{'{id}'}/subtasks</li>
                <li>POST /api/todos/{'{id}'}/subtasks</li>
                <li>PATCH /api/subtasks/{'{id}'}</li>
                <li>DELETE /api/subtasks/{'{id}'}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">附件</h3>
              <ul className="space-y-1 text-gray-600">
                <li>GET /api/todos/{'{id}'}/attachments</li>
                <li>POST /api/todos/{'{id}'}/attachments</li>
                <li>DELETE /api/attachments/{'{id}'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
