import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MetabolicLifestyle.css";

function MetabolicLifestyle() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    smoking: "",
    exercise: "",
    alcohol: "",
    betel_nut: "",
    diet: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const savedData = sessionStorage.getItem(
      "metabolicScreeningData"
    );

    if (savedData) {
      const parsedData = JSON.parse(savedData);

      setForm({
        smoking: parsedData.smoking || "",
        exercise: parsedData.exercise || "",
        alcohol: parsedData.alcohol || "",
        betel_nut: parsedData.betel_nut || "",
        diet: parsedData.diet || "",
      });
    }
  }, []);

  const selectOption = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.smoking) {
      newErrors.smoking = "請選擇目前的抽菸狀況";
    }

    if (!form.exercise) {
      newErrors.exercise = "請選擇每週運動頻率";
    }

    if (!form.alcohol) {
      newErrors.alcohol = "請選擇目前的飲酒狀況";
    }

    if (!form.betel_nut) {
      newErrors.betel_nut = "請選擇目前的檳榔使用狀況";
    }

    if (!form.diet) {
      newErrors.diet = "請選擇目前的飲食狀況";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
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
      ...form,
    };

    sessionStorage.setItem(
      "metabolicScreeningData",
      JSON.stringify(updatedData)
    );

    navigate("/metabolic/waist");
  };

  const OptionButton = ({
    field,
    value,
    title,
    description,
  }) => {
    const selected = form[field] === value;

    return (
      <button
        type="button"
        className={
          selected
            ? "lifestyle-choice selected"
            : "lifestyle-choice"
        }
        onClick={() => selectOption(field, value)}
      >
        <div className="choice-text">
          <strong>{title}</strong>

          {description && (
            <span>{description}</span>
          )}
        </div>

        <div className="choice-radio"></div>
      </button>
    );
  };

  return (
    <div className="lifestyle-page">

      {/* Header */}
      <header className="lifestyle-header">
        <div className="lifestyle-header-inner">

          <button
            type="button"
            className="lifestyle-back-home"
            onClick={() => navigate("/")}
          >
            ← 返回首頁
          </button>

          <div className="lifestyle-brand">

            <div className="lifestyle-brand-icon">
              ♥
            </div>

            <div>
              <h1>代謝症候群風險篩檢</h1>

              <p>
                Metabolic Syndrome Risk Screening
              </p>
            </div>

          </div>

          <div className="lifestyle-header-space"></div>

        </div>
      </header>


      <main className="lifestyle-main">

        {/* 進度 */}
        <section className="screening-progress">

          <div className="progress-top">
            <span>篩檢進度</span>
            <span>步驟 3 / 5</span>
          </div>

          <div className="progress-bar-bg">
            <div className="progress-bar-fill step-three"></div>
          </div>

          <div className="progress-labels">
            <span>基本資料</span>
            <span>睡眠</span>
            <span className="active">
              生活型態
            </span>
            <span>腰圍</span>
            <span>確認</span>
          </div>

        </section>


        {/* 標題 */}
        <section className="lifestyle-title">

          <div className="lifestyle-step-badge">
            STEP 03
          </div>

          <h2>生活型態</h2>

          <p>
            請依照目前平常的生活習慣填寫。
            生活型態資料將作為代謝症候群風險評估的一部分。
          </p>

        </section>


        <form
          className="lifestyle-form-card"
          onSubmit={handleNext}
        >

          <div className="lifestyle-card-heading">

            <div className="lifestyle-heading-icon">
              03
            </div>

            <div>
              <span>LIFESTYLE</span>
              <h3>生活型態資料</h3>
            </div>

          </div>


          {/* =========================
              10.1 抽菸
          ========================== */}
          <div className="lifestyle-question">

            <div className="question-heading">

              <div className="question-number">
                1
              </div>

              <div>
                <h4>
                  你目前是否有抽菸？
                  <span>*</span>
                </h4>

                <p>
                  請依目前的抽菸狀況選擇。
                </p>
              </div>

            </div>


            <div className="choice-grid three-choice-grid">

              <OptionButton
                field="smoking"
                value="never"
                title="沒有"
                description="目前沒有抽菸"
              />

              <OptionButton
                field="smoking"
                value="current"
                title="有"
                description="目前仍有抽菸"
              />

              <OptionButton
                field="smoking"
                value="former"
                title="已戒菸"
                description="過去曾抽菸，目前已戒"
              />

            </div>

            {errors.smoking && (
              <p className="lifestyle-error">
                {errors.smoking}
              </p>
            )}

          </div>


          <div className="question-divider"></div>


          {/* =========================
              10.2 運動
          ========================== */}
          <div className="lifestyle-question">

            <div className="question-heading">

              <div className="question-number">
                2
              </div>

              <div>
                <h4>
                  你每週運動頻率大約為？
                  <span>*</span>
                </h4>

                <p>
                  請選擇最接近你平常狀況的頻率。
                </p>
              </div>

            </div>


            <div className="choice-grid three-choice-grid">

              <OptionButton
                field="exercise"
                value="rare"
                title="幾乎沒有"
                description="平常幾乎沒有固定運動"
              />

              <OptionButton
                field="exercise"
                value="1_2"
                title="每週 1–2 次"
                description="每週約進行一至兩次運動"
              />

              <OptionButton
                field="exercise"
                value="3_plus"
                title="每週 3 次以上"
                description="每週規律運動三次以上"
              />

            </div>

            {errors.exercise && (
              <p className="lifestyle-error">
                {errors.exercise}
              </p>
            )}

          </div>


          <div className="question-divider"></div>


          {/* =========================
              10.3 飲酒
          ========================== */}
          <div className="lifestyle-question">

            <div className="question-heading">

              <div className="question-number">
                3
              </div>

              <div>
                <h4>
                  你目前是否有飲酒習慣？
                  <span>*</span>
                </h4>

                <p>
                  請依目前的飲酒狀況選擇。
                </p>
              </div>

            </div>


            <div className="choice-grid three-choice-grid">

              <OptionButton
                field="alcohol"
                value="never"
                title="沒有"
                description="目前沒有飲酒習慣"
              />

              <OptionButton
                field="alcohol"
                value="current"
                title="有"
                description="目前有飲酒習慣"
              />

              <OptionButton
                field="alcohol"
                value="former"
                title="已戒酒"
                description="過去有飲酒，目前已戒"
              />

            </div>

            {errors.alcohol && (
              <p className="lifestyle-error">
                {errors.alcohol}
              </p>
            )}

          </div>


          <div className="question-divider"></div>


          {/* =========================
              10.4 檳榔
          ========================== */}
          <div className="lifestyle-question">

            <div className="question-heading">

              <div className="question-number">
                4
              </div>

              <div>
                <h4>
                  你目前是否有嚼檳榔習慣？
                  <span>*</span>
                </h4>

                <p>
                  請依目前的檳榔使用狀況選擇。
                </p>
              </div>

            </div>


            <div className="choice-grid three-choice-grid">

              <OptionButton
                field="betel_nut"
                value="never"
                title="沒有"
                description="目前沒有嚼檳榔"
              />

              <OptionButton
                field="betel_nut"
                value="current"
                title="有"
                description="目前仍有嚼檳榔"
              />

              <OptionButton
                field="betel_nut"
                value="former"
                title="已戒"
                description="過去有使用，目前已戒"
              />

            </div>

            {errors.betel_nut && (
              <p className="lifestyle-error">
                {errors.betel_nut}
              </p>
            )}

          </div>


          <div className="question-divider"></div>


          {/* =========================
              10.5 飲食
          ========================== */}
          <div className="lifestyle-question">

            <div className="question-heading">

              <div className="question-number">
                5
              </div>

              <div>
                <h4>
                  你是否經常攝取高油、高糖或高熱量食物？
                  <span>*</span>
                </h4>

                <p>
                  此題目前為前端示意，
                  最終題目及 coding 需依模型訓練資料確認。
                </p>
              </div>

            </div>


            <div className="choice-grid three-choice-grid">

              <OptionButton
                field="diet"
                value="rare"
                title="很少"
                description="平常較少攝取"
              />

              <OptionButton
                field="diet"
                value="sometimes"
                title="有時"
                description="偶爾會攝取"
              />

              <OptionButton
                field="diet"
                value="often"
                title="經常"
                description="經常攝取"
              />

            </div>

            {errors.diet && (
              <p className="lifestyle-error">
                {errors.diet}
              </p>
            )}

          </div>


          {/* Coding 提醒 */}
          <div className="lifestyle-model-note">

            <div className="model-note-icon">
              !
            </div>

            <div>
              <strong>
                模型 Coding 尚待確認
              </strong>

              <p>
                目前選項為前端設計版本。
                正式串接預測模型時，
                抽菸、運動、飲酒、檳榔及飲食的選項與數值 coding
                必須與模型訓練資料完全一致。
              </p>
            </div>

          </div>


          {/* 按鈕 */}
          <div className="lifestyle-actions">

            <button
              type="button"
              className="lifestyle-prev-button"
              onClick={() =>
                navigate("/metabolic/sleep")
              }
            >
              ← 上一步
            </button>

            <button
              type="submit"
              className="lifestyle-next-button"
            >
              下一步：腰圍
              <span>→</span>
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default MetabolicLifestyle;