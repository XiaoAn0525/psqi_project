import { useState } from "react";
import "./PSQIForm.css";

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

  const disturbanceQuestions = [
    ["wakeNight", "半夜或清晨醒來"],
    ["bathroom", "起床上廁所"],
    ["breathing", "呼吸不順"],
    ["cough", "咳嗽或打鼾"],
    ["cold", "覺得太冷"],
    ["hot", "覺得太熱"],
    ["nightmare", "做惡夢"],
    ["pain", "疼痛不舒服"],
    ["other", "其他原因"],
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
  <div className="psqi-page">

    <div className="psqi-wrapper">

      {/* 回首頁 */}
      <div className="psqi-back-area">
        <button
          type="button"
          className="psqi-back-button"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          <span className="psqi-back-arrow">←</span>
          回首頁
        </button>
      </div>

        {/* =========================================
            頁面標題
        ========================================= */}

        <section className="psqi-hero">

          <div className="psqi-hero-icon">
            ☾
          </div>

          <div className="psqi-hero-text">
            <span className="psqi-eyebrow">
              SLEEP QUALITY ASSESSMENT
            </span>

            <h1>
              PSQI 睡眠品質問卷
            </h1>

            <p>
              請依照過去一個月的實際睡眠狀況填寫，
              幫助你初步了解自己的睡眠品質。
            </p>
          </div>

        </section>


        {/* =========================================
            提醒
        ========================================= */}

        <div className="psqi-notice">

          <div className="psqi-notice-icon">
            i
          </div>

          <div>
            <strong>
              填寫說明
            </strong>

            <p>
              請以過去一個月大多數時間的實際情況回答，
              沒有絕對正確或錯誤的答案。
            </p>
          </div>

        </div>


        <form
          onSubmit={handleSubmit}
          className="psqi-form"
        >

          {/* =========================================
              STEP 01
          ========================================= */}

          <section className="psqi-section">

            <div className="psqi-section-title">

              <div className="psqi-step-number">
                01
              </div>

              <div>
                <span>
                  STEP 01
                </span>

                <h2>
                  基本睡眠狀況
                </h2>

                <p>
                  請填寫平常的睡眠與起床時間。
                </p>
              </div>

            </div>


            <div className="psqi-card">

              <div className="psqi-question">

                <label>
                  <span className="question-number">
                    1
                  </span>

                  通常幾點上床睡覺？
                </label>

                <input
                  type="time"
                  name="bedTime"
                  value={form.bedTime}
                  onChange={handleChange}
                />

              </div>


              <div className="psqi-question">

                <label>
                  <span className="question-number">
                    2
                  </span>

                  通常需要多久才能入睡？
                </label>

                <div className="psqi-input-unit">

                  <input
                    type="number"
                    name="sleepMinutes"
                    min="0"
                    placeholder="例如：20"
                    value={form.sleepMinutes}
                    onChange={handleChange}
                  />

                  <span>
                    分鐘
                  </span>

                </div>

              </div>


              <div className="psqi-question">

                <label>
                  <span className="question-number">
                    3
                  </span>

                  通常幾點起床？
                </label>

                <input
                  type="time"
                  name="wakeTime"
                  value={form.wakeTime}
                  onChange={handleChange}
                />

              </div>


              <div className="psqi-question">

                <label>
                  <span className="question-number">
                    4
                  </span>

                  每晚實際睡眠幾小時？
                </label>

                <div className="psqi-input-unit">

                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    name="sleepHours"
                    placeholder="例如：6.5"
                    value={form.sleepHours}
                    onChange={handleChange}
                  />

                  <span>
                    小時
                  </span>

                </div>

              </div>

            </div>

          </section>


          {/* =========================================
              STEP 02
          ========================================= */}

          <section className="psqi-section">

            <div className="psqi-section-title">

              <div className="psqi-step-number">
                02
              </div>

              <div>
                <span>
                  STEP 02
                </span>

                <h2>
                  整體睡眠品質
                </h2>

                <p>
                  評估你對自己整體睡眠品質的感受。
                </p>
              </div>

            </div>


            <div className="psqi-card">

              <div className="psqi-question">

                <label>
                  <span className="question-number">
                    5
                  </span>

                  整體來說，你覺得自己的睡眠品質如何？
                </label>


                <div className="psqi-choice-grid">

                  {qualityOptions.map((item) => (

                    <label
                      key={item.value}
                      className={
                        `psqi-choice ${
                          String(form.quality) ===
                          String(item.value)
                            ? "selected"
                            : ""
                        }`
                      }
                    >

                      <input
                        type="radio"
                        name="quality"
                        value={item.value}
                        checked={
                          String(form.quality) ===
                          String(item.value)
                        }
                        onChange={handleChange}
                      />

                      <span className="choice-radio"></span>

                      <span className="choice-text">
                        {item.label}
                      </span>

                    </label>

                  ))}

                </div>

              </div>

            </div>

          </section>


          {/* =========================================
              STEP 03
          ========================================= */}

          <section className="psqi-section">

            <div className="psqi-section-title">

              <div className="psqi-step-number">
                03
              </div>

              <div>
                <span>
                  STEP 03
                </span>

                <h2>
                  睡眠困擾
                </h2>

                <p>
                  回想過去一個月，以下狀況影響睡眠的頻率。
                </p>
              </div>

            </div>


            <div className="psqi-card">

              {disturbanceQuestions.map(
                ([name, label], index) => (

                  <div
                    className="psqi-question psqi-disturbance-question"
                    key={name}
                  >

                    <label>
                      <span className="question-number">
                        {index + 6}
                      </span>

                      是否因「{label}」而睡不好？
                    </label>


                    <select
                      name={name}
                      value={disturbances[name]}
                      onChange={handleDisturbanceChange}
                    >
                      <option value="">
                        請選擇發生頻率
                      </option>

                      {options.map((item) => (
                        <option
                          key={item.value}
                          value={item.value}
                        >
                          {item.label}
                        </option>
                      ))}

                    </select>

                  </div>

                )
              )}

            </div>

          </section>


          {/* =========================================
              STEP 04
          ========================================= */}

          <section className="psqi-section">

            <div className="psqi-section-title">

              <div className="psqi-step-number">
                04
              </div>

              <div>
                <span>
                  STEP 04
                </span>

                <h2>
                  安眠藥與白天狀況
                </h2>

                <p>
                  評估睡眠問題是否影響日常生活與精神狀態。
                </p>
              </div>

            </div>


            <div className="psqi-card">

              <div className="psqi-question">

                <label>
                  <span className="question-number">
                    15
                  </span>

                  過去一個月使用安眠藥的頻率？
                </label>

                <select
                  name="sleepMedicine"
                  value={form.sleepMedicine}
                  onChange={handleChange}
                >
                  <option value="">
                    請選擇發生頻率
                  </option>

                  {options.map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ))}

                </select>

              </div>


              <div className="psqi-question">

                <label>
                  <span className="question-number">
                    16
                  </span>

                  白天是否容易打瞌睡？
                </label>

                <select
                  name="daytimeSleepy"
                  value={form.daytimeSleepy}
                  onChange={handleChange}
                >
                  <option value="">
                    請選擇發生頻率
                  </option>

                  {options.map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ))}

                </select>

              </div>


              <div className="psqi-question">

                <label>
                  <span className="question-number">
                    17
                  </span>

                  是否難以保持精神完成事情？
                </label>

                <select
                  name="enthusiasm"
                  value={form.enthusiasm}
                  onChange={handleChange}
                >
                  <option value="">
                    請選擇發生頻率
                  </option>

                  {options.map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ))}

                </select>

              </div>

            </div>

          </section>


          {/* =========================================
              Submit
          ========================================= */}

          <div className="psqi-submit-area">

            <div>
              <strong>
                填寫完成了嗎？
              </strong>

              <p>
                確認資料後即可查看睡眠品質評估結果。
              </p>
            </div>


            <button
              type="submit"
              className="psqi-submit-button"
            >
              查看評估結果

              <span>
                →
              </span>
            </button>

          </div>

        </form>


        {/* =========================================
            Result
        ========================================= */}

        {score !== null && (

          <section
            className={
              `psqi-result ${
                score > 5
                  ? "psqi-result-warning"
                  : "psqi-result-good"
              }`
            }
          >

            <div className="psqi-result-icon">
              {score > 5 ? "!" : "✓"}
            </div>


            <div>

              <span className="psqi-result-label">
                PSQI 評估結果
              </span>

              <h2>
                PSQI 總分：{score} 分
              </h2>

              <p>
                {score > 5
                  ? "睡眠品質可能較差，建議注意近期睡眠狀況與生活作息。"
                  : "目前睡眠品質大致良好，建議持續維持規律的睡眠習慣。"}
              </p>

            </div>

          </section>

        )}


        {/* =========================================
            Disclaimer
        ========================================= */}

        <div className="psqi-disclaimer">

          <span>
            !
          </span>

          <p>
            本問卷結果僅供睡眠健康評估與研究參考，
            不能取代專業醫療診斷。
            若長期有睡眠困擾，建議諮詢醫療專業人員。
          </p>

        </div>

      </div>

    </div>
  );
}