import mongoose from "mongoose";

const FinanceModel = new mongoose.Schema(
  {
    administrative_expense: Number,
    advertising_expense: Number,
    file_name: String,
    income_tax_expense: Number,
    insurance_expense: Number,
    net_income: Number,
    net_income_before_taxes: Number,
    rent_expense: Number,
    salaries_expense: Number,
    service_revenues: Number,
    supplies_expense: Number,
    total_expenses: Number,
  },
  { timestamps: true }
);

export default mongoose.model("Finance", FinanceModel);
