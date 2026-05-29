import { useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    q1_bedtime: "",
    q2_sleep_latency_minutes: "",
    q3_wakeup_time: "",
    q4_sleep_hours: "",
    sleep_quality: "",
    sleep_latency: "",
    sleep_duration: "",
    sleep_efficiency: "",
    sleep_disturbance: "",
    sleeping_medication: "",
    daytime_dysfunction: "",
  });

  const [result, setResult] = useState(null);

  const scoreQuestions = [
    {
      name: "sleep_quality",
      title: "主觀睡眠品質",
      options: ["非常好", "還算好", "有點差", "非常差"],
    },
    {
      name: "sleep_latency",
      title: "入睡困難程度",
      options: ["沒有困難", "輕微困難", "中度困難", "嚴重困難"],
    },
    {
      name: "sleep_duration",
      title: "實際睡眠時間",
      options: ["大於 7 小時", "6～7 小時", "5～6 小時", "小於 5 小時"],
    },
    {
      name: "sleep_efficiency",
      title: "睡眠效率",
      options: ["大於 85%", "75～84%", "65～74%", "小於 65%"],
    },
    {
      name: "sleep_disturbance",
      title: "睡眠困擾",
      options: ["沒有", "每週少於 1 次", "每週 1～2 次", "每週 3 次以上"],
    },
    {
      name: "sleeping_medication",
      title: "使用安眠藥物",
      options: ["沒有", "每週少於 1 次", "每週 1～2 次", "每週 3 次以上"],
    },
    {
      name: "daytime_dysfunction",
      title: "日間功能障礙",
      options: ["沒有影響", "輕微影響", "中度影響", "嚴重影響"],
    },
  ];

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const calculateScore = () => {
    const fields = [
      "sleep_quality",
      "sleep_latency",
      "sleep_duration",
      "sleep_efficiency",
      "sleep_disturbance",
      "sleeping_medication",
      "daytime_dysfunction",
    ];

    let total = 0;

    for (let field of fields) {
      total += Number(form[field]);
    }

    return total;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const totalScore = calculateScore();

    const sendData = {
      ...form,
      total_score: totalScore,
    };

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/psqi/submit/",
        sendData
      );

      setResult({
        totalScore: res.data.total_score,
        status: res.data.result,
      });

      alert("問卷送出成功");
    } catch (error) {
      console.error(error);
      alert("送出失敗，請確認 Django 後端有啟動");
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h1>PSQI 睡眠品質問卷</h1>
        <p className="subtitle">
          本問卷用於評估近一個月的睡眠品質，總分越高代表睡眠品質越差。
        </p>

        <form onSubmit={handleSubmit}>
          <section>
            <h2>一、基本資料</h2>

            <div className="form-group">
              <label>姓名</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="請輸入姓名"
              />
            </div>

            <div className="form-group">
              <label>年齡</label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                placeholder="請輸入年齡"
              />
            </div>

            <div className="form-group">
              <label>性別</label>
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">請選擇</option>
                <option value="male">男</option>
                <option value="female">女</option>
                <option value="other">其他</option>
              </select>
            </div>
          </section>

          <section>
            <h2>二、睡眠狀況</h2>

            <div className="form-group">
              <label>過去一個月，通常幾點上床睡覺？</label>
              <input
                type="time"
                name="q1_bedtime"
                value={form.q1_bedtime}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>通常需要幾分鐘才能入睡？</label>
              <input
                type="number"
                name="q2_sleep_latency_minutes"
                value={form.q2_sleep_latency_minutes}
                onChange={handleChange}
                placeholder="例如：30"
              />
            </div>

            <div className="form-group">
              <label>通常幾點起床？</label>
              <input
                type="time"
                name="q3_wakeup_time"
                value={form.q3_wakeup_time}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>實際睡眠時數約幾小時？</label>
              <input
                type="number"
                step="0.5"
                name="q4_sleep_hours"
                value={form.q4_sleep_hours}
                onChange={handleChange}
                placeholder="例如：6.5"
              />
            </div>
          </section>

          <section>
            <h2>三、PSQI 七大面向評分</h2>

            {scoreQuestions.map((q, index) => (
              <div className="question" key={q.name}>
                <p>
                  {index + 1}. {q.title}
                </p>

                <select
                  name={q.name}
                  value={form[q.name]}
                  onChange={handleChange}
                  required
                >
                  <option value="">請選擇</option>
                  {q.options.map((option, score) => (
                    <option key={score} value={score}>
                      {score} 分：{option}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </section>

          <button type="submit">送出問卷</button>
        </form>

        {result && (
          <div className="result">
            <h2>問卷結果</h2>
            <p>PSQI 總分：{result.totalScore} 分</p>
            <p>{result.status}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;