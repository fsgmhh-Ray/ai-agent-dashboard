import { useState, useEffect } from 'react';

export default function Home() {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState('openai'); // 可以切换 openai / gemini

  const employeeList = [
    'AI架构师 👩‍💻',
    'AI程序员 👨‍💻',
    'AI文档员 ✍️',
    'AI测试员 🧪',
    'AI市场专员 📈'
  ];

  const handleGenerate = async () => {
    if (!selectedEmployee || !prompt) {
      alert('请选择员工并输入指令');
      return;
    }
    setLoading(true);
    setOutput('生成中...');
    const fullPrompt = `你是一位专业的${selectedEmployee}。请根据以下用户指令完成任务:\n${prompt}`;

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, prompt: fullPrompt }),
      });
      const data = await res.json();
      setOutput(data.result);
    } catch (e) {
      console.error(e);
      setOutput('生成失败，请检查控制台');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center text-blue-800 mb-6">AI数字公司指挥中心</h1>

      {/* Provider Switch */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-full ${provider==='openai'?'bg-green-500 text-white':'bg-gray-200'}`}
          onClick={()=>setProvider('openai')}
        >OpenAI</button>
        <button
          className={`px-4 py-2 rounded-full ${provider==='gemini'?'bg-green-500 text-white':'bg-gray-200'}`}
          onClick={()=>setProvider('gemini')}
        >Gemini</button>
      </div>

      {/* Employee Selection */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {employeeList.map(emp => (
          <button
            key={emp}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${selectedEmployee===emp?'bg-blue-600 text-white':'bg-gray-200 text-blue-800'}`}
            onClick={()=>setSelectedEmployee(emp)}
          >
            {emp}
          </button>
        ))}
      </div>

      {/* Prompt Input */}
      <textarea
        value={prompt}
        onChange={e=>setPrompt(e.target.value)}
        className="w-full h-32 px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-blue-500 mb-4"
        placeholder="请输入指令"
      />

      <div className="flex justify-center mb-6">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className={`px-8 py-4 font-bold rounded-full text-white ${loading?'bg-gray-400':'bg-green-500 hover:bg-green-600'}`}
        >
          {loading?'工作进行中...':'提交任务'}
        </button>
      </div>

      {/* Output Display */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 min-h-[150px] whitespace-pre-wrap">
        {output}
      </div>
    </div>
  );
}

