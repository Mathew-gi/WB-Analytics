<script setup lang="ts">
import AnalyticsPage from "../components/AnalyticsPage.vue";

const apiHost = import.meta.env.VITE_API_HOST ?? "http://109.73.206.144:6969";
const apiKey = import.meta.env.VITE_API_KEY ?? "E6kUTYrYwZq2tN4QEtyzsbEBk3ie";

const columns = [
  { title: "G-номер", key: "g_number", width: 200, fixed: "left" },
  { title: "Дата заказа", key: "date", width: 140 },
  { title: "Артикул", key: "supplier_article", width: 150 },
  { title: "Размер", key: "tech_size", width: 100 },
  { title: "Штрихкод", key: "barcode", width: 180 },
  { title: "Склад", key: "warehouse_name", width: 150 },
  { title: "Область", key: "oblast", width: 200 },
  { title: "Цена", key: "total_price", width: 120 },
  { title: "Скидка %", key: "discount_percent", width: 100 },
  {
    title: "Статус",
    key: "is_cancel",
    width: 120,
    render(row: any) {
      return row.is_cancel ? "Отменён" : "Активен";
    },
  },
];

const endpoint = `${apiHost}/api/orders`;
const requestParams = { key: apiKey };
</script>

<template>
  <AnalyticsPage
    title="Аналитика заказов"
    subtitle="Просмотр и фильтрация данных по заказам"
    :endpoint="endpoint"
    :requestParams="requestParams"
    :columns="columns"
    hasDateRange
    hasWarehouseFilter
    dateField="date"
    sumField="total_price"
  />
</template>
