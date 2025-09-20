<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue";
import axios from "axios";
import {
  NDataTable,
  NPagination,
  NSelect,
  NDatePicker,
  NCard,
  NSpace,
  useThemeVars,
  NPageHeader,
  NGrid,
  NGi,
  NSpin,
  NResult,
  NEmpty,
  NButton,
} from "naive-ui";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  type ChartOptions,
} from "chart.js";
import { Bar } from "vue-chartjs";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const props = defineProps<{
  title: string;
  subtitle?: string;
  fetcher?: () => Promise<any[]>;
  endpoint?: string;
  requestParams?: Record<string, any>;
  columns: any[];
  hasDateRange?: boolean;
  hasWarehouseFilter?: boolean;
  dateField?: string;
  sumField?: string;
  computeChartData?: (
    items: any[],
    ctx: { themeVars: any }
  ) => { labels: string[]; datasets: any[] } | null;
  pageSizeDefault?: number;
  warehouseColor?: string;
  warehouseLabelMaxLength?: number;
}>();

const themeVars = useThemeVars();
const loading = ref(true);
const error = ref<string | null>(null);
const data = ref<any[]>([]);

const isMobile = ref(window.innerWidth < 768);
const handleResize = () => {
  isMobile.value = window.innerWidth < 768;
};

const selectedWarehouse = ref<string | null>(null);
const dateRange = ref<[number, number] | null>(null);

const page = ref(1);
const pageSize = ref(props.pageSizeDefault ?? 10);

const dateField = props.dateField ?? "date";
const sumField = props.sumField ?? "quantity";

const warehouseLabelMaxLength = props.warehouseLabelMaxLength ?? 18;

function formatDateISO(ts: number | string | Date) {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

const ENV_DEFAULT_LIMIT = Number(import.meta.env.VITE_DEFAULT_LIMIT) || 100;
const ENV_DEFAULT_DATE_FROM = import.meta.env.VITE_DEFAULT_DATE_FROM ?? "2014-01-01";

async function defaultFetcherWithEndpoint(): Promise<any[]> {
  if (!props.endpoint) return [];
  const params: Record<string, any> = { ...(props.requestParams ?? {}) };

  const todayISO = formatDateISO(new Date());

  if (props.hasDateRange) {
    if (dateRange.value && dateRange.value.length === 2) {
      params.dateFrom = formatDateISO(dateRange.value[0]);
      params.dateTo = formatDateISO(dateRange.value[1]);
    } else {
      params.dateFrom = params.dateFrom ?? ENV_DEFAULT_DATE_FROM;
      params.dateTo = params.dateTo ?? todayISO;
    }
  } else {
    if (props.endpoint?.includes("/stocks")) {
      params.dateFrom = params.dateFrom ?? todayISO;
    }
  }

  if (props.hasWarehouseFilter && selectedWarehouse.value) {
    params.warehouse = selectedWarehouse.value;
  }

  params.page = 1;
  params.limit = props.pageSizeDefault ?? ENV_DEFAULT_LIMIT;

  const res = await axios.get(props.endpoint!, { params });
  return res.data?.data ?? res.data ?? [];
}

async function loadData() {
  loading.value = true;
  error.value = null;
  try {
    page.value = 1;
    let items: any[] = [];
    if (props.fetcher) {
      items = await props.fetcher();
    } else {
      items = await defaultFetcherWithEndpoint();
    }
    data.value = items ?? [];
  } catch (err: any) {
    error.value = err?.message ?? "Ошибка загрузки данных";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadData();
  window.addEventListener("resize", handleResize);
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});

watch([dateRange, selectedWarehouse], () => {
  loadData();
});

const warehouses = computed(() => {
  const set = new Set(data.value.map((d) => d.warehouse_name).filter(Boolean));
  return Array.from(set).map((w) => ({ label: w, value: w }));
});

function parseDateToTs(value: any) {
  if (!value) return NaN;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    // dd.mm.yyyy
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(value)) {
      const [d, m, y] = value.split(".");
      return y && m && d ? new Date(+y, +m - 1, +d).getTime() : NaN;
    }
    const t = Date.parse(value);
    if (!isNaN(t)) return t;
  }
  const d = new Date(value);
  return isNaN(d.getTime()) ? NaN : d.getTime();
}

function roundTo(v: any, decimals = 2) {
  const n = Number(v);
  if (isNaN(n)) return v;
  return Number(n.toFixed(decimals));
}

const isPriceKey = (k: string) => /price$/i.test(k) || /total_price/i.test(k);

const filteredData = computed(() => {
  let result = [...data.value];

  if (props.hasWarehouseFilter && selectedWarehouse.value) {
    result = result.filter((r) => r.warehouse_name === selectedWarehouse.value);
  }

  if (props.hasDateRange && dateRange.value) {
    const [start, end] = dateRange.value;
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);
    result = result.filter((item) => {
      const ts = parseDateToTs(item[dateField]);
      return ts >= start && ts <= endDate.getTime();
    });
  }

  return result;
});

const pagedData = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filteredData.value.slice(start, start + pageSize.value);
});

const totalSum = computed(() => {
  const sum = filteredData.value.reduce(
    (s, it) => s + (Number(it[sumField]) || 0),
    0
  );
  return roundTo(sum, 2);
});

const chartDataComputed = computed(() => {
  if (props.computeChartData) {
    return props.computeChartData(filteredData.value, {
      themeVars: themeVars.value,
    });
  }

  const isStocksEndpoint =
    !!props.endpoint && props.endpoint.includes("/stocks");
  const useWarehouseGrouping =
    isStocksEndpoint || (props.sumField === "quantity_full" && !props.hasDateRange);

  const grouped: Record<string, number> = {};

  if (useWarehouseGrouping) {
    filteredData.value.forEach((item) => {
      const label = item.warehouse_name || "(без склада)";
      grouped[label] = (grouped[label] || 0) + (Number(item[sumField]) || 0);
    });
    const labels = Object.keys(grouped).sort((a, b) => a.localeCompare(b));
    return {
      labels,
      datasets: [
        {
          label: `Всего: ${roundTo(totalSum.value, 2)}`,
          backgroundColor: themeVars.value.primaryColor,
          borderColor: themeVars.value.primaryColor,
          borderRadius: 6,
          data: labels.map((l) => roundTo(grouped[l] ?? 0, 2)),
        },
      ],
    };
  }

  filteredData.value.forEach((item) => {
    const val = item[dateField];
    const label = val
      ? typeof val === "string" && /^\d{2}\.\d{2}\.\d{4}$/.test(val)
        ? val
        : new Date(val).toLocaleDateString("ru-RU")
      : "(без даты)";
    grouped[label] = (grouped[label] || 0) + (Number(item[sumField]) || 0);
  });
  const labels = Object.keys(grouped).sort((a, b) => {
    const ta = parseDateToTs(a);
    const tb = parseDateToTs(b);
    if (!isNaN(ta) && !isNaN(tb)) return ta - tb;
    return a.localeCompare(b);
  });
  return {
    labels,
    datasets: [
      {
        label: `Всего: ${roundTo(totalSum.value, 2)}`,
        backgroundColor: themeVars.value.primaryColor,
        borderColor: themeVars.value.primaryColor,
        borderRadius: 6,
        data: labels.map((l) => roundTo(grouped[l] ?? 0, 2)),
      },
    ],
  };
});

const chartOptions = computed<ChartOptions<"bar">>(() => {
  const baseOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", align: "end", labels: { color: "#64748b" } },
      tooltip: {
        backgroundColor: "#1e293b",
        titleFont: { size: 16 },
        bodyFont: { size: 14 },
        padding: 12,
        cornerRadius: 8,
        boxPadding: 4,
        callbacks: {
          title: (items: any[]) => {
            return items?.[0]?.label ?? "";
          },
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#64748b" } },
      y: {
        grid: { color: "#e2e8f0" },
        beginAtZero: true,
        ticks: { color: "#64748b" },
      },
    },
  };

  const indexAxis = isMobile.value ? "y" : "x";
  baseOptions.indexAxis = indexAxis;

  const truncate = (s: string) =>
    s && s.length > warehouseLabelMaxLength
      ? s.slice(0, warehouseLabelMaxLength - 1).trimEnd() + "…"
      : s;

  if (indexAxis === "x") {
    baseOptions.scales = {
      ...(baseOptions.scales as any),
      x: {
        ...(baseOptions.scales as any).x,
        ticks: {
          ...(baseOptions.scales as any).x.ticks,
          callback: function (_value: any, index: number) {
            const lbl = this.chart?.data?.labels?.[index] ?? "";
            return truncate(String(lbl));
          },
        },
      },
    };
  } else {
    baseOptions.scales = {
      ...(baseOptions.scales as any),
      y: {
        ...(baseOptions.scales as any).y,
        ticks: {
          ...(baseOptions.scales as any).y.ticks,
          callback: function (_value: any, index: number) {
            const lbl = this.chart?.data?.labels?.[index] ?? "";
            return truncate(String(lbl));
          },
        },
      },
    };
  }

  if (isMobile.value) {
    if (baseOptions.plugins?.legend) baseOptions.plugins.legend.display = false;
  }

  return baseOptions;
});

const displayedPagedData = computed(() => {
  return pagedData.value.map((row) => {
    const r: Record<string, any> = { ...row };
    Object.keys(r).forEach((k) => {
      if (isPriceKey(k) && r[k] !== null && r[k] !== undefined && r[k] !== "") {
        const n = Number(r[k]);
        r[k] = isNaN(n) ? r[k] : n.toFixed(2);
      }
    });
    return r;
  });
});
</script>

<template>
  <div class="page-container">
    <NPageHeader class="page-header-adaptive">
      <template #title
        ><h1>{{ props.title }}</h1></template
      >
      <template #subtitle
        ><p>{{ props.subtitle }}</p></template
      >
    </NPageHeader>

    <NSpin :show="loading" size="large" style="padding: 10px">
      <template v-if="!loading">
        <div v-if="error" class="status-container">
          <NResult status="error" title="Ошибка" :description="error">
            <template #footer>
              <NButton type="primary" @click="loadData">Повторить</NButton>
            </template>
          </NResult>
        </div>

        <NSpace v-else vertical :size="24">
          <NCard
            v-if="props.hasDateRange || props.hasWarehouseFilter"
            title="Фильтры"
            :bordered="false"
            class="ui-card"
          >
            <NGrid :x-gap="20" :y-gap="20" cols="1 m:2" responsive="screen">
              <NGi v-if="props.hasWarehouseFilter">
                <NSpace vertical>
                  <label>Склад</label>
                  <NSelect
                    v-model:value="selectedWarehouse"
                    :options="warehouses"
                    placeholder="Все"
                    clearable
                  />
                </NSpace>
              </NGi>
              <NGi v-if="props.hasDateRange">
                <NSpace vertical>
                  <label>Период</label>
                  <NDatePicker
                    v-model:value="dateRange"
                    type="daterange"
                    clearable
                    :popup-props="{ style: { maxWidth: '100vw' } }"
                  />
                </NSpace>
              </NGi>
            </NGrid>
          </NCard>

          <NCard title="График" :bordered="false" class="ui-card">
            <div :style="{ height: isMobile ? '500px' : '350px' }">
              <Bar
                v-if="chartDataComputed && chartDataComputed.labels?.length"
                :data="chartDataComputed"
                :options="chartOptions"
              />
              <NEmpty
                v-else
                description="Нет данных для отображения"
                style="margin-top: 80px"
              />
            </div>
          </NCard>

          <NCard title="Детализация" :bordered="false" class="ui-card">
            <NDataTable
              :columns="props.columns"
              :data="displayedPagedData"
              :bordered="false"
              :scroll-x="1200"
              striped
              size="large"
            />
            <div class="pagination-container">
              <NPagination
                v-model:page="page"
                v-model:page-size="pageSize"
                :item-count="filteredData.length"
                show-size-picker
                :page-sizes="[10, 20, 50, 100]"
                :simple="isMobile"
              />
            </div>
          </NCard>
        </NSpace>
      </template>
    </NSpin>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

.page-container {
  font-family: "Inter", sans-serif;
  max-width: 1400px;
  margin: 0 auto;
  animation: fadeIn 0.5s ease-in-out;
}

h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  transition: font-size 0.3s ease;
}

.page-header-adaptive .n-page-header__subtitle p {
  font-size: 16px;
  color: #64748b;
}

.status-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

.ui-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.n-select,
.n-date-picker {
  --n-border-radius: 8px !important;
}
.n-date-picker-popup {
  max-width: 100vw !important;
  box-sizing: border-box;
}

label {
  font-weight: 500;
  color: #475569;
  font-size: 14px;
  margin-bottom: 4px;
}

.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  h1 {
    font-size: 22px;
  }
  .pagination-container {
    justify-content: center;
  }
  .page-header-adaptive :deep(.n-page-header__main) {
    flex-direction: column !important;
    align-items: center;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .page-header-adaptive {
    text-align: center;
  }
  .page-header-adaptive :deep(.n-page-header-header) {
    justify-content: center;
  }
  .page-header-adaptive .n-page-header__subtitle p {
    justify-content: center;
  }
  h1 {
    font-size: 20px;
  }
  .n-card > :deep(.n-card-header) {
    padding: 16px;
  }
  .n-card > :deep(.n-card__content) {
    padding: 16px;
  }
  :global(.n-date-panel) {
    display: flex !important;
    flex-direction: column;
  }
}
</style>
