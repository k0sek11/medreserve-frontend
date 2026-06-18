import i18n from "../i18n";

export const formatMoney = (value: number) => `${value.toFixed(0)} ${i18n.t("common.currency")}`;
