<script setup lang="ts">
import AnalyticsPage from "../components/AnalyticsPage.vue";

const apiHost = import.meta.env.VITE_API_HOST ?? "http://109.73.206.144:6969";
const apiKey = import.meta.env.VITE_API_KEY ?? "E6kUTYrYwZq2tN4QEtyzsbEBk3ie";

const columns = [
  { title: "ID", key: "income_id", width: 120, fixed: "left" },
  { title: "Дата", key: "date", width: 120 },
  { title: "Артикул", key: "supplier_article", width: 150 },
  { title: "Размер", key: "tech_size", width: 100 },
  { title: "Штрихкод", key: "barcode", width: 180 },
  { title: "Кол-во", key: "quantity", width: 100 },
  { title: "Склад", key: "warehouse_name", width: 200 },
];

const endpoint = `${apiHost}/api/incomes`;
const requestParams = { key: apiKey };
</script>

<template>
  <AnalyticsPage
    title="Аналитика поступлений"
    subtitle="Просмотр и фильтрация данных о поставках на склад"
    :endpoint="endpoint"
    :requestParams="requestParams"
    :columns="columns"
    hasDateRange
    hasWarehouseFilter
    dateField="date"
    sumField="quantity"
  />
</template>
