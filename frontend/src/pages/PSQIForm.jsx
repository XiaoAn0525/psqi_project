import { useState } from "react";

export default function PSQIForm() {
  const [form, setForm] = useState({
    bedTime: "",
    sleepMinutes: "",
    wakeTime: "",
    sleepHours: "",
    quality: "",
    sleepMedicine: "",
    daytimeSleepy: "",
    enthusiasm: "",
  });

  const [disturbances, setDisturbances] = useState({
    wakeNight: "",
    bathroom: "",
    breathing: "",
    cough: "",
    cold: "",
    hot: "",
    nightmare: "",
    pain: "",
    other: "",
  });

  const [score, setScore] = useState(null);

  const options = [
    { label: "沒有", value: 0 },
    { label: "每週少於 1 次", value: 1 },
    { label: "每週 1～2 次", value: 2 },
    { label: "每週 3 次以上", value: 3 },
  ];

  const qualityOptions = [
    { label: "非常好", value: 0 },
    { label: "還算好", value: 1 },
    { label: "還算差", value: 2 },
    { label: "非常差", value: 3 },
  ];

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleDisturbanceChange = (e) => {
    setDisturbances({
      ...disturbances,
      [e.target.name]: e.target.value,
    });
  };

  const calculateScore = () => {
    let total = 0;

    total += Number(form.quality || 0);
    total += Number(form.sleepMedicine || 0);
    total += Number(form.daytimeSleepy || 0);
    total += Number(form.enthusiasm || 0);

    Object.values(disturbances).forEach((value) => {
      total += Number(value || 0);
    });

    setScore(total);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateScore();
  };

  return (
    <div className="container mt-5 mb-5">
      <div className="card shadow">
        <div className="card-header bg-primary text-white text-center">
          <h3>PSQI 睡眠品質問卷</h3>
          <p className="mb-0">請依照過去一個月的睡眠狀況填寫</p>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <h5 className="mb-3">一、基本睡眠狀況</h5>

            <div className="mb-3">
              <label className="form-label">1. 通常幾點上床睡覺？</label>
              <input
                type="time"
                name="bedTime"
                className="form-control"
                value={form.bedTime}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">2. 通常需要多久才能入睡？</label>
              <input
                type="number"
                name="sleepMinutes"
                className="form-control"
                placeholder="請輸入分鐘數"
                value={form.sleepMinutes}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">3. 通常幾點起床？</label>
              <input
                type="time"
                name="wakeTime"
                className="form-control"
                value={form.wakeTime}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">4. 每晚實際睡眠幾小時？</label>
              <input
                type="number"
                step="0.5"
                name="sleepHours"
                className="form-control"
                placeholder="例如：6.5"
                value={form.sleepHours}
                onChange={handleChange}
              />
            </div>

            <hr />

            <h5 className="mb-3">二、睡眠品質</h5>

            <div className="mb-3">
              <label className="form-label">5. 整體來說，你覺得自己的睡眠品質如何？</label>
              <select
                name="quality"
                className="form-select"
                value={form.quality}
                onChange={handleChange}
              >
                <option value="">請選擇</option>
                {qualityOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <hr />

            <h5 className="mb-3">三、睡眠困擾</h5>

            {[
              ["wakeNight", "半夜或清晨醒來"],
              ["bathroom", "起床上廁所"],
              ["breathing", "呼吸不順"],
              ["cough", "咳嗽或打鼾"],
              ["cold", "覺得太冷"],
              ["hot", "覺得太熱"],
              ["nightmare", "做惡夢"],
              ["pain", "疼痛不舒服"],
              ["other", "其他原因"],
            ].map(([name, label], index) => (
              <div className="mb-3" key={name}>
                <label className="form-label">
                  {index + 6}. 是否因「{label}」而睡不好？
                </label>
                <select
                  name={name}
                  className="form-select"
                  value={disturbances[name]}
                  onChange={handleDisturbanceChange}
                >
                  <option value="">請選擇</option>
                  {options.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <hr />

            <h5 className="mb-3">四、安眠藥與白天狀況</h5>

            <div className="mb-3">
              <label className="form-label">15. 過去一個月使用安眠藥的頻率？</label>
              <select
                name="sleepMedicine"
                className="form-select"
                value={form.sleepMedicine}
                onChange={handleChange}
              >
                <option value="">請選擇</option>
                {options.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">16. 白天是否容易打瞌睡？</label>
              <select
                name="daytimeSleepy"
                className="form-select"
                value={form.daytimeSleepy}
                onChange={handleChange}
              >
                <option value="">請選擇</option>
                {options.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">17. 是否難以保持精神完成事情？</label>
              <select
                name="enthusiasm"
                className="form-select"
                value={form.enthusiasm}
                onChange={handleChange}
              >
                <option value="">請選擇</option>
                {options.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary w-100">
              送出問卷
            </button>
          </form>

          {score !== null && (
            <div className="alert alert-info mt-4 text-center">
              <h5>PSQI 總分：{score} 分</h5>
              <p className="mb-0">
                {score > 5
                  ? "睡眠品質可能較差，建議注意睡眠狀況。"
                  : "睡眠品質大致良好。"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}