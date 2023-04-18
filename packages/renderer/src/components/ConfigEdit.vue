<template>
  <n-form
    ref="formRef"
    class="form"
    :model="setting"
    size="small"
    label-width="110px"
    label-placement="left"
  >
    <h3>设置</h3>
    <n-form-item label="快捷键">
      <n-input
        v-model:value="setting.shortcut"
        placeholder="输入姓名"
      />
    </n-form-item>
    <n-form-item label="仅接收">
      <n-checkbox
        v-model:checked="setting.onlyReceive"
      />
    </n-form-item>
    <n-form-item label="开机启动">
      <n-checkbox
        v-model:checked="setting.startUpLogin"
      />
    </n-form-item>
    <n-form-item label="最多接收记录数">
      <n-input-number
        v-model:value="setting.maxReceiveRecord"
      />
    </n-form-item>
    <n-form-item label="最多发送记录数">
      <n-input-number
        v-model:value="setting.maxSendRecord"
      />
    </n-form-item>
  </n-form>
</template>

<script setup lang="ts">
import {reactive, toRaw, watch} from 'vue';
import type {ClipConfig} from '../../types/global';
import {NCheckbox, NForm, NFormItem, NInput, NInputNumber} from 'naive-ui';

const config: ClipConfig = window.electron.store.getConfig();
const setting = reactive(config);
watch(setting, (newVal) => {
  window.electron.store.setConfig(toRaw(newVal));
});
</script>

<style lang="scss" scoped>
.form {
  width: 300px;
  margin: 30px auto;
}
</style>
