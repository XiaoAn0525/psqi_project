import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MetabolicLifestyle.css";

function MetabolicLifestyle() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    smoking_status: "",
    drinking_status: "",
    betel_status: "",
    exercise_frequency: "",
    vegetable_intake: "",
    fruit_intake: "",
    fried_processed_food: "",
    salty_sauce_habit: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const savedData = sessionStorage.getItem(
      "metabolicScreeningData"
    );

    if (savedData) {
      const parsedData = JSON.parse(savedData);

      setForm({
        smoking_status: parsedData.smoking_status || "",
        drinking_status: parsedData.drinking_status || "",
        betel_status: parsedData.betel_status || "",
        exercise_frequency: parsedData.exercise_frequency || "",
        vegetable_intake: parsedData.vegetable_intake || "",
        fruit_intake: parsedData.fruit_intake || "",
        fried_processed_food: parsedData.fried_processed_food || "",
        salty_sauce_habit: parsedData.salty_sauce_habit || "",
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

    if (!form.smoking_status) {
    newErrors.smoking_status = "請選擇抽菸狀況";
    }

    if (!form.drinking_status) {
      newErrors.drinking_status = "請選擇飲酒狀況";
    }

    if (!form.betel_status) {
      newErrors.betel_status = "請選擇檳榔使用狀況";
    }

    if (!form.exercise_frequency) {
      newErrors.exercise_frequency = "請選擇運動頻率";
    }

    if (!form.vegetable_intake) {
      newErrors.vegetable_intake = "請選擇蔬菜攝取量";
    }

    if (!form.fruit_intake) {
      newErrors.fruit_intake = "請選擇水果攝取頻率";
    }

    if (!form.fried_processed_food) {
      newErrors.fried_processed_food = "請選擇煎炸加工食品攝取頻率";
    }

    if (!form.salty_sauce_habit) {
      newErrors.salty_sauce_habit = "請選擇沾醬習慣";
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
                  您目前是否有抽菸？
                  <span>*</span>
                </h4>

                <p>
                  請依目前的抽菸狀況選擇。
                </p>
              </div>

            </div>


            <div className="choice-grid three-choice-grid">

              <OptionButton
                field="smoking_status"
                value="never"
                title="不抽"
              />

              <OptionButton
                field="smoking_status"
                value="passive"
                title="不抽，但經常吸二手煙"
              />

              <OptionButton
                field="smoking_status"
                value="former"
                title="以前抽，現已戒煙"
              />

              <OptionButton
                field="smoking_status"
                value="occasional"
                title="偶爾抽"
              />

              <OptionButton
                field="smoking_status"
                value="daily"
                title="每天抽"
              />

            </div>

            {errors.smoking_status && (
              <p className="lifestyle-error">
                {errors.smoking_status}
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
                  您每週運動頻率大約為？
                  <span>*</span>
                </h4>

                <p>
                  請選擇最接近你平常狀況的頻率。
                </p>
              </div>

            </div>


            <div className="choice-grid three-choice-grid">

              <OptionButton
                field="exercise_frequency"
                value="daily_or_more"
                title="每天 1 次以上"
              />

              <OptionButton
                field="exercise_frequency"
                value="weekly_4_6"
                title="每週 4~6 次"
              />

              <OptionButton
                field="exercise_frequency"
                value="weekly_2_3"
                title="每週 2~3 次"
              />

              <OptionButton
                field="exercise_frequency"
                value="weekly_once"
                title="每週 1 次"
              />

              <OptionButton
                field="exercise_frequency"
                value="rare_or_none"
                title="不運動或每週少於 1 次"
              />

            </div>

            {errors.exercise_frequency && (
              <p className="lifestyle-error">
                {errors.exercise_frequency}
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
                  您目前是否有飲酒習慣？
                  <span>*</span>
                </h4>

                <p>
                  請依目前的飲酒狀況選擇。
                </p>
              </div>

            </div>


            <div className="choice-grid three-choice-grid">

              <OptionButton
                field="drinking_status"
                value="never_or_lt_weekly"
                title="不喝或每週少於 1 次"
              />

              <OptionButton
                field="drinking_status"
                value="former"
                title="以前喝，現已戒酒"
              />

              <OptionButton
                field="drinking_status"
                value="weekly_1_2"
                title="每週 1–2 次"
              />

              <OptionButton
                field="drinking_status"
                value="weekly_3_4"
                title="每週 3–4 次"
              />

              <OptionButton
                field="drinking_status"
                value="weekly_5_6"
                title="每週 5–6 次"
              />

              <OptionButton
                field="drinking_status"
                value="daily"
                title="每天喝"
              />

            </div>

            {errors.drinking_status && (
              <p className="lifestyle-error">
                {errors.drinking_status}
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
                  您目前是否有嚼檳榔習慣？
                  <span>*</span>
                </h4>

                <p>
                  請依目前的飲食狀況選擇。
                </p>
              </div>

            </div>


            <div className="choice-grid three-choice-grid">

              <OptionButton
                field="vegetable_intake"
                value="lt_half_bowl"
                title="不吃或每天少於半碗"
              />

              <OptionButton
                field="vegetable_intake"
                value="half_to_one_bowl"
                title="每天吃半碗～1碗以內"
              />

              <OptionButton
                field="vegetable_intake"
                value="one_to_1_5_bowls"
                title="每天吃1碗～1碗半以內"
              />

              <OptionButton
                field="vegetable_intake"
                value="one_5_to_two_bowls"
                title="每天吃1碗半～2碗以內"
              />

              <OptionButton
                field="vegetable_intake"
                value="gte_two_bowls"
                title="每天吃2碗或以上"
              />
            </div>

            {errors.vegetable_intake && (
              <p className="lifestyle-error">
                {errors.vegetable_intake}
              </p>
            )}

          </div>

          <div className="question-divider"></div>


          {/* =========================
              10.5 蔬菜
          ========================== */}
          <div className="lifestyle-question">

            <div className="question-heading">

              <div className="question-number">
                5
              </div>

              <div>
                <h4>
                  您一天會吃到多少蔬菜量？
                  <span>*</span>
                </h4>

                <p>
                  請依目前的檳榔使用狀況選擇。
                </p>
              </div>

            </div>


            <div className="choice-grid three-choice-grid">

              <OptionButton
                field="betel_status"
                value="never"
                title="不嚼"
              />

              <OptionButton
                field="betel_status"
                value="former"
                title="以前嚼，現已戒"
              />

              <OptionButton
                field="betel_status"
                value="weekly_1_3"
                title="每週 1–3 次"
              />

              <OptionButton
                field="betel_status"
                value="weekly_4_5"
                title="每週 4–5 次"
              />

              <OptionButton
                field="betel_status"
                value="weekly_6_or_daily"
                title="每週 6 次或每天嚼"
              />

            </div>

            {errors.betel_status && (
              <p className="lifestyle-error">
                {errors.betel_status}
              </p>
            )}

          </div>

          <div className="question-divider"></div>

          {/* =========================
              10.6 水果
          ========================== */}
          <div className="lifestyle-question">

            <div className="question-heading">

              <div className="question-number">
                6
              </div>

              <div>
                <h4>
                  您多常吃至少兩份水果？
                  <span>*</span>
                </h4>

                <p>
                  請依目前的飲食狀況選擇。
                </p>
              </div>

            </div>


            <div className="choice-grid three-choice-grid">

              <OptionButton
                field="fruit_intake"
                value="never"
                title="從來沒有"
              />

              <OptionButton
                field="fruit_intake"
                value="occasionally"
                title="偶爾"
              />

              <OptionButton
                field="fruit_intake"
                value="often"
                title="經常"
              />

              <OptionButton
                field="fruit_intake"
                value="always"
                title="總是"
              />
            </div>

            {errors.fruit_intake && (
              <p className="lifestyle-error">
                {errors.fruit_intake}
              </p>
            )}

          </div>

          <div className="question-divider"></div>

          {/* =========================
              10.7 煎炸等
          ========================== */}
          <div className="lifestyle-question">

            <div className="question-heading">

              <div className="question-number">
                7
              </div>

              <div>
                <h4>
                  您多常吃煎、炸、碳烤、煙燻製品食物？
                  <span>*</span>
                </h4>

                <p>
                  請依目前的飲食狀況選擇。
                </p>
              </div>

            </div>


            <div className="choice-grid three-choice-grid">

              <OptionButton
                field="fried_processed_food"
                value="lt_weekly"
                title="不吃或每週少於1次"
              />

              <OptionButton
                field="fried_processed_food"
                value="weekly_2_3"
                title="每週吃2～3次"
              />

              <OptionButton
                field="fried_processed_food"
                value="weekly_4_5"
                title="每週吃4～5次"
              />

              <OptionButton
                field="fried_processed_food"
                value="weekly_6_or_daily"
                title="每週6次或每天吃"
              />
            </div>

            {errors.fried_processed_food && (
              <p className="lifestyle-error">
                {errors.fried_processed_food}
              </p>
            )}

          </div>

          <div className="question-divider"></div>

          {/* =========================
              10.8 醬料
          ========================== */}
          <div className="lifestyle-question">

            <div className="question-heading">

              <div className="question-number">
                8
              </div>

              <div>
                <h4>
                  您用餐時，常常沾醬料或辣椒醬嗎？
                  <span>*</span>
                </h4>

                <p>
                  請依目前的飲食狀況選擇。
                </p>
              </div>

            </div>


            <div className="choice-grid three-choice-grid">

              <OptionButton
                field="salty_sauce_habit"
                value="never"
                title="從來沒有"
              />

              <OptionButton
                field="salty_sauce_habit"
                value="occasionally"
                title="偶爾"
              />

              <OptionButton
                field="salty_sauce_habit"
                value="often"
                title="經常"
              />

              <OptionButton
                field="salty_sauce_habit"
                value="always"
                title="總是"
              />
            </div>

            {errors.salty_sauce_habit && (
              <p className="lifestyle-error">
                {errors.salty_sauce_habit}
              </p>
            )}

          </div>

          <div className="question-divider"></div>


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