<template>
  <div class="gantt-elastic__task-list-item">
    <item-column v-for="column in columns" :key="column._id" :column="column" :task="task" />
  </div>
</template>
<script>
import { defineComponent } from 'vue';
import ItemColumn from './item-column.vue';

export default defineComponent({
  name: 'TaskListItem',
  components: {
    ItemColumn
  },
  inject: ['root'],
  props: ['task'],
  data() {
    return {};
  },
  computed: {
    columns() {
      return this.root.state.options.taskList.columns;
    }
  }
});
</script>

<style lang="less">
.gantt-elastic__task-list-item {
  display: flex;
  border-top: 1px solid #eee;
  border-right: 1px solid #eee;
}
</style>