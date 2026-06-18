import dayjs from "dayjs";
import "dayjs/locale/pl";
import "dayjs/locale/en";
import i18n from "../i18n";

const setDayjsLocale = () => {
    const lang = i18n.language?.startsWith("en") ? "en" : "pl";
    dayjs.locale(lang);
};

setDayjsLocale();

i18n.on("languageChanged", setDayjsLocale);
