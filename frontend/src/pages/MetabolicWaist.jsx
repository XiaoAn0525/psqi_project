import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MetabolicWaist.css";

function MetabolicWaist() {
  const navigate = useNavigate();

  const [waist, setWaist] = useState("");
  const [skipWaist, setSkipWaist] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedData = sessionStorage.getItem(
      "metabolicScreeningData"
    );

    if (!savedData) {
      return;
    }

    const parsedData = JSON.parse(savedData);

    if (
      parsedData.waist !== null &&
      parsedData.waist !== undefined &&
      parsedData.waist !== ""
    ) {
      setWaist(parsedData.waist);
      setSkipWaist(false);
    } else if (parsedData.waist_skipped === true) {
      setSkipWaist(true);
    }
  }, []);

  const handleWaistChange = (e) => {
    setWaist(e.target.value);
    setSkipWaist(false);
    setError("");
  };

  const handleSkip = () => {
    setSkipWaist(true);
    setWaist("");
    setError("");
  };

  const validate = () => {
    if (skipWaist) {
      return true;
    }

    if (!waist) {
      setError("請輸入腰圍，或選擇「不知道／暫不填寫」");
      return false;
    }

    const waistValue = Number(waist);

    if (waistValue < 40 || waistValue > 200) {
      setError("請輸入合理的腰圍數值");
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

    const savedData = sessionStorage.getItem(
      "metabolicScreeningData"
    );

    const metabolicData = savedData
      ? JSON.parse(savedData)
      : {};

    const updatedData = {
      ...metabolicData,

      waist: skipWaist
        ? null
        : Number(waist),

      waist_skipped: skipWaist,
    };

    sessionStorage.setItem(
      "metabolicScreeningData",
      JSON.stringify(updatedData)
    );

    navigate("/metabolic/confirm");
  };

  return (
    <div className="waist-page">

      {/* Header */}
      <header className="waist-header">

        <div className="waist-header-inner">

          <button
            type="button"
            className="waist-back-home"
            onClick={() => navigate("/")}
          >
            ← 返回首頁
          </button>

          <div className="waist-brand">

            <div className="waist-brand-icon">
              ♥
            </div>

            <div>
              <h1>
                代謝症候群風險篩檢
              </h1>

              <p>
                Metabolic Syndrome Risk Screening
              </p>
            </div>

          </div>

          <div className="waist-header-space"></div>

        </div>

      </header>


      <main className="waist-main">

        {/* 進度 */}
        <section className="screening-progress">

          <div className="progress-top">
            <span>
              篩檢進度
            </span>

            <span>
              步驟 4 / 5
            </span>
          </div>


          <div className="progress-bar-bg">

            <div className="progress-bar-fill step-four"></div>

          </div>


          <div className="progress-labels">

            <span>
              基本資料
            </span>

            <span>
              睡眠
            </span>

            <span>
              生活型態
            </span>

            <span className="active">
              腰圍
            </span>

            <span>
              確認
            </span>

          </div>

        </section>


        {/* 標題 */}
        <section className="waist-title">

          <div className="waist-step-badge">
            STEP 04
          </div>

          <h2>
            腰圍
          </h2>

          <p>
            如果知道自己的腰圍，可以填寫以下資料；
            若目前不知道，也可以直接略過。
          </p>

        </section>


        {/* 表單 */}
        <form
          className="waist-form-card"
          onSubmit={handleNext}
        >

          <div className="waist-card-heading">

            <div className="waist-heading-icon">
              04
            </div>

            <div>
              <span>
                WAIST CIRCUMFERENCE
              </span>

              <h3>
                腰圍資料
              </h3>
            </div>

          </div>


          {/* 選填標籤 */}
          <div className="waist-optional-banner">

            <div className="optional-icon">
              ✓
            </div>

            <div>
              <strong>
                此欄位為選填
              </strong>

              <p>
                不知道腰圍並不會阻止你繼續完成本次風險篩檢。
              </p>
            </div>

          </div>


          {/* 腰圍輸入 */}
          <div className="waist-field">

            <label htmlFor="waist">
              腰圍
              <span className="optional-text">
                選填
              </span>
            </label>

            <p className="waist-field-help">
              請輸入腰圍數值，單位為公分（cm）。
            </p>


            <div className="waist-input-wrapper">

              <input
                id="waist"
                type="number"
                value={waist}
                onChange={handleWaistChange}
                placeholder="例如：82"
                step="0.1"
                min="40"
                max="200"
                disabled={skipWaist}
              />

              <span className="waist-input-unit">
                cm
              </span>

            </div>


            {error && (
              <p className="waist-error">
                {error}
              </p>
            )}

          </div>


          {/* 或 */}
          <div className="waist-or">

            <span></span>

            <p>
              或
            </p>

            <span></span>

          </div>


          {/* 不知道 */}
          <button
            type="button"
            className={
              skipWaist
                ? "waist-skip-card selected"
                : "waist-skip-card"
            }
            onClick={handleSkip}
          >

            <div className="skip-radio"></div>

            <div className="skip-content">

              <strong>
                我不知道目前的腰圍
              </strong>

              <span>
                暫不填寫此項資料，繼續進行篩檢
              </span>

            </div>

          </button>


          {/* 測量說明 */}
          <div className="waist-measure-guide">

            <div className="measure-guide-title">

              <div className="measure-guide-icon">
                i
              </div>

              <h4>
                如果想自行測量腰圍
              </h4>

            </div>


            <div className="measure-steps">

              <div className="measure-step">
                <span>
                  1
                </span>

                <p>
                  保持自然站立並正常呼吸。
                </p>
              </div>


              <div className="measure-step">
                <span>
                  2
                </span>

                <p>
                  使用軟尺水平繞過腹部。
                </p>
              </div>


              <div className="measure-step">
                <span>
                  3
                </span>

                <p>
                  軟尺貼合皮膚即可，不要過度拉緊。
                </p>
              </div>

            </div>

          </div>


          {/* 資料用途 */}
          <div className="waist-note">

            <div className="waist-note-icon">
              i
            </div>

            <p>
              若有提供腰圍資料，系統可在最終結果中一併顯示；
              是否實際納入模型預測，仍需依模型最終使用欄位決定。
            </p>

          </div>


          {/* 按鈕 */}
          <div className="waist-actions">

            <button
              type="button"
              className="waist-prev-button"
              onClick={() =>
                navigate("/metabolic/lifestyle")
              }
            >
              ← 上一步
            </button>


            <button
              type="submit"
              className="waist-next-button"
            >
              下一步：確認資料
              <span>→</span>
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default MetabolicWaist;