<template>
  <ul class="list">
    <div
      v-if="!list.size"
      class="empty"
    >
      <IconEmpty class="icon"></IconEmpty>
      <p>暂无记录</p>
    </div>
    <template v-else>
      <li
        v-for="[k, {name, date, type,size,content}] in list"
        :key="k"
        :class="{active: active === k}"
        class="item"
      >
        <IconFile
          v-if="type === 'file'"
          class="icon"
        />
        <IconText
          v-if="type === 'text'"
          class="icon"
        />
        <div class="file">
          <p
            class="name"
            :title="type==='text'?content:name"
          >
            {{ name }}
          </p>
          <p class="date">
            <span>{{ date }}</span>
            <span v-if="type==='file'">{{ size }}</span>
          </p>
        </div>
      </li>
    </template>
  </ul>
</template>

<script lang="ts" setup>
import IconFile from '/@/icons/File.vue';
import IconText from '/@/icons/Text.vue';
import {computed, ref, watch} from 'vue';
import IconEmpty from '/@/icons/Empty.vue';

const props = defineProps<{
  list: Map<string, any>
  // type: string,
}>();

watch(props.list,()=>{
  document.querySelector('ul.list').scrollTo(0,0);
});

const active = ref(props.list.keys()[0] || '');
// const check = (key) => {
//   if (props.type === 'receive') {
//     active.value = key;
//     const data = props.list.get(key);
//     console.log(toRaw(data));
//     window.electron.setClipboard(toRaw(data));
//   }
// };
const list = computed(() => {
  if (!props.list.size) return props.list;
  let res = Array.from(props.list);
  res.reverse();
  return new Map(res);
});

</script>

<style lang="scss" scoped>
// 一次性展示的动画
@keyframes showHide {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

ul.list {
  margin: 0;
  padding: 0;
  -webkit-app-region: no-drag;
  .empty {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: rgba(135, 153, 163, 0.4);

    .icon {
      width: 100px;
      height: 100px;
    }

    p {
      text-align: center;
    }
  }

  li.item {
    display: flex;
    padding: 6px 10px;
    border-bottom: 1px solid gainsboro;

    .mask {
      position: absolute;
      top: 0;
      opacity: 0;

      &.active {
        animation: showHide 1s;
        //border-bottom: 1px solid #8799a3;
      }
    }


    .icon {
      width: 50px;
      min-width: 50px;
      font-size: 24px;
    }

    .file {
      flex: 1;
      display: grid;

      p {
        //width: 80vw;
        margin: 2px 5px;
      }

      .name {
        font-size: 16px;
        overflow: hidden;
        text-overflow: ellipsis; //文本溢出显示省略号
        white-space: nowrap; //文本不会换行
      }

      .date {
        color: #8799a3;
        font-size: 12px;
        display: flex;
        justify-content: space-between;
      }
    }
  }
}
</style>
