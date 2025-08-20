import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Home() {
  const [user, setUser] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState('openai');
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);

  const employees = ['AI架构师 👩‍💻','AI程序员 👨‍💻','AI文档员 ✍️','AI测试员 🧪','AI市场专员 📈'];

  useEffect(()=>{
    const session = supabase.auth.session();
    setUser(session?.user || null);
    supabase.auth.onAuthStateChange((event, session)=>setUser(session?.user || null));
    fetchDocs();
  },[]);

  const fetchDocs = async () => {
    if(!user) return;
    const { data, error } = await supabase.from('documents').select('*').eq('user_id', user.id).order('created_at',{ascending:false});
    if(!error) setDocuments(data);
  };

  const handleLogin = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({email,password});
    if(error) alert('登录失败:'+error.message);
  };

  const handleSignup = async (email, password) => {
    const { error } = await supabase.auth.signUp({email,password});
    if(error) alert('注册失败:'+error.message);
    else alert('注册成功，请检查邮箱验证');
  };

  const handleGenerate = async () => {
    if(!selectedEmployee || !prompt){alert('请选择员工并输入指令'); return;}
    setLoading(true); setOutput('生成中...');
    const fullPrompt = `你是一位专业的${selectedEmployee}。请根据以下用户指令完成任务:\n${prompt}`;

    try{
      const res = await fetch('/api/generate',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({provider,prompt:fullPrompt})
      });
      const data = await res.json();
      setOutput(data.result);

      // 保存文档
      if(user){
        await supabase.from('documents').insert([{employee:selectedEmployee,title:prompt.slice(0,50),content:data.result,user_id:user.id}]);
        fetchDocs();
      }
    }catch(e){console.error(e); setOutput('生成失败');}
    setLoading(false);
  };

  const handleFileUpload = async () => {
    if(!file || !user){alert('请选择文件或登录'); return;}
    const fileName = `${user.id}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from('documents').upload(fileName,file);
    if(error){alert('上传失败'); return;}
    alert('上传成功');
    await supabase.from('documents').insert([{employee:'用户上传',title:file.name,content:`路径:${data.path}`,user_id:user.id}]);
    fetchDocs();
  };

  const handleDelete = async (id) => {
    if(confirm('确定删除文档？')){
      await supabase.from('documents').delete().eq('id',id);
      fetchDocs();
    }
  };

  if(!user){
    let email='',password='';
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-4 text-blue-800">登录或注册</h1>
        <input placeholder="邮箱" onChange={e=>email=e.target.value} className="mb-2 p-2 border rounded"/>
        <input placeholder="密码" type="password" onChange={e=>password=e.target.value} className="mb-2 p-2 border rounded"/>
        <div className="flex gap-4">
          <button onClick={()=>handleLogin(email,password)} className="px-4 py-2 bg-green-500 text-white rounded">登录</button>
          <button onClick={()=>handleSignup(email,password)} className="px-4 py-2 bg-blue-500 text-white rounded">注册</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-blue-800">AI数字公司指挥中心</h1>
        <button onClick={()=>supabase.auth.signOut()} className="px-4 py-2 bg-red-500 text-white rounded">登出</button>
      </div>

      <div className="flex justify-center gap-4 mb-4">
        <button className={`px-4 py-2 rounded-full ${provider==='openai'?'bg-green-500 text-white':'bg-gray-200'}`} onClick={()=>setProvider('openai')}>OpenAI</button>
        <button className={`px-4 py-2 rounded-full ${provider==='gemini'?'bg-green-500 text-white':'bg-gray-200'}`} onClick={()=>setProvider('gemini')}>Gemini</button>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-4">
        {employees.map(emp=>(
          <button key={emp} className={`px-6 py-3 rounded-full font-semibold ${selectedEmployee===emp?'bg-blue-600 text-white':'bg-gray-200 text-blue-800'}`} onClick={()=>setSelectedEmployee(emp)}>{emp}</button>
        ))}
      </div>

      <textarea className="w-full h-32 p-3 border rounded mb-4" value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="请输入指令"/>

      <div className="flex justify-center gap-4 mb-4">
        <button onClick={handleGenerate} disabled={loading} className={`px-8 py-3 font-bold rounded text-white ${loading?'bg-gray-400':'bg-green-500 hover:bg-green-600'}`}>{loading?'生成中...':'提交任务'}</button>
        <input type="file" onChange={e=>setFile(e.target.files[0])} className="border p-2 rounded"/>
        <button onClick={handleFileUpload} className="px-4 py-2 bg-blue-500 text-white rounded">上传文件</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map(doc=>(
          <div key={doc.id} className="bg-white p-4 rounded shadow">
            <h3 className="font-bold">{doc.employee}: {doc.title}</h3>
            <pre className="whitespace-pre-wrap text-sm">{doc.content}</pre>
            <div className="flex gap-2 mt-2">
              <button onClick={()=>handleDelete(doc.id)} className="px-2 py-1 bg-red-500 text-white rounded">删除</button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg p-6 border border-gray-200 min-h-[150px] mt-6 whitespace-pre-wrap">{output}</div>
    </div>
  );
}
