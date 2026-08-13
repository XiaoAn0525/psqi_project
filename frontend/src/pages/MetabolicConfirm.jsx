import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

  const genderText = {
    male: "男性",
    female: "女性",
  };


  const smokingText = {
    never: "沒有",
    current: "有",
    former: "已戒菸",
  };


  const exerciseText = {
    rare: "幾乎沒有",
    "1_2": "每週 1–2 次",
    "3_plus": "每週 3 次以上",
  };


  const alcoholText = {
    never: "沒有",
    current: "有",
    former: "已戒酒",
  };


  const betelNutText = {
    never: "沒有",
    current: "有",
    former: "已戒",
  };


  const dietText = {
    rare: "很少",
    sometimes: "有時",
    often: "經常",
  };


  // =========================================
  // 睡眠分類
  // =========================================

  const getSleepCategory = () => {
    if (!data) {
      return "-";
    }

    const hours = Number(
      data.sleep_hours
    );

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
        age: data.age,

        gender: data.gender,

        height: data.height,

        weight: data.weight,

        bmi: data.bmi,

        sleep_hours: data.sleep_hours,

        smoking: data.smoking,

        exercise: data.exercise,

        alcohol: data.alcohol,

        betel_nut: data.betel_nut,

        diet: data.diet,

        waist:
          data.waist_skipped === true
            ? null
            : data.waist,
      };


      console.log(
        "送給 Django 的代謝症候群資料：",
        sendData
      );


      // =====================================
      // POST Django
      // =====================================

      const response = await axios.post(
        "http://127.0.0.1:8000/api/metabolic/predict/",
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
                  genderText[
                    data.gender
                  ] || "-"
                }
              </strong>

            </div>


            <div className="confirm-item">

              <span>
                身高
              </span>

              <strong>
                {data.height ?? "-"} cm
              </strong>

            </div>


            <div className="confirm-item">

              <span>
                體重
              </span>

              <strong>
                {data.weight ?? "-"} kg
              </strong>

            </div>


            <div className="confirm-item highlight-item">

              <span>
                BMI
              </span>

              <strong>
                {data.bmi ?? "-"}
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
                {
                  smokingText[
                    data.smoking
                  ] || "-"
                }
              </strong>

            </div>


            <div className="confirm-item">

              <span>
                運動
              </span>

              <strong>
                {
                  exerciseText[
                    data.exercise
                  ] || "-"
                }
              </strong>

            </div>


            <div className="confirm-item">

              <span>
                飲酒
              </span>

              <strong>
                {
                  alcoholText[
                    data.alcohol
                  ] || "-"
                }
              </strong>

            </div>


            <div className="confirm-item">

              <span>
                檳榔
              </span>

              <strong>
                {
                  betelNutText[
                    data.betel_nut
                  ] || "-"
                }
              </strong>

            </div>


            <div className="confirm-item">

              <span>
                高油、高糖或高熱量食物
              </span>

              <strong>
                {
                  dietText[
                    data.diet
                  ] || "-"
                }
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
                  data.waist === null ||
                  data.waist === undefined ||
                  data.waist === ""
                    ? "未填寫"
                    : `${data.waist} cm`
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