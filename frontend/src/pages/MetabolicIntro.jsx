import { useNavigate } from "react-router-dom";
import "./MetabolicIntro.css";

function MetabolicIntro() {
  const navigate = useNavigate();

  return (
    <div className="metabolic-intro-page">

      {/* Header */}
      <header className="metabolic-header">
        <div className="metabolic-header-inner">

          <button
            type="button"
            className="back-home-button"
            onClick={() => navigate("/")}
          >
            <span>←</span>
            返回首頁
          </button>

          <div className="metabolic-brand">
            <div className="metabolic-brand-icon">
              ♥
            </div>

            <div>
              <h1>代謝症候群風險篩檢</h1>
              <p>Metabolic Syndrome Risk Screening</p>
            </div>
          </div>

          <div className="header-placeholder"></div>

        </div>
      </header>


      {/* Main */}
      <main className="metabolic-intro-main">

        {/* 上方標題 */}
        <section className="intro-hero">

          <div className="intro-badge">
            <span></span>
            開始篩檢前
          </div>

          <h2>
            代謝症候群
            <span>風險篩檢說明</span>
          </h2>

          <p>
            在開始填寫資料之前，請先閱讀以下說明，
            了解本工具的用途與限制。
          </p>

        </section>


        {/* 主要說明卡 */}
        <section className="intro-card">

          <div className="intro-card-heading">

            <div className="heading-icon">
              i
            </div>

            <div>
              <span>ABOUT THIS TOOL</span>
              <h3>這個工具可以做什麼？</h3>
            </div>

          </div>


          <div className="intro-description">
            <p>
              本工具會根據你輸入的
              <strong>基本資料、睡眠時數與生活型態</strong>，
              估計你目前可能符合代謝症候群的風險。
            </p>

            <p>
              此工具不需要輸入抽血資料，但也不能取代正式健檢或醫師診斷。
              若結果顯示風險偏高，建議進一步安排健檢或諮詢醫療人員。
            </p>
          </div>


          {/* 重點說明 */}
          <div className="intro-points">

            <div className="intro-point positive-point">

              <div className="point-icon">
                ✓
              </div>

              <div className="point-text">
                <h4>風險篩檢工具</h4>

                <p>
                  本工具的用途是協助進行初步健康風險篩檢，
                  讓你了解目前可能存在的代謝症候群風險。
                </p>
              </div>

            </div>


            <div className="intro-point warning-point">

              <div className="point-icon">
                !
              </div>

              <div className="point-text">
                <h4>不是醫療診斷</h4>

                <p>
                  篩檢結果不能用來判定你是否患有代謝症候群，
                  也不能取代醫師的專業判斷。
                </p>
              </div>

            </div>


            <div className="intro-point warning-point">

              <div className="point-icon">
                !
              </div>

              <div className="point-text">
                <h4>不預測未來是否罹病</h4>

                <p>
                  本工具評估的是目前資料所反映的風險，
                  並不是預測未來一定會或不會罹患疾病。
                </p>
              </div>

            </div>


            <div className="intro-point data-point">

              <div className="point-icon">
                ↗
              </div>

              <div className="point-text">
                <h4>不需要輸入健檢數值</h4>

                <p>
                  進行此篩檢時，不需要提供血糖、血脂或血壓等健檢資料。
                </p>
              </div>

            </div>

          </div>

        </section>


        {/* 需要填寫資料 */}
        <section className="input-preview">

          <div className="preview-heading">
            <span>接下來需要填寫</span>
            <h3>篩檢會使用哪些資料？</h3>
          </div>


          <div className="preview-grid">

            <div className="preview-item">

              <div className="preview-number">
                01
              </div>

              <div>
                <h4>基本資料</h4>
                <p>年齡、性別、身高與體重</p>
              </div>

            </div>


            <div className="preview-item">

              <div className="preview-number">
                02
              </div>

              <div>
                <h4>睡眠時數</h4>
                <p>每日平均睡眠時間</p>
              </div>

            </div>


            <div className="preview-item">

              <div className="preview-number">
                03
              </div>

              <div>
                <h4>生活型態</h4>
                <p>活動、吸菸與飲酒狀況</p>
              </div>

            </div>


            <div className="preview-item">

              <div className="preview-number">
                04
              </div>

              <div>
                <h4>腰圍</h4>
                <p>可選填，不知道也可以繼續</p>
              </div>

            </div>

          </div>

        </section>


        {/* 健檢提醒 */}
        <section className="medical-report-notice">

          <div className="medical-notice-icon">
            +
          </div>

          <div className="medical-notice-content">

            <h3>
              已經有完整健檢資料嗎？
            </h3>

            <p>
              如果你已經有血糖、血脂、血壓、腰圍等完整健檢數值，
              應以
              <strong>正式健檢報告或醫師說明</strong>
              為準。本系統的風險篩檢結果不應取代正式檢查結果。
            </p>

          </div>

        </section>


        {/* 操作按鈕 */}
        <section className="intro-actions">

          <button
            type="button"
            className="intro-back-button"
            onClick={() => navigate("/")}
          >
            <span>←</span>
            返回首頁
          </button>


          <button
            type="button"
            className="intro-start-button"
            onClick={() => navigate("/metabolic/basic")}
          >
            <span>我了解，開始填寫</span>
            <span className="start-arrow">→</span>
          </button>

        </section>


        <p className="intro-bottom-note">
          點選「我了解，開始填寫」即表示你已閱讀並了解上述說明。
        </p>

      </main>

    </div>
  );
}

export default MetabolicIntro;