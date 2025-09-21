<script setup lang="ts">
import AnalyticsPage from "../components/AnalyticsPage.vue";

const apiHost = "/api";
const apiKey = import.meta.env.VITE_API_KEY ?? "E6kUTYrYwZq2tN4QEtyzsbEBk3ie";

const columns = [
  { title: "G-номер", key: "g_number", width: 200, fixed: "left" },
  { title: "Дата продажи", key: "date", width: 140 },
  { title: "Артикул", key: "supplier_article", width: 150 },
  { title: "Размер", key: "tech_size", width: 100 },
  { title: "Штрихкод", key: "barcode", width: 180 },
  { title: "Склад", key: "warehouse_name", width: 150 },
  { title: "Регион", key: "region_name", width: 200 },
  { title: "Цена", key: "total_price", width: 120 },
  { title: "Скидка %", key: "discount_percent", width: 100 },
  {
    title: "Статус",
    key: "is_storno",
    width: 120,
    render(row: any) {
      return row.is_storno ? "Отменён" : "Активен";
    },
  },
];

const endpoint = `${apiHost}/sales`;
const requestParams = { key: apiKey };
</script>

<template>
  <AnalyticsPage
    title="Аналитика продаж"
    subtitle="Просмотр и фильтрация данных по продажам"
    :endpoint="endpoint"
    :requestParams="requestParams"
    :columns="columns"
    hasDateRange
    hasWarehouseFilter
    dateField="date"
    sumField="total_price"
  />
</template>
