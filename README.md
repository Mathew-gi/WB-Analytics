# WB-Analytics

Приложение для аналитики склада: просмотр поступлений, остатков, заказов и продаж.  
Реализовано с использованием Vue 3, TypeScript, Naive UI и Chart.js. Поддерживает фильтры, пагинацию и адаптивные графики.

## Скриншоты

### Таблица поступлений (https://drive.google.com/file/d/1ykbnwEoEWJyBeSXumI92-5Fuy_kyFlQS/view?usp=drive_link)
### График постпулений (https://drive.google.com/file/d/1THsncX10QMmlQqVhfPCsHflWTRL_0Kca/view?usp=drive_link)

## Технологии

- Vue 3 + Composition API
- TypeScript
- Naive UI (UI компоненты)
- Chart.js + vue-chartjs (графики)
- Axios (API-запросы)
- Vite (сборка)

## Функционал

- Таблицы с детальными данными по складам, поступлениям, заказам и продажам
- Фильтры по дате и складу
- Пагинация и подсчет сумм
- Динамические графики с адаптацией под мобильные устройства
- Универсальный компонент AnalyticsPage для повторного использования

## Архитектура

- `components/AnalyticsPage.vue` — универсальный компонент для таблиц и графиков
- `pages/` — страницы (`Incomes.vue`, `Stocks.vue`, `Sales.vue`)
- `App.vue` — глобальная разметка и навигация

