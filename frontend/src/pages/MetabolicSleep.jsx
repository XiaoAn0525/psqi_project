import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MetabolicSleep.css";

function MetabolicSleep() {
  const navigate = useNavigate();

  const [sleepHours, setSleepHours] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedData = sessionStorage.getItem("metabolicScreeningData");

    if (savedData) {
      const parsedData = JSON.parse(savedData);

      if (parsedData.sleep_hours !== undefined) {
        setSleepHours(parsedData.sleep_hours);
      }
    }
  }, []);

  const getSleepCategory = () => {
    const hours = Number(sleepHours);

    if (!sleepHours) {
      return null;
    }

    if (hours < 6) {
      return "睡眠不足";
    }

    if (hours < 7) {
      return "睡眠偏短";
    }

    if (hours <= 9) {
      return "一般睡眠範圍";
    }

    return "睡眠偏長";
  };

  const validate = () => {
    const hours = Number(sleepHours);

    if (!sleepHours) {
      setError("請輸入每日平均睡眠時數");
      return false;
    }

    if (hours < 1 || hours > 16) {
      setError("請輸入合理的睡眠時數");
      return false;
    }

    setError("");
    return true;
  };

  const handleNext = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const savedData =
      sessionStorage.getItem("metabolicScreeningData");

    const metabolicData = savedData
      ? JSON.parse(savedData)
      : {};

    const updatedData = {
      ...metabolicData,
      sleep_hours: Number(sleepHours),
    };

    sessionStorage.setItem(
      "metabolicScreeningData",
      JSON.stringify(updatedData)
    );

    navigate("/metabolic/lifestyle");
  };

  return (
    <div className="sleep-page">

      {/* Header */}
      <header className="sleep-header">
        <div className="sleep-header-inner">

          <button
            type="button"
            className="sleep-back-home"
            onClick={() => navigate("/")}
          >
            ← 返回首頁
          </button>

          <div className="sleep-brand">
            <div className="sleep-brand-icon">
              ♥
            </div>

            <div>
              <h1>代謝症候群風險篩檢</h1>
              <p>
                Metabolic Syndrome Risk Screening
              </p>
            </div>
          </div>

          <div className="sleep-header-space"></div>

        </div>
      </header>


      <main className="sleep-main">

        {/* 進度 */}
        <section className="screening-progress">

          <div className="progress-top">
            <span>篩檢進度</span>
            <span>步驟 2 / 5</span>
          </div>

          <div className="progress-bar-bg">
            <div className="progress-bar-fill step-two"></div>
          </div>

          <div className="progress-labels">
            <span>基本資料</span>
            <span className="active">睡眠</span>
            <span>生活型態</span>
            <span>腰圍</span>
            <span>確認</span>
          </div>

        </section>


        {/* 標題 */}
        <section className="sleep-title">

          <div className="sleep-step-badge">
            STEP 02
          </div>

          <h2>睡眠時數</h2>

          <p>
            請依照你平常的睡眠狀況，
            輸入每日平均實際睡眠時間。
          </p>

        </section>


        {/* 卡片 */}
        <form
          className="sleep-form-card"
          onSubmit={handleNext}
        >

          <div className="sleep-card-heading">

            <div className="sleep-heading-icon">
              ☾
            </div>

            <div>
              <span>SLEEP DURATION</span>
              <h3>每日平均睡眠時間</h3>
            </div>

          </div>


          <div className="sleep-question">

            <label htmlFor="sleepHours">
              你平均每天實際睡眠幾小時？
              <span>*</span>
            </label>

            <p className="sleep-question-help">
              請填寫實際睡著的時間，
              不包含躺在床上但尚未入睡的時間。
            </p>


            <div className="sleep-input-wrapper">

              <input
                id="sleepHours"
                type="number"
                value={sleepHours}
                onChange={(e) => {
                  setSleepHours(e.target.value);
                  setError("");
                }}
                placeholder="例如：7"
                min="1"
                max="16"
                step="0.5"
              />

              <span className="sleep-input-unit">
                小時
              </span>

            </div>


            {error && (
              <p className="sleep-error">
                {error}
              </p>
            )}

          </div>


          {/* 快速選擇 */}
          <div className="sleep-quick-section">

            <p>快速選擇</p>

            <div className="sleep-quick-options">

              {[5, 6, 7, 8, 9].map((hour) => (
                <button
                  key={hour}
                  type="button"
                  className={
                    Number(sleepHours) === hour
                      ? "sleep-quick-button selected"
                      : "sleep-quick-button"
                  }
                  onClick={() => {
                    setSleepHours(hour);
                    setError("");
                  }}
                >
                  {hour} 小時
                </button>
              ))}

            </div>

          </div>


          {/* 睡眠分類 */}
          <div className="sleep-result-preview">

            <div className="sleep-result-icon">
              Zz
            </div>

            <div className="sleep-result-content">

              <h4>睡眠分類</h4>

              {!sleepHours ? (
                <p>
                  輸入睡眠時數後，
                  系統會顯示目前的睡眠分類。
                </p>
              ) : (
                <div className="sleep-category">
                  {getSleepCategory()}
                </div>
              )}

            </div>

          </div>


          {/* 分類說明 */}
          <div className="sleep-range-info">

            <div className="sleep-range-row">
              <span className="range-dot short"></span>
              <span>少於 6 小時</span>
              <strong>睡眠不足</strong>
            </div>

            <div className="sleep-range-row">
              <span className="range-dot slightly-short"></span>
              <span>6～未滿 7 小時</span>
              <strong>睡眠偏短</strong>
            </div>

            <div className="sleep-range-row">
              <span className="range-dot normal"></span>
              <span>7～9 小時</span>
              <strong>一般睡眠範圍</strong>
            </div>

            <div className="sleep-range-row">
              <span className="range-dot long"></span>
              <span>超過 9 小時</span>
              <strong>睡眠偏長</strong>
            </div>

          </div>


          {/* 提醒 */}
          <div className="sleep-note">

            <div className="sleep-note-icon">
              i
            </div>

            <p>
              請以平常大多數日子的平均睡眠時間為準，
              不需要特別以某一天的睡眠狀況填寫。
            </p>

          </div>


          {/* 按鈕 */}
          <div className="sleep-actions">

            <button
              type="button"
              className="sleep-prev-button"
              onClick={() =>
                navigate("/metabolic/basic")
              }
            >
              ← 上一步
            </button>

            <button
              type="submit"
              className="sleep-next-button"
            >
              下一步：生活型態
              <span>→</span>
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default MetabolicSleep;