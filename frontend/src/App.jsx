import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";
import PSQIForm from "./pages/PSQIForm";

import MetabolicIntro from "./pages/MetabolicIntro";
import MetabolicBasic from "./pages/MetabolicBasic";
import MetabolicSleep from "./pages/MetabolicSleep";
import MetabolicLifestyle from "./pages/MetabolicLifestyle";
import MetabolicWaist from "./pages/MetabolicWaist";
import MetabolicConfirm from "./pages/MetabolicConfirm";
import MetabolicResult from "./pages/MetabolicResult";

import "./App.css";


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =========================
            首頁
        ========================= */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* =========================
            PSQI 睡眠品質問卷
        ========================= */}

        <Route
          path="/psqi"
          element={<PSQIForm />}
        />


        {/* =========================
            代謝症候群風險篩檢
        ========================= */}

        {/* 功能說明頁 */}
        <Route
          path="/metabolic"
          element={<MetabolicIntro />}
        />


        {/* STEP 01 基本資料 */}
        <Route
          path="/metabolic/basic"
          element={<MetabolicBasic />}
        />


        {/* STEP 02 睡眠時數 */}
        <Route
          path="/metabolic/sleep"
          element={<MetabolicSleep />}
        />


        {/* STEP 03 生活型態 */}
        <Route
          path="/metabolic/lifestyle"
          element={<MetabolicLifestyle />}
        />


        {/* STEP 04 腰圍 */}
        <Route
          path="/metabolic/waist"
          element={<MetabolicWaist />}
        />


        {/* STEP 05 確認資料 */}
        <Route
          path="/metabolic/confirm"
          element={<MetabolicConfirm />}
        />


        {/* 評估結果 */}
        <Route
          path="/metabolic/result"
          element={<MetabolicResult />}
        />


        {/* =========================
            找不到網址時回首頁
        ========================= */}

        <Route
          path="*"
          element={<Home />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;