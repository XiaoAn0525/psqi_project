import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./MetabolicConfirm.css";


function MetabolicConfirm() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(false);

  const [submitError, setSubmitError] = useState("");


  // =========================================
  // 讀取之前填寫的資料
  // =========================================

  useEffect(() => {
    const savedData = sessionStorage.getItem(
      "metabolicScreeningData"
    );

    // 沒有資料就回基本資料頁
    if (!savedData) {
      navigate("/metabolic/basic");
      return;
    }

    try {
      const parsedData = JSON.parse(savedData);

      setData(parsedData);
    } catch (error) {
      console.error(
        "讀取 metabolicScreeningData 失敗：",
        error
      );

      sessionStorage.removeItem(
        "metabolicScreeningData"
      );

      navigate("/metabolic/basic");
    }
  }, [navigate]);


  // =========================================
  // 資料顯示文字
  // =========================================

  const sexText = {
    male: "男性",
    female: "女性",
  };


  const smokingText = {
    never: "不抽",
    passive: "不抽，但經常吸二手煙",
    former: "以前抽，現已戒煙",
    occasional: "偶爾抽",
    daily: "每天抽",
  };


  const exerciseText = {
    daily_or_more: "每天 1 次以上",
    weekly_4_6: "每週 4–6 次",
    weekly_2_3: "每週 2–3 次",
    weekly_once: "每週 1 次",
    rare_or_none: "不運動或每週少於 1 次",
  };


  const drinkingText = {
    never_or_lt_weekly: "不喝或每週少於 1 次",
    former: "以前喝，現已戒酒",
    weekly_1_2: "每週 1–2 次",
    weekly_3_4: "每週 3–4 次",
    weekly_5_6: "每週 5–6 次",
    daily: "每天喝",
  };


  const betelText = {
    never: "不嚼",
    former: "以前嚼，現已戒",
    weekly_1_3: "每週 1~3 次",
    weekly_4_5: "每週 4~5 次",
    weekly_6_or_daily: "每週 6 次或每天嚼",
  };


  const vegetableText = {
  lt_half_bowl: "不吃或每天少於半碗",
  half_to_one_bowl: "每天半碗～1碗以內",
  one_to_1_5_bowls: "每天1碗～1碗半以內",
  one_5_to_two_bowls: "每天1碗半～2碗以內",
  gte_two_bowls: "每天2碗或以上",
};

  const fruitText = {
    never: "從來沒有",
    occasionally: "偶爾",
    often: "經常",
    always: "總是",
  };

  const friedFoodText = {
    lt_weekly: "不吃或每週少於1次",
    weekly_2_3: "每週2～3次",
    weekly_4_5: "每週4～5次",
    weekly_6_or_daily: "每週6次或每天吃",
  };

  const sauceText = {
    never: "從來沒有",
    occasionally: "偶爾",
    often: "經常",
    always: "總是",
  };

  const getBmi = () => {
    if (!data) {
      return "-";
    }

    const heightCm = Number(data.height_cm);
    const weightKg = Number(data.weight_kg);

    if (!heightCm || !weightKg) {
      return "-";
    }

    const heightM = heightCm / 100;

    return (
      weightKg /
      (heightM * heightM)
    ).toFixed(1);
  };

  // =========================================
  // 睡眠分類
  // =========================================

  const getSleepCategory = () => {
    if (!data) {
      return "-";
    }

    const hours = Number(data.sleep_hours);

    if (hours < 4) {
      return "少於 4 小時";
    }

    if (hours < 6) {
      return "4～未滿 6 小時";
    }

    if (hours < 8) {
      return "6～未滿 8 小時";
    }

    return "8 小時以上";
  };


  // =========================================
  // 送出資料到 Django
  // =========================================

  const handleSubmit = async () => {
    if (!data) {
      return;
    }

    try {
      setLoading(true);

      setSubmitError("");


      // =====================================
      // 準備送給 Django 的資料
      // =====================================

      const sendData = {
        age: Number(data.age),

        sex: data.sex,

        height_cm: Number(data.height_cm),

        weight_kg: Number(data.weight_kg),

        sleep_hours: Number(data.sleep_hours),

        smoking_status:data.smoking_status,

        drinking_status:data.drinking_status,

        betel_status:data.betel_status,

        exercise_frequency:data.exercise_frequency,

        vegetable_intake:data.vegetable_intake,

        fruit_intake:data.fruit_intake,

        fried_processed_food:data.fried_processed_food,

        salty_sauce_habit:data.salty_sauce_habit,

        waist_cm:
          data.waist_skipped === true
            ? null
            : Number(data.waist_cm),
      };


      console.log(
        "送給 Django 的代謝症候群資料：",
        sendData
      );


      // =====================================
      // POST Django
      // =====================================

      const response = await axios.post(
        "http://127.0.0.1:8000/api/model/predict/",
        sendData
      );


      console.log(
        "Django 回傳結果：",
        response.data
      );


      // =====================================
      // 儲存評估結果
      // =====================================

      sessionStorage.setItem(
        "metabolicResult",
        JSON.stringify(
          response.data
        )
      );


      // =====================================
      // 前往結果頁
      // =====================================

      navigate(
        "/metabolic/result"
      );

    } catch (error) {

      console.error(
        "代謝症候群評估送出失敗：",
        error
      );


      // Django 有回傳 error
      if (
        error.response &&
        error.response.data &&
        error.response.data.error
      ) {
        setSubmitError(
          error.response.data.error
        );
      }

      // Django 回傳其他格式
      else if (
        error.response &&
        error.response.data
      ) {
        setSubmitError(
          "後端回傳錯誤，請重新確認填寫資料。"
        );
      }

      // Django 完全沒有回應
      else if (error.request) {
        setSubmitError(
          "無法連線到 Django 後端，請確認後端伺服器是否已啟動。"
        );
      }

      // 其他錯誤
      else {
        setSubmitError(
          "送出資料時發生錯誤，請稍後再試。"
        );
      }

    } finally {

      setLoading(false);

    }
  };


  // =========================================
  // 等待資料讀取
  // =========================================

  if (!data) {
    return (
      <div
        className="confirm-page"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p>
          正在讀取資料...
        </p>
      </div>
    );
  }


  return (
    <div className="confirm-page">

      {/* =====================================
          Header
      ====================================== */}

      <header className="confirm-header">

        <div className="confirm-header-inner">

          <button
            type="button"
            className="confirm-back-home"
            onClick={() =>
              navigate("/")
            }
            disabled={loading}
          >
            ← 返回首頁
          </button>


          <div className="confirm-brand">

            <div className="confirm-brand-icon">
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


          <div className="confirm-header-space"></div>

        </div>

      </header>


      {/* =====================================
          Main
      ====================================== */}

      <main className="confirm-main">


        {/* ===================================
            進度條
        ==================================== */}

        <section className="screening-progress">

          <div className="progress-top">

            <span>
              篩檢進度
            </span>

            <span>
              步驟 5 / 5
            </span>

          </div>


          <div className="progress-bar-bg">

            <div
              className="progress-bar-fill step-five"
            ></div>

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

            <span>
              腰圍
            </span>

            <span className="active">
              確認
            </span>

          </div>

        </section>


        {/* ===================================
            Title
        ==================================== */}

        <section className="confirm-title">

          <div className="confirm-step-badge">
            STEP 05
          </div>


          <h2>
            確認填寫資料
          </h2>


          <p>
            請再次確認以下資料是否正確。
            如果需要修改，可以返回對應的步驟重新填寫。
          </p>

        </section>


        {/* ===================================
            基本資料
        ==================================== */}

        <section className="confirm-card">

          <div className="confirm-card-header">

            <div className="confirm-card-icon">
              01
            </div>


            <div>

              <span>
                BASIC INFORMATION
              </span>

              <h3>
                基本資料
              </h3>

            </div>


            <button
              type="button"
              className="edit-section-button"
              disabled={loading}
              onClick={() =>
                navigate(
                  "/metabolic/basic"
                )
              }
            >
              修改
            </button>

          </div>


          <div className="confirm-grid">


            <div className="confirm-item">

              <span>
                年齡
              </span>

              <strong>
                {data.age ?? "-"} 歲
              </strong>

            </div>


            <div className="confirm-item">

              <span>
                性別
              </span>

              <strong>
                {
                  sexText[
                    data.sex
                  ] || "-"
                }
              </strong>

            </div>


            <div className="confirm-item">

              <span>
                身高
              </span>

              <strong>
                {data.height_cm ?? "-"} cm
              </strong>

            </div>


            <div className="confirm-item">

              <span>
                體重
              </span>

              <strong>
                {data.weight_kg ?? "-"} kg
              </strong>

            </div>


            <div className="confirm-item highlight-item">

              <span>
                BMI
              </span>

              <strong>
                {getBmi()}
              </strong>

            </div>

          </div>

        </section>


        {/* ===================================
            睡眠
        ==================================== */}

        <section className="confirm-card">

          <div className="confirm-card-header">

            <div className="confirm-card-icon sleep">
              02
            </div>


            <div>

              <span>
                SLEEP
              </span>

              <h3>
                睡眠資料
              </h3>

            </div>


            <button
              type="button"
              className="edit-section-button"
              disabled={loading}
              onClick={() =>
                navigate(
                  "/metabolic/sleep"
                )
              }
            >
              修改
            </button>

          </div>


          <div className="confirm-grid">


            <div className="confirm-item">

              <span>
                每日平均睡眠
              </span>

              <strong>
                {data.sleep_hours ?? "-"} 小時
              </strong>

            </div>


            <div className="confirm-item highlight-item">

              <span>
                睡眠分類
              </span>

              <strong>
                {getSleepCategory()}
              </strong>

            </div>

          </div>

        </section>


        {/* ===================================
            生活型態
        ==================================== */}

        <section className="confirm-card">

          <div className="confirm-card-header">

            <div className="confirm-card-icon">
              03
            </div>


            <div>

              <span>
                LIFESTYLE
              </span>

              <h3>
                生活型態
              </h3>

            </div>


            <button
              type="button"
              className="edit-section-button"
              disabled={loading}
              onClick={() =>
                navigate(
                  "/metabolic/lifestyle"
                )
              }
            >
              修改
            </button>

          </div>


          <div
            className="
              confirm-grid
              lifestyle-confirm-grid
            "
          >


            <div className="confirm-item">

              <span>
                抽菸
              </span>

              <strong>
                {smokingText[data.smoking_status] || "-"}
              </strong>

            </div>


            <div className="confirm-item">

              <span>
                運動
              </span>

              <strong>
                {exerciseText[data.exercise_frequency] || "-"}
              </strong>

            </div>


            <div className="confirm-item">

              <span>
                飲酒
              </span>

              <strong>
                {drinkingText[data.drinking_status] || "-"}
              </strong>

            </div>


            <div className="confirm-item">

              <span>
                檳榔
              </span>

              <strong>
                {betelText[data.betel_status] || "-"}
              </strong>

            </div>
            
            <div className="confirm-item">

              <span>
                蔬菜
              </span>

              <strong>
                {vegetableText[data.vegetable_intake] || "-"}
              </strong>

            </div>

            <div className="confirm-item">

              <span>
                水果
              </span>

              <strong>
                {fruitText[data.fruit_intake] || "-"}
              </strong>

            </div>

            <div className="confirm-item">

              <span>
                煎、炸、加工食品
              </span>

              <strong>
                {friedFoodText[data.fried_processed_food] || "-"}
              </strong>

            </div>

            <div className="confirm-item">

              <span>
                沾醬習慣
              </span>

              <strong>
                {sauceText[data.salty_sauce_habit] || "-"}
              </strong>

            </div>

          </div>

        </section>


        {/* ===================================
            腰圍
        ==================================== */}

        <section className="confirm-card">

          <div className="confirm-card-header">

            <div className="confirm-card-icon">
              04
            </div>


            <div>

              <span>
                WAIST
              </span>

              <h3>
                腰圍
              </h3>

            </div>


            <button
              type="button"
              className="edit-section-button"
              disabled={loading}
              onClick={() =>
                navigate(
                  "/metabolic/waist"
                )
              }
            >
              修改
            </button>

          </div>


          <div className="confirm-grid">

            <div className="confirm-item">

              <span>
                腰圍
              </span>

              <strong>
                {
                  data.waist_skipped === true ||
                  data.waist_cm === null ||
                  data.waist_cm === undefined ||
                  data.waist_cm === ""
                    ? "未填寫"
                    : `${data.waist_cm} cm`
                }
              </strong>

            </div>

          </div>

        </section>


        {/* ===================================
            送出提醒
        ==================================== */}

        <section className="confirm-notice">

          <div className="confirm-notice-icon">
            i
          </div>


          <div>

            <h4>
              送出前請再次確認
            </h4>


            <p>
              按下「送出並進行風險評估」後，
              系統會將上述資料送至後端進行計算。
              本工具僅供健康風險篩檢使用，
              結果不能取代正式健檢或醫師診斷。
            </p>

          </div>

        </section>


        {/* ===================================
            後端錯誤訊息
        ==================================== */}

        {submitError && (

          <div
            style={{
              marginTop: "16px",

              padding:
                "14px 16px",

              border:
                "1px solid #efcaca",

              borderRadius:
                "11px",

              background:
                "#fff4f4",

              color:
                "#c05555",

              fontSize:
                "11px",

              lineHeight:
                "1.6",

              textAlign:
                "left",
            }}
          >
            <strong>
              無法完成評估
            </strong>

            <div
              style={{
                marginTop: "3px",
              }}
            >
              {submitError}
            </div>
          </div>

        )}


        {/* ===================================
            Buttons
        ==================================== */}

        <div className="confirm-actions">


          <button
            type="button"
            className="confirm-prev-button"
            disabled={loading}
            onClick={() =>
              navigate(
                "/metabolic/waist"
              )
            }
          >
            ← 上一步
          </button>


          <button
            type="button"
            className="confirm-submit-button"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              opacity:
                loading
                  ? 0.7
                  : 1,

              cursor:
                loading
                  ? "not-allowed"
                  : "pointer",
            }}
          >

            {loading ? (

              <>
                正在進行風險評估...
              </>

            ) : (

              <>
                送出並進行風險評估
                <span>
                  →
                </span>
              </>

            )}

          </button>

        </div>

      </main>

    </div>
  );
}


export default MetabolicConfirm;