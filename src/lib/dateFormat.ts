import dayjs, { type Dayjs } from "dayjs";
import i18n from "../i18n";

export const getDateFormat = (): string => i18n.t("common.dateFormat");

export const getDateFormatShort = (): string => i18n.t("common.dateFormatShort");

export const getTimeFormat = (): string => i18n.t("common.timeFormat");

export const getDateTimeFormat = (): string => i18n.t("common.dateTimeFormat");

export const formatDate = (value: Dayjs | Date | string | null | undefined): string => {
    if (!value) return "";
    return dayjs(value).format(getDateFormat());
};

export const formatDateShort = (value: Dayjs | Date | string | null | undefined): string => {
    if (!value) return "";
    return dayjs(value).format(getDateFormatShort());
};

export const formatTime = (value: Dayjs | Date | string | null | undefined): string => {
    if (!value) return "";
    return dayjs(value).format(getTimeFormat());
};

export const formatDateTime = (value: Dayjs | Date | string | null | undefined): string => {
    if (!value) return "";
    return dayjs(value).format(getDateTimeFormat());
};

export const toApiDateString = (value: Dayjs | null): string =>
    value ? value.format("YYYY-MM-DD") : "";

export const toApiTimeString = (value: Dayjs | null): string =>
    value ? value.format("HH:mm") : "";
