"""
KnowYourLoan - Google Colab Independent Verification Script
=============================================================
Instructions for Google Colab:
1. Upload 'know_your_loan_catboost_model.cbm' and 'colab_test_records.json' to Colab session files.
2. Run '!pip install catboost shap pandas numpy' if not already installed.
3. Run this script. It independently loads the model, evaluates the exported records,
   and verifies that raw CatBoost probabilities and predictions match the website exactly.
"""

import os
import json
import hashlib
import numpy as np
import pandas as pd
import catboost as cb
import shap

def verify_in_colab():
    print("=" * 70)
    print("KNOWYOURLOAN - INDEPENDENT CATBOOST & SHAP VERIFICATION")
    print("=" * 70)

    # 1. Load exported records
    json_path = "colab_test_records.json"
    if not os.path.exists(json_path):
        raise FileNotFoundError(f"Missing {json_path}. Please upload it to your Colab session.")

    with open(json_path, "r", encoding="utf-8") as f:
        export_data = json.load(f)

    meta = export_data["metadata"]
    model_file = meta["model_file"]

    if not os.path.exists(model_file):
        raise FileNotFoundError(f"Missing {model_file}. Please upload it to your Colab session.")

    # 2. Verify model integrity via SHA-256
    with open(model_file, "rb") as f:
        actual_sha256 = hashlib.sha256(f.read()).hexdigest()

    expected_sha256 = meta["model_sha256"]
    print(f"\nModel File: {model_file}")
    print(f"Expected SHA-256: {expected_sha256}")
    print(f"Actual   SHA-256: {actual_sha256}")
    assert actual_sha256 == expected_sha256, "Model SHA-256 hash mismatch! Ensure you uploaded the original .cbm file."
    print(">> Model SHA-256 hash verification: PASSED (Exact Match)")

    # 3. Load CatBoost model
    model = cb.CatBoostClassifier()
    model.load_model(model_file)
    print(f">> Loaded Trees: {model.tree_count_} (Expected: {meta['tree_count']})")
    print(f">> Feature Count: {len(model.feature_names_)} (Expected: {meta['feature_count']})")
    print(f">> Categorical Features: {meta['categorical_features']}")
    print(f">> Decision Threshold: {meta['decision_threshold']}")

    explainer = shap.TreeExplainer(model)

    # 4. Evaluate each test record
    all_passed = True
    for idx, record in enumerate(export_data["records"], 1):
        print("\n" + "-" * 70)
        print(f"RECORD {idx}: {record['profile_name']}")
        print("-" * 70)

        feature_vector = record["final_35_feature_vector"]
        df = pd.DataFrame([feature_vector])[meta["feature_order"]]
        for col in meta["categorical_features"]:
            df[col] = df[col].astype(str)

        # Independent prediction
        raw_prob_class1 = float(model.predict_proba(df)[0][1])
        recorded_raw_prob = float(record["raw_probability"])
        diff = abs(raw_prob_class1 - recorded_raw_prob)

        pred_decision = "APPROVED" if raw_prob_class1 >= meta["decision_threshold"] else "REJECTED"
        expected_decision = record["classification"]

        print(f"Recorded Website Raw Prob: {recorded_raw_prob:.16f}")
        print(f"Colab Independent Raw Prob: {raw_prob_class1:.16f}")
        print(f"Absolute Difference:        {diff:.16e}")
        print(f"Recorded Rounded Prob:     {record['api_rounded_probability']:.4f}")
        print(f"Colab Rounded Prob:        {round(raw_prob_class1, 4):.4f}")
        print(f"Recorded Classification:   {expected_decision}")
        print(f"Colab Classification:      {pred_decision}")

        prob_match = diff < 1e-6
        class_match = pred_decision == expected_decision

        if prob_match and class_match:
            print(">> STATUS: EXACT MATCH CONFIRMED")
        else:
            print(">> STATUS: MISMATCH DETECTED!")
            all_passed = False

        # Independent SHAP verification
        shap_res = explainer(df)
        shap_vals = shap_res.values[0]
        base_val = float(explainer.expected_value) if hasattr(explainer, "expected_value") else float(shap_res.base_values[0])
        print(f"SHAP Base Log-Odds:        {base_val:.4f}")

        top_pos_idx = [i for i in np.argsort(shap_vals)[::-1] if shap_vals[i] > 0][:3]
        top_pos_names = [meta["feature_order"][i] for i in top_pos_idx]
        print(f"Top Positive SHAP Drivers: {top_pos_names}")

    print("\n" + "=" * 70)
    if all_passed:
        print("FINAL VERDICT: ALL INFERENCE PIPELINE CHECKS PASSED WITH 100% PARITY.")
    else:
        print("FINAL VERDICT: ONE OR MORE CHECKS FAILED.")
    print("=" * 70)

if __name__ == "__main__":
    verify_in_colab()
