<script setup lang="ts">
import {
  NButton,
  NSpace,
  NLayoutHeader,
  NLayoutContent,
  NConfigProvider,
  type GlobalThemeOverrides,
} from "naive-ui";
import { RouterLink } from "vue-router";

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: "#3b82f6",
    primaryColorHover: "#2563eb",
    primaryColorPressed: "#1d4ed8",
    bodyColor: "#f8fafc",
    cardColor: "#ffffff",
    borderRadius: "12px",
  },
  Button: {
    textColorGhost: "#3b82f6",
    borderGhost: "1px solid #3b82f6",
    color: "rgba(59, 130, 246, 0.1)",
    textColor: "#3b82f6",
  },
  Card: {
    borderColor: "transparent",
  },
};
</script>

<template>
  <NConfigProvider :theme-overrides="themeOverrides">
    <div class="app-container">
      <NLayoutHeader bordered class="app-header">
        <div class="header-content">
          <nav>
            <NSpace justify="center" wrap>
              <router-link to="/incomes" v-slot="{ navigate, isActive }">
                <NButton
                  :type="isActive ? 'primary' : 'default'"
                  ghost
                  @click="navigate"
                >
                  Поступления
                </NButton>
              </router-link>
              <router-link to="/orders" v-slot="{ navigate, isActive }">
                <NButton
                  :type="isActive ? 'primary' : 'default'"
                  ghost
                  @click="navigate"
                >
                  Заказы
                </NButton>
              </router-link>
              <router-link to="/sales" v-slot="{ navigate, isActive }">
                <NButton
                  :type="isActive ? 'primary' : 'default'"
                  ghost
                  @click="navigate"
                >
                  Продажи
                </NButton>
              </router-link>
              <router-link to="/stocks" v-slot="{ navigate, isActive }">
                <NButton
                  :type="isActive ? 'primary' : 'default'"
                  ghost
                  @click="navigate"
                >
                  Остатки
                </NButton>
              </router-link>
            </NSpace>
          </nav>
        </div>
      </NLayoutHeader>

      <NLayoutContent class="app-content">
        <router-view />
      </NLayoutContent>
    </div>
  </NConfigProvider>
</template>

<style>
body {
  margin: 0;
  overflow: hidden;
}
</style>

<style scoped>
.app-container {
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100vh;
}

.app-header {
  padding: 8px 40px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  z-index: 100;
  transition: padding 0.3s ease;
}

.header-content {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.app-content {
  overflow-y: auto;
  padding: 32px 32px 0 32px;
  background-color: #f8fafc;
  transition: padding 0.3s ease;
}

@media (max-width: 768px) {
  .app-header {
    padding: 8px 16px;
  }
  .app-content {
    padding: 24px 16px;
  }
}
</style>
