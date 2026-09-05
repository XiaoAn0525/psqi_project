import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MetabolicBasic.css";

function MetabolicBasic() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    age: "",
    sex: "",
    height_cm: "",
    weight_kg: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const bmi = useMemo(() => {
    const heightCm = Number(form.height_cm);
    const weightKg = Number(form.weight_kg);

    if (!heightCm || !weightKg) {
      return null;
    }

    const heightM = heightCm / 100;

    if (heightM <= 0) {
      return null;
    }

    return (weightKg / (heightM * heightM)).toFixed(1);
  }, [form.height_cm, form.weight_kg]);

  const getBmiStatus = () => {
    if (!bmi) return "";

    const value = Number(bmi);

    if (value < 18.5) return "體重過輕";
    if (value < 24) return "正常範圍";
    if (value < 27) return "體重過重";
    return "肥胖範圍";
  };

  const validate = () => {
    const newErrors = {};

    const age = Number(form.age);
    const height = Number(form.height_cm);
    const weight = Number(form.weight_kg);

    if (!form.age) {
      newErrors.age = "請輸入年齡";
    } else if (age < 18 || age > 100) {
      newErrors.age = "請輸入 18～100 歲之間的年齡";
    }

    if (!form.sex) {
      newErrors.sex = "請選擇性別";
    }

    if (!form.height_cm) {
      newErrors.height_cm = "請輸入身高";
    } else if (height < 100 || height > 250) {
      newErrors.height_cm = "請輸入合理的身高範圍";
    }

    if (!form.weight_kg) {
      newErrors.weight_kg = "請輸入體重";
    } else if (weight < 25 || weight > 300) {
      newErrors.weight_kg = "請輸入合理的體重範圍";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const metabolicData = {
      age: Number(form.age),
      sex: form.sex,
      height_cm: Number(form.height_cm),
      weight_kg: Number(form.weight_kg),
      bmi: bmi ? Number(bmi) : null,
    };

    sessionStorage.setItem(
      "metabolicScreeningData",
      JSON.stringify(metabolicData)
    );

    navigate("/metabolic/sleep");
  };

  return (
    <div className="basic-page">

      <header className="basic-header">
        <div className="basic-header-inner">

          <button
            type="button"
            className="basic-back-home"
            onClick={() => navigate("/")}
          >
            ← 返回首頁
          </button>

          <div className="basic-brand">
            <div className="basic-brand-icon">♥</div>

            <div>
              <h1>代謝症候群風險篩檢</h1>
              <p>Metabolic Syndrome Risk Screening</p>
            </div>
          </div>

          <div className="basic-header-space"></div>

        </div>
      </header>

      <main className="basic-main">

        {/* 進度條 */}
        <section className="screening-progress">

          <div className="progress-top">
            <span>篩檢進度</span>
            <span>步驟 1 / 5</span>
          </div>

          <div className="progress-bar-bg">
            <div className="progress-bar-fill step-one"></div>
          </div>

          <div className="progress-labels">
            <span className="active">基本資料</span>
            <span>睡眠</span>
            <span>生活型態</span>
            <span>腰圍</span>
            <span>確認</span>
          </div>

        </section>

        {/* 標題 */}
        <section className="basic-title">

          <div className="basic-step-badge">
            STEP 01
          </div>

          <h2>基本資料</h2>

          <p>
            請輸入基本身體資料，系統會使用這些資訊進行風險評估。
          </p>

        </section>

        {/* 表單 */}
        <form
          className="basic-form-card"
          onSubmit={handleNext}
        >

          <div className="basic-card-heading">

            <div className="basic-heading-icon">
              01
            </div>

            <div>
              <span>BASIC INFORMATION</span>
              <h3>請填寫你的基本資料</h3>
            </div>

          </div>

          <div className="basic-form-grid">

            {/* 年齡 */}
            <div className="basic-field">

              <label htmlFor="age">
                年齡
                <span>*</span>
              </label>

              <div className="input-unit-wrapper">

                <input
                  id="age"
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  placeholder="例如：25"
                  min="18"
                  max="100"
                />

                <span className="input-unit">歲</span>

              </div>

              {errors.age && (
                <p className="field-error">
                  {errors.age}
                </p>
              )}

            </div>

            {/* 性別 */}
            <div className="basic-field">

            <label>
                性別
                <span>*</span>
            </label>

            <div className="gender-radio-group">

                <label
                className={
                    form.sex === "male"
                    ? "gender-radio selected"
                    : "gender-radio"
                }
                >
                <input
                    type="radio"
                    name="sex"
                    value="male"
                    checked={form.sex === "male"}
                    onChange={handleChange}
                />

                <span className="radio-circle"></span>

                <span className="gender-symbol">
                    ♂
                </span>

                <span>男性</span>
                </label>


                <label
                className={
                    form.sex === "female"
                    ? "gender-radio selected"
                    : "gender-radio"
                }
                >
                <input
                    type="radio"
                    name="sex"
                    value="female"
                    checked={form.sex === "female"}
                    onChange={handleChange}
                />

                <span className="radio-circle"></span>

                <span className="gender-symbol">
                    ♀
                </span>

                <span>女性</span>
                </label>

            </div>

            {errors.sex && (
                <p className="field-error">
                {errors.sex}
                </p>
            )}

            </div>

            {/* 身高 */}
            <div className="basic-field">

              <label htmlFor="height">
                身高
                <span>*</span>
              </label>

              <div className="input-unit-wrapper">

                <input
                  id="height_cm"
                  type="number"
                  name="height_cm"
                  value={form.height_cm}
                  onChange={handleChange}
                  placeholder="例如：170"
                  step="0.1"
                />

                <span className="input-unit">cm</span>

              </div>

              {errors.height_cm && (
                <p className="field-error">
                  {errors.height_cm}
                </p>
              )}

            </div>

            {/* 體重 */}
            <div className="basic-field">

              <label htmlFor="weight">
                體重
                <span>*</span>
              </label>

              <div className="input-unit-wrapper">

                <input
                  id="weight_kg"
                  type="number"
                  name="weight_kg"
                  value={form.weight_kg}
                  onChange={handleChange}
                  placeholder="例如：65"
                  step="0.1"
                />

                <span className="input-unit">kg</span>

              </div>

              {errors.weight_kg && (
                <p className="field-error">
                  {errors.weight_kg}
                </p>
              )}

            </div>

          </div>

          {/* BMI */}
          <div className="bmi-preview">

            <div className="bmi-icon">
              BMI
            </div>

            <div className="bmi-content">

              <div className="bmi-title-row">
                <h4>BMI 即時計算</h4>

                {bmi && (
                  <span className="bmi-status">
                    {getBmiStatus()}
                  </span>
                )}
              </div>

              {!bmi ? (
                <p>
                  輸入身高與體重後，系統會自動計算 BMI。
                </p>
              ) : (
                <div className="bmi-result">
                  <strong>{bmi}</strong>
                  <span>kg/m²</span>
                </div>
              )}

            </div>

          </div>

          {/* 提醒 */}
          <div className="basic-privacy-note">

            <div className="privacy-icon">
              i
            </div>

            <p>
              以上資料將用於本次代謝症候群風險篩檢，
              請依照目前實際狀況填寫。
            </p>

          </div>

          {/* 按鈕 */}
          <div className="basic-actions">

            <button
              type="button"
              className="basic-prev-button"
              onClick={() => navigate("/metabolic")}
            >
              ← 上一步
            </button>

            <button
              type="submit"
              className="basic-next-button"
            >
              下一步：睡眠時數
              <span>→</span>
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default MetabolicBasic;