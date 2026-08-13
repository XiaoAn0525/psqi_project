import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">

      {/* ================= Header ================= */}
      <header className="home-header">
        <div className="home-header-inner">

          <div className="brand">
            <div className="brand-logo">
              <span>✦</span>
            </div>

            <div className="brand-text">
              <h1>睡眠與代謝健康評估系統</h1>
              <p>Sleep & Metabolic Health Assessment</p>
            </div>
          </div>

          <div className="header-tag">
            健康評估平台
          </div>

        </div>
      </header>


      {/* ================= Main ================= */}
      <main className="home-main">

        {/* Hero */}
        <section className="home-hero">

          <div className="hero-small-title">
            <span className="hero-dot"></span>
            個人健康風險評估
          </div>

          <h2>
            從睡眠開始，
            <br />
            <span>了解你的健康狀況</span>
          </h2>

          <p>
            透過睡眠品質與生活型態相關資料，
            協助您初步了解自己的睡眠品質以及代謝健康風險。
          </p>

          <div className="hero-features">

            <div className="hero-feature">
              <span>✓</span>
              快速評估
            </div>

            <div className="hero-feature">
              <span>✓</span>
              健康分析
            </div>

            <div className="hero-feature">
              <span>✓</span>
              個人化結果
            </div>

          </div>

        </section>


        {/* ================= 功能 ================= */}
        <section className="assessment-section">

          <div className="section-heading">
            <span>ASSESSMENT</span>
            <h3>選擇你的健康評估</h3>
            <p>
              選擇下方其中一項功能開始進行評估
            </p>
          </div>


          <div className="assessment-grid">

            {/* PSQI */}
            <article className="assessment-card sleep-card">

              <div className="card-top">

                <div className="assessment-icon sleep-icon">
                  🌙
                </div>

                <span className="assessment-badge sleep-badge">
                  睡眠評估
                </span>

              </div>


              <div className="assessment-content">

                <h4>
                  PSQI 睡眠品質評估
                </h4>

                <p>
                  透過匹茲堡睡眠品質指數（PSQI），
                  評估近一個月的睡眠品質、睡眠時間與睡眠相關狀況。
                </p>


                <div className="assessment-details">

                  <div>
                    <span className="detail-check">✓</span>
                    睡眠品質分析
                  </div>

                  <div>
                    <span className="detail-check">✓</span>
                    睡眠狀況評分
                  </div>

                  <div>
                    <span className="detail-check">✓</span>
                    查看評估結果
                  </div>

                </div>

              </div>


              <button
                className="assessment-button sleep-button"
                onClick={() => navigate("/psqi")}
              >
                <span>開始睡眠評估</span>
                <span className="button-arrow">→</span>
              </button>

            </article>


            {/* 代謝症候群 */}
            <article className="assessment-card metabolic-card">

              <div className="recommended">
                推薦
              </div>

              <div className="card-top">

                <div className="assessment-icon metabolic-icon">
                  ♥
                </div>

                <span className="assessment-badge metabolic-badge">
                  風險篩檢
                </span>

              </div>


              <div className="assessment-content">

                <h4>
                  代謝症候群風險篩檢
                </h4>

                <p>
                  根據基本資料、睡眠時間與生活型態，
                  協助您初步評估代謝症候群的可能風險。
                </p>


                <div className="assessment-details">

                  <div>
                    <span className="detail-check">✓</span>
                    BMI 與體位分析
                  </div>

                  <div>
                    <span className="detail-check">✓</span>
                    生活型態評估
                  </div>

                  <div>
                    <span className="detail-check">✓</span>
                    代謝風險預測
                  </div>

                </div>

              </div>


              <button
                className="assessment-button metabolic-button"
                onClick={() => navigate("/metabolic")}
              >
                <span>開始風險篩檢</span>
                <span className="button-arrow">→</span>
              </button>

            </article>

          </div>

        </section>


        {/* ================= 提醒 ================= */}
        <section className="health-notice">

          <div className="notice-symbol">
            i
          </div>

          <div className="notice-content">
            <h4>健康提醒</h4>

            <p>
              本系統提供之評估結果僅供健康管理與研究參考，
              不可取代專業醫療診斷。如有健康疑慮，
              請諮詢醫師或相關醫療專業人員。
            </p>
          </div>

        </section>

      </main>


      {/* ================= Footer ================= */}
      <footer className="home-footer">

        <div className="footer-line"></div>

        <p>
          睡眠與代謝健康評估系統
        </p>

        <span>
          Sleep & Metabolic Health Assessment
        </span>

      </footer>

    </div>
  );
}

export default Home;