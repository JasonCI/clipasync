<template>
  <ul class="list">
    <li
      v-for="[k, {name, date, type}] in list"
      :key="k"
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
        <p class="name">{{ name }}</p>
        <p class="date">{{ date }}</p>
      </div>
    </li>
  </ul>
</template>

<script lang="ts" setup="{list}">
import IconFile from '/@/icons/File.vue';
import IconText from '/@/icons/Text.vue';

const props = defineProps({
  list: Map,
});
// const data = computed(()=>{
//   console.log(props.list);
//   return props.list.map((l,v)=>{
//     console.log({l,v});
//     return {l,v};
//   });
// });
// console.log({list});
</script>

<style lang="scss" scoped>
ul.list {
  margin: 0;
  padding: 0;

  li.item {
    display: flex;
    padding: 6px 10px;
    border-bottom: 1px solid gainsboro;

    .icon {
      width: 50px;
      min-width: 50px;
    }

    .file {
      flex: 1;

      p {
        width: 80vw;
        margin: 2px 5px;
        overflow: hidden;
        text-overflow: ellipsis; //文本溢出显示省略号
        white-space: nowrap; //文本不会换行
      }

      .name {
        font-size: 16px;
      }

      .date {
        color: #8799a3;
        font-size: 12px;
      }
    }
  }
}
</style>
