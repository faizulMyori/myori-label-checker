import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  fallbackLng: "en",
  resources: {
    en: {
      translation: {
        appName: "MyORI Label Checker",
        titleHomePage: "Dashboard",
        titleInventoryPage: "Inventory",
        titleProductionPage: "Production",
        titleHistoryPage: "History",
        titleSettingPage: "Setting",
      },
    },
    "pt-BR": {
      translation: {
        appName: "MyORI Label Checker",
        titleHomePage: "Página Inicial",
        titleSecondPage: "Segunda Página",
      },
    },
  },
});
