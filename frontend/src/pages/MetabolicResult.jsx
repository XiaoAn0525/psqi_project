import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./MetabolicResult.css";


function MetabolicResult() {
  const navigate = useNavigate();

  const [result, setResult] = useState(null);


  // =========================================
  // 讀取後端回傳的結果
  // =========================================

  useEffect(() => {
    const savedResult =
      sessionStorage.getItem("metabolicResult");

    if (!savedResult) {
      navigate("/metabolic");
      return;
    }

    try {
      const parsedResult =
        JSON.parse(savedResult);

      setResult(parsedResult);

    } catch (error) {

      console.error(
        "讀取 metabolicResult 失敗：",
        error
      );

      sessionStorage.removeItem(
        "metabolicResult"
      );

      navigate("/metabolic");
    }

  }, [navigate]);


  // =========================================
  // Loading
  // =========================================

  if (!result) {
    return (
      <div className="result-loading-page">
        <p>
          正在讀取評估結果...
        </p>
      </div>
    );
  }


  // =========================================
  // 風險樣式
  // =========================================

  const getRiskClass = () => {

    if (
      result.risk_level === "低風險"
    ) {
      return "risk-low";
    }


    if (
      result.risk_level === "高風險"
    ) {
      return "risk-high";
    }


    return "risk-medium";
  };


  // =========================================
  // 風險說明
  // =========================================

  const getRiskDescription = () => {

    if (
      result.risk_level === "低風險"
    ) {
      return (
        "依目前填寫的資料，未出現較多明顯的代謝健康風險因素。"
      );
    }


    if (
      result.risk_level === "高風險"
    ) {
      return (
        "依目前填寫的資料，出現較多與代謝健康相關的風險因素，建議進一步安排健康檢查。"
      );
    }


    return (
      "依目前填寫的資料，出現部分與代謝健康相關的風險因素，建議持續注意生活型態與健康狀況。"
    );
  };


  // =========================================
  // 重新評估
  // =========================================

  const handleRestart = () => {

    sessionStorage.removeItem(
      "metabolicScreeningData"
    );

    sessionStorage.removeItem(
      "metabolicResult"
    );

    navigate(
      "/metabolic"
    );
  };


  // =========================================
  // 完成
  // =========================================

  const handleFinish = () => {

    sessionStorage.removeItem(
      "metabolicScreeningData"
    );

    sessionStorage.removeItem(
      "metabolicResult"
    );

    navigate("/");
  };


  return (
    <div className="result-page">

      {/* =====================================
          Header
      ====================================== */}

      <header className="result-header">

        <div className="result-header-inner">

          <button
            type="button"
            className="result-home-button"
            onClick={() =>
              navigate("/")
            }
          >
            ← 返回首頁
          </button>


          <div className="result-brand">

            <div className="result-brand-icon">
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


          <div className="result-header-space"></div>

        </div>

      </header>


      {/* =====================================
          Main
      ====================================== */}

      <main className="result-main">


        {/* ===================================
            Title
        ==================================== */}

        <section className="result-title">

          <div className="result-finished-badge">

            <span>
              ✓
            </span>

            評估完成

          </div>


          <h2>
            代謝症候群初步風險篩檢結果
          </h2>


          <p>
            以下結果依據你本次填寫的基本資料、
            睡眠與生活型態進行初步風險篩檢。
          </p>

        </section>


        {/* ===================================
            主結果
        ==================================== */}

        <section className="result-main-card">


          {/* =================================
              風險層級
          ================================== */}

          <div className="risk-section">

            <span className="risk-small-title">
              目前初步風險
            </span>


            <div
              className={
                `risk-level ${getRiskClass()}`
              }
            >
              {result.risk_level}
            </div>


            <p className="risk-description">
              {getRiskDescription()}
            </p>

          </div>


          {/* =================================
              BMI / 睡眠
          ================================== */}

          <div className="result-summary-grid">


            {/* BMI */}

            <div className="result-summary-card bmi-card">

              <div className="summary-label">
                BMI
              </div>


              <div className="summary-value">
                {result.bmi}
              </div>


              <div className="summary-status">
                {result.bmi_category}
              </div>

            </div>


            {/* 睡眠 */}

            <div className="result-summary-card sleep-summary-card">

              <div className="summary-label">
                每日平均睡眠
              </div>


              <div className="summary-value">

                {result.sleep_hours}

                <span>
                  {" "}小時
                </span>

              </div>


              <div className="summary-status sleep-status">
                {result.sleep_category}
              </div>

            </div>

          </div>


          {/* =================================
              腰圍
          ================================== */}

          <div className="result-waist">

            <div className="result-waist-icon">
              04
            </div>


            <div>

              <span>
                腰圍
              </span>


              <strong>

                {
                  result.waist === null ||
                  result.waist === undefined
                    ? "未提供"
                    : `${result.waist} cm`
                }

              </strong>

            </div>

          </div>


          {/* =================================
              風險因素
          ================================== */}

          <section className="risk-factor-section">

            <div className="result-section-heading">

              <div className="risk-factor-heading-icon">
                !
              </div>


              <div>

                <span>
                  RISK FACTORS
                </span>

                <h3>
                  本次發現的風險因素
                </h3>

              </div>

            </div>


            <div className="risk-factor-list">

              {
                result.risk_factors &&
                result.risk_factors.length > 0
                  ? (

                    result.risk_factors.map(
                      (
                        item,
                        index
                      ) => (

                        <div
                          className="risk-factor-item"
                          key={index}
                        >

                          <div className="risk-factor-dot">
                            !
                          </div>


                          <p>
                            {item}
                          </p>

                        </div>

                      )
                    )

                  )
                  : (

                    <div className="no-risk-factor">

                      <div className="no-risk-icon">
                        ✓
                      </div>


                      <div>

                        <strong>
                          未發現較明顯的風險因素
                        </strong>

                        <p>
                          建議持續維持良好的生活與健康習慣。
                        </p>

                      </div>

                    </div>

                  )
              }

            </div>

          </section>


          {/* =================================
              健康建議
          ================================== */}

          <section className="recommendation-section">

            <div className="result-section-heading">

              <div className="section-icon">
                ✓
              </div>


              <div>

                <span>
                  HEALTH SUGGESTIONS
                </span>

                <h3>
                  健康建議
                </h3>

              </div>

            </div>


            <div className="recommendation-list">

              {
                result.recommendations &&
                result.recommendations.length > 0
                  ? (

                    result.recommendations.map(
                      (
                        item,
                        index
                      ) => (

                        <div
                          className="recommendation-item"
                          key={index}
                        >

                          <div className="recommendation-check">
                            ✓
                          </div>


                          <p>
                            {item}
                          </p>

                        </div>

                      )
                    )

                  )
                  : (

                    <div className="recommendation-item">

                      <div className="recommendation-check">
                        ✓
                      </div>

                      <p>
                        建議持續維持良好的生活與健康習慣。
                      </p>

                    </div>

                  )
              }

            </div>

          </section>


          {/* =================================
              高風險 / 健檢提醒
          ================================== */}

          <section className="result-medical-reminder">

            <div className="medical-reminder-icon">
              +
            </div>


            <div>

              <h4>
                正式判定仍需要健康檢查
              </h4>


              <p>
                本工具未使用完整的血壓、血糖、
                血脂等健檢資料，因此結果只能作為初步風險篩檢。
                若結果顯示風險較高，
                建議進一步安排健康檢查或諮詢醫療人員。
              </p>

            </div>

          </section>


          {/* =================================
              Disclaimer
          ================================== */}

          <section className="result-disclaimer">

            <div className="disclaimer-icon">
              !
            </div>


            <div>

              <h4>
                重要提醒
              </h4>


              <p>

                {
                  result.disclaimer ||
                  (
                    "本工具僅提供初步健康風險篩檢，"
                    + "不是醫療診斷，也不預測未來是否一定會罹病。"
                    + "如已有完整健檢結果，"
                    + "應以健檢報告或醫師說明為準。"
                  )
                }

              </p>

            </div>

          </section>

        </section>


        {/* ===================================
            Buttons
        ==================================== */}

        <div className="result-actions">


          <button
            type="button"
            className="result-restart-button"
            onClick={handleRestart}
          >
            重新進行評估
          </button>


          <button
            type="button"
            className="result-finish-button"
            onClick={handleFinish}
          >
            完成並返回首頁

            <span>
              →
            </span>
          </button>

        </div>

      </main>

    </div>
  );
}


export default MetabolicResult;