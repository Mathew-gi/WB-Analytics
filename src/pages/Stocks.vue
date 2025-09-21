<script setup lang="ts">
import AnalyticsPage from "../components/AnalyticsPage.vue";

const apiHost = "/api";
const apiKey = import.meta.env.VITE_API_KEY ?? "E6kUTYrYwZq2tN4QEtyzsbEBk3ie";

const columns = [
  { title: "Дата", key: "date", width: 120 },
  { title: "Артикул", key: "supplier_article", width: 150 },
  { title: "Размер", key: "tech_size", width: 100 },
  { title: "Штрихкод", key: "barcode", width: 180 },
  { title: "Склад", key: "warehouse_name", width: 150 },
  { title: "В наличии", key: "quantity", width: 120 },
  { title: "Всего на складе", key: "quantity_full", width: 140 },
  { title: "В пути к клиенту", key: "in_way_to_client", width: 140 },
  { title: "В пути от клиента", key: "in_way_from_client", width: 150 },
  { title: "Цена", key: "price", width: 120 },
  { title: "Скидка %", key: "discount", width: 100 },
];

const endpoint = `${apiHost}/stocks`;
const requestParams = { key: apiKey };
</script>

<template>
  <AnalyticsPage
    title="Остатки на складах"
    subtitle="Просмотр и фильтрация остатков на складах"
    :endpoint="endpoint"
    :requestParams="requestParams"
    :columns="columns"
    :hasDateRange="false"
    hasWarehouseFilter
    dateField="date"
    sumField="quantity_full"
  />
</template>